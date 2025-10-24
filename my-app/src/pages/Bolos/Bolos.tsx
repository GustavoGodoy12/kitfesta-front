import { useEffect, useMemo, useState } from 'react'
import { listKits, setDone } from '../../data/kitsRepo'
import type { Kit } from '../../types/kit'
import {
  Page, Title, Subtitle, TopBar, LeftGroup, RightGroup,
  DateInput, Button, GridCards, Label,
} from './Bolos.styled'
import { SaborList } from './Bolos.styled'
import KitCard from '../../components/KitCard/KitCard'
import KitInfoModal from '../../components/KitCard/KitInfoModal'
import { todayLocalISO } from '../../utils/date'

function norm(s: string) {
  return (s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}
function matchesNome(kit: { nome?: string }, query: string) {
  const q = norm(query)
  if (!q) return true
  const name = norm(kit.nome || '')
  const tokens = q.split(' ').filter(Boolean)
  return tokens.every(tok => name.includes(tok))
}
function onlyDigits(s: string) {
  return (s || '').replace(/\D/g, '')
}
function cmpDateTime(a: Kit, b: Kit, asc: boolean) {
  const da = a.dataEvento || '9999-12-31'
  const db = b.dataEvento || '9999-12-31'
  if (da !== db) return (da < db ? -1 : 1) * (asc ? 1 : -1)
  const ta = a.hora || '99:99'
  const tb = b.hora || '99:99'
  if (ta === tb) return 0
  return (ta < tb ? -1 : 1) * (asc ? 1 : -1)
}

export default function Bolos() {
  const [filterDate, setFilterDate] = useState<string>(() => todayLocalISO())
  const [orderAsc, setOrderAsc] = useState<boolean>(true)
  const [refresh, setRefresh] = useState(0)

  const [qNome, setQNome] = useState('')
  const [qNumero, setQNumero] = useState('')

  const [openInfo, setOpenInfo] = useState(false)
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null)

  const [kits, setKits] = useState<Kit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await listKits()
        if (alive) setKits(data)
      } catch (e: any) {
        if (alive) setError(e?.message || 'Falha ao carregar kits')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [refresh])

  const kitsWithBolos = useMemo(() => {
    let arr = (kits || []).filter(k => (k.bolos?.length ?? 0) > 0)

    // de hoje (ou da data escolhida) em diante
    if (filterDate) arr = arr.filter(k => (k.dataEvento || '') >= filterDate)

    // número
    const numQuery = onlyDigits(qNumero)
    if (numQuery.length > 0) {
      arr = arr.filter(k => String(k.id).includes(numQuery))
    }

    // nome
    if (qNome.trim()) {
      arr = arr.filter(k => matchesNome({ nome: k.nome }, qNome))
    }

    // ordenação por data+hora
    arr.sort((a, b) => cmpDateTime(a, b, orderAsc))
    return arr
  }, [kits, filterDate, orderAsc, qNome, qNumero])

  return (
    <Page>
      <Title>Bolos</Title>
      <Subtitle>
        Use o botão <strong>Feito</strong> no rodapé. Depois que estiver feito, desfazer só pela seta ↩︎ no topo direito.
      </Subtitle>

      <TopBar>
        <LeftGroup />
        <RightGroup>
          <label style={{ display: 'grid', gap: 6 }}>
            <Label>Buscar por nome</Label>
            <input
              placeholder="Digite o nome…"
              value={qNome}
              onChange={e => setQNome(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', width: 240 }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <Label>Número</Label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ex.: 123"
              value={qNumero}
              onChange={e => setQNumero(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', width: 140 }}
            />
          </label>

          <DateInput type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          <Button onClick={() => setOrderAsc(v => !v)}>Ordenar {orderAsc ? '↑' : '↓'}</Button>
          <Button onClick={() => { setFilterDate(todayLocalISO()); setOrderAsc(true); setQNome(''); setQNumero('') }}>
            Limpar filtros
          </Button>
        </RightGroup>
      </TopBar>

      {loading && <Subtitle>Carregando…</Subtitle>}
      {error && <Subtitle style={{ color: '#b91c1c' }}>{error}</Subtitle>}

      <h2 style={{ margin: '8px 0 0' }}>Kits com bolos</h2>

      {!loading && !error && (kitsWithBolos.length === 0 ? (
        <Subtitle>Nenhum kit com bolos encontrado.</Subtitle>
      ) : (
        <GridCards>
          {kitsWithBolos.map(k => {
            const done = !!k.status?.bolosDone
            return (
              <KitCard
                key={k.id}
                kit={k}
                done={done}
                showUndo
                onToggleDone={async (kit) => {
                  await setDone(kit.id, 'bolos', !done)
                  setRefresh(x => x + 1)
                }}
                showStats={false}
                middle={
                  <div>
                    <Label>Sabores, quantidades e texto</Label>
                    <SaborList>
                      {k.bolos.map(b => (
                        <li key={b.id}>
                          {b.sabor} — {b.quantidade}{b.texto ? ` — “${b.texto}”` : ''}
                        </li>
                      ))}
                    </SaborList>
                  </div>
                }
                footer={
                  <>
                    <Button onClick={(e) => { e.stopPropagation(); setSelectedKit(k); setOpenInfo(true) }}>
                      Ver Kit
                    </Button>
                    {!done && (
                      <Button
                        onClick={async (e) => {
                          e.stopPropagation()
                          await setDone(k.id, 'bolos', true)
                          setRefresh(x => x + 1)
                        }}
                      >
                        Feito
                      </Button>
                    )}
                  </>
                }
              />
            )
          })}
        </GridCards>
      ))}

      <KitInfoModal
        open={openInfo}
        kit={selectedKit}
        onClose={() => setOpenInfo(false)}
        showEntregueToggle={false}
      />
    </Page>
  )
}
