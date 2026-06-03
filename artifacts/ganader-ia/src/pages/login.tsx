import { useState, useEffect, useRef } from "react";
import { useAuth, Account, PLAN_LABEL, PLAN_COLOR, PLAN_COLOR2, PLAN_GLOW, PLAN_ICON, PLAN_PRECIOS, PLAN_GRADIENT, CIVAC_STAFF_IDS, type PlanId } from "@/lib/auth";
import {
  Eye, EyeOff, Lock, User, Shield, Zap, Star, Crown,
  Check, X, Leaf, ArrowRight, Wifi, Smartphone, CreditCard,
  Phone, Building2, ChevronRight, CheckCircle2, ExternalLink,
  Settings2, AlertTriangle, Copy, Activity, Globe, Cpu,
  TrendingUp, MapPin, Thermometer, Wind, Droplets, BarChart3,
  Server, CheckCircle, Clock, Layers
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
      {/* Layer 1: Colombian cattle panorama */}
      <div className="absolute inset-0" style={{
        backgroundImage:"url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1920&q=50&auto=format&fit=crop')",
        backgroundSize:"cover", backgroundPosition:"center 35%",
        transform:"scale(1.05)",
        animation:"slow-drift 30s ease-in-out infinite alternate",
      }}/>
      {/* Layer 2: Rich dark-navy gradient overlay */}
      <div className="absolute inset-0" style={{
        background:"linear-gradient(165deg,rgba(3,9,22,0.94) 0%,rgba(6,16,40,0.88) 35%,rgba(2,10,20,0.96) 100%)",
      }}/>
      {/* Layer 3: Bottom pastoral fade */}
      <div className="absolute bottom-0 left-0 right-0 h-72" style={{
        backgroundImage:"url('https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1920&q=30&auto=format&fit=crop&crop=bottom')",
        backgroundSize:"cover", backgroundPosition:"center bottom", opacity:0.22,
        maskImage:"linear-gradient(transparent 0%,rgba(0,0,0,0.9) 60%)",
        WebkitMaskImage:"linear-gradient(transparent 0%,rgba(0,0,0,0.9) 60%)",
      }}/>
      {/* Layer 4: Tech dot-grid */}
      <div className="absolute inset-0" style={{
        backgroundImage:"radial-gradient(circle, rgba(0,245,212,0.035) 1px, transparent 1px)",
        backgroundSize:"48px 48px",
      }}/>
      {/* Layer 5: Colombian flag accent glow (amarillo, azul, rojo) */}
      <div className="absolute inset-0" style={{ background:`
        radial-gradient(ellipse 55% 35% at 12% 8%,  rgba(0,245,212,0.08) 0%, transparent 65%),
        radial-gradient(ellipse 45% 45% at 88% 88%, rgba(57,255,126,0.07) 0%, transparent 65%),
        radial-gradient(ellipse 35% 35% at 82% 12%, rgba(0,180,255,0.05)  0%, transparent 60%),
        radial-gradient(ellipse 60% 30% at 50% 100%,rgba(251,191,36,0.04) 0%, transparent 60%)`}}/>
      {/* Layer 6: Animated scan line */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-30"
        style={{ background:"linear-gradient(90deg,transparent 0%,#00f5d4 45%,#00c8ff 55%,transparent 100%)", animation:"scan-line 10s linear infinite" }}/>
      {/* Layer 7: Right side tech accent */}
      <div className="absolute right-0 top-0 bottom-0 w-1 opacity-20"
        style={{ background:"linear-gradient(180deg,transparent,#00f5d4 40%,#00c8ff 60%,transparent)", animation:"pulse-vert 4s ease-in-out infinite" }}/>
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
   LIVE STATS WIDGETS BAR
═══════════════════════════════════════════════════════════════════════════════ */
function StatsWidgets() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t+1), 3000); return () => clearInterval(id); }, []);

  const litros   = 84 + Math.sin(tick * 0.7) * 2;
  const temp     = (22.4 + Math.sin(tick * 0.4) * 0.6).toFixed(1);
  const humidity = (68 + Math.sin(tick * 0.5) * 3).toFixed(0);
  const uptime   = "99.8%";

  const stats = [
    { icon:<Activity size={13}/>,  label:"Producción", val:`${litros.toFixed(0)} L/día`, sub:"↑ 3.2% vs ayer",  c:"#00f5d4", g:"0,245,212",   pulse:true  },
    { icon:<MapPin size={13}/>,    label:"GPS Online",  val:"13 collares",               sub:"Todos activos",    c:"#00c8ff", g:"0,200,255",   pulse:true  },
    { icon:<Thermometer size={13}/>,label:"Temperatura",val:`${temp}°C`,                sub:"Zona Andina",      c:"#fbbf24", g:"251,191,36",  pulse:false },
    { icon:<Droplets size={13}/>,  label:"Humedad",     val:`${humidity}%`,              sub:"Óptimo ganado",   c:"#60a5fa", g:"96,165,250",  pulse:false },
    { icon:<TrendingUp size={13}/>,label:"Utilidad",    val:"$40.2M",                   sub:"Mes actual COP",   c:"#39ff7e", g:"57,255,126",  pulse:false },
    { icon:<Server size={13}/>,    label:"Servidores",  val:uptime,                      sub:"Analytics + GPS",  c:"#e879f9", g:"232,121,249", pulse:true  },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-5">
      {stats.map((s,i) => (
        <div key={i}
          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl transition-all hover:scale-105 cursor-default"
          style={{
            background:`rgba(${s.g},0.07)`,
            border:`1px solid rgba(${s.g},0.22)`,
            backdropFilter:"blur(12px)",
            boxShadow:`0 0 12px rgba(${s.g},0.1)`,
            animation: s.pulse ? `pulse-glow-${i} 2.5s ease-in-out infinite` : undefined,
          }}>
          <div style={{ color:s.c }}>{s.icon}</div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color:`rgba(${s.g},0.55)` }}>{s.label}</div>
            <div className="text-xs font-black text-white leading-none">{s.val}</div>
          </div>
          <div className="text-[8px] ml-1" style={{ color:`rgba(${s.g},0.45)` }}>{s.sub}</div>
          {s.pulse && (
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background:s.c, boxShadow:`0 0 6px ${s.c}`, animation:"ping-dot 1.5s ease-in-out infinite" }}/>
          )}
        </div>
      ))}
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
    "🔒 CIVAC PRO v7.0 · 32 módulos activos","🏆 #1 Software Ganadero Colombia",
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
  return (
    <div className="hidden xl:flex flex-col gap-3 w-40 flex-shrink-0">
      {[
        { img:"https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=320&h=200&q=70&auto=format&fit=crop", label:"🐄 Inventario", sub:"13 cabezas", c:"#39ff7e", g:"57,255,126" },
        { img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&h=200&q=70&auto=format&fit=crop", label:"🌿 Potrero Norte", sub:"En pastoreo", c:"#00f5d4", g:"0,245,212" },
        { img:"https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=320&h=200&q=70&auto=format&fit=crop", label:"📡 GPS Activo", sub:"13/13 online",  c:"#00c8ff", g:"0,200,255" },
      ].map((w,i) => (
        <div key={i} className="rounded-2xl overflow-hidden relative group transition-all hover:scale-[1.03]"
          style={{ border:`1px solid rgba(${w.g},0.25)`, boxShadow:`0 0 16px rgba(${w.g},0.1)` }}>
          <img src={w.img} alt={w.label}
            className="w-full h-20 object-cover transition-transform group-hover:scale-110 duration-500"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
          <div className="absolute inset-0" style={{ background:`linear-gradient(transparent 30%,rgba(0,0,0,0.8) 100%)` }}/>
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="text-[9px] font-black" style={{ color:w.c }}>{w.label}</div>
            <div className="text-[8px] text-white/50">{w.sub}</div>
          </div>
          {/* Hover glow line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background:`linear-gradient(90deg,transparent,${w.c},transparent)` }}/>
        </div>
      ))}
      {/* Service status widget */}
      <div className="rounded-2xl p-3"
        style={{ background:"rgba(0,0,0,0.5)", border:"1px solid rgba(0,245,212,0.15)", backdropFilter:"blur(12px)" }}>
        <div className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color:"rgba(0,245,212,0.5)" }}>
          🟢 Servicios
        </div>
        {[
          { name:"Frontend PWA", ok:true },
          { name:"Analytics API", ok:true },
          { name:"GPS Django",    ok:true },
          { name:"Sync Server",   ok:false },
        ].map(s => (
          <div key={s.name} className="flex items-center justify-between mb-1">
            <span className="text-[8px] text-white/40">{s.name}</span>
            <span className="text-[8px] font-bold" style={{ color:s.ok?"#39ff7e":"#ff6b6b" }}>
              {s.ok ? "●" : "○"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   RIGHT SIDE IMAGE WIDGETS
═══════════════════════════════════════════════════════════════════════════════ */
function RightWidgets() {
  return (
    <div className="hidden xl:flex flex-col gap-3 w-40 flex-shrink-0">
      {[
        { img:"https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?w=320&h=200&q=70&auto=format&fit=crop", label:"🥛 Producción", sub:"84 L/día récord", c:"#fbbf24", g:"251,191,36" },
        { img:"https://images.unsplash.com/photo-1560693559-aa2f85ef89de?w=320&h=200&q=70&auto=format&fit=crop", label:"🧬 Genética", sub:"DEP Score 94.2",   c:"#a855f7", g:"168,85,247" },
        { img:"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=320&h=200&q=70&auto=format&fit=crop", label:"🌱 Huella CO₂", sub:"-18% IPCC 2019",  c:"#39ff7e", g:"57,255,126" },
      ].map((w,i) => (
        <div key={i} className="rounded-2xl overflow-hidden relative group transition-all hover:scale-[1.03]"
          style={{ border:`1px solid rgba(${w.g},0.25)`, boxShadow:`0 0 16px rgba(${w.g},0.1)` }}>
          <img src={w.img} alt={w.label}
            className="w-full h-20 object-cover transition-transform group-hover:scale-110 duration-500"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
          <div className="absolute inset-0" style={{ background:`linear-gradient(transparent 30%,rgba(0,0,0,0.8) 100%)` }}/>
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="text-[9px] font-black" style={{ color:w.c }}>{w.label}</div>
            <div className="text-[8px] text-white/50">{w.sub}</div>
          </div>
          <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background:`linear-gradient(90deg,transparent,${w.c},transparent)` }}/>
        </div>
      ))}
      {/* Module count widget */}
      <div className="rounded-2xl p-3"
        style={{ background:"rgba(0,0,0,0.5)", border:"1px solid rgba(168,85,247,0.2)", backdropFilter:"blur(12px)" }}>
        <div className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color:"rgba(168,85,247,0.55)" }}>
          📦 Módulos v7.0 · 32 activos
        </div>
        {[
          { name:"Productivos", val:"20", c:"#00f5d4" },
          { name:"Sanidad",     val:"1",  c:"#39ff7e" },
          { name:"Trazabilidad",val:"1",  c:"#a855f7" },
          { name:"Total activos",val:"22",c:"#fbbf24" },
        ].map(m => (
          <div key={m.name} className="flex items-center justify-between mb-1">
            <span className="text-[8px] text-white/40">{m.name}</span>
            <span className="text-[9px] font-black" style={{ color:m.c }}>{m.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LOGO
═══════════════════════════════════════════════════════════════════════════════ */
function CivacLogo({ size = 80 }: { size?: number }) {
  return (
    <div className="relative inline-block" style={{ width:size, height:size }}>
      <div className="w-full h-full rounded-[26%] overflow-hidden"
        style={{ border:"2.5px solid rgba(0,245,212,0.85)", boxShadow:"0 0 32px rgba(0,245,212,0.6), 0 0 70px rgba(0,200,255,0.28), inset 0 0 20px rgba(0,245,212,0.08)" }}>
        <img src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=240&h=240&q=80&auto=format&fit=crop&crop=face"
          alt="GanaderIA" style={{ width:"100%", height:"100%", objectFit:"cover" }}
          onError={e => {
            const el = e.currentTarget.parentElement as HTMLElement;
            el.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;background:linear-gradient(135deg,#0a3d22,#082818)">🐄</div>';
          }} />
      </div>
      <div className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center font-black"
        style={{ width:size*0.30, height:size*0.30, background:"linear-gradient(135deg,#00f5d4,#00a896)", fontSize:size*0.095, color:"#000", border:"2px solid #0e1e38", boxShadow:"0 0 12px rgba(0,245,212,0.9)" }}>
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

  const handleClick = () => {
    if (configured === false) {
      onError?.("Google OAuth no configurado. El administrador debe agregar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET.");
      return;
    }
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
      {configured === false && (
        <p className="mt-2 text-center text-[10px]" style={{ color:"rgba(255,200,0,0.7)" }}>
          Google OAuth pendiente de configuración
        </p>
      )}
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
  const [tab, setTab]             = useState<"login"|"cuentas"|"planes">("login");
  const [entered, setEntered]     = useState(false);
  const [payPlan, setPayPlan]     = useState<PlanId|null>(null);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string|null>(null);
  const [inviteBanner, setInviteBanner] = useState<{nombre:string;plan:string}|null>(null);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<{nombre:string;email:string;googleFoto?:string}|null>(null);

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

      {/* Admin gate — secret click area bottom-right */}
      <button onClick={() => setShowAdminForm(true)}
        className="fixed bottom-4 right-4 z-40 w-8 h-8 opacity-0 hover:opacity-100 transition-opacity duration-500"
        title="Panel admin" style={{ cursor:"default" }}>
        <Settings2 size={14} className="text-white/20" />
      </button>

      {/* Main container */}
      <div className={`relative z-10 w-full max-w-6xl px-4 py-6 transition-all duration-700 ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

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
              <span style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", filter:"drop-shadow(0 0 12px rgba(0,245,212,0.5))" }}>v7</span>
            </h1>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-lg leading-none"
                style={{ background:"linear-gradient(135deg,#00f5d4,#00a896)", color:"black", letterSpacing:"0.05em", boxShadow:"0 0 14px rgba(0,245,212,0.45)" }}>GanaderIA</span>
              <span className="text-[8px] font-black px-2 py-0.5 rounded-md leading-none"
                style={{ background:"linear-gradient(135deg,#fbbf24,#ea580c)", color:"white", letterSpacing:"0.03em" }}>PRO Colombia</span>
            </div>
          </div>

          <p className="text-sm font-semibold mb-3" style={{ color:"rgba(0,245,212,0.7)" }}>
            Control Inteligente de Valor Agropecuario · Colombia 🇨🇴
          </p>

          {/* Feature badges with hover glow */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {[
              { icon:<Wifi size={11}/>,       label:"Offline PWA",    c:"0,245,212",   glow:"#00f5d4" },
              { icon:<Zap size={11}/>,        label:"Bluetooth BT",   c:"255,149,0",   glow:"#ff9500" },
              { icon:<Smartphone size={11}/>, label:"GPS Real-Time",  c:"0,200,255",   glow:"#00c8ff" },
              { icon:<Star size={11}/>,       label:"IA Predictiva",  c:"232,121,249", glow:"#e879f9" },
              { icon:<Globe size={11}/>,      label:"32 Módulos",     c:"57,255,126",  glow:"#39ff7e" },
              { icon:<Cpu size={11}/>,        label:"IndexedDB v1",   c:"168,85,247",  glow:"#a855f7" },
            ].map(p => (
              <span key={p.label}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all hover:scale-110 cursor-default"
                style={{ background:`rgba(${p.c},0.09)`, border:`1px solid rgba(${p.c},0.28)`, color:`rgba(${p.c},0.9)`, boxShadow:`0 0 0px rgba(${p.c},0)`, transition:"all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow=`0 0 14px rgba(${p.c},0.35)`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow=`0 0 0px rgba(${p.c},0)`; }}>
                {p.icon}{p.label}
              </span>
            ))}
          </div>

          {/* Tabs — 3 botones */}
          <div className="flex items-center justify-center gap-2">
            {[
              { id:"login"   as const, label:"Iniciar Sesión", emoji:"🔐" },
              { id:"cuentas" as const, label:"Cuentas",         emoji:"👥" },
              { id:"planes"  as const, label:"Planes",         emoji:"💰" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-250 hover:scale-[1.03] active:scale-[0.98]"
                style={tab===t.id
                  ? { background:"linear-gradient(135deg,#00f5d4,#00c896)", color:"black", boxShadow:"0 0 24px #00f5d455", transform:"scale(1.04)" }
                  : { background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.55)", border:"1px solid rgba(255,255,255,0.1)" }}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Live Stats Widgets ── */}
        <StatsWidgets />

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
                      className="w-full py-4 rounded-2xl font-black text-base text-black transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-1"
                      style={{ background:"linear-gradient(135deg,#00f5d4,#00c896)", boxShadow:"0 0 32px rgba(0,245,212,0.45)" }}>
                      {loading
                        ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-black/20 border-t-black/80 rounded-full animate-spin"/>Verificando…</span>
                        : <span className="flex items-center justify-center gap-2">Ingresar al sistema <ArrowRight className="w-5 h-5"/></span>}
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
                    <button onClick={() => setTab("planes")}
                      className="text-[11px] font-semibold transition-colors hover:opacity-80"
                      style={{ color:"rgba(0,245,212,0.5)" }}>
                      ¿Nuevo? Ver planes →
                    </button>
                    <button onClick={() => setTab("cuentas")}
                      className="text-[11px] font-semibold transition-colors hover:opacity-80"
                      style={{ color:"rgba(255,255,255,0.2)" }}>
                      Demo / Admin →
                    </button>
                  </div>
                </div>
              </div>

              {/* Below-card trust badges */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-2xl p-3" style={{ background:"rgba(57,255,126,0.04)", border:"1px solid rgba(57,255,126,0.12)" }}>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon:"🔒", label:"SSL 256-bit",   sub:"Cifrado total" },
                      { icon:"📱", label:"PWA Offline",   sub:"Sin internet"  },
                      { icon:"🧬", label:"IndexedDB v1",  sub:"50k registros" },
                      { icon:"🛡️", label:"DIAN Cert.",    sub:"Factura elect." },
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-1.5">
                        <span className="text-sm">{s.icon}</span>
                        <div>
                          <div className="text-[9px] font-bold text-white/55">{s.label}</div>
                          <div className="text-[8px] text-white/25">{s.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl p-3 relative overflow-hidden"
                  style={{ background:"linear-gradient(135deg,rgba(252,209,22,0.07),rgba(0,56,168,0.06))", border:"1px solid rgba(252,209,22,0.15)" }}>
                  <div className="absolute top-0 left-0 right-0 h-0.5 flex">
                    <div className="flex-1" style={{ background:"#FCD116" }}/>
                    <div className="flex-1" style={{ background:"#003087" }}/>
                    <div className="flex-1" style={{ background:"#CE1126" }}/>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">🇨🇴</span>
                    <div>
                      <div className="text-[10px] font-black text-white">100% Colombia</div>
                      <div className="text-[8px]" style={{ color:"rgba(252,209,22,0.55)" }}>Universal Business Technology</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {["🐄","🤖","🏆"].map(t=>(
                      <span key={t} className="text-[11px]">{t}</span>
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
                          className="w-full py-2.5 rounded-2xl font-black text-xs transition-all hover:bg-white/10 hover:scale-[1.02]"
                          style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.6)", border:"1px solid rgba(255,255,255,0.1)" }}>
                          Empezar gratis →
                        </button>
                      ) : (
                        <button onClick={() => setPayPlan(pid)}
                          className="w-full py-2.5 rounded-2xl font-black text-xs transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                          style={{ background:`linear-gradient(135deg,${fg[0]},${fg[1]})`, color:pid==="platino"?"white":"black", boxShadow:`0 0 20px ${fg[0]}45` }}>
                          💳 Comprar — {PLAN_PRECIOS_LABEL[pid]}
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
            TAB: CUENTAS DEMO
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === "cuentas" && (
          <div className="flex gap-4 items-start">

            {/* Left farm widgets */}
            <FarmImageWidgets />

            {/* Main center content — full width (no login form column) */}
            <div className="flex-1 min-w-0">
              <div className="space-y-2.5">
                <p className="text-center text-[10px] font-black uppercase tracking-[0.2em]" style={{ color:"rgba(0,245,212,0.4)" }}>
                  — Seleccione su cuenta —
                </p>
                {clientAccounts.map(account => {
                  const rc  = CLIENT_CONFIG[account.role] ?? CLIENT_CONFIG.viewer;
                  const isLoading = loadingId === account.id;
                  const plan = (account.plan ?? "basico") as PlanId;
                  const feats  = PLAN_FEATURES[plan];
                  const pp  = PLAN_COLOR[plan], pp2 = PLAN_COLOR2[plan], pg = PLAN_GLOW[plan];
                  const isHov = hoveredCard === account.id;
                  return (
                    <div key={account.id}
                      className="relative rounded-3xl overflow-hidden transition-all duration-300"
                      style={{
                        background: isHov
                          ? `linear-gradient(145deg,rgba(${rc.glow},0.18),rgba(${rc.glow},0.06),rgba(0,0,0,0.65))`
                          : `linear-gradient(145deg,rgba(${rc.glow},0.09),rgba(0,0,0,0.58))`,
                        border:`1.5px solid rgba(${rc.glow},${isHov ? "0.65" : "0.32"})`,
                        backdropFilter:"blur(16px)",
                        boxShadow: isHov
                          ? `0 0 44px rgba(${rc.glow},0.30), 0 12px 36px rgba(0,0,0,0.5)`
                          : `0 0 16px rgba(${rc.glow},0.12)`,
                        transform: isHov ? "translateY(-2px)" : "none",
                      }}
                      onMouseEnter={() => setHoveredCard(account.id)}
                      onMouseLeave={() => setHoveredCard(null)}>

                      {/* Role color top stripe — thick, primary identity */}
                      <div className="h-1 w-full" style={{ background:`linear-gradient(90deg,${rc.from},${rc.to},transparent)` }} />
                      {/* Plan stripe below — thin, secondary info */}
                      <div className="h-px w-1/2 opacity-50" style={{ background:`linear-gradient(90deg,${pp},transparent)` }} />

                      {/* Left vertical accent bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl"
                        style={{ background:`linear-gradient(180deg,${rc.from},${rc.to})`, opacity: isHov ? 0.9 : 0.55 }} />

                      {/* Hover glow overlay */}
                      {isHov && (
                        <div className="absolute inset-0 pointer-events-none" style={{
                          background:`radial-gradient(ellipse 60% 50% at 20% 50%, rgba(${rc.glow},0.06) 0%, transparent 70%)`
                        }}/>
                      )}

                      <div className="p-4 flex items-center gap-4 relative">
                        {/* Avatar with glow on hover */}
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                          style={{
                            background:`linear-gradient(135deg,${rc.from},${rc.to})`,
                            boxShadow: isHov ? `0 0 28px rgba(${rc.glow},0.7)` : `0 0 18px rgba(${rc.glow},0.45)`,
                            transform: isHov ? "scale(1.08) rotate(-2deg)" : "scale(1)",
                          }}>
                          <span style={{ fontSize:"1.8rem", lineHeight:1 }}>{rc.emoji}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 pl-1">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="font-black text-white text-base leading-tight">{account.nombre.split(" ").slice(0,3).join(" ")}</span>
                            {/* Role badge — colored per type */}
                            <span className="inline-flex items-center gap-1 rounded-full font-black uppercase tracking-wide text-[8px] px-2 py-0.5"
                              style={{ background:`rgba(${rc.glow},0.14)`, border:`1.5px solid rgba(${rc.glow},0.50)`, color:rc.color, boxShadow:`0 0 8px rgba(${rc.glow},0.25)`, letterSpacing:"0.07em" }}>
                              {rc.emoji} {rc.label}
                            </span>
                            {CIVAC_STAFF_IDS.includes(account.id) && (
                              <span className="inline-flex items-center gap-1 rounded-full font-black uppercase tracking-wide text-[8px] px-2 py-0.5"
                                style={{ background:"rgba(0,245,212,0.10)", border:"1.5px solid rgba(0,245,212,0.40)", color:"#00f5d4", letterSpacing:"0.07em" }}>
                                ⬡ CIVAC
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] mb-1.5" style={{ color:`rgba(${rc.glow},0.55)` }}>{account.cargo}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                            {feats.slice(0,4).map(f=>(
                              <span key={f} className="text-[9px] flex items-center gap-0.5" style={{ color:"rgba(255,255,255,0.30)" }}>
                                <span style={{ color:rc.color, fontSize:"7px" }}>✓</span>{f}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button onClick={() => handleQuick(account)} disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-xs transition-all duration-200 hover:scale-105 active:scale-[0.96] disabled:opacity-50"
                            style={{
                              background:`linear-gradient(135deg,${rc.from},${rc.to})`,
                              color: ["viewer","vet","superadmin","sales"].includes(account.role) ? "white" : "black",
                              boxShadow: isHov ? `0 0 24px rgba(${rc.glow},0.60)` : `0 0 14px rgba(${rc.glow},0.30)`,
                            }}>
                            {isLoading
                              ? <div className="w-3 h-3 border border-current/40 border-t-current rounded-full animate-spin"/>
                              : <ArrowRight size={12}/>}
                            {isLoading ? "Entrando…" : "Entrar"}
                          </button>
                          {plan !== "platino" && (
                            <button onClick={() => setPayPlan(plan==="basico"?"pro":plan==="pro"?"premium":"platino")}
                              className="flex items-center gap-1 px-3 py-1 rounded-xl text-[9px] font-bold transition-all hover:opacity-80 hover:scale-[1.03]"
                              style={{ background:`rgba(${rc.glow},0.05)`, border:`1px solid rgba(${rc.glow},0.15)`, color:`rgba(${rc.glow},0.45)` }}>
                              ⬆ Mejorar plan
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Plan progress bar */}
                      <div className="px-4 pb-3">
                        <div className="flex items-center justify-between text-[9px] mb-1">
                          <span style={{ color:`rgba(${rc.glow},0.5)` }}>Plan {PLAN_LABEL[plan]} · {feats.length} módulos activos</span>
                          <button onClick={() => setTab("planes")} className="text-white/20 hover:text-white/50 transition-colors">Ver planes →</button>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{
                            width:plan==="basico"?"25%":plan==="pro"?"50%":plan==="premium"?"75%":"100%",
                            background:`linear-gradient(90deg,${pp},${pp2})`,
                            boxShadow:`0 0 6px rgba(${pg},0.6)`,
                          }}/>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-2xl text-[9px] transition-all"
                  style={{ background:"rgba(57,255,126,0.04)", border:"1px solid rgba(57,255,126,0.12)", color:"rgba(57,255,126,0.5)" }}>
                  <Shield size={11}/> Autenticación segura · Sesión cifrada · Sin contraseña en servidor
                </div>

                {/* CTA — login principal */}
                <button onClick={() => setTab("login")}
                  className="w-full py-3 rounded-2xl font-black text-sm text-black transition-all hover:opacity-90 active:scale-[0.99]"
                  style={{ background:"linear-gradient(135deg,#00f5d4,#00c896)", boxShadow:"0 0 24px rgba(0,245,212,0.35)" }}>
                  🔐 Ir al Login →
                </button>
              </div>
            </div>

            {/* Right farm widgets */}
            <RightWidgets />
          </div>
        )}

        {/* Footer */}
        <p className="text-center mt-6 text-[9px]" style={{ color:"rgba(255,255,255,0.12)" }}>
          GanaderIA CIVAC PRO v7.0 · 32 módulos · Control Inteligente de Valor Agropecuario · Colombia {new Date().getFullYear()} · Universal Business Technology
        </p>
        <p className="text-center mt-2">
          <a href="/server" className="text-[9px] font-mono transition-colors hover:opacity-60" style={{ color:"rgba(0,245,212,0.18)", letterSpacing:"0.1em" }}>
            ⬡ CIVAC SERVER ACCESS
          </a>
        </p>
      </div>

      {/* ── ADMIN ACCESS MODAL ── */}
      {showAdminForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.92)", backdropFilter:"blur(10px)" }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background:"linear-gradient(145deg,#040d1a,#071325)", border:"1px solid rgba(255,149,0,0.25)", boxShadow:"0 0 70px rgba(255,149,0,0.10)" }}>
            <div className="h-1" style={{ background:"linear-gradient(90deg,#ff9500,#ff6b00,#fbbf24)" }} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background:"rgba(255,149,0,0.12)", border:"1px solid rgba(255,149,0,0.3)", boxShadow:"0 0 16px rgba(255,149,0,0.2)" }}>
                  <Shield size={18} className="text-orange-400" />
                </div>
                <div>
                  <h2 className="font-black text-white text-base">Panel de Administración</h2>
                  <p className="text-[10px] text-white/30">Acceso restringido — Solo administradores</p>
                </div>
                <button onClick={() => setShowAdminForm(false)} className="ml-auto w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
                  <X size={14} className="text-white/40" />
                </button>
              </div>
              <div className="rounded-2xl p-3 mb-4" style={{ background:"rgba(255,149,0,0.06)", border:"1px solid rgba(255,149,0,0.15)" }}>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={12} className="text-orange-400 flex-shrink-0 mt-0.5"/>
                  <p className="text-[10px] text-orange-300/70">Acceso exclusivo para administración de plataforma. No es para uso del sistema de ganadería.</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1">Email administrador</label>
                  <input type="text" value={email} onChange={e=>{setEmail(e.target.value);setError("");}}
                    placeholder="admin@ganader.ia"
                    className="w-full px-4 py-3 rounded-2xl text-sm text-white transition-all"
                    style={{ background:"rgba(255,149,0,0.04)", border:"1px solid rgba(255,149,0,0.18)", outline:"none" }} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1">Contraseña</label>
                  <div className="relative">
                    <input type={showPass?"text":"password"} value={password} onChange={e=>{setPassword(e.target.value);setError("");}}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-3 rounded-2xl text-sm text-white transition-all"
                      style={{ background:"rgba(255,149,0,0.04)", border:"1px solid rgba(255,149,0,0.18)", outline:"none" }} />
                    <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPass?<EyeOff size={14}/>:<Eye size={14}/>}
                    </button>
                  </div>
                </div>
                {error && <div className="text-xs text-red-400 flex items-center gap-1.5"><AlertTriangle size={11}/>{error}</div>}
                <button type="submit" disabled={loading || !email}
                  className="w-full py-3 rounded-2xl font-black text-sm text-black transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{ background:"linear-gradient(135deg,#ff9500,#ff6b00)", boxShadow:"0 0 22px rgba(255,149,0,0.35)" }}>
                  {loading ? "Verificando…" : "Acceder al panel →"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
