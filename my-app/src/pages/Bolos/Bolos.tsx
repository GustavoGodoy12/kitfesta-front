// src/pages/Bolo/Bolos.tsx
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

export default function Bolos() {
  const [filterDate, setFilterDate] = useState<string>('')
  const [orderAsc, setOrderAsc] = useState<boolean>(true)
  const [refresh, setRefresh] = useState(0)

  const [openInfo, setOpenInfo] = useState(false)
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null)

  // listKits é async → manter em estado
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
    if (filterDate) arr = arr.filter(k => (k.dataEvento || '') === filterDate)
    arr.sort((a, b) => ((a.hora || '') < (b.hora || '') ? -1 : 1) * (orderAsc ? 1 : -1))
    return arr
  }, [kits, filterDate, orderAsc])

  return (
    <Page>
      <Title>Bolos</Title>
      <Subtitle>
        Use o botão <strong>Feito</strong> no rodapé. Depois que estiver feito, desfazer só pela seta ↩︎ no topo direito.
      </Subtitle>

      <TopBar>
        <LeftGroup />
        <RightGroup>
          <DateInput type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          <Button onClick={() => setOrderAsc(v => !v)}>Ordenar por hora {orderAsc ? '↑' : '↓'}</Button>
          <Button onClick={() => { setFilterDate(''); setOrderAsc(true) }}>Limpar filtros</Button>
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
        showEntregueToggle={false}   // esconde o botão de entregue aqui
      />
    </Page>
  )
}
