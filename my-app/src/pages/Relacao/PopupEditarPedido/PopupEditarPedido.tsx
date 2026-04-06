import { useState } from 'react'
import {
  Overlay, Modal, ModalTitle, ModalGrid, ModalField,
  ModalLabel, ModalInput, ModalSelect, ModalFooter, CancelButton, SaveButton,
} from '../../Consolidado/Popup/Popup.styled'
import type { Pedido } from '../../../services/relacao'

const TIPOS_PAGAMENTO = [
  'QRCODE', 'PIX', 'DÉBITO', 'CRÉDITO', 'DINHEIRO',
  'GUIA', 'NOTA', 'VALE', 'VOUCHER',
]

const TIPOS_RETIRADA = ['RETIRADA', 'ENTREGA']

function formatPreco(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  const num = parseInt(digits, 10)
  const intPart = Math.floor(num / 100).toString()
  const decPart = (num % 100).toString().padStart(2, '0')
  const intWithSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `R$ ${intWithSep},${decPart}`
}

type Props = {
  pedido: Pedido
  onClose: () => void
  onSaved: (pedidoId: number, updatedFormData: Record<string, string>) => void
}

export default function PopupEditarPedido({ pedido, onClose, onSaved }: Props) {
  const fd = pedido.formData || ({} as any)

  const [cliente, setCliente] = useState(fd.cliente || '')
  const [responsavel, setResponsavel] = useState(fd.responsavel || '')
  const [telefone, setTelefone] = useState(fd.telefone || '')
  const [data, setData] = useState(fd.data || '')
  const [horario, setHorario] = useState(fd.horario || '')
  const [revendedor, setRevendedor] = useState(fd.revendedor || '')
  const [tipoPagamento, setTipoPagamento] = useState(fd.tipoPagamento || '')
  const [retirada, setRetirada] = useState(fd.retirada || '')
  const [tamanho, setTamanho] = useState(fd.tamanho || '')
  const [precoTotal, setPrecoTotal] = useState(fd.precoTotal || '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const updatedFormData = {
        cliente,
        responsavel,
        telefone,
        data,
        horario,
        revendedor,
        tipoPagamento,
        retirada,
        tamanho,
        precoTotal,
      }
      const res = await fetch(`/api/pedidos/${pedido.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: updatedFormData }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      onSaved(pedido.id, updatedFormData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <ModalTitle>Editar Pedido #{fd.pedidoId || pedido.id}</ModalTitle>

        {error && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: 8 }}>{error}</div>}

        <ModalGrid>
          <ModalField>
            <ModalLabel>Destino (Cliente)</ModalLabel>
            <ModalInput value={cliente} onChange={e => setCliente(e.target.value)} />
          </ModalField>

          <ModalField>
            <ModalLabel>Nome Cliente (Responsável)</ModalLabel>
            <ModalInput value={responsavel} onChange={e => setResponsavel(e.target.value)} />
          </ModalField>

          <ModalField>
            <ModalLabel>Telefone</ModalLabel>
            <ModalInput value={telefone} onChange={e => setTelefone(e.target.value)} />
          </ModalField>

          <ModalField>
            <ModalLabel>Data</ModalLabel>
            <ModalInput type="date" value={data} onChange={e => setData(e.target.value)} />
          </ModalField>

          <ModalField>
            <ModalLabel>Horário</ModalLabel>
            <ModalInput value={horario} onChange={e => setHorario(e.target.value)} placeholder="Ex: 14:00" />
          </ModalField>

          <ModalField>
            <ModalLabel>Valor Total</ModalLabel>
            <ModalInput
              value={precoTotal}
              onChange={e => setPrecoTotal(formatPreco(e.target.value))}
              placeholder="R$ 0,00"
            />
          </ModalField>

          <ModalField>
            <ModalLabel>Revendedor</ModalLabel>
            <ModalInput value={revendedor} onChange={e => setRevendedor(e.target.value)} />
          </ModalField>

          <ModalField>
            <ModalLabel>Tipo de Pagamento</ModalLabel>
            <ModalSelect value={tipoPagamento} onChange={e => setTipoPagamento(e.target.value)}>
              <option value="">-</option>
              {TIPOS_PAGAMENTO.map(t => <option key={t} value={t}>{t}</option>)}
            </ModalSelect>
          </ModalField>

          <ModalField>
            <ModalLabel>Entrega</ModalLabel>
            <ModalSelect value={retirada} onChange={e => setRetirada(e.target.value)}>
              <option value="">-</option>
              {TIPOS_RETIRADA.map(t => <option key={t} value={t}>{t}</option>)}
            </ModalSelect>
          </ModalField>

          <ModalField>
            <ModalLabel>Pessoas</ModalLabel>
            <ModalInput value={tamanho} onChange={e => setTamanho(e.target.value)} placeholder="Ex: 50" />
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