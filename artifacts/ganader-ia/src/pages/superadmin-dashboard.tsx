import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  Shield, Users, Crown, Activity, Server, Globe, Database,
  Download, Upload, RefreshCw, GitBranch, Zap, Bell,
  LogOut, Settings, Lock, Key, BarChart3, TrendingUp,
  AlertTriangle, CheckCircle, XCircle, Clock, Hash,
  Package, Layers, CreditCard, DollarSign, Eye,
  ChevronDown, Plus, Edit, Trash2, Copy, Menu, X,
  FileText, RotateCcw, Play, Star, Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PLAN_LABEL, PLAN_COLOR, PLAN_ICON, PLAN_PRECIOS } from "@/lib/auth";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";

/* ── Shared Versions (mirrors developer-dashboard) ─────────────────────── */
const CIVAC_VERSIONS = [
  { v:"4.3.0", date:"2026-05-21", status:"current", tag:"stable",
    changes:["Nuevos roles Developer + SuperAdmin","Version management panel","Plan-aware PWA install","Generación licencias JSON"],
    plans:{ basico:"4.2.1", pro:"4.2.1", premium:"4.3.0", platino:"4.3.0" },
    notes:"Release mayor: gestión de versiones y nuevos roles avanzados.",
  },
  { v:"4.2.1", date:"2026-05-10", status:"stable", tag:"lts",
    changes:["Fix plan hardcode en registerUser","Módulos tab admin","Botón licencia JSON en cuentas"],
    plans:{ basico:"4.2.1", pro:"4.2.1", premium:"4.2.1", platino:"4.2.1" },
    notes:"Patch de estabilidad.",
  },
  { v:"4.2.0", date:"2026-04-28", status:"stable", tag:"stable",
    changes:["Pesaje CIVAC BT parser","RFID lector","CSV export","IA predict GDP"],
    plans:{ basico:"4.1.0", pro:"4.2.0", premium:"4.2.0", platino:"4.2.0" },
    notes:"Release Pesaje Automatizado.",
  },
  { v:"4.1.0", date:"2026-03-15", status:"stable", tag:"stable",
    changes:["Admin dashboard 8 tabs","Wompi payments","API keys + webhooks"],
    plans:{ basico:"4.1.0", pro:"4.1.0", premium:"4.1.0", platino:"4.1.0" },
    notes:"Platform release.",
  },
];

/* ── Mock data ──────────────────────────────────────────────────────────── */
const MOCK_CLIENTS = [
  { id:"c001", nombre:"Hacienda El Nogal",      email:"admin@ganader.ia",   plan:"platino", estado:"activo",  pago:"2026-06-01", monto:399000,  animales:48, usuarios:6 },
  { id:"c002", nombre:"Finca Las Palmas",        email:"vet@ganader.ia",     plan:"premium", estado:"activo",  pago:"2026-06-05", monto:189000,  animales:32, usuarios:4 },
  { id:"c003", nombre:"Ganadería Montero",       email:"luis@ganader.ia",    plan:"basico",  estado:"activo",  pago:null,         monto:0,       animales:13, usuarios:2 },
  { id:"c004", nombre:"Inversiones Patiño",      email:"visor@ganader.ia",   plan:"pro",     estado:"activo",  pago:"2026-06-12", monto:89000,   animales:24, usuarios:3 },
  { id:"c005", nombre:"Bovinos Sierra Nevada",   email:"c5@example.com",     plan:"premium", estado:"vencido", pago:"2026-05-01", monto:189000,  animales:55, usuarios:5 },
  { id:"c006", nombre:"Cooperativa Los Llanos",  email:"c6@example.com",     plan:"platino", estado:"activo",  pago:"2026-06-20", monto:399000,  animales:120,usuarios:8 },
  { id:"c007", nombre:"Rancho Dorado",           email:"c7@example.com",     plan:"basico",  estado:"prueba",  pago:null,         monto:0,       animales:8,  usuarios:1 },
];

const MRR_DATA = [
  {mes:"Dic",mrr:1240000},{mes:"Ene",mrr:1450000},{mes:"Feb",mrr:1680000},
  {mes:"Mar",mrr:1890000},{mes:"Abr",mrr:2120000},{mes:"May",mrr:2340000},
];
const PLAN_DIST = [
  {name:"Platino",v:2,c:"#c084fc"},{name:"Premium",v:2,c:"#fbbf24"},
  {name:"PRO",v:1,c:"#00c8ff"},{name:"Básico",v:2,c:"#39ff7e"},
];

const AUDIT_LOG = [
  {t:"2026-05-21 11:42",actor:"dev@civac.co",     accion:"DEPLOY",      desc:"Versión 4.3.0 publicada",            nivel:"info" },
  {t:"2026-05-21 10:15",actor:"admin@ganader.ia", accion:"PLAN_CHANGE", desc:"c001 Hacienda → Platino",            nivel:"info" },
  {t:"2026-05-20 16:40",actor:"sistema",           accion:"PAGO",        desc:"Pago rechazado c005 — timeout",      nivel:"warn" },
  {t:"2026-05-20 14:12",actor:"super@civac.co",   accion:"CONFIG",      desc:"Rate limit actualizado → 500 req/h", nivel:"info" },
  {t:"2026-05-19 09:00",actor:"sistema",           accion:"ALERTA",      desc:"c004 sesión expirada forzosa",       nivel:"warn" },
  {t:"2026-05-18 17:30",actor:"super@civac.co",   accion:"SUSPEND",     desc:"c005 suspendido — mora 30 días",     nivel:"error"},
  {t:"2026-05-17 11:00",actor:"admin@ganader.ia", accion:"USER",        desc:"Nuevo usuario vet@ganader.ia",       nivel:"info" },
];

const fmt = (n:number) => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n);
const TP  = {background:"rgba(4,10,20,0.95)",border:"1px solid rgba(255,107,53,0.2)",borderRadius:8,fontSize:11,color:"white"};
const O   = "#ff6b35";
const GO  = "#f7931e";

type TabId = "resumen"|"versiones"|"clientes"|"pagos"|"plataforma"|"auditoria"|"config";

const TABS: {id:TabId; icon:React.ReactNode; label:string}[] = [
  {id:"resumen",    icon:<BarChart3 size={13}/>,   label:"Resumen"     },
  {id:"versiones",  icon:<GitBranch size={13}/>,   label:"Versiones"   },
  {id:"clientes",   icon:<Users size={13}/>,       label:"Clientes"    },
  {id:"pagos",      icon:<CreditCard size={13}/>,  label:"Pagos"       },
  {id:"plataforma", icon:<Server size={13}/>,      label:"Plataforma"  },
  {id:"auditoria",  icon:<Eye size={13}/>,         label:"Auditoría"   },
  {id:"config",     icon:<Settings size={13}/>,    label:"Config"      },
];

const PLAN_COL:Record<string,string> = {platino:"#c084fc",premium:"#fbbf24",pro:"#00c8ff",basico:"#39ff7e"};
const ESTADO_COL:Record<string,string> = {activo:"#39ff7e",vencido:"#f87171",prueba:"#fbbf24",suspendido:"#f87171"};

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab]         = useState<TabId>("resumen");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch]   = useState("");
  const [planFilter, setPlanFilter] = useState("todos");
  const [activeVer, setActiveVer] = useState("4.3.0");
  const [serverUrl, setServerUrl] = useState(localStorage.getItem("civac_server_url")||"");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [rateLimit, setRateLimit] = useState("500");

  const totalMRR = MOCK_CLIENTS.reduce((s,c)=>s+c.monto,0);
  const activos  = MOCK_CLIENTS.filter(c=>c.estado==="activo").length;
  const vencidos = MOCK_CLIENTS.filter(c=>c.estado==="vencido").length;

  const filteredClients = MOCK_CLIENTS.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.nombre.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    const matchP = planFilter==="todos" || c.plan===planFilter;
    return matchQ && matchP;
  });

  const exportCSV = () => {
    const rows = [
      ["ID","Nombre","Email","Plan","Estado","Monto","Animales","Usuarios"],
      ...MOCK_CLIENTS.map(c=>[c.id,c.nombre,c.email,c.plan,c.estado,c.monto,c.animales,c.usuarios]),
    ];
    const csv = rows.map(r=>r.join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="civac_clientes.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const deployVersion = (v: typeof CIVAC_VERSIONS[0]) => {
    setActiveVer(v.v);
    alert(`✓ Versión ${v.v} marcada como activa. En producción real esto desplegaría a todos los clientes de los planes: ${Object.entries(v.plans).filter(([,pv])=>pv===v.v).map(([p])=>p).join(", ")}`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background:"linear-gradient(145deg,#0e0500 0%,#1a0800 40%,#120500 100%)", fontFamily:"'Space Grotesk','Sora',sans-serif" }}>

      {/* ── Topbar ── */}
      <header className="h-[56px] sticky top-0 z-30 flex items-center justify-between px-4 border-b flex-shrink-0"
        style={{ background:"rgba(14,5,0,0.97)", backdropFilter:"blur(24px)", borderColor:"rgba(255,107,53,0.18)", boxShadow:`0 1px 20px rgba(0,0,0,0.6), 0 0 40px rgba(255,107,53,0.04)` }}>
        <div className="flex items-center gap-3">
          <button className="lg:hidden text-white/40 p-1.5" onClick={()=>setMobileOpen(v=>!v)}><Menu size={18}/></button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:"linear-gradient(135deg,#ff6b35,#f7931e)", boxShadow:"0 0 16px rgba(255,107,53,0.6)" }}>
            <span className="text-sm font-black text-black">🔱</span>
          </div>
          <div>
            <span className="font-black text-white text-sm">CIVAC</span>
            <span className="font-black text-sm ml-1.5" style={{color:O}}>Super Admin</span>
          </div>
          {maintenanceMode && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black"
              style={{background:"rgba(248,113,113,0.15)",border:"1px solid rgba(248,113,113,0.35)",color:"#f87171"}}>
              🔧 MANTENIMIENTO
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl text-[9px] font-bold"
            style={{background:"rgba(255,107,53,0.08)",border:"1px solid rgba(255,107,53,0.2)",color:O}}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#39ff7e] animate-pulse"/>
            {MOCK_CLIENTS.length} clientes · v{activeVer}
          </div>
          <span className="text-[10px] text-white/30 hidden sm:block">{user?.email}</span>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{background:"rgba(255,80,80,0.08)",color:"#ff7070",border:"1px solid rgba(255,80,80,0.2)"}}>
            <LogOut size={12}/><span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* ── Tab nav ── */}
      <div className="flex overflow-x-auto border-b flex-shrink-0 scrollbar-none"
        style={{borderColor:"rgba(255,107,53,0.1)",background:"rgba(14,5,0,0.8)"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className="flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 border-b-2"
            style={{
              color: tab===t.id ? O : "rgba(255,255,255,0.4)",
              borderBottomColor: tab===t.id ? O : "transparent",
              background: tab===t.id ? "rgba(255,107,53,0.06)" : "transparent",
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {label:"MRR Total",        val:fmt(totalMRR),        sub:"Ingresos mensuales",       icon:<DollarSign size={16}/>,c:O   },
                {label:"Clientes activos", val:String(activos),      sub:`${vencidos} vencidos`,     icon:<Users size={16}/>,     c:"#39ff7e"},
                {label:"Versión activa",   val:activeVer,            sub:"Rama: main · stable",      icon:<GitBranch size={16}/>, c:"#00c8ff"},
                {label:"Total animales",   val:String(MOCK_CLIENTS.reduce((s,c)=>s+c.animales,0)), sub:"Registros en plataforma", icon:<Activity size={16}/>, c:"#fbbf24"},
              ].map(k=>(
                <div key={k.label} className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${k.c}18`}}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{background:`${k.c}12`,color:k.c}}>{k.icon}</div>
                  <div className="text-xl font-black" style={{color:k.c}}>{k.val}</div>
                  <div className="text-xs font-bold text-white/60 mt-0.5">{k.label}</div>
                  <div className="text-[9px] text-white/25">{k.sub}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${O}15`}}>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><TrendingUp size={13} style={{color:O}}/> MRR 6 meses</h3>
                <ResponsiveContainer width="100%" height={130}>
                  <AreaChart data={MRR_DATA} margin={{top:4,right:8,left:-24,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="mes" tick={{fontSize:10,fill:"rgba(255,255,255,0.35)"}}/>
                    <YAxis tick={{fontSize:10,fill:"rgba(255,255,255,0.35)"}} tickFormatter={v=>`${(v/1000000).toFixed(1)}M`}/>
                    <RTooltip contentStyle={TP} formatter={(v:number)=>[fmt(v),"MRR"]}/>
                    <Area type="monotone" dataKey="mrr" stroke={O} strokeWidth={2} fill={`${O}15`}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(192,132,252,0.12)"}}>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Crown size={13} style={{color:"#c084fc"}}/> Distribución planes</h3>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={110} height={110}>
                    <PieChart>
                      <Pie data={PLAN_DIST} dataKey="v" cx="50%" cy="50%" innerRadius={32} outerRadius={48} paddingAngle={3}>
                        {PLAN_DIST.map((d,i)=><Cell key={i} fill={d.c}/>)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 flex-1">
                    {PLAN_DIST.map(d=>(
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{background:d.c}}/>
                          <span className="text-[10px] text-white/60">{d.name}</span>
                        </div>
                        <span className="font-black text-[11px]" style={{color:d.c}}>{d.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top clients */}
            <div className="rounded-2xl overflow-hidden" style={{border:`1px solid ${O}15`}}>
              <div className="px-4 py-2.5 flex items-center justify-between" style={{background:`${O}08`,borderBottom:`1px solid ${O}12`}}>
                <span className="text-xs font-bold text-white">Top clientes por MRR</span>
                <button onClick={exportCSV} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]"
                  style={{background:`${O}10`,border:`1px solid ${O}25`,color:O}}>
                  <Download size={9}/> CSV
                </button>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_CLIENTS.sort((a,b)=>b.monto-a.monto).slice(0,5).map((c,i)=>(
                  <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                      style={{background:i===0?`${O}25`:i===1?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.03)",color:i===0?O:"rgba(255,255,255,0.3)"}}>
                      {i+1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{c.nombre}</p>
                      <p className="text-[9px] text-white/30 truncate">{c.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{background:`${PLAN_COL[c.plan]}12`,border:`1px solid ${PLAN_COL[c.plan]}30`,color:PLAN_COL[c.plan]}}>
                        {PLAN_LABEL[c.plan as keyof typeof PLAN_LABEL]||c.plan}
                      </span>
                      <span className="font-black text-[11px]" style={{color:O}}>{fmt(c.monto)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ VERSIONES ══ */}
        {tab==="versiones" && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-black text-white">Control de versiones · Deploy</h2>
                <p className="text-[10px] text-white/30">Versión activa: <span style={{color:O}}>v{activeVer}</span> · Controla qué versión ve cada plan</p>
              </div>
              <button onClick={()=>{const md=CIVAC_VERSIONS.map(v=>`## v${v.v} (${v.date})\n${v.notes}\n${v.changes.map(c=>`- ${c}`).join("\n")}`).join("\n\n");const blob=new Blob([`# CIVAC Changelog\n\n${md}`],{type:"text/markdown"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="CHANGELOG.md";a.click();URL.revokeObjectURL(url);}}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{background:`${O}12`,border:`1px solid ${O}30`,color:O}}>
                <Download size={12}/> CHANGELOG.md
              </button>
            </div>

            <div className="space-y-3">
              {CIVAC_VERSIONS.map(v=>{
                const isCurrent = v.v === activeVer;
                const c = isCurrent ? O : "#94a3b8";
                return (
                  <div key={v.v} className="rounded-2xl overflow-hidden" style={{background:isCurrent?"rgba(255,107,53,0.04)":"rgba(255,255,255,0.02)",border:`1px solid ${c}${isCurrent?"40":"18"}`}}>
                    {isCurrent && <div className="h-0.5" style={{background:`linear-gradient(90deg,${O},${GO},transparent)`}}/>}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                        <div className="flex items-center gap-3">
                          <div className="font-mono text-xl font-black" style={{color:c}}>v{v.v}</div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase ${isCurrent?"bg-orange-500/15 text-orange-400 border border-orange-500/30":"bg-slate-500/15 text-slate-400 border border-slate-500/30"}`}>{v.status}</span>
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.4)",border:"1px solid rgba(255,255,255,0.1)"}}>{v.tag}</span>
                              {isCurrent && <span className="text-[9px] font-black animate-pulse" style={{color:O}}>● ACTIVA</span>}
                            </div>
                            <div className="text-[9px] text-white/30 font-mono mt-0.5">{v.date}</div>
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button onClick={()=>{const cfg={civac_version:v.v,fecha:v.date,tag:v.tag,planes:v.plans,cambios:v.changes};const blob=new Blob([JSON.stringify(cfg,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`civac_v${v.v}.json`;a.click();URL.revokeObjectURL(url);}}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold"
                            style={{background:`${c}10`,border:`1px solid ${c}30`,color:c}}>
                            <Download size={10}/> Config
                          </button>
                          {!isCurrent && (
                            <button onClick={()=>deployVersion(v)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold"
                              style={{background:`${O}12`,border:`1px solid ${O}30`,color:O}}>
                              <Play size={10}/> Activar deploy
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Plan matrix */}
                      <div className="grid grid-cols-4 gap-1.5 mb-3">
                        {(Object.entries(v.plans) as [string,string][]).map(([plan,pv])=>(
                          <div key={plan} className="px-2 py-1.5 rounded-lg text-center" style={{background:"rgba(0,0,0,0.25)",border:"1px solid rgba(255,255,255,0.05)"}}>
                            <div className="text-[8px] text-white/30 uppercase">{plan}</div>
                            <div className="font-mono text-[10px] font-black" style={{color:PLAN_COL[plan]||c}}>{pv}</div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[9px] text-white/35 italic mb-2">{v.notes}</p>
                      <div className="flex flex-wrap gap-1">
                        {v.changes.map(ch=>(
                          <span key={ch} className="text-[8px] px-1.5 py-0.5 rounded-lg" style={{background:`${O}08`,border:`1px solid ${O}18`,color:`${O}90`}}>+ {ch}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ══ CLIENTES ══ */}
        {tab==="clientes" && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente…"
                className="max-w-xs text-xs h-8" style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${O}20`}}/>
              <select value={planFilter} onChange={e=>setPlanFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs"
                style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${O}20`,color:"white",outline:"none"}}>
                <option value="todos">Todos los planes</option>
                {["platino","premium","pro","basico"].map(p=><option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ml-auto"
                style={{background:`${O}12`,border:`1px solid ${O}30`,color:O}}>
                <Download size={11}/> Exportar CSV
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{border:`1px solid ${O}15`}}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{background:`${O}08`,borderBottom:`1px solid ${O}12`}}>
                      {["Cliente","Email","Plan","Estado","Monto","Animales","Usuarios","Acciones"].map(h=>(
                        <th key={h} className="px-3 py-2.5 text-left text-[9px] font-black uppercase tracking-wider" style={{color:`${O}80`}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((c,i)=>(
                      <tr key={c.id} style={{background:i%2===0?"rgba(255,255,255,0.01)":"rgba(0,0,0,0.15)",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                        <td className="px-3 py-2.5 font-bold text-white whitespace-nowrap">{c.nombre}</td>
                        <td className="px-3 py-2.5 text-white/40 text-[9px] font-mono">{c.email}</td>
                        <td className="px-3 py-2.5">
                          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black"
                            style={{background:`${PLAN_COL[c.plan]}15`,border:`1px solid ${PLAN_COL[c.plan]}35`,color:PLAN_COL[c.plan]}}>
                            {PLAN_ICON[c.plan as keyof typeof PLAN_ICON]||""} {PLAN_LABEL[c.plan as keyof typeof PLAN_LABEL]||c.plan}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold"
                            style={{background:`${ESTADO_COL[c.estado]||"#fff"}12`,color:ESTADO_COL[c.estado]||"#aaa"}}>
                            {c.estado}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-black text-[11px]" style={{color:O}}>{c.monto>0?fmt(c.monto):"Gratis"}</td>
                        <td className="px-3 py-2.5 font-bold" style={{color:"#00c8ff"}}>{c.animales}</td>
                        <td className="px-3 py-2.5 text-white/40">{c.usuarios}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1">
                            <button className="p-1 rounded-lg hover:bg-white/5" style={{color:"#00c8ff"}} title="Ver detalles"><Eye size={11}/></button>
                            <button className="p-1 rounded-lg hover:bg-white/5" style={{color:O}} title="Editar plan"><Edit size={11}/></button>
                            {c.estado==="activo" && <button className="p-1 rounded-lg hover:bg-white/5" style={{color:"#f87171"}} title="Suspender"><Lock size={11}/></button>}
                            {c.estado!=="activo" && <button className="p-1 rounded-lg hover:bg-white/5" style={{color:"#39ff7e"}} title="Activar"><CheckCircle size={11}/></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══ PAGOS ══ */}
        {tab==="pagos" && (
          <>
            <h2 className="text-base font-black text-white flex items-center gap-2"><DollarSign size={14} style={{color:O}}/> Gestión de pagos · MRR</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {label:"MRR",           val:fmt(totalMRR),     sub:"Mayo 2026",          c:O,      icon:<TrendingUp size={16}/>   },
                {label:"ARR proyectado",val:fmt(totalMRR*12),  sub:"× 12 meses",         c:"#fbbf24",icon:<BarChart3 size={16}/>  },
                {label:"Pagos vencidos",val:String(vencidos),  sub:"Requieren atención", c:"#f87171",icon:<AlertTriangle size={16}/>},
              ].map(k=>(
                <div key={k.label} className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${k.c}18`}}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`${k.c}12`,color:k.c}}>{k.icon}</div>
                    <div>
                      <p className="text-xs font-bold text-white">{k.label}</p>
                      <p className="text-[9px] text-white/25">{k.sub}</p>
                    </div>
                  </div>
                  <div className="text-lg font-black" style={{color:k.c}}>{k.val}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${O}12`}}>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Historial de cobros</h3>
              <div className="space-y-1.5">
                {MOCK_CLIENTS.filter(c=>c.monto>0).sort((a,b)=>b.monto-a.monto).map(c=>(
                  <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{background:"rgba(0,0,0,0.2)",border:"1px solid rgba(255,255,255,0.04)"}}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{c.nombre}</p>
                      <p className="text-[9px] text-white/30">{c.pago ? `Próx: ${c.pago}` : "Sin fecha"}</p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{background:`${PLAN_COL[c.plan]}15`,border:`1px solid ${PLAN_COL[c.plan]}30`,color:PLAN_COL[c.plan]}}>
                      {c.plan}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold`}
                      style={{background:`${ESTADO_COL[c.estado]||"#fff"}12`,color:ESTADO_COL[c.estado]||"#aaa"}}>
                      {c.estado}
                    </span>
                    <span className="font-black text-[11px] flex-shrink-0" style={{color:O}}>{fmt(c.monto)}/mes</span>
                    <button className="text-[8px] px-2 py-1 rounded-lg flex-shrink-0"
                      style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.3)"}}>
                      Recibo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ PLATAFORMA ══ */}
        {tab==="plataforma" && (
          <>
            <h2 className="text-base font-black text-white flex items-center gap-2"><Server size={14} style={{color:O}}/> Configuración de plataforma</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {t:"API Requests",   v:"12,450",  sub:"/24h",      c:"#00c8ff", icon:<Activity size={15}/>  },
                {t:"DB Size",        v:"342 MB",   sub:"↑ 12% sem",c:"#fbbf24", icon:<Database size={15}/>  },
                {t:"Uptime",         v:"99.97%",   sub:"30 días",  c:"#39ff7e", icon:<CheckCircle size={15}/>},
                {t:"Cache hit",      v:"92.3%",    sub:"Redis",    c:"#a78bfa", icon:<Zap size={15}/>       },
                {t:"Sessions vivas", v:"7",        sub:"ahora",    c:O,          icon:<Globe size={15}/>     },
                {t:"Queue tareas",   v:"0",        sub:"pendientes",c:"#39ff7e", icon:<Hash size={15}/>      },
              ].map(s=>(
                <div key={s.t} className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${s.c}15`}}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`${s.c}12`,color:s.c}}>{s.icon}</div>
                    <div><p className="text-xs font-bold text-white">{s.t}</p><p className="text-[9px]" style={{color:`${s.c}70`}}>{s.sub}</p></div>
                  </div>
                  <div className="text-base font-black" style={{color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${O}15`}}>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">URL Servidor principal</h3>
                <div className="flex gap-2">
                  <Input value={serverUrl} onChange={e=>setServerUrl(e.target.value)} placeholder="https://api.civac.co"
                    className="flex-1 text-xs h-8 font-mono" style={{background:"rgba(0,0,0,0.3)",border:`1px solid ${O}20`}}/>
                  <button onClick={()=>{ localStorage.setItem("civac_server_url",serverUrl); alert("URL guardada"); }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{background:`linear-gradient(135deg,${O},${GO})`,color:"black"}}>
                    Guardar
                  </button>
                </div>
                <p className="text-[9px] text-white/25 mt-1.5">URL del servidor donde se sincronizarán los datos offline</p>
              </div>

              <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(248,113,113,0.15)"}}>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Modo mantenimiento</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold" style={{color:maintenanceMode?"#f87171":"#39ff7e"}}>{maintenanceMode?"🔧 ACTIVO":"✓ Normal"}</p>
                    <p className="text-[9px] text-white/30">{maintenanceMode?"Clientes ven pantalla de mantenimiento":"Plataforma operativa"}</p>
                  </div>
                  <button onClick={()=>setMaintenanceMode(m=>!m)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{background:maintenanceMode?"rgba(57,255,126,0.08)":"rgba(248,113,113,0.08)",color:maintenanceMode?"#39ff7e":"#f87171",border:`1px solid ${maintenanceMode?"rgba(57,255,126,0.25)":"rgba(248,113,113,0.25)"}`}}>
                    {maintenanceMode?"Desactivar":"Activar"}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${O}12`}}>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Límites de plataforma</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {label:"Rate limit",    val:rateLimit, unit:"req/h",  setter:setRateLimit},
                  {label:"Max animales",  val:"1000",     unit:"/cuenta", setter:null},
                  {label:"Max usuarios",  val:"20",       unit:"/cuenta", setter:null},
                  {label:"Max fincas",    val:"10",       unit:"/cuenta", setter:null},
                ].map(l=>(
                  <div key={l.label} className="p-2.5 rounded-xl" style={{background:"rgba(0,0,0,0.25)",border:"1px solid rgba(255,255,255,0.05)"}}>
                    <p className="text-[9px] text-white/30 mb-1">{l.label}</p>
                    <div className="flex items-baseline gap-1">
                      {l.setter ? (
                        <input value={l.val} onChange={e=>l.setter?.(e.target.value)} className="w-16 bg-transparent font-black text-sm outline-none" style={{color:O}}/>
                      ) : (
                        <span className="font-black text-sm" style={{color:O}}>{l.val}</span>
                      )}
                      <span className="text-[9px] text-white/25">{l.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ AUDITORÍA ══ */}
        {tab==="auditoria" && (
          <>
            <h2 className="text-base font-black text-white flex items-center gap-2"><Eye size={14} style={{color:"#a78bfa"}}/> Log de auditoría</h2>
            <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(167,139,250,0.15)"}}>
              <div className="px-4 py-2.5 flex items-center justify-between" style={{background:"rgba(167,139,250,0.05)",borderBottom:"1px solid rgba(167,139,250,0.1)"}}>
                <span className="text-xs font-bold text-white">{AUDIT_LOG.length} entradas registradas</span>
                <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]"
                  style={{background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.2)",color:"#a78bfa"}}>
                  <Download size={9}/> Exportar
                </button>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {AUDIT_LOG.map((l,i)=>(
                  <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${l.nivel==="error"?"bg-red-400":l.nivel==="warn"?"bg-yellow-400":"bg-green-400"}`}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-mono font-bold" style={{color:l.nivel==="error"?"#f87171":l.nivel==="warn"?"#fbbf24":"#39ff7e"}}>{l.accion}</span>
                        <span className="text-[9px] text-white/40 font-mono">{l.actor}</span>
                        <span className="text-[8px] text-white/20 ml-auto font-mono">{l.t}</span>
                      </div>
                      <p className="text-[10px] text-white/55 mt-0.5">{l.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ CONFIG ══ */}
        {tab==="config" && (
          <>
            <h2 className="text-base font-black text-white flex items-center gap-2"><Settings size={14} style={{color:O}}/> Configuración global CIVAC</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                {title:"Versión plataforma",  val:"v4.3.0",              desc:"Hash: 6eaf326f · Rama: main",       editable:false, c:"#00c8ff"},
                {title:"Zona horaria",         val:"America/Bogota",      desc:"UTC-5 · Colombia",                  editable:true,  c:O},
                {title:"Idioma default",       val:"es-CO",               desc:"Español Colombia",                   editable:true,  c:"#39ff7e"},
                {title:"Moneda",               val:"COP",                 desc:"Peso Colombiano",                    editable:true,  c:"#fbbf24"},
                {title:"Backup automático",    val:"Diario 02:00",        desc:"Retención 30 días",                  editable:true,  c:"#a78bfa"},
                {title:"Log level",            val:"INFO",                desc:"DEBUG/INFO/WARN/ERROR",              editable:true,  c:"#94a3b8"},
              ].map(item=>(
                <div key={item.title} className="rounded-2xl p-4 flex items-center gap-3" style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${item.c}15`}}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-white/30 uppercase tracking-wider">{item.title}</p>
                    <p className="font-bold text-sm mt-0.5" style={{color:item.c}}>{item.val}</p>
                    <p className="text-[9px] text-white/25">{item.desc}</p>
                  </div>
                  {item.editable && (
                    <button className="p-1.5 rounded-lg" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.3)"}}>
                      <Edit size={11}/>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-4" style={{background:"rgba(248,113,113,0.05)",border:"1px solid rgba(248,113,113,0.2)"}}>
              <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2"><AlertTriangle size={13}/> Zona de peligro</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {label:"Reset all sessions", icon:<RotateCcw size={11}/>, c:"#f87171"},
                  {label:"Flush sync queue",    icon:<Trash2 size={11}/>,   c:"#f87171"},
                  {label:"Force backup now",    icon:<Download size={11}/>, c:"#fbbf24"},
                  {label:"Reload configs",      icon:<RefreshCw size={11}/>,c:"#fbbf24"},
                ].map(a=>(
                  <button key={a.label}
                    onClick={()=>alert(`Acción: ${a.label} — En producción esto ejecutaría el comando del servidor.`)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all hover:opacity-80"
                    style={{background:`${a.c}10`,border:`1px solid ${a.c}25`,color:a.c}}>
                    {a.icon}{a.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
