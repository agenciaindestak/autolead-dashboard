'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Bot, Plus, User, MessageSquare, Shield, 
  Settings2, Activity, Trash2, Edit3, 
  CheckCircle2, AlertCircle, Info, Sparkles
} from 'lucide-react';

const AGENCY_ID = process.env.NEXT_PUBLIC_AGENCY_ID || '6ee07688-9d34-4d18-861c-62585a440cc0';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    avatar_url: '',
    tone: 'profissional',
    specialty: 'vendas',
    system_prompt: '',
    active: true
  });

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/agents?agency_id=${AGENCY_ID}`);
      setAgents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar agentes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, agency_id: AGENCY_ID };
      if (editingAgent) {
        await api.put(`/api/agents/${editingAgent.id}`, payload);
      } else {
        await api.post(`/api/agents`, payload);
      }
      fetchAgents();
      setShowForm(false);
      setEditingAgent(null);
      setFormData({ name: '', avatar_url: '', tone: 'profissional', specialty: 'vendas', system_prompt: '', active: true });
    } catch (err) {
      console.error('Erro ao salvar agente:', err);
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name || '',
      avatar_url: agent.avatar_url || '',
      tone: agent.tone || 'profissional',
      specialty: agent.specialty || 'vendas',
      system_prompt: agent.system_prompt || '',
      active: agent.active ?? true
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente excluir este agente?')) return;
    try {
      await api.delete(`/api/agents/${id}`);
      fetchAgents();
    } catch (err) {
      console.error('Erro ao excluir agente:', err);
    }
  };

  const toggleActive = async (agent) => {
    try {
      await api.put(`/api/agents/${agent.id}`, { active: !agent.active });
      fetchAgents();
    } catch (err) {
      console.error('Erro ao atualizar agente:', err);
    }
  };

  return (
    <div className="p-8 page-transition">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">Agentes de IA</h1>
          <p className="text-slate-500 mt-1">Configure a personalidade e o comportamento dos seus assistentes</p>
        </div>
        
        <button
          onClick={() => { setShowForm(true); setEditingAgent(null); }}
          className="btn-gradient flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          <span>Criar Novo Agente</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Column (Conditional) */}
        {showForm && (
          <div className="lg:col-span-12 xl:col-span-5 card-premium p-8 animate-in slide-in-from-left-4 duration-500 border-indigo-100 bg-white">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-bold font-outfit text-slate-900 flex items-center gap-2">
                 <Settings2 size={20} className="text-indigo-600"/>
                 {editingAgent ? 'Editar Configurações' : 'Configurar Novo Agente'}
               </h2>
               <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-900 transition-colors">Fechar</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Agente</label>
                    <input 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                      placeholder="Ex: Consultor Alex"
                    />
                  </div>
                  <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL da Foto (Opcional)</label>
                    <input 
                      value={formData.avatar_url} 
                      onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tom de Conversa</label>
                    <select 
                      value={formData.tone} 
                      onChange={e => setFormData({...formData, tone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none appearance-none"
                    >
                      <option value="profissional">👔 Resoluto / Profissional</option>
                      <option value="informal">🤝 Amigável / Informal</option>
                      <option value="entusiasta">🚀 Entusiasta / Vendedor</option>
                      <option value="direto">⚡ Direto / Objetivo</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Especialidade</label>
                    <select 
                      value={formData.specialty} 
                      onChange={e => setFormData({...formData, specialty: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none appearance-none"
                    >
                      <option value="vendas">💰 Fechamento de Vendas</option>
                      <option value="pós-venda">⭐ Pós-Venda / Suporte</option>
                      <option value="qualificação">🔍 Qualificação de Leads</option>
                      <option value="geral">🌐 Atendimento Geral</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                    Instruções do Sistema (Prompt)
                    <span className="text-[9px] font-medium text-amber-500 lowercase normal-case italic flex items-center gap-1"><Sparkles size={10}/> IA usará estas diretrizes</span>
                  </label>
                  <textarea 
                    rows={5} 
                    value={formData.system_prompt} 
                    onChange={e => setFormData({...formData, system_prompt: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none font-medium text-sm leading-relaxed"
                    placeholder="Ex: Você é um consultor especialista em SUVs. Seu objetivo é agendar um test-drive..."
                  />
               </div>

               <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                  <input 
                    type="checkbox" 
                    id="active-check"
                    checked={formData.active} 
                    onChange={e => setFormData({...formData, active: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="active-check" className="text-sm font-bold text-slate-800 tracking-tight block">Agente Disponível</label>
                    <p className="text-[11px] text-slate-500 leading-none">Habilitar este agente para responder novos leads agora.</p>
                  </div>
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all">Cancelar</button>
                  <button type="submit" className="btn-gradient px-10">{editingAgent ? 'Salvar Edição' : 'Criar Agente'}</button>
               </div>
            </form>
          </div>
        )}

        {/* List Column */}
        <div className={`${showForm ? 'lg:col-span-12 xl:col-span-7' : 'lg:col-span-12'} space-y-6 transition-all duration-500`}>
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-medium tracking-wide">Sincronizando agentes...</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="card-premium py-24 flex flex-col items-center border-dashed">
               <Bot size={64} className="text-slate-100 mb-6" />
               <h3 className="text-xl font-bold font-outfit text-slate-900">Nenhum Agente Ativo</h3>
               <p className="text-slate-400 text-sm mt-1 max-w-sm text-center">Comece configurando seu primeiro assistente virtual para automatizar seu atendimento.</p>
               <button onClick={() => setShowForm(true)} className="mt-8 text-indigo-600 font-bold hover:underline flex items-center gap-2">Configurar agora <ChevronRight size={14} /></button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {agents.map((agent) => (
                <div key={agent.id} className={`card-premium p-6 group relative overflow-hidden transition-all duration-500 ${agent.active ? 'border-emerald-200/60 ring-1 ring-emerald-100 shadow-emerald-500/5' : 'border-slate-200/60 grayscale-[0.2]'}`}>
                   {/* Background Decor */}
                   <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-5 text-indigo-600 group-hover:scale-110 transition-transform">
                      <MessageSquare size={100} />
                   </div>

                   <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                           <div className="relative">
                              {agent.avatar_url ? (
                                <img src={agent.avatar_url} className="w-14 h-14 rounded-2xl object-cover shadow-sm border-2 border-white" />
                              ) : (
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                  {agent.name.charAt(0)}
                                </div>
                              )}
                              {agent.active && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                              )}
                           </div>
                           <div>
                              <h3 className="text-lg font-bold text-slate-900 font-outfit leading-tight group-hover:text-indigo-600 transition-colors">{agent.name}</h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{agent.specialty}</span>
                                 <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{agent.tone}</span>
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                           <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border transition-colors ${agent.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                             {agent.active ? 'ATIVO' : 'INATIVO'}
                           </span>
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                         <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/50 group-hover:border-indigo-100 transition-colors">
                            <p className="text-xs font-medium text-slate-600 leading-relaxed italic line-clamp-3">
                               {agent.system_prompt || 'Utilizando diretrizes padrão de comportamento inteligente.'}
                            </p>
                         </div>
                         
                         <div className="flex items-center gap-4 px-1">
                            <div className="flex items-center gap-1.5">
                               <Activity size={14} className="text-emerald-500" />
                               <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">100% Online</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                               <Shield size={14} className="text-indigo-400" />
                               <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Criptografia</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                        <button 
                          onClick={() => toggleActive(agent)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${agent.active ? 'bg-rose-50 text-rose-600 border border-transparent hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 border border-transparent hover:bg-emerald-100'}`}
                        >
                           {agent.active ? 'Pausar Agente' : 'Retomar Atendimento'}
                        </button>
                        <button onClick={() => handleEdit(agent)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl border border-transparent hover:border-indigo-200 hover:text-indigo-600 hover:bg-white transition-all"><Edit3 size={18}/></button>
                        <button onClick={() => handleDelete(agent.id)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl border border-transparent hover:border-rose-200 hover:text-rose-600 hover:bg-white transition-all"><Trash2 size={18}/></button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }) {
   return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
         <polyline points="9 18 15 12 9 6" />
      </svg>
   )
}