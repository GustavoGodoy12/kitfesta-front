// src/data/productsApi.ts
export type Produto = {
  id: number
  descricao: string
  preco: number
  tipo: 'doce' | 'salgado' | 'bolo' | 'kit'
  imagem_url: string
  promocao: 0 | 1
}

type ApiResponse = {
  page: number
  limit: number
  total: number
  items: Produto[]
}

const BASE = 'https://buffetjanines.com.br'

export async function listProdutos(): Promise<Produto[]> {
  const url = `${BASE}/api/products?page=1&limit=1000`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Falha ao buscar produtos: ${res.status}`)
  const data = (await res.json()) as ApiResponse
  return data.items ?? []
}

export async function listSaboresPorTipo() {
  const items = await listProdutos()

  const by = (tipo: Produto['tipo']) =>
    items
      .filter(p => p.tipo === tipo)
      .map(p => p.descricao.toUpperCase())
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))

  return {
    doces: by('doce'),
    salgados: by('salgado'),
    bolos: by('bolo'),
    // kits estão disponíveis se quiser usar depois:
    kits: items.filter(p => p.tipo === 'kit'),
  }
}
