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
  DoneRibbon,
} from './KitCard.styled'

type Props = {
  kit: Kit
  done?: boolean
  showUndo?: boolean                 // mostra a seta ↩︎ no topo direito quando done = true
  onToggleDone?: (kit: Kit) => void  // alterna feito/desfazer nas subpáginas
  showStats?: boolean                // mostra totais (doces/salgados/bolos)
  middle?: ReactNode                 // conteúdo do meio do card (listas, etc)
  footer?: ReactNode                 // conteúdo do rodapé (ex: botões)
  onClick?: (kit: Kit) => void       // abrir modal de informações (aba Kits)
  onRemove?: (kit: Kit) => void      // remover kit (aba Kits)
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
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(kit)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(kit) }}
      aria-label={`Abrir detalhes do kit ${kit.nome}`}
    >
      {/* Selo FEITO (fixo no canto inferior esquerdo) */}
      {done && <DoneRibbon>FEITO</DoneRibbon>}

      {/* Seta de desfazer (só aparece quando done=true e showUndo=true) */}
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

      {/* Estatísticas (opcional) */}
      {showStats && (
        <StatRow>
          <span>Doces: {totals.doces}</span>
          <span>Salgados: {totals.salgados}</span>
          <span>Bolo: {totals.bolos}</span>
        </StatRow>
      )}

      {/* Área do meio customizável */}
      {middle}

      {/* Rodapé */}
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
