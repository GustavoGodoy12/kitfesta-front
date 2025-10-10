// src/pages/Doce/Doces.tsx
import { useEffect, useMemo, useState } from 'react'
import { listKits, setDone } from '../../data/kitsRepo' // esta função agora é assíncrona
import type { Kit } from '../../types/kit'
import {
  Page, Title, Subtitle, TopBar, LeftGroup, RightGroup,
  DateInput, Button, GridCards, Label,
} from './Doces.styled'
import { SaborList } from './Doces.styled'
import KitCard from '../../components/KitCard/KitCard'
import KitInfoModal from '../../components/KitCard/KitInfoModal'

export default function Doces() {
  const [filterDate, setFilterDate] = useState<string>('')
  const [orderAsc, setOrderAsc] = useState<boolean>(true)
  const [refresh, setRefresh] = useState(0)

  const [openInfo, setOpenInfo] = useState(false)
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null)

  // novo: estado para os kits (pois listKits é async)
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
    if (filterDate) arr = arr.filter(k => (k.dataEvento || '') === filterDate)
    arr.sort((a, b) => ((a.hora || '') < (b.hora || '') ? -1 : 1) * (orderAsc ? 1 : -1))
    return arr
  }, [kits, filterDate, orderAsc])

  return (
    <Page>
      <Title>Doces</Title>
      <Subtitle>
        Use o botão <strong>Feito</strong> no rodapé do card. Após marcado, aparece a seta ↩︎ no topo direito para desfazer.
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
        showEntregueToggle={false}   // esconde o botão de entregue aqui
      />
    </Page>
  )
}
