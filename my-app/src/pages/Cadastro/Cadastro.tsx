import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import Layout from '../../layout/Layout'
import CadastroToast from '../../components/CadastroToast/CadastroToast'
import {
  buildPedidoPayload,
  createPedido,
  fetchUltimoPedidoId,
} from '../../services/cadastro'
import {
  Wrapper,
  FormPanel,
  FormRows,
  FormRow,
  FieldLabel,
  FieldInput,
  FieldSelect,
  FormBottomRow,
  SubmitButton,
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
  CategoryBody,
  ItemRow,
  ItemInput,
  ItemQtyInput,
  ItemUnit,
  AddItemBar,
  AddItemButton,
  CommentsArea,
  CommentsLabel,
  CommentsTextarea,
  PedidoIdBox,
} from './Cadastro.styled'

const STORAGE_KEY = 'sisteminha-pedidos'

type FormData = {
  pedidoId: string
  responsavel: string
  cliente: string
  revendedor: string
  telefone: string
  retirada: string
  data: string
  horario: string
  enderecoEntrega: string
  precoTotal: string
  taxaEntrega: string
  tamanho: string
}

type CategoryKey = 'doces' | 'salgados' | 'bolos'

type ItemLine = {
  descricao: string
  quantidade: string
  unidade: string
}

type ItemsByCategory = Record<CategoryKey, ItemLine[]>
type CategoryComments = Record<CategoryKey, string>

type Pedido = {
  id: number
  formData: FormData
  items: ItemsByCategory
  comments: CategoryComments
}

const INITIAL_LINES = 10

const initialFormData: FormData = {
  pedidoId: '',
  responsavel: '',
  cliente: '',
  revendedor: '',
  telefone: '',
  retirada: 'ENTREGA',
  data: '',
  horario: '',
  enderecoEntrega: '',
  precoTotal: '',
  taxaEntrega: '',
  tamanho: '',
}

const makeLines = (defaultUnit: string): ItemLine[] =>
  Array.from({ length: INITIAL_LINES }, () => ({
    descricao: '',
    quantidade: '',
    unidade: defaultUnit,
  }))

const makeInitialItems = (): ItemsByCategory => ({
  doces: makeLines('UN'),
  salgados: makeLines('UN'),
  bolos: makeLines('KG'),
})

const makeInitialComments = (): CategoryComments => ({
  doces: '',
  salgados: '',
  bolos: '',
})

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

function formatTelefone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function formatPrecoTotal(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  const num = parseInt(digits, 10)
  const intPart = Math.floor(num / 100).toString()
  const decPart = (num % 100).toString().padStart(2, '0')
  const intWithSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `R$ ${intWithSep},${decPart}`
}

function parsePrecoValue(formatted: string): number {
  const clean = formatted.replace(/[^\d,]/g, '').replace(',', '.')
  const n = parseFloat(clean)
  return Number.isFinite(n) ? n : 0
}

function sanitizeQuantidade(raw: string): string {
  return raw.replace(/\D/g, '')
}

function formatDateToBR(dateStr?: string): string {
  if (!dateStr) return ''
  if (dateStr.includes('/')) return dateStr
  const [year, month, day] = dateStr.split('-')
  if (!year || !month || !day) return dateStr
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
}

function getDayLabelFromISO(dateStr?: string): string {
  if (!dateStr) return 'SÁBADO'
  const [yearStr, monthStr, dayStr] = dateStr.split('-')
  const year = Number(yearStr), month = Number(monthStr), day = Number(dayStr)
  if (!year || !month || !day) return 'SÁBADO'
  const d = new Date(year, month - 1, day)
  return ['DOMINGO','SEGUNDA','TERÇA','QUARTA','QUINTA','SEXTA','SÁBADO'][d.getDay()] ?? 'SÁBADO'
}

function getInitialNextIdLocal(): number {
  if (typeof window === 'undefined') return 1
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 1
    const pedidos: Pedido[] = JSON.parse(raw)
    if (!Array.isArray(pedidos) || pedidos.length === 0) return 1
    const maxId = Math.max(...pedidos.map(p => Number(p.id) || 0))
    const base = Number.isFinite(maxId) && maxId > 0 ? maxId : 0
    return base + 1
  } catch { return 1 }
}

export default function Cadastro() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [items, setItems] = useState<ItemsByCategory>(makeInitialItems)
  const [comments, setComments] = useState<CategoryComments>(makeInitialComments)
  const [nextId, setNextId] = useState<number>(0)
  const [idReady, setIdReady] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [ultimoPedido, setUltimoPedido] = useState<{ id?: number | string; cliente?: string }>({})

  useEffect(() => {
    let alive = true
    async function loadNextId() {
      try {
        const ultimoId = await fetchUltimoPedidoId()
        const apiNext = (Number(ultimoId) || 0) + 1
        if (!alive) return
        setNextId(apiNext)
        setIdReady(true)
      } catch (err) {
        console.error('Não conseguiu buscar ultimo_id na API. Usando localStorage.', err)
        const localNext = getInitialNextIdLocal()
        if (!alive) return
        setNextId(localNext)
        setIdReady(true)
      }
    }
    loadNextId()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!idReady) return
    if (!nextId || nextId <= 0) return
    setFormData(prev => {
      if (prev.pedidoId) return prev
      return { ...prev, pedidoId: String(nextId) }
    })
  }, [idReady, nextId])

  // precoTotal exibido = precoTotal + taxaEntrega
  const precoComTaxa: string = (() => {
    const base = parsePrecoValue(formData.precoTotal)
    const taxa = parsePrecoValue(formData.taxaEntrega)
    if (base === 0 && taxa === 0) return ''
    const total = base + taxa
    const intPart = Math.floor(total).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    const decPart = Math.round((total % 1) * 100).toString().padStart(2, '0')
    return `R$ ${intPart},${decPart}`
  })()

  function handleFormChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    let newValue = value
    if (name === 'telefone') newValue = formatTelefone(value)
    if (name === 'precoTotal') newValue = formatPrecoTotal(value)
    if (name === 'taxaEntrega') newValue = formatPrecoTotal(value)

    setFormData(prev => {
      const updated: FormData = { ...prev, [name]: newValue }
      if (!prev.pedidoId && nextId > 0) updated.pedidoId = String(nextId)
      return updated
    })
  }

  function handleItemChange(category: CategoryKey, index: number, field: keyof ItemLine, value: string) {
    const nextValue = field === 'quantidade' ? sanitizeQuantidade(value) : value
    setItems(prev => {
      const copy = { ...prev }
      const lines = [...copy[category]]
      lines[index] = { ...lines[index], [field]: nextValue }
      copy[category] = lines
      return copy
    })
    setFormData(prev => {
      if (prev.pedidoId) return prev
      if (nextId <= 0) return prev
      return { ...prev, pedidoId: String(nextId) }
    })
  }

  function handleCommentChange(category: CategoryKey, value: string) {
    setComments(prev => ({ ...prev, [category]: value }))
    setFormData(prev => {
      if (prev.pedidoId) return prev
      if (nextId <= 0) return prev
      return { ...prev, pedidoId: String(nextId) }
    })
  }

  function handleAddItem(category: CategoryKey) {
    const defaultUnit = category === 'bolos' ? 'KG' : 'UN'
    setItems(prev => {
      const copy = { ...prev }
      copy[category] = [...copy[category], { descricao: '', quantidade: '', unidade: defaultUnit }]
      return copy
    })
  }

  // bloqueia Enter no form exceto em textarea
  function handleKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === 'Enter') {
      const tag = (e.target as HTMLElement).tagName
      if (tag !== 'TEXTAREA') {
        e.preventDefault()
      }
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const errors: string[] = []
    if (!formData.cliente.trim()) errors.push('Cliente é obrigatório.')
    if (!formData.telefone.trim()) errors.push('Telefone é obrigatório.')
    if (!formData.precoTotal.trim()) errors.push('Preço é obrigatório.')
    if (!formData.data) errors.push('Data é obrigatória.')
    if (!formData.horario) errors.push('Horário é obrigatório.')
    if (formData.retirada === 'ENTREGA' && !formData.enderecoEntrega.trim()) {
      errors.push('Endereço é obrigatório para entrega.')
    }
    if (errors.length > 0) {
      alert(errors.join('\n'))
      return
    }

    // soma preço + taxa antes de salvar
    const precoFinal = precoComTaxa || formData.precoTotal

    const currentId =
      formData.pedidoId && Number(formData.pedidoId) > 0
        ? Number(formData.pedidoId)
        : nextId || 1

    const payload = buildPedidoPayload(
  {
    responsavel: formData.responsavel,
    cliente: formData.cliente,
    revendedor: formData.revendedor,
    telefone: formData.telefone,
    retirada: formData.retirada,
    data: formData.data,
    horario: formData.horario,
    enderecoEntrega: formData.enderecoEntrega,
    precoTotal: precoFinal,       // somado
    taxaEntrega: formData.taxaEntrega,  // separado
    tamanho: formData.tamanho,
  },
  items,
  comments,
)

    try {
      const resp = await createPedido(payload)
      const idApi = (resp as any)?.pedidoId ?? currentId

      setUltimoPedido({ id: idApi, cliente: formData.cliente })
      setToastOpen(true)

      const proxId = Number(idApi) + 1
      setNextId(Number.isFinite(proxId) ? proxId : currentId + 1)

      setFormData(initialFormData)
      setItems(makeInitialItems())
      setComments(makeInitialComments())
    } catch (err) {
      console.error('Falhou API, salvando em localStorage (fallback):', err)

      let pedidos: Pedido[] = []
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) pedidos = JSON.parse(raw)
      } catch { pedidos = [] }

      const pedidoFormData: FormData = { ...formData, pedidoId: String(currentId) }
      const novoPedido: Pedido = { id: currentId, formData: pedidoFormData, items, comments }

      localStorage.setItem(STORAGE_KEY, JSON.stringify([...pedidos, novoPedido]))

      setUltimoPedido({ id: currentId, cliente: formData.cliente })
      setToastOpen(true)
      setNextId(currentId + 1)
      setFormData(initialFormData)
      setItems(makeInitialItems())
      setComments(makeInitialComments())

      alert(
        err instanceof Error
          ? `API indisponível. Pedido salvo localmente.\n\n${err.message}`
          : 'API indisponível. Pedido salvo localmente.',
      )
    }
  }

  function computeTotal(category: CategoryKey) {
    return items[category].reduce((sum, line) => {
      const n = Number(line.quantidade.replace(',', '.'))
      return sum + (Number.isNaN(n) ? 0 : n)
    }, 0)
  }

  const dayLabel = getDayLabelFromISO(formData.data)
  const dataFormatada = formatDateToBR(formData.data) || '00/00/0000'

  return (
    <Layout>
      <Wrapper onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <FormPanel>
          <FormRows>
            <FormRow>
              <div>
                <FieldLabel>Nº do pedido</FieldLabel>
                <PedidoIdBox>{formData.pedidoId || '---'}</PedidoIdBox>
              </div>

              <div>
                <FieldLabel>Responsável</FieldLabel>
                <FieldInput name="responsavel" value={formData.responsavel} onChange={handleFormChange} />
              </div>

              <div>
                <FieldLabel>Cliente *</FieldLabel>
                <FieldInput
                  name="cliente"
                  list="cliente-options"
                  value={formData.cliente}
                  onChange={handleFormChange}
                />
                <datalist id="cliente-options">
                  <option value="KIT" />
                  <option value="EVENTO" />
                  <option value="REVENDEDOR" />
                  <option value="EXAL" />
                  <option value="COFFEE" />
                  <option value="FUNCIONARIO" />
                  <option value="VENDA INTERNA" />
                </datalist>
              </div>

              <div>
                <FieldLabel>Revendedor</FieldLabel>
                <FieldInput name="revendedor" value={formData.revendedor} onChange={handleFormChange} />
              </div>

              <div>
                <FieldLabel>Telefone *</FieldLabel>
                <FieldInput type="tel" name="telefone" value={formData.telefone} onChange={handleFormChange} />
              </div>
            </FormRow>

            <FormRow>
              <div>
                <FieldLabel>Data</FieldLabel>
                <FieldInput type="date" name="data" value={formData.data} onChange={handleFormChange} />
              </div>

              <div>
                <FieldLabel>Horário</FieldLabel>
                <FieldInput type="time" name="horario" value={formData.horario} onChange={handleFormChange} />
              </div>

              <div>
                <FieldLabel>Retirada / Entrega</FieldLabel>
                <FieldSelect name="retirada" value={formData.retirada} onChange={handleFormChange}>
                  <option value="ENTREGA">ENTREGA</option>
                  <option value="RETIRADA">RETIRADA</option>
                </FieldSelect>
              </div>

              <div>
                <FieldLabel>Endereço</FieldLabel>
                <FieldInput name="enderecoEntrega" value={formData.enderecoEntrega} onChange={handleFormChange} />
              </div>

              <div>
                <FieldLabel>Preço total *</FieldLabel>
                <FieldInput name="precoTotal" value={formData.precoTotal} onChange={handleFormChange} />
              </div>

              <div>
                <FieldLabel>Taxa de entrega</FieldLabel>
                <FieldInput
                  name="taxaEntrega"
                  value={formData.taxaEntrega}
                  onChange={handleFormChange}
                  placeholder="R$ 0,00"
                />
              </div>

              {/* mostra o total com taxa em tempo real */}
              {parsePrecoValue(formData.taxaEntrega) > 0 && (
                <div>
                  <FieldLabel>Total com taxa</FieldLabel>
                  <PedidoIdBox style={{ minWidth: 120, background: '#fef9c3', color: '#92400e' }}>
                    {precoComTaxa}
                  </PedidoIdBox>
                </div>
              )}

              <div>
                <FieldLabel>Tamanho Kit</FieldLabel>
                <FieldSelect name="tamanho" value={formData.tamanho} onChange={handleFormChange}>
                  <option value="">-</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="40">40</option>
                  <option value="50">50</option>
                  <option value="60">60</option>
                  <option value="70">70</option>
                  <option value="80">80</option>
                  <option value="90">90</option>
                  <option value="100">100</option>
                  <option value="BENTO CAKE">BENTO CAKE</option>
                  <option value="AVULSO">AVULSO</option>
                </FieldSelect>
              </div>
            </FormRow>
          </FormRows>

          <FormBottomRow>
            <SubmitButton type="submit">Cadastrar</SubmitButton>
          </FormBottomRow>
        </FormPanel>

        <CardsSection>
          <CategoryGrid>
            {([
              { key: 'doces', title: 'DOCES' },
              { key: 'salgados', title: 'SALGADOS' },
              { key: 'bolos', title: 'BOLO' },
            ] as { key: CategoryKey; title: string }[]).map(cat => {
              const categoryItems = items[cat.key]
              const twoColumns = categoryItems.length > INITIAL_LINES
              const isDoces = cat.key === 'doces'
              const isSalgados = cat.key === 'salgados'
              const isBolos = cat.key === 'bolos'

              return (
                <CategoryCard key={cat.key}>
                  <CategoryHeader>
                    <CategoryDay>{dayLabel}</CategoryDay>
                    <CategoryNumber>{formData.pedidoId || '---'}</CategoryNumber>
                  </CategoryHeader>

                  <CategoryTitle>{cat.title}</CategoryTitle>

                  <CategoryMeta>
                    <MetaRow>
                      <MetaLabel>Total</MetaLabel>
                      <MetaValue>{computeTotal(cat.key)}</MetaValue>
                    </MetaRow>
                    <MetaRow>
                      <MetaLabel>Data</MetaLabel>
                      <MetaValue>{dataFormatada}</MetaValue>
                    </MetaRow>
                    <MetaRow>
                      <MetaLabel>Hora</MetaLabel>
                      <MetaValue>{formData.horario || '00:00'}</MetaValue>
                    </MetaRow>
                    <MetaRow>
                      <MetaLabel>Retirada</MetaLabel>
                      <MetaValue>{formData.retirada || '-'}</MetaValue>
                    </MetaRow>
                  </CategoryMeta>

                  <CategoryBody $twoColumns={twoColumns}>
                    {categoryItems.map((line, index) => (
                      <ItemRow key={index}>
                        <ItemInput
                          value={line.descricao}
                          list={
                            isDoces ? 'doces-opcoes'
                            : isSalgados ? 'salgados-opcoes'
                            : isBolos ? 'bolos-opcoes'
                            : undefined
                          }
                          onChange={e => handleItemChange(cat.key, index, 'descricao', e.target.value)}
                        />
                        <ItemQtyInput
                          value={line.quantidade}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          onChange={e => handleItemChange(cat.key, index, 'quantidade', e.target.value)}
                        />
                        <ItemUnit
                          value={line.unidade}
                          onChange={e => handleItemChange(cat.key, index, 'unidade', e.target.value)}
                        >
                          {isDoces && (
                            <>
                              <option value="UN">UN</option>
                              <option value="KG">KG</option>
                              <option value="L">L</option>
                            </>
                          )}
                          {isSalgados && (
                            <>
                              <option value="KG">KG</option>
                              <option value="UN">UN</option>
                              <option value="L">L</option>
                            </>
                          )}
                          {isBolos && (
                            <>
                              <option value="KG">KG</option>
                              <option value="UN">UN</option>
                              <option value="G">G</option>
                              <option value="L">L</option>
                            </>
                          )}
                        </ItemUnit>
                      </ItemRow>
                    ))}
                  </CategoryBody>

                  <AddItemBar>
                    <AddItemButton
                      type="button"
                      onClick={() => handleAddItem(cat.key)}
                      aria-label={`Adicionar item em ${cat.title}`}
                    >
                      +
                    </AddItemButton>
                  </AddItemBar>

                  <CommentsArea>
                    <CommentsLabel>COMENTÁRIOS</CommentsLabel>
                    <CommentsTextarea
                      rows={1}
                      value={comments[cat.key]}
                      onChange={e => handleCommentChange(cat.key, e.target.value)}
                    />
                  </CommentsArea>
                </CategoryCard>
              )
            })}
          </CategoryGrid>

          <datalist id="doces-opcoes">
            {DOCES_OPCOES.map(opcao => <option key={opcao} value={opcao} />)}
          </datalist>
          <datalist id="salgados-opcoes">
            {SALGADOS_OPCOES.map(opcao => <option key={opcao} value={opcao} />)}
          </datalist>
          <datalist id="bolos-opcoes">
            {BOLOS_OPCOES.map(opcao => <option key={opcao} value={opcao} />)}
          </datalist>
        </CardsSection>
      </Wrapper>

      <CadastroToast
        open={toastOpen}
        pedidoId={ultimoPedido.id}
        cliente={ultimoPedido.cliente}
        onClose={() => setToastOpen(false)}
      />
    </Layout>
  )
}