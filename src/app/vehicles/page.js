'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { 
  Car, Plus, Search, Filter, Monitor, Fuel, 
  Settings, Palette, Calendar, Trash2, Edit3, 
  Zap, Video, Image as ImageIcon, ChevronLeft, 
  ChevronRight, X, Sparkles, CheckCircle, Play, Maximize2
} from 'lucide-react';

const AGENCY_ID = process.env.NEXT_PUBLIC_AGENCY_ID || '6ee07688-9d34-4d18-861c-62585a440cc0';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Gallery state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeGalleryImages, setActiveGalleryImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Video modal state
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState('');

  const [filters, setFilters] = useState({
    search: '', status: '', fuel: '', transmission: '', minPrice: '', maxPrice: ''
  });

  const [formData, setFormData] = useState({
    brand: '', model: '', year: '', price: '', mileage: '', 
    color: '', fuel: '', transmission: '', status: 'available', 
    description: '', video_url: '', photos: []
  });

  const fileInputRef = useRef(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ agency_id: AGENCY_ID, ...filters });
      const res = await api.get(`/api/vehicles?${params.toString()}`);
      setVehicles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erro ao buscar veículos:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, agency_id: AGENCY_ID };
      if (editingVehicle) {
        await api.put(`/api/vehicles/${editingVehicle.id}`, payload);
      } else {
        await api.post(`/api/vehicles`, payload);
      }
      fetchVehicles();
      setShowForm(false);
      setEditingVehicle(null);
      setFormData({ 
        brand: '', model: '', year: '', price: '', mileage: '', 
        color: '', fuel: '', transmission: '', status: 'available', 
        description: '', video_url: '', photos: [] 
      });
    } catch (err) {
      alert('Erro ao salvar veículo: ' + err.message);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      price: vehicle.price || '',
      mileage: vehicle.mileage || '',
      color: vehicle.color || '',
      fuel: vehicle.fuel || '',
      transmission: vehicle.transmission || '',
      status: vehicle.status || 'available',
      description: vehicle.description || '',
      video_url: vehicle.video_url || '',
      photos: Array.isArray(vehicle.photos) ? vehicle.photos : []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja excluir este veículo permanentemente?')) return;
    try {
      await api.delete(`/api/vehicles/${id}`);
      fetchVehicles();
    } catch (err) {
      console.error('Erro ao excluir veículo:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!editingVehicle) {
      alert('Por favor, salve os dados básicos do veículo primeiro para poder subir fotos.');
      return;
    }

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const fileFormData = new FormData();
        fileFormData.append('photo', files[i]);
        await api.post(`/api/upload/photo/${editingVehicle.id}`, fileFormData);
      }
      // Refresh form/list
      if (editingVehicle) {
        const res = await api.get(`/api/vehicles/${editingVehicle.id}`);
        setFormData(prev => ({ ...prev, photos: res.data.photos || [] }));
      }
      fetchVehicles();
    } catch (err) {
      alert('Erro no upload: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const generateDescription = async () => {
    if (!formData.brand || !formData.model) return;
    setAiLoading(true);
    try {
      const res = await api.post('/api/agent/chat', {
        agencyId: AGENCY_ID,
        message: `Gere uma descrição curta e vendedora para um ${formData.brand} ${formData.model} ${formData.year}, cor ${formData.color}, ${formData.fuel}, câmbio ${formData.transmission}.`,
      });
      setFormData(prev => ({ ...prev, description: res.response }));
    } catch (err) {
      console.error('Erro IA:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const openGallery = (photos, startIndex = 0) => {
    if (!photos || photos.length === 0) return;
    setActiveGalleryImages(photos);
    setCurrentImageIndex(startIndex);
    setGalleryOpen(true);
  };

  const openVideo = (url) => {
    if (!url) return;
    setActiveVideoUrl(url);
    setVideoModalOpen(true);
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    return url;
  };

  return (
    <div className="p-8 page-transition relative min-h-screen">
      {/* Lightbox Gallery */}
      {galleryOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <button onClick={() => setGalleryOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white z-[110] bg-white/10 p-2 rounded-full backdrop-blur-md transition-all"><X size={32}/></button>
          
          <button 
            onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : activeGalleryImages.length - 1))}
            className="absolute left-6 text-white/50 hover:text-white bg-white/5 p-4 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronLeft size={40}/>
          </button>
          
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <img 
              src={activeGalleryImages[currentImageIndex]} 
              className="max-h-full max-w-full object-contain shadow-2xl rounded-lg animate-in zoom-in-95 duration-300" 
              alt="Gallery View" 
            />
            <div className="absolute bottom-0 bg-black/40 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 backdrop-blur-md">
              {currentImageIndex + 1} / {activeGalleryImages.length}
            </div>
          </div>

          <button 
            onClick={() => setCurrentImageIndex(prev => (prev < activeGalleryImages.length - 1 ? prev + 1 : 0))}
            className="absolute right-6 text-white/50 hover:text-white bg-white/5 p-4 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronRight size={40}/>
          </button>
        </div>
      )}

      {/* Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button onClick={() => setVideoModalOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full backdrop-blur-md transition-all"><X size={24}/></button>
          <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {activeVideoUrl.includes('youtube') || activeVideoUrl.includes('youtu.be') ? (
              <iframe className="w-full h-full" src={getEmbedUrl(activeVideoUrl)} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            ) : (
              <video src={activeVideoUrl} controls autoPlay className="w-full h-full"></video>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">Estoque de Veículos</h1>
          <p className="text-slate-500 mt-1">Gerencie seu catálogo e publique novas ofertas</p>
        </div>
        
        <button
          onClick={() => { setShowForm(true); setEditingVehicle(null); setFormData({ brand: '', model: '', year: '', price: '', mileage: '', color: '', fuel: '', transmission: '', status: 'available', description: '', video_url: '', photos: [] }); }}
          className="btn-gradient flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          <span>Cadastrar Veículo</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 mb-8 shadow-sm grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            placeholder="Buscar por marca ou modelo..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <select 
          className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none font-semibold text-slate-600 focus:border-indigo-500 transition-all"
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">Status: Todos</option>
          <option value="available">Disponível</option>
          <option value="sold">Vendido</option>
          <option value="reserved">Reservado</option>
        </select>
        <select 
          className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none font-semibold text-slate-600 focus:border-indigo-500 transition-all"
          value={filters.fuel}
          onChange={(e) => setFilters({...filters, fuel: e.target.value})}
        >
          <option value="">Combustível: Todos</option>
          <option value="flex">Flex</option>
          <option value="gasolina">Gasolina</option>
          <option value="diesel">Diesel</option>
        </select>
        <div className="flex gap-2">
           <input placeholder="R$ Mín" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} />
        </div>
        <button 
          onClick={() => setFilters({ search: '', status: '', fuel: '', transmission: '', minPrice: '', maxPrice: '' })}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl py-2 px-4 transition-colors"
        >
          Limpar Filtros
        </button>
      </div>

      {/* Main Container */}
      <div className={`${showForm ? 'mb-12 translate-y-0 opacity-100' : 'hidden -translate-y-4 opacity-0'} transition-all duration-300`}>
        <div className="card-premium p-8 bg-white overflow-hidden relative border-indigo-100 ring-1 ring-indigo-500/5">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
           
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-xl font-bold font-outfit text-slate-900 flex items-center gap-2 relative">
               <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200"><Car size={20}/></div>
               {editingVehicle ? 'Editar Dados do Veículo' : 'Cadastrar novo veículo no estoque'}
             </h2>
             <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-full"><X size={20}/></button>
           </div>

           <form onSubmit={handleSubmit} className="relative space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 ml-1"><Monitor size={12}/> Marca</label>
                   <input required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium" placeholder="Ex: Toyota" />
                </div>
                <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 ml-1"><Car size={12}/> Modelo</label>
                   <input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium" placeholder="Ex: Corolla XEI" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 ml-1"><Calendar size={12}/> Ano</label>
                   <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none" placeholder="2024" />
                </div>
                <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 ml-1"><Monitor size={12}/> Preço de Venda (R$)</label>
                   <input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none text-indigo-600 font-bold" placeholder="R$ 0,00" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 ml-1"><Zap size={12}/> Quilometragem (KM)</label>
                   <input value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none" placeholder="Ex: 15.000" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 ml-1"><Palette size={12}/> Cor</label>
                   <input value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none" placeholder="Branco" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 ml-1"><Fuel size={12}/> Combustível</label>
                   <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none appearance-none" value={formData.fuel} onChange={e => setFormData({...formData, fuel: e.target.value})}>
                      <option value="">Selecione</option>
                      <option value="flex">Flex</option>
                      <option value="gasolina">Gasolina</option>
                      <option value="diesel">Diesel</option>
                   </select>
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 ml-1"><Settings size={12}/> Câmbio</label>
                   <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none appearance-none" value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value})}>
                      <option value="">Selecione</option>
                      <option value="manual">Manual</option>
                      <option value="automático">Automático</option>
                      <option value="cvt">CVT</option>
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                   <div className="space-y-3">
                     <div className="flex items-center justify-between">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Descrição do Veículo</label>
                       <button type="button" onClick={generateDescription} disabled={aiLoading} className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 hover:bg-indigo-600 hover:text-white transition-all">
                         <Sparkles size={12}/> {aiLoading ? 'Processando IA...' : 'GERAR DESCRIÇÃO COM IA'}
                       </button>
                     </div>
                     <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none font-medium leading-relaxed" placeholder="Destaque os diferenciais do carro..." />
                   </div>

                   <div className="space-y-3">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Video size={14} className="text-red-500"/> Link Externo do Vídeo (YouTube / Vimeo)</label>
                     <input value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" placeholder="https://www.youtube.com/watch?v=..." />
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Galeria de Fotos</label>
                   
                   <div className="grid grid-cols-3 gap-2 mb-4">
                     {formData.photos.map((photo, i) => (
                       <div key={i} className="aspect-square rounded-lg bg-slate-100 relative group overflow-hidden border border-slate-200">
                         <img src={photo} className="w-full h-full object-cover" />
                         <button 
                           type="button" 
                           onClick={() => setFormData({...formData, photos: formData.photos.filter((_, idx) => idx !== i)})}
                           className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <X size={10}/>
                         </button>
                       </div>
                     ))}
                     {formData.photos.length < 6 && (
                       <button 
                        type="button" 
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        className="aspect-square flex flex-col items-center justify-center gap-1 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                       >
                         {uploading ? <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full"></div> : <Plus size={20}/>}
                         <span className="text-[8px] font-bold">{uploading ? 'ENVIANDO' : 'ADD FOTO'}</span>
                       </button>
                     )}
                   </div>
                   
                   <input 
                     type="file" 
                     multiple 
                     accept="image/*" 
                     className="hidden" 
                     ref={fileInputRef} 
                     onChange={handleFileUpload} 
                   />

                   <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                      <p className="text-[10px] text-amber-700 font-bold leading-tight">
                        DICA: Salve os dados básicos antes de subir fotos para vincular corretamente ao veículo.
                      </p>
                   </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all font-outfit">Sair sem salvar</button>
                <button type="submit" className="btn-gradient px-12 py-3 shadow-xl shadow-indigo-200">Confirmar e Publicar Inventário</button>
              </div>
           </form>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 animate-in fade-in transition-all">
          <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Sincronizando Inventário</p>
            <p className="text-slate-300 text-[10px] uppercase font-bold mt-1">Acessando Supabase...</p>
          </div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="card-premium py-32 flex flex-col items-center border-dashed border-2">
           <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
             <Car size={40} className="text-slate-200" />
           </div>
           <h3 className="text-xl font-bold font-outfit text-slate-900">Nenhum Veículo no Pátio</h3>
           <p className="text-slate-400 text-sm mt-1 max-w-xs text-center font-medium">Seu inventário digital está iluminado pelo vazio. Comece a cadastrar os veículos agora mesmo.</p>
           <button onClick={() => setShowForm(true)} className="mt-8 text-indigo-600 font-bold text-sm bg-indigo-50 px-6 py-2 rounded-full hover:bg-indigo-600 hover:text-white transition-all">Começar agora</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-white rounded-[2.5rem] p-4 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 group border border-slate-100">
               <div className="h-60 bg-slate-950 rounded-[2rem] relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacitiy-60"></div>
                  
                  {v.photos && v.photos.length > 0 ? (
                    <img 
                      src={v.photos[0]} 
                      className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700 cursor-pointer" 
                      onClick={() => openGallery(v.photos)}
                    />
                  ) : (
                    <Car size={80} className="text-white/5 opacity-20" />
                  )}

                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-md shadow-lg ${
                      v.status === 'available' ? 'bg-emerald-500 text-white' : 
                      v.status === 'sold' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {v.status === 'available' ? 'Pátio' : v.status === 'sold' ? 'Vendido' : 'Reservado'}
                    </span>
                  </div>

                  {v.video_url && (
                    <button 
                      onClick={() => openVideo(v.video_url)}
                      className="absolute center-absolute z-20 w-14 h-14 bg-white/20 hover:bg-white/40 text-white backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 transform scale-0 group-hover:scale-100 transition-all duration-500 shadow-2xl"
                    >
                      <Play fill="currentColor" size={24}/>
                    </button>
                  )}

                  {v.photos && v.photos.length > 1 && (
                    <button 
                      onClick={() => openGallery(v.photos)}
                      className="absolute bottom-4 right-4 z-20 px-3 py-1 bg-black/40 text-white text-[10px] font-bold rounded-full backdrop-blur-md border border-white/10"
                    >
                      +{v.photos.length - 1} FOTOS
                    </button>
                  )}
               </div>

               <div className="p-6 space-y-5">
                  <div className="flex items-start justify-between">
                     <div className="space-y-1">
                       <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest">{v.brand}</span>
                       <h3 className="text-xl font-bold text-slate-900 font-outfit tracking-tight group-hover:text-indigo-600 transition-colors">{v.model}</h3>
                     </div>
                     <span className="text-xl font-extrabold text-slate-900 font-outfit">R$ {parseFloat(v.price || 0).toLocaleString('pt-BR')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-2.5 text-slate-500 text-xs font-bold bg-slate-50 p-2.5 rounded-2xl">
                        <Calendar size={14} className="text-indigo-500"/> {v.year}
                     </div>
                     <div className="flex items-center gap-2.5 text-slate-500 text-xs font-bold bg-slate-50 p-2.5 rounded-2xl">
                        <Zap size={14} className="text-indigo-500"/> {v.mileage?.toLocaleString('pt-BR')} KM
                     </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed opacity-80 italic font-medium">
                    {v.description || 'Veículo premium aguardando descrição personalizada via IA.'}
                  </p>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                     <div className="flex gap-2.5">
                       <button onClick={() => handleEdit(v)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center hover:shadow-lg hover:shadow-indigo-200">
                         <Edit3 size={18} />
                       </button>
                       <button onClick={() => handleDelete(v.id)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center hover:shadow-lg hover:shadow-rose-200">
                         <Trash2 size={18} />
                       </button>
                     </div>
                     
                     <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full">
                       Destaque <CheckCircle size={14}/>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}