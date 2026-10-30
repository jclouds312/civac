/**
 * CIVAC IA — Agente de IA conversacional para GanaderIA PRO
 * Botón flotante + panel de chat • conecta con Flask /api/ai/chat
 * Titular único: SoftGan SAS · NIT 900.205.856-3
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  Bot, X, Send, Mic, ChevronDown, Satellite, Zap, BookOpen,
  TrendingUp, AlertTriangle, Beef, Droplets, DollarSign,
  RefreshCw, MapPin, Loader2, Wifi, WifiOff, MessageCircle, Phone,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getToken } from "@/lib/api";
import { answerOfflineCivac } from "@workspace/civac-ai/offline";
import { askLocalCivacAI, canRunLocalAI, prepareLocalCivacAI } from "@/lib/local-ai";

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

interface AIProviderOption {
  id: string;
  label: string;
  tier: 'free' | 'premium';
  locked: boolean;
  configured: boolean;
  available: boolean;
}

/* ── Guía y ejemplos por perfil ──────────────────────────────────────────── */
interface RoleGuide {
  title: string;
  summary: string;
  steps: string[];
  prompt: string;
  suggestions: { label: string; msg: string }[];
}

const ROLE_GUIDES: Record<string, RoleGuide> = {
  admin: {
    title: "Administración CIVAC",
    summary: "Usa CIVAC IA para preparar respuestas, orientar cuentas y entender los pasos de operación. La IA no cambia usuarios ni planes por sí sola.",
    steps: ["Describe la consulta del cliente sin incluir contraseñas ni datos sensibles.", "Pide una respuesta clara o una lista de pasos.", "Confirma cualquier cambio en el módulo administrativo correspondiente."],
    prompt: "Ayúdame a redactar una respuesta clara para un cliente que necesita activar su cuenta.",
    suggestions: [
      { label: "Atención a clientes", msg: "Ayúdame a redactar una respuesta clara para un cliente que necesita activar su cuenta." },
      { label: "Explicar una función", msg: "Explícame cómo orientar a un cliente para registrar un pesaje." },
      { label: "Pasos de soporte", msg: "Dame una lista de verificación para atender un reporte de error de acceso." },
    ],
  },
  superadmin: {
    title: "Dirección CIVAC",
    summary: "Consulta cómo explicar funciones y organizar procesos de soporte. La IA no consulta ni modifica cuentas, licencias o información privada.",
    steps: ["Indica el objetivo de la consulta o proceso.", "Pide un resumen, respuesta o lista de verificación.", "Valida la información y ejecuta cualquier acción desde el panel CIVAC."],
    prompt: "Prepara una lista de verificación para revisar la activación de una cuenta CIVAC.",
    suggestions: [
      { label: "Revisar una cuenta", msg: "Prepara una lista de verificación para revisar la activación de una cuenta CIVAC." },
      { label: "Atención al cliente", msg: "Ayúdame a contestar a un cliente que no puede ingresar a su finca." },
      { label: "Explicar planes", msg: "Ayúdame a explicar las diferencias entre un plan básico y uno PRO sin inventar precios." },
    ],
  },
  developer: {
    title: "Soporte técnico",
    summary: "Comparte el mensaje de error y la ruta afectada, nunca claves ni tokens. CIVAC IA puede sugerir diagnósticos, pero no ejecuta despliegues.",
    steps: ["Copia el error sin secretos ni datos de clientes.", "Indica si ocurre en desarrollo, Vercel o el servidor.", "Prueba la solución propuesta y valida el resultado en los logs."],
    prompt: "Ayúdame a diagnosticar un error 503 de Flask en Vercel. ¿Qué logs y configuraciones reviso primero?",
    suggestions: [
      { label: "Error Flask", msg: "Ayúdame a diagnosticar un error 503 de Flask en Vercel. ¿Qué logs y configuraciones reviso primero?" },
      { label: "Despliegue", msg: "Dame una lista de comprobación para revisar una función Flask serverless." },
      { label: "Depurar API", msg: "¿Qué información segura debo reunir para depurar una ruta de API que falla?" },
    ],
  },
  sales: {
    title: "Asesoría comercial",
    summary: "Prepara explicaciones y materiales de atención. Confirma precios, disponibilidad y condiciones directamente en los sistemas CIVAC antes de compartirlos.",
    steps: ["Indica el perfil y necesidad del prospecto, sin datos personales.", "Pide una explicación o borrador de mensaje.", "Verifica precios y condiciones vigentes antes de enviarlo."],
    prompt: "Ayúdame a preparar una explicación breve de cómo CIVAC apoya el registro de animales y pesajes.",
    suggestions: [
      { label: "Presentar CIVAC", msg: "Ayúdame a preparar una explicación breve de cómo CIVAC apoya el registro de animales y pesajes." },
      { label: "Responder prospecto", msg: "Redacta una respuesta amable para un prospecto que pregunta cómo comenzar." },
      { label: "Capacitación", msg: "Propón un guion corto para enseñar a un cliente a usar su cuenta por primera vez." },
    ],
  },
  vet: {
    title: "Perfil veterinario",
    summary: "Solicita orientación general sobre manejo bovino y comparte solo los datos necesarios. La IA no sustituye una valoración veterinaria.",
    steps: ["Describe el caso sin identificar al propietario.", "Incluye edad, signos, duración y datos medidos si los tienes.", "Usa la respuesta como apoyo y confirma diagnósticos o tratamientos con criterio profesional."],
    prompt: "¿Qué datos debo registrar para hacer seguimiento a un animal con pérdida de apetito?",
    suggestions: [
      { label: "Datos clínicos", msg: "¿Qué datos debo registrar para hacer seguimiento a un animal con pérdida de apetito?" },
      { label: "Reproducción", msg: "¿Qué información conviene revisar antes de evaluar un resultado reproductivo?" },
      { label: "Registro sanitario", msg: "Sugiere un formato de registro de una visita sanitaria bovina." },
    ],
  },
  field: {
    title: "Trabajo de campo",
    summary: "Pide pasos concretos para registrar pesajes, revisar potreros o documentar novedades. La IA no lee automáticamente los datos de tu finca.",
    steps: ["Indica la tarea y el dato que necesitas registrar.", "Pide una guía breve o una lista de verificación.", "Guarda el registro en el módulo de CIVAC correspondiente."],
    prompt: "Dame una lista de verificación para registrar el pesaje de un lote y evitar errores.",
    suggestions: [
      { label: "Registrar pesaje", msg: "Dame una lista de verificación para registrar el pesaje de un lote y evitar errores." },
      { label: "Revisar potrero", msg: "¿Qué debo revisar al registrar el estado de un potrero?" },
      { label: "Novedad de campo", msg: "Ayúdame a redactar una nota breve de una novedad de campo." },
    ],
  },
  viewer: {
    title: "Cuenta de consulta",
    summary: "Pide explicaciones de conceptos, reportes o pasos de uso. CIVAC IA no ve los datos de tu finca y no realiza cambios.",
    steps: ["Abre en CIVAC el reporte o módulo que deseas entender.", "Comparte solo los datos necesarios, sin información sensible.", "Pide una explicación o navega al módulo indicado para consultar la información."],
    prompt: "Explícame qué datos conviene revisar en un reporte de producción de leche.",
    suggestions: [
      { label: "Entender reportes", msg: "Explícame qué datos conviene revisar en un reporte de producción de leche." },
      { label: "Uso de la cuenta", msg: "¿Cómo puedo organizar la revisión semanal de los indicadores de una finca?" },
      { label: "Conceptos ganaderos", msg: "Explícame qué significa el intervalo entre partos y cómo se interpreta." },
    ],
  },
};

const LOCAL_PROVIDER: AIProviderOption = {
  id: "local",
  label: "Modelo local del dispositivo",
  tier: "free",
  locked: false,
  configured: true,
  available: true,
};

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
  const roleGuide = ROLE_GUIDES[user?.role ?? "viewer"] ?? ROLE_GUIDES.viewer;
  const [open,      setOpen]      = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [messages,  setMessages]  = useState<ChatMsg[]>([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [online,    setOnline]    = useState(navigator.onLine);
  const [aiStatus,  setAiStatus]  = useState<'checking' | 'ready' | 'unconfigured' | 'session' | 'offline'>('checking');
  const [aiProviders, setAiProviders] = useState<AIProviderOption[]>([LOCAL_PROVIDER]);
  const [selectedProvider, setSelectedProvider] = useState("local");
  const [localModelState, setLocalModelState] = useState<"checking" | "available" | "loading" | "ready" | "unsupported" | "error">("checking");
  const [localProgress, setLocalProgress] = useState({ progress: 0, text: "" });
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

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void canRunLocalAI().then(supported => {
      if (!cancelled) setLocalModelState(current => current === "ready" ? current : supported ? "available" : "unsupported");
    });
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const token = getToken();
    if (!token) {
      setAiStatus('session');
      setAiProviders([LOCAL_PROVIDER]);
      setSelectedProvider("local");
      return;
    }
    const controller = new AbortController();
    setAiStatus('checking');
    fetch('/api/ai/status', {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    }).then(async res => {
      const data = await res.json().catch(() => ({}));
      if (controller.signal.aborted) return;
      if (res.status === 401) setAiStatus('session');
      else if (!res.ok) setAiStatus('offline');
      else {
        const remoteProviders = Array.isArray(data.providers) ? data.providers as AIProviderOption[] : [];
        const providers = [...remoteProviders.filter(provider => provider.id !== "local"), LOCAL_PROVIDER];
        setAiProviders(providers);
        setSelectedProvider(current => {
          if (current !== "local" && providers.some(provider => provider.id === current && provider.available)) return current;
          const defaultProvider = typeof data.defaultProvider === "string" ? data.defaultProvider : "";
          return providers.some(provider => provider.id === defaultProvider && provider.available) ? defaultProvider : "local";
        });
        setAiStatus(data.configured ? 'ready' : 'unconfigured');
      }
    }).catch(() => {
      if (!controller.signal.aborted) {
        setAiProviders([LOCAL_PROVIDER]);
        setSelectedProvider("local");
        setAiStatus('offline');
      }
    });
    return () => controller.abort();
  }, [open, user?.id]);

  // Initial greeting
  useEffect(() => {
    const greet: ChatMsg = {
      id: 'init', role: 'agent',
      text: `¡Hola, ${user?.nombre?.split(' ')[0] || 'ganadero'}! Soy **CIVAC IA**. Puedo orientarte según tu perfil de ${roleGuide.title.toLowerCase()}.\n\nNo consulto automáticamente los datos de tu finca ni modifico cuentas. Abre **Guía** para ver ejemplos de uso.`,
      ts: new Date(),
    };
    setMessages([greet]);
    // Flash pulse to attract attention after 3s
    const t = setTimeout(() => setPulse(false), 8000);
    return () => clearTimeout(t);
  }, [user?.nombre, roleGuide.title]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 300); setUnread(0); }
  }, [open]);

  const prepareLocalModel = useCallback(async () => {
    setLocalModelState("loading");
    setLocalProgress({ progress: 0, text: "Preparando el modelo…" });
    try {
      await prepareLocalCivacAI(progress => setLocalProgress(progress));
      setLocalModelState("ready");
    } catch {
      setLocalModelState("error");
    }
  }, []);

  const respondLocally = useCallback(async (prompt: string, history: ChatMsg[]) => {
    if (localModelState === "ready") {
      try {
        const answer = await askLocalCivacAI(
          prompt,
          history
            .filter(item => !item.loading && item.id !== "init")
            .slice(-6)
            .map(item => ({ role: item.role === "user" ? "user" as const : "assistant" as const, text: item.text })),
          user?.role ?? "viewer",
          progress => setLocalProgress(progress),
        );
        return answer;
      } catch {
        setLocalModelState("error");
      }
    }

    const guide = answerOfflineCivac(prompt);
    const modelNote = localModelState === "unsupported"
      ? "Este navegador no tiene WebGPU; puedes seguir usando esta guía local."
      : localModelState === "error"
        ? "El modelo local no está disponible; se muestra la guía local."
        : "Para respuestas generativas sin conexión, descarga primero el modelo local (aprox. 300 MB).";
    return `Guía local · ${guide.topic}\n\n${guide.text}\n\n${modelNote}`;
  }, [localModelState, user?.role]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: 'user', text: text.trim(), ts: new Date() };
    const loadMsg: ChatMsg = { id: `l-${Date.now()}`, role: 'agent', text: '', ts: new Date(), loading: true };
    setMessages(prev => [...prev, userMsg, loadMsg]);
    setInput('');
    setLoading(true);

    const finishResponse = (answer: string, action?: string | null, actionLabel?: string | null) => {
      const agentMsg: ChatMsg = {
        id: `a-${Date.now()}`,
        role: "agent",
        text: answer,
        ts: new Date(),
        accion: action,
        accion_label: actionLabel,
      };
      setMessages(prev => [...prev.filter(item => !item.loading), agentMsg]);
      if (!open) setUnread(value => value + 1);
    };

    try {
      const token = getToken();
      if (selectedProvider === "local" || !navigator.onLine || !token) {
        if (!token && selectedProvider !== "local") setAiStatus("session");
        finishResponse(await respondLocally(text.trim(), messages));
        return;
      }

      const history = messages
        .filter(item => !item.loading && item.id !== 'init' && item.text.trim())
        .slice(-12)
        .map(item => ({ role: item.role === 'user' ? 'user' : 'model', text: item.text }));
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: text.trim(),
          history,
          provider: selectedProvider,
        }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.code === 'AI_NOT_CONFIGURED') setAiStatus('unconfigured');
        if (data.code === 'SESSION_REQUIRED') setAiStatus('session');
        throw new Error(data.error || 'Servicio remoto no disponible.');
      }
      setAiStatus('ready');
      finishResponse(data.respuesta || 'No pude procesar esa pregunta.', data.accion, data.accion_label);
    } catch {
      const fallback = await respondLocally(text.trim(), messages);
      finishResponse(`${fallback}\n\nEl servicio remoto no estuvo disponible; no se enviaron cambios a la cuenta.`);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, open, respondLocally, selectedProvider]);

  const handleNavigate = useCallback((href: string) => {
    navigate(href);
    setOpen(false);
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const localStatusLabel = localModelState === "ready"
    ? "Modelo local listo"
    : localModelState === "loading"
      ? `Preparando modelo ${Math.round(localProgress.progress * 100)}%`
      : localModelState === "unsupported"
        ? "Guía offline lista"
        : "IA local sin clave";
  const assistantStatusLabel = selectedProvider === "local"
    ? localStatusLabel
    : aiStatus === "ready" ? "IA remota lista"
      : aiStatus === "unconfigured" ? "Servicio sin configurar"
        : aiStatus === "session" ? "Guía local · inicia sesión para servicio remoto"
          : aiStatus === "checking" ? "Verificando servicio"
            : online ? "Servicio remoto no disponible" : "Offline · guía local";

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
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: selectedProvider === "local" ? localModelState === "loading" ? "#00c8ff" : "#39ff7e" : aiStatus === 'ready' ? '#39ff7e' : aiStatus === 'unconfigured' || aiStatus === 'session' ? '#ffb84d' : '#ff4d6d' }}/>
                <span className="text-[8px]" style={{ color: selectedProvider === "local" ? localModelState === "loading" ? "#00c8ff" : "#39ff7e" : aiStatus === 'ready' ? '#39ff7e' : aiStatus === 'unconfigured' || aiStatus === 'session' ? '#ffb84d' : '#ff4d6d' }}>
                  {assistantStatusLabel}
                </span>
              </div>
            </div>
            <p className="text-[9px] mt-0.5" style={{ color:'rgba(0,245,212,0.45)' }}>
              Asistente ganadero · SoftGan SAS
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide(value => !value)}
            className="flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 text-[8px] font-bold transition-all hover:bg-white/10"
            style={{ color: '#00f5d4' }}
            aria-label={showGuide ? 'Volver al chat' : 'Abrir guía de uso de IA'}
            title={showGuide ? 'Volver al chat' : 'Guía de uso'}
          >
            {showGuide ? <MessageCircle size={15}/> : <BookOpen size={15}/>}
            {showGuide ? 'Chat' : 'Guía'}
          </button>
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
        <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <label htmlFor="civac-ai-provider" className="sr-only">Proveedor de inteligencia artificial</label>
          <select
            id="civac-ai-provider"
            value={selectedProvider}
            onChange={event => setSelectedProvider(event.target.value || "local")}
            className="w-full rounded-xl px-3 py-2 text-[10px] font-bold outline-none"
            style={{ background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.82)', border:'1px solid rgba(0,245,212,0.16)' }}
          >
            {aiProviders.map(provider => {
              const detail = provider.id === "local"
                ? "sin clave · requiere descarga inicial"
                : provider.locked
                ? 'requiere plan Premium'
                : !provider.configured
                  ? 'pendiente de configurar'
                  : provider.tier === 'premium'
                    ? 'Premium · puede generar cargos'
                    : 'gratis · sujeto a límite del proveedor';
              return (
                <option
                  key={provider.id}
                  value={provider.id}
                  disabled={!provider.available}
                  style={{ background:'#071325', color:'#fff' }}
                >
                  {provider.label} · {detail}
                </option>
              );
            })}
          </select>
          <p className="text-[8px] mt-1 px-1" style={{ color:'rgba(255,255,255,0.32)' }}>
            {selectedProvider === "local"
              ? "El modelo local corre en este navegador. Tras descargarlo, puede responder sin conexión mientras el dispositivo conserve los archivos."
              : selectedProvider && aiProviders.find(provider => provider.id === selectedProvider)?.tier === 'premium'
              ? 'El uso de modelos Premium puede tener costo según la tarifa de tu proveedor.'
              : 'Las opciones gratuitas tienen límites definidos por cada proveedor.'}
          </p>
        </div>
        {selectedProvider === "local" && (
          <div className="px-3 pb-2 flex-shrink-0">
            <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.12)" }}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-white/75">IA local · {localModelState === "ready" ? "lista" : localModelState === "unsupported" ? "WebGPU no disponible" : "Qwen2.5 0.5B"}</p>
                  <p className="text-[8px] mt-0.5 text-white/35">{localModelState === "loading" ? localProgress.text : "Descarga inicial aproximada: 300 MB. La guía breve sigue disponible sin modelo."}</p>
                </div>
                {localModelState !== "ready" && localModelState !== "unsupported" && (
                  <button
                    type="button"
                    disabled={localModelState === "loading"}
                    onClick={() => void prepareLocalModel()}
                    className="flex-shrink-0 rounded-lg px-2.5 py-1.5 text-[8px] font-black disabled:opacity-50"
                    style={{ color: "#04120f", background: "#00f5d4" }}
                  >
                    {localModelState === "loading" ? `${Math.round(localProgress.progress * 100)}%` : localModelState === "error" ? "Reintentar descarga" : "Preparar modelo"}
                  </button>
                )}
              </div>
              {localModelState === "loading" && (
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#00f5d4] transition-all" style={{ width: `${Math.round(localProgress.progress * 100)}%` }} />
                </div>
              )}
            </div>
          </div>
        )}

        {showGuide ? (
          <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0" style={{ scrollbarWidth:'none' }}>
            <div className="rounded-2xl p-4" style={{ background:'rgba(0,245,212,0.06)', border:'1px solid rgba(0,245,212,0.16)' }}>
              <p className="text-[9px] uppercase tracking-widest font-black" style={{ color:'#00f5d4' }}>Guía para tu perfil</p>
              <h3 className="mt-1 text-sm font-black text-white">{roleGuide.title}</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-white/65">{roleGuide.summary}</p>
            </div>
            <ol className="mt-4 space-y-3">
              {roleGuide.steps.map((step, index) => (
                <li key={step} className="flex gap-2.5 text-[10px] leading-relaxed text-white/75">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-black text-[9px]"
                    style={{ background:'rgba(0,245,212,0.13)', color:'#00f5d4' }}>{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-xl p-3" style={{ background:'rgba(255,255,255,0.045)', border:'1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[8px] uppercase tracking-widest font-black text-white/35">Ejemplo para empezar</p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-white/75">“{roleGuide.prompt}”</p>
              <button
                type="button"
                onClick={() => { setShowGuide(false); sendMessage(roleGuide.prompt); }}
                disabled={loading}
                className="mt-3 rounded-lg px-3 py-2 text-[9px] font-black disabled:opacity-50"
                style={{ background:'linear-gradient(135deg,#00f5d4,#00a896)', color:'#001a14' }}
              >
                Probar ejemplo
              </button>
            </div>
            {aiStatus === 'unconfigured' && (
              <p className="mt-3 text-[9px] leading-relaxed text-amber-300/80">La guía está disponible, pero el administrador debe configurar la IA en el servidor para activar las respuestas.</p>
            )}
          </div>
        ) : (
          <>
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
                <p className="text-[8px] text-white/25 mb-1.5 uppercase tracking-widest">Ejemplos para tu perfil</p>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-hidden">
                  {roleGuide.suggestions.slice(0, 3).map(qa => (
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
          </>
        )}

        {/* Input */}
        {!showGuide && (
          <form onSubmit={handleSubmit} className="px-3 py-3 flex-shrink-0"
            style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl"
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
              {online ? <Wifi size={13} style={{ color:'rgba(0,245,212,0.4)', flexShrink:0 }}/> : <WifiOff size={13} style={{ color:'rgba(255,77,109,0.5)', flexShrink:0 }}/>}
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Escribe una pregunta…"
                disabled={loading}
                maxLength={2000}
                className="flex-1 bg-transparent outline-none text-xs text-white placeholder:text-white/25 min-w-0"
              />
              <button type="submit" disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 disabled:opacity-40"
                style={{ background: input.trim() ? 'linear-gradient(135deg,#00f5d4,#00a896)' : 'transparent', color: input.trim() ? '#000' : 'rgba(255,255,255,0.3)' }}>
                {loading ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>}
              </button>
            </div>
            <p className="text-[8px] text-center mt-1.5" style={{ color:'rgba(255,255,255,0.15)' }}>
              CIVAC IA · Evita incluir contraseñas o tokens
            </p>
          </form>
        )}
      </div>
    </>
  );
}
