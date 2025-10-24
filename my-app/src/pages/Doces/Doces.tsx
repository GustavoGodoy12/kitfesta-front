import { useEffect, useMemo, useState } from 'react'
import { listKits, setDone } from '../../data/kitsRepo'
import type { Kit } from '../../types/kit'
import {
  Page, Title, Subtitle, TopBar, LeftGroup, RightGroup,
  DateInput, Button, GridCards, Label,
} from './Doces.styled'
import { SaborList } from './Doces.styled'
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

export default function Doces() {
  const [filterDate, setFilterDate] = useState<string>(() => todayLocalISO())
  const [orderAsc, setOrderAsc] = useState<boolean>(true)
  const [refresh, setRefresh] = useState(0)

  const [qNome, setQNome] = useState('')     // novo
  const [qNumero, setQNumero] = useState('') // novo

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

  const kitsWithDoces = useMemo(() => {
    let arr = (kits || []).filter(k => (k.doces?.length ?? 0) > 0)

    // de hoje pra frente
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

    // ordenação
    arr.sort((a, b) => ((a.hora || '') < (b.hora || '') ? -1 : 1) * (orderAsc ? 1 : -1))
    return arr
  }, [kits, filterDate, orderAsc, qNome, qNumero])

  return (
    <Page>
      <Title>Doces</Title>
      <Subtitle>
        Use o botão <strong>Feito</strong> no rodapé do card. Após marcado, aparece a seta ↩︎ no topo direito para desfazer.
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
          <Button onClick={() => setOrderAsc(v => !v)}>Ordenar por hora {orderAsc ? '↑' : '↓'}</Button>
          <Button onClick={() => { setFilterDate(todayLocalISO()); setOrderAsc(true); setQNome(''); setQNumero('') }}>
            Limpar filtros
          </Button>
        </RightGroup>
      </TopBar>

      {loading && <Subtitle>Carregando…</Subtitle>}
      {error && <Subtitle style={{ color: '#b91c1c' }}>{error}</Subtitle>}

      <h2 style={{ margin: '8px 0 0' }}>Kits com doces</h2>

      {!loading && !error && (kitsWithDoces.length === 0 ? (
        <Subtitle>Nenhum kit com doces encontrado.</Subtitle>
      ) : (
        <GridCards>
          {kitsWithDoces.map(k => {
            const done = !!k.status?.docesDone
            return (
              <KitCard
                key={k.id}
                kit={k}
                done={done}
                showUndo
                onToggleDone={async (kit) => {
                  await setDone(kit.id, 'doces', !done)
                  setRefresh(x => x + 1)
                }}
                showStats={false}
                middle={
                  <div>
                    <Label>Sabores e quantidades</Label>
                    <SaborList>
                      {k.doces.map(d => <li key={d.id}>{d.sabor} — {d.quantidade}</li>)}
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
                          await setDone(k.id, 'doces', true)
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
