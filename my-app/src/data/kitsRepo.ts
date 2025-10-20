// src/data/kitsRepo.ts
// Adapter HTTP que replica a API do antigo kitsRepo (localStorage)

import type { Kit, Doce, Salgado, Bolo, TipoEntrega, IdNum, KitStatus } from '../types/kit'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const hasBody = !!init?.body
  const headers = hasBody
    ? { 'Content-Type': 'application/json', ...(init?.headers || {}) }
    : (init?.headers as Record<string, string> | undefined)

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    method: (init?.method || 'GET') as HttpMethod,
    headers,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    try {
      const json = text ? JSON.parse(text) : {}
      throw new Error(JSON.stringify(json))
    } catch {
      throw new Error(text || `HTTP ${res.status} ${res.statusText}`)
    }
  }

  if (res.status === 204) return undefined as T
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) return undefined as T
  return (await res.json()) as T
}

/** --------- Types vindos do backend (flags 0/1) --------- */
type SrvItem = { id: number; sabor: string; quantidade: number; observacao?: string | null }
type SrvBolo = SrvItem & { texto?: string | null }
type SrvKit = {
  id: number
  nome: string
  telefone: string
  email: string | null
  dataEvento: string | null
  hora: string | null
  tipo: TipoEntrega
  endereco: string | null
  /** pode vir como string se DECIMAL vier sem decimalNumbers:true */
  preco: number | string
  statusDoces: 0 | 1
  statusSalgados: 0 | 1
  statusBolos: 0 | 1
  entregue: 0 | 1
  criadoEm: string
  atualizadoEm: string
  doces: SrvItem[]
  salgados: SrvItem[]
  bolos: SrvBolo[]
}

/** --------- Mapeadores para o modelo do front --------- */
function toFrontKit(s: SrvKit): Kit {
  const toDoce = (d: SrvItem): Doce => ({
    id: d.id as IdNum,
    kitId: s.id as IdNum,
    sabor: d.sabor,
    quantidade: Number(d.quantidade) || 0,
    observacao: d.observacao ?? undefined,
  })
  const toSalg = (x: SrvItem): Salgado => ({
    id: x.id as IdNum,
    kitId: s.id as IdNum,
    sabor: x.sabor,
    quantidade: Number(x.quantidade) || 0,
    observacao: x.observacao ?? undefined,
  })
  const toBolo = (b: SrvBolo): Bolo => ({
    id: b.id as IdNum,
    kitId: s.id as IdNum,
    sabor: b.sabor,
    quantidade: Number(b.quantidade) || 0,
    observacao: b.observacao ?? undefined,
    texto: b.texto ?? undefined,
  })
  const status: KitStatus = {
    docesDone: !!s.statusDoces,
    salgadosDone: !!s.statusSalgados,
    bolosDone: !!s.statusBolos,
  }

  const precoNum =
    typeof s.preco === 'number' ? s.preco :
    s.preco != null ? Number(s.preco) : undefined

  const base = {
    id: s.id as IdNum,
    nome: s.nome,
    telefone: s.telefone,
    email: s.email ?? undefined,
    dataEvento: s.dataEvento ?? undefined,
    hora: s.hora ?? undefined,
    tipo: s.tipo,
    endereco: s.endereco ?? undefined,
    preco: precoNum, // <-- preço normalizado como number
    doces: (s.doces || []).map(toDoce),
    salgados: (s.salgados || []).map(toSalg),
    bolos: (s.bolos || []).map(toBolo),
    status,
    criadoEm: s.criadoEm,
    atualizadoEm: s.atualizadoEm,
  } as unknown as Kit

  // expõe "entregue" no Kit do front (caso não exista no tipo)
  ;(base as any).entregue = !!s.entregue
  return base
}

/** =============== LISTAGEM / GETs =============== */
export async function listKits(): Promise<Kit[]> {
  const data = await http<SrvKit[]>('/kits')
  return data.map(toFrontKit).sort((a: any, b: any) => (a.atualizadoEm < b.atualizadoEm ? 1 : -1))
}

export async function getKit(id: IdNum): Promise<Kit | undefined> {
  const kit = await http<SrvKit>(`/kits/${Number(id)}`)
  return toFrontKit(kit)
}

/** =============== CRUD KIT =============== */
export async function createKit(data: {
  nome: string
  telefone: string
  email?: string
  dataEvento?: string
  hora?: string
  tipo: TipoEntrega
  endereco?: string
  cliente?: string
  preco: number                       // <-- OBRIGATÓRIO no create
}): Promise<Kit> {
  const body = {
    nome: data.nome,
    telefone: data.telefone,
    email: data.email || undefined,
    dataEvento: data.dataEvento || undefined,
    hora: data.hora || undefined,
    tipo: data.tipo,
    endereco: data.tipo === 'entrega' ? (data.endereco || '') : undefined,
    preco: data.preco,                // <-- envia para o backend
  }
  const created = await http<SrvKit>('/kits', { method: 'POST', body: JSON.stringify(body) })
  return toFrontKit(created)
}

export async function saveKit(kit: Kit): Promise<void> {
  const patch: any = {
    nome: kit.nome,
    telefone: kit.telefone,
    email: kit.email ?? null,
    dataEvento: kit.dataEvento ?? null,
    hora: kit.hora ?? null,
    tipo: kit.tipo,
    endereco: kit.endereco ?? null,
  }
  // envia preço se disponível (edição)
  if (typeof (kit as any).preco === 'number' && Number.isFinite((kit as any).preco)) {
    patch.preco = (kit as any).preco
  }
  await http(`/kits/${Number(kit.id)}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

export async function deleteKit(id: IdNum): Promise<void> {
  await http(`/kits/${Number(id)}`, { method: 'DELETE' })
}

/** =============== ITENS =============== */
export async function addDoce(kitId: IdNum, item: Omit<Doce, 'id' | 'kitId'>): Promise<Doce | undefined> {
  const created = await http<SrvItem>(`/kits/${Number(kitId)}/doces`, {
    method: 'POST',
    body: JSON.stringify({ sabor: item.sabor, quantidade: item.quantidade, observacao: item.observacao }),
  })
  return { id: created.id as IdNum, kitId, sabor: created.sabor, quantidade: created.quantidade, observacao: created.observacao ?? undefined }
}

export async function addSalgado(kitId: IdNum, item: Omit<Salgado, 'id' | 'kitId'>): Promise<Salgado | undefined> {
  const created = await http<SrvItem>(`/kits/${Number(kitId)}/salgados`, {
    method: 'POST',
    body: JSON.stringify({ sabor: item.sabor, quantidade: item.quantidade, observacao: item.observacao }),
  })
  return { id: created.id as IdNum, kitId, sabor: created.sabor, quantidade: created.quantidade, observacao: created.observacao ?? undefined }
}

export async function addBolo(kitId: IdNum, item: Omit<Bolo, 'id' | 'kitId'>): Promise<Bolo | undefined> {
  const created = await http<SrvBolo>(`/kits/${Number(kitId)}/bolos`, {
    method: 'POST',
    body: JSON.stringify({ sabor: item.sabor, quantidade: item.quantidade, observacao: item.observacao, texto: item.texto }),
  })
  return { id: created.id as IdNum, kitId, sabor: created.sabor, quantidade: created.quantidade, observacao: created.observacao ?? undefined, texto: created.texto ?? undefined }
}

export async function removeItem(_kitId: IdNum, kind: 'doce' | 'salgado' | 'bolo', itemId: IdNum): Promise<void> {
  const map = { doce: '/doces', salgado: '/salgados', bolo: '/bolos' } as const
  await http(`${map[kind]}/${Number(itemId)}`, { method: 'DELETE' })
}

export async function updateItem(
  _kitId: IdNum,
  kind: 'doce' | 'salgado' | 'bolo',
  itemId: IdNum,
  patch: Partial<Doce & Salgado & Bolo>,
): Promise<void> {
  const map = { doce: '/doces', salgado: '/salgados', bolo: '/bolos' } as const
  await http(`${map[kind]}/${Number(itemId)}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

/** =============== STATUS / ENTREGUE =============== */
export async function setDone(kitId: IdNum, kind: 'doces' | 'salgados' | 'bolos', done: boolean) {
  await http(`/kits/${Number(kitId)}/status/${kind}`, {
    method: 'PATCH',
    body: JSON.stringify({ value: !!done }),
  })
}

// ✅ considera “feito” apenas as seções que existem (não vazias)
export function isAllDone(kit: Kit): boolean {
  const s = kit.status || { docesDone: false, salgadosDone: false, bolosDone: false }

  const hasDoces = (kit.doces?.length ?? 0) > 0
  const hasSalg  = (kit.salgados?.length ?? 0) > 0
  const hasBolos = (kit.bolos?.length ?? 0) > 0

  // força booleanos
  const docesDone    = Boolean(s.docesDone)
  const salgadosDone = Boolean(s.salgadosDone)
  const bolosDone    = Boolean(s.bolosDone)

  const docesOk    = !hasDoces || docesDone
  const salgadosOk = !hasSalg  || salgadosDone
  const bolosOk    = !hasBolos || bolosDone

  return docesOk && salgadosOk && bolosOk
}

export async function setEntregue(kitId: IdNum, value: boolean) {
  await http(`/kits/${Number(kitId)}/status/entregue`, {
    method: 'PATCH',
    body: JSON.stringify({ value: !!value }),
  })
}

export function isEntregue(kit: Kit): boolean {
  return Boolean((kit as any).entregue === true || (kit as any).entregue === 1)
}

export async function listEntregues(): Promise<Kit[]> {
  const data = await http<SrvKit[]>('/kits?entregues=true')
  return data.map(toFrontKit).sort((a: any, b: any) => (a.atualizadoEm < b.atualizadoEm ? 1 : -1))
}

export async function listNaoEntregues(): Promise<Kit[]> {
  const data = await http<SrvKit[]>('/kits?entregues=false')
  return data.map(toFrontKit).sort((a: any, b: any) => (a.atualizadoEm < b.atualizadoEm ? 1 : -1))
}
