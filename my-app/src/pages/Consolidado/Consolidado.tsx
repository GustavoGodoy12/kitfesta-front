import { useRef, useState, type FormEvent } from 'react'
import Layout from '../../layout/Layout'
import {
  Wrapper,
  TopPanel,
  TopRows,
  TopRow,
  FieldLabel,
  FieldInput,
  DayBadge,
  TopBottomRow,
  GenerateButton,
  PrintButton,
  TableSection,
  TableWrapper,
  RelacaoTable,
  RelacaoThead,
  RelacaoHeaderCell,
  RelacaoHeaderNumero,
  RelacaoTbody,
  RelacaoRow,
  RelacaoCell,
  RelacaoCellNumero,
} from './Consolidado.styled'

import { fetchPedidosConsolidado, type Pedido } from '../../services/consolidado'

const STORAGE_KEY = 'sisteminha-pedidos'

type CategoryKey = 'doces' | 'salgados' | 'bolos'

type ConsolidadoRow = {
  pedido: string
  data: string
  mes: string
  cliente: string
  responsavel: string
  retirada: string
  horario: string
  categoria: CategoryKey
  descricao: string
  quantidade: string
  unidade: string
}

function sanitizeOnlyDigits(raw: string) {
  return raw.replace(/\D/g, '')
}

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
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  if (!year || !month || !day) return ''
  const d = new Date(year, month - 1, day)
  const dias = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO']
  return dias[d.getDay()] ?? ''
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
    if (!Array.isArray(parsed)) return []
    return parsed as Pedido[]
  } catch {
    return []
  }
}

function applyLocalFilters(
  pedidos: Pedido[],
  filters: {
    data?: string
    cliente?: string
    responsavel?: string
    retirada?: string
    horario?: string
    pedidoId?: string
  },
): Pedido[] {
  const fData = filters.data?.trim()
  const fCliente = filters.cliente?.trim().toLowerCase()
  const fResp = filters.responsavel?.trim().toLowerCase()
  const fRet = filters.retirada?.trim().toLowerCase()
  const fHora = filters.horario?.trim()
  const fPedido = filters.pedidoId?.trim()

  return pedidos.filter(p => {
    const fd = p.formData || ({} as any)
    const okData = !fData || fd.data === fData
    const okCliente = !fCliente || String(fd.cliente ?? '').toLowerCase().includes(fCliente)
    const okResp = !fResp || String(fd.responsavel ?? '').toLowerCase().includes(fResp)
    const okRet = !fRet || String(fd.retirada ?? '').toLowerCase().includes(fRet)
    const okHora = !fHora || String(fd.horario ?? '').startsWith(fHora)
    const okPedido =
      !fPedido ||
      String(fd.pedidoId ?? '').trim() === fPedido ||
      String(p.id) === fPedido

    return okData && okCliente && okResp && okRet && okHora && okPedido
  })
}

export default function Consolidado() {
  const [dataFiltro, setDataFiltro] = useState('')
  const [clienteFiltro, setClienteFiltro] = useState('')
  const [responsavelFiltro, setResponsavelFiltro] = useState('')
  const [pedidoNumero, setPedidoNumero] = useState('')
  const [horarioFiltro, setHorarioFiltro] = useState('')
  const [retiradaFiltro, setRetiradaFiltro] = useState<'' | 'ENTREGA' | 'RETIRADA'>('')

  const [rows, setRows] = useState<ConsolidadoRow[]>([])
  const [loading, setLoading] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  const dayLabel = getDayLabel(dataFiltro)

  function flattenPedidos(pedidos: Pedido[]): ConsolidadoRow[] {
    const out: ConsolidadoRow[] = []

    for (const p of pedidos) {
      const fd = p.formData || ({} as any)
      const pedidoId = String(fd.pedidoId || p.id || '')
      const mes = getMonthLabelFromISO(fd.data)
      const items = p.items || ({} as any)

      const base = {
        pedido: pedidoId,
        data: fd.data || '',
        mes,
        cliente: fd.cliente || '',
        responsavel: fd.responsavel || '',
        retirada: fd.retirada || '',
        horario: fd.horario || '',
      }

      ;(['doces', 'salgados', 'bolos'] as CategoryKey[]).forEach(cat => {
        const linhas = Array.isArray(items[cat]) ? items[cat] : []
        for (const line of linhas) {
          out.push({
            ...base,
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
      data: dataFiltro.trim() || undefined,
      cliente: clienteFiltro.trim() || undefined,
      responsavel: responsavelFiltro.trim() || undefined,
      retirada: retiradaFiltro || undefined,
      horario: horarioFiltro.trim() || undefined,
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

      alert(
        err instanceof Error
          ? `API indisponível. Mostrando dados locais.\n\n${err.message}`
          : 'API indisponível. Mostrando dados locais.',
      )
    } finally {
      setLoading(false)
    }
  }

  // ✅ ENTER = submit = gerar (NÃO imprime)
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await gerarConsolidado()
  }

  // ✅ imprimir só no clique
  async function handlePrintClick() {
    await gerarConsolidado()
    setTimeout(() => window.print(), 100)
  }

  function handleClearFilters() {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = null

    setDataFiltro('')
    setClienteFiltro('')
    setResponsavelFiltro('')
    setPedidoNumero('')
    setHorarioFiltro('')
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
                <FieldLabel>Cliente</FieldLabel>
                <FieldInput value={clienteFiltro} onChange={e => setClienteFiltro(e.target.value)} />
              </div>

              <div>
                <FieldLabel>Responsável</FieldLabel>
                <FieldInput
                  value={responsavelFiltro}
                  onChange={e => setResponsavelFiltro(e.target.value)}
                />
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
                <FieldLabel>Horário</FieldLabel>
                <FieldInput
                  type="time"
                  value={horarioFiltro}
                  onChange={e => setHorarioFiltro(e.target.value)}
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

              {/* ✅ no lugar do “Total de linhas” */}
              <div>
                <FieldLabel>&nbsp;</FieldLabel>
                <FieldInput
                  as="button"
                  type="button"
                  onClick={handleClearFilters}
                  disabled={loading}
                  style={{
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Limpar filtros
                </FieldInput>
              </div>
            </TopRow>
          </TopRows>

          <TopBottomRow>
            {/* ✅ submit => Enter e clique aplicam filtro */}
            <GenerateButton type="submit" disabled={loading}>
              {loading ? 'Gerando...' : 'Gerar relação'}
            </GenerateButton>

            {/* ✅ imprimir só no clique */}
            <PrintButton type="button" onClick={handlePrintClick} disabled={loading}>
              Imprimir relação
            </PrintButton>
          </TopBottomRow>
        </TopPanel>

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
                  <RelacaoHeaderCell>CATEGORIA</RelacaoHeaderCell>
                  <RelacaoHeaderCell>DESCRIÇÃO</RelacaoHeaderCell>
                  <RelacaoHeaderCell>QTD</RelacaoHeaderCell>
                  <RelacaoHeaderCell>UN</RelacaoHeaderCell>
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
                    <RelacaoCell>{r.categoria.toUpperCase()}</RelacaoCell>
                    <RelacaoCell>{r.descricao}</RelacaoCell>
                    <RelacaoCell>{r.quantidade}</RelacaoCell>
                    <RelacaoCell>{r.unidade}</RelacaoCell>
                  </RelacaoRow>
                ))}
              </RelacaoTbody>
            </RelacaoTable>
          </TableWrapper>
        </TableSection>
      </Wrapper>
    </Layout>
  )
}
