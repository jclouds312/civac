import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
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
  { v:"4.3.0", date:"2026-05-21", status:"current", tag:"stable",
    changes:["Nuevos roles: Developer + SuperAdmin","Version management panel","Plan-based PWA install + popup","Generación de licencias JSON por usuario","Fix: registerUser preserva plan asignado","Módulos tab completo con matriz"],
    plans:{ basico:"4.2.1", pro:"4.2.1", premium:"4.3.0", platino:"4.3.0" },
    notes:"Release mayor: gestión de versiones y nuevos roles avanzados.",
  },
  { v:"4.2.1", date:"2026-05-10", status:"stable", tag:"lts",
    changes:["Fix plan hardcode en registerUser","Módulos tab admin con filtros","Botón licencia JSON en cuentas","Admin dashboard plan-aware"],
    plans:{ basico:"4.2.1", pro:"4.2.1", premium:"4.2.1", platino:"4.2.1" },
    notes:"Patch de estabilidad post-v4.2.",
  },
  { v:"4.2.0", date:"2026-04-28", status:"stable", tag:"stable",
    changes:["Pesaje CIVAC BT 9-byte parser","RFID lector CIVAC","Tab estadísticas pesaje","CSV export historial","IA predict GDP"],
    plans:{ basico:"4.1.0", pro:"4.2.0", premium:"4.2.0", platino:"4.2.0" },
    notes:"Release Pesaje Automatizado con Bluetooth.",
  },
  { v:"4.1.0", date:"2026-03-15", status:"stable", tag:"stable",
    changes:["Admin dashboard 8 tabs completo","Wompi payments integración","Session management + revoke","API keys + webhooks"],
    plans:{ basico:"4.1.0", pro:"4.1.0", premium:"4.1.0", platino:"4.1.0" },
    notes:"Platform release — monetización completa.",
  },
  { v:"4.0.0", date:"2026-01-10", status:"archived", tag:"legacy",
    changes:["Visual overhaul v4 completo","Dark navy / warm cream","Holstein cow logo SVG","PWA service worker v6"],
    plans:{ basico:"4.0.0", pro:"4.0.0", premium:"4.0.0", platino:"4.0.0" },
    notes:"Major redesign release.",
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
  version: "4.3.0", build: "2026-05-21.0001", commit: "6eaf326f",
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

type TabId = "resumen"|"versiones"|"flags"|"diagnostico"|"build"|"logs"|"api"|"db"|"pipeline"|"protocolo";

const TABS: { id:TabId; icon:React.ReactNode; label:string }[] = [
  { id:"resumen",     icon:<BarChart3 size={13}/>,   label:"Resumen"      },
  { id:"versiones",   icon:<GitBranch size={13}/>,   label:"Versiones"    },
  { id:"flags",       icon:<Flag size={13}/>,        label:"Feature Flags"},
  { id:"diagnostico", icon:<Activity size={13}/>,   label:"Diagnóstico"  },
  { id:"build",       icon:<Package size={13}/>,     label:"Build Info"   },
  { id:"logs",        icon:<Terminal size={13}/>,    label:"Logs"         },
  { id:"api",         icon:<Key size={13}/>,         label:"API Explorer" },
  { id:"db",          icon:<Database size={13}/>,    label:"DB Browser"   },
  { id:"pipeline",    icon:<Layers size={13}/>,      label:"Pipeline"     },
  { id:"protocolo",   icon:<Cpu size={13}/>,         label:"Protocolo"    },
];

export default function DeveloperDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab]           = useState<TabId>("resumen");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [flags, setFlags]       = useState(FEATURE_FLAGS_DEFAULT);
  const [activeVer, setActiveVer] = useState("4.3.0");
  const [newVerOpen, setNewVerOpen] = useState(false);
  const [newVerNum, setNewVerNum] = useState("");
  const [newVerNotes, setNewVerNotes] = useState("");
  const [logFilter, setLogFilter] = useState("all");
  const [apiEndpoint, setApiEndpoint] = useState("/api/v1/animales");
  const [apiMethod, setApiMethod] = useState("GET");
  const [apiResponse, setApiResponse] = useState<string|null>(null);
  const [copied, setCopied] = useState("");
  /* DB Browser tab state */
  const [selStore, setSelStore] = useState<string>("civac_animales");
  /* Protocol Analyzer tab state */
  const [hexInput, setHexInput] = useState("02 4B 47 20 20 20 20 30 38 35 2E 37 20 53 20 0D");
  const [parsedResult, setParsedResult] = useState<{field:string;val:string;color:string}[]|null>(null);
  const [selProto, setSelProto] = useState("toledo");

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
    {t:"INFO",   msg:"[2026-05-21 11:35] Auth version bump → 4.3.0 · 6 cuentas cargadas",       c:C},
    {t:"WARN",   msg:"[2026-05-21 10:22] Bundle size excede 300 KB target (actual: 312 KB)",    c:"#fbbf24"},
    {t:"INFO",   msg:"[2026-05-21 10:18] Service Worker v6 registrado · scope /",               c:C},
    {t:"INFO",   msg:"[2026-05-21 10:15] Feature flag 'audit_log' desactivado",                 c:G},
    {t:"DEBUG",  msg:"[2026-05-21 09:58] Vite dev server en puerto 5000",                       c:"#a3a3a3"},
    {t:"ERROR",  msg:"[2026-05-20 16:40] Pago rechazado — CIVAC-2026-005 · timeout Wompi",     c:"#f87171"},
    {t:"INFO",   msg:"[2026-05-20 14:12] localStorage migración → v4.3.0 · OK",                c:G},
  ];
  const filteredLogs = LOGS_MOCK.filter(l=> logFilter==="all" || l.t===logFilter);

  return (
    <div className="min-h-screen flex flex-col" style={{ background:"linear-gradient(145deg,#020a12 0%,#040f1a 40%,#050e18 100%)", fontFamily:"'Space Grotesk','Sora',sans-serif" }}>

      {/* ── Topbar ── */}
      <header className="h-[56px] sticky top-0 z-30 flex items-center justify-between px-4 border-b flex-shrink-0"
        style={{ background:"rgba(2,10,18,0.97)", backdropFilter:"blur(24px)", borderColor:"rgba(0,255,136,0.12)", boxShadow:`0 1px 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,255,136,0.03)` }}>
        <div className="flex items-center gap-3">
          <button className="lg:hidden text-white/40 p-1.5" onClick={()=>setMobileOpen(v=>!v)}><Menu size={18}/></button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:"linear-gradient(135deg,#00ff88,#00d4aa)", boxShadow:"0 0 16px rgba(0,255,136,0.5)" }}>
            <Terminal size={14} strokeWidth={2.5} className="text-black"/>
          </div>
          <div>
            <span className="font-black text-white text-sm">CIVAC</span>
            <span className="font-black text-sm ml-1.5" style={{color:G}}>Dev Console</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg font-mono text-[9px]"
            style={{ background:"rgba(0,255,136,0.06)", border:"1px solid rgba(0,255,136,0.15)", color:G }}>
            <Hash size={9}/> v{BUILD_INFO.version} · {BUILD_INFO.commit}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold"
            style={{ background:"rgba(0,255,136,0.08)", border:"1px solid rgba(0,255,136,0.2)", color:G }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse"/>
            {BUILD_INFO.env}
          </div>
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
                      onClick={()=>setFlags(prev=>prev.map((x,j)=>j===i?{...x,enabled:!x.enabled}:x))}
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
                <button onClick={()=>setApiResponse(JSON.stringify({ok:true,data:[{id:"ANI-001",nombre:"Pamela-Holstein",categoria:"lactancia",peso_kg:520}],total:1,timestamp:new Date().toISOString()},null,2))}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
                  style={{background:`linear-gradient(135deg,${C},#0ea5e9)`,color:"black"}}>
                  <Play size={11}/> Enviar
                </button>
              </div>
              {apiResponse && (
                <div className="relative">
                  <pre className="p-3 rounded-xl text-[10px] font-mono overflow-x-auto max-h-64"
                    style={{background:"rgba(0,0,0,0.5)",color:"rgba(0,255,136,0.8)",border:"1px solid rgba(0,255,136,0.12)"}}>
                    {apiResponse}
                  </pre>
                  <button onClick={()=>copyText(apiResponse,"api")}
                    className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[8px]"
                    style={{background:"rgba(0,255,136,0.1)",border:"1px solid rgba(0,255,136,0.2)",color:G}}>
                    {copied==="api"?"✓":<Copy size={9}/>}
                  </button>
                </div>
              )}
            </div>
            <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Endpoints disponibles</h3>
              <div className="space-y-1.5">
                {[
                  {m:"GET",    path:"/api/v1/animales",         desc:"Lista todos los animales"},
                  {m:"GET",    path:"/api/v1/animales/:id",     desc:"Ficha individual"},
                  {m:"POST",   path:"/api/v1/animales",         desc:"Registrar nuevo animal"},
                  {m:"GET",    path:"/api/v1/produccion",       desc:"Historial de producción"},
                  {m:"GET",    path:"/api/v1/pesajes",          desc:"Historial de pesajes"},
                  {m:"POST",   path:"/api/v1/pesajes",          desc:"Registrar pesaje"},
                  {m:"GET",    path:"/api/v1/planes/:userId",   desc:"Config de plan por usuario"},
                  {m:"POST",   path:"/api/v1/licencias",        desc:"Generar licencia JSON"},
                  {m:"GET",    path:"/api/v1/versiones",        desc:"Historial de versiones"},
                ].map(ep=>(
                  <div key={ep.path} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                    style={{background:"rgba(0,0,0,0.2)",border:"1px solid rgba(255,255,255,0.04)"}}>
                    <span className="font-mono font-black text-[9px] w-10 flex-shrink-0"
                      style={{color:ep.m==="GET"?G:ep.m==="POST"?"#fbbf24":"#f87171"}}>{ep.m}</span>
                    <span className="font-mono text-[10px] flex-1 truncate" style={{color:C}}>{ep.path}</span>
                    <span className="text-[9px] text-white/30 hidden sm:block">{ep.desc}</span>
                    <button onClick={()=>setApiEndpoint(ep.path)}
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

        {/* ══ DB BROWSER ══ */}
        {tab==="db" && (() => {
          const DB_STORES = [
            { name:"civac_animales",    count:13, size:"42 KB",  lastWrite:"Hace 2 min",  color:G,       icon:"🐄" },
            { name:"civac_pesajes",     count:47, size:"128 KB", lastWrite:"Hace 5 min",  color:C,       icon:"⚖️" },
            { name:"civac_produccion",  count:84, size:"67 KB",  lastWrite:"Hace 1 h",    color:"#fbbf24",icon:"🥛" },
            { name:"civac_config",      count:1,  size:"3 KB",   lastWrite:"Hace 3 h",    color:"#a78bfa",icon:"⚙️" },
            { name:"civac_sync_queue",  count:3,  size:"8 KB",   lastWrite:"Ahora",       color:"#f87171",icon:"🔄" },
            { name:"civac_tramas",      count:6,  size:"12 KB",  lastWrite:"Hace 20 min", color:"#fb923c",icon:"📡" },
          ];
          const SAMPLE_RECORDS: Record<string, object[]> = {
            civac_animales: [
              {id:"ANI-001",nombre:"Pamela",raza:"Holstein",peso_kg:520,categoria:"lactancia",rfid:"E20034120016B4A8"},
              {id:"ANI-002",nombre:"Lucía",raza:"Jersey",peso_kg:410,categoria:"lactancia",rfid:"E20034120016B4A9"},
              {id:"ANI-003",nombre:"Esperanza",raza:"Brahman",peso_kg:380,categoria:"seca",rfid:"E20034120016B4AA"},
            ],
            civac_pesajes: [
              {id:"P001",animal_id:"ANI-001",peso_kg:520,fecha:"2026-05-21",metodo:"BT",bcs:3.5},
              {id:"P002",animal_id:"ANI-002",peso_kg:410,fecha:"2026-05-21",metodo:"Manual",bcs:3.0},
            ],
            civac_sync_queue: [
              {id:"SQ001",tipo:"pesaje",payload:{id:"P047"},timestamp:"2026-05-21T11:42:00Z",retries:0},
              {id:"SQ002",tipo:"config", payload:{key:"plan"},timestamp:"2026-05-21T11:40:00Z",retries:1},
            ],
          };
          const records = SAMPLE_RECORDS[selStore] ?? [{info:"Store sin registros demo"}];
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-black text-white flex items-center gap-2"><Database size={15} style={{color:G}}/> IndexedDB Browser</h2>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-mono" style={{background:"rgba(0,255,136,0.08)",border:"1px solid rgba(0,255,136,0.2)",color:G}}>civac_db_v1</span>
                <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold"
                  style={{background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)",color:C}}>
                  <Download size={11}/> Exportar BD
                </button>
              </div>

              {/* Store list */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DB_STORES.map(s=>(
                  <button key={s.name} onClick={()=>setSelStore(s.name)}
                    className="text-left rounded-2xl p-3 transition-all hover:scale-[1.02]"
                    style={{
                      background: selStore===s.name ? `${s.color}12` : "rgba(255,255,255,0.02)",
                      border: `1.5px solid ${selStore===s.name ? s.color+"50" : "rgba(255,255,255,0.07)"}`,
                      boxShadow: selStore===s.name ? `0 0 16px ${s.color}15` : "none",
                    }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">{s.icon}</span>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:s.color}}/>
                    </div>
                    <p className="font-mono text-[10px] font-bold mb-0.5" style={{color:s.color}}>{s.name}</p>
                    <div className="flex items-center justify-between text-[9px] text-white/30">
                      <span>{s.count} registros</span><span>{s.size}</span>
                    </div>
                    <div className="text-[8px] text-white/20 mt-0.5">{s.lastWrite}</div>
                  </button>
                ))}
              </div>

              {/* Record viewer */}
              <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(0,255,136,0.15)"}}>
                <div className="px-4 py-2.5 flex items-center justify-between"
                  style={{background:"rgba(0,255,136,0.05)",borderBottom:"1px solid rgba(0,255,136,0.1)"}}>
                  <span className="font-mono text-[11px] font-bold" style={{color:G}}>{selStore}</span>
                  <span className="text-[9px] text-white/30">{records.length} registros (demo)</span>
                </div>
                <div className="p-3 space-y-2 max-h-64 overflow-y-auto" style={{scrollbarWidth:"thin"}}>
                  {records.map((r,i)=>(
                    <div key={i} className="rounded-xl p-2.5" style={{background:"rgba(0,0,0,0.35)",border:"1px solid rgba(255,255,255,0.05)"}}>
                      <pre className="text-[9px] font-mono overflow-x-auto whitespace-pre-wrap" style={{color:"rgba(0,255,136,0.75)"}}>
                        {JSON.stringify(r, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              {/* Storage stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {label:"Total registros", val:DB_STORES.reduce((s,d)=>s+d.count,0), c:G},
                  {label:"Tamaño total",    val:"260 KB",  c:C},
                  {label:"Quota estimada",  val:"~5 MB",   c:"#fbbf24"},
                  {label:"Pendientes sync", val:3,         c:"#f87171"},
                ].map(k=>(
                  <div key={k.label} className="rounded-xl p-3 text-center" style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${k.c}18`}}>
                    <div className="text-xl font-black" style={{color:k.c}}>{k.val}</div>
                    <div className="text-[9px] text-white/35">{k.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ══ PIPELINE ══ */}
        {tab==="pipeline" && (() => {
          const stages = [
            { id:"lint",    label:"ESLint",          status:"passed", duration:"2.1s",  icon:"🔍", log:"✓ 0 errors, 0 warnings · 312 files scanned" },
            { id:"types",   label:"TypeScript",      status:"passed", duration:"8.4s",  icon:"📘", log:"✓ 0 errors · --noEmit strict · tsconfig.json" },
            { id:"test",    label:"Vitest",          status:"skipped",duration:"—",     icon:"🧪", log:"⚠ Sin tests configurados · recommended: /src/__tests__/" },
            { id:"build",   label:"Vite Build",      status:"passed", duration:"11.2s", icon:"🏗️", log:"✓ dist/ · 312 KB JS · 89 KB gzip · 3 chunks" },
            { id:"audit",   label:"pnpm audit",      status:"passed", duration:"3.5s",  icon:"🔒", log:"✓ 0 vulnerabilities · 148 packages checked" },
            { id:"lighthouse",label:"Lighthouse CI", status:"passed", duration:"18.7s", icon:"⚡", log:"✓ Performance:98 · A11y:95 · SEO:100 · PWA:100" },
            { id:"deploy",  label:"Deploy Preview",  status:"running",duration:"…",     icon:"🚀", log:"⏳ Subiendo build a Replit Deployments…" },
          ];
          const stColor: Record<string,string> = { passed:"#39ff7e", failed:"#f87171", skipped:"#fbbf24", running:"#00c8ff" };
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-sm font-black text-white">Build Pipeline — CIVAC v5.0.0</h2>
                  <p className="text-[9px] text-white/30">Rama: main · Commit: {BUILD_INFO.commit} · Iniciado hace 2 min</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00c8ff] animate-pulse"/>
                  <span className="text-[10px] font-bold" style={{color:C}}>En progreso</span>
                </div>
              </div>

              {/* Pipeline stages */}
              <div className="space-y-2">
                {stages.map((st, i)=>(
                  <div key={st.id} className="rounded-2xl p-3 flex items-center gap-3 transition-all"
                    style={{
                      background: st.status==="running" ? "rgba(0,200,255,0.06)" : "rgba(255,255,255,0.02)",
                      border: `1.5px solid ${stColor[st.status]}25`,
                      boxShadow: st.status==="running" ? `0 0 16px rgba(0,200,255,0.08)` : "none",
                    }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                      style={{background:`${stColor[st.status]}12`,border:`1px solid ${stColor[st.status]}30`}}>
                      {st.status==="running" ? "⏳" : st.status==="skipped" ? "⏭️" : st.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-white text-[12px]">{i+1}. {st.label}</span>
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                          style={{background:`${stColor[st.status]}15`,border:`1px solid ${stColor[st.status]}35`,color:stColor[st.status]}}>
                          {st.status.toUpperCase()}
                        </span>
                        <span className="ml-auto font-mono text-[9px] text-white/30">{st.duration}</span>
                      </div>
                      <p className="font-mono text-[9px]" style={{color:"rgba(255,255,255,0.4)"}}>{st.log}</p>
                    </div>
                    {st.status==="running" && <div className="w-4 h-4 border-2 border-[#00c8ff]/20 border-t-[#00c8ff] rounded-full animate-spin flex-shrink-0"/>}
                  </div>
                ))}
              </div>

              {/* Artifacts */}
              <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(0,255,136,0.1)"}}>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Artefactos generados</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {name:"dist/index.html",       size:"2.8 KB",  type:"HTML",  c:G},
                    {name:"dist/assets/main-[hash].js", size:"312 KB", type:"JS",c:C},
                    {name:"dist/assets/main-[hash].css",size:"48 KB",  type:"CSS", c:"#fb923c"},
                    {name:"dist/sw.js",             size:"8.4 KB",  type:"SW",   c:"#a78bfa"},
                  ].map(f=>(
                    <div key={f.name} className="rounded-xl px-3 py-2" style={{background:"rgba(0,0,0,0.3)",border:`1px solid ${f.c}18`}}>
                      <div className="text-[8px] font-black px-1.5 py-0.5 rounded mb-1 inline-block"
                        style={{background:`${f.c}15`,color:f.c}}>{f.type}</div>
                      <p className="font-mono text-[9px] text-white/50 truncate">{f.name}</p>
                      <p className="text-[9px] font-black" style={{color:f.c}}>{f.size}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* History */}
              <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.07)"}}>
                <div className="px-4 py-2.5" style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <h3 className="text-xs font-bold text-white/50">Historial de pipelines</h3>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {[
                    {hash:"a4f2b1c",msg:"feat: trama executor + DB browser",t:"Hace 2 min", ok:true },
                    {hash:"3e9c0d8",msg:"fix: pesaje BCS recalculation",     t:"Hace 1 día", ok:true },
                    {hash:"f1a7e23",msg:"feat: developer/superadmin dashboards",t:"Hace 2 días",ok:true},
                    {hash:"9b3d571",msg:"chore: pnpm audit fix",            t:"Hace 3 días", ok:false},
                  ].map(h=>(
                    <div key={h.hash} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:h.ok?"#39ff7e":"#f87171"}}/>
                      <span className="font-mono text-[9px]" style={{color:h.ok?G:"#f87171"}}>{h.hash}</span>
                      <span className="text-[10px] text-white/50 flex-1 truncate">{h.msg}</span>
                      <span className="text-[9px] text-white/25 flex-shrink-0">{h.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ══ PROTOCOLO ══ */}
        {tab==="protocolo" && (() => {

          const PROTOCOLS = [
            {id:"toledo",   label:"Toledo 8213",  pattern:"STX + 'KG' + spaces + weight + status + CR", example:"02 4B 47 20 20 20 30 38 35 2E 37 20 53 20 0D"},
            {id:"mw",       label:"M&W A12",      pattern:"weight + ' ' + unit + ' ' + status + CRLF",   example:"30 38 35 2E 37 20 4B 67 20 53 54 0D 0A"},
            {id:"ohaus",    label:"Ohaus Defender",pattern:"'ST,GS,' + weight + ',kg' + CR",              example:"53 54 2C 47 53 2C 30 38 35 2E 37 2C 6B 67 0D"},
            {id:"rice_lake",label:"Rice Lake",    pattern:"'  ' + weight + unit + status + CR",           example:"20 20 30 38 35 2E 37 6B 67 20 53 0D"},
            {id:"avery",    label:"Avery Weigh-Tronix",pattern:"weight + 'kg' + stability + CRLF",        example:"30 38 35 2E 37 6B 67 53 0D 0A"},
            {id:"civac9b",  label:"CIVAC 9B Custom",pattern:"HDR(2) + PESO_BE_u16 + DEC + UNIT + ST + CS + END", example:"C1 A0 03 55 01 6B 53 xx 03"},
          ];

          const parseHex = () => {
            const bytes = hexInput.trim().split(/\s+/).map(h => parseInt(h, 16)).filter(n => !isNaN(n));
            const fields: {field:string;val:string;color:string}[] = [];
            fields.push({field:"Bytes totales", val:`${bytes.length}`, color:G});
            fields.push({field:"HEX raw", val:bytes.map(b=>b.toString(16).padStart(2,"0").toUpperCase()).join(" "), color:C});
            fields.push({field:"ASCII", val:bytes.map(b=>(b>=0x20&&b<0x7f)?String.fromCharCode(b):".").join(""), color:"#fbbf24"});
            // Try to extract a float weight
            const ascii = bytes.filter(b=>b>=0x20&&b<0x7f).map(b=>String.fromCharCode(b)).join("").trim();
            const m = ascii.match(/([0-9]{1,4}\.?\d{0,2})/);
            if (m) fields.push({field:"Peso detectado", val:`${parseFloat(m[1]).toFixed(1)} kg`, color:"#39ff7e"});
            const stable = ascii.includes("S") || ascii.includes("ST");
            fields.push({field:"Estabilidad", val:stable?"ESTABLE (S)":"INESTABLE", color:stable?"#39ff7e":"#f87171"});
            if (bytes[0]===0x02) fields.push({field:"STX detectado", val:"Byte 0 = 0x02", color:"#a78bfa"});
            if (bytes[bytes.length-1]===0x0D) fields.push({field:"CR (\\r) al final", val:"OK", color:G});
            setParsedResult(fields);
          };

          return (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-black text-white mb-0.5">Analizador de Protocolo · Báscula Serial</h2>
                <p className="text-[9px] text-white/30">Decodifica tramas hexadecimales de básculas ganaderas · Compatible con Pesaje PRO</p>
              </div>

              {/* Protocol selector */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Protocolo de referencia</p>
                <div className="flex gap-1.5 flex-wrap">
                  {PROTOCOLS.map(p=>(
                    <button key={p.id} onClick={()=>{setSelProto(p.id);setHexInput(p.example);setParsedResult(null);}}
                      className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                      style={{
                        background:selProto===p.id?"rgba(0,255,136,0.12)":"rgba(255,255,255,0.03)",
                        border:`1px solid ${selProto===p.id?"rgba(0,255,136,0.4)":"rgba(255,255,255,0.08)"}`,
                        color:selProto===p.id?G:"rgba(255,255,255,0.4)",
                      }}>
                      {p.label}
                    </button>
                  ))}
                </div>
                {(() => {
                  const p = PROTOCOLS.find(x=>x.id===selProto);
                  return p ? (
                    <div className="px-3 py-2 rounded-xl font-mono text-[9px]"
                      style={{background:"rgba(0,0,0,0.35)",border:"1px solid rgba(0,255,136,0.1)",color:"rgba(0,255,136,0.5)"}}>
                      Estructura: {p.pattern}
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Hex input */}
              <div className="rounded-2xl p-4 space-y-3" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(0,212,255,0.2)"}}>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Trama HEX a analizar</label>
                <textarea rows={3} value={hexInput} onChange={e=>setHexInput(e.target.value)}
                  className="w-full p-3 rounded-xl font-mono text-[11px] resize-none"
                  style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(0,212,255,0.2)",color:C,outline:"none"}}
                  placeholder="02 4B 47 20 30 38 35 2E 37 20 53 0D …"
                />
                <div className="flex items-center gap-2">
                  <button onClick={parseHex}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black"
                    style={{background:`linear-gradient(135deg,${G},#00d4aa)`,color:"black"}}>
                    Analizar trama
                  </button>
                  <button onClick={()=>{setHexInput("");setParsedResult(null);}}
                    className="px-3 py-2 rounded-xl text-xs font-bold"
                    style={{background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",color:"#f87171"}}>
                    Limpiar
                  </button>
                  <span className="text-[9px] text-white/25 ml-auto">
                    {hexInput.trim().split(/\s+/).filter(Boolean).length} bytes
                  </span>
                </div>
              </div>

              {/* Parse result */}
              {parsedResult && (
                <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(0,255,136,0.2)"}}>
                  <div className="px-4 py-2.5" style={{background:"rgba(0,255,136,0.06)",borderBottom:"1px solid rgba(0,255,136,0.1)"}}>
                    <h3 className="text-xs font-black text-white flex items-center gap-2"><CheckCircle size={12} style={{color:G}}/> Análisis completado</h3>
                  </div>
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {parsedResult.map((f,i)=>(
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{background:"rgba(0,0,0,0.3)"}}>
                        <span className="text-[9px] text-white/30 flex-1">{f.field}</span>
                        <span className="font-mono text-[10px] font-bold" style={{color:f.color}}>{f.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 9-byte CIVAC packet builder */}
              <div className="rounded-2xl p-4 space-y-3" style={{background:"rgba(255,214,10,0.04)",border:"1px solid rgba(255,214,10,0.2)"}}>
                <div className="flex items-center gap-2">
                  <Cpu size={14} style={{color:"#ffd60a"}}/>
                  <h3 className="text-sm font-black text-white">Constructor de paquete CIVAC 9B</h3>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                    style={{background:"rgba(255,214,10,0.12)",border:"1px solid rgba(255,214,10,0.3)",color:"#ffd60a"}}>
                    Protocolo CIVAC
                  </span>
                </div>
                <div className="grid grid-cols-9 gap-1">
                  {[
                    {byte:"C1",label:"HDR1",  desc:"Header CIVAC",    color:"#a78bfa"},
                    {byte:"A0",label:"HDR2",  desc:"Versión proto",   color:"#a78bfa"},
                    {byte:"03",label:"PESO_H",desc:"Peso MSB",        color:"#00c8ff"},
                    {byte:"55",label:"PESO_L",desc:"Peso LSB ×100",   color:"#00c8ff"},
                    {byte:"01",label:"DEC",   desc:"Decimales",       color:"#39ff7e"},
                    {byte:"6B",label:"UNIT",  desc:"0x6B='k' (kg)",   color:"#fbbf24"},
                    {byte:"53",label:"ST",    desc:"0x53='S' stable", color:"#39ff7e"},
                    {byte:"xx",label:"CS",    desc:"Checksum XOR",    color:"#fb923c"},
                    {byte:"03",label:"END",   desc:"ETX fin trama",   color:"#f87171"},
                  ].map((b,i)=>(
                    <div key={i} className="text-center">
                      <div className="rounded-lg py-2 font-mono text-[11px] font-black mb-1"
                        style={{background:`${b.color}15`,border:`1px solid ${b.color}30`,color:b.color}}>
                        {b.byte}
                      </div>
                      <div className="text-[7px] font-bold text-white/50">{b.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-white/30 font-mono">
                  Peso = (PESO_H×256 + PESO_L) / 10^DEC = (0x03×256 + 0x55) / 100 = 853/100 = 8.53 → ×10 escala = 85.3 kg
                </p>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
