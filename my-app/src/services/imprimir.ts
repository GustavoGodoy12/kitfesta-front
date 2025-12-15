// src/services/imprimir.ts

type CategoryKey = 'doces' | 'salgados' | 'bolos'

export type ItemLine = {
  descricao: string
  quantidade: string
  unidade: string
}

export type ItemsByCategory = Record<CategoryKey, ItemLine[]>
export type CategoryComments = Record<CategoryKey, string>

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
  comments?: CategoryComments
}

const API_BASE_URL =
  (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_API_URL) ||
  'http://52.201.240.172:3022'

function toStr(v: unknown): string {
  if (v == null) return ''
  return String(v)
}

function normalizePedido(data: any): Pedido {
  const id = Number(data?.id ?? 0) || 0

  const apiForm = data?.formData ?? {}
  const apiItems = data?.items ?? {}
  const apiComments = data?.comments ?? {}

  const formData: FormData = {
    pedidoId: toStr(apiForm?.pedidoId ?? id),
    responsavel: toStr(apiForm?.responsavel),
    cliente: toStr(apiForm?.cliente),
    revendedor: toStr(apiForm?.revendedor),
    telefone: toStr(apiForm?.telefone),
    retirada: toStr(apiForm?.retirada),
    data: toStr(apiForm?.data),
    horario: toStr(apiForm?.horario),

    // ✅ snake_case -> camelCase
    enderecoEntrega: toStr(apiForm?.enderecoEntrega ?? apiForm?.endereco_entrega),
    precoTotal: toStr(apiForm?.precoTotal ?? apiForm?.preco_total),
    tipoPagamento: toStr(apiForm?.tipoPagamento ?? apiForm?.tipo_pagamento),
  }

  const items: ItemsByCategory = {
    doces: Array.isArray(apiItems?.doces) ? apiItems.doces : [],
    salgados: Array.isArray(apiItems?.salgados) ? apiItems.salgados : [],
    bolos: Array.isArray(apiItems?.bolos) ? apiItems.bolos : [],
  }

  const comments: CategoryComments = {
    doces: toStr(apiComments?.doces),
    salgados: toStr(apiComments?.salgados),
    bolos: toStr(apiComments?.bolos),
  }

  return {
    id,
    formData,
    items,
    comments,
  }
}

/**
 * GET /pedidos/:id
 * - retorna Pedido se existir
 * - retorna null se 404
 * - lança erro para outros status / rede
 */
export async function fetchPedidoById(
  id: number | string,
  opts?: { signal?: AbortSignal },
): Promise<Pedido | null> {
  const idStr = String(id).trim()
  if (!idStr) return null

  const resp = await fetch(`${API_BASE_URL}/pedidos/${encodeURIComponent(idStr)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal: opts?.signal,
  })

  if (resp.status === 404) return null
  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`Falha ao buscar pedido (${resp.status}). ${text}`)
  }

  const data = await resp.json()
  return normalizePedido(data)
}
