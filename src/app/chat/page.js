'use client';

import { useState, useEffect } from 'react';
import { Users, Car, MessageSquare, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    conversasAtivas: 0,
    totalVeiculos: 0,
    taxaConversao: 0,
    leadsHoje: 0,
    qualificados: 0,
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [leadsRes, veiculosRes] = await Promise.all([
        fetch('http://localhost:3000/api/leads'),
        fetch('http://localhost:3000/api/vehicles'),
      ]);

      const leadsData = leadsRes.ok ? await leadsRes.json() : [];
      const veiculosData = veiculosRes.ok ? await veiculosRes.json() : [];

      const leads = Array.isArray(leadsData) ? leadsData : leadsData.leads || [];
      const veiculos = Array.isArray(veiculosData) ? veiculosData : veiculosData.vehicles || [];

      const hoje = new Date().toISOString().split('T')[0];
      const leadsHoje = leads.filter(l => l.createdAt && l.createdAt.startsWith(hoje)).length;
      const qualificados = leads.filter(l =>
        (l.status || '').toLowerCase() === 'qualificado'
      ).length;
      const conversasAtivas = leads.filter(l =>
        (l.status || '').toLowerCase() === 'contatado'
      ).length;
      const taxaConversao = leads.length > 0
        ? ((qualificados / leads.length) * 100).toFixed(1)
        : 0;

      setStats({
        totalLeads: leads.length,
        conversasAtivas,
        totalVeiculos: veiculos.length,
        taxaConversao,
        leadsHoje,
        qualificados,
      });
      setRecentLeads(leads.slice(0, 5));
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    { label: 'Total de Leads', value: stats.totalLeads, icon: Users, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Conversas Ativas', value: stats.conversasAtivas, icon: MessageSquare, bg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Veículos Cadastrados', value: stats.totalVeiculos, icon: Car, bg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { label: 'Taxa de Conversão', value: `${stats.taxaConversao}%`, icon: TrendingUp, bg: 'bg-orange-50', iconColor: 'text-orange-600' },
    { label: 'Leads Hoje', value: stats.leadsHoje, icon: Clock, bg: 'bg-cyan-50', iconColor: 'text-cyan-600' },
    { label: 'Qualificados', value: stats.qualificados, icon: CheckCircle, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  ];

  const statusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'novo') return 'bg-blue-100 text-blue-700';
    if (s === 'contatado') return 'bg-yellow-100 text-yellow-700';
    if (s === 'qualificado') return 'bg-green-100 text-green-700';
    if (s === 'perdido') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do sistema AutoLead</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
              <div className={`${card.bg} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Últimos Leads */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Últimos Leads Cadastrados</h2>
        {recentLeads.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Nenhum lead cadastrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Nome</th>
                  <th className="pb-3 font-medium">Telefone</th>
                  <th className="pb-3 font-medium">Interesse</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentLeads.map((lead, i) => (
                  <tr key={lead.id || i} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{lead.name || lead.nome || '—'}</td>
                    <td className="py-3 text-gray-600">{lead.phone || lead.telefone || '—'}</td>
                    <td className="py-3 text-gray-600">{lead.interest || lead.interesse || '—'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(lead.status)}`}>
                        {lead.status || 'Novo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}