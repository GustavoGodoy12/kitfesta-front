import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  addBolo,
  addDoce,
  addSalgado,
  getKit,
  removeItem,
  saveKit,
  updateItem,
} from '../../../data/kitsRepo'
import type { Bolo, Doce, Salgado, Kit } from '../../../types/kit'
import {
  Actions,
  Back,
  BoloFormGrid,
  Card,
  GridTwo,
  HeaderGrid,
  Input,
  ItemForm,
  ItemList,
  ItemRow,
  Label,
  SmallMuted,
  Subtitle,
  Title,
} from './KitDetail.styled'

export default function KitDetail() {
  const { kitId } = useParams<{ kitId: string }>()
  const navigate = useNavigate()
  const [kit, setKit] = useState<Kit | null>(null)
  const [loading, setLoading] = useState(true)

  // carrega o kit e expõe um helper para recarregar
  async function reload(id: number) {
    const k = await getKit(id)
    setKit(k ?? null)
  }

  useEffect(() => {
    const idNum = Number(kitId)
    if (!kitId || !Number.isFinite(idNum) || idNum <= 0) {
      navigate('/kits')
      return
    }
    ;(async () => {
      setLoading(true)
      await reload(idNum)
      setLoading(false)
    })()
  }, [kitId, navigate])

  const totais = useMemo(() => {
    if (!kit) return { doces: 0, salgados: 0, bolos: 0 }
    const doces = (kit.doces ?? []).reduce((acc, d) => acc + (Number(d.quantidade) || 0), 0)
    const salgados = (kit.salgados ?? []).reduce((acc, s) => acc + (Number(s.quantidade) || 0), 0)
    const bolos = (kit.bolos ?? []).reduce((acc, b) => acc + (Number(b.quantidade) || 0), 0)
    return { doces, salgados, bolos }
  }, [kit])

  async function persist(next: Kit) {
    await saveKit(next)
    setKit({ ...next })
  }

  function parsePrecoInput(value: string): number {
    const normalized = (value || '').replace(/\s/g, '').replace(',', '.')
    const n = Number(normalized)
    return Number.isFinite(n) ? n : 0
  }

  async function handleHeaderUpdate(field: 'nome' | 'cliente' | 'dataEvento' | 'preco', value: string) {
    if (!kit) return
    const next = {
      ...kit,
      [field]: field === 'preco' ? parsePrecoInput(value) : value,
    }
    await persist(next)
  }

  if (loading) return <Subtitle>Carregando…</Subtitle>
  if (!kit) return (
    <>
      <Back to="/kits">← Voltar</Back>
      <Title>Kit não encontrado</Title>
      <Subtitle>O kit pode ter sido removido. Volte à lista e tente novamente.</Subtitle>
    </>
  )

  return (
    <>
      <Back to="/kits">← Voltar</Back>
      <Title>{kit.nome} <SmallMuted>· ID: {kit.id}</SmallMuted></Title>
      <Subtitle>Cliente: {kit.cliente || '—'} · Evento: {kit.dataEvento || '—'}</Subtitle>

      <Card>
        <HeaderGrid>
          <div>
            <Label>Nome do kit</Label>
            <Input value={kit.nome} onChange={e => handleHeaderUpdate('nome', e.target.value)} />
          </div>
          <div>
            <Label>Cliente</Label>
            <Input value={kit.cliente || ''} onChange={e => handleHeaderUpdate('cliente', e.target.value)} />
          </div>
          <div>
            <Label>Data do evento</Label>
            <Input type="date" value={kit.dataEvento || ''} onChange={e => handleHeaderUpdate('dataEvento', e.target.value)} />
          </div>
          <div>
            <Label>Preço (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={typeof kit.preco === 'number' ? kit.preco.toFixed(2) : ''}
              onChange={e => handleHeaderUpdate('preco', e.target.value)}
              placeholder="Ex.: 49,90"
            />
          </div>
          <div style={{ alignSelf: 'end' }}>
            <SmallMuted>Totais — Doces: {totais.doces} · Salgados: {totais.salgados} · Bolo: {totais.bolos}</SmallMuted>
          </div>
        </HeaderGrid>
      </Card>

      <GridTwo>
        <ItensSection
          titulo="Doces"
          placeholderSabor="Brigadeiro, Beijinho, etc."
          items={kit.doces}
          onAdd={async (novo) => { await addDoce(kit.id, novo); await reload(kit.id) }}
          onRemove={async (id) => { await removeItem(kit.id, 'doce', id as any); await reload(kit.id) }}
          onUpdate={async (id, patch) => { await updateItem(kit.id, 'doce', id as any, patch); await reload(kit.id) }}
        />
        <ItensSection
          titulo="Salgados"
          placeholderSabor="Coxinha, Kibe, Empada…"
          items={kit.salgados}
          onAdd={async (novo) => { await addSalgado(kit.id, novo); await reload(kit.id) }}
          onRemove={async (id) => { await removeItem(kit.id, 'salgado', id as any); await reload(kit.id) }}
          onUpdate={async (id, patch) => { await updateItem(kit.id, 'salgado', id as any, patch); await reload(kit.id) }}
        />
      </GridTwo>

      <Card style={{ marginTop: 16 }}>
        <h2>Bolo</h2>
        <BoloCreate kitId={kit.id} onAfterChange={() => reload(kit.id)} />
        <ItemTable
          items={kit.bolos}
          extra={(b: Bolo) => <SmallMuted>{b.texto ? `“${b.texto}”` : ''}</SmallMuted>}
          onRemove={async (id) => { await removeItem(kit.id, 'bolo', id as any); await reload(kit.id) }}
          onUpdate={async (id, patch) => { await updateItem(kit.id, 'bolo', id as any, patch); await reload(kit.id) }}
        />
      </Card>
    </>
  )
}

/* ---------- Componentes auxiliares ---------- */

function ItensSection(props: {
  titulo: string
  placeholderSabor: string
  items: (Doce | Salgado)[]
  onAdd: (novo: Omit<Doce, 'id' | 'kitId'>) => Promise<void> | void
  onRemove: (id: number) => Promise<void> | void
  onUpdate: (id: number, patch: Partial<Doce>) => Promise<void> | void
}) {
  const { titulo, placeholderSabor, items, onAdd, onRemove, onUpdate } = props
  const [sabor, setSabor] = useState('')
  const [quantidade, setQuantidade] = useState<number>(0)
  const [observacao, setObservacao] = useState('')
  const [adding, setAdding] = useState(false)

  async function add(e: FormEvent) {
    e.preventDefault()
    if (adding) return
    const s = sabor.trim()
    const q = Number(quantidade) || 0
    if (!s || q <= 0) return
    setAdding(true)
    await onAdd({ sabor: s, quantidade: q, observacao: observacao.trim() || undefined })
    setSabor('')
    setQuantidade(0)
    setObservacao('')
    setAdding(false)
  }

  return (
    <Card>
      <h2>{titulo}</h2>
      <ItemForm onSubmit={add}>
        <Input placeholder={placeholderSabor} value={sabor} onChange={e => setSabor(e.target.value)} />
        <Input type="number" placeholder="Qtd" value={quantidade || ''} onChange={e => setQuantidade(Number(e.target.value))} />
        <Input placeholder="Observação (opcional)" value={observacao} onChange={e => setObservacao(e.target.value)} />
        <button type="submit" disabled={adding}>Adicionar</button>
      </ItemForm>
      <ItemTable items={items} onRemove={onRemove} onUpdate={onUpdate} />
    </Card>
  )
}

function ItemTable(props: {
  items: (Doce | Salgado | Bolo)[]
  onRemove: (id: number) => Promise<void> | void
  onUpdate: (id: number, patch: Partial<Doce & Salgado & Bolo>) => Promise<void> | void
  extra?: (item: any) => React.ReactNode
}) {
  const { items, onRemove, onUpdate, extra } = props
  if (!items || items.length === 0) return <Subtitle style={{ marginTop: 8 }}>Nenhum item adicionado.</Subtitle>

  return (
    <ItemList>
      {items.map(it => (
        <ItemRow key={it.id}>
          <Input value={it.sabor} onChange={e => onUpdate(it.id as any, { sabor: e.target.value })} />
          <Input type="number" value={it.quantidade} onChange={e => onUpdate(it.id as any, { quantidade: Number(e.target.value) })} />
          <Input value={(it as any).observacao || ''} onChange={e => onUpdate(it.id as any, { observacao: e.target.value })} placeholder="Observação" />
          <Actions className="actions">
            {extra ? extra(it) : null}
            <button onClick={() => onRemove(it.id as any)}>Remover</button>
          </Actions>
        </ItemRow>
      ))}
    </ItemList>
  )
}

function BoloCreate(props: { kitId: number; onAfterChange: () => void }) {
  const { kitId, onAfterChange } = props
  const [sabor, setSabor] = useState('')
  const [quantidade, setQuantidade] = useState<number>(1)
  const [texto, setTexto] = useState('')

  async function add(e: FormEvent) {
    e.preventDefault()
    if (!sabor.trim() || quantidade <= 0) return
    await addBolo(kitId, { sabor: sabor.trim(), quantidade, texto: texto.trim() || undefined })
    setSabor(''); setQuantidade(1); setTexto('')
    onAfterChange()
  }

  return (
    <BoloFormGrid onSubmit={add}>
      <Input placeholder="Sabor do bolo" value={sabor} onChange={e => setSabor(e.target.value)} />
      <Input type="number" placeholder="Qtd" value={quantidade || ''} onChange={e => setQuantidade(Number(e.target.value))} />
      <Input placeholder="Texto no bolo (opcional)" value={texto} onChange={e => setTexto(e.target.value)} />
      <button type="submit">Adicionar</button>
    </BoloFormGrid>
  )
}
