'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Settings, Cpu, Key, Database, Bell, Shield, 
  CheckCircle2, AlertTriangle, RefreshCw, ChevronRight,
  Info, Save, Zap, Heart, Sparkles, Server
} from 'lucide-react';

const AGENCY_ID = process.env.NEXT_PUBLIC_AGENCY_ID || '6ee07688-9d34-4d18-861c-62585a440cc0';

const PROVIDERS = [
  { id: 'anthropic', name: 'Claude — Anthropic', initials: 'An', color: '#a78bfa', bg: '#1e1b4b', badge: 'Recomendado', prefix: 'sk-ant-' },
  { id: 'openai',    name: 'GPT-4 — OpenAI',    initials: 'Gp', color: '#34d399', bg: '#064e3b', badge: 'Popular',      prefix: 'sk-'     },
  { id: 'google',    name: 'Gemini — Google',    initials: 'Gk', color: '#fbbf24', bg: '#451a03', badge: 'Econômico',   prefix: 'AIza'    },
  { id: 'groq',      name: 'Groq — Llama 3',    initials: 'Gq', color: '#c084fc', bg: '#2e1065', badge: 'Ultra rápido', prefix: 'gsk_'    },
  { id: 'deepseek',  name: 'DeepSeek AI',        initials: 'Ds', color: '#94a3b8', bg: '#1e293b', badge: 'Custo baixo', prefix: 'sk-'     },
];

const MODELS = {
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
  openai:    ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  google:    ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro'],
  groq:      ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  deepseek:  ['deepseek-chat', 'deepseek-reasoner'],
};

export default function SettingsPage() {
  const [provider, setProvider] = useState('groq');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyPreview, setApiKeyPreview] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [alertPct, setAlertPct] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [keyStatus, setKeyStatus] = useState(null);
  const [keyMsg, setKeyMsg] = useState('');
  const [showProviderMenu, setShowProviderMenu] = useState(false);

  const selectedProvider = PROVIDERS.find(p => p.id === provider) || PROVIDERS[3];
  const pctLeft = Math.round((tokenBalance / 500000) * 100);
  const isCritical = pctLeft <= alertPct;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get(`/api/settings/ai/${AGENCY_ID}`);
        setProvider(data.provider || 'groq');
        setModel(data.model || 'llama-3.3-70b-versatile');
        setTokenBalance(data.token_balance || 0);
        setAlertPct(data.token_alert_pct || 30);
        setApiKeyPreview(data.api_key_preview || null);
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = { provider, model, token_alert_pct: alertPct };
      if (apiKey) body.api_key = apiKey;
      await api.put(`/api/settings/ai/${AGENCY_ID}`, body);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar:', err);
    } finally {
      setSaving(false);
    }
  };

  const testApiKey = async () => {
    if (!apiKey) return;
    setKeyStatus('testing');
    try {
      const res = await api.post(`/api/settings/ai/${AGENCY_ID}/test-key`, { api_key: apiKey, provider });
      setKeyStatus(res.valid ? 'ok' : 'error');
      setKeyMsg(res.message);
    } catch (err) {
      setKeyStatus('error');
      setKeyMsg('Falha na conexão com o servidor');
    }
  };

  return (
    <div className="p-8 page-transition max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">Configurações Gerais</h1>
          <p className="text-slate-500 mt-1">Gerencie sua agência, motores de IA e limites de uso</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className={`btn-gradient min-w-[200px] flex items-center justify-center gap-2 ${saved ? 'from-emerald-500 to-teal-600' : ''}`}
        >
          {saving ? <RefreshCw size={18} className="animate-spin" /> : saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          <span>{saved ? 'Configurações Salvas' : saving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: IA Engine & Credits */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Tokens & Credits Card */}
          <div className="card-premium p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-5 group-hover:scale-110 transition-transform text-indigo-600">
               <Database size={120} />
            </div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Zap size={16} className="text-amber-500"/> Créditos & Consumo
            </h3>
            
            <div className="flex items-end justify-between mb-8">
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Saldo Ativo</p>
                  <p className={`text-4xl font-extrabold font-outfit mt-1 ${isCritical ? 'text-rose-600' : 'text-slate-900'}`}>
                    {tokenBalance.toLocaleString('pt-BR')} <span className="text-sm text-slate-300 font-medium">tokens</span>
                  </p>
               </div>
               <div className="text-right">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isCritical ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
                    {isCritical ? 'Saldo Crítico' : 'Saldo Normal'}
                  </span>
               </div>
            </div>

            <div className="space-y-4">
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                 <div 
                   className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                   style={{ width: `${Math.min(100, pctLeft)}%` }}
                 ></div>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-400 tracking-wide uppercase">
                 <span>Restante: {pctLeft}%</span>
                 <span>Capacidade: 500k</span>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-50">
               <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                    <Bell size={14} className="text-indigo-400"/> Alerta de Consumo
                  </label>
                  <span className="text-sm font-bold text-indigo-600 font-outfit">{alertPct}%</span>
               </div>
               <input 
                 type="range" min="5" max="90" step="5"
                 value={alertPct}
                 onChange={e => setAlertPct(Number(e.target.value))}
                 className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
               />
               <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5 italic">
                 <Info size={12}/> O sistema enviará um alerta quando o saldo atingir este percentual.
               </p>
            </div>
          </div>

          {/* AI Provider Config */}
          <div className="card-premium p-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
               <Cpu size={16} className="text-indigo-500"/> Motor de Inteligência
            </h3>

            <div className="space-y-6">
               <div className="relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Provedor de Serviços</label>
                  <button 
                    onClick={() => setShowProviderMenu(!showProviderMenu)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-300 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm" style={{ backgroundColor: selectedProvider.bg, color: selectedProvider.color }}>
                         {selectedProvider.initials}
                       </div>
                       <div className="text-left">
                          <p className="text-sm font-bold text-slate-900 font-outfit leading-none">{selectedProvider.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-1 uppercase tracking-tight">{model}</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className={`text-slate-300 group-hover:text-indigo-500 transition-all ${showProviderMenu ? 'rotate-90' : ''}`} />
                  </button>

                  {showProviderMenu && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                       {PROVIDERS.map(p => (
                         <button 
                           key={p.id}
                           onClick={() => { setProvider(p.id); setModel(MODELS[p.id][0]); setShowProviderMenu(false); }}
                           className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${provider === p.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50'}`}
                         >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" style={{ backgroundColor: p.bg, color: p.color }}>{p.initials}</div>
                            <div className="flex-1 text-left">
                               <p className="text-xs font-bold text-slate-900">{p.name}</p>
                               <p className="text-[10px] text-slate-400 font-medium tracking-tight uppercase">{MODELS[p.id].join(' • ')}</p>
                            </div>
                            <span className="text-[9px] font-bold uppercase py-0.5 px-2 rounded-full border border-slate-100 text-slate-400">{p.badge}</span>
                         </button>
                       ))}
                    </div>
                  )}
               </div>

               <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Modelo Específico</label>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   {(MODELS[provider] || []).map(m => (
                     <button 
                       key={m}
                       onClick={() => setModel(m)}
                       className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${model === m ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'}`}
                     >
                       {m}
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Settings */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Security Card / API KEY */}
          <div className="card-premium p-8 relative">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
               <Shield size={16} className="text-rose-500"/> Segurança & Chaves
            </h3>

            <div className="space-y-6">
               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Key size={12}/> API Key do Provedor
                    </label>
                    {apiKeyPreview && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 rounded flex items-center gap-1">
                        <CheckCircle2 size={10}/> Configurada
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                     <div className="relative group">
                        <input 
                          type="password" 
                          placeholder={apiKeyPreview ? "••••••••••••••••" : `${selectedProvider.prefix}••••••••`}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-sm"
                          value={apiKey}
                          onChange={e => { setApiKey(e.target.value); setKeyStatus(null); }}
                        />
                        <button 
                          onClick={testApiKey}
                          disabled={!apiKey || keyStatus === 'testing'}
                          className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm disabled:opacity-50"
                        >
                          {keyStatus === 'testing' ? 'TESTANDO...' : 'TESTAR'}
                        </button>
                     </div>

                     {keyStatus && (
                       <div className={`p-4 rounded-xl border flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${
                         keyStatus === 'ok' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
                       }`}>
                          {keyStatus === 'ok' ? <Heart size={20} className="fill-emerald-500 text-emerald-500" /> : <AlertTriangle size={20} />}
                          <div>
                            <p className="text-xs font-bold uppercase tracking-tight">{keyStatus === 'ok' ? 'Chave Válida!' : 'Erro na Chave'}</p>
                            <p className="text-[11px] font-medium opacity-80 mt-0.5 leading-relaxed">{keyMsg}</p>
                          </div>
                       </div>
                     )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic flex items-start gap-2">
                    <Info size={12} className="mt-0.5 shrink-0"/> 
                    Sua chave é armazenada de forma segura e criptografada. Nunca compartilhe sua API Key com terceiros.
                  </p>
               </div>
            </div>
          </div>

          {/* Quick Support / Docs Card */}
          <div className="card-premium p-8 bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-0 shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-10 transform translate-x-8 -translate-y-6 opacity-10 group-hover:scale-110 transition-transform">
               <Server size={140} />
             </div>
             <div className="relative z-10">
               <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-bold uppercase tracking-widest border border-indigo-400/20 mb-4">
                 <Sparkles size={10}/> Documentação
               </span>
               <h4 className="text-xl font-bold font-outfit mb-2 leading-tight">Precisa de ajuda com o motor de IA?</h4>
               <p className="text-sm text-indigo-200/70 mb-6 font-medium leading-relaxed">Acesse nosso guia completo de integração e saiba qual modelo é o mais indicado para sua necessidade.</p>
               <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:gap-3 transition-all">
                 Ver Central de Ajuda <ChevronRight size={14}/>
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}