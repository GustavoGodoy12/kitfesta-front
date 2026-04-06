import { useRef, useState, type FormEvent } from 'react'
import Layout from '../../layout/Layout'
import {
  Wrapper, TopPanel, TopRows, TopRow, FieldLabel, FieldInput,
  TopBottomRow, GenerateButton, PrintButton, TableSection,
  TableWrapper, RelacaoTable, RelacaoThead, RelacaoHeaderCell,
  RelacaoHeaderNumero, RelacaoTbody, RelacaoRow, RelacaoCell,
  RelacaoCellNumero,
} from './Consolidado.styled'
import Popup, { type PopupItemData } from './Popup/Popup'
import PopupAdicionarItem, { type NovoItem } from './PopupAdicionarItem/PopupAdicionarItem'
import { fetchPedidosConsolidado, type Pedido } from '../../services/consolidado'

const STORAGE_KEY = 'sisteminha-pedidos'

type CategoryKey = 'doces' | 'salgados' | 'bolos'

type ConsolidadoRow = {
  itemId: number | undefined
  pedidoId: number
  pedido: string
  data: string
  mes: string
  cliente: string
  responsavel: string
  retirada: string
  horario: string
  tamanho: string
  categoria: CategoryKey
  descricao: string
  quantidade: string
  unidade: string
  _rawFormData: any
}

type SummaryItem = {
  descricao: string
  quantidadeTotal: number
  unidade: string
  categoria: CategoryKey
}

function sanitizeOnlyDigits(raw: string) { return raw.replace(/\D/g, '') }

function formatDateToBR(dateStr?: string): string {
  if (!dateStr) return ''
  if (dateStr.includes('/')) return dateStr
  const [year, month, day] = dateStr.split('-')
  if (!year || !month || !day) return dateStr
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
}

function getMonthLabelFromISO(dateStr?: string) {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-')
  if (!year || !month) return ''
  return `${month.padStart(2, '0')}/${year}`
}

function loadPedidosLocal(): Pedido[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function applyLocalFilters(pedidos: Pedido[], filters: any): Pedido[] {
  const fDataInicio = filters.data_inicio?.trim()
  const fDataFim = filters.data_fim?.trim()
  const fCliente = filters.cliente?.trim().toLowerCase()
  const fResp = filters.responsavel?.trim().toLowerCase()
  const fRet = filters.retirada?.trim().toLowerCase()
  const fPedido = filters.pedidoId?.trim()

  return pedidos.filter(p => {
    const fd = p.formData || ({} as any)
    const dataOk = (
      (!fDataInicio || (fd.data ?? '') >= fDataInicio) &&
      (!fDataFim || (fd.data ?? '') <= fDataFim)
    )
    return (
      dataOk &&
      (!fCliente || String(fd.cliente ?? '').toLowerCase().includes(fCliente)) &&
      (!fResp || String(fd.responsavel ?? '').toLowerCase().includes(fResp)) &&
      (!fRet || String(fd.retirada ?? '').toLowerCase().includes(fRet)) &&
      (!fPedido || String(fd.pedidoId ?? '').trim() === fPedido || String(p.id) === fPedido)
    )
  })
}

function calculateSummary(rows: ConsolidadoRow[]): SummaryItem[] {
  const map = new Map<string, SummaryItem>()
  for (const row of rows) {
    const key = `${row.categoria}::${row.descricao.toLowerCase()}`
    const qty = parseFloat(row.quantidade) || 0
    if (map.has(key)) {
      map.get(key)!.quantidadeTotal += qty
    } else {
      map.set(key, {
        descricao: row.descricao,
        quantidadeTotal: qty,
        unidade: row.unidade,
        categoria: row.categoria,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    const catOrder = { doces: 1, salgados: 2, bolos: 3 }
    if (catOrder[a.categoria] !== catOrder[b.categoria]) return catOrder[a.categoria] - catOrder[b.categoria]
    return a.descricao.localeCompare(b.descricao)
  })
}

// ─── aviso de ajuste de preço ────────────────────────────────────────────────
function AvisoPreco({ numeroPedido, onClose }: { numeroPedido: string; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          padding: '32px 36px',
          maxWidth: 420,
          width: '90vw',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ fontSize: '2.5rem' }}>⚠️</div>
        <p style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: 700,
          color: '#111827',
          lineHeight: 1.5,
        }}>
          Itens adicionados ao pedido{' '}
          <span style={{ color: '#f97316' }}>#{numeroPedido}</span>!
        </p>
        <p style={{
          margin: 0,
          fontSize: '0.88rem',
          fontWeight: 600,
          color: '#6b7280',
          lineHeight: 1.5,
        }}>
          Favor ajustar o <strong>preço desse pedido</strong> na tela de{' '}
          <strong style={{ color: '#f97316' }}>Relação</strong>.
        </p>
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 4,
            background: '#f97316',
            border: 'none',
            borderRadius: 999,
            padding: '10px 28px',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: '#111827',
            cursor: 'pointer',
            letterSpacing: '0.06em',
          }}
        >
          Entendido
        </button>
      </div>
    </div>
  )
}

export default function Consolidado() {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [clienteFiltro, setClienteFiltro] = useState('')
  const [responsavelFiltro, setResponsavelFiltro] = useState('')
  const [pedidoNumero, setPedidoNumero] = useState('')
  const [retiradaFiltro, setRetiradaFiltro] = useState<'' | 'ENTREGA' | 'RETIRADA'>('')
  const [rows, setRows] = useState<ConsolidadoRow[]>([])
  const [loading, setLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(true)

  // popup editar item
  const [popupItemId, setPopupItemId] = useState<number | null>(null)
  const [popupInitialData, setPopupInitialData] = useState<PopupItemData | null>(null)

  // popup adicionar item
  const [popupAdicionar, setPopupAdicionar] = useState<{ pedidoId: number; numeroPedido: string } | null>(null)

  // aviso ajuste preço
  const [avisoNumeroPedido, setAvisoNumeroPedido] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const summary = calculateSummary(rows)
  const summaryByCategory = {
    doces: summary.filter(s => s.categoria === 'doces'),
    salgados: summary.filter(s => s.categoria === 'salgados'),
    bolos: summary.filter(s => s.categoria === 'bolos'),
  }

  function flattenPedidos(pedidos: Pedido[]): ConsolidadoRow[] {
    const out: ConsolidadoRow[] = []
    for (const p of pedidos) {
      const fd = p.formData || ({} as any)
      const pedidoId = String(fd.pedidoId || p.id || '')
      const mes = getMonthLabelFromISO(fd.data)
      const items = p.items || ({} as any)
      const base = {
        pedidoId: p.id,
        pedido: pedidoId,
        data: fd.data || '',
        mes,
        cliente: fd.cliente || '',
        responsavel: fd.responsavel || '',
        retirada: fd.retirada || '',
        horario: fd.horario || '',
        tamanho: fd.tamanho || '',
        _rawFormData: fd,
      }
      ;(['doces', 'salgados', 'bolos'] as CategoryKey[]).forEach(cat => {
        const linhas = Array.isArray(items[cat]) ? items[cat] : []
        for (const line of linhas) {
          out.push({
            ...base,
            itemId: line?.id,
            categoria: cat,
            descricao: String(line?.descricao ?? ''),
            quantidade: String(line?.quantidade ?? ''),
            unidade: String(line?.unidade ?? ''),
          })
        }
      })
    }
    return out
  }

  async function gerarConsolidado() {
    const pedidoIdClean = sanitizeOnlyDigits(pedidoNumero)
    if (pedidoIdClean !== pedidoNumero) setPedidoNumero(pedidoIdClean)
    setLoading(true)
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const filtros = {
      data_inicio: dataInicio.trim() || undefined,
      data_fim: dataFim.trim() || undefined,
      cliente: clienteFiltro.trim() || undefined,
      responsavel: responsavelFiltro.trim() || undefined,
      retirada: retiradaFiltro || undefined,
      pedidoId: pedidoIdClean.trim() || undefined,
    }

    try {
      const apiPedidos = await fetchPedidosConsolidado(filtros, { signal: controller.signal })
      const filtrados = applyLocalFilters(apiPedidos, filtros)
      setRows(flattenPedidos(filtrados))
    } catch (err) {
      console.error('Falhou API, usando fallback localStorage:', err)
      const local = loadPedidosLocal()
      const filtrados = applyLocalFilters(local, filtros)
      setRows(flattenPedidos(filtrados))
      alert(err instanceof Error ? `API indisponível.\n\n${err.message}` : 'API indisponível.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteItem(itemId: number | undefined) {
    if (!itemId) return alert('Item sem ID — não é possível excluir.')
    if (!confirm('Excluir este item? Esta ação não pode ser desfeita.')) return
    try {
      const res = await fetch(`/api/itens/${itemId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      setRows(prev => prev.filter(r => r.itemId !== itemId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir item')
    }
  }

  function handleOpenPopup(row: ConsolidadoRow) {
    if (!row.itemId) return alert('Item sem ID — não é possível editar.')
    setPopupInitialData({ descricao: row.descricao, quantidade: row.quantidade, unidade: row.unidade })
    setPopupItemId(row.itemId)
  }

  function handlePopupSaved(itemId: number, data: PopupItemData) {
    setRows(prev =>
      prev.map(r =>
        r.itemId === itemId
          ? { ...r, descricao: data.descricao, quantidade: data.quantidade, unidade: data.unidade }
          : r,
      ),
    )
  }

  function handleAdicionarSaved(pedidoId: number, itens: NovoItem[]) {
    // Pega a primeira row desse pedido para copiar os dados base
    const base = rows.find(r => r.pedidoId === pedidoId)
    if (!base) return

    const novasRows: ConsolidadoRow[] = itens.map(item => ({
      itemId: undefined, // ainda não temos o ID do backend
      pedidoId: base.pedidoId,
      pedido: base.pedido,
      data: base.data,
      mes: base.mes,
      cliente: base.cliente,
      responsavel: base.responsavel,
      retirada: base.retirada,
      horario: base.horario,
      tamanho: base.tamanho,
      categoria: item.categoria,
      descricao: item.descricao,
      quantidade: item.quantidade,
      unidade: item.unidade,
      _rawFormData: base._rawFormData,
    }))

    setRows(prev => [...prev, ...novasRows])
    setAvisoNumeroPedido(base.pedido)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await gerarConsolidado()
  }

  async function handlePrintClick() {
    await gerarConsolidado()
    setTimeout(() => window.print(), 100)
  }

  function handleClearFilters() {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = null
    setDataInicio('')
    setDataFim('')
    setClienteFiltro('')
    setResponsavelFiltro('')
    setPedidoNumero('')
    setRetiradaFiltro('')
    setRows([])
  }

  return (
    <Layout>
      <Wrapper onSubmit={handleSubmit}>
        <TopPanel>
          <TopRows>
            <TopRow>
              <div>
                <FieldLabel>Data início</FieldLabel>
                <FieldInput type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Data fim</FieldLabel>
                <FieldInput type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Cliente</FieldLabel>
                <FieldInput value={clienteFiltro} onChange={e => setClienteFiltro(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Responsável</FieldLabel>
                <FieldInput value={responsavelFiltro} onChange={e => setResponsavelFiltro(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Número do pedido</FieldLabel>
                <FieldInput
                  value={pedidoNumero}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={e => setPedidoNumero(sanitizeOnlyDigits(e.target.value))}
                />
              </div>
              <div>
                <FieldLabel>Retirada / Entrega</FieldLabel>
                <FieldInput
                  as="select"
                  value={retiradaFiltro}
                  onChange={e => setRetiradaFiltro((e.target.value as any) || '')}
                >
                  <option value="">TODOS</option>
                  <option value="ENTREGA">ENTREGA</option>
                  <option value="RETIRADA">RETIRADA</option>
                </FieldInput>
              </div>
              <div>
                <FieldLabel>&nbsp;</FieldLabel>
                <FieldInput
                  as="button"
                  type="button"
                  onClick={handleClearFilters}
                  disabled={loading}
                  style={{ cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                >
                  Limpar filtros
                </FieldInput>
              </div>
            </TopRow>
          </TopRows>
          <TopBottomRow>
            <GenerateButton type="submit" disabled={loading}>
              {loading ? 'Gerando...' : 'Gerar relação'}
            </GenerateButton>
            <PrintButton type="button" onClick={handlePrintClick} disabled={loading}>
              Imprimir relação
            </PrintButton>
          </TopBottomRow>
        </TopPanel>

        {rows.length > 0 && (
          <div style={{
            background: '#ffffff', borderRadius: 10, padding: 12,
            boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#111827' }}>
                Resumo de Quantidades
              </h3>
              <button
                type="button"
                onClick={() => setShowSummary(!showSummary)}
                style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#111827' }}
              >
                {showSummary ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {showSummary && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                {summaryByCategory.doces.length > 0 && (
                  <div style={{ background: '#fef3c7', borderRadius: 8, padding: 10, border: '2px solid #fbbf24' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#92400e', letterSpacing: '0.08em' }}>🍬 Doces</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {summaryByCategory.doces.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#fffbeb', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600 }}>
                          <span style={{ color: '#78350f' }}>{item.descricao}</span>
                          <span style={{ color: '#92400e', fontWeight: 700 }}>{item.quantidadeTotal} {item.unidade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {summaryByCategory.salgados.length > 0 && (
                  <div style={{ background: '#fee2e2', borderRadius: 8, padding: 10, border: '2px solid #f87171' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#991b1b', letterSpacing: '0.08em' }}>🥐 Salgados</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {summaryByCategory.salgados.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#fef2f2', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600 }}>
                          <span style={{ color: '#7f1d1d' }}>{item.descricao}</span>
                          <span style={{ color: '#991b1b', fontWeight: 700 }}>{item.quantidadeTotal} {item.unidade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {summaryByCategory.bolos.length > 0 && (
                  <div style={{ background: '#ddd6fe', borderRadius: 8, padding: 10, border: '2px solid #a78bfa' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#5b21b6', letterSpacing: '0.08em' }}>🎂 Bolos</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {summaryByCategory.bolos.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#f5f3ff', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600 }}>
                          <span style={{ color: '#4c1d95' }}>{item.descricao}</span>
                          <span style={{ color: '#5b21b6', fontWeight: 700 }}>{item.quantidadeTotal} {item.unidade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <TableSection>
          <TableWrapper>
            <RelacaoTable>
              <RelacaoThead>
                <tr>
                  <RelacaoHeaderNumero>NÚMERO</RelacaoHeaderNumero>
                  <RelacaoHeaderCell>MÊS</RelacaoHeaderCell>
                  <RelacaoHeaderCell>DATA</RelacaoHeaderCell>
                  <RelacaoHeaderCell>CLIENTE</RelacaoHeaderCell>
                  <RelacaoHeaderCell>RESPONSÁVEL</RelacaoHeaderCell>
                  <RelacaoHeaderCell>RETIRADA</RelacaoHeaderCell>
                  <RelacaoHeaderCell>HORÁRIO</RelacaoHeaderCell>
                  <RelacaoHeaderCell>TAMANHO</RelacaoHeaderCell>
                  <RelacaoHeaderCell>CATEGORIA</RelacaoHeaderCell>
                  <RelacaoHeaderCell>DESCRIÇÃO</RelacaoHeaderCell>
                  <RelacaoHeaderCell>QTD</RelacaoHeaderCell>
                  <RelacaoHeaderCell>UN</RelacaoHeaderCell>
                  <RelacaoHeaderCell>AÇÕES</RelacaoHeaderCell>
                </tr>
              </RelacaoThead>
              <RelacaoTbody>
                {rows.map((r, idx) => (
                  <RelacaoRow key={`${r.pedido}-${r.categoria}-${r.descricao}-${idx}`}>
                    <RelacaoCellNumero>{r.pedido}</RelacaoCellNumero>
                    <RelacaoCell>{r.mes}</RelacaoCell>
                    <RelacaoCell>{formatDateToBR(r.data)}</RelacaoCell>
                    <RelacaoCell>{r.cliente}</RelacaoCell>
                    <RelacaoCell>{r.responsavel}</RelacaoCell>
                    <RelacaoCell>{r.retirada}</RelacaoCell>
                    <RelacaoCell>{r.horario}</RelacaoCell>
                    <RelacaoCell>{r.tamanho}</RelacaoCell>
                    <RelacaoCell>{r.categoria.toUpperCase()}</RelacaoCell>
                    <RelacaoCell>{r.descricao}</RelacaoCell>
                    <RelacaoCell>{r.quantidade}</RelacaoCell>
                    <RelacaoCell>{r.unidade}</RelacaoCell>
                    <RelacaoCell>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {/* botão + adicionar item ao pedido */}
                        <button
                          type="button"
                          onClick={() => setPopupAdicionar({ pedidoId: r.pedidoId, numeroPedido: r.pedido })}
                          title="Adicionar itens ao pedido"
                          style={{
                            background: '#f0fdf4', border: '1.5px solid #22c55e', borderRadius: 6,
                            padding: '2px 7px', fontWeight: 700, fontSize: '0.82rem',
                            cursor: 'pointer', color: '#15803d', lineHeight: 1,
                          }}
                        >
                          +
                        </button>
                        {/* botão editar item */}
                        <button
                          type="button"
                          onClick={() => handleOpenPopup(r)}
                          title="Editar item"
                          style={{
                            background: '#f97316', border: 'none', borderRadius: 6,
                            padding: '2px 8px', fontWeight: 700, fontSize: '0.75rem',
                            cursor: 'pointer', color: '#111827',
                          }}
                        >
                          ✏️
                        </button>
                        {/* botão excluir item */}
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(r.itemId)}
                          title="Excluir item"
                          style={{
                            background: '#fee2e2', border: 'none', borderRadius: 6,
                            padding: '2px 8px', fontWeight: 700, fontSize: '0.75rem',
                            cursor: 'pointer', color: '#dc2626',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </RelacaoCell>
                  </RelacaoRow>
                ))}
              </RelacaoTbody>
            </RelacaoTable>
          </TableWrapper>
        </TableSection>
      </Wrapper>

      {/* popup editar item existente */}
      {popupItemId !== null && popupInitialData !== null && (
        <Popup
          itemId={popupItemId}
          initialData={popupInitialData}
          onClose={() => { setPopupItemId(null); setPopupInitialData(null) }}
          onSaved={handlePopupSaved}
        />
      )}

      {/* popup adicionar itens ao pedido */}
      {popupAdicionar !== null && (
        <PopupAdicionarItem
          pedidoId={popupAdicionar.pedidoId}
          numeroPedido={popupAdicionar.numeroPedido}
          onClose={() => setPopupAdicionar(null)}
          onSaved={handleAdicionarSaved}
        />
      )}

      {/* aviso de ajuste de preço */}
      {avisoNumeroPedido !== null && (
        <AvisoPreco
          numeroPedido={avisoNumeroPedido}
          onClose={() => setAvisoNumeroPedido(null)}
        />
      )}
    </Layout>
  )
}