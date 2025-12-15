import { useState, type FormEvent, type KeyboardEvent, useRef } from 'react'
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

import { fetchPedidoById, type Pedido } from '../../services/imprimir'

const STORAGE_KEY = 'sisteminha-pedidos'
const INITIAL_LINES = 10

type CategoryKey = 'doces' | 'salgados' | 'bolos'
type ItemsByCategory = Record<CategoryKey, { descricao: string; quantidade: string; unidade: string }[]>

function computeTotal(category: CategoryKey, items?: ItemsByCategory) {
  if (!items) return 0
  return items[category].reduce((sum, line) => {
    const n = Number(String(line.quantidade ?? '').replace(',', '.'))
    return sum + (Number.isNaN(n) ? 0 : n)
  }, 0)
}

function formatDateToBR(dateStr?: string): string {
  if (!dateStr) return ''
  if (dateStr.includes('/')) return dateStr
  const [year, month, day] = dateStr.split('-')
  if (!year || !month || !day) return dateStr
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
}

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

function sanitizePedidoNumero(raw: string) {
  return raw.replace(/\D/g, '')
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
    pedidos.find(p => Number((p as any).formData?.pedidoId) === idNumber)

  return encontrado || null
}

export default function Imprimir() {
  const [pedidoNumero, setPedidoNumero] = useState('')
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  async function carregarPedido(): Promise<Pedido | null> {
    const numero = sanitizePedidoNumero(pedidoNumero)
    if (numero !== pedidoNumero) setPedidoNumero(numero)

    if (!numero) {
      alert('Informe o número do pedido para buscar.')
      return null
    }

    setLoading(true)

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      // ✅ API primeiro
      const apiPedido = await fetchPedidoById(numero, { signal: controller.signal })
      if (apiPedido) {
        setPedido(apiPedido)
        return apiPedido
      }

      // fallback localStorage (404)
      const local = findPedidoByNumero(numero)
      if (local) {
        setPedido(local)
        return local
      }

      alert(`Pedido ${numero} não encontrado (API e mock).`)
      setPedido(null)
      return null
    } catch (err) {
      // fallback localStorage (erro de rede/status)
      const local = findPedidoByNumero(numero)
      if (local) {
        console.error('API indisponível. Usando fallback localStorage:', err)
        setPedido(local)
        return local
      }

      console.error('Falha ao buscar pedido:', err)
      alert(
        err instanceof Error
          ? `Falha ao buscar pedido na API.\n\n${err.message}`
          : 'Falha ao buscar pedido na API.',
      )
      setPedido(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  async function handleBuscarClick() {
    await carregarPedido()
  }

  async function handleNumeroKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
      e.preventDefault()
      await carregarPedido()
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const numero = sanitizePedidoNumero(pedidoNumero)
    if (!numero) {
      alert('Informe o número do pedido para imprimir.')
      return
    }

    const encontrado = await carregarPedido()
    if (!encontrado) return

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
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={e => setPedidoNumero(sanitizePedidoNumero(e.target.value))}
                  onKeyDown={handleNumeroKeyDown}
                />
              </div>
            </TopRow>
          </TopRows>

          <TopBottomRow>
            <SearchButton type="button" onClick={handleBuscarClick} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </SearchButton>
            <PrintButton type="submit" disabled={loading}>
              Imprimir
            </PrintButton>
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

                    <MetaRow>
                      <MetaLabel>Total</MetaLabel>
                      <MetaValue>{computeTotal(cat.key, pedido?.items as any)}</MetaValue>
                    </MetaRow>
                  </CategoryMeta>

                  <CategoryBodyPrint>
                    <ItemsGrid $twoColumns={twoColumns}>
                      <ItemsColumn>
                        {firstColumnItems.map((line, index) => (
                          <ItemRow key={index} $twoColumns={twoColumns}>
                            <ItemText $twoColumns={twoColumns}>{line.descricao}</ItemText>
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
