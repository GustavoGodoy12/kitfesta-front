import { useState } from 'react'
import {
  Overlay, Modal, ModalTitle, ModalGrid, ModalField,
  ModalLabel, ModalSelect, ModalFooter, CancelButton, SaveButton,
} from '../../Consolidado/Popup/Popup.styled'

const TIPOS_PAGAMENTO = [
  'QRCODE', 'PIX', 'DÉBITO', 'CRÉDITO', 'DINHEIRO',
  'GUIA', 'NOTA', 'VALE', 'VOUCHER',
]

type Props = {
  pedidoId: number
  valorAtual: string
  onClose: () => void
  onSaved: (pedidoId: number, tipoPagamento: string) => void
}

export default function PopupPagamento({ pedidoId, valorAtual, onClose, onSaved }: Props) {
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
        body: JSON.stringify({ formData: { tipo_pagamento: valor } }),
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
        <ModalTitle>Editar Tipo de Pagamento</ModalTitle>

        {error && <div style={{ color: '#dc2626', fontSize: '0.85rem' }}>{error}</div>}

        <ModalGrid>
          <ModalField>
            <ModalLabel>Tipo de Pagamento</ModalLabel>
            <ModalSelect value={valor} onChange={e => setValor(e.target.value)}>
              <option value="">-</option>
              {TIPOS_PAGAMENTO.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </ModalSelect>
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