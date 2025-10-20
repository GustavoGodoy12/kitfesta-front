import { useEffect, useState } from 'react'
import type { Kit } from '../../types/kit'
import {
  ModalOverlay,
  ModalCard,
  ModalTitle,
  ModalGrid,
  Divider,
  Label,
  Button,
} from '../../pages/Kit/Kits.styled'
import { CardActions, Muted } from './KitCard.styled'
import { isEntregue, setEntregue } from '../../data/kitsRepo'

type Props = {
  open: boolean
  kit: Kit | null
  onClose: () => void
  onEdit?: (kit: Kit) => void
  onEditItems?: (kit: Kit) => void
  /** Exibe o botão "Marcar como entregue" (default: true). Nas abas Doces/Salgados/Bolos, passe false. */
  showEntregueToggle?: boolean
}

const fmtBRL = (v: number | undefined) =>
  typeof v === 'number' && Number.isFinite(v)
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    : '—'

export default function KitInfoModal({
  open,
  kit,
  onClose,
  onEdit,
  onEditItems,
  showEntregueToggle = true,
}: Props) {
  const [entregue, setEntregueLocal] = useState(false)

  useEffect(() => {
    setEntregueLocal(!!(kit && isEntregue(kit)))
  }, [kit])

  if (!open || !kit) return null

  const toggleEntregue = () => {
    setEntregue(kit.id, !entregue)
    setEntregueLocal(!entregue)
  }

  return (
    <ModalOverlay onMouseDown={onClose}>
      <ModalCard onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Detalhes do kit</ModalTitle>

        <div>
          <strong style={{ fontSize: '1.1rem' }}>
            {kit.nome} <Muted>· ID: {kit.id}</Muted>
          </strong>
          <div><Muted>{kit.tipo === 'entrega' ? 'Entrega' : 'Retirada'}</Muted></div>
        </div>

        <ModalGrid>
          <div><Label>Telefone</Label><div>{kit.telefone}</div></div>
          <div><Label>Email</Label><div>{kit.email || <Muted>—</Muted>}</div></div>
          <div><Label>Dia</Label><div>{kit.dataEvento || <Muted>—</Muted>}</div></div>
          <div><Label>Hora</Label><div>{kit.hora || <Muted>—</Muted>}</div></div>
          <div><Label>Preço</Label><div>{fmtBRL(kit.preco)}</div></div>
          {kit.tipo === 'entrega' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Endereço</Label>
              <div>{kit.endereco || <Muted>—</Muted>}</div>
            </div>
          )}
        </ModalGrid>

        <Divider />

        <div>
          <h4 style={{ margin: '8px 0' }}>Doces</h4>
          {kit.doces.length === 0 ? (
            <Muted>Nenhum doce.</Muted>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {kit.doces.map(d => <li key={d.id}>{d.sabor} — {d.quantidade}</li>)}
            </ul>
          )}
        </div>

        <div>
          <h4 style={{ margin: '8px 0' }}>Salgados</h4>
          {kit.salgados.length === 0 ? (
            <Muted>Nenhum salgado.</Muted>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {kit.salgados.map(s => <li key={s.id}>{s.sabor} — {s.quantidade}</li>)}
            </ul>
          )}
        </div>

        <div>
          <h4 style={{ margin: '8px 0' }}>Bolos</h4>
          {kit.bolos.length === 0 ? (
            <Muted>Nenhum bolo.</Muted>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {kit.bolos.map(b => (
                <li key={b.id}>
                  {b.sabor} — {b.quantidade}{b.texto ? ` — “${b.texto}”` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>

        <CardActions style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {onEdit && <Button onClick={() => onEdit(kit)}>Editar</Button>}
            {onEditItems && <Button onClick={() => onEditItems(kit)}>Editar itens</Button>}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {showEntregueToggle && (
              <Button onClick={toggleEntregue}>
                {entregue ? 'Desfazer entregue' : 'Marcar como entregue'}
              </Button>
            )}
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </CardActions>
      </ModalCard>
    </ModalOverlay>
  )
}
