import { useState, type FormEvent, useRef } from 'react'
import Layout from '../../layout/Layout'
import {
  Wrapper, TopPanel, TopRows, TopRow, FieldLabel, FieldInput,
  DayBadge, TopBottomRow, GenerateButton, PrintButton, TableSection,
  TableWrapper, RelacaoTable, RelacaoThead, RelacaoHeaderCell,
  RelacaoHeaderNumero, RelacaoTbody, RelacaoRow, RelacaoCell,
  RelacaoCellNumero,
} from './Relacao.styled'
import Popup, { type PopupItemData } from '../Consolidado/Popup/Popup'
import { fetchPedidosByData, type Pedido } from '../../services/relacao'

const STORAGE_KEY = 'sisteminha-pedidos'

type CategoryKey = 'doces' | 'salgados' | 'bolos'
type ItemsByCategory = Record<CategoryKey, { descricao: string; quantidade: string; unidade: string }[]>

function formatDateToBR(dateStr?: string): string {
  if (!dateStr) return ''
  if (dateStr.includes('/')) return dateStr
  const [year, month, day] = dateStr.split('-')
  if (!year || !month || !day) return dateStr
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
}

function getDayLabel(dateStr?: string) {
  if (!dateStr) return ''
  const [yearStr, monthStr, dayStr] = dateStr.split('-')
  const year = Number(yearStr), month = Number(monthStr), day = Number(dayStr)
  if (!year || !month || !day) return ''
  const d = new Date(year, month - 1, day)
  return ['DOMINGO','SEGUNDA','TERÇA','QUARTA','QUINTA','SEXTA','SÁBADO'][d.getDay()] ?? ''
}

function loadPedidosLocal(): Pedido[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function computeTotalCategory(items: ItemsByCategory | undefined, cat: CategoryKey) {
  if (!items) return 0
  return (items[cat] || []).reduce((sum, line) => {
    const n = Number(String(line.quantidade ?? '').replace(',', '.'))
    return sum + (Number.isNaN(n) ? 0 : n)
  }, 0)
}

export default function Relacao() {
  const [dataFiltro, setDataFiltro] = useState('')
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(false)
  const [entregues, setEntregues] = useState<Record<number, boolean>>({})
  const [popupPedidoId, setPopupPedidoId] = useState<number | null>(null)
  const [popupTipoPag, setPopupTipoPag] = useState<string>('')
  const abortRef = useRef<AbortController | null>(null)

  async function gerarRelacao() {
    setLoading(true)
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const apiPedidos = await fetchPedidosByData(dataFiltro, { signal: controller.signal })
      setPedidos(apiPedidos)
      // inicializa entregues com valores do banco
      const init: Record<number, boolean> = {}
      apiPedidos.forEach(p => { init[p.id] = p.formData?.entregue ?? false })
      setEntregues(init)
    } catch (err) {
      console.error('Falhou API, usando fallback localStorage:', err)
      const todos = loadPedidosLocal()
      const filtrados = dataFiltro.trim() === ''
        ? todos
        : todos.filter(p => p.formData?.data === dataFiltro.trim())
      setPedidos(filtrados)
      alert(err instanceof Error ? `API indisponível.\n\n${err.message}` : 'API indisponível.')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleEntregue(pedidoId: number, value: boolean) {
    setEntregues(prev => ({ ...prev, [pedidoId]: value }))
    try {
      await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: { entregue: value } }),
      })
    } catch (err) {
      console.error('Erro ao salvar entregue:', err)
      // reverte se falhar
      setEntregues(prev => ({ ...prev, [pedidoId]: !value }))
    }
  }

  function handleOpenPopupPagamento(pedidoId: number, tipoPagamentoAtual: string) {
    setPopupPedidoId(pedidoId)
    setPopupTipoPag(tipoPagamentoAtual)
  }

  async function handleSaveTipoPagamento(_itemId: number, data: PopupItemData) {
    if (popupPedidoId === null) return
    try {
      await fetch(`/api/pedidos/${popupPedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: { tipo_pagamento: data.descricao } }),
      })
      setPedidos(prev =>
        prev.map(p =>
          p.id === popupPedidoId
            ? { ...p, formData: { ...p.formData, tipoPagamento: data.descricao } }
            : p,
        ),
      )
    } catch (err) {
      console.error('Erro ao salvar tipo pagamento:', err)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await gerarRelacao()
    setTimeout(() => window.print(), 100)
  }

  const dayLabel = getDayLabel(dataFiltro)

  return (
    <Layout>
      <Wrapper onSubmit={handleSubmit}>
        <TopPanel>
          <TopRows>
            <TopRow>
              <div>
                <FieldLabel>Data</FieldLabel>
                <FieldInput type="date" value={dataFiltro} onChange={e => setDataFiltro(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Dia da semana</FieldLabel>
                <DayBadge>{dayLabel || '-'}</DayBadge>
              </div>
            </TopRow>
          </TopRows>
          <TopBottomRow>
            <GenerateButton type="button" onClick={gerarRelacao} disabled={loading}>
              {loading ? 'Gerando...' : 'Gerar relação'}
            </GenerateButton>
            <PrintButton type="submit" disabled={loading}>
              Imprimir relação
            </PrintButton>
          </TopBottomRow>
        </TopPanel>

        <TableSection>
          <TableWrapper>
            <RelacaoTable>
              <RelacaoThead>
                <tr>
                  <RelacaoHeaderCell>DESTINO</RelacaoHeaderCell>
                  <RelacaoHeaderCell>DATA</RelacaoHeaderCell>
                  <RelacaoHeaderNumero>NÚMERO</RelacaoHeaderNumero>
                  <RelacaoHeaderCell>TELEFONE</RelacaoHeaderCell>
                  <RelacaoHeaderCell>NOME CLIENTE</RelacaoHeaderCell>
                  <RelacaoHeaderCell>HORÁRIO</RelacaoHeaderCell>
                  <RelacaoHeaderCell>VALOR</RelacaoHeaderCell>
                  <RelacaoHeaderCell>REVENDEDOR</RelacaoHeaderCell>
                  <RelacaoHeaderCell>TIPO PAGAMENTO</RelacaoHeaderCell>
                  <RelacaoHeaderCell>ENTREGA</RelacaoHeaderCell>
                  <RelacaoHeaderCell>TAMANHO</RelacaoHeaderCell>
                  <RelacaoHeaderCell>DOCE</RelacaoHeaderCell>
                  <RelacaoHeaderCell>SALG</RelacaoHeaderCell>
                  <RelacaoHeaderCell>BOLO</RelacaoHeaderCell>
                  <RelacaoHeaderCell>ENTREGUE</RelacaoHeaderCell>
                </tr>
              </RelacaoThead>

              <RelacaoTbody>
                {pedidos.map(p => {
                  const id = p.id
                  const isEntregue = entregues[id] ?? false
                  const {
                    pedidoId, data, horario, telefone, cliente,
                    precoTotal, revendedor, tipoPagamento, retirada,
                  } = p.formData || ({} as any)

                  const totalDoces = computeTotalCategory(p.items as any, 'doces')
                  const totalSalgados = computeTotalCategory(p.items as any, 'salgados')
                  const totalBolos = computeTotalCategory(p.items as any, 'bolos')

                  return (
                    <RelacaoRow
                      key={id}
                      style={isEntregue ? { background: '#fef9c3' } : undefined}
                    >
                      <RelacaoCell>{cliente || ''}</RelacaoCell>
                      <RelacaoCell>{formatDateToBR(data) || ''}</RelacaoCell>
                      <RelacaoCellNumero>{pedidoId || id}</RelacaoCellNumero>
                      <RelacaoCell>{telefone || ''}</RelacaoCell>
                      <RelacaoCell>{cliente || ''}</RelacaoCell>
                      <RelacaoCell>{horario || ''}</RelacaoCell>
                      <RelacaoCell>{precoTotal || ''}</RelacaoCell>
                      <RelacaoCell>{revendedor || ''}</RelacaoCell>
                      <RelacaoCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                            {tipoPagamento || ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenPopupPagamento(id, tipoPagamento || '')}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              padding: '0 2px', fontSize: '0.75rem', lineHeight: 1,
                            }}
                          >
                            ✏️
                          </button>
                        </div>
                      </RelacaoCell>
                      <RelacaoCell>{retirada || ''}</RelacaoCell>
                      <RelacaoCell>{p.formData?.tamanho || ''}</RelacaoCell>
                      <RelacaoCell>{totalDoces || ''}</RelacaoCell>
                      <RelacaoCell>{totalSalgados || ''}</RelacaoCell>
                      <RelacaoCell>{totalBolos || ''}</RelacaoCell>
                      <RelacaoCell>
                        <input
                          type="checkbox"
                          checked={isEntregue}
                          onChange={e => handleToggleEntregue(id, e.target.checked)}
                          style={{ cursor: 'pointer', width: 16, height: 16 }}
                        />
                      </RelacaoCell>
                    </RelacaoRow>
                  )
                })}
              </RelacaoTbody>
            </RelacaoTable>
          </TableWrapper>
        </TableSection>
      </Wrapper>

      {popupPedidoId !== null && (
        <Popup
          itemId={popupPedidoId}
          initialData={{ descricao: popupTipoPag, quantidade: '', unidade: '' }}
          onClose={() => setPopupPedidoId(null)}
          onSaved={handleSaveTipoPagamento}
        />
      )}
    </Layout>
  )
}