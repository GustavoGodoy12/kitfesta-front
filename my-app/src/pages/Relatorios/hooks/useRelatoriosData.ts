import { useEffect, useMemo, useState } from 'react'
import { listNaoEntregues } from '../../../data/kitsRepo' // troque por listEntregues quando existir
import type { Kit } from '../../../types/kit'
import { toCsv } from '../utils/csv'

export type Item = { sabor: string; quantidade: number }

const asNumber = (x: any): number | null => {
  const n = typeof x === 'string' ? Number(x.replace(/[^0-9.,-]/g, '').replace(',', '.')) : Number(x)
  return Number.isFinite(n) ? n : null
}
const tryKitPrice = (k: any): number | null =>
  asNumber(k?.valorTotal) ?? asNumber(k?.precoTotal) ?? asNumber(k?.total) ?? asNumber(k?.preco) ?? null

export function parseISO(iso?: string) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, (m - 1), d)
}
export function formatDay(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
export function eachDay(startIso?: string, endIso?: string) {
  const res: string[] = []
  const s = parseISO(startIso)
  const e = parseISO(endIso)
  if (!s || !e) return res
  const cur = new Date(s)
  while (cur <= e) { res.push(formatDay(cur)); cur.setDate(cur.getDate() + 1) }
  return res
}

export const asItems = (x: any): Item[] => {
  if (!x) return []
  if (Array.isArray(x)) return x as Item[]
  if (typeof x === 'object') {
    const maybeSingle = x as any
    if ('sabor' in maybeSingle || 'quantidade' in maybeSingle) return [maybeSingle as Item]
    return Object.values(maybeSingle) as Item[]
  }
  return []
}

// Carrega entregues (usa fallbacks até existir listEntregues real)
async function loadDelivered(start?: string, end?: string): Promise<Kit[]> {
  const anyWin = window as any
  if (typeof anyWin.__kits_listEntregues === 'function') return await anyWin.__kits_listEntregues(start, end)
  if (typeof anyWin.__kits_listHistorico === 'function') {
    const arr: Kit[] = await anyWin.__kits_listHistorico()
    return arr.filter(k => {
      const d = k.dataEvento || ''
      if (start && d < start) return false
      if (end && d > end) return false
      return true
    })
  }
  const pendentes = await listNaoEntregues() // didático
  return pendentes.filter(k => {
    const d = k.dataEvento || ''
    if (start && d < start) return false
    if (end && d > end) return false
    return true
  })
}

export function useRelatoriosData(start: string, end: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [kits, setKits] = useState<Kit[]>([])

  // preços unitários para estimar (se kit não tiver preço)
  const [unitDoces, setUnitDoces] = useState<number>(0)
  const [unitSalgados, setUnitSalgados] = useState<number>(0)
  const [unitBolos, setUnitBolos] = useState<number>(0)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true); setError('')
      try {
        const data = await loadDelivered(start, end)
        if (!alive) return
        setKits([...data].sort((a, b) => {
          const da = a.dataEvento || ''
          const db = b.dataEvento || ''
          if (da !== db) return da < db ? -1 : 1
          const ha = a.hora || ''
          const hb = b.hora || ''
          return ha < hb ? -1 : ha > hb ? 1 : 0
        }))
      } catch (e: any) {
        if (!alive) return
        setError(e?.message || 'Falha ao carregar relatórios.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [start, end])

  // ----- Agregações
  const seriesDia = useMemo(() => {
    const map: Record<string, { total: number; entrega: number; retirada: number }> = {}
    kits.forEach(k => {
      const d = k.dataEvento || '—'
      if (!map[d]) map[d] = { total: 0, entrega: 0, retirada: 0 }
      map[d].total += 1
      if (k.tipo === 'entrega') map[d].entrega += 1
      else map[d].retirada += 1
    })
    eachDay(start, end).forEach(d => { if (!map[d]) map[d] = { total: 0, entrega: 0, retirada: 0 } })
    let running = 0
    return Object.entries(map)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, v]) => { running += v.total; return ({ date, ...v, acumulado: running }) })
  }, [kits, start, end])

  const itensPorCategoria = useMemo(() => {
    let doces = 0, salgados = 0, bolos = 0
    kits.forEach(k => {
      asItems((k as any).doces).forEach(i => doces += (i?.quantidade || 0))
      asItems((k as any).salgados).forEach(i => salgados += (i?.quantidade || 0))
      asItems((k as any).bolos).forEach(i => bolos += (i?.quantidade || 0))
    })
    return [
      { name: 'Doces', value: doces },
      { name: 'Salgados', value: salgados },
      { name: 'Bolos', value: bolos },
    ]
  }, [kits])

  const porTipo = useMemo(() => {
    let retirada = 0, entrega = 0
    kits.forEach(k => { if (k.tipo === 'entrega') entrega++; else retirada++ })
    return [
      { name: 'Retirada', value: retirada },
      { name: 'Entrega', value: entrega },
    ]
  }, [kits])

  const saboresRanking = useMemo(() => {
    const map: Record<string, number> = {}
    kits.forEach(k => {
      ;[...asItems((k as any).doces), ...asItems((k as any).salgados), ...asItems((k as any).bolos)].forEach(i => {
        const key = i?.sabor || '—'
        map[key] = (map[key] || 0) + (i?.quantidade || 0)
      })
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [kits])

  const porDiaSemana = useMemo(() => {
    const map = new Array(7).fill(0) as number[] // 0=Domingo
    kits.forEach(k => {
      const d = parseISO(k.dataEvento)
      if (!d) return
      map[d.getDay()] += 1
    })
    const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    return labels.map((name, idx) => ({ name, value: map[idx] }))
  }, [kits])

  const porHora = useMemo(() => {
    const arr = new Array(24).fill(0)
    kits.forEach(k => {
      const hh = Number((k.hora || '').split(':')[0])
      if (Number.isFinite(hh) && hh >= 0 && hh <= 23) arr[hh] += 1
    })
    return arr.map((v, h) => ({ name: String(h).padStart(2, '0'), value: v }))
  }, [kits])

  // Receita real ou estimada
  const { receitaReal, receitaEstimada } = useMemo(() => {
    let real = 0
    let est = 0
    kits.forEach(k => {
      const p = tryKitPrice(k)
      if (p != null) real += p
      else {
        const doces = asItems((k as any).doces).reduce((s, i) => s + (i?.quantidade || 0), 0)
        const salg = asItems((k as any).salgados).reduce((s, i) => s + (i?.quantidade || 0), 0)
        const bol  = asItems((k as any).bolos).reduce((s, i) => s + (i?.quantidade || 0), 0)
        est += doces * unitDoces + salg * unitSalgados + bol * unitBolos
      }
    })
    return { receitaReal: real, receitaEstimada: est }
  }, [kits, unitDoces, unitSalgados, unitBolos])

  const totalKits = kits.length
  const totalItens = useMemo(() => itensPorCategoria.reduce((a, it) => a + it.value, 0), [itensPorCategoria])
  const itensPorKit = totalKits ? (totalItens / totalKits) : 0
  const pctEntrega = useMemo(() => {
    const t = porTipo.reduce((a, x) => a + x.value, 0) || 1
    const entr = porTipo.find(x => x.name === 'Entrega')?.value || 0
    return (entr / t) * 100
  }, [porTipo])

  const csvResumoPorDia = useMemo(() => {
    const rows = seriesDia.map(d => ({
      data: d.date, total: d.total, retirada: d.retirada, entrega: d.entrega, acumulado: d.acumulado
    }))
    return toCsv(rows)
  }, [seriesDia])

  return {
    loading, error, kits,
    seriesDia, itensPorCategoria, porTipo, saboresRanking, porDiaSemana, porHora,
    receitaReal, receitaEstimada,
    totalKits, totalItens, itensPorKit, pctEntrega,
    unitDoces, setUnitDoces, unitSalgados, setUnitSalgados, unitBolos, setUnitBolos,
    csvResumoPorDia,
  }
}
