'use client'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { Search, Plus, X, ChevronLeft, ChevronRight, Upload, ImageIcon } from 'lucide-react'

const API = 'https://autolead-backend-production.up.railway.app'
const AGENCY_ID = '6ee07688-9d34-4d18-861c-62585a440cc0'

const S = {
  input: { width:'100%', background:'#1a1d27', border:'1px solid #374151', borderRadius:'8px', padding:'8px 12px', color:'#f9fafb', fontSize:'13px', outline:'none' },
  label: { color:'#9ca3af', fontSize:'12px', marginBottom:'5px', display:'block' },
}

export default function Vehicles() {
  const [vehicles, setVehicles]   = useState([])
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [gallery, setGallery]     = useState(null)
  const [form, setForm] = useState({ brand:'', model:'', version:'', year_model:'', year_fab:'', color:'', price:'', km:'', fuel:'Flex', transmission:'Automático', description:'', status:'disponivel' })
  const [photos, setPhotos]       = useState([])
  const [generatingDesc, setGeneratingDesc] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => { load() }, [])

  function load() {
    setLoading(true)
    fetch(`${API}/api/vehicles?agency_id=${AGENCY_ID}`)
      .then(r => r.json())
      .then(d => { setVehicles(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  function upd(k, v) { setForm(f => ({...f, [k]:v})) }

  function openNew() {
    setEditingId(null)
    setForm({ brand:'', model:'', version:'', year_model:'', year_fab:'', color:'', price:'', km:'', fuel:'Flex', transmission:'Automático', description:'', status:'disponivel' })
    setPhotos([])
    setShowForm(true)
    setTimeout(() => window.scrollTo({top:0, behavior:'smooth'}), 100)
  }

  function openEdit(v) {
    setEditingId(v.id)
    setForm({ brand:v.brand||'', model:v.model||'', version:v.version||'', year_model:v.year_model||'', year_fab:v.year_fab||'', color:v.color||'', price:v.price||'', km:v.km||'', fuel:v.fuel||'Flex', transmission:v.transmission||'Automático', description:v.description||'', status:v.status||'disponivel' })
    const existing = (v.photos||[]).map(url => ({ file:null, preview:url, url }))
    setPhotos(existing)
    setShowForm(true)
    setTimeout(() => window.scrollTo({top:0, behavior:'smooth'}), 100)
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files)
    const newPhotos = files.map(f => ({ file:f, preview:URL.createObjectURL(f), url:null }))
    setPhotos(p => [...p, ...newPhotos])
    e.target.value = ''
  }

  function removePhoto(i) { setPhotos(p => p.filter((_, idx) => idx !== i)) }

  async function generateDesc() {
    if(!form.brand || !form.model) return alert('Preencha Marca e Modelo primeiro')
    setGeneratingDesc(true)
    try {
      const r = await fetch(`${API}/api/agent/description`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ brand:form.brand, model:form.model, version:form.version, year_model:form.year_model, color:form.color, km:form.km, fuel:form.fuel, transmission:form.transmission, price:form.price })
      })
      const d = await r.json()
      upd('description', d.description || '')
    } catch { alert('Erro ao gerar descrição') }
    setGeneratingDesc(false)
  }

  async function save() {
    if(!form.brand || !form.model) return alert('Preencha Marca e Modelo')
    setSaving(true)
    try {
      let vehicleId = editingId
      if(editingId) {
        await fetch(`${API}/api/vehicles/${editingId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, agency_id:AGENCY_ID }) })
      } else {
        const r = await fetch(`${API}/api/vehicles`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, agency_id:AGENCY_ID }) })
        const d = await r.json()
        vehicleId = d.id || d.data?.id
      }
      const newPhotos = photos.filter(p => p.file && !p.url)
      if(newPhotos.length > 0 && vehicleId) {
        for(let i = 0; i < newPhotos.length; i++) {
          setUploadProgress(`Enviando foto ${i+1} de ${newPhotos.length}...`)
          const fd = new FormData()
          fd.append('photo', newPhotos[i].file)
          await fetch(`${API}/api/upload/photo/${vehicleId}`, { method:'POST', body:fd })
        }
        setUploadProgress('')
      }
      setShowForm(false)
      load()
    } catch(e) { alert('Erro ao salvar: ' + e.message) }
    setSaving(false)
  }

  async function remove(id) {
    if(!confirm('Remover este veículo?')) return
    await fetch(`${API}/api/vehicles/${id}`, { method:'DELETE' })
    load()
  }

  function openGallery(v, idx=0) {
    const all = v.photos || []
    if(all.length === 0) return
    setGallery({ photos:all, index:idx, name:`${v.year_model||''} ${v.brand} ${v.model}` })
  }
  function galleryPrev() { setGallery(g => ({...g, index: g.index === 0 ? g.photos.length-1 : g.index-1})) }
  function galleryNext() { setGallery(g => ({...g, index: g.index === g.photos.length-1 ? 0 : g.index+1})) }

  const filtered = vehicles.filter(v => `${v.brand} ${v.model} ${v.version||''}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      <Sidebar />
      <main style={{ flex:1, padding:'28px', overflowY:'auto' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <div>
            <h1 style={{ fontSize:'24px', fontWeight:'800', color:'var(--text)' }}>Veículos</h1>
            <p style={{ color:'var(--muted)', marginTop:'4px' }}>{vehicles.length} veículos no estoque</p>
          </div>
          <button onClick={openNew} style={{ display:'flex', alignItems:'center', gap:'6px', background:'var(--accent)', color:'#fff', border:'none', padding:'9px 18px', borderRadius:'9px', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>
            <Plus size={14} /> Novo Veículo
          </button>
        </div>

        {/* FORMULÁRIO */}
        {showForm && (
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'24px', marginBottom:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 style={{ color:'var(--text)', fontWeight:'700', fontSize:'16px' }}>{editingId ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', color:'var(--muted2)', cursor:'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px', marginBottom:'14px' }}>
              {[{k:'brand',l:'Marca *'},{k:'model',l:'Modelo *'},{k:'version',l:'Versão'},{k:'year_model',l:'Ano Modelo'},{k:'year_fab',l:'Ano Fab.'},{k:'color',l:'Cor'},{k:'price',l:'Preço (R$)'},{k:'km',l:'Quilometragem'}].map(f => (
                <div key={f.k}><label style={S.label}>{f.l}</label><input style={S.input} value={form[f.k]} onChange={e => upd(f.k, e.target.value)} /></div>
              ))}
              <div><label style={S.label}>Combustível</label><select style={S.input} value={form.fuel} onChange={e => upd('fuel', e.target.value)}>{['Flex','Gasolina','Etanol','Diesel','Elétrico','Híbrido'].map(o => <option key={o}>{o}</option>)}</select></div>
              <div><label style={S.label}>Câmbio</label><select style={S.input} value={form.transmission} onChange={e => upd('transmission', e.target.value)}>{['Automático','Manual','CVT','Automatizado'].map(o => <option key={o}>{o}</option>)}</select></div>
              <div><label style={S.label}>Status</label><select style={S.input} value={form.status} onChange={e => upd('status', e.target.value)}>{['disponivel','reservado','vendido'].map(o => <option key={o}>{o}</option>)}</select></div>
            </div>

            <div style={{ marginBottom:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' }}>
                <label style={S.label}>Descrição</label>
                <button onClick={generateDesc} disabled={generatingDesc} style={{ background:'rgba(161,0,194,0.15)', color:'var(--accent2)', border:'1px solid rgba(161,0,194,0.3)', borderRadius:'6px', padding:'4px 10px', fontSize:'11px', cursor:'pointer' }}>
                  {generatingDesc ? '⏳ Gerando...' : '🤖 Gerar com IA'}
                </button>
              </div>
              <textarea style={{...S.input, minHeight:'80px', resize:'vertical'}} value={form.description} onChange={e => upd('description', e.target.value)} placeholder="Descreva o veículo ou use IA..." />
            </div>

            {/* Upload fotos */}
            <div style={{ marginBottom:'18px' }}>
              <label style={S.label}>Fotos do Veículo</label>
              <div onClick={() => fileRef.current?.click()} style={{ border:'2px dashed var(--border2)', borderRadius:'10px', padding:'18px', textAlign:'center', cursor:'pointer', marginBottom:'10px' }} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border2)'}>
                <Upload size={20} color="var(--muted2)" style={{ marginBottom:'5px' }} />
                <div style={{ color:'var(--muted2)', fontSize:'12px' }}>Clique para adicionar fotos (múltiplas)</div>
                <input ref={fileRef} type="file" multiple accept="image/*" style={{ display:'none' }} onChange={handleFileChange} />
              </div>
              {photos.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'7px' }}>
                  {photos.map((p, i) => (
                    <div key={i} style={{ position:'relative', borderRadius:'7px', overflow:'hidden', aspectRatio:'4/3', border:'1px solid var(--border)' }}>
                      <img src={p.preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      {i===0 && <div style={{ position:'absolute', bottom:'3px', left:'3px', background:'rgba(161,0,194,0.9)', borderRadius:'3px', padding:'1px 5px', fontSize:'9px', color:'#fff', fontWeight:'700' }}>CAPA</div>}
                      <button onClick={() => removePhoto(i)} style={{ position:'absolute', top:'3px', right:'3px', background:'rgba(0,0,0,0.75)', border:'none', borderRadius:'3px', width:'18px', height:'18px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={10} color="#fff" /></button>
                    </div>
                  ))}
                </div>
              )}
              {uploadProgress && <div style={{ color:'var(--accent2)', fontSize:'12px', marginTop:'7px' }}>⏳ {uploadProgress}</div>}
            </div>

            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={save} disabled={saving} style={{ background:'var(--accent)', color:'#fff', border:'none', padding:'10px 22px', borderRadius:'9px', fontSize:'13px', fontWeight:'600', cursor:'pointer', opacity:saving?.7:1 }}>
                {saving ? 'Salvando...' : editingId ? '💾 Salvar Alterações' : '✅ Cadastrar Veículo'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ background:'var(--bg3)', color:'var(--text)', border:'1px solid var(--border2)', padding:'10px 16px', borderRadius:'9px', fontSize:'13px', cursor:'pointer' }}>Cancelar</button>
            </div>
          </div>
        )}

        {/* LISTA */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'12px', overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', position:'relative' }}>
            <Search size={14} style={{ position:'absolute', left:'28px', top:'50%', transform:'translateY(-50%)', color:'var(--muted2)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar veículo..." style={{...S.input, paddingLeft:'34px'}} />
          </div>

          {loading ? (
            <div style={{ padding:'40px', textAlign:'center', color:'var(--muted)' }}>Carregando...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:'40px', textAlign:'center', color:'var(--muted)' }}>Nenhum veículo encontrado.</div>
          ) : filtered.map(v => {
            const cover = v.photos?.[0] || null
            const sc = v.status==='disponivel' ? {bg:'rgba(109,194,0,0.1)',c:'#6dc200'} : v.status==='reservado' ? {bg:'rgba(245,158,11,0.1)',c:'#f59e0b'} : {bg:'rgba(239,68,68,0.1)',c:'#ef4444'}
            return (
              <div key={v.id} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>

                {/* Capa */}
                <div onClick={() => openGallery(v)} style={{ width:'90px', height:'68px', borderRadius:'9px', overflow:'hidden', flexShrink:0, cursor:cover?'pointer':'default', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border)' }}>
                  {cover ? <img src={cover} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <ImageIcon size={24} color="var(--muted2)" />}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'var(--text)', fontWeight:'700', fontSize:'14px' }}>{v.year_model} {v.brand} {v.model} {v.version||''}</div>
                  <div style={{ color:'var(--muted2)', fontSize:'12px', marginTop:'3px' }}>{Number(v.km||0).toLocaleString('pt-BR')} km • {v.color||'—'} • {v.fuel} • {v.transmission}</div>
                  {v.description && <div style={{ color:'var(--muted)', fontSize:'11px', marginTop:'3px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'460px' }}>{v.description.substring(0,100)}...</div>}
                  {v.photos?.length > 0 && (
                    <button onClick={() => openGallery(v)} style={{ background:'none', border:'none', color:'var(--accent2)', fontSize:'11px', cursor:'pointer', padding:'0', marginTop:'3px' }}>
                      📸 {v.photos.length} foto{v.photos.length>1?'s':''} — ver galeria
                    </button>
                  )}
                </div>

                {/* Preço / ações */}
                <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
                  <span style={{ color:'#6dc200', fontWeight:'800', fontSize:'15px' }}>R$ {Number(v.price||0).toLocaleString('pt-BR')}</span>
                  <span style={{ background:sc.bg, color:sc.c, padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', textTransform:'capitalize' }}>{v.status||'disponivel'}</span>
                  <button onClick={() => openEdit(v)} style={{ background:'rgba(59,130,246,0.1)', color:'#3b82f6', border:'none', padding:'6px 12px', borderRadius:'7px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>Editar</button>
                  <button onClick={() => remove(v.id)} style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'none', padding:'6px 12px', borderRadius:'7px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>Remover</button>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* GALERIA MODAL */}
      {gallery && (
        <div onClick={() => setGallery(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.93)', zIndex:1000, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <button onClick={() => setGallery(null)} style={{ position:'absolute', top:'18px', right:'22px', background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'8px', padding:'7px 13px', color:'#fff', cursor:'pointer', fontSize:'18px' }}>✕</button>
          <div style={{ position:'absolute', top:'22px', left:'50%', transform:'translateX(-50%)', color:'rgba(255,255,255,0.5)', fontSize:'12px' }}>{gallery.index+1} / {gallery.photos.length}</div>
          <div style={{ position:'absolute', top:'18px', left:'22px', color:'#fff', fontWeight:'700', fontSize:'14px' }}>{gallery.name}</div>

          <div onClick={e => e.stopPropagation()} style={{ maxWidth:'85vw', maxHeight:'72vh' }}>
            <img src={gallery.photos[gallery.index]} alt="" style={{ maxWidth:'100%', maxHeight:'72vh', borderRadius:'12px', objectFit:'contain' }} />
          </div>

          {gallery.photos.length > 1 && (
            <>
              <button onClick={e=>{e.stopPropagation();galleryPrev()}} style={{ position:'absolute', left:'20px', top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:'46px', height:'46px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><ChevronLeft size={22} color="#fff" /></button>
              <button onClick={e=>{e.stopPropagation();galleryNext()}} style={{ position:'absolute', right:'20px', top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:'46px', height:'46px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><ChevronRight size={22} color="#fff" /></button>
              <div onClick={e=>e.stopPropagation()} style={{ position:'absolute', bottom:'20px', display:'flex', gap:'7px', maxWidth:'90vw', overflowX:'auto', padding:'4px' }}>
                {gallery.photos.map((p,i) => (
                  <img key={i} src={p} onClick={()=>setGallery(g=>({...g,index:i}))} alt="" style={{ width:'60px', height:'45px', objectFit:'cover', borderRadius:'5px', cursor:'pointer', border: i===gallery.index ? '2px solid #a100c2' : '2px solid transparent', opacity: i===gallery.index ? 1 : 0.55, transition:'all .15s' }} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
