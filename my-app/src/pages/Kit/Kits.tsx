// src/pages/kit/Kits.tsx
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createKit,
  deleteKit,
  listNaoEntregues,   // carrega só não-entregues
  addDoce,
  addSalgado,
  addBolo,
  isAllDone,
  saveKit,
  setEntregue,
} from '../../data/kitsRepo'
import type { Kit } from '../../types/kit'
import {
  Actions,
  BadgeList,
  Button,
  DateInput,
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
  Select,
  Subtitle,
  Title,
  TopBar,
  RangeRow,
} from './Kits.styled'
import KitCard from '../../components/KitCard/KitCard'
import KitInfoModal from '../../components/KitCard/KitInfoModal'
import KitItemsEditor from '../../components/KitCard/KitItemsEditor/KitItemsEditor'
import { useSabores } from '../../hooks/useSabores'

// rascunho de itens iniciais (somente criação)
type NewItem = { sabor: string; quantidade: number }
type NewBolo = NewItem & { texto?: string }

export default function Kits() {
  const navigate = useNavigate()

  // sabores dinâmicos (com fallback interno no hook)
  const { doces: DOCES, salgados: SALGADOS, bolos: BOLOS } = useSabores()

  // filtros/estado
  const [refresh, setRefresh] = useState(0)
  const [filterDate, setFilterDate] = useState<string>('')
  const [orderAsc, setOrderAsc] = useState<boolean>(true)

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

  // itens iniciais (criação)
  const [doceSel, setDoceSel] = useState<string>('')   // será preenchido quando DOCES carregar
  const [doceQtd, setDoceQtd] = useState(10)
  const [doces, setDoces] = useState<NewItem[]>([])

  const [salgadoSel, setSalgadoSel] = useState<string>('') // idem
  const [salgadoQtd, setSalgadoQtd] = useState(10)
  const [salgados, setSalgados] = useState<NewItem[]>([])

  const [boloSel, setBoloSel] = useState<string>('') // idem
  const [boloQtd, setBoloQtd] = useState(1)
  const [boloTexto, setBoloTexto] = useState('')
  const [bolos, setBolos] = useState<NewBolo[]>([])

  // garante que selects tenham um valor default quando sabores carregarem
  useEffect(() => {
    if (!doceSel && DOCES.length) setDoceSel(DOCES[0])
    if (!salgadoSel && SALGADOS.length) setSalgadoSel(SALGADOS[0])
    if (!boloSel && BOLOS.length) setBoloSel(BOLOS[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DOCES, SALGADOS, BOLOS])

  // dados (somente NÃO entregues)
  const [kitsRaw, setKitsRaw] = useState<Kit[]>([])
  const [loading, setLoading] = useState(false)
  const [loadErr, setLoadErr] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true); setLoadErr('')
      try {
        const data = await listNaoEntregues()
        if (alive) setKitsRaw(data)
      } catch (e: any) {
        if (alive) setLoadErr(e?.message || 'Falha ao carregar kits')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [refresh])

  const kitsFilteredSorted = useMemo(() => {
    let arr = [...kitsRaw]
    if (filterDate) arr = arr.filter(k => (k.dataEvento || '') === filterDate)
    arr.sort((a, b) => {
      const ha = a.hora || ''
      const hb = b.hora || ''
      if (ha === hb) return 0
      return (ha < hb ? -1 : 1) * (orderAsc ? 1 : -1)
    })
    return arr
  }, [kitsRaw, filterDate, orderAsc])

  function resetModal() {
    setEditingKitId(null)
    setNome(''); setTelefone(''); setEmail(''); setDia(''); setHora('')
    setTipo('retirada'); setEndereco('')
    setDoces([]); setSalgados([]); setBolos([])
    setDoceSel(DOCES[0] || ''); setDoceQtd(10)
    setSalgadoSel(SALGADOS[0] || ''); setSalgadoQtd(10)
    setBoloSel(BOLOS[0] || ''); setBoloQtd(1); setBoloTexto('')
    setErrorMsg(''); setSaving(false)
  }

  function removeFrom<T>(list: T[], idx: number, setter: (v: T[]) => void) {
    const copy = [...list]; copy.splice(idx, 1); setter(copy)
  }

  async function onCreateOrEdit(e: FormEvent) {
    e.preventDefault()
    if (saving) return
    setSaving(true); setErrorMsg(''); setSuccessMsg('')
    try {
      if (!nome.trim() || !telefone.trim() || !tipo) throw new Error('Preencha nome, telefone e tipo.')
      if (tipo === 'entrega' && !endereco.trim()) throw new Error('Endereço é obrigatório para entrega.')

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
        })
        // itens iniciais
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
    setOpenModal(true)
  }

  return (
    <Page>
      <Title>Kits</Title>
      <Subtitle>Somente kits <strong>não entregues</strong> são exibidos aqui. Os entregues aparecem no Histórico.</Subtitle>

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

      <TopBar>
        <LeftGroup>
          <Button onClick={openCreate}>+ Adicionar</Button>
        </LeftGroup>

        <RightGroup>
          <DateInput type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          <Button onClick={() => setOrderAsc(v => !v)}>
            Ordenar por hora {orderAsc ? '↑' : '↓'}
          </Button>
          <Button onClick={() => { setFilterDate(''); setOrderAsc(true) }}>
            Limpar filtros
          </Button>
          <Button onClick={() => navigate('/historico')}>Histórico</Button>
        </RightGroup>
      </TopBar>

      <h2 style={{ margin: '8px 0 0' }}>Seus kits</h2>

      {loading ? (
        <Subtitle>Carregando…</Subtitle>
      ) : kitsFilteredSorted.length === 0 ? (
        <Subtitle>Nenhum kit encontrado.</Subtitle>
      ) : (
        <GridCards>
          {kitsFilteredSorted.map(k => (
            <KitCard
              key={k.id}
              kit={k}
              done={isAllDone(k)}
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
                    await setEntregue(k.id, true)
                    // some da lista atual (não entregues) e vai ao histórico
                    setRefresh(x => x + 1)
                    navigate('/historico')
                  }}
                >
                  Entregue
                </Button>
              }
            />
          ))}
        </GridCards>
      )}

      {/* Modal de criação/edição */}
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
                <Select value={tipo} onChange={e => setTipo(e.target.value as 'retirada' | 'entrega')}>
                  <option value="retirada">Retirada</option>
                  <option value="entrega">Entrega</option>
                </Select>
              </Field>

              {tipo === 'entrega' && (
                <Field style={{ gridColumn: '1 / -1' }}>
                  <Label>Endereço *</Label>
                  <Input required value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, número, bairro, cidade" />
                </Field>
              )}

              {/* Itens iniciais — só na criação */}
              {!editingKitId && (
                <>
                  <Divider />

                  {/* Doces */}
                  <ModalGrid style={{ gridColumn: '1 / -1' }}>
                    <Field>
                      <Label>Doce (sabor)</Label>
                      <Select value={doceSel} onChange={e => setDoceSel(e.target.value)}>
                        {DOCES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </Select>
                    </Field>
                    <Field>
                      <Label>Quantidade</Label>
                      <RangeRow>
                        <input type="range" min={0} max={200} step={1} value={doceQtd} onChange={e => setDoceQtd(Number(e.target.value))} />
                        <output>{doceQtd}</output>
                      </RangeRow>
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

                  {/* Salgados */}
                  <ModalGrid style={{ gridColumn: '1 / -1' }}>
                    <Field>
                      <Label>Salgado (sabor)</Label>
                      <Select value={salgadoSel} onChange={e => setSalgadoSel(e.target.value)}>
                        {SALGADOS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </Select>
                    </Field>
                    <Field>
                      <Label>Quantidade</Label>
                      <RangeRow>
                        <input type="range" min={0} max={500} step={5} value={salgadoQtd} onChange={e => setSalgadoQtd(Number(e.target.value))} />
                        <output>{salgadoQtd}</output>
                      </RangeRow>
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

                  {/* Bolos */}
                  <ModalGrid style={{ gridColumn: '1 / -1' }}>
                    <Field>
                      <Label>Bolo (sabor)</Label>
                      <Select value={boloSel} onChange={e => setBoloSel(e.target.value)}>
                        {BOLOS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </Select>
                    </Field>

                    <Field>
                      <Label>Quantidade</Label>
                      <RangeRow>
                        <input type="range" min={0} max={20} step={1} value={boloQtd} onChange={e => setBoloQtd(Number(e.target.value))} />
                        <output>{boloQtd}</output>
                      </RangeRow>
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
