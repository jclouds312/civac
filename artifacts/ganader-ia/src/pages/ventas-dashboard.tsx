import { useState, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { useAuth, PLAN_COLOR, PLAN_ICON, PLAN_LABEL, type PlanId } from "@/lib/auth";
import {
  TrendingUp, Users, DollarSign, Target, Plus, ChevronRight, Star, Clock, Send,
  BarChart3, Award, Phone, Mail, Calendar, Edit3, Trash2, CheckCircle,
  ArrowRight, RefreshCw, Download, Building2, Filter, X, MessageSquare,
  BookOpen, Package, Globe, Smartphone, Wifi, Zap, Cpu, Shield,
  Search, AlertCircle, TrendingDown, FileText, Settings, LogOut,
  Map, Percent, MonitorSmartphone, Menu,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip as RTooltip, XAxis,
  BarChart, Bar, CartesianGrid, YAxis, PieChart, Pie, Cell,
} from "recharts";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type ContactoEstado = 'prospecto'|'contactado'|'demo'|'negociando'|'comprador'|'lista_espera'|'no_interesado';
type TabId = 'resumen'|'pipeline'|'contactos'|'metas'|'comisiones'|'productos'|'reportes';

interface Contacto {
  id:string; nombre:string; empresa:string; cargo:string; estado:ContactoEstado;
  planInteres:PlanId; valor:number; fecha:string; seguimiento:string;
  phone:string; email:string; ciudad:string; notas:string;
}

/* ─── Constants ─────────────────────────────────────────────────────────── */
const fmt    = (n:number) => n>=1000000?`$${(n/1000000).toFixed(1)}M`:`$${(n/1000).toFixed(0)}k`;
const fmtCOP = (n:number) => `$${(n/1000000).toFixed(2)}M COP`;
const G = "#e879f9"; const G2 = "#39ff7e"; const B = "#00c8ff";

const ESTADO_CONFIG: Record<ContactoEstado,{label:string;c:string;bg:string;orden:number}> = {
  prospecto:       { label:"Prospecto",       c:"#94a3b8", bg:"rgba(148,163,184,0.12)", orden:0 },
  contactado:      { label:"Contactado",      c:"#00c8ff", bg:"rgba(0,200,255,0.12)",   orden:1 },
  demo:            { label:"Demo",            c:"#a855f7", bg:"rgba(168,85,247,0.12)",  orden:2 },
  negociando:      { label:"Negociando",      c:"#fbbf24", bg:"rgba(251,191,36,0.12)",  orden:3 },
  comprador:       { label:"✓ Comprador",     c:"#39ff7e", bg:"rgba(57,255,126,0.12)",  orden:4 },
  lista_espera:    { label:"Lista espera",    c:"#ff9a3c", bg:"rgba(255,154,60,0.12)",  orden:5 },
  no_interesado:   { label:"No interesado",   c:"#f87171", bg:"rgba(248,113,113,0.12)", orden:6 },
};

const PLAN_PRECIOS: Record<PlanId,number> = { basico:0, pro:89000, premium:189000, platino:349000 };

const SEMANA_DATA = [
  {d:'Lun',c:2,v:1},{d:'Mar',c:3,v:0},{d:'Mié',c:1,v:2},
  {d:'Jue',c:4,v:1},{d:'Vie',c:2,v:2},{d:'Sáb',c:1,v:0},{d:'Hoy',c:3,v:1},
];
const MES_DATA = [
  {m:'Ene',ing:1200000,meta:2000000},{m:'Feb',ing:1850000,meta:2000000},{m:'Mar',ing:2300000,meta:2000000},
  {m:'Abr',ing:1750000,meta:2000000},{m:'May',ing:2100000,meta:2000000},{m:'Jun',ing:2450000,meta:2000000},
];

const PLANES_DOCS = [
  {
    id:"basico", icon:"🥈", label:"Plan Básico", precio:"GRATIS",
    target:"Fincas pequeñas · 1-20 animales",
    pitch:"Ideal para ganaderos que comienzan su digitalización. Sin costo, sin tarjeta.",
    modulos:["📊 Dashboard KPIs","🐄 Inventario 20 animales","🥛 Producción diaria","🌿 Potreros 3 lotes","🔔 Alertas básicas","🩺 Sanidad básica","✏️ Pesaje manual"],
    objecciones:[
      {obj:"¿Es realmente gratis?",resp:"Sí, 100% gratis para siempre. Sin tarjeta de crédito."},
      {obj:"¿Puedo cambiar de plan?",resp:"En cualquier momento, el upgrade es inmediato con Wompi."},
      {obj:"¿Pierdo mis datos?",resp:"No, todos los datos se migran al nuevo plan."},
    ],
    c1:"#b8c4d4",c2:"#94a3b8",g:"184,196,212",
  },
  {
    id:"pro", icon:"⚡", label:"Plan PRO", precio:"$89.000/mes",
    target:"Hato completo · 20-200 animales",
    pitch:"Para el ganadero profesional. GPS, Genética, Reproducción, Bluetooth. Todo en uno.",
    modulos:["⚡ Todo Básico incluido","🧬 Reproducción & IEP","🔬 Genética DEP ranking","⚖️ Pesaje Bluetooth","📡 GPS 13 collares","🌾 Alimentación TMR","📦 Insumos & Kardex","💰 Costos P&G","👷 Personal & nómina","📋 Ficha clínica","🏷️ Lotes & movilización","🛡️ Trazabilidad ICA"],
    objecciones:[
      {obj:"¿Por qué $89k?",resp:"Menos de $3.000/día. Un solo error de medicación puede costar más."},
      {obj:"¿El GPS funciona sin internet?",resp:"Sí, con cache offline y sincronización al reconectar."},
      {obj:"¿Qué incluye trazabilidad ICA?",resp:"Guías de movilización, SINIGAN, certificados oficiales."},
    ],
    c1:"#00f5d4",c2:"#00c8ff",g:"0,245,212",
  },
  {
    id:"premium", icon:"🥇", label:"Plan Premium", precio:"$189.000/mes",
    target:"Empresa ganadera · 200+ animales",
    pitch:"IA predictiva, multi-finca, CRM integrado, huella CO₂. La plataforma empresarial.",
    modulos:["🥇 Todo PRO incluido","🤖 Asesora IA 24/7","💼 CRM Ventas","🏘️ Multi-Finca 3 fincas","🔮 Predicción IA 12 meses","🌍 Huella CO₂ IPCC 2019","☁️ Drive Backup 30 versiones"],
    objecciones:[
      {obj:"¿La IA es confiable?",resp:"Modelos entrenados con datos ganaderos colombianos reales."},
      {obj:"¿Multi-finca cómo funciona?",resp:"Dashboard unificado con comparativo entre fincas."},
      {obj:"¿La IA reemplaza al veterinario?",resp:"Complementa, no reemplaza. Es un asistente especializado."},
    ],
    c1:"#fbbf24",c2:"#f59e0b",g:"251,191,36",
  },
  {
    id:"platino", icon:"👑", label:"Plan Platino", precio:"$349.000/mes",
    target:"Corporativo · Múltiples fincas",
    pitch:"Plataforma completa con SLA 99.9%, usuarios ilimitados y soporte dedicado.",
    modulos:["👑 TODO incluido","👥 Usuarios & Roles ilimitados","⚙️ Config. avanzada","📖 Documentación completa","📘 Manual usuario","🗄️ Centro de datos","💳 Gestión planes","🔒 SLA 99.9% garantizado","🎧 Soporte WhatsApp dedicado"],
    objecciones:[
      {obj:"¿Por qué $349k?",resp:"Para una empresa de 500 animales, son $700/animal/mes. Retorno garantizado."},
      {obj:"¿Usuarios ilimitados?",resp:"Sí, todos los roles: admin, vet, campo, visor."},
      {obj:"¿Qué es el SLA?",resp:"Garantizamos 99.9% uptime. Si falla, compensamos."},
    ],
    c1:"#cd7f32",c2:"#e07b54",g:"205,127,50",
  },
];

/* ─── Storage ────────────────────────────────────────────────────────────── */
function loadContacts(): Contacto[] {
  try { const s=localStorage.getItem('civac_crm_contacts'); return s?JSON.parse(s):[]; } catch { return []; }
}
function saveContacts(c: Contacto[]) {
  try { localStorage.setItem('civac_crm_contacts',JSON.stringify(c)); } catch {}
}
function loadMetas(): {mensual:number;trimestral:number;anual:number} {
  try { const s=localStorage.getItem('civac_ventas_metas'); return s?JSON.parse(s):{mensual:2000000,trimestral:6000000,anual:24000000}; } catch { return {mensual:2000000,trimestral:6000000,anual:24000000}; }
}
function saveMetas(m: {mensual:number;trimestral:number;anual:number}) {
  try { localStorage.setItem('civac_ventas_metas',JSON.stringify(m)); } catch {}
}

/* ─── Empty Contacto ─────────────────────────────────────────────────────── */
const emptyForm = (): Contacto => ({
  id:'',nombre:'',empresa:'',cargo:'',estado:'prospecto',planInteres:'pro',
  valor:89000,fecha:new Date().toISOString().slice(0,10),seguimiento:'',
  phone:'',email:'',ciudad:'',notas:'',
});

/* ═══════════════════════════════════════════════════════════════════════════
   TABS DEFINITION
═══════════════════════════════════════════════════════════════════════════ */
const TABS: {id:TabId;icon:ReactNode;label:string;c:string}[] = [
  {id:'resumen',    icon:<BarChart3 size={12}/>,   label:'Resumen',    c:G},
  {id:'pipeline',   icon:<Target size={12}/>,      label:'Pipeline',   c:'#00c8ff'},
  {id:'contactos',  icon:<Users size={12}/>,       label:'Contactos',  c:G2},
  {id:'metas',      icon:<Award size={12}/>,       label:'Metas',      c:'#fbbf24'},
  {id:'comisiones', icon:<DollarSign size={12}/>,  label:'Comisiones', c:'#ff9a3c'},
  {id:'productos',  icon:<Package size={12}/>,     label:'Productos',  c:'#a855f7'},
  {id:'reportes',   icon:<FileText size={12}/>,    label:'Reportes',   c:B},
];

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function VentasDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab]       = useState<TabId>('resumen');
  const [contacts, setContacts] = useState<Contacto[]>(loadContacts);
  const [metas, setMetas]   = useState(loadMetas);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ── Contact CRUD ── */
  const [showForm, setShowForm]     = useState(false);
  const [editContact, setEditContact] = useState<Contacto|null>(null);
  const [formData, setFormData]     = useState<Contacto>(emptyForm());
  const [searchQ, setSearchQ]       = useState('');
  const [estadoFilter, setEstadoFilter] = useState<ContactoEstado|'all'>('all');
  const [planFilter, setPlanFilter] = useState<PlanId|'all'>('all');
  const [activePlan, setActivePlan] = useState<PlanId|null>(null);

  /* ── Comisiones ── */
  const [tasaComision, setTasaComision] = useState(10);

  /* ── Metas edit ── */
  const [editMetas, setEditMetas] = useState(false);
  const [metasForm, setMetasForm] = useState(metas);

  /* ── Derived ── */
  const hora = new Date().getHours();
  const saludo = hora<12?'Buenos días':hora<18?'Buenas tardes':'Buenas noches';
  const hoy = new Date().toISOString().slice(0,10);

  const compradores   = useMemo(()=>contacts.filter(c=>c.estado==='comprador'),[contacts]);
  const pipeline      = useMemo(()=>contacts.filter(c=>!['comprador','no_interesado'].includes(c.estado)),[contacts]);
  const listaEspera   = useMemo(()=>contacts.filter(c=>c.estado==='lista_espera'),[contacts]);
  const hoyContacts   = useMemo(()=>contacts.filter(c=>c.seguimiento===hoy||c.fecha===hoy),[contacts,hoy]);
  const ingresosTotal = useMemo(()=>compradores.reduce((s,c)=>s+c.valor,0),[compradores]);
  const pipelineVal   = useMemo(()=>pipeline.reduce((s,c)=>s+c.valor,0),[pipeline]);
  const avanceMeta    = Math.min(100,Math.round(ingresosTotal/metas.mensual*100));
  const comisionTotal = Math.round(ingresosTotal*tasaComision/100);

  const filteredContacts = useMemo(()=>{
    return contacts.filter(c=>{
      const qMatch = !searchQ || c.nombre.toLowerCase().includes(searchQ.toLowerCase()) || c.empresa.toLowerCase().includes(searchQ.toLowerCase()) || c.ciudad.toLowerCase().includes(searchQ.toLowerCase());
      const eMatch = estadoFilter==='all' || c.estado===estadoFilter;
      const pMatch = planFilter==='all' || c.planInteres===planFilter;
      return qMatch && eMatch && pMatch;
    });
  },[contacts,searchQ,estadoFilter,planFilter]);

  /* ── CRUD handlers ── */
  const openNew = useCallback(()=>{ setFormData(emptyForm()); setEditContact(null); setShowForm(true); },[]);
  const openEdit = useCallback((c:Contacto)=>{ setFormData({...c}); setEditContact(c); setShowForm(true); },[]);
  const saveContact = useCallback(()=>{
    if (!formData.nombre.trim()) return;
    let next: Contacto[];
    if (editContact) {
      next = contacts.map(c=>c.id===editContact.id?{...formData}:c);
    } else {
      next = [{...formData,id:`CRM-${Date.now()}`},...contacts];
    }
    setContacts(next); saveContacts(next); setShowForm(false);
  },[contacts,editContact,formData]);
  const deleteContact = useCallback((id:string)=>{
    const next=contacts.filter(c=>c.id!==id); setContacts(next); saveContacts(next);
  },[contacts]);
  const updateEstado = useCallback((id:string,estado:ContactoEstado)=>{
    const next=contacts.map(c=>c.id===id?{...c,estado}:c); setContacts(next); saveContacts(next);
  },[contacts]);

  const saveMetas2 = ()=>{ setMetas(metasForm); saveMetas(metasForm); setEditMetas(false); };

  const exportCSV = ()=>{
    const header="ID,Nombre,Empresa,Estado,Plan,Valor,Fecha,Ciudad,Email,Phone\n";
    const rows=contacts.map(c=>`${c.id},"${c.nombre}","${c.empresa}",${c.estado},${c.planInteres},${c.valor},${c.fecha},"${c.ciudad}","${c.email}","${c.phone}"`).join("\n");
    const blob=new Blob([header+rows],{type:'text/csv'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='civac_crm_contactos.csv';a.click();URL.revokeObjectURL(url);
  };

  /* ── Pie data ── */
  const pieData = useMemo(()=>{
    const byEstado: Record<string,number> = {};
    contacts.forEach(c=>{ byEstado[c.estado]=(byEstado[c.estado]||0)+1; });
    return Object.entries(byEstado).map(([e,v])=>({name:ESTADO_CONFIG[e as ContactoEstado]?.label??e,value:v,fill:ESTADO_CONFIG[e as ContactoEstado]?.c??"#fff"}));
  },[contacts]);

  const planPieData = useMemo(()=>{
    const byPlan: Record<string,number> = {};
    compradores.forEach(c=>{ byPlan[c.planInteres]=(byPlan[c.planInteres]||0)+1; });
    return Object.entries(byPlan).map(([p,v])=>({name:PLAN_LABEL[p as PlanId]??p,value:v,fill:PLAN_COLOR[p as PlanId]??"#fff"}));
  },[compradores]);

  return (
    <div className="min-h-screen flex flex-col" style={{background:'linear-gradient(145deg,#0a0015 0%,#100022 40%,#08001a 100%)',fontFamily:"'Space Grotesk','Sora',sans-serif"}}>

      {/* ── Topbar ── */}
      <header className="h-[56px] sticky top-0 z-30 flex items-center justify-between px-4 border-b flex-shrink-0 relative overflow-hidden"
        style={{background:'rgba(10,0,21,0.97)',backdropFilter:'blur(24px)',borderColor:'rgba(232,121,249,0.2)',boxShadow:'0 1px 20px rgba(0,0,0,0.5),0 0 50px rgba(232,121,249,0.05)'}}>
        <div className="absolute bottom-0 left-0 w-full h-px" style={{background:'linear-gradient(90deg,transparent,#e879f9,#a855f7,transparent)'}}/>
        <div className="flex items-center gap-3">
          <button className="lg:hidden text-white/40 p-1.5" onClick={()=>setMobileOpen(v=>!v)}><Menu size={18}/></button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{background:'linear-gradient(135deg,#e879f9,#a855f7)',boxShadow:'0 0 18px rgba(232,121,249,0.6)'}}>
            <DollarSign size={14} className="text-white" strokeWidth={2.5}/>
          </div>
          <div>
            <span className="font-black text-white text-sm">CIVAC</span>
            <span className="font-black text-sm ml-1.5" style={{color:G,textShadow:`0 0 16px ${G}80`}}> Sales</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold"
            style={{background:'rgba(232,121,249,0.08)',border:'1px solid rgba(232,121,249,0.25)',color:G}}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{background:G}}/>
            LIVE
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/30 hidden sm:block">{user?.nombre?.split(' ')[0]}</span>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{background:'rgba(255,80,80,0.08)',color:'#ff7070',border:'1px solid rgba(255,80,80,0.2)'}}>
            <LogOut size={12}/><span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* ── Tab nav ── */}
      <div className="flex overflow-x-auto border-b flex-shrink-0 scrollbar-none"
        style={{borderColor:'rgba(232,121,249,0.10)',background:'rgba(10,0,21,0.85)'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className="flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 border-b-2"
            style={{
              color:tab===t.id?t.c:'rgba(255,255,255,0.4)',
              borderBottomColor:tab===t.id?t.c:'transparent',
              background:tab===t.id?`rgba(232,121,249,0.04)`:'transparent',
            }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 p-4 lg:p-6 space-y-4 overflow-x-hidden pb-12">

        {/* ══════════════════ RESUMEN ══════════════════ */}
        {tab==='resumen' && (
          <>
            {/* Hero banner */}
            <div className="relative rounded-3xl overflow-hidden"
              style={{background:'linear-gradient(135deg,#1a0030,#2d0050,#1e003a)',border:'1px solid rgba(232,121,249,0.22)',boxShadow:'0 0 50px rgba(232,121,249,0.08)'}}>
              <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(232,121,249,0.15),transparent 70%)'}}/>
              <div className="h-0.5 w-full" style={{background:'linear-gradient(90deg,transparent,#e879f9,#a855f7,transparent)'}}/>
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-black text-white" style={{fontFamily:"'Sora',sans-serif"}}>
                        {saludo}, {user?.nombre?.split(' ')[0] ?? 'Asesora'} 💼
                      </h1>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{background:'rgba(232,121,249,0.15)',color:'#e879f9',border:'1px solid rgba(232,121,249,0.35)'}}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{background:'#e879f9'}}/>
                        CIVAC Sales Live
                      </span>
                    </div>
                    <p className="text-white/50 text-xs">{new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} · CIVAC v1.0</p>
                    <p className="text-[10px] mt-0.5" style={{color:'rgba(232,121,249,0.4)'}}>Panel comercial · Pipeline CRM · Reportes · Gestión de cuentas</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={openNew}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-xs transition-all hover:scale-105"
                      style={{background:'linear-gradient(135deg,#e879f9,#a855f7)',color:'white',boxShadow:'0 0 16px rgba(232,121,249,0.4)'}}>
                      <Plus size={13}/> Nuevo Contacto
                    </button>
                    <button onClick={exportCSV}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all hover:opacity-80"
                      style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.65)',border:'1px solid rgba(255,255,255,0.12)'}}>
                      <Download size={12}/> Exportar CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {label:'Pipeline activo',   val:fmt(pipelineVal),   sub:`${pipeline.length} en negociación`,  from:'#e879f9',to:'#a855f7',glow:'232,121,249',icon:<TrendingUp size={14}/>},
                {label:'Ventas cerradas',   val:compradores.length,  sub:`${fmt(ingresosTotal)} ingresado`,   from:'#39ff7e',to:'#00c850',glow:'57,255,126', icon:<Target size={14}/>},
                {label:'Contactos totales', val:contacts.length,     sub:`${hoyContacts.length} hoy`,        from:'#00c8ff',to:'#0ea5e9',glow:'0,200,255',  icon:<Users size={14}/>},
                {label:'Meta mensual',      val:`${avanceMeta}%`,    sub:`${fmtCOP(ingresosTotal)} de ${fmtCOP(metas.mensual)}`, from:'#fbbf24',to:'#f97316',glow:'251,191,36',icon:<Star size={14}/>},
              ].map((k)=>(
                <div key={k.label} className="relative rounded-[20px] overflow-hidden group cursor-pointer"
                  style={{background:`linear-gradient(145deg,rgba(${k.glow},0.09),rgba(${k.glow},0.03),rgba(0,0,0,0.4))`,border:`1px solid rgba(${k.glow},0.22)`,padding:'14px 12px'}}>
                  <div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(90deg,transparent,${k.from},${k.to},transparent)`,opacity:0.8}}/>
                  <div className="absolute top-0 right-0 w-14 h-14 rounded-full pointer-events-none" style={{background:`radial-gradient(circle,rgba(${k.glow},0.2),transparent)`,transform:'translate(40%,-40%)'}}/>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-black uppercase tracking-wider" style={{color:`rgba(${k.glow},0.75)`}}>{k.label}</div>
                    <div style={{color:`rgba(${k.glow},0.5)`}}>{k.icon}</div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black leading-none mb-1.5" style={{color:`rgba(${k.glow},1)`,textShadow:`0 0 18px rgba(${k.glow},0.6)`,fontFamily:"'Sora',sans-serif"}}>{k.val}</div>
                  <div className="text-[9px] sm:text-[10px] text-white/40">{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Chart + seguimientos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-3xl p-4 sm:p-5" style={{background:'rgba(5,0,20,0.85)',border:'1px solid rgba(232,121,249,0.18)'}}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#e879f9,#a855f7)',boxShadow:'0 0 14px rgba(232,121,249,0.4)'}}>
                    <BarChart3 size={16} className="text-white"/>
                  </div>
                  <div>
                    <p className="font-black text-sm text-white">Actividad semanal</p>
                    <p className="text-[10px] text-white/40">Contactos y ventas · 7 días</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={SEMANA_DATA} margin={{top:5,right:10,left:-25,bottom:0}}>
                    <defs>
                      <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e879f9" stopOpacity={0.3}/><stop offset="95%" stopColor="#e879f9" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#39ff7e" stopOpacity={0.3}/><stop offset="95%" stopColor="#39ff7e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="d" tick={{fill:'rgba(255,255,255,0.35)',fontSize:10}} axisLine={false} tickLine={false}/>
                    <RTooltip contentStyle={{background:'#100022',border:'1px solid rgba(232,121,249,0.3)',borderRadius:12,fontSize:11}} labelStyle={{color:'rgba(255,255,255,0.7)'}}/>
                    <Area type="monotone" dataKey="c" name="Contactos" stroke="#e879f9" strokeWidth={2} fill="url(#gC)" dot={false}/>
                    <Area type="monotone" dataKey="v" name="Ventas" stroke="#39ff7e" strokeWidth={2} fill="url(#gV)" dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-3xl p-4" style={{background:'rgba(5,0,20,0.85)',border:'1px solid rgba(255,154,60,0.18)'}}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={14} style={{color:'#ff9a3c'}}/>
                  <p className="text-sm font-black text-white">Seguimientos hoy</p>
                </div>
                <div className="space-y-2">
                  {hoyContacts.slice(0,5).map(c=>(
                    <div key={c.id} className="flex items-center gap-2 p-2.5 rounded-xl" style={{background:'rgba(255,154,60,0.06)',border:'1px solid rgba(255,154,60,0.12)'}}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0" style={{background:'rgba(255,154,60,0.15)'}}>📞</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white/85 truncate">{c.nombre}</p>
                        <p className="text-[9px] text-white/35">{PLAN_ICON[c.planInteres]} {PLAN_LABEL[c.planInteres]}</p>
                      </div>
                    </div>
                  ))}
                  {hoyContacts.length===0 && <p className="text-[10px] text-white/25 text-center py-6">Sin seguimientos para hoy</p>}
                </div>
              </div>
            </div>

            {/* Resumen financiero */}
            <div className="rounded-3xl p-4 sm:p-5" style={{background:'rgba(5,0,20,0.9)',border:'1px solid rgba(57,255,126,0.15)'}}>
              <p className="text-sm font-black text-white mb-4 flex items-center gap-2"><DollarSign size={14} style={{color:G2}}/> Resumen financiero del mes</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  {l:'Ingresos totales',    v:fmtCOP(ingresosTotal),                     c:'#39ff7e'},
                  {l:'Tu comisión (10%)',   v:fmtCOP(ingresosTotal*0.1),                 c:'#e879f9'},
                  {l:'Meta restante',       v:fmtCOP(Math.max(0,metas.mensual-ingresosTotal)), c:'#ff9a3c'},
                  {l:'Avance meta',         v:`${avanceMeta}%`,                          c:'#fbbf24'},
                ].map(x=>(
                  <div key={x.l} className="text-center p-3 rounded-xl" style={{background:'rgba(255,255,255,0.03)'}}>
                    <p className="text-xl font-black" style={{color:x.c}}>{x.v}</p>
                    <p className="text-[9px] text-white/35 mt-0.5">{x.l}</p>
                  </div>
                ))}
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.06)'}}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{width:`${avanceMeta}%`,background:'linear-gradient(90deg,#e879f9,#39ff7e)',boxShadow:'0 0 8px rgba(57,255,126,0.5)'}}/>
              </div>
              <div className="flex justify-between text-[9px] mt-1 text-white/30">
                <span>Meta: {fmtCOP(metas.mensual)}/mes</span>
                <span style={{color:'#39ff7e'}}>{avanceMeta}% completado</span>
              </div>
            </div>

            {/* Quick nav */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                {href:'/ventas',emoji:'💼',label:'CRM',c:'#e879f9'},{href:'/planes',emoji:'💎',label:'Planes',c:'#fbbf24'},
                {href:'/alertas',emoji:'🔔',label:'Alertas',c:'#ff4d6d'},{href:'/documentacion',emoji:'📖',label:'Docs',c:'#00f5d4'},
                {href:'/manual',emoji:'📋',label:'Manual',c:'#a855f7'},{href:'/usuarios',emoji:'👥',label:'Usuarios',c:'#00c8ff'},
              ].map(n=>(
                <Link key={n.href} href={n.href}>
                  <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl cursor-pointer transition-all hover:scale-[1.05]"
                    style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}>
                    <span className="text-2xl">{n.emoji}</span>
                    <span className="text-[9px] font-bold" style={{color:n.c}}>{n.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ══════════════════ PIPELINE CRM ══════════════════ */}
        {tab==='pipeline' && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2"><Target size={14} style={{color:B}}/> Pipeline Comercial</h2>
                <p className="text-[10px] text-white/30">Embudo de ventas · {contacts.length} contactos totales · {fmt(pipelineVal)} en negociación</p>
              </div>
              <button onClick={openNew}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-xs transition-all hover:scale-105"
                style={{background:'linear-gradient(135deg,#00c8ff,#0ea5e9)',color:'black',boxShadow:'0 0 16px rgba(0,200,255,0.4)'}}>
                <Plus size={12}/> Agregar lead
              </button>
            </div>

            {/* Kanban stages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(['prospecto','contactado','demo','negociando'] as ContactoEstado[]).map(estado=>{
                const cfg = ESTADO_CONFIG[estado];
                const stageContacts = contacts.filter(c=>c.estado===estado);
                const stageVal = stageContacts.reduce((s,c)=>s+c.valor,0);
                return (
                  <div key={estado} className="rounded-2xl overflow-hidden"
                    style={{background:`rgba(5,0,20,0.9)`,border:`1px solid ${cfg.c}25`}}>
                    <div className="px-3 py-2.5 flex items-center justify-between"
                      style={{background:cfg.bg,borderBottom:`1px solid ${cfg.c}20`}}>
                      <div>
                        <span className="text-xs font-black" style={{color:cfg.c}}>{cfg.label}</span>
                        <span className="text-[9px] text-white/30 ml-2">{stageContacts.length}</span>
                      </div>
                      <span className="text-[9px] font-bold" style={{color:cfg.c}}>{fmt(stageVal)}</span>
                    </div>
                    <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
                      {stageContacts.map(c=>(
                        <div key={c.id} className="p-2.5 rounded-xl cursor-pointer group transition-all hover:scale-[1.01]"
                          style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}>
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-black text-white/90 leading-tight truncate">{c.nombre}</p>
                              <p className="text-[9px] text-white/35 truncate">{c.empresa}</p>
                            </div>
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                              style={{background:`rgba(${({basico:'184,196,212',pro:'0,245,212',premium:'251,191,36',platino:'205,127,50'}[c.planInteres]??'255,255,255')},0.15)`,color:PLAN_COLOR[c.planInteres]}}>
                              {PLAN_LABEL[c.planInteres]}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[9px] font-bold" style={{color:cfg.c}}>{fmt(c.valor)}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={()=>openEdit(c)} className="text-[8px] p-1 rounded-lg hover:bg-white/10 transition-colors text-white/40"><Edit3 size={9}/></button>
                              <button onClick={()=>updateEstado(c.id,'comprador')} className="text-[8px] p-1 rounded-lg hover:bg-green-500/20 transition-colors" style={{color:'#39ff7e'}}><CheckCircle size={9}/></button>
                            </div>
                          </div>
                          {c.seguimiento && <p className="text-[8px] text-white/25 mt-1 flex items-center gap-1"><Calendar size={8}/>{c.seguimiento}</p>}
                        </div>
                      ))}
                      {stageContacts.length===0 && (
                        <div className="text-center py-4">
                          <p className="text-[9px] text-white/20">Sin contactos</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compradores row */}
            <div className="rounded-2xl p-4" style={{background:'rgba(57,255,126,0.04)',border:'1px solid rgba(57,255,126,0.18)'}}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2"><CheckCircle size={13} style={{color:G2}}/> Compradores cerrados ({compradores.length})</h3>
                <span className="text-xs font-black" style={{color:G2}}>{fmtCOP(ingresosTotal)}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {compradores.slice(0,6).map(c=>(
                  <div key={c.id} className="flex items-center gap-2.5 p-2.5 rounded-xl"
                    style={{background:'rgba(57,255,126,0.05)',border:'1px solid rgba(57,255,126,0.15)'}}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{background:'rgba(57,255,126,0.15)'}}>✓</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-white/90 truncate">{c.nombre}</p>
                      <p className="text-[9px] text-white/35">{PLAN_ICON[c.planInteres]} {PLAN_LABEL[c.planInteres]} · {fmt(c.valor)}</p>
                    </div>
                  </div>
                ))}
                {compradores.length===0 && <p className="text-[10px] text-white/25 col-span-3 py-2">Sin ventas cerradas aún</p>}
              </div>
            </div>
          </>
        )}

        {/* ══════════════════ CONTACTOS ══════════════════ */}
        {tab==='contactos' && (
          <>
            {/* Header + filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2"><Users size={14} style={{color:G2}}/> Contactos CRM</h2>
                <p className="text-[10px] text-white/30">{filteredContacts.length} de {contacts.length} contactos</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={openNew}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs transition-all hover:scale-105"
                  style={{background:'linear-gradient(135deg,#39ff7e,#16a34a)',color:'black',boxShadow:'0 0 14px rgba(57,255,126,0.4)'}}>
                  <Plus size={11}/> Nuevo
                </button>
                <button onClick={exportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                  style={{background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.55)',border:'1px solid rgba(255,255,255,0.1)'}}>
                  <Download size={11}/> CSV
                </button>
              </div>
            </div>

            {/* Search + filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-48">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'rgba(232,121,249,0.5)'}}/>
                <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Buscar nombre, empresa, ciudad…"
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-white placeholder:text-white/25 outline-none"
                  style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(232,121,249,0.15)'}}/>
              </div>
              <select value={estadoFilter} onChange={e=>setEstadoFilter(e.target.value as ContactoEstado|'all')}
                className="px-3 py-2 rounded-xl text-xs text-white outline-none"
                style={{background:'rgba(20,5,35,0.95)',border:'1px solid rgba(232,121,249,0.2)'}}>
                <option value="all">Todos los estados</option>
                {Object.entries(ESTADO_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={planFilter} onChange={e=>setPlanFilter(e.target.value as PlanId|'all')}
                className="px-3 py-2 rounded-xl text-xs text-white outline-none"
                style={{background:'rgba(20,5,35,0.95)',border:'1px solid rgba(232,121,249,0.2)'}}>
                <option value="all">Todos los planes</option>
                {(['basico','pro','premium','platino'] as PlanId[]).map(p=><option key={p} value={p}>{PLAN_LABEL[p]}</option>)}
              </select>
            </div>

            {/* Contact list */}
            <div className="space-y-2">
              {filteredContacts.length===0 ? (
                <div className="rounded-2xl p-10 text-center" style={{background:'rgba(232,121,249,0.03)',border:'1px solid rgba(232,121,249,0.10)'}}>
                  <Users size={28} className="mx-auto mb-3" style={{color:'rgba(232,121,249,0.3)'}}/>
                  <p className="text-sm text-white/30 mb-3">{contacts.length===0?'No hay contactos. Crea el primero.':'No hay contactos con estos filtros.'}</p>
                  <button onClick={openNew} className="px-4 py-2 rounded-xl text-xs font-black text-white"
                    style={{background:'linear-gradient(135deg,#e879f9,#a855f7)'}}>
                    <Plus size={11} className="inline mr-1"/>Nuevo contacto
                  </button>
                </div>
              ) : filteredContacts.map(c=>{
                const cfg = ESTADO_CONFIG[c.estado];
                return (
                  <div key={c.id} className="rounded-2xl p-3 sm:p-4 group transition-all hover:scale-[1.005]"
                    style={{background:'rgba(5,0,20,0.85)',border:'1px solid rgba(255,255,255,0.07)'}}>
                    <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                        style={{background:cfg.bg,color:cfg.c,border:`1px solid ${cfg.c}30`}}>
                        {c.nombre[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-black text-white">{c.nombre}</span>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{background:cfg.bg,color:cfg.c,border:`1px solid ${cfg.c}30`}}>{cfg.label}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{background:`rgba(255,255,255,0.06)`,color:PLAN_COLOR[c.planInteres]}}>{PLAN_ICON[c.planInteres]} {PLAN_LABEL[c.planInteres]}</span>
                          <span className="text-[9px] font-black text-white/60">{fmt(c.valor)}/mes</span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap text-[10px] text-white/40">
                          {c.empresa && <span className="flex items-center gap-1"><Building2 size={9}/>{c.empresa}</span>}
                          {c.ciudad && <span className="flex items-center gap-1"><Map size={9}/>{c.ciudad}</span>}
                          {c.phone && <span className="flex items-center gap-1"><Phone size={9}/>{c.phone}</span>}
                          {c.email && <span className="flex items-center gap-1"><Mail size={9}/>{c.email}</span>}
                          {c.seguimiento && <span className="flex items-center gap-1"><Calendar size={9}/>{c.seguimiento}</span>}
                        </div>
                        {c.notas && <p className="text-[9px] text-white/30 mt-1 leading-relaxed line-clamp-2">{c.notas}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <select value={c.estado} onChange={e=>updateEstado(c.id,e.target.value as ContactoEstado)}
                          className="text-[9px] px-2 py-1 rounded-lg outline-none cursor-pointer"
                          style={{background:'rgba(20,5,35,0.95)',border:'1px solid rgba(255,255,255,0.1)',color:cfg.c}}>
                          {Object.entries(ESTADO_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <button onClick={()=>openEdit(c)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40"><Edit3 size={12}/></button>
                        <button onClick={()=>deleteContact(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors" style={{color:'rgba(248,113,113,0.5)'}}><Trash2 size={12}/></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ══════════════════ METAS ══════════════════ */}
        {tab==='metas' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2"><Award size={14} style={{color:'#fbbf24'}}/> Metas de Ventas</h2>
                <p className="text-[10px] text-white/30">Objetivos mensuales · trimestrales · anuales</p>
              </div>
              <button onClick={()=>setEditMetas(!editMetas)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.3)',color:'#fbbf24'}}>
                <Settings size={11}/> {editMetas?'Cancelar':'Editar metas'}
              </button>
            </div>

            {editMetas && (
              <div className="rounded-2xl p-4 space-y-3" style={{background:'rgba(251,191,36,0.05)',border:'1px solid rgba(251,191,36,0.2)'}}>
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Configurar metas</h3>
                {[['mensual','Meta mensual','$2.000.000'],['trimestral','Meta trimestral','$6.000.000'],['anual','Meta anual','$24.000.000']].map(([k,l,ph])=>(
                  <div key={k}>
                    <label className="text-[10px] font-bold text-white/40 block mb-1">{l}</label>
                    <input type="number" value={(metasForm as Record<string,number>)[k]} onChange={e=>setMetasForm(f=>({...f,[k]:Number(e.target.value)}))}
                      placeholder={ph} className="w-full px-3 py-2 rounded-xl text-xs text-white outline-none"
                      style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(251,191,36,0.25)'}}/>
                  </div>
                ))}
                <button onClick={saveMetas2} className="px-4 py-2 rounded-xl text-xs font-black text-black transition-all hover:opacity-90"
                  style={{background:'linear-gradient(135deg,#fbbf24,#f59e0b)'}}>Guardar metas</button>
              </div>
            )}

            {/* Progress cards */}
            {[
              {label:'Meta mensual',     target:metas.mensual,     actual:ingresosTotal,    c:'#fbbf24',g:'251,191,36',periodo:'Este mes'},
              {label:'Meta trimestral',  target:metas.trimestral,  actual:ingresosTotal*2.5, c:'#e879f9',g:'232,121,249',periodo:'Este trimestre'},
              {label:'Meta anual',       target:metas.anual,       actual:ingresosTotal*8,   c:'#00c8ff',g:'0,200,255',periodo:'Este año'},
            ].map(m=>{
              const pct=Math.min(100,Math.round(m.actual/m.target*100));
              return (
                <div key={m.label} className="rounded-2xl p-5" style={{background:`rgba(${m.g},0.05)`,border:`1px solid rgba(${m.g},0.18)`}}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-black text-white">{m.label}</h3>
                      <p className="text-[10px] text-white/40">{m.periodo}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black" style={{color:m.c,textShadow:`0 0 16px rgba(${m.g},0.5)`}}>{pct}%</div>
                      <div className="text-[9px] text-white/35">{fmtCOP(m.actual)} de {fmtCOP(m.target)}</div>
                    </div>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.06)'}}>
                    <div className="h-full rounded-full transition-all duration-1000 relative"
                      style={{width:`${pct}%`,background:`linear-gradient(90deg,${m.c},${m.c}88)`,boxShadow:`0 0 10px rgba(${m.g},0.6)`}}>
                      <div className="absolute right-0 top-0 bottom-0 w-2 rounded-full" style={{background:'rgba(255,255,255,0.6)'}}/>
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] mt-2 text-white/30">
                    <span>Restante: {fmtCOP(Math.max(0,m.target-m.actual))}</span>
                    <span style={{color:pct>=100?G2:m.c}}>{pct>=100?'✓ Meta alcanzada':pct>=75?'Muy cerca 🔥':pct>=50?'En camino':'Acelerar'}</span>
                  </div>
                </div>
              );
            })}

            {/* Proyección */}
            <div className="rounded-2xl p-4" style={{background:'rgba(5,0,20,0.9)',border:'1px solid rgba(57,255,126,0.15)'}}>
              <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2"><TrendingUp size={13} style={{color:G2}}/> Proyección de ingresos 6 meses</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={MES_DATA} margin={{top:5,right:10,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="m" tick={{fill:'rgba(255,255,255,0.35)',fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:'rgba(255,255,255,0.25)',fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000000}M`}/>
                  <RTooltip contentStyle={{background:'#100022',border:'1px solid rgba(57,255,126,0.3)',borderRadius:12,fontSize:11}} formatter={(v:number)=>[fmtCOP(v)]}/>
                  <Bar dataKey="meta" name="Meta" fill="rgba(255,255,255,0.06)" radius={[4,4,0,0]}/>
                  <Bar dataKey="ing" name="Ingresos" fill="#39ff7e" radius={[4,4,0,0]}>
                    {MES_DATA.map((_,i)=><Cell key={i} fill={_['ing']>=_['meta']?'#39ff7e':'#e879f9'}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* ══════════════════ COMISIONES ══════════════════ */}
        {tab==='comisiones' && (
          <>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2"><DollarSign size={14} style={{color:'#ff9a3c'}}/> Comisiones & Compensación</h2>
              <p className="text-[10px] text-white/30">Calculadora de comisiones · Historial · Proyección</p>
            </div>

            {/* Tasa + KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5" style={{background:'rgba(255,154,60,0.06)',border:'1px solid rgba(255,154,60,0.22)'}}>
                <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2"><Percent size={13} style={{color:'#ff9a3c'}}/> Tasa de comisión</h3>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-4xl font-black" style={{color:'#ff9a3c',textShadow:'0 0 20px rgba(255,154,60,0.6)'}}>{tasaComision}%</span>
                  <div className="flex-1">
                    <input type="range" min="5" max="25" step="1" value={tasaComision} onChange={e=>setTasaComision(Number(e.target.value))}
                      className="w-full accent-orange-400"/>
                    <div className="flex justify-between text-[8px] text-white/25 mt-1"><span>5%</span><span>25%</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {l:'Por venta básico',  v:fmtCOP(0),           c:'#94a3b8'},
                    {l:'Por venta PRO',     v:fmtCOP(89000*tasaComision/100), c:'#00f5d4'},
                    {l:'Por venta Premium', v:fmtCOP(189000*tasaComision/100), c:'#fbbf24'},
                    {l:'Por venta Platino', v:fmtCOP(349000*tasaComision/100), c:'#cd7f32'},
                  ].map(x=>(
                    <div key={x.l} className="p-2 rounded-xl" style={{background:'rgba(255,255,255,0.03)'}}>
                      <div className="text-sm font-black" style={{color:x.c}}>{x.v}</div>
                      <div className="text-[8px] text-white/30">{x.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{background:'rgba(232,121,249,0.05)',border:'1px solid rgba(232,121,249,0.18)'}}>
                <h3 className="text-sm font-black text-white mb-3">Resumen de comisiones</h3>
                <div className="space-y-3">
                  {[
                    {l:'Comisión este mes',    v:fmtCOP(ingresosTotal*tasaComision/100),     c:G,  sub:'Basado en ventas cerradas'},
                    {l:'Comisión estimada mes',v:fmtCOP(metas.mensual*tasaComision/100),     c:B,  sub:'Si alcanzas la meta mensual'},
                    {l:'Comisión trimestral',  v:fmtCOP(metas.trimestral*tasaComision/100),  c:'#fbbf24', sub:'Si alcanzas la meta Q'},
                    {l:'Comisión anual',       v:fmtCOP(metas.anual*tasaComision/100),       c:'#ff9a3c', sub:'Proyección a 12 meses'},
                  ].map(x=>(
                    <div key={x.l} className="flex items-center justify-between p-2.5 rounded-xl" style={{background:'rgba(255,255,255,0.03)'}}>
                      <div>
                        <div className="text-[10px] font-black text-white">{x.l}</div>
                        <div className="text-[8px] text-white/30">{x.sub}</div>
                      </div>
                      <div className="text-base font-black" style={{color:x.c}}>{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comisión por contacto */}
            {compradores.length > 0 && (
              <div className="rounded-2xl p-4" style={{background:'rgba(5,0,20,0.9)',border:'1px solid rgba(255,255,255,0.07)'}}>
                <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2"><Award size={13} style={{color:G2}}/> Comisiones por venta cerrada</h3>
                <div className="space-y-2">
                  {compradores.map(c=>(
                    <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{background:'rgba(57,255,126,0.04)',border:'1px solid rgba(57,255,126,0.10)'}}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{background:'rgba(57,255,126,0.12)'}}>✓</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-white/85 truncate">{c.nombre}</p>
                        <p className="text-[9px] text-white/35">{c.empresa} · {PLAN_ICON[c.planInteres]} {PLAN_LABEL[c.planInteres]}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-black" style={{color:G2}}>{fmtCOP(c.valor*tasaComision/100)}</div>
                        <div className="text-[8px] text-white/30">comisión ({tasaComision}%)</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 rounded-xl mt-2" style={{background:'rgba(57,255,126,0.08)',border:'1px solid rgba(57,255,126,0.2)'}}>
                    <span className="text-xs font-black text-white">Total comisiones</span>
                    <span className="text-base font-black" style={{color:G2}}>{fmtCOP(comisionTotal)}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════════════ PRODUCTOS ══════════════════ */}
        {tab==='productos' && (
          <>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2"><Package size={14} style={{color:'#a855f7'}}/> Guía de Productos CIVAC</h2>
              <p className="text-[10px] text-white/30">Módulos · precios · objeciones · argumentos de venta</p>
            </div>

            {/* Plan selector */}
            <div className="flex gap-2 flex-wrap">
              {PLANES_DOCS.map(p=>(
                <button key={p.id} onClick={()=>setActivePlan(activePlan===p.id as PlanId?null:p.id as PlanId)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all duration-300 hover:scale-[1.03]"
                  style={activePlan===p.id as PlanId
                    ?{background:`linear-gradient(135deg,${p.c1},${p.c2})`,color:'#000',boxShadow:`0 0 20px rgba(${p.g},0.5)`}
                    :{background:`rgba(${p.g},0.08)`,color:p.c1,border:`1px solid rgba(${p.g},0.3)`}}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            {/* Plan detail */}
            {PLANES_DOCS.filter(p=>!activePlan||p.id===activePlan).map(p=>(
              <div key={p.id} className="rounded-2xl overflow-hidden" style={{border:`1px solid rgba(${p.g},0.25)`}}>
                <div className="h-1" style={{background:`linear-gradient(90deg,${p.c1},${p.c2})`}}/>
                <div className="p-5 space-y-4" style={{background:'rgba(5,0,20,0.9)'}}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{p.icon}</span>
                        <h3 className="text-lg font-black text-white">{p.label}</h3>
                        <span className="text-sm font-black" style={{color:p.c1,textShadow:`0 0 10px rgba(${p.g},0.5)`}}>{p.precio}</span>
                      </div>
                      <p className="text-[10px] text-white/50 mb-1">{p.target}</p>
                      <p className="text-xs text-white/70 leading-relaxed max-w-lg" style={{color:p.c1}}>{p.pitch}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider mb-2" style={{color:p.c1}}>Módulos incluidos</h4>
                      <div className="space-y-1.5">
                        {p.modulos.map(m=>(
                          <div key={m} className="flex items-center gap-2 text-[11px] text-white/70">
                            <span className="w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-black"
                              style={{background:`rgba(${p.g},0.2)`,color:p.c1}}>✓</span>
                            {m}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider mb-2" style={{color:p.c1}}>Objeciones frecuentes</h4>
                      <div className="space-y-2">
                        {p.objecciones.map((o,i)=>(
                          <div key={i} className="rounded-xl p-3" style={{background:`rgba(${p.g},0.05)`,border:`1px solid rgba(${p.g},0.12)`}}>
                            <p className="text-[9px] font-black text-white/80 mb-1">❓ {o.obj}</p>
                            <p className="text-[9px] text-white/55 leading-relaxed">💡 {o.resp}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ══════════════════ REPORTES ══════════════════ */}
        {tab==='reportes' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2"><FileText size={14} style={{color:B}}/> Reportes Comerciales</h2>
                <p className="text-[10px] text-white/30">Analíticas · embudo · distribución por plan</p>
              </div>
              <button onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{background:'rgba(0,200,255,0.1)',border:'1px solid rgba(0,200,255,0.25)',color:B}}>
                <Download size={11}/> Exportar datos
              </button>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {l:'Tasa conversión',    v:`${contacts.length?Math.round(compradores.length/contacts.length*100):0}%`, c:G2,  sub:'Prospectos → Clientes'},
                {l:'Ticket promedio',    v:compradores.length?fmt(ingresosTotal/compradores.length):'$0', c:B,  sub:'Por venta cerrada'},
                {l:'Contactos activos',  v:pipeline.length,    c:G, sub:`${listaEspera.length} en lista espera`},
                {l:'Valor pipeline',     v:fmt(pipelineVal),   c:'#fbbf24', sub:'Potencial a cerrar'},
              ].map(k=>(
                <div key={k.l} className="rounded-2xl p-4 text-center" style={{background:'rgba(5,0,20,0.85)',border:`1px solid ${k.c}20`}}>
                  <div className="text-2xl font-black mb-1" style={{color:k.c,textShadow:`0 0 14px ${k.c}55`}}>{k.v}</div>
                  <div className="text-[10px] font-bold text-white/60">{k.l}</div>
                  <div className="text-[8px] text-white/25">{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Estado pie */}
              <div className="rounded-2xl p-4" style={{background:'rgba(5,0,20,0.85)',border:'1px solid rgba(232,121,249,0.15)'}}>
                <h3 className="text-sm font-black text-white mb-4">Distribución por estado</h3>
                {contacts.length>0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                          {pieData.map((entry,i)=><Cell key={i} fill={entry.fill}/>)}
                        </Pie>
                        <RTooltip contentStyle={{background:'#100022',border:'1px solid rgba(232,121,249,0.3)',borderRadius:12,fontSize:11}}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      {pieData.map(d=>(
                        <div key={d.name} className="flex items-center gap-1.5 text-[9px] text-white/50">
                          <div className="w-2 h-2 rounded-full" style={{background:d.fill}}/>
                          {d.name} ({d.value})
                        </div>
                      ))}
                    </div>
                  </>
                ) : <p className="text-center text-white/25 text-[10px] py-12">Sin datos</p>}
              </div>

              {/* Plan pie */}
              <div className="rounded-2xl p-4" style={{background:'rgba(5,0,20,0.85)',border:'1px solid rgba(0,200,255,0.15)'}}>
                <h3 className="text-sm font-black text-white mb-4">Ventas por plan</h3>
                {compradores.length>0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={planPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                          {planPieData.map((entry,i)=><Cell key={i} fill={entry.fill}/>)}
                        </Pie>
                        <RTooltip contentStyle={{background:'#100022',border:'1px solid rgba(0,200,255,0.3)',borderRadius:12,fontSize:11}}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      {planPieData.map(d=>(
                        <div key={d.name} className="flex items-center gap-1.5 text-[9px] text-white/50">
                          <div className="w-2 h-2 rounded-full" style={{background:d.fill}}/>
                          {d.name} ({d.value})
                        </div>
                      ))}
                    </div>
                  </>
                ) : <p className="text-center text-white/25 text-[10px] py-12">Sin ventas cerradas</p>}
              </div>
            </div>

            {/* Embudo visual */}
            <div className="rounded-2xl p-5" style={{background:'rgba(5,0,20,0.9)',border:'1px solid rgba(255,255,255,0.07)'}}>
              <h3 className="text-sm font-black text-white mb-4">Embudo de conversión</h3>
              <div className="space-y-2">
                {Object.entries(ESTADO_CONFIG).filter(([k])=>k!=='no_interesado').sort((a,b)=>a[1].orden-b[1].orden).map(([estado,cfg])=>{
                  const count = contacts.filter(c=>c.estado===estado).length;
                  const pct = contacts.length ? Math.round(count/contacts.length*100) : 0;
                  return (
                    <div key={estado} className="flex items-center gap-3">
                      <div className="w-28 text-[10px] font-bold flex-shrink-0" style={{color:cfg.c}}>{cfg.label}</div>
                      <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{background:'rgba(255,255,255,0.04)'}}>
                        <div className="h-full rounded-lg transition-all duration-700 flex items-center px-2"
                          style={{width:`${Math.max(pct,4)}%`,background:`linear-gradient(90deg,${cfg.c}40,${cfg.c}20)`,border:`1px solid ${cfg.c}30`}}>
                          <span className="text-[9px] font-black" style={{color:cfg.c}}>{count}</span>
                        </div>
                      </div>
                      <div className="w-10 text-right text-[9px] text-white/35 flex-shrink-0">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>

      {/* ── Modal nuevo/editar contacto ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.92)',backdropFilter:'blur(12px)'}}>
          <div className="w-full max-w-lg rounded-3xl overflow-hidden" style={{background:'linear-gradient(145deg,#0a0020,#120030)',border:'1px solid rgba(232,121,249,0.3)',boxShadow:'0 0 80px rgba(232,121,249,0.1)'}}>
            <div className="h-1" style={{background:'linear-gradient(90deg,#e879f9,#a855f7,#00c8ff)'}}/>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black text-white">{editContact?'Editar contacto':'Nuevo contacto'}</h3>
                <button onClick={()=>setShowForm(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40"><X size={16}/></button>
              </div>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3">
                  {[['nombre','Nombre completo *','Ej: Juan Pérez'],['empresa','Empresa','Finca La Victoria']].map(([k,l,ph])=>(
                    <div key={k} className={k==='nombre'?'col-span-2':''}>
                      <label className="text-[9px] font-bold text-white/40 uppercase tracking-wider block mb-1">{l}</label>
                      <input value={(formData as Record<string,string>)[k]} onChange={e=>setFormData(f=>({...f,[k]:e.target.value}))} placeholder={ph}
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none"
                        style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(232,121,249,0.2)'}}/>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[['cargo','Cargo','Propietario'],['ciudad','Ciudad','Bogotá, Colombia']].map(([k,l,ph])=>(
                    <div key={k}>
                      <label className="text-[9px] font-bold text-white/40 uppercase tracking-wider block mb-1">{l}</label>
                      <input value={(formData as Record<string,string>)[k]} onChange={e=>setFormData(f=>({...f,[k]:e.target.value}))} placeholder={ph}
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none"
                        style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(232,121,249,0.2)'}}/>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[['phone','Teléfono','3001234567'],['email','Email','ganadero@finca.co']].map(([k,l,ph])=>(
                    <div key={k}>
                      <label className="text-[9px] font-bold text-white/40 uppercase tracking-wider block mb-1">{l}</label>
                      <input value={(formData as Record<string,string>)[k]} onChange={e=>setFormData(f=>({...f,[k]:e.target.value}))} placeholder={ph}
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none"
                        style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(232,121,249,0.2)'}}/>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-wider block mb-1">Estado</label>
                    <select value={formData.estado} onChange={e=>setFormData(f=>({...f,estado:e.target.value as ContactoEstado}))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                      style={{background:'rgba(20,5,35,0.95)',border:'1px solid rgba(232,121,249,0.2)'}}>
                      {Object.entries(ESTADO_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-wider block mb-1">Plan de interés</label>
                    <select value={formData.planInteres} onChange={e=>setFormData(f=>({...f,planInteres:e.target.value as PlanId,valor:PLAN_PRECIOS[e.target.value as PlanId]}))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                      style={{background:'rgba(20,5,35,0.95)',border:'1px solid rgba(232,121,249,0.2)'}}>
                      {(['basico','pro','premium','platino'] as PlanId[]).map(p=><option key={p} value={p}>{PLAN_ICON[p]} {PLAN_LABEL[p]}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-wider block mb-1">Valor/mes (COP)</label>
                    <input type="number" value={formData.valor} onChange={e=>setFormData(f=>({...f,valor:Number(e.target.value)}))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                      style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(232,121,249,0.2)'}}/>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-wider block mb-1">Seguimiento</label>
                    <input type="date" value={formData.seguimiento} onChange={e=>setFormData(f=>({...f,seguimiento:e.target.value}))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                      style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(232,121,249,0.2)'}}/>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-white/40 uppercase tracking-wider block mb-1">Notas</label>
                  <textarea value={formData.notas} onChange={e=>setFormData(f=>({...f,notas:e.target.value}))} rows={2}
                    placeholder="Observaciones, detalles de la conversación…"
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none resize-none"
                    style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(232,121,249,0.2)'}}/>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={()=>setShowForm(false)} className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all"
                  style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.1)'}}>
                  Cancelar
                </button>
                <button onClick={saveContact} disabled={!formData.nombre.trim()}
                  className="flex-1 py-3 rounded-2xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-40"
                  style={{background:'linear-gradient(135deg,#e879f9,#a855f7)',boxShadow:'0 0 20px rgba(232,121,249,0.4)'}}>
                  {editContact?'Guardar cambios':'Crear contacto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
