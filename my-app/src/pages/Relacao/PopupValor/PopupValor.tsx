import { useState } from 'react'
import {
  Overlay, Modal, ModalTitle, ModalGrid, ModalField,
  ModalLabel, ModalInput, ModalFooter, CancelButton, SaveButton,
} from '../../Consolidado/Popup/Popup.styled'

type Props = {
  pedidoId: number
  valorAtual: string
  onClose: () => void
  onSaved: (pedidoId: number, valor: string) => void
}

function formatPreco(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  const num = parseInt(digits, 10)
  const intPart = Math.floor(num / 100).toString()
  const decPart = (num % 100).toString().padStart(2, '0')
  const intWithSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `R$ ${intWithSep},${decPart}`
}

export default function PopupValor({ pedidoId, valorAtual, onClose, onSaved }: Props) {
  const [valor, setValor] = useState(valorAtual || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: { preco_total: valor } }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      onSaved(pedidoId, valor)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalTitle>Editar Valor</ModalTitle>

        {error && <div style={{ color: '#dc2626', fontSize: '0.85rem' }}>{error}</div>}

        <ModalGrid>
          <ModalField>
            <ModalLabel>Valor total</ModalLabel>
            <ModalInput
              value={valor}
              onChange={e => setValor(formatPreco(e.target.value))}
              placeholder="R$ 0,00"
            />
          </ModalField>
        </ModalGrid>

        <ModalFooter>
          <CancelButton type="button" onClick={onClose}>Cancelar</CancelButton>
          <SaveButton type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </SaveButton>
        </ModalFooter>
      </Modal>
    </Overlay>
  )
}