'use client'
import { useState, useEffect, useRef } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://autolead-backend-production.up.railway.app'
const AGENCY_ID = process.env.NEXT_PUBLIC_AGENCY_ID || '6ee07688-9d34-4d18-861c-62585a440cc0'

const STAGES = [
  { id: 'novo',      label: '🆕 Novo Contato',         color: '#3b82f6', bg: '#1e3a5f' },
  { id: 'conversa',  label: '💬 Em Conversa',           color: '#f59e0b', bg: '#3d2e0a' },
  { id: 'interesse', label: '🔍 Interesse Confirmado',  color: '#a100c2', bg: '#2d0a36' },
  { id: 'proposta',  label: '📝 Proposta Enviada',      color: '#06b6d4', bg: '#042f3d' },
  { id: 'fechado',   label: '✅ Fechado',               color: '#6dc200', bg: '#1a2e00' },
  { id: 'perdido',   label: '❌ Perdido',               color: '#ef4444', bg: '#3d0a0a' },
]

const ORIGINS = ['WhatsApp Ads', 'Instagram', 'Facebook', 'Google', 'Indicação', 'Site', 'Outro']

const SCORE_COLOR = (s) => s >= 80 ? '#6dc200' : s >= 50 ? '#f59e0b' : '#ef4444'

const formatPhone = (p) => {
  if (!p) return ''
  const n = p.replace(/\D/g, '')
  if (n.length === 11) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`
  return p
}

const timeAgo = (date) => {
  if (!date) return ''
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff/60)}min atrás`
  if (diff < 86400) return `${Math.floor(diff/3600)}h atrás`
  return `${Math.floor(diff/86400)}d atrás`
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('kanban') // kanban | list
  const [showModal, setShowModal] = useState(false)
  const [editLead, setEditLead] = useState(null)
  const [detailLead, setDetailLead] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('all')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', email: '', interest: '',
    origin: 'WhatsApp Ads', stage: 'novo', notes: '', vehicle_id: ''
  })
  const [vehicles, setVehicles] = useState([])
  const dragItem = useRef(null)

  useEffect(() => { fetchLeads(); fetchVehicles() }, [])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/leads?agency_id=${AGENCY_ID}`)
      const d = await r.json()
      setLeads(Array.isArray(d) ? d : d.leads || [])
    } catch { setLeads([]) }
    setLoading(false)
  }

  const fetchVehicles = async () => {
    try {
      const r = await fetch(`${API}/api/vehicles?agency_id=${AGENCY_ID}`)
      const d = await r.json()
      setVehicles(Array.isArray(d) ? d : d.vehicles || [])
    } catch {}
  }

  const openNew = () => {
    setEditLead(null)
    setForm({ name:'', phone:'', email:'', interest:'', origin:'WhatsApp Ads', stage:'novo', notes:'', vehicle_id:'' })
    setShowModal(true)
  }

  const openEdit = (lead) => {
    setEditLead(lead)
    setForm({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      interest: lead.interest || '',
      origin: lead.origin || 'WhatsApp Ads',
      stage: lead.stage || 'novo',
      notes: lead.notes || '',
      vehicle_id: lead.vehicle_id || ''
    })
    setShowModal(true)
    setDetailLead(null)
  }

  const saveLead = async () => {
    if (!form.name || !form.phone) return alert('Nome e WhatsApp são obrigatórios')
    setSaving(true)
    try {
      const body = { ...form, agency_id: AGENCY_ID }
      const url = editLead ? `${API}/api/leads/${editLead.id}` : `${API}/api/leads`
      const method = editLead ? 'PUT' : 'POST'
      const r = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
      if (!r.ok) throw new Error('Erro ao salvar')
      await fetchLeads()
      setShowModal(false)
    } catch (e) { alert(e.message) }
    setSaving(false)
  }

  const moveStage = async (leadId, newStage) => {
    setLeads(prev => prev.map(l => l.id === leadId ? {...l, stage: newStage} : l))
    if (detailLead?.id === leadId) setDetailLead(prev => ({...prev, stage: newStage}))
    try {
      await fetch(`${API}/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ stage: newStage })
      })
    } catch {}
  }

  const deleteLead = async (id) => {
    if (!confirm('Remover este lead?')) return
    try {
      await fetch(`${API}/api/leads/${id}`, { method: 'DELETE' })
      setLeads(prev => prev.filter(l => l.id !== id))
      setDetailLead(null)
    } catch {}
  }

  // Drag & drop
  const onDragStart = (e, lead) => {
    dragging !== lead.id && setDragging(lead.id)
    dragItem.current = lead.id
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDragEnd = () => { setDragging(null); setDragOver(null) }
  const onDragOver = (e, stageId) => { e.preventDefault(); setDragOver(stageId) }
  const onDrop = (e, stageId) => {
    e.preventDefault()
    if (dragItem.current) moveStage(dragItem.current, stageId)
    setDragOver(null); setDragging(null)
  }

  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    const matchQ = !q || l.name?.toLowerCase().includes(q) || l.phone?.includes(q) || l.interest?.toLowerCase().includes(q)
    const matchS = filterStage === 'all' || l.stage === filterStage
    return matchQ && matchS
  })

  const byStage = (stageId) => filtered.filter(l => (l.stage || 'novo') === stageId)

  const stageObj = (id) => STAGES.find(s => s.id === id) || STAGES[0]

  const nextStage = (current) => {
    const idx = STAGES.findIndex(s => s.id === current)
    if (idx < STAGES.length - 2) return STAGES[idx + 1]
    return null
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text)' }}>

      {/* Header */}
      <div style={{ padding:'24px 28px 0', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Leads</h1>
          <p style={{ color:'var(--muted)', fontSize:13, margin:'2px 0 0' }}>
            {leads.length} leads · {leads.filter(l=>l.stage==='fechado').length} fechados
          </p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          {/* Search */}
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--muted)', fontSize:14 }}>🔍</span>
            <input
              placeholder="Buscar lead..."
              value={search}
              onChange={e=>setSearch(e.target.value)}
              style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px 8px 32px', color:'var(--text)', fontSize:13, width:200, outline:'none' }}
            />
          </div>
          {/* Filter stage */}
          <select
            value={filterStage}
            onChange={e=>setFilterStage(e.target.value)}
            style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', color:'var(--text)', fontSize:13, outline:'none' }}
          >
            <option value="all">Todas etapas</option>
            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          {/* View toggle */}
          <div style={{ display:'flex', background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
            {[['kanban','⊞'],['list','≡']].map(([v,icon]) => (
              <button key={v} onClick={()=>setView(v)}
                style={{ padding:'8px 14px', background: view===v ? 'var(--accent)' : 'transparent', color:'var(--text)', border:'none', fontSize:16, cursor:'pointer' }}>
                {icon}
              </button>
            ))}
          </div>
          <button onClick={openNew}
            style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontWeight:600, fontSize:13, cursor:'pointer' }}>
            + Novo Lead
          </button>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {view === 'kanban' && (
        <div style={{ padding:'20px 28px', overflowX:'auto' }}>
          <div style={{ display:'flex', gap:14, minWidth: STAGES.length * 260 }}>
            {STAGES.map(stage => {
              const stageLeads = byStage(stage.id)
              const isOver = dragOver === stage.id
              return (
                <div key={stage.id}
                  onDragOver={e=>onDragOver(e, stage.id)}
                  onDrop={e=>onDrop(e, stage.id)}
                  style={{
                    flex:'0 0 250px', background: isOver ? stage.bg : 'var(--bg2)',
                    border: `1px solid ${isOver ? stage.color : 'var(--border)'}`,
                    borderRadius:12, padding:'12px', minHeight:500,
                    transition:'all 0.2s'
                  }}>
                  {/* Column header */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:stage.color }}/>
                      <span style={{ fontSize:12, fontWeight:600, color:stage.color }}>{stage.label}</span>
                    </div>
                    <span style={{ background:stage.bg, color:stage.color, borderRadius:20, padding:'2px 8px', fontSize:11, fontWeight:700, border:`1px solid ${stage.color}40` }}>
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {stageLeads.map(lead => (
                      <div key={lead.id}
                        draggable
                        onDragStart={e=>onDragStart(e,lead)}
                        onDragEnd={onDragEnd}
                        onClick={()=>setDetailLead(lead)}
                        style={{
                          background: dragging===lead.id ? 'var(--bg3)' : 'var(--card)',
                          border:'1px solid var(--border)', borderRadius:10, padding:'12px',
                          cursor:'grab', opacity: dragging===lead.id ? 0.5 : 1,
                          transition:'all 0.15s',
                          ':hover':{ borderColor:'var(--accent)' }
                        }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                          <span style={{ fontWeight:600, fontSize:13, lineHeight:1.3 }}>{lead.name}</span>
                          {lead.score != null && (
                            <span style={{ background: SCORE_COLOR(lead.score)+'22', color: SCORE_COLOR(lead.score), borderRadius:6, padding:'1px 6px', fontSize:11, fontWeight:700, flexShrink:0 }}>
                              {lead.score}
                            </span>
                          )}
                        </div>
                        <div style={{ color:'var(--muted)', fontSize:12, marginBottom:4 }}>📱 {formatPhone(lead.phone)}</div>
                        {lead.interest && <div style={{ color:'var(--muted)', fontSize:12, marginBottom:4 }}>🚗 {lead.interest}</div>}
                        {lead.origin && <div style={{ color:'var(--muted2)', fontSize:11, marginBottom:8 }}>📍 {lead.origin}</div>}
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ color:'var(--muted2)', fontSize:11 }}>{timeAgo(lead.created_at)}</span>
                          {nextStage(lead.stage || 'novo') && (
                            <button
                              onClick={e=>{e.stopPropagation(); moveStage(lead.id, nextStage(lead.stage||'novo').id)}}
                              style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--muted)', borderRadius:6, padding:'3px 8px', fontSize:11, cursor:'pointer' }}>
                              → mover
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div style={{ textAlign:'center', color:'var(--muted2)', fontSize:12, padding:'30px 0', borderRadius:8, border:'1px dashed var(--border)' }}>
                        Solte aqui
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div style={{ padding:'20px 28px' }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Nome','WhatsApp','Interesse','Origem','Etapa','Score','Ação'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, color:'var(--muted)', fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => {
                  const st = stageObj(lead.stage || 'novo')
                  return (
                    <tr key={lead.id} onClick={()=>setDetailLead(lead)}
                      style={{ borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'background 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg2)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'12px 16px', fontWeight:600, fontSize:13 }}>{lead.name}</td>
                      <td style={{ padding:'12px 16px', color:'var(--muted)', fontSize:13 }}>{formatPhone(lead.phone)}</td>
                      <td style={{ padding:'12px 16px', color:'var(--muted)', fontSize:13 }}>{lead.interest || '—'}</td>
                      <td style={{ padding:'12px 16px', color:'var(--muted)', fontSize:13 }}>{lead.origin || '—'}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ background:st.bg, color:st.color, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{st.label}</span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        {lead.score != null && (
                          <span style={{ color: SCORE_COLOR(lead.score), fontWeight:700 }}>{lead.score}</span>
                        )}
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={e=>{e.stopPropagation();openEdit(lead)}}
                            style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--muted)', borderRadius:6, padding:'4px 10px', fontSize:12, cursor:'pointer' }}>
                            Editar
                          </button>
                          <a href={`https://wa.me/55${lead.phone?.replace(/\D/g,'')}`} target="_blank"
                            onClick={e=>e.stopPropagation()}
                            style={{ background:'#075e5422', border:'1px solid #075e5460', color:'#25d366', borderRadius:6, padding:'4px 10px', fontSize:12, cursor:'pointer', textDecoration:'none' }}>
                            WhatsApp
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding:'40px', textAlign:'center', color:'var(--muted)' }}>Nenhum lead encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailLead && (
        <div onClick={()=>setDetailLead(null)}
          style={{ position:'fixed', inset:0, background:'#00000088', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}>

            {/* Header */}
            <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>{detailLead.name}</h2>
                <p style={{ margin:'4px 0 0', color:'var(--muted)', fontSize:13 }}>{detailLead.origin} · {timeAgo(detailLead.created_at)}</p>
              </div>
              <button onClick={()=>setDetailLead(null)}
                style={{ background:'none', border:'none', color:'var(--muted)', fontSize:20, cursor:'pointer' }}>✕</button>
            </div>

            <div style={{ padding:'20px 24px' }}>
              {/* Contato */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                <a href={`https://wa.me/55${detailLead.phone?.replace(/\D/g,'')}`} target="_blank"
                  style={{ display:'flex', alignItems:'center', gap:10, background:'#075e5415', border:'1px solid #075e5440', borderRadius:10, padding:'12px 16px', textDecoration:'none' }}>
                  <span style={{ fontSize:22 }}>📱</span>
                  <div>
                    <div style={{ color:'#25d366', fontWeight:600, fontSize:13 }}>WhatsApp</div>
                    <div style={{ color:'var(--muted)', fontSize:12 }}>{formatPhone(detailLead.phone)}</div>
                  </div>
                </a>
                {detailLead.email && (
                  <div style={{ display:'flex', alignItems:'center', gap:10, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 16px' }}>
                    <span style={{ fontSize:22 }}>✉️</span>
                    <div>
                      <div style={{ color:'var(--muted)', fontSize:12 }}>E-mail</div>
                      <div style={{ fontSize:13 }}>{detailLead.email}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Veículo de interesse */}
              {detailLead.interest && (
                <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', gap:10, alignItems:'center' }}>
                  <span style={{ fontSize:20 }}>🚗</span>
                  <div>
                    <div style={{ color:'var(--muted)', fontSize:12 }}>Interesse</div>
                    <div style={{ fontWeight:600 }}>{detailLead.interest}</div>
                  </div>
                </div>
              )}

              {/* Score */}
              {detailLead.score != null && (
                <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:20 }}>⭐</span>
                  <div style={{ flex:1 }}>
                    <div style={{ color:'var(--muted)', fontSize:12, marginBottom:4 }}>Score do Lead</div>
                    <div style={{ background:'var(--border)', borderRadius:4, height:6 }}>
                      <div style={{ width:`${detailLead.score}%`, height:'100%', borderRadius:4, background: SCORE_COLOR(detailLead.score) }}/>
                    </div>
                  </div>
                  <span style={{ fontWeight:700, color: SCORE_COLOR(detailLead.score), fontSize:18 }}>{detailLead.score}</span>
                </div>
              )}

              {/* Etapa atual + mover */}
              <div style={{ marginBottom:20 }}>
                <div style={{ color:'var(--muted)', fontSize:12, marginBottom:8 }}>Etapa atual</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {STAGES.map(s => (
                    <button key={s.id}
                      onClick={()=>moveStage(detailLead.id, s.id)}
                      style={{
                        background: (detailLead.stage||'novo')===s.id ? s.bg : 'var(--bg2)',
                        border: `1px solid ${(detailLead.stage||'novo')===s.id ? s.color : 'var(--border)'}`,
                        color: (detailLead.stage||'novo')===s.id ? s.color : 'var(--muted)',
                        borderRadius:8, padding:'6px 12px', fontSize:12, cursor:'pointer', fontWeight: (detailLead.stage||'novo')===s.id ? 700 : 400
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Anotações / Histórico */}
              <div style={{ marginBottom:20 }}>
                <div style={{ color:'var(--muted)', fontSize:12, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                  📋 Anotações & Histórico WhatsApp
                  <span style={{ background:'#a100c220', color:'var(--accent2)', borderRadius:4, padding:'1px 6px', fontSize:10 }}>Em breve: sync automático</span>
                </div>
                <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 16px', minHeight:80, fontSize:13, color:'var(--muted)', whiteSpace:'pre-wrap', lineHeight:1.6 }}>
                  {detailLead.notes || 'Nenhuma anotação ainda. Clique em Editar para adicionar.'}
                </div>
              </div>

              {/* Ações */}
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>openEdit(detailLead)}
                  style={{ flex:1, background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, padding:'10px', fontWeight:600, cursor:'pointer' }}>
                  ✏️ Editar Lead
                </button>
                <a href={`https://wa.me/55${detailLead.phone?.replace(/\D/g,'')}`} target="_blank"
                  style={{ flex:1, background:'#075e5422', border:'1px solid #25d36660', color:'#25d366', borderRadius:8, padding:'10px', fontWeight:600, cursor:'pointer', textDecoration:'none', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  📱 Abrir WhatsApp
                </a>
                <button onClick={()=>deleteLead(detailLead.id)}
                  style={{ background:'#ef444415', border:'1px solid #ef444440', color:'#ef4444', borderRadius:8, padding:'10px 14px', cursor:'pointer' }}>
                  🗑
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      {showModal && (
        <div onClick={()=>setShowModal(false)}
          style={{ position:'fixed', inset:0, background:'#00000088', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto' }}>

            <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>{editLead ? 'Editar Lead' : 'Novo Lead'}</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:20, cursor:'pointer' }}>✕</button>
            </div>

            <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
              {[
                ['Nome completo *', 'name', 'text', 'Ex: João Silva'],
                ['WhatsApp *', 'phone', 'tel', '(11) 99999-9999'],
                ['E-mail', 'email', 'email', 'email@exemplo.com'],
                ['Veículo de interesse', 'interest', 'text', 'Ex: Honda Civic 2020'],
              ].map(([label, field, type, placeholder]) => (
                <div key={field}>
                  <label style={{ display:'block', color:'var(--muted)', fontSize:12, marginBottom:6 }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={form[field]}
                    onChange={e=>setForm(p=>({...p,[field]:e.target.value}))}
                    style={{ width:'100%', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px', color:'var(--text)', fontSize:13, outline:'none', boxSizing:'border-box' }}
                  />
                </div>
              ))}

              {/* Veículo do estoque */}
              <div>
                <label style={{ display:'block', color:'var(--muted)', fontSize:12, marginBottom:6 }}>Veículo do estoque (opcional)</label>
                <select value={form.vehicle_id} onChange={e=>setForm(p=>({...p,vehicle_id:e.target.value}))}
                  style={{ width:'100%', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px', color:'var(--text)', fontSize:13, outline:'none' }}>
                  <option value="">Selecionar veículo...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} {v.year} — R$ {v.price?.toLocaleString('pt-BR')}</option>)}
                </select>
              </div>

              {/* Origem */}
              <div>
                <label style={{ display:'block', color:'var(--muted)', fontSize:12, marginBottom:6 }}>Origem do lead</label>
                <select value={form.origin} onChange={e=>setForm(p=>({...p,origin:e.target.value}))}
                  style={{ width:'100%', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px', color:'var(--text)', fontSize:13, outline:'none' }}>
                  {ORIGINS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              {/* Etapa */}
              <div>
                <label style={{ display:'block', color:'var(--muted)', fontSize:12, marginBottom:6 }}>Etapa inicial</label>
                <select value={form.stage} onChange={e=>setForm(p=>({...p,stage:e.target.value}))}
                  style={{ width:'100%', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px', color:'var(--text)', fontSize:13, outline:'none' }}>
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              {/* Anotações */}
              <div>
                <label style={{ display:'block', color:'var(--muted)', fontSize:12, marginBottom:6 }}>Anotações / Observações</label>
                <textarea rows={4} placeholder="Histórico de contato, observações do vendedor..."
                  value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                  style={{ width:'100%', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px', color:'var(--text)', fontSize:13, outline:'none', resize:'vertical', boxSizing:'border-box' }}
                />
              </div>

              <div style={{ display:'flex', gap:8, paddingTop:4 }}>
                <button onClick={()=>setShowModal(false)}
                  style={{ flex:1, background:'var(--bg2)', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:8, padding:'10px', cursor:'pointer' }}>
                  Cancelar
                </button>
                <button onClick={saveLead} disabled={saving}
                  style={{ flex:2, background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, padding:'10px', fontWeight:600, cursor:'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Salvando...' : editLead ? 'Salvar Alterações' : 'Cadastrar Lead'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ position:'fixed', inset:0, background:'#00000066', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'var(--card)', borderRadius:12, padding:'24px 32px', color:'var(--text)' }}>Carregando leads...</div>
        </div>
      )}
    </div>
  )
}
