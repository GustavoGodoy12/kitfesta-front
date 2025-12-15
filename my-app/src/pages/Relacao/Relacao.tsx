import { useState, type FormEvent, useRef } from 'react'
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
} from './Relacao.styled'

import { fetchPedidosByData, type Pedido } from '../../services/relacao'

const STORAGE_KEY = 'sisteminha-pedidos'

type CategoryKey = 'doces' | 'salgados' | 'bolos'
type ItemsByCategory = Record<CategoryKey, { descricao: string; quantidade: string; unidade: string }[]>

// formata "2025-03-26" -> "26/03/2025"
function formatDateToBR(dateStr?: string): string {
  if (!dateStr) return ''
  if (dateStr.includes('/')) return dateStr
  const [year, month, day] = dateStr.split('-')
  if (!year || !month || !day) return dateStr
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
}

// evita o bug de fuso horário criando Date com (ano, mes-1, dia)
function getDayLabel(dateStr?: string) {
  if (!dateStr) return ''
  const [yearStr, monthStr, dayStr] = dateStr.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  if (!year || !month || !day) return ''
  const d = new Date(year, month - 1, day)
  const dias = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO']
  const idx = d.getDay()
  return dias[idx] ?? ''
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

  const abortRef = useRef<AbortController | null>(null)

  async function gerarRelacao() {
    setLoading(true)

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      // ✅ API (GET /pedidos?data=YYYY-MM-DD) — se dataFiltro vazio, busca tudo
      const apiPedidos = await fetchPedidosByData(dataFiltro, { signal: controller.signal })
      setPedidos(apiPedidos)
      return
    } catch (err) {
      console.error('Falhou API, usando fallback localStorage:', err)

      // fallback localStorage
      const todos = loadPedidosLocal()
      const filtrados =
        dataFiltro.trim() === ''
          ? todos
          : todos.filter(p => p.formData?.data === dataFiltro.trim())

      setPedidos(filtrados)

      alert(
        err instanceof Error
          ? `API indisponível. Mostrando dados locais.\n\n${err.message}`
          : 'API indisponível. Mostrando dados locais.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleGerarClick() {
    await gerarRelacao()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await gerarRelacao()

    setTimeout(() => {
      window.print()
    }, 100)
  }

  const dayLabel = getDayLabel(dataFiltro)

  return (
    <Layout>
      <Wrapper onSubmit={handleSubmit}>
        {/* TOPO – filtro por data + botões */}
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
            </TopRow>
          </TopRows>

          <TopBottomRow>
            <GenerateButton type="button" onClick={handleGerarClick} disabled={loading}>
              {loading ? 'Gerando...' : 'Gerar relação'}
            </GenerateButton>
            <PrintButton type="submit" disabled={loading}>
              Imprimir relação
            </PrintButton>
          </TopBottomRow>
        </TopPanel>

        {/* TABELA DA RELAÇÃO */}
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
                  <RelacaoHeaderCell>HORÁRIO ENTREGA OU RETIRADA</RelacaoHeaderCell>
                  <RelacaoHeaderCell>VALOR</RelacaoHeaderCell>
                  <RelacaoHeaderCell>REVENDEDOR</RelacaoHeaderCell>
                  <RelacaoHeaderCell>TIPO PAGAMENTO</RelacaoHeaderCell>
                  <RelacaoHeaderCell>ENTREGA</RelacaoHeaderCell>
                  <RelacaoHeaderCell>DOCE</RelacaoHeaderCell>
                  <RelacaoHeaderCell>SALG</RelacaoHeaderCell>
                  <RelacaoHeaderCell>BOLO</RelacaoHeaderCell>
                </tr>
              </RelacaoThead>

              <RelacaoTbody>
                {pedidos.map(p => {
                  const id = p.id
                  const {
                    pedidoId,
                    data,
                    horario,
                    telefone,
                    cliente,
                    precoTotal,
                    revendedor,
                    tipoPagamento,
                    retirada,
                  } = p.formData || ({} as any)

                  const totalDoces = computeTotalCategory(p.items as any, 'doces')
                  const totalSalgados = computeTotalCategory(p.items as any, 'salgados')
                  const totalBolos = computeTotalCategory(p.items as any, 'bolos')

                  return (
                    <RelacaoRow key={id}>
                      <RelacaoCell>{cliente || ''}</RelacaoCell>
                      <RelacaoCell>{formatDateToBR(data) || ''}</RelacaoCell>
                      <RelacaoCellNumero>{pedidoId || id}</RelacaoCellNumero>
                      <RelacaoCell>{telefone || ''}</RelacaoCell>
                      <RelacaoCell>{cliente || ''}</RelacaoCell>
                      <RelacaoCell>{horario || ''}</RelacaoCell>
                      <RelacaoCell>{precoTotal || ''}</RelacaoCell>
                      <RelacaoCell>{revendedor || ''}</RelacaoCell>
                      <RelacaoCell>{tipoPagamento || ''}</RelacaoCell>
                      <RelacaoCell>{retirada || ''}</RelacaoCell>
                      <RelacaoCell>{totalDoces || ''}</RelacaoCell>
                      <RelacaoCell>{totalSalgados || ''}</RelacaoCell>
                      <RelacaoCell>{totalBolos || ''}</RelacaoCell>
                    </RelacaoRow>
                  )
                })}
              </RelacaoTbody>
            </RelacaoTable>
          </TableWrapper>
        </TableSection>
      </Wrapper>
    </Layout>
  )
}
