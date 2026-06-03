import { useState, useEffect } from "react";
import { useAuth, PLAN_COLOR, PLAN_GLOW, PLAN_ICON, PLAN_LABEL, type PlanId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Users, DollarSign, Target, Plus, Search, Filter,
  Phone, Mail, Building2, Calendar, ChevronRight, Edit3, Trash2,
  Download, Printer, Send, Star, Clock, CheckCircle, XCircle,
  AlertCircle, BarChart2, FileText, PieChart, RefreshCw, Eye,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RPie, Pie, Cell } from "recharts";
import { printModule } from "@/lib/print";
import { downloadCSV } from "@/lib/export";

type ContactoEstado = 'prospecto' | 'contactado' | 'demo' | 'negociando' | 'comprador' | 'lista_espera' | 'no_interesado';
type ContactoTipo   = 'finca_familiar' | 'pyme' | 'corporativo';

interface Contacto {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  empresa: string;
  tipo: ContactoTipo;
  estado: ContactoEstado;
  planInteres: PlanId;
  fecha: string;
  notas: string;
  valor: number;
  seguimiento: string;
}

const ESTADO_CFG: Record<ContactoEstado, { label: string; color: string; glow: string; icon: string }> = {
  prospecto:       { label: 'Prospecto',      color: '#94a3b8', glow: '148,163,184', icon: '🔵' },
  contactado:      { label: 'Contactado',     color: '#00c8ff', glow: '0,200,255',   icon: '📞' },
  demo:            { label: 'Demo',           color: '#a855f7', glow: '168,85,247',  icon: '🖥️' },
  negociando:      { label: 'Negociando',     color: '#fbbf24', glow: '251,191,36',  icon: '🤝' },
  comprador:       { label: 'Comprador ✓',    color: '#39ff7e', glow: '57,255,126',  icon: '✅' },
  lista_espera:    { label: 'Lista Espera',   color: '#ff9a3c', glow: '255,154,60',  icon: '⏳' },
  no_interesado:   { label: 'No Interesado',  color: '#ff4d6d', glow: '255,77,109',  icon: '❌' },
};

const TIPO_CFG: Record<ContactoTipo, { label: string; emoji: string }> = {
  finca_familiar: { label: 'Finca Familiar',  emoji: '🏡' },
  pyme:           { label: 'PYME Ganadera',   emoji: '🐄' },
  corporativo:    { label: 'Corporativo',     emoji: '🏢' },
};

const SEED: Contacto[] = [
  { id:'c1', nombre:'Carlos Morales',    telefono:'316 555 0101', email:'carlos@fincalaspalmas.co',   empresa:'Finca Las Palmas',       tipo:'finca_familiar', estado:'comprador',    planInteres:'pro',     fecha:'2026-05-20', notas:'Compró plan PRO. Muy satisfecho.', valor:89000,  seguimiento:'2026-06-20' },
  { id:'c2', nombre:'Inversiones Bovinas', telefono:'300 444 9900', email:'gerencia@invbovinas.co',  empresa:'Inversiones Bovinas SAS', tipo:'corporativo',    estado:'negociando',   planInteres:'platino', fecha:'2026-05-22', notas:'Interesados en plan Platino para 3 fincas.', valor:399000, seguimiento:'2026-05-30' },
  { id:'c3', nombre:'Ana Lucía Torres',  telefono:'312 333 7788', email:'ana@ganaderiatorres.co',     empresa:'Ganadería Torres',        tipo:'pyme',           estado:'demo',         planInteres:'premium', fecha:'2026-05-23', notas:'Demo programada para viernes.', valor:189000, seguimiento:'2026-05-28' },
  { id:'c4', nombre:'Pedro Cifuentes',   telefono:'315 221 6634', email:'pedro@cifuentes.co',         empresa:'Finca El Palmar',         tipo:'finca_familiar', estado:'contactado',   planInteres:'pro',     fecha:'2026-05-24', notas:'Llamada inicial, mostrando interés.', valor:89000, seguimiento:'2026-05-27' },
  { id:'c5', nombre:'AgroCorp Ltda',     telefono:'601 800 2200', email:'compras@agrocorp.co',        empresa:'AgroCorp Ltda',           tipo:'corporativo',    estado:'prospecto',    planInteres:'platino', fecha:'2026-05-25', notas:'Empresa grande, 50+ bovinos.', valor:399000, seguimiento:'2026-06-01' },
  { id:'c6', nombre:'Beatriz Ospina',    telefono:'318 667 1122', email:'beatriz@fincaluna.co',       empresa:'Finca Luna Nueva',        tipo:'finca_familiar', estado:'lista_espera', planInteres:'basico',  fecha:'2026-05-18', notas:'En lista de espera para plan básico.', valor:0, seguimiento:'2026-06-15' },
  { id:'c7', nombre:'Rodrigo Vargas',    telefono:'310 990 4433', email:'rodrigo@lecheriavargas.co',  empresa:'Lechería Vargas',         tipo:'pyme',           estado:'no_interesado',planInteres:'pro',     fecha:'2026-05-15', notas:'No le interesa por ahora. Volver en 3 meses.', valor:0, seguimiento:'2026-08-15' },
  { id:'c8', nombre:'Sandra Ríos',       telefono:'313 114 5566', email:'sandra@riosganadera.co',     empresa:'Ríos Ganadera',           tipo:'pyme',           estado:'comprador',    planInteres:'premium', fecha:'2026-05-10', notas:'Compró plan Premium. Excelente cliente.', valor:189000, seguimiento:'2026-06-10' },
];

function loadContacts(): Contacto[] {
  try { const s = localStorage.getItem('civac_crm_contacts'); return s ? JSON.parse(s) : SEED; } catch { return SEED; }
}
function saveContacts(c: Contacto[]) { try { localStorage.setItem('civac_crm_contacts', JSON.stringify(c)); } catch {} }

const fmt = (n: number) => `$${(n/1000).toFixed(0)}k`;
const fmtCOP = (n: number) => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(n);

type Tab = 'contactos' | 'pipeline' | 'reportes' | 'contabilidad';

const PIPELINE_STAGES: ContactoEstado[] = ['prospecto','contactado','demo','negociando','comprador'];

export default function Ventas() {
  const { user } = useAuth();
  const [contactos, setContactos] = useState<Contacto[]>(loadContacts);
  const [tab, setTab] = useState<Tab>('contactos');
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<ContactoEstado|'all'>('all');
  const [filterPlan, setFilterPlan] = useState<PlanId|'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [reportDate] = useState(new Date().toISOString().slice(0,10));

  const [form, setForm] = useState<Partial<Contacto>>({
    nombre:'', telefono:'', email:'', empresa:'', tipo:'finca_familiar',
    estado:'prospecto', planInteres:'pro', notas:'', valor:89000, seguimiento:'',
  });

  useEffect(() => { saveContacts(contactos); }, [contactos]);

  const save = () => {
    if (!form.nombre?.trim()) return;
    if (editId) {
      setContactos(cs => cs.map(c => c.id===editId ? {...c,...form} as Contacto : c));
    } else {
      const nuevo: Contacto = { id:`c${Date.now()}`, fecha:new Date().toISOString().slice(0,10), ...form } as Contacto;
      setContactos(cs => [nuevo, ...cs]);
    }
    setShowModal(false); setEditId(null);
    setForm({ nombre:'', telefono:'', email:'', empresa:'', tipo:'finca_familiar', estado:'prospecto', planInteres:'pro', notas:'', valor:89000, seguimiento:'' });
  };

  const del = (id: string) => { if (confirm('¿Eliminar contacto?')) setContactos(cs=>cs.filter(c=>c.id!==id)); };
  const edit = (c: Contacto) => { setForm(c); setEditId(c.id); setShowModal(true); };

  const filtered = contactos.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.nombre.toLowerCase().includes(q) || c.empresa.toLowerCase().includes(q) || c.telefono.includes(q);
    const matchE = filterEstado==='all' || c.estado===filterEstado;
    const matchP = filterPlan==='all' || c.planInteres===filterPlan;
    return matchQ && matchE && matchP;
  });

  const compradores     = contactos.filter(c=>c.estado==='comprador');
  const pipeline        = contactos.filter(c=>!['comprador','no_interesado'].includes(c.estado));
  const pipelineTotal   = pipeline.reduce((s,c)=>s+c.valor,0);
  const ingresosTotal   = compradores.reduce((s,c)=>s+c.valor,0);
  const conversionRate  = contactos.length ? Math.round(compradores.length/contactos.length*100) : 0;
  const hoy             = new Date().toISOString().slice(0,10);
  const hoyContacts     = contactos.filter(c=>c.fecha===hoy);

  const kpis = [
    { label:'Total Contactos',  val: contactos.length, sub:'en CRM',        icon:<Users size={16}/>,     from:'#e879f9',to:'#a855f7', glow:'232,121,249' },
    { label:'Ventas Cerradas',  val: compradores.length,sub:'compradores',   icon:<CheckCircle size={16}/>,from:'#39ff7e',to:'#00c850',glow:'57,255,126'   },
    { label:'Pipeline',         val: fmt(pipelineTotal),sub:'COP activo',    icon:<TrendingUp size={16}/>, from:'#fbbf24',to:'#f97316', glow:'251,191,36'  },
    { label:'Conversión',       val:`${conversionRate}%`,sub:'tasa de cierre',icon:<Target size={16}/>,   from:'#00c8ff',to:'#0ea5e9', glow:'0,200,255'   },
  ];

  const chartData = (['basico','pro','premium','platino'] as PlanId[]).map(p => ({
    plan: PLAN_LABEL[p],
    contactos: contactos.filter(c=>c.planInteres===p).length,
    ventas: compradores.filter(c=>c.planInteres===p).length,
  }));

  const pieData = Object.entries(TIPO_CFG).map(([k,v]) => ({
    name: v.label, value: contactos.filter(c=>c.tipo===k).length,
  }));
  const pieColors = ['#e879f9','#00f5d4','#fbbf24'];

  const exportCSV = () => downloadCSV(contactos.map(c=>({
    Nombre:c.nombre, Empresa:c.empresa, Telefono:c.telefono, Email:c.email,
    Tipo:TIPO_CFG[c.tipo].label, Estado:ESTADO_CFG[c.estado].label,
    Plan:PLAN_LABEL[c.planInteres], ValorCOP:c.valor, Fecha:c.fecha, Notas:c.notas,
  })), `CIVAC_CRM_${reportDate}`);

  const todayReport = () => {
    const cs = contactos.filter(c=>c.fecha===hoy || c.seguimiento===hoy);
    return { nuevos: contactos.filter(c=>c.fecha===hoy).length, seguimientos: cs.length, compradores: compradores.filter(c=>c.fecha===hoy).length, ingresos: compradores.filter(c=>c.fecha===hoy).reduce((s,c)=>s+c.valor,0) };
  };
  const dr = todayReport();

  return (
    <div id="ventas-module" className="space-y-4 sm:space-y-5 pb-8">
      {/* ── HERO BANNER ── */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
        style={{ background:'linear-gradient(135deg,#1a0030 0%,#2d0050 35%,#200040 70%,#160030 100%)', border:'1px solid rgba(232,121,249,0.22)', boxShadow:'0 0 50px rgba(232,121,249,0.08)' }}>
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(232,121,249,0.18),transparent 70%)'}}/>
        <div className="absolute -bottom-10 -left-8 w-48 h-48 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(168,85,247,0.12),transparent 70%)'}}/>
        <div className="h-0.5 w-full" style={{background:'linear-gradient(90deg,transparent,#e879f9,#a855f7,transparent)'}}/>
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white" style={{fontFamily:"'Sora',sans-serif"}}>
                  💼 Asesora de Ventas
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full hidden sm:flex items-center gap-1"
                  style={{background:'rgba(232,121,249,0.15)',color:'#e879f9',border:'1px solid rgba(232,121,249,0.35)'}}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{background:'#e879f9'}}/>
                  CRM LIVE
                </span>
              </div>
              <p className="text-white/50 text-xs sm:text-sm">Hola {user?.nombre?.split(' ')[0] ?? 'Asesora'} · Panel comercial CIVAC v7.0 · {new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'})}</p>
              <p className="text-[10px] mt-0.5" style={{color:'rgba(232,121,249,0.35)'}}>Pipeline · CRM · Reportes diarios · Contabilidad de ventas</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={()=>{setShowModal(true);setEditId(null);}}
                className="gap-1.5 font-bold text-xs"
                style={{background:'linear-gradient(135deg,#e879f9,#a855f7)',color:'white',boxShadow:'0 0 16px rgba(232,121,249,0.4)',border:'none'}}>
                <Plus size={13}/> Nuevo Contacto
              </Button>
              <Button size="sm" onClick={exportCSV}
                className="gap-1 text-xs"
                style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.65)',border:'1px solid rgba(255,255,255,0.12)'}}>
                <Download size={12}/> CSV
              </Button>
              <Button size="sm" onClick={()=>printModule('CRM Ventas CIVAC','Reporte módulo asesora')}
                className="gap-1 text-xs"
                style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.65)',border:'1px solid rgba(255,255,255,0.12)'}}>
                <Printer size={12}/> PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k=>(
          <div key={k.label} className="relative rounded-2xl p-4 overflow-hidden"
            style={{background:`linear-gradient(145deg,rgba(${k.glow},0.08),rgba(${k.glow},0.03))`,border:`1px solid rgba(${k.glow},0.22)`}}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(90deg,transparent,${k.from},${k.to},transparent)`}}/>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${k.from},${k.to})`,color:'black'}}>{k.icon}</div>
              <TrendingUp size={12} style={{color:`rgba(${k.glow},0.4)`}}/>
            </div>
            <p className="text-2xl font-black text-white">{k.val}</p>
            <p className="text-[10px] mt-0.5" style={{color:`rgba(${k.glow},0.65)`}}>{k.label}</p>
            <p className="text-[9px] text-white/25">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── HOY CARD ── */}
      <div className="rounded-2xl p-4" style={{background:'rgba(232,121,249,0.04)',border:'1px solid rgba(232,121,249,0.12)'}}>
        <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-3">📅 Resumen de hoy — {new Date().toLocaleDateString('es-CO')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {l:'Contactos nuevos', v:dr.nuevos,     e:'🆕', c:'#e879f9'},
            {l:'Seguimientos',     v:dr.seguimientos,e:'📞', c:'#00c8ff'},
            {l:'Ventas hoy',       v:dr.compradores, e:'✅', c:'#39ff7e'},
            {l:'Ingresos hoy',     v:dr.ingresos>0?fmtCOP(dr.ingresos):'$0', e:'💰', c:'#fbbf24'},
          ].map(x=>(
            <div key={x.l} className="text-center">
              <p className="text-2xl font-black" style={{color:x.c}}>{x.e} {x.v}</p>
              <p className="text-[9px] text-white/35">{x.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex overflow-x-auto gap-1 p-1 rounded-2xl" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
        {([['contactos','👥 Contactos'],['pipeline','📊 Pipeline'],['reportes','📋 Reportes'],['contabilidad','💰 Contabilidad']] as [Tab,string][]).map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)}
            className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
            style={tab===t?{background:'linear-gradient(135deg,rgba(232,121,249,0.18),rgba(168,85,247,0.12))',color:'#e879f9',border:'1px solid rgba(232,121,249,0.35)'}:{color:'rgba(255,255,255,0.4)',border:'1px solid transparent'}}>
            {l}
          </button>
        ))}
      </div>

      {/* ── TAB: CONTACTOS ── */}
      {tab==='contactos' && (
        <div className="space-y-3">
          {/* Search / filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'rgba(255,255,255,0.3)'}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Buscar por nombre, empresa, teléfono…"
                className="w-full pl-8 pr-4 py-2 rounded-xl text-xs text-white outline-none"
                style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)'}}/>
            </div>
            <select value={filterEstado} onChange={e=>setFilterEstado(e.target.value as ContactoEstado|'all')}
              className="px-3 py-2 rounded-xl text-xs text-white outline-none"
              style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)'}}>
              <option value="all">Todos los estados</option>
              {(Object.keys(ESTADO_CFG) as ContactoEstado[]).map(e=><option key={e} value={e}>{ESTADO_CFG[e].label}</option>)}
            </select>
            <select value={filterPlan} onChange={e=>setFilterPlan(e.target.value as PlanId|'all')}
              className="px-3 py-2 rounded-xl text-xs text-white outline-none"
              style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)'}}>
              <option value="all">Todos los planes</option>
              {(['basico','pro','premium','platino'] as PlanId[]).map(p=><option key={p} value={p}>{PLAN_LABEL[p]}</option>)}
            </select>
          </div>

          <p className="text-[10px] text-white/30">{filtered.length} contactos · ordenados por fecha más reciente</p>

          <div className="space-y-2">
            {filtered.map(c=>{
              const e = ESTADO_CFG[c.estado];
              const t = TIPO_CFG[c.tipo];
              return (
                <div key={c.id} className="rounded-2xl overflow-hidden"
                  style={{background:'rgba(255,255,255,0.03)',border:`1px solid rgba(${e.glow},0.18)`}}>
                  <div className="h-px w-full" style={{background:`linear-gradient(90deg,${e.color},transparent)`}}/>
                  <div className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                      style={{background:`rgba(${e.glow},0.12)`,border:`1px solid rgba(${e.glow},0.25)`}}>
                      {t.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-bold text-white text-sm">{c.nombre}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{background:`rgba(${e.glow},0.15)`,color:e.color,border:`1px solid rgba(${e.glow},0.3)`}}>
                          {e.icon} {e.label}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{background:`rgba(${PLAN_GLOW[c.planInteres]},0.12)`,color:PLAN_COLOR[c.planInteres],border:`1px solid rgba(${PLAN_GLOW[c.planInteres]},0.25)`}}>
                          {PLAN_ICON[c.planInteres]} {PLAN_LABEL[c.planInteres]}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/45">{c.empresa} · {t.label} · {c.telefono}</p>
                      {c.notas && <p className="text-[9px] text-white/30 mt-0.5 truncate">{c.notas}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {c.valor > 0 && <p className="text-xs font-black" style={{color:'#39ff7e'}}>{fmtCOP(c.valor)}</p>}
                      <p className="text-[9px] text-white/30">{c.fecha}</p>
                      <div className="flex gap-1">
                        <button onClick={()=>edit(c)} className="p-1 rounded-lg hover:bg-white/10 transition-colors"><Edit3 size={12} className="text-white/40"/></button>
                        <button onClick={()=>del(c.id)} className="p-1 rounded-lg hover:bg-rose-500/20 transition-colors"><Trash2 size={12} className="text-white/30 hover:text-rose-400"/></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: PIPELINE ── */}
      {tab==='pipeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {PIPELINE_STAGES.map(stage=>{
              const contacts = contactos.filter(c=>c.estado===stage);
              const e = ESTADO_CFG[stage];
              return (
                <div key={stage} className="rounded-2xl p-3" style={{background:`rgba(${e.glow},0.06)`,border:`1px solid rgba(${e.glow},0.18)`}}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-wider" style={{color:e.color}}>{e.label}</p>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{background:`rgba(${e.glow},0.2)`,color:e.color}}>{contacts.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {contacts.map(c=>(
                      <div key={c.id} className="p-2 rounded-xl" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
                        <p className="text-[10px] font-bold text-white/80 truncate">{c.nombre}</p>
                        <p className="text-[9px] text-white/35 truncate">{c.empresa}</p>
                        {c.valor>0 && <p className="text-[9px] font-black mt-0.5" style={{color:'#39ff7e'}}>{fmtCOP(c.valor)}</p>}
                      </div>
                    ))}
                    {contacts.length===0 && <p className="text-[9px] text-white/20 text-center py-2">Vacío</p>}
                  </div>
                  {contacts.length>0 && <p className="text-[9px] font-black text-center mt-2" style={{color:e.color}}>{fmtCOP(contacts.reduce((s,c)=>s+c.valor,0))}</p>}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl p-4" style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(232,121,249,0.15)'}}>
              <p className="text-xs font-black text-white mb-3 flex items-center gap-2"><BarChart2 size={13} style={{color:'#e879f9'}}/> Contactos por plan de interés</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{top:0,right:10,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="plan" tick={{fill:'rgba(255,255,255,0.4)',fontSize:10}}/>
                  <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#071325',border:'1px solid rgba(232,121,249,0.3)',borderRadius:12,fontSize:11}}/>
                  <Bar dataKey="contactos" name="Contactos" fill="#a855f7" radius={[4,4,0,0]}/>
                  <Bar dataKey="ventas" name="Ventas" fill="#39ff7e" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl p-4" style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(232,121,249,0.15)'}}>
              <p className="text-xs font-black text-white mb-3 flex items-center gap-2"><PieChart size={13} style={{color:'#e879f9'}}/> Tipo de cliente</p>
              <ResponsiveContainer width="100%" height={180}>
                <RPie margin={{top:0,right:0,bottom:0,left:0}}>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} style={{fontSize:9}}>
                    {pieData.map((_,i)=><Cell key={i} fill={pieColors[i]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{background:'#071325',border:'1px solid rgba(232,121,249,0.3)',borderRadius:12,fontSize:11}}/>
                </RPie>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: REPORTES ── */}
      {tab==='reportes' && (
        <div className="space-y-4">
          <div id="reporte-diario" className="rounded-2xl overflow-hidden" style={{background:'rgba(3,10,22,0.95)',border:'1px solid rgba(232,121,249,0.2)'}}>
            <div className="h-0.5" style={{background:'linear-gradient(90deg,#e879f9,#a855f7)'}}/>
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-black text-white">📋 Reporte Diario de Ventas</h2>
                  <p className="text-xs text-white/40 mt-0.5">CIVAC v7.0 · Asesora: {user?.nombre} · {new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={()=>printModule('Reporte Diario CRM','Reporte de ventas')}
                    className="gap-1 text-xs"
                    style={{background:'linear-gradient(135deg,#e879f9,#a855f7)',color:'white',border:'none'}}>
                    <Send size={11}/> Enviar al Jefe
                  </Button>
                  <Button size="sm" onClick={()=>printModule('Reporte Diario CRM','Reporte de ventas')}
                    className="gap-1 text-xs"
                    style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.1)'}}>
                    <Printer size={11}/> PDF
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  {l:'Nuevos contactos hoy', v:dr.nuevos,     c:'#e879f9'},
                  {l:'Seguimientos activos', v:dr.seguimientos,c:'#00c8ff'},
                  {l:'Ventas cerradas hoy',  v:dr.compradores, c:'#39ff7e'},
                  {l:'Ingresos hoy COP',     v:fmtCOP(dr.ingresos), c:'#fbbf24'},
                ].map(x=>(
                  <div key={x.l} className="text-center p-3 rounded-xl" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
                    <p className="text-xl font-black" style={{color:x.c}}>{x.v}</p>
                    <p className="text-[9px] text-white/35 mt-0.5">{x.l}</p>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-2">Compradores del período</p>
                <div className="space-y-1.5">
                  {compradores.slice(0,10).map(c=>(
                    <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{background:'rgba(57,255,126,0.05)',border:'1px solid rgba(57,255,126,0.15)'}}>
                      <div>
                        <p className="text-xs font-bold text-white">{c.nombre} — {c.empresa}</p>
                        <p className="text-[9px] text-white/40">{PLAN_ICON[c.planInteres]} Plan {PLAN_LABEL[c.planInteres]} · {c.fecha}</p>
                      </div>
                      <p className="font-black text-sm" style={{color:'#39ff7e'}}>{fmtCOP(c.valor)}</p>
                    </div>
                  ))}
                  {compradores.length===0 && <p className="text-[11px] text-white/30 text-center py-4">Sin compradores registrados aún</p>}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl" style={{background:'rgba(232,121,249,0.08)',border:'1px solid rgba(232,121,249,0.2)'}}>
                <div>
                  <p className="text-xs font-black text-white">Total acumulado</p>
                  <p className="text-[9px] text-white/40">Ingresos por ventas CIVAC</p>
                </div>
                <p className="text-2xl font-black" style={{color:'#e879f9'}}>{fmtCOP(ingresosTotal)}</p>
              </div>
            </div>
          </div>

          {/* Lista de espera */}
          <div className="rounded-2xl p-4" style={{background:'rgba(3,10,22,0.9)',border:'1px solid rgba(255,154,60,0.2)'}}>
            <p className="text-xs font-black text-white mb-3 flex items-center gap-2"><Clock size={13} style={{color:'#ff9a3c'}}/> Lista de Espera</p>
            <div className="space-y-1.5">
              {contactos.filter(c=>c.estado==='lista_espera').map(c=>(
                <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{background:'rgba(255,154,60,0.06)',border:'1px solid rgba(255,154,60,0.15)'}}>
                  <div>
                    <p className="text-xs font-bold text-white">{c.nombre}</p>
                    <p className="text-[9px] text-white/40">{c.empresa} · {PLAN_LABEL[c.planInteres]} · Seguimiento: {c.seguimiento}</p>
                  </div>
                  <button onClick={()=>edit(c)} className="text-[9px] px-2 py-1 rounded-lg font-bold" style={{background:'rgba(255,154,60,0.15)',color:'#ff9a3c',border:'1px solid rgba(255,154,60,0.25)'}}>Gestionar</button>
                </div>
              ))}
              {contactos.filter(c=>c.estado==='lista_espera').length===0 && <p className="text-[11px] text-white/30 text-center py-3">Sin contactos en lista de espera</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: CONTABILIDAD ── */}
      {tab==='contabilidad' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {l:'Ingresos totales',        v:fmtCOP(ingresosTotal),                    c:'#39ff7e', sub:'por ventas CIVAC'},
              {l:'Comisión estimada (10%)',  v:fmtCOP(ingresosTotal*0.10),               c:'#e879f9', sub:'tu comisión acumulada'},
              {l:'Meta mensual',            v:fmtCOP(2000000),                          c:'#fbbf24', sub:'objetivo: $2.000.000/mes'},
              {l:'Avance meta',             v:`${Math.min(100,Math.round(ingresosTotal/2000000*100))}%`,c:'#00c8ff', sub:`${fmtCOP(ingresosTotal)} de $2M`},
              {l:'Pipeline total',          v:fmtCOP(pipelineTotal),                    c:'#a855f7', sub:'en negociación activa'},
              {l:'Proyección mes',          v:fmtCOP(ingresosTotal+pipelineTotal*0.3),  c:'#ff9a3c', sub:'estimado con 30% pipeline'},
            ].map(x=>(
              <div key={x.l} className="p-4 rounded-2xl" style={{background:'rgba(255,255,255,0.03)',border:`1px solid rgba(0,0,0,0.3)`}}>
                <p className="text-xl font-black" style={{color:x.c}}>{x.v}</p>
                <p className="text-xs text-white/70 mt-0.5">{x.l}</p>
                <p className="text-[9px] text-white/30">{x.sub}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-4" style={{background:'rgba(3,10,22,0.9)',border:'1px solid rgba(232,121,249,0.15)'}}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-white flex items-center gap-2"><FileText size={13} style={{color:'#e879f9'}}/> Historial de ventas por plan</p>
              <Button size="sm" onClick={exportCSV} className="text-[9px] gap-1" style={{background:'rgba(232,121,249,0.1)',color:'#e879f9',border:'1px solid rgba(232,121,249,0.25)'}}>
                <Download size={10}/> Exportar
              </Button>
            </div>
            <div className="space-y-1.5">
              {(['basico','pro','premium','platino'] as PlanId[]).map(p=>{
                const ventas = compradores.filter(c=>c.planInteres===p);
                const total  = ventas.reduce((s,c)=>s+c.valor,0);
                const pct    = ingresosTotal>0 ? Math.round(total/ingresosTotal*100) : 0;
                return (
                  <div key={p} className="flex items-center gap-3 p-2.5 rounded-xl" style={{background:'rgba(255,255,255,0.03)'}}>
                    <div className="w-8 text-center text-sm">{PLAN_ICON[p]}</div>
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="font-bold text-white">{PLAN_LABEL[p]}</span>
                        <span style={{color:PLAN_COLOR[p]}}>{ventas.length} ventas · {fmtCOP(total)}</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{background:'rgba(255,255,255,0.06)'}}>
                        <div className="h-full rounded-full" style={{width:`${pct}%`,background:`linear-gradient(90deg,${PLAN_COLOR[p]},${PLAN_COLOR[p]}88)`}}/>
                      </div>
                    </div>
                    <span className="text-[10px] text-white/40 w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ADD/EDIT ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.85)',backdropFilter:'blur(8px)'}}>
          <div className="w-full max-w-lg rounded-3xl overflow-hidden" style={{background:'linear-gradient(145deg,#040d1a,#071325)',border:'1px solid rgba(232,121,249,0.25)'}}>
            <div className="h-0.5" style={{background:'linear-gradient(90deg,#e879f9,#a855f7)'}}/>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-white text-base">{editId ? '✏️ Editar contacto' : '➕ Nuevo contacto'}</h3>
                <button onClick={()=>{setShowModal(false);setEditId(null);}} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/50">✕</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {k:'nombre',    l:'Nombre completo *', ph:'Carlos Morales'},
                  {k:'empresa',   l:'Empresa / Finca',   ph:'Finca Las Palmas'},
                  {k:'telefono',  l:'Teléfono',          ph:'316 555 0101'},
                  {k:'email',     l:'Email',             ph:'contacto@finca.co'},
                ].map(f=>(
                  <div key={f.k}>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">{f.l}</label>
                    <input value={(form as Record<string,string>)[f.k]||''} onChange={e=>setForm(prev=>({...prev,[f.k]:e.target.value}))}
                      placeholder={f.ph}
                      className="w-full px-3 py-2 rounded-xl text-xs text-white outline-none"
                      style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)'}}/>
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Tipo de cliente</label>
                  <select value={form.tipo} onChange={e=>setForm(prev=>({...prev,tipo:e.target.value as ContactoTipo}))}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white outline-none"
                    style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)'}}>
                    {Object.entries(TIPO_CFG).map(([k,v])=><option key={k} value={k}>{v.emoji} {v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Estado</label>
                  <select value={form.estado} onChange={e=>setForm(prev=>({...prev,estado:e.target.value as ContactoEstado}))}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white outline-none"
                    style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)'}}>
                    {(Object.keys(ESTADO_CFG) as ContactoEstado[]).map(e=><option key={e} value={e}>{ESTADO_CFG[e].icon} {ESTADO_CFG[e].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Plan de interés</label>
                  <select value={form.planInteres} onChange={e=>setForm(prev=>({...prev,planInteres:e.target.value as PlanId}))}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white outline-none"
                    style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)'}}>
                    {(['basico','pro','premium','platino'] as PlanId[]).map(p=><option key={p} value={p}>{PLAN_ICON[p]} {PLAN_LABEL[p]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Valor COP</label>
                  <input type="number" value={form.valor||0} onChange={e=>setForm(prev=>({...prev,valor:Number(e.target.value)}))}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white outline-none"
                    style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)'}}/>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Próximo seguimiento</label>
                  <input type="date" value={form.seguimiento||''} onChange={e=>setForm(prev=>({...prev,seguimiento:e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white outline-none"
                    style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)'}}/>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Notas</label>
                  <textarea value={form.notas||''} onChange={e=>setForm(prev=>({...prev,notas:e.target.value}))}
                    rows={2} placeholder="Observaciones, contexto, intereses…"
                    className="w-full px-3 py-2 rounded-xl text-xs text-white outline-none resize-none"
                    style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)'}}/>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={save}
                  className="flex-1 py-2.5 rounded-2xl font-black text-sm transition-all hover:opacity-90"
                  style={{background:'linear-gradient(135deg,#e879f9,#a855f7)',color:'white',boxShadow:'0 0 18px rgba(232,121,249,0.35)'}}>
                  {editId ? '💾 Guardar cambios' : '➕ Agregar contacto'}
                </button>
                <button onClick={()=>{setShowModal(false);setEditId(null);}}
                  className="px-4 py-2.5 rounded-2xl font-bold text-xs"
                  style={{background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.1)'}}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
