'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Users, Car, TrendingUp, MessageSquare } from 'lucide-react'

const API = 'https://autolead-backend-production.up.railway.app'
const AGENCY_ID = '6ee07688-9d34-4d18-861c-62585a440cc0'

export default function Dashboard() {
  const [leads, setLeads]       = useState([])
  const [vehicles, setVehicles] = useState([])

  useEffect(() => {
    fetch(`${API}/api/leads?agency_id=${AGENCY_ID}`)
      .then(r => r.json()).then(setLeads).catch(() => {})
    fetch(`${API}/api/vehicles?agency_id=${AGENCY_ID}`)
      .then(r => r.json()).then(setVehicles).catch(() => {})
  }, [])

  const stats = [
    { label: 'Total de Leads',     value: leads.length,                              icon: Users,         color: 'var(--accent2)', bg: 'rgba(161,0,194,0.1)' },
    { label: 'Veículos no Estoque',value: vehicles.length,                           icon: Car,           color: 'var(--green)',   bg: 'rgba(109,194,0,0.1)' },
    { label: 'Leads Quentes',      value: leads.filter(l => (l.score||0) >= 50).length, icon: TrendingUp, color: 'var(--yellow)',  bg: 'rgba(245,158,11,0.1)' },
    { label: 'Conversas Ativas',   value: leads.filter(l => l.status === 'active').length, icon: MessageSquare, color: 'var(--blue)', bg: 'rgba(59,130,246,0.1)' },
  ]

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      <Sidebar />
      <main style={{ flex:1, padding:'28px', overflowY:'auto' }}>

        <div style={{ marginBottom:'24px' }}>
          <h1 style={{ fontSize:'24px', fontWeight:'800', color:'var(--text)' }}>Dashboard</h1>
          <p style={{ color:'var(--muted)', marginTop:'4px' }}>Visão geral do seu negócio</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
          {stats.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} style={{
                background:'var(--card)', border:'1px solid var(--border)',
                borderRadius:'12px', padding:'20px',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                  <span style={{ color:'var(--muted)', fontSize:'13px' }}>{s.label}</span>
                  <div style={{ background:s.bg, padding:'8px', borderRadius:'8px' }}>
                    <Icon size={16} color={s.color} />
                  </div>
                </div>
                <div style={{ fontSize:'32px', fontWeight:'800', color:'var(--text)' }}>{s.value}</div>
              </div>
            )
          })}
        </div>

        {/* Tables */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          {/* Últimos Leads */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'20px' }}>
            <h2 style={{ fontSize:'15px', fontWeight:'700', color:'var(--text)', marginBottom:'16px' }}>Últimos Leads</h2>
            {leads.length === 0
              ? <p style={{ color:'var(--muted2)', fontSize:'13px' }}>Nenhum lead cadastrado ainda.</p>
              : leads.slice(0,5).map(l => (
                <div key={l.id} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'10px 0', borderBottom:'1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ color:'var(--text)', fontSize:'13px', fontWeight:'600' }}>{l.name}</div>
                    <div style={{ color:'var(--muted2)', fontSize:'11px', marginTop:'2px' }}>{l.email}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ width:'60px', height:'4px', background:'var(--border2)', borderRadius:'2px' }}>
                      <div style={{ width:`${l.score||0}%`, height:'4px', background:'var(--accent)', borderRadius:'2px' }} />
                    </div>
                    <span style={{ color:'var(--muted)', fontSize:'11px', width:'24px' }}>{l.score||0}</span>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Estoque */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'20px' }}>
            <h2 style={{ fontSize:'15px', fontWeight:'700', color:'var(--text)', marginBottom:'16px' }}>Estoque de Veículos</h2>
            {vehicles.length === 0
              ? <p style={{ color:'var(--muted2)', fontSize:'13px' }}>Nenhum veículo cadastrado ainda.</p>
              : vehicles.slice(0,5).map(v => (
                <div key={v.id} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'10px 0', borderBottom:'1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ color:'var(--text)', fontSize:'13px', fontWeight:'600' }}>{v.year_model} {v.brand} {v.model}</div>
                    <div style={{ color:'var(--muted2)', fontSize:'11px', marginTop:'2px' }}>{Number(v.km||0).toLocaleString('pt-BR')} km • {v.color}</div>
                  </div>
                  <span style={{ color:'var(--green)', fontWeight:'700', fontSize:'13px' }}>
                    R$ {Number(v.price||0).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </main>
    </div>
  )
}
