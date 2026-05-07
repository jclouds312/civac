import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { useAppState } from "../lib/data";
import { Bell, TrendingUp, AlertCircle, AlertTriangle, ChevronRight, Scale } from "lucide-react";
import { Link } from "wouter";
import { useState, useMemo } from "react";

const dataProduccionHist = [
  { name: 'Oct', litros: 52000, meta: 55000 },
  { name: 'Nov', litros: 55000, meta: 55000 },
  { name: 'Dic', litros: 58000, meta: 58000 },
  { name: 'Ene', litros: 62000, meta: 60000 },
  { name: 'Feb', litros: 60000, meta: 60000 },
  { name: 'Mar', litros: 56000, meta: 60000 },
  { name: 'Abr', litros: 61300, meta: 62000 },
];

const dataPesoHist = [
  { name: 'Oct', kg: 400 },
  { name: 'Nov', kg: 403 },
  { name: 'Dic', kg: 405 },
  { name: 'Ene', kg: 408 },
  { name: 'Feb', kg: 410 },
  { name: 'Mar', kg: 414 },
  { name: 'Abr', kg: 417 },
];

const COLORS_PIE = ['#2e7d32', '#1565c0', '#f57c00', '#6a1b9a', '#b71c1c'];

const modulos = [
  { icon: '🐄', title: 'Inventario', desc: 'Registro y seguimiento de cada animal', href: '/inventario' },
  { icon: '📋', title: 'Ficha Individual', desc: 'Historia clínica y eventos por bovino', href: '/ficha' },
  { icon: '🔁', title: 'Reproducción', desc: 'Celos, inseminación, gestación y nacimientos', href: '/reproduccion' },
  { icon: '🥛', title: 'Producción', desc: 'Ordeños, litros/vaca, tendencias y calidad', href: '/produccion' },
  { icon: '⚖️', title: 'Básculas y Pesaje', desc: 'Registro de pesos, evolución y ganancia por animal', href: '/pesaje' },
  { icon: '🧬', title: 'Genética', desc: 'DEP, índices genéticos y mejoramiento del hato', href: '/genetica' },
  { icon: '🌿', title: 'Potreros', desc: 'Rotación, aforo, días de descanso y ocupación', href: '/potreros' },
  { icon: '🌾', title: 'Alimentación', desc: 'Raciones, minerales, sal y suplementos por lote', href: '/alimentacion' },
  { icon: '💊', title: 'Insumos / Kardex', desc: 'Medicamentos, vacunas y materiales con stock', href: '/insumos' },
  { icon: '🧊', title: 'Semen y Embriones', desc: 'Inventario criogénico, donantes y TE', href: '/semen' },
  { icon: '💰', title: 'Costos y Finanzas', desc: 'Ingresos, egresos, margen lechero y P&G', href: '/costos' },
  { icon: '👷', title: 'Personal / Nómina', desc: 'Empleados, salarios, prestaciones y roles', href: '/personal' },
  { icon: '🤖', title: 'Predicciones IA', desc: 'Alertas inteligentes y recomendaciones', href: '/prediccion' },
  { icon: '🌱', title: 'Huella Carbono', desc: 'Emisiones CH₄ y CO₂, bonos verdes', href: '/co2' },
  { icon: '🗺️', title: 'Multi-Finca', desc: 'Gestione varias fincas desde un panel', href: '/multifinca' },
];

export default function Dashboard() {
  const { animals, potreros, personal, alertas, insumos } = useAppState();
  const [chartTab, setChartTab] = useState<'produccion' | 'peso'>('produccion');

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? '¡Buenos días!' : hour < 18 ? '¡Buenas tardes!' : '¡Buenas noches!';

  // ── Computed stats from real data ─────────────────────────────────────────
  const vacasEnProduccion = useMemo(() => animals.filter(a => a.estado === 'Producción'), [animals]);
  const totalLeche = useMemo(() => Math.round(vacasEnProduccion.reduce((s, a) => s + (a.litrosDia || 0), 0)), [vacasEnProduccion]);
  const litrosPorVaca = vacasEnProduccion.length > 0 ? (totalLeche / vacasEnProduccion.length).toFixed(1) : '0';
  const gestantes = useMemo(() => animals.filter(a => a.estado === 'Gestante').length, [animals]);
  const enTratamiento = useMemo(() => animals.filter(a => a.estado === 'Tratamiento').length, [animals]);
  const pesoPromedio = useMemo(() => animals.length > 0 ? Math.round(animals.reduce((s, a) => s + (a.peso || 0), 0) / animals.length) : 0, [animals]);
  const biomasaTon = useMemo(() => (animals.reduce((s, a) => s + (a.peso || 0), 0) / 1000).toFixed(1), [animals]);
  const alertasActivas = useMemo(() => alertas.filter(a => !a.resolved), [alertas]);
  const insumosCriticos = useMemo(() => insumos.filter(i => i.stock < i.minimo), [insumos]);

  const valorHato = useMemo(() => {
    const v = animals.reduce((s, a) => {
      const precio = a.categoria === 'Toro' ? 12000 : a.categoria === 'Vaca adulta' ? 6000 : a.categoria === 'Novilla' ? 4500 : 1500;
      return s + (a.peso || 0) * precio;
    }, 0);
    return Math.round(v / 1000000).toFixed(0);
  }, [animals]);

  // ── Category weight analysis ───────────────────────────────────────────────
  const weightByCategory = useMemo(() => {
    const catMap: Record<string, { total: number; count: number }> = {};
    animals.forEach(a => {
      const cat = a.categoria || 'Otro';
      if (!catMap[cat]) catMap[cat] = { total: 0, count: 0 };
      catMap[cat].total += (a.peso || 0);
      catMap[cat].count += 1;
    });
    return Object.entries(catMap).map(([cat, { total, count }]) => ({
      cat,
      avg: Math.round(total / count),
      count,
      icon: cat === 'Toro' ? '🐂' : cat === 'Vaca adulta' ? '🐄' : cat === 'Novilla' ? '🐮' : '🐣',
    }));
  }, [animals]);

  // ── Pie data from real animals ─────────────────────────────────────────────
  const pieData = useMemo(() => {
    const catCount: Record<string, number> = {};
    animals.forEach(a => { const c = a.categoria || 'Otro'; catCount[c] = (catCount[c] || 0) + 1; });
    return Object.entries(catCount).map(([name, value]) => ({
      name,
      value,
      pct: `${Math.round((value / animals.length) * 100)}%`,
    }));
  }, [animals]);

  // ── Top production ranking ─────────────────────────────────────────────────
  const topProductoras = useMemo(() =>
    [...vacasEnProduccion].sort((a, b) => (b.litrosDia || 0) - (a.litrosDia || 0)).slice(0, 3),
    [vacasEnProduccion]
  );

  // ── Potreros urgentes ──────────────────────────────────────────────────────
  const potrerosDisplay = useMemo(() =>
    [...potreros].sort((a, b) => {
      const order: Record<string, number> = { 'Rotar pronto': 0, 'Ocupado': 1, 'Disponible': 2, 'Descanso': 3 };
      return (order[a.estado] ?? 9) - (order[b.estado] ?? 9);
    }).slice(0, 5),
    [potreros]
  );

  const hectareasTotal = useMemo(() => potreros.reduce((s, p) => s + (p.hectareas || 0), 0).toFixed(1), [potreros]);
  const potrerosDisponibles = useMemo(() => potreros.filter(p => p.estado === 'Disponible').length, [potreros]);

  const metaLeche = 90;
  const pctMeta = Math.min(100, Math.round((totalLeche / metaLeche) * 100));

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1a5c2e] via-[#1e6e38] to-[#2d8a4e] rounded-xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-48 opacity-5 flex items-center justify-center">
          <div className="text-[120px]">🐄</div>
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{greeting} 👋🏼</h1>
            </div>
            <p className="text-white/70 text-sm">
              {now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — {now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-white/60 text-xs mt-0.5">Tablero principal de GanaderIA — resumen en tiempo real de su hato</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">🐄 {animals.length} Animales</span>
            <span className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">🥛 {vacasEnProduccion.length} En producción</span>
            <span className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">🌿 {potreros.length} Potreros</span>
            <span className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">👷 {personal.length} Staff</span>
            <span className="flex items-center gap-1.5 bg-white text-green-800 text-xs font-bold px-3 py-1.5 rounded-full ml-1">● Datos en vivo</span>
            <button className="relative bg-white/15 hover:bg-white/25 p-1.5 rounded-full border border-white/20 transition-colors">
              <Bell size={16} className="text-white" />
              {alertasActivas.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">{alertasActivas.length}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 6 KPI Cards — all computed from real data */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl p-4 text-white relative overflow-hidden shadow-lg" style={{background:'linear-gradient(135deg,#1b5e20,#2e7d32)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">🐄 Total Animales</div>
          <div className="text-3xl font-bold">{animals.length}</div>
          <div className="text-[10px] text-white/60 mt-1">Meta: 250 · {Math.round(animals.length/250*100)}%</div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-white/5" />
        </div>
        <div className="rounded-xl p-4 text-white relative overflow-hidden shadow-lg" style={{background:'linear-gradient(135deg,#0d47a1,#1565c0)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">🥛 Litros Hoy</div>
          <div className="text-3xl font-bold">{totalLeche}L</div>
          <div className="text-[10px] text-white/60 mt-1">{vacasEnProduccion.length} vacas · {litrosPorVaca} L/vaca</div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-white/5" />
        </div>
        <div className="rounded-xl p-4 text-white relative overflow-hidden shadow-lg" style={{background:'linear-gradient(135deg,#e65100,#f57c00)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">⚖️ Peso Promedio</div>
          <div className="text-3xl font-bold">{pesoPromedio} kg</div>
          <div className="text-[10px] text-white/60 mt-1">Biomasa: {biomasaTon} ton</div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-white/5" />
        </div>
        <div className="rounded-xl p-4 text-white relative overflow-hidden shadow-lg" style={{background:'linear-gradient(135deg,#4a148c,#6a1b9a)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">🤰 Gestantes</div>
          <div className="text-3xl font-bold">{gestantes}</div>
          <div className="text-[10px] text-white/60 mt-1">{animals.length > 0 ? Math.round(gestantes/animals.length*100) : 0}% del hato</div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-white/5" />
        </div>
        <div className="rounded-xl p-4 text-white relative overflow-hidden shadow-lg" style={{background:'linear-gradient(135deg,#b71c1c,#c62828)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
            {enTratamiento > 0 && <span className="bg-white/20 text-white text-[8px] font-bold px-1.5 py-0.5 rounded mr-1">ALERTA</span>}
            🏥 En Tratamiento
          </div>
          <div className="text-3xl font-bold">{enTratamiento}</div>
          <div className="text-[10px] text-white/60 mt-1">{enTratamiento > 0 ? '⚠ Revisar hoy' : '✓ Sin tratamientos'}</div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-white/5" />
        </div>
        <div className="rounded-xl p-4 text-white relative overflow-hidden shadow-lg" style={{background:'linear-gradient(135deg,#f57f17,#f9a825)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">💰 Valor del Hato</div>
          <div className="text-2xl font-bold">${valorHato}M</div>
          <div className="text-[10px] text-white/60 mt-1">COP estimado</div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-white/5" />
        </div>
      </div>

      {/* 3-col analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Análisis de Pesos — computed from real animals */}
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
            <div className="text-3xl font-bold text-amber-400">{pesoPromedio} kg</div>
            <div className="text-xs text-muted-foreground">Biomasa total: <strong className="text-foreground">{biomasaTon} ton</strong></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {weightByCategory.map(c => {
              const metas: Record<string, number> = { 'Vaca adulta': 480, 'Novilla': 320, 'Ternero': 150, 'Toro': 650 };
              const meta = metas[c.cat] ?? 300;
              const diff = c.avg - meta;
              const isOk = diff >= 0;
              return (
                <div key={c.cat} className="bg-muted/30 rounded-lg p-2.5">
                  <div className="text-base mb-1">{c.icon}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.cat}</div>
                  <div className="text-lg font-bold text-foreground">{c.avg} kg</div>
                  <div className={`text-[10px] ${isOk ? 'text-green-400' : 'text-red-400'}`}>
                    {isOk ? '+' : ''}{diff} vs {meta}kg
                  </div>
                  <div className="text-[10px] text-muted-foreground">{c.count} animales</div>
                </div>
              );
            })}
          </div>
          <Link href="/pesaje" className="flex items-center justify-center gap-1.5 mt-3 text-xs text-primary hover:underline">
            <Scale size={12} /> Ver módulo de pesaje <ChevronRight size={12} />
          </Link>
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
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{totalLeche}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Litros/día</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{litrosPorVaca}</div>
              <div className="text-[10px] text-muted-foreground uppercase">L/vaca prom</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{vacasEnProduccion.length}</div>
              <div className="text-[10px] text-muted-foreground uppercase">En ordeño</div>
            </div>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Meta diaria</span>
              <span className="font-semibold">{pctMeta}% — {totalLeche} / {metaLeche} L</span>
            </div>
            <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${pctMeta >= 100 ? 'bg-green-500' : pctMeta >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{width:`${pctMeta}%`}}
              />
            </div>
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Distribución por rango</div>
          {[
            { label:'< 10 L', count: vacasEnProduccion.filter(a => (a.litrosDia||0) < 10).length },
            { label:'10-15 L', count: vacasEnProduccion.filter(a => (a.litrosDia||0) >= 10 && (a.litrosDia||0) < 15).length },
            { label:'15-20 L', count: vacasEnProduccion.filter(a => (a.litrosDia||0) >= 15 && (a.litrosDia||0) < 20).length },
            { label:'> 20 L', count: vacasEnProduccion.filter(a => (a.litrosDia||0) >= 20).length },
          ].map(({ label, count }) => (
            <div key={label} className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground w-16">{label}</span>
              <div className="flex-1 mx-2 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-1.5 rounded-full bg-blue-500" style={{width:`${count > 0 ? Math.max(count * 15, 8) : 0}%`}} />
              </div>
              <span className="text-xs font-medium w-3 text-right">{count}</span>
            </div>
          ))}
          <div className="mt-3 border-t border-border pt-2">
            <div className="text-xs font-semibold text-amber-400 mb-1">🏆 Top producción</div>
            {topProductoras.map((a, i) => (
              <div key={a.id} className="flex justify-between text-xs py-0.5">
                <span className="text-muted-foreground">{i+1}° {a.nombre}</span>
                <span className="font-bold text-cyan-400">{a.litrosDia} L</span>
              </div>
            ))}
            {topProductoras.length === 0 && <p className="text-xs text-muted-foreground">Sin vacas en producción</p>}
          </div>
        </div>

        {/* Manejo de Potreros — dynamic */}
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
              <div className="text-xl font-bold">{potreros.length}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Total</div>
            </div>
            <div className="text-center flex-1 bg-muted/20 rounded-lg py-2">
              <div className="text-xl font-bold text-green-400">{potrerosDisponibles}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Disponibles</div>
            </div>
            <div className="text-center flex-1 bg-muted/20 rounded-lg py-2">
              <div className="text-xl font-bold text-blue-400">{hectareasTotal}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Hectáreas</div>
            </div>
          </div>
          {potreros.some(p => p.estado === 'Rotar pronto') && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 mb-3 text-xs">
              <span className="text-amber-400 font-semibold">⚡ ¡Rotar en los próximos días!</span>
              <span className="text-muted-foreground ml-1">{potreros.filter(p => p.estado === 'Rotar pronto').map(p => p.nombre).join(', ')}</span>
            </div>
          )}
          {potrerosDisplay.map(p => {
            const statusDot = p.estado === 'Disponible' ? 'bg-green-500' : p.estado === 'Rotar pronto' ? 'bg-red-500' : p.estado === 'Descanso' ? 'bg-blue-500' : 'bg-orange-500';
            const statusColor = p.estado === 'Disponible' ? 'text-green-400' : p.estado === 'Rotar pronto' ? 'text-red-400' : p.estado === 'Descanso' ? 'text-blue-400' : 'text-orange-400';
            return (
              <div key={p.id} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot}`} />
                <span className="text-xs font-medium flex-1 truncate">{p.nombre}</span>
                <span className="text-[10px] text-muted-foreground">{p.hectareas} ha</span>
                <span className={`text-[10px] font-semibold ${statusColor}`}>{p.estado}{p.diasRestantes ? ` · ${p.diasRestantes}d` : ''}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evolución Histórica + Pesaje quick link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
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
              <button
                onClick={() => setChartTab('produccion')}
                className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${chartTab==='produccion'?'bg-primary text-white':'bg-muted/40 text-muted-foreground hover:bg-muted/60'}`}
              >Producción Lechera</button>
              <button
                onClick={() => setChartTab('peso')}
                className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${chartTab==='peso'?'bg-primary text-white':'bg-muted/40 text-muted-foreground hover:bg-muted/60'}`}
              >Peso del Ganado</button>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              {chartTab === 'produccion' ? (
                <AreaChart data={dataProduccionHist} margin={{top:5,right:20,left:0,bottom:0}}>
                  <defs>
                    <linearGradient id="gradProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gradMeta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#444" tick={{fill:'#888',fontSize:11}} />
                  <YAxis stroke="#444" tick={{fill:'#888',fontSize:11}} width={55} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} formatter={(v: number) => [`${v.toLocaleString()} L`]} />
                  <Area type="monotone" dataKey="litros" stroke="#4ade80" strokeWidth={2.5} fillOpacity={1} fill="url(#gradProd)" name="Producción" />
                  <Area type="monotone" dataKey="meta" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4 3" fillOpacity={1} fill="url(#gradMeta)" name="Meta" />
                  <Legend wrapperStyle={{fontSize:11,color:'#888'}} />
                </AreaChart>
              ) : (
                <AreaChart data={dataPesoHist} margin={{top:5,right:20,left:0,bottom:0}}>
                  <defs>
                    <linearGradient id="gradPeso" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb923c" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#444" tick={{fill:'#888',fontSize:11}} />
                  <YAxis stroke="#444" tick={{fill:'#888',fontSize:11}} width={45} domain={['auto','auto']} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} formatter={(v: number) => [`${v} kg`]} />
                  <Area type="monotone" dataKey="kg" stroke="#fb923c" strokeWidth={2.5} fillOpacity={1} fill="url(#gradPeso)" name="Peso prom" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Básculas & Pesaje Quick Card */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Scale size={16} className="text-cyan-400" />
            </div>
            <div>
              <div className="font-semibold text-sm">Básculas y Pesaje</div>
              <div className="text-xs text-muted-foreground">Control de peso del hato</div>
            </div>
          </div>
          {/* Weight bar chart per category */}
          <div className="h-32 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weightByCategory} margin={{top:4,right:4,left:-20,bottom:0}}>
                <XAxis dataKey="cat" tick={{fill:'#888',fontSize:10}} tickFormatter={v => v.split(' ')[0]} />
                <YAxis tick={{fill:'#888',fontSize:10}} domain={[0,'auto']} />
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} formatter={(v: number) => [`${v} kg`]} />
                <Bar dataKey="avg" name="Peso prom" radius={[4,4,0,0]}>
                  {weightByCategory.map((_, i) => <Cell key={i} fill={['#fb923c','#4ade80','#60a5fa','#a78bfa'][i % 4]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs bg-muted/20 rounded-lg px-3 py-2">
              <span className="text-muted-foreground">Peso promedio hato</span>
              <span className="font-bold text-amber-400">{pesoPromedio} kg</span>
            </div>
            <div className="flex justify-between text-xs bg-muted/20 rounded-lg px-3 py-2">
              <span className="text-muted-foreground">Biomasa total</span>
              <span className="font-bold text-foreground">{biomasaTon} ton</span>
            </div>
            <div className="flex justify-between text-xs bg-muted/20 rounded-lg px-3 py-2">
              <span className="text-muted-foreground">Animales pesados</span>
              <span className="font-bold text-foreground">{animals.length}</span>
            </div>
          </div>
          <Link href="/pesaje">
            <div className="mt-3 w-full text-center text-xs py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors cursor-pointer font-semibold">
              Ir al módulo de pesaje →
            </div>
          </Link>
        </div>
      </div>

      {/* Row: pie + alertas + KPIs repro + financiero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Pie — dynamic */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="font-semibold text-sm mb-1">🐄 Composición del hato</div>
            <div className="text-xs text-muted-foreground mb-2">{animals.length} animales registrados</div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={52} innerRadius={22} strokeWidth={0} paddingAngle={2}>
                    {pieData.map((_,i) => <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} formatter={(v, n) => [`${v} animales`, n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {pieData.map((d,i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs py-0.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:COLORS_PIE[i % COLORS_PIE.length]}} />
                <span className="text-muted-foreground flex-1 truncate">{d.name}</span>
                <span className="font-medium">{d.value} ({d.pct})</span>
              </div>
            ))}
          </div>
          {/* Alertas — dynamic */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm">Alertas activas</div>
              <Link href="/alertas" className="text-xs text-primary hover:underline">Ver todas →</Link>
            </div>
            <div className="space-y-2">
              {alertasActivas.slice(0,4).map(a => (
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
              {alertasActivas.length === 0 && (
                <p className="text-xs text-green-400 flex items-center gap-1.5"><span>✓</span>Sin alertas activas</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* KPIs Reproductivos */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="font-semibold text-sm mb-3">🔁 KPIs Reproductivos</div>
            {[
              { label:'Tasa de concepción', val:'62%', meta:'meta 70%', ok:false },
              { label:'Vacas gestantes', val:`${animals.length > 0 ? Math.round(gestantes/animals.length*100) : 0}%`, meta:'meta 50%', ok: gestantes/animals.length >= 0.5 },
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

      {/* Insumos urgentes — dynamic */}
      {insumosCriticos.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-sm">⚠️ Insumos por reponer urgente</div>
            <Link href="/insumos" className="text-xs text-primary hover:underline">Ir a Insumos →</Link>
          </div>
          <div className="text-xs text-muted-foreground mb-3">{insumosCriticos.length} producto(s) bajo stock mínimo</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {insumosCriticos.slice(0,4).map(i => {
              const pct = Math.round((i.stock / i.minimo) * 100);
              return (
                <div key={i.nombre} className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                  <div className="text-xs font-semibold text-red-400 mb-2 truncate">{i.nombre}</div>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-xl font-bold text-foreground">{i.stock}</span>
                    <span className="text-[10px] text-muted-foreground">/ min {i.minimo} {i.unidad}</span>
                  </div>
                  <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-1.5 rounded-full bg-red-500" style={{width:`${Math.min(pct, 100)}%`}} />
                  </div>
                  <div className="text-[10px] text-red-400 mt-1">{pct}% del mínimo</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Módulos de acceso rápido */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-sm">Módulos del sistema</div>
          <span className="text-xs text-muted-foreground">{modulos.length} módulos disponibles</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {modulos.map(m => (
            <Link key={m.href} href={m.href}>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-primary/20 transition-all cursor-pointer text-center group">
                <span className="text-2xl group-hover:scale-110 transition-transform">{m.icon}</span>
                <span className="text-xs font-semibold text-foreground leading-tight">{m.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
