// src/services/consolidado.ts

type CategoryKey = 'doces' | 'salgados' | 'bolos'

export type ItemLine = {
  descricao: string
  quantidade: string
  unidade: string
}

export type ItemsByCategory = Record<CategoryKey, ItemLine[]>

export type FormData = {
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

export type Pedido = {
  id: number
  formData: FormData
  items: ItemsByCategory
}

export type ConsolidadoFilters = {
  data?: string
  cliente?: string
  responsavel?: string
  retirada?: string
  horario?: string
  pedidoId?: string // filtro por número
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4055'

function toStr(v: unknown): string {
  if (v == null) return ''
  return String(v)
}

function normalizePedido(data: any): Pedido {
  const id = Number(data?.id ?? 0) || 0
  const apiForm = data?.formData ?? {}
  const apiItems = data?.items ?? {}

  const formData: FormData = {
    pedidoId: toStr(apiForm?.pedidoId ?? id),
    responsavel: toStr(apiForm?.responsavel),
    cliente: toStr(apiForm?.cliente),
    revendedor: toStr(apiForm?.revendedor),
    telefone: toStr(apiForm?.telefone),
    retirada: toStr(apiForm?.retirada),
    data: toStr(apiForm?.data),
    horario: toStr(apiForm?.horario),

    enderecoEntrega: toStr(apiForm?.enderecoEntrega ?? apiForm?.endereco_entrega),
    precoTotal: toStr(apiForm?.precoTotal ?? apiForm?.preco_total),
    tipoPagamento: toStr(apiForm?.tipoPagamento ?? apiForm?.tipo_pagamento),
  }

  const items: ItemsByCategory = {
    doces: Array.isArray(apiItems?.doces) ? apiItems.doces : [],
    salgados: Array.isArray(apiItems?.salgados) ? apiItems.salgados : [],
    bolos: Array.isArray(apiItems?.bolos) ? apiItems.bolos : [],
  }

  return { id, formData, items }
}

function normalizePedidosList(json: any): Pedido[] {
  if (Array.isArray(json)) return json.map(normalizePedido)
  if (Array.isArray(json?.pedidos)) return json.pedidos.map(normalizePedido)
  return []
}

function buildQueryString(filters: ConsolidadoFilters): string {
  const params = new URLSearchParams()

  if (filters.data?.trim()) params.set('data', filters.data.trim())
  if (filters.cliente?.trim()) params.set('cliente', filters.cliente.trim())
  if (filters.responsavel?.trim()) params.set('responsavel', filters.responsavel.trim())
  if (filters.retirada?.trim()) params.set('retirada', filters.retirada.trim())
  if (filters.horario?.trim()) params.set('horario', filters.horario.trim())

  // ⚠️ Sua API hoje não tem filtro por pedidoId no controller.
  // Enviamos como pedidoId; se você preferir, mude o param e implemente no backend.
  if (filters.pedidoId?.trim()) params.set('pedidoId', filters.pedidoId.trim())

  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

/**
 * GET /pedidos com filtros via querystring
 */
export async function fetchPedidosConsolidado(
  filters: ConsolidadoFilters,
  opts?: { signal?: AbortSignal },
): Promise<Pedido[]> {
  const qs = buildQueryString(filters)
  const resp = await fetch(`${API_BASE_URL}/pedidos${qs}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal: opts?.signal,
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`Falha ao buscar pedidos (${resp.status}). ${text}`)
  }

  const json = await resp.json()
  return normalizePedidosList(json)
}
