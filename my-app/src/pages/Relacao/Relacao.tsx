import { useState, type FormEvent, useRef } from 'react'
import Layout from '../../layout/Layout'
import {
  Wrapper, TopPanel, TopRows, TopRow, FieldLabel, FieldInput,
  DayBadge, TopBottomRow, GenerateButton, PrintButton, TableSection,
  TableWrapper, RelacaoTable, RelacaoThead, RelacaoHeaderCell,
  RelacaoHeaderNumero, RelacaoTbody, RelacaoRow, RelacaoCell,
  RelacaoCellNumero,
} from './Relacao.styled'
import PopupPagamento from './PopupPagamento/PopupPagamento'
import PopupValor from './PopupValor/PopupValor'
import PopupEditarPedido from './PopupEditarPedido/PopupEditarPedido'
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
  const [numeroPedidoFiltro, setNumeroPedidoFiltro] = useState('')
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(false)
  const [entregues, setEntregues] = useState<Record<number, boolean>>({})

  // popup pagamento
  const [popupPagId, setPopupPagId] = useState<number | null>(null)
  const [popupPagValor, setPopupPagValor] = useState('')

  // popup valor
  const [popupValorId, setPopupValorId] = useState<number | null>(null)
  const [popupValorAtual, setPopupValorAtual] = useState('')

  // popup editar pedido completo
  const [popupEditarPedido, setPopupEditarPedido] = useState<Pedido | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  async function gerarRelacao() {
    setLoading(true)
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const apiPedidos = await fetchPedidosByData(dataFiltro, { signal: controller.signal })

      const filtrados = numeroPedidoFiltro.trim()
        ? apiPedidos.filter(p =>
            String(p.formData?.pedidoId ?? p.id) === numeroPedidoFiltro.trim(),
          )
        : apiPedidos

      setPedidos(filtrados)
      const init: Record<number, boolean> = {}
      filtrados.forEach(p => { init[p.id] = p.formData?.entregue ?? false })
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

  async function handleDeletePedido(pedidoId: number) {
    if (!confirm(`Excluir pedido #${pedidoId}? Esta ação não pode ser desfeita.`)) return
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      setPedidos(prev => prev.filter(p => p.id !== pedidoId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir pedido')
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
      setEntregues(prev => ({ ...prev, [pedidoId]: !value }))
    }
  }

  function handleSavePagamento(pedidoId: number, tipoPagamento: string) {
    setPedidos(prev =>
      prev.map(p =>
        p.id === pedidoId
          ? { ...p, formData: { ...p.formData, tipoPagamento } }
          : p,
      ),
    )
  }

  function handleSaveValor(pedidoId: number, valor: string) {
    setPedidos(prev =>
      prev.map(p =>
        p.id === pedidoId
          ? { ...p, formData: { ...p.formData, precoTotal: valor } }
          : p,
      ),
    )
  }

  function handleSaveEdicao(pedidoId: number, updatedFormData: Record<string, string>) {
    setPedidos(prev =>
      prev.map(p =>
        p.id === pedidoId
          ? { ...p, formData: { ...p.formData, ...updatedFormData } }
          : p,
      ),
    )
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
                <FieldInput
                  type="date"
                  value={dataFiltro}
                  onChange={e => setDataFiltro(e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Dia da semana</FieldLabel>
                <DayBadge>{dayLabel || '-'}</DayBadge>
              </div>
              <div>
                <FieldLabel>Nº do pedido</FieldLabel>
                <FieldInput
                  value={numeroPedidoFiltro}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ex: 42"
                  onChange={e => setNumeroPedidoFiltro(e.target.value.replace(/\D/g, ''))}
                  style={{ width: 110 }}
                />
              </div>
            </TopRow>
          </TopRows>
          <TopBottomRow>
            {pedidos.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: '#f97316',
                borderRadius: 999,
                marginRight: 'auto',
              }}>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#111827',
                }}>
                  Total de Pedidos:
                </span>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#111827',
                  background: '#ffffff',
                  padding: '2px 12px',
                  borderRadius: 999,
                }}>
                  {pedidos.length}
                </span>
              </div>
            )}
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
                  <RelacaoHeaderCell>PESSOAS</RelacaoHeaderCell>
                  <RelacaoHeaderCell>DOCE</RelacaoHeaderCell>
                  <RelacaoHeaderCell>SALG</RelacaoHeaderCell>
                  <RelacaoHeaderCell>BOLO</RelacaoHeaderCell>
                  <RelacaoHeaderCell>ENTREGUE</RelacaoHeaderCell>
                  <RelacaoHeaderCell>AÇÕES</RelacaoHeaderCell>
                </tr>
              </RelacaoThead>

              <RelacaoTbody>
                {pedidos.map(p => {
                  const id = p.id
                  const isEntregue = entregues[id] ?? false
                  const isEntrega = (p.formData?.retirada ?? '') === 'ENTREGA'
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
                      $entregue={isEntregue}
                      $entrega={!isEntregue && isEntrega}
                    >
                      <RelacaoCell>{cliente || ''}</RelacaoCell>
                      <RelacaoCell>{formatDateToBR(data) || ''}</RelacaoCell>
                      <RelacaoCellNumero>{pedidoId || id}</RelacaoCellNumero>
                      <RelacaoCell>{telefone || ''}</RelacaoCell>
                      <RelacaoCell>{p.formData?.responsavel || ''}</RelacaoCell>
                      <RelacaoCell>{horario || ''}</RelacaoCell>
                      <RelacaoCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                            {precoTotal || ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPopupValorId(id)
                              setPopupValorAtual(precoTotal || '')
                            }}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              padding: '0 2px', fontSize: '0.72rem', lineHeight: 1,
                            }}
                          >
                            ✏️
                          </button>
                        </div>
                      </RelacaoCell>
                      <RelacaoCell>{revendedor || ''}</RelacaoCell>
                      <RelacaoCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                            {tipoPagamento || ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPopupPagId(id)
                              setPopupPagValor(tipoPagamento || '')
                            }}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              padding: '0 2px', fontSize: '0.72rem', lineHeight: 1,
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
                      <RelacaoCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button
                            type="button"
                            onClick={() => setPopupEditarPedido(p)}
                            style={{
                              background: '#dbeafe', border: 'none', borderRadius: 6,
                              padding: '2px 8px', fontWeight: 700, fontSize: '0.72rem',
                              cursor: 'pointer', color: '#1d4ed8',
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePedido(id)}
                            style={{
                              background: '#fee2e2', border: 'none', borderRadius: 6,
                              padding: '2px 8px', fontWeight: 700, fontSize: '0.72rem',
                              cursor: 'pointer', color: '#dc2626',
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </RelacaoCell>
                    </RelacaoRow>
                  )
                })}
              </RelacaoTbody>
            </RelacaoTable>
          </TableWrapper>
        </TableSection>
      </Wrapper>

      {popupPagId !== null && (
        <PopupPagamento
          pedidoId={popupPagId}
          valorAtual={popupPagValor}
          onClose={() => setPopupPagId(null)}
          onSaved={handleSavePagamento}
        />
      )}

      {popupValorId !== null && (
        <PopupValor
          pedidoId={popupValorId}
          valorAtual={popupValorAtual}
          onClose={() => setPopupValorId(null)}
          onSaved={handleSaveValor}
        />
      )}

      {popupEditarPedido !== null && (
        <PopupEditarPedido
          pedido={popupEditarPedido}
          onClose={() => setPopupEditarPedido(null)}
          onSaved={handleSaveEdicao}
        />
      )}
    </Layout>
  )
}