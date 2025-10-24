import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import {
  createKit,
  deleteKit,
  listNaoEntregues,
  addDoce,
  addSalgado,
  addBolo,
  isAllDone,
  saveKit,
  setEntregue,
  listKits,
} from '../../data/kitsRepo'
import type { Kit } from '../../types/kit'
import {
  Actions,
  BadgeList,
  Button,
  Divider,
  Field,
  FormGrid,
  GridCards,
  Input,
  Label,
  LeftGroup,
  ModalCard,
  ModalGrid,
  ModalOverlay,
  ModalTitle,
  Page,
  RightGroup,
  Subtitle,
  Title,
  TopBar,
} from './Kits.styled'
import KitCard from '../../components/KitCard/KitCard'
import KitInfoModal from '../../components/KitCard/KitInfoModal'
import KitItemsEditor from '../../components/KitCard/KitItemsEditor/KitItemsEditor'
import { useSabores } from '../../hooks/useSabores'
import { todayLocalISO } from '../../utils/date'

// rascunho de itens iniciais (somente criação)
type NewItem = { sabor: string; quantidade: number }
type NewBolo = NewItem & { texto?: string }

/* ================= helpers de busca ================= */
function norm(s: string) {
  return (s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}
function matchesNome(kit: { nome?: string }, query: string) {
  const q = norm(query)
  if (!q) return true
  const name = norm(kit.nome || '')
  const tokens = q.split(' ').filter(Boolean)
  return tokens.every(tok => name.includes(tok))
}
function onlyDigits(s: string) {
  return (s || '').replace(/\D/g, '')
}
function isoDateOnly(d: string | null | undefined) {
  if (!d) return ''
  const t = String(d)
  if (t.length >= 10) return t.slice(0, 10)
  return t
}
/* ==================================================== */

export default function Kits() {
  

  const { doces: DOCES, salgados: SALGADOS, bolos: BOLOS } = useSabores()

  // ===== estado geral / filtros =====
  const [refresh, setRefresh] = useState(0)
  const [orderAsc, setOrderAsc] = useState<boolean>(true)

  // Busca (filtros simplificados)
  const [qNome, setQNome] = useState('')      // nome
  const [qNumero, setQNumero] = useState('')  // id (número)

  // modal criar/editar
  const [openModal, setOpenModal] = useState(false)
  const [editingKitId, setEditingKitId] = useState<number | null>(null)

  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')

  // modal info / itens
  const [openInfo, setOpenInfo] = useState(false)
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null)
  const [openItems, setOpenItems] = useState(false)
  const [itemsKit, setItemsKit] = useState<Kit | null>(null)

  // form (create/edit)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [dia, setDia] = useState<string>('')
  const [hora, setHora] = useState<string>('')
  const [tipo, setTipo] = useState<'retirada' | 'entrega'>('retirada')
  const [endereco, setEndereco] = useState('')
  const [precoStr, setPrecoStr] = useState('')

  // itens iniciais (criação)
  const [doceSel, setDoceSel] = useState<string>('')
  const [doceQtd, setDoceQtd] = useState(10)
  const [doces, setDoces] = useState<NewItem[]>([])

  const [salgadoSel, setSalgadoSel] = useState<string>('')
  const [salgadoQtd, setSalgadoQtd] = useState(10)
  const [salgados, setSalgados] = useState<NewItem[]>([])

  const [boloSel, setBoloSel] = useState<string>('')
  const [boloQtd, setBoloQtd] = useState(1)
  const [boloTexto, setBoloTexto] = useState('')
  const [bolos, setBolos] = useState<NewBolo[]>([])

  // ===== dados =====
  const [kitsRaw, setKitsRaw] = useState<Kit[]>([])  // somente não entregues
  const [doneToday, setDoneToday] = useState<Kit[]>([]) // entregues/retirados hoje
  const [loading, setLoading] = useState(false)
  const [loadErr, setLoadErr] = useState('')

  const todayISO = todayLocalISO()

  // carrega não entregues + “finalizados hoje” do backend
  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true); setLoadErr('')
      try {
        const [naoEntregues, all] = await Promise.all([
          listNaoEntregues(),
          listKits(),
        ])
        if (!alive) return
        setKitsRaw(naoEntregues)

        // finalizados hoje: entregue === 1 E atualizadoEm (data) === hoje
        const finals = (all || []).filter(k =>
          Number(k.entregue) === 1 &&
          isoDateOnly(k.atualizadoEm) === todayISO
        )
        setDoneToday(finals)
      } catch (e: any) {
        if (alive) setLoadErr(e?.message || 'Falha ao carregar kits')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [refresh])

  // ===== Helpers de atraso =====
  function isSameDay(d?: string, isoDay?: string) {
    return (d || '') === (isoDay || '')
  }
  function isOverdue(k: Kit) {
    const d = k.dataEvento
    if (!d) return false
    const now = new Date()
    if (d < todayISO) return true
    if (d > todayISO) return false
    const [h, m] = (k.hora || '23:59').split(':').map(Number)
    const cmp = new Date()
    cmp.setHours(h || 23, m || 59, 0, 0)
    return cmp.getTime() < now.getTime()
  }

  // ===== Alertas do dia =====
  const { totalHoje, atrasadosHoje } = useMemo(() => {
    const hoje = kitsRaw.filter(k => isSameDay(k.dataEvento, todayISO))
    const atras = hoje.filter(k => isOverdue(k))
    return { totalHoje: hoje.length, atrasadosHoje: atras.length }
  }, [kitsRaw])

  // ===== Busca (nome, número) + ordenação =====
  const kitsFilteredSorted = useMemo(() => {
    let arr = [...kitsRaw]

    const numQuery = onlyDigits(qNumero)
    if (numQuery.length > 0) {
      arr = arr.filter(k => String(k.id).includes(numQuery))
    }

    if (qNome.trim()) {
      arr = arr.filter(k => matchesNome({ nome: k.nome }, qNome))
    }

    arr.sort((a, b) => {
      const ha = a.hora || ''
      const hb = b.hora || ''
      if (ha === hb) return 0
      const cmp = ha < hb ? -1 : 1
      return orderAsc ? cmp : -cmp
    })
    return arr
  }, [kitsRaw, qNome, qNumero, orderAsc])

  // mesma busca aplicada à seção “finalizados hoje”
  const doneTodayFiltered = useMemo(() => {
    let arr = [...doneToday]

    const numQuery = onlyDigits(qNumero)
    if (numQuery.length > 0) {
      arr = arr.filter(k => String(k.id).includes(numQuery))
    }
    if (qNome.trim()) {
      arr = arr.filter(k => matchesNome({ nome: k.nome }, qNome))
    }
    arr.sort((a, b) => {
      const ha = a.hora || ''
      const hb = b.hora || ''
      if (ha === hb) return 0
      const cmp = ha < hb ? -1 : 1
      return orderAsc ? cmp : -cmp
    })
    return arr
  }, [doneToday, qNome, qNumero, orderAsc])

  function resetModal() {
    setEditingKitId(null)
    setNome(''); setTelefone(''); setEmail(''); setDia(''); setHora('')
    setTipo('retirada'); setEndereco(''); setPrecoStr('')
    setDoces([]); setSalgados([]); setBolos([])
    setDoceSel(DOCES[0] || ''); setDoceQtd(10)
    setSalgadoSel(SALGADOS[0] || ''); setSalgadoQtd(10)
    setBoloSel(BOLOS[0] || ''); setBoloQtd(1); setBoloTexto('')
    setErrorMsg(''); setSaving(false)
  }

  function removeFrom<T>(list: T[], idx: number, setter: (v: T[]) => void) {
    const copy = [...list]; copy.splice(idx, 1); setter(copy)
  }

  function parsePreco(str: string): number {
    const normalized = (str || '').replace(/\s/g, '').replace(',', '.')
    const n = Number(normalized)
    return Number.isFinite(n) ? n : NaN
  }

  async function onCreateOrEdit(e: FormEvent) {
    e.preventDefault()
    if (saving) return
    setSaving(true); setErrorMsg(''); setSuccessMsg('')
    try {
      if (!nome.trim() || !telefone.trim() || !tipo) throw new Error('Preencha nome, telefone e tipo.')
      if (tipo === 'entrega' && !endereco.trim()) throw new Error('Endereço é obrigatório para entrega.')
      const precoNum = parsePreco(precoStr)
      if (!editingKitId && (!Number.isFinite(precoNum) || precoNum < 0)) throw new Error('Informe um preço válido (ex.: 49,90).')

      if (editingKitId) {
        const kit = kitsRaw.find(k => k.id === editingKitId)
        if (!kit) throw new Error('Kit não encontrado.')
        await saveKit({
          ...kit,
          nome: nome.trim(),
          telefone: telefone.trim(),
          email: email.trim() || undefined,
          dataEvento: dia || undefined,
          hora: hora || undefined,
          tipo,
          endereco: tipo === 'entrega' ? endereco.trim() : undefined,
          ...(precoStr.trim() !== '' ? { preco: precoNum } : {}),
        })
      } else {
        const kit = await createKit({
          nome: nome.trim(),
          telefone: telefone.trim(),
          email: email.trim() || undefined,
          dataEvento: dia || undefined,
          hora: hora || undefined,
          tipo,
          endereco: tipo === 'entrega' ? endereco.trim() : undefined,
          preco: precoNum,
        })
        await Promise.all([
          ...doces.map(d => addDoce(kit.id, { sabor: d.sabor, quantidade: d.quantidade })),
          ...salgados.map(s => addSalgado(kit.id, { sabor: s.sabor, quantidade: s.quantidade })),
          ...bolos.map(b => addBolo(kit.id, { sabor: b.sabor, quantidade: b.quantidade, texto: b.texto?.trim() || undefined })),
        ])
      }

      setRefresh(x => x + 1)
      setOpenModal(false)
      resetModal()
      setSuccessMsg(editingKitId ? 'Kit atualizado com sucesso!' : 'Kit criado com sucesso!')
      window.setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Não foi possível salvar.')
      setSaving(false)
    }
  }

  function openCreate() {
    resetModal()
    setOpenModal(true)
  }

  function openEdit(kit: Kit) {
    setEditingKitId(kit.id)
    setNome(kit.nome || ''); setTelefone(kit.telefone || ''); setEmail(kit.email || '')
    setDia(kit.dataEvento || ''); setHora(kit.hora || ''); setTipo(kit.tipo); setEndereco(kit.endereco || '')
    setPrecoStr(
      typeof kit.preco === 'number' && Number.isFinite(kit.preco)
        ? kit.preco.toFixed(2)
        : ''
    )
    setOpenModal(true)
  }

  return (
    <Page>
      <Title>Kits</Title>
      <Subtitle>Somente kits <strong>não entregues</strong> são exibidos abaixo. Os kits marcados como <strong>Entregue/Retirado</strong> hoje aparecem ao final da página; amanhã irão para o Histórico.</Subtitle>

      {/* ===== ALERTAS DO DIA ===== */}
      <div style={{ display:'flex', gap:12, alignItems:'center', margin:'8px 0 4px' }}>
        <span style={{
          display:'inline-flex', alignItems:'center', gap:8, padding:'6px 12px',
          borderRadius:999, background:'#eef2ff', color:'#3730a3', border:'1px solid #c7d2fe'
        }}>
          <strong>Hoje:</strong> {totalHoje}
        </span>
        {atrasadosHoje > 0 && (
          <span style={{
            display:'inline-flex', alignItems:'center', gap:8, padding:'6px 12px',
            borderRadius:999, background:'#fef2f2', color:'#991b1b', border:'1px solid #fecaca'
          }}>
            ⚠️ <strong>Atrasados:</strong> {atrasadosHoje}
          </span>
        )}
      </div>

      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #34d399', color: '#065f46', padding: 8, borderRadius: 8 }}>
          {successMsg}
        </div>
      )}
      {loadErr && (
        <div style={{ background: '#fff3f3', border: '1px solid #fca5a5', color: '#b91c1c', padding: 8, borderRadius: 8 }}>
          {loadErr}
        </div>
      )}

      {/* ===== BARRA DE BUSCA ===== */}
      <TopBar>
        <LeftGroup>
          <Button onClick={openCreate}>+ Adicionar</Button>
        </LeftGroup>

        <RightGroup>
          <Field>
            <Label>Buscar por nome</Label>
            <Input
              placeholder="Digite o nome…"
              value={qNome}
              onChange={e => setQNome(e.target.value)}
              style={{ minWidth: 240 }}
            />
          </Field>

          <Field>
            <Label>Número</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Ex.: 123"
              value={qNumero}
              onChange={e => setQNumero(e.target.value)}
              style={{ width: 140 }}
            />
          </Field>

          <Button onClick={() => setOrderAsc(v => !v)}>
            Ordenar por hora {orderAsc ? '↑' : '↓'}
          </Button>
        </RightGroup>
      </TopBar>

      {/* ===== LISTA PRINCIPAL (NÃO ENTREGUES) ===== */}
      <h2 style={{ margin: '8px 0 0' }}>Seus kits</h2>

      {loading ? (
        <Subtitle>Carregando…</Subtitle>
      ) : kitsFilteredSorted.length === 0 ? (
        <Subtitle>Nenhum kit encontrado.</Subtitle>
      ) : (
        <GridCards>
          {kitsFilteredSorted.map(k => {
            const actionLabel = k.tipo === 'entrega' ? 'Entregue' : 'Retirado'
            return (
              <KitCard
                key={k.id}
                kit={k}
                done={isAllDone(k)}
                overdue={isOverdue(k)}
                onClick={(kit) => { setSelectedKit(kit); setOpenInfo(true) }}
                onRemove={async (kit) => {
                  if (confirm('Remover este kit?')) {
                    await deleteKit(kit.id)
                    setRefresh(x => x + 1)
                  }
                }}
                footer={
                  <Button
                    onClick={async (e) => {
                      e.stopPropagation()
                      await setEntregue(k.id, true) // marca no backend
                      setSuccessMsg(`${actionLabel} marcado com sucesso!`)
                      setRefresh(x => x + 1) // recarrega listas
                      window.setTimeout(() => setSuccessMsg(''), 2500)
                    }}
                  >
                    {actionLabel}
                  </Button>
                }
              />
            )
          })}
        </GridCards>
      )}

      {/* ===== SEÇÃO: FINALIZADOS HOJE (agora embaixo) ===== */}
      {doneTodayFiltered.length > 0 && (
        <>
          <Divider />
          <h2 style={{ margin: '8px 0 0' }}>Kits finalizados hoje</h2>
          <GridCards>
            {doneTodayFiltered.map(k => (
              <KitCard
                key={`done-${k.id}`}
                kit={k}
                done
                overdue={false}
                onClick={(kit) => { setSelectedKit(kit); setOpenInfo(true) }}
                footer={
                  <Button onClick={(e) => { e.stopPropagation(); setSelectedKit(k); setOpenInfo(true) }}>
                    Ver detalhes
                  </Button>
                }
              />
            ))}
          </GridCards>
        </>
      )}

      {/* Modais */}
      {openModal && (
        <ModalOverlay onMouseDown={() => setOpenModal(false)}>
          <ModalCard onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            <ModalTitle>{editingKitId ? 'Editar kit' : 'Novo kit'}</ModalTitle>

            {errorMsg && (
              <div style={{ background: '#fff3f3', border: '1px solid #fca5a5', color: '#b91c1c', padding: 8, borderRadius: 8 }}>
                {errorMsg}
              </div>
            )}

            <FormGrid onSubmit={onCreateOrEdit}>
              <Field>
                <Label>Nome *</Label>
                <Input required value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex.: Kit Aniversário 6 anos" />
              </Field>

              <Field>
                <Label>Telefone *</Label>
                <Input required value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(xx) xxxxx-xxxx" />
              </Field>

              <Field>
                <Label>Email (opcional)</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" />
              </Field>

              <Field>
                <Label>Dia</Label>
                <Input type="date" value={dia} onChange={e => setDia(e.target.value)} />
              </Field>

              <Field>
                <Label>Hora</Label>
                <Input type="time" value={hora} onChange={e => setHora(e.target.value)} />
              </Field>

              <Field>
                <Label>Tipo *</Label>
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value as 'retirada' | 'entrega')}
                  style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}
                >
                  <option value="retirada">Retirada</option>
                  <option value="entrega">Entrega</option>
                </select>
              </Field>

              {tipo === 'entrega' && (
                <Field style={{ gridColumn: '1 / -1' }}>
                  <Label>Endereço *</Label>
                  <Input required value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, número, bairro, cidade" />
                </Field>
              )}

              <Field>
                <Label>Preço {editingKitId ? '' : '*'}</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex.: 49,90"
                  value={precoStr}
                  onChange={e => setPrecoStr(e.target.value)}
                />
              </Field>

              {/* Itens iniciais (somente criação) */}
              {!editingKitId && (
                <>
                  <Divider />

                  <ModalGrid style={{ gridColumn: '1 / -1' }}>
                    <Field>
                      <Label>Doce (sabor)</Label>
                      <select
                        value={doceSel}
                        onChange={e => setDoceSel(e.target.value)}
                        style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}
                      >
                        {DOCES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </Field>
                    <Field>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min={0}
                        max={2000}
                        step={1}
                        value={doceQtd}
                        onChange={e => {
                          const n = Number(e.target.value || 0)
                          setDoceQtd(Number.isFinite(n) ? Math.max(0, Math.min(2000, n)) : 0)
                        }}
                      />
                    </Field>
                    <Actions>
                      <Button
                        type="button"
                        onClick={() => {
                          if (!doceSel) return
                          setDoces(prev => [...prev, { sabor: doceSel, quantidade: doceQtd }])
                          setDoceQtd(0)
                        }}
                      >
                        Adicionar doce
                      </Button>
                    </Actions>
                    <Field style={{ gridColumn: '1 / -1' }}>
                      <BadgeList>
                        {doces.map((d, i) => (
                          <span className="badge" key={`${d.sabor}-${i}`}>
                            {d.sabor} · {d.quantidade}
                            <button className="remove" onClick={() => removeFrom(doces, i, setDoces)}>×</button>
                          </span>
                        ))}
                      </BadgeList>
                    </Field>
                  </ModalGrid>

                  <ModalGrid style={{ gridColumn: '1 / -1' }}>
                    <Field>
                      <Label>Salgado (sabor)</Label>
                      <select
                        value={salgadoSel}
                        onChange={e => setSalgadoSel(e.target.value)}
                        style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}
                      >
                        {SALGADOS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </Field>
                    <Field>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min={0}
                        max={5000}
                        step={5}
                        value={salgadoQtd}
                        onChange={e => {
                          const n = Number(e.target.value || 0)
                          setSalgadoQtd(Number.isFinite(n) ? Math.max(0, Math.min(5000, n)) : 0)
                        }}
                      />
                    </Field>
                    <Actions>
                      <Button
                        type="button"
                        onClick={() => {
                          if (!salgadoSel) return
                          setSalgados(prev => [...prev, { sabor: salgadoSel, quantidade: salgadoQtd }])
                        }}
                      >
                        Adicionar salgado
                      </Button>
                    </Actions>
                    <Field style={{ gridColumn: '1 / -1' }}>
                      <BadgeList>
                        {salgados.map((s, i) => (
                          <span className="badge" key={`${s.sabor}-${i}`}>
                            {s.sabor} · {s.quantidade}
                            <button className="remove" onClick={() => removeFrom(salgados, i, setSalgados)}>×</button>
                          </span>
                        ))}
                      </BadgeList>
                    </Field>
                  </ModalGrid>

                  <ModalGrid style={{ gridColumn: '1 / -1' }}>
                    <Field>
                      <Label>Bolo (sabor)</Label>
                      <select
                        value={boloSel}
                        onChange={e => setBoloSel(e.target.value)}
                        style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}
                      >
                        {BOLOS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </Field>

                    <Field>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        step={1}
                        value={boloQtd}
                        onChange={e => {
                          const n = Number(e.target.value || 0)
                          setBoloQtd(Number.isFinite(n) ? Math.max(0, Math.min(20, n)) : 0)
                        }}
                      />
                    </Field>

                    <Field>
                      <Label>Texto no bolo (opcional)</Label>
                      <Input placeholder="Ex.: Parabéns Janine!" value={boloTexto} onChange={e => setBoloTexto(e.target.value)} />
                    </Field>

                    <Actions>
                      <Button
                        type="button"
                        onClick={() =>
                          setBolos(prev => [
                            ...prev,
                            { sabor: boloSel, quantidade: boloQtd, texto: boloTexto.trim() || undefined },
                          ])
                        }
                      >
                        Adicionar bolo
                      </Button>
                    </Actions>

                    <Field style={{ gridColumn: '1 / -1' }}>
                      <BadgeList>
                        {bolos.map((b, i) => (
                          <span className="badge" key={`${b.sabor}-${i}`}>
                            {b.sabor} · {b.quantidade}
                            {b.texto ? ` · “${b.texto}”` : ''}
                            <button className="remove" onClick={() => removeFrom(bolos, i, setBolos)}>×</button>
                          </span>
                        ))}
                      </BadgeList>
                    </Field>
                  </ModalGrid>
                </>
              )}

              <Actions style={{ gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
                <Button type="button" onClick={() => { setOpenModal(false) }}>Cancelar</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando…' : (editingKitId ? 'Salvar alterações' : 'Salvar')}
                </Button>
              </Actions>
            </FormGrid>
          </ModalCard>
        </ModalOverlay>
      )}

      <KitInfoModal
        open={openInfo}
        kit={selectedKit}
        onClose={() => setOpenInfo(false)}
        onEdit={(kit) => { setOpenInfo(false); openEdit(kit) }}
        onEditItems={(kit) => { setOpenInfo(false); setItemsKit(kit); setOpenItems(true) }}
      />

      <KitItemsEditor
        open={openItems}
        kit={itemsKit}
        onClose={() => setOpenItems(false)}
        onChanged={() => setRefresh(x => x + 1)}
      />
    </Page>
  )
}
