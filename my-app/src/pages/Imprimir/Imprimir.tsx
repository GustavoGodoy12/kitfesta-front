import { useState, type FormEvent, type KeyboardEvent } from 'react'
import Layout from '../../layout/Layout'
import {
  Wrapper,
  TopPanel,
  TopRows,
  TopRow,
  FieldLabel,
  FieldInput,
  TopBottomRow,
  PrintButton,
  SearchButton,
  CardsSection,
  CategoryGrid,
  CategoryCard,
  CategoryHeader,
  CategoryDay,
  CategoryNumber,
  CategoryTitle,
  CategoryMeta,
  MetaRow,
  MetaLabel,
  MetaValue,
  CategoryBodyPrint,
  ItemsGrid,
  ItemsColumn,
  ItemRow,
  ItemText,
  ItemQtyText,
  ItemUnitText,
  CommentsArea,
  CommentsLabel,
  CommentsBox,
  PrintStyles,
} from './Imprimir.styled'

const STORAGE_KEY = 'sisteminha-pedidos'
const INITIAL_LINES = 10

type CategoryKey = 'doces' | 'salgados' | 'bolos'

type ItemLine = {
  descricao: string
  quantidade: string
  unidade: string
}

type ItemsByCategory = Record<CategoryKey, ItemLine[]>
type CategoryComments = Record<CategoryKey, string>

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
}

type Pedido = {
  id: number
  formData: FormData
  items: ItemsByCategory
  comments?: CategoryComments
}

function computeTotal(category: CategoryKey, items?: ItemsByCategory) {
  if (!items) return 0
  return items[category].reduce((sum, line) => {
    const n = Number(line.quantidade.replace(',', '.'))
    return sum + (Number.isNaN(n) ? 0 : n)
  }, 0)
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
  if (!dateStr) return 'SÁBADO'
  const [yearStr, monthStr, dayStr] = dateStr.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  if (!year || !month || !day) return 'SÁBADO'
  const d = new Date(year, month - 1, day)
  const dias = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO']
  const idx = d.getDay()
  return dias[idx] ?? 'SÁBADO'
}

function findPedidoByNumero(numero: string): Pedido | null {
  if (!numero) return null

  let pedidos: Pedido[] = []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) pedidos = JSON.parse(raw)
  } catch {
    pedidos = []
  }

  const idNumber = Number(numero)
  if (!Number.isFinite(idNumber)) return null

  const encontrado =
    pedidos.find(p => Number(p.id) === idNumber) ||
    pedidos.find(p => Number(p.formData?.pedidoId) === idNumber)

  return encontrado || null
}

export default function Imprimir() {
  const [pedidoNumero, setPedidoNumero] = useState('')
  const [pedido, setPedido] = useState<Pedido | null>(null)

  function carregarPedido() {
    if (!pedidoNumero) {
      alert('Informe o número do pedido para buscar.')
      return
    }

    const encontrado = findPedidoByNumero(pedidoNumero)

    if (!encontrado) {
      alert(`Pedido ${pedidoNumero} não encontrado no mock.`)
      setPedido(null)
      return
    }

    setPedido(encontrado)
  }

  function handleBuscarClick() {
    carregarPedido()
  }

  function handleNumeroKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
      e.preventDefault()
      carregarPedido()
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!pedidoNumero) {
      alert('Informe o número do pedido para imprimir.')
      return
    }

    const encontrado = findPedidoByNumero(pedidoNumero)

    if (!encontrado) {
      alert(`Pedido ${pedidoNumero} não encontrado no mock.`)
      return
    }

    setPedido(encontrado)

    setTimeout(() => {
      window.print()
    }, 100)
  }

  const categorias = [
    { key: 'doces' as CategoryKey, title: 'DOCES' },
    { key: 'salgados' as CategoryKey, title: 'SALGADOS' },
    { key: 'bolos' as CategoryKey, title: 'BOLO' },
  ]

  const rawDate = pedido?.formData.data
  const dayLabel = getDayLabel(rawDate)
  const dataPedido = formatDateToBR(rawDate) || '00/00/0000'
  const horaPedido = pedido?.formData.horario || '00:00'
  const retirada = pedido?.formData.retirada || '-'
  const cliente = pedido?.formData.cliente || '-'
  const responsavel = pedido?.formData.responsavel || '-'
  const endereco = pedido?.formData.enderecoEntrega || '-'
  const telefone = pedido?.formData.telefone || '-'

  const idParaMostrar =
    pedido?.formData.pedidoId ||
    (pedido?.id != null ? String(pedido.id) : '') ||
    pedidoNumero

  return (
    <Layout>
      <PrintStyles />

      <Wrapper onSubmit={handleSubmit}>
        <TopPanel>
          <TopRows>
            <TopRow>
              <div>
                <FieldLabel>Número do pedido</FieldLabel>
                <FieldInput
                  value={pedidoNumero}
                  onChange={e => setPedidoNumero(e.target.value)}
                  onKeyDown={handleNumeroKeyDown}
                />
              </div>
            </TopRow>
          </TopRows>

          <TopBottomRow>
            <SearchButton type="button" onClick={handleBuscarClick}>
              Buscar
            </SearchButton>
            <PrintButton type="submit">Imprimir</PrintButton>
          </TopBottomRow>
        </TopPanel>

        <CardsSection>
          <CategoryGrid>
            {categorias.map(cat => {
              const categoryItems =
                pedido?.items?.[cat.key] ??
                Array.from({ length: INITIAL_LINES }, () => ({
                  descricao: '',
                  quantidade: '',
                  unidade: '',
                }))

              const twoColumns = categoryItems.length > INITIAL_LINES
              const firstColumnItems = categoryItems.slice(0, INITIAL_LINES)
              const secondColumnItems = categoryItems.slice(INITIAL_LINES)
              const comment = pedido?.comments?.[cat.key] ?? ''

              return (
                <CategoryCard key={cat.key}>
                  <CategoryHeader>
                    <CategoryDay>{dayLabel}</CategoryDay>
                    <CategoryNumber>{idParaMostrar || '---'}</CategoryNumber>
                  </CategoryHeader>

                  <CategoryTitle>{cat.title}</CategoryTitle>

                  <CategoryMeta>
                    <MetaRow>
                      <MetaLabel>Cliente</MetaLabel>
                      <MetaValue>{cliente}</MetaValue>
                    </MetaRow>

                    <MetaRow>
                      <MetaLabel>Responsável</MetaLabel>
                      <MetaValue $variant="blue">{responsavel}</MetaValue>
                    </MetaRow>

                    <MetaRow>
                      <MetaLabel>Data / Horário</MetaLabel>
                      <MetaValue $variant="blue">
                        {dataPedido} {horaPedido}
                      </MetaValue>
                    </MetaRow>

                    <MetaRow>
                      <MetaLabel>Retirada / Entrega</MetaLabel>
                      <MetaValue $variant="blue">{retirada}</MetaValue>
                    </MetaRow>

                    <MetaRow>
                      <MetaLabel>Endereço</MetaLabel>
                      <MetaValue>{endereco}</MetaValue>
                    </MetaRow>

                    <MetaRow>
                      <MetaLabel>Telefone</MetaLabel>
                      <MetaValue $variant="green">{telefone}</MetaValue>
                    </MetaRow>
                  </CategoryMeta>

                  <CategoryBodyPrint>
                    <ItemsGrid $twoColumns={twoColumns}>
                      <ItemsColumn>
                        {firstColumnItems.map((line, index) => (
                          <ItemRow key={index} $twoColumns={twoColumns}>
                            <ItemText $twoColumns={twoColumns}>
                              {line.descricao}
                            </ItemText>
                            <ItemQtyText $twoColumns={twoColumns}>
                              {line.quantidade}
                            </ItemQtyText>
                            <ItemUnitText $twoColumns={twoColumns}>
                              {line.unidade}
                            </ItemUnitText>
                          </ItemRow>
                        ))}
                      </ItemsColumn>

                      {twoColumns && (
                        <ItemsColumn>
                          {secondColumnItems.map((line, index) => (
                            <ItemRow
                              key={INITIAL_LINES + index}
                              $twoColumns={twoColumns}
                            >
                              <ItemText $twoColumns={twoColumns}>
                                {line.descricao}
                              </ItemText>
                              <ItemQtyText $twoColumns={twoColumns}>
                                {line.quantidade}
                              </ItemQtyText>
                              <ItemUnitText $twoColumns={twoColumns}>
                                {line.unidade}
                              </ItemUnitText>
                            </ItemRow>
                          ))}
                        </ItemsColumn>
                      )}
                    </ItemsGrid>
                  </CategoryBodyPrint>

                  <CommentsArea>
                    <CommentsLabel>COMENTÁRIOS</CommentsLabel>
                    <CommentsBox>{comment}</CommentsBox>
                  </CommentsArea>
                </CategoryCard>
              )
            })}
          </CategoryGrid>
        </CardsSection>
      </Wrapper>
    </Layout>
  )
}
