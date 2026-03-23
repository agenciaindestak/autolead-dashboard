'use client'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { Send, Bot, User } from 'lucide-react'

const API = 'https://autolead-backend-production.up.railway.app'
const AGENCY_ID = '6ee07688-9d34-4d18-861c-62585a440cc0'

export default function Chat() {
  const [leads, setLeads]           = useState([])
  const [selected, setSelected]     = useState(null)
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    fetch(`${API}/api/leads?agency_id=${AGENCY_ID}`)
      .then(r => r.json()).then(setLeads).catch(() => {})
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  useEffect(() => {
    if(!selected) return
    fetch(`${API}/api/leads/${selected.id}`)
      .then(r => r.json())
      .then(d => setMessages((d.messages||[]).map(m => ({ role:m.role, content:m.content }))))
      .catch(() => setMessages([]))
  }, [selected])

  async function send() {
    if(!input.trim() || !selected || loading) return
    const txt = input
    setMessages(p => [...p, { role:'user', content:txt }])
    setInput('')
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/agent/chat`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ leadId:selected.id, agencyId:AGENCY_ID, conversationId:`conv-${selected.id}`, message:txt })
      })
      const d = await r.json()
      setMessages(p => [...p, { role:'assistant', content:d.reply || d.message || 'Sem resposta' }])
    } catch {
      setMessages(p => [...p, { role:'assistant', content:'Erro ao conectar com o agente.' }])
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--bg)', overflow:'hidden' }}>
      <Sidebar />

      {/* Lista de leads */}
      <div style={{ width:'240px', minWidth:'240px', borderRight:'1px solid var(--border)', background:'var(--card)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'16px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ color:'var(--text)', fontWeight:'700', fontSize:'14px' }}>Leads</div>
          <div style={{ color:'var(--muted2)', fontSize:'11px', marginTop:'2px' }}>Selecione para conversar</div>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {leads.length === 0 && <div style={{ padding:'20px', color:'var(--muted2)', fontSize:'12px', textAlign:'center' }}>Nenhum lead</div>}
          {leads.map(l => (
            <div key={l.id}
              onClick={() => { setSelected(l); setMessages([]) }}
              style={{
                padding:'12px 16px', borderBottom:'1px solid var(--border)', cursor:'pointer',
                background: selected?.id === l.id ? 'rgba(161,0,194,0.12)' : 'transparent',
                borderLeft: selected?.id === l.id ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'rgba(161,0,194,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ color:'var(--accent2)', fontSize:'11px', fontWeight:'700' }}>{(l.name||'?').charAt(0).toUpperCase()}</span>
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ color:'var(--text)', fontSize:'12px', fontWeight:'600', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{l.name||'—'}</div>
                  <div style={{ color:'var(--muted2)', fontSize:'10px', marginTop:'1px' }}>Score: {l.score||0}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área do chat */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {!selected ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px' }}>
            <Bot size={48} color="var(--accent2)" style={{ opacity:.4 }} />
            <p style={{ color:'var(--muted)', fontSize:'14px' }}>Selecione um lead para iniciar o chat</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--card)' }}>
              <div style={{ color:'var(--text)', fontWeight:'700', fontSize:'14px' }}>{selected.name}</div>
              <div style={{ color:'var(--muted2)', fontSize:'11px', marginTop:'2px' }}>{selected.email} • Score: {selected.score||0} • {selected.channel||'—'}</div>
            </div>

            {/* Mensagens */}
            <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:'14px' }}>
              {messages.length === 0 && !loading && (
                <div style={{ textAlign:'center', color:'var(--muted2)', fontSize:'13px', marginTop:'20px' }}>Nenhuma mensagem ainda. Inicie a conversa!</div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{ display:'flex', gap:'9px', flexDirection: m.role==='user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', background: m.role==='assistant' ? 'rgba(161,0,194,0.15)' : 'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {m.role==='assistant' ? <Bot size={13} color="var(--accent2)" /> : <User size={13} color="var(--muted2)" />}
                  </div>
                  <div style={{
                    maxWidth:'70%', padding:'9px 14px', borderRadius: m.role==='assistant' ? '3px 12px 12px 12px' : '12px 3px 12px 12px',
                    background: m.role==='assistant' ? 'var(--card)' : 'var(--accent)',
                    color: 'var(--text)', fontSize:'13px', lineHeight:'1.55',
                    border: m.role==='assistant' ? '1px solid var(--border)' : 'none',
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display:'flex', gap:'9px' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'rgba(161,0,194,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Bot size={13} color="var(--accent2)" />
                  </div>
                  <div style={{ background:'var(--card)', border:'1px solid var(--border)', padding:'9px 14px', borderRadius:'3px 12px 12px 12px', display:'flex', gap:'5px', alignItems:'center' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--muted2)', animation:`bounce 1.2s ${i*0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border)', background:'var(--card)' }}>
              <div style={{ display:'flex', gap:'9px' }}>
                <input
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()}
                  placeholder="Digite uma mensagem..."
                  style={{ flex:1, background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:'10px', padding:'9px 14px', color:'var(--text)', fontSize:'13px', outline:'none' }}
                />
                <button onClick={send} disabled={loading||!input.trim()} style={{
                  width:'38px', height:'38px', borderRadius:'10px', background:'var(--accent)', border:'none',
                  display:'flex', alignItems:'center', justifyContent:'center', opacity: (loading||!input.trim()) ? .5 : 1,
                }}>
                  <Send size={15} color="#fff" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(.6);opacity:.3} 40%{transform:scale(1);opacity:1} }`}</style>
    </div>
  )
}
