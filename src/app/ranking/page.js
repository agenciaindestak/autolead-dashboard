'use client';

import React from 'react';
import { 
  Trophy, TrendingUp, Award, User, 
  ChevronRight, Sparkles, Star, Target,
  DollarSign, Zap, Gem
} from 'lucide-react';

const RANKING_DATA = [
  { id: 1, name: 'Ana Oliveira', points: 2840, deals: 12, ticket: 'R$ 84.500', avatar: 'AO', color: 'from-blue-400 to-indigo-600', rankType: 'diamond' },
  { id: 2, name: 'Bruno Santos', points: 2150, deals: 8, ticket: 'R$ 72.200', avatar: 'BS', color: 'from-amber-400 to-orange-500', rankType: 'gold' },
  { id: 3, name: 'Carlos Silva', points: 1920, deals: 7, ticket: 'R$ 68.900', avatar: 'CS', color: 'from-slate-300 to-slate-400', rankType: 'silver' },
  { id: 4, name: 'Daniela Meira', points: 1450, deals: 5, ticket: 'R$ 62.000', avatar: 'DM', color: 'from-orange-400 to-amber-700', rankType: 'bronze' },
  { id: 5, name: 'Eduardo Lima', points: 1100, deals: 4, ticket: 'R$ 55.400', avatar: 'EL', color: 'from-emerald-400 to-teal-500', rankType: 'default' },
];

const RankBadge = ({ type, idx }) => {
  if (type === 'diamond') return (
    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100/50 animate-pulse">
      <Gem size={20} className="fill-current" />
    </div>
  );
  if (type === 'gold') return (
    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-100/50">
      <Trophy size={20} className="fill-current" />
    </div>
  );
  if (type === 'silver') return (
    <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center shadow-lg shadow-slate-100/50">
      <Trophy size={20} className="fill-current" />
    </div>
  );
  if (type === 'bronze') return (
    <div className="w-10 h-10 bg-orange-50 text-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-100/50">
      <Trophy size={20} className="fill-current" />
    </div>
  );
  return (
    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100 font-black text-sm">
      {idx + 1}
    </div>
  );
};

export default function RankingPage() {
  const winner = RANKING_DATA[0];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-[0.2em]">
            <Zap size={14} className="fill-current" /> PERFORMANCE DE ELITE
          </div>
          <h1 className="text-4xl font-outfit font-black text-slate-900 tracking-tight">Leaderboard <span className="text-indigo-600">Mensal</span></h1>
          <p className="text-slate-500 font-medium">O ranking zera em <span className="text-indigo-600 font-bold">24 dias</span>. O Top 1 ganha <strong className="text-slate-900">20% mais leads</strong> no próximo mês.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
           <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">Geral</button>
           <button className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors">Este Mês</button>
        </div>
      </div>

      {/* Podium Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl shadow-indigo-200 group border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-10">
             <div className="relative">
                <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-600 p-1 shadow-2xl ring-4 ring-white/10 group-hover:scale-105 transition-transform duration-500">
                   <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-4xl font-black border-4 border-white/5 uppercase tracking-tighter">
                      {winner.avatar}
                   </div>
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-5 py-2 rounded-full font-black text-xs shadow-lg flex items-center gap-2 ring-4 ring-slate-900">
                   <Gem size={14} className="animate-pulse" /> DIAMANTE (1º)
                </div>
             </div>

             <div className="flex-1 space-y-6 text-center md:text-left">
                <div>
                   <h2 className="text-3xl font-black tracking-tight">{winner.name}</h2>
                   <p className="text-blue-400 font-bold uppercase tracking-widest text-[10px] mt-1 italic flex items-center justify-center md:justify-start gap-2">
                     <Sparkles size={12} className="text-blue-300" /> Nível Máximo de Performance
                   </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                   <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                      <p className="text-blue-400 font-bold text-[10px] uppercase tracking-wider mb-1">Pontos</p>
                      <p className="text-2xl font-black tracking-tighter">{winner.points}</p>
                   </div>
                   <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                      <p className="text-blue-400 font-bold text-[10px] uppercase tracking-wider mb-1">Vendas</p>
                      <p className="text-2xl font-black tracking-tighter">{winner.deals}</p>
                   </div>
                   <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                      <p className="text-blue-400 font-bold text-[10px] uppercase tracking-wider mb-1">Status</p>
                      <p className="text-lg font-black tracking-tighter text-blue-300">ELITE</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
           <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                 <TrendingUp size={20} className="text-emerald-500" /> Meta da Agência
              </h3>
              <div className="space-y-1">
                 <div className="flex justify-between items-end">
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">R$ 342k</p>
                    <p className="text-slate-400 font-bold text-xs mb-1">META: R$ 500k</p>
                 </div>
                 <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.4)]" style={{ width: '68%' }}></div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket Médio</p>
                 <p className="text-lg font-black text-slate-800">R$ 48.200</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taxa Conv.</p>
                 <p className="text-lg font-black text-slate-800 text-indigo-600">14.2%</p>
              </div>
           </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
           <h3 className="font-outfit font-black text-slate-900 flex items-center gap-3">
              <Award className="text-indigo-600" size={20} /> Classificação Completa
           </h3>
           <span className="text-[11px] font-bold text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full border border-slate-200">Hierarquia de Elite</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Rank</th>
                <th className="px-8 py-5">Vendedor</th>
                <th className="px-8 py-5">Métrica</th>
                <th className="px-8 py-5">Vendas</th>
                <th className="px-8 py-5">Ticket Médio</th>
                <th className="px-8 py-5">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {RANKING_DATA.map((user, idx) => (
                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <RankBadge type={user.rankType} idx={idx} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${user.color} flex items-center justify-center text-white font-bold text-xs shadow-lg uppercase`}>
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {user.rankType === 'diamond' ? 'Lenda do Mês' : 'Vendedor Elite'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 tracking-tighter">{user.points} pts</span>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(user.points/winner.points)*100}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-700">{user.deals}</td>
                  <td className="px-8 py-6">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-black">{user.ticket}</span>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => alert(`Visualizando detalhes de ${user.name}`)}
                      className="px-4 py-2 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-500 rounded-xl text-xs font-black transition-all flex items-center gap-2 group-hover:scale-105"
                    >
                      DETALHES <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
