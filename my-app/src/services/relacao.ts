// src/services/relacao.ts

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

    // snake_case -> camelCase
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
  // ✅ 1) API pode retornar array direto
  if (Array.isArray(json)) return json.map(normalizePedido)

  // ✅ 2) seu controller retorna { pedidos: [...] }
  if (Array.isArray(json?.pedidos)) return json.pedidos.map(normalizePedido)

  // extras (se mudar no futuro)
  if (Array.isArray(json?.data)) return json.data.map(normalizePedido)
  if (Array.isArray(json?.items)) return json.items.map(normalizePedido)

  return []
}

/**
 * GET /pedidos?data=YYYY-MM-DD
 * - se data vier vazia: GET /pedidos
 */
export async function fetchPedidosByData(
  data?: string,
  opts?: { signal?: AbortSignal },
): Promise<Pedido[]> {
  const qs = data?.trim() ? `?data=${encodeURIComponent(data.trim())}` : ''
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
