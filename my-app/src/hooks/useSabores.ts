// src/hooks/useSabores.ts
import { useEffect, useState } from 'react'
import { listSaboresPorTipo } from '../data/productsApi'

// fallback local (caso API caia)
const FALLBACK = {
  doces: ['BRIGADEIRO', 'BEIJINHO', 'CAJUZINHO'],
  salgados: ['COXINHA DE FRANGO', 'QUIBE', 'PASTEL DE CARNE'],
  bolos: ['FLORESTA NEGRA', 'BRIGADEIRO', 'PRESTÍGIO'],
}

export function useSabores() {
  const [doces, setDoces] = useState<string[]>([])
  const [salgados, setSalgados] = useState<string[]>([])
  const [bolos, setBolos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { doces, salgados, bolos } = await listSaboresPorTipo()
        if (!alive) return
        setDoces(doces.length ? doces : FALLBACK.doces)
        setSalgados(salgados.length ? salgados : FALLBACK.salgados)
        setBolos(bolos.length ? bolos : FALLBACK.bolos)
        setError(null)
      } catch (e: any) {
        if (!alive) return
        setDoces(FALLBACK.doces)
        setSalgados(FALLBACK.salgados)
        setBolos(FALLBACK.bolos)
        setError(e?.message || 'Erro ao carregar produtos')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  return { doces, salgados, bolos, loading, error }
}
