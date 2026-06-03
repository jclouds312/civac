import { Link } from "wouter";
import { useAuth, PLAN_COLOR, PLAN_ICON, PLAN_LABEL, type PlanId } from "@/lib/auth";
import { TrendingUp, Users, DollarSign, Target, Plus, ChevronRight, Star, Clock, Send } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

type ContactoEstado = 'prospecto' | 'contactado' | 'demo' | 'negociando' | 'comprador' | 'lista_espera' | 'no_interesado';
interface Contacto { id:string; nombre:string; empresa:string; estado:ContactoEstado; planInteres:PlanId; valor:number; fecha:string; seguimiento:string; }

function loadContacts(): Contacto[] {
  try { const s = localStorage.getItem('civac_crm_contacts'); return s ? JSON.parse(s) : []; } catch { return []; }
}
const fmtCOP = (n:number) => `$${(n/1000000).toFixed(1)}M COP`;
const fmt    = (n:number) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : `$${(n/1000).toFixed(0)}k`;

const weekData = [
  {d:'Lun',c:2,v:1},{d:'Mar',c:3,v:0},{d:'Mié',c:1,v:2},{d:'Jue',c:4,v:1},{d:'Vie',c:2,v:2},{d:'Sáb',c:1,v:0},{d:'Hoy',c:3,v:1},
];

export default function VentasDashboard() {
  const { user } = useAuth();
  const contacts = loadContacts();
  const compradores   = contacts.filter(c=>c.estado==='comprador');
  const pipeline      = contacts.filter(c=>!['comprador','no_interesado'].includes(c.estado));
  const listaEspera   = contacts.filter(c=>c.estado==='lista_espera');
  const hoy           = new Date().toISOString().slice(0,10);
  const hoyContacts   = contacts.filter(c=>c.seguimiento===hoy || c.fecha===hoy);
  const ingresosTotal = compradores.reduce((s,c)=>s+c.valor,0);
  const pipelineTotal = pipeline.reduce((s,c)=>s+c.valor,0);
  const metaMensual   = 2000000;
  const avanceMeta    = Math.min(100, Math.round(ingresosTotal / metaMensual * 100));
  const hora          = new Date().getHours();
  const saludo        = hora<12?'Buenos días':hora<18?'Buenas tardes':'Buenas noches';

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 civac-animate">

      {/* ── HERO BANNER ── */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
        style={{background:'linear-gradient(135deg,#1a0030 0%,#2d0050 35%,#1e003a 70%,#150028 100%)',border:'1px solid rgba(232,121,249,0.22)',boxShadow:'0 0 50px rgba(232,121,249,0.08)'}}>
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(232,121,249,0.18),transparent 70%)'}}/>
        <div className="absolute -bottom-16 left-1/4 w-48 h-48 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(168,85,247,0.10),transparent 70%)'}}/>
        <div className="h-0.5 w-full" style={{background:'linear-gradient(90deg,transparent,#e879f9,#a855f7,transparent)'}}/>
        <div className="relative p-5 sm:p-6">
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
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full hidden sm:flex items-center gap-1"
                  style={{background:'rgba(0,245,212,0.10)',color:'#00f5d4',border:'1px solid rgba(0,245,212,0.25)'}}>
                  💼 Asesora Comercial Senior
                </span>
              </div>
              <p className="text-white/50 text-xs sm:text-sm">{new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} · CIVAC v7.0</p>
              <p className="text-[10px] mt-0.5" style={{color:'rgba(232,121,249,0.35)'}}>Panel comercial · Pipeline CRM · Reportes diarios · Gestión de cuentas</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/ventas">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-xs transition-all hover:scale-105"
                  style={{background:'linear-gradient(135deg,#e879f9,#a855f7)',color:'white',boxShadow:'0 0 16px rgba(232,121,249,0.4)'}}>
                  <Plus size={13}/> Nuevo Contacto
                </button>
              </Link>
              <Link href="/ventas">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all"
                  style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.65)',border:'1px solid rgba(255,255,255,0.12)'}}>
                  <Send size={12}/> Generar Reporte
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          {label:'Pipeline activo',   val:fmt(pipelineTotal),  sub:`${pipeline.length} en negociación`,     from:'#e879f9',to:'#a855f7',glow:'232,121,249', icon:<TrendingUp size={14}/>},
          {label:'Ventas cerradas',   val:compradores.length,  sub:`${fmt(ingresosTotal)} ingresado`,        from:'#39ff7e',to:'#00c850',glow:'57,255,126',  icon:<Target size={14}/>},
          {label:'Contactos totales', val:contacts.length,     sub:`${hoyContacts.length} hoy`,             from:'#00c8ff',to:'#0ea5e9',glow:'0,200,255',   icon:<Users size={14}/>},
          {label:'Meta mensual',      val:`${avanceMeta}%`,    sub:`${fmtCOP(ingresosTotal)} de $2M`,       from:'#fbbf24',to:'#f97316',glow:'251,191,36',  icon:<Star size={14}/>},
        ].map((k,i)=>(
          <div key={k.label} className="relative rounded-[20px] cursor-pointer group overflow-hidden" style={{background:`linear-gradient(145deg,rgba(${k.glow},0.08),rgba(${k.glow},0.03),rgba(0,0,0,0.35))`,border:`1px solid rgba(${k.glow},0.22)`,padding:'14px 12px',animationDelay:`${i*60}ms`}}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(90deg,transparent,${k.from},${k.to},transparent)`,opacity:0.7}}/>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full pointer-events-none" style={{background:`radial-gradient(circle,rgba(${k.glow},0.22),transparent)`,transform:'translate(40%,-40%)'}}/>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-black uppercase tracking-wider" style={{color:`rgba(${k.glow},0.75)`}}>{k.label}</div>
              <div style={{color:`rgba(${k.glow},0.5)`}}>{k.icon}</div>
            </div>
            <div className="text-2xl sm:text-3xl font-black leading-none mb-1.5" style={{color:`rgba(${k.glow},1)`,textShadow:`0 0 18px rgba(${k.glow},0.6)`,fontFamily:"'Sora',sans-serif"}}>{k.val}</div>
            <div className="text-[9px] sm:text-[10px] text-white/40">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Actividad semanal */}
        <div className="lg:col-span-2 rounded-2xl sm:rounded-3xl p-4 sm:p-5" style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(232,121,249,0.18)',borderRadius:20}}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg" style={{background:'linear-gradient(135deg,#e879f9,#a855f7)',boxShadow:'0 0 16px rgba(232,121,249,0.4)'}}>📊</div>
            <div>
              <p className="font-black text-sm text-white">Actividad semanal</p>
              <p className="text-[10px] text-white/40">Contactos y ventas · 7 días</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weekData} margin={{top:5,right:10,left:-25,bottom:0}}>
              <defs>
                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e879f9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#e879f9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#39ff7e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#39ff7e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{fill:'rgba(255,255,255,0.35)',fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:'#071325',border:'1px solid rgba(232,121,249,0.3)',borderRadius:12,fontSize:11}} labelStyle={{color:'rgba(255,255,255,0.7)'}}/>
              <Area type="monotone" dataKey="c" name="Contactos" stroke="#e879f9" strokeWidth={2} fill="url(#gC)" dot={false}/>
              <Area type="monotone" dataKey="v" name="Ventas" stroke="#39ff7e" strokeWidth={2} fill="url(#gV)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            {[['#e879f9','Contactos'],['#39ff7e','Ventas']].map(([c,l])=>(
              <div key={l} className="flex items-center gap-1.5 text-[10px] text-white/50">
                <div className="w-2 h-2 rounded-full" style={{background:c}}/>
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Seguimientos hoy */}
        <div className="rounded-2xl sm:rounded-3xl p-4" style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(255,154,60,0.18)',borderRadius:20}}>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} style={{color:'#ff9a3c'}}/>
            <p className="text-sm font-black text-white">Seguimientos hoy</p>
          </div>
          <div className="space-y-2">
            {hoyContacts.slice(0,5).map(c=>(
              <div key={c.id} className="flex items-center gap-2 p-2 rounded-xl" style={{background:'rgba(255,154,60,0.06)',border:'1px solid rgba(255,154,60,0.12)'}}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0" style={{background:'rgba(255,154,60,0.15)'}}>📞</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white/85 truncate">{c.nombre}</p>
                  <p className="text-[9px] text-white/35 truncate">{PLAN_ICON[c.planInteres]} {PLAN_LABEL[c.planInteres]}</p>
                </div>
              </div>
            ))}
            {hoyContacts.length === 0 && <p className="text-[11px] text-white/25 text-center py-4">Sin seguimientos para hoy</p>}
          </div>
          <Link href="/ventas">
            <button className="w-full mt-3 py-2 rounded-xl text-[10px] font-bold transition-all hover:opacity-80"
              style={{background:'rgba(255,154,60,0.08)',color:'#ff9a3c',border:'1px solid rgba(255,154,60,0.2)'}}>
              Ver todos en CRM →
            </button>
          </Link>
        </div>
      </div>

      {/* ── QUICK ACTIONS + LISTA ESPERA ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Acciones rápidas */}
        <div className="rounded-2xl p-4" style={{background:'rgba(3,10,22,0.9)',border:'1px solid rgba(232,121,249,0.12)',borderRadius:20}}>
          <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-3">⚡ Acciones rápidas</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              {label:'Nuevo contacto',   emoji:'➕', href:'/ventas',       c:'#e879f9',g:'232,121,249'},
              {label:'Ver pipeline',     emoji:'📊', href:'/ventas',       c:'#00c8ff',g:'0,200,255'},
              {label:'Generar reporte',  emoji:'📋', href:'/ventas',       c:'#39ff7e',g:'57,255,126'},
              {label:'Ver planes',       emoji:'💎', href:'/planes',       c:'#fbbf24',g:'251,191,36'},
              {label:'Documentación',    emoji:'📖', href:'/documentacion',c:'#a855f7',g:'168,85,247'},
              {label:'Contabilidad',     emoji:'💰', href:'/ventas',       c:'#ff9a3c',g:'255,154,60'},
            ].map(a=>(
              <Link key={a.label} href={a.href}>
                <button className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-left transition-all hover:scale-[1.02]"
                  style={{background:`rgba(${a.g},0.07)`,border:`1px solid rgba(${a.g},0.2)`,color:a.c}}>
                  <span className="text-base">{a.emoji}</span>
                  <span className="text-[10px] leading-tight">{a.label}</span>
                  <ChevronRight size={10} className="ml-auto"/>
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Lista de espera */}
        <div className="rounded-2xl p-4" style={{background:'rgba(3,10,22,0.9)',border:'1px solid rgba(232,121,249,0.12)',borderRadius:20}}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black text-white/60 uppercase tracking-widest">⏳ Lista de espera ({listaEspera.length})</p>
          </div>
          <div className="space-y-2">
            {listaEspera.slice(0,4).map(c=>(
              <div key={c.id} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0" style={{background:'rgba(232,121,249,0.12)'}}>⏳</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white/80 truncate">{c.nombre}</p>
                  <p className="text-[9px] text-white/35">{c.empresa} · {PLAN_ICON[c.planInteres]} {PLAN_LABEL[c.planInteres]}</p>
                </div>
                <div className="text-[9px] font-bold" style={{color:PLAN_COLOR[c.planInteres]}}>{PLAN_LABEL[c.planInteres]}</div>
              </div>
            ))}
            {listaEspera.length === 0 && <p className="text-[11px] text-white/25 text-center py-4">Sin contactos en lista de espera</p>}
          </div>
          <Link href="/ventas">
            <button className="w-full mt-3 py-2 rounded-xl text-[10px] font-bold transition-all hover:opacity-80"
              style={{background:'rgba(232,121,249,0.06)',color:'#e879f9',border:'1px solid rgba(232,121,249,0.18)'}}>
              Gestionar en CRM →
            </button>
          </Link>
        </div>
      </div>

      {/* ── RESUMEN FINANCIERO ── */}
      <div className="rounded-2xl p-4 sm:p-5" style={{background:'rgba(3,10,22,0.9)',border:'1px solid rgba(57,255,126,0.15)',borderRadius:20}}>
        <div className="flex items-center gap-2.5 mb-4">
          <DollarSign size={14} style={{color:'#39ff7e'}}/>
          <p className="text-sm font-black text-white">Resumen financiero del mes</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {l:'Ingresos totales',      v:fmtCOP(ingresosTotal),           c:'#39ff7e'},
            {l:'Tu comisión (10%)',     v:fmtCOP(ingresosTotal*0.1),       c:'#e879f9'},
            {l:'Meta restante',         v:fmtCOP(Math.max(0,metaMensual-ingresosTotal)), c:'#ff9a3c'},
            {l:'Avance meta',           v:`${avanceMeta}%`,                c:'#fbbf24'},
          ].map(x=>(
            <div key={x.l} className="text-center p-3 rounded-xl" style={{background:'rgba(255,255,255,0.03)'}}>
              <p className="text-xl font-black" style={{color:x.c}}>{x.v}</p>
              <p className="text-[9px] text-white/35 mt-0.5">{x.l}</p>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[9px] mb-1 text-white/40">
            <span>Meta: $2.000.000/mes</span>
            <span style={{color:'#39ff7e'}}>{avanceMeta}% completado</span>
          </div>
          <div className="h-2 rounded-full" style={{background:'rgba(255,255,255,0.06)'}}>
            <div className="h-full rounded-full transition-all duration-1000" style={{width:`${avanceMeta}%`,background:'linear-gradient(90deg,#e879f9,#39ff7e)',boxShadow:'0 0 8px rgba(57,255,126,0.5)'}}/>
          </div>
        </div>
      </div>

      {/* ── QUICK NAV ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          {href:'/ventas',        emoji:'💼', label:'CRM',           c:'#e879f9'},
          {href:'/planes',        emoji:'💎', label:'Planes',        c:'#fbbf24'},
          {href:'/alertas',       emoji:'🔔', label:'Alertas',       c:'#ff4d6d'},
          {href:'/documentacion', emoji:'📖', label:'Docs',          c:'#00f5d4'},
          {href:'/manual',        emoji:'📋', label:'Manual',        c:'#a855f7'},
          {href:'/usuarios',      emoji:'👥', label:'Usuarios',      c:'#00c8ff'},
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
    </div>
  );
}
