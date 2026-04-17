'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { 
  MessageSquare, Search, Filter, Calendar, 
  ChevronRight, Phone, Smartphone, Instagram, 
  Facebook, User, Clock
} from 'lucide-react';

const AGENCY_ID = process.env.NEXT_PUBLIC_AGENCY_ID || '6ee07688-9d34-4d18-861c-62585a440cc0';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/conversations?agency_id=${AGENCY_ID}`);
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erro ao buscar conversas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const getChannelDetails = (channel) => {
    const channels = {
      whatsapp: { icon: <Smartphone size={14} />, label: 'WhatsApp', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
      manual: { icon: <MessageSquare size={14} />, label: 'Chat Manual', color: 'text-slate-600 bg-slate-50 border-slate-100' },
      instagram: { icon: <Instagram size={14} />, label: 'Instagram', color: 'text-pink-600 bg-pink-50 border-pink-100' },
      facebook: { icon: <Facebook size={14} />, label: 'Facebook', color: 'text-blue-600 bg-blue-50 border-blue-100' }
    };
    return channels[channel] || channels.manual;
  };

  const statusStyles = {
    open: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    closed: 'text-slate-400 bg-slate-50 border-slate-100',
    archived: 'text-indigo-600 bg-indigo-50 border-indigo-100'
  };

  const filteredConversations = conversations.filter(conv => 
    (conv.lead_name || 'Desconhecido').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.channel || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 page-transition">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">Histórico de Conversas</h1>
          <p className="text-slate-500 mt-1">Acompanhe todas as interações entre seus agentes e leads</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome do lead ou canal..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600">
            <Filter size={16} />
            <span>Filtrar Canal:</span>
            <select className="bg-transparent outline-none font-semibold text-slate-900 appearance-none pr-4">
              <option value="all">Todos</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-medium tracking-wide">Carregando histórico...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-24 px-6">
              <MessageSquare size={48} className="text-slate-100 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">Nenhuma interação registrada</h3>
              <p className="text-slate-500 mt-1 max-w-xs mx-auto">As conversas capturadas via WhatsApp ou Chat aparecerão aqui.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Lead / Identificação</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Origem / Canal</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest leading-none text-right">Última Atividade</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest leading-none text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredConversations.map((conv) => {
                  const channel = getChannelDetails(conv.channel);
                  return (
                    <tr key={conv.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              <User size={18} />
                           </div>
                           <div>
                              <div className="font-bold text-slate-900 font-outfit text-base leading-tight">{conv.lead_name || 'Prospect Anônimo'}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">ID: {conv.id.substring(0, 8)}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wide ${channel.color}`}>
                           {channel.icon}
                           {channel.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusStyles[conv.status] || statusStyles.open}`}>
                           {conv.status || 'Ativa'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                           <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Calendar size={12} className="text-slate-400"/> {new Date(conv.updated_at).toLocaleDateString('pt-BR')}</span>
                           <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1"><Clock size={10}/> {new Date(conv.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <Link 
                            href={`/conversations/${conv.id}`}
                            className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 text-slate-600 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all border border-transparent hover:shadow-md"
                          >
                            DETALHES <ChevronRight size={14} />
                          </Link>
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