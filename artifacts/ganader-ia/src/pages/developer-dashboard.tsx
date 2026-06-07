import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth, LoginActivity } from "@/lib/auth";
import {
  Terminal, Code, GitBranch, Zap, Activity, Database, Globe,
  Download, Upload, RefreshCw, Play, CheckCircle,
  Flag, Lock, Package, Server, Cpu, BookOpen,
  Copy, LogOut, BarChart3, AlertTriangle,
  Plus, Edit, Settings, Shield, Bell, Hash, Clock,
  ChevronDown, Key, Send, Layers, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

/* ── Version history ────────────────────────────────────────────────────── */
const CIVAC_VERSIONS = [
  { v:"1.0.0", date:"2026-05-26", status:"current", tag:"stable",
    changes:["Panel Admin 14 tabs completo (Logs, Soporte, Seguridad)","Sidebar expandido: Sanidad, Trazabilidad, 32 módulos","v1.0 branding unificado en toda la plataforma","Login redesign con cuentas reales colombianas","Nuevos roles: Developer + SuperAdmin + Sales","Plan-based PWA install + popup","Generación de licencias JSON por usuario"],
    plans:{ basico:"1.0.0", pro:"1.0.0", premium:"1.0.0", platino:"1.0.0" },
    notes:"Release v1.0 — 32 módulos, cuentas reales colombianas, sidebar con Sanidad+Trazabilidad.",
  },
  { v:"0.9.5", date:"2026-05-21", status:"stable", tag:"lts",
    changes:["Nuevos roles: Developer + SuperAdmin","Version management panel","Módulos tab completo con matriz de permisos","Generación de licencias JSON por usuario","Fix: registerUser preserva plan asignado"],
    plans:{ basico:"0.9.5", pro:"0.9.5", premium:"0.9.5", platino:"0.9.5" },
    notes:"Release candidato estable pre-v1.0.",
  },
  { v:"0.9.0", date:"2026-04-28", status:"stable", tag:"stable",
    changes:["Pesaje CIVAC BT 9-byte parser","RFID lector CIVAC","Tab estadísticas pesaje","CSV export historial","IA predict GMD","Bluetooth Web API integración"],
    plans:{ basico:"0.9.0", pro:"0.9.0", premium:"0.9.0", platino:"0.9.0" },
    notes:"Release Pesaje Automatizado con Bluetooth.",
  },
  { v:"0.8.0", date:"2026-03-15", status:"stable", tag:"stable",
    changes:["Admin dashboard 12 tabs completo","Wompi payments integración Colombia","Session management + revoke","API keys + webhooks externos"],
    plans:{ basico:"0.8.0", pro:"0.8.0", premium:"0.8.0", platino:"0.8.0" },
    notes:"Platform release — monetización completa Colombia.",
  },
  { v:"0.5.0", date:"2026-01-10", status:"archived", tag:"legacy",
    changes:["Visual overhaul MVP completo","Dark navy / warm cream theme","Holstein cow logo SVG CIVAC","PWA service worker v6 · offline shell"],
    plans:{ basico:"0.5.0", pro:"0.5.0", premium:"0.5.0", platino:"0.5.0" },
    notes:"MVP inicial GanaderIA Colombia.",
  },
];

const FEATURE_FLAGS_DEFAULT = [
  { id:"pwa_install",   label:"PWA Install Button",   desc:"Botón instalación PWA en sidebar/topbar plan-aware", enabled:true,  env:"all",  plan:"basico"     },
  { id:"ai_prediccion", label:"Predicciones IA",       desc:"Motor predicción financiero con sliders",            enabled:true,  env:"all",  plan:"pro"        },
  { id:"gps_tracking",  label:"Rastreo GPS",           desc:"Tracking GPS collares en tiempo real",               enabled:true,  env:"all",  plan:"pro"        },
  { id:"wompi_pay",     label:"Pagos Wompi",           desc:"Integración Wompi suscripciones mensuales",          enabled:true,  env:"prod", plan:"all"        },
  { id:"bt_pesaje",     label:"Pesaje Bluetooth",      desc:"Web BT API básculas · trama CIVAC 9 bytes",         enabled:true,  env:"all",  plan:"pro"        },
  { id:"co2_module",    label:"Huella Carbono CO₂",    desc:"Cálculo IPCC 2019 de huella de carbono",            enabled:true,  env:"all",  plan:"premium"    },
  { id:"multifinca",    label:"Multi-Finca",           desc:"Gestión de múltiples fincas",                       enabled:true,  env:"all",  plan:"pro"        },
  { id:"license_gen",   label:"Generación Licencias",  desc:"Descarga licencias JSON por usuario",               enabled:true,  env:"all",  plan:"admin"      },
  { id:"dev_panel",     label:"Panel Developer",       desc:"Acceso al panel de desarrollador",                  enabled:true,  env:"dev",  plan:"developer"  },
  { id:"audit_log",     label:"Log de Auditoría",      desc:"Registro completo acciones del sistema",            enabled:false, env:"prod", plan:"superadmin" },
  { id:"ai_genetics",   label:"IA Genética DEP",       desc:"Scoring IA para ranking genético DEP",              enabled:true,  env:"all",  plan:"premium"    },
  { id:"webhooks",      label:"Webhooks salientes",    desc:"Notificaciones webhook a endpoints externos",       enabled:true,  env:"prod", plan:"platino"    },
];

const BUILD_INFO = {
  version: "1.0.0", build: "2026-05-26.0001", commit: "1a0f5d9c",
  branch: "main", env: "production",
  node: "24.x", react: "18.3.1", vite: "5.x", typescript: "5.9.x",
  tailwind: "4.x", shadcn: "latest", recharts: "2.x", wouter: "3.x",
  pwa_score: 98, lighthouse: 98, bundle_kb: 312, gzip_kb: 89,
};

const PERF_DATA = [
  {d:"Lun",fcp:1.2,lcp:1.8,cls:0.02},{d:"Mar",fcp:1.1,lcp:1.7,cls:0.01},
  {d:"Mié",fcp:1.3,lcp:2.0,cls:0.02},{d:"Jue",fcp:1.0,lcp:1.6,cls:0.01},
  {d:"Vie",fcp:1.2,lcp:1.8,cls:0.01},{d:"Sáb",fcp:1.1,lcp:1.7,cls:0.02},
  {d:"Dom",fcp:1.0,lcp:1.5,cls:0.01},
];

const TIP = { background:"rgba(4,15,26,0.95)", border:"1px solid rgba(0,255,136,0.2)", borderRadius:8, fontSize:11, color:"white" };
const G   = "#00ff88";
const C   = "#00d4ff";

type TabId = "resumen"|"versiones"|"flags"|"diagnostico"|"build"|"logs"|"api"|"pwa"|"bd"|"tickets"|"accesos"|"docs";

const TABS: { id:TabId; icon:React.ReactNode; label:string }[] = [
  { id:"resumen",     icon:<BarChart3 size={13}/>,   label:"Resumen"      },
  { id:"versiones",   icon:<GitBranch size={13}/>,   label:"Versiones"    },
  { id:"flags",       icon:<Flag size={13}/>,        label:"Feature Flags"},
  { id:"diagnostico", icon:<Activity size={13}/>,   label:"Diagnóstico"  },
  { id:"build",       icon:<Package size={13}/>,     label:"Build Info"   },
  { id:"logs",        icon:<Terminal size={13}/>,    label:"Logs"         },
  { id:"api",         icon:<Key size={13}/>,         label:"API Explorer" },
  { id:"pwa",         icon:<Globe size={13}/>,       label:"PWA"          },
  { id:"bd",          icon:<Database size={13}/>,    label:"Base de Datos"},
  { id:"tickets",     icon:<Send size={13}/>,        label:"Tickets"      },
  { id:"accesos",     icon:<Shield size={13}/>,      label:"Roles & Sesiones"},
  { id:"docs",        icon:<BookOpen size={13}/>,    label:"Documentación"},
];

/* ── BD Gateway Status Component ─────────────────────────────────────────── */
interface DbStatusData {
  ok: boolean; mode: string; alive: boolean;
  pgAvailable: boolean; sqliteAvailable: boolean;
  pgUrl: string | null; sqlitePath: string | null;
  lastCheck: string; errorMsg: string | null;
}
interface DbInfoData {
  ok: boolean; mode: string; path?: string; sizeKb?: number;
  version?: string; tables?: string[]; message?: string;
}
interface SyncQueueData {
  ok: boolean; mode: string; pendientes: number;
  items: { id: number; operacion: string; tabla: string; estado: string; created_at: string }[];
  message?: string;
}

function DbGatewaySection() {
  const [status, setStatus]   = useState<DbStatusData | null>(null);
  const [info,   setInfo]     = useState<DbInfoData | null>(null);
  const [queue,  setQueue]    = useState<SyncQueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconn,  setReconn]  = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, iRes, qRes] = await Promise.all([
        fetch("/api/db/status"),
        fetch("/api/db/info"),
        fetch("/api/db/sync-queue"),
      ]);
      if (sRes.ok) setStatus(await sRes.json());
      if (iRes.ok) setInfo(await iRes.json());
      if (qRes.ok) setQueue(await qRes.json());
    } catch { /* offline */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const reconnect = async () => {
    setReconn(true);
    try { await fetch("/api/db/reconnect", { method: "POST" }); await fetchAll(); } catch { /* ignore */ }
    setReconn(false);
  };

  const modeBg    = status?.mode === "postgres" ? "rgba(0,200,255,0.06)"  : status?.mode === "sqlite" ? "rgba(251,191,36,0.06)"  : "rgba(248,113,113,0.06)";
  const modeBdr   = status?.mode === "postgres" ? "rgba(0,200,255,0.20)"  : status?.mode === "sqlite" ? "rgba(251,191,36,0.20)"  : "rgba(248,113,113,0.20)";
  const modeColor = status?.mode === "postgres" ? "#00c8ff" : status?.mode === "sqlite" ? "#fbbf24" : "#f87171";
  const modeLabel = status?.mode === "postgres" ? "PostgreSQL" : status?.mode === "sqlite" ? "SQLite Local" : "Sin BD";
  const modeIcon  = status?.mode === "postgres" ? "🐘" : status?.mode === "sqlite" ? "🗄️" : "❌";

  return (
    <div className="rounded-2xl overflow-hidden" style={{border:`1px solid ${modeBdr}`,background:modeBg}}>
      <div className="px-4 py-3 flex items-center justify-between" style={{background:"rgba(0,0,0,0.4)",borderBottom:`1px solid ${modeBdr}`}}>
        <span className="text-xs font-black text-white flex items-center gap-2">
          <Database size={13} style={{color:modeColor}}/> Code Gateway — Base de Datos
        </span>
        <div className="flex items-center gap-2">
          {status?.mode === "sqlite" && (
            <button onClick={reconnect} disabled={reconn}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold transition-all"
              style={{background:`${modeColor}18`,color:modeColor,border:`1px solid ${modeColor}30`,opacity:reconn?0.6:1}}>
              <RefreshCw size={9} className={reconn?"animate-spin":""}/> Reconectar PG
            </button>
          )}
          <button onClick={fetchAll} disabled={loading}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold transition-all"
            style={{background:"rgba(255,255,255,0.05)",color:"#94a3b8",border:"1px solid rgba(255,255,255,0.08)",opacity:loading?0.5:1}}>
            <RefreshCw size={9} className={loading?"animate-spin":""}/> Actualizar
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Modo activo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:"Modo activo",    val: loading ? "..." : `${modeIcon} ${modeLabel}`,  c: modeColor },
            { label:"Estado",         val: loading ? "..." : (status?.alive ? "🟢 Online" : "🔴 Offline"), c: status?.alive ? "#22c55e" : "#f87171" },
            { label:"PostgreSQL",     val: loading ? "..." : (status?.pgAvailable ? "Conectado" : "No disponible"), c: status?.pgAvailable ? "#00c8ff" : "#94a3b8" },
            { label:"SQLite local",   val: loading ? "..." : (status?.sqliteAvailable ? "Activo" : "En espera"), c: status?.sqliteAvailable ? "#fbbf24" : "#94a3b8" },
          ].map(k => (
            <div key={k.label} className="rounded-xl p-3" style={{background:"rgba(0,0,0,0.3)"}}>
              <div className="text-[8px] text-white/30 uppercase tracking-wider mb-1">{k.label}</div>
              <div className="text-[11px] font-black" style={{color:k.c}}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* Conexión PG */}
        {status?.pgUrl && (
          <div className="rounded-xl p-3" style={{background:"rgba(0,0,0,0.25)"}}>
            <div className="text-[8px] text-white/30 uppercase tracking-wider mb-1">URL PostgreSQL</div>
            <code className="text-[9px] font-mono" style={{color:"rgba(0,200,255,0.7)"}}>{status.pgUrl}</code>
          </div>
        )}

        {/* SQLite info */}
        {info?.mode === "sqlite" && info.tables && (
          <div className="rounded-xl p-3 space-y-2" style={{background:"rgba(0,0,0,0.25)"}}>
            <div className="flex justify-between items-center">
              <span className="text-[8px] text-white/30 uppercase tracking-wider">BD Local SQLite</span>
              <span className="text-[9px] font-mono" style={{color:"#fbbf24"}}>{info.sizeKb} KB · SQLite {info.version}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {info.tables.map(t => (
                <span key={t} className="px-1.5 py-0.5 rounded-md text-[8px] font-mono"
                  style={{background:"rgba(251,191,36,0.08)",color:"rgba(251,191,36,0.7)",border:"1px solid rgba(251,191,36,0.12)"}}>
                  {t}
                </span>
              ))}
            </div>
            <div className="text-[8px] text-white/30">{info.path}</div>
          </div>
        )}

        {/* Cola de sincronización */}
        <div className="rounded-xl p-3" style={{background:"rgba(0,0,0,0.25)"}}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] text-white/30 uppercase tracking-wider">Cola de Sincronización</span>
            <span className="text-[10px] font-black" style={{color: queue?.pendientes ? "#f87171" : "#22c55e"}}>
              {loading ? "..." : (queue?.pendientes ?? 0)} pendientes
            </span>
          </div>
          {queue?.message && <p className="text-[9px] text-white/40">{queue.message}</p>}
          {queue?.items && queue.items.length > 0 && (
            <div className="space-y-1 mt-2">
              {queue.items.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center gap-2 text-[8px]">
                  <span className="font-mono text-white/30">#{item.id}</span>
                  <span style={{color:"#fbbf24"}}>{item.operacion}</span>
                  <span className="text-white/50">{item.tabla}</span>
                  <span className="text-white/30">{item.created_at}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Arquitectura */}
        <div className="rounded-xl p-3" style={{background:"rgba(0,0,0,0.25)"}}>
          <div className="text-[8px] text-white/30 uppercase tracking-wider mb-2">Arquitectura Code Gateway</div>
          <div className="flex items-center gap-2 text-[9px] flex-wrap">
            {[
              { label:"API Server", c:"#00c8ff" },
              { label:"→", c:"rgba(255,255,255,0.2)" },
              { label:"initGateway()", c:"#00f5d4" },
              { label:"→", c:"rgba(255,255,255,0.2)" },
              { label:"🐘 PostgreSQL", c:"#00c8ff" },
              { label:"/ fallback", c:"rgba(255,255,255,0.2)" },
              { label:"🗄️ SQLite 3.53.1", c:"#fbbf24" },
            ].map((s, i) => (
              <span key={i} style={{color:s.c}} className="font-mono">{s.label}</span>
            ))}
          </div>
          <p className="text-[8px] text-white/30 mt-2 leading-relaxed">
            El gateway detecta automáticamente la disponibilidad de PostgreSQL al arrancar el servidor.
            Si PG no responde en 3 s, activa SQLite (civac-local.db) y encola las operaciones pendientes
            en <code className="font-mono">sync_queue</code> para replicarlas cuando se restaure la conexión.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Live Metrics Widget ──────────────────────────────────────────────────── */
function LiveMetricsWidget() {
  const [apiHealth, setApiHealth] = useState<{status:string;uptime:number;memory:{rss:number;heapUsed:number;heapTotal:number};version:string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t+1), 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch("/api/healthz")
      .then(r => r.ok ? r.json() : null)
      .then(d => { setApiHealth(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tick]);

  const now = Date.now();
  const hours24 = Array.from({length:24}, (_, i) => {
    const h = new Date(now - (23-i)*3600000);
    const label = h.getHours().toString().padStart(2,"0") + ":00";
    const base = 200 + Math.floor(Math.sin(i/3)*80);
    const noise = Math.floor(Math.random()*60);
    return { h: label, req: base + noise, err: Math.floor(Math.random()*8) };
  });

  const modules24 = [
    { mod:"Dashboard",    hits: 342, c:"#00c8ff" },
    { mod:"GPS",          hits: 287, c:"#0ea5e9" },
    { mod:"Inventario",   hits: 234, c:"#39ff7e" },
    { mod:"Producción",   hits: 198, c:"#00c8ff" },
    { mod:"Sanidad",      hits: 156, c:"#22c55e" },
    { mod:"Trazabilidad", hits: 143, c:"#f97316" },
    { mod:"Pesaje",       hits: 121, c:"#ff9a3c" },
    { mod:"Asesora IA",   hits:  98, c:"#e879f9" },
  ];

  const memPct = apiHealth ? Math.round((apiHealth.memory.heapUsed / apiHealth.memory.heapTotal) * 100) : 0;
  const uptimeMins = apiHealth ? Math.floor(apiHealth.uptime / 60) : 0;
  const C = "#00ff88";

  return (
    <div className="space-y-4">
      {/* API health bar */}
      <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(0,255,136,0.18)",background:"rgba(0,255,136,0.03)"}}>
        <div className="px-4 py-3 flex items-center justify-between" style={{background:"rgba(0,0,0,0.4)",borderBottom:"1px solid rgba(0,255,136,0.10)"}}>
          <span className="text-xs font-black text-white flex items-center gap-2">
            <Activity size={13} style={{color:C}}/> API Server — métricas en vivo
          </span>
          <span className="text-[9px] font-mono" style={{color:"rgba(0,255,136,0.45)"}}>
            {loading ? "cargando..." : (apiHealth ? "🟢 online" : "🔴 offline")}
          </span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label:"Uptime",        val: loading ? "..." : `${uptimeMins}m`,                 c:"#22c55e" },
              { label:"Heap usado",    val: loading ? "..." : `${Math.round((apiHealth?.memory.heapUsed??0)/1024/1024)} MB`, c:"#00c8ff" },
              { label:"Heap total",    val: loading ? "..." : `${Math.round((apiHealth?.memory.heapTotal??0)/1024/1024)} MB`, c:"#a78bfa" },
              { label:"Uso heap",      val: loading ? "..." : `${memPct}%`,                     c: memPct > 80 ? "#f87171" : "#39ff7e" },
            ].map(k => (
              <div key={k.label} className="rounded-xl p-3" style={{background:"rgba(0,0,0,0.3)"}}>
                <div className="text-[8px] text-white/25 uppercase tracking-wider mb-1">{k.label}</div>
                <div className="text-[13px] font-black" style={{color:k.c}}>{k.val}</div>
              </div>
            ))}
          </div>

          {/* Heap usage bar */}
          {apiHealth && (
            <div className="space-y-1">
              <div className="flex justify-between text-[8px]" style={{color:"rgba(255,255,255,0.25)"}}>
                <span>Heap Memory</span>
                <span>{memPct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.06)"}}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{width:`${memPct}%`,background: memPct>80?"linear-gradient(90deg,#f87171,#ef4444)":"linear-gradient(90deg,#00ff88,#22c55e)"}}/>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tráfico 24h chart */}
      <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(0,200,255,0.15)",background:"rgba(0,200,255,0.03)"}}>
        <div className="px-4 py-3" style={{background:"rgba(0,0,0,0.4)",borderBottom:"1px solid rgba(0,200,255,0.08)"}}>
          <span className="text-xs font-black text-white flex items-center gap-2">
            <BarChart3 size={13} style={{color:"#00c8ff"}}/> Tráfico API — últimas 24 horas
          </span>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={hours24} margin={{top:0,right:0,left:-20,bottom:0}} barSize={6} barGap={1}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
              <XAxis dataKey="h" tick={{fontSize:7,fill:"rgba(255,255,255,0.2)"}} tickLine={false} axisLine={false} interval={3}/>
              <YAxis tick={{fontSize:7,fill:"rgba(255,255,255,0.2)"}} tickLine={false} axisLine={false}/>
              <RTooltip contentStyle={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(0,200,255,0.2)",borderRadius:8,fontSize:10,color:"white"}}/>
              <Bar dataKey="req" fill="#00c8ff" fillOpacity={0.7} radius={[2,2,0,0]} name="Requests"/>
              <Bar dataKey="err" fill="#f87171" fillOpacity={0.6} radius={[2,2,0,0]} name="Errores"/>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{background:"rgba(0,200,255,0.7)"}}/><span className="text-[8px] text-white/40">Requests/h</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{background:"rgba(248,113,113,0.6)"}}/><span className="text-[8px] text-white/40">Errores/h</span></div>
          </div>
        </div>
      </div>

      {/* Módulos más usados */}
      <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(167,139,250,0.15)",background:"rgba(167,139,250,0.03)"}}>
        <div className="px-4 py-3" style={{background:"rgba(0,0,0,0.4)",borderBottom:"1px solid rgba(167,139,250,0.08)"}}>
          <span className="text-xs font-black text-white flex items-center gap-2">
            <Layers size={13} style={{color:"#a78bfa"}}/> Top módulos — accesos hoy
          </span>
        </div>
        <div className="p-4 space-y-2">
          {modules24.map(m => (
            <div key={m.mod} className="flex items-center gap-3">
              <span className="text-[9px] font-black w-24 flex-shrink-0" style={{color:m.c}}>{m.mod}</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.05)"}}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{width:`${Math.round((m.hits/342)*100)}%`,background:`linear-gradient(90deg,${m.c}99,${m.c}55)`}}/>
              </div>
              <span className="text-[9px] font-mono text-white/30 w-10 text-right flex-shrink-0">{m.hits}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DeveloperDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab]           = useState<TabId>("resumen");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [flags, setFlags]       = useState(FEATURE_FLAGS_DEFAULT);
  const [activeVer, setActiveVer] = useState("1.0.0");
  const [newVerOpen, setNewVerOpen] = useState(false);
  const [newVerNum, setNewVerNum] = useState("");
  const [newVerNotes, setNewVerNotes] = useState("");
  const [logFilter, setLogFilter] = useState("all");
  const [apiEndpoint, setApiEndpoint]   = useState("/api/animals");
  const [apiMethod, setApiMethod]       = useState("GET");
  const [apiBody, setApiBody]           = useState("");
  const [apiResponse, setApiResponse]   = useState<string|null>(null);
  const [apiLoading, setApiLoading]     = useState(false);
  const [apiStatus, setApiStatus]       = useState<number|null>(null);
  const [copied, setCopied]             = useState("");
  const [bdCounts, setBdCounts]         = useState<Record<string,number>>({});
  const [bdLoading, setBdLoading]       = useState(false);
  const [swInfo, setSwInfo]             = useState<{registered:boolean;scope?:string;scriptURL?:string}|null>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  /* ─── Tickets ─── */
  interface Ticket {
    id: string; titulo: string; desc: string;
    prioridad: "alta"|"media"|"baja"; estado: "abierto"|"en_proceso"|"cerrado";
    fecha: string; autor: string; categoria: string;
  }
  const loadTickets = (): Ticket[] => { try { const s=localStorage.getItem("civac_tickets"); return s?JSON.parse(s):[]; } catch { return []; } };
  const [tickets, setTickets] = useState<Ticket[]>(loadTickets);
  const [tForm, setTForm] = useState({ titulo:"", desc:"", prioridad:"media" as Ticket["prioridad"], categoria:"bug" });
  const [tFilter, setTFilter] = useState<"all"|Ticket["estado"]>("all");
  const saveTickets = (t: Ticket[]) => { try { localStorage.setItem("civac_tickets",JSON.stringify(t)); } catch {} };
  const addTicket = () => {
    if (!tForm.titulo.trim()) return;
    const t: Ticket = { id:`TKT-${Date.now()}`, titulo:tForm.titulo, desc:tForm.desc, prioridad:tForm.prioridad, estado:"abierto", fecha:new Date().toLocaleDateString("es-CO"), autor:user?.nombre??"Desarrollador", categoria:tForm.categoria };
    const next=[t,...tickets]; setTickets(next); saveTickets(next);
    setTForm({ titulo:"", desc:"", prioridad:"media", categoria:"bug" });
  };
  const updateTicketEstado = (id: string, estado: Ticket["estado"]) => {
    const next=tickets.map(t=>t.id===id?{...t,estado}:t); setTickets(next); saveTickets(next);
  };
  const deleteTicket = (id: string) => { const next=tickets.filter(t=>t.id!==id); setTickets(next); saveTickets(next); };

  /* ─── Login Activity ─── */
  const { loginActivity } = useAuth();
  const [actFilter, setActFilter] = useState<"all"|"civac"|"demo"|"client">("all");

  /* Persist feature flags to localStorage */
  useEffect(()=>{
    const stored = localStorage.getItem("civac_dev_flags");
    if (stored) { try { setFlags(JSON.parse(stored)); } catch { /* ignore */ } }
  }, []);
  const toggleFlag = useCallback((id: string) => {
    setFlags(prev => {
      const next = prev.map(f => f.id===id ? {...f, enabled:!f.enabled} : f);
      localStorage.setItem("civac_dev_flags", JSON.stringify(next));
      return next;
    });
  }, []);

  /* Check SW registration */
  const checkSW = useCallback(async () => {
    if (!("serviceWorker" in navigator)) { setSwInfo({registered:false}); return; }
    const regs = await navigator.serviceWorker.getRegistrations();
    if (regs.length > 0) {
      const r = regs[0];
      setSwInfo({ registered:true, scope:r.scope, scriptURL:r.active?.scriptURL ?? r.installing?.scriptURL ?? "—" });
    } else { setSwInfo({registered:false}); }
    window.addEventListener("beforeinstallprompt", ()=>setPwaInstalled(true), {once:true});
  }, []);

  /* Load BD counts */
  const loadBdCounts = useCallback(async () => {
    setBdLoading(true);
    try {
      const endpoints = [
        ["animals","/api/animals"],["potreros","/api/potreros"],["insumos","/api/insumos"],
        ["personal","/api/personal"],["reproduccion","/api/reproduccion"],
        ["alertas","/api/alertas"],["pesajes","/api/pesajes"],["gps","/api/gps"],
        ["usuarios","/api/usuarios"],
      ];
      const results = await Promise.allSettled(endpoints.map(([,u])=>fetch(u).then(r=>r.json())));
      const counts: Record<string,number> = {};
      results.forEach((r,i) => {
        if (r.status==="fulfilled" && Array.isArray(r.value)) counts[endpoints[i][0]] = r.value.length;
        else counts[endpoints[i][0]] = 0;
      });
      setBdCounts(counts);
    } catch { /* ignore */ }
    finally { setBdLoading(false); }
  }, []);

  const copyText = (t: string, k: string) => {
    navigator.clipboard?.writeText(t).catch(()=>{});
    setCopied(k); setTimeout(()=>setCopied(""), 1500);
  };

  const downloadChangelog = () => {
    const md = CIVAC_VERSIONS.map(v=>`## v${v.v} (${v.date}) [${v.tag}]\n${v.notes}\n${v.changes.map(c=>`- ${c}`).join("\n")}`).join("\n\n");
    const blob = new Blob([`# CIVAC GanaderIA · Changelog\n\n${md}`], { type:"text/markdown" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="CHANGELOG.md"; a.click(); URL.revokeObjectURL(url);
  };

  const downloadVersionConfig = (v: typeof CIVAC_VERSIONS[0]) => {
    const cfg = { civac_version: v.v, fecha: v.date, tag: v.tag, planes: v.plans, cambios: v.changes, notas: v.notes, build_id: `CIVAC-BUILD-${v.v}-${v.date}` };
    const blob = new Blob([JSON.stringify(cfg,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`civac_v${v.v}_config.json`; a.click(); URL.revokeObjectURL(url);
  };

  const LOGS_MOCK = [
    {t:"DEBUG",  msg:"[2026-05-21 11:42] HMR update · components/layout.tsx · +23 módulos",     c:"#a3a3a3"},
    {t:"INFO",   msg:"[2026-05-21 11:40] Build exitoso · 312 KB · gzip 89 KB",                  c:G},
    {t:"INFO",   msg:"[2026-05-21 11:38] TypeScript check · 0 errors · 0 warnings",             c:G},
    {t:"INFO",   msg:"[2026-05-26 11:35] Auth version bump → 1.0.0 · 6 cuentas cargadas",       c:C},
    {t:"WARN",   msg:"[2026-05-21 10:22] Bundle size excede 300 KB target (actual: 312 KB)",    c:"#fbbf24"},
    {t:"INFO",   msg:"[2026-05-21 10:18] Service Worker v6 registrado · scope /",               c:C},
    {t:"INFO",   msg:"[2026-05-21 10:15] Feature flag 'audit_log' desactivado",                 c:G},
    {t:"DEBUG",  msg:"[2026-05-21 09:58] Vite dev server en puerto 5000",                       c:"#a3a3a3"},
    {t:"ERROR",  msg:"[2026-05-20 16:40] Pago rechazado — CIVAC-2026-005 · timeout Wompi",     c:"#f87171"},
    {t:"INFO",   msg:"[2026-05-26 14:12] localStorage migración → v1.0.0 · OK",                c:G},
  ];
  const filteredLogs = LOGS_MOCK.filter(l=> logFilter==="all" || l.t===logFilter);

  return (
    <div className="min-h-screen flex flex-col" style={{ background:"linear-gradient(145deg,#010c06 0%,#021408 40%,#011006 100%)", fontFamily:"'Space Grotesk','Sora',sans-serif" }}>

      {/* ── Topbar ── */}
      <header className="h-[56px] sticky top-0 z-30 flex items-center justify-between px-4 border-b flex-shrink-0 relative overflow-hidden"
        style={{ background:"rgba(1,12,6,0.97)", backdropFilter:"blur(24px)", borderColor:"rgba(0,255,136,0.18)", boxShadow:`0 1px 20px rgba(0,0,0,0.5), 0 0 60px rgba(0,255,136,0.06)` }}>
        {/* Matrix scan line */}
        <div className="absolute bottom-0 left-0 w-full h-px opacity-60"
          style={{background:"linear-gradient(90deg,transparent,#00ff88,#00d4ff,#00ff88,transparent)"}}/>
        <div className="flex items-center gap-3">
          <button className="lg:hidden text-white/40 p-1.5" onClick={()=>setMobileOpen(v=>!v)}><Menu size={18}/></button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style={{ background:"linear-gradient(135deg,#00ff88,#00c864)", boxShadow:"0 0 20px rgba(0,255,136,0.7), 0 0 40px rgba(0,255,136,0.25)" }}>
            <Terminal size={14} strokeWidth={2.5} className="text-black"/>
          </div>
          <div>
            <span className="font-black text-white text-sm" style={{textShadow:"0 0 20px rgba(0,255,136,0.3)"}}>CIVAC</span>
            <span className="font-black text-sm ml-1.5" style={{color:G,textShadow:`0 0 20px ${G}80`}}>Dev Console</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg font-mono text-[9px]"
            style={{ background:"rgba(0,255,136,0.08)", border:"1px solid rgba(0,255,136,0.25)", color:G, boxShadow:"0 0 8px rgba(0,255,136,0.1)" }}>
            <Hash size={9}/> v{BUILD_INFO.version} · {BUILD_INFO.commit}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold"
            style={{ background:"rgba(0,255,136,0.10)", border:"1px solid rgba(0,255,136,0.28)", color:G, boxShadow:"0 0 12px rgba(0,255,136,0.12)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:G, boxShadow:`0 0 6px ${G}`}}/>
            {BUILD_INFO.env}
          </div>
          <button onClick={() => navigate("/server-dashboard")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{ background:"rgba(0,245,212,0.08)", color:"#00f5d4", border:"1px solid rgba(0,245,212,0.25)", boxShadow:"0 0 10px rgba(0,245,212,0.10)" }}>
            <Server size={12}/><span>Server Panel</span>
          </button>
          <span className="text-[11px] text-white/30 hidden sm:block">{user?.email}</span>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background:"rgba(255,80,80,0.08)", color:"#ff7070", border:"1px solid rgba(255,80,80,0.2)" }}>
            <LogOut size={12}/><span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* ── Tab nav ── */}
      <div className="flex overflow-x-auto border-b flex-shrink-0 scrollbar-none"
        style={{ borderColor:"rgba(0,255,136,0.08)", background:"rgba(2,10,18,0.8)" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className="flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 border-b-2"
            style={{
              color: tab===t.id ? G : "rgba(255,255,255,0.4)",
              borderBottomColor: tab===t.id ? G : "transparent",
              background: tab===t.id ? "rgba(0,255,136,0.04)" : "transparent",
            }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 p-4 lg:p-6 overflow-x-hidden pb-12 space-y-4">

        {/* ══ RESUMEN ══ */}
        {tab==="resumen" && (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label:"Versión activa",    val:BUILD_INFO.version,    sub:"Rama: main",             icon:<GitBranch size={16}/>, c:G   },
                { label:"Bundle size",       val:`${BUILD_INFO.bundle_kb} KB`, sub:`gzip: ${BUILD_INFO.gzip_kb} KB`, icon:<Package size={16}/>, c:C   },
                { label:"Lighthouse PWA",    val:`${BUILD_INFO.lighthouse}/100`, sub:"Performance score",  icon:<Zap size={16}/>,     c:"#fbbf24" },
                { label:"TypeScript errors", val:"0",                    sub:"0 warnings",             icon:<CheckCircle size={16}/>,c:"#39ff7e" },
              ].map(k=>(
                <div key={k.label} className="rounded-2xl p-4" style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${k.c}18` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background:`${k.c}12`, color:k.c }}>{k.icon}</div>
                  <div className="text-xl font-black" style={{ color:k.c }}>{k.val}</div>
                  <div className="text-xs font-bold text-white/60 mt-0.5">{k.label}</div>
                  <div className="text-[9px] text-white/25">{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Perf chart + flags summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl p-4" style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${G}12` }}>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Activity size={13} style={{color:G}}/> Web Vitals (7 días)</h3>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={PERF_DATA} margin={{top:4,right:8,left:-24,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="d" tick={{fontSize:10,fill:"rgba(255,255,255,0.35)"}}/>
                    <YAxis tick={{fontSize:10,fill:"rgba(255,255,255,0.35)"}}/>
                    <RTooltip contentStyle={TIP}/>
                    <Line type="monotone" dataKey="fcp" stroke={G}    strokeWidth={2} dot={false} name="FCP (s)"/>
                    <Line type="monotone" dataKey="lcp" stroke={C}    strokeWidth={2} dot={false} name="LCP (s)"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl p-4" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(0,212,255,0.12)" }}>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Flag size={13} style={{color:C}}/> Feature Flags activos</h3>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {flags.map(f=>(
                    <div key={f.id} className="flex items-center gap-2 px-2 py-1.5 rounded-xl"
                      style={{ background:f.enabled?"rgba(0,255,136,0.04)":"rgba(255,255,255,0.02)", border:`1px solid ${f.enabled?"rgba(0,255,136,0.15)":"rgba(255,255,255,0.05)"}` }}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${f.enabled?"bg-[#00ff88]":"bg-white/15"}`}/>
                      <span className="text-[10px] font-bold flex-1" style={{color:f.enabled?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.25)"}}>{f.label}</span>
                      <span className="text-[8px] font-mono" style={{color:"rgba(0,255,136,0.4)"}}>{f.plan}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stack info */}
            <div className="rounded-2xl p-4" style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(0,255,136,0.08)" }}>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Stack tecnológico</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {label:"Node.js",   val:BUILD_INFO.node,      c:G},
                  {label:"React",     val:BUILD_INFO.react,     c:C},
                  {label:"Vite",      val:BUILD_INFO.vite,      c:"#fbbf24"},
                  {label:"TypeScript",val:BUILD_INFO.typescript, c:"#60a5fa"},
                  {label:"Tailwind",  val:BUILD_INFO.tailwind,  c:"#38bdf8"},
                  {label:"shadcn/ui", val:BUILD_INFO.shadcn,    c:"#e879f9"},
                  {label:"Recharts",  val:BUILD_INFO.recharts,  c:"#fb923c"},
                  {label:"wouter",    val:BUILD_INFO.wouter,    c:"#a3e635"},
                ].map(s=>(
                  <div key={s.label} className="flex items-center justify-between px-2.5 py-2 rounded-xl font-mono"
                    style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-[10px] text-white/40">{s.label}</span>
                    <span className="text-[10px] font-bold" style={{color:s.c}}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ VERSIONES ══ */}
        {tab==="versiones" && (
          <>
            {/* Header actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-black text-white">Control de versiones CIVAC</h2>
                <p className="text-[10px] text-white/30">Gestión de releases · Changelog · Config por plan</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={downloadChangelog}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                  style={{ background:`${G}12`, border:`1px solid ${G}30`, color:G }}>
                  <Download size={12}/> CHANGELOG.md
                </button>
                <button onClick={()=>setNewVerOpen(v=>!v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                  style={{ background:"linear-gradient(135deg,#00ff88,#00d4aa)", color:"#000" }}>
                  <Plus size={12}/> Nueva versión
                </button>
              </div>
            </div>

            {/* New version form */}
            {newVerOpen && (
              <div className="rounded-2xl p-4 space-y-3" style={{ background:"rgba(0,255,136,0.05)", border:"1px solid rgba(0,255,136,0.2)" }}>
                <h3 className="text-sm font-bold" style={{color:G}}>Registrar nueva versión</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-white/30 uppercase tracking-wider block mb-1">Número (ej: 4.4.0)</label>
                    <Input value={newVerNum} onChange={e=>setNewVerNum(e.target.value)} placeholder="4.4.0"
                      className="text-xs h-8 font-mono" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(0,255,136,0.2)"}}/>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/30 uppercase tracking-wider block mb-1">Release notes</label>
                    <Input value={newVerNotes} onChange={e=>setNewVerNotes(e.target.value)} placeholder="Descripción del release…"
                      className="text-xs h-8" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(0,255,136,0.2)"}}/>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>{setNewVerOpen(false);setNewVerNum("");setNewVerNotes("");}}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.08)" }}>
                    Cancelar
                  </button>
                  <button disabled={!newVerNum}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold disabled:opacity-40"
                    style={{ background:"linear-gradient(135deg,#00ff88,#00d4aa)", color:"#000" }}>
                    <GitBranch size={11}/> Crear release
                  </button>
                </div>
              </div>
            )}

            {/* Version list */}
            <div className="space-y-3">
              {CIVAC_VERSIONS.map(v=>{
                const isCurrent = v.v === activeVer;
                const color = v.status==="current" ? G : v.status==="archived" ? "#64748b" : C;
                return (
                  <div key={v.v} className="rounded-2xl overflow-hidden transition-all"
                    style={{ background:isCurrent?"rgba(0,255,136,0.04)":"rgba(255,255,255,0.02)", border:`1px solid ${color}${isCurrent?"40":"18"}` }}>
                    {isCurrent && <div className="h-0.5" style={{background:`linear-gradient(90deg,${G},${C},transparent)`}}/>}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                        <div className="flex items-center gap-3">
                          <div className="font-mono text-xl font-black" style={{color}}>v{v.v}</div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase ${v.status==="current"?"bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/30":v.status==="archived"?"bg-slate-500/15 text-slate-400 border border-slate-500/30":"bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/25"}`}>
                                {v.status}
                              </span>
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.4)",border:"1px solid rgba(255,255,255,0.1)"}}>{v.tag}</span>
                              {isCurrent && <span className="text-[9px] font-black" style={{color:G}}>● ACTIVA</span>}
                            </div>
                            <div className="text-[9px] text-white/30 mt-0.5 font-mono">{v.date}</div>
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button onClick={()=>downloadVersionConfig(v)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all hover:opacity-80"
                            style={{background:`${color}10`,border:`1px solid ${color}30`,color}}>
                            <Download size={10}/> Config JSON
                          </button>
                          {!isCurrent && (
                            <button onClick={()=>setActiveVer(v.v)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all hover:opacity-80"
                              style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)"}}>
                              Activar
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Plan versions */}
                      <div className="grid grid-cols-4 gap-1.5 mb-3">
                        {(Object.entries(v.plans) as [string,string][]).map(([plan,pv])=>(
                          <div key={plan} className="px-2 py-1.5 rounded-lg text-center"
                            style={{ background:"rgba(0,0,0,0.25)", border:"1px solid rgba(255,255,255,0.05)" }}>
                            <div className="text-[8px] text-white/30 uppercase">{plan}</div>
                            <div className="font-mono text-[10px] font-black" style={{color}}>{pv}</div>
                          </div>
                        ))}
                      </div>

                      {/* Changes */}
                      <p className="text-[9px] text-white/40 mb-2 italic">{v.notes}</p>
                      <div className="flex flex-wrap gap-1">
                        {v.changes.map(c=>(
                          <span key={c} className="text-[8px] px-1.5 py-0.5 rounded-lg"
                            style={{ background:"rgba(0,255,136,0.06)", border:"1px solid rgba(0,255,136,0.12)", color:"rgba(0,255,136,0.6)" }}>
                            + {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ══ FEATURE FLAGS ══ */}
        {tab==="flags" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-white flex items-center gap-2"><Flag size={14} style={{color:C}}/> Feature Flags</h2>
              <span className="text-[10px] text-white/30">{flags.filter(f=>f.enabled).length}/{flags.length} activos</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {flags.map((f,i)=>(
                <div key={f.id} className="rounded-2xl p-4 transition-all"
                  style={{ background:f.enabled?"rgba(0,255,136,0.04)":"rgba(255,255,255,0.02)", border:`1px solid ${f.enabled?"rgba(0,255,136,0.2)":"rgba(255,255,255,0.06)"}` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-sm text-white">{f.label}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full font-mono"
                          style={{ background:`${f.enabled?G:C}10`, border:`1px solid ${f.enabled?G:C}25`, color:f.enabled?G:C }}>
                          {f.env}
                        </span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full"
                          style={{ background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.35)", border:"1px solid rgba(255,255,255,0.08)" }}>
                          {f.plan}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/35">{f.desc}</p>
                      <p className="font-mono text-[9px] mt-1" style={{color:"rgba(0,255,136,0.3)"}}>CIVAC_FLAG_{f.id.toUpperCase()}</p>
                    </div>
                    <button
                      onClick={()=>toggleFlag(f.id)}
                      className="w-11 h-6 rounded-full flex-shrink-0 relative transition-colors"
                      style={{ background:f.enabled?"rgba(0,255,136,0.35)":"rgba(255,255,255,0.1)" }}>
                      <div className="absolute w-4.5 h-4.5 rounded-full top-0.5 bg-white transition-all"
                        style={{ left:f.enabled?"calc(100% - 1.375rem)":"0.125rem", width:"18px", height:"18px" }}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══ DIAGNÓSTICO ══ */}
        {tab==="diagnostico" && (
          <>
            <h2 className="text-base font-black text-white flex items-center gap-2"><Activity size={14} style={{color:G}}/> Diagnóstico del sistema</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {icon:<Server size={16}/>,     t:"Servidor",        v:"Vite 5 Dev",     s:"✓ Online",  c:G },
                {icon:<Database size={16}/>,   t:"localStorage",    v:"~128 KB usado",  s:"✓ OK",      c:C },
                {icon:<Cpu size={16}/>,        t:"Service Worker",  v:"v6 · Cache OK",  s:"✓ Activo",  c:G },
                {icon:<Globe size={16}/>,      t:"Red",             v:"Online",         s:"✓ 12 ms",   c:G },
                {icon:<Shield size={16}/>,     t:"Auth",            v:"6 cuentas",      s:"✓ Válido",  c:"#a78bfa" },
                {icon:<Bell size={16}/>,       t:"Alertas",         v:"0 críticas",     s:"✓ Estable", c:"#39ff7e" },
              ].map(s=>(
                <div key={s.t} className="rounded-2xl p-4" style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${s.c}18` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`${s.c}12`,color:s.c}}>{s.icon}</div>
                    <div>
                      <p className="text-xs font-bold text-white">{s.t}</p>
                      <p className="text-[9px]" style={{color:`${s.c}80`}}>{s.v}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:s.c}}/>
                    <span className="text-[9px] font-bold" style={{color:s.c}}>{s.s}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick tests */}
            <div className="rounded-2xl p-4" style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(0,255,136,0.08)" }}>
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Tests rápidos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {label:"Ping localStorage",  icon:<Database size={11}/>,  c:G },
                  {label:"Test Service Worker", icon:<Cpu size={11}/>,      c:C },
                  {label:"Validate Auth",        icon:<Shield size={11}/>,   c:"#a78bfa" },
                  {label:"Check bundle size",    icon:<Package size={11}/>,  c:"#fbbf24" },
                  {label:"HMR connected",        icon:<RefreshCw size={11}/>,c:G },
                  {label:"TypeScript check",     icon:<Code size={11}/>,     c:C },
                  {label:"PWA manifest",         icon:<Globe size={11}/>,    c:"#39ff7e" },
                  {label:"SW scope check",       icon:<Zap size={11}/>,      c:"#f87171" },
                ].map(a=>(
                  <button key={a.label}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] transition-colors hover:opacity-80"
                    style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${a.c}20`, color:a.c }}>
                    <Play size={9}/>{a.icon}{a.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ BUILD INFO ══ */}
        {tab==="build" && (
          <>
            <h2 className="text-base font-black text-white flex items-center gap-2"><Package size={14} style={{color:C}}/> Build Info</h2>
            <div className="rounded-2xl overflow-hidden" style={{ background:"rgba(0,0,0,0.4)", border:"1px solid rgba(0,212,255,0.15)" }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{background:"rgba(0,212,255,0.04)",borderBottom:"1px solid rgba(0,212,255,0.1)"}}>
                <span className="text-sm font-bold text-white">civac-ganader-ia · {BUILD_INFO.version}</span>
                <button onClick={()=>copyText(JSON.stringify(BUILD_INFO,null,2),"build")}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]"
                  style={{background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)",color:C}}>
                  {copied==="build"?"✓ Copiado":<><Copy size={10}/> Copiar JSON</>}
                </button>
              </div>
              <div className="p-4 font-mono text-xs space-y-1.5">
                {Object.entries(BUILD_INFO).map(([k,v])=>(
                  <div key={k} className="flex gap-3">
                    <span className="text-white/25 w-32 flex-shrink-0">{k}:</span>
                    <span style={{color:typeof v==="number"?"#fbbf24":G}}>{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(0,255,136,0.08)"}}>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Métricas de rendimiento</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  {label:"FCP",       val:"1.1s",  c:G},
                  {label:"LCP",       val:"1.7s",  c:C},
                  {label:"CLS",       val:"0.01",  c:G},
                  {label:"TTI",       val:"1.9s",  c:"#fbbf24"},
                  {label:"TBT",       val:"60ms",  c:G},
                  {label:"Speed Idx", val:"1.4s",  c:C},
                ].map(m=>(
                  <div key={m.label} className="text-center p-2 rounded-xl" style={{background:"rgba(0,0,0,0.25)",border:`1px solid ${m.c}15`}}>
                    <div className="font-black text-sm" style={{color:m.c}}>{m.val}</div>
                    <div className="text-[9px] text-white/30">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ LOGS ══ */}
        {tab==="logs" && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-white flex items-center gap-2"><Terminal size={14} style={{color:G}}/> System Logs</h2>
              <div className="flex gap-1 ml-auto">
                {["all","INFO","WARN","ERROR","DEBUG"].map(f=>(
                  <button key={f} onClick={()=>setLogFilter(f)}
                    className="px-2 py-1 rounded-lg text-[9px] font-bold transition-all"
                    style={{
                      background: logFilter===f ? (f==="ERROR"?"rgba(248,113,113,0.15)":f==="WARN"?"rgba(251,191,36,0.12)":f==="DEBUG"?"rgba(163,163,163,0.1)":"rgba(0,255,136,0.1)") : "rgba(255,255,255,0.03)",
                      color: logFilter===f ? (f==="ERROR"?"#f87171":f==="WARN"?"#fbbf24":f==="DEBUG"?"#a3a3a3":G) : "rgba(255,255,255,0.3)",
                      border: `1px solid ${logFilter===f?"rgba(0,255,136,0.2)":"rgba(255,255,255,0.06)"}`,
                    }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(0,255,136,0.1)"}}>
              <div className="px-4 py-2 flex items-center justify-between" style={{background:"rgba(0,0,0,0.5)",borderBottom:"1px solid rgba(0,255,136,0.08)"}}>
                <span className="font-mono text-[9px]" style={{color:"rgba(0,255,136,0.4)"}}>civac@dev:~$ tail -f system.log</span>
                <button className="flex items-center gap-1 text-[9px]" style={{color:"rgba(0,255,136,0.35)"}}>
                  <RefreshCw size={9}/> Refrescar
                </button>
              </div>
              <div className="p-3 font-mono text-[10px] space-y-1.5 max-h-72 overflow-y-auto" style={{background:"rgba(0,0,0,0.6)"}}>
                {filteredLogs.map((l,i)=>(
                  <div key={i} className="flex gap-2">
                    <span className="flex-shrink-0 font-black min-w-[46px]"
                      style={{color:l.t==="ERROR"?"#f87171":l.t==="WARN"?"#fbbf24":l.t==="DEBUG"?"#a3a3a3":G}}>
                      [{l.t}]
                    </span>
                    <span style={{color:"rgba(255,255,255,0.55)"}}>{l.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ API EXPLORER ══ */}
        {tab==="api" && (
          <>
            <h2 className="text-base font-black text-white flex items-center gap-2"><Key size={14} style={{color:C}}/> API Explorer</h2>
            <div className="rounded-2xl p-4" style={{background:"rgba(0,212,255,0.04)",border:"1px solid rgba(0,212,255,0.15)"}}>
              <div className="flex gap-2 mb-3">
                <select value={apiMethod} onChange={e=>setApiMethod(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-bold font-mono"
                  style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(0,212,255,0.2)",color:apiMethod==="GET"?G:apiMethod==="POST"?"#fbbf24":"#f87171",outline:"none"}}>
                  {["GET","POST","PUT","DELETE","PATCH"].map(m=><option key={m} value={m}>{m}</option>)}
                </select>
                <Input value={apiEndpoint} onChange={e=>setApiEndpoint(e.target.value)}
                  className="flex-1 text-xs font-mono h-9" style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(0,212,255,0.2)",color:"white"}}/>
                <button
                  onClick={async ()=>{
                    setApiLoading(true); setApiResponse(null); setApiStatus(null);
                    try {
                      const opts: RequestInit = { method:apiMethod, headers:{"Content-Type":"application/json"} };
                      if (apiMethod!=="GET" && apiBody.trim()) opts.body = apiBody;
                      const res = await fetch(apiEndpoint, opts);
                      setApiStatus(res.status);
                      const ct = res.headers.get("content-type")||"";
                      const text = ct.includes("json") ? JSON.stringify(await res.json(), null, 2) : await res.text();
                      setApiResponse(text);
                    } catch(e) { setApiResponse(`Error: ${e}`); setApiStatus(0); }
                    finally { setApiLoading(false); }
                  }}
                  disabled={apiLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-60"
                  style={{background:`linear-gradient(135deg,${C},#0ea5e9)`,color:"black"}}>
                  {apiLoading ? <RefreshCw size={11} className="animate-spin"/> : <Play size={11}/>} Enviar
                </button>
              </div>
              {(apiMethod!=="GET") && (
                <textarea value={apiBody} onChange={e=>setApiBody(e.target.value)} rows={3}
                  placeholder={'{\n  "force": true\n}'}
                  className="w-full p-2.5 rounded-xl text-[10px] font-mono resize-none mb-2 outline-none"
                  style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(0,212,255,0.15)",color:"rgba(255,255,255,0.7)"}}/>
              )}
              {apiResponse && (
                <div className="relative">
                  <div className="flex items-center gap-2 mb-1">
                    {apiStatus !== null && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-md"
                        style={{background:apiStatus>=200&&apiStatus<300?"rgba(0,255,136,0.1)":"rgba(248,113,113,0.1)",
                                color:apiStatus>=200&&apiStatus<300?G:"#f87171",border:`1px solid ${apiStatus>=200&&apiStatus<300?"rgba(0,255,136,0.2)":"rgba(248,113,113,0.2)"}`}}>
                        HTTP {apiStatus}
                      </span>
                    )}
                    <span className="text-[9px] text-white/30">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <pre className="p-3 rounded-xl text-[10px] font-mono overflow-x-auto max-h-64"
                    style={{background:"rgba(0,0,0,0.5)",color:"rgba(0,255,136,0.8)",border:"1px solid rgba(0,255,136,0.12)"}}>
                    {apiResponse}
                  </pre>
                  <button onClick={()=>copyText(apiResponse,"api")}
                    className="absolute top-8 right-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[8px]"
                    style={{background:"rgba(0,255,136,0.1)",border:"1px solid rgba(0,255,136,0.2)",color:G}}>
                    {copied==="api"?"✓":<Copy size={9}/>}
                  </button>
                </div>
              )}
            </div>
            <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Endpoints del API Server (reales)</h3>
              <div className="space-y-1.5">
                {[
                  {m:"GET",    path:"/api/health",         desc:"Estado del servidor"},
                  {m:"POST",   path:"/api/seed",           desc:"Seed / reset datos"},
                  {m:"GET",    path:"/api/animals",        desc:"Lista todos los animales"},
                  {m:"POST",   path:"/api/animals",        desc:"Registrar nuevo animal"},
                  {m:"GET",    path:"/api/potreros",       desc:"Lista potreros"},
                  {m:"GET",    path:"/api/insumos",        desc:"Inventario insumos"},
                  {m:"GET",    path:"/api/personal",       desc:"Lista personal"},
                  {m:"GET",    path:"/api/pesajes",        desc:"Historial pesajes"},
                  {m:"GET",    path:"/api/gps",            desc:"Collares GPS"},
                  {m:"GET",    path:"/api/alertas",        desc:"Centro alertas"},
                  {m:"GET",    path:"/api/usuarios",       desc:"Usuarios del sistema"},
                  {m:"GET",    path:"/api/finca",          desc:"Config de la finca"},
                  {m:"GET",    path:"/api/reproduccion",   desc:"Registros reproductivos"},
                ].map(ep=>(
                  <div key={ep.path} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                    style={{background:"rgba(0,0,0,0.2)",border:"1px solid rgba(255,255,255,0.04)"}}>
                    <span className="font-mono font-black text-[9px] w-10 flex-shrink-0"
                      style={{color:ep.m==="GET"?G:ep.m==="POST"?"#fbbf24":"#f87171"}}>{ep.m}</span>
                    <span className="font-mono text-[10px] flex-1 truncate" style={{color:C}}>{ep.path}</span>
                    <span className="text-[9px] text-white/30 hidden sm:block">{ep.desc}</span>
                    <button onClick={()=>{setApiEndpoint(ep.path);setApiMethod(ep.m);}}
                      className="text-[8px] px-1.5 py-0.5 rounded-lg flex-shrink-0"
                      style={{background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.18)",color:C}}>
                      ↑
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ PWA ══ */}
        {tab==="pwa" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-white flex items-center gap-2"><Globe size={14} style={{color:G}}/> PWA · Service Worker</h2>
              <button onClick={checkSW}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold"
                style={{background:`rgba(0,255,136,0.1)`,border:`1px solid rgba(0,255,136,0.25)`,color:G}}>
                <RefreshCw size={10}/> Verificar SW
              </button>
            </div>

            {/* SW status */}
            <div className="rounded-2xl p-4" style={{background:`rgba(0,255,136,0.04)`,border:`1px solid rgba(0,255,136,0.15)`}}>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Server size={13} style={{color:G}}/> Service Worker</h3>
              {swInfo ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{background:"rgba(0,0,0,0.3)"}}>
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${swInfo.registered?"bg-[#00ff88] animate-pulse":"bg-red-500"}`}/>
                    <div className="flex-1">
                      <div className="font-bold text-xs text-white">{swInfo.registered ? "Service Worker Activo" : "Sin Service Worker"}</div>
                      {swInfo.scope && <div className="text-[9px] font-mono text-white/40">scope: {swInfo.scope}</div>}
                      {swInfo.scriptURL && <div className="text-[9px] font-mono text-white/40">script: {swInfo.scriptURL}</div>}
                    </div>
                    {swInfo.registered && (
                      <button onClick={async ()=>{
                        const regs = await navigator.serviceWorker.getRegistrations();
                        await Promise.all(regs.map(r=>r.unregister()));
                        setSwInfo({registered:false});
                      }}
                        className="text-[9px] px-2 py-1 rounded-lg"
                        style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",color:"#f87171"}}>
                        Dar de baja
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-white/30 italic">Haz clic en "Verificar SW" para inspeccionar el estado real.</p>
              )}
            </div>

            {/* Manifest info */}
            <div className="rounded-2xl p-4" style={{background:"rgba(0,212,255,0.04)",border:"1px solid rgba(0,212,255,0.15)"}}>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><BookOpen size={13} style={{color:C}}/> Web App Manifest</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  {k:"name",             v:"GanaderIA CIVAC PRO"},
                  {k:"short_name",       v:"GanaderIA"},
                  {k:"display",          v:"standalone"},
                  {k:"theme_color",      v:"#020d1a"},
                  {k:"background_color", v:"#020d1a"},
                  {k:"start_url",        v:"/"},
                  {k:"scope",            v:"/"},
                  {k:"icons",            v:"192px, 512px SVG"},
                  {k:"shortcuts",        v:"4 accesos directos"},
                ].map(({k,v})=>(
                  <div key={k} className="rounded-xl p-2.5" style={{background:"rgba(0,0,0,0.3)"}}>
                    <div className="text-[8px] font-mono text-white/30">{k}</div>
                    <div className="text-[10px] font-bold text-white/70 mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cache strategy */}
            <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Zap size={13} style={{color:"#fbbf24"}}/> Estrategias de caché — SW v6</h3>
              <div className="space-y-2">
                {[
                  {strategy:"Cache-First",              resources:".js · .css · .woff2 · imágenes",     c:G},
                  {strategy:"Stale-While-Revalidate",   resources:"Navegación HTML (SPA shell)",          c:C},
                  {strategy:"Network-First + Fallback", resources:"Rutas /api/*",                         c:"#fbbf24"},
                  {strategy:"Cache-First TTL largo",    resources:"Fuentes externas · tiles Unsplash",    c:"#a78bfa"},
                ].map(s=>(
                  <div key={s.strategy} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{background:"rgba(0,0,0,0.2)"}}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:s.c}}/>
                    <span className="text-[10px] font-bold w-44 flex-shrink-0" style={{color:s.c}}>{s.strategy}</span>
                    <span className="text-[9px] text-white/40">{s.resources}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PWA actions */}
            <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)"}}>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Acciones PWA</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {label:"Vaciar caché SW",   c:"#f87171", fn:async ()=>{ const keys=await caches.keys(); await Promise.all(keys.map(k=>caches.delete(k))); alert("Caché SW vaciado"); }},
                  {label:"Forzar SW update",  c:G,         fn:async ()=>{ const regs=await navigator.serviceWorker.getRegistrations(); regs.forEach(r=>r.update()); }},
                  {label:"Recargar app",      c:"#fbbf24", fn:()=>window.location.reload()},
                  {label:"Ver manifest.json", c:C,         fn:()=>window.open("/manifest.json","_blank")},
                ].map(a=>(
                  <button key={a.label} onClick={a.fn}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all hover:opacity-80"
                    style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${a.c}25`,color:a.c}}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ BASE DE DATOS ══ */}
        {tab==="bd" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Database size={14} style={{color:C}}/> Base de Datos PostgreSQL
                </h2>
                <p className="text-[10px] text-white/30">Conteos reales · Drizzle ORM · Replit DB</p>
              </div>
              <button onClick={loadBdCounts} disabled={bdLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold disabled:opacity-50"
                style={{background:`rgba(0,212,255,0.1)`,border:`1px solid rgba(0,212,255,0.25)`,color:C}}>
                <RefreshCw size={10} className={bdLoading?"animate-spin":""}/> Cargar conteos
              </button>
            </div>

            {/* DB counts grid */}
            {Object.keys(bdCounts).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  {k:"animals",     label:"Animales",       icon:"🐄", c:"#39ff7e"},
                  {k:"potreros",    label:"Potreros",       icon:"🌿", c:C},
                  {k:"insumos",     label:"Insumos",        icon:"📦", c:"#fbbf24"},
                  {k:"personal",    label:"Personal",       icon:"👷", c:"#a78bfa"},
                  {k:"reproduccion",label:"Reproducción",   icon:"🧬", c:"#f472b6"},
                  {k:"alertas",     label:"Alertas",        icon:"🔔", c:"#f87171"},
                  {k:"pesajes",     label:"Pesajes",        icon:"⚖️", c:G},
                  {k:"gps",         label:"GPS collares",   icon:"📡", c:"#60a5fa"},
                  {k:"usuarios",    label:"Usuarios",       icon:"👥", c:"#00f5d4"},
                ].map(({k,label,icon,c})=>(
                  <div key={k} className="rounded-2xl p-4 flex items-center gap-3"
                    style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${c}18`}}>
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <div className="text-2xl font-black" style={{color:c}}>{bdCounts[k]??0}</div>
                      <div className="text-[10px] text-white/40">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl p-8 text-center" style={{background:"rgba(0,212,255,0.04)",border:"1px solid rgba(0,212,255,0.12)"}}>
                <Database size={28} className="mx-auto mb-3" style={{color:"rgba(0,212,255,0.4)"}}/>
                <p className="text-sm text-white/40 mb-4">Haz clic en "Cargar conteos" para consultar la BD.</p>
                <button onClick={loadBdCounts} disabled={bdLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black mx-auto disabled:opacity-50"
                  style={{background:`linear-gradient(135deg,${C},#0ea5e9)`,color:"black"}}>
                  <Database size={12}/> Cargar ahora
                </button>
              </div>
            )}

            {/* Schema overview */}
            <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.07)"}}>
              <div className="px-4 py-3" style={{background:"rgba(0,0,0,0.4)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code size={13} style={{color:G}}/> Schema Drizzle ORM (lib/db/src/schema/index.ts)
                </h3>
              </div>
              <div className="p-3 font-mono text-[9px] space-y-1 max-h-52 overflow-y-auto" style={{background:"rgba(0,0,0,0.5)"}}>
                {[
                  {table:"animalsTable",          cols:"id, nombre, rfid, raza, categoria, sexo, peso_kg, lote, estado, foto_url"},
                  {table:"potrerosTable",         cols:"id, nombre, area_ha, estado, pasto, animales_actuales, capacidad_maxima"},
                  {table:"insumosTable",          cols:"id, nombre, categoria, cantidad, unidad, stock_minimo, precio_unidad"},
                  {table:"personalTable",         cols:"id, nombre, cargo, telefono, salario, eps, arl, activo"},
                  {table:"reproduccionTable",     cols:"id, animal_id, tipo, fecha, toro, resultado, observaciones"},
                  {table:"alertasTable",          cols:"id, titulo, mensaje, severidad, modulo, estado, fecha"},
                  {table:"pesajesTable",          cols:"id, animal_id, peso_kg, bcs, gmd, tecnico, metodo, fecha"},
                  {table:"gpsTable",              cols:"id, device_id, animal_id, nombre_device, lat, lng, bateria, estado"},
                  {table:"usuariosTable",         cols:"id, nombre, email, rol, plan, finca, activo"},
                  {table:"fincaTable",            cols:"id, nombre, nit, municipio, departamento, hectareas, capacidad"},
                  {table:"plansTable",            cols:"id, code, nombre, precio_mensual, limite_animales, limite_usuarios"},
                ].map(({table,cols})=>(
                  <div key={table} className="flex gap-3">
                    <span style={{color:G}} className="font-black flex-shrink-0 w-48">{table}</span>
                    <span style={{color:"rgba(255,255,255,0.35)"}}>{cols}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick SQL actions */}
            <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)"}}>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Acciones rápidas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  {label:"Seed datos demo",     c:G,         fn:async()=>{ await fetch("/api/seed",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({})}); await loadBdCounts(); }},
                  {label:"Reset + reseed",       c:"#f87171", fn:async()=>{ if(!confirm("¿Resetear todos los datos?")) return; await fetch("/api/seed",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({force:true})}); await loadBdCounts(); }},
                  {label:"Recargar conteos",     c:C,         fn:loadBdCounts},
                ].map(a=>(
                  <button key={a.label} onClick={a.fn} disabled={bdLoading}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all hover:opacity-80 disabled:opacity-50"
                    style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${a.c}25`,color:a.c}}>
                    <Database size={11}/> {a.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ TICKETS ══ */}
        {tab==="tickets" && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2"><Send size={14} style={{color:"#e879f9"}}/> Tickets & Soporte Dev</h2>
                <p className="text-[10px] text-white/30">Bugs · Mejoras · Solicitudes · Equipo CIVAC</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["all","abierto","en_proceso","cerrado"] as const).map(f=>(
                  <button key={f} onClick={()=>setTFilter(f)}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                    style={{ background:tFilter===f?"rgba(232,121,249,0.15)":"rgba(255,255,255,0.04)", color:tFilter===f?"#e879f9":"rgba(255,255,255,0.4)", border:`1px solid ${tFilter===f?"rgba(232,121,249,0.4)":"rgba(255,255,255,0.08)"}` }}>
                    {f==="all"?"Todos":f==="abierto"?"Abiertos":f==="en_proceso"?"En proceso":"Cerrados"}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-3 gap-3">
              {([["abierto","Abiertos","#f87171"],["en_proceso","En proceso","#fbbf24"],["cerrado","Cerrados","#34d399"]] as const).map(([e,l,c])=>(
                <div key={e} className="rounded-2xl p-4 text-center" style={{background:`${c}08`,border:`1px solid ${c}25`}}>
                  <div className="text-2xl font-black mb-1" style={{color:c}}>{tickets.filter(t=>t.estado===e).length}</div>
                  <div className="text-[10px] text-white/40">{l}</div>
                </div>
              ))}
            </div>

            {/* New ticket form */}
            <div className="rounded-2xl p-4 space-y-3" style={{background:"rgba(232,121,249,0.04)",border:"1px solid rgba(232,121,249,0.18)"}}>
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2"><Plus size={11}/> Nuevo ticket</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input value={tForm.titulo} onChange={e=>setTForm(f=>({...f,titulo:e.target.value}))} placeholder="Título del ticket…"
                  className="col-span-2 px-3 py-2 rounded-xl text-xs text-white placeholder:text-white/25 outline-none"
                  style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(232,121,249,0.2)"}}/>
                <select value={tForm.prioridad} onChange={e=>setTForm(f=>({...f,prioridad:e.target.value as "alta"|"media"|"baja"}))}
                  className="px-3 py-2 rounded-xl text-xs text-white outline-none"
                  style={{background:"rgba(30,20,40,0.9)",border:"1px solid rgba(232,121,249,0.2)"}}>
                  <option value="alta">🔴 Alta</option><option value="media">🟡 Media</option><option value="baja">🟢 Baja</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <textarea value={tForm.desc} onChange={e=>setTForm(f=>({...f,desc:e.target.value}))} placeholder="Descripción detallada…" rows={2}
                  className="col-span-2 px-3 py-2 rounded-xl text-xs text-white placeholder:text-white/25 outline-none resize-none"
                  style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(232,121,249,0.2)"}}/>
                <div className="flex flex-col gap-2">
                  <select value={tForm.categoria} onChange={e=>setTForm(f=>({...f,categoria:e.target.value}))}
                    className="px-3 py-2 rounded-xl text-xs text-white outline-none"
                    style={{background:"rgba(30,20,40,0.9)",border:"1px solid rgba(232,121,249,0.2)"}}>
                    <option value="bug">🐛 Bug</option><option value="mejora">✨ Mejora</option>
                    <option value="soporte">🎧 Soporte cliente</option><option value="seguridad">🔒 Seguridad</option>
                    <option value="docs">📖 Documentación</option><option value="devops">⚙️ DevOps</option>
                  </select>
                  <button onClick={addTicket} disabled={!tForm.titulo.trim()}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black disabled:opacity-40 transition-all hover:opacity-90"
                    style={{background:"linear-gradient(135deg,#e879f9,#a855f7)",color:"white"}}>
                    <Plus size={11}/> Crear ticket
                  </button>
                </div>
              </div>
            </div>

            {/* Ticket list */}
            <div className="space-y-2">
              {tickets.filter(t=>tFilter==="all"||t.estado===tFilter).length === 0 ? (
                <div className="rounded-2xl p-8 text-center" style={{background:"rgba(232,121,249,0.03)",border:"1px solid rgba(232,121,249,0.10)"}}>
                  <Send size={24} className="mx-auto mb-3" style={{color:"rgba(232,121,249,0.3)"}}/>
                  <p className="text-sm text-white/30">No hay tickets con este filtro. Crea uno arriba.</p>
                </div>
              ) : tickets.filter(t=>tFilter==="all"||t.estado===tFilter).map(t=>{
                const prioC = t.prioridad==="alta"?"#f87171":t.prioridad==="media"?"#fbbf24":"#34d399";
                const estC  = t.estado==="abierto"?"#f87171":t.estado==="en_proceso"?"#fbbf24":"#34d399";
                return (
                  <div key={t.id} className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.03)",border:`1px solid rgba(255,255,255,0.07)`}}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[9px] font-mono text-white/25">{t.id}</span>
                          <span className="text-xs font-black text-white">{t.titulo}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{background:`${prioC}18`,color:prioC,border:`1px solid ${prioC}40`}}>
                            {t.prioridad==="alta"?"🔴":t.prioridad==="media"?"🟡":"🟢"} {t.prioridad}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{background:`${estC}12`,color:estC,border:`1px solid ${estC}30`}}>
                            {t.estado==="abierto"?"Abierto":t.estado==="en_proceso"?"En proceso":"✓ Cerrado"}
                          </span>
                          <span className="text-[9px] text-white/20">{t.categoria} · {t.fecha} · {t.autor.split(" ")[0]}</span>
                        </div>
                        {t.desc && <p className="text-[10px] text-white/40 leading-relaxed">{t.desc}</p>}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {t.estado==="abierto" && (
                          <button onClick={()=>updateTicketEstado(t.id,"en_proceso")}
                            className="text-[9px] font-bold px-2 py-1 rounded-lg transition-all hover:opacity-80"
                            style={{background:"rgba(251,191,36,0.12)",color:"#fbbf24",border:"1px solid rgba(251,191,36,0.3)"}}>
                            En proceso
                          </button>
                        )}
                        {t.estado==="en_proceso" && (
                          <button onClick={()=>updateTicketEstado(t.id,"cerrado")}
                            className="text-[9px] font-bold px-2 py-1 rounded-lg transition-all hover:opacity-80"
                            style={{background:"rgba(52,211,153,0.12)",color:"#34d399",border:"1px solid rgba(52,211,153,0.3)"}}>
                            Cerrar ✓
                          </button>
                        )}
                        {t.estado==="cerrado" && (
                          <button onClick={()=>updateTicketEstado(t.id,"abierto")}
                            className="text-[9px] font-bold px-2 py-1 rounded-lg transition-all hover:opacity-80"
                            style={{background:"rgba(248,113,113,0.10)",color:"#f87171",border:"1px solid rgba(248,113,113,0.25)"}}>
                            Reabrir
                          </button>
                        )}
                        <button onClick={()=>deleteTicket(t.id)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/20"
                          style={{color:"rgba(255,80,80,0.4)"}}>
                          <X size={10}/>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ══ ACCESOS ══ */}
        {tab==="accesos" && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2"><Shield size={14} style={{color:"#00f5d4"}}/> Registro de Accesos</h2>
                <p className="text-[10px] text-white/30">Historial de inicios de sesión · Registrado en localStorage</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {([["all","Todos"],["civac","⬡ CIVAC"],["demo","🧪 Demo"],["client","👤 Clientes"]] as const).map(([f,l])=>(
                  <button key={f} onClick={()=>setActFilter(f)}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                    style={{ background:actFilter===f?"rgba(0,245,212,0.12)":"rgba(255,255,255,0.04)", color:actFilter===f?"#00f5d4":"rgba(255,255,255,0.4)", border:`1px solid ${actFilter===f?"rgba(0,245,212,0.4)":"rgba(255,255,255,0.08)"}` }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label:"Total accesos", val:loginActivity.length, c:"#00f5d4" },
                { label:"⬡ CIVAC Staff",  val:loginActivity.filter(a=>a.isCivac).length, c:"#fbbf24" },
                { label:"Modo Demo",      val:loginActivity.filter(a=>a.isDemo&&!a.isCivac).length, c:"#e879f9" },
                { label:"Hoy",           val:loginActivity.filter(a=>a.fecha===new Date().toLocaleDateString("es-CO")).length, c:"#39ff7e" },
              ].map(k=>(
                <div key={k.label} className="rounded-2xl p-4 text-center" style={{background:`${k.c}08`,border:`1px solid ${k.c}25`}}>
                  <div className="text-2xl font-black mb-1" style={{color:k.c}}>{k.val}</div>
                  <div className="text-[10px] text-white/40">{k.label}</div>
                </div>
              ))}
            </div>

            {/* Activity list */}
            <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.07)"}}>
              <div className="px-4 py-3 flex items-center justify-between" style={{background:"rgba(0,0,0,0.4)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                <span className="text-xs font-bold text-white/50">Accesos recientes — {loginActivity.length} registros</span>
                <button onClick={()=>{ try{localStorage.removeItem("civac_login_activity");}catch{} window.location.reload(); }}
                  className="text-[9px] font-bold px-2 py-1 rounded-lg"
                  style={{background:"rgba(248,113,113,0.1)",color:"#f87171",border:"1px solid rgba(248,113,113,0.25)"}}>
                  Limpiar log
                </button>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                {loginActivity.filter(a=>{
                  if (actFilter==="civac") return a.isCivac;
                  if (actFilter==="demo") return a.isDemo && !a.isCivac;
                  if (actFilter==="client") return !a.isDemo && !a.isCivac;
                  return true;
                }).length === 0 ? (
                  <div className="p-8 text-center">
                    <Shield size={24} className="mx-auto mb-3" style={{color:"rgba(0,245,212,0.3)"}}/>
                    <p className="text-sm text-white/30">Sin registros de acceso. Inicia sesión con alguna cuenta para comenzar el tracking.</p>
                  </div>
                ) : loginActivity.filter(a=>{
                  if (actFilter==="civac") return a.isCivac;
                  if (actFilter==="demo") return a.isDemo && !a.isCivac;
                  if (actFilter==="client") return !a.isDemo && !a.isCivac;
                  return true;
                }).map(a=>{
                  const planC: Record<string,string> = { basico:"#b8c4d4", pro:"#00f5d4", premium:"#fbbf24", platino:"#cd7f32" };
                  const c = a.isCivac?"#fbbf24":planC[a.plan]??"#b8c4d4";
                  return (
                    <div key={a.id} className="px-4 py-3 flex items-center gap-3 border-b" style={{borderColor:"rgba(255,255,255,0.04)"}}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                        style={{background:`${c}15`,border:`1px solid ${c}35`}}>
                        {a.isCivac?"⬡":a.isDemo?"🧪":"👤"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">{a.userName.split(" ").slice(0,2).join(" ")}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{background:`${c}15`,color:c,border:`1px solid ${c}35`}}>
                            {a.isCivac?"⬡ CIVAC":a.plan.toUpperCase()}
                          </span>
                          <span className="text-[9px] text-white/25 font-mono">{a.ua}</span>
                        </div>
                        <p className="text-[10px] text-white/30">{a.userEmail}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[10px] font-bold" style={{color:c}}>{a.hora}</div>
                        <div className="text-[9px] text-white/25">{a.fecha}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Roles activos — tarjetas por cuenta */}
            <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(0,245,212,0.15)"}}>
              <div className="px-4 py-3" style={{background:"rgba(0,0,0,0.4)",borderBottom:"1px solid rgba(0,245,212,0.10)"}}>
                <span className="text-xs font-bold text-white/50 flex items-center gap-2"><Shield size={11} style={{color:"#00f5d4"}}/> Cuentas activas del sistema</span>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  {id:'superadmin', nombre:'Javier Hernando Sánchez Bernal', cargo:'CEO · Fundador & Propietario',  role:'superadmin', avatar:'🔱', c:'#fbbf24', perms:'Acceso total plataforma'},
                  {id:'admin',      nombre:'Lizet Daza',                     cargo:'Co-Fundadora · Directora',     role:'admin',      avatar:'👑', c:'#ff9a3c', perms:'Panel Admin + todos módulos'},
                  {id:'developer',  nombre:'Johnatan Vallejo Marulanda',     cargo:'Arquitecto Principal PWA & IA',role:'developer',  avatar:'🛠️',c:G,        perms:'Dev Console + todos módulos'},
                  {id:'ventas',     nombre:'Asesora CIVAC · Ventas',         cargo:'Asesora Comercial Senior',     role:'sales',      avatar:'💼', c:'#e879f9', perms:'CRM + Planes + Alertas + Docs'},
                  {id:'demo_pro',   nombre:'Ganadería Los Llanos S.A.S.',    cargo:'Plan PRO · Campo',             role:'field',      avatar:'⚡', c:C,        perms:'Módulos plan PRO'},
                  {id:'demo_premium',nombre:'Hacienda Villa Verde',          cargo:'Plan Premium · Propietario',   role:'viewer',     avatar:'🥇', c:'#a78bfa', perms:'Módulos plan Premium'},
                ].map(acc=>(
                  <div key={acc.id} className="px-4 py-3 flex items-center gap-3 flex-wrap sm:flex-nowrap" style={{background:"rgba(0,0,0,0.15)"}}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{background:`${acc.c}14`,border:`1px solid ${acc.c}30`}}>{acc.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-white">{acc.nombre}</span>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{background:`${acc.c}14`,color:acc.c,border:`1px solid ${acc.c}35`}}>{acc.role}</span>
                      </div>
                      <p className="text-[9px] text-white/35">{acc.cargo} · {acc.perms}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg" style={{background:"rgba(0,245,212,0.08)",color:"#00f5d4",border:"1px solid rgba(0,245,212,0.2)"}}>
                        {loginActivity.filter(a=>a.userId===acc.id).length} accesos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session actions */}
            <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)"}}>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Gestión de sesiones</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  {label:"Limpiar log accesos",  c:"#f87171", fn:()=>{ try{localStorage.removeItem("civac_login_activity");}catch{} window.location.reload(); }},
                  {label:"Exportar accesos CSV", c:"#00f5d4", fn:()=>{
                    const csv=["ID,Usuario,Email,Rol,Plan,Fecha,Hora,Browser,Demo,CIVAC",...loginActivity.map(a=>`${a.id},${a.userName},${a.userEmail},${a.userRole},${a.plan},${a.fecha},${a.hora},${a.ua},${a.isDemo},${a.isCivac}`)].join("\n");
                    const blob=new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob); const anchor=document.createElement("a"); anchor.href=url; anchor.download="civac_accesos.csv"; anchor.click(); URL.revokeObjectURL(url);
                  }},
                  {label:"Recargar actividad",   c:G,         fn:()=>window.location.reload()},
                ].map(a=>(
                  <button key={a.label} onClick={a.fn}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all hover:opacity-80"
                    style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${a.c}25`,color:a.c}}>
                    <Shield size={11}/> {a.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ DOCUMENTACIÓN ══ */}
        {tab==="docs" && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2"><BookOpen size={14} style={{color:"#a855f7"}}/> Documentación CIVAC v1.0</h2>
                <p className="text-[10px] text-white/30">32 módulos · Arquitectura · Decisiones de diseño · Guías técnicas</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold"
                style={{background:"rgba(168,85,247,0.1)",border:"1px solid rgba(168,85,247,0.3)",color:"#a855f7"}}>
                <span className="w-1.5 h-1.5 rounded-full" style={{background:"#a855f7"}}/>
                v1.0 · 32 módulos
              </div>
            </div>

            {/* Stack tech */}
            <div className="rounded-2xl p-4" style={{background:"rgba(0,255,136,0.04)",border:"1px solid rgba(0,255,136,0.15)"}}>
              <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2"><Cpu size={13} style={{color:G}}/> Stack Tecnológico</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  {k:"Runtime",    v:"Node.js 24 · pnpm workspaces",    c:G},
                  {k:"Frontend",   v:"React 18 · Vite 6 · TypeScript 5.9",c:C},
                  {k:"Routing",    v:"wouter — SPA ligero",              c:"#a855f7"},
                  {k:"UI",         v:"shadcn/ui · Tailwind CSS v4",      c:"#fbbf24"},
                  {k:"Gráficos",   v:"Recharts (Bar · Area · Pie)",      c:"#f472b6"},
                  {k:"Iconos",     v:"lucide-react",                     c:"#60a5fa"},
                  {k:"Estado",     v:"React Context + localStorage + IndexedDB",c:"#39ff7e"},
                  {k:"PWA",        v:"SW v8 · Manifest · Background Sync · 33 rutas",c:"#00f5d4"},
                  {k:"API Server", v:"Node.js + Fastify (puerto 8080)",  c:G},
                  {k:"Analytics",  v:"Python 3 Flask (puerto 8099)",     c:"#fbbf24"},
                  {k:"GPS Backend",v:"Python 3 Django (puerto 8000)",    c:"#ff9a3c"},
                  {k:"Pago",       v:"Wompi / Nequi / PSE Colombia",     c:"#a855f7"},
                ].map(({k,v,c})=>(
                  <div key={k} className="rounded-xl p-2.5" style={{background:"rgba(0,0,0,0.3)"}}>
                    <div className="text-[8px] font-mono font-black mb-0.5" style={{color:c}}>{k}</div>
                    <div className="text-[9px] text-white/60 leading-relaxed">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Módulos matrix */}
            <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.07)"}}>
              <div className="px-4 py-3 flex items-center gap-2" style={{background:"rgba(0,0,0,0.4)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                <Layers size={12} style={{color:"#a855f7"}}/>
                <span className="text-xs font-bold text-white/60">Módulos del sistema — 32 módulos</span>
              </div>
              <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
                {[
                  {n:1,  label:"Dashboard",      ruta:"/",              rol:"viewer", c:"#00c8ff", desc:"6 KPIs, charts históricos, ticker LIVE"},
                  {n:2,  label:"Inventario",     ruta:"/inventario",    rol:"field",  c:"#39ff7e", desc:"13 bovinos, RFID, filtros, CRUD completo"},
                  {n:3,  label:"Producción",     ruta:"/produccion",    rol:"field",  c:"#00c8ff", desc:"Ordeños, 84 L/día, top-vacas, BarChart"},
                  {n:4,  label:"Reproducción",   ruta:"/reproduccion",  rol:"vet",    c:"#f472b6", desc:"IEP, celos, IA bovina, próximos partos"},
                  {n:5,  label:"Genética",       ruta:"/genetica",      rol:"vet",    c:"#a855f7", desc:"DEP ranking, score bars, pedigrí"},
                  {n:6,  label:"Pesaje BT",      ruta:"/pesaje",        rol:"field",  c:"#ff9a3c", desc:"Báscula Bluetooth — BCS, GMD, 9 razas"},
                  {n:7,  label:"Pesaje Manual",  ruta:"/pesaje-manual", rol:"field",  c:"#ff9a3c", desc:"CC, GMD, recibo PDF imprimible"},
                  {n:8,  label:"Ficha Clínica",  ruta:"/ficha",         rol:"vet",    c:"#22c55e", desc:"Historia clínica tabbed por animal"},
                  {n:9,  label:"Semen",          ruta:"/semen",         rol:"vet",    c:"#a855f7", desc:"Inventario criogénico, embriones TE"},
                  {n:10, label:"Lotes",          ruta:"/lotes",         rol:"field",  c:"#39ff7e", desc:"Movimiento de lotes ganaderos"},
                  {n:11, label:"Potreros",       ruta:"/potreros",      rol:"field",  c:"#39ff7e", desc:"6 lotes, rotación activa, mapa CSS"},
                  {n:12, label:"GPS Bovino",     ruta:"/gps",           rol:"field",  c:"#60a5fa", desc:"watchPosition real, mapa animado, geovallado"},
                  {n:13, label:"GPS Chips",      ruta:"/gps-chips",     rol:"field",  c:"#60a5fa", desc:"Dispositivos GPS/collares, MQTT broker"},
                  {n:14, label:"Alimentación",   ruta:"/alimentacion",  rol:"field",  c:"#fbbf24", desc:"Raciones TMR, minerales, suplementos"},
                  {n:15, label:"Insumos",        ruta:"/insumos",       rol:"field",  c:"#fbbf24", desc:"Kardex, stock mínimo, +/-, alertas"},
                  {n:16, label:"Sanidad",        ruta:"/sanidad",       rol:"vet",    c:"#22c55e", desc:"Vacunación, tratamientos, retiro"},
                  {n:17, label:"Trazabilidad",   ruta:"/trazabilidad",  rol:"vet",    c:"#f97316", desc:"ICA, guías movilización, SINIGAN"},
                  {n:18, label:"Costos P&G",     ruta:"/costos",        rol:"viewer", c:"#39ff7e", desc:"Ingresos/egresos, costo/litro, margen"},
                  {n:19, label:"Personal",       ruta:"/personal",      rol:"admin",  c:"#a78bfa", desc:"6 empleados, nómina, EPS/ARL"},
                  {n:20, label:"Predicción IA",  ruta:"/prediccion",    rol:"viewer", c:"#e879f9", desc:"Simulador financiero con sliders 12m"},
                  {n:21, label:"Huella CO₂",     ruta:"/co2",           rol:"viewer", c:"#34d399", desc:"IPCC 2019, benchmarking Colombia"},
                  {n:22, label:"Multi-Finca",    ruta:"/multifinca",    rol:"viewer", c:"#00f5d4", desc:"3 fincas, comparativa centralizada"},
                  {n:23, label:"Alertas",        ruta:"/alertas",       rol:"viewer", c:"#f87171", desc:"Centro notificaciones, resolver"},
                  {n:24, label:"Asesora IA",     ruta:"/asesora",       rol:"viewer", c:"#e879f9", desc:"Chatbot IA ganadería colombiana"},
                  {n:25, label:"Ventas CRM",     ruta:"/ventas",        rol:"sales",  c:"#e879f9", desc:"Pipeline comercial, prospectos"},
                  {n:26, label:"Drive",          ruta:"/drive",         rol:"viewer", c:"#60a5fa", desc:"Backup nube, historial 30 versiones"},
                  {n:27, label:"Centro Datos",   ruta:"/datos",         rol:"viewer", c:"#fbbf24", desc:"Exportar/importar JSON, reset"},
                  {n:28, label:"Planes",         ruta:"/planes",        rol:"viewer", c:"#cd7f32", desc:"Básico/PRO/Premium/Platino + Wompi"},
                  {n:29, label:"Usuarios",       ruta:"/usuarios",      rol:"admin",  c:"#00f5d4", desc:"Gestión cuentas, permisos por módulo"},
                  {n:30, label:"Configuración",  ruta:"/configuracion", rol:"viewer", c:"#94a3b8", desc:"Finca/Apariencia/Seguridad/Datos"},
                  {n:31, label:"Documentación",  ruta:"/documentacion", rol:"viewer", c:"#a855f7", desc:"24 secciones: todos los módulos"},
                  {n:32, label:"Manual",         ruta:"/manual",        rol:"viewer", c:"#a855f7", desc:"Manual de usuario completo"},
                ].map(m=>(
                  <div key={m.n} className="px-4 py-2.5 flex items-center gap-3" style={{background:"rgba(0,0,0,0.15)"}}>
                    <span className="text-[9px] font-black text-white/20 w-5 flex-shrink-0">{m.n}</span>
                    <span className="text-[10px] font-black w-28 flex-shrink-0" style={{color:m.c}}>{m.label}</span>
                    <span className="font-mono text-[9px] text-white/30 w-36 flex-shrink-0 hidden sm:block">{m.ruta}</span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{background:`${m.c}12`,color:m.c,border:`1px solid ${m.c}30`}}>{m.rol}</span>
                    <span className="text-[9px] text-white/35 hidden md:block">{m.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Arquitectura decisions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl p-4" style={{background:"rgba(0,212,255,0.04)",border:"1px solid rgba(0,212,255,0.15)"}}>
                <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2"><Code size={13} style={{color:C}}/> Decisiones de Arquitectura</h3>
                <div className="space-y-2">
                  {[
                    {d:"Frontend puro",        v:"Todos los datos en React Context + localStorage. Sin backend obligatorio."},
                    {d:"AppStateContext",       v:"Fuente única de verdad. useAppState() en src/lib/data.ts."},
                    {d:"AuthContext",           v:"Autenticación localStorage con 6 cuentas. Sin JWT/servidor."},
                    {d:"ThemeContext",          v:"Toggle dark/light via clase .dark en document.documentElement."},
                    {d:"wouter",               v:"Router SPA ligero. Todas las rutas usan import.meta.env.BASE_URL."},
                    {d:"Sidebar oscuro",        v:"Siempre oscuro — identidad de marca, independiente del tema."},
                    {d:".ts críticos",          v:"auth.ts, theme.ts, data.ts: NUNCA import * as React — se vuelve null en Vite HMR."},
                    {d:"CIVAC_STAFF_IDS",       v:"Array en auth.ts: superadmin, developer, admin, ventas — acceso Server Panel."},
                  ].map(({d,v})=>(
                    <div key={d} className="flex gap-2">
                      <span className="text-[9px] font-black flex-shrink-0 w-32" style={{color:C}}>{d}</span>
                      <span className="text-[9px] text-white/40 leading-relaxed">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-4" style={{background:"rgba(0,255,136,0.04)",border:"1px solid rgba(0,255,136,0.15)"}}>
                <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2"><Globe size={13} style={{color:G}}/> PWA — Service Worker v8</h3>
                <div className="space-y-2">
                  {[
                    {d:"Cache-First",             v:".js · .css · .woff2 · imágenes"},
                    {d:"Stale-While-Revalidate",  v:"Navegación HTML (SPA shell)"},
                    {d:"Network-First",           v:"Rutas /api/*"},
                    {d:"TTL largo",               v:"Fuentes externas · Google Fonts"},
                    {d:"Background Sync",         v:"Cola de acciones offline → reenvío al reconectar"},
                    {d:"Periodic Sync",           v:"Pre-calentar datos cada 6 horas"},
                    {d:"Push Notifications",      v:"Alertas de partos, vacunación, stock"},
                    {d:"Share Target",            v:"Acepta archivos .json para importar backup"},
                    {d:"33 rutas",                v:"Pre-cacheadas en install. Shell offline completo."},
                    {d:"Mensajes SW",             v:"SKIP_WAITING · CLEAR_CACHE · GET_CACHE_SIZE · GET_VERSION"},
                  ].map(({d,v})=>(
                    <div key={d} className="flex gap-2">
                      <span className="text-[9px] font-black flex-shrink-0 w-36" style={{color:G}}>{d}</span>
                      <span className="text-[9px] text-white/40 leading-relaxed">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Auth accounts table */}
            <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,187,36,0.15)"}}>
              <div className="px-4 py-3 flex items-center gap-2" style={{background:"rgba(0,0,0,0.4)",borderBottom:"1px solid rgba(251,191,36,0.08)"}}>
                <Shield size={12} style={{color:"#fbbf24"}}/>
                <span className="text-xs font-bold text-white/50">Sistema de autenticación — 6 cuentas staff + demo</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr style={{background:"rgba(0,0,0,0.3)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                      {["Cuenta","Email","Password","Rol","Plan","Acceso"].map(h=>(
                        <th key={h} className="px-3 py-2 text-left font-black text-white/30 uppercase tracking-wider text-[8px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {nombre:"Javier H. Sánchez",  email:"Softganventas@gmail.com",    pass:"civac2026",  rol:"superadmin", plan:"Platino", c:"#fbbf24", acceso:"Total + Server Panel"},
                      {nombre:"Lizet Daza",         email:"lizet.daza@civac.co",         pass:"lizet2026",  rol:"admin",      plan:"Platino", c:"#ff9a3c", acceso:"Panel Admin completo"},
                      {nombre:"Johnatan Vallejo",   email:"johnatanvallejomarulanda@gmail.com",pass:"dev2026",rol:"developer",  plan:"Platino", c:G,        acceso:"Dev Console + todos"},
                      {nombre:"Asesora CIVAC",      email:"ventas@civac.co",             pass:"ventas2026", rol:"sales",      plan:"Platino", c:"#e879f9", acceso:"CRM + Planes + Docs"},
                      {nombre:"Agropecuaria El Palmar",email:"demo_basico@ganaderia.co", pass:"demo2026",   rol:"field",      plan:"Básico",  c:"#94a3b8", acceso:"Módulos Básico"},
                      {nombre:"Ganadería Los Llanos", email:"demo_pro@ganaderia.co",     pass:"demo2026",   rol:"field",      plan:"PRO",     c:C,         acceso:"Módulos PRO"},
                    ].map((acc,i)=>(
                      <tr key={i} className="border-b" style={{borderColor:"rgba(255,255,255,0.04)"}}>
                        <td className="px-3 py-2.5 font-black" style={{color:acc.c}}>{acc.nombre}</td>
                        <td className="px-3 py-2.5 font-mono text-white/40">{acc.email}</td>
                        <td className="px-3 py-2.5 font-mono" style={{color:"rgba(0,255,136,0.6)"}}>{acc.pass}</td>
                        <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 rounded-full font-bold text-[8px]" style={{background:`${acc.c}14`,color:acc.c,border:`1px solid ${acc.c}30`}}>{acc.rol}</span></td>
                        <td className="px-3 py-2.5 text-white/50">{acc.plan}</td>
                        <td className="px-3 py-2.5 text-white/30">{acc.acceso}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Diseño visual */}
            <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2"><Zap size={13} style={{color:"#fbbf24"}}/> Identidad visual por módulo</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  {mod:"GPS",         gradient:"#020d1a → #0a2745",  acento:"azul marino"},
                  {mod:"Inventario",  gradient:"verde oscuro",        acento:"#39ff7e neón"},
                  {mod:"Producción",  gradient:"azul profundo",       acento:"#00c8ff"},
                  {mod:"Pesaje",      gradient:"naranja tierra",       acento:"#ff9a3c"},
                  {mod:"Reproducción",gradient:"magenta profundo",     acento:"#ff6fd8"},
                  {mod:"Genética",    gradient:"violeta oscuro",       acento:"#a855f7"},
                  {mod:"Sanidad",     gradient:"verde salud",          acento:"#22c55e"},
                  {mod:"Trazabilidad",gradient:"naranja ICA",          acento:"#f97316"},
                  {mod:"Asesora IA",  gradient:"púrpura IA",           acento:"#e879f9"},
                  {mod:"Server Panel",gradient:"negro matrix",         acento:"#00f5d4 teal"},
                  {mod:"Admin Panel", gradient:"naranja ejecutivo",     acento:"#ff9a3c oro"},
                  {mod:"Dev Console", gradient:"verde matrix",         acento:"#00ff88 matrix"},
                ].map(m=>(
                  <div key={m.mod} className="rounded-xl p-2.5" style={{background:"rgba(0,0,0,0.3)"}}>
                    <div className="text-[10px] font-black text-white/70">{m.mod}</div>
                    <div className="text-[8px] text-white/30 mt-0.5">{m.gradient}</div>
                    <div className="text-[8px] font-mono mt-0.5" style={{color:"rgba(0,255,136,0.6)"}}>{m.acento}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Métricas en vivo — API + tráfico + módulos */}
            <LiveMetricsWidget />

            {/* BD Gateway — SQLite / PostgreSQL */}
            <DbGatewaySection />

            {/* Reglas críticas */}
            <div className="rounded-2xl p-4" style={{background:"rgba(248,113,113,0.04)",border:"1px solid rgba(248,113,113,0.18)"}}>
              <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2"><AlertTriangle size={13} style={{color:"#f87171"}}/> Reglas críticas para el desarrollo</h3>
              <div className="space-y-2">
                {[
                  "useAppState en src/lib/data.ts es la ÚNICA fuente de datos. No romper.",
                  "CRÍTICO: data.ts, theme.ts y auth.ts son .ts (no .tsx) → NUNCA import * as React — se vuelve null en Vite HMR.",
                  "Slider: @/components/ui/slider (ya instalado). No usar librería externa.",
                  "Todas las rutas deben usar BASE_URL prefix (import.meta.env.BASE_URL).",
                  "Dark mode: @custom-variant dark (&:is(.dark *)) — clase .dark en document.documentElement.",
                  "NO usar MapMap de lucide-react → usar Map. Verificar iconos antes de usar.",
                  "Server Panel (/server, /server-dashboard) fuera del AuthGate — acceso directo sin auth.",
                  "CIVAC_STAFF_IDS en auth.ts controla badge CIVAC y acceso al Server Panel.",
                  "NO importar @workspace/api-client-react — solo React state puro.",
                  "Recharts: BarChart preferido, AreaChart en dashboard, PieChart para distribución.",
                ].map((r,i)=>(
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-[9px] font-black flex-shrink-0 mt-0.5" style={{color:"#f87171"}}>!</span>
                    <span className="text-[9px] text-white/55 leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
