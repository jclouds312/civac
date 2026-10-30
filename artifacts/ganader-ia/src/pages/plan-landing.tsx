import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import {
  Download, CheckCircle, ArrowRight, Copy, Share2, Smartphone,
  Wifi, Shield, Zap, Star, Globe, Code2, TrendingUp, Users,
  BarChart3, MapPin, Scale, Dna, Beef, Leaf, DollarSign,
  MessageSquare, Lock, Clock, ChevronDown, ExternalLink,
} from "lucide-react";
import { formatPlanPrice, PLAN_RETAIL_MONTHLY } from "@/lib/plan-pricing";

/* ─── Plan / Rol config ─────────────────────────────────────── */
type PlanKey = "basico" | "pro" | "premium" | "platino" | "vendedora" | "developer";

interface PlanConfig {
  id:       PlanKey;
  label:    string;
  emoji:    string;
  tagline:  string;
  desc:     string;
  precio:   string;
  periodo:  string;
  badge:    string;
  color:    string;
  color2:   string;
  glow:     string;
  bg1:      string;
  bg2:      string;
  border:   string;
  from:     string;
  to:       string;
  highlight:string;
  modules:  string[];
  extras:   string[];
  animals:  string;
  users:    string;
  gps:      string;
  cta:      string;
  ctaSub:   string;
}

const PLANS: Record<PlanKey, PlanConfig> = {
  basico: {
    id:"basico", label:"Básico", emoji:"🐄", tagline:"Empieza a digitalizar tu finca hoy",
    desc:"Plan gratuito para ganaderos que inician su transformación digital. Sin tarjeta de crédito.",
    precio:"Gratis", periodo:"Para siempre", badge:"FREE",
    color:"#b8c4d4", color2:"#94a3b8", glow:"184,196,212",
    bg1:"#080f18", bg2:"#0d1826", border:"rgba(184,196,212,0.25)",
    from:"#b8c4d4", to:"#94a3b8", highlight:"rgba(184,196,212,0.12)",
    modules:["📊 Dashboard KPIs","🐄 Inventario (hasta 50 animales)","🥛 Producción de leche","🌿 Gestión de potreros","🔔 Centro de alertas"],
    extras:["1 usuario por finca","2 collares GPS incluidos","PWA instalable offline","Soporte por email"],
    animals:"50", users:"1", gps:"2",
    cta:"Instalar gratis", ctaSub:"Disponible en Colombia — sin costo",
  },
  pro: {
    id:"pro", label:"PRO", emoji:"⚡", tagline:"El plan más popular entre ganaderos colombianos",
    desc:"Todo lo del plan Básico más módulos avanzados de reproducción, genética, pesaje BT y costos.",
    precio:formatPlanPrice(PLAN_RETAIL_MONTHLY.pro), periodo:"COP / mes + IVA", badge:"MÁS POPULAR",
    color:"#00f5d4", color2:"#00c8a0", glow:"0,245,212",
    bg1:"#020f0c", bg2:"#041a14", border:"rgba(0,245,212,0.28)",
    from:"#00f5d4", to:"#00c8a0", highlight:"rgba(0,245,212,0.10)",
    modules:["📊 Dashboard CIVAC completo","🐄 Inventario hasta 300 animales","🥛 Producción + ranking vacas","🧬 Módulo de Genética DEP","💑 Reproducción + IA bovina","⚖️ Pesaje Bluetooth","📦 Insumos Kardex + alertas","💰 Costos P&G + costo/litro","👷 Personal y nómina","📡 GPS collares real-time","🌿 Potreros + rotación activa","🔬 Semen criogénico"],
    extras:["5 usuarios por finca","10 collares GPS incluidos","Soporte prioritario WhatsApp","Exportación CSV/JSON","IndexedDB offline completo"],
    animals:"300", users:"5", gps:"10",
    cta:"Instalar PRO", ctaSub:"Prueba 14 días gratis — cancela cuando quieras",
  },
  premium: {
    id:"premium", label:"Premium", emoji:"🌟", tagline:"Gestión avanzada con IA para fincas en crecimiento",
    desc:"Incluye predicciones IA, huella de carbono, multi-finca y todas las funciones profesionales.",
    precio:formatPlanPrice(PLAN_RETAIL_MONTHLY.premium), periodo:"COP / mes + IVA", badge:"RECOMENDADO",
    color:"#fbbf24", color2:"#f59e0b", glow:"251,191,36",
    bg1:"#100800", bg2:"#1a0f00", border:"rgba(251,191,36,0.28)",
    from:"#fbbf24", to:"#f59e0b", highlight:"rgba(251,191,36,0.08)",
    modules:["✅ Todo lo del plan PRO","🤖 Predicciones IA (simulador financiero)","🌱 Huella de Carbono CO₂ IPCC 2019","🏘️ Multi-Finca (hasta 3 fincas)","🩺 Ficha clínica individual","⚖️ Pesaje Manual/COM/Serial","🏷️ Trazabilidad ICA + SINIGAN","🩺 Sanidad + vacunas + alertas","📈 Reportes avanzados PDF","🗄️ Backup en la nube","2.000 animales registrables"],
    extras:["20 usuarios por finca","50 collares GPS","Soporte dedicado 24/7","Capacitación online incluida","API acceso básico"],
    animals:"2.000", users:"20", gps:"50",
    cta:"Instalar Premium", ctaSub:"Pago mensual — incluye capacitación",
  },
  platino: {
    id:"platino", label:"Platino", emoji:"👑", tagline:"Plataforma empresarial sin límites para operaciones grandes",
    desc:"Plan corporativo con usuarios ilimitados, multi-tenant, panel admin, soporte dedicado y GPS sin límite.",
    precio:formatPlanPrice(PLAN_RETAIL_MONTHLY.platino), periodo:"COP / mes + IVA", badge:"EMPRESARIAL",
    color:"#e2b96a", color2:"#cd7f32", glow:"226,185,106",
    bg1:"#0e0800", bg2:"#180d00", border:"rgba(226,185,106,0.35)",
    from:"#e2b96a", to:"#cd7f32", highlight:"rgba(226,185,106,0.08)",
    modules:["✅ Todo lo del plan Premium","🏢 Multi-Tenant corporativo","👥 Gestión de usuarios y roles","🔑 Panel de administración CIVAC","📡 GPS ilimitados","🔌 Integraciones API (WhatsApp, Wompi, PSE)","📊 Analytics avanzados plataforma","🤖 IA Genética DEP ranking","📋 Logs de auditoría completos","🔒 SLA 99.9% garantizado","🎧 Soporte dedicado + cuenta manager"],
    extras:["Usuarios ilimitados","GPS sin límite","SLA 99.9% contractual","Manager de cuenta dedicado","Integración contabilidad (Siigo/Alegra)","Instancia dedicada en la nube"],
    animals:"Ilimitados", users:"Ilimitados", gps:"Ilimitados",
    cta:"Solicitar Platino", ctaSub:"Contactar ventas para cotización personalizada",
  },
  vendedora: {
    id:"vendedora", label:"Asesora Comercial", emoji:"💼", tagline:"CRM completo para asesoras de ventas CIVAC",
    desc:"Panel exclusivo de ventas con CRM, pipeline, seguimiento de clientes y reportes de comisiones.",
    precio:"Acceso exclusivo", periodo:"Rol asesora", badge:"SALES TEAM",
    color:"#e879f9", color2:"#a855f7", glow:"232,121,249",
    bg1:"#0f0015", bg2:"#18002a", border:"rgba(232,121,249,0.28)",
    from:"#e879f9", to:"#a855f7", highlight:"rgba(232,121,249,0.08)",
    modules:["💼 Dashboard ventas en tiempo real","👥 CRM de prospectos y clientes","📊 Pipeline visual de ventas","📋 Registro de contactos y seguimiento","💰 Comisiones y metas mensuales","📱 Demo interactiva para clientes","📄 Generación de cotizaciones PDF","🔗 Links de pago Wompi/Nequi","📈 Reportes de conversión","🎯 Leads calificados por plan"],
    extras:["Dashboard exclusivo asesora","Alertas de seguimiento automático","Panel de demostración para prospectos","Integración WhatsApp Business","Historial completo de negociaciones"],
    animals:"N/A", users:"1 asesora", gps:"N/A",
    cta:"Instalar App Vendedora", ctaSub:"Acceso exclusivo equipo comercial CIVAC",
  },
  developer: {
    id:"developer", label:"Developer Console", emoji:"💻", tagline:"Consola de desarrollo y arquitectura CIVAC v2.1",
    desc:"Panel técnico para desarrolladores CIVAC. Feature flags, build info, performance, logs del sistema.",
    precio:"Acceso técnico", periodo:"Rol developer", badge:"DEV TEAM",
    color:"#00ff88", color2:"#00c864", glow:"0,255,136",
    bg1:"#000d05", bg2:"#001a0a", border:"rgba(0,255,136,0.25)",
    from:"#00ff88", to:"#00c864", highlight:"rgba(0,255,136,0.06)",
    modules:["💻 Dev Console CIVAC v2.1","🏗️ Build info + commit hash","⚡ Performance metrics (FCP, LCP, CLS)","🚩 Feature flags manager","📋 Logs del sistema en tiempo real","📦 Bundle analyzer (312 KB / 89 KB gz)","🔑 API Keys + Webhooks","🏷️ Version history CIVAC","⚙️ TypeScript 5.9 · React 18 · Vite 5","🧪 Testing y CI/CD pipeline","🔒 Auditoría de seguridad"],
    extras:["Acceso a todas las rutas del sistema","Feature flags en tiempo real","Consola de API interna","Diagnósticos de rendimiento","Panel multi-rol completo"],
    animals:"Todos los datos", users:"Dev + SuperAdmin", gps:"Acceso total",
    cta:"Instalar Dev Console", ctaSub:"Solo para equipo técnico CIVAC autorizado",
  },
};

const SCREENSHOTS: Record<PlanKey, {label:string;emoji:string}[]> = {
  basico:    [{label:"Dashboard",emoji:"📊"},{label:"Inventario",emoji:"🐄"},{label:"Producción",emoji:"🥛"},{label:"Alertas",emoji:"🔔"},{label:"GPS",emoji:"📡"}],
  pro:       [{label:"Dashboard",emoji:"📊"},{label:"Pesaje BT",emoji:"⚖️"},{label:"Reproducción",emoji:"💑"},{label:"Genética DEP",emoji:"🧬"},{label:"Costos P&G",emoji:"💰"},{label:"GPS Real-Time",emoji:"📡"}],
  premium:   [{label:"IA Predicción",emoji:"🤖"},{label:"Huella CO₂",emoji:"🌱"},{label:"Multi-Finca",emoji:"🏘️"},{label:"Trazabilidad",emoji:"🏷️"},{label:"Sanidad",emoji:"🩺"},{label:"Ficha Clínica",emoji:"📋"}],
  platino:   [{label:"Admin Panel",emoji:"👑"},{label:"Multi-Tenant",emoji:"🏢"},{label:"Analytics",emoji:"📈"},{label:"Integraciones",emoji:"🔌"},{label:"Logs",emoji:"📋"},{label:"SLA 99.9%",emoji:"🛡️"}],
  vendedora: [{label:"CRM Prospectos",emoji:"👥"},{label:"Pipeline",emoji:"📊"},{label:"Seguimiento",emoji:"📱"},{label:"Comisiones",emoji:"💰"},{label:"WhatsApp",emoji:"💬"},{label:"Reportes",emoji:"📄"}],
  developer: [{label:"Build Info",emoji:"🏗️"},{label:"Feature Flags",emoji:"🚩"},{label:"Perf Metrics",emoji:"⚡"},{label:"Logs",emoji:"📋"},{label:"API Keys",emoji:"🔑"},{label:"Bundle",emoji:"📦"}],
};

export default function PlanLanding() {
  const [, params] = useRoute("/plan/:planId");
  const planId = (params?.planId ?? "pro") as PlanKey;
  const plan = PLANS[planId] ?? PLANS.pro;

  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [installed,      setInstalled]      = useState(false);
  const [copied,         setCopied]         = useState(false);
  const [showShare,      setShowShare]      = useState(false);
  const [activeShot,     setActiveShot]     = useState(0);
  const [showAllMods,    setShowAllMods]    = useState(false);

  const shareUrl = `${window.location.origin}/plan/${plan.id}`;

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveShot(s => (s + 1) % SCREENSHOTS[plan.id].length), 3000);
    return () => clearInterval(t);
  }, [plan.id]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    } else {
      window.location.href = "/";
    }
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({ title: `GanaderIA CIVAC — Plan ${plan.label}`, text: plan.tagline, url: shareUrl });
    } else { setShowShare(true); }
  };

  const modsVisible = showAllMods ? plan.modules : plan.modules.slice(0, 6);
  const shots = SCREENSHOTS[plan.id];

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden"
      style={{ background: `linear-gradient(160deg,${plan.bg1} 0%,${plan.bg2} 50%,${plan.bg1} 100%)` }}>

      {/* ── AMBIENT GLOW ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: `radial-gradient(circle, ${plan.color}, transparent 70%)` }}/>
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: `radial-gradient(circle, ${plan.color2}, transparent 70%)` }}/>
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 40px,${plan.color} 40px,${plan.color} 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,${plan.color} 40px,${plan.color} 41px)`,
        }}/>
      </div>

      {/* ── TOP NAV ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 h-14 border-b"
        style={{ background: `${plan.bg1}e8`, backdropFilter: "blur(24px)", borderColor: `rgba(${plan.glow},0.15)` }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm"
            style={{ background: `linear-gradient(135deg,${plan.color},${plan.color2})`, color: "#000" }}>
            {plan.emoji}
          </div>
          <span className="font-black text-white text-sm" style={{ fontFamily: "'Sora',sans-serif" }}>
            GanaderIA <span style={{ color: plan.color }}>CIVAC</span>
          </span>
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full hidden sm:block"
            style={{ background: `rgba(${plan.glow},0.15)`, color: plan.color, border: `1px solid rgba(${plan.glow},0.3)` }}>
            v2.1
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={shareNative}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
            style={{ background: `rgba(${plan.glow},0.10)`, color: plan.color, border: `1px solid rgba(${plan.glow},0.2)` }}>
            <Share2 size={12}/> Compartir
          </button>
          <Link href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: `linear-gradient(135deg,${plan.color},${plan.color2})`, color: "#000" } as React.CSSProperties}>
            Abrir app →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative px-4 sm:px-8 pt-12 pb-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-4">
          <span className="text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest"
            style={{ background: `linear-gradient(135deg,${plan.color},${plan.color2})`, color: "#000", boxShadow: `0 0 24px rgba(${plan.glow},0.4)` }}>
            {plan.badge}
          </span>
        </div>

        {/* Emoji */}
        <div className="text-6xl sm:text-8xl mb-4 animate-bounce" style={{ filter: `drop-shadow(0 0 24px ${plan.color}88)` }}>
          {plan.emoji}
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black mb-3 leading-tight" style={{ fontFamily: "'Sora',sans-serif" }}>
          <span className="text-white">Plan </span>
          <span style={{ background: `linear-gradient(135deg,${plan.color},${plan.color2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {plan.label}
          </span>
        </h1>

        <p className="text-lg sm:text-xl font-semibold mb-2" style={{ color: plan.color }}>{plan.tagline}</p>
        <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">{plan.desc}</p>

        {/* Price */}
        <div className="flex items-end justify-center gap-2 mb-6">
          <span className="text-4xl sm:text-5xl font-black text-white">{plan.precio}</span>
          <span className="text-white/40 text-sm mb-1">{plan.periodo}</span>
        </div>

        {/* Stats pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { icon: <Beef size={12}/>,       label: `${plan.animals} animales` },
            { icon: <Users size={12}/>,      label: `${plan.users}` },
            { icon: <MapPin size={12}/>,     label: `${plan.gps} GPS` },
          ].map(s => (
            <span key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: `rgba(${plan.glow},0.12)`, color: plan.color, border: `1px solid rgba(${plan.glow},0.25)` }}>
              {s.icon}{s.label}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
          <button onClick={handleInstall}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-black transition-all hover:scale-[1.03] active:scale-100"
            style={{
              background: `linear-gradient(135deg,${plan.color},${plan.color2})`,
              color: "#000",
              boxShadow: `0 0 32px rgba(${plan.glow},0.45), 0 4px 24px rgba(0,0,0,0.4)`,
            }}>
            {installed ? <CheckCircle size={18}/> : <Download size={18}/>}
            {installed ? "¡App instalada! Abre desde tu pantalla" : plan.cta}
          </button>
          <Link href="/"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold transition-all hover:opacity-80"
            style={{ background: `rgba(${plan.glow},0.08)`, color: plan.color, border: `2px solid rgba(${plan.glow},0.3)` } as React.CSSProperties}>
            <ExternalLink size={18}/> Abrir en navegador
          </Link>
        </div>
        <p className="text-[11px] text-white/25">{plan.ctaSub}</p>
      </section>

      {/* ── MODULE PREVIEW CAROUSEL ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 mb-10">
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid rgba(${plan.glow},0.2)` }}>
          <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ background: `rgba(${plan.glow},0.06)`, borderColor: `rgba(${plan.glow},0.12)` }}>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"/>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"/>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400"/>
            <span className="text-[10px] text-white/30 ml-2 font-mono">civac.pro/plan/{plan.id}</span>
            <div className="ml-auto flex gap-1">
              {shots.map((_, i) => (
                <button key={i} onClick={() => setActiveShot(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: i === activeShot ? plan.color : "rgba(255,255,255,0.2)" }}/>
              ))}
            </div>
          </div>
          <div className="p-8 flex items-center justify-center min-h-[180px]"
            style={{ background: `linear-gradient(135deg,rgba(${plan.glow},0.04),transparent)` }}>
            <div className="text-center">
              <div className="text-6xl mb-4 transition-all duration-500" style={{ filter: `drop-shadow(0 0 20px ${plan.color}88)` }}>
                {shots[activeShot]?.emoji}
              </div>
              <div className="text-xl font-black" style={{ color: plan.color }}>{shots[activeShot]?.label}</div>
              <div className="text-[10px] text-white/30 mt-1">Módulo {activeShot + 1} de {shots.length} · Plan {plan.label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES / MODULES ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 mb-10">
        <h2 className="text-2xl font-black text-white mb-2 text-center">
          Módulos <span style={{ color: plan.color }}>incluidos</span>
        </h2>
        <p className="text-white/40 text-sm text-center mb-6">Todo lo que obtienes con el plan {plan.label}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modsVisible.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
              style={{ background: `rgba(${plan.glow},0.05)`, border: `1px solid rgba(${plan.glow},0.15)` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                style={{ background: `rgba(${plan.glow},0.12)` }}>
                {m.split(" ")[0]}
              </div>
              <span className="text-sm font-semibold text-white/85">{m.split(" ").slice(1).join(" ")}</span>
            </div>
          ))}
        </div>

        {plan.modules.length > 6 && (
          <button onClick={() => setShowAllMods(!showAllMods)}
            className="w-full mt-3 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 hover:opacity-80"
            style={{ background: `rgba(${plan.glow},0.08)`, color: plan.color, border: `1px solid rgba(${plan.glow},0.2)` }}>
            <ChevronDown size={14} style={{ transform: showAllMods ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}/>
            {showAllMods ? "Ver menos" : `Ver ${plan.modules.length - 6} módulos más`}
          </button>
        )}
      </section>

      {/* ── EXTRAS ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 mb-10">
        <div className="rounded-2xl p-6" style={{ background: `rgba(${plan.glow},0.04)`, border: `1px solid rgba(${plan.glow},0.15)` }}>
          <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <Star size={16} style={{ color: plan.color }}/> Beneficios adicionales
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {plan.extras.map((e, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle size={14} style={{ color: plan.color, flexShrink: 0 }}/>
                <span className="text-sm text-white/70">{e}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PWA INSTALL SECTION ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 mb-10">
        <div className="rounded-3xl overflow-hidden" style={{ border: `1px solid rgba(${plan.glow},0.3)` }}>
          <div className="p-6 sm:p-8"
            style={{ background: `linear-gradient(135deg,rgba(${plan.glow},0.08),rgba(${plan.glow},0.03))` }}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg,${plan.color},${plan.color2})`, boxShadow: `0 0 32px rgba(${plan.glow},0.5)` }}>
                  <Smartphone size={36} style={{ color: "#000" }}/>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-black text-white mb-1">Instala como app nativa</h3>
                <p className="text-white/50 text-sm mb-3">Funciona offline · Icono en pantalla de inicio · Sin Play Store ni App Store</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {[
                    { icon: <Wifi size={11}/>,    label: "Offline PWA" },
                    { icon: <Zap size={11}/>,     label: "Carga rápida" },
                    { icon: <Shield size={11}/>,  label: "Segura" },
                    { icon: <Globe size={11}/>,   label: "Android & iOS" },
                  ].map(f => (
                    <span key={f.label} className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: `rgba(${plan.glow},0.10)`, color: plan.color, border: `1px solid rgba(${plan.glow},0.2)` }}>
                      {f.icon}{f.label}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={handleInstall}
                className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg,${plan.color},${plan.color2})`, color: "#000", boxShadow: `0 0 20px rgba(${plan.glow},0.4)` }}>
                <Download size={16}/>
                {installed ? "Instalado ✓" : "Instalar ahora"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHARE LINK ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 mb-10">
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Share2 size={14} style={{ color: plan.color }}/>
            <span className="font-bold text-white text-sm">Comparte este link con tu cliente</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-xl text-xs font-mono text-white/50 overflow-hidden"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {shareUrl}
            </div>
            <button onClick={copyLink}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 flex-shrink-0"
              style={{ background: copied ? `rgba(${plan.glow},0.2)` : `rgba(${plan.glow},0.10)`, color: plan.color, border: `1px solid rgba(${plan.glow},0.3)` }}>
              {copied ? <CheckCircle size={12}/> : <Copy size={12}/>}
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>
          {/* Share options */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { emoji:"💬", label:"WhatsApp",  href:`https://wa.me/?text=${encodeURIComponent(`GanaderIA CIVAC Plan ${plan.label} — ${plan.tagline} → ${shareUrl}`)}` },
              { emoji:"📧", label:"Email",      href:`mailto:?subject=GanaderIA CIVAC Plan ${plan.label}&body=${encodeURIComponent(`${plan.tagline}\n\n${shareUrl}`)}` },
              { emoji:"🔗", label:"Telegram",   href:`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`GanaderIA CIVAC — Plan ${plan.label}`)}` },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span>{s.emoji}</span> {s.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALL PLANS SELECTOR ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 mb-16">
        <h3 className="text-center text-sm font-bold text-white/30 mb-4 uppercase tracking-wider">— Comparar con otros planes —</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {(Object.values(PLANS) as PlanConfig[]).map(p => (
            <Link key={p.id} href={`/plan/${p.id}`}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all hover:scale-[1.03] ${p.id === plan.id ? "scale-[1.04]" : ""}`}
              style={{
                background: p.id === plan.id ? `rgba(${p.glow},0.14)` : "rgba(255,255,255,0.03)",
                border: `1px solid rgba(${p.glow},${p.id === plan.id ? "0.5" : "0.15"})`,
                outline: p.id === plan.id ? `2px solid ${p.color}55` : "none",
              } as React.CSSProperties}>
              <span className="text-2xl">{p.emoji}</span>
              <span className="text-[9px] font-black" style={{ color: p.color }}>{p.label}</span>
              <span className="text-[8px] text-white/25">{p.precio === "Gratis" ? "Gratis" : (p.precio === "Acceso exclusivo" || p.precio === "Acceso técnico") ? "Rol" : p.precio}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-8 px-4 text-center" style={{ borderColor: `rgba(${plan.glow},0.10)` }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">{plan.emoji}</span>
          <span className="font-black text-white" style={{ fontFamily: "'Sora',sans-serif" }}>GanaderIA CIVAC PRO</span>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
            style={{ background: `rgba(${plan.glow},0.12)`, color: plan.color }}>v2.1</span>
        </div>
        <p className="text-[10px] text-white/20 mb-4">Control Inteligente de Valor Agropecuario · Colombia 🇨🇴 · SoftGan SAS · NIT 900.205.856-3</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Abrir App</Link>
          {(["basico","pro","premium","platino"] as PlanKey[]).map(p => (
            <Link key={p} href={`/plan/${p}`} className="text-[11px] text-white/30 hover:text-white/60 transition-colors capitalize">{PLANS[p].label}</Link>
          ))}
          <Link href="/plan/vendedora" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Vendedora</Link>
          <Link href="/plan/developer" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Developer</Link>
        </div>
      </footer>

      {/* Share modal fallback */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowShare(false)}>
          <div className="w-full max-w-sm rounded-3xl p-6 space-y-4" style={{ background: "#0d1826", border: `1px solid rgba(${plan.glow},0.3)` }}
            onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-white text-center">Compartir Plan {plan.label}</h3>
            <div className="flex flex-col gap-2">
              {[
                { emoji:"💬", label:"Enviar por WhatsApp", href:`https://wa.me/?text=${encodeURIComponent(`GanaderIA CIVAC Plan ${plan.label} → ${shareUrl}`)}` },
                { emoji:"📧", label:"Enviar por Email",    href:`mailto:?subject=GanaderIA CIVAC Plan ${plan.label}&body=${encodeURIComponent(shareUrl)}` },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-80"
                  style={{ background: `rgba(${plan.glow},0.08)`, color: plan.color, border: `1px solid rgba(${plan.glow},0.2)` }}>
                  <span className="text-xl">{s.emoji}</span> {s.label}
                </a>
              ))}
              <button onClick={copyLink}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm"
                style={{ background: "rgba(255,255,255,0.05)", color: "white/70" }}>
                {copied ? <CheckCircle size={18} style={{ color: plan.color }}/> : <Copy size={18}/>}
                {copied ? "¡Link copiado!" : "Copiar link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
