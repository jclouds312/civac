import { useState, useEffect, useRef } from "react";
import { useAuth, Account, PLAN_LABEL, PLAN_COLOR, PLAN_COLOR2, PLAN_GLOW, PLAN_ICON, PLAN_PRECIOS, PLAN_GRADIENT, type PlanId } from "@/lib/auth";
import {
  Eye, EyeOff, Lock, User, Shield, Zap, Star, Crown,
  Check, X, Leaf, ArrowRight, Wifi, Smartphone, CreditCard,
  Phone, Building2, ChevronRight, CheckCircle2, ExternalLink,
  AlertTriangle, Copy, Activity, Globe, Cpu,
  TrendingUp, MapPin, Thermometer, Wind, Droplets, BarChart3,
  Server, CheckCircle, Clock, Layers, UserPlus
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════════════════ */

const PLAN_FEATURES: Record<PlanId, string[]> = {
  basico:  ["50 animales máx","1 usuario","Dashboard básico","Inventario","Producción","Alertas","Potreros"],
  pro:     ["Animales ilimitados","5 usuarios","Pesaje Bluetooth","GPS ganado","Reproducción","Genética","Insumos","Costos","Personal","Predicción IA","3 Multi-fincas","Básculas COM/USB"],
  premium: ["Todo el plan PRO","15 usuarios","GPS 50 collares","IA avanzada","Multi-finca ilimitada","Google Drive sync","Soporte 24/7","API REST"],
  platino: ["TODO ilimitado","Usuarios ilimitados","SLA 99.9%","Instancia dedicada","Capacitación en finca","Módulos a medida","Contrato empresarial","Webhooks + API"],
};

const PLAN_COLORS_GRADIENT: Record<PlanId, [string,string]> = {
  basico:  ["#b8c4d4","#94a3b8"],
  pro:     ["#00f5d4","#00c8ff"],
  premium: ["#fbbf24","#f59e0b"],
  platino: ["#cd7f32","#e07b54"],
};

const PLAN_PRECIOS_LABEL: Record<PlanId, string> = {
  basico:  "Gratis",
  pro:     "$89.000/mes",
  premium: "$189.000/mes",
  platino: "$399.000/mes",
};

const CLIENT_CONFIG: Record<string, { emoji:string; label:string; sub:string; from:string; to:string; glow:string; color:string; accent:string }> = {
  superadmin:  { emoji:"🔱",  label:"CEO · Co-Fundador CIVAC",    sub:"Dueño · Acceso total · Auditoría · Config global · Server Panel",   from:"#c0392b", to:"#e74c3c", glow:"192,57,43",     color:"#e74c3c", accent:"#ff4444" },
  admin:       { emoji:"👑",  label:"Co-Fundadora · Dir. Ejecutiva", sub:"Dirección ejecutiva · Panel Admin · Plataforma completa",         from:"#d4a017", to:"#f0c040", glow:"212,160,23",    color:"#f0c040", accent:"#ffd700" },
  developer:   { emoji:"🛠️", label:"Arquitecto · Soporte Dev",    sub:"Dev principal · Soporte PWA · APIs · Feature Flags · Deploy",      from:"#00c853", to:"#00e676", glow:"0,200,83",      color:"#00e676", accent:"#00ff88" },
  sales:       { emoji:"📊",  label:"Asesora Comercial Senior",   sub:"CRM · Pipeline · Reportes diarios · Gestión de cuentas",           from:"#e879f9", to:"#a855f7", glow:"232,121,249",   color:"#e879f9", accent:"#f472b6" },
  vet:         { emoji:"🩺",  label:"Médico Veterinario",          sub:"Sanidad animal · Reproducción · Genética · Historia clínica",      from:"#0288d1", to:"#29b6f6", glow:"2,136,209",     color:"#29b6f6", accent:"#00c8ff" },
  field:       { emoji:"🌿",  label:"Jefe de Campo",               sub:"Pesaje · Potreros · GPS · Insumos · Producción diaria",            from:"#2e7d32", to:"#66bb6a", glow:"46,125,50",     color:"#66bb6a", accent:"#39ff7e" },
  viewer:      { emoji:"📈",  label:"Propietario / Inversor",      sub:"Solo lectura · Dashboard · Costos · Predicción IA",               from:"#6a1b9a", to:"#ab47bc", glow:"106,27,154",    color:"#ab47bc", accent:"#c084fc" },
};

/* ═══════════════════════════════════════════════════════════════════════════════
   ANIMATED BACKGROUND — Granja / Farm layers
═══════════════════════════════════════════════════════════════════════════════ */
function FarmBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Layer 1: High-quality Colombian cattle panorama */}
      <div className="absolute inset-0" style={{
        backgroundImage:"url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=2560&q=85&auto=format&fit=crop')",
        backgroundSize:"cover", backgroundPosition:"center 30%",
        transform:"scale(1.08)",
        animation:"slow-drift 40s ease-in-out infinite alternate",
        filter:"saturate(1.3) brightness(0.85)",
      }}/>
      {/* Layer 2: Deep atmospheric overlay — dark navy cinematic */}
      <div className="absolute inset-0" style={{
        background:"linear-gradient(175deg,rgba(2,6,18,0.97) 0%,rgba(4,12,35,0.86) 30%,rgba(2,8,22,0.92) 65%,rgba(1,5,15,0.98) 100%)",
      }}/>
      {/* Layer 3: Bottom cinematic green fields fade */}
      <div className="absolute bottom-0 left-0 right-0 h-80" style={{
        backgroundImage:"url('https://images.unsplash.com/photo-1560493676-04071c5f467b?w=2560&q=60&auto=format&fit=crop&crop=bottom')",
        backgroundSize:"cover", backgroundPosition:"center bottom", opacity:0.28,
        maskImage:"linear-gradient(transparent 0%,rgba(0,0,0,0.95) 50%)",
        WebkitMaskImage:"linear-gradient(transparent 0%,rgba(0,0,0,0.95) 50%)",
        filter:"saturate(1.5) hue-rotate(5deg)",
      }}/>
      {/* Layer 4: Neon tech dot-grid */}
      <div className="absolute inset-0" style={{
        backgroundImage:"radial-gradient(circle, rgba(0,245,212,0.055) 1px, transparent 1px)",
        backgroundSize:"44px 44px",
        animation:"grid-pulse 8s ease-in-out infinite",
      }}/>
      {/* Layer 5: Vibrant radial glow spots */}
      <div className="absolute inset-0" style={{ background:`
        radial-gradient(ellipse 60% 40% at 8%  5%,   rgba(0,245,212,0.14) 0%, transparent 60%),
        radial-gradient(ellipse 50% 50% at 92% 90%,  rgba(57,255,126,0.11) 0%, transparent 60%),
        radial-gradient(ellipse 40% 40% at 85% 10%,  rgba(0,180,255,0.10)  0%, transparent 55%),
        radial-gradient(ellipse 70% 35% at 50% 100%, rgba(251,191,36,0.07) 0%, transparent 55%),
        radial-gradient(ellipse 35% 35% at 5%  90%,  rgba(168,85,247,0.08) 0%, transparent 50%)`}}/>
      {/* Layer 6: Colombian flag accent streaks */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:"linear-gradient(90deg,transparent 0%,#FCD116 25%,#003087 50%,#CE1126 75%,transparent 100%)", opacity:0.35 }}/>
      {/* Layer 7: Fast horizontal scan line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background:"linear-gradient(90deg,transparent 0%,#00f5d4 40%,#a855f7 55%,#00c8ff 70%,transparent 100%)", animation:"scan-line 8s linear infinite", opacity:0.55 }}/>
      {/* Layer 8: Side neon accent bars */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background:"linear-gradient(180deg,transparent,#00f5d4 35%,#39ff7e 65%,transparent)", opacity:0.35, animation:"pulse-vert 5s ease-in-out infinite" }}/>
      <div className="absolute right-0 top-0 bottom-0 w-0.5" style={{ background:"linear-gradient(180deg,transparent,#a855f7 35%,#00c8ff 65%,transparent)", opacity:0.35, animation:"pulse-vert 5s ease-in-out infinite 2.5s" }}/>
      {/* Layer 9: Center light leak */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[35vh]"
        style={{ background:"radial-gradient(ellipse,rgba(0,245,212,0.06) 0%,transparent 70%)", pointerEvents:"none" }}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ENHANCED PARTICLES — more farm elements
═══════════════════════════════════════════════════════════════════════════════ */
function Particles() {
  const items = [
    {e:"🐄",x:5,  y:11, s:1.5, d:5.2, o:0.14, blur:0},
    {e:"🌾",x:88, y:13, s:1.2, d:4.8, o:0.12, blur:0},
    {e:"🏡",x:13, y:70, s:1.1, d:6.0, o:0.10, blur:0.5},
    {e:"🐂",x:81, y:74, s:1.3, d:5.5, o:0.12, blur:0},
    {e:"🌿",x:50, y:5,  s:1.0, d:7.0, o:0.09, blur:0.5},
    {e:"🐔",x:93, y:43, s:0.9, d:4.5, o:0.10, blur:0},
    {e:"🥛",x:3,  y:45, s:1.1, d:5.8, o:0.11, blur:0},
    {e:"🌻",x:45, y:91, s:1.4, d:6.5, o:0.10, blur:0},
    {e:"🐎",x:70, y:7,  s:1.2, d:5.0, o:0.09, blur:0},
    {e:"🌵",x:24, y:85, s:1.0, d:5.5, o:0.08, blur:0.5},
    {e:"⚡",x:60, y:95, s:0.9, d:6.8, o:0.09, blur:0},
    {e:"🧬",x:96, y:60, s:0.8, d:4.2, o:0.08, blur:0.5},
    {e:"📡",x:2,  y:28, s:0.9, d:5.6, o:0.08, blur:0},
    {e:"🌄",x:55, y:2,  s:1.0, d:8.0, o:0.07, blur:1},
    {e:"🐓",x:76, y:90, s:0.8, d:4.8, o:0.09, blur:0},
    {e:"🍃",x:38, y:96, s:1.2, d:6.2, o:0.08, blur:0},
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {items.map((p,i)=>(
        <div key={i} className="absolute select-none" style={{
          left:`${p.x}%`, top:`${p.y}%`,
          fontSize:`${p.s*2.2}rem`, opacity:p.o,
          animation:`float ${p.d}s ease-in-out infinite`,
          animationDelay:`${i*0.5}s`,
          filter:`blur(${p.blur}px)`,
          transition:"all 0.3s",
        }}>
          {p.e}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FOOTER KPI STRIP — debajo del recuadro de login
═══════════════════════════════════════════════════════════════════════════════ */
function LoginStatsFooter() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t+1), 2500); return () => clearInterval(id); }, []);

  const litros   = (84 + Math.sin(tick * 0.7) * 2).toFixed(0);
  const temp     = (22.4 + Math.sin(tick * 0.4) * 0.6).toFixed(1);
  const humidity = (68 + Math.sin(tick * 0.5) * 3).toFixed(0);

  const stats = [
    { icon:<Activity size={20}/>,    label:"Producción",  val:`${litros} L/día`, sub:"↑ 3.2% vs ayer",   c:"#00f5d4", g:"0,245,212",   pulse:true  },
    { icon:<MapPin size={20}/>,      label:"GPS Online",  val:"13 collares",     sub:"Todos activos",    c:"#00c8ff", g:"0,200,255",   pulse:true  },
    { icon:<Thermometer size={20}/>, label:"Temperatura", val:`${temp}°C`,       sub:"Zona Andina",      c:"#fbbf24", g:"251,191,36",  pulse:false },
    { icon:<Droplets size={20}/>,    label:"Humedad",     val:`${humidity}%`,    sub:"Óptimo ganado",    c:"#60a5fa", g:"96,165,250",  pulse:false },
    { icon:<TrendingUp size={20}/>,  label:"Utilidad",    val:"$40.2M",          sub:"Mes actual COP",   c:"#39ff7e", g:"57,255,126",  pulse:false },
    { icon:<Server size={20}/>,      label:"Servidores",  val:"99.8%",           sub:"Analytics + GPS",  c:"#e879f9", g:"232,121,249", pulse:true  },
  ];

  return (
    <div className="mt-8 w-full">
      {/* ── Separator con label ── */}
      <div className="relative flex items-center mb-5">
        <div className="flex-1 h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(0,245,212,0.35),transparent)" }}/>
        <span className="mx-4 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full"
          style={{ color:"#00f5d4", border:"1.5px solid rgba(0,245,212,0.35)", background:"rgba(0,245,212,0.07)", boxShadow:"0 0 16px rgba(0,245,212,0.1)", letterSpacing:"0.2em" }}>
          Estado en tiempo real · CIVAC PRO
        </span>
        <div className="flex-1 h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(0,245,212,0.35),transparent)" }}/>
      </div>

      {/* ── KPI grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s,i) => (
          <div key={i}
            className="group flex flex-col items-center gap-2.5 px-3 py-5 rounded-2xl cursor-default transition-all duration-300 hover:scale-[1.05]"
            style={{
              background:`rgba(${s.g},0.07)`,
              border:`1.5px solid rgba(${s.g},0.28)`,
              backdropFilter:"blur(16px)",
              boxShadow:`0 0 14px rgba(${s.g},0.08)`,
              transition:"all 0.3s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px rgba(${s.g},0.35), 0 8px 24px rgba(0,0,0,0.4)`;
              (e.currentTarget as HTMLElement).style.background = `rgba(${s.g},0.13)`;
              (e.currentTarget as HTMLElement).style.borderColor = `rgba(${s.g},0.55)`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 14px rgba(${s.g},0.08)`;
              (e.currentTarget as HTMLElement).style.background = `rgba(${s.g},0.07)`;
              (e.currentTarget as HTMLElement).style.borderColor = `rgba(${s.g},0.28)`;
            }}>
            {/* Icon circle */}
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative flex-shrink-0"
              style={{ background:`rgba(${s.g},0.16)`, border:`1.5px solid rgba(${s.g},0.40)`, boxShadow:`0 0 18px rgba(${s.g},0.20)` }}>
              <div style={{ color:s.c }}>{s.icon}</div>
              {s.pulse && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  style={{ background:s.c, boxShadow:`0 0 8px ${s.c}`, animation:"ping-dot 1.5s ease-in-out infinite" }}/>
              )}
            </div>
            {/* Label + value */}
            <div className="text-center">
              <div className="text-[11px] font-black uppercase tracking-wider mb-1" style={{ color:s.c, letterSpacing:"0.12em" }}>{s.label}</div>
              <div className="text-[17px] font-black leading-none mb-1" style={{ color:"#ffffff", textShadow:`0 0 20px rgba(${s.g},0.6)` }}>{s.val}</div>
              <div className="text-[10px] font-bold" style={{ color:`rgba(${s.g},0.65)` }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Brand footer ── */}
      <div className="mt-6 space-y-3">
        {/* Main brand line */}
        <div className="relative overflow-hidden rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ background:"linear-gradient(135deg,rgba(0,245,212,0.05),rgba(0,200,255,0.03))", border:"1px solid rgba(0,245,212,0.18)", backdropFilter:"blur(20px)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background:"radial-gradient(ellipse 60% 80% at 10% 50%,rgba(0,245,212,0.04),transparent)" }}/>
          <div className="text-center sm:text-left">
            <p className="text-[13px] font-black text-white tracking-wide leading-snug" style={{ textShadow:"0 0 30px rgba(0,245,212,0.3)" }}>
              GanaderIA <span style={{ color:"#00f5d4" }}>CIVAC PRO</span> v2.1
              <span className="text-white/40 font-normal mx-1.5">·</span>
              <span style={{ color:"#e879f9" }}>34+ módulos</span>
              <span className="text-white/40 font-normal mx-1.5">·</span>
              <span style={{ color:"#fbbf24" }}>Control Inteligente de Valor Agropecuario</span>
            </p>
            <p className="text-[11px] font-semibold mt-0.5" style={{ color:"rgba(255,255,255,0.45)" }}>
              Colombia {new Date().getFullYear()}
              <span className="mx-1.5 text-white/20">·</span>
              Universal Business Technology
            </p>
          </div>
          {/* Badges */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{ background:"rgba(0,245,212,0.12)", border:"1px solid rgba(0,245,212,0.35)", color:"#00f5d4" }}>
              🇨🇴 Made in Colombia
            </span>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)", color:"#fbbf24" }}>
              ✓ DIAN
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   COLOMBIAN BRAND TICKER
═══════════════════════════════════════════════════════════════════════════════ */
function ColombianTicker() {
  const items = [
    "🇨🇴 Hecho en Colombia · 100% Colombiano","🐄 13 Animales activos · Hato Certificado",
    "🥛 84 L/día · Producción récord","💰 $40.2M utilidad · Marzo 2026",
    "📡 GPS Real-Time · 13 collares activos","🤖 Asesora IA Colombia · GPT ganadero",
    "🩺 Sanidad ICA · Vacunas al día","🌿 -18% Huella CO₂ · Carbono neutro 2027",
    "⚖️ 3 Básculas Bluetooth vinculadas","☁️ Analytics Server ONLINE · 99.8% uptime",
    "🔒 CIVAC PRO v2.1 · 35+ módulos activos","🏆 #1 Software Ganadero Colombia",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden w-full mb-4 relative"
      style={{ maskImage:"linear-gradient(90deg,transparent 0%,black 6%,black 94%,transparent 100%)" }}>
      <div className="flex gap-8 whitespace-nowrap" style={{ animation:"ticker-run 45s linear infinite" }}>
        {doubled.map((t,i) => (
          <span key={i} className="text-[10px] font-semibold flex-shrink-0" style={{ color:"rgba(0,245,212,0.55)" }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FARM IMAGE WIDGETS — decorative farm panels
═══════════════════════════════════════════════════════════════════════════════ */
function FarmImageWidgets() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(()=>setTick(t=>t+1),2000); return ()=>clearInterval(id); }, []);
  const litros = (84 + Math.sin(tick*0.8)*2.5).toFixed(0);
  const animals = 13;
  return (
    <div className="hidden xl:flex flex-col gap-2.5 w-44 flex-shrink-0">
      {[
        { img:"https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=400&h=260&q=85&auto=format&fit=crop&crop=center",
          label:"🐄 Inventario", sub:`${animals} cabezas · Hato cert.`, c:"#39ff7e", g:"57,255,126",
          stat:`${animals} activos`, statLabel:"bovinos", progress:85 },
        { img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=260&q=85&auto=format&fit=crop",
          label:"🌿 Potrero Norte", sub:"En pastoreo · 4.2 ha", c:"#00f5d4", g:"0,245,212",
          stat:"92%", statLabel:"cobertura", progress:92 },
        { img:"https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=260&q=85&auto=format&fit=crop",
          label:"📡 GPS Real-Time", sub:"13/13 collares online", c:"#00c8ff", g:"0,200,255",
          stat:"99.8%", statLabel:"uptime", progress:99 },
      ].map((w,i) => (
        <div key={i} className="rounded-2xl overflow-hidden relative group transition-all duration-300 hover:scale-[1.04] cursor-default"
          style={{ border:`1.5px solid rgba(${w.g},0.30)`, boxShadow:`0 0 22px rgba(${w.g},0.14), 0 4px 16px rgba(0,0,0,0.5)` }}>
          <img src={w.img} alt={w.label}
            className="w-full h-24 object-cover transition-transform group-hover:scale-110 duration-700"
            style={{ filter:"saturate(1.3) brightness(0.95)" }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
          {/* Rich gradient overlay */}
          <div className="absolute inset-0" style={{ background:`linear-gradient(160deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.72) 70%,rgba(0,0,0,0.92) 100%)` }}/>
          {/* Top neon line */}
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:`linear-gradient(90deg,transparent,${w.c},transparent)` }}/>
          {/* Hover scan overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background:`linear-gradient(135deg,rgba(${w.g},0.08) 0%,transparent 60%)` }}/>
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <div className="text-[10px] font-black leading-tight mb-0.5" style={{ color:w.c, textShadow:`0 0 10px rgba(${w.g},0.7)` }}>{w.label}</div>
            <div className="text-[8px] text-white/45 mb-1.5">{w.sub}</div>
            {/* Progress bar */}
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1 rounded-full" style={{ background:"rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{ width:`${w.progress}%`, background:`linear-gradient(90deg,${w.c},${w.c}cc)`, boxShadow:`0 0 6px rgba(${w.g},0.7)` }}/>
              </div>
              <span className="text-[8px] font-black" style={{ color:w.c }}>{w.stat}</span>
            </div>
          </div>
          {/* Live indicator */}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:w.c, boxShadow:`0 0 6px ${w.c}` }}/>
            <span className="text-[7px] font-black" style={{ color:w.c }}>LIVE</span>
          </div>
        </div>
      ))}
      {/* Service status widget */}
      <div className="rounded-2xl p-3"
        style={{ background:"linear-gradient(145deg,rgba(0,0,0,0.6),rgba(0,10,20,0.8))", border:"1.5px solid rgba(0,245,212,0.20)", backdropFilter:"blur(16px)", boxShadow:"0 0 20px rgba(0,245,212,0.06)" }}>
        <div className="text-[9px] font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color:"rgba(0,245,212,0.65)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:"#39ff7e", display:"inline-block", boxShadow:"0 0 6px #39ff7e" }}/>
          Servicios Online
        </div>
        {[
          { name:"Frontend PWA", ok:true, ms:"12ms" },
          { name:"Analytics API", ok:true, ms:"28ms" },
          { name:"GPS Django",    ok:true, ms:"45ms" },
          { name:"Sync Server",   ok:false, ms:"—" },
        ].map(s => (
          <div key={s.name} className="flex items-center justify-between mb-1.5">
            <span className="text-[8px] text-white/40">{s.name}</span>
            <div className="flex items-center gap-1">
              <span className="text-[7px]" style={{ color:s.ok?"rgba(57,255,126,0.4)":"rgba(255,107,107,0.35)" }}>{s.ms}</span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background:s.ok?"#39ff7e":"#ff6b6b", boxShadow:s.ok?"0 0 5px #39ff7e":"0 0 5px #ff6b6b" }}/>
            </div>
          </div>
        ))}
        <div className="mt-2 pt-2 flex items-center justify-between" style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-[7px] text-white/20">Prod. hoy</span>
          <span className="text-[9px] font-black" style={{ color:"#00f5d4" }}>{litros} L</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   RIGHT SIDE IMAGE WIDGETS
═══════════════════════════════════════════════════════════════════════════════ */
function RightWidgets() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(()=>setTick(t=>t+1),2500); return ()=>clearInterval(id); }, []);
  const utilidad = (40.2 + Math.sin(tick*0.6)*0.4).toFixed(1);
  return (
    <div className="hidden xl:flex flex-col gap-2.5 w-44 flex-shrink-0">
      {[
        { img:"https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?w=400&h=260&q=85&auto=format&fit=crop&crop=center",
          label:"🥛 Producción", sub:"84 L/día · récord mes", c:"#fbbf24", g:"251,191,36",
          stat:"↑3.2%", statLabel:"vs ayer", progress:84 },
        { img:"https://images.unsplash.com/photo-1560693559-aa2f85ef89de?w=400&h=260&q=85&auto=format&fit=crop",
          label:"🧬 Genética IA", sub:"DEP Score 94.2 · Elite", c:"#a855f7", g:"168,85,247",
          stat:"94.2", statLabel:"DEP score", progress:94 },
        { img:"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=260&q=85&auto=format&fit=crop",
          label:"🌱 Huella CO₂", sub:"-18% IPCC 2019 meta", c:"#39ff7e", g:"57,255,126",
          stat:"-18%", statLabel:"emisiones", progress:72 },
      ].map((w,i) => (
        <div key={i} className="rounded-2xl overflow-hidden relative group transition-all duration-300 hover:scale-[1.04] cursor-default"
          style={{ border:`1.5px solid rgba(${w.g},0.30)`, boxShadow:`0 0 22px rgba(${w.g},0.14), 0 4px 16px rgba(0,0,0,0.5)` }}>
          <img src={w.img} alt={w.label}
            className="w-full h-24 object-cover transition-transform group-hover:scale-110 duration-700"
            style={{ filter:"saturate(1.3) brightness(0.95)" }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
          <div className="absolute inset-0" style={{ background:`linear-gradient(160deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.72) 70%,rgba(0,0,0,0.92) 100%)` }}/>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:`linear-gradient(90deg,transparent,${w.c},transparent)` }}/>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background:`linear-gradient(135deg,rgba(${w.g},0.08) 0%,transparent 60%)` }}/>
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <div className="text-[10px] font-black leading-tight mb-0.5" style={{ color:w.c, textShadow:`0 0 10px rgba(${w.g},0.7)` }}>{w.label}</div>
            <div className="text-[8px] text-white/45 mb-1.5">{w.sub}</div>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1 rounded-full" style={{ background:"rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{ width:`${w.progress}%`, background:`linear-gradient(90deg,${w.c},${w.c}cc)`, boxShadow:`0 0 6px rgba(${w.g},0.7)` }}/>
              </div>
              <span className="text-[8px] font-black" style={{ color:w.c }}>{w.stat}</span>
            </div>
          </div>
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:w.c, boxShadow:`0 0 6px ${w.c}` }}/>
            <span className="text-[7px] font-black" style={{ color:w.c }}>LIVE</span>
          </div>
        </div>
      ))}
      {/* AI Module widget */}
      <div className="rounded-2xl p-3"
        style={{ background:"linear-gradient(145deg,rgba(5,0,20,0.75),rgba(20,5,40,0.85))", border:"1.5px solid rgba(168,85,247,0.28)", backdropFilter:"blur(16px)", boxShadow:"0 0 24px rgba(168,85,247,0.09)" }}>
        <div className="text-[9px] font-black uppercase tracking-wider mb-2.5" style={{ color:"rgba(168,85,247,0.7)" }}>
          🤖 Módulos IA · v2.1
        </div>
        {[
          { name:"Productivos", val:"20", c:"#00f5d4", pct:100 },
          { name:"Sanidad",     val:"1",  c:"#39ff7e", pct:100 },
          { name:"Trazabilidad",val:"1",  c:"#a855f7", pct:100 },
          { name:"Total activos",val:"22",c:"#fbbf24", pct:69 },
        ].map(m => (
          <div key={m.name} className="mb-2">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[8px] text-white/40">{m.name}</span>
              <span className="text-[9px] font-black" style={{ color:m.c }}>{m.val}</span>
            </div>
            <div className="h-0.5 rounded-full" style={{ background:"rgba(255,255,255,0.05)" }}>
              <div style={{ width:`${m.pct}%`, height:"100%", background:m.c, borderRadius:"9999px", boxShadow:`0 0 4px ${m.c}` }}/>
            </div>
          </div>
        ))}
        <div className="mt-2 pt-2 flex items-center justify-between" style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-[7px] text-white/25">Utilidad mes</span>
          <span className="text-[9px] font-black" style={{ color:"#39ff7e" }}>${utilidad}M</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LOGO
═══════════════════════════════════════════════════════════════════════════════ */
function CivacLogo({ size = 80 }: { size?: number }) {
  return (
    <div className="relative inline-block" style={{ width:size*1.6, height:size*1.6 }}>
      {/* Outer pulse ring 1 */}
      <div className="absolute inset-0 rounded-full" style={{ border:"1px solid rgba(0,245,212,0.18)", animation:"ring-pulse 3s ease-in-out infinite", borderRadius:"28%" }}/>
      {/* Outer pulse ring 2 */}
      <div className="absolute" style={{ inset:`-${size*0.12}px`, border:"1px solid rgba(0,200,255,0.12)", borderRadius:"28%", animation:"ring-pulse 3s ease-in-out infinite 1s" }}/>
      {/* Outer pulse ring 3 */}
      <div className="absolute" style={{ inset:`-${size*0.22}px`, border:"1px solid rgba(168,85,247,0.08)", borderRadius:"28%", animation:"ring-pulse 3s ease-in-out infinite 2s" }}/>
      {/* Main image container — centered in the bigger outer box */}
      <div className="absolute" style={{ inset:`${size*0.3}px`, borderRadius:"26%", overflow:"hidden",
        border:"2.5px solid rgba(0,245,212,0.90)",
        boxShadow:"0 0 40px rgba(0,245,212,0.70), 0 0 90px rgba(0,200,255,0.32), 0 0 140px rgba(0,245,212,0.14), inset 0 0 24px rgba(0,245,212,0.10)" }}>
        <img src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=320&h=320&q=90&auto=format&fit=crop&crop=center"
          alt="GanaderIA" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"saturate(1.2) brightness(1.05)" }}
          onError={e => {
            const el = e.currentTarget.parentElement as HTMLElement;
            el.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2.5rem;background:linear-gradient(135deg,#061a10,#0a2a18)">🐄</div>';
          }} />
        {/* Shimmer overlay */}
        <div className="absolute inset-0" style={{ background:"linear-gradient(135deg,rgba(0,245,212,0.10) 0%,transparent 50%,rgba(0,200,255,0.06) 100%)" }}/>
      </div>
      {/* IA badge */}
      <div className="absolute flex items-center justify-center font-black"
        style={{
          right:`${size*0.24}px`, bottom:`${size*0.24}px`,
          width:size*0.36, height:size*0.36,
          background:"linear-gradient(135deg,#00f5d4,#00c8ff)",
          fontSize:size*0.115, color:"#000",
          border:"2.5px solid #070e1c",
          borderRadius:"50%",
          boxShadow:"0 0 20px rgba(0,245,212,1.0), 0 0 40px rgba(0,245,212,0.5)",
          letterSpacing:"-0.02em",
        }}>
        IA
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PLAN BADGE
═══════════════════════════════════════════════════════════════════════════════ */
function PlanBadge({ plan, size = "md" }: { plan?: PlanId; size?: "sm" | "md" | "lg" }) {
  const p = plan ?? "basico";
  const sizes = { sm:"text-[9px] px-1.5 py-0.5", md:"text-xs px-2.5 py-1", lg:"text-sm px-3 py-1.5" };
  const c1 = PLAN_COLOR[p], c2 = PLAN_COLOR2[p], g = PLAN_GLOW[p];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-black uppercase tracking-wide relative overflow-hidden ${sizes[size]}`}
      style={{ background:`rgba(${g},0.14)`, border:`1.5px solid rgba(${g},0.45)`, color:c1, boxShadow:`0 0 10px rgba(${g},0.2)` }}>
      <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
        style={{ background:`linear-gradient(135deg,rgba(${g},0.15),transparent)` }} />
      {PLAN_ICON[p]}{" "}
      <span style={{ background:`linear-gradient(90deg,${c1},${c2})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{PLAN_LABEL[p]}</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PAYMENT MODAL
═══════════════════════════════════════════════════════════════════════════════ */
function PaymentModal({ plan, onClose }: { plan: PlanId; onClose: () => void }) {
  const [method, setMethod] = useState<"nequi"|"pse"|"tarjeta"|"bancolombia"|null>(null);
  const [copied, setCopied] = useState(false);
  const ref = `CIVAC-${plan.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const precio = PLAN_PRECIOS[plan];
  const fg = PLAN_COLORS_GRADIENT[plan];
  const copyRef = () => { navigator.clipboard?.writeText(ref); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const WOMPI_KEY = "pub_test_civac_demo_key";
  const wompiUrl = `https://checkout.wompi.co/p/?public-key=${WOMPI_KEY}&currency=COP&amount-in-cents=${precio * 100}&reference=${ref}&redirect-url=${encodeURIComponent(window.location.href)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.88)", backdropFilter:"blur(10px)" }}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background:"linear-gradient(145deg,#040d1a,#071325)", border:"1px solid rgba(0,245,212,0.2)", boxShadow:"0 0 80px rgba(0,245,212,0.10), 0 40px 80px rgba(0,0,0,0.6)" }}>
        <div className="h-1 w-full" style={{ background:`linear-gradient(90deg,${fg[0]},${fg[1]})` }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black text-white">Adquirir <span style={{ color:fg[0] }}>{PLAN_LABEL[plan]}</span></h2>
              <p className="text-xs text-white/40 mt-0.5">{PLAN_PRECIOS_LABEL[plan]} · COP · IVA incluido</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"><X size={16} className="text-white/60" /></button>
          </div>
          <div className="rounded-2xl p-3 mb-5 flex items-center justify-between gap-3" style={{ background:"rgba(0,245,212,0.05)", border:"1px solid rgba(0,245,212,0.15)" }}>
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Referencia de pago</div>
              <div className="font-mono text-sm font-bold text-white">{ref}</div>
            </div>
            <button onClick={copyRef} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl transition-colors"
              style={{ background:"rgba(0,245,212,0.1)", border:"1px solid rgba(0,245,212,0.2)", color:copied?"#39ff7e":"#00f5d4" }}>
              {copied ? <CheckCircle2 size={12}/> : <Copy size={12}/>}{copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-3">Selecciona método de pago</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              { id:"tarjeta"    as const, icon:"💳", label:"Tarjeta",     sub:"Débito / Crédito",  col:"#00f5d4" },
              { id:"nequi"      as const, icon:"📱", label:"Nequi",       sub:"Pago inmediato",    col:"#c084fc" },
              { id:"pse"        as const, icon:"🏦", label:"PSE",         sub:"Débito bancario",   col:"#60a5fa" },
              { id:"bancolombia"as const, icon:"🟡", label:"Bancolombia", sub:"Botón de pago",     col:"#fbbf24" },
            ].map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className="p-3 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background:method===m.id?`${m.col}15`:"rgba(255,255,255,0.03)", border:`1.5px solid ${method===m.id?`${m.col}55`:"rgba(255,255,255,0.07)"}` }}>
                <div className="text-xl mb-1">{m.icon}</div>
                <div className="text-xs font-bold text-white">{m.label}</div>
                <div className="text-[10px] text-white/40">{m.sub}</div>
              </button>
            ))}
          </div>
          {method === "nequi" && (
            <div className="rounded-2xl p-4 mb-4" style={{ background:"rgba(192,132,252,0.08)", border:"1px solid rgba(192,132,252,0.2)" }}>
              <p className="text-xs font-bold text-purple-300 mb-2">Pago con Nequi</p>
              <p className="text-xs text-white/60 mb-1">1. Abre Nequi → Pagar → Escanear QR o número</p>
              <p className="text-xs text-white/60 mb-1">2. Número: <span className="font-mono font-bold text-purple-300">3XX XXX XXXX</span></p>
              <p className="text-xs text-white/60 mb-2">3. Monto: <span className="font-bold text-white">${precio.toLocaleString("es-CO")} COP</span></p>
              <p className="text-[10px] text-white/30">Referencia: {ref} · Activa en máx 24h</p>
            </div>
          )}
          {method === "pse" && (
            <div className="rounded-2xl p-4 mb-4" style={{ background:"rgba(96,165,250,0.08)", border:"1px solid rgba(96,165,250,0.2)" }}>
              <p className="text-xs font-bold text-blue-300 mb-2">Pago PSE — Débito bancario</p>
              <p className="text-xs text-white/60 mb-1">Banco destino: <span className="font-bold text-white">Bancolombia</span></p>
              <p className="text-xs text-white/60 mb-1">Cuenta: <span className="font-mono font-bold text-blue-300">XXX-XXXXXXXX</span></p>
              <p className="text-xs text-white/60 mb-2">Monto exacto: <span className="font-bold text-white">${precio.toLocaleString("es-CO")} COP</span></p>
              <p className="text-[10px] text-white/30">Referencia obligatoria: {ref}</p>
            </div>
          )}
          {method === "bancolombia" && (
            <div className="rounded-2xl p-4 mb-4" style={{ background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.25)" }}>
              <p className="text-xs font-bold text-yellow-300 mb-2">Botón Bancolombia</p>
              <p className="text-xs text-white/60 mb-3">Monto: <span className="font-bold text-white">${precio.toLocaleString("es-CO")} COP</span></p>
              <a href={`https://www.bancolombia.com/empresas/pagos-en-linea?ref=${ref}&amount=${precio}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-black text-sm transition-all hover:opacity-90"
                style={{ background:"linear-gradient(135deg,#fbbf24,#ea580c)", color:"black" }}>
                <ExternalLink size={14}/> Ir a Bancolombia →
              </a>
            </div>
          )}
          {method === "tarjeta" && (
            <div className="rounded-2xl p-4 mb-4" style={{ background:"rgba(0,245,212,0.06)", border:"1px solid rgba(0,245,212,0.2)" }}>
              <p className="text-xs font-bold text-teal-300 mb-2">Pago seguro con Wompi · Bancolombia</p>
              <p className="text-xs text-white/60 mb-3">Visa · Mastercard · Amex · Débito</p>
              <a href={wompiUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-black text-sm transition-all hover:opacity-90"
                style={{ background:"linear-gradient(135deg,#00f5d4,#00a896)", color:"black" }}>
                <CreditCard size={14}/> Pagar con Wompi →
              </a>
              <p className="text-[10px] text-white/25 text-center mt-2">256-bit SSL · PCI DSS · Bancolombia</p>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-sm font-bold transition-colors hover:bg-white/10"
              style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)" }}>Cancelar</button>
            {method && (
              <button onClick={() => { alert(`Pago iniciado. Referencia: ${ref}. Recibirás acceso por correo en 24h.`); onClose(); }}
                className="flex-1 py-3 rounded-2xl text-sm font-black transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background:`linear-gradient(135deg,${fg[0]},${fg[1]})`, color:"black" }}>
                Confirmar pago
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   BOTTOM PWA NAV — mobile navigation bar
═══════════════════════════════════════════════════════════════════════════════ */
function BottomPWANav({ tab, setTab }: { tab: string; setTab: (t: "login"|"registro"|"cuentas"|"planes"|"ia") => void }) {
  const items: { id:"login"|"registro"|"cuentas"|"planes"|"ia"; emoji:string; label:string; c:string; g:string }[] = [
    { id:"login",    emoji:"🔐", label:"Sesión",   c:"#00f5d4", g:"0,245,212"   },
    { id:"cuentas",  emoji:"👥", label:"Cuentas",  c:"#39ff7e", g:"57,255,126"  },
    { id:"planes",   emoji:"💳", label:"Planes",   c:"#fbbf24", g:"251,191,36"  },
    { id:"ia",       emoji:"🤖", label:"IA",       c:"#e879f9", g:"232,121,249" },
    { id:"registro", emoji:"✨", label:"Registro",  c:"#a855f7", g:"168,85,247"  },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden"
      style={{
        background:"linear-gradient(180deg,rgba(2,6,18,0.0) 0%,rgba(2,6,18,0.97) 20%)",
        backdropFilter:"blur(20px)",
        borderTop:"1px solid rgba(0,245,212,0.15)",
        boxShadow:"0 -4px 40px rgba(0,0,0,0.7), 0 -1px 0 rgba(0,245,212,0.08)",
        paddingBottom:"env(safe-area-inset-bottom,0px)",
      }}>
      <div className="flex items-center justify-around px-1 pt-2 pb-2">
        {items.map(item => {
          const active = tab === item.id;
          return (
            <button key={item.id} onClick={() => setTab(item.id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-200 min-w-[52px] relative"
              style={{
                background: active ? `rgba(${item.g},0.12)` : "transparent",
                border: active ? `1px solid rgba(${item.g},0.35)` : "1px solid transparent",
                boxShadow: active ? `0 0 18px rgba(${item.g},0.22)` : "none",
              }}>
              {active && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background:item.c, boxShadow:`0 0 8px ${item.c}` }}/>
              )}
              <span className="text-xl leading-none" style={{
                filter: active ? `drop-shadow(0 0 8px rgba(${item.g},0.9))` : "none",
                transform: active ? "scale(1.15)" : "scale(1)",
                transition:"all 0.2s",
              }}>{item.emoji}</span>
              <span className="text-[9px] font-black leading-none" style={{
                color: active ? item.c : "rgba(255,255,255,0.32)",
                textShadow: active ? `0 0 10px rgba(${item.g},0.7)` : "none",
              }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   IA MODULE TAB — showcase of AI features
═══════════════════════════════════════════════════════════════════════════════ */
function IaModuleTab() {
  const features = [
    { emoji:"🔮", title:"Predicción de Producción", desc:"IA predice litros/día por animal con 96% precisión basado en históricos, clima y nutrición.", c:"#e879f9", g:"232,121,249" },
    { emoji:"🧬", title:"Genética Predictiva DEP", desc:"Calcula índices de mérito genético y recomienda cruces para máximo rendimiento lechero.", c:"#a855f7", g:"168,85,247" },
    { emoji:"🩺", title:"Diagnóstico Sanitario IA", desc:"Detecta signos tempranos de enfermedad por variación de temperatura y producción.", c:"#39ff7e", g:"57,255,126" },
    { emoji:"💰", title:"Optimización de Costos", desc:"Modela escenarios de alimentación vs producción para maximizar rentabilidad COP/L.", c:"#fbbf24", g:"251,191,36" },
    { emoji:"📡", title:"GPS + Comportamiento Animal", desc:"Análisis de movimiento GPS para detectar celo, estrés y problemas sanitarios.", c:"#00c8ff", g:"0,200,255" },
    { emoji:"🌱", title:"Huella de Carbono IPCC", desc:"Calcula y monitorea la huella CO₂ del hato según estándares IPCC 2019.", c:"#00f5d4", g:"0,245,212" },
  ];
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl mb-3"
          style={{ background:"linear-gradient(135deg,rgba(232,121,249,0.10),rgba(168,85,247,0.07))", border:"1.5px solid rgba(232,121,249,0.30)", boxShadow:"0 0 30px rgba(232,121,249,0.12)" }}>
          <span className="text-2xl" style={{ filter:"drop-shadow(0 0 12px rgba(232,121,249,0.9))" }}>🤖</span>
          <div className="text-left">
            <div className="text-sm font-black text-white">Asesora IA GanaderIA Colombia</div>
            <div className="text-[10px]" style={{ color:"rgba(232,121,249,0.65)" }}>GPT especializado en ganadería · 6 módulos activos</div>
          </div>
          <span className="text-[8px] font-black px-2 py-1 rounded-full"
            style={{ background:"rgba(57,255,126,0.12)", border:"1px solid rgba(57,255,126,0.35)", color:"#39ff7e" }}>
            ● EN VIVO
          </span>
        </div>
        <p className="text-[11px] max-w-lg mx-auto" style={{ color:"rgba(255,255,255,0.35)" }}>
          Inteligencia Artificial entrenada con datos de ganadería colombiana · Razas Cebú, Holstein, Gyr, Brahman · Clima tropical andino
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
        {features.map((f,i) => (
          <div key={i} className="relative rounded-2xl p-4 group cursor-default transition-all duration-300 hover:scale-[1.03]"
            style={{ background:`linear-gradient(145deg,rgba(${f.g},0.07),rgba(${f.g},0.03))`, border:`1.5px solid rgba(${f.g},0.25)`, boxShadow:`0 0 20px rgba(${f.g},0.07)` }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow=`0 0 35px rgba(${f.g},0.28)`; (e.currentTarget as HTMLElement).style.borderColor=`rgba(${f.g},0.55)`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow=`0 0 20px rgba(${f.g},0.07)`; (e.currentTarget as HTMLElement).style.borderColor=`rgba(${f.g},0.25)`; }}>
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background:`linear-gradient(90deg,transparent,${f.c},transparent)` }}/>
            <div className="text-3xl mb-2.5" style={{ filter:`drop-shadow(0 0 10px rgba(${f.g},0.7))` }}>{f.emoji}</div>
            <h3 className="text-xs font-black mb-1.5" style={{ color:f.c }}>{f.title}</h3>
            <p className="text-[10px] leading-relaxed" style={{ color:"rgba(255,255,255,0.40)" }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-black"
          style={{ background:"linear-gradient(135deg,rgba(232,121,249,0.10),rgba(168,85,247,0.08))", border:"1.5px solid rgba(232,121,249,0.30)", color:"rgba(232,121,249,0.7)" }}>
          🤖 Disponible en planes PRO, Premium y Platino · <span style={{ color:"#fbbf24" }}>Plan PRO desde $89.000/mes</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   GOOGLE SIGN-IN — server-side redirect flow
═══════════════════════════════════════════════════════════════════════════════ */
function GoogleSignInButton({ onError }: { onError?: (msg: string) => void }) {
  const [checking, setChecking] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/google/status")
      .then(r => r.json() as Promise<{ configured: boolean }>)
      .then(d => setConfigured(d.configured))
      .catch(() => setConfigured(false));
  }, []);

  if (configured === false) return null;
  void onError;

  const handleClick = () => {
    setChecking(true);
    window.location.href = "/api/auth/google";
  };

  return (
    <div>
      <button onClick={handleClick} disabled={checking || configured === null}
        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"white" }}>
        {checking
          ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
          : <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
        }
        {checking ? "Redirigiendo a Google…" : configured === null ? "Verificando…" : "Continuar con Google"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN LOGIN COMPONENT
═══════════════════════════════════════════════════════════════════════════════ */
export default function Login() {
  const { login, loginAs, accounts } = useAuth();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [loadingId, setLoadingId] = useState<string|null>(null);
  const [tab, setTab]             = useState<"login"|"cuentas"|"planes"|"registro"|"ia">("login");
  const [entered, setEntered]     = useState(false);
  const [payPlan, setPayPlan]     = useState<PlanId|null>(null);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string|null>(null);
  const [inviteBanner, setInviteBanner] = useState<{nombre:string;plan:string}|null>(null);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<{nombre:string;email:string;googleFoto?:string}|null>(null);

  /* ── Registro nuevo usuario ── */
  const [regNombre,   setRegNombre]   = useState("");
  const [regEmail,    setRegEmail]    = useState("");
  const [regPass,     setRegPass]     = useState("");
  const [regConfirm,  setRegConfirm]  = useState("");
  const [regFinca,    setRegFinca]    = useState("");
  const [regCargo,    setRegCargo]    = useState("");
  const [regLoading,  setRegLoading]  = useState(false);
  const [regError,    setRegError]    = useState("");
  const [regOk,       setRegOk]       = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);

  useEffect(() => { const t = setTimeout(() => setEntered(true), 80); return () => clearTimeout(t); }, []);

  /* ── Handle Google OAuth callback: ?civac_token= or ?google_error= ── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("civac_token");
    const gError = params.get("google_error");

    if (token || gError) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (gError) {
      const msgs: Record<string,string> = {
        cancelled:       "Inicio con Google cancelado.",
        no_config:       "Google OAuth no está configurado. Contacta al administrador.",
        token_failed:    "Error al verificar con Google. Intenta de nuevo.",
        blocked:         "Tu cuenta ha sido bloqueada. Contacta al administrador.",
        userinfo_failed: "No se pudo obtener información de tu cuenta Google.",
        server_error:    "Error interno del servidor. Intenta más tarde.",
      };
      setError(msgs[gError] ?? "Error con Google. Intenta de nuevo.");
      return;
    }

    if (!token) return;

    setLoading(true);
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json() as Promise<{id:string;nombre:string;email:string;role:string;cargo:string;finca:string;planCode:string;estado:string;googleFoto?:string}>)
      .then(u => {
        if (u.estado === "pendiente") {
          setPendingGoogleUser({ nombre: u.nombre, email: u.email, googleFoto: u.googleFoto });
          setLoading(false);
          return;
        }
        if (u.estado === "bloqueado") {
          setError("Tu cuenta está bloqueada. Contacta al administrador CIVAC.");
          setLoading(false);
          return;
        }
        localStorage.setItem("civac_server_token", token);
        loginAs({
          id: u.id, nombre: u.nombre, email: u.email, password: "",
          role: u.role as Account["role"], cargo: u.cargo, finca: u.finca,
          avatar: "🙂", gradient: "from-[#4a148c] to-[#6a1b9a]",
          plan: (u.planCode ?? "basico") as PlanId,
          permisos: ["inventario","produccion","alertas","dashboard"],
          activo: true,
        });
      })
      .catch(() => {
        setError("Error verificando sesión de Google. Intenta de nuevo.");
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Detect pending invite from /invite/:token ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("civac_pending_invite");
      if (!raw) return;
      const inv = JSON.parse(raw) as { email:string; password:string; plan:string; nombre:string; finca:string };
      localStorage.removeItem("civac_pending_invite");
      setEmail(inv.email);
      setPassword(inv.password);
      setInviteBanner({ nombre: inv.nombre, plan: inv.plan });
      const tid = setTimeout(() => {
        if (login(inv.email, inv.password)) return;
      }, 1500);
      return () => clearTimeout(tid);
    } catch { return; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ROLE_ORDER: Record<string,number> = { superadmin:0, admin:1, developer:2, sales:3, vet:4, field:5, viewer:6 };
  const clientAccounts = [...accounts].sort((a,b) => (ROLE_ORDER[a.role]??9) - (ROLE_ORDER[b.role]??9));

  const handleQuick = (a: Account) => {
    setLoadingId(a.id); setLoading(true);
    setTimeout(() => { loginAs(a); setLoading(false); }, 420);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    setTimeout(() => {
      if (!login(email, password)) setError("Credenciales incorrectas. Verifique email y contraseña.");
      setLoading(false);
    }, 600);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(""); setRegOk(false);
    if (!regNombre.trim()) { setRegError("El nombre es requerido."); return; }
    if (!regEmail.trim())  { setRegError("El correo es requerido."); return; }
    if (regPass.length < 6) { setRegError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (regPass !== regConfirm) { setRegError("Las contraseñas no coinciden."); return; }
    setRegLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: regNombre.trim(), email: regEmail.trim(), password: regPass, finca: regFinca.trim(), cargo: regCargo.trim() }),
      });
      const d = await r.json() as { ok: boolean; error?: string; message?: string };
      if (d.ok) {
        setRegOk(true);
        setRegNombre(""); setRegEmail(""); setRegPass(""); setRegConfirm(""); setRegFinca(""); setRegCargo("");
      } else {
        setRegError(d.error ?? "Error al registrarse. Intenta de nuevo.");
      }
    } catch {
      setRegError("Sin conexión con el servidor. Intenta de nuevo.");
    }
    setRegLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ fontFamily:"'Space Grotesk','Sora',sans-serif" }}>

      <FarmBackground />
      <Particles />

      {payPlan && <PaymentModal plan={payPlan} onClose={() => setPayPlan(null)} />}

      {/* ── Pending Google account screen ── */}
      {pendingGoogleUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background:"rgba(0,0,0,0.96)", backdropFilter:"blur(14px)" }}>
          <FarmBackground />
          <div className="relative z-10 w-full max-w-md">
            <div className="rounded-3xl overflow-hidden"
              style={{ background:"linear-gradient(145deg,#040d1a,#071325)", border:"1px solid rgba(251,191,36,0.25)", boxShadow:"0 0 80px rgba(251,191,36,0.08)" }}>
              <div className="h-1" style={{ background:"linear-gradient(90deg,#fbbf24,#f59e0b,transparent)" }}/>
              <div className="p-7 text-center">
                {/* Avatar */}
                <div className="flex justify-center mb-5">
                  {pendingGoogleUser.googleFoto
                    ? <img src={pendingGoogleUser.googleFoto} alt={pendingGoogleUser.nombre}
                        className="w-20 h-20 rounded-2xl object-cover"
                        style={{ border:"2.5px solid rgba(251,191,36,0.5)", boxShadow:"0 0 30px rgba(251,191,36,0.2)" }}/>
                    : <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black"
                        style={{ background:"rgba(251,191,36,0.1)", border:"2px solid rgba(251,191,36,0.3)" }}>
                        {pendingGoogleUser.nombre[0]?.toUpperCase()}
                      </div>
                  }
                </div>

                {/* Hourglass animated icon */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.25)" }}>
                  <Clock size={22} style={{ color:"#fbbf24" }}/>
                </div>

                <h2 className="text-xl font-black text-white mb-2">Cuenta en Revisión</h2>
                <p className="text-sm font-bold mb-1" style={{ color:"#fbbf24" }}>
                  ¡Hola, {pendingGoogleUser.nombre.split(" ")[0]}!
                </p>
                <p className="text-xs text-white/45 leading-relaxed mb-5">
                  Tu cuenta Google <strong className="text-white/70">{pendingGoogleUser.email}</strong> fue registrada exitosamente con <strong className="text-teal-400">Plan Básico</strong>. Un administrador CIVAC la activará en breve.
                </p>

                {/* Steps */}
                <div className="text-left space-y-2.5 mb-6 p-4 rounded-2xl" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                  {[
                    { n:"1", txt:"Cuenta registrada con Google", done:true },
                    { n:"2", txt:"Revisión por administrador CIVAC", done:false },
                    { n:"3", txt:"Activación y acceso completo", done:false },
                  ].map(s => (
                    <div key={s.n} className="flex items-center gap-3 text-xs">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-black text-[10px]"
                        style={{ background: s.done ? "rgba(57,255,126,0.15)" : "rgba(255,255,255,0.06)", border:`1px solid ${s.done ? "rgba(57,255,126,0.4)" : "rgba(255,255,255,0.1)"}`, color: s.done ? "#39ff7e" : "rgba(255,255,255,0.3)" }}>
                        {s.done ? "✓" : s.n}
                      </div>
                      <span style={{ color: s.done ? "#39ff7e" : "rgba(255,255,255,0.4)" }}>{s.txt}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-white/25 mb-5">Recibirás acceso una vez el administrador active tu cuenta. Mientras tanto puedes explorar la plataforma.</p>

                <button onClick={() => setPendingGoogleUser(null)}
                  className="w-full py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-80"
                  style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.25)", color:"#fbbf24" }}>
                  Volver al inicio de sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Invite welcome banner ── */}
      {inviteBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl flex items-center gap-3 pointer-events-none"
          style={{
            background:"linear-gradient(135deg,#002a1e,#003d2e)",
            border:"1px solid rgba(0,245,212,0.4)",
            backdropFilter:"blur(16px)",
            boxShadow:"0 0 50px rgba(0,245,212,0.25), 0 8px 32px rgba(0,0,0,0.5)",
            animation:"slide-down 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
            style={{background:"rgba(0,245,212,0.12)",border:"1px solid rgba(0,245,212,0.25)"}}>🎉</div>
          <div>
            <p className="text-xs font-black text-white whitespace-nowrap">¡Bienvenido, {inviteBanner.nombre.split(" ")[0]}!</p>
            <p className="text-[9px] whitespace-nowrap" style={{color:"rgba(0,245,212,0.65)"}}>
              Plan <strong className="text-white capitalize">{inviteBanner.plan}</strong> asignado · Iniciando sesión…
            </p>
          </div>
          <div className="w-4 h-4 rounded-full border-2 flex-shrink-0"
            style={{borderColor:"rgba(0,245,212,0.3)",borderTopColor:"#00f5d4",animation:"spin 0.8s linear infinite"}}/>
        </div>
      )}


      {/* Main container */}
      <div className={`relative z-10 w-full max-w-6xl px-4 py-6 pb-28 sm:pb-6 transition-all duration-700 ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {/* ── Colombian ticker ── */}
        <ColombianTicker />

        {/* ── Hero header ── */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-4"
            style={{ filter:"drop-shadow(0 0 32px rgba(0,245,212,0.50)) drop-shadow(0 0 70px rgba(0,200,255,0.22))", animation:"logo-pulse 3s ease-in-out infinite" }}>
            <CivacLogo size={88} />
          </div>

          {/* Title */}
          <div className="flex items-center justify-center gap-3 mb-1">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ fontFamily:"'Sora',sans-serif", letterSpacing:"-0.03em" }}>
              <span className="text-white">CIVAC </span>
              <span style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", filter:"drop-shadow(0 0 12px rgba(0,245,212,0.5))" }}>v1</span>
            </h1>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-lg leading-none"
                style={{ background:"linear-gradient(135deg,#00f5d4,#00a896)", color:"black", letterSpacing:"0.05em", boxShadow:"0 0 14px rgba(0,245,212,0.45)" }}>GanaderIA</span>
              <span className="text-[8px] font-black px-2 py-0.5 rounded-md leading-none"
                style={{ background:"linear-gradient(135deg,#fbbf24,#ea580c)", color:"white", letterSpacing:"0.03em" }}>PRO Colombia</span>
              <span className="text-[8px] font-black px-2 py-0.5 rounded-md leading-none ml-1"
                style={{ background:"linear-gradient(135deg,#00f5d4,#0891b2)", color:"#000", letterSpacing:"0.05em" }}>v2.1</span>
            </div>
          </div>

          <p className="text-sm font-semibold mb-3" style={{ color:"rgba(0,245,212,0.7)" }}>
            Control Inteligente de Valor Agropecuario · Colombia 🇨🇴
          </p>

          {/* Feature badges — animated glow pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            {[
              { icon:<Wifi size={13}/>,       label:"Offline PWA",    sub:"Service Worker v10", c:"0,245,212",   ac:"#00f5d4" },
              { icon:<Zap size={13}/>,        label:"Serial · BT",    sub:"8 drivers COM · 11 BLE", c:"255,149,0", ac:"#ff9a3c" },
              { icon:<Smartphone size={13}/>, label:"GPS Real-Time",  sub:"13 collares CIVAC",c:"0,200,255",   ac:"#00c8ff" },
              { icon:<Star size={13}/>,       label:"IA Predictiva",  sub:"Asesora ganadero", c:"232,121,249", ac:"#e879f9" },
              { icon:<Globe size={13}/>,      label:"35+ Módulos",    sub:"CRUD completo",    c:"57,255,126",  ac:"#39ff7e" },
              { icon:<Cpu size={13}/>,        label:"IndexedDB v2",   sub:"100k registros",   c:"168,85,247",  ac:"#a855f7" },
            ].map((p, i) => (
              <span key={p.label}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[11px] font-bold transition-all duration-300 hover:scale-[1.08] cursor-default select-none"
                style={{
                  background:`linear-gradient(135deg,rgba(${p.c},0.13),rgba(${p.c},0.06))`,
                  border:`1.5px solid rgba(${p.c},0.38)`,
                  color:p.ac,
                  boxShadow:`0 0 14px rgba(${p.c},0.18), inset 0 1px 0 rgba(255,255,255,0.06)`,
                  animationDelay:`${i * 0.12}s`,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = `0 0 28px rgba(${p.c},0.55), 0 4px 16px rgba(0,0,0,0.35)`;
                  el.style.background = `linear-gradient(135deg,rgba(${p.c},0.22),rgba(${p.c},0.12))`;
                  el.style.borderColor = `rgba(${p.c},0.7)`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = `0 0 14px rgba(${p.c},0.18), inset 0 1px 0 rgba(255,255,255,0.06)`;
                  el.style.background = `linear-gradient(135deg,rgba(${p.c},0.13),rgba(${p.c},0.06))`;
                  el.style.borderColor = `rgba(${p.c},0.38)`;
                }}>
                <span style={{ filter:`drop-shadow(0 0 5px ${p.ac})` }}>{p.icon}</span>
                <span>{p.label}</span>
              </span>
            ))}
          </div>

          {/* Tabs — 5 botones con identidad de color propia */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { id:"login"    as const, label:"Iniciar Sesión",  emoji:"🔐", c1:"#00f5d4", c2:"#00a896", g:"0,245,212"   },
              { id:"registro" as const, label:"Registrarse",     emoji:"✨", c1:"#a855f7", c2:"#7c3aed", g:"168,85,247"  },
              { id:"cuentas"  as const, label:"Cuentas Demo",    emoji:"👥", c1:"#39ff7e", c2:"#16a34a", g:"57,255,126"  },
              { id:"planes"   as const, label:"Planes",          emoji:"💳", c1:"#fbbf24", c2:"#ea580c", g:"251,191,36"  },
              { id:"ia"       as const, label:"Módulo IA",       emoji:"🤖", c1:"#e879f9", c2:"#a855f7", g:"232,121,249" },
            ].map(t => {
              const isActive = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="relative flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] sm:text-sm font-black transition-all duration-300 hover:scale-[1.05] active:scale-[0.97] overflow-hidden"
                  style={isActive
                    ? {
                        background:`linear-gradient(135deg,${t.c1},${t.c2})`,
                        color:"#000",
                        boxShadow:`0 0 32px rgba(${t.g},0.65), 0 6px 20px rgba(0,0,0,0.4)`,
                        border:`2px solid rgba(${t.g},0.8)`,
                        transform:"scale(1.06)",
                      }
                    : {
                        background:`rgba(${t.g},0.07)`,
                        color:`rgba(${t.g},0.75)`,
                        border:`1.5px solid rgba(${t.g},0.25)`,
                        boxShadow:`0 0 10px rgba(${t.g},0.08)`,
                      }
                  }
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = `rgba(${t.g},0.14)`;
                      (e.currentTarget as HTMLElement).style.borderColor = `rgba(${t.g},0.45)`;
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 18px rgba(${t.g},0.25)`;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = `rgba(${t.g},0.07)`;
                      (e.currentTarget as HTMLElement).style.borderColor = `rgba(${t.g},0.25)`;
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 10px rgba(${t.g},0.08)`;
                    }
                  }}>
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background:`linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 60%)` }} />
                  )}
                  <span style={{ filter: isActive ? `drop-shadow(0 0 6px rgba(0,0,0,0.4))` : `drop-shadow(0 0 4px rgba(${t.g},0.5))` }}>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            TAB: LOGIN (principal)
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === "login" && (
          <div className="flex gap-5 items-start justify-center">

            {/* Left decorative widgets */}
            <FarmImageWidgets />

            {/* Center — main login card */}
            <div className="w-full max-w-md">
              <div className="rounded-3xl overflow-hidden"
                style={{
                  background:"linear-gradient(145deg,rgba(4,13,26,0.98),rgba(7,20,38,0.96))",
                  border:"1px solid rgba(0,245,212,0.22)",
                  boxShadow:"0 0 70px rgba(0,245,212,0.10), 0 30px 70px rgba(0,0,0,0.6)",
                  backdropFilter:"blur(28px)",
                }}>
                <div className="h-1" style={{ background:"linear-gradient(90deg,#00f5d4,#00c8ff,rgba(168,85,247,0.6),transparent)" }}/>
                <div className="p-7 sm:p-8">

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background:"rgba(0,245,212,0.10)", border:"1px solid rgba(0,245,212,0.28)", boxShadow:"0 0 20px rgba(0,245,212,0.18)" }}>
                      <Lock className="w-5 h-5" style={{ color:"#00f5d4" }}/>
                    </div>
                    <div>
                      <h2 className="font-black text-xl text-white leading-none mb-1">Bienvenido a CIVAC</h2>
                      <p className="text-xs" style={{ color:"rgba(0,245,212,0.55)" }}>Ingresa con tu cuenta o crea una nueva</p>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Correo o usuario</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"rgba(0,245,212,0.45)" }}/>
                        <input type="text" value={email} autoComplete="username"
                          onChange={e=>{setEmail(e.target.value);setError("");}}
                          placeholder="correo@ganaderia.co"
                          className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm text-white placeholder:text-white/20 transition-all"
                          style={{ background:"rgba(0,245,212,0.04)", border:"1px solid rgba(0,245,212,0.15)", outline:"none" }}
                          onFocus={e=>{(e.target as HTMLInputElement).style.borderColor="rgba(0,245,212,0.5)";(e.target as HTMLInputElement).style.boxShadow="0 0 20px rgba(0,245,212,0.13)";}}
                          onBlur={e=>{(e.target as HTMLInputElement).style.borderColor="rgba(0,245,212,0.15)";(e.target as HTMLInputElement).style.boxShadow="none";}}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"rgba(0,245,212,0.45)" }}/>
                        <input type={showPass?"text":"password"} value={password} autoComplete="current-password"
                          onChange={e=>{setPassword(e.target.value);setError("");}}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm text-white placeholder:text-white/20 transition-all"
                          style={{ background:"rgba(0,245,212,0.04)", border:"1px solid rgba(0,245,212,0.15)", outline:"none" }}
                          onFocus={e=>{(e.target as HTMLInputElement).style.borderColor="rgba(0,245,212,0.5)";(e.target as HTMLInputElement).style.boxShadow="0 0 20px rgba(0,245,212,0.13)";}}
                          onBlur={e=>{(e.target as HTMLInputElement).style.borderColor="rgba(0,245,212,0.15)";(e.target as HTMLInputElement).style.boxShadow="none";}}
                        />
                        <button type="button" onClick={()=>setShowPass(!showPass)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 transition-colors">
                          {showPass?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs"
                        style={{ background:"rgba(255,77,109,0.08)", border:"1px solid rgba(255,77,109,0.25)", color:"#ff6b8a" }}>
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0"/>{error}
                      </div>
                    )}

                    <button type="submit" disabled={loading || !email}
                      className="w-full py-4 rounded-2xl font-black text-base text-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-1 relative overflow-hidden group"
                      style={{
                        background:"linear-gradient(135deg,#00f5d4,#00a896,#00c8ff)",
                        backgroundSize:"200% 200%",
                        boxShadow:"0 0 40px rgba(0,245,212,0.55), 0 8px 24px rgba(0,0,0,0.4)",
                        border:"1.5px solid rgba(0,245,212,0.7)",
                      }}>
                      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 60%)" }} />
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ background:"linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.12) 50%,transparent 100%)", animation:"shimmer 2.5s ease-in-out infinite" }} />
                      {loading
                        ? <span className="relative flex items-center justify-center gap-2 z-10">
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>
                            Verificando…
                          </span>
                        : <span className="relative flex items-center justify-center gap-2 z-10 font-black tracking-wide">
                            Ingresar al sistema
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"/>
                          </span>}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative flex items-center gap-3 my-5">
                    <div className="flex-1 h-px" style={{ background:"rgba(255,255,255,0.07)" }}/>
                    <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider flex-shrink-0">o continúa con</span>
                    <div className="flex-1 h-px" style={{ background:"rgba(255,255,255,0.07)" }}/>
                  </div>

                  <GoogleSignInButton onError={msg => setError(msg)} />

                  {/* Bottom links */}
                  <div className="mt-6 pt-5 flex items-center justify-between" style={{ borderTop:"1px solid rgba(0,245,212,0.08)" }}>
                    <button onClick={() => setTab("registro")}
                      className="text-[11px] font-semibold transition-colors hover:opacity-80"
                      style={{ color:"rgba(168,85,247,0.7)" }}>
                      ¿Sin cuenta? Registrarse →
                    </button>
                    <button onClick={() => setTab("cuentas")}
                      className="text-[11px] font-semibold transition-colors hover:opacity-80"
                      style={{ color:"rgba(255,255,255,0.2)" }}>
                      Demo / Admin →
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Trust & Selling Strip — 6 feature badges coloridos ── */}
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { icon:"🔒", label:"SSL 256-bit",   sub:"Cifrado total",      c:"57,255,126",  ac:"#39ff7e" },
                    { icon:"📱", label:"PWA Offline",   sub:"Sin internet",       c:"0,200,255",   ac:"#00c8ff" },
                    { icon:"🧬", label:"IndexedDB v1",  sub:"50k registros",      c:"168,85,247",  ac:"#a855f7" },
                    { icon:"🛡️", label:"DIAN Cert.",    sub:"Factura elect.",     c:"251,191,36",  ac:"#fbbf24" },
                    { icon:"🐄", label:"IA Ganadera",   sub:"GPT especializado",  c:"232,121,249", ac:"#e879f9" },
                    { icon:"🏆", label:"#1 Colombia",   sub:"Ganadería 2026",     c:"0,245,212",   ac:"#00f5d4" },
                  ].map(s => (
                    <div key={s.label}
                      className="flex flex-col items-center gap-1 py-2 px-1.5 rounded-xl cursor-default transition-all duration-300 hover:scale-[1.06] group"
                      style={{
                        background:`linear-gradient(145deg,rgba(${s.c},0.09),rgba(${s.c},0.04))`,
                        border:`1.5px solid rgba(${s.c},0.28)`,
                        boxShadow:`0 0 10px rgba(${s.c},0.08)`,
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.boxShadow = `0 0 22px rgba(${s.c},0.45), 0 4px 14px rgba(0,0,0,0.35)`;
                        el.style.background = `linear-gradient(145deg,rgba(${s.c},0.18),rgba(${s.c},0.09))`;
                        el.style.borderColor = `rgba(${s.c},0.55)`;
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.boxShadow = `0 0 10px rgba(${s.c},0.08)`;
                        el.style.background = `linear-gradient(145deg,rgba(${s.c},0.09),rgba(${s.c},0.04))`;
                        el.style.borderColor = `rgba(${s.c},0.28)`;
                      }}>
                      <span className="text-base leading-none" style={{ filter:`drop-shadow(0 0 7px rgba(${s.c},0.7))` }}>{s.icon}</span>
                      <div className="text-center">
                        <div className="text-[8px] font-black leading-tight" style={{ color:s.ac }}>{s.label}</div>
                        <div className="text-[7px] leading-tight" style={{ color:`rgba(${s.c},0.5)` }}>{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Colombia brand bar */}
                <div className="rounded-2xl px-3.5 py-2.5 relative overflow-hidden flex items-center justify-between gap-2"
                  style={{
                    background:"linear-gradient(135deg,rgba(252,209,22,0.07),rgba(0,56,168,0.05),rgba(206,17,38,0.04))",
                    border:"1px solid rgba(252,209,22,0.22)",
                    boxShadow:"0 0 16px rgba(252,209,22,0.08)",
                  }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px] flex">
                    <div className="flex-[2]" style={{ background:"#FCD116" }}/>
                    <div className="flex-[1]" style={{ background:"#003087" }}/>
                    <div className="flex-[1]" style={{ background:"#CE1126" }}/>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl leading-none flex-shrink-0">🇨🇴</span>
                    <div className="min-w-0">
                      <div className="text-[10px] font-black text-white leading-tight">100% Colombia · Universal Business Technology</div>
                      <div className="text-[8px] truncate" style={{ color:"rgba(252,209,22,0.5)" }}>
                        GanaderIA CIVAC PRO v2.1 · Control Inteligente de Valor Agropecuario
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {["🐄","🤖","🏆","🌿"].map(t => (
                      <span key={t} className="text-sm leading-none hover:scale-125 transition-transform duration-200 cursor-default"
                        style={{ filter:"drop-shadow(0 0 4px rgba(252,209,22,0.4))" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right widgets */}
            <RightWidgets />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB: PLANES
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === "planes" && (
          <div className="space-y-5">
            <p className="text-center text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>
              Facturación mensual COP · IVA incluido · <strong style={{ color:"#00f5d4" }}>Wompi / Nequi / PSE / Bancolombia</strong> · Sin permanencia mínima
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(["basico","pro","premium","platino"] as PlanId[]).map(pid => {
                const fg = PLAN_COLORS_GRADIENT[pid];
                const feats = PLAN_FEATURES[pid];
                const badges: Record<PlanId, string|null> = { basico:null, pro:"⭐ Popular", premium:"🏆 Recomendado", platino:"👑 Empresarial" };
                const isHov = hoveredCard === `plan-${pid}`;
                return (
                  <div key={pid}
                    className="relative rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer"
                    style={{
                      background:"rgba(4,13,26,0.97)",
                      border:`1px solid ${isHov ? fg[0]+"88" : fg[0]+"30"}`,
                      boxShadow: isHov ? `0 0 50px ${fg[0]}30, 0 20px 40px rgba(0,0,0,0.4)` : pid==="pro" ? `0 0 30px ${fg[0]}18` : "none",
                      transform: isHov ? "translateY(-4px) scale(1.01)" : "none",
                    }}
                    onMouseEnter={() => setHoveredCard(`plan-${pid}`)}
                    onMouseLeave={() => setHoveredCard(null)}>
                    {badges[pid] && (
                      <div className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full text-white z-10"
                        style={{ background:`linear-gradient(135deg,${fg[0]},${fg[1]})`, boxShadow:`0 0 10px ${fg[0]}60` }}>{badges[pid]}</div>
                    )}
                    {/* Top gradient line */}
                    <div className="h-1 w-full" style={{ background:`linear-gradient(90deg,${fg[0]},${fg[1]})` }} />
                    <div className="p-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                        style={{ background:`linear-gradient(135deg,${fg[0]},${fg[1]})`, boxShadow:`0 0 20px ${fg[0]}55` }}>
                        <span className="text-2xl">{PLAN_ICON[pid]}</span>
                      </div>
                      <h3 className="text-lg font-black text-white mb-0.5">{PLAN_LABEL[pid]}</h3>
                      <p className="font-black text-base mb-3" style={{ color:fg[0], textShadow:`0 0 10px ${fg[0]}60` }}>
                        {PLAN_PRECIOS_LABEL[pid]}
                      </p>
                      <ul className="space-y-1.5 mb-4">
                        {feats.slice(0,6).map(f=>(
                          <li key={f} className="flex items-start gap-1.5 text-[10px] text-white/65">
                            <CheckCircle2 size={10} className="flex-shrink-0 mt-0.5" style={{ color:"#39ff7e" }}/>{f}
                          </li>
                        ))}
                        {feats.length > 6 && <li className="text-[10px] text-white/30">+{feats.length-6} más…</li>}
                      </ul>
                      {pid === "basico" ? (
                        <button onClick={() => setTab("login")}
                          className="w-full py-3 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] relative overflow-hidden group"
                          style={{ background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.75)", border:"1.5px solid rgba(255,255,255,0.18)" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.15)"; (e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.35)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.18)"; }}>
                          Empezar gratis →
                        </button>
                      ) : (
                        <button onClick={() => setPayPlan(pid)}
                          className="w-full py-3 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] relative overflow-hidden group"
                          style={{
                            background:`linear-gradient(135deg,${fg[0]},${fg[1]})`,
                            color:pid==="platino"?"white":"#000",
                            boxShadow:`0 0 28px ${fg[0]}60, 0 6px 18px rgba(0,0,0,0.35)`,
                            border:`1.5px solid ${fg[0]}88`,
                          }}>
                          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 60%)" }} />
                          <div className="absolute inset-0 pointer-events-none"
                            style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.10) 50%,transparent)", animation:"shimmer 2.5s ease-in-out infinite" }} />
                          <span className="relative z-10">💳 Contratar — {PLAN_PRECIOS_LABEL[pid]}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px]" style={{ color:"rgba(255,255,255,0.25)" }}>
              <span className="flex items-center gap-1"><Lock size={10}/>Wompi · Bancolombia seguro</span>
              <span className="flex items-center gap-1"><CheckCircle size={10}/>Factura electrónica DIAN</span>
              <span className="flex items-center gap-1"><X size={10}/>Sin permanencia mínima</span>
              <span className="flex items-center gap-1"><Phone size={10}/>Soporte WhatsApp</span>
              <span className="flex items-center gap-1">🇨🇴 Hecho en Colombia</span>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB: REGISTRO — Crear cuenta nueva
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === "registro" && (
          <div className="flex gap-5 items-start justify-center">
            <FarmImageWidgets />
            <div className="w-full max-w-md">
              <div className="rounded-3xl overflow-hidden"
                style={{
                  background:"linear-gradient(145deg,rgba(4,13,26,0.98),rgba(10,7,30,0.96))",
                  border:"1px solid rgba(168,85,247,0.28)",
                  boxShadow:"0 0 70px rgba(168,85,247,0.12), 0 30px 70px rgba(0,0,0,0.6)",
                  backdropFilter:"blur(28px)",
                }}>
                <div className="h-1" style={{ background:"linear-gradient(90deg,#a855f7,#7c3aed,#6d28d9,transparent)" }}/>
                <div className="p-7 sm:p-8">

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background:"rgba(168,85,247,0.10)", border:"1px solid rgba(168,85,247,0.28)", boxShadow:"0 0 20px rgba(168,85,247,0.18)" }}>
                      <UserPlus className="w-5 h-5" style={{ color:"#a855f7" }}/>
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white leading-tight">Crear cuenta CIVAC</h2>
                      <p className="text-xs mt-0.5" style={{ color:"rgba(168,85,247,0.6)" }}>
                        Plan Básico gratuito · Activación en 24 h
                      </p>
                    </div>
                  </div>

                  {/* Success state */}
                  {regOk && (
                    <div className="rounded-2xl p-5 flex flex-col items-center gap-3 text-center mb-4"
                      style={{ background:"rgba(57,255,126,0.07)", border:"1px solid rgba(57,255,126,0.25)" }}>
                      <CheckCircle2 className="w-10 h-10" style={{ color:"#39ff7e" }}/>
                      <div>
                        <p className="font-black text-white text-sm">Registro exitoso</p>
                        <p className="text-xs mt-1" style={{ color:"rgba(57,255,126,0.7)" }}>
                          Tu cuenta fue creada y está pendiente de activación.
                          El administrador CIVAC te notificará por correo cuando esté lista.
                        </p>
                      </div>
                      <button onClick={() => { setRegOk(false); setTab("login"); }}
                        className="mt-1 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                        style={{ background:"rgba(0,245,212,0.12)", color:"#00f5d4", border:"1px solid rgba(0,245,212,0.3)" }}>
                        Iniciar sesión →
                      </button>
                    </div>
                  )}

                  {/* Form */}
                  {!regOk && (
                    <form onSubmit={handleRegister} className="space-y-4">
                      {/* Nombre */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color:"rgba(168,85,247,0.6)" }}>
                          NOMBRE COMPLETO *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"rgba(168,85,247,0.5)" }}/>
                          <input value={regNombre} onChange={e => setRegNombre(e.target.value)}
                            placeholder="Ej: Juan Carlos Herrera" required
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                            style={{ background:"rgba(168,85,247,0.07)", border:"1px solid rgba(168,85,247,0.25)" }}
                            onFocus={e => { (e.target as HTMLElement).style.borderColor="rgba(168,85,247,0.6)"; (e.target as HTMLElement).style.boxShadow="0 0 14px rgba(168,85,247,0.12)"; }}
                            onBlur={e => { (e.target as HTMLElement).style.borderColor="rgba(168,85,247,0.25)"; (e.target as HTMLElement).style.boxShadow="none"; }}
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color:"rgba(168,85,247,0.6)" }}>
                          CORREO ELECTRÓNICO *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"rgba(168,85,247,0.5)" }}/>
                          <input value={regEmail} onChange={e => setRegEmail(e.target.value)} type="email"
                            placeholder="correo@mifinca.co" required
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                            style={{ background:"rgba(168,85,247,0.07)", border:"1px solid rgba(168,85,247,0.25)" }}
                            onFocus={e => { (e.target as HTMLElement).style.borderColor="rgba(168,85,247,0.6)"; (e.target as HTMLElement).style.boxShadow="0 0 14px rgba(168,85,247,0.12)"; }}
                            onBlur={e => { (e.target as HTMLElement).style.borderColor="rgba(168,85,247,0.25)"; (e.target as HTMLElement).style.boxShadow="none"; }}
                          />
                        </div>
                      </div>

                      {/* Finca */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color:"rgba(168,85,247,0.6)" }}>
                            NOMBRE DE FINCA
                          </label>
                          <input value={regFinca} onChange={e => setRegFinca(e.target.value)}
                            placeholder="Finca El Rancho"
                            className="w-full px-3 py-3 rounded-xl text-sm text-white outline-none transition-all"
                            style={{ background:"rgba(168,85,247,0.07)", border:"1px solid rgba(168,85,247,0.25)" }}
                            onFocus={e => { (e.target as HTMLElement).style.borderColor="rgba(168,85,247,0.6)"; }}
                            onBlur={e => { (e.target as HTMLElement).style.borderColor="rgba(168,85,247,0.25)"; }}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color:"rgba(168,85,247,0.6)" }}>
                            ROL / CARGO
                          </label>
                          <input value={regCargo} onChange={e => setRegCargo(e.target.value)}
                            placeholder="Propietario, Vet…"
                            className="w-full px-3 py-3 rounded-xl text-sm text-white outline-none transition-all"
                            style={{ background:"rgba(168,85,247,0.07)", border:"1px solid rgba(168,85,247,0.25)" }}
                            onFocus={e => { (e.target as HTMLElement).style.borderColor="rgba(168,85,247,0.6)"; }}
                            onBlur={e => { (e.target as HTMLElement).style.borderColor="rgba(168,85,247,0.25)"; }}
                          />
                        </div>
                      </div>

                      {/* Contraseña */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color:"rgba(168,85,247,0.6)" }}>
                          CONTRASEÑA * (mín. 6 caracteres)
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"rgba(168,85,247,0.5)" }}/>
                          <input value={regPass} onChange={e => setRegPass(e.target.value)}
                            type={showRegPass ? "text" : "password"} placeholder="••••••••" required
                            className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white outline-none transition-all"
                            style={{ background:"rgba(168,85,247,0.07)", border:"1px solid rgba(168,85,247,0.25)" }}
                            onFocus={e => { (e.target as HTMLElement).style.borderColor="rgba(168,85,247,0.6)"; (e.target as HTMLElement).style.boxShadow="0 0 14px rgba(168,85,247,0.12)"; }}
                            onBlur={e => { (e.target as HTMLElement).style.borderColor="rgba(168,85,247,0.25)"; (e.target as HTMLElement).style.boxShadow="none"; }}
                          />
                          <button type="button" onClick={() => setShowRegPass(v => !v)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                            {showRegPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                          </button>
                        </div>
                      </div>

                      {/* Confirmar contraseña */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color:"rgba(168,85,247,0.6)" }}>
                          CONFIRMAR CONTRASEÑA *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"rgba(168,85,247,0.5)" }}/>
                          <input value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                            type="password" placeholder="••••••••" required
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                            style={{
                              background:"rgba(168,85,247,0.07)",
                              border:`1px solid ${regConfirm && regConfirm !== regPass ? "rgba(248,113,113,0.5)" : "rgba(168,85,247,0.25)"}`,
                            }}
                            onFocus={e => { (e.target as HTMLElement).style.borderColor="rgba(168,85,247,0.6)"; }}
                            onBlur={e => { (e.target as HTMLElement).style.borderColor = regConfirm && regConfirm !== regPass ? "rgba(248,113,113,0.5)" : "rgba(168,85,247,0.25)"; }}
                          />
                        </div>
                        {regConfirm && regConfirm !== regPass && (
                          <p className="text-[10px] mt-1" style={{ color:"#f87171" }}>Las contraseñas no coinciden</p>
                        )}
                      </div>

                      {/* Error */}
                      {regError && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs"
                          style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)", color:"#f87171" }}>
                          <AlertTriangle size={13} className="flex-shrink-0"/>
                          {regError}
                        </div>
                      )}

                      {/* Submit */}
                      <button type="submit" disabled={regLoading}
                        className="w-full py-3.5 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                          background:"linear-gradient(135deg,#a855f7,#7c3aed,#6d28d9)",
                          color:"white",
                          boxShadow:"0 0 40px rgba(168,85,247,0.45), 0 8px 24px rgba(0,0,0,0.4)",
                          border:"1.5px solid rgba(168,85,247,0.6)",
                        }}>
                        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.14) 0%,transparent 60%)" }} />
                        {regLoading
                          ? <span className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                              Registrando…
                            </span>
                          : <span className="relative z-10 flex items-center justify-center gap-2">
                              Crear mi cuenta
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"/>
                            </span>
                        }
                      </button>

                      <div className="relative flex items-center gap-3 my-1">
                        <div className="flex-1 h-px" style={{ background:"rgba(168,85,247,0.1)" }}/>
                        <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider flex-shrink-0">o regístrate con</span>
                        <div className="flex-1 h-px" style={{ background:"rgba(168,85,247,0.1)" }}/>
                      </div>

                      <GoogleSignInButton onError={msg => setRegError(msg)} />
                    </form>
                  )}

                  {/* Bottom links */}
                  <div className="mt-5 pt-4 flex items-center justify-between" style={{ borderTop:"1px solid rgba(168,85,247,0.08)" }}>
                    <button onClick={() => setTab("login")}
                      className="text-[11px] font-semibold transition-colors hover:opacity-80"
                      style={{ color:"rgba(0,245,212,0.5)" }}>
                      ← Ya tengo cuenta
                    </button>
                    <button onClick={() => setTab("planes")}
                      className="text-[11px] font-semibold transition-colors hover:opacity-80"
                      style={{ color:"rgba(168,85,247,0.4)" }}>
                      Ver planes →
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <RightWidgets />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB: CUENTAS — CIVAC Staff + Demo por Plan
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === "cuentas" && (() => {
          const planAccounts  = clientAccounts.filter(a => a.id.startsWith("demo_"));

          /* Plan card identity */
          const PLAN_IDENTITY: Record<PlanId, {
            c1:string; c2:string; g:string; gRGB:string;
            badge:string; badgeBg:string; desc:string;
            mods:string[]; emoji:string;
          }> = {
            basico:  { c1:"#b8c4d4", c2:"#94a3b8", g:"184,196,212", gRGB:"184,196,212", badge:"GRATIS", badgeBg:"rgba(148,163,184,0.15)", desc:"Gestión básica · Inventario, Producción, Potreros, Alertas",            mods:["📊 Dashboard","🐄 Inventario","🥛 Producción","🌿 Potreros","🔔 Alertas","🩺 Sanidad","📝 Pesaje Manual"], emoji:"🥈" },
            pro:     { c1:"#00f5d4", c2:"#00c8ff", g:"0,245,212",   gRGB:"0,245,212",   badge:"⚡ PRO", badgeBg:"rgba(0,245,212,0.12)",  desc:"Hato completo · GPS, Genética, Reproducción, Pesaje BT, IA",         mods:["⚡ Todo Básico","🧬 Reproducción","🔬 Genética","⚖️ Pesaje BT","📡 GPS","🌾 Alimentación","📦 Insumos","🧊 Semen","💰 Costos","👷 Personal","📋 Ficha","🏷️ Lotes"], emoji:"⚡" },
            premium: { c1:"#fbbf24", c2:"#f59e0b", g:"251,191,36",  gRGB:"251,191,36",  badge:"🥇 PREMIUM", badgeBg:"rgba(251,191,36,0.12)", desc:"Empresa ganadera · IA, Multi-Finca, CRM, Drive, CO₂ IPCC",       mods:["🥇 Todo PRO","🤖 Asesora IA","💼 CRM Ventas","🏘️ Multi-Finca","🔮 Predicción IA","🌱 Huella CO₂","☁️ Drive Backup"], emoji:"🥇" },
            platino: { c1:"#cd7f32", c2:"#e07b54", g:"205,127,50",  gRGB:"205,127,50",  badge:"👑 PLATINO", badgeBg:"rgba(205,127,50,0.12)", desc:"Corporativo · Usuarios, Config. avanzada, SLA 99.9%, todo incluido", mods:["👑 TODO incluido","👥 Usuarios & Roles","⚙️ Config. avanzada","📖 Documentación","📘 Manual completo","🗄️ Centro Datos","💳 Gestión Planes"], emoji:"👑" },
          };

          return (
          <div className="space-y-6">

            {/* ── Sección Planes Demo — PRIMERO (el producto) ── */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex-1 h-px" style={{ background:"linear-gradient(90deg,rgba(0,245,212,0.4),transparent)" }}/>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full"
                  style={{ color:"#00f5d4", border:"1px solid rgba(0,245,212,0.35)", background:"rgba(0,245,212,0.07)" }}>
                  Demos por Plan · Acceso Completo al Sistema
                </span>
                <div className="flex-1 h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(0,245,212,0.4))" }}/>
              </div>
              <p className="text-center text-[9px] mb-3" style={{ color:"rgba(255,255,255,0.25)" }}>
                Cuentas de ganadero cliente — explora todos los módulos de tu plan
                <span className="mx-1.5 text-white/15">·</span>
                <span style={{ color:"rgba(57,255,126,0.45)" }}>credenciales visibles en cada tarjeta</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {planAccounts.map(account => {
                  const plan = (account.plan ?? "basico") as PlanId;
                  const pi = PLAN_IDENTITY[plan];
                  const isLoading = loadingId === account.id;
                  const isHov = hoveredCard === `plan-${account.id}`;
                  const feats = PLAN_FEATURES[plan];
                  return (
                    <div key={account.id}
                      className="relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300"
                      style={{
                        background:`rgba(4,13,26,0.97)`,
                        border:`2px solid rgba(${pi.gRGB},${isHov?"0.65":"0.28"})`,
                        boxShadow: isHov ? `0 0 50px rgba(${pi.gRGB},0.30), 0 16px 40px rgba(0,0,0,0.5)` : `0 0 18px rgba(${pi.gRGB},0.08)`,
                        transform: isHov ? "translateY(-4px) scale(1.01)" : "none",
                      }}
                      onMouseEnter={() => setHoveredCard(`plan-${account.id}`)}
                      onMouseLeave={() => setHoveredCard(null)}>

                      {/* Top gradient bar — plan identity */}
                      <div className="h-1.5 w-full" style={{ background:`linear-gradient(90deg,${pi.c1},${pi.c2})` }}/>

                      {/* DEMO badge */}
                      <div className="absolute top-3 right-3">
                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full"
                          style={{ background:pi.badgeBg, color:pi.c1, border:`1px solid rgba(${pi.gRGB},0.4)`, letterSpacing:"0.08em" }}>
                          {pi.badge}
                        </span>
                      </div>

                      {/* Demo indicator */}
                      <div className="absolute top-3 left-3">
                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full"
                          style={{ background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.35)", border:"1px solid rgba(255,255,255,0.12)" }}>
                          🧪 DEMO
                        </span>
                      </div>

                      <div className="p-4 pt-10">
                        {/* Plan icon */}
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                          style={{ background:`linear-gradient(135deg,${pi.c1}22,${pi.c2}15)`, border:`1.5px solid rgba(${pi.gRGB},0.4)`, boxShadow:`0 0 20px rgba(${pi.gRGB},0.2)` }}>
                          <span style={{ fontSize:"2rem" }}>{pi.emoji}</span>
                        </div>

                        {/* Plan name */}
                        <h3 className="text-lg font-black mb-0.5" style={{ color:pi.c1, textShadow:`0 0 12px rgba(${pi.gRGB},0.5)` }}>
                          {PLAN_LABEL[plan]}
                        </h3>
                        <p className="text-[10px] mb-1 font-bold" style={{ color:`rgba(${pi.gRGB},0.55)` }}>
                          {account.nombre.split(" ").slice(0,3).join(" ")}
                        </p>
                        <p className="text-[9px] mb-3 leading-relaxed" style={{ color:"rgba(255,255,255,0.35)" }}>{pi.desc}</p>

                        {/* Module list */}
                        <div className="space-y-1 mb-4">
                          {pi.mods.slice(0,5).map(m=>(
                            <div key={m} className="flex items-center gap-1.5 text-[10px]" style={{ color:`rgba(${pi.gRGB},0.65)` }}>
                              <span style={{ color:pi.c1, fontSize:"9px" }}>✓</span>{m}
                            </div>
                          ))}
                          {pi.mods.length > 5 && <div className="text-[9px]" style={{ color:"rgba(255,255,255,0.2)" }}>+{pi.mods.length-5} módulos más…</div>}
                        </div>

                        {/* Plan progress bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-[8px] mb-1" style={{ color:`rgba(${pi.gRGB},0.45)` }}>
                            <span>{feats.length} módulos</span>
                            <span>{plan==="basico"?"25%":plan==="pro"?"50%":plan==="premium"?"75%":"100%"}</span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full" style={{
                              width:plan==="basico"?"25%":plan==="pro"?"50%":plan==="premium"?"75%":"100%",
                              background:`linear-gradient(90deg,${pi.c1},${pi.c2})`,
                              boxShadow:`0 0 8px rgba(${pi.gRGB},0.5)`,
                            }}/>
                          </div>
                        </div>

                        {/* Credenciales demo — visibles */}
                        <div className="mb-3 rounded-xl p-2.5" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                          <div className="text-[7.5px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1" style={{ color:"rgba(57,255,126,0.5)" }}>
                            <span>🔑</span> Credenciales demo
                          </div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-[8.5px] font-mono truncate max-w-[120px]" style={{ color:"rgba(255,255,255,0.45)" }}>{account.email}</span>
                            <button
                              onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(account.email); }}
                              className="flex-shrink-0 text-[7px] font-black px-1.5 py-0.5 rounded-full transition-all hover:opacity-80"
                              style={{ background:`rgba(${pi.gRGB},0.08)`, color:`rgba(${pi.gRGB},0.6)`, border:`1px solid rgba(${pi.gRGB},0.18)` }}>
                              copiar
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-mono font-black" style={{ color:"rgba(57,255,126,0.75)" }}>demo2026</span>
                            <button
                              onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText("demo2026"); }}
                              className="flex-shrink-0 text-[7px] font-black px-1.5 py-0.5 rounded-full transition-all hover:opacity-80"
                              style={{ background:"rgba(57,255,126,0.07)", color:"rgba(57,255,126,0.55)", border:"1px solid rgba(57,255,126,0.16)" }}>
                              copiar
                            </button>
                          </div>
                        </div>

                        {/* CTA buttons */}
                        <div className="space-y-2">
                          <button onClick={() => handleQuick(account)} disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] disabled:opacity-40 relative overflow-hidden group"
                            style={{
                              background:`linear-gradient(135deg,${pi.c1},${pi.c2})`,
                              color: plan==="platino"?"#fff":"#000",
                              boxShadow: isHov ? `0 0 36px rgba(${pi.gRGB},0.65), 0 8px 24px rgba(0,0,0,0.4)` : `0 0 22px rgba(${pi.gRGB},0.35)`,
                              border:`1.5px solid rgba(${pi.gRGB},0.7)`,
                            }}>
                            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 60%)" }} />
                            <div className="absolute inset-0 pointer-events-none"
                              style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.10) 50%,transparent)", animation:"shimmer 2.2s ease-in-out infinite" }} />
                            {isLoading
                              ? <span className="relative z-10 flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin"/>Entrando…
                                </span>
                              : <span className="relative z-10 flex items-center gap-2">
                                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200"/>
                                  Probar {PLAN_LABEL[plan]}
                                </span>}
                          </button>
                          {plan !== "platino" && (
                            <button onClick={() => setPayPlan(plan==="basico"?"pro":plan==="pro"?"premium":"platino")}
                              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl font-black text-[11px] transition-all duration-300 hover:scale-[1.03]"
                              style={{
                                background:`linear-gradient(135deg,rgba(${pi.gRGB},0.10),rgba(${pi.gRGB},0.05))`,
                                border:`1.5px solid rgba(${pi.gRGB},0.35)`,
                                color:pi.c1,
                                boxShadow:`0 0 10px rgba(${pi.gRGB},0.10)`,
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow=`0 0 20px rgba(${pi.gRGB},0.35)`; (e.currentTarget as HTMLElement).style.borderColor=`rgba(${pi.gRGB},0.6)`; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow=`0 0 10px rgba(${pi.gRGB},0.10)`; (e.currentTarget as HTMLElement).style.borderColor=`rgba(${pi.gRGB},0.35)`; }}>
                              💳 Contratar plan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                CIVAC ADMIN ACCOUNTS — equipo interno con tarjetas
            ══════════════════════════════════════════════════════════ */}
            <div className="relative rounded-3xl overflow-hidden"
              style={{ background:"linear-gradient(145deg,rgba(1,5,15,0.98),rgba(3,9,22,0.97))", border:"1px solid rgba(0,245,212,0.18)", boxShadow:"0 0 60px rgba(0,245,212,0.06)" }}>

              {/* Ambient background glow */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background:"radial-gradient(ellipse 80% 50% at 50% 0%,rgba(0,245,212,0.07) 0%,transparent 60%)" }}/>
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background:"linear-gradient(90deg,transparent,rgba(0,245,212,0.5),rgba(0,200,255,0.35),rgba(0,245,212,0.5),transparent)" }}/>

              <div className="relative p-5">
                {/* Section header */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background:"linear-gradient(135deg,rgba(0,245,212,0.12),rgba(0,200,255,0.07))", border:"1.5px solid rgba(0,245,212,0.35)", boxShadow:"0 0 30px rgba(0,245,212,0.20), inset 0 1px 0 rgba(0,245,212,0.08)" }}>
                      <span className="text-2xl" style={{ filter:"drop-shadow(0 0 12px rgba(0,245,212,0.9))" }}>⬡</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", boxShadow:"0 0 10px rgba(0,245,212,0.7)" }}>
                      <span className="text-[9px] font-black text-black">S</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="text-base font-black text-white leading-none">Equipo CIVAC — Portal Staff</h3>
                      <span className="text-[8px] font-black px-2 py-0.5 rounded-full"
                        style={{ background:"rgba(0,245,212,0.10)", border:"1px solid rgba(0,245,212,0.30)", color:"#00f5d4" }}>
                        ⬡ PRIVADO
                      </span>
                      <span className="text-[8px] font-black px-2 py-0.5 rounded-full"
                        style={{ background:"rgba(57,255,126,0.10)", border:"1px solid rgba(57,255,126,0.30)", color:"#39ff7e" }}>
                        ● ACTIVO
                      </span>
                    </div>
                    <p className="text-[10px]" style={{ color:"rgba(255,255,255,0.30)" }}>
                      Acceso exclusivo para el equipo fundador CIVAC · Portal independiente de la app cliente
                    </p>
                  </div>
                  <button onClick={() => setShowAdminForm(true)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-[11px] transition-all duration-300 hover:scale-[1.06] active:scale-[0.97] group relative overflow-hidden"
                    style={{ background:"linear-gradient(135deg,rgba(0,245,212,0.14),rgba(0,200,255,0.08))", border:"1.5px solid rgba(0,245,212,0.45)", color:"#00f5d4", boxShadow:"0 0 20px rgba(0,245,212,0.15)" }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{ background:"linear-gradient(135deg,rgba(0,245,212,0.10) 0%,transparent 60%)" }}/>
                    <span style={{ filter:"drop-shadow(0 0 5px rgba(0,245,212,0.9))" }}>⬡</span>
                    <span className="whitespace-nowrap">Acceder</span>
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform"/>
                  </button>
                </div>

                {/* Staff cards grid — 4 members */}
                {(() => {
                  const STAFF_MEMBERS = [
                    {
                      emoji:"🔱", name:"Javier Sánchez", short:"Javier",
                      cargo:"CEO · Fundador & Propietario",
                      sub:"Control total · Auditoría · Config global · Server Panel",
                      role:"superadmin", plan:"Platino",
                      from:"#c0392b", to:"#e74c3c", glow:"192,57,43",
                      img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80&fit=crop&crop=face",
                      tags:["⬡ Superadmin","🔱 CEO","🛡 Audit","⚙️ Config"],
                    },
                    {
                      emoji:"👑", name:"Lizet Daza", short:"Lizet",
                      cargo:"Co-Fundadora · Dir. Ejecutiva",
                      sub:"Dirección ejecutiva · Panel Admin · Plataforma completa",
                      role:"admin", plan:"Platino",
                      from:"#d4a017", to:"#f0c040", glow:"212,160,23",
                      img:"https://images.unsplash.com/photo-1494790108755-2616b612b1e6?w=120&q=80&fit=crop&crop=face",
                      tags:["👑 Admin","📊 Panel","💼 Gestión"],
                    },
                    {
                      emoji:"🛠️", name:"Johnatan Vallejo", short:"Johnatan",
                      cargo:"Arquitecto Principal · Dev",
                      sub:"PWA · APIs · Feature Flags · Deploy · Server Panel",
                      role:"developer", plan:"Platino",
                      from:"#00c853", to:"#00e676", glow:"0,200,83",
                      img:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80&fit=crop&crop=face",
                      tags:["🛠️ Dev","🚀 Deploy","🔧 APIs","⚡ PWA"],
                    },
                    {
                      emoji:"📊", name:"Asesora Ventas", short:"Ventas",
                      cargo:"Asesora Comercial Senior",
                      sub:"CRM · Pipeline · Reportes · Gestión de cuentas",
                      role:"sales", plan:"Platino",
                      from:"#e879f9", to:"#a855f7", glow:"232,121,249",
                      img:"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&q=80&fit=crop&crop=face",
                      tags:["📊 Ventas","💼 CRM","📈 Reportes"],
                    },
                  ];
                  return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {STAFF_MEMBERS.map((m, i) => {
                        const isHov = hoveredCard === `staff-${i}`;
                        return (
                          <div key={i}
                            className="staff-card rounded-2xl cursor-pointer group"
                            style={{
                              background:`linear-gradient(160deg,rgba(${m.glow},0.10),rgba(${m.glow},0.04),rgba(0,0,0,0.3))`,
                              border:`1.5px solid rgba(${m.glow},${isHov?"0.55":"0.22"})`,
                              boxShadow: isHov ? `0 0 40px rgba(${m.glow},0.25), 0 12px 32px rgba(0,0,0,0.5)` : `0 0 12px rgba(${m.glow},0.08)`,
                            }}
                            onMouseEnter={() => setHoveredCard(`staff-${i}`)}
                            onMouseLeave={() => setHoveredCard(null)}
                            onClick={() => setShowAdminForm(true)}>

                            {/* Top identity bar */}
                            <div className="h-1 w-full rounded-t-2xl"
                              style={{ background:`linear-gradient(90deg,${m.from},${m.to})` }}/>

                            <div className="p-3.5">
                              {/* Avatar + glow ring */}
                              <div className="relative w-14 h-14 mx-auto mb-3">
                                <div className="absolute inset-0 rounded-2xl"
                                  style={{ background:`linear-gradient(135deg,${m.from}40,${m.to}25)`, border:`1.5px solid rgba(${m.glow},0.35)`, boxShadow:`0 0 20px rgba(${m.glow},0.20)` }}/>
                                <img src={m.img} alt={m.name}
                                  className="relative w-full h-full rounded-2xl object-cover"
                                  style={{ border:`1.5px solid rgba(${m.glow},0.45)` }}
                                  onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; const p=e.currentTarget.parentElement; if(p){p.innerHTML=`<div style="width:56px;height:56px;border-radius:1rem;display:flex;align-items:center;justify-content:center;font-size:1.6rem;background:linear-gradient(135deg,rgba(${m.glow},0.15),rgba(${m.glow},0.08));border:1.5px solid rgba(${m.glow},0.35)">${m.emoji}</div>`;} }}
                                />
                                {/* Status dot */}
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                                  style={{ background:"#39ff7e", border:"1.5px solid rgba(0,0,0,0.6)", boxShadow:"0 0 8px rgba(57,255,126,0.6)" }}/>
                              </div>

                              {/* Name + cargo */}
                              <div className="text-center mb-2.5">
                                <p className="text-[12px] font-black text-white leading-tight">{m.short}</p>
                                <p className="text-[8.5px] font-bold mt-0.5 leading-tight" style={{ color:`rgba(${m.glow},0.7)` }}>{m.cargo.split("·")[0].trim()}</p>
                              </div>

                              {/* Role tags */}
                              <div className="flex flex-wrap justify-center gap-1 mb-3">
                                {m.tags.slice(0,2).map(tag => (
                                  <span key={tag} className="text-[7px] font-black px-1.5 py-0.5 rounded-full"
                                    style={{ background:`rgba(${m.glow},0.10)`, border:`1px solid rgba(${m.glow},0.25)`, color:`rgba(${m.glow},0.8)` }}>
                                    {tag}
                                  </span>
                                ))}
                                <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full"
                                  style={{ background:"rgba(0,245,212,0.07)", border:"1px solid rgba(0,245,212,0.20)", color:"rgba(0,245,212,0.6)" }}>
                                  ⬡ CIVAC
                                </span>
                              </div>

                              {/* Sub info */}
                              <p className="text-[8.5px] text-center leading-relaxed mb-3"
                                style={{ color:"rgba(255,255,255,0.25)" }}>
                                {m.sub}
                              </p>

                              {/* Plan badge */}
                              <div className="text-center">
                                <span className="text-[7px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                                  style={{ background:"rgba(0,245,212,0.08)", border:"1px solid rgba(0,245,212,0.20)", color:"rgba(0,245,212,0.55)" }}>
                                  👑 {m.plan} · Staff
                                </span>
                              </div>

                              {/* Security badge — sin contraseña visible */}
                              <div className="mt-1.5 text-center">
                                <span className="text-[6.5px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                                  style={{ background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.18)", color:"rgba(239,68,68,0.50)" }}>
                                  🔒 Acceso protegido · Sin contraseña visible
                                </span>
                              </div>

                              {/* Hover CTA */}
                              <div className="mt-3 overflow-hidden transition-all duration-300"
                                style={{ maxHeight: isHov ? "36px" : "0px", opacity: isHov ? 1 : 0 }}>
                                <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[9px] font-black"
                                  style={{ background:`rgba(${m.glow},0.12)`, border:`1px solid rgba(${m.glow},0.35)`, color:`rgb(${m.glow})` }}>
                                  <span>⬡</span> Ingresar Portal
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Bottom separator + CTA strip */}
                <div className="mt-4 pt-4" style={{ borderTop:"1px solid rgba(0,245,212,0.08)" }}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {["🔱","👑","🛠️","📊"].map(e => (
                          <div key={e} className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                            style={{ background:"rgba(0,245,212,0.08)", border:"1.5px solid rgba(0,245,212,0.20)" }}>{e}</div>
                        ))}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white">4 miembros activos</p>
                        <p className="text-[8px]" style={{ color:"rgba(0,245,212,0.40)" }}>CEO · Admin · Dev · Ventas · Plan Platino</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px]"
                        style={{ background:"rgba(57,255,126,0.05)", border:"1px solid rgba(57,255,126,0.15)", color:"rgba(57,255,126,0.5)" }}>
                        <Shield size={10}/> Sesión segura SSL
                      </div>
                      <button onClick={() => setShowAdminForm(true)}
                        className="flex items-center gap-2 px-5 py-2 rounded-2xl font-black text-[11px] transition-all hover:scale-[1.05]"
                        style={{ background:"linear-gradient(135deg,#00f5d4,#00c896)", color:"#000", boxShadow:"0 0 20px rgba(0,245,212,0.30)" }}>
                        <span style={{ fontSize:"0.85rem" }}>⬡</span> Portal CIVAC Staff
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-px w-full"
                style={{ background:"linear-gradient(90deg,transparent,rgba(0,245,212,0.15),transparent)" }}/>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px]"
                style={{ background:"rgba(57,255,126,0.04)", border:"1px solid rgba(57,255,126,0.12)", color:"rgba(57,255,126,0.5)" }}>
                <Shield size={11}/> Autenticación segura · Sesión localStorage · Sin contraseña en servidor
              </div>
              <button onClick={() => setTab("login")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm text-black transition-all hover:opacity-90"
                style={{ background:"linear-gradient(135deg,#00f5d4,#00c896)", boxShadow:"0 0 24px rgba(0,245,212,0.35)" }}>
                <ArrowRight size={14}/> Iniciar sesión →
              </button>
            </div>
          </div>
          );
        })()}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB: IA MODULE
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === "ia" && <IaModuleTab />}

        {/* ── Footer KPI Strip — siempre visible debajo del card ── */}
        <LoginStatsFooter />

      </div>

      {/* ── BOTTOM PWA NAV ── */}
      <BottomPWANav tab={tab} setTab={setTab} />

      {/* ── CIVAC STAFF LOGIN MODAL ── */}
      {showAdminForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background:"rgba(0,0,0,0.94)", backdropFilter:"blur(16px)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowAdminForm(false); }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden relative"
            style={{
              background:"linear-gradient(145deg,#020810,#040d1a,#061220)",
              border:"1.5px solid rgba(0,245,212,0.22)",
              boxShadow:"0 0 80px rgba(0,245,212,0.12), 0 30px 70px rgba(0,0,0,0.7)",
            }}>
            {/* Radial glow top */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background:"radial-gradient(ellipse at 50% -20%,rgba(0,245,212,0.08) 0%,transparent 60%)" }}/>
            {/* Top color bar */}
            <div className="h-1 w-full" style={{ background:"linear-gradient(90deg,#00f5d4,#00c8ff,rgba(0,245,212,0.3),transparent)" }}/>

            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-start gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:"linear-gradient(135deg,rgba(0,245,212,0.12),rgba(0,200,255,0.08))",
                    border:"1.5px solid rgba(0,245,212,0.30)",
                    boxShadow:"0 0 20px rgba(0,245,212,0.18)",
                  }}>
                  <span className="text-xl" style={{ filter:"drop-shadow(0 0 8px rgba(0,245,212,0.8))" }}>⬡</span>
                </div>
                <div className="flex-1">
                  <h2 className="font-black text-white text-base leading-tight">Portal CIVAC Staff</h2>
                  <p className="text-[10px] mt-0.5" style={{ color:"rgba(0,245,212,0.5)" }}>
                    Acceso exclusivo · Equipo interno CIVAC
                  </p>
                </div>
                <button onClick={() => { setShowAdminForm(false); setError(""); }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/8"
                  style={{ color:"rgba(255,255,255,0.25)" }}>
                  <X size={14}/>
                </button>
              </div>

              {/* Info bar */}
              <div className="rounded-2xl p-3 mb-5 flex items-center gap-2.5"
                style={{ background:"rgba(0,245,212,0.04)", border:"1px solid rgba(0,245,212,0.12)" }}>
                <Shield size={12} style={{ color:"rgba(0,245,212,0.5)", flexShrink:0 }}/>
                <p className="text-[10px]" style={{ color:"rgba(0,245,212,0.45)" }}>
                  Zona restringida — CEO, Dirección, Desarrollo y Ventas corporativas.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color:"rgba(0,245,212,0.4)" }}>
                    Correo CIVAC
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"rgba(0,245,212,0.35)" }}/>
                    <input type="text" value={email} autoComplete="username"
                      onChange={e=>{setEmail(e.target.value);setError("");}}
                      placeholder="usuario@civac.co"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white transition-all"
                      style={{ background:"rgba(0,245,212,0.04)", border:"1px solid rgba(0,245,212,0.16)", outline:"none" }}
                      onFocus={e=>{(e.target as HTMLElement).style.borderColor="rgba(0,245,212,0.45)";(e.target as HTMLElement).style.boxShadow="0 0 16px rgba(0,245,212,0.10)";}}
                      onBlur={e=>{(e.target as HTMLElement).style.borderColor="rgba(0,245,212,0.16)";(e.target as HTMLElement).style.boxShadow="none";}}/>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color:"rgba(0,245,212,0.4)" }}>
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"rgba(0,245,212,0.35)" }}/>
                    <input type={showPass?"text":"password"} value={password} autoComplete="current-password"
                      onChange={e=>{setPassword(e.target.value);setError("");}}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl text-sm text-white transition-all"
                      style={{ background:"rgba(0,245,212,0.04)", border:"1px solid rgba(0,245,212,0.16)", outline:"none" }}
                      onFocus={e=>{(e.target as HTMLElement).style.borderColor="rgba(0,245,212,0.45)";(e.target as HTMLElement).style.boxShadow="0 0 16px rgba(0,245,212,0.10)";}}
                      onBlur={e=>{(e.target as HTMLElement).style.borderColor="rgba(0,245,212,0.16)";(e.target as HTMLElement).style.boxShadow="none";}}/>
                    <button type="button" onClick={()=>setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                      {showPass?<EyeOff size={14}/>:<Eye size={14}/>}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
                    style={{ background:"rgba(255,77,109,0.08)", border:"1px solid rgba(255,77,109,0.22)", color:"#ff6b8a" }}>
                    <AlertTriangle size={11} className="flex-shrink-0"/>{error}
                  </div>
                )}

                <button type="submit" disabled={loading || !email}
                  className="w-full py-3.5 rounded-2xl font-black text-sm text-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 relative overflow-hidden group"
                  style={{
                    background:"linear-gradient(135deg,#00f5d4,#00a896,#00c8ff)",
                    boxShadow:"0 0 36px rgba(0,245,212,0.45), 0 8px 20px rgba(0,0,0,0.4)",
                    border:"1.5px solid rgba(0,245,212,0.6)",
                  }}>
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.16) 0%,transparent 60%)" }}/>
                  {loading
                    ? <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>
                        Verificando…
                      </span>
                    : <span className="relative z-10 flex items-center justify-center gap-2 font-black tracking-wide">
                        <span style={{ filter:"drop-shadow(0 0 4px rgba(0,0,0,0.3))" }}>⬡</span>
                        Ingresar al portal CIVAC
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200"/>
                      </span>}
                </button>
              </form>

              {/* Bottom note */}
              <div className="mt-4 pt-3.5 text-center" style={{ borderTop:"1px solid rgba(0,245,212,0.07)" }}>
                <p className="text-[9px]" style={{ color:"rgba(255,255,255,0.18)" }}>
                  GanaderIA CIVAC PRO v2.1 · Control Inteligente de Valor Agropecuario · Colombia
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
