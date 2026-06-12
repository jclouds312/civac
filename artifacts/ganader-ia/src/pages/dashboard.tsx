import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { useAppState } from "../lib/data";
import { useAuth, PLAN_COLOR, PLAN_COLOR2, PLAN_GLOW, PLAN_ICON, PLAN_LABEL, type PlanId } from "@/lib/auth";
import { usePlanTheme } from "@/lib/plan-theme";
import { useTheme } from "@/lib/theme";
import { PlanWidgets } from "@/components/plan-widgets";
import {
  Bell, TrendingUp, TrendingDown, AlertCircle, AlertTriangle,
  ChevronRight, Activity, Zap, Target, BarChart2, Printer,
  Beef, Droplets, Heart, Dna, Leaf, Wheat, Package, DollarSign,
  FlaskConical, Users, Sparkles, Scale, Satellite, Building2,
  FileText, UserCog, Tag, Shield, Bot, Layers, Navigation,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { printModule } from "@/lib/print";
import { Button } from "@/components/ui/button";

/* ── Animated count-up hook ── */
function useCountUp(target: number, duration = 900, trigger = true): number {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      setVal(Math.round(ease * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, trigger]);
  return val;
}

/* ── Live clock ── */
function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

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
const TIP = { backgroundColor:'#030f0b', border:'1px solid rgba(0,245,212,0.2)', color:'#e2e8f0', borderRadius:'12px', fontSize:'12px' };
const TIP_LIGHT = { backgroundColor:'#f5f0e2', border:'1px solid rgba(80,120,60,0.3)', color:'#2a2010', borderRadius:'12px', fontSize:'12px' };

const MODULOS: Array<{
  icon: ReactNode; title: string; desc: string; href: string;
  from: string; to: string; glow: string; badge?: string | null;
  lFrom: string; lTo: string; lText: string; red?: boolean;
}> = [
  { icon:<Beef size={20}/>,       title:'Inventario',       desc:'Registro RFID · 13 bovinos',       href:'/inventario',    from:'#39ff7e', to:'#00c850', glow:'57,255,126',  badge:'13',  lFrom:'#b8f0cc', lTo:'#90e8b0', lText:'#1a5a30' },
  { icon:<Droplets size={20}/>,   title:'Producción',       desc:'84 L/día · 5 vacas ordeño',        href:'/produccion',    from:'#00c8ff', to:'#0ea5e9', glow:'0,200,255',   badge:'84L', lFrom:'#b0dcff', lTo:'#88c8f8', lText:'#0a3a70' },
  { icon:<Heart size={20}/>,      title:'Reproducción',     desc:'Celos · IA · Gestación',           href:'/reproduccion',  from:'#ff6fd8', to:'#c026d3', glow:'255,111,216', badge:'1↑',  lFrom:'#f8c0f0', lTo:'#f0a0e8', lText:'#6a0a68' },
  { icon:<Dna size={20}/>,        title:'Genética',         desc:'DEP · Ranking · Pedigrí',          href:'/genetica',      from:'#a855f7', to:'#7c3aed', glow:'168,85,247',  badge:null,  lFrom:'#e0c8fc', lTo:'#d0a8f8', lText:'#4a1a80' },
  { icon:<Leaf size={20}/>,       title:'Potreros',         desc:'6 lotes · Rotación activa',        href:'/potreros',      from:'#84ef34', to:'#65a30d', glow:'132,239,52',  badge:'6',   lFrom:'#d0f090', lTo:'#b4e060', lText:'#285010' },
  { icon:<Wheat size={20}/>,      title:'Alimentación',     desc:'Raciones · Minerales · TMR',       href:'/alimentacion',  from:'#ffd166', to:'#f59e0b', glow:'255,209,102', badge:null,  lFrom:'#fff0a0', lTo:'#ffe070', lText:'#603800' },
  { icon:<Package size={20}/>,    title:'Insumos / Kardex', desc:'4 ítems bajo stock mínimo',        href:'/insumos',       from:'#ff4d6d', to:'#c9184a', glow:'255,77,109',  badge:'⚠4',  lFrom:'#ffc0c8', lTo:'#ff9cac', lText:'#7a0820', red:true },
  { icon:<DollarSign size={20}/>, title:'Costos y P&G',     desc:'$40.2M · Margen 35%',              href:'/costos',        from:'#34d399', to:'#059669', glow:'52,211,153',  badge:null,  lFrom:'#b0f4d4', lTo:'#88e8b8', lText:'#0a4830' },
  { icon:<FlaskConical size={20}/>,title:'Semen y Embriones',desc:'Inventario criogénico · TE',     href:'/semen',         from:'#818cf8', to:'#4f46e5', glow:'129,140,248', badge:null,  lFrom:'#c8d0fc', lTo:'#a8b8f8', lText:'#1a1870' },
  { icon:<Users size={20}/>,      title:'Personal',         desc:'6 empleados · Nómina activa',      href:'/personal',      from:'#94a3b8', to:'#64748b', glow:'148,163,184', badge:'6',   lFrom:'#d4dce8', lTo:'#bcccd8', lText:'#2a3848' },
  { icon:<Sparkles size={20}/>,   title:'Predicciones IA',  desc:'Simulador financiero · 12m',       href:'/prediccion',    from:'#e879f9', to:'#9333ea', glow:'232,121,249', badge:'PRO', lFrom:'#f0c0fc', lTo:'#e098f8', lText:'#580870' },
  { icon:<Activity size={20}/>,   title:'Huella Carbono',   desc:'IPCC 2019 · Bonos CO₂',           href:'/co2',           from:'#4ade80', to:'#16a34a', glow:'74,222,128',  badge:null,  lFrom:'#c0f4d0', lTo:'#98e8b0', lText:'#0a4820' },
  { icon:<Scale size={20}/>,      title:'Pesaje BT',        desc:'Báscula Bluetooth · GMD',          href:'/pesaje',        from:'#ff9a3c', to:'#ea580c', glow:'255,154,60',  badge:'PRO', lFrom:'#ffeac0', lTo:'#ffd098', lText:'#602800' },
  { icon:<Satellite size={20}/>,  title:'GPS Ganado',       desc:'Rastreo en tiempo real',           href:'/gps',           from:'#00c8ff', to:'#1d4ed8', glow:'0,200,255',   badge:'PRO', lFrom:'#c0e4ff', lTo:'#98ccf8', lText:'#0a2868' },
  { icon:<Building2 size={20}/>,  title:'Multi-Finca',      desc:'3 fincas · Gestión centralizada',  href:'/multifinca',    from:'#22d3ee', to:'#0891b2', glow:'34,211,238',  badge:null,  lFrom:'#b0f0fc', lTo:'#88e0f4', lText:'#083a50' },
  { icon:<FileText size={20}/>,   title:'Ficha Individual', desc:'Historia clínica por animal',      href:'/ficha',         from:'#00f5d4', to:'#00a8cc', glow:'0,245,212',   badge:null,  lFrom:'#b0f8f0', lTo:'#88f0e4', lText:'#083840' },
  { icon:<UserCog size={20}/>,    title:'Usuarios',         desc:'Accesos · Permisos por rol',       href:'/usuarios',      from:'#c084fc', to:'#7c3aed', glow:'192,132,252', badge:null,  lFrom:'#e8c8fc', lTo:'#d8a8f8', lText:'#3a0878' },
  { icon:<Scale size={20}/>,      title:'Pesaje Manual',    desc:'CC · GMD · Recibo PDF',            href:'/pesaje-manual', from:'#fb923c', to:'#c2410c', glow:'251,146,60',  badge:'CC',  lFrom:'#fee0c0', lTo:'#fdc898', lText:'#602800' },
  { icon:<Shield size={20}/>,     title:'Sanidad Animal',   desc:'Protocolos · Tratamientos · ICA', href:'/sanidad',       from:'#00f5d4', to:'#00a896', glow:'0,245,212',   badge:'NEW', lFrom:'#b0f8f0', lTo:'#88f0e4', lText:'#083840' },
  { icon:<Tag size={20}/>,        title:'Trazabilidad ICA', desc:'Guías · QR · SINIGAN',             href:'/trazabilidad',  from:'#a855f7', to:'#7c3aed', glow:'168,85,247',  badge:'NEW', lFrom:'#e8c8fc', lTo:'#d8a8f8', lText:'#3a0878' },
];

function StatTicker() {
  const items = [
    '🐄 13 Animales activos · RFID registrados','🥛 84 L/día · 5 vacas en ordeño','💰 $40.2M utilidad · Marzo 2026',
    '⚠ 4 alertas insumos por resolver','🌿 6 potreros · Rotación activa kikuyo','📡 GPS Real-Time · 13 collares LTE online',
    '🤖 Asesora IA disponible 24/7','🧬 DEP Score: 94.2 · Hato certificado','🌱 -18% huella CO₂ · Meta IPCC 2019',
    '🩺 Sanidad ICA · 10 registros · Sin brotes','🏷️ Trazabilidad SINIGAN · 100% activa','⚖️ Pesaje BT · 8 drivers COM · 11 BLE',
    '☁️ Analytics Server v2.0 · ONLINE','💼 CRM Ventas · 3 prospectos activos · Pipeline',
    '🚀 CIVAC PRO v2.0 · 34+ módulos · Lanzamiento Colombia','📡 MQTT mqtt.civac.co · 1883 · 13 collares',
    '🇨🇴 Hecho en Colombia · 100% Colombiano · CIVAC®',
  ];
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden flex-1 min-w-0" style={{maskImage:'linear-gradient(90deg,transparent,black 8%,black 92%,transparent)'}}>
      <div className="flex gap-6 whitespace-nowrap ticker-scroll">
        {doubled.map((t, i) => (
          <span key={i} className="text-[11px] sm:text-xs font-medium flex-shrink-0" style={{color:'rgba(0,245,212,0.6)'}}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { animals, potreros, personal, alertas, pesajes } = useAppState();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pt = usePlanTheme();
  const [chartTab, setChartTab] = useState<'produccion'|'peso'|'finanzas'>('produccion');
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 200); return () => clearTimeout(t); }, []);
  const now  = useLiveClock();
  const hour = now.getHours();

  /* ── Animated KPI counters ── */
  const totalAnimated    = useCountUp(animals.length || 13, 800, mounted);
  const potrerosAnimated = useCountUp(potreros.length || 6, 700, mounted);
  const personalAnimated = useCountUp(personal.length || 6, 600, mounted);
  const alertasAnimated  = useCountUp(alertas.length || 4,  500, mounted);
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  const total    = animals.length || 13;
  const vacasN   = animals.filter(a => a.categoria === 'Vaca').length || 7;
  const novillasN= animals.filter(a => a.categoria === 'Novilla').length || 3;
  const ternerosN= animals.filter(a => (a.categoria||'').toLowerCase().includes('ternero') || (a.categoria||'').toLowerCase().includes('ternera')).length || 2;
  const torosN   = animals.filter(a => a.categoria === 'Toro').length || 1;

  const pieData = [
    { name:'Vacas',    value:vacasN,    pct:`${Math.round(vacasN/total*100)}%` },
    { name:'Novillas', value:novillasN, pct:`${Math.round(novillasN/total*100)}%` },
    { name:'Terneros', value:ternerosN, pct:`${Math.round(ternerosN/total*100)}%` },
    { name:'Toros',    value:torosN,    pct:`${Math.round(torosN/total*100)}%` },
  ];

  const plan = (user?.plan ?? 'basico') as PlanId;
  const roleBanners: Record<string, { bg: string; accent1: string; accent2: string; glow: string }> = {
    vet:        { bg:'linear-gradient(135deg,#001228 0%,#001840 35%,#001a50 70%,#001030 100%)', accent1:'#00c8ff', accent2:'#0ea5e9', glow:'0,200,255' },
    field:      { bg:'linear-gradient(135deg,#001408 0%,#002010 35%,#001c08 70%,#001208 100%)', accent1:'#39ff7e', accent2:'#00c850', glow:'57,255,126' },
    viewer:     { bg:'linear-gradient(135deg,#1a0830 0%,#280a40 35%,#200838 70%,#160628 100%)', accent1:'#a855f7', accent2:'#7c3aed', glow:'168,85,247' },
    developer:  { bg:'linear-gradient(135deg,#001408 0%,#001e0a 35%,#001c0a 70%,#001008 100%)', accent1:'#00ff88', accent2:'#00d4ff', glow:'0,255,136' },
    admin:      { bg:'linear-gradient(135deg,#1a0800 0%,#2a1000 35%,#240e00 70%,#180800 100%)', accent1:'#ff9500', accent2:'#ff6b00', glow:'255,149,0' },
    superadmin: { bg:'linear-gradient(135deg,#1a0800 0%,#2a1000 35%,#240e00 70%,#180800 100%)', accent1:'#ff9500', accent2:'#ff6b00', glow:'255,149,0' },
  };
  const roleTooltips: Record<string, { label: string; icon: string; desc: string }> = {
    vet:        { label:'Veterinario',      icon:'🩺', desc:'Sanidad · Reproducción · Genética' },
    field:      { label:'Operario Campo',   icon:'🌾', desc:'Pesaje · GPS · Potreros' },
    viewer:     { label:'Visor / Inversor', icon:'👁', desc:'Solo lectura · KPIs' },
    developer:  { label:'Desarrollador',   icon:'💻', desc:'Consola CIVAC · APIs' },
    admin:      { label:'Administrador',   icon:'👑', desc:'Panel Admin · Facturación' },
    superadmin: { label:'Super Admin',     icon:'⚡', desc:'Acceso total · CIVAC' },
  };
  const defaultBanner = { bg:'linear-gradient(135deg,#002e20 0%,#003d2e 35%,#003358 70%,#002050 100%)', accent1:'#00f5d4', accent2:'#00c8ff', glow:'0,245,212' };
  const rb = roleBanners[user?.role ?? ''] ?? defaultBanner;
  const rt = roleTooltips[user?.role ?? ''];

  const kpiCards = [
    {
      label:'Total hato', emoji:'🐄', val:totalAnimated, sub:'animales registrados', trend:'+2', up:true,
      grad:'linear-gradient(145deg,#002a1e,#003d2e,#004a38)',
      lGrad:'linear-gradient(145deg,#b8f0cc,#90e8b0)',
      neon:'#00f5d4', glow:'0,245,212', lText:'#0e4a28',
      icon:<Activity size={14}/>, href:'/inventario',
    },
    {
      label:'Producción hoy', emoji:'🥛', val:'84 L', sub:'5 vacas · 16.8 L/c', trend:'+6%', up:true,
      grad:'linear-gradient(145deg,#001830,#002040,#002850)',
      lGrad:'linear-gradient(145deg,#b0dcff,#88c8f8)',
      neon:'#00c8ff', glow:'0,200,255', lText:'#083870',
      icon:<TrendingUp size={14}/>, href:'/produccion',
    },
    {
      label:'Alertas', emoji:'🔔', val:alertasAnimated, sub:'requieren acción', trend:'3 críticas', up:false,
      grad:'linear-gradient(145deg,#2a0010,#3d0015,#4d0020)',
      lGrad:'linear-gradient(145deg,#ffc0c8,#ff9cac)',
      neon:'#ff4d6d', glow:'255,77,109', lText:'#7a0820',
      icon:<AlertCircle size={14}/>, href:'/alertas',
    },
    {
      label:'Potreros', emoji:'🌿', val:potrerosAnimated, sub:'áreas activas', trend:'1 libre', up:true,
      grad:'linear-gradient(145deg,#122800,#1a3d00,#1e4a00)',
      lGrad:'linear-gradient(145deg,#d0f090,#b4e060)',
      neon:'#84ef34', glow:'132,239,52', lText:'#284a10',
      icon:<Target size={14}/>, href:'/potreros',
    },
    {
      label:'Personal', emoji:'👷', val:personalAnimated, sub:'empleados activos', trend:'todos OK', up:true,
      grad:'linear-gradient(145deg,#12182a,#182030,#1a2840)',
      lGrad:'linear-gradient(145deg,#d4dce8,#bcccd8)',
      neon:'#94a3b8', glow:'148,163,184', lText:'#283848',
      icon:<BarChart2 size={14}/>, href:'/personal',
    },
    {
      label:'Utilidad neta', emoji:'💰', val:'$40.2M', sub:'mes actual · COP', trend:'+12%', up:true,
      grad:'linear-gradient(145deg,#001820,#002028,#002830)',
      lGrad:'linear-gradient(145deg,#b0f4d4,#88e8b8)',
      neon:'#34d399', glow:'52,211,153', lText:'#084830',
      icon:<Zap size={14}/>, href:'/costos',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 civac-animate">

      {/* ── HERO BANNER ──────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden module-banner"
        style={{
          background: rb.bg,
          border:`1px solid rgba(${rb.glow},0.22)`,
          boxShadow:`0 0 50px rgba(${rb.glow},0.08), 0 8px 40px rgba(0,0,0,0.4)`,
        }}>
        {/* HD aerial farm background */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:"url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1400&q=75&auto=format&fit=crop')", backgroundSize:"cover", backgroundPosition:"center", opacity: 0.13 }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:`linear-gradient(135deg,${rb.bg}dd 0%,${rb.bg}88 50%,${rb.bg}cc 100%)` }} />
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full pointer-events-none"
          style={{background:`radial-gradient(circle,rgba(${rb.glow},0.18),transparent 70%)`}}/>
        <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full pointer-events-none"
          style={{background:`radial-gradient(circle,rgba(${rb.glow},0.10),transparent 70%)`}}/>
        <div className="absolute top-0 right-1/3 w-48 h-48 rounded-full pointer-events-none"
          style={{background:`radial-gradient(circle,rgba(${rb.glow},0.06),transparent 70%)`}}/>
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:`repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(${rb.glow},0.025) 28px,rgba(${rb.glow},0.025) 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(${rb.glow},0.025) 28px,rgba(${rb.glow},0.025) 29px)`,
        }}/>
        {/* Top accent line — role color */}
        <div className="h-0.5 w-full" style={{background:`linear-gradient(90deg,transparent,${rb.accent1},${rb.accent2},transparent)`}}/>
        {/* Plan metallic stripe (if non-basic plan) */}
        {plan !== 'basico' && (
          <div className="absolute top-0.5 right-0 h-px w-1/3 opacity-40"
            style={{background:`linear-gradient(270deg,transparent,${PLAN_COLOR[plan]})`}}/>
        )}

        <div className="relative p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-1.5 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-black text-white" style={{fontFamily:"'Sora',sans-serif"}}>
                  {greeting}, {user?.nombre?.split(' ')[0] || 'Admin'} 👋
                </h1>
                <span className="text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1.5"
                  style={{background:`rgba(${rb.glow},0.18)`,color:rb.accent1,border:`1px solid rgba(${rb.glow},0.35)`}}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{background:rb.accent1}}/>
                  CIVAC Live
                </span>
                {plan !== 'basico' && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full hidden sm:flex items-center gap-1"
                    style={{background:`rgba(${PLAN_GLOW[plan]},0.15)`,color:PLAN_COLOR[plan],border:`1px solid rgba(${PLAN_GLOW[plan]},0.35)`}}>
                    {PLAN_ICON[plan]} {PLAN_LABEL[plan]}
                  </span>
                )}
                {rt && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full hidden sm:flex items-center gap-1"
                    title={rt.desc}
                    style={{background:`rgba(${rb.glow},0.12)`,color:`rgba(${rb.glow},0.9)`,border:`1px solid rgba(${rb.glow},0.25)`}}>
                    {rt.icon} {rt.label}
                  </span>
                )}
              </div>
              <p className="text-white/55 text-xs sm:text-sm">
                {now.toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                &nbsp;·&nbsp;{now.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}
              </p>
              <p className="text-[10px] sm:text-xs mt-0.5" style={{color:`rgba(${rb.glow},0.35)`}}>Control Inteligente de Valor Agropecuario · CIVAC PRO v2.0</p>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[
                {v:`${animals.length}`, l:'Animales', e:'🐄', c:'0,245,212'},
                {v:'5',                  l:'Ordeños',  e:'🥛', c:'0,200,255'},
                {v:`${potreros.length}`, l:'Potreros', e:'🌿', c:'132,239,52'},
                {v:`${personal.length}`, l:'Staff',    e:'👷', c:'148,163,184'},
              ].map(t=>(
                <div key={t.l} className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold"
                  style={{background:`rgba(${t.c},0.1)`,color:`rgba(${t.c},0.9)`,border:`1px solid rgba(${t.c},0.2)`}}>
                  {t.e} <strong>{t.v}</strong> <span className="opacity-60">{t.l}</span>
                </div>
              ))}
              <Button size="sm" onClick={() => printModule('Dashboard CIVAC', 'Resumen general del sistema')}
                className="h-8 gap-1 text-[11px] px-2.5"
                style={{background:'rgba(57,255,126,0.08)',border:'1px solid rgba(57,255,126,0.25)',color:'#39ff7e'}}>
                <Printer size={12}/> PDF
              </Button>
              <Link href="/alertas">
                <button className="relative p-2 sm:p-2.5 rounded-xl transition-all hover:scale-110"
                  style={{background:'rgba(255,77,109,0.15)',border:'1px solid rgba(255,77,109,0.3)'}}>
                  <Bell size={15} className="text-rose-400"/>
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-black animate-pulse"
                    style={{background:'#ff4d6d',boxShadow:'0 0 8px rgba(255,77,109,0.8)'}}>
                    {alertas.length}
                  </span>
                </button>
              </Link>
            </div>
          </div>
          {/* Ticker */}
          <div className="flex items-center gap-3 overflow-hidden"
            style={{background:'rgba(0,0,0,0.25)',borderRadius:12,padding:'7px 14px',border:'1px solid rgba(0,245,212,0.1)'}}>
            <span className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md flex-shrink-0"
              style={{background:'rgba(0,245,212,0.15)',color:'#00f5d4',border:'1px solid rgba(0,245,212,0.3)'}}>
              LIVE
            </span>
            <StatTicker/>
          </div>
        </div>
      </div>

      {/* ── 6 KPI CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {kpiCards.map((k, i) => (
          <Link key={k.label} href={k.href}>
            <div className="kpi-card cursor-pointer group" style={{
              background: isDark ? k.grad : k.lGrad,
              border: isDark
                ? `1px solid rgba(${pt.glow},0.30)`
                : `2px solid rgba(${pt.glow},0.40)`,
              boxShadow: isDark
                ? `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(${pt.glow},0.10), 0 0 22px rgba(${pt.glow},0.06)`
                : `0 4px 16px rgba(${k.glow},0.22), 0 1px 4px rgba(0,0,0,0.08), 0 0 14px rgba(${pt.glow},0.08)`,
              borderRadius:20,
              padding:'14px 12px',
              animationDelay:`${i*60}ms`,
            }}
            onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.boxShadow=`0 0 28px rgba(${k.glow},0.35), 0 8px 30px rgba(0,0,0,0.2), 0 0 16px rgba(${pt.glow},0.15)`;}}
            onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.boxShadow=isDark?`inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(${pt.glow},0.10), 0 0 22px rgba(${pt.glow},0.06)`:`0 4px 16px rgba(${k.glow},0.22), 0 1px 4px rgba(0,0,0,0.08), 0 0 14px rgba(${pt.glow},0.08)`;}}
            >
              {/* Plan metallic top stripe */}
              <div className="absolute top-0 left-0 right-0 h-px rounded-t-[20px]"
                style={{background: pt.cardTopStripe, opacity: 0.7}}/>
              {/* Glow blob */}
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
                style={{background:`radial-gradient(circle,rgba(${k.glow},${isDark?'0.22':'0.18'}),transparent)`,transform:'translate(40%,-40%)',opacity:isDark?1:0.7}}/>
              {/* Header row */}
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider"
                  style={{color: isDark ? `rgba(${k.glow},0.75)` : k.lText}}>
                  {k.emoji} {k.label}
                </div>
                <div style={{color: isDark ? `rgba(${k.glow},0.5)` : `${k.lText}88`}}>{k.icon}</div>
              </div>
              {/* Big value */}
              <div className="text-2xl sm:text-3xl font-black leading-none mb-1.5 number-pop"
                style={{
                  color: isDark ? `rgba(${k.glow},1)` : k.lText,
                  textShadow: isDark ? `0 0 18px rgba(${k.glow},0.6)` : 'none',
                  fontFamily:"'Sora',sans-serif",
                }}>
                {k.val}
              </div>
              <div className="text-[9px] sm:text-[10px] mb-2 leading-tight kpi-sub"
                style={{color: isDark ? 'rgba(255,255,255,0.40)' : `${k.lText}99`}}>
                {k.sub}
              </div>
              {/* Trend */}
              <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold"
                style={{color: k.up ? (isDark?'#39ff7e':'#1a6a30') : (isDark?'#ff4d6d':'#8a1020')}}>
                {k.up ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
                {k.trend}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── PLAN WIDGETS ─────────────────────────────────────────────────── */}
      <PlanWidgets />

      {/* ── ANALYTICS ROW ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">

        {/* Pesos */}
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 card-lift"
          style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(255,154,60,0.2)',borderRadius:20}}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{background:'linear-gradient(135deg,#ff9a3c,#ea580c)',boxShadow:'0 0 18px rgba(255,154,60,0.5)'}}>
              ⚖️
            </div>
            <div>
              <div className="font-black text-sm sm:text-base text-white">Análisis de Pesos</div>
              <div className="text-[10px] sm:text-xs text-white/40">Promedio hato · metas raza</div>
            </div>
          </div>
          <div className="rounded-2xl p-3 sm:p-4 mb-3" style={{background:'rgba(255,154,60,0.1)',border:'1px solid rgba(255,154,60,0.2)'}}>
            <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1" style={{color:'#ff9a3c'}}>Peso promedio hato</div>
            <div className="text-3xl sm:text-4xl font-black leading-none" style={{color:'#ff9a3c',textShadow:'0 0 20px rgba(255,154,60,0.6)',fontFamily:"'Sora',sans-serif"}}>
              417 <span className="text-lg sm:text-xl opacity-60">kg</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] sm:text-xs">
              <TrendingUp size={11} style={{color:'#39ff7e'}}/>
              <span style={{color:'#39ff7e'}}>+7 kg vs mes anterior</span>
              <span className="text-white/30">· Biomasa: 5.4 ton</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              {emoji:'🐄',label:'Vacas',    kg:508,diff:'+28',n:7,  c:'#00f5d4', g:'0,245,212'},
              {emoji:'🐮',label:'Novillas', kg:298,diff:'-22',n:3,  c:'#a855f7', g:'168,85,247'},
              {emoji:'🐣',label:'Terneros', kg: 80,diff:'-70',n:2,  c:'#fbbf24', g:'251,191,36'},
              {emoji:'🦬',label:'Toros',    kg:810,diff:'+160',n:1, c:'#39ff7e', g:'57,255,126'},
            ].map(c=>(
              <div key={c.label} className="rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition-all hover:scale-[1.03]"
                style={{background:`rgba(${c.g},0.07)`,border:`1px solid rgba(${c.g},0.18)`}}>
                <div className="text-base sm:text-xl mb-1">{c.emoji}</div>
                <div className="text-[10px] sm:text-xs text-white/50 leading-tight">{c.label} ({c.n})</div>
                <div className="text-base sm:text-lg font-black text-white leading-tight">{c.kg} <span className="text-[10px] opacity-50">kg</span></div>
                <div className="text-[10px] sm:text-xs font-bold" style={{color:c.c}}>{c.diff} kg</div>
              </div>
            ))}
          </div>
        </div>

        {/* Producción */}
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 card-lift"
          style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(0,200,255,0.2)',borderRadius:20}}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{background:'linear-gradient(135deg,#00c8ff,#0ea5e9)',boxShadow:'0 0 18px rgba(0,200,255,0.5)'}}>
              🥛
            </div>
            <div className="flex-1">
              <div className="font-black text-sm sm:text-base text-white">Producción Lechera</div>
              <div className="text-[10px] sm:text-xs text-white/40">Ordeños activos</div>
            </div>
            <Link href="/produccion">
              <span className="text-[10px] font-bold flex items-center gap-0.5" style={{color:'#00c8ff'}}>
                Ver <ChevronRight size={11}/>
              </span>
            </Link>
          </div>
          <div className="flex gap-2 mb-4">
            {[
              {v:'84',  l:'L/día',  c:'#00c8ff', g:'0,200,255'},
              {v:'16.8',l:'L/vaca', c:'#39ff7e', g:'57,255,126'},
              {v:'5',   l:'Vacas',  c:'#a855f7', g:'168,85,247'},
            ].map(s=>(
              <div key={s.l} className="flex-1 text-center rounded-xl sm:rounded-2xl py-2.5 sm:py-3"
                style={{background:`rgba(${s.g},0.08)`,border:`1px solid rgba(${s.g},0.2)`}}>
                <div className="text-xl sm:text-2xl font-black" style={{color:s.c,fontFamily:"'Sora',sans-serif"}}>{s.v}</div>
                <div className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-wide mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-[10px] sm:text-xs mb-1.5">
              <span className="text-white/40">Meta diaria 90 L</span>
              <span className="font-black text-white">93% ✓</span>
            </div>
            <div className="h-2.5 sm:h-3 rounded-full overflow-hidden" style={{background:'rgba(0,200,255,0.1)'}}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{width:'93%',background:'linear-gradient(90deg,#00c8ff,#00f5d4)',boxShadow:'0 0 10px rgba(0,245,212,0.6)'}}/>
            </div>
          </div>
          <div className="text-[10px] sm:text-xs font-black text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span style={{color:'#fbbf24'}}>🏆</span> Top productoras
          </div>
          {[
            ['Rosaura','18.4 L','#fbbf24','1°'],
            ['Estrella','17.8 L','#94a3b8','2°'],
            ['Cielo',  '16.9 L','#a78bfa','3°'],
          ].map(([n,l,c,pos])=>(
            <div key={n} className="flex items-center gap-2 text-xs py-1.5 border-b" style={{borderColor:'rgba(255,255,255,0.05)'}}>
              <span className="text-[10px] font-black w-5" style={{color:c}}>{pos}</span>
              <span className="text-white/60 flex-1">{n}</span>
              <span className="font-black" style={{color:c}}>{l}</span>
            </div>
          ))}
        </div>

        {/* Potreros */}
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 card-lift"
          style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(132,239,52,0.2)',borderRadius:20}}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                style={{background:'linear-gradient(135deg,#84ef34,#65a30d)',boxShadow:'0 0 18px rgba(132,239,52,0.5)'}}>
                🌿
              </div>
              <div>
                <div className="font-black text-sm sm:text-base text-white">Manejo de Potreros</div>
                <div className="text-[10px] sm:text-xs text-white/40">Rotación · estado</div>
              </div>
            </div>
            <Link href="/potreros">
              <span className="text-[10px] font-bold flex items-center gap-0.5" style={{color:'#84ef34'}}>
                Ver <ChevronRight size={11}/>
              </span>
            </Link>
          </div>
          <div className="flex gap-2 mb-3">
            {[
              {v:'6',  l:'Total', c:'white',   g:'255,255,255'},
              {v:'1',  l:'Libre', c:'#39ff7e', g:'57,255,126'},
              {v:'27', l:'Has',   c:'#00c8ff', g:'0,200,255'},
            ].map(s=>(
              <div key={s.l} className="flex-1 text-center rounded-xl sm:rounded-2xl py-2.5 sm:py-3"
                style={{background:`rgba(${s.g},0.06)`,border:`1px solid rgba(${s.g},0.12)`}}>
                <div className="text-xl sm:text-2xl font-black" style={{color:s.c,fontFamily:"'Sora',sans-serif"}}>{s.v}</div>
                <div className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-wide mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs rounded-xl px-3 py-2.5 mb-3"
            style={{background:'rgba(255,154,60,0.1)',border:'1px solid rgba(255,154,60,0.25)',color:'#ff9a3c'}}>
            <AlertTriangle size={13} className="flex-shrink-0"/>
            <span><strong>¡Rotar pronto!</strong> Potrero 4 — días vencidos</span>
          </div>
          {[
            {n:'Potrero 6',ha:'3.5 ha',s:'Ocupado',  c:'#ff9a3c', g:'255,154,60'},
            {n:'Potrero 5',ha:'6 ha',  s:'Listo',    c:'#39ff7e', g:'57,255,126'},
            {n:'Potrero 4',ha:'4.2 ha',s:'Rotar ya', c:'#ff4d6d', g:'255,77,109'},
            {n:'Potrero 3',ha:'5.1 ha',s:'Ocupado',  c:'#ff9a3c', g:'255,154,60'},
          ].map(p=>(
            <div key={p.n} className="flex items-center gap-2 py-1.5 border-b" style={{borderColor:'rgba(255,255,255,0.05)'}}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:p.c,boxShadow:`0 0 6px rgba(${p.g},0.8)`}}/>
              <span className="text-xs sm:text-sm font-medium text-white/80 flex-1">{p.n}</span>
              <span className="text-[10px] text-white/35">{p.ha}</span>
              <span className="text-[10px] sm:text-xs font-black" style={{color:p.c}}>{p.s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHART SECTION ──────────────────────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5"
        style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(0,245,212,0.12)',borderRadius:20}}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{background:'linear-gradient(135deg,#00f5d4,#00c896)',boxShadow:'0 0 18px rgba(0,245,212,0.5)'}}>
              <TrendingUp size={18} className="text-black"/>
            </div>
            <div>
              <div className="font-black text-sm sm:text-base text-white" style={{fontFamily:"'Sora',sans-serif"}}>
                Evolución Histórica CIVAC
              </div>
              <div className="text-[10px] sm:text-xs text-white/40">Últimos 7 meses · Oct 2024 — Abr 2025</div>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[
              {id:'produccion',label:'Producción 🥛', from:'#00f5d4', to:'#00c896'},
              {id:'peso',      label:'Peso ⚖️',       from:'#ff9a3c', to:'#ea580c'},
              {id:'finanzas',  label:'Finanzas 💰',   from:'#34d399', to:'#059669'},
            ].map(t=>(
              <button key={t.id} onClick={()=>setChartTab(t.id as any)}
                className="text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all hover:scale-105"
                style={chartTab===t.id
                  ?{background:`linear-gradient(135deg,${t.from},${t.to})`,color:'black',boxShadow:`0 0 14px ${t.from}55`}
                  :{background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.07)'}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-48 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            {chartTab==='finanzas' ? (
              <BarChart data={dataFinanzas} margin={{top:5,right:15,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="bIn" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#39ff7e"/><stop offset="1" stopColor="#00c850" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="bEg" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#ff4d6d"/><stop offset="1" stopColor="#c9184a" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="transparent" tick={{fill:'rgba(255,255,255,0.4)',fontSize:11}}/>
                <YAxis stroke="transparent" tick={{fill:'rgba(255,255,255,0.4)',fontSize:11}} width={38}/>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <RTooltip contentStyle={TIP} formatter={(v:any,n:any)=>[`$${v}M`,n==='ingresos'?'Ingresos':'Egresos']}/>
                <Bar dataKey="ingresos" fill="url(#bIn)" radius={[8,8,0,0]}/>
                <Bar dataKey="egresos"  fill="url(#bEg)" radius={[8,8,0,0]}/>
              </BarChart>
            ) : (
              <AreaChart data={chartTab==='produccion'?dataProduccion:dataPeso} margin={{top:5,right:15,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="aM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={chartTab==='produccion'?'#00f5d4':'#ff9a3c'} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={chartTab==='produccion'?'#00f5d4':'#ff9a3c'} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="aMeta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="transparent" tick={{fill:'rgba(255,255,255,0.4)',fontSize:11}}/>
                <YAxis stroke="transparent" tick={{fill:'rgba(255,255,255,0.4)',fontSize:11}} width={46}/>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <RTooltip contentStyle={TIP}/>
                {chartTab==='produccion' && (
                  <Area type="monotone" dataKey="meta" stroke="#a855f7" strokeWidth={1.5}
                    strokeDasharray="4 3" fill="url(#aMeta)" dot={false}/>
                )}
                <Area type="monotone" dataKey={chartTab==='produccion'?'litros':'kg'}
                  stroke={chartTab==='produccion'?'#00f5d4':'#ff9a3c'} strokeWidth={2.5}
                  fillOpacity={1} fill="url(#aM)"
                  dot={{fill:chartTab==='produccion'?'#00f5d4':'#ff9a3c',r:3,strokeWidth:0}}
                  activeDot={{r:6,fill:chartTab==='produccion'?'#00f5d4':'#ff9a3c',strokeWidth:0,
                    style:{filter:`drop-shadow(0 0 8px ${chartTab==='produccion'?'#00f5d4':'#ff9a3c'})`}}}/>
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── SECONDARY ROW ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Pie */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 card-lift"
            style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(0,245,212,0.12)',borderRadius:20}}>
            <div className="font-black text-sm sm:text-base text-white mb-0.5">🐄 Composición del hato</div>
            <div className="text-[10px] sm:text-xs text-white/35 mb-3">{animals.length} animales · CIVAC</div>
            <div className="h-32 sm:h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%"
                    outerRadius={54} innerRadius={22} strokeWidth={0} paddingAngle={3}>
                    {pieData.map((_,i)=>(
                      <Cell key={i} fill={PIE_COLORS[i]}
                        style={{filter:`drop-shadow(0 0 6px ${PIE_COLORS[i]}90)`}}/>
                    ))}
                  </Pie>
                  <RTooltip contentStyle={TIP}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1">
              {pieData.map((d,i)=>(
                <div key={d.name} className="flex items-center gap-2 text-xs py-0.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{background:PIE_COLORS[i],boxShadow:`0 0 6px ${PIE_COLORS[i]}90`}}/>
                  <span className="text-white/50 flex-1 text-[11px]">{d.name}</span>
                  <span className="font-black text-white text-[11px]">
                    {d.value} <span className="text-white/30 font-normal">({d.pct})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 card-lift"
            style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(255,77,109,0.18)',borderRadius:20}}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{background:'#ff4d6d',boxShadow:'0 0 8px rgba(255,77,109,0.9)'}}/>
                Alertas activas
              </div>
              <Link href="/alertas">
                <span className="text-[10px] sm:text-xs font-bold flex items-center gap-0.5" style={{color:'#ff4d6d'}}>
                  Ver todas <ChevronRight size={11}/>
                </span>
              </Link>
            </div>
            <div className="space-y-2">
              {alertas.slice(0,4).map(a=>(
                <div key={a.id} className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl"
                  style={{
                    background:a.type==='danger'?'rgba(255,77,109,0.08)':'rgba(255,154,60,0.08)',
                    border:`1px solid ${a.type==='danger'?'rgba(255,77,109,0.22)':'rgba(255,154,60,0.22)'}`,
                  }}>
                  {a.type==='danger'
                    ?<AlertCircle size={13} className="mt-0.5 flex-shrink-0" style={{color:'#ff4d6d'}}/>
                    :<AlertTriangle size={13} className="mt-0.5 flex-shrink-0" style={{color:'#ff9a3c'}}/>}
                  <div className="min-w-0">
                    <div className="text-[11px] sm:text-xs font-black leading-tight" style={{color:a.type==='danger'?'#ff4d6d':'#ff9a3c'}}>
                      {a.title}
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/40 truncate">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs Reproductivos + Finanzas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Reproductivos */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 card-lift"
            style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(255,111,216,0.18)',borderRadius:20}}>
            <div className="font-black text-sm sm:text-base text-white mb-3">🔁 KPIs Reproductivos</div>
            {[
              {label:'Tasa concepción', val:'62%', meta:'70%', pct:88,  ok:false, c:'#ff6fd8'},
              {label:'Vacas gestantes', val:'8%',  meta:'50%', pct:16,  ok:false, c:'#a855f7'},
              {label:'Días abiertos',   val:'112d',meta:'<90d',pct:80,  ok:false, c:'#fbbf24'},
              {label:'IEP promedio',    val:'415d',meta:'365d',pct:88,  ok:false, c:'#ff9a3c'},
            ].map(k=>(
              <div key={k.label} className="mb-2.5">
                <div className="flex justify-between text-[10px] sm:text-xs mb-1">
                  <span className="text-white/50">{k.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black" style={{color:k.c}}>{k.val}</span>
                    <span className="text-white/25">meta {k.meta}</span>
                  </div>
                </div>
                <div className="h-1.5 sm:h-2 rounded-full" style={{background:'rgba(255,255,255,0.06)'}}>
                  <div className="h-full rounded-full" style={{width:`${k.pct}%`,background:`linear-gradient(90deg,${k.c},${k.c}88)`}}/>
                </div>
              </div>
            ))}
          </div>

          {/* Finanzas */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 card-lift"
            style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(52,211,153,0.18)',borderRadius:20}}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-black text-sm sm:text-base text-white">💰 Finanzas</div>
              <Link href="/costos">
                <span className="text-[10px] font-bold flex items-center gap-0.5" style={{color:'#34d399'}}>
                  P&G <ChevronRight size={11}/>
                </span>
              </Link>
            </div>
            {[
              {label:'Ingresos brutos',  val:'$86M', up:true,  pct:100, c:'#34d399', g:'52,211,153'},
              {label:'Egresos totales',  val:'$46M', up:false, pct:53,  c:'#ff4d6d', g:'255,77,109'},
              {label:'Utilidad neta',    val:'$40M', up:true,  pct:47,  c:'#00f5d4', g:'0,245,212'},
              {label:'Costo/litro leche',val:'$547', up:false, pct:65,  c:'#fbbf24', g:'251,191,36'},
            ].map(f=>(
              <div key={f.label} className="mb-2.5">
                <div className="flex justify-between text-[10px] sm:text-xs mb-1">
                  <span className="text-white/50">{f.label}</span>
                  <span className="font-black flex items-center gap-1" style={{color:f.c}}>
                    {f.up?<TrendingUp size={9}/>:<TrendingDown size={9}/>} {f.val}
                  </span>
                </div>
                <div className="h-1.5 sm:h-2 rounded-full" style={{background:'rgba(255,255,255,0.06)'}}>
                  <div className="h-full rounded-full" style={{width:`${f.pct}%`,background:`linear-gradient(90deg,rgba(${f.g},0.9),rgba(${f.g},0.5))`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MÓDULOS GRID ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="h-px flex-1" style={{background:'linear-gradient(90deg,rgba(0,245,212,0.3),transparent)'}}/>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]" style={{color:'rgba(0,245,212,0.45)'}}>
            Todos los módulos CIVAC
          </span>
          <div className="h-px flex-1" style={{background:'linear-gradient(90deg,transparent,rgba(0,245,212,0.3)'}}/>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {MODULOS.map((m, i) => (
            <Link key={m.href} href={m.href}>
              <div className="module-card relative rounded-2xl p-3 sm:p-3.5 cursor-pointer group transition-all duration-200 hover:scale-[1.04] hover:-translate-y-0.5"
                style={{
                  background: isDark
                    ? `linear-gradient(145deg,rgba(${m.glow},0.12),rgba(${m.glow},0.05),rgba(0,0,0,0.45))`
                    : `linear-gradient(145deg,${m.lFrom},${m.lTo})`,
                  border: isDark
                    ? `1px solid rgba(${m.glow},0.22)`
                    : `2px solid rgba(${m.glow},0.55)`,
                  borderRadius:18,
                  animationDelay:`${i*30}ms`,
                  boxShadow: isDark ? 'none' : `0 4px 14px rgba(${m.glow},0.20), 0 1px 4px rgba(0,0,0,0.07)`,
                }}
                onMouseEnter={e=>{
                  (e.currentTarget as HTMLDivElement).style.boxShadow=`0 0 24px rgba(${m.glow},0.35), 0 6px 20px rgba(0,0,0,0.15)`;
                  (e.currentTarget as HTMLDivElement).style.borderColor=`rgba(${m.glow},0.65)`;
                }}
                onMouseLeave={e=>{
                  (e.currentTarget as HTMLDivElement).style.boxShadow=isDark?'none':`0 4px 14px rgba(${m.glow},0.20)`;
                  (e.currentTarget as HTMLDivElement).style.borderColor=isDark?`rgba(${m.glow},0.22)`:`rgba(${m.glow},0.55)`;
                }}
              >
                {/* Top gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{background:`linear-gradient(90deg,${m.from},${m.to})`}}/>
                {/* Badge */}
                {m.badge && (
                  <div className="absolute top-2 right-2 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-black"
                    style={{
                      background: isDark
                        ? ((m as any).red?'rgba(255,77,109,0.22)':`rgba(${m.glow},0.18)`)
                        : ((m as any).red?'#ff4d6d':`${m.from}`),
                      color: isDark
                        ? ((m as any).red?'#ff4d6d':m.from)
                        : 'white',
                      border:'none',
                    }}>
                    {m.badge}
                  </div>
                )}
                {/* Icon */}
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2 mt-0.5 flex-shrink-0 transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(var(--m-glow),0.5)] duration-200"
                  style={{
                    background: isDark
                      ? `linear-gradient(135deg,rgba(${m.glow},0.20),rgba(${m.glow},0.08))`
                      : `linear-gradient(135deg,${m.from},${m.to})`,
                    border: isDark ? `1px solid rgba(${m.glow},0.35)` : 'none',
                    boxShadow: isDark ? `0 0 14px rgba(${m.glow},0.18)` : `0 4px 12px rgba(${m.glow},0.35)`,
                    color: isDark ? m.from : 'white',
                  }}>
                  {m.icon}
                </div>
                <div className="module-title font-black text-[11px] sm:text-xs leading-tight mb-0.5"
                  style={{color: isDark ? 'rgba(255,255,255,0.92)' : m.lText}}>
                  {m.title}
                </div>
                <div className="module-desc text-[9px] sm:text-[10px] leading-tight"
                  style={{color: isDark ? `rgba(${m.glow},0.60)` : `${m.lText}cc`}}>
                  {m.desc.length > 28 ? m.desc.slice(0,28)+'…' : m.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
