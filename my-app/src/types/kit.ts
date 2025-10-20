export type IdNum = number

export type ItemBase = {
  id: IdNum
  kitId: IdNum
  sabor: string
  quantidade: number
  observacao?: string
}

export type Doce = ItemBase
export type Salgado = ItemBase

export type Bolo = ItemBase & {
  pesoKg?: number
  recheio?: string
  cobertura?: string
  texto?: string
}

export type TipoEntrega = 'retirada' | 'entrega'

export type KitStatus = {
  docesDone?: boolean
  salgadosDone?: boolean
  bolosDone?: boolean
}

export type Kit = {
  id: IdNum
  nome: string
  cliente?: string
  telefone: string
  email?: string
  dataEvento?: string
  hora?: string
  tipo: TipoEntrega
  endereco?: string

  /** NOVO: preço do kit */
  preco?: number

  doces: Doce[]
  salgados: Salgado[]
  bolos: Bolo[]

  status?: KitStatus

  /** pode ser preenchido pelo backend; útil em algumas telas */
  entregue?: boolean

  criadoEm: string
  atualizadoEm: string
}
