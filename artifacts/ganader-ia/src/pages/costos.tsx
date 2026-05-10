import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList, LineChart, Line, ComposedChart } from "recharts";
import { Download, Plus, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState } from "../lib/data";
import { useMemo, useState } from "react";

const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const PRECIO_LITRO = 1250;
const COSTO_LITRO_META = 800;

const tendenciaData = [
  { mes: 'Oct', ingresos: 76200000, egresos: 52100000, utilidad: 24100000 },
  { mes: 'Nov', ingresos: 81400000, egresos: 54300000, utilidad: 27100000 },
  { mes: 'Dic', ingresos: 88300000, egresos: 57800000, utilidad: 30500000 },
  { mes: 'Ene', ingresos: 92100000, egresos: 58900000, utilidad: 33200000 },
  { mes: 'Feb', ingresos: 88600000, egresos: 57200000, utilidad: 31400000 },
  { mes: 'Mar', ingresos: 84500000, egresos: 56700000, utilidad: 27800000 },
  { mes: 'Abr', ingresos: 95400000, egresos: 59200000, utilidad: 36200000 },
];

export default function Costos() {
  const { animals, personal } = useAppState();
  const [activeTab, setActiveTab] = useState("pg");

  const stats = useMemo(() => {
    const litrosDia = animals.reduce((s, a) => s + (a.litrosDia || 0), 0);
    const litrosMes = Math.round(litrosDia * 30);
    const ingresosLeche = litrosMes * PRECIO_LITRO;
    const ingresosGanado = 12500000;
    const ingresosEmbriones = 3200000;
    const totalIngresos = ingresosLeche + ingresosGanado + ingresosEmbriones;

    const nominaBase = personal.reduce((s, p) => s + (p.salario || 0), 0);
    const nominaTotal = Math.round(nominaBase * 1.52);
    const alimentacion = 22400000;
    const medicamentos = 3800000;
    const mantenimiento = 2100000;
    const servicios = 1400000;
    const totalEgresos = alimentacion + nominaTotal + medicamentos + mantenimiento + servicios;

    const utilidad = totalIngresos - totalEgresos;
    const margenPct = totalIngresos > 0 ? ((utilidad / totalIngresos) * 100).toFixed(1) : '0';
    const costoLitro = litrosMes > 0 ? Math.round(totalEgresos / litrosMes) : 820;
    const margenLitro = PRECIO_LITRO - costoLitro;
    const margenLitroPct = ((margenLitro / PRECIO_LITRO) * 100).toFixed(1);

    // Break-even
    const costosFijos = nominaTotal + mantenimiento + servicios;
    const costosVariables = alimentacion + medicamentos;
    const margenContribucion = PRECIO_LITRO - Math.round(costosVariables / litrosMes || 0);
    const breakevenLitros = margenContribucion > 0 ? Math.round(costosFijos / margenContribucion) : 0;
    const breakevenPct = litrosMes > 0 ? Math.round((breakevenLitros / litrosMes) * 100) : 0;

    const costoItems = [
      { concepto: 'Alimentación', val: alimentacion, color: '#22c55e', pct: Math.round(alimentacion/totalEgresos*100) },
      { concepto: 'Nómina y prest.', val: nominaTotal, color: '#3b82f6', pct: Math.round(nominaTotal/totalEgresos*100) },
      { concepto: 'Medicamentos', val: medicamentos, color: '#f97316', pct: Math.round(medicamentos/totalEgresos*100) },
      { concepto: 'Mantenimiento', val: mantenimiento, color: '#eab308', pct: Math.round(mantenimiento/totalEgresos*100) },
      { concepto: 'Servicios', val: servicios, color: '#a855f7', pct: Math.round(servicios/totalEgresos*100) },
    ];

    return {
      litrosMes, ingresosLeche, ingresosGanado, ingresosEmbriones,
      totalIngresos, nominaTotal, alimentacion, medicamentos, mantenimiento, servicios,
      totalEgresos, utilidad, margenPct, costoLitro, margenLitro, margenLitroPct,
      costoItems, costosFijos, costosVariables, breakevenLitros, breakevenPct,
    };
  }, [animals, personal]);

  const costoLitroOk = stats.costoLitro <= COSTO_LITRO_META;

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#1a3a1a] to-[#2d5a2e] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <DollarSign size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Costos y Estado de Resultados</h1>
            <p className="text-white/70 text-sm">P&G mensual · Tendencia 7 meses · Break-even · Análisis por categoría</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-9 gap-1.5 text-sm">
            <Download size={14} /> Exportar
          </Button>
          <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 h-9 gap-1.5 text-sm">
            <Plus size={14} /> Registro
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:'INGRESOS MES', val: fmt(stats.totalIngresos), sub:'total mes actual', dot:'bg-green-400', trend:'+13.3%' },
          { label:'EGRESOS MES', val: fmt(stats.totalEgresos), sub:'total mes actual', dot:'bg-red-400', trend:'+4.4%' },
          { label:'UTILIDAD NETA', val: fmt(stats.utilidad), sub:`${stats.margenPct}% margen`, dot: Number(stats.margenPct) > 30 ? 'bg-green-400' : 'bg-orange-400', trend:'+30.1%' },
          { label:'COSTO/LITRO', val: `$${stats.costoLitro.toLocaleString('es-CO')}`, sub: costoLitroOk ? `Meta $${COSTO_LITRO_META} ✓` : `Meta $${COSTO_LITRO_META} ↑`, dot: costoLitroOk ? 'bg-green-400' : 'bg-orange-400', trend: '' },
          { label:'MARGEN/LITRO', val: `$${stats.margenLitro.toLocaleString('es-CO')}`, sub: `${stats.margenLitroPct}% del precio`, dot: stats.margenLitro > 400 ? 'bg-green-400' : 'bg-orange-400', trend: '' },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{k.label}</span>
              <span className={`w-2 h-2 rounded-full ${k.dot}`} />
            </div>
            <div className="text-base font-bold text-foreground leading-tight">{k.val}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-muted-foreground">{k.sub}</span>
              {k.trend && <span className="text-[10px] font-bold text-green-400">{k.trend}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="pg" className="gap-1.5 text-xs"><DollarSign size={13} /> P&G Detallado</TabsTrigger>
          <TabsTrigger value="tendencia" className="gap-1.5 text-xs"><TrendingUp size={13} /> Tendencia 7M</TabsTrigger>
          <TabsTrigger value="categoria" className="gap-1.5 text-xs"><PieChart size={13} /> Por Categoría</TabsTrigger>
          <TabsTrigger value="breakeven" className="gap-1.5 text-xs"><TrendingDown size={13} /> Break-Even</TabsTrigger>
        </TabsList>

        {/* P&G */}
        <TabsContent value="pg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-3">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/10">
                <div className="font-semibold text-sm">📊 Estado de Resultados — Abril 2025</div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="text-xs font-bold text-green-400 uppercase mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> INGRESOS
                  </div>
                  <div className="space-y-2">
                    {[
                      { label:`Venta leche ${stats.litrosMes.toLocaleString('es-CO')}L × $${PRECIO_LITRO.toLocaleString('es-CO')}`, val: stats.ingresosLeche, pct: Math.round(stats.ingresosLeche/stats.totalIngresos*100) },
                      { label:'Venta ganado (4 cabezas)', val: stats.ingresosGanado, pct: Math.round(stats.ingresosGanado/stats.totalIngresos*100) },
                      { label:'Venta embriones (3 lotes TE)', val: stats.ingresosEmbriones, pct: Math.round(stats.ingresosEmbriones/stats.totalIngresos*100) },
                    ].map(r => (
                      <div key={r.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground text-xs">{r.label}</span>
                          <div className="text-right">
                            <span className="font-medium text-foreground">{fmt(r.val)}</span>
                            <span className="text-muted-foreground text-[10px] ml-1">{r.pct}%</span>
                          </div>
                        </div>
                        <div className="h-1 bg-muted/30 rounded-full">
                          <div className="h-1 bg-green-500 rounded-full" style={{width:`${r.pct}%`}} />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 border-t border-border">
                      <span className="font-bold text-foreground">Total ingresos</span>
                      <span className="font-bold text-green-400 text-base">{fmt(stats.totalIngresos)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-red-400 uppercase mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> EGRESOS
                  </div>
                  <div className="space-y-2">
                    {[
                      { label:'Alimentación / concentrados', val: stats.alimentacion },
                      { label:`Nómina y prestaciones (${personal.length} empleados)`, val: stats.nominaTotal },
                      { label:'Medicamentos y sanidad', val: stats.medicamentos },
                      { label:'Mantenimiento finca', val: stats.mantenimiento },
                      { label:'Servicios públicos / internet', val: stats.servicios },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between text-sm py-1 border-b border-border/30 last:border-0">
                        <span className="text-muted-foreground text-xs">{r.label}</span>
                        <span className="font-medium text-red-400">({fmt(r.val)})</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 border-t border-border">
                      <span className="font-bold text-foreground">Total egresos</span>
                      <span className="font-bold text-red-400 text-base">({fmt(stats.totalEgresos)})</span>
                    </div>
                  </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">UTILIDAD NETA</div>
                    <span className="font-bold text-green-400 text-2xl">{fmt(stats.utilidad)}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-0.5">MARGEN</div>
                    <span className="font-bold text-green-400 text-2xl">{stats.margenPct}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Costo por litro breakdown */}
            <div className="space-y-5">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="font-semibold text-sm mb-4">Estructura de Costo por Litro</div>
                <div className="space-y-3">
                  {stats.costoItems.map(c => (
                    <div key={c.concepto}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{c.concepto}</span>
                        <span className="font-semibold" style={{color: c.color}}>
                          ${Math.round(c.val / (stats.litrosMes || 1)).toLocaleString('es-CO')}/L · {c.pct}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full">
                        <div className="h-2 rounded-full transition-all duration-500" style={{width:`${c.pct}%`, background: c.color}} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-border flex justify-between">
                  <span className="text-sm text-muted-foreground">Total costo/litro</span>
                  <span className="font-bold text-foreground text-sm">
                    ${stats.costoLitro.toLocaleString('es-CO')}/L
                    <span className={`ml-2 text-xs font-normal ${costoLitroOk ? 'text-green-400' : 'text-orange-400'}`}>
                      {costoLitroOk ? '✓ Meta lograda' : `↑ $${(stats.costoLitro - COSTO_LITRO_META).toLocaleString('es-CO')} sobre meta`}
                    </span>
                  </span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="font-semibold text-sm mb-4">Margen neto por litro producido</div>
                <div className="grid grid-cols-5 gap-2 items-center text-center">
                  <div className="bg-green-500/10 rounded-lg p-3 col-span-2">
                    <div className="text-xs text-muted-foreground">Precio/L</div>
                    <div className="text-xl font-bold text-green-400">${PRECIO_LITRO.toLocaleString('es-CO')}</div>
                  </div>
                  <div className="text-2xl text-muted-foreground font-light">−</div>
                  <div className="bg-red-500/10 rounded-lg p-3 col-span-2">
                    <div className="text-xs text-muted-foreground">Costo/L</div>
                    <div className="text-xl font-bold text-red-400">${stats.costoLitro.toLocaleString('es-CO')}</div>
                  </div>
                </div>
                <div className="mt-3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Margen por litro</div>
                  <div className="text-3xl font-bold text-blue-400">${stats.margenLitro.toLocaleString('es-CO')}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stats.margenLitroPct}% del precio · {fmt(stats.litrosMes * stats.margenLitro)} utilidad leche/mes</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tendencia */}
        <TabsContent value="tendencia">
          <div className="bg-card border border-border rounded-xl p-5 mt-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold">Tendencia Financiera — 7 Meses</div>
                <div className="text-xs text-muted-foreground">Oct 2024 – Abr 2025 · Ingresos, Egresos y Utilidad</div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5"><span className="w-3 h-2 bg-green-500 rounded inline-block" /><span className="text-muted-foreground">Ingresos</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-2 bg-red-500 rounded inline-block" /><span className="text-muted-foreground">Egresos</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-2 bg-blue-500 rounded inline-block" /><span className="text-muted-foreground">Utilidad</span></div>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tendenciaData} margin={{top:20,right:10,left:10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="mes" stroke="#444" tick={{fill:'#888',fontSize:11}} />
                  <YAxis stroke="#444" tick={{fill:'#888',fontSize:10}} width={52} tickFormatter={(v:number)=>`${(v/1000000).toFixed(0)}M`} />
                  <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} formatter={(v:number) => [fmt(v)]} />
                  <Bar dataKey="ingresos" fill="#22c55e" radius={[3,3,0,0]} name="Ingresos" />
                  <Bar dataKey="egresos" fill="#ef4444" radius={[3,3,0,0]} name="Egresos" />
                  <Bar dataKey="utilidad" fill="#3b82f6" radius={[3,3,0,0]} name="Utilidad">
                    <LabelList dataKey="utilidad" position="top" style={{fill:'#888',fontSize:9}} formatter={(v:number) => `${(v/1000000).toFixed(0)}M`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label:'Ingreso más alto', val: fmt(Math.max(...tendenciaData.map(d=>d.ingresos))), color:'text-green-400' },
                { label:'Egreso más alto', val: fmt(Math.max(...tendenciaData.map(d=>d.egresos))), color:'text-red-400' },
                { label:'Mejor utilidad', val: fmt(Math.max(...tendenciaData.map(d=>d.utilidad))), color:'text-blue-400' },
              ].map(s => (
                <div key={s.label} className="bg-muted/20 rounded-lg p-3 text-center">
                  <div className="text-[10px] text-muted-foreground mb-1">{s.label}</div>
                  <div className={`text-sm font-bold ${s.color}`}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Categoría */}
        <TabsContent value="categoria">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-3">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-semibold text-sm mb-4">Distribución de Egresos por Categoría</div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.costoItems} layout="vertical" margin={{top:0,right:60,left:80,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                    <XAxis type="number" stroke="#444" tick={{fill:'#888',fontSize:10}} tickFormatter={(v:number)=>`${(v/1000000).toFixed(0)}M`} />
                    <YAxis type="category" dataKey="concepto" stroke="#444" tick={{fill:'#888',fontSize:11}} />
                    <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} formatter={(v:number) => [fmt(v)]} />
                    <Bar dataKey="val" radius={[0,4,4,0]} name="Valor">
                      {stats.costoItems.map((entry, i) => (
                        <rect key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-semibold text-sm mb-4">Detalle por Categoría</div>
              <div className="space-y-3">
                {stats.costoItems.map(c => (
                  <div key={c.concepto} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="w-3 h-8 rounded-full flex-shrink-0" style={{background: c.color}} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{c.concepto}</div>
                      <div className="text-xs text-muted-foreground">{c.pct}% del total egresos</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-foreground">{fmt(c.val)}</div>
                      <div className="text-xs text-muted-foreground">${Math.round(c.val/(stats.litrosMes||1)).toLocaleString('es-CO')}/L</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Break-Even */}
        <TabsContent value="breakeven">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-3">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-semibold text-sm mb-1">Punto de Equilibrio (Break-Even)</div>
              <div className="text-xs text-muted-foreground mb-5">Producción mínima para cubrir todos los costos</div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="text-xs text-muted-foreground">Costos Fijos/mes</div>
                    <div className="text-xl font-bold text-blue-400">{fmt(stats.costosFijos)}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">Nómina + mant. + servicios</div>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                    <div className="text-xs text-muted-foreground">Costos Variables/mes</div>
                    <div className="text-xl font-bold text-orange-400">{fmt(stats.costosVariables)}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">Alimentación + medicamentos</div>
                  </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 text-center">
                  <div className="text-xs text-muted-foreground mb-2">PUNTO DE EQUILIBRIO</div>
                  <div className="text-4xl font-bold text-green-400">{stats.breakevenLitros.toLocaleString('es-CO')} L</div>
                  <div className="text-sm text-muted-foreground mt-2">Producción mínima mensual para no perder</div>
                  <div className="mt-3 text-xs text-foreground">
                    Producción actual: <strong className="text-foreground">{stats.litrosMes.toLocaleString('es-CO')} L</strong>
                    {' · '}
                    <strong className={stats.litrosMes > stats.breakevenLitros ? 'text-green-400' : 'text-red-400'}>
                      {stats.litrosMes > stats.breakevenLitros ? `+${(stats.litrosMes - stats.breakevenLitros).toLocaleString('es-CO')} L sobre el punto` : 'Bajo el punto de equilibrio'}
                    </strong>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Utilización</span>
                    <span className="font-semibold text-foreground">{stats.breakevenPct}% = break-even</span>
                  </div>
                  <div className="h-4 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-4 bg-gradient-to-r from-red-500 to-green-500 rounded-full relative" style={{width:'100%'}}>
                      <div className="absolute top-0 h-4 w-0.5 bg-white" style={{left:`${stats.breakevenPct}%`}} />
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground text-center mt-1">
                    La línea blanca indica el punto de equilibrio — a la derecha = ganancia
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-semibold text-sm mb-4">Análisis de Sensibilidad de Precio</div>
              <div className="space-y-3">
                {[900,1000,1100,1200,1250,1400,1600].map(precio => {
                  const ing = stats.litrosMes * precio;
                  const util = ing - stats.totalEgresos;
                  const margen = ((util / ing) * 100).toFixed(0);
                  const isActual = precio === PRECIO_LITRO;
                  return (
                    <div key={precio} className={`flex items-center gap-3 p-2.5 rounded-lg border ${isActual ? 'bg-primary/10 border-primary/30' : 'border-border bg-muted/10'}`}>
                      <span className={`w-16 text-sm font-bold ${isActual ? 'text-primary' : 'text-muted-foreground'}`}>${precio.toLocaleString('es-CO')}/L</span>
                      <div className="flex-1">
                        <div className="h-1.5 bg-muted/30 rounded-full">
                          <div className={`h-1.5 rounded-full ${util >= 0 ? 'bg-green-500' : 'bg-red-500'}`} style={{width:`${Math.min(Math.max((util/ing)*100, 0), 100)}%`}} />
                        </div>
                      </div>
                      <span className={`w-20 text-right text-xs font-bold ${util >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(util)}</span>
                      <span className={`w-12 text-right text-xs ${util >= 0 ? 'text-green-400' : 'text-red-400'}`}>{util >= 0 ? `+${margen}%` : `${margen}%`}</span>
                      {isActual && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-bold">ACTUAL</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
