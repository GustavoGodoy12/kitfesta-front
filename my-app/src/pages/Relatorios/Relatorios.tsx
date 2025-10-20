import React from 'react'
import { useNavigate } from 'react-router-dom'
import { KPI } from './components/KPI'
import { Card } from './components/Card'
import LineDia from './charts/LineDia'
import StackedByTipo from './charts/StackedByTipo'
import ItensCategoria from './charts/ItensCategoria'
import PieTipo from './charts/PieTipo'
import RankingSabores from './charts/RankingSabores'
import DistribuicaoSemana from './charts/DistribuicaoSemana'
import DistribuicaoHora from './charts/DistribuicaoHora'
import { COLORS } from './utils/colors'
import { formatDay, asItems } from './hooks/useRelatoriosData'
import { useRelatoriosData } from './hooks/useRelatoriosData'

export default function Relatorios() {
  const navigate = useNavigate()
  const today = formatDay(new Date())
  const firstDay = React.useMemo(() => { const dt = new Date(); dt.setDate(1); return formatDay(dt) }, [])

  const [start, setStart] = React.useState<string>(firstDay)
  const [end, setEnd] = React.useState<string>(today)
  const [showCumulative, setShowCumulative] = React.useState(true)

  const {
    loading, error, kits,
    seriesDia, itensPorCategoria, porTipo, saboresRanking, porDiaSemana, porHora,
    receitaReal, receitaEstimada,
    totalKits, totalItens, itensPorKit, pctEntrega,
    unitDoces, setUnitDoces, unitSalgados, setUnitSalgados, unitBolos, setUnitBolos,
    csvResumoPorDia,
  } = useRelatoriosData(start, end)

  const csvHref = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvResumoPorDia)
  const valorPainel = (receitaReal > 0 ? receitaReal : receitaEstimada)

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ margin: '0 0 4px', color: COLORS.secondary }}>Relatórios</h1>
      <p style={{ margin: 0, color: '#4b5563' }}>Resumo das vendas/entregas por período</p>

      {/* Filtros/Opções */}
      <div style={{ display:'flex', gap: 12, alignItems:'center', flexWrap:'wrap', margin:'16px 0 8px' }}>
        <label style={{ display:'inline-flex', alignItems:'center', gap: 8 }}>
          <span>De</span>
          <input type="date" value={start} onChange={e => setStart(e.target.value)} />
        </label>
        <label style={{ display:'inline-flex', alignItems:'center', gap: 8 }}>
          <span>até</span>
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
        </label>
        <button onClick={() => { const dt = new Date(); dt.setDate(1); setStart(formatDay(dt)); setEnd(formatDay(new Date())) }}>
          Este mês
        </button>
        <button onClick={() => navigate('/historico')}>Ir ao Histórico</button>
        <label style={{ display:'inline-flex', alignItems:'center', gap: 6, marginLeft: 12 }}>
          <input type="checkbox" checked={showCumulative} onChange={e => setShowCumulative(e.target.checked)} />
          <span>Mostrar linha acumulada</span>
        </label>
        <a href={csvHref} download={`resumo-${start}_a_${end}.csv`} style={{ marginLeft: 'auto' }}>
          Exportar CSV (por dia)
        </a>
      </div>

      {error && (
        <div style={{ background:'#fff1f2', color:'#991b1b', border:'1px solid #fecdd3', padding: 8, borderRadius: 8, marginBottom: 8 }}>
          {error}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, minmax(0, 1fr))', gap: 12, marginBottom: 12 }}>
        <KPI label="Total de kits" value={totalKits} />
        <KPI label="Itens (somatório)" value={totalItens} />
        <KPI label="Itens por kit" value={itensPorKit.toFixed(1)} />
        <KPI label="% Entrega" value={`${pctEntrega.toFixed(0)}%`} />
        <KPI
          label={receitaReal > 0 ? 'Receita (real)' : 'Receita (estimada)'}
          value={valorPainel.toLocaleString('pt-BR', { style:'currency', currency:'BRL' })}
        />
      </div>

      {/* Preços estimados (se não houver preço no kit) */}
      {receitaReal === 0 && (
        <div style={{ display:'flex', gap: 12, alignItems:'center', flexWrap:'wrap', margin:'0 0 12px' }}>
          <span style={{ color:'#6b7280' }}>Preços unitários p/ estimar receita:</span>
          <label>Doces <input type="number" min={0} step={0.01} value={unitDoces} onChange={e => setUnitDoces(Number(e.target.value))} style={{ width: 90 }} /></label>
          <label>Salgados <input type="number" min={0} step={0.01} value={unitSalgados} onChange={e => setUnitSalgados(Number(e.target.value))} style={{ width: 90 }} /></label>
          <label>Bolos <input type="number" min={0} step={0.01} value={unitBolos} onChange={e => setUnitBolos(Number(e.target.value))} style={{ width: 90 }} /></label>
          <span style={{ color:'#6b7280' }}>(usado somente quando o kit não tem valor numérico)</span>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:16 }}>
        <Card title="Kits entregues por dia">
          <LineDia data={seriesDia} showCumulative={showCumulative} />
        </Card>

        <Card title="Entregas por dia (Retirada x Entrega)">
          <StackedByTipo data={seriesDia} />
        </Card>

        <Card title="Itens vendidos por categoria">
          <ItensCategoria data={itensPorCategoria} />
        </Card>

        <Card title="Retirada vs Entrega">
          <PieTipo data={porTipo} />
        </Card>

        <Card title="Top 10 sabores (todas as categorias)">
          <RankingSabores data={saboresRanking} />
        </Card>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16 }}>
          <Card title="Distribuição por dia da semana">
            <DistribuicaoSemana data={porDiaSemana} />
          </Card>
          <Card title="Distribuição por hora">
            <DistribuicaoHora data={porHora} />
          </Card>
        </div>

        <Card title="Entregas no período">
          <TabelaEntregas
            loading={loading}
            kits={kits}
            unitDoces={unitDoces}
            unitSalgados={unitSalgados}
            unitBolos={unitBolos}
          />
        </Card>
      </div>
    </div>
  )
}

function TabelaEntregas({
  loading, kits, unitDoces, unitSalgados, unitBolos,
}: {
  loading: boolean
  kits: any[]
  unitDoces: number
  unitSalgados: number
  unitBolos: number
}) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ background:'#f9fafb' }}>
            <Th>Dia</Th>
            <Th>Hora</Th>
            <Th>Nome</Th>
            <Th>Tipo</Th>
            <Th style={{ textAlign:'right' }}>Itens</Th>
            <Th style={{ textAlign:'right' }}>Valor</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><Td colSpan={6}>Carregando…</Td></tr>
          ) : kits.length === 0 ? (
            <tr><Td colSpan={6}>Nenhuma entrega encontrada no período.</Td></tr>
          ) : (
            kits.map(k => {
              const doces = asItems((k as any).doces)
              const salgados = asItems((k as any).salgados)
              const bolos = asItems((k as any).bolos)
              const totalItens = [...doces, ...salgados, ...bolos].reduce((a, i) => a + (i?.quantidade || 0), 0)

              const asNumber = (x: any): number | null => {
                const n = typeof x === 'string' ? Number(x.replace(/[^0-9.,-]/g, '').replace(',', '.')) : Number(x)
                return Number.isFinite(n) ? n : null
              }
              const tryKitPrice = (k2: any): number | null =>
                asNumber(k2?.valorTotal) ?? asNumber(k2?.precoTotal) ?? asNumber(k2?.total) ?? asNumber(k2?.preco) ?? null

              const vReal = tryKitPrice(k)
              const vEst = vReal != null
                ? 0
                : (doces.reduce((s,i)=>s+i.quantidade,0)*unitDoces
                  + salgados.reduce((s,i)=>s+i.quantidade,0)*unitSalgados
                  + bolos.reduce((s,i)=>s+i.quantidade,0)*unitBolos)
              const valor = vReal != null ? vReal : vEst

              return (
                <tr key={k.id}>
                  <Td>{k.dataEvento || '—'}</Td>
                  <Td>{k.hora || '—'}</Td>
                  <Td>{k.nome || '—'}</Td>
                  <Td>{k.tipo === 'entrega' ? 'Entrega' : 'Retirada'}</Td>
                  <Td style={{ textAlign:'right' }}>{totalItens}</Td>
                  <Td style={{ textAlign:'right' }}>{Number(valor || 0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' })}</Td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, style }: any) {
  return (
    <th
      style={{
        textAlign:'left',
        fontWeight:600,
        padding:'8px 12px',
        borderBottom:`2px solid ${COLORS.primary}`,
        color:COLORS.secondary,
        ...style
      }}
    >
      {children}
    </th>
  )
}
function Td({ children, style, colSpan }: any) {
  return (
    <td
      style={{ padding:'8px 12px', borderBottom:'1px solid #f3f4f6', color:COLORS.secondary, ...style }}
      colSpan={colSpan}
    >
      {children}
    </td>
  )
}
