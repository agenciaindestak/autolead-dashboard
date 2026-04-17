'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Car, Bot, 
  MessageSquare, Settings, ChevronRight, 
  Sparkles, ShieldCheck 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const userRole = 'master'; // Mock: 'master', 'supervisor' ou 'vendedor'
  
  const allLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['master', 'supervisor'] },
    { href: '/leads', label: 'Leads', icon: Users, roles: ['master', 'supervisor', 'vendedor'] },
    { href: '/vehicles', label: 'Veículos', icon: Car, roles: ['master', 'supervisor'] },
    { href: '/ranking', label: 'Ranking de Elite', icon: Sparkles, roles: ['master', 'supervisor', 'vendedor'] },
    { href: '/vendedores', label: 'Gerenciar Equipe', icon: Users, roles: ['master', 'supervisor'] },
    { href: '/agents', label: 'Agentes IA', icon: Bot, roles: ['master'] },
    { href: '/conversations', label: 'Conversas', icon: MessageSquare, roles: ['master', 'supervisor', 'vendedor'] },
    { href: '/settings', label: 'Configurações', icon: Settings, roles: ['master'] },
  ];

  const links = allLinks.filter(link => link.roles.includes(userRole));

  return (
    <aside className="w-64 min-w-[256px] min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col relative z-20 shadow-2xl">
      {/* Brand / Logo */}
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3.5 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-105 transition-transform duration-300">
            AL
          </div>
          <div className="flex flex-col">
            <h1 className="font-outfit font-bold text-base text-slate-50 tracking-tight leading-none">AutoLead <span className="text-indigo-400">AI</span></h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Smart Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Gerenciamento</p>
        
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group
                ${isActive 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
                <span>{link.label}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer / Account Info */}
      <div className="p-4 mt-auto">
         <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-4">
               <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-800 shadow-lg">
                    AD
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
               </div>
               <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-slate-100 truncate">Dirley (Master)</p>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Acesso Master</p>
               </div>
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">
               <span className="flex items-center gap-1"><ShieldCheck size={12}/> Firewall Ativo</span>
               <Sparkles size={12} className="animate-pulse" />
            </div>
         </div>
         
         <p className="mt-4 text-[9px] text-center text-slate-600 font-bold uppercase tracking-widest leading-none">
            © 2026 Agência Indestak
         </p>
      </div>
    </aside>
  );
}