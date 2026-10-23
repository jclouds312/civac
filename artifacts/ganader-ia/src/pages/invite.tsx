import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/lib/auth";
import type { PlanId } from "@/lib/auth";
import {
  Download, CheckCircle, Smartphone, Globe, Share2, Copy,
  Zap, Star, Crown, Shield, Lock, ArrowRight, ChevronDown,
  ChevronUp, MapPin, Activity, Wifi, WifiOff, Bell, LogIn,
} from "lucide-react";

/* ── Token helpers ─────────────────────────────────────────────── */
interface InviteToken {
  e:  string;   // email
  p:  string;   // password
  pl: PlanId;   // plan
  n:  string;   // nombre
  f:  string;   // finca
  r?: string;   // role
  t?: number;   // timestamp
}

function decodeToken(raw: string): InviteToken | null {
  try {
    const json = atob(decodeURIComponent(raw));
    return JSON.parse(json) as InviteToken;
  } catch { return null; }
}

/* ── Plan visual config ────────────────────────────────────────── */
const PLAN_CFG: Record<string, {
  label: string; emoji: string; color: string; color2: string;
  glow: string; badge: string; bg1: string; bg2: string;
  features: string[];
}> = {
  basico:  { label:"Básico",   emoji:"🐄", color:"#b8c4d4", color2:"#94a3b8", glow:"184,196,212", badge:"GRATIS",      bg1:"#0a0f18", bg2:"#111827",
    features:["Dashboard ganadero","Inventario 50 animales","Producción y ordeño","Potreros básicos","Alertas"] },
  pro:     { label:"PRO",      emoji:"⚡", color:"#00f5d4", color2:"#00c8ff", glow:"0,245,212",   badge:"MÁS POPULAR", bg1:"#020d1a", bg2:"#0a1a2e",
    features:["Todo lo de Básico","300 animales + GPS","Reproducción y genética","Pesaje BT/COM","Costos P&G","IA Predicciones","3 Multi-Fincas"] },
  premium: { label:"Premium",  emoji:"🌟", color:"#fbbf24", color2:"#f59e0b", glow:"251,191,36",  badge:"RECOMENDADO", bg1:"#140a00", bg2:"#1e1000",
    features:["Todo lo de PRO","GPS 50 collares","IA avanzada","Multi-finca ilimitada","Google Drive sync","API REST","Soporte 24/7"] },
  platino: { label:"Platino",  emoji:"👑", color:"#cd7f32", color2:"#e07b54", glow:"205,127,50",  badge:"EMPRESARIAL", bg1:"#0a0800", bg2:"#150f00",
    features:["Todo ilimitado","SLA 99.9%","Instancia dedicada","Capacitación en finca","Módulos a medida","Webhooks + API","Contrato empresarial"] },
};

/* ── Module icons per plan ─────────────────────────────────────── */
const PLAN_MODULES: Record<string, { icon: string; label: string }[]> = {
  basico:  [{ icon:"📊", label:"Dashboard" },{ icon:"🐄", label:"Inventario" },{ icon:"🥛", label:"Producción" },{ icon:"🌿", label:"Potreros" },{ icon:"🔔", label:"Alertas" }],
  pro:     [{ icon:"📊", label:"Dashboard" },{ icon:"🐄", label:"Inventario" },{ icon:"🥛", label:"Producción" },{ icon:"🧬", label:"Reproducción" },{ icon:"🔬", label:"Genética" },{ icon:"⚖️", label:"Pesaje BT" },{ icon:"📡", label:"GPS" },{ icon:"💰", label:"Costos" },{ icon:"👷", label:"Personal" },{ icon:"🤖", label:"IA" }],
  premium: [{ icon:"📊", label:"Dashboard" },{ icon:"🐄", label:"Inventario" },{ icon:"🥛", label:"Producción" },{ icon:"🧬", label:"Reproducción" },{ icon:"🔬", label:"Genética" },{ icon:"⚖️", label:"Pesaje" },{ icon:"📡", label:"GPS 50" },{ icon:"💰", label:"Costos" },{ icon:"🏘️", label:"Multi-Finca" },{ icon:"🤖", label:"IA Avanzada" },{ icon:"🌍", label:"CO₂" },{ icon:"🔗", label:"API REST" }],
  platino: [{ icon:"📊", label:"Dashboard" },{ icon:"🐄", label:"Ilimitados" },{ icon:"📡", label:"GPS Total" },{ icon:"🏘️", label:"Multi-Tenant" },{ icon:"🤖", label:"IA Full" },{ icon:"👥", label:"Usuarios" },{ icon:"⚙️", label:"Config" },{ icon:"🔒", label:"Admin" },{ icon:"📋", label:"Documentación" },{ icon:"🔗", label:"Webhooks" }],
};

/* ── Animated counter ──────────────────────────────────────────── */
function Counter({ to, duration = 1200 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const raf = (ts: number) => {
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round(p * p * to));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [to, duration]);
  return <>{val.toLocaleString("es-CO")}</>;
}

/* ── PWA install hook ──────────────────────────────────────────── */
function usePWAInstall() {
  const [prompt, setPrompt] = useState<Event & { prompt: () => Promise<void> } | null>(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setPrompt(e as any); };
    window.addEventListener("beforeinstallprompt", h);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  const install = async () => {
    if (prompt) { await (prompt as any).prompt(); setPrompt(null); }
    else { window.location.href = "/"; }
  };
  return { canInstall: !!prompt, installed, install };
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { canInstall, installed, install } = usePWAInstall();

  const [copied, setCopied]     = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed]   = useState(false);
  const [online, setOnline]     = useState(navigator.onLine);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const token  = decodeToken(params.token || "");
  const plan   = PLAN_CFG[token?.pl ?? "pro"] ?? PLAN_CFG.pro;
  const planId = (token?.pl ?? "pro") as PlanId;
  const modules = PLAN_MODULES[planId] ?? PLAN_MODULES.pro;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background:"#030f0b" }}>
        <div className="text-center px-6">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-black text-white mb-2">Enlace inválido</h1>
          <p className="text-white/40 text-sm mb-6">Este enlace de invitación no es válido o ha expirado.</p>
          <button onClick={() => setLocation("/")}
            className="px-6 py-3 rounded-2xl font-bold text-black text-sm"
            style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)" }}>
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  const inviteUrl = window.location.href;

  const copyLink = () => {
    navigator.clipboard?.writeText(inviteUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClaim = async () => {
    setClaiming(true);
    /* Save pending invite so login page auto-fills */
    try {
      localStorage.setItem("civac_pending_invite", JSON.stringify({
        email: token.e, password: token.p, plan: token.pl,
        nombre: token.n, finca: token.f,
      }));
    } catch { /* ignore */ }
    /* Try direct login if online */
    if (online) {
      const ok = login(token.e, token.p);
      if (ok) { setClaimed(true); setTimeout(() => setLocation("/"), 1200); return; }
    }
    setClaiming(false);
    setLocation("/");
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden"
      style={{ background: `radial-gradient(ellipse 120% 70% at 50% 0%, rgba(${plan.glow},0.18) 0%, transparent 70%), linear-gradient(180deg,${plan.bg1},${plan.bg2})` }}>

      {/* ── TOP GLOW ── */}
      <div className="absolute inset-x-0 top-0 h-1"
        style={{ background:`linear-gradient(90deg,${plan.color},${plan.color2},transparent)` }}/>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 px-4 sm:px-6 h-14 flex items-center justify-between backdrop-blur-xl border-b"
        style={{ background:"rgba(0,0,0,0.65)", borderColor:`rgba(${plan.glow},0.15)` }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm"
            style={{ background:`linear-gradient(135deg,${plan.color},${plan.color2})`, color:"#000" }}>
            🐄
          </div>
          <span className="font-black text-sm">GanaderIA <span style={{ color:plan.color }}>CIVAC</span></span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
            style={{ background:`rgba(${plan.glow},0.15)`, color:plan.color, border:`1px solid rgba(${plan.glow},0.3)` }}>
            v2.1
          </span>
        </div>
        <div className="flex items-center gap-2">
          {online
            ? <span className="flex items-center gap-1 text-[9px] text-emerald-400"><Wifi size={10}/> Online</span>
            : <span className="flex items-center gap-1 text-[9px] text-red-400"><WifiOff size={10}/> Sin conexión</span>
          }
          <button onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
            style={{ background:`rgba(${plan.glow},0.10)`, color:plan.color, border:`1px solid rgba(${plan.glow},0.2)` }}>
            <Share2 size={12}/> Compartir
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative px-4 sm:px-8 pt-10 pb-8 text-center max-w-2xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest"
          style={{ background:`linear-gradient(135deg,${plan.color},${plan.color2})`, color:"#000" }}>
          <Shield size={10}/> ACCESO PERSONAL CIVAC
        </div>

        {/* Plan emoji */}
        <div className="text-7xl mb-4 relative">
          <span className="relative z-10">{plan.emoji}</span>
          <div className="absolute inset-0 rounded-full blur-2xl opacity-30"
            style={{ background:`radial-gradient(circle, rgba(${plan.glow},0.6) 0%, transparent 70%)` }}/>
        </div>

        {/* Welcome */}
        <h1 className="text-3xl sm:text-4xl font-black mb-2">
          ¡Hola, <span style={{ color:plan.color }}>{token.n.split(" ")[0]}</span>!
        </h1>
        <p className="text-white/50 text-sm mb-1">Tu acceso a <strong className="text-white">GanaderIA CIVAC</strong> está listo</p>
        {token.f && <p className="text-[11px] mb-6" style={{ color:`rgba(${plan.glow},0.6)` }}><MapPin size={10} className="inline mr-1"/>{token.f}</p>}

        {/* Plan card */}
        <div className="rounded-2xl p-5 mb-6 text-left"
          style={{ background:`rgba(${plan.glow},0.06)`, border:`1px solid rgba(${plan.glow},0.2)`, backdropFilter:"blur(12px)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Tu plan asignado</p>
              <h2 className="text-2xl font-black" style={{ color:plan.color }}>Plan {plan.label}</h2>
            </div>
            <span className="text-[9px] px-3 py-1.5 rounded-full font-black"
              style={{ background:`linear-gradient(135deg,${plan.color},${plan.color2})`, color:"#000" }}>
              {plan.badge}
            </span>
          </div>

          {/* Feature list */}
          <div className="space-y-1.5 mb-4">
            {plan.features.slice(0, expanded ? undefined : 4).map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <CheckCircle size={13} style={{ color:plan.color }} className="flex-shrink-0"/>
                <span className="text-white/80">{f}</span>
              </div>
            ))}
          </div>
          {plan.features.length > 4 && (
            <button onClick={() => setExpanded(e => !e)}
              className="text-[10px] flex items-center gap-1 transition-colors hover:opacity-80"
              style={{ color:plan.color }}>
              {expanded ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
              {expanded ? "Ver menos" : `+${plan.features.length - 4} más incluido`}
            </button>
          )}
        </div>

        {/* Credential info */}
        <div className="rounded-2xl p-4 mb-6 text-left space-y-2"
          style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1"><Lock size={9}/> Tus credenciales de acceso</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[9px] text-white/30 mb-0.5">Correo</p>
              <p className="text-xs font-mono font-bold text-white bg-white/5 px-2 py-1 rounded-lg truncate">{token.e}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/30 mb-0.5">Contraseña</p>
              <p className="text-xs font-mono font-bold text-white bg-white/5 px-2 py-1 rounded-lg">{"•".repeat(Math.min(token.p.length, 8))}</p>
            </div>
          </div>
          <p className="text-[9px] text-white/25 flex items-center gap-1"><Shield size={9}/> Guarda estas credenciales en un lugar seguro</p>
        </div>

        {/* CTA buttons */}
        {claimed ? (
          <div className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm"
            style={{ background:`rgba(${plan.glow},0.12)`, border:`1px solid rgba(${plan.glow},0.3)`, color:plan.color }}>
            <CheckCircle size={18}/> ¡Acceso activado! Redirigiendo…
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button onClick={handleClaim} disabled={claiming}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
              style={{
                background:`linear-gradient(135deg,${plan.color},${plan.color2})`,
                color:"#000",
                boxShadow:`0 0 40px rgba(${plan.glow},0.5)`,
              }}>
              {claiming
                ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"/>
                : <LogIn size={18}/>}
              {claiming ? "Activando acceso…" : `Entrar a CIVAC ${plan.label}`}
            </button>

            {(canInstall || !installed) && (
              <button onClick={install}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all hover:opacity-80"
                style={{ background:`rgba(${plan.glow},0.08)`, color:plan.color, border:`2px solid rgba(${plan.glow},0.3)` }}>
                {installed ? <CheckCircle size={16}/> : <Download size={16}/>}
                {installed ? "App instalada en tu dispositivo" : "Instalar app en tu celular / PC"}
              </button>
            )}

            <button onClick={() => setLocation("/")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all hover:opacity-70"
              style={{ background:"rgba(255,255,255,0.03)", color:"rgba(255,255,255,0.35)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <Globe size={13}/> Abrir en navegador sin instalar
            </button>
          </div>
        )}

        <p className="text-[10px] text-white/20 mt-3">
          Acceso asignado por administrador CIVAC · Soporte: soporte@civac.co
        </p>
      </section>

      {/* ── MODULES GRID ── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-8 mb-10">
        <h3 className="text-center text-xs font-black text-white/40 mb-4 uppercase tracking-wider">
          — Módulos incluidos en tu plan —
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {modules.map((m, i) => (
            <div key={i}
              className="flex flex-col items-center gap-1 p-2.5 rounded-2xl"
              style={{ background:`rgba(${plan.glow},0.05)`, border:`1px solid rgba(${plan.glow},0.12)` }}>
              <span className="text-xl">{m.icon}</span>
              <span className="text-[8px] text-white/50 text-center leading-tight">{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-8 mb-10">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon:"🐄", val: planId==="basico"?50:planId==="pro"?300:planId==="premium"?1000:99999, label:"Animales", suffix: planId==="platino"?"∞":"" },
            { icon:"📡", val: planId==="basico"?0:planId==="pro"?10:planId==="premium"?50:99999, label:"GPS Collares", suffix: planId==="platino"?"∞":"" },
            { icon:"👥", val: planId==="basico"?1:planId==="pro"?5:planId==="premium"?15:99999, label:"Usuarios", suffix: planId==="platino"?"∞":"" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-3 text-center"
              style={{ background:`rgba(${plan.glow},0.05)`, border:`1px solid rgba(${plan.glow},0.12)` }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-lg font-black" style={{ color:plan.color }}>
                {s.suffix === "∞" ? "∞" : <Counter to={s.val}/>}
              </div>
              <div className="text-[8px] text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SHARE SECTION ── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-8 mb-10">
        <div className="rounded-2xl p-4" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-xs font-bold text-white/50 mb-3 flex items-center gap-2"><Copy size={12}/> Guardar enlace de acceso</p>
          <div className="flex gap-2">
            <div className="flex-1 truncate text-[10px] font-mono bg-white/5 px-3 py-2 rounded-xl text-white/40 overflow-hidden">
              {inviteUrl.length > 60 ? inviteUrl.slice(0, 60) + "…" : inviteUrl}
            </div>
            <button onClick={copyLink}
              className="px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all"
              style={{ background: copied ? `rgba(${plan.glow},0.2)` : `rgba(${plan.glow},0.08)`, color: plan.color, border:`1px solid rgba(${plan.glow},0.25)` }}>
              {copied ? "✓ Copiado" : <Copy size={13}/>}
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <a href={`https://wa.me/?text=${encodeURIComponent("Mi acceso CIVAC PRO: " + inviteUrl)}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold transition-all hover:opacity-80"
              style={{ background:"rgba(37,211,102,0.1)", color:"#25d366", border:"1px solid rgba(37,211,102,0.25)" }}>
              📱 WhatsApp
            </a>
            <a href={`mailto:?subject=Tu acceso CIVAC&body=${encodeURIComponent("Tu acceso a GanaderIA CIVAC: " + inviteUrl)}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold transition-all hover:opacity-80"
              style={{ background:"rgba(0,120,255,0.1)", color:"#60a5fa", border:"1px solid rgba(0,120,255,0.25)" }}>
              ✉️ Email
            </a>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent("Mi acceso CIVAC ganadero 🐄")}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold transition-all hover:opacity-80"
              style={{ background:"rgba(0,136,204,0.1)", color:"#0088cc", border:"1px solid rgba(0,136,204,0.25)" }}>
              ✈️ Telegram
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="text-center px-4 pb-10 text-white/20">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg">🐄</span>
          <span className="font-black text-white/30 text-xs">GanaderIA CIVAC</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full"
            style={{ background:`rgba(${plan.glow},0.12)`, color:plan.color }}>v2.1</span>
        </div>
        <p className="text-[10px] text-white/20">Control Inteligente de Valor Agropecuario · Colombia 🇨🇴</p>
        <p className="text-[9px] text-white/15 mt-1">CIVAC de SoftGan SAS · NIT 900.205.856-3 · Desarrollo y soporte oficial: Universal Business Technology</p>
      </footer>
    </div>
  );
}
