import { useState, type FormEvent } from 'react'
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

const STORAGE_KEY = 'sisteminha-pedidos'

type CategoryKey = 'doces' | 'salgados' | 'bolos'

type ItemLine = {
  descricao: string
  quantidade: string
  unidade: string
}

type ItemsByCategory = Record<CategoryKey, ItemLine[]>

type FormData = {
  pedidoId?: string
  responsavel: string
  cliente: string
  revendedor: string
  telefone: string
  retirada: string
  data: string
  horario: string
  enderecoEntrega: string
  precoTotal: string
  tipoPagamento?: string
}

type Pedido = {
  id: number
  formData: FormData
  items: ItemsByCategory
}

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

function loadPedidos(): Pedido[] {
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
    const n = Number(line.quantidade.replace(',', '.'))
    return sum + (Number.isNaN(n) ? 0 : n)
  }, 0)
}

export default function Relacao() {
  const [dataFiltro, setDataFiltro] = useState('')
  const [pedidos, setPedidos] = useState<Pedido[]>([])

  function gerarRelacao() {
    const todos = loadPedidos()
    const filtrados =
      dataFiltro.trim() === ''
        ? todos
        : todos.filter(p => p.formData?.data === dataFiltro.trim())
    setPedidos(filtrados)
  }

  function handleGerarClick() {
    gerarRelacao()
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    gerarRelacao()
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
            <GenerateButton type="button" onClick={handleGerarClick}>
              Gerar relação
            </GenerateButton>
            <PrintButton type="submit">Imprimir relação</PrintButton>
          </TopBottomRow>
        </TopPanel>

        {/* TABELA DA RELAÇÃO */}
        <TableSection>
          <TableWrapper>
            <RelacaoTable>
              <RelacaoThead>
                <tr>
                  <RelacaoHeaderCell>PEDIDO</RelacaoHeaderCell>
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
                  } = p.formData || {}

                  const totalDoces = computeTotalCategory(p.items, 'doces')
                  const totalSalgados = computeTotalCategory(p.items, 'salgados')
                  const totalBolos = computeTotalCategory(p.items, 'bolos')

                  return (
                    <RelacaoRow key={id}>
                      <RelacaoCell>{id}</RelacaoCell>
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
