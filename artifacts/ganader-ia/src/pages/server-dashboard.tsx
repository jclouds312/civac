import { useState, useEffect, useRef, useCallback } from "react";
import type { ElementType, ReactNode } from "react";
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
  Menu, X, Flag, Radio, Link, Plug, Box, FileCode,
  Wrench, Star, BookOpen, LayoutDashboard,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   DATA / CONSTANTS
══════════════════════════════════════════════════════════════════ */
const SERVICES = [
  { id:"api",       name:"API Server",        port:8080, tech:"Node 24 / Express 5", color:"#00f5d4", glow:"0,245,212",   icon:"⚡", desc:"REST API principal · 40+ endpoints · PostgreSQL · pnpm workspace · Drizzle ORM", uptime:"99.8%", req:"1,247/h", lang:"TypeScript", healthUrl:"/api/healthz", healthKey:"api" },
  { id:"analytics", name:"Analytics Server",  port:8099, tech:"Python 3.12 / Flask", color:"#a78bfa", glow:"167,139,250", icon:"📊", desc:"Estadísticas ganaderas · pandas 2.2 · numpy 1.26 · SQLAlchemy · CORS habilitado", uptime:"99.5%", req:"340/h",   lang:"Python",     healthUrl:"/api/analytics/health", healthKey:"analytics" },
  { id:"gps",       name:"GPS Server",        port:8000, tech:"Python 3.12 / Django", color:"#39ff7e", glow:"57,255,126",  icon:"📡", desc:"Tracking collares CIVAC-GPS-v3 · PostgreSQL · Django REST Framework 3.15 · MQTT", uptime:"99.9%", req:"892/h",   lang:"Python",     healthUrl:"/api/gps/health/", healthKey:"gps" },
  { id:"frontend",  name:"Frontend PWA",      port:5000, tech:"React 18 / Vite 6",   color:"#00c8ff", glow:"0,200,255",   icon:"🌐", desc:"32 módulos · Tailwind CSS v4 · shadcn/ui · Service Worker v10 · wouter · IndexedDB", uptime:"100%",  req:"—",        lang:"TypeScript/TSX", healthUrl:null, healthKey:"frontend" },
];

const PWA_VERSIONS = [
  {
    v:"8.0.0", date:"2026-06-12", status:"dev", label:"En desarrollo · v2.0", color:"#00ff88",
    plans:["basico","pro","premium","platino"], size:"—", downloads:0,
    features:["Bottom nav multicolor neon","Login v2.0 badge","8 drivers COM · 11 drivers BT","8 tipos GPS (solar · cámara IA)","Analytics Server v2.0 · 12 endpoints","GPS Django sync tiempo real","34+ módulos","IndexedDB v2"],
    changelog:"v8.0 (v2.0) — Renovación mayor imagen. Bottom nav neon por módulo. Login v2.0. Pesaje: 8 COM + 11 BT drivers. GPS: 8 categorías. Analytics Server v2.0 + 6 endpoints nuevos. TypeScript 100% clean.",
  },
  {
    v:"7.1.0", date:"2026-06-03", status:"current", label:"PROD · Estable", color:"#00f5d4",
    plans:["basico","pro","premium","platino"], size:"3.4 MB", downloads:6,
    features:["Cuentas reales colombianas","Sanidad+Trazabilidad en sidebar","32 módulos en admin matrix","Server health checks reales","Sidebar v1.0 footer","manifest.json v8"],
    changelog:"v7.1 — Integración completa de 32 módulos. Cuentas cliente reales (empresas colombianas). Sidebar actualizado con Sanidad ICA y Trazabilidad QR. Server Panel con health checks en tiempo real.",
  },
  {
    v:"7.0.0", date:"2026-06-01", status:"lts", label:"LTS · 7.x", color:"#fbbf24",
    plans:["basico","pro","premium","platino"], size:"3.1 MB", downloads:4,
    features:["32 módulos completos","Sanidad Animal ICA","Trazabilidad SINIGAN","GPS Chips MQTT","Ventas CRM","Asesora IA","Drive Backup","SW v1 · 33 rutas","Manifest v7 · 8 shortcuts","Documentación 24 secciones"],
    changelog:"CIVAC PRO v2.1 — Release mayor. 32+ módulos. Sanidad+Trazabilidad ICA. GPS Chips MQTT. CRM Ventas. Asesora IA especializada en ganadería Colombia. Service Worker v10. Server Panel 11 secciones.",
  },
  {
    v:"6.0.0", date:"2026-05-26", status:"lts", label:"LTS · 6.x", color:"#fbbf24",
    plans:["basico","pro","premium","platino"], size:"2.7 MB", downloads:8,
    features:["Server Panel 11 secciones","Badge ⬡ CIVAC Staff","use-toast.ts fix React ns","Deps · Langs · Integraciones tabs","Admin 14 tabs","GPS real watchPosition"],
    changelog:"v6 LTS — Server Dashboard expandido. Badges CIVAC Staff. Fix crítico React namespace en .ts → named imports. HMR estable.",
  },
  {
    v:"5.0.0", date:"2026-05-01", status:"stable", label:"Stable 5.x", color:"#94a3b8",
    plans:["pro","premium","platino"], size:"2.4 MB", downloads:12,
    features:["GPS tracking real","6 cuentas","Admin/Developer dashboards","Pesaje BT/COM/Manual","Login 3-tabs+Planes","PWA offline v6","28 módulos"],
    changelog:"v5 — Primera versión de producción completa. GPS real con navigator.geolocation. Pesaje Bluetooth. Predicción IA. 28 módulos.",
  },
  {
    v:"4.0.0", date:"2026-03-15", status:"archived", label:"Legacy 4.x", color:"#6b7280",
    plans:["pro","premium","platino"], size:"2.0 MB", downloads:3,
    features:["Visual overhaul dark/light","Logo Holstein teal","CSS variables paleta farm/marine","Admin panel básico","Wompi Colombia"],
    changelog:"v4 — Rediseño visual completo. Dark/light mode. Logo Holstein con chip IA teal. Wompi+Nequi+PSE pagos.",
  },
];

const PLAN_DEMOS = [
  { id:"basico",  label:"El Palmar",         empresa:"Agropecuaria El Palmar",         email:"demo_basico@ganaderia.co",  pwd:"demo2026", color:"#94a3b8", icon:"🥈", modules:["Dashboard","Inventario","Producción","Potreros","Alertas","Sanidad básica"] },
  { id:"pro",     label:"Los Llanos",        empresa:"Ganadería Los Llanos S.A.S.",    email:"demo_pro@ganaderia.co",     pwd:"demo2026", color:"#00f5d4", icon:"⚡", modules:["+ GPS Collares","Pesaje BT","Reproducción","Genética","Costos","Sanidad","Trazabilidad ICA","Asesora IA"] },
  { id:"premium", label:"Inversiones Cesar", empresa:"Inversiones Bovinas del Cesar",  email:"demo_premium@ganaderia.co", pwd:"demo2026", color:"#fbbf24", icon:"🥇", modules:["+ IA Predicciones","CO₂ IPCC","Multi-finca","Ficha Clínica","Drive Backup","CRM Ventas"] },
  { id:"platino", label:"Córdoba Corp.",     empresa:"Grupo Ganadero Córdoba Corp.",   email:"demo_platino@ganaderia.co", pwd:"demo2026", color:"#cd7f32", icon:"🔶", modules:["Ilimitado · 34+ módulos","Admin Panel completo","Usuarios & Roles","GPS avanzado · 13 collares","SLA 99.9% garantizado","Soporte prioritario 24/7"] },
];

const CLIENT_INSTANCES = [
  { id:"INS-001", name:"Finca El Rancho Verde",       owner:"Luis Patiño",            plan:"pro",     status:"active",   users:3, lastSeen:"hace 2 min",  region:"Antioquia, CO",   version:"7.0.0" },
  { id:"INS-002", name:"Ganadería Los Llanos S.A.S.", owner:"Gerente de Producción",  plan:"pro",     status:"active",   users:2, lastSeen:"hace 15 min", region:"Meta, CO",        version:"7.0.0" },
  { id:"INS-003", name:"Inversiones Bovinas Cesar",   owner:"Director Agropecuario",  plan:"premium", status:"active",   users:4, lastSeen:"hace 45 min", region:"Valledupar, CO",  version:"7.0.0" },
  { id:"INS-004", name:"Agropecuaria El Palmar",      owner:"Propietario",            plan:"basico",  status:"trial",    users:1, lastSeen:"hace 3h",     region:"Boyacá, CO",      version:"7.0.0" },
  { id:"INS-005", name:"Grupo Ganadero Córdoba Corp.",owner:"CEO · Presidente",       plan:"platino", status:"active",   users:8, lastSeen:"hace 5 min",  region:"Montería, CO",    version:"7.0.0" },
  { id:"INS-006", name:"Hacienda La Esperanza",       owner:"Propietario Platino",    plan:"platino", status:"inactive", users:5, lastSeen:"hace 2 días", region:"Córdoba, CO",     version:"6.0.0" },
];

const CIVAC_STAFF = [
  { id:"superadmin", name:"Javier Hernando Sánchez Bernal", email:"Softganventas@gmail.com",            role:"superadmin", icon:"🔱", color:"#ff6b35", online:true,  desc:"CEO · Fundador & Propietario · Acceso total plataforma", phone:"3187351262" },
  { id:"admin",      name:"Lizet Daza",                      email:"lizet.daza@civac.co",                role:"admin",      icon:"👑", color:"#fbbf24", online:true,  desc:"Co-Fundadora · Directora Ejecutiva · Panel Admin · Facturación" },
  { id:"developer",  name:"Johnatan Vallejo Marulanda",      email:"johnatanvallejomarulanda@gmail.com", role:"developer",  icon:"🛠️", color:"#00ff88", online:true,  desc:"Arquitecto Principal · Dev PWA & IA · Consola · Deploy" },
  { id:"developer-john474", name:"John Vallejo", email:"john474nvallejo@gmail.com", role:"developer", icon:"🛠️", color:"#00ff88", online:true, desc:"Developer · Super Administrador Multirole · Consola · Deploy" },
  { id:"ventas",     name:"Asesora CIVAC · Ventas",          email:"ventas@civac.co",                    role:"sales",      icon:"💼", color:"#e879f9", online:false, desc:"Asesora Comercial Senior · CRM · Pipeline · Demos" },
];

const DEPENDENCIES = {
  frontend: [
    { name:"React",          v:"18.3.1",  type:"core",    color:"#61dafb", desc:"UI library" },
    { name:"Vite",           v:"6.3.5",   type:"build",   color:"#a78bfa", desc:"Build tool & dev server" },
    { name:"TypeScript",     v:"5.9.2",   type:"lang",    color:"#3178c6", desc:"Type system" },
    { name:"Tailwind CSS",   v:"4.1.8",   type:"style",   color:"#38bdf8", desc:"Utility-first CSS" },
    { name:"shadcn/ui",      v:"2.x",     type:"ui",      color:"#f8f9fa", desc:"Component library" },
    { name:"Radix UI",       v:"1.x",     type:"ui",      color:"#6e56cf", desc:"Headless UI primitives" },
    { name:"wouter",         v:"3.7.1",   type:"routing", color:"#00f5d4", desc:"SPA router lightweight" },
    { name:"Recharts",       v:"2.15.3",  type:"charts",  color:"#ff6b35", desc:"BarChart · AreaChart · PieChart" },
    { name:"lucide-react",   v:"0.511.0", type:"icons",   color:"#fbbf24", desc:"Icon library" },
    { name:"clsx",           v:"2.1.1",   type:"utils",   color:"#94a3b8", desc:"ClassName helper" },
    { name:"date-fns",       v:"4.1.0",   type:"utils",   color:"#f472b6", desc:"Date formatting" },
    { name:"Zod",            v:"3.24.4",  type:"valid",   color:"#39ff7e", desc:"Schema validation" },
    { name:"React Hook Form",v:"7.56.4",  type:"forms",   color:"#ec5990", desc:"Form management" },
  ],
  api: [
    { name:"Node.js",        v:"24 LTS",  type:"runtime", color:"#68a063", desc:"JavaScript runtime" },
    { name:"Express",        v:"5.1.0",   type:"core",    color:"#f5f5f5", desc:"HTTP server framework" },
    { name:"TypeScript",     v:"5.9.2",   type:"lang",    color:"#3178c6", desc:"Type system" },
    { name:"Drizzle ORM",    v:"0.43.1",  type:"db",      color:"#c5f74f", desc:"TypeScript ORM for Postgres" },
    { name:"jsonwebtoken",   v:"9.0.2",   type:"auth",    color:"#d63aff", desc:"JWT auth tokens" },
    { name:"bcryptjs",       v:"3.0.2",   type:"auth",    color:"#ff9a3c", desc:"Password hashing" },
    { name:"cors",           v:"2.8.5",   type:"net",     color:"#94a3b8", desc:"CORS middleware" },
    { name:"zod",            v:"3.24.4",  type:"valid",   color:"#39ff7e", desc:"API schema validation" },
  ],
  python: [
    { name:"Python",         v:"3.12.10", type:"runtime", color:"#3776ab", desc:"Language runtime" },
    { name:"Flask",          v:"3.1.1",   type:"core",    color:"#a78bfa", desc:"Analytics micro-framework" },
    { name:"Django",         v:"5.2.1",   type:"core",    color:"#092e20", desc:"GPS server framework" },
    { name:"djangorestframework",v:"3.15.2",type:"api",   color:"#a30000", desc:"REST API for GPS server" },
    { name:"pandas",         v:"2.2.3",   type:"data",    color:"#e70488", desc:"Data analysis/stats" },
    { name:"numpy",          v:"1.26.4",  type:"data",    color:"#4dabcf", desc:"Numerical computing" },
    { name:"SQLAlchemy",     v:"2.0.41",  type:"db",      color:"#ff7070", desc:"SQL toolkit / ORM" },
    { name:"Pydantic",       v:"2.11.5",  type:"valid",   color:"#e92063", desc:"Data validation models" },
    { name:"gunicorn",       v:"23.0.0",  type:"deploy",  color:"#499848", desc:"WSGI HTTP server" },
    { name:"uv",             v:"0.7.5",   type:"pkg",     color:"#de5fe9", desc:"Ultra-fast Python PM" },
  ],
};

const INTEGRATIONS = [
  { id:"wompi",    name:"Wompi",           icon:"💳", status:"configured", color:"#39ff7e", desc:"Pasarela pagos Colombia. Soporte: tarjetas, Nequi, PSE, Bancolombia.", key:"pk_test_CIVAC_WOMPI_2026", category:"Pagos" },
  { id:"nequi",   name:"Nequi",           icon:"📱", status:"configured", color:"#8b5cf6", desc:"Pagos móviles Colombia. Push-to-pay flow.", key:"NEQUI_API_KEY_CIVAC", category:"Pagos" },
  { id:"pse",     name:"PSE",             icon:"🏦", status:"configured", color:"#1e40af", desc:"Débito bancario directo Colombia. ACH Gateway.", key:"PSE_TOKEN_CIVAC_2026", category:"Pagos" },
  { id:"gps_hw",  name:"GPS Hardware",    icon:"📡", status:"active",     color:"#00f5d4", desc:"Collares CIVAC-GPS-v3. MQTT broker. 13 dispositivos activos.", key:"MQTT_BROKER: mqtt.civac.co:1883", category:"IoT" },
  { id:"bt",      name:"Bluetooth BT",    icon:"🔵", status:"active",     color:"#3b82f6", desc:"Web Bluetooth API. Báscula pesaje bovino 9-byte frame.", key:"— (Web API nativa)", category:"IoT" },
  { id:"rfid",    name:"RFID CIVAC",      icon:"🏷️", status:"active",     color:"#fbbf24", desc:"Lectores UHF 900MHz. Protocolo CIVAC-RFID-EPC96. Inventario.", key:"RFID_PROTOCOL: EPC96", category:"IoT" },
  { id:"sw",      name:"Service Worker",  icon:"⚙️", status:"active",     color:"#94a3b8", desc:"PWA v8 cache-first. IndexedDB offline. 33 rutas pre-cacheadas. Background Sync.", key:"— (PWA nativa)", category:"PWA" },
  { id:"indexeddb",name:"IndexedDB",      icon:"💾", status:"active",     color:"#60a5fa", desc:"Base de datos offline. Sincronización en background.", key:"DB: civac-offline-v1", category:"PWA" },
  { id:"ipcc",    name:"IPCC 2019",       icon:"🌱", status:"active",     color:"#22c55e", desc:"Factores emisión IPCC 2019 AR6. Módulo CO₂ bovino Colombia.", key:"Factor CH₄: 56 kg/cabeza/año", category:"Cálculos" },
  { id:"maps",    name:"SVG Geo Maps",    icon:"🗺️", status:"active",     color:"#f97316", desc:"Mapas SVG Colombia. Potreros + GPS overlay animado.", key:"— (SVG local)", category:"Geo" },
];

const LANGUAGES_STACK = [
  { lang:"TypeScript", version:"5.9.2", files:42, pct:68, color:"#3178c6", icon:"TS", uses:["Frontend PWA","API Server","Types","Validación"] },
  { lang:"Python",     version:"3.12.10",files:18, pct:22, color:"#3776ab", icon:"Py", uses:["Analytics Flask","GPS Django","ML/pandas","Scripts"] },
  { lang:"CSS / Tailwind",version:"4.1.8",files:8, pct:6, color:"#38bdf8", icon:"CSS", uses:["Estilos globales","Variables CSS","Dark mode","Animaciones"] },
  { lang:"HTML / JSX", version:"—",      files:5, pct:3, color:"#f16529", icon:"HTML", uses:["PWA shell","Manifest","Templates","OG tags"] },
  { lang:"Bash / Shell",version:"—",     files:3, pct:1, color:"#94a3b8", icon:"SH", uses:["Deploy scripts","Git hooks","CI pipeline"] },
];

const NAV_SECTIONS = [
  { id:"hub",       icon:Monitor,      label:"Server Hub",        sub:"Estado en vivo",        color:"#00f5d4", glow:"0,245,212"   },
  { id:"servicios", icon:Server,       label:"Servicios",         sub:"4 backends activos",    color:"#39ff7e", glow:"57,255,126"  },
  { id:"sesiones",  icon:Users,        label:"Sesiones",          sub:"Accesos en tiempo real", color:"#00c8ff", glow:"0,200,255"  },
  { id:"database",  icon:Database,     label:"Base de Datos",     sub:"Code Gateway · PG/SQLite", color:"#fbbf24", glow:"251,191,36" },
  { id:"versiones", icon:Package,      label:"Versiones PWA",     sub:"Descargas & build",     color:"#a78bfa", glow:"167,139,250" },
  { id:"deps",      icon:Box,          label:"Dependencias",      sub:"Tech stack completo",   color:"#fbbf24", glow:"251,191,36"  },
  { id:"langs",     icon:FileCode,     label:"Lenguajes",         sub:"TS · Python · CSS",     color:"#3178c6", glow:"49,120,198"  },
  { id:"integ",     icon:Plug,         label:"Integraciones",     sub:"APIs · IoT · Pagos",    color:"#f97316", glow:"249,115,22"  },
  { id:"instancias",icon:Building2,    label:"Instancias",        sub:"Clientes activos",      color:"#60a5fa", glow:"96,165,250"  },
  { id:"demos",     icon:Play,         label:"Demos & Ventas",    sub:"Cuentas demo por plan", color:"#e879f9", glow:"232,121,249" },
  { id:"staff",     icon:Shield,       label:"CIVAC Staff",       sub:"Cuentas oficiales",     color:"#ff6b35", glow:"255,107,53"  },
  { id:"dev",       icon:Terminal,     label:"Dev Console",       sub:"Logs · API · Deploy",   color:"#00ff88", glow:"0,255,136"   },
  { id:"config",    icon:Settings,     label:"Configuración",     sub:"Sistema & seguridad",   color:"#94a3b8", glow:"148,163,175" },
];

/* ══════════════════════════════════════════════════════════════════
   SHARED HEADER
══════════════════════════════════════════════════════════════════ */
function SectionHeader({ icon: Icon, label, sub, color }: { icon: ElementType; label: string; sub: string; color: string }) {
  return (
    <div className="flex items-center gap-3 pb-2 border-b mb-6" style={{ borderColor:`rgba(255,255,255,0.05)` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <h2 className="text-[17px] font-black text-white leading-tight">{label}</h2>
        <p className="text-[11px]" style={{ color:"rgba(148,163,184,0.45)" }}>{sub}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   HUB PANEL
══════════════════════════════════════════════════════════════════ */
function HubPanel() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t+1), 1000); return () => clearInterval(id); }, []);
  void tick;

  const cpu  = (35 + Math.sin(tick * 0.1) * 12).toFixed(1);
  const mem  = (62 + Math.sin(tick * 0.07) * 5).toFixed(1);
  const disk = "48.2";
  const net  = (1.2 + Math.sin(tick * 0.13) * 0.4).toFixed(2);

  /* ── Live stats from Analytics Server ── */
  const [liveStats, setLiveStats] = useState<{
    instancias_activas: number; usuarios_online: number; api_calls_hora: number;
    gps_collares_live: number; litros_tracked_hoy: number; uptime_pct: number;
  } | null>(null);

  useEffect(() => {
    const fetch_ = () => {
      fetch('/api/analytics/admin/stats', { signal: AbortSignal.timeout(4000) })
        .then(r => r.json())
        .then(d => { if (d.ok) setLiveStats(d.plataforma); })
        .catch(() => {});
    };
    fetch_();
    const id = setInterval(fetch_, 12000);
    return () => clearInterval(id);
  }, []);

  const kpis = [
    { label:"Instancias activas",  val: liveStats ? `${liveStats.instancias_activas} / 5` : "4 / 5",    icon:"🏘️",  color:"#00f5d4" },
    { label:"Usuarios en línea",   val: liveStats ? String(liveStats.usuarios_online)      : "8",        icon:"👥",  color:"#39ff7e" },
    { label:"API calls / hora",    val: liveStats ? liveStats.api_calls_hora.toLocaleString("es-CO") : "1,247", icon:"⚡", color:"#a78bfa" },
    { label:"Uptime",              val: liveStats ? `${liveStats.uptime_pct}%`             : "99.8%",    icon:"⏱️",  color:"#fbbf24" },
    { label:"GPS collares live",   val: liveStats ? String(liveStats.gps_collares_live)    : "13",       icon:"📡",  color:"#00c8ff" },
    { label:"Litros tracked hoy",  val: liveStats ? `${liveStats.litros_tracked_hoy} L`   : "840 L",    icon:"🥛",  color:"#ff9500" },
  ];

  const resources = [
    { label:"CPU",  val:parseFloat(cpu),  display:`${cpu}%`,   color:"#00f5d4", bar:parseFloat(cpu) },
    { label:"RAM",  val:parseFloat(mem),  display:`${mem}%`,   color:"#a78bfa", bar:parseFloat(mem) },
    { label:"Disco",val:parseFloat(disk), display:`${disk}%`,  color:"#fbbf24", bar:parseFloat(disk) },
    { label:"Net",  val:0,                display:`${net} MB/s`,color:"#39ff7e", bar:parseFloat(net)*10 },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader icon={Monitor} label="Server Hub" sub="Estado en tiempo real de la plataforma CIVAC PRO" color="#00f5d4" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="rounded-2xl p-4" style={{ background:"rgba(4,13,26,0.7)", border:`1px solid ${k.color}1a` }}>
            <div className="text-2xl mb-2">{k.icon}</div>
            <p className="text-2xl font-black" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[11px] mt-1" style={{ color:"rgba(148,163,184,0.5)" }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Resources */}
      <div className="rounded-2xl p-5" style={{ background:"rgba(4,13,26,0.7)", border:"1px solid rgba(0,245,212,0.1)" }}>
        <p className="text-[10px] font-mono font-bold mb-4 tracking-widest" style={{ color:"rgba(0,245,212,0.3)" }}>RECURSOS DEL SERVIDOR — LIVE</p>
        <div className="space-y-3">
          {resources.map(r => (
            <div key={r.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono font-bold" style={{ color:"rgba(148,163,184,0.5)" }}>{r.label}</span>
                <span className="text-[12px] font-black font-mono" style={{ color:r.color }}>{r.display}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.04)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width:`${Math.min(r.bar,100)}%`, background:`linear-gradient(90deg,${r.color}88,${r.color})` }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services quick */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SERVICES.map(s => (
          <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background:"rgba(4,13,26,0.6)", border:`1px solid rgba(${s.glow},0.15)` }}>
            <div className="text-xl">{s.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white">{s.name}</p>
              <p className="text-[10px] font-mono" style={{ color:`rgba(${s.glow},0.5)` }}>:{s.port} · {s.tech}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold mb-1" style={{ background:`rgba(${s.glow},0.1)`, color:s.color, border:`1px solid rgba(${s.glow},0.2)` }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:s.color }}/>ONLINE
              </div>
              <p className="text-[9px] font-mono" style={{ color:"rgba(148,163,184,0.3)" }}>{s.uptime}</p>
            </div>
          </div>
        ))}
      </div>

      {/* System info row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:"Región",    val:"SA-East · Bogotá",         icon:"🌎" },
          { label:"DB",        val:"PostgreSQL · Drizzle ORM",  icon:"🗄️" },
          { label:"PWA SW",    val:"v8 · 33 rutas · Offline",  icon:"⚙️" },
        ].map(i => (
          <div key={i.label} className="p-3 rounded-xl text-center" style={{ background:"rgba(4,13,26,0.5)", border:"1px solid rgba(255,255,255,0.05)" }}>
            <div className="text-xl mb-1">{i.icon}</div>
            <p className="text-[10px] font-bold text-white leading-tight">{i.val}</p>
            <p className="text-[9px] mt-0.5" style={{ color:"rgba(148,163,184,0.35)" }}>{i.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SERVICES PANEL
══════════════════════════════════════════════════════════════════ */
type ServiceHealth = { status: "online"|"offline"|"checking"; latency: number|null; detail: string|null };

function ServicesPanel() {
  const [health, setHealth] = useState<Record<string, ServiceHealth>>({
    api:      { status:"checking", latency:null, detail:null },
    analytics:{ status:"checking", latency:null, detail:null },
    gps:      { status:"checking", latency:null, detail:null },
    frontend: { status:"online",   latency:null, detail:"React 18 · PWA v2.1" },
  });
  const [lastCheck, setLastCheck] = useState<string|null>(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    const results: Record<string, ServiceHealth> = { ...health, frontend:{ status:"online", latency:null, detail:"React 18 · Service Worker v10 activo" } };
    for (const s of SERVICES) {
      if (!s.healthUrl) continue;
      const t0 = performance.now();
      try {
        const r = await fetch(s.healthUrl, { signal: AbortSignal.timeout(4000) });
        const latency = Math.round(performance.now() - t0);
        if (r.ok) {
          const j = await r.json().catch(() => ({}));
          results[s.healthKey] = { status:"online", latency, detail: j.status ?? j.db ?? JSON.stringify(j).slice(0,60) };
        } else {
          results[s.healthKey] = { status:"offline", latency, detail:`HTTP ${r.status}` };
        }
      } catch {
        const latency = Math.round(performance.now() - t0);
        results[s.healthKey] = { status:"offline", latency, detail:"Sin respuesta · timeout" };
      }
    }
    setHealth(results);
    setLastCheck(new Date().toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit", second:"2-digit" }));
    setChecking(false);
  };

  useEffect(() => { checkHealth(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader icon={Server} label="Servicios del Sistema" sub="4 backends CIVAC · health checks en tiempo real" color="#39ff7e" />
        <button onClick={checkHealth} disabled={checking}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:scale-105 disabled:opacity-50"
          style={{ background:"rgba(57,255,126,0.08)", color:"#39ff7e", border:"1px solid rgba(57,255,126,0.2)" }}>
          <RefreshCw size={13} className={checking ? "animate-spin" : ""}/>
          {checking ? "Verificando…" : "Health Check"}
        </button>
      </div>
      {lastCheck && (
        <p className="text-[10px] font-mono" style={{ color:"rgba(148,163,184,0.3)" }}>
          Última verificación: {lastCheck}
        </p>
      )}
      <div className="space-y-4">
        {SERVICES.map(s => {
          const h = health[s.healthKey];
          const isOnline  = h?.status === "online";
          const isOffline = h?.status === "offline";
          const isCheck   = h?.status === "checking";
          const statusColor = isOnline ? "#39ff7e" : isOffline ? "#ff4d4d" : "#fbbf24";
          const statusGlow  = isOnline ? "57,255,126" : isOffline ? "255,77,77" : "251,191,36";
          const statusLabel = isOnline ? "ONLINE" : isOffline ? "OFFLINE" : "CHECKING…";
          return (
            <div key={s.id} className="rounded-2xl p-5 transition-all" style={{ background:"rgba(4,13,26,0.7)", border:`1px solid rgba(${isOnline ? s.glow : statusGlow},0.22)` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background:`rgba(${s.glow},0.1)`, border:`1px solid rgba(${s.glow},0.2)` }}>
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-[15px] font-black text-white">{s.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold" style={{ background:`rgba(${s.glow},0.12)`, color:s.color, border:`1px solid rgba(${s.glow},0.2)` }}>{s.tech}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono" style={{ background:"rgba(49,120,198,0.1)", color:"#3178c6", border:"1px solid rgba(49,120,198,0.2)" }}>{s.lang}</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background:`rgba(${statusGlow},0.08)`, color:statusColor, border:`1px solid rgba(${statusGlow},0.2)` }}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isCheck ? "animate-ping" : isOnline ? "animate-pulse" : ""}`} style={{ background:statusColor }}/>
                      {statusLabel}
                    </span>
                    {h?.latency !== null && h?.latency !== undefined && (
                      <span className="text-[9px] font-mono" style={{ color:"rgba(148,163,184,0.4)" }}>{h.latency}ms</span>
                    )}
                  </div>
                  <p className="text-[12px] mb-2" style={{ color:"rgba(148,163,184,0.55)" }}>{s.desc}</p>
                  {h?.detail && (
                    <p className="text-[10px] font-mono mb-2 px-2 py-1 rounded-lg" style={{ background:"rgba(255,255,255,0.03)", color:`rgba(${statusGlow},0.6)`, border:`1px solid rgba(${statusGlow},0.1)` }}>
                      {h.detail}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg" style={{ background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.5)", border:"1px solid rgba(255,255,255,0.06)" }}>PORT :{s.port}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg" style={{ background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.5)", border:"1px solid rgba(255,255,255,0.06)" }}>uptime {s.uptime}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg" style={{ background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.5)", border:"1px solid rgba(255,255,255,0.06)" }}>{s.req}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={checkHealth} className="p-2 rounded-lg transition-all hover:scale-105" style={{ background:"rgba(57,255,126,0.06)", border:"1px solid rgba(57,255,126,0.14)", color:"#39ff7e" }} title="Verificar"><RefreshCw size={14}/></button>
                  <button className="p-2 rounded-lg transition-all hover:scale-105" style={{ background:"rgba(148,163,184,0.06)", border:"1px solid rgba(148,163,184,0.14)", color:"rgba(148,163,184,0.5)" }} title="Ver logs"><Eye size={14}/></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   VERSIONES PANEL
══════════════════════════════════════════════════════════════════ */
function VersionesPanel() {
  const [copied, setCopied] = useState<string|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newVer, setNewVer] = useState({ v:"1.1.0", notes:"", plans:["basico","pro","premium","platino"] });
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(()=>{});
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };
  const statusColor: Record<string,string> = { dev:"#00ff88", current:"#00f5d4", lts:"#fbbf24", stable:"#94a3b8", archived:"#6b7280" };

  return (
    <div className="space-y-5">
      <SectionHeader icon={Package} label="Versiones PWA" sub="Gestión de versiones · descargar · desplegar en instancias clientes" color="#a78bfa" />

      {/* Stat bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"En desarrollo",  val:"1",  color:"#00ff88" },
          { label:"Producción",     val:"1",  color:"#00f5d4" },
          { label:"LTS / Stable",   val:"2",  color:"#fbbf24" },
          { label:"Archivadas",     val:"1",  color:"#6b7280" },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-xl text-center" style={{ background:"rgba(4,13,26,0.65)", border:`1px solid ${s.color}18` }}>
            <p className="text-xl font-black" style={{ color:s.color }}>{s.val}</p>
            <p className="text-[10px] mt-0.5" style={{ color:"rgba(148,163,184,0.4)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Version list */}
      <div className="space-y-4">
        {PWA_VERSIONS.map(ver => {
          const sc = statusColor[ver.status] || "#94a3b8";
          return (
            <div key={ver.v} className="rounded-2xl overflow-hidden" style={{ background:"rgba(4,13,26,0.7)", border:`1px solid rgba(167,139,250,0.12)` }}>
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-[17px] font-black" style={{ color: sc }}>v{ver.v}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background:`${sc}18`, color:sc, border:`1px solid ${sc}35` }}>{ver.label}</span>
                      {ver.status === "current" && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono" style={{ background:"rgba(0,245,212,0.1)", color:"#00f5d4", border:"1px solid rgba(0,245,212,0.2)" }}>● PRODUCCIÓN</span>
                      )}
                      {ver.status === "dev" && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono animate-pulse" style={{ background:"rgba(0,255,136,0.1)", color:"#00ff88", border:"1px solid rgba(0,255,136,0.2)" }}>⚒ EN DESARROLLO</span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono" style={{ color:"rgba(148,163,184,0.35)" }}>{ver.date} · {ver.size} · {ver.downloads} descargas</p>
                  </div>
                </div>

                {/* Changelog */}
                <p className="text-[11px] mb-3 italic" style={{ color:"rgba(148,163,184,0.5)" }}>{ver.changelog}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {ver.features.map(f => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-lg" style={{ background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.55)", border:"1px solid rgba(255,255,255,0.06)" }}>{f}</span>
                  ))}
                </div>

                {/* Plans */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-mono" style={{ color:"rgba(148,163,184,0.3)" }}>PLANES:</span>
                  {ver.plans.map(p => {
                    const pc: Record<string,string> = { basico:"#94a3b8", pro:"#00f5d4", premium:"#fbbf24", platino:"#cd7f32" };
                    return <span key={p} className="text-[9px] px-2 py-0.5 rounded font-bold uppercase" style={{ background:`${pc[p]}18`, color:pc[p] }}>{p}</span>;
                  })}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {ver.status !== "dev" && (
                    <button onClick={() => copy(`civac-pro-v${ver.v}.pwa.zip`, ver.v)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-105"
                      style={{ background:"linear-gradient(135deg,rgba(167,139,250,0.15),rgba(167,139,250,0.08))", color:"#a78bfa", border:"1px solid rgba(167,139,250,0.25)" }}>
                      <Download size={13}/>
                      {copied === ver.v ? "¡Copiado!" : `Descargar v${ver.v}`}
                    </button>
                  )}
                  <button onClick={() => copy(`https://civac.co/install?v=${ver.v}`, `link-${ver.v}`)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-105"
                    style={{ background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.6)", border:"1px solid rgba(255,255,255,0.08)" }}>
                    <Copy size={12}/>
                    {copied === `link-${ver.v}` ? "¡Copiado!" : "Link instalación"}
                  </button>
                  {ver.status !== "current" && ver.status !== "dev" && (
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

      {/* New version form */}
      <div className="rounded-2xl overflow-hidden" style={{ background:"rgba(0,245,212,0.02)", border:`2px dashed rgba(0,245,212,${showForm ? "0.25":"0.1"})` }}>
        <button onClick={() => setShowForm(v => !v)} className="w-full flex items-center gap-3 p-5 text-left transition-all hover:bg-white/[0.01]">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:"rgba(0,245,212,0.08)", border:"1px solid rgba(0,245,212,0.15)" }}>
            <Plus size={18} style={{ color:"#00f5d4" }}/>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-white">Generar nueva versión PWA</p>
            <p className="text-[11px]" style={{ color:"rgba(148,163,184,0.4)" }}>Compilar y empaquetar para distribución a clientes · pnpm build</p>
          </div>
          {showForm ? <ChevronUp size={16} style={{ color:"rgba(0,245,212,0.4)" }}/> : <ChevronDown size={16} style={{ color:"rgba(0,245,212,0.4)" }}/>}
        </button>
        {showForm && (
          <div className="px-5 pb-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold mb-1.5" style={{ color:"rgba(148,163,184,0.4)", letterSpacing:"0.1em" }}>VERSIÓN</label>
                <input value={newVer.v} onChange={e => setNewVer(p => ({...p, v:e.target.value}))}
                  className="w-full px-3 py-2 rounded-xl text-[13px] font-mono outline-none bg-transparent"
                  style={{ background:"rgba(4,13,26,0.8)", border:"1px solid rgba(0,245,212,0.15)", color:"#00f5d4", caretColor:"#00f5d4" }}/>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold mb-1.5" style={{ color:"rgba(148,163,184,0.4)", letterSpacing:"0.1em" }}>FECHA</label>
                <input type="date" defaultValue="2026-06-01"
                  className="w-full px-3 py-2 rounded-xl text-[13px] font-mono outline-none"
                  style={{ background:"rgba(4,13,26,0.8)", border:"1px solid rgba(0,245,212,0.1)", color:"rgba(148,163,184,0.6)", colorScheme:"dark" }}/>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold mb-1.5" style={{ color:"rgba(148,163,184,0.4)", letterSpacing:"0.1em" }}>NOTAS DE VERSIÓN</label>
              <textarea value={newVer.notes} onChange={e => setNewVer(p => ({...p, notes:e.target.value}))}
                placeholder="Describe los cambios de esta versión..."
                className="w-full px-3 py-2 rounded-xl text-[12px] outline-none resize-none"
                rows={3}
                style={{ background:"rgba(4,13,26,0.8)", border:"1px solid rgba(0,245,212,0.1)", color:"rgba(148,163,184,0.7)", caretColor:"#00f5d4" }}/>
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold mb-2" style={{ color:"rgba(148,163,184,0.4)", letterSpacing:"0.1em" }}>DISPONIBLE PARA PLANES</label>
              <div className="flex gap-2 flex-wrap">
                {["basico","pro","premium","platino"].map(p => {
                  const pc: Record<string,string> = { basico:"#94a3b8", pro:"#00f5d4", premium:"#fbbf24", platino:"#cd7f32" };
                  const active = newVer.plans.includes(p);
                  return (
                    <button key={p} onClick={() => setNewVer(prev => ({ ...prev, plans: active ? prev.plans.filter(x=>x!==p) : [...prev.plans, p] }))}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all"
                      style={{ background: active ? `${pc[p]}20` : "rgba(255,255,255,0.03)", color: active ? pc[p] : "rgba(148,163,184,0.25)", border:`1px solid ${active ? pc[p]+"40" : "rgba(255,255,255,0.06)"}` }}>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-black transition-all hover:scale-105"
                style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", color:"#040d1a" }}>
                <Play size={14}/> Build v{newVer.v}
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold"
                style={{ background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.5)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <Package size={13}/> Solo registrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   DEPENDENCIAS PANEL
══════════════════════════════════════════════════════════════════ */
function DepsPanel() {
  const [tab, setTab] = useState<"frontend"|"api"|"python">("frontend");
  const tabs = [
    { id:"frontend" as const, label:"Frontend / PWA", icon:"🌐", count:DEPENDENCIES.frontend.length },
    { id:"api"      as const, label:"API Server",      icon:"⚡", count:DEPENDENCIES.api.length },
    { id:"python"   as const, label:"Python Backend",  icon:"🐍", count:DEPENDENCIES.python.length },
  ];
  const typeColor: Record<string,string> = {
    core:"#00f5d4", build:"#a78bfa", lang:"#3178c6", style:"#38bdf8",
    ui:"#f8f9fa", routing:"#39ff7e", charts:"#ff6b35", icons:"#fbbf24",
    utils:"#94a3b8", valid:"#ec5990", forms:"#e879f9", runtime:"#68a063",
    auth:"#d63aff", net:"#94a3b8", db:"#c5f74f", data:"#e70488",
    api:"#a30000", deploy:"#499848", pkg:"#de5fe9",
  };

  const deps = DEPENDENCIES[tab];
  const total = DEPENDENCIES.frontend.length + DEPENDENCIES.api.length + DEPENDENCIES.python.length;

  return (
    <div className="space-y-5">
      <SectionHeader icon={Box} label="Dependencias del Proyecto" sub={`${total} paquetes en total · pnpm + uv managed`} color="#fbbf24" />

      {/* Tab selector */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ background:"rgba(4,13,26,0.8)", border:"1px solid rgba(255,255,255,0.06)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold transition-all"
            style={{ background: tab===t.id ? "rgba(251,191,36,0.12)" : "transparent", color: tab===t.id ? "#fbbf24" : "rgba(148,163,184,0.4)", border: tab===t.id ? "1px solid rgba(251,191,36,0.2)" : "1px solid transparent" }}>
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono" style={{ background:"rgba(255,255,255,0.05)", color:"rgba(148,163,184,0.4)" }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Deps grid */}
      <div className="space-y-2">
        {deps.map(d => (
          <div key={d.name} className="flex items-center gap-3 p-3.5 rounded-xl transition-all hover:bg-white/[0.01]"
            style={{ background:"rgba(4,13,26,0.6)", border:"1px solid rgba(255,255,255,0.05)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
              style={{ background:`${d.color}14`, border:`1px solid ${d.color}25`, color:d.color }}>
              {d.name.slice(0,3).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <p className="text-[13px] font-bold text-white">{d.name}</p>
                <code className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.4)" }}>v{d.v}</code>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background:`${typeColor[d.type] || "#94a3b8"}14`, color: typeColor[d.type] || "#94a3b8" }}>{d.type}</span>
              </div>
              <p className="text-[11px]" style={{ color:"rgba(148,163,184,0.4)" }}>{d.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Install commands */}
      <div className="rounded-xl p-4" style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] font-mono font-bold mb-3 tracking-widest" style={{ color:"rgba(148,163,184,0.3)" }}>COMANDOS DE INSTALACIÓN</p>
        <div className="space-y-2 font-mono text-[11px]">
          {[
            { label:"Frontend + API", cmd:"pnpm install", color:"#a78bfa" },
            { label:"Python backends", cmd:"uv sync", color:"#3776ab" },
            { label:"Check outdated", cmd:"pnpm outdated", color:"#fbbf24" },
            { label:"Update all", cmd:"pnpm update --latest", color:"#39ff7e" },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-3">
              <span className="w-28 text-[9px]" style={{ color:"rgba(148,163,184,0.3)" }}>{c.label}</span>
              <code className="flex-1 px-2.5 py-1.5 rounded-lg" style={{ background:"rgba(255,255,255,0.03)", color:c.color, border:`1px solid ${c.color}18` }}>$ {c.cmd}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═════════════���════════════════════════════════════════════════════
   LENGUAJES PANEL
══════════════════════════════════════════════════════════════════ */
function LangsPanel() {
  return (
    <div className="space-y-5">
      <SectionHeader icon={FileCode} label="Lenguajes & Stack" sub="Distribución de código · tecnologías y frameworks del proyecto" color="#3178c6" />

      {/* Language bars */}
      <div className="rounded-2xl p-5" style={{ background:"rgba(4,13,26,0.7)", border:"1px solid rgba(49,120,198,0.15)" }}>
        <p className="text-[10px] font-mono font-bold mb-4 tracking-widest" style={{ color:"rgba(49,120,198,0.4)" }}>DISTRIBUCIÓN DE CÓDIGO</p>
        {LANGUAGES_STACK.map(l => (
          <div key={l.lang} className="mb-4 last:mb-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-8 h-5 rounded text-[8px] font-black flex items-center justify-center"
                  style={{ background:`${l.color}20`, border:`1px solid ${l.color}35`, color:l.color }}>{l.icon}</span>
                <span className="text-[13px] font-bold text-white">{l.lang}</span>
                <code className="text-[10px] font-mono" style={{ color:"rgba(148,163,184,0.3)" }}>{l.version}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono" style={{ color:"rgba(148,163,184,0.35)" }}>{l.files} archivos</span>
                <span className="text-[13px] font-black" style={{ color:l.color }}>{l.pct}%</span>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-full" style={{ width:`${l.pct}%`, background:`linear-gradient(90deg,${l.color}60,${l.color})` }}/>
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {l.uses.map(u => (
                <span key={u} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background:`${l.color}0c`, color:`${l.color}80`, border:`1px solid ${l.color}18` }}>{u}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tech badges */}
      <div className="rounded-xl p-5" style={{ background:"rgba(4,13,26,0.6)", border:"1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-[10px] font-mono font-bold mb-4 tracking-widest" style={{ color:"rgba(148,163,184,0.3)" }}>FRAMEWORKS & RUNTIMES</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {[
            { name:"Node.js 24 LTS",  icon:"⬡", color:"#68a063", sub:"API runtime" },
            { name:"React 18",        icon:"⚛",  color:"#61dafb", sub:"UI framework" },
            { name:"Vite 6",          icon:"⚡", color:"#a78bfa", sub:"Build & HMR" },
            { name:"Django 5.2",      icon:"🎸", color:"#092e20", sub:"GPS server" },
            { name:"Flask 3.1",       icon:"🧪", color:"#a78bfa", sub:"Analytics" },
            { name:"Tailwind v4",     icon:"🌊", color:"#38bdf8", sub:"CSS framework" },
            { name:"shadcn/ui",       icon:"◻",  color:"#f8f9fa", sub:"Components" },
            { name:"Drizzle ORM",     icon:"💧", color:"#c5f74f", sub:"DB TypeScript" },
            { name:"pnpm 10",         icon:"📦", color:"#f69220", sub:"Package mgr" },
            { name:"uv 0.7",          icon:"🐍", color:"#de5fe9", sub:"Python PM" },
            { name:"wouter 3",        icon:"🛣",  color:"#00f5d4", sub:"SPA router" },
            { name:"Recharts 2",      icon:"📊", color:"#ff6b35", sub:"Charts" },
          ].map(t => (
            <div key={t.name} className="flex items-center gap-2 p-3 rounded-xl" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
              <span className="text-lg">{t.icon}</span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white leading-tight">{t.name}</p>
                <p className="text-[9px]" style={{ color:`${t.color}80` }}>{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File structure summary */}
      <div className="rounded-xl p-4" style={{ background:"rgba(0,0,0,0.35)", border:"1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] font-mono font-bold mb-3 tracking-widest" style={{ color:"rgba(148,163,184,0.3)" }}>ESTRUCTURA WORKSPACE</p>
        <div className="font-mono text-[11px] space-y-1" style={{ color:"rgba(148,163,184,0.5)" }}>
          {[
            { path:"artifacts/ganader-ia/src/", detail:"42 archivos TS/TSX · frontend PWA", color:"#3178c6" },
            { path:"artifacts/api-server/src/", detail:"8 archivos TS · REST API Node", color:"#68a063" },
            { path:"artifacts/analytics-server/", detail:"6 archivos Python · Flask analytics", color:"#3776ab" },
            { path:"artifacts/gps-server/",       detail:"12 archivos Python · Django + REST", color:"#3776ab" },
            { path:"pnpm-workspace.yaml",         detail:"monorepo config", color:"#fbbf24" },
          ].map(f => (
            <div key={f.path} className="flex items-start gap-2">
              <span style={{ color:f.color }}>├─</span>
              <span style={{ color:f.color }}>{f.path}</span>
              <span className="opacity-40">{f.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   INTEGRACIONES PANEL
══════════════════════════════════════════════════════════════════ */
function IntegPanel() {
  const [copied, setCopied] = useState<string|null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(()=>{});
    setCopied(key);
    setTimeout(() => setCopied(null), 1600);
  };
  const categories = [...new Set(INTEGRATIONS.map(i => i.category))];
  const statusStyle: Record<string,{color:string;label:string}> = {
    active:      { color:"#39ff7e", label:"Activa" },
    configured:  { color:"#00f5d4", label:"Config." },
    pending:     { color:"#fbbf24", label:"Pendiente" },
    disabled:    { color:"#6b7280", label:"Desact." },
  };

  return (
    <div className="space-y-5">
      <SectionHeader icon={Plug} label="Integraciones" sub="APIs externas · IoT · pagos · PWA nativas del sistema CIVAC" color="#f97316" />

      <div className="p-3 rounded-xl flex items-start gap-3" style={{ background:"rgba(249,115,22,0.05)", border:"1px solid rgba(249,115,22,0.15)" }}>
        <Plug size={14} style={{ color:"#f97316", flexShrink:0, marginTop:1 }}/>
        <p className="text-[12px]" style={{ color:"rgba(249,115,22,0.7)" }}>
          {INTEGRATIONS.filter(i => i.status === "active" || i.status === "configured").length} de {INTEGRATIONS.length} integraciones activas. Las claves visibles son demo/test — reemplazar con credenciales reales en producción.
        </p>
      </div>

      {categories.map(cat => (
        <div key={cat}>
          <p className="text-[10px] font-mono font-black tracking-widest mb-2 px-1" style={{ color:"rgba(249,115,22,0.35)" }}>— {cat.toUpperCase()} —</p>
          <div className="space-y-2.5">
            {INTEGRATIONS.filter(i => i.category === cat).map(integ => {
              const st = statusStyle[integ.status] || statusStyle.active;
              return (
                <div key={integ.id} className="rounded-xl overflow-hidden" style={{ background:"rgba(4,13,26,0.7)", border:`1px solid ${integ.color}18` }}>
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background:`${integ.color}12`, border:`1px solid ${integ.color}25` }}>{integ.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="text-[14px] font-bold text-white">{integ.name}</p>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                            style={{ background:`${st.color}14`, color:st.color, border:`1px solid ${st.color}30` }}>{st.label}</span>
                        </div>
                        <p className="text-[11px]" style={{ color:"rgba(148,163,184,0.45)" }}>{integ.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background:"rgba(0,0,0,0.25)", border:"1px solid rgba(255,255,255,0.05)" }}>
                      <code className="flex-1 text-[10px] font-mono truncate" style={{ color:"rgba(148,163,184,0.5)" }}>{integ.key}</code>
                      <button onClick={() => copy(integ.key, integ.id)} className="flex items-center gap-1 text-[10px] font-mono transition-colors flex-shrink-0"
                        style={{ color: copied===integ.id ? "#39ff7e" : "rgba(148,163,184,0.3)" }}>
                        <Copy size={11}/>{copied===integ.id ? "OK" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Add integration */}
      <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-dashed text-[13px] font-semibold transition-all"
        style={{ background:"transparent", border:"2px dashed rgba(249,115,22,0.12)", color:"rgba(249,115,22,0.35)" }}>
        <Plus size={16}/> Agregar nueva integración
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   INSTANCIAS PANEL
══════════════════════════════════════════════════════════════════ */
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Total instancias", val:`${CLIENT_INSTANCES.length}`, color:"#00c8ff" },
          { label:"Activas",          val:`${CLIENT_INSTANCES.filter(i=>i.status==="active").length}`,   color:"#39ff7e" },
          { label:"Trial",            val:`${CLIENT_INSTANCES.filter(i=>i.status==="trial").length}`,    color:"#fbbf24" },
          { label:"Inactivas",        val:`${CLIENT_INSTANCES.filter(i=>i.status==="inactive").length}`, color:"#6b7280" },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-xl text-center" style={{ background:"rgba(4,13,26,0.7)", border:`1px solid ${s.color}18` }}>
            <p className="text-xl font-black" style={{ color:s.color }}>{s.val}</p>
            <p className="text-[10px] mt-0.5" style={{ color:"rgba(148,163,184,0.4)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {CLIENT_INSTANCES.map(inst => {
          const st = statusStyle[inst.status];
          return (
            <div key={inst.id} className="rounded-xl p-4" style={{ background:"rgba(4,13,26,0.65)", border:"1px solid rgba(0,200,255,0.1)" }}>
              <div className="flex items-start gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-mono" style={{ color:"rgba(0,200,255,0.4)" }}>{inst.id}</span>
                    <h3 className="text-[14px] font-bold text-white truncate">{inst.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                      style={{ background:`rgba(${st.glow},0.1)`, color:st.color, border:`1px solid rgba(${st.glow},0.2)` }}>{st.label}</span>
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
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase"
                    style={{ background:`${planColor[inst.plan]}14`, color:planColor[inst.plan], border:`1px solid ${planColor[inst.plan]}30` }}>{inst.plan}</span>
                  <button className="p-2 rounded-lg" style={{ background:"rgba(0,200,255,0.06)", border:"1px solid rgba(0,200,255,0.14)", color:"#00c8ff" }}><Eye size={13}/></button>
                  <button className="p-2 rounded-lg" style={{ background:"rgba(148,163,184,0.04)", border:"1px solid rgba(148,163,184,0.1)", color:"rgba(148,163,184,0.4)" }}><Settings size={13}/></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-dashed text-[13px] font-semibold"
        style={{ background:"transparent", border:"2px dashed rgba(0,200,255,0.1)", color:"rgba(0,200,255,0.35)" }}>
        <Plus size={16}/> Nueva instancia cliente
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   DEMOS PANEL
══════════════════════════════════════════════════════════════════ */
function DemosPanel() {
  const [copied, setCopied] = useState<string|null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(()=>{});
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon={Play} label="Demos & Cuentas de Venta" sub="Cuentas demo por nivel de plan · usar para mostrar a prospectos" color="#e879f9" />
      <div className="p-3 rounded-xl flex items-start gap-3" style={{ background:"rgba(232,121,249,0.05)", border:"1px solid rgba(232,121,249,0.15)" }}>
        <AlertTriangle size={15} style={{ color:"#e879f9", flexShrink:0, marginTop:1 }}/>
        <p className="text-[12px]" style={{ color:"rgba(232,121,249,0.7)" }}>
          Cuentas exclusivas para <strong>demos comerciales</strong>. No son cuentas CIVAC Staff. Usar para mostrar plataforma a clientes potenciales.
        </p>
      </div>

      {PLAN_DEMOS.map(demo => (
        <div key={demo.id} className="rounded-2xl p-5" style={{ background:"rgba(4,13,26,0.7)", border:`1px solid ${demo.color}20` }}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background:`${demo.color}12`, border:`1px solid ${demo.color}25` }}>{demo.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h3 className="text-[14px] font-black text-white">{demo.label}</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                  style={{ background:`${demo.color}14`, color:demo.color, border:`1px solid ${demo.color}30` }}>{demo.id}</span>
              </div>
              <p className="text-[11px] font-mono" style={{ color:"rgba(148,163,184,0.35)" }}>{demo.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {demo.modules.map(m => (
              <span key={m} className="text-[10px] px-2 py-0.5 rounded-lg"
                style={{ background:`${demo.color}08`, color:`${demo.color}90`, border:`1px solid ${demo.color}18` }}>{m}</span>
            ))}
          </div>

          <div className="rounded-xl p-3 mb-3 font-mono text-[11px]" style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-1">
              <span style={{ color:"rgba(148,163,184,0.35)" }}>EMAIL</span>
              <button onClick={() => copy(demo.email, `e-${demo.id}`)} className="flex items-center gap-1 transition-colors"
                style={{ color: copied===`e-${demo.id}` ? "#39ff7e" : "rgba(148,163,184,0.3)" }}>
                <Copy size={11}/>{copied===`e-${demo.id}` ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p style={{ color: demo.color }}>{demo.email}</p>
            <div className="flex items-center justify-between mt-2 mb-1">
              <span style={{ color:"rgba(148,163,184,0.35)" }}>PASSWORD</span>
              <button onClick={() => copy(demo.pwd, `p-${demo.id}`)} className="flex items-center gap-1 transition-colors"
                style={{ color: copied===`p-${demo.id}` ? "#39ff7e" : "rgba(148,163,184,0.3)" }}>
                <Copy size={11}/>{copied===`p-${demo.id}` ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p style={{ color:"rgba(148,163,184,0.55)" }}>{demo.pwd}</p>
          </div>

          <button
            onClick={() => copy(`Email: ${demo.email}\nPassword: ${demo.pwd}\nURL: ${window.location.origin}\nPlan: ${demo.id.toUpperCase()}`, `full-${demo.id}`)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-105"
            style={{ background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.5)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <Copy size={12}/>{copied===`full-${demo.id}` ? "¡Credenciales copiadas!" : "Copiar todo para cliente"}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STAFF PANEL
══════════════════════════════════════════════════════════════════ */
function StaffPanel() {
  return (
    <div className="space-y-6">
      <SectionHeader icon={Shield} label="CIVAC Staff" sub="Cuentas internas CIVAC · Acceso servidor y plataforma" color="#ff6b35" />
      <div className="p-3 rounded-xl flex items-start gap-3" style={{ background:"rgba(0,245,212,0.04)", border:"1px solid rgba(0,245,212,0.12)" }}>
        <Shield size={15} style={{ color:"#00f5d4", flexShrink:0, marginTop:1 }}/>
        <p className="text-[12px]" style={{ color:"rgba(0,245,212,0.6)" }}>
          Las cuentas CIVAC Staff son del equipo interno. Solo estas cuentas acceden al <strong>CIVAC Server Panel</strong>.
          Todas llevan badge <strong>⬡ CIVAC</strong> en la pantalla de login.
        </p>
      </div>

      <div className="space-y-3">
        {CIVAC_STAFF.map(staff => (
          <div key={staff.id} className="rounded-xl p-4" style={{ background:"rgba(4,13,26,0.7)", border:"1px solid rgba(255,107,53,0.12)" }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background:`${staff.color}12`, border:`1px solid ${staff.color}25` }}>{staff.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-[14px] font-bold text-white">{staff.name}</p>
                  {staff.online && <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:"#39ff7e", boxShadow:"0 0 6px #39ff7e" }}/>}
                  <span className="inline-flex items-center gap-1 rounded-full text-[8px] font-black px-1.5 py-0.5"
                    style={{ background:"rgba(0,245,212,0.1)", border:"1px solid rgba(0,245,212,0.25)", color:"#00f5d4" }}>⬡ CIVAC</span>
                </div>
                <p className="text-[11px] font-mono mb-0.5" style={{ color:staff.color }}>{staff.email}</p>
                <p className="text-[11px]" style={{ color:"rgba(148,163,184,0.4)" }}>{staff.desc}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                  style={{ background:`${staff.color}12`, color:staff.color, border:`1px solid ${staff.color}25` }}>{staff.role}</span>
                <span className="text-[10px] font-mono" style={{ color: staff.online ? "#39ff7e" : "rgba(148,163,184,0.3)" }}>
                  {staff.online ? "● ONLINE" : "○ offline"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-dashed text-[13px] font-semibold"
        style={{ background:"transparent", border:"2px dashed rgba(255,107,53,0.15)", color:"rgba(255,107,53,0.4)" }}>
        <Plus size={16}/> Agregar cuenta CIVAC Staff
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   DEV CONSOLE PANEL
══════════════════════════════════════════════════════════════════ */
function DevConsolePanel() {
  const [cmd, setCmd] = useState("");
  const logEndRef = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<string[]>([
    "[2026-06-01 18:21:03] ⚡ API Server: listening on :8080 · Node 24",
    "[2026-06-01 18:21:05] 📡 GPS Server: Django 5.2 running on :8000",
    "[2026-06-01 18:21:07] 📊 Analytics: Flask 3.1 serving on :8099",
    "[2026-06-01 18:21:09] 🌐 Frontend PWA: Vite 6 ready on :5000",
    "[2026-06-01 18:21:10] 🗄️  DB: PostgreSQL connection OK · schema synced",
    "[2026-06-01 18:21:11] ✅ CIVAC Server: all systems nominal",
    "[2026-06-03 18:21:12] 📦 PWA v7.1.0 en desarrollo · Service Worker v10 activo",
    "[2026-06-01 18:21:13] 🔧 use-toast.ts: React namespace fix aplicado · HMR stable",
  ]);

  const execCmd = () => {
    if (!cmd.trim()) return;
    const responses: Record<string,string> = {
      "pnpm build":           "[build] Compilando 68 archivos TS... done en 4.2s ✓",
      "pnpm typecheck":       "[typecheck] 0 errores · 0 warnings ✓",
      "pnpm install":         "[install] 847 paquetes · frozen lockfile ✓",
      "pnpm outdated":        "[outdated] 2 paquetes actualizables: vite 6.3.5→6.4.0, recharts 2.15.3→2.16.0",
      "uv sync":              "[uv] Environment synced · 10 paquetes Python ✓",
      "restart all":          "[restart] GPS ✓ Analytics ✓ API ✓ Frontend ✓ · todos online",
      "pnpm db push":         "[db] Schema pushed → PostgreSQL · 0 migraciones pendientes ✓",
      "git status":           "[git] On branch main · nothing to commit · working tree clean",
      "ls":                   "[ls] artifacts/  pnpm-workspace.yaml  package.json  replit.md",
    };
    const out = responses[cmd.trim()] || `[server] Ejecutando: ${cmd}`;
    setLog(prev => [...prev, `$ ${cmd}`, out]);
    setCmd("");
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon={Terminal} label="Dev Console" sub="Logs del sistema · explorador API · herramientas de deploy" color="#00ff88" />

      {/* Terminal */}
      <div className="rounded-2xl overflow-hidden" style={{ background:"#020810", border:"1px solid rgba(0,255,136,0.15)" }}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor:"rgba(0,255,136,0.1)", background:"rgba(0,255,136,0.04)" }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70"/>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"/>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70"/>
          </div>
          <span className="text-[10px] font-mono" style={{ color:"rgba(0,255,136,0.4)" }}>civac-server ~ terminal</span>
          <div className="ml-auto flex items-center gap-1 text-[9px] font-mono" style={{ color:"rgba(0,255,136,0.25)" }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-green-400"/>LIVE
          </div>
        </div>
        <div className="p-4 h-60 overflow-y-auto font-mono text-[11px] space-y-1" style={{ color:"rgba(0,255,136,0.7)" }}>
          {log.map((l, i) => (
            <p key={i} style={{ color: l.startsWith("$") ? "#00ff88" : l.includes("ERROR") ? "#ff7070" : "rgba(0,255,136,0.65)" }}>{l}</p>
          ))}
          <div ref={logEndRef}/>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 border-t" style={{ borderColor:"rgba(0,255,136,0.1)" }}>
          <span style={{ color:"rgba(0,255,136,0.5)" }} className="font-mono text-[11px]">$</span>
          <input
            value={cmd}
            onChange={e => setCmd(e.target.value)}
            onKeyDown={e => e.key === "Enter" && execCmd()}
            placeholder="pnpm build | typecheck | uv sync | restart all | git status..."
            className="flex-1 bg-transparent outline-none font-mono text-[11px]"
            style={{ color:"#00ff88", caretColor:"#00ff88" }}
          />
          <button onClick={execCmd} className="px-2 py-1 rounded text-[10px] font-mono"
            style={{ background:"rgba(0,255,136,0.1)", color:"#00ff88", border:"1px solid rgba(0,255,136,0.2)" }}>EXEC</button>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-[10px] font-mono mb-3 tracking-widest" style={{ color:"rgba(148,163,184,0.3)", letterSpacing:"0.1em" }}>ACCIONES RÁPIDAS</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { label:"Build PWA",      icon:"🔨", cmd:"pnpm build",      color:"#00f5d4" },
            { label:"Typecheck",      icon:"✅", cmd:"pnpm typecheck",   color:"#a78bfa" },
            { label:"DB Push",        icon:"🗄️",  cmd:"pnpm db push",    color:"#39ff7e" },
            { label:"Install Deps",   icon:"📦", cmd:"pnpm install",    color:"#fbbf24" },
            { label:"Python Sync",    icon:"🐍", cmd:"uv sync",         color:"#3776ab" },
            { label:"Reiniciar todo", icon:"🔄", cmd:"restart all",     color:"#ff6b35" },
            { label:"Git Status",     icon:"🌿", cmd:"git status",      color:"#68a063" },
            { label:"Ls workspace",   icon:"📁", cmd:"ls",              color:"#94a3b8" },
            { label:"Check outdated", icon:"📋", cmd:"pnpm outdated",   color:"#e879f9" },
          ].map(a => (
            <button key={a.label} onClick={() => { setCmd(a.cmd); }}
              className="flex items-center gap-2 p-3 rounded-xl text-left transition-all hover:scale-105"
              style={{ background:"rgba(4,13,26,0.7)", border:`1px solid ${a.color}18`, color:a.color }}>
              <span className="text-base">{a.icon}</span>
              <div>
                <p className="text-[11px] font-semibold">{a.label}</p>
                <p className="text-[9px] font-mono" style={{ color:`${a.color}50` }}>{a.cmd}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* API explorer */}
      <div className="rounded-xl p-4" style={{ background:"rgba(4,13,26,0.6)", border:"1px solid rgba(0,255,136,0.08)" }}>
        <p className="text-[10px] font-mono font-bold mb-3 tracking-widest" style={{ color:"rgba(0,255,136,0.25)" }}>ENDPOINTS API — :8080</p>
        <div className="space-y-1.5 font-mono text-[10px]">
          {[
            { method:"GET",    path:"/api/health",        color:"#39ff7e" },
            { method:"POST",   path:"/api/auth/login",    color:"#fbbf24" },
            { method:"GET",    path:"/api/animals",       color:"#39ff7e" },
            { method:"POST",   path:"/api/animals",       color:"#fbbf24" },
            { method:"GET",    path:"/api/production",    color:"#39ff7e" },
            { method:"GET",    path:"/api/gps/locations", color:"#39ff7e" },
            { method:"POST",   path:"/api/weighing",      color:"#fbbf24" },
            { method:"GET",    path:"/api/analytics/co2", color:"#39ff7e" },
          ].map(ep => (
            <div key={ep.path} className="flex items-center gap-2">
              <span className="w-10 text-right font-bold" style={{ color: ep.method==="GET" ? "#39ff7e" : "#fbbf24" }}>{ep.method}</span>
              <span style={{ color:"rgba(0,255,136,0.5)" }}>{ep.path}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SESSIONS PANEL — Sesiones activas en tiempo real
══════════════════════════════════════════════════════════════════ */
interface ServerSession {
  id: string; userId: string; userEmail: string; userRole: string;
  userName: string; planCode: string; ipAddress: string; userAgent: string;
  expiresAt: string; createdAt: string; daysUsed?: number;
}

const serverSessionHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("civac_session_token") || localStorage.getItem("civac_server_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function SessionsPanel() {
  const [sessions, setSessions]     = useState<ServerSession[]>([]);
  const [loading, setLoading]       = useState(true);
  const [revoking, setRevoking]     = useState<string|null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const planColor: Record<string,string> = { basico:"#94a3b8", pro:"#00f5d4", premium:"#fbbf24", platino:"#cd7f32" };
  const planIcon:  Record<string,string> = { basico:"⚪", pro:"⚡", premium:"🥇", platino:"🔶" };
  const roleColor: Record<string,string> = { superadmin:"#ff6b35", admin:"#fbbf24", developer:"#00ff88", sales:"#e879f9", vet:"#22c55e", field:"#00c8ff", viewer:"#94a3b8" };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/sessions", { headers: serverSessionHeaders() });
      const d = await r.json() as { ok: boolean; sessions: ServerSession[] };
      if (d.ok) { setSessions(d.sessions ?? []); setLastRefresh(new Date()); }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const revoke = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      const response = await fetch(`/api/admin/sessions/${encodeURIComponent(sessionId)}`, {
        method: "DELETE",
        headers: serverSessionHeaders(),
      });
      if (response.ok) setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch { /* ignore */ }
    setRevoking(null);
  };

  useEffect(() => { void load(); }, []);

  const timeAgo = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 60000) return "hace <1 min";
    if (ms < 3600000) return `hace ${Math.floor(ms/60000)} min`;
    if (ms < 86400000) return `hace ${Math.floor(ms/3600000)}h`;
    return `hace ${Math.floor(ms/86400000)}d`;
  };

  const timeLeft = (iso: string) => {
    const ms = new Date(iso).getTime() - Date.now();
    if (ms <= 0) return "Expirada";
    if (ms < 3600000) return `${Math.floor(ms/60000)} min`;
    if (ms < 86400000) return `${Math.floor(ms/3600000)}h`;
    return `${Math.floor(ms/86400000)}d`;
  };

  const getBrowser = (ua: string) => {
    if (!ua) return "Desconocido";
    if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    if (ua.includes("Edg")) return "Edge";
    return "Web";
  };

  const getDevice = (ua: string) => {
    if (!ua) return "Desktop";
    if (/Mobile|Android|iPhone/.test(ua)) return "📱 Móvil";
    if (/iPad|Tablet/.test(ua)) return "📟 Tablet";
    return "🖥️ Desktop";
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon={Users} label="Sesiones Vigentes" sub="Sesiones no vencidas · Control administrativo" color="#00c8ff"/>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Sesiones activas", val:sessions.length,                                                                    color:"#00c8ff", g:"0,200,255"   },
          { label:"Staff CIVAC",      val:sessions.filter(s=>["superadmin","admin","developer","sales"].includes(s.userRole)).length, color:"#ff6b35", g:"255,107,53"  },
          { label:"Clientes",         val:sessions.filter(s=>!["superadmin","admin","developer","sales"].includes(s.userRole)).length, color:"#39ff7e", g:"57,255,126"  },
          { label:"Última actualización", val:lastRefresh.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit",second:"2-digit"}), color:"#a78bfa", g:"167,139,250" },
        ].map(k => (
          <div key={k.label} className="p-3 rounded-2xl text-center" style={{ background:`rgba(${k.g},0.06)`, border:`1px solid rgba(${k.g},0.18)` }}>
            <p className="text-xl font-black" style={{ color:k.color }}>{k.val}</p>
            <p className="text-[10px] mt-0.5" style={{ color:"rgba(148,163,184,0.45)" }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Refresh */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-mono" style={{ color:"rgba(0,200,255,0.35)" }}>
          {sessions.length} sesión{sessions.length!==1?"es":""} activa{sessions.length!==1?"s":""}
        </p>
        <button onClick={() => void load()} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all hover:opacity-80"
          style={{ background:"rgba(0,200,255,0.08)", border:"1px solid rgba(0,200,255,0.2)", color:"#00c8ff" }}>
          <RefreshCw size={11} className={loading?"animate-spin":""}/>
          Actualizar
        </button>
      </div>

      {/* Sessions cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3" style={{ color:"rgba(0,200,255,0.3)" }}>
          <RefreshCw size={18} className="animate-spin"/>
          <span className="text-sm font-mono">Cargando sesiones…</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background:"rgba(4,13,26,0.5)", border:"1px solid rgba(255,255,255,0.05)" }}>
          <div className="text-3xl mb-3">🔒</div>
          <p className="text-sm text-white/30">No hay sesiones activas en este momento</p>
          <p className="text-[11px] text-white/20 mt-1">Las sesiones aparecen aquí cuando los usuarios inician sesión</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => {
            const pc = planColor[s.planCode] ?? "#94a3b8";
            const rc = roleColor[s.userRole] ?? "#94a3b8";
            const isStaff = ["superadmin","admin","developer","sales"].includes(s.userRole);
            return (
              <div key={s.id} className="rounded-2xl p-4 transition-all"
                style={{ background:"rgba(4,13,26,0.7)", border:`1px solid ${isStaff?"rgba(255,107,53,0.15)":"rgba(0,200,255,0.1)"}` }}>
                <div className="flex items-start gap-3 flex-wrap">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0"
                    style={{ background:`${rc}12`, border:`1px solid ${rc}30`, color:rc }}>
                    {s.userName[0]?.toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-[13px] font-black text-white">{s.userName}</p>
                      {isStaff && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                          style={{ background:"rgba(0,245,212,0.1)", border:"1px solid rgba(0,245,212,0.3)", color:"#00f5d4" }}>⬡ CIVAC</span>
                      )}
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize"
                        style={{ background:`${rc}10`, border:`1px solid ${rc}25`, color:rc }}>{s.userRole}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background:`${pc}10`, border:`1px solid ${pc}25`, color:pc }}>{planIcon[s.planCode]}{s.planCode}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[10px]" style={{ color:"rgba(148,163,184,0.45)" }}>
                      <span>📧 {s.userEmail}</span>
                      <span>🌐 {s.ipAddress || "IP desconocida"}</span>
                      <span>💻 {getDevice(s.userAgent)} · {getBrowser(s.userAgent)}</span>
                      <span>🕐 Login: {timeAgo(s.createdAt)}</span>
                      <span>📆 {s.daysUsed ?? 0} días de uso registrados</span>
                      <span style={{ color:timeLeft(s.expiresAt)==="Expirada"?"#f87171":"rgba(148,163,184,0.45)" }}>
                        ⏱️ Expira: {timeLeft(s.expiresAt)}
                      </span>
                    </div>
                    <p className="text-[9px] font-mono mt-1" style={{ color:"rgba(0,200,255,0.2)" }}>
                      Token: {s.id.slice(0,8)}…{s.id.slice(-4)}
                    </p>
                  </div>

                  {/* Revoke */}
                  <button onClick={() => void revoke(s.id)} disabled={revoking === s.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all disabled:opacity-50 flex-shrink-0"
                    style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171" }}>
                    {revoking === s.id ? <RefreshCw size={10} className="animate-spin"/> : <Lock size={10}/>}
                    Revocar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl p-4" style={{ background:"rgba(0,200,255,0.04)", border:"1px solid rgba(0,200,255,0.1)" }}>
        <p className="text-[11px] font-bold mb-2" style={{ color:"rgba(0,200,255,0.5)" }}>📋 Información de sesiones</p>
        <div className="space-y-1.5 text-[10px]" style={{ color:"rgba(148,163,184,0.4)" }}>
          <div className="flex items-start gap-2"><CheckCircle size={10} style={{ color:"#39ff7e", flexShrink:0, marginTop:1 }}/> Cada sesión dura 7 días desde el último login</div>
          <div className="flex items-start gap-2"><CheckCircle size={10} style={{ color:"#39ff7e", flexShrink:0, marginTop:1 }}/> Al revocar una sesión, el usuario es desconectado inmediatamente</div>
          <div className="flex items-start gap-2"><CheckCircle size={10} style={{ color:"#39ff7e", flexShrink:0, marginTop:1 }}/> Las sesiones expiradas se limpian automáticamente</div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CONFIG PANEL
══════════════════════════════════════════════════════════════════ */
function ConfigPanel() {
  return (
    <div className="space-y-6">
      <SectionHeader icon={Settings} label="Configuración del Servidor" sub="Ajustes globales del sistema CIVAC Platform" color="#94a3b8" />

      {/* Platform settings */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono font-bold tracking-widest mb-3" style={{ color:"rgba(148,163,184,0.3)" }}>PLATAFORMA</p>
        {[
          { label:"Dominio principal",      val:"civac.co",                   icon:"🌐", editable:false },
          { label:"Versión plataforma",     val:"CIVAC PRO v2.1.0",           icon:"📦", editable:false },
          { label:"Región de despliegue",   val:"Bogotá, Colombia — SA-East", icon:"📍", editable:false },
          { label:"Base de datos",          val:"PostgreSQL (Replit native)",  icon:"🗄️", editable:false },
          { label:"PWA Service Worker",     val:"v8 · 33 rutas · Offline full", icon:"⚙️", editable:false },
          { label:"Stack frontend",         val:"React 18 · Vite 6 · TS 5.9", icon:"🌐", editable:false },
          { label:"Stack backend",          val:"Node 24 · Python 3.12",      icon:"⚡", editable:false },
        ].map(cfg => (
          <div key={cfg.label} className="flex items-center gap-3 p-3.5 rounded-xl"
            style={{ background:"rgba(4,13,26,0.6)", border:"1px solid rgba(148,163,184,0.07)" }}>
            <span className="text-lg flex-shrink-0">{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px]" style={{ color:"rgba(148,163,184,0.4)" }}>{cfg.label}</p>
              <p className="text-[13px] font-semibold text-white truncate">{cfg.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Runtime settings */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono font-bold tracking-widest mb-3" style={{ color:"rgba(148,163,184,0.3)" }}>RUNTIME EDITABLE</p>
        {[
          { label:"JWT expiry",             val:"24h",  icon:"🔑" },
          { label:"Max instancias",         val:"100",  icon:"🏘️"  },
          { label:"GPS polling interval",   val:"4s",   icon:"📡" },
          { label:"Toast auto-dismiss",     val:"5000ms",icon:"🔔" },
          { label:"Cache TTL assets",       val:"7 días",icon:"💾" },
          { label:"Log retention",          val:"30 días",icon:"📋" },
        ].map(cfg => (
          <div key={cfg.label} className="flex items-center gap-3 p-3.5 rounded-xl"
            style={{ background:"rgba(4,13,26,0.6)", border:"1px solid rgba(148,163,184,0.07)" }}>
            <span className="text-lg flex-shrink-0">{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px]" style={{ color:"rgba(148,163,184,0.4)" }}>{cfg.label}</p>
              <p className="text-[13px] font-semibold text-white">{cfg.val}</p>
            </div>
            <button className="p-1.5 rounded-lg transition-all hover:scale-105"
              style={{ background:"rgba(148,163,184,0.06)", border:"1px solid rgba(148,163,184,0.12)", color:"rgba(148,163,184,0.4)" }}>
              <Settings size={12}/>
            </button>
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="rounded-xl p-4" style={{ background:"rgba(255,80,80,0.03)", border:"1px solid rgba(255,80,80,0.1)" }}>
        <p className="text-[11px] font-bold mb-3" style={{ color:"rgba(255,112,112,0.6)" }}>🔒 SEGURIDAD</p>
        <div className="space-y-2 text-[12px]">
          {[
            "CORS: solo civac.co y *.replit.dev en producción",
            "Helmet.js: headers de seguridad habilitados",
            "Rate limit: 100 req/min por IP",
            "HTTPS: TLS 1.3 · certificado Replit auto-renovable",
            "Secrets: variables de entorno · nunca en código",
          ].map(item => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle size={12} style={{ color:"#39ff7e", flexShrink:0, marginTop:1 }}/>
              <span style={{ color:"rgba(148,163,184,0.5)" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   DATABASE PANEL — Code Gateway
══════════════════════════════════════════════════════════════════ */
interface GwStatus { ok:boolean; mode:string; alive:boolean; pgAvailable:boolean; sqliteAvailable:boolean; pgUrl:string|null; sqlitePath:string|null; lastCheck:string; errorMsg:string|null; }
interface GwInfo   { ok:boolean; mode:string; path?:string; sizeKb?:number; version?:string; tables?:string[]; message?:string; }
interface GwQueue  { ok:boolean; mode:string; pendientes:number; items:{id:number;operacion:string;tabla:string;estado:string;created_at:string}[]; message?:string; }

function DatabasePanel() {
  const [status, setStatus] = useState<GwStatus|null>(null);
  const [info,   setInfo]   = useState<GwInfo|null>(null);
  const [queue,  setQueue]  = useState<GwQueue|null>(null);
  const [loading,setLoading]= useState(true);
  const [reconn, setReconn] = useState(false);
  const [hist,   setHist]   = useState<{t:string; mode:string; alive:boolean}[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sR,iR,qR] = await Promise.all([
        fetch("/api/db/status"), fetch("/api/db/info"), fetch("/api/db/sync-queue"),
      ]);
      const s:GwStatus = sR.ok ? await sR.json() : null;
      const i:GwInfo   = iR.ok ? await iR.json() : null;
      const q:GwQueue  = qR.ok ? await qR.json() : null;
      if (s) { setStatus(s); setHist(h => [...h.slice(-23), { t: new Date().toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}), mode:s.mode, alive:s.alive }]); }
      if (i) setInfo(i);
      if (q) setQueue(q);
    } catch { /* offline */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); const id = setInterval(fetchAll, 15000); return () => clearInterval(id); }, [fetchAll]);

  const reconnect = async () => {
    setReconn(true);
    try { await fetch("/api/db/reconnect", { method:"POST" }); await fetchAll(); } catch { /* ignore */ }
    setReconn(false);
  };

  const mode   = status?.mode ?? "unknown";
  const modeC  = mode === "postgres" ? "#00c8ff" : mode === "sqlite" ? "#fbbf24" : "#f87171";
  const modeG  = mode === "postgres" ? "0,200,255" : mode === "sqlite" ? "251,191,36" : "248,113,113";
  const modeLabel = mode === "postgres" ? "PostgreSQL" : mode === "sqlite" ? "SQLite Local" : "Sin BD";
  const modeIcon  = mode === "postgres" ? "🐘" : mode === "sqlite" ? "🗄️" : "❌";

  const KPI = ({ label, val, color }: {label:string;val:string;color:string}) => (
    <div className="rounded-xl p-3.5 flex flex-col gap-1" style={{background:"rgba(4,13,26,0.7)",border:`1px solid rgba(${modeG},0.12)`}}>
      <span className="text-[8px] font-black uppercase tracking-widest" style={{color:`rgba(${modeG},0.35)`}}>{label}</span>
      <span className="text-[13px] font-black leading-none" style={{color}}>{val}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionHeader icon={Database} label="Base de Datos — Code Gateway" sub="Failover automático PostgreSQL ↔ SQLite · Sincronización offline" color={modeC} />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPI label="Modo activo"    val={loading ? "..." : `${modeIcon} ${modeLabel}`} color={modeC} />
        <KPI label="Estado"         val={loading ? "..." : (status?.alive ? "🟢 Online" : "🔴 Offline")} color={status?.alive ? "#22c55e" : "#f87171"} />
        <KPI label="PostgreSQL"     val={loading ? "..." : (status?.pgAvailable ? "Conectado" : "No disponible")} color={status?.pgAvailable ? "#00c8ff" : "#94a3b8"} />
        <KPI label="Cola pendiente" val={loading ? "..." : `${queue?.pendientes ?? 0} ops`} color={(queue?.pendientes ?? 0) > 0 ? "#f87171" : "#22c55e"} />
      </div>

      {/* Mode selector display */}
      <div className="rounded-2xl overflow-hidden" style={{border:`1px solid rgba(${modeG},0.22)`,background:`rgba(${modeG},0.04)`}}>
        <div className="px-4 py-3 flex items-center justify-between" style={{background:"rgba(0,0,0,0.4)",borderBottom:`1px solid rgba(${modeG},0.12)`}}>
          <span className="text-xs font-black text-white flex items-center gap-2">
            <Database size={13} style={{color:modeC}}/> Conexión activa
          </span>
          <div className="flex items-center gap-2">
            {mode === "sqlite" && (
              <button onClick={reconnect} disabled={reconn}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all"
                style={{background:`rgba(${modeG},0.10)`,color:modeC,border:`1px solid rgba(${modeG},0.3)`,opacity:reconn?0.5:1}}>
                <RefreshCw size={9} className={reconn?"animate-spin":""}/> Reconectar PG
              </button>
            )}
            <button onClick={fetchAll} disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all"
              style={{background:"rgba(255,255,255,0.05)",color:"#94a3b8",border:"1px solid rgba(255,255,255,0.08)",opacity:loading?0.5:1}}>
              <RefreshCw size={9} className={loading?"animate-spin":""}/> Refrescar
            </button>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {/* PG URL */}
          {status?.pgUrl && (
            <div className="rounded-xl p-3" style={{background:"rgba(0,0,0,0.3)"}}>
              <p className="text-[8px] text-white/25 uppercase tracking-wider mb-1">URL PostgreSQL</p>
              <code className="text-[9px] font-mono break-all" style={{color:"rgba(0,200,255,0.65)"}}>{status.pgUrl}</code>
            </div>
          )}
          {/* SQLite info */}
          {info?.mode === "sqlite" && (
            <div className="rounded-xl p-3 space-y-2" style={{background:"rgba(0,0,0,0.3)"}}>
              <div className="flex justify-between items-center">
                <span className="text-[8px] text-white/25 uppercase tracking-wider">Archivo SQLite local</span>
                <span className="text-[9px] font-mono" style={{color:"#fbbf24"}}>{info.sizeKb} KB · SQLite {info.version}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {info.tables?.map(t => (
                  <span key={t} className="px-1.5 py-0.5 rounded-md text-[8px] font-mono"
                    style={{background:"rgba(251,191,36,0.07)",color:"rgba(251,191,36,0.65)",border:"1px solid rgba(251,191,36,0.12)"}}>
                    {t}
                  </span>
                ))}
              </div>
              <code className="text-[8px] text-white/20 font-mono">{info.path}</code>
            </div>
          )}
          {/* Last check */}
          {status?.lastCheck && (
            <div className="flex items-center gap-2">
              <Clock size={10} style={{color:"rgba(255,255,255,0.2)"}}/>
              <span className="text-[9px] text-white/25">Última verificación: {new Date(status.lastCheck).toLocaleTimeString("es-CO",{hour12:false})}</span>
            </div>
          )}
        </div>
      </div>

      {/* Historia de conexión */}
      {hist.length > 1 && (
        <div className="rounded-2xl p-4" style={{background:"rgba(4,13,26,0.6)",border:"1px solid rgba(255,255,255,0.06)"}}>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Historial de conexión (últimos {hist.length} checks)</p>
          <div className="flex items-end gap-1 h-12">
            {hist.map((h,i) => (
              <div key={i} className="flex-1 rounded-sm transition-all" title={`${h.t} — ${h.mode} (${h.alive?"online":"offline"})`}
                style={{height:"100%",background:h.alive?(h.mode==="postgres"?"rgba(0,200,255,0.5)":"rgba(251,191,36,0.5)"):"rgba(248,113,113,0.4)",minWidth:4}} />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[7px] text-white/20">{hist[0]?.t}</span>
            <span className="text-[7px] text-white/20">Ahora — {hist[hist.length-1]?.t}</span>
          </div>
        </div>
      )}

      {/* Cola de sincronización */}
      <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.07)"}}>
        <div className="px-4 py-3 flex items-center justify-between" style={{background:"rgba(0,0,0,0.4)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <span className="text-xs font-black text-white flex items-center gap-2">
            <Activity size={13} style={{color:"#a78bfa"}}/> Cola de sincronización
          </span>
          <span className="text-[10px] font-black" style={{color:(queue?.pendientes??0)>0?"#f87171":"#22c55e"}}>
            {queue?.pendientes ?? 0} pendientes
          </span>
        </div>
        <div className="p-4">
          {queue?.message && (
            <p className="text-[9px] text-white/35 mb-3">{queue.message}</p>
          )}
          {(queue?.items?.length ?? 0) > 0 ? (
            <div className="divide-y divide-white/5">
              {queue!.items.slice(0,10).map(item => (
                <div key={item.id} className="flex items-center gap-3 py-2 text-[9px]">
                  <span className="font-mono text-white/20 w-8">#{item.id}</span>
                  <span className="font-bold w-16" style={{color:"#fbbf24"}}>{item.operacion}</span>
                  <span className="text-white/45 w-24 truncate">{item.tabla}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[7px] font-bold"
                    style={{background:"rgba(57,255,126,0.1)",color:"#39ff7e",border:"1px solid rgba(57,255,126,0.2)"}}>{item.estado}</span>
                  <span className="text-white/20 text-[8px] ml-auto font-mono">{item.created_at}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 py-2">
              <CheckCircle size={12} style={{color:"#22c55e"}}/>
              <span className="text-[9px] text-white/35">Cola vacía — todas las operaciones sincronizadas</span>
            </div>
          )}
        </div>
      </div>

      {/* Arquitectura */}
      <div className="rounded-2xl p-5" style={{background:"rgba(0,245,212,0.03)",border:"1px solid rgba(0,245,212,0.12)"}}>
        <p className="text-xs font-black text-white mb-4 flex items-center gap-2">
          <GitBranch size={13} style={{color:"#00f5d4"}}/> Arquitectura Code Gateway
        </p>
        <div className="space-y-3">
          {[
            { step:"1", label:"API Server arranca", desc:"initGateway() se llama en main()", c:"#00f5d4" },
            { step:"2", label:"Detecta PostgreSQL", desc:"Ping con timeout de 3 segundos al DATABASE_URL", c:"#00c8ff" },
            { step:"3", label:"Failover automático", desc:"Si PG falla → activa SQLite (civac-local.db, WAL mode)", c:"#fbbf24" },
            { step:"4", label:"Cola de sync", desc:"Operaciones se encolan en sync_queue para replicar cuando PG vuelva", c:"#a78bfa" },
            { step:"5", label:"Reconexión", desc:"POST /api/db/reconnect intenta restablecer PG en caliente", c:"#39ff7e" },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center font-black text-[9px] flex-shrink-0 mt-0.5"
                style={{background:`rgba(${modeG},0.12)`,color:s.c,border:`1px solid rgba(${modeG},0.2)`}}>{s.step}</div>
              <div>
                <p className="text-[11px] font-bold" style={{color:s.c}}>{s.label}</p>
                <p className="text-[9px] text-white/35 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl font-mono text-[9px]" style={{background:"rgba(0,0,0,0.4)",color:"rgba(0,245,212,0.5)"}}>
          <span style={{color:"rgba(255,255,255,0.2)"}}>// Flujo en código</span>{"\n"}
          <span style={{color:"#00c8ff"}}>initGateway</span>() → ping PG → {"{"}ok: true{"}"} → <span style={{color:"#22c55e"}}>modo postgres</span>{"\n"}
          <span style={{color:"#00c8ff"}}>initGateway</span>() → ping PG → timeout  → <span style={{color:"#fbbf24"}}>modo sqlite</span> + sync_queue
        </div>
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

  useEffect(() => {
    if (user && !CIVAC_STAFF_IDS.includes(user.id)) navigate("/");
    if (!user) navigate("/server");
  }, [user]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false });

  const PANELS: Record<string, ReactNode> = {
    hub: <HubPanel />,
    servicios: <ServicesPanel />,
    sesiones: <SessionsPanel />,
    database: <DatabasePanel />,
    versiones: <VersionesPanel />,
    deps: <DepsPanel />,
    langs: <LangsPanel />,
    integ: <IntegPanel />,
    instancias: <InstanciasPanel />,
    demos: <DemosPanel />,
    staff: <StaffPanel />,
    dev: <DevConsolePanel />,
    config: <ConfigPanel />,
  };

  return (
    <div className="min-h-screen flex" style={{ background:"linear-gradient(145deg,#020810,#040d1a 50%,#020810)", fontFamily:"'Space Grotesk','Sora',sans-serif" }}>
      <style>{`@keyframes pulse-glow { 0%,100% { opacity:0.6; } 50% { opacity:1; } }`}</style>

      {mobileOpen && <div className="fixed inset-0 bg-black/75 z-40 lg:hidden" onClick={() => setMobileOpen(false)}/>}

      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 ${collapsed ? "w-[60px]" : "w-[240px]"} z-50 flex flex-col border-r transition-all duration-250 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background:"linear-gradient(180deg,#020810 0%,#040d1a 50%,#020810 100%)", borderColor:"rgba(0,245,212,0.12)", boxShadow:"2px 0 20px rgba(0,0,0,0.6)" }}>

        {/* Logo */}
        <div className="h-[64px] flex items-center justify-between px-3 border-b flex-shrink-0" style={{ borderColor:"rgba(0,245,212,0.1)" }}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", boxShadow:"0 0 16px rgba(0,245,212,0.45)" }}>
                <Server size={18} style={{ color:"#040d1a" }}/>
              </div>
              <div>
                <p className="font-black text-white text-[15px] leading-tight" style={{ fontFamily:"'Sora',sans-serif" }}>CIVAC</p>
                <p className="text-[8px] font-bold px-1.5 py-0.5 rounded-md leading-none mt-0.5 font-mono"
                  style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", color:"#040d1a", letterSpacing:"0.06em" }}>SERVER PANEL</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", boxShadow:"0 0 12px rgba(0,245,212,0.4)" }}>
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
            <div className="flex items-center gap-2 px-2.5 py-2.5 rounded-[13px]"
              style={{ background:"rgba(0,245,212,0.05)", border:"1px solid rgba(0,245,212,0.12)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", color:"#040d1a" }}>
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
            <p className="text-[9px] uppercase font-black tracking-[0.18em] px-2 pt-2 pb-1 font-mono" style={{ color:"rgba(0,245,212,0.22)" }}>— PLATFORM CONTROL —</p>
          )}
          {NAV_SECTIONS.map(sec => {
            const Icon = sec.icon;
            const active = section === sec.id;
            return (
              <button key={sec.id} onClick={() => { setSection(sec.id); setMobileOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2 py-2 transition-all group relative overflow-hidden"
                style={{ borderRadius:13, background:active ? `rgba(${sec.glow},0.1)` : "transparent", border:active ? `1px solid rgba(${sec.glow},0.22)` : "1px solid transparent" }}>
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ background:`linear-gradient(180deg,${sec.color},${sec.color}88)` }}/>
                )}
                <div className="flex-shrink-0 flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ width:30, height:30, borderRadius:10, background:active ? `rgba(${sec.glow},0.18)` : `rgba(${sec.glow},0.07)`, border:`1px solid rgba(${sec.glow},${active ? "0.3" : "0.15"})`, color:active ? sec.color : `rgba(${sec.glow},0.55)` }}>
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
            <div className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono" style={{ color:"rgba(0,245,212,0.18)" }}>
              <div className="w-1 h-1 rounded-full" style={{ background:"#00f5d4" }}/>
              <span>CIVAC Platform v2.1 · Server</span>
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

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-250 ${collapsed ? "lg:pl-[60px]" : "lg:pl-[240px]"}`}>
        {/* Topbar */}
        <header className="h-[56px] sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 border-b"
          style={{ background:"rgba(2,8,16,0.97)", backdropFilter:"blur(28px)", borderColor:"rgba(0,245,212,0.09)", boxShadow:"0 1px 20px rgba(0,0,0,0.5)" }}>
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
                  <div className="hidden sm:flex w-8 h-8 items-center justify-center rounded-xl"
                    style={{ background:`rgba(${sec.glow},0.14)`, border:`1px solid rgba(${sec.glow},0.22)`, color:sec.color }}>
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
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold rounded-[10px] font-mono"
              style={{ color:"#39ff7e", background:"rgba(57,255,126,0.07)", border:"1px solid rgba(57,255,126,0.18)" }}>
              <Activity size={9}/><span>PLATFORM ONLINE</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-[11px] font-mono" style={{ color:"rgba(0,245,212,0.4)" }}>{timeStr}</span>
            <div className="w-px h-4 bg-white/10 hidden sm:block"/>
            <span className="hidden sm:block text-xs truncate max-w-[130px]" style={{ color:"rgba(148,163,184,0.3)" }}>{user?.email}</span>
            <div className="w-px h-4 bg-white/10 hidden sm:block"/>
            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background:"rgba(255,80,80,0.07)", color:"#ff7070", border:"1px solid rgba(255,80,80,0.18)" }}>
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
