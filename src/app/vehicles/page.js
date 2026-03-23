'use client'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { Search, Plus, X, ChevronLeft, ChevronRight, Upload, ImageIcon, ExternalLink, Play } from 'lucide-react'

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

  // Modal detalhes
  const [detail, setDetail]       = useState(null)
  const [detailPhotoIdx, setDetailPhotoIdx] = useState(0)

  // Galeria fullscreen
  const [gallery, setGallery]     = useState(null)

  const [form, setForm] = useState({
    brand:'', model:'', version:'', year_model:'', year_fab:'',
    color:'', price:'', km:'', fuel:'Flex', transmission:'Automático',
    description:'', status:'disponivel', video_url:''
  })
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
    setForm({ brand:'', model:'', version:'', year_model:'', year_fab:'', color:'', price:'', km:'', fuel:'Flex', transmission:'Automático', description:'', status:'disponivel', video_url:'' })
    setPhotos([])
    setShowForm(true)
  }

  function openEdit(v, e) {
    e?.stopPropagation()
    setEditingId(v.id)
    setForm({
      brand:v.brand||'', model:v.model||'', version:v.version||'',
      year_model:v.year_model||'', year_fab:v.year_fab||'',
      color:v.color||'', price:v.price||'', km:v.km||'',
      fuel:v.fuel||'Flex', transmission:v.transmission||'Automático',
      description:v.description||'', status:v.status||'disponivel',
      video_url:v.video_url||''
    })
    setPhotos((v.photos||[]).map(url => ({ file:null, preview:url, url })))
    setShowForm(true)
    setDetail(null)
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files)
    setPhotos(p => [...p, ...files.map(f => ({ file:f, preview:URL.createObjectURL(f), url:null }))])
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
      upd('description', d.description||'')
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

  async function remove(id, e) {
    e?.stopPropagation()
    if(!confirm('Remover este veículo?')) return
    await fetch(`${API}/api/vehicles/${id}`, { method:'DELETE' })
    setDetail(null)
    load()
  }

  // Abre modal de detalhes
  function openDetail(v) {
    setDetail(v)
    setDetailPhotoIdx(0)
  }

  // Galeria fullscreen a partir do modal
  function openGallery(photos, idx=0) {
    setGallery({ photos, index:idx })
  }

  const filtered = vehicles.filter(v =>
    `${v.brand} ${v.model} ${v.version||''}`.toLowerCase().includes(search.toLowerCase())
  )

  const statusMap = {
    disponivel: { label:'Disponível', bg:'rgba(109,194,0,0.1)', c:'#6dc200' },
    reservado:  { label:'Reservado',  bg:'rgba(245,158,11,0.1)', c:'#f59e0b' },
    vendido:    { label:'Vendido',    bg:'rgba(239,68,68,0.1)',  c:'#ef4444' },
    available:  { label:'Disponível', bg:'rgba(109,194,0,0.1)', c:'#6dc200' },
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      <Sidebar />
      <main style={{ flex:1, padding:'28px', overflowY:'auto' }}>

        {/* Header */}
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
              <div><label style={S.label}>Combustível</label><select style={S.input} value={form.fuel} onChange={e => upd('fuel', e.target.value)}>{['Flex','Gasolina','Etanol','Diesel','Elétrico','Híbrido'].map(o=><option key={o}>{o}</option>)}</select></div>
              <div><label style={S.label}>Câmbio</label><select style={S.input} value={form.transmission} onChange={e => upd('transmission', e.target.value)}>{['Automático','Manual','CVT','Automatizado'].map(o=><option key={o}>{o}</option>)}</select></div>
              <div><label style={S.label}>Status</label><select style={S.input} value={form.status} onChange={e => upd('status', e.target.value)}>{['disponivel','reservado','vendido'].map(o=><option key={o}>{o}</option>)}</select></div>
            </div>

            {/* Vídeo externo */}
            <div style={{ marginBottom:'14px' }}>
              <label style={S.label}>🎬 Link do Vídeo (YouTube / Google Drive)</label>
              <input style={S.input} value={form.video_url} onChange={e => upd('video_url', e.target.value)} placeholder="https://youtube.com/watch?v=... ou https://drive.google.com/..." />
              <div style={{ color:'var(--muted)', fontSize:'11px', marginTop:'4px' }}>O agente IA enviará este link automaticamente quando o lead perguntar sobre o veículo.</div>
            </div>

            {/* Descrição */}
            <div style={{ marginBottom:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' }}>
                <label style={S.label}>Descrição</label>
                <button onClick={generateDesc} disabled={generatingDesc} style={{ background:'rgba(161,0,194,0.15)', color:'var(--accent2)', border:'1px solid rgba(161,0,194,0.3)', borderRadius:'6px', padding:'4px 10px', fontSize:'11px', cursor:'pointer' }}>
                  {generatingDesc ? '⏳ Gerando...' : '🤖 Gerar com IA'}
                </button>
              </div>
              <textarea style={{...S.input, minHeight:'80px', resize:'vertical'}} value={form.description} onChange={e => upd('description', e.target.value)} placeholder="Descreva o veículo ou use a IA para gerar automaticamente..." />
            </div>

            {/* Upload fotos */}
            <div style={{ marginBottom:'18px' }}>
              <label style={S.label}>📸 Fotos do Veículo</label>
              <div onClick={() => fileRef.current?.click()} style={{ border:'2px dashed var(--border2)', borderRadius:'10px', padding:'16px', textAlign:'center', cursor:'pointer', marginBottom:'10px' }} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border2)'}>
                <Upload size={20} color="var(--muted2)" style={{ marginBottom:'4px' }} />
                <div style={{ color:'var(--muted2)', fontSize:'12px' }}>Clique para adicionar fotos (múltiplas)</div>
                <input ref={fileRef} type="file" multiple accept="image/*" style={{ display:'none' }} onChange={handleFileChange} />
              </div>
              {photos.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'7px' }}>
                  {photos.map((p,i) => (
                    <div key={i} style={{ position:'relative', borderRadius:'7px', overflow:'hidden', aspectRatio:'4/3', border:'1px solid var(--border)' }}>
                      <img src={p.preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      {i===0 && <div style={{ position:'absolute', bottom:'3px', left:'3px', background:'rgba(161,0,194,0.9)', borderRadius:'3px', padding:'1px 5px', fontSize:'9px', color:'#fff', fontWeight:'700' }}>CAPA</div>}
                      <button onClick={()=>removePhoto(i)} style={{ position:'absolute', top:'3px', right:'3px', background:'rgba(0,0,0,0.75)', border:'none', borderRadius:'3px', width:'18px', height:'18px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={10} color="#fff" /></button>
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
              <button onClick={()=>setShowForm(false)} style={{ background:'var(--bg3)', color:'var(--text)', border:'1px solid var(--border2)', padding:'10px 16px', borderRadius:'9px', fontSize:'13px', cursor:'pointer' }}>Cancelar</button>
            </div>
          </div>
        )}

        {/* LISTA */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'12px', overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', position:'relative' }}>
            <Search size={14} style={{ position:'absolute', left:'28px', top:'50%', transform:'translateY(-50%)', color:'var(--muted2)' }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar veículo..." style={{...S.input, paddingLeft:'34px'}} />
          </div>

          {loading ? (
            <div style={{ padding:'40px', textAlign:'center', color:'var(--muted)' }}>Carregando...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:'40px', textAlign:'center', color:'var(--muted)' }}>Nenhum veículo encontrado.</div>
          ) : filtered.map(v => {
            const cover = v.photos?.[0] || null
            const sc = statusMap[v.status] || statusMap.disponivel
            return (
              <div key={v.id} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
                {/* Capa clicável */}
                <div onClick={()=>cover ? openGallery(v.photos,0) : null} style={{ width:'90px', height:'68px', borderRadius:'9px', overflow:'hidden', flexShrink:0, cursor:cover?'pointer':'default', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border)' }}>
                  {cover ? <img src={cover} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <ImageIcon size={24} color="var(--muted2)" />}
                </div>

                {/* Info — nome clicável abre modal */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div onClick={()=>openDetail(v)} style={{ color:'var(--text)', fontWeight:'700', fontSize:'14px', cursor:'pointer', display:'inline-block' }}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--accent2)'}
                    onMouseLeave={e=>e.currentTarget.style.color='var(--text)'}
                  >
                    {v.year_model} {v.brand} {v.model} {v.version||''}
                  </div>
                  <div style={{ color:'var(--muted2)', fontSize:'12px', marginTop:'3px' }}>{Number(v.km||0).toLocaleString('pt-BR')} km • {v.color||'—'} • {v.fuel} • {v.transmission}</div>
                  {v.description && <div style={{ color:'var(--muted)', fontSize:'11px', marginTop:'3px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'420px' }}>{v.description.substring(0,90)}...</div>}
                  <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
                    {v.photos?.length > 0 && <button onClick={()=>openGallery(v.photos,0)} style={{ background:'none', border:'none', color:'var(--accent2)', fontSize:'11px', cursor:'pointer', padding:0 }}>📸 {v.photos.length} foto{v.photos.length>1?'s':''}</button>}
                    {v.video_url && <button onClick={()=>window.open(v.video_url,'_blank')} style={{ background:'none', border:'none', color:'#ef4444', fontSize:'11px', cursor:'pointer', padding:0 }}>▶ Ver vídeo</button>}
                  </div>
                </div>

                {/* Preço / ações */}
                <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
                  <span style={{ color:'#6dc200', fontWeight:'800', fontSize:'15px' }}>R$ {Number(v.price||0).toLocaleString('pt-BR')}</span>
                  <span style={{ background:sc.bg, color:sc.c, padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600' }}>{sc.label}</span>
                  <button onClick={e=>openEdit(v,e)} style={{ background:'rgba(59,130,246,0.1)', color:'#3b82f6', border:'none', padding:'6px 12px', borderRadius:'7px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>Editar</button>
                  <button onClick={e=>remove(v.id,e)} style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'none', padding:'6px 12px', borderRadius:'7px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>Remover</button>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* ═══════════ MODAL DETALHES ═══════════ */}
      {detail && (
        <div onClick={()=>setDetail(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:900, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#111827', border:'1px solid #1f2937', borderRadius:'16px', width:'min(860px,95vw)', maxHeight:'90vh', overflowY:'auto', display:'flex', flexDirection:'column' }}>

            {/* Header do modal */}
            <div style={{ padding:'18px 22px', borderBottom:'1px solid #1f2937', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#111827', zIndex:2 }}>
              <div>
                <h2 style={{ color:'#f9fafb', fontWeight:'800', fontSize:'18px' }}>{detail.year_model} {detail.brand} {detail.model} {detail.version||''}</h2>
                <div style={{ color:'#9ca3af', fontSize:'12px', marginTop:'3px' }}>{detail.color} • {detail.fuel} • {detail.transmission}</div>
              </div>
              <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                <button onClick={e=>openEdit(detail,e)} style={{ background:'rgba(59,130,246,0.1)', color:'#3b82f6', border:'none', padding:'7px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>✏️ Editar</button>
                <button onClick={()=>setDetail(null)} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'8px', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#9ca3af' }}><X size={16} /></button>
              </div>
            </div>

            <div style={{ padding:'22px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>

              {/* Coluna esquerda */}
              <div>
                {/* Foto principal */}
                <div style={{ borderRadius:'12px', overflow:'hidden', marginBottom:'10px', background:'#1a1d27', border:'1px solid #1f2937', aspectRatio:'16/9', display:'flex', alignItems:'center', justifyContent:'center', cursor: detail.photos?.length>0 ? 'pointer' : 'default' }}
                  onClick={()=>detail.photos?.length>0 && openGallery(detail.photos, detailPhotoIdx)}
                >
                  {detail.photos?.length>0
                    ? <img src={detail.photos[detailPhotoIdx]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <ImageIcon size={40} color="#6b7280" />
                  }
                </div>

                {/* Thumbnails */}
                {detail.photos?.length > 1 && (
                  <div style={{ display:'flex', gap:'6px', overflowX:'auto', marginBottom:'10px' }}>
                    {detail.photos.map((p,i) => (
                      <img key={i} src={p} onClick={()=>setDetailPhotoIdx(i)} alt="" style={{ width:'56px', height:'42px', objectFit:'cover', borderRadius:'6px', cursor:'pointer', border: i===detailPhotoIdx ? '2px solid #a100c2' : '2px solid transparent', opacity: i===detailPhotoIdx ? 1 : 0.55, flexShrink:0 }} />
                    ))}
                  </div>
                )}

                {/* Botão abrir galeria completa */}
                {detail.photos?.length > 0 && (
                  <button onClick={()=>openGallery(detail.photos,0)} style={{ width:'100%', background:'rgba(161,0,194,0.1)', color:'var(--accent2)', border:'1px solid rgba(161,0,194,0.2)', borderRadius:'8px', padding:'8px', fontSize:'12px', cursor:'pointer', marginBottom:'10px' }}>
                    🖼 Abrir galeria completa ({detail.photos.length} fotos)
                  </button>
                )}

                {/* Link do vídeo */}
                {detail.video_url && (
                  <a href={detail.video_url} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', fontWeight:'600', textDecoration:'none', marginBottom:'10px' }}>
                    <Play size={15} /> Ver vídeo do veículo <ExternalLink size={12} style={{ marginLeft:'auto' }} />
                  </a>
                )}
              </div>

              {/* Coluna direita */}
              <div>
                {/* Preço e status */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                  <div style={{ color:'#6dc200', fontWeight:'800', fontSize:'26px' }}>R$ {Number(detail.price||0).toLocaleString('pt-BR')}</div>
                  <span style={{ background:(statusMap[detail.status]||statusMap.disponivel).bg, color:(statusMap[detail.status]||statusMap.disponivel).c, padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>
                    {(statusMap[detail.status]||statusMap.disponivel).label}
                  </span>
                </div>

                {/* Especificações */}
                <div style={{ background:'#1a1d27', borderRadius:'10px', padding:'14px', marginBottom:'14px' }}>
                  <div style={{ color:'#9ca3af', fontSize:'11px', fontWeight:'600', letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:'10px' }}>Especificações</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                    {[
                      {l:'Ano modelo',    v:detail.year_model},
                      {l:'Ano fab.',      v:detail.year_fab},
                      {l:'Quilometragem', v:`${Number(detail.km||0).toLocaleString('pt-BR')} km`},
                      {l:'Combustível',   v:detail.fuel},
                      {l:'Câmbio',        v:detail.transmission},
                      {l:'Cor',           v:detail.color},
                    ].map(s => s.v ? (
                      <div key={s.l} style={{ background:'#111827', borderRadius:'7px', padding:'8px 10px' }}>
                        <div style={{ color:'#6b7280', fontSize:'10px', marginBottom:'2px' }}>{s.l}</div>
                        <div style={{ color:'#f9fafb', fontSize:'13px', fontWeight:'600' }}>{s.v}</div>
                      </div>
                    ) : null)}
                  </div>
                </div>

                {/* Descrição */}
                {detail.description && (
                  <div style={{ background:'#1a1d27', borderRadius:'10px', padding:'14px' }}>
                    <div style={{ color:'#9ca3af', fontSize:'11px', fontWeight:'600', letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:'8px' }}>Descrição</div>
                    <div style={{ color:'#d1d5db', fontSize:'13px', lineHeight:'1.7', whiteSpace:'pre-line' }}>{detail.description}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ GALERIA FULLSCREEN ═══════════ */}
      {gallery && (
        <div onClick={()=>setGallery(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.95)', zIndex:1000, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <button onClick={()=>setGallery(null)} style={{ position:'absolute', top:'18px', right:'22px', background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'8px', padding:'7px 13px', color:'#fff', cursor:'pointer', fontSize:'18px' }}>✕</button>
          <div style={{ position:'absolute', top:'22px', left:'50%', transform:'translateX(-50%)', color:'rgba(255,255,255,0.5)', fontSize:'12px' }}>{gallery.index+1} / {gallery.photos.length}</div>

          <div onClick={e=>e.stopPropagation()} style={{ maxWidth:'85vw', maxHeight:'72vh' }}>
            <img src={gallery.photos[gallery.index]} alt="" style={{ maxWidth:'100%', maxHeight:'72vh', borderRadius:'12px', objectFit:'contain' }} />
          </div>

          {gallery.photos.length > 1 && (
            <>
              <button onClick={e=>{e.stopPropagation();setGallery(g=>({...g,index:g.index===0?g.photos.length-1:g.index-1}))}} style={{ position:'absolute', left:'20px', top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:'46px', height:'46px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><ChevronLeft size={22} color="#fff" /></button>
              <button onClick={e=>{e.stopPropagation();setGallery(g=>({...g,index:g.index===g.photos.length-1?0:g.index+1}))}} style={{ position:'absolute', right:'20px', top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:'46px', height:'46px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><ChevronRight size={22} color="#fff" /></button>
              <div onClick={e=>e.stopPropagation()} style={{ position:'absolute', bottom:'20px', display:'flex', gap:'7px', maxWidth:'90vw', overflowX:'auto', padding:'4px' }}>
                {gallery.photos.map((p,i) => (
                  <img key={i} src={p} onClick={()=>setGallery(g=>({...g,index:i}))} alt="" style={{ width:'60px', height:'45px', objectFit:'cover', borderRadius:'5px', cursor:'pointer', border:i===gallery.index?'2px solid #a100c2':'2px solid transparent', opacity:i===gallery.index?1:0.55 }} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
