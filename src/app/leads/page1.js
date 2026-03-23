'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Search, TrendingUp, Plus } from 'lucide-react'

const API = 'https://autolead-backend-production.up.railway.app'
const AGENCY_ID = '6ee07688-9d34-4d18-861c-62585a440cc0'

const STATUS = {
  novo:         { label:'Novo',      bg:'rgba(59,130,246,0.1)',  color:'#3b82f6' },
  qualificado:  { label:'Qualif.',   bg:'rgba(161,0,194,0.1)',   color:'var(--accent2)' },
  proposta:     { label:'Proposta',  bg:'rgba(245,158,11,0.1)',  color:'var(--yellow)' },
  fechado:      { label:'Fechado',   bg:'rgba(109,194,0,0.1)',   color:'var(--green)' },
  perdido:      { label:'Perdido',   bg:'rgba(239,68,68,0.1)',   color:'var(--red)' },
}

export default function Leads() {
  const [leads, setLeads]   = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/leads?agency_id=${AGENCY_ID}`)
      .then(r => r.json())
      .then(d => { setLeads(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = leads.filter(l =>
    (l.name||'').toLowerCase().includes(search.toLowerCase()) ||
    (l.email||'').toLowerCase().includes(search.toLowerCase()) ||
    (l.phone||'').includes(search)
  )

  const s = STATUS

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      <Sidebar />
      <main style={{ flex:1, padding:'28px', overflowY:'auto' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <div>
            <h1 style={{ fontSize:'24px', fontWeight:'800', color:'var(--text)' }}>Leads</h1>
            <p style={{ color:'var(--muted)', marginTop:'4px' }}>{leads.length} leads cadastrados</p>
          </div>
          <button
            onClick={() => window.location.href='/chat'}
            style={{
              display:'flex', alignItems:'center', gap:'6px',
              background:'var(--accent)', color:'#fff', border:'none',
              padding:'9px 16px', borderRadius:'9px', fontSize:'13px', fontWeight:'600',
            }}
          >
            <Plus size={14} /> Novo Lead
          </button>
        </div>

        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'12px' }}>
          {/* Search */}
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ position:'relative' }}>
              <Search size={14} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--muted2)' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome, email ou telefone..."
                style={{
                  width:'100%', background:'var(--bg3)', border:'1px solid var(--border2)',
                  borderRadius:'8px', padding:'8px 12px 8px 34px', color:'var(--text)',
                  fontSize:'13px', outline:'none',
                }}
              />
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div style={{ padding:'40px', textAlign:'center', color:'var(--muted)' }}>Carregando...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:'40px', textAlign:'center', color:'var(--muted)' }}>Nenhum lead encontrado.</div>
          ) : filtered.map(lead => {
            const st = s[lead.status] || s.novo
            return (
              <div key={lead.id} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'14px 16px', borderBottom:'1px solid var(--border)',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{
                    width:'38px', height:'38px', borderRadius:'50%',
                    background:'rgba(161,0,194,0.15)', display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <span style={{ color:'var(--accent2)', fontWeight:'700', fontSize:'13px' }}>
                      {(lead.name||'?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div style={{ color:'var(--text)', fontWeight:'600', fontSize:'13px' }}>{lead.name || '—'}</div>
                    <div style={{ color:'var(--muted2)', fontSize:'11px', marginTop:'2px' }}>
                      {lead.email || '—'} {lead.phone ? `• ${lead.phone}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                  {/* Score */}
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <TrendingUp size={12} color="var(--muted2)" />
                    <div style={{ width:'64px', height:'4px', background:'var(--border2)', borderRadius:'2px' }}>
                      <div style={{ width:`${lead.score||0}%`, height:'4px', background:'var(--accent)', borderRadius:'2px' }} />
                    </div>
                    <span style={{ color:'var(--muted)', fontSize:'11px', width:'20px' }}>{lead.score||0}</span>
                  </div>
                  {/* Status */}
                  <span style={{
                    background:st.bg, color:st.color,
                    padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600',
                  }}>{st.label}</span>
                  {/* Canal */}
                  <span style={{ color:'var(--muted2)', fontSize:'11px', textTransform:'capitalize' }}>{lead.channel||'—'}</span>
                  {/* Link */}
                  <button
                    onClick={() => window.location.href=`/chat?lead=${lead.id}`}
                    style={{ background:'none', border:'none', color:'var(--accent2)', fontSize:'12px', padding:'0' }}
                  >
                    Chat →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
