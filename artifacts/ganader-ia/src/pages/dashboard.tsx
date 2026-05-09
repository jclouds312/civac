import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAppState } from "../lib/data";
import { Bell, TrendingUp, AlertCircle, AlertTriangle, ChevronRight, Scale, Navigation, Bluetooth, Battery, Signal, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const dataProduccion = [
  { name: 'Oct', litros: 52000 },
  { name: 'Nov', litros: 55000 },
  { name: 'Dic', litros: 58000 },
  { name: 'Ene', litros: 62000 },
  { name: 'Feb', litros: 60000 },
  { name: 'Mar', litros: 56000 },
  { name: 'Abr', litros: 61300 },
];

const dataPeso = [
  { name: 'Oct', kg: 400 },
  { name: 'Nov', kg: 403 },
  { name: 'Dic', kg: 405 },
  { name: 'Ene', kg: 408 },
  { name: 'Feb', kg: 410 },
  { name: 'Mar', kg: 414 },
  { name: 'Abr', kg: 417 },
];

const COLORS_PIE = ['#2e7d32', '#1565c0', '#f57c00', '#6a1b9a'];

const modulos = [
  { icon: '🐄', title: 'Inventario', desc: 'Registro y seguimiento de cada animal', badge: '13', href: '/inventario' },
  { icon: '📋', title: 'Ficha Individual', desc: 'Historia clínica y eventos por bovino', badge: null, href: '/ficha' },
  { icon: '🔁', title: 'Reproducción', desc: 'Celos, inseminación, gestación y nacimientos', badge: '1', href: '/reproduccion' },
  { icon: '🥛', title: 'Producción', desc: 'Ordeños, litros/vaca, tendencias y calidad', badge: '84L', href: '/produccion' },
  { icon: '🧬', title: 'Genética', desc: 'DEP, índices genéticos y mejoramiento del hato', badge: null, href: '/genetica' },
  { icon: '🌿', title: 'Potreros', desc: 'Rotación, aforo, días de descanso y ocupación', badge: '6', href: '/potreros' },
  { icon: '🌾', title: 'Alimentación', desc: 'Raciones, minerales, sal y suplementos por lote', badge: null, href: '/alimentacion' },
  { icon: '💊', title: 'Insumos / Kardex', desc: 'Medicamentos, vacunas y materiales con stock', badge: '⚠ 4', href: '/insumos', badgeRed: true },
  { icon: '🧊', title: 'Semen y Embriones', desc: 'Inventario criogénico, donantes y TE', badge: null, href: '/semen' },
  { icon: '💰', title: 'Costos y Finanzas', desc: 'Ingresos, egresos, margen lechero y P&G', badge: null, href: '/costos' },
  { icon: '👷', title: 'Personal / Nómina', desc: 'Empleados, salarios, prestaciones y roles', badge: '6', href: '/personal' },
  { icon: '🤖', title: 'Predicciones IA', desc: 'Alertas inteligentes y recomendaciones', badge: null, href: '/prediccion' },
  { icon: '🌱', title: 'Huella Carbono', desc: 'Emisiones CH₄ y CO₂, bonos verdes', badge: null, href: '/co2' },
  { icon: '🗺️', title: 'Multi-Finca', desc: 'Gestione varias fincas desde un panel', badge: null, href: '/multifinca' },
  { icon: '⚖️', title: 'Pesaje BT', desc: 'Báscula Bluetooth, historial y GMD', badge: 'PRO', href: '/pesaje', badgePro: true },
  { icon: '📡', title: 'GPS Ganado', desc: 'Rastreo en tiempo real y geocercas', badge: 'PRO', href: '/gps', badgePro: true },
  { icon: '👥', title: 'Usuarios', desc: 'Gestión de accesos y permisos por rol', badge: null, href: '/usuarios' },
];

const insumosBajoStock = [
  { nombre: 'Prostaglandina', stock: 8, min: 15, unidad: 'frascos' },
  { nombre: 'Calcio i.v.', stock: 6, min: 12, unidad: 'frascos' },
  { nombre: 'Vacuna IBR/BVD', stock: 180, min: 250, unidad: 'dosis' },
  { nombre: 'Oxitocina 10UI', stock: 3, min: 10, unidad: 'frascos' },
];

const pieData = [
  { name: 'Vacas adultas', value: 7, pct: '54%' },
  { name: 'Novillas', value: 3, pct: '23%' },
  { name: 'Terneros/as', value: 2, pct: '15%' },
  { name: 'Toros', value: 1, pct: '8%' },
];

export default function Dashboard() {
  const { animals, potreros, personal, alertas, pesajes, gpsUbicaciones } = useAppState();
  const [chartTab, setChartTab] = useState<'produccion' | 'peso'>('produccion');

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? '¡Buenos días!' : hour < 18 ? '¡Buenas tardes!' : '¡Buenas noches!';

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1a5c2e] to-[#2d8a4e] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{greeting} 👋🏼</h1>
              </div>
              <p className="text-white/70 text-sm">
                {now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — {now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-white/60 text-xs mt-0.5">Tablero principal de GanaderIA — resumen en tiempo real de su hato</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">🐄 {animals.length} Animales</span>
            <span className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">🥛 5 En producción</span>
            <span className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">🌿 {potreros.length} Potreros</span>
            <span className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">👷 {personal.length} Staff activo</span>
            <span className="flex items-center gap-1.5 bg-white text-green-800 text-xs font-bold px-3 py-1.5 rounded-full ml-1">● Datos en vivo</span>
            <button className="relative bg-white/15 hover:bg-white/25 p-1.5 rounded-full border border-white/20">
              <Bell size={16} className="text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">3</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl p-4 text-white relative overflow-hidden shadow" style={{background:'linear-gradient(135deg,#1b5e20,#2e7d32)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">🐄 Total Animales</div>
          <div className="text-3xl font-bold">{animals.length}</div>
          <div className="text-[10px] text-white/60 mt-1">Meta: 250 · 5%</div>
        </div>
        <div className="rounded-xl p-4 text-white relative overflow-hidden shadow" style={{background:'linear-gradient(135deg,#0d47a1,#1565c0)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">🥛 Litros Hoy</div>
          <div className="text-3xl font-bold">84L</div>
          <div className="text-[10px] text-white/60 mt-1">5 vacas · 16.8 L/vaca</div>
        </div>
        <div className="rounded-xl p-4 text-white relative overflow-hidden shadow" style={{background:'linear-gradient(135deg,#e65100,#f57c00)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">⚖️ Peso Promedio</div>
          <div className="text-3xl font-bold">417 kg</div>
          <div className="text-[10px] text-white/60 mt-1">hato general</div>
        </div>
        <div className="rounded-xl p-4 text-white relative overflow-hidden shadow" style={{background:'linear-gradient(135deg,#4a148c,#6a1b9a)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">🤰 Gestantes</div>
          <div className="text-3xl font-bold">1</div>
          <div className="text-[10px] text-white/60 mt-1">8% del hato</div>
        </div>
        <div className="rounded-xl p-4 text-white relative overflow-hidden shadow" style={{background:'linear-gradient(135deg,#b71c1c,#c62828)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
            <span className="bg-white/20 text-white text-[8px] font-bold px-1.5 py-0.5 rounded mr-1">ALERTA</span>🏥 En Tratamiento
          </div>
          <div className="text-3xl font-bold">1</div>
          <div className="text-[10px] text-white/60 mt-1">⚠ Revisar hoy</div>
        </div>
        <div className="rounded-xl p-4 text-white relative overflow-hidden shadow" style={{background:'linear-gradient(135deg,#f57f17,#f9a825)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">💰 Valor del Hato</div>
          <div className="text-2xl font-bold">$51.200.000</div>
          <div className="text-[10px] text-white/60 mt-1">COP estimado</div>
        </div>
      </div>

      {/* 3-col analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Análisis de Pesos */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <span className="text-base">⚖️</span>
            </div>
            <div>
              <div className="font-semibold text-sm">Análisis de Pesos</div>
              <div className="text-xs text-muted-foreground">Promedio · metas por categoría</div>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-3">
            <div className="text-xs text-amber-400 uppercase font-semibold">Peso promedio hato</div>
            <div className="text-3xl font-bold text-amber-400">417 kg</div>
            <div className="text-xs text-muted-foreground">Biomasa total: <strong className="text-foreground">5.4 ton</strong></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon:'🐄', label:'Vacas adultas', kg:508, diff:'+28 vs 480kg', n:7, color:'text-green-400' },
              { icon:'🐮', label:'Novillas', kg:298, diff:'-22 vs 320kg', n:3, color:'text-red-400' },
              { icon:'🐣', label:'Terneros/as', kg:80, diff:'-70 vs 150kg', n:2, color:'text-red-400' },
              { icon:'🐂', label:'Toros', kg:810, diff:'+160 vs 650kg', n:1, color:'text-green-400' },
            ].map(c => (
              <div key={c.label} className="bg-muted/30 rounded-lg p-2.5">
                <div className="text-base mb-1">{c.icon}</div>
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="text-lg font-bold text-foreground">{c.kg} kg</div>
                <div className={`text-[10px] ${c.color}`}>{c.diff}</div>
                <div className="text-[10px] text-muted-foreground">{c.n} animales</div>
              </div>
            ))}
          </div>
        </div>

        {/* Producción Lechera */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <span className="text-base">🥛</span>
            </div>
            <div>
              <div className="font-semibold text-sm">Producción Lechera</div>
              <div className="text-xs text-muted-foreground">Vacas en ordeño activo</div>
            </div>
          </div>
          <div className="flex gap-4 mb-3">
            <div className="text-center"><div className="text-2xl font-bold text-blue-400">84</div><div className="text-[10px] text-muted-foreground uppercase">Litros/día</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-cyan-400">16.8</div><div className="text-[10px] text-muted-foreground uppercase">L/vaca prom</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-purple-400">5</div><div className="text-[10px] text-muted-foreground uppercase">En ordeño</div></div>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Meta diaria</span><span className="font-semibold">93% — 84 / 90 L</span></div>
            <div className="h-2 bg-muted/40 rounded-full"><div className="h-2 bg-amber-500 rounded-full" style={{width:'93%'}} /></div>
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Distribución por rango</div>
          {[['< 10 L','0'],['10-15 L','0'],['15-20 L','5','bg-blue-500'],['> 20 L','0']].map(([r,v,c]) => (
            <div key={r} className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground w-16">{r}</span>
              <div className="flex-1 mx-2 h-1.5 bg-muted/30 rounded-full"><div className={`h-1.5 rounded-full ${c||'bg-muted'}`} style={{width:`${Number(v)*15}%`}} /></div>
              <span className="text-xs font-medium w-3 text-right">{v}</span>
            </div>
          ))}
          <div className="mt-3 border-t border-border pt-2">
            <div className="text-xs font-semibold text-amber-400 mb-1">🏆 Top producción</div>
            {[['1°','Rosaura','18.4 L'],['2°','Estrella','17.8 L'],['3°','Cielo','16.9 L']].map(([pos,n,l]) => (
              <div key={n} className="flex justify-between text-xs py-0.5">
                <span className="text-muted-foreground">{pos} {n}</span>
                <span className="font-bold text-cyan-400">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Manejo de Potreros */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="text-base">🌿</span>
              </div>
              <div>
                <div className="font-semibold text-sm">Manejo de Potreros</div>
                <div className="text-xs text-muted-foreground">Rotación y estado actual</div>
              </div>
            </div>
            <Link href="/potreros" className="text-xs text-primary hover:underline flex items-center gap-1">Ver todos <ChevronRight size={12} /></Link>
          </div>
          <div className="flex gap-3 mb-3">
            <div className="text-center flex-1 bg-muted/20 rounded-lg py-2">
              <div className="text-xl font-bold">6</div>
              <div className="text-[10px] text-muted-foreground uppercase">Total</div>
            </div>
            <div className="text-center flex-1 bg-muted/20 rounded-lg py-2">
              <div className="text-xl font-bold text-green-400">1</div>
              <div className="text-[10px] text-muted-foreground uppercase">Disponibles</div>
            </div>
            <div className="text-center flex-1 bg-muted/20 rounded-lg py-2">
              <div className="text-xl font-bold text-blue-400">27</div>
              <div className="text-[10px] text-muted-foreground uppercase">Hectáreas</div>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 mb-3 text-xs">
            <span className="text-amber-400 font-semibold">⚡ ¡Rotar en los próximos días!</span>
            <span className="text-muted-foreground ml-1">Potrero 4</span>
          </div>
          {[
            { n:'Potrero 6', ha:'3.5 ha', s:'Ocupado', dot:'bg-orange-500' },
            { n:'Potrero 5', ha:'6 ha', s:'Listo', dot:'bg-green-500' },
            { n:'Potrero 4', ha:'4.2 ha', s:'Rotar pronto', dot:'bg-red-500', extra:'3d' },
            { n:'Potrero 3', ha:'5.1 ha', s:'Ocupado', dot:'bg-orange-500' },
            { n:'Potrero 2', ha:'3.8 ha', s:'Descanso', dot:'bg-blue-500' },
          ].map(p => (
            <div key={p.n} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`} />
              <span className="text-xs font-medium flex-1">{p.n}</span>
              <span className="text-[10px] text-muted-foreground">{p.ha}</span>
              <span className={`text-[10px] font-semibold ${p.dot==='bg-red-500'?'text-red-400':p.dot==='bg-green-500'?'text-green-400':p.dot==='bg-blue-500'?'text-blue-400':'text-orange-400'}`}>{p.s}{p.extra ? ` · ${p.extra}` : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Evolución Histórica */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-400" />
            </div>
            <div>
              <div className="font-semibold">Evolución Histórica</div>
              <div className="text-xs text-muted-foreground">Últimos 7 meses · Oct 2024 — Abr 2025</div>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setChartTab('produccion')} className={`text-xs px-3 py-1 rounded-md font-medium ${chartTab==='produccion'?'bg-primary text-white':'bg-muted/40 text-muted-foreground hover:bg-muted/60'}`}>Producción Lechera</button>
            <button onClick={() => setChartTab('peso')} className={`text-xs px-3 py-1 rounded-md font-medium ${chartTab==='peso'?'bg-primary text-white':'bg-muted/40 text-muted-foreground hover:bg-muted/60'}`}>Peso del Ganado</button>
          </div>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartTab === 'produccion' ? dataProduccion : dataPeso} margin={{top:5,right:20,left:0,bottom:0}}>
              <defs>
                <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#444" tick={{fill:'#888',fontSize:11}} />
              <YAxis stroke="#444" tick={{fill:'#888',fontSize:11}} width={50} />
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} />
              <Area type="monotone" dataKey={chartTab==='produccion'?'litros':'kg'} stroke="#4ade80" strokeWidth={2} fillOpacity={1} fill="url(#dashGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row: pie + alertas + KPIs repro + financiero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Composición + Alertas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Pie */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="font-semibold text-sm mb-3">🐄 Composición del hato</div>
            <div className="text-xs text-muted-foreground mb-2">{animals.length} animales registrados</div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={55} strokeWidth={0}>
                    {pieData.map((_,i) => <Cell key={i} fill={COLORS_PIE[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {pieData.map((d,i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs py-0.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:COLORS_PIE[i]}} />
                <span className="text-muted-foreground flex-1">{d.name}</span>
                <span className="font-medium">{d.value} ({d.pct})</span>
              </div>
            ))}
          </div>
          {/* Alertas */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm">Alertas activas</div>
              <Link href="/alertas" className="text-xs text-primary hover:underline">Ver todas →</Link>
            </div>
            <div className="space-y-2">
              {alertas.slice(0,4).map(a => (
                <div key={a.id} className="flex items-start gap-2">
                  {a.type === 'danger'
                    ? <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    : <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  }
                  <div>
                    <div className={`text-xs font-semibold ${a.type==='danger'?'text-red-400':'text-amber-400'}`}>{a.title}</div>
                    <div className="text-[10px] text-muted-foreground">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs reproductivos + resumen financiero */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* KPIs Reproductivos */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="font-semibold text-sm mb-3">🔁 KPIs Reproductivos</div>
            {[
              { label:'Tasa de concepción', val:'62%', meta:'meta 70%', ok:false },
              { label:'Vacas gestantes', val:'8%', meta:'meta 50%', ok:false },
              { label:'Destetes exitosos', val:'94%', meta:'meta 90%', ok:true },
              { label:'Natalidad anual', val:'78%', meta:'meta 85%', ok:false },
            ].map(k => (
              <div key={k.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted-foreground">{k.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">{k.val}</span>
                  <span className="text-[10px] text-muted-foreground">{k.meta}</span>
                  <span className={k.ok ? 'text-green-400 text-[10px]' : 'text-red-400 text-[10px]'}>{k.ok ? '✓' : '✗'}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Resumen Financiero */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="font-semibold text-sm mb-3">💰 Resumen Financiero</div>
            <div className="text-[10px] text-muted-foreground mb-2">Mes actual · COP</div>
            {[
              { label:'Ingresos totales', val:'$85.750.000', color:'text-green-400' },
              { label:'└ Venta de leche', val:'$70.050.000', color:'text-muted-foreground', indent:true },
              { label:'└ Venta animales', val:'$12.500.000', color:'text-muted-foreground', indent:true },
              { label:'Egresos totales', val:'($45.500.000)', color:'text-red-400' },
              { label:'Utilidad neta', val:'$40.250.000', color:'text-green-400', bold:true },
            ].map(r => (
              <div key={r.label} className={`flex justify-between text-xs py-0.5 ${r.indent?'pl-2':''}`}>
                <span className="text-muted-foreground">{r.label}</span>
                <span className={`font-medium ${r.color} ${r.bold?'font-bold':''}`}>{r.val}</span>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-border flex justify-between text-xs">
              <span className="text-muted-foreground">Margen: 47% · Costo/L: $820</span>
            </div>
          </div>
        </div>
      </div>

      {/* PRO Widgets: Pesaje BT + GPS Live */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pesaje BT Widget */}
        <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/30">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm flex items-center gap-2">
                  Pesaje Bluetooth
                  <span className="text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full">PRO</span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Bluetooth className="w-3 h-3 text-blue-400" />
                  {pesajes.filter(p => p.metodo === 'bluetooth').length} registros BT hoy
                </div>
              </div>
            </div>
            <Link href="/pesaje" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">
              Ir al módulo <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-amber-400">{pesajes.length}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Total pesajes</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-400">{pesajes.filter(p => p.metodo === 'bluetooth').length}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Via Bluetooth</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-400">
                +{pesajes.length > 0 ? Math.round(pesajes.reduce((acc, p) => acc + (p.peso - (p.pesoAnterior || p.peso)), 0) / pesajes.length) : 0} kg
              </div>
              <div className="text-[10px] text-muted-foreground uppercase">GMD prom</div>
            </div>
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Últimos pesajes</div>
          <div className="space-y-1.5">
            {pesajes.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center gap-2 py-1 border-b border-border/40 last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.metodo === 'bluetooth' ? 'bg-blue-400' : 'bg-gray-400'}`} />
                <span className="text-xs font-medium flex-1">{p.animalNombre}</span>
                <span className="text-xs text-muted-foreground">{p.fecha}</span>
                <span className="text-xs font-bold text-amber-400">{p.peso} kg</span>
                {p.peso > (p.pesoAnterior || p.peso) && (
                  <span className="text-[10px] text-green-400">+{p.peso - (p.pesoAnterior || 0)}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* GPS Widget */}
        <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-900/30">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm flex items-center gap-2">
                  GPS Ganado
                  <span className="text-[9px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full">PRO</span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Signal className="w-3 h-3 text-green-400" />
                  {gpsUbicaciones.filter(g => g.activo).length} collares activos
                </div>
              </div>
            </div>
            <Link href="/gps" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
              Ver mapa <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-cyan-400">{gpsUbicaciones.length}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Con collar GPS</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-400">{gpsUbicaciones.filter(g => g.activo).length}</div>
              <div className="text-[10px] text-muted-foreground uppercase">En línea</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-red-400">{gpsUbicaciones.filter(g => g.bateria < 30).length}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Batería baja</div>
            </div>
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Estado collares</div>
          <div className="space-y-1.5">
            {gpsUbicaciones.slice(0, 4).map(g => (
              <div key={g.id} className="flex items-center gap-2 py-1 border-b border-border/40 last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${g.activo ? 'bg-green-400' : 'bg-gray-500'}`} />
                <span className="text-xs font-medium flex-1">{g.nombre}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{g.potreroNom}
                </span>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${g.bateria < 30 ? 'text-red-400' : g.bateria < 50 ? 'text-amber-400' : 'text-green-400'}`}>
                  <Battery className="w-3 h-3" />{g.bateria}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insumos urgentes */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-sm">Insumos por reponer urgente</div>
          <Link href="/insumos" className="text-xs text-primary hover:underline">Ir a Insumos →</Link>
        </div>
        <div className="text-xs text-muted-foreground mb-3">4 producto(s) bajo stock mínimo</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {insumosBajoStock.map(i => (
            <div key={i.nombre} className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
              <div className="text-xs font-semibold text-red-400 mb-2">{i.nombre}</div>
              <div className="h-1.5 bg-muted/30 rounded-full mb-1">
                <div className="h-1.5 bg-red-500 rounded-full" style={{width:`${(i.stock/i.min)*40}%`}} />
              </div>
              <div className="text-[10px] text-muted-foreground">Stock: <strong className="text-foreground">{i.stock}</strong> / Mín: {i.min} {i.unidad}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Módulos */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="font-semibold mb-1">🗂️ Módulos de GanaderIA</div>
        <div className="text-xs text-muted-foreground mb-4">Acceso rápido a todas las secciones del sistema</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {modulos.map(m => (
            <Link key={m.href} href={m.href} className="block bg-muted/20 hover:bg-muted/40 border border-border rounded-xl p-3 transition-colors group">
              <div className="text-2xl mb-2">{m.icon}</div>
              <div className="text-xs font-bold text-foreground group-hover:text-primary mb-1">{m.title}</div>
              <div className="text-[10px] text-muted-foreground line-clamp-2">{m.desc}</div>
              {m.badge && (
                <div className={`mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block ${m.badgeRed ? 'bg-red-500/20 text-red-400' : (m as any).badgePro ? 'bg-amber-500/20 text-amber-400' : 'bg-primary/20 text-primary'}`}>{m.badge}</div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
