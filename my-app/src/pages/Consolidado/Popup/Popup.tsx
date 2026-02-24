import { useState } from 'react'
import {
  Overlay, Modal, ModalTitle, ModalGrid, ModalField,
  ModalLabel, ModalInput, ModalSelect, ModalFooter,
  CancelButton, SaveButton,
} from './Popup.styled'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

export type PopupItemData = {
  descricao: string
  quantidade: string
  unidade: string
}

type Props = {
  itemId: number
  initialData: PopupItemData
  onClose: () => void
  onSaved: (itemId: number, data: PopupItemData) => void
}

export default function Popup({ itemId, initialData, onClose, onSaved }: Props) {
  const [form, setForm] = useState<PopupItemData>(initialData)
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
      const res = await fetch(`${API_BASE_URL}/api/itens/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      onSaved(itemId, form)
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
        <ModalTitle>Editar Item</ModalTitle>

        {error && <div style={{ color: '#dc2626', fontSize: '0.85rem' }}>{error}</div>}

        <ModalGrid>
          <ModalField>
            <ModalLabel>Descrição</ModalLabel>
            <ModalInput name="descricao" value={form.descricao} onChange={handleChange} />
          </ModalField>
          <ModalField>
            <ModalLabel>Quantidade</ModalLabel>
            <ModalInput name="quantidade" value={form.quantidade} onChange={handleChange} />
          </ModalField>
          <ModalField>
            <ModalLabel>Unidade</ModalLabel>
            <ModalSelect name="unidade" value={form.unidade} onChange={handleChange}>
              <option value="UN">UN</option>
              <option value="KG">KG</option>
              <option value="L">L</option>
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