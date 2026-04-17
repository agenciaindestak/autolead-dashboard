'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  Send, Bot, User, ChevronLeft, MoreVertical, 
  Paperclip, Smile, Sparkles, Clock, CheckCheck, 
  Smartphone, MessageSquare, AlertCircle, RefreshCcw
} from 'lucide-react';

const AGENCY_ID = process.env.NEXT_PUBLIC_AGENCY_ID || '6ee07688-9d34-4d18-861c-62585a440cc0';

export default function ChatDetailPage() {
  const { id: conversationId } = useParams();
  const router = useRouter();
  
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiDrafting, setAiDrafting] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [testMode, setTestMode] = useState(false); // New test mode state
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = (force = false) => {
    if (!messagesEndRef.current) return;
    const container = messagesEndRef.current.parentElement;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    
    if (force || isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchChatDetails = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get(`/api/conversations/${conversationId}`);
      if (res.success) {
        setConversation(res.data);
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Erro ao carregar chat:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchChatDetails(true);
    const interval = setInterval(() => fetchChatDetails(false), 3000);
    return () => clearInterval(interval);
  }, [fetchChatDetails]);

  useEffect(() => {
    // Only force scroll on first load or when messages length increases
    scrollToBottom(messages.length <= 1);
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      if (testMode) {
        // SIMULATION MODE: Send as USER and trigger AI
        const res = await api.post('/api/agent/chat', {
          agencyId: AGENCY_ID,
          conversationId: conversationId,
          leadId: conversation.lead_id,
          message: newMessage
        });
        
        // Optimistically add the messages to the feed for a "snappy" feel
        const userMsg = { role: 'user', content: newMessage, created_at: new Date().toISOString() };
        const aiMsg = { role: 'assistant', content: res.response || res.data?.response, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg, aiMsg]);
        
        // Still refresh in the background to sync with DB
        setTimeout(() => fetchChatDetails(false), 3000);
      } else {
        // AGENT MODE: Send as ASSISTANT manually
        await api.post(`/api/conversations/${conversationId}/messages`, {
          role: 'assistant',
          content: newMessage
        });
        fetchChatDetails(false);
      }
      setNewMessage('');
    } catch (err) {
      const errorMsg = { 
        role: 'system', 
        content: `❌ ERRO NO SERVIDOR: ${err.message}. Por favor, verifique o seu console ou logs do backend.`, 
        created_at: new Date().toISOString(),
        isError: true 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const generateAiSuggestion = async () => {
    if (aiDrafting) return;
    setAiDrafting(true);
    
    try {
      // Calling the agent endpoint but without a user message, potentially as a "suggest" mode
      const res = await api.post('/api/agent/chat', {
        agencyId: AGENCY_ID,
        conversationId: conversationId,
        leadId: conversation.lead_id,
        message: "[SUGESTÃO INTERNA]: Gere uma resposta educada e persuasiva baseada no histórico acima para continuar o atendimento.",
      });
      
      setNewMessage(res.response || '');
    } catch (err) {
      console.error('Erro IA Sugestão:', err);
    } finally {
      setAiDrafting(false);
    }
  };

  const renderMessageContent = (content) => {
    if (typeof content !== 'string') return content;
    
    // Pattern detect images first
    const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    
    let parts = [];
    let lastIndex = 0;
    
    // 1. Handle Images
    const imgMatches = [...content.matchAll(imgRegex)];
    const linkMatches = [...content.matchAll(linkRegex)].filter(m => !m[0].startsWith('!'));

    // Combined processing (simplifying for brief logic)
    // For images
    let contentWithMedia = content;
    
    const elements = [];
    let currentIdx = 0;
    
    // This is a simple but effective way to render both
    const allMatches = [
      ...imgMatches.map(m => ({ type: 'img', match: m })),
      ...linkMatches.map(m => ({ type: 'link', match: m }))
    ].sort((a, b) => a.match.index - b.match.index);

    allMatches.forEach((item, i) => {
      if (item.match.index > currentIdx) {
        elements.push(<span key={`text-${i}`}>{content.substring(currentIdx, item.match.index)}</span>);
      }
      
      if (item.type === 'img') {
        elements.push(
          <div key={`img-${i}`} className="my-4 overflow-hidden rounded-2xl shadow-xl border border-white/20 bg-slate-50">
            <img src={item.match[2]} alt={item.match[1]} className="w-full h-auto max-h-[350px] object-cover" />
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-100 flex items-center justify-between">
               <span>{item.match[1]}</span>
               <Sparkles size={10} className="text-indigo-400" />
            </div>
          </div>
        );
      } else {
        const isVideo = item.match[1].toLowerCase().includes('vídeo') || item.match[2].toLowerCase().includes('.mp4');
        elements.push(
          <a 
            key={`link-${i}`}
            href={item.match[2]} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`
              inline-flex items-center gap-2 px-4 py-3 my-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
              ${isVideo 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 hover:bg-rose-600 hover:scale-105' 
                : 'bg-indigo-50 text-indigo-600 hover:underline'
              }
            `}
          >
            {isVideo ? <Bot size={14} /> : <Paperclip size={14} />}
            {item.match[1]}
          </a>
        );
      }
      currentIdx = item.match.index + item.match[0].length;
    });

    if (currentIdx < content.length) {
      elements.push(<span key="text-end">{content.substring(currentIdx)}</span>);
    }

    return elements.length > 0 ? elements : content;
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center gap-4 animate-in fade-in">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">Carregando conversa...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-rose-200" />
        <h2 className="text-xl font-bold text-slate-800">Conversa não encontrada</h2>
        <button onClick={() => router.back()} className="text-indigo-600 font-bold hover:underline">Voltar para a lista</button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col page-transition bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-xl shadow-indigo-500/5">
      {/* Header do Chat */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">
              {conversation.leads?.name?.charAt(0) || <User />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-outfit leading-tight">{conversation.leads?.name || 'Lead Anônimo'}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Online agora
                </span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                  <Smartphone size={10}/> via WhatsApp
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Simulation Toggle */}
           <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className={`text-[10px] font-bold uppercase tracking-tight ${testMode ? 'text-indigo-600' : 'text-slate-400'}`}>
                {testMode ? 'Simular Lead' : 'Modo Manual'}
              </span>
              <button 
                onClick={() => setTestMode(!testMode)}
                className={`w-10 h-5 rounded-full relative transition-all duration-300 ${testMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${testMode ? 'left-6' : 'left-1'}`}></div>
              </button>
           </div>

           <button onClick={() => fetchChatDetails(true)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><RefreshCcw size={18}/></button>
           <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={18}/></button>
        </div>
      </div>

      {/* Feed de Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <MessageSquare size={48} className="mb-4 text-slate-200" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Inicie a conversa agora</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.role === 'agent' || msg.role === 'assistant';
            return (
              <div 
                key={msg.id || i}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1.5`}>
                   <div className={`
                      px-5 py-3 rounded-[1.5rem] text-sm font-medium leading-relaxed
                      ${isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-200' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
                      }
                   `}>
                     {renderMessageContent(msg.content)}
                   </div>
                   <div className="flex items-center gap-1 px-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">
                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && <CheckCheck size={10} className="text-indigo-400" />}
                   </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Barra de Entrada de Mensagem */}
      <div className="px-6 py-5 border-t border-slate-100 bg-white">
        <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
          
          <button 
            type="button" 
            onClick={generateAiSuggestion}
            disabled={aiDrafting}
            className={`
              flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all
              ${aiDrafting ? 'animate-pulse' : ''}
            `}
          >
            <Sparkles size={14} />
            {aiDrafting ? 'Pensando...' : 'Mágica IA'}
          </button>

          <div className="flex-1 relative flex items-center">
             <input 
               value={newMessage}
               onChange={(e) => setNewMessage(e.target.value)}
               className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-5 pr-12 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
               placeholder="Escreva sua mensagem aqui..."
             />
             <div className="absolute right-3 flex items-center gap-0">
                <button type="button" className="p-1.5 text-slate-300 hover:text-slate-500"><Smile size={18}/></button>
                <button type="button" className="p-1.5 text-slate-300 hover:text-slate-500"><Paperclip size={18}/></button>
             </div>
          </div>

          <button 
            type="submit" 
            disabled={sending || !newMessage.trim()}
            className={`
              w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg
              ${newMessage.trim() 
                ? 'bg-indigo-600 text-white shadow-indigo-200 hover:scale-105 active:scale-95' 
                : 'bg-slate-100 text-slate-400 grayscale'
              }
            `}
          >
            <Send size={20} className={newMessage.trim() ? 'translate-x-0.5' : ''} />
          </button>
        </form>
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center mt-3">
          Pressione Enter para enviar • O agente IA automático está pausado enquanto você digita.
        </p>
      </div>
    </div>
  );
}
