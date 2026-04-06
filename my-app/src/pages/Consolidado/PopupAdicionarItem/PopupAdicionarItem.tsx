import { useState } from 'react'
import {
  Overlay, Modal, ModalTitle, ModalField,
  ModalLabel, ModalInput, ModalSelect, ModalFooter,
  CancelButton, SaveButton,
} from '../Popup/Popup.styled'

export type NovoItem = {
  descricao: string
  quantidade: string
  unidade: string
  categoria: 'doces' | 'salgados' | 'bolos'
}

const DOCES_OPCOES = [
  'BRIGADEIRO','BEIJINHO','CAJUZINHO','BICHO DE PÉ','DOIS AMORES',
  'OLHO DE SOGRA','DOCE DE UVA','BOMBOM DE AMEIXA','BOMBOM DE CEREJA',
  'BOMBOM DE UVA','BOMBOM DE MORANGO','BOMBOM DE DAMASCO','TRUFA',
  'COPO DE CHOCOLATE','MINI PUDIM','MINI TORTINHAS','CAMAFEU','OUTROS',
]

const SALGADOS_OPCOES = [
  'COXINHA DE FRANGO','BOLINHA DE QUEIJO','PASTEL DE CARNE','PASTEL DE PIZZA',
  'BARQUETE DE SALPICÃO','QUIBE','RISOLIS DE PIZZA','TROUXINHA DE FRANGO',
  'ENROLADO DE PIZZA','ENROLADO DE VINA','ESFIRRA DE CARNE','MINI X SALADA',
  'MINI PIZZA','FOLHADO (QUEIJO E PRESUNTO)','FOLHADO (PALMITO)',
]

const BOLOS_OPCOES = [
  'FLORESTA NEGRA','MORANGO','MARTA ROCHA','SONHO DE VALSA','NATA FRUTAS',
  'DOIS AMORES','PRESTIGIO','BRIGADEIRO','QUATRO LEITES','COCADA',
]

const OPCOES_POR_CATEGORIA: Record<NovoItem['categoria'], string[]> = {
  doces: DOCES_OPCOES,
  salgados: SALGADOS_OPCOES,
  bolos: BOLOS_OPCOES,
}

const EMPTY_ITEM: NovoItem = {
  descricao: '',
  quantidade: '',
  unidade: 'UN',
  categoria: 'doces',
}

type Props = {
  pedidoId: number
  numeroPedido: string
  onClose: () => void
  onSaved: (pedidoId: number, itens: NovoItem[]) => void
}

export default function PopupAdicionarItem({ pedidoId, numeroPedido, onClose, onSaved }: Props) {
  const [itens, setItens] = useState<NovoItem[]>([{ ...EMPTY_ITEM }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(idx: number, field: keyof NovoItem, value: string) {
    setItens(prev => prev.map((item, i) => {
      if (i !== idx) return item
      // Se mudou a categoria, limpa a descrição para forçar nova seleção
      if (field === 'categoria') return { ...item, categoria: value as NovoItem['categoria'], descricao: '' }
      return { ...item, [field]: value }
    }))
  }

  function handleAddLinha() {
    setItens(prev => [...prev, { ...EMPTY_ITEM }])
  }

  function handleRemoveLinha(idx: number) {
    setItens(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    const validos = itens.filter(it => it.descricao.trim() && it.quantidade.trim())
    if (!validos.length) {
      setError('Preencha ao menos um item com descrição e quantidade.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}/itens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens: validos }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      onSaved(pedidoId, validos)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()} style={{ maxWidth: 640, width: '95vw' }}>
        <ModalTitle>Adicionar Itens — Pedido #{numeroPedido}</ModalTitle>

        {error && (
          <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: 8 }}>{error}</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '55vh', overflowY: 'auto' }}>
          {itens.map((item, idx) => {
            const opcoes = OPCOES_POR_CATEGORIA[item.categoria]
            return (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr 80px 80px auto',
                  gap: 8,
                  alignItems: 'end',
                  padding: '8px 10px',
                  background: '#f9fafb',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                }}
              >
                {/* CATEGORIA */}
                <ModalField style={{ margin: 0 }}>
                  <ModalLabel>Categoria</ModalLabel>
                  <ModalSelect
                    value={item.categoria}
                    onChange={e => handleChange(idx, 'categoria', e.target.value)}
                  >
                    <option value="doces">🍬 Doces</option>
                    <option value="salgados">🥐 Salgados</option>
                    <option value="bolos">🎂 Bolos</option>
                  </ModalSelect>
                </ModalField>

                {/* DESCRIÇÃO — dropdown com opções da categoria */}
                <ModalField style={{ margin: 0 }}>
                  <ModalLabel>Descrição</ModalLabel>
                  <ModalSelect
                    value={item.descricao}
                    onChange={e => handleChange(idx, 'descricao', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {opcoes.map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </ModalSelect>
                </ModalField>

                {/* QUANTIDADE */}
                <ModalField style={{ margin: 0 }}>
                  <ModalLabel>Qtd</ModalLabel>
                  <ModalInput
                    value={item.quantidade}
                    onChange={e => handleChange(idx, 'quantidade', e.target.value)}
                    placeholder="50"
                    inputMode="decimal"
                  />
                </ModalField>

                {/* UNIDADE */}
                <ModalField style={{ margin: 0 }}>
                  <ModalLabel>Unidade</ModalLabel>
                  <ModalSelect
                    value={item.unidade}
                    onChange={e => handleChange(idx, 'unidade', e.target.value)}
                  >
                    <option value="UN">UN</option>
                    <option value="KG">KG</option>
                    <option value="L">L</option>
                  </ModalSelect>
                </ModalField>

                {/* REMOVER LINHA */}
                <button
                  type="button"
                  onClick={() => handleRemoveLinha(idx)}
                  disabled={itens.length === 1}
                  style={{
                    background: '#fee2e2',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 8px',
                    cursor: itens.length === 1 ? 'not-allowed' : 'pointer',
                    color: '#dc2626',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    opacity: itens.length === 1 ? 0.4 : 1,
                    alignSelf: 'flex-end',
                    height: 32,
                  }}
                >
                  🗑️
                </button>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={handleAddLinha}
          style={{
            marginTop: 10,
            background: '#f0fdf4',
            border: '1.5px dashed #22c55e',
            borderRadius: 8,
            padding: '8px 0',
            width: '100%',
            fontWeight: 700,
            fontSize: '0.82rem',
            color: '#15803d',
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          + Adicionar mais uma linha
        </button>

        <ModalFooter>
          <CancelButton type="button" onClick={onClose}>Cancelar</CancelButton>
          <SaveButton type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar itens'}
          </SaveButton>
        </ModalFooter>
      </Modal>
    </Overlay>
  )
}