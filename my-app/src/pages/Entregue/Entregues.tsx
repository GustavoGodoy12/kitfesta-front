// src/pages/entregues/Entregues.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAllDone, listEntregues, setEntregue } from '../../data/kitsRepo'
import type { Kit } from '../../types/kit'
import {
  Page, Title, Subtitle, TopBar, LeftGroup, RightGroup, Button, GridCards,
} from '../Kit/Kits.styled'
import KitCard from '../../components/KitCard/KitCard'
import KitInfoModal from '../../components/KitCard/KitInfoModal'

export default function Entregues() {
  const navigate = useNavigate()
  const [refresh, setRefresh] = useState(0)

  const [openInfo, setOpenInfo] = useState(false)
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null)

  // estado local para lista assíncrona
  const [entregues, setEntregues] = useState<Kit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await listEntregues()
        if (alive) setEntregues(data)
      } catch (e: any) {
        if (alive) setError(e?.message || 'Falha ao carregar entregues')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [refresh])

  return (
    <Page>
      <Title>Kits entregues</Title>
      <Subtitle>Visualização dos kits marcados como entregues.</Subtitle>

      <TopBar>
        <LeftGroup>
          <Button onClick={() => navigate('/kits')}>← Voltar para Kits</Button>
        </LeftGroup>
        <RightGroup />
      </TopBar>

      {loading && <Subtitle>Carregando…</Subtitle>}
      {error && <Subtitle style={{ color: '#b91c1c' }}>{error}</Subtitle>}

      {!loading && !error && (
        entregues.length === 0 ? (
          <Subtitle>Nenhum kit entregue até agora.</Subtitle>
        ) : (
          <GridCards>
            {entregues.map(k => (
              <KitCard
                key={k.id}
                kit={k}
                done={isAllDone(k)}
                onClick={(kit) => { setSelectedKit(kit); setOpenInfo(true) }}
                footer={
                  <Button
                    onClick={async (e) => {
                      e.stopPropagation()
                      await setEntregue(k.id, false)
                      setRefresh(x => x + 1)
                    }}
                    title="Remover da lista de entregues"
                  >
                    Desfazer entregue
                  </Button>
                }
              />
            ))}
          </GridCards>
        )
      )}

      <KitInfoModal
        open={openInfo}
        kit={selectedKit}
        onClose={() => setOpenInfo(false)}
        onEdit={() => {}}
        onEditItems={() => {}}
        showEntregueToggle={false}
      />
    </Page>
  )
}
