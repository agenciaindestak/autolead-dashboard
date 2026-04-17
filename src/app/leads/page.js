'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Search, Plus, Filter, MoreVertical, Phone, Mail, Tag, Calendar, User, Trash2, Edit2 } from 'lucide-react';

const AGENCY_ID = process.env.NEXT_PUBLIC_AGENCY_ID || '6ee07688-9d34-4d18-861c-62585a440cc0';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interest: '',
    budget: '',
    notes: '',
    status: 'new'
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/leads?agency_id=${AGENCY_ID}`);
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erro ao carregar leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, agency_id: AGENCY_ID };
      if (editingLead) {
        await api.put(`/api/leads/${editingLead.id}`, payload);
      } else {
        await api.post(`/api/leads`, payload);
      }
      await fetchLeads();
      setShowForm(false);
      setEditingLead(null);
      setFormData({ name: '', phone: '', email: '', interest: '', budget: '', notes: '', status: 'new' });
    } catch (err) {
      alert('Erro ao salvar lead: ' + err.message);
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      interest: lead.interest || '',
      budget: lead.budget || '',
      notes: lead.notes || '',
      status: lead.status || 'new'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente excluir este lead?')) return;
    try {
      await api.delete(`/api/leads/${id}`);
      fetchLeads();
    } catch (err) {
      console.error('Erro ao excluir lead:', err);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = (lead.name || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (lead.email || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (lead.phone || '').includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusMap = {
    new: { label: 'Novo', color: 'text-blue-600 bg-blue-50 border-blue-100' },
    novo: { label: 'Novo', color: 'text-blue-600 bg-blue-50 border-blue-100' },
    contacted: { label: 'Contatado', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    contatado: { label: 'Contatado', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    qualified: { label: 'Qualificado', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    qualificado: { label: 'Qualificado', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    converted: { label: 'Convertido', color: 'text-violet-600 bg-violet-50 border-violet-100' },
    lost: { label: 'Perdido', color: 'text-rose-600 bg-rose-50 border-rose-100' },
    perdido: { label: 'Perdido', color: 'text-rose-600 bg-rose-50 border-rose-100' }
  };

  return (
    <div className="p-8 page-transition">
      {/* Header com Filtros e Ação */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">Gestão de Leads</h1>
          <p className="text-slate-500 mt-1">Acompanhe e qualifique seus potenciais clientes</p>
        </div>
        
        <button
          onClick={() => { setShowForm(true); setEditingLead(null); }}
          className="btn-gradient flex items-center justify-center gap-2 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          <span>Cadastrar Novo Lead</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600">
            <Filter size={16} />
            <span>Status:</span>
            <select 
              className="bg-transparent outline-none font-semibold text-slate-900"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="new">Novo</option>
              <option value="contacted">Contatado</option>
              <option value="qualified">Qualificado</option>
              <option value="lost">Perdido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Form/Table Container */}
      <div className="card-premium overflow-hidden">
        {showForm ? (
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold font-outfit text-slate-900 mb-6 flex items-center gap-2">
              <User size={22} className="text-indigo-600" />
              {editingLead ? 'Editar Cadastro do Lead' : 'Ficha de Novo Lead'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
                <input
                  required
                  placeholder="Nome do cliente"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">WhatsApp / Telefone</label>
                <input
                  placeholder="(00) 00000-0000"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail</label>
                <input
                  type="email"
                  placeholder="exemplo@email.com"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Modelo de Interesse</label>
                <input
                  placeholder="Ex: Corolla, Civic, Onix..."
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Orçamento Estimado</label>
                <input
                  type="text"
                  placeholder="R$ 0,00"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Status Atual</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="new">Novo Lead</option>
                  <option value="contacted">Contatado</option>
                  <option value="qualified">Qualificado</option>
                  <option value="lost">Perdido</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Anotações e Próximos Passos</label>
                <textarea
                  rows={2}
                  placeholder="Descreva detalhes da conversa ou preferências do cliente..."
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-700 transition-all"
                >
                  {editingLead ? 'Salvar Alterações' : 'Cadastrar Lead'}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-medium tracking-wide">Atualizando listagem...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-20 px-6">
              <User size={48} className="text-slate-100 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">Nenhum lead encontrado</h3>
              <p className="text-slate-500 mt-1 max-w-xs mx-auto">Tente ajustar seus filtros ou cadastre um novo lead.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Cliente / Contato</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Interesse Principal</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest leading-none text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest leading-none text-right">Cadastrado em</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest leading-none text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLeads.map((lead) => {
                  const status = statusMap[lead.status?.toLowerCase()] || statusMap.new;
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 font-outfit text-base">{lead.name || 'S/ Nome'}</div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold"><Phone size={12}/> {lead.phone || '—'}</span>
                          <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold"><Mail size={12}/> {lead.email || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-indigo-400" />
                          <span className="text-sm font-semibold text-slate-700">{lead.interest || 'Não especif.'}</span>
                        </div>
                        {lead.budget && <div className="text-[11px] text-slate-400 font-bold mt-1 ml-5">Budget: {lead.budget}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                           <span className="text-xs font-bold text-slate-600 flex items-center gap-1"><Calendar size={12} className="text-slate-400"/> {lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : '—'}</span>
                           <span className="text-[10px] text-slate-400 font-semibold tracking-tighter mt-1 italic">Score: {lead.score || 0} pts</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(lead)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all" title="Editar"><Edit2 size={16}/></button>
                          <button onClick={() => handleDelete(lead.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all" title="Excluir"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}