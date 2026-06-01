import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth, CIVAC_STAFF_IDS } from "@/lib/auth";
import {
  Server, Activity, Globe, Terminal, Shield, Users,
  Download, RefreshCw, Package, Cpu, Database,
  GitBranch, Zap, Bell, Settings, LogOut, ChevronRight,
  CheckCircle, AlertTriangle, Clock, BarChart3, Code,
  Lock, Layers, Monitor, Wifi, HardDrive, TrendingUp,
  Play, Pause, RotateCcw, ExternalLink, Copy, Key,
  Building2, Crown, Plus, Eye, ChevronDown, ChevronUp,
  Menu, X, Flag, Radio,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   DATA / CONSTANTS
══════════════════════════════════════════════════════════════════ */
const SERVICES = [
  { id:"api",       name:"API Server",          port:8080, tech:"Node/Express",  color:"#00f5d4", glow:"0,245,212",    icon:"⚡", desc:"REST API principal · 28 endpoints · JWT auth" },
  { id:"analytics", name:"Analytics Server",    port:8099, tech:"Python/Flask",   color:"#a78bfa", glow:"167,139,250",  icon:"📊", desc:"Estadísticas ganaderas · pandas · numpy" },
  { id:"gps",       name:"GPS Server",          port:8000, tech:"Python/Django",  color:"#39ff7e", glow:"57,255,126",   icon:"📡", desc:"Tracking collares · SQLite · Django REST" },
  { id:"frontend",  name:"Frontend PWA",        port:5000, tech:"React/Vite",     color:"#00c8ff", glow:"0,200,255",    icon:"🌐", desc:"React 18 · Tailwind · shadcn/ui · Service Worker v6" },
];

const PWA_VERSIONS = [
  { v:"1.0.0", date:"2026-05-26", status:"current", label:"Estable", color:"#00f5d4", plans:["basico","pro","premium","platino"], size:"2.4 MB", downloads:0,
    features:["Panel Admin 14 tabs","GPS tracking real","Pesaje Bluetooth","Predicción IA","Módulos CO₂","Multi-finca","PWA offline v6"] },
  { v:"0.9.5", date:"2026-05-21", status:"lts",     label:"LTS",     color:"#fbbf24", plans:["basico","pro","premium","platino"], size:"2.1 MB", downloads:12,
    features:["Roles Developer + SuperAdmin","Generación licencias","Fix registerUser plan"] },
  { v:"0.9.0", date:"2026-04-28", status:"stable",  label:"Stable",  color:"#94a3b8", plans:["pro","premium","platino"], size:"2.0 MB", downloads:7,
    features:["Pesaje BT 9-byte parser","RFID CIVAC","Bluetooth Web API"] },
  { v:"0.8.0", date:"2026-03-15", status:"archived",label:"Legacy",  color:"#6b7280", plans:["pro","premium","platino"], size:"1.8 MB", downloads:3,
    features:["Admin dashboard","Wompi Colombia","API keys"] },
];

const PLAN_DEMOS = [
  { id:"basico",  label:"Demo Básico",   email:"demo_basico@ganaderia.co",   pwd:"demo2026", color:"#94a3b8", icon:"🥈", modules:["Dashboard","Inventario","Producción","Potreros","Alertas"] },
  { id:"pro",     label:"Demo PRO",      email:"demo_pro@ganaderia.co",      pwd:"demo2026", color:"#00f5d4", icon:"⚡", modules:["Todo Básico + GPS","Pesaje BT","Reproducción","Genética","Costos","Personal"] },
  { id:"premium", label:"Demo Premium",  email:"demo_premium@ganaderia.co",  pwd:"demo2026", color:"#fbbf24", icon:"🥇", modules:["Todo PRO + IA Predicciones","CO₂","Multi-finca","Ficha"] },
  { id:"platino", label:"Demo Platino",  email:"demo_platino@ganaderia.co",  pwd:"demo2026", color:"#cd7f32", icon:"🔶", modules:["TODO Ilimitado","Admin Panel","Usuarios","SLA 99.9%"] },
];

const CLIENT_INSTANCES = [
  { id:"INS-001", name:"Finca El Rancho Verde",   owner:"Admin Demo",       plan:"platino", status:"active",   users:4, lastSeen:"hace 2 min",  region:"Antioquia, CO", version:"1.0.0" },
  { id:"INS-002", name:"Agropecuaria Los Llanos",  owner:"Demo PRO",         plan:"pro",     status:"active",   users:2, lastSeen:"hace 15 min", region:"Meta, CO",      version:"1.0.0" },
  { id:"INS-003", name:"Ganadería Sierra Nevada",  owner:"Demo Premium",     plan:"premium", status:"active",   users:3, lastSeen:"hace 1h",     region:"Cesar, CO",     version:"0.9.5" },
  { id:"INS-004", name:"Finca Demo Básico",        owner:"Demo Básico",      plan:"basico",  status:"trial",    users:1, lastSeen:"hace 3h",     region:"Bogotá, CO",    version:"1.0.0" },
  { id:"INS-005", name:"Hacienda La Esperanza",    owner:"Cliente Platino",  plan:"platino", status:"inactive", users:6, lastSeen:"hace 2 días", region:"Córdoba, CO",   version:"0.9.5" },
];

const CIVAC_STAFF = [
  { id:"superadmin", name:"Super Administrador", email:"super@civac.co",  role:"superadmin", icon:"🔱", color:"#ff6b35", online:true,  desc:"Acceso total plataforma" },
  { id:"developer",  name:"Dev · Arquitecto",    email:"dev@civac.co",   role:"developer",  icon:"🛠️", color:"#00ff88", online:true,  desc:"Consola · Deploy · Versiones" },
  { id:"sales",      name:"María Salazar",        email:"ventas@civac.co",role:"sales",      icon:"💼", color:"#e879f9", online:false, desc:"CRM · Pipeline · Ventas" },
];

const NAV_SECTIONS = [
  { id:"hub",       icon:Monitor,    label:"Server Hub",        sub:"Estado en vivo",       color:"#00f5d4", glow:"0,245,212"    },
  { id:"servicios", icon:Server,     label:"Servicios",         sub:"4 backends activos",   color:"#39ff7e", glow:"57,255,126"   },
  { id:"versiones", icon:Package,    label:"Versiones PWA",     sub:"Descargas & build",    color:"#a78bfa", glow:"167,139,250"  },
  { id:"instancias",icon:Building2,  label:"Instancias Cliente",sub:"Clientes activos",     color:"#00c8ff", glow:"0,200,255"    },
  { id:"demos",     icon:Play,       label:"Demos & Ventas",    sub:"Cuentas demo por plan",color:"#fbbf24", glow:"251,191,36"   },
  { id:"staff",     icon:Shield,     label:"CIVAC Staff",       sub:"Cuentas internas",     color:"#ff6b35", glow:"255,107,53"   },
  { id:"dev",       icon:Terminal,   label:"Dev Console",       sub:"Logs · API · Deploy",  color:"#00ff88", glow:"0,255,136"    },
  { id:"config",    icon:Settings,   label:"Configuración",     sub:"Sistema & seguridad",  color:"#94a3b8", glow:"148,163,175"  },
];

/* ══════════════════════════════════════════════════════════════════
   SUB-PANELS
══════════════════════════════════════════════════════════════════ */
function HubPanel() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t+1), 1000); return () => clearInterval(id); }, []);
  void tick;

  const uptimeH = Math.floor(Math.random() * 100 + 200);
  const kpis = [
    { label:"Instancias activas",  val:"4 / 5",   icon:"🏘️",  color:"#00f5d4" },
    { label:"Usuarios en línea",   val:"8",        icon:"👥",  color:"#39ff7e" },
    { label:"API calls / hora",    val:"1,247",    icon:"⚡",  color:"#a78bfa" },
    { label:"Uptime servidor",     val:`${uptimeH}h`,    icon:"⏱️",  color:"#fbbf24" },
    { label:"GPS collares live",   val:"13",       icon:"📡",  color:"#00c8ff" },
    { label:"Litros tracked hoy",  val:"840 L",    icon:"🥛",  color:"#ff9500" },
  ];
  return (
    <div className="space-y-6">
      <SectionHeader icon={Monitor} label="Server Hub" sub="Estado en tiempo real de la plataforma CIVAC" color="#00f5d4" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="rounded-2xl p-4" style={{ background:"rgba(4,13,26,0.7)", border:`1px solid rgba(${k.color.slice(1)},0.12)` }}>
            <div className="text-2xl mb-2">{k.icon}</div>
            <p className="text-2xl font-black" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[11px] mt-1" style={{ color:"rgba(148,163,184,0.55)" }}>{k.label}</p>
          </div>
        ))}
      </div>
      {/* Services quick */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SERVICES.map(s => (
          <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background:"rgba(4,13,26,0.6)", border:`1px solid rgba(${s.glow},0.14)` }}>
            <div className="text-xl">{s.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white">{s.name}</p>
              <p className="text-[10px] font-mono" style={{ color:`rgba(${s.glow},0.5)` }}>:{s.port} · {s.tech}</p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold" style={{ background:`rgba(${s.glow},0.1)`, color:s.color, border:`1px solid rgba(${s.glow},0.2)` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:s.color }}/>
              <span>ONLINE</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesPanel() {
  return (
    <div className="space-y-6">
      <SectionHeader icon={Server} label="Servicios del Sistema" sub="Gestión y monitoreo de los 4 backends" color="#39ff7e" />
      <div className="space-y-4">
        {SERVICES.map(s => (
          <div key={s.id} className="rounded-2xl p-5" style={{ background:"rgba(4,13,26,0.7)", border:`1px solid rgba(${s.glow},0.18)` }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background:`rgba(${s.glow},0.1)`, border:`1px solid rgba(${s.glow},0.2)` }}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-[15px] font-black text-white">{s.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold" style={{ background:`rgba(${s.glow},0.12)`, color:s.color, border:`1px solid rgba(${s.glow},0.2)` }}>{s.tech}</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background:"rgba(57,255,126,0.1)", color:"#39ff7e", border:"1px solid rgba(57,255,126,0.2)" }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-green-400"/>ONLINE
                  </span>
                </div>
                <p className="text-[12px] mb-3" style={{ color:"rgba(148,163,184,0.6)" }}>{s.desc}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg" style={{ background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.5)", border:"1px solid rgba(255,255,255,0.06)" }}>
                    PORT :{s.port}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg" style={{ background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.5)", border:"1px solid rgba(255,255,255,0.06)" }}>
                    localhost:{s.port}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="p-2 rounded-lg transition-all hover:scale-105" style={{ background:"rgba(255,80,80,0.06)", border:"1px solid rgba(255,80,80,0.14)", color:"#ff7070" }} title="Reiniciar">
                  <RotateCcw size={14}/>
                </button>
                <button className="p-2 rounded-lg transition-all hover:scale-105" style={{ background:"rgba(148,163,184,0.06)", border:"1px solid rgba(148,163,184,0.14)", color:"rgba(148,163,184,0.5)" }} title="Ver logs">
                  <Eye size={14}/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VersionesPanel() {
  const [copied, setCopied] = useState<string|null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(()=>{});
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };
  const statusColor: Record<string,string> = { current:"#00f5d4", lts:"#fbbf24", stable:"#94a3b8", archived:"#6b7280" };
  return (
    <div className="space-y-6">
      <SectionHeader icon={Package} label="Versiones PWA" sub="Gestión de versiones · descargar para vender e instalar en clientes" color="#a78bfa" />
      <div className="space-y-4">
        {PWA_VERSIONS.map(ver => {
          const sc = statusColor[ver.status] || "#94a3b8";
          return (
            <div key={ver.v} className="rounded-2xl overflow-hidden" style={{ background:"rgba(4,13,26,0.7)", border:`1px solid rgba(167,139,250,0.12)` }}>
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-[17px] font-black" style={{ color: sc }}>v{ver.v}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background:`${sc}18`, color:sc, border:`1px solid ${sc}35` }}>{ver.label}</span>
                      {ver.status === "current" && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono" style={{ background:"rgba(0,245,212,0.1)", color:"#00f5d4", border:"1px solid rgba(0,245,212,0.2)" }}>
                          ACTUAL PRODUCCIÓN
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono" style={{ color:"rgba(148,163,184,0.4)" }}>{ver.date} · {ver.size} · {ver.downloads} descargas</p>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {ver.features.map(f => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-lg" style={{ background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.55)", border:"1px solid rgba(255,255,255,0.06)" }}>{f}</span>
                  ))}
                </div>

                {/* Plan availability */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-mono" style={{ color:"rgba(148,163,184,0.35)" }}>PLANES:</span>
                  {ver.plans.map(p => {
                    const pc: Record<string,string> = { basico:"#94a3b8", pro:"#00f5d4", premium:"#fbbf24", platino:"#cd7f32" };
                    return <span key={p} className="text-[9px] px-2 py-0.5 rounded font-bold uppercase" style={{ background:`${pc[p]}18`, color:pc[p] }}>{p}</span>;
                  })}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => copy(`civac-pro-v${ver.v}.pwa.zip`, ver.v)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-105"
                    style={{ background:"linear-gradient(135deg,rgba(167,139,250,0.15),rgba(167,139,250,0.08))", color:"#a78bfa", border:"1px solid rgba(167,139,250,0.25)" }}>
                    <Download size={13}/>
                    {copied === ver.v ? "¡Copiado!" : `Descargar v${ver.v}`}
                  </button>
                  <button onClick={() => copy(`https://civac.co/install?v=${ver.v}`, `link-${ver.v}`)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-105"
                    style={{ background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.6)", border:"1px solid rgba(255,255,255,0.08)" }}>
                    <Copy size={12}/>
                    {copied === `link-${ver.v}` ? "¡Copiado!" : "Copiar link instalación"}
                  </button>
                  {ver.status !== "current" && (
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-105"
                      style={{ background:"rgba(57,255,126,0.06)", color:"#39ff7e", border:"1px solid rgba(57,255,126,0.15)" }}>
                      <Play size={12}/>Desplegar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Build new */}
      <div className="rounded-2xl p-5 border-dashed" style={{ background:"rgba(0,245,212,0.02)", border:"2px dashed rgba(0,245,212,0.12)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"rgba(0,245,212,0.08)", border:"1px solid rgba(0,245,212,0.15)" }}>
            <Package size={18} style={{ color:"#00f5d4" }}/>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-white">Generar nueva versión</p>
            <p className="text-[11px]" style={{ color:"rgba(148,163,184,0.4)" }}>Compilar y empaquetar PWA para distribución a clientes</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold" style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", color:"#040d1a" }}>
            <Play size={13}/> Build
          </button>
        </div>
      </div>
    </div>
  );
}

function InstanciasPanel() {
  const statusStyle: Record<string,{ color:string; label:string; glow:string }> = {
    active:   { color:"#39ff7e", label:"Activa",   glow:"57,255,126" },
    trial:    { color:"#fbbf24", label:"Trial",    glow:"251,191,36" },
    inactive: { color:"#6b7280", label:"Inactiva", glow:"107,114,128" },
  };
  const planColor: Record<string,string> = { basico:"#94a3b8", pro:"#00f5d4", premium:"#fbbf24", platino:"#cd7f32" };
  return (
    <div className="space-y-6">
      <SectionHeader icon={Building2} label="Instancias de Clientes" sub="Todas las instancias PWA desplegadas y activas" color="#00c8ff" />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Total instancias", val:"5", color:"#00c8ff" },
          { label:"Activas",          val:"3", color:"#39ff7e" },
          { label:"Trial",            val:"1", color:"#fbbf24" },
          { label:"Inactivas",        val:"1", color:"#6b7280" },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-xl text-center" style={{ background:"rgba(4,13,26,0.7)", border:`1px solid rgba(${s.color.slice(1)},0.1)` }}>
            <p className="text-xl font-black" style={{ color:s.color }}>{s.val}</p>
            <p className="text-[10px] mt-0.5" style={{ color:"rgba(148,163,184,0.4)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Instance list */}
      <div className="space-y-3">
        {CLIENT_INSTANCES.map(inst => {
          const st = statusStyle[inst.status];
          return (
            <div key={inst.id} className="rounded-xl p-4" style={{ background:"rgba(4,13,26,0.65)", border:`1px solid rgba(0,200,255,0.1)` }}>
              <div className="flex items-start gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-mono" style={{ color:"rgba(0,200,255,0.4)" }}>{inst.id}</span>
                    <h3 className="text-[14px] font-bold text-white truncate">{inst.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" style={{ background:`rgba(${st.glow},0.1)`, color:st.color, border:`1px solid rgba(${st.glow},0.2)` }}>{st.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px]" style={{ color:"rgba(148,163,184,0.45)" }}>
                    <span>👤 {inst.owner}</span>
                    <span>📍 {inst.region}</span>
                    <span>👥 {inst.users} usuarios</span>
                    <span>🕐 {inst.lastSeen}</span>
                    <span className="font-mono" style={{ color:planColor[inst.plan] }}>v{inst.version}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase" style={{ background:`${planColor[inst.plan]}14`, color:planColor[inst.plan], border:`1px solid ${planColor[inst.plan]}30` }}>{inst.plan}</span>
                  <button className="p-2 rounded-lg transition-all hover:scale-105" style={{ background:"rgba(0,200,255,0.06)", border:"1px solid rgba(0,200,255,0.14)", color:"#00c8ff" }}>
                    <Eye size={13}/>
                  </button>
                  <button className="p-2 rounded-lg transition-all hover:scale-105" style={{ background:"rgba(148,163,184,0.04)", border:"1px solid rgba(148,163,184,0.1)", color:"rgba(148,163,184,0.4)" }}>
                    <Settings size={13}/>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add instance */}
      <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-dashed text-[13px] font-semibold transition-all hover:border-[rgba(0,200,255,0.3)]" style={{ background:"transparent", border:"2px dashed rgba(0,200,255,0.1)", color:"rgba(0,200,255,0.4)" }}>
        <Plus size={16}/> Nueva instancia cliente
      </button>
    </div>
  );
}

function DemosPanel() {
  const [copied, setCopied] = useState<string|null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(()=>{});
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };
  return (
    <div className="space-y-6">
      <SectionHeader icon={Play} label="Demos & Cuentas de Venta" sub="Cuentas demo por nivel de plan · para mostrar a prospectos y vender" color="#fbbf24" />
      <div className="p-3 rounded-xl flex items-start gap-3" style={{ background:"rgba(251,191,36,0.05)", border:"1px solid rgba(251,191,36,0.15)" }}>
        <AlertTriangle size={15} style={{ color:"#fbbf24", flexShrink:0, marginTop:1 }}/>
        <p className="text-[12px]" style={{ color:"rgba(251,191,36,0.7)" }}>
          Estas cuentas son exclusivas para <strong>demos comerciales</strong>. No son cuentas CIVAC Staff. Se usan para mostrar la plataforma a clientes potenciales y para que descarguen versiones de prueba.
        </p>
      </div>

      {PLAN_DEMOS.map(demo => (
        <div key={demo.id} className="rounded-2xl p-5" style={{ background:"rgba(4,13,26,0.7)", border:`1px solid ${demo.color}20` }}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background:`${demo.color}12`, border:`1px solid ${demo.color}25` }}>
              {demo.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h3 className="text-[14px] font-black text-white">{demo.label}</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" style={{ background:`${demo.color}14`, color:demo.color, border:`1px solid ${demo.color}30` }}>{demo.id}</span>
              </div>
              <p className="text-[11px] font-mono" style={{ color:"rgba(148,163,184,0.35)" }}>{demo.email}</p>
            </div>
          </div>

          {/* Modules */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {demo.modules.map(m => (
              <span key={m} className="text-[10px] px-2 py-0.5 rounded-lg" style={{ background:`${demo.color}08`, color:`${demo.color}90`, border:`1px solid ${demo.color}18` }}>{m}</span>
            ))}
          </div>

          {/* Credentials */}
          <div className="rounded-xl p-3 mb-3 font-mono text-[11px]" style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-1">
              <span style={{ color:"rgba(148,163,184,0.35)" }}>EMAIL</span>
              <button onClick={() => copy(demo.email, `e-${demo.id}`)} className="flex items-center gap-1 transition-colors" style={{ color: copied===`e-${demo.id}` ? "#39ff7e" : "rgba(148,163,184,0.3)" }}>
                <Copy size={11}/>{copied===`e-${demo.id}` ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p style={{ color: demo.color }}>{demo.email}</p>
            <div className="flex items-center justify-between mt-2 mb-1">
              <span style={{ color:"rgba(148,163,184,0.35)" }}>PASSWORD</span>
              <button onClick={() => copy(demo.pwd, `p-${demo.id}`)} className="flex items-center gap-1 transition-colors" style={{ color: copied===`p-${demo.id}` ? "#39ff7e" : "rgba(148,163,184,0.3)" }}>
                <Copy size={11}/>{copied===`p-${demo.id}` ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p style={{ color:"rgba(148,163,184,0.55)" }}>{demo.pwd}</p>
          </div>

          <button
            onClick={() => copy(`Email: ${demo.email}\nPassword: ${demo.pwd}\nURL: ${window.location.origin}`, `full-${demo.id}`)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-105"
            style={{ background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.5)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <Copy size={12}/>{copied===`full-${demo.id}` ? "¡Credenciales copiadas!" : "Copiar todo para cliente"}
          </button>
        </div>
      ))}
    </div>
  );
}

function StaffPanel() {
  return (
    <div className="space-y-6">
      <SectionHeader icon={Shield} label="CIVAC Staff" sub="Cuentas internas CIVAC · Acceso servidor y plataforma" color="#ff6b35" />
      <div className="p-3 rounded-xl flex items-start gap-3" style={{ background:"rgba(0,245,212,0.04)", border:"1px solid rgba(0,245,212,0.12)" }}>
        <Shield size={15} style={{ color:"#00f5d4", flexShrink:0, marginTop:1 }}/>
        <p className="text-[12px]" style={{ color:"rgba(0,245,212,0.6)" }}>
          Las cuentas CIVAC Staff son propias del equipo interno. Solo estas cuentas pueden acceder al <strong>CIVAC Server Panel</strong> y no aparecen en la pantalla de planes para clientes.
        </p>
      </div>

      <div className="space-y-3">
        {CIVAC_STAFF.map(staff => (
          <div key={staff.id} className="rounded-xl p-4" style={{ background:"rgba(4,13,26,0.7)", border:`1px solid rgba(255,107,53,0.12)` }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background:`${staff.color}12`, border:`1px solid ${staff.color}25` }}>
                {staff.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-[14px] font-bold text-white">{staff.name}</p>
                  {staff.online && <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:"#39ff7e", boxShadow:"0 0 6px #39ff7e" }}/>}
                </div>
                <p className="text-[11px] font-mono mb-0.5" style={{ color:staff.color }}>{staff.email}</p>
                <p className="text-[11px]" style={{ color:"rgba(148,163,184,0.4)" }}>{staff.desc}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" style={{ background:`${staff.color}12`, color:staff.color, border:`1px solid ${staff.color}25` }}>{staff.role}</span>
                <span className="text-[10px] font-mono" style={{ color: staff.online ? "#39ff7e" : "rgba(148,163,184,0.3)" }}>
                  {staff.online ? "● ONLINE" : "○ offline"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add staff */}
      <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-dashed text-[13px] font-semibold transition-all" style={{ background:"transparent", border:"2px dashed rgba(255,107,53,0.15)", color:"rgba(255,107,53,0.4)" }}>
        <Plus size={16}/> Agregar cuenta CIVAC Staff
      </button>
    </div>
  );
}

function DevConsolePanel() {
  const [cmd, setCmd] = useState("");
  const [log, setLog] = useState<string[]>([
    "[2026-06-01 18:21:03] API Server: listening on :8080",
    "[2026-06-01 18:21:05] GPS Server: Django 5.2.14 running on :8000",
    "[2026-06-01 18:21:07] Analytics: Flask serving on :8099",
    "[2026-06-01 18:21:09] Frontend PWA: Vite ready on :5000",
    "[2026-06-01 18:21:10] DB: PostgreSQL connection OK · schema synced",
    "[2026-06-01 18:21:11] CIVAC Server: all systems nominal ✓",
  ]);
  const execCmd = () => {
    if (!cmd.trim()) return;
    setLog(prev => [...prev, `$ ${cmd}`, `[server] Ejecutado: ${cmd}`]);
    setCmd("");
  };
  return (
    <div className="space-y-6">
      <SectionHeader icon={Terminal} label="Dev Console" sub="Logs del sistema · explorador API · herramientas de deploy" color="#00ff88" />
      {/* Terminal */}
      <div className="rounded-2xl overflow-hidden" style={{ background:"#020810", border:"1px solid rgba(0,255,136,0.15)" }}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor:"rgba(0,255,136,0.1)", background:"rgba(0,255,136,0.04)" }}>
          <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/70"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"/><div className="w-2.5 h-2.5 rounded-full bg-green-500/70"/></div>
          <span className="text-[10px] font-mono" style={{ color:"rgba(0,255,136,0.4)" }}>civac-server ~ terminal</span>
        </div>
        <div className="p-4 h-56 overflow-y-auto font-mono text-[11px] space-y-1" style={{ color:"rgba(0,255,136,0.7)" }}>
          {log.map((l, i) => <p key={i}>{l}</p>)}
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 border-t" style={{ borderColor:"rgba(0,255,136,0.1)" }}>
          <span style={{ color:"rgba(0,255,136,0.5)" }} className="font-mono text-[11px]">$</span>
          <input
            value={cmd}
            onChange={e => setCmd(e.target.value)}
            onKeyDown={e => e.key === "Enter" && execCmd()}
            placeholder="npm run build | pnpm typecheck | uv sync..."
            className="flex-1 bg-transparent outline-none font-mono text-[11px]"
            style={{ color:"#00ff88", caretColor:"#00ff88" }}
          />
          <button onClick={execCmd} className="px-2 py-1 rounded text-[10px] font-mono" style={{ background:"rgba(0,255,136,0.1)", color:"#00ff88", border:"1px solid rgba(0,255,136,0.2)" }}>
            EXEC
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-[11px] font-mono mb-3" style={{ color:"rgba(148,163,184,0.35)", letterSpacing:"0.1em" }}>ACCIONES RÁPIDAS</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { label:"Build PWA",         icon:"🔨", cmd:"pnpm build",                 color:"#00f5d4" },
            { label:"DB Push Schema",    icon:"🗄️",  cmd:"pnpm db push",               color:"#39ff7e" },
            { label:"Typecheck",         icon:"✅", cmd:"pnpm typecheck",              color:"#a78bfa" },
            { label:"Install Deps",      icon:"📦", cmd:"pnpm install",               color:"#fbbf24" },
            { label:"Python Sync",       icon:"🐍", cmd:"uv sync",                    color:"#ff9500" },
            { label:"Reiniciar todo",    icon:"🔄", cmd:"restart all",                color:"#ff6b35" },
          ].map(a => (
            <button key={a.label} onClick={() => setCmd(a.cmd)}
              className="flex items-center gap-2 p-3 rounded-xl text-left transition-all hover:scale-105"
              style={{ background:"rgba(4,13,26,0.7)", border:`1px solid ${a.color}18`, color:a.color }}>
              <span className="text-base">{a.icon}</span>
              <div>
                <p className="text-[11px] font-semibold">{a.label}</p>
                <p className="text-[9px] font-mono" style={{ color:`${a.color}55` }}>{a.cmd}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfigPanel() {
  return (
    <div className="space-y-6">
      <SectionHeader icon={Settings} label="Configuración del Servidor" sub="Ajustes globales del sistema CIVAC Platform" color="#94a3b8" />
      <div className="space-y-4">
        {[
          { label:"Dominio principal",      val:"civac.co",                  icon:"🌐", editable:false },
          { label:"Versión plataforma",     val:"CIVAC PRO v1.0.0",          icon:"📦", editable:false },
          { label:"Región de despliegue",   val:"Bogotá, Colombia (SA-East)", icon:"📍", editable:false },
          { label:"Base de datos",          val:"PostgreSQL (Replit native)", icon:"🗄️", editable:false  },
          { label:"PWA Service Worker",     val:"v6 · Cache-first · Offline", icon:"⚡", editable:false },
          { label:"JWT expiry",             val:"24h",                        icon:"🔑", editable:true  },
          { label:"Max instances",          val:"100",                        icon:"🏘️", editable:true  },
          { label:"GPS polling interval",   val:"4s",                         icon:"📡", editable:true  },
        ].map(cfg => (
          <div key={cfg.label} className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background:"rgba(4,13,26,0.6)", border:"1px solid rgba(148,163,184,0.08)" }}>
            <span className="text-lg flex-shrink-0">{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px]" style={{ color:"rgba(148,163,184,0.4)" }}>{cfg.label}</p>
              <p className="text-[13px] font-semibold text-white truncate">{cfg.val}</p>
            </div>
            {cfg.editable && (
              <button className="p-1.5 rounded-lg transition-all hover:scale-105" style={{ background:"rgba(148,163,184,0.06)", border:"1px solid rgba(148,163,184,0.12)", color:"rgba(148,163,184,0.4)" }}>
                <Settings size={12}/>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Shared section header ─────────────────────────────────────────── */
function SectionHeader({ icon: Icon, label, sub, color }: { icon: React.ElementType; label: string; sub: string; color: string }) {
  return (
    <div className="flex items-center gap-3 pb-2">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:`${color}14`, border:`1px solid ${color}25` }}>
        <Icon size={18} style={{ color }}/>
      </div>
      <div>
        <h2 className="text-[17px] font-black text-white leading-tight">{label}</h2>
        <p className="text-[11px]" style={{ color:"rgba(148,163,184,0.4)" }}>{sub}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function ServerDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [section, setSection] = useState("hub");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => { const id = setInterval(() => setTick(t => t+1), 1000); return () => clearInterval(id); }, []);
  void tick;

  // Guard: only CIVAC staff
  useEffect(() => {
    if (user && !CIVAC_STAFF_IDS.includes(user.id)) {
      navigate("/");
    }
    if (!user) navigate("/server");
  }, [user]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false });

  const PANELS: Record<string, React.ReactNode> = {
    hub: <HubPanel />,
    servicios: <ServicesPanel />,
    versiones: <VersionesPanel />,
    instancias: <InstanciasPanel />,
    demos: <DemosPanel />,
    staff: <StaffPanel />,
    dev: <DevConsolePanel />,
    config: <ConfigPanel />,
  };

  return (
    <div className="min-h-screen flex" style={{ background:"linear-gradient(145deg,#020810,#040d1a 50%,#020810)", fontFamily:"'Space Grotesk','Sora',sans-serif" }}>
      <style>{`
        @keyframes pulse-glow { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
      `}</style>

      {mobileOpen && <div className="fixed inset-0 bg-black/75 z-40 lg:hidden" onClick={() => setMobileOpen(false)}/>}

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 ${collapsed ? "w-[60px]" : "w-[240px]"} z-50 flex flex-col border-r transition-all duration-250 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background:"linear-gradient(180deg,#020810 0%,#040d1a 50%,#020810 100%)", borderColor:"rgba(0,245,212,0.12)", boxShadow:"2px 0 20px rgba(0,0,0,0.6)" }}>

        {/* Logo */}
        <div className="h-[64px] flex items-center justify-between px-3 border-b flex-shrink-0" style={{ borderColor:"rgba(0,245,212,0.1)" }}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", boxShadow:"0 0 16px rgba(0,245,212,0.45)" }}>
                <Server size={18} style={{ color:"#040d1a" }}/>
              </div>
              <div>
                <p className="font-black text-white text-[15px] leading-tight" style={{ fontFamily:"'Sora',sans-serif" }}>CIVAC</p>
                <p className="text-[8px] font-bold px-1.5 py-0.5 rounded-md leading-none mt-0.5 font-mono" style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", color:"#040d1a", letterSpacing:"0.06em" }}>
                  SERVER PANEL
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", boxShadow:"0 0 12px rgba(0,245,212,0.4)" }}>
              <Server size={16} style={{ color:"#040d1a" }}/>
            </div>
          )}
          <button className="hidden lg:flex p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all" onClick={() => setCollapsed(!collapsed)}>
            <ChevronRight size={13} style={{ transform: collapsed ? "none" : "rotate(180deg)", transition:"transform 0.25s" }}/>
          </button>
          <button className="lg:hidden p-1.5 text-white/40" onClick={() => setMobileOpen(false)}><X size={16}/></button>
        </div>

        {/* User badge */}
        {!collapsed && user && (
          <div className="px-2.5 py-2 border-b flex-shrink-0" style={{ borderColor:"rgba(0,245,212,0.08)" }}>
            <div className="flex items-center gap-2 px-2.5 py-2.5 rounded-[13px]" style={{ background:"rgba(0,245,212,0.05)", border:"1px solid rgba(0,245,212,0.12)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0" style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", color:"#040d1a" }}>
                {user.avatar || user.nombre.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-white/90 truncate leading-tight">{user.nombre.split(" ").slice(0,2).join(" ")}</p>
                <p className="text-[9px] leading-none mt-0.5 font-mono" style={{ color:"#00f5d4" }}>{user.role} · CIVAC</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background:"#39ff7e", boxShadow:"0 0 8px rgba(57,255,126,0.9)" }}/>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {!collapsed && (
            <p className="text-[9px] uppercase font-black tracking-[0.18em] px-2 pt-2 pb-1 font-mono" style={{ color:"rgba(0,245,212,0.25)" }}>— PLATFORM CONTROL —</p>
          )}
          {NAV_SECTIONS.map(sec => {
            const Icon = sec.icon;
            const active = section === sec.id;
            return (
              <button key={sec.id} onClick={() => { setSection(sec.id); setMobileOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2 py-2 transition-all group relative overflow-hidden"
                style={{ borderRadius:13, background:active ? `rgba(${sec.glow},0.1)` : "transparent", border:active ? `1px solid rgba(${sec.glow},0.22)` : "1px solid transparent" }}>
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background:`linear-gradient(180deg,${sec.color},${sec.color}88)` }}/>
                )}
                <div className="flex-shrink-0 flex items-center justify-center transition-all group-hover:scale-110" style={{ width:30, height:30, borderRadius:10, background:active ? `rgba(${sec.glow},0.18)` : `rgba(${sec.glow},0.07)`, border:`1px solid rgba(${sec.glow},${active ? "0.3" : "0.15"})`, color:active ? sec.color : `rgba(${sec.glow},0.55)` }}>
                  <Icon size={14} strokeWidth={2.3}/>
                </div>
                {!collapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[13px] leading-tight truncate" style={{ color:active ? sec.color : "rgba(255,255,255,0.6)", fontWeight:active ? 700 : 500 }}>{sec.label}</p>
                    <p className="text-[9px] leading-none mt-0.5 truncate" style={{ color:`rgba(${sec.glow},0.3)` }}>{sec.sub}</p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2.5 pb-3 pt-2 border-t flex-shrink-0 space-y-1" style={{ borderColor:"rgba(0,245,212,0.07)" }}>
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono" style={{ color:"rgba(0,245,212,0.2)" }}>
              <div className="w-1 h-1 rounded-full" style={{ background:"#00f5d4" }}/>
              <span>CIVAC Platform v1.0 · Server</span>
            </div>
          )}
          <button onClick={() => navigate("/")} className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-all ${collapsed ? "justify-center" : ""}`} style={{ borderRadius:10 }}>
            <Globe size={12}/>{!collapsed && <span>Vista Clientes</span>}
          </button>
          <button onClick={logout} className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all ${collapsed ? "justify-center" : ""}`} style={{ borderRadius:10 }}>
            <LogOut size={12}/>{!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-250 ${collapsed ? "lg:pl-[60px]" : "lg:pl-[240px]"}`}>
        {/* Topbar */}
        <header className="h-[56px] sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 border-b" style={{ background:"rgba(2,8,16,0.97)", backdropFilter:"blur(28px)", borderColor:"rgba(0,245,212,0.09)", boxShadow:"0 1px 20px rgba(0,0,0,0.5)" }}>
          <div className="flex items-center gap-2.5">
            <button className="lg:hidden text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all" onClick={() => setMobileOpen(true)}>
              <Menu size={20}/>
            </button>
            {(() => {
              const sec = NAV_SECTIONS.find(s => s.id === section);
              if (!sec) return null;
              const Icon = sec.icon;
              return (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex w-8 h-8 items-center justify-center rounded-xl" style={{ background:`rgba(${sec.glow},0.14)`, border:`1px solid rgba(${sec.glow},0.22)`, color:sec.color }}>
                    <Icon size={15} strokeWidth={2.3}/>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[13px] font-bold text-white leading-tight">{sec.label}</p>
                    <p className="text-[9px] leading-none font-mono" style={{ color:"rgba(0,245,212,0.3)" }}>
                      CIVAC SERVER · {now.toLocaleDateString("es-CO", { day:"numeric", month:"short", year:"numeric" })}
                    </p>
                  </div>
                </div>
              );
            })()}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold rounded-[10px] font-mono" style={{ color:"#39ff7e", background:"rgba(57,255,126,0.07)", border:"1px solid rgba(57,255,126,0.18)" }}>
              <Activity size={9}/><span>PLATFORM ONLINE</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-[11px] font-mono" style={{ color:"rgba(0,245,212,0.4)" }}>{timeStr}</span>
            <div className="w-px h-4 bg-white/10 hidden sm:block"/>
            <span className="hidden sm:block text-xs" style={{ color:"rgba(148,163,184,0.3)" }}>{user?.email}</span>
            <div className="w-px h-4 bg-white/10 hidden sm:block"/>
            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all" style={{ background:"rgba(255,80,80,0.07)", color:"#ff7070", border:"1px solid rgba(255,80,80,0.18)" }}>
              <LogOut size={12}/><span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-x-hidden pb-12">
          {PANELS[section] || <HubPanel />}
        </div>
      </main>
    </div>
  );
}
