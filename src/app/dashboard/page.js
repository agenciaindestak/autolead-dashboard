'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Users, Car, TrendingUp, MessageSquare } from 'lucide-react'

const API = 'https://autolead-backend-production.up.railway.app'
const AGENCY_ID = '6ee07688-9d34-4d18-861c-62585a440cc0'

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [vehicles, setVehicles] = useState([])

  useEffect(() => {
    fetch(`${API}/api/leads?agency_id=${AGENCY_ID}`)
      .then(r => r.json()).then(setLeads).catch(() => {})
    fetch(`${API}/api/vehicles?agency_id=${AGENCY_ID}`)
      .then(r => r.json()).then(setVehicles).catch(() => {})
  }, [])

  const stats = [
    { label: 'Total de Leads', value: leads.length, icon: Users, color: 'var(--accent2)' },
    { label: 'Veículos no Estoque', value: vehicles.length, icon: Car, color: 'var(--green)' },
    { label: 'Leads Quentes', value: leads.filter(l => l.score >= 50).length, icon: TrendingUp, color: 'var(--yellow)' },
    { label: 'Conversas Ativas', value: leads.filter(l => l.status === 'active').length, icon: MessageSquare, color: 'var(--blue)' },
  ]

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'var(--bg)'}}>
      <Sidebar />
      <main className="main-content">
        <div className="mb-8">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Visão geral do seu negócio</p>
        </div>

        <div className="grid-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                <span style={{color:'var(--muted)', fontSize:13}}>{stat.label}</span>
                <div style={{background:`${stat.color}20`, padding:8, borderRadius:8}}>
                  <stat.icon size={18} color={stat.color} />
                </div>
              </div>
              <div style={{fontSize:32, fontWeight:700, color:'var(--text)'}}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          <div className="card">
            <h2 style={{color:'var(--text)', fontWeight:600, marginBottom:16}}>Últimos Leads</h2>
            {leads.length === 0 ? (
              <p style={{color:'var(--muted)', fontSize:13}}>Nenhum lead cadastrado ainda.</p>
            ) : (
              leads.slice(0, 5).map(lead => (
                <div key={lead.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)'}}>
                  <div>
                    <div style={{color:'var(--text)', fontSize:13, fontWeight:500}}>{lead.name}</div>
                    <div style={{color:'var(--muted)', fontSize:11}}>{lead.email}</div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <div style={{width:60, background:'var(--bg3)', borderRadius:4, height:4}}>
                      <div style={{width:`${lead.score||0}%`, background:'var(--accent)', height:4, borderRadius:4}} />
                    </div>
                    <span style={{color:'var(--muted)', fontSize:11}}>{lead.score||0}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h2 style={{color:'var(--text)', fontWeight:600, marginBottom:16}}>Estoque de Veículos</h2>
            {vehicles.length === 0 ? (
              <p style={{color:'var(--muted)', fontSize:13}}>Nenhum veículo cadastrado ainda.</p>
            ) : (
              vehicles.slice(0, 5).map(v => (
                <div key={v.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)'}}>
                  <div>
                    <div style={{color:'var(--text)', fontSize:13, fontWeight:500}}>{v.year_model} {v.brand} {v.model}</div>
                    <div style={{color:'var(--muted)', fontSize:11}}>{Number(v.km).toLocaleString('pt-BR')} km • {v.color}</div>
                  </div>
                  <span style={{color:'var(--green)', fontWeight:600, fontSize:13}}>
                    R$ {Number(v.price).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}