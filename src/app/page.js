'use client';

import { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, Car, TrendingUp, Clock, 
  CheckCircle, RefreshCw, AlertCircle, ArrowUpRight, 
  Monitor, Calendar, UserCheck
} from 'lucide-react';
import api from '@/lib/api';
import StatsCard from '@/components/StatsCard';

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    totalLeads: 0, 
    activeConversations: 0, 
    totalVehicles: 0, 
    conversionRate: 0, 
    todayLeads: 0, 
    qualificados: 0 
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [leadsRes, vehiclesRes] = await Promise.all([
        api.get('/api/leads'),
        api.get('/api/vehicles'),
      ]);

      const leads = Array.isArray(leadsRes.data) ? leadsRes.data : [];
      const vehicles = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [];
      
      const today = new Date().toISOString().split('T')[0];
      const todayLeads = leads.filter(l => (l.created_at || '').startsWith(today)).length;
      const qualificados = leads.filter(l => ['qualificado', 'qualified'].includes((l.status || '').toLowerCase())).length;
      const contatados = leads.filter(l => ['contatado', 'contacted'].includes((l.status || '').toLowerCase())).length;
      const conversionRate = leads.length > 0 ? ((qualificados / leads.length) * 100).toFixed(1) : 0;

      setStats({ 
        totalLeads: leads.length, 
        activeConversations: contatados, 
        totalVehicles: vehicles.length, 
        conversionRate, 
        todayLeads, 
        qualificados 
      });
      setRecentLeads(leads.slice(0, 5));
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Falha na comunicação com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const cardData = [
    { title: 'Total de Leads', value: stats.totalLeads, icon: Users, bg: '#f0f9ff', color: '#0369a1', sub: `+${stats.todayLeads} novos hoje` },
    { title: 'Em Atendimento', value: stats.activeConversations, icon: MessageSquare, bg: '#f0fdf4', color: '#15803d', sub: 'Leads contatados' },
    { title: 'Estoque Ativo', value: stats.totalVehicles, icon: Car, bg: '#faf5ff', color: '#7e22ce', sub: 'Veículos cadastrados' },
    { title: 'Conversão', value: `${stats.conversionRate}%`, icon: TrendingUp, bg: '#fff7ed', color: '#c2410c', sub: 'Leads qualificados' },
    { title: 'Atividade Hoje', value: stats.todayLeads, icon: Clock, bg: '#ecfeff', color: '#0e7490', sub: 'Novos registros' },
    { title: 'Qualificados', value: stats.qualificados, icon: UserCheck, bg: '#fdf2f8', color: '#be185d', sub: 'Prontos para venda' },
  ];

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    const map = {
      new: { label: 'Novo', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
      novo: { label: 'Novo', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
      contacted: { label: 'Contatado', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
      contatado: { label: 'Contatado', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
      qualified: { label: 'Qualificado', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
      qualificado: { label: 'Qualificado', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
      lost: { label: 'Perdido', cls: 'bg-rose-50 text-rose-600 border-rose-100' },
      perdido: { label: 'Perdido', cls: 'bg-rose-50 text-rose-600 border-rose-100' }
    };
    const style = map[s] || map.new;
    return <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border ${style.cls}`}>{style.label}</span>;
  };

  return (
    <div className="p-8 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">Visão Geral</h1>
          <p className="text-slate-500 mt-1">Bem-vindo ao AutoLead AI. Monitore sua performance em tempo real.</p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-70 hover:border-indigo-500 hover:text-indigo-600"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Sincronizando...' : 'Atualizar Painel'}
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
        {cardData.map((card) => (
          <StatsCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Recent Leads Table */}
        <div className="lg:col-span-8 card-premium overflow-hidden bg-white">
          <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
            <div>
               <h2 className="text-lg font-bold text-slate-900 font-outfit">Interações Recentes</h2>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Últimos 5 registros no funil</p>
            </div>
            <button className="text-[11px] font-bold text-indigo-600 hover:underline uppercase tracking-tight flex items-center gap-1">Ver todos os leads <ArrowUpRight size={12}/></button>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-slate-400 uppercase">Processando base de dados...</p>
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="text-center py-20 px-6">
                 <Users size={48} className="text-slate-100 mx-auto mb-4" />
                 <h3 className="text-base font-bold text-slate-900">Seu funil está vazio</h3>
                 <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Novos leads capturados pela IA aparecerão automaticamente neste painel.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-widest border-b border-slate-50">
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3">Contato Principal</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 font-outfit text-sm leading-tight group-hover:text-indigo-600 transition-colors">{lead.name || 'S/ Nome'}</div>
                        <div className="text-[10px] text-slate-400 font-semibold tracking-tighter mt-0.5">{lead.email || 'Email não informado'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Monitor size={12} className="text-slate-300"/> {lead.phone || lead.telefone || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-xs font-bold text-slate-700">{lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : '—'}</div>
                        <div className="text-[10px] text-slate-400 italic">Capturado via Agente</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Info Panels */}
        <div className="lg:col-span-4 space-y-8">
           <div className="card-premium p-8 bg-indigo-900 text-white border-0 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform">
                 <CheckCircle size={100} />
              </div>
              <div className="relative z-10">
                 <h3 className="text-xl font-bold font-outfit mb-2">Sistema Otimizado</h3>
                 <p className="text-sm text-indigo-100 opacity-80 leading-relaxed mb-6 font-medium">A reestruturação técnica foi concluída. Sua base de dados agora é validada pelo Zod para garantir integridade total.</p>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center font-bold text-sm">Z</div>
                    <div className="flex-1">
                       <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">Validação Ativa</p>
                       <p className="text-xs text-white opacity-60">Status: Integridade Total</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="card-premium p-6 flex items-start gap-4 hover:border-indigo-200 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                 <Calendar size={24} />
              </div>
              <div>
                 <h4 className="font-bold text-slate-900 font-outfit">Dica de Performance</h4>
                 <p className="text-xs text-slate-500 leading-relaxed mt-1">Lembre-se de revisar os prompts dos agentes toda semana para otimizar a conversão de leads frios.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}