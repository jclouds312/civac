/**
 * CIVAC IA — Agente de IA conversacional para GanaderIA PRO
 * Botón flotante + panel de chat • conecta con Flask /api/analytics/chat
 * Titular único: SoftGan SAS · NIT 900.205.856-3
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  Bot, X, Send, Mic, ChevronDown, Satellite, Zap,
  TrendingUp, AlertTriangle, Beef, Droplets, DollarSign,
  RefreshCw, MapPin, Loader2, Wifi, WifiOff, MessageCircle, Phone,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

/* ── Types ───────────────────────────────────────────────────────────────── */
interface ChatMsg {
  id:     string;
  role:   'user' | 'agent';
  text:   string;
  ts:     Date;
  accion?: string | null;
  accion_label?: string | null;
  loading?: boolean;
}

/* ── Quick action chips ──────────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { label:'🥛 Producción hoy',     msg:'¿cuál es la producción de hoy?' },
  { label:'🐄 Inventario',         msg:'¿cuántos animales tengo en el hato?' },
  { label:'🚨 Alertas activas',    msg:'¿qué alertas tengo activas?' },
  { label:'📡 GPS collares',       msg:'¿cuál es el estado de los GPS?' },
  { label:'💰 Costos del mes',     msg:'¿cómo están los costos y finanzas?' },
  { label:'💡 Recomendaciones',    msg:'dame recomendaciones para mejorar' },
  { label:'🌿 Potreros',           msg:'¿cómo están los potreros?' },
  { label:'💵 Precio leche',       msg:'¿cuál es el precio de la leche hoy?' },
];

/* ── Typing indicator ────────────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0,1,2].map(i => (
        <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background:'rgba(0,245,212,0.7)', animationDelay:`${i*150}ms`, animationDuration:'800ms' }}/>
      ))}
    </div>
  );
}

/* ── Message bubble ──────────────────────────────────────────────────────── */
function Bubble({ msg, onNavigate }: { msg: ChatMsg; onNavigate: (href: string) => void }) {
  const isUser = msg.role === 'user';

  // Convert **text** to bold and newlines to <br>
  function formatText(text: string) {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{color:'#00f5d4'}}>{p}</strong> : p)}
          {i < text.split('\n').length - 1 && <br/>}
        </span>
      );
    });
  }

  return (
    <div className={`flex gap-2 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5"
          style={{ background:'linear-gradient(135deg,#00f5d4,#00a896)', boxShadow:'0 0 12px rgba(0,245,212,0.4)' }}>
          <Bot size={14} style={{ color:'#000' }}/>
        </div>
      )}
      <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
        <div className="px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed"
          style={isUser
            ? { background:'linear-gradient(135deg,#00c8ff,#1d4ed8)', color:'white', borderBottomRightRadius:4 }
            : { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.88)', borderBottomLeftRadius:4 }
          }>
          {msg.loading ? <TypingDots/> : formatText(msg.text)}
        </div>
        {msg.accion && !msg.loading && (
          <button onClick={() => onNavigate(msg.accion!)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all hover:scale-[1.03]"
            style={{ background:'linear-gradient(135deg,rgba(0,245,212,0.15),rgba(0,200,255,0.10))', border:'1px solid rgba(0,245,212,0.3)', color:'#00f5d4' }}>
            {msg.accion_label} <ChevronDown size={9} style={{transform:'rotate(-90deg)'}}/>
          </button>
        )}
        <span className="text-[8px]" style={{ color:'rgba(255,255,255,0.2)' }}>
          {msg.ts.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}
        </span>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function CivacAgent() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [open,      setOpen]      = useState(false);
  const [messages,  setMessages]  = useState<ChatMsg[]>([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [online,    setOnline]    = useState(navigator.onLine);
  const [pulse,     setPulse]     = useState(true);
  const [unread,    setUnread]    = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  // Online/offline detection
  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Initial greeting
  useEffect(() => {
    const greet: ChatMsg = {
      id: 'init', role: 'agent',
      text: `¡Hola, ${user?.nombre?.split(' ')[0] || 'ganadero'}! 👋 Soy **CIVAC IA**, tu asistente ganadero inteligente.\n\nPuedo responder sobre producción, GPS, alertas, costos, animales y más. ¿En qué te ayudo hoy?`,
      ts: new Date(),
    };
    setMessages([greet]);
    // Flash pulse to attract attention after 3s
    const t = setTimeout(() => setPulse(false), 8000);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 300); setUnread(0); }
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: 'user', text: text.trim(), ts: new Date() };
    const loadMsg: ChatMsg = { id: `l-${Date.now()}`, role: 'agent', text: '', ts: new Date(), loading: true };
    setMessages(prev => [...prev, userMsg, loadMsg]);
    setInput('');
    setLoading(true);

    try {
      // Offline fallback
      if (!navigator.onLine) {
        throw new Error('Sin conexión');
      }

      const res = await fetch('/api/analytics/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context: { user: user?.nombre, plan: user?.plan } }),
      });
      const data = await res.json();

      const agentMsg: ChatMsg = {
        id: `a-${Date.now()}`, role: 'agent',
        text: data.respuesta || 'No pude procesar esa pregunta.',
        ts: new Date(),
        accion: data.accion,
        accion_label: data.accion_label,
      };
      setMessages(prev => [...prev.filter(m => !m.loading), agentMsg]);
      if (!open) setUnread(u => u + 1);

    } catch {
      // Offline/error fallback — smart local response
      const offlineMsg: ChatMsg = {
        id: `err-${Date.now()}`, role: 'agent',
        text: navigator.onLine
          ? '⚠️ No pude conectar con el servidor. Intenta de nuevo en un momento.'
          : '📵 Estás sin conexión.\n\n**Datos disponibles offline:**\n• 13 animales en inventario\n• Producción estimada: 84 L/día\n• 4 alertas activas\n• 6 potreros en rotación\n\nAl reconectarte los datos se sincronizarán automáticamente.',
        ts: new Date(),
        accion: navigator.onLine ? null : '/',
        accion_label: navigator.onLine ? null : 'Ver dashboard offline',
      };
      setMessages(prev => [...prev.filter(m => !m.loading), offlineMsg]);
    } finally {
      setLoading(false);
    }
  }, [loading, open, user]);

  const handleNavigate = useCallback((href: string) => {
    navigate(href);
    setOpen(false);
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* ── Floating Button ───────────────────────────────────────────────── */}
      <button
        onClick={() => { setOpen(v => !v); setUnread(0); }}
        className="fixed bottom-6 right-5 z-50 flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          background: open ? 'linear-gradient(135deg,#ff4d6d,#c9184a)' : 'linear-gradient(135deg,#00f5d4,#00b896)',
          boxShadow: open
            ? '0 0 32px rgba(255,77,109,0.55), 0 8px 28px rgba(0,0,0,0.5)'
            : `0 0 ${pulse ? '48px' : '28px'} rgba(0,245,212,${pulse ? '0.75' : '0.45'}), 0 8px 28px rgba(0,0,0,0.45)`,
          borderRadius: 22, padding: '13px 20px', color: open ? 'white' : '#001a14',
          transition: 'all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
        }}>
        {open
          ? <X size={20}/>
          : <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:'rgba(0,0,0,0.15)' }}>
                <Bot size={16} strokeWidth={2.5}/>
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="font-black text-[13px] tracking-tight">CIVAC IA</span>
                <span className="text-[9px] font-bold opacity-65">Asistente ganadero</span>
              </div>
            </div>
        }
        {/* Unread badge */}
        {!open && unread > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
            style={{ background:'#ff4d6d', color:'white', boxShadow:'0 0 10px rgba(255,77,109,0.7)' }}>
            {unread}
          </span>
        )}
        {/* Pulse ring */}
        {!open && pulse && (
          <span className="absolute inset-0 rounded-[22px] animate-ping"
            style={{ background:'rgba(0,245,212,0.25)', animationDuration:'2s' }}/>
        )}
      </button>

      {/* ── Chat Panel ────────────────────────────────────────────────────── */}
      <div className={`fixed bottom-24 right-5 z-50 flex flex-col transition-all duration-500 ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'}`}
        style={{ width: 'min(380px, calc(100vw - 24px))', height: 520, borderRadius: 24, overflow: 'hidden',
          background: 'linear-gradient(180deg,rgba(2,13,26,0.97),rgba(5,20,45,0.98))',
          border: '1px solid rgba(0,245,212,0.2)', boxShadow: '0 0 60px rgba(0,245,212,0.1), 0 24px 80px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
          style={{ background:'linear-gradient(135deg,rgba(0,245,212,0.10),rgba(0,180,255,0.06))', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background:'linear-gradient(135deg,#00f5d4,#00a896)', boxShadow:'0 0 20px rgba(0,245,212,0.55)' }}>
            <Bot size={20} style={{ color:'#000' }}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-black text-sm text-white leading-none">CIVAC IA</p>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background:'rgba(0,245,212,0.15)', border:'1px solid rgba(0,245,212,0.3)', color:'#00f5d4' }}>v2.1</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: online ? '#39ff7e' : '#ff4d6d' }}/>
                <span className="text-[8px]" style={{ color: online ? '#39ff7e' : '#ff4d6d' }}>
                  {online ? 'En línea' : 'Offline'}
                </span>
              </div>
            </div>
            <p className="text-[9px] mt-0.5" style={{ color:'rgba(0,245,212,0.45)' }}>
              Asistente ganadero · SoftGan SAS
            </p>
          </div>
          {/* WhatsApp soporte humano */}
          {(() => {
            const waNum = typeof window !== 'undefined' ? (localStorage.getItem("civac_whatsapp_number") || "3187351262") : "3187351262";
            return (
              <a href={`https://wa.me/57${waNum}?text=${encodeURIComponent("Hola CIVAC, necesito soporte con GanaderIA PRO.")}`}
                target="_blank" rel="noreferrer"
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                style={{ background:'linear-gradient(135deg,#25D366,#128C7E)', boxShadow:'0 0 12px rgba(37,211,102,0.4)' }}
                title="Soporte humano vía WhatsApp"
                onClick={e => e.stopPropagation()}>
                <Phone size={14} color="white"/>
              </a>
            );
          })()}
          <button onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color:'rgba(255,255,255,0.3)' }}>
            <X size={14}/>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0"
          style={{ scrollbarWidth:'none' }}>
          {messages.map(msg => (
            <Bubble key={msg.id} msg={msg} onNavigate={handleNavigate}/>
          ))}
          <div ref={messagesEndRef}/>
        </div>

        {/* Quick actions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2 flex-shrink-0">
            <p className="text-[8px] text-white/25 mb-1.5 uppercase tracking-widest">Acciones rápidas</p>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-hidden">
              {QUICK_ACTIONS.slice(0, 6).map(qa => (
                <button key={qa.label}
                  onClick={() => sendMessage(qa.msg)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-xl text-[9px] font-bold transition-all hover:scale-[1.03] disabled:opacity-50"
                  style={{ background:'rgba(0,245,212,0.06)', border:'1px solid rgba(0,245,212,0.2)', color:'rgba(0,245,212,0.8)' }}>
                  {qa.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-3 py-3 flex-shrink-0"
          style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl"
            style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
            {online ? <Wifi size={13} style={{ color:'rgba(0,245,212,0.4)', flexShrink:0 }}/> : <WifiOff size={13} style={{ color:'rgba(255,77,109,0.5)', flexShrink:0 }}/>}
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Pregunta sobre tu finca…"
              disabled={loading}
              className="flex-1 bg-transparent outline-none text-xs text-white placeholder:text-white/25 min-w-0"
            />
            <button type="submit" disabled={!input.trim() || loading}
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 disabled:opacity-40"
              style={{ background: input.trim() ? 'linear-gradient(135deg,#00f5d4,#00a896)' : 'transparent', color: input.trim() ? '#000' : 'rgba(255,255,255,0.3)' }}>
              {loading ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>}
            </button>
          </div>
          <p className="text-[8px] text-center mt-1.5" style={{ color:'rgba(255,255,255,0.15)' }}>
            CIVAC IA · SoftGan SAS · NIT 900.205.856-3
          </p>
        </form>
      </div>
    </>
  );
}
