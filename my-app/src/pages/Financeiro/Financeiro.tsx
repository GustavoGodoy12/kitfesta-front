import { useState, useEffect } from 'react'
import Layout from '../../layout/Layout'
import {
  Wrapper, FiltersPanel, FilterField, FilterLabel, FilterInput,
  FilterSelect, FilterButton, ClearButton, CardsGrid, SummaryCard,
  CardLabel, CardValue, CardSub, ChartsRow, ChartCard, ChartTitle,
  TableCard, TableTitle, TableWrapper, Table, Thead, Th, Tbody,
  Tr, Td, TdNumero, TdValor, Badge, EmptyState,
} from './Financeiro.styled'

type Pedido = {
  id: number
  formData: {
    pedidoId?: string
    cliente?: string
    responsavel?: string
    revendedor?: string
    telefone?: string
    retirada?: string
    data?: string
    horario?: string
    endereco_entrega?: string
    preco_total?: string
    taxa_entrega?: string
    tipo_pagamento?: string
    tamanho?: string
    entregue?: boolean
  }
}

type Resumo = {
  totalFaturado: number
  totalTaxas: number
  totalPedidos: number
  ticketMedio: number
  totalEntregues: number
  totalPendentes: number
  totalRetirada: number
}

type ChartBarItem = { label: string; value: number; color: string }

const CORES_PAGAMENTO: Record<string, string> = {
  PIX: '#10b981',
  QRCODE: '#6366f1',
  DÉBITO: '#3b82f6',
  CRÉDITO: '#8b5cf6',
  DINHEIRO: '#f59e0b',
  GUIA: '#ec4899',
  NOTA: '#14b8a6',
  VALE: '#f97316',
  VOUCHER: '#64748b',
}

function parsePreco(raw?: string): number {
  if (!raw) return 0
  const clean = raw.replace(/[^\d,]/g, '').replace(',', '.')
  const n = parseFloat(clean)
  return Number.isFinite(n) ? n : 0
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateToBR(dateStr?: string): string {
  if (!dateStr) return ''
  if (dateStr.includes('/')) return dateStr
  const [year, month, day] = dateStr.split('-')
  if (!year || !month || !day) return dateStr
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
}

function BarChart({ data, height = 140 }: { data: ChartBarItem[]; height?: number }) {
  if (!data.length) return <EmptyState>Sem dados</EmptyState>
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, paddingTop: 8 }}>
      {data.map((item, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#374151' }}>
            {item.value > 999 ? `${(item.value / 1000).toFixed(1)}k` : item.value}
          </span>
          <div style={{
            width: '100%', background: item.color, borderRadius: '4px 4px 0 0',
            height: `${Math.max((item.value / max) * (height - 36), 4)}px`,
            transition: 'height 0.4s ease',
          }} />
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#6b7280', textAlign: 'center', lineHeight: 1.2 }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function PieChart({ data }: { data: ChartBarItem[] }) {
  if (!data.length) return <EmptyState>Sem dados</EmptyState>
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <EmptyState>Sem dados</EmptyState>
  let cumulative = 0
  const slices = data.map(d => {
    const pct = d.value / total
    const start = cumulative
    cumulative += pct
    return { ...d, start, pct }
  })
  const size = 120, cx = size / 2, cy = size / 2, r = size / 2 - 8
  function polarToCartesian(pct: number) {
    const angle = pct * 2 * Math.PI - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {slices.map((slice, i) => {
          if (slice.pct === 0) return null
          if (slice.pct >= 1) return <circle key={i} cx={cx} cy={cy} r={r} fill={slice.color} />
          const start = polarToCartesian(slice.start)
          const end = polarToCartesian(slice.start + slice.pct)
          const largeArc = slice.pct > 0.5 ? 1 : 0
          return (
            <path key={i}
              d={`M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`}
              fill={slice.color}
            />
          )
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {slices.map((slice, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: slice.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>
              {slice.label} — {(slice.pct * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Financeiro() {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [clienteFiltro, setClienteFiltro] = useState('')
  const [tipoPagFiltro, setTipoPagFiltro] = useState('')
  const [retiradaFiltro, setRetiradaFiltro] = useState('')
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(false)
  const [buscou, setBuscou] = useState(false)

  useEffect(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    setDataInicio(`${y}-${m}-01`)
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate()
    setDataFim(`${y}-${m}-${String(lastDay).padStart(2, '0')}`)
  }, [])

  async function buscar() {
    setLoading(true)
    setBuscou(true)
    try {
      const params = new URLSearchParams()
      if (dataInicio) params.set('data_inicio', dataInicio)
      if (dataFim) params.set('data_fim', dataFim)
      if (clienteFiltro) params.set('cliente', clienteFiltro)
      if (tipoPagFiltro) params.set('tipo_pagamento', tipoPagFiltro)
      if (retiradaFiltro) params.set('retirada', retiradaFiltro)

      const res = await fetch(`/api/pedidos?${params.toString()}`)
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const json = await res.json()

      const raw: any[] = Array.isArray(json?.pedidos) ? json.pedidos : Array.isArray(json) ? json : []

      const lista: Pedido[] = raw.map(p => ({
        id: p.id,
        formData: {
          pedidoId: String(p.formData?.pedidoId ?? p.id ?? ''),
          cliente: p.formData?.cliente || '',
          responsavel: p.formData?.responsavel || '',
          revendedor: p.formData?.revendedor || '',
          telefone: p.formData?.telefone || '',
          retirada: p.formData?.retirada || '',
          data: p.formData?.data || '',
          horario: p.formData?.horario || '',
          endereco_entrega: p.formData?.endereco_entrega || '',
          preco_total: p.formData?.preco_total || '',
          taxa_entrega: p.formData?.taxa_entrega || '',
          tipo_pagamento: p.formData?.tipo_pagamento || '',
          tamanho: p.formData?.tamanho || '',
          entregue: Boolean(p.formData?.entregue),
        },
      }))

      setPedidos(lista)
    } catch (err) {
      console.error(err)
      alert('Erro ao buscar dados financeiros.')
    } finally {
      setLoading(false)
    }
  }

  function limpar() {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    setDataInicio(`${y}-${m}-01`)
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate()
    setDataFim(`${y}-${m}-${String(lastDay).padStart(2, '0')}`)
    setClienteFiltro('')
    setTipoPagFiltro('')
    setRetiradaFiltro('')
    setPedidos([])
    setBuscou(false)
  }

  // MÉTRICAS
  const resumo: Resumo = pedidos.reduce<Resumo>((acc, p) => {
    const valor = parsePreco(p.formData.preco_total)
    const taxa = parsePreco(p.formData.taxa_entrega)
    acc.totalFaturado += valor
    acc.totalTaxas += taxa
    acc.totalPedidos += 1
    if (p.formData.entregue) acc.totalEntregues += 1
    else acc.totalPendentes += 1
    if (p.formData.retirada === 'RETIRADA') acc.totalRetirada += 1
    return acc
  }, { totalFaturado: 0, totalTaxas: 0, totalPedidos: 0, ticketMedio: 0, totalEntregues: 0, totalPendentes: 0, totalRetirada: 0 })
  resumo.ticketMedio = resumo.totalPedidos > 0 ? resumo.totalFaturado / resumo.totalPedidos : 0

  // GRÁFICO POR DIA
  const porDia = pedidos.reduce<Record<string, number>>((acc, p) => {
    const d = p.formData.data ?? ''
    if (!d) return acc
    acc[d] = (acc[d] ?? 0) + parsePreco(p.formData.preco_total)
    return acc
  }, {})
  const porDiaData: ChartBarItem[] = Object.entries(porDia)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, value]) => ({
      label: date.slice(5).replace('-', '/'),
      value: Math.round(value),
      color: '#f97316',
    }))

  // GRÁFICO POR TIPO DE PAGAMENTO
  const porPagamento = pedidos.reduce<Record<string, number>>((acc, p) => {
    const tipo = p.formData.tipo_pagamento || 'NÃO INFORMADO'
    acc[tipo] = (acc[tipo] ?? 0) + 1
    return acc
  }, {})
  const porPagamentoData: ChartBarItem[] = Object.entries(porPagamento)
    .sort(([, a], [, b]) => b - a)
    .map(([label, value]) => ({ label, value, color: CORES_PAGAMENTO[label] ?? '#94a3b8' }))

  // GRÁFICO POR CLIENTE
  const porCliente = pedidos.reduce<Record<string, number>>((acc, p) => {
    const c = p.formData.cliente || 'NÃO INFORMADO'
    acc[c] = (acc[c] ?? 0) + parsePreco(p.formData.preco_total)
    return acc
  }, {})
  const porClienteData: ChartBarItem[] = Object.entries(porCliente)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([label, value], i) => ({
      label, value: Math.round(value),
      color: ['#f97316','#10b981','#6366f1','#3b82f6','#ec4899','#f59e0b','#14b8a6','#8b5cf6'][i % 8],
    }))

  const TIPOS_PAGAMENTO = ['QRCODE','PIX','DÉBITO','CRÉDITO','DINHEIRO','GUIA','NOTA','VALE','VOUCHER']

  return (
    <Layout>
      <Wrapper>
        <FiltersPanel>
          <FilterField>
            <FilterLabel>Data início</FilterLabel>
            <FilterInput type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
          </FilterField>
          <FilterField>
            <FilterLabel>Data fim</FilterLabel>
            <FilterInput type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
          </FilterField>
          <FilterField>
            <FilterLabel>Cliente</FilterLabel>
            <FilterInput placeholder="Todos" value={clienteFiltro} onChange={e => setClienteFiltro(e.target.value)} />
          </FilterField>
          <FilterField>
            <FilterLabel>Tipo pagamento</FilterLabel>
            <FilterSelect value={tipoPagFiltro} onChange={e => setTipoPagFiltro(e.target.value)}>
              <option value="">Todos</option>
              {TIPOS_PAGAMENTO.map(t => <option key={t} value={t}>{t}</option>)}
            </FilterSelect>
          </FilterField>
          <FilterField>
            <FilterLabel>Retirada / Entrega</FilterLabel>
            <FilterSelect value={retiradaFiltro} onChange={e => setRetiradaFiltro(e.target.value)}>
              <option value="">Todos</option>
              <option value="ENTREGA">ENTREGA</option>
              <option value="RETIRADA">RETIRADA</option>
            </FilterSelect>
          </FilterField>
          <FilterButton onClick={buscar} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </FilterButton>
          <ClearButton type="button" onClick={limpar} disabled={loading}>
            Limpar
          </ClearButton>
        </FiltersPanel>

        {buscou && (
          <>
            <CardsGrid>
              <SummaryCard $color="#f97316">
                <CardLabel>Total faturado</CardLabel>
                <CardValue $color="#f97316">{formatBRL(resumo.totalFaturado)}</CardValue>
                <CardSub>{resumo.totalPedidos} pedidos</CardSub>
              </SummaryCard>
              <SummaryCard $color="#10b981">
                <CardLabel>Ticket médio</CardLabel>
                <CardValue $color="#10b981">{formatBRL(resumo.ticketMedio)}</CardValue>
                <CardSub>por pedido</CardSub>
              </SummaryCard>
              <SummaryCard $color="#3b82f6">
                <CardLabel>Total pedidos</CardLabel>
                <CardValue>{resumo.totalPedidos}</CardValue>
                <CardSub>{resumo.totalRetirada} retiradas</CardSub>
              </SummaryCard>
              <SummaryCard $color="#14b8a6">
                <CardLabel>Taxa de entrega</CardLabel>
                <CardValue $color="#14b8a6">{formatBRL(resumo.totalTaxas)}</CardValue>
                <CardSub>{pedidos.filter(p => parsePreco(p.formData.taxa_entrega) > 0).length} pedidos com taxa</CardSub>
              </SummaryCard>
              <SummaryCard $color="#16a34a">
                <CardLabel>Entregues</CardLabel>
                <CardValue $color="#16a34a">{resumo.totalEntregues}</CardValue>
                <CardSub>{resumo.totalPendentes} pendentes</CardSub>
              </SummaryCard>
            </CardsGrid>

            <ChartsRow>
              <ChartCard>
                <ChartTitle>Faturamento por dia</ChartTitle>
                <BarChart data={porDiaData} height={160} />
              </ChartCard>
              <ChartCard>
                <ChartTitle>Pedidos por tipo de pagamento</ChartTitle>
                <PieChart data={porPagamentoData} />
              </ChartCard>
            </ChartsRow>

            <ChartsRow>
              <ChartCard>
                <ChartTitle>Faturamento por cliente (top 8)</ChartTitle>
                <BarChart data={porClienteData} height={160} />
              </ChartCard>
              <ChartCard>
                <ChartTitle>Distribuição entregues vs pendentes</ChartTitle>
                <PieChart data={[
                  { label: 'Entregues', value: resumo.totalEntregues, color: '#10b981' },
                  { label: 'Pendentes', value: resumo.totalPendentes, color: '#f97316' },
                ]} />
              </ChartCard>
            </ChartsRow>

            <TableCard>
              <TableTitle>Pedidos — {pedidos.length} resultado{pedidos.length !== 1 ? 's' : ''}</TableTitle>
              <TableWrapper>
                <Table>
                  <Thead>
                    <tr>
                      <Th>Nº</Th>
                      <Th>Data</Th>
                      <Th>Cliente</Th>
                      <Th>Responsável</Th>
                      <Th>Revendedor</Th>
                      <Th>Retirada</Th>
                      <Th>Horário</Th>
                      <Th>Tamanho</Th>
                      <Th>Pagamento</Th>
                      <Th>Valor</Th>
                      <Th>Taxa entrega</Th>
                      <Th>Status</Th>
                    </tr>
                  </Thead>
                  <Tbody>
                    {pedidos.length === 0 ? (
                      <tr>
                        <td colSpan={12}>
                          <EmptyState>Nenhum pedido encontrado</EmptyState>
                        </td>
                      </tr>
                    ) : (
                      pedidos.map(p => {
                        const f = p.formData
                        const valor = parsePreco(f.preco_total)
                        const taxa = parsePreco(f.taxa_entrega)
                        const tipoCor = CORES_PAGAMENTO[f.tipo_pagamento ?? ''] ?? '#94a3b8'
                        return (
                          <Tr key={p.id} $entregue={f.entregue}>
                            <TdNumero>{f.pedidoId || p.id}</TdNumero>
                            <Td>{formatDateToBR(f.data)}</Td>
                            <Td>{f.cliente || ''}</Td>
                            <Td>{f.responsavel || ''}</Td>
                            <Td>{f.revendedor || ''}</Td>
                            <Td>{f.retirada || ''}</Td>
                            <Td>{f.horario || ''}</Td>
                            <Td>{f.tamanho || ''}</Td>
                            <Td>
                              {f.tipo_pagamento ? (
                                <Badge $color={tipoCor}>{f.tipo_pagamento}</Badge>
                              ) : ''}
                            </Td>
                            <TdValor>{valor > 0 ? formatBRL(valor) : ''}</TdValor>
                            <Td style={{ color: taxa > 0 ? '#14b8a6' : '#9ca3af', fontWeight: taxa > 0 ? 800 : 400 }}>
                              {taxa > 0 ? formatBRL(taxa) : '—'}
                            </Td>
                            <Td>
                              <Badge $color={f.entregue ? '#10b981' : '#f97316'}>
                                {f.entregue ? 'ENTREGUE' : 'PENDENTE'}
                              </Badge>
                            </Td>
                          </Tr>
                        )
                      })
                    )}
                  </Tbody>
                </Table>
              </TableWrapper>
            </TableCard>
          </>
        )}

        {!buscou && (
          <EmptyState style={{ marginTop: 40 }}>
            Selecione os filtros e clique em <strong>Buscar</strong> para carregar os dados financeiros.
          </EmptyState>
        )}
      </Wrapper>
    </Layout>
  )
}