import { useState } from 'react'
import {
  Overlay, Modal, ModalTitle, ModalGrid, ModalField,
  ModalLabel, ModalInput, ModalSelect, ModalFooter,
  CancelButton, SaveButton,
} from './Popup.styled'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4055'

export type PopupFormData = {
  responsavel: string
  cliente: string
  revendedor: string
  telefone: string
  retirada: string
  data: string
  horario: string
  endereco_entrega: string
  preco_total: string
  tipo_pagamento: string
  tamanho: string
}

type Props = {
  pedidoId: number
  initialData: PopupFormData
  onClose: () => void
  onSaved: (id: number, data: PopupFormData) => void
}

export default function Popup({ pedidoId, initialData, onClose, onSaved }: Props) {
  const [form, setForm] = useState<PopupFormData>(initialData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: form }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      onSaved(pedidoId, form)
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
        <ModalTitle>Editar Pedido #{pedidoId}</ModalTitle>

        {error && <div style={{ color: '#dc2626', fontSize: '0.85rem' }}>{error}</div>}

        <ModalGrid>
          <ModalField>
            <ModalLabel>Responsável</ModalLabel>
            <ModalInput name="responsavel" value={form.responsavel} onChange={handleChange} />
          </ModalField>
          <ModalField>
            <ModalLabel>Cliente</ModalLabel>
            <ModalInput name="cliente" value={form.cliente} onChange={handleChange} />
          </ModalField>
          <ModalField>
            <ModalLabel>Revendedor</ModalLabel>
            <ModalInput name="revendedor" value={form.revendedor} onChange={handleChange} />
          </ModalField>
          <ModalField>
            <ModalLabel>Telefone</ModalLabel>
            <ModalInput name="telefone" value={form.telefone} onChange={handleChange} />
          </ModalField>
          <ModalField>
            <ModalLabel>Data</ModalLabel>
            <ModalInput type="date" name="data" value={form.data} onChange={handleChange} />
          </ModalField>
          <ModalField>
            <ModalLabel>Horário</ModalLabel>
            <ModalInput type="time" name="horario" value={form.horario} onChange={handleChange} />
          </ModalField>
          <ModalField>
            <ModalLabel>Retirada / Entrega</ModalLabel>
            <ModalSelect name="retirada" value={form.retirada} onChange={handleChange}>
              <option value="ENTREGA">ENTREGA</option>
              <option value="RETIRADA">RETIRADA</option>
            </ModalSelect>
          </ModalField>
          <ModalField>
            <ModalLabel>Endereço</ModalLabel>
            <ModalInput name="endereco_entrega" value={form.endereco_entrega} onChange={handleChange} />
          </ModalField>
          <ModalField>
            <ModalLabel>Preço total</ModalLabel>
            <ModalInput name="preco_total" value={form.preco_total} onChange={handleChange} />
          </ModalField>
          <ModalField>
            <ModalLabel>Tipo pagamento</ModalLabel>
            <ModalInput name="tipo_pagamento" value={form.tipo_pagamento} onChange={handleChange} />
          </ModalField>
          <ModalField>
            <ModalLabel>Tamanho</ModalLabel>
            <ModalSelect name="tamanho" value={form.tamanho} onChange={handleChange}>
              <option value="">-</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
              <option value="60">60</option>
              <option value="70">70</option>
              <option value="80">80</option>
              <option value="90">90</option>
              <option value="100">100</option>
              <option value="BENTO CAKE">BENTO CAKE</option>
              <option value="AVULSO">AVULSO</option>
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