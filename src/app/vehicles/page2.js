'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://autolead-backend-production.up.railway.app'
const AGENCY_ID = process.env.NEXT_PUBLIC_AGENCY_ID || '6ee07688-9d34-4d18-861c-62585a440cc0'

const emptyForm = {
  brand: '', model: '', version: '', year_model: '', year_fab: '',
  color: '', price: '', km: '', fuel: 'Flex', transmission: 'Automático',
  description: ''
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadVehicles() }, [])

  async function loadVehicles() {
    try {
      const res = await fetch(`${API}/api/vehicles?agency_id=${AGENCY_ID}`)
      const data = await res.json()
      setVehicles(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  function openNew() {
    setEditId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(v) {
    setEditId(v.id)
    setForm({
      brand: v.brand || '', model: v.model || '', version: v.version || '',
      year_model: v.year_model || '', year_fab: v.year_fab || '',
      color: v.color || '', price: v.price || '', km: v.km || '',
      fuel: v.fuel || 'Flex', transmission: v.transmission || 'Automático',
      description: v.description || ''
    })
    setShowForm(true)
  }

  async function generateDescription() {
    if (!form.brand || !form.model) {
      alert('Preencha marca e modelo primeiro!')
      return
    }
    setGenerating(true)
    try {
      const res = await fetch(`${API}/api/agent/description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      setForm(f => ({ ...f, description: data.description }))
    } catch (err) {
      alert('Erro ao gerar descrição')
    } finally {
      setGenerating(false)
    }
  }

  async function saveVehicle() {
    if (!form.brand || !form.model || !form.price) {
      alert('Preencha marca, modelo e preço!')
      return
    }
    setSaving(true)
    try {
      const body = {
        agency_id: AGENCY_ID,
        brand: form.brand, model: form.model, version: form.version,
        year_model: parseInt(form.year_model) || 2024,
        year_fab: parseInt(form.year_fab) || 2024,
        color: form.color,
        price: parseFloat(form.price.toString().replace(/\./g, '').replace(',', '.')),
        km: parseInt(form.km.toString().replace(/\./g, '').replace(',', '.')) || 0,
        fuel: form.fuel, transmission: form.transmission,
        description: form.description, status: 'available'
      }

      const res = await fetch(
        editId ? `${API}/api/vehicles/${editId}` : `${API}/api/vehicles`,
        {
          method: editId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      )
      if (res.ok) {
        setShowForm(false)
        setForm(emptyForm)
        setEditId(null)
        loadVehicles()
      }
    } catch (err) { alert('Erro ao salvar veículo') }
    finally { setSaving(false) }
  }

  async function deleteVehicle(id) {
    if (!confirm('Remover este veículo?')) return
    await fetch(`${API}/api/vehicles/${id}`, { method: 'DELETE' })
    loadVehicles()
  }

  const filtered = vehicles.filter(v =>
    `${v.brand} ${v.model} ${v.version}`.toLowerCase().includes(search.toLowerCase())
  )

  const s = {
    page: { padding: '2rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    title: { fontSize: '1.5rem', fontWeight: '600', color: '#f9fafb' },
    sub: { fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' },
    btn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' },
    btnGray: { background: '#374151', color: '#f9fafb', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' },
    btnBlue: { background: '#1d4ed8', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' },
    btnRed: { background: '#dc2626', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' },
    btnGreen: { background: '#065f46', color: '#10b981', border: '1px solid #10b981', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' },
    search: { width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '0.75rem 1rem', color: '#f9fafb', marginBottom: '1rem', fontSize: '0.875rem', boxSizing: 'border-box' },
    card: { background: '#1f2937', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cardLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
    icon: { width: '40px', height: '40px', background: '#065f46', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 },
    cardTitle: { fontWeight: '600', color: '#f9fafb', fontSize: '0.95rem' },
    cardSub: { fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' },
    cardDesc: { fontSize: '0.72rem', color: '#6b7280', marginTop: '4px', maxWidth: '500px' },
    price: { color: '#10b981', fontWeight: '700', fontSize: '1rem' },
    badge: { background: '#064e3b', color: '#10b981', padding: '2px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '500', marginLeft: '8px' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: '#1f2937', borderRadius: '16px', padding: '2rem', width: '580px', maxHeight: '90vh', overflowY: 'auto' },
    modalTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#f9fafb', marginBottom: '1.5rem' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '4px' },
    input: { width: '100%', background: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '0.6rem 0.8rem', color: '#f9fafb', fontSize: '0.875rem', boxSizing: 'border-box' },
    select: { width: '100%', background: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '0.6rem 0.8rem', color: '#f9fafb', fontSize: '0.875rem' },
    textarea: { width: '100%', background: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '0.6rem 0.8rem', color: '#f9fafb', fontSize: '0.875rem', minHeight: '100px', resize: 'vertical', boxSizing: 'border-box' },
    modalFooter: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' },
    empty: { textAlign: 'center', color: '#6b7280', padding: '3rem', fontSize: '0.875rem' }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Veículos</h1>
          <p style={s.sub}>{vehicles.length} veículos no estoque</p>
        </div>
        <button style={s.btn} onClick={openNew}>+ Novo Veículo</button>
      </div>

      <input style={s.search} placeholder="Buscar veículo..." value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? (
        <div style={s.empty}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>Nenhum veículo encontrado</div>
      ) : (
        filtered.map(v => (
          <div key={v.id} style={s.card}>
            <div style={s.cardLeft}>
              <div style={s.icon}>🚗</div>
              <div>
                <div style={s.cardTitle}>{v.year_model} {v.brand} {v.model} {v.version}</div>
                <div style={s.cardSub}>{Number(v.km).toLocaleString('pt-BR')} km • {v.color} • {v.fuel}</div>
                {v.description && <div style={s.cardDesc}>{v.description.slice(0, 80)}...</div>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <div>
                <span style={s.price}>R$ {Number(v.price).toLocaleString('pt-BR')}</span>
                <span style={s.badge}>{v.status}</span>
              </div>
              <button style={s.btnBlue} onClick={() => openEdit(v)}>Editar</button>
              <button style={s.btnRed} onClick={() => deleteVehicle(v.id)}>Remover</button>
            </div>
          </div>
        ))
      )}

      {showForm && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>{editId ? 'Editar Veículo' : 'Novo Veículo'}</h2>
            <div style={s.grid2}>
              {[
                { key: 'brand', label: 'Marca *', placeholder: 'Ex: Honda' },
                { key: 'model', label: 'Modelo *', placeholder: 'Ex: Civic' },
                { key: 'version', label: 'Versão', placeholder: 'Ex: EXL' },
                { key: 'color', label: 'Cor', placeholder: 'Ex: Preto' },
                { key: 'year_model', label: 'Ano Modelo', placeholder: 'Ex: 2023' },
                { key: 'year_fab', label: 'Ano Fabricação', placeholder: 'Ex: 2022' },
                { key: 'price', label: 'Preço *', placeholder: 'Ex: 149900' },
                { key: 'km', label: 'Quilometragem', placeholder: 'Ex: 15000' },
              ].map(f => (
                <div key={f.key}>
                  <label style={s.label}>{f.label}</label>
                  <input style={s.input} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} />
                </div>
              ))}
              <div>
                <label style={s.label}>Combustível</label>
                <select style={s.select} value={form.fuel} onChange={e => setForm({...form, fuel: e.target.value})}>
                  {['Flex','Gasolina','Etanol','Diesel','Elétrico','Híbrido'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Câmbio</label>
                <select style={s.select} value={form.transmission} onChange={e => setForm({...form, transmission: e.target.value})}>
                  {['Automático','Manual','CVT','Automatizado'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={s.label}>Descrição</label>
                <button style={s.btnGreen} onClick={generateDescription} disabled={generating}>
                  {generating ? '⏳ Gerando...' : '✨ Gerar com IA'}
                </button>
              </div>
              <textarea style={s.textarea} placeholder="Descreva o veículo ou clique em Gerar com IA..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnGray} onClick={() => { setShowForm(false); setEditId(null) }}>Cancelar</button>
              <button style={s.btn} onClick={saveVehicle} disabled={saving}>
                {saving ? 'Salvando...' : editId ? 'Atualizar' : 'Salvar Veículo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}