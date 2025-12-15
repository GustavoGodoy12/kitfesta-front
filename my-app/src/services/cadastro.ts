export type CategoryKey = 'doces' | 'salgados' | 'bolos'

export type ItemLine = {
  descricao: string
  quantidade: string
  unidade: string
}

export type ItemsByCategory = Record<CategoryKey, ItemLine[]>
export type CategoryComments = Record<CategoryKey, string>

// Form do Cadastro (camelCase)
export type CadastroFormData = {
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

// Payload da API (snake_case)
export type PedidoCreatePayload = {
  formData: {
    responsavel: string
    cliente: string
    revendedor: string
    telefone: string
    retirada: string
    data: string
    horario: string
    endereco_entrega: string
    preco_total: string
    tipo_pagamento: string
  }
  items: ItemsByCategory
  comments: CategoryComments
}

// remove linhas vazias
function cleanItems(items: ItemsByCategory): ItemsByCategory {
  const cleanCategory = (lines: ItemLine[]) =>
    lines
      .map(l => ({
        descricao: l.descricao?.trim?.() ?? '',
        quantidade: l.quantidade?.trim?.() ?? '',
        unidade: l.unidade?.trim?.() ?? '',
      }))
      .filter(l => l.descricao !== '' || l.quantidade !== '')

  return {
    doces: cleanCategory(items.doces),
    salgados: cleanCategory(items.salgados),
    bolos: cleanCategory(items.bolos),
  }
}

export function buildPedidoPayload(
  formData: CadastroFormData,
  items: ItemsByCategory,
  comments: CategoryComments,
): PedidoCreatePayload {
  return {
    formData: {
      responsavel: formData.responsavel,
      cliente: formData.cliente,
      revendedor: formData.revendedor,
      telefone: formData.telefone,
      retirada: formData.retirada,
      data: formData.data,
      horario: formData.horario,
      endereco_entrega: formData.enderecoEntrega,
      preco_total: formData.precoTotal,
      tipo_pagamento: formData.tipoPagamento ?? 'PIX',
    },
    items: cleanItems(items),
    comments,
  }
}

export async function createPedido(payload: PedidoCreatePayload) {
  const res = await fetch('/api/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Erro ao salvar pedido (${res.status}). ${text}`)
  }

  return res.json().catch(() => ({}))
}

// ✅ NOVO: pega o último id no banco (GET /pedidos?ultimo_id=true)
export async function fetchUltimoPedidoId(): Promise<number> {
  const res = await fetch('/api/pedidos?ultimo_id=true', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Erro ao buscar ultimo_id (${res.status}). ${text}`)
  }

  const data = await res.json().catch(() => ({} as any))
  const ultimoId = Number((data as any)?.ultimoId ?? 0)
  return Number.isFinite(ultimoId) ? ultimoId : 0
}
