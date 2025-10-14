// src/components/KitCard/KitCard.tsx
import type { ReactNode } from 'react'
import type { Kit } from '../../types/kit'
import {
  CardKit,
  KitHeader,
  StatRow,
  CardActions,
  DangerButton,
  Muted,
  UndoCorner,
  DoneBadgeTop,
  OverdueBadgeTop,
} from './KitCard.styled'

type Props = {
  kit: Kit
  done?: boolean
  overdue?: boolean
  showUndo?: boolean
  onToggleDone?: (kit: Kit) => void
  showStats?: boolean
  middle?: ReactNode
  footer?: ReactNode
  onClick?: (kit: Kit) => void
  onRemove?: (kit: Kit) => void
}

function computeTotals(k: Kit) {
  const doces = k.doces?.reduce((acc, d) => acc + (Number(d.quantidade) || 0), 0) ?? 0
  const salgados = k.salgados?.reduce((acc, s) => acc + (Number(s.quantidade) || 0), 0) ?? 0
  const bolos = k.bolos?.reduce((acc, b) => acc + (Number(b.quantidade) || 0), 0) ?? 0
  return { doces, salgados, bolos }
}

export default function KitCard({
  kit,
  done = false,
  overdue = false,
  showUndo = false,
  onToggleDone,
  showStats = true,
  middle,
  footer,
  onClick,
  onRemove,
}: Props) {
  const totals = computeTotals(kit)

  return (
    <CardKit
      $done={done}
      $overdue={!done && overdue}
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(kit)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(kit)
        }
      }}
      aria-label={`Abrir detalhes do kit ${kit.nome}`}
    >
      {/* Selos acima do nome */}
      {done && <DoneBadgeTop>FEITO</DoneBadgeTop>}
      {!done && overdue && <OverdueBadgeTop>ATRASADO</OverdueBadgeTop>}

      {/* Botão de desfazer */}
      {done && showUndo && onToggleDone && (
        <UndoCorner
          title="Desfazer"
          onClick={(e) => { e.stopPropagation(); onToggleDone(kit) }}
        >
          ↩︎ Desfazer
        </UndoCorner>
      )}

      {/* Cabeçalho */}
      <KitHeader>
        <strong>{kit.nome} <Muted>· ID: {kit.id}</Muted></strong>
        <small>
          {kit.dataEvento || 'Data —'} {kit.hora ? `· ${kit.hora}` : ''} · {kit.tipo === 'entrega' ? 'Entrega' : 'Retirada'}
        </small>
      </KitHeader>

      {showStats && (
        <StatRow>
          <span>Doces: {totals.doces}</span>
          <span>Salgados: {totals.salgados}</span>
          <span>Bolo: {totals.bolos}</span>
        </StatRow>
      )}

      {middle}

      <CardActions>
        {onRemove && (
          <DangerButton
            onClick={(e) => { e.stopPropagation(); onRemove(kit) }}
            title="Remover"
          >
            Remover
          </DangerButton>
        )}
        {footer}
      </CardActions>
    </CardKit>
  )
}
