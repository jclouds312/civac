import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line
} from "recharts";
import { useAppState } from "../lib/data";
import { Bell, TrendingUp, AlertCircle, AlertTriangle, ChevronRight, Scale, Navigation, Bluetooth, Signal } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const dataProduccion = [
  { name:'Oct', litros:52000, meta:50000 },
  { name:'Nov', litros:55000, meta:53000 },
  { name:'Dic', litros:58000, meta:56000 },
  { name:'Ene', litros:62000, meta:60000 },
  { name:'Feb', litros:60000, meta:62000 },
  { name:'Mar', litros:56000, meta:60000 },
  { name:'Abr', litros:61300, meta:62000 },
];
const dataPeso = [
  { name:'Oct', kg:400 },{ name:'Nov', kg:403 },{ name:'Dic', kg:405 },
  { name:'Ene', kg:408 },{ name:'Feb', kg:410 },{ name:'Mar', kg:414 },{ name:'Abr', kg:417 },
];
const dataFinanzas = [
  { name:'Oct', ingresos:72, egresos:40 },{ name:'Nov', ingresos:78, egresos:42 },
  { name:'Dic', ingresos:81, egresos:44 },{ name:'Ene', ingresos:86, egresos:46 },
  { name:'Feb', ingresos:83, egresos:43 },{ name:'Mar', ingresos:80, egresos:44 },
  { name:'Abr', ingresos:86, egresos:46 },
];

const PIE_COLORS = ['#00f5d4','#00c8ff','#39ff7e','#a855f7'];


const modulos = [
  { emoji:'🐄', title:'Inventario', desc:'Registro y seguimiento de animales', badge:'13', href:'/inventario', neon:'#00f5d4' },
  { emoji:'📋', title:'Ficha Individual', desc:'Historia clínica por bovino', badge:null, href:'/ficha', neon:'#00c8ff' },
  { emoji:'🔁', title:'Reproducción', desc:'Celos, IA, gestación y nacimientos', badge:'1', href:'/reproduccion', neon:'#ff6fd8' },
  { emoji:'🥛', title:'Producción', desc:'Ordeños, litros/vaca, calidad', badge:'84L', href:'/produccion', neon:'#00c8ff' },
  { emoji:'🧬', title:'Genética', desc:'DEP, índices y mejoramiento', badge:null, href:'/genetica', neon:'#a855f7' },
  { emoji:'🌿', title:'Potreros', desc:'Rotación, aforo y ocupación', badge:'6', href:'/potreros', neon:'#84ef34' },
  { emoji:'🌾', title:'Alimentación', desc:'Raciones, minerales y suplementos', badge:null, href:'/alimentacion', neon:'#ffd166' },
  { emoji:'💊', title:'Insumos / Kardex', desc:'Medicamentos, vacunas y stock', badge:'⚠4', href:'/insumos', neon:'#ff4d6d', badgeRed:true },
  { emoji:'🧊', title:'Semen y Embriones', desc:'Inventario criogénico y TE', badge:null, href:'/semen', neon:'#818cf8' },
  { emoji:'💰', title:'Costos y Finanzas', desc:'Ingresos, egresos y P&G', badge:null, href:'/costos', neon:'#34d399' },
  { emoji:'👷', title:'Personal / Nómina', desc:'Empleados, salarios y roles', badge:'6', href:'/personal', neon:'#94a3b8' },
  { emoji:'🤖', title:'Predicciones IA', desc:'Alertas inteligentes y recomendaciones', badge:null, href:'/prediccion', neon:'#e879f9', badgePro:true },
  { emoji:'🌱', title:'Huella Carbono', desc:'Emisiones CH₄, CO₂ y bonos', badge:null, href:'/co2', neon:'#4ade80' },
  { emoji:'🗺️', title:'Multi-Finca', desc:'Gestión centralizada multi-finca', badge:null, href:'/multifinca', neon:'#22d3ee' },
  { emoji:'⚖️', title:'Pesaje BT', desc:'Báscula Bluetooth, GMD, historial', badge:'PRO', href:'/pesaje', neon:'#ff9a3c', badgePro:true },
  { emoji:'📡', title:'GPS Ganado', desc:'Rastreo GPS y geocercas', badge:'PRO', href:'/gps', neon:'#00c8ff', badgePro:true },
  { emoji:'👥', title:'Usuarios', desc:'Accesos y permisos por rol', badge:null, href:'/usuarios', neon:'#c084fc' },
];

const tooltipStyle = { backgroundColor:'#030f0b', border:'1px solid rgba(0,245,212,0.2)', color:'#e2e8f0', borderRadius:'10px', fontSize:'12px' };

export default function Dashboard() {
  const { animals, potreros, personal, alertas, pesajes, gpsUbicaciones } = useAppState();
  const [chartTab, setChartTab] = useState<'produccion'|'peso'|'finanzas'>('produccion');
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? '¡Buenos días!' : hour < 18 ? '¡Buenas tardes!' : '¡Buenas noches!';

  const total = animals.length || 13;
  const vacasN = animals.filter(a => a.categoria === 'Vaca').length || 7;
  const novillasN = animals.filter(a => a.categoria === 'Novilla').length || 3;
  const ternerosN = animals.filter(a => (a.categoria||'').toLowerCase().includes('ternero') || (a.categoria||'').toLowerCase().includes('ternera')).length || 2;
  const torosN = animals.filter(a => a.categoria === 'Toro').length || 1;

  const pieData = [
    { name: 'Vacas',    value: vacasN,    pct: `${Math.round(vacasN/total*100)}%` },
    { name: 'Novillas', value: novillasN, pct: `${Math.round(novillasN/total*100)}%` },
    { name: 'Terneros', value: ternerosN, pct: `${Math.round(ternerosN/total*100)}%` },
    { name: 'Toros',    value: torosN,    pct: `${Math.round(torosN/total*100)}%` },
  ];

  const kpiCards = [
    { label:'Animales',   emoji:'🐄', val: total,                                    sub:'Hato activo CIVAC',       grad:'linear-gradient(135deg,#003d2e,#004d3a)', neon:'#00f5d4', glow:'rgba(0,245,212,0.15)' },
    { label:'Producción', emoji:'🥛', val:'84 L',                                    sub:'Litros hoy · 5 vacas',    grad:'linear-gradient(135deg,#002040,#003060)', neon:'#00c8ff', glow:'rgba(0,200,255,0.15)' },
    { label:'Alertas',    emoji:'🔔', val: alertas.length,                            sub:'Requieren atención',      grad:'linear-gradient(135deg,#3d0015,#4d0020)', neon:'#ff4d6d', glow:'rgba(255,77,109,0.15)' },
    { label:'Potreros',   emoji:'🌿', val: potreros.length,                          sub:'Áreas de pastoreo',       grad:'linear-gradient(135deg,#1a3d00,#224d00)', neon:'#84ef34', glow:'rgba(132,239,52,0.15)' },
    { label:'Personal',   emoji:'👷', val: personal.length,                          sub:'Empleados activos',       grad:'linear-gradient(135deg,#1a2030,#1a2840)', neon:'#94a3b8', glow:'rgba(148,163,184,0.15)' },
    { label:'Utilidad',   emoji:'💰', val:'$40.2M',                                  sub:'Mes actual · COP',        grad:'linear-gradient(135deg,#002030,#003020)', neon:'#34d399', glow:'rgba(52,211,153,0.15)' },
  ];

  return (
    <div className="space-y-5 pb-8 civac-animate">

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden" style={{background:'linear-gradient(135deg,#003d2e 0%,#004d3a 40%,#003050 100%)',border:'1px solid rgba(0,245,212,0.2)',boxShadow:'0 0 40px rgba(0,245,212,0.08)'}}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-20" style={{background:'radial-gradient(circle,#00f5d4,transparent)'}}/>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-15" style={{background:'radial-gradient(circle,#00c8ff,transparent)'}}/>
          <div className="absolute inset-0" style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(0,245,212,0.03) 30px,rgba(0,245,212,0.03) 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,rgba(0,245,212,0.03) 30px,rgba(0,245,212,0.03) 31px)'}}/>
        </div>
        <div className="relative p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-2xl font-black text-white" style={{fontFamily:"'Sora',sans-serif"}}>{greeting} 👋</h1>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{background:'rgba(57,255,126,0.15)',color:'#39ff7e',border:'1px solid rgba(57,255,126,0.3)'}}>● CIVAC Live</span>
            </div>
            <p className="text-white/60 text-sm">
              {now.toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} — {now.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}
            </p>
            <p className="text-white/40 text-xs mt-0.5">Dashboard PRO · Control Inteligente de Valor Agropecuario</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              {v:`🐄 ${animals.length}`, l:'Animales'},
              {v:'🥛 5', l:'Producción'},
              {v:`🌿 ${potreros.length}`, l:'Potreros'},
              {v:`👷 ${personal.length}`, l:'Staff'},
            ].map(t=>(
              <div key={t.l} className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{background:'rgba(255,255,255,0.08)',color:'white',border:'1px solid rgba(255,255,255,0.12)'}}>
                {t.v} <span className="text-white/50">{t.l}</span>
              </div>
            ))}
            <button className="relative p-2 rounded-xl" style={{background:'rgba(255,77,109,0.15)',border:'1px solid rgba(255,77,109,0.3)'}}>
              <Bell size={15} className="text-rose-400"/>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-bold" style={{background:'#ff4d6d'}}>3</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map(k=>(
          <div key={k.label} className="card-lift rounded-2xl p-4 text-white relative overflow-hidden"
            style={{background:k.grad,border:`1px solid ${k.neon}25`,boxShadow:`0 0 20px ${k.glow}`}}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-20" style={{background:`radial-gradient(circle,${k.neon},transparent)`,transform:'translate(30%,-30%)'}}/>
            <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{color:`${k.neon}cc`}}>{k.emoji} {k.label}</div>
            <div className="text-2xl font-black leading-none mb-1" style={{color:k.neon,textShadow:`0 0 12px ${k.glow}`}}>{k.val}</div>
            <div className="text-[10px] text-white/45">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Analytics row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pesos */}
        <div className="rounded-2xl p-5 card-lift" style={{background:'rgba(3,15,10,0.8)',border:'1px solid rgba(255,154,60,0.2)'}}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{background:'linear-gradient(135deg,#ff9a3c,#ea580c)'}}>⚖️</div>
            <div>
              <div className="font-bold text-sm text-white">Análisis de Pesos</div>
              <div className="text-xs text-white/40">Promedio · metas por categoría</div>
            </div>
          </div>
          <div className="rounded-xl p-3 mb-3" style={{background:'rgba(255,154,60,0.1)',border:'1px solid rgba(255,154,60,0.2)'}}>
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{color:'#ff9a3c'}}>Peso promedio hato</div>
            <div className="text-3xl font-black" style={{color:'#ff9a3c',textShadow:'0 0 12px rgba(255,154,60,0.5)'}}>417 kg</div>
            <div className="text-[10px] text-white/50">Biomasa total: <strong className="text-white/80">5.4 ton</strong></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              {emoji:'🐄',label:'Vacas',kg:508,diff:'+28',n:7,c:'#00f5d4',ok:true},
              {emoji:'🐮',label:'Novillas',kg:298,diff:'-22',n:3,c:'#ff4d6d',ok:false},
              {emoji:'🐣',label:'Terneros',kg:80,diff:'-70',n:2,c:'#ff4d6d',ok:false},
              {emoji:'🐂',label:'Toros',kg:810,diff:'+160',n:1,c:'#39ff7e',ok:true},
            ].map(c=>(
              <div key={c.label} className="rounded-xl p-2.5" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
                <div className="text-base mb-1">{c.emoji}</div>
                <div className="text-[10px] text-white/50">{c.label} ({c.n})</div>
                <div className="text-base font-black text-white">{c.kg} kg</div>
                <div className="text-[10px] font-semibold" style={{color:c.c}}>{c.diff} kg</div>
              </div>
            ))}
          </div>
        </div>

        {/* Producción */}
        <div className="rounded-2xl p-5 card-lift" style={{background:'rgba(3,15,10,0.8)',border:'1px solid rgba(0,200,255,0.2)'}}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{background:'linear-gradient(135deg,#00c8ff,#0ea5e9)'}}>🥛</div>
            <div>
              <div className="font-bold text-sm text-white">Producción Lechera</div>
              <div className="text-xs text-white/40">Vacas en ordeño activo</div>
            </div>
          </div>
          <div className="flex gap-3 mb-3">
            {[{v:'84',l:'L/día',c:'#00c8ff'},{v:'16.8',l:'L/vaca',c:'#39ff7e'},{v:'5',l:'Ordeño',c:'#a855f7'}].map(s=>(
              <div key={s.l} className="flex-1 text-center rounded-xl py-2" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
                <div className="text-xl font-black" style={{color:s.c}}>{s.v}</div>
                <div className="text-[9px] text-white/40 uppercase">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1.5"><span className="text-white/40">Meta diaria</span><span className="font-bold text-white">93% · 84/90 L</span></div>
            <div className="h-2 rounded-full overflow-hidden" style={{background:'rgba(0,200,255,0.1)'}}>
              <div className="h-full rounded-full" style={{width:'93%',background:'linear-gradient(90deg,#00c8ff,#00f5d4)',boxShadow:'0 0 8px rgba(0,245,212,0.5)'}}/>
            </div>
          </div>
          <div className="text-[10px] font-bold text-white/30 uppercase mb-2">🏆 Top productoras</div>
          {[['Rosaura','18.4 L','#fbbf24'],['Estrella','17.8 L','#94a3b8'],['Cielo','16.9 L','#a78bfa']].map(([n,l,c],i)=>(
            <div key={n} className="flex justify-between text-xs py-1 border-b" style={{borderColor:'rgba(255,255,255,0.05)'}}>
              <span className="text-white/50">{i+1}° {n}</span>
              <span className="font-bold" style={{color:c}}>{l}</span>
            </div>
          ))}
        </div>

        {/* Potreros */}
        <div className="rounded-2xl p-5 card-lift" style={{background:'rgba(3,15,10,0.8)',border:'1px solid rgba(132,239,52,0.2)'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{background:'linear-gradient(135deg,#84ef34,#65a30d)'}}>🌿</div>
              <div>
                <div className="font-bold text-sm text-white">Manejo de Potreros</div>
                <div className="text-xs text-white/40">Rotación y estado</div>
              </div>
            </div>
            <Link href="/potreros"><span className="text-xs font-semibold" style={{color:'#84ef34'}}>Ver →</span></Link>
          </div>
          <div className="flex gap-2 mb-3">
            {[{v:'6',l:'Total',c:'white'},{v:'1',l:'Libre',c:'#39ff7e'},{v:'27',l:'Has',c:'#00c8ff'}].map(s=>(
              <div key={s.l} className="flex-1 text-center rounded-xl py-2" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
                <div className="text-xl font-black" style={{color:s.c}}>{s.v}</div>
                <div className="text-[9px] text-white/40 uppercase">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="text-xs rounded-xl px-3 py-2 mb-3" style={{background:'rgba(255,154,60,0.1)',border:'1px solid rgba(255,154,60,0.2)',color:'#ff9a3c'}}>
            ⚡ ¡Rotar pronto! <span className="text-white/50">Potrero 4</span>
          </div>
          {[
            {n:'Potrero 6',ha:'3.5 ha',s:'Ocupado',c:'#ff9a3c'},
            {n:'Potrero 5',ha:'6 ha',s:'Listo',c:'#39ff7e'},
            {n:'Potrero 4',ha:'4.2 ha',s:'Rotar ya',c:'#ff4d6d'},
            {n:'Potrero 3',ha:'5.1 ha',s:'Ocupado',c:'#ff9a3c'},
          ].map(p=>(
            <div key={p.n} className="flex items-center gap-2 py-1.5 border-b" style={{borderColor:'rgba(255,255,255,0.05)'}}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:p.c,boxShadow:`0 0 6px ${p.c}80`}}/>
              <span className="text-xs font-medium text-white/80 flex-1">{p.n}</span>
              <span className="text-[10px] text-white/35">{p.ha}</span>
              <span className="text-[10px] font-bold" style={{color:p.c}}>{p.s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart section */}
      <div className="rounded-2xl p-5" style={{background:'rgba(3,15,10,0.8)',border:'1px solid rgba(0,245,212,0.12)'}}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#00f5d4,#00c896)'}}>
              <TrendingUp size={17} className="text-black"/>
            </div>
            <div>
              <div className="font-bold text-white" style={{fontFamily:"'Sora',sans-serif"}}>Evolución Histórica CIVAC</div>
              <div className="text-xs text-white/40">Últimos 7 meses · Oct 2024 — Abr 2025</div>
            </div>
          </div>
          <div className="flex gap-1">
            {[{id:'produccion',label:'Producción 🥛'},{id:'peso',label:'Peso ⚖️'},{id:'finanzas',label:'Finanzas 💰'}].map(t=>(
              <button key={t.id} onClick={()=>setChartTab(t.id as any)}
                className="text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-all"
                style={chartTab===t.id
                  ?{background:'linear-gradient(135deg,#00f5d4,#00c896)',color:'black',boxShadow:'0 0 12px rgba(0,245,212,0.4)'}
                  :{background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.5)'}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            {chartTab==='finanzas' ? (
              <BarChart data={dataFinanzas} margin={{top:5,right:20,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="barIn" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#39ff7e"/><stop offset="1" stopColor="#00c850" stopOpacity={0.6}/></linearGradient>
                  <linearGradient id="barEg" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ff4d6d"/><stop offset="1" stopColor="#c9184a" stopOpacity={0.6}/></linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="transparent" tick={{fill:'rgba(255,255,255,0.4)',fontSize:11}}/>
                <YAxis stroke="transparent" tick={{fill:'rgba(255,255,255,0.4)',fontSize:11}} width={40}/>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <RTooltip contentStyle={tooltipStyle} formatter={(v:any,n:any)=>[`$${v}M COP`,n==='ingresos'?'Ingresos':'Egresos']}/>
                <Bar dataKey="ingresos" fill="url(#barIn)" radius={[6,6,0,0]}/>
                <Bar dataKey="egresos" fill="url(#barEg)" radius={[6,6,0,0]}/>
              </BarChart>
            ) : (
              <AreaChart data={chartTab==='produccion'?dataProduccion:dataPeso} margin={{top:5,right:20,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="areaMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartTab==='produccion'?'#00f5d4':'#ff9a3c'} stopOpacity={0.35}/>
                    <stop offset="95%" stopColor={chartTab==='produccion'?'#00f5d4':'#ff9a3c'} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="areaMeta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="transparent" tick={{fill:'rgba(255,255,255,0.4)',fontSize:11}}/>
                <YAxis stroke="transparent" tick={{fill:'rgba(255,255,255,0.4)',fontSize:11}} width={50}/>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <RTooltip contentStyle={tooltipStyle}/>
                {chartTab==='produccion' && <Area type="monotone" dataKey="meta" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#areaMeta)" dot={false}/>}
                <Area type="monotone" dataKey={chartTab==='produccion'?'litros':'kg'} stroke={chartTab==='produccion'?'#00f5d4':'#ff9a3c'} strokeWidth={2.5} fillOpacity={1} fill="url(#areaMain)"
                  dot={{fill:chartTab==='produccion'?'#00f5d4':'#ff9a3c',r:3,strokeWidth:0}}
                  activeDot={{r:5,fill:chartTab==='produccion'?'#00f5d4':'#ff9a3c',strokeWidth:0,style:{filter:`drop-shadow(0 0 6px ${chartTab==='produccion'?'#00f5d4':'#ff9a3c'})`}}}/>
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie + Alertas + KPIs repro + Finanzas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pie */}
          <div className="rounded-2xl p-5 card-lift" style={{background:'rgba(3,15,10,0.8)',border:'1px solid rgba(0,245,212,0.12)'}}>
            <div className="font-bold text-sm text-white mb-1">🐄 Composición del hato</div>
            <div className="text-[10px] text-white/35 mb-2">{animals.length} animales · CIVAC</div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={52} innerRadius={20} strokeWidth={0} paddingAngle={2}>
                    {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]} style={{filter:`drop-shadow(0 0 5px ${PIE_COLORS[i]}80)`}}/>)}
                  </Pie>
                  <RTooltip contentStyle={tooltipStyle}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {pieData.map((d,i)=>(
              <div key={d.name} className="flex items-center gap-2 text-xs py-0.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:PIE_COLORS[i],boxShadow:`0 0 5px ${PIE_COLORS[i]}80`}}/>
                <span className="text-white/50 flex-1">{d.name}</span>
                <span className="font-bold text-white">{d.value} <span className="text-white/30">({d.pct})</span></span>
              </div>
            ))}
          </div>
          {/* Alertas */}
          <div className="rounded-2xl p-5 card-lift" style={{background:'rgba(3,15,10,0.8)',border:'1px solid rgba(255,77,109,0.15)'}}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-sm text-white">Alertas activas</div>
              <Link href="/alertas"><span className="text-xs font-semibold" style={{color:'#ff4d6d'}}>Ver todas →</span></Link>
            </div>
            <div className="space-y-2.5">
              {alertas.slice(0,4).map(a=>(
                <div key={a.id} className="flex items-start gap-2.5 p-2.5 rounded-xl" style={{background:a.type==='danger'?'rgba(255,77,109,0.08)':'rgba(255,154,60,0.08)',border:`1px solid ${a.type==='danger'?'rgba(255,77,109,0.2)':'rgba(255,154,60,0.2)'}`}}>
                  {a.type==='danger'
                    ?<AlertCircle size={13} className="mt-0.5 flex-shrink-0" style={{color:'#ff4d6d'}}/>
                    :<AlertTriangle size={13} className="mt-0.5 flex-shrink-0" style={{color:'#ff9a3c'}}/>}
                  <div>
                    <div className="text-xs font-bold" style={{color:a.type==='danger'?'#ff4d6d':'#ff9a3c'}}>{a.title}</div>
                    <div className="text-[10px] text-white/40">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* KPIs Reproductivos */}
          <div className="rounded-2xl p-5 card-lift" style={{background:'rgba(3,15,10,0.8)',border:'1px solid rgba(255,111,216,0.15)'}}>
            <div className="font-bold text-sm text-white mb-3">🔁 KPIs Reproductivos</div>
            {[
              {label:'Tasa de concepción',val:'62%',meta:'meta 70%',ok:false},
              {label:'Vacas gestantes',val:'8%',meta:'meta 50%',ok:false},
              {label:'Destetes exitosos',val:'94%',meta:'meta 90%',ok:true},
              {label:'Natalidad anual',val:'78%',meta:'meta 85%',ok:false},
            ].map(k=>(
              <div key={k.label} className="flex items-center justify-between py-1.5 border-b" style={{borderColor:'rgba(255,255,255,0.05)'}}>
                <span className="text-xs text-white/50">{k.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{k.val}</span>
                  <span className="text-[9px] text-white/30">{k.meta}</span>
                  <span className="text-[10px] font-bold" style={{color:k.ok?'#39ff7e':'#ff4d6d'}}>{k.ok?'✓':'✗'}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Resumen Financiero */}
          <div className="rounded-2xl p-5 card-lift" style={{background:'rgba(3,15,10,0.8)',border:'1px solid rgba(52,211,153,0.15)'}}>
            <div className="font-bold text-sm text-white mb-1">💰 Resumen Financiero</div>
            <div className="text-[10px] text-white/35 mb-2.5">Mes actual · COP</div>
            {[
              {label:'Ingresos totales',val:'$85.750.000',c:'#39ff7e'},
              {label:'└ Venta de leche',val:'$70.050.000',c:'#39ff7e88',indent:true},
              {label:'└ Venta animales',val:'$12.500.000',c:'#39ff7e88',indent:true},
              {label:'Egresos totales',val:'($45.500.000)',c:'#ff4d6d'},
              {label:'Utilidad neta',val:'$40.250.000',c:'#00f5d4',bold:true},
            ].map(r=>(
              <div key={r.label} className={`flex justify-between text-xs py-0.5 ${r.indent?'pl-3':''}`}>
                <span className="text-white/45">{r.label}</span>
                <span className={`font-medium ${r.bold?'font-black':''}`} style={{color:r.c}}>{r.val}</span>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t text-xs text-white/35" style={{borderColor:'rgba(255,255,255,0.06)'}}>
              Margen: <strong style={{color:'#00f5d4'}}>47%</strong> · Costo/L: <strong style={{color:'#ff9a3c'}}>$820</strong>
            </div>
          </div>
        </div>
      </div>

      {/* PRO Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pesaje BT */}
        <div className="rounded-2xl p-5 card-lift relative overflow-hidden" style={{background:'rgba(3,15,10,0.8)',border:'1px solid rgba(255,154,60,0.2)'}}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15 pointer-events-none" style={{background:'radial-gradient(circle,#ff9a3c,transparent)',transform:'translate(40%,-40%)'}}/>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#ff9a3c,#ea580c)',boxShadow:'0 0 16px rgba(255,154,60,0.4)'}}>
                <Scale className="w-5 h-5 text-white"/>
              </div>
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  Pesaje Bluetooth
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md" style={{background:'rgba(255,154,60,0.2)',color:'#ff9a3c',border:'1px solid rgba(255,154,60,0.3)'}}>PRO</span>
                </div>
                <div className="text-xs text-white/40 flex items-center gap-1">
                  <Bluetooth className="w-3 h-3" style={{color:'#00c8ff'}}/> {pesajes.filter(p=>p.metodo==='bluetooth').length} registros BT
                </div>
              </div>
            </div>
            <Link href="/pesaje"><span className="text-xs font-semibold flex items-center gap-1" style={{color:'#ff9a3c'}}>Módulo <ChevronRight size={12}/></span></Link>
          </div>
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[
              {v:pesajes.length,l:'Total pesajes',c:'#ff9a3c'},
              {v:pesajes.filter(p=>p.metodo==='bluetooth').length,l:'Bluetooth',c:'#00c8ff'},
              {v:'+0',l:'GMD prom',c:'#39ff7e'},
            ].map(s=>(
              <div key={s.l} className="rounded-xl p-3 text-center" style={{background:`rgba(${s.c==='#ff9a3c'?'255,154,60':s.c==='#00c8ff'?'0,200,255':'57,255,126'},0.08)`,border:`1px solid ${s.c}25`}}>
                <div className="text-xl font-black" style={{color:s.c}}>{s.v}</div>
                <div className="text-[9px] text-white/40 uppercase">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] font-bold text-white/30 uppercase mb-2">Últimos pesajes</div>
          <div className="space-y-1.5">
            {pesajes.slice(0,4).map(p=>(
              <div key={p.id} className="flex items-center gap-2 py-1.5 border-b" style={{borderColor:'rgba(255,255,255,0.05)'}}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:p.metodo==='bluetooth'?'#00c8ff':'#94a3b8',boxShadow:`0 0 5px ${p.metodo==='bluetooth'?'#00c8ff':'#94a3b8'}80`}}/>
                <span className="text-xs font-medium text-white/80 flex-1">{p.animalNombre}</span>
                <span className="text-[10px] text-white/35">{p.fecha}</span>
                <span className="text-xs font-black" style={{color:'#ff9a3c'}}>{p.peso} kg</span>
                {p.peso>(p.pesoAnterior||p.peso) && <span className="text-[10px] font-semibold" style={{color:'#39ff7e'}}>+{p.peso-(p.pesoAnterior||0)}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* GPS Live */}
        <div className="rounded-2xl p-5 card-lift relative overflow-hidden" style={{background:'rgba(3,15,10,0.8)',border:'1px solid rgba(0,200,255,0.2)'}}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15 pointer-events-none" style={{background:'radial-gradient(circle,#00c8ff,transparent)',transform:'translate(40%,-40%)'}}/>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#00c8ff,#1d4ed8)',boxShadow:'0 0 16px rgba(0,200,255,0.4)'}}>
                <Navigation className="w-5 h-5 text-white"/>
              </div>
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  GPS Ganado Live
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md" style={{background:'rgba(0,200,255,0.15)',color:'#00c8ff',border:'1px solid rgba(0,200,255,0.3)'}}>PRO</span>
                </div>
                <div className="text-xs text-white/40 flex items-center gap-1">
                  <Signal className="w-3 h-3" style={{color:'#39ff7e'}}/> {gpsUbicaciones.filter(g=>g.activo).length} collares activos
                </div>
              </div>
            </div>
            <Link href="/gps"><span className="text-xs font-semibold flex items-center gap-1" style={{color:'#00c8ff'}}>Mapa GPS <ChevronRight size={12}/></span></Link>
          </div>
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[
              {v:gpsUbicaciones.length,l:'Collares',c:'#00c8ff'},
              {v:gpsUbicaciones.filter(g=>g.activo).length,l:'Online',c:'#39ff7e'},
              {v:gpsUbicaciones.filter(g=>g.bateria&&g.bateria<30).length,l:'Batería baja',c:'#ff4d6d'},
            ].map(s=>(
              <div key={s.l} className="rounded-xl p-3 text-center" style={{background:`rgba(${s.c==='#00c8ff'?'0,200,255':s.c==='#39ff7e'?'57,255,126':'255,77,109'},0.08)`,border:`1px solid ${s.c}25`}}>
                <div className="text-xl font-black" style={{color:s.c}}>{s.v}</div>
                <div className="text-[9px] text-white/40 uppercase">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] font-bold text-white/30 uppercase mb-2">Estado de collares</div>
          <div className="space-y-1.5">
            {gpsUbicaciones.slice(0,5).map(g=>(
              <div key={g.id} className="flex items-center gap-2 py-1.5 border-b" style={{borderColor:'rgba(255,255,255,0.05)'}}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:g.activo?'#39ff7e':'#ff4d6d',boxShadow:`0 0 5px ${g.activo?'#39ff7e':'#ff4d6d'}80`}}/>
                <span className="text-xs font-medium text-white/80 flex-1">{g.nombre}</span>
                <span className="text-[10px] text-white/35 truncate max-w-[80px]">{g.potreroNom}</span>
                <span className="text-[10px] font-bold" style={{color:g.bateria&&g.bateria<30?'#ff4d6d':'#39ff7e'}}>{g.bateria||85}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Módulos grid */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1 h-6 rounded-full" style={{background:'linear-gradient(180deg,#00f5d4,#00c896)',boxShadow:'0 0 8px rgba(0,245,212,0.6)'}}/>
          <h2 className="font-black text-lg text-white" style={{fontFamily:"'Sora',sans-serif"}}>Módulos CIVAC</h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(0,245,212,0.1)',color:'#00f5d4',border:'1px solid rgba(0,245,212,0.2)'}}>17 módulos</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {modulos.map(m=>(
            <Link key={m.href} href={m.href}>
              <div className="card-lift rounded-2xl p-3.5 cursor-pointer group"
                style={{background:'rgba(3,15,10,0.7)',border:`1px solid ${m.neon}18`,transition:'all 0.2s ease'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=`${m.neon}50`;(e.currentTarget as HTMLElement).style.boxShadow=`0 4px 20px ${m.neon}20`;}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=`${m.neon}18`;(e.currentTarget as HTMLElement).style.boxShadow='none';}}>
                <div className="text-2xl mb-2 transition-transform group-hover:scale-110">{m.emoji}</div>
                <div className="font-semibold text-xs text-white leading-tight mb-0.5">{m.title}</div>
                <div className="text-[9px] text-white/35 leading-tight">{m.desc}</div>
                {m.badge && (
                  <div className="mt-2">
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                      style={{background:m.badgePro?`${m.neon}20`:m.badgeRed?'rgba(255,77,109,0.2)':'rgba(255,255,255,0.1)',
                               color:m.badgePro?m.neon:m.badgeRed?'#ff4d6d':'rgba(255,255,255,0.7)',
                               border:`1px solid ${m.badgePro?`${m.neon}35`:m.badgeRed?'rgba(255,77,109,0.3)':'rgba(255,255,255,0.15)'}`}}>
                      {m.badge}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
