// src/components/KitCard/KitItemsEditor/KitItemsEditor.tsx
import { useEffect, useMemo, useState } from 'react'
import type { Kit, Doce, Salgado, Bolo, IdNum } from '../../../types/kit'
import {
  addDoce,
  addSalgado,
  addBolo,
  updateItem,
  removeItem,
  getKit,
} from '../../../data/kitsRepo'
import {
  ModalOverlay,
  ModalCard,
  ModalTitle,
  ModalGrid,
  Divider,
  Label,
  Button,
  Field,
  Select,
  Input,
  BadgeList,
} from '../../../pages/Kit/Kits.styled'
import { CardActions, Muted } from '../KitCard.styled'

type Props = {
  open: boolean
  kit: Kit | null
  onClose: () => void
  onChanged?: () => void // para dar refresh na tela de kits ao salvar
}

const DOCES = ['Brigadeiro', 'Beijinho', 'Cajuzinho', 'Olho de Sogra', 'Casadinho']
const SALGADOS = ['Coxinha', 'Kibe', 'Empada', 'Quibe Assado', 'Enroladinho']
const BOLOS = ['Chocolate', 'Floresta Negra', 'Ninho com Morango', 'Red Velvet', 'Prestígio']

// Tipos de rascunho (id opcional para novos itens)
type DraftDoce = Omit<Doce, 'id'> & { id?: IdNum }
type DraftSalgado = Omit<Salgado, 'id'> & { id?: IdNum }
type DraftBolo = Omit<Bolo, 'id'> & { id?: IdNum }

export default function KitItemsEditor({ open, kit, onClose, onChanged }: Props) {
  // selects para “adicionar”
  const [doceSel, setDoceSel] = useState(DOCES[0])
  const [doceQtd, setDoceQtd] = useState(10)

  const [salgadoSel, setSalgadoSel] = useState(SALGADOS[0])
  const [salgadoQtd, setSalgadoQtd] = useState(10)

  const [boloSel, setBoloSel] = useState(BOLOS[0])
  const [boloQtd, setBoloQtd] = useState(1)
  const [boloTexto, setBoloTexto] = useState('')

  // estado do kit carregado do backend (snapshot original)
  const [originalKit, setOriginalKit] = useState<Kit | null>(null)

  // drafts editáveis localmente
  const [draftDoces, setDraftDoces] = useState<DraftDoce[]>([])
  const [draftSalgados, setDraftSalgados] = useState<DraftSalgado[]>([])
  const [draftBolos, setDraftBolos] = useState<DraftBolo[]>([])

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // carregar dados atuais quando abrir/trocar o kit
  useEffect(() => {
    let alive = true
    ;(async () => {
      if (!open || !kit) {
        if (alive) {
          setOriginalKit(null)
          setDraftDoces([])
          setDraftSalgados([])
          setDraftBolos([])
        }
        return
      }
      setLoading(true)
      try {
        const fresh = await getKit(kit.id)
        const k = fresh ?? kit
        if (!alive) return
        setOriginalKit(k)
        setDraftDoces((k.doces ?? []).map(d => ({ ...d })))
        setDraftSalgados((k.salgados ?? []).map(s => ({ ...s })))
        setDraftBolos((k.bolos ?? []).map(b => ({ ...b })))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [open, kit?.id])

  const canEdit = useMemo(() => !!originalKit, [originalKit])
  if (!open || !originalKit) return null

  // helpers de edição local
  function removeFrom<T>(arr: T[], idx: number, setter: (v: T[]) => void) {
    const copy = [...arr]
    copy.splice(idx, 1)
    setter(copy)
  }

  function setQty<T extends { quantidade: number }>(
    arr: T[],
    setter: (v: T[]) => void,
    idx: number,
    qty: number,
  ) {
    const copy = [...arr]
    copy[idx] = { ...copy[idx], quantidade: qty }
    setter(copy)
  }

  // ===== SALVAR (aplica diff no backend) =====
  async function onSave() {
    if (!originalKit) return
    setSaving(true)
    try {
      // ------- DOCES -------
      {
        const origById = new Map<IdNum, Doce>((originalKit.doces ?? []).map(d => [d.id, d]))
        const draftById = new Map<IdNum, DraftDoce>(
          (draftDoces.filter(d => d.id !== undefined) as (DraftDoce & { id: IdNum })[])
            .map(d => [d.id as IdNum, d])
        )

        // DELETE
        for (const id of origById.keys()) {
          if (!draftById.has(id)) {
            await removeItem(originalKit.id, 'doce', id)
          }
        }
        // PATCH
        for (const id of draftById.keys()) {
          const d = draftById.get(id)!
          const o = origById.get(id)
          if (o && (o.quantidade !== d.quantidade || o.sabor !== d.sabor || o.observacao !== d.observacao)) {
            await updateItem(originalKit.id, 'doce', id, {
              quantidade: d.quantidade,
              sabor: d.sabor,
              observacao: d.observacao,
            })
          }
        }
        // POST (novos sem id)
        for (const d of draftDoces) {
          if (d.id === undefined) {
            await addDoce(originalKit.id, {
              sabor: d.sabor,
              quantidade: d.quantidade,
              observacao: d.observacao,
            })
          }
        }
      }

      // ------- SALGADOS -------
      {
        const origById = new Map<IdNum, Salgado>((originalKit.salgados ?? []).map(s => [s.id, s]))
        const draftById = new Map<IdNum, DraftSalgado>(
          (draftSalgados.filter(s => s.id !== undefined) as (DraftSalgado & { id: IdNum })[])
            .map(s => [s.id as IdNum, s])
        )

        for (const id of origById.keys()) {
          if (!draftById.has(id)) {
            await removeItem(originalKit.id, 'salgado', id)
          }
        }
        for (const id of draftById.keys()) {
          const s = draftById.get(id)!
          const o = origById.get(id)
          if (o && (o.quantidade !== s.quantidade || o.sabor !== s.sabor || o.observacao !== s.observacao)) {
            await updateItem(originalKit.id, 'salgado', id, {
              quantidade: s.quantidade,
              sabor: s.sabor,
              observacao: s.observacao,
            })
          }
        }
        for (const s of draftSalgados) {
          if (s.id === undefined) {
            await addSalgado(originalKit.id, {
              sabor: s.sabor,
              quantidade: s.quantidade,
              observacao: s.observacao,
            })
          }
        }
      }

      // ------- BOLOS -------
      {
        const origById = new Map<IdNum, Bolo>((originalKit.bolos ?? []).map(b => [b.id, b]))
        const draftById = new Map<IdNum, DraftBolo>(
          (draftBolos.filter(b => b.id !== undefined) as (DraftBolo & { id: IdNum })[])
            .map(b => [b.id as IdNum, b])
        )

        for (const id of origById.keys()) {
          if (!draftById.has(id)) {
            await removeItem(originalKit.id, 'bolo', id)
          }
        }
        for (const id of draftById.keys()) {
          const b = draftById.get(id)!
          const o = origById.get(id)
          if (
            o &&
            (o.quantidade !== b.quantidade || o.sabor !== b.sabor || o.observacao !== b.observacao || o.texto !== b.texto)
          ) {
            await updateItem(originalKit.id, 'bolo', id, {
              quantidade: b.quantidade,
              sabor: b.sabor,
              observacao: b.observacao,
              texto: b.texto,
            })
          }
        }
        for (const b of draftBolos) {
          if (b.id === undefined) {
            await addBolo(originalKit.id, {
              sabor: b.sabor,
              quantidade: b.quantidade,
              observacao: b.observacao,
              texto: b.texto,
            })
          }
        }
      }

      // recarrega e fecha
      const fresh = await getKit(originalKit.id)
      if (fresh) setOriginalKit(fresh)
      onChanged?.()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  // ===== CANCELAR: descarta mudanças e fecha =====
  function onCancel() {
    onClose()
  }

  return (
    <ModalOverlay onMouseDown={onCancel}>
      <ModalCard
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 820 }}
      >
        <ModalTitle>Editar itens do kit</ModalTitle>

        <div style={{ marginBottom: 6 }}>
          <strong style={{ fontSize: '1.05rem' }}>
            {originalKit.nome} <Muted>· ID: {originalKit.id}</Muted>
          </strong>
        </div>

        {loading && <Muted>Carregando itens…</Muted>}

        {/* ===================== DOCES ===================== */}
        <h4 style={{ margin: '8px 0' }}>Doces</h4>

        <ModalGrid>
          <Field>
            <Label>Doce (sabor)</Label>
            <Select value={doceSel} onChange={e => setDoceSel(e.target.value)}>
              {DOCES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </Select>
          </Field>
          <Field>
            <Label>Quantidade</Label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="range" min={0} max={200} step={1} value={doceQtd} onChange={e => setDoceQtd(Number(e.target.value))} />
              <output>{doceQtd}</output>
            </div>
          </Field>
          <CardActions>
            <Button
              disabled={!canEdit}
              onClick={() => {
                setDraftDoces(prev => [...prev, { kitId: originalKit.id, sabor: doceSel, quantidade: doceQtd }])
                setDoceQtd(0)
              }}
            >
              Adicionar doce
            </Button>
          </CardActions>

          <Field style={{ gridColumn: '1 / -1' }}>
            <BadgeList>
              {(draftDoces?.length ?? 0) === 0 && <Muted>Nenhum doce.</Muted>}
              {(draftDoces ?? []).map((d, i) => (
                <span className="badge" key={d.id ?? `new-${i}`} style={{ gap: 6 }}>
                  <strong>{d.sabor}</strong>
                  <span>·</span>
                  <input
                    type="number"
                    min={0}
                    value={d.quantidade}
                    onChange={e => setQty(draftDoces, setDraftDoces, i, Number(e.target.value) || 0)}
                    style={{ width: 70 }}
                    aria-label="Quantidade"
                  />
                  <button
                    className="remove"
                    title="Remover"
                    onClick={() => removeFrom(draftDoces, i, setDraftDoces)}
                  >×</button>
                </span>
              ))}
            </BadgeList>
          </Field>
        </ModalGrid>

        <Divider />

        {/* ===================== SALGADOS ===================== */}
        <h4 style={{ margin: '8px 0' }}>Salgados</h4>

        <ModalGrid>
          <Field>
            <Label>Salgado (sabor)</Label>
            <Select value={salgadoSel} onChange={e => setSalgadoSel(e.target.value)}>
              {SALGADOS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </Select>
          </Field>
          <Field>
            <Label>Quantidade</Label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="range" min={0} max={500} step={5} value={salgadoQtd} onChange={e => setSalgadoQtd(Number(e.target.value))} />
              <output>{salgadoQtd}</output>
            </div>
          </Field>
          <CardActions>
            <Button
              disabled={!canEdit}
              onClick={() => {
                setDraftSalgados(prev => [...prev, { kitId: originalKit.id, sabor: salgadoSel, quantidade: salgadoQtd }])
              }}
            >
              Adicionar salgado
            </Button>
          </CardActions>

          <Field style={{ gridColumn: '1 / -1' }}>
            <BadgeList>
              {(draftSalgados?.length ?? 0) === 0 && <Muted>Nenhum salgado.</Muted>}
              {(draftSalgados ?? []).map((s, i) => (
                <span className="badge" key={s.id ?? `new-${i}`} style={{ gap: 6 }}>
                  <strong>{s.sabor}</strong>
                  <span>·</span>
                  <input
                    type="number"
                    min={0}
                    value={s.quantidade}
                    onChange={e => setQty(draftSalgados, setDraftSalgados, i, Number(e.target.value) || 0)}
                    style={{ width: 70 }}
                    aria-label="Quantidade"
                  />
                  <button
                    className="remove"
                    title="Remover"
                    onClick={() => removeFrom(draftSalgados, i, setDraftSalgados)}
                  >×</button>
                </span>
              ))}
            </BadgeList>
          </Field>
        </ModalGrid>

        <Divider />

        {/* ===================== BOLOS ===================== */}
        <h4 style={{ margin: '8px 0' }}>Bolos</h4>

        <ModalGrid>
          <Field>
            <Label>Bolo (sabor)</Label>
            <Select value={boloSel} onChange={e => setBoloSel(e.target.value)}>
              {BOLOS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </Select>
          </Field>

          <Field>
            <Label>Quantidade</Label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="range" min={0} max={20} step={1} value={boloQtd} onChange={e => setBoloQtd(Number(e.target.value))} />
              <output>{boloQtd}</output>
            </div>
          </Field>

          <Field>
            <Label>Texto no bolo (opcional)</Label>
            <Input placeholder="Ex.: Parabéns Janine!" value={boloTexto} onChange={e => setBoloTexto(e.target.value)} />
          </Field>

          <CardActions>
            <Button
              disabled={!canEdit}
              onClick={() => {
                setDraftBolos(prev => [
                  ...prev,
                  { kitId: originalKit.id, sabor: boloSel, quantidade: boloQtd, texto: boloTexto.trim() || undefined },
                ])
                setBoloTexto('')
              }}
            >
              Adicionar bolo
            </Button>
          </CardActions>

          <Field style={{ gridColumn: '1 / -1' }}>
            <BadgeList>
              {(draftBolos?.length ?? 0) === 0 && <Muted>Nenhum bolo.</Muted>}
              {(draftBolos ?? []).map((b, i) => (
                <span className="badge" key={b.id ?? `new-${i}`} style={{ gap: 6 }}>
                  <strong>{b.sabor}</strong>
                  <span>·</span>
                  <input
                    type="number"
                    min={0}
                    value={b.quantidade}
                    onChange={e => setQty(draftBolos, setDraftBolos, i, Number(e.target.value) || 0)}
                    style={{ width: 70 }}
                    aria-label="Quantidade"
                  />
                  <input
                    type="text"
                    value={b.texto || ''}
                    onChange={e => {
                      const copy = [...draftBolos]
                      copy[i] = { ...copy[i], texto: e.target.value }
                      setDraftBolos(copy)
                    }}
                    placeholder="Texto no bolo"
                    style={{ width: 180 }}
                    aria-label="Texto no bolo"
                  />
                  <button
                    className="remove"
                    title="Remover"
                    onClick={() => removeFrom(draftBolos, i, setDraftBolos)}
                  >×</button>
                </span>
              ))}
            </BadgeList>
          </Field>
        </ModalGrid>

        <Divider />

        <CardActions style={{ justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onCancel} type="button">Cancelar</Button>
          <Button onClick={onSave} disabled={saving || loading} type="button">
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </CardActions>
      </ModalCard>
    </ModalOverlay>
  )
}
