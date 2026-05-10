import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList, LineChart, Line, ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState } from "../lib/data";
import { TrendingUp, Zap, Target, BarChart2 } from "lucide-react";

const dataProy = [
  { name: 'Abr', litros: 61300, meta: 60000, isReal: true },
  { name: 'May', litros: 59000, meta: 62000, isReal: false },
  { name: 'Jun', litros: 62000, meta: 64000, isReal: false },
  { name: 'Jul', litros: 65000, meta: 65000, isReal: false },
  { name: 'Ago', litros: 64000, meta: 67000, isReal: false },
  { name: 'Sep', litros: 68000, meta: 70000, isReal: false },
];

const escenarios = [
  {
    nombre: 'Conservador',
    color: '#3b82f6',
    desc: 'Sin cambios en gestión',
    data: [61300, 59000, 60000, 62000, 63000, 64000],
    utilidad: 28400000,
    vacas: 5,
    iep: 428,
  },
  {
    nombre: 'Moderado',
    color: '#f59e0b',
    desc: 'IATF + mejora nutrición',
    data: [61300, 63000, 66000, 68000, 71000, 73000],
    utilidad: 38200000,
    vacas: 7,
    iep: 400,
  },
  {
    nombre: 'Optimista',
    color: '#22c55e',
    desc: 'Plan integral SoftGan',
    data: [61300, 67000, 71000, 75000, 78000, 82000],
    utilidad: 51600000,
    vacas: 10,
    iep: 385,
  },
];

const escenariosMes = ['Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];

const radarData = [
  { subject: 'Producción', Actual: 72, Optimo: 92 },
  { subject: 'Reproducción', Actual: 52, Optimo: 85 },
  { subject: 'Nutrición', Actual: 68, Optimo: 88 },
  { subject: 'Sanidad', Actual: 80, Optimo: 95 },
  { subject: 'Manejo', Actual: 65, Optimo: 90 },
  { subject: 'Eficiencia', Actual: 58, Optimo: 85 },
];

const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function Prediccion() {
  const { animals } = useAppState();
  const [precio, setPrecio] = useState(1250);
  const [vacas, setVacas] = useState(5);
  const [litrosVaca, setLitrosVaca] = useState(16.4);
  const [costo, setCosto] = useState(820);
  const [activeTab, setActiveTab] = useState("proyeccion");

  const litrosDia = vacas * litrosVaca;
  const litrosMes = litrosDia * 30;
  const ingresoMes = litrosMes * precio;
  const costoMes = litrosMes * costo;
  const utilidad = ingresoMes - costoMes;
  const margen = ingresoMes > 0 ? ((utilidad / ingresoMes) * 100).toFixed(1) : '0.0';

  const escenarioData = useMemo(() =>
    escenariosMes.map((mes, i) => ({
      mes,
      Conservador: escenarios[0].data[i],
      Moderado: escenarios[1].data[i],
      Optimista: escenarios[2].data[i],
    })), []);

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#1a0050] to-[#4c1d95] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">🤖</div>
          <div>
            <h1 className="text-xl font-bold text-white">Predicciones IA — Simulador 12M</h1>
            <p className="text-white/70 text-sm">Proyecciones · Escenarios comparativos · Radar de desempeño · SoftGan AI</p>
          </div>
        </div>
      </div>

      {/* Diagnóstico IA */}
      <div className="border border-amber-500/30 rounded-xl p-5 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl flex-shrink-0">🤖</div>
          <div className="flex-1">
            <div className="font-semibold text-foreground mb-3">Diagnóstico SoftGan IA — 10 Mayo 2026:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="text-sm text-muted-foreground bg-muted/20 rounded-lg p-2.5">⚠️ IEP 428d → pérdida <strong className="text-foreground">$8.2M COP/mes</strong></div>
              <div className="text-sm text-green-400 bg-green-500/10 rounded-lg p-2.5">✅ Intensidad CO₂ 0.82 kg/L — 25% mejor que Colombia</div>
              <div className="text-sm text-amber-400 bg-amber-500/10 rounded-lg p-2.5">💡 Si IEP → 390d: +14 vacas → <strong>+$8.4M/mes</strong></div>
              <div className="text-sm text-blue-400 bg-blue-500/10 rounded-lg p-2.5">📈 Tendencia producción: +9.4% vs año anterior</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="proyeccion" className="gap-1.5 text-xs"><TrendingUp size={13} /> Proyección 6M</TabsTrigger>
          <TabsTrigger value="escenarios" className="gap-1.5 text-xs"><BarChart2 size={13} /> Escenarios</TabsTrigger>
          <TabsTrigger value="simulador" className="gap-1.5 text-xs"><Zap size={13} /> Simulador</TabsTrigger>
          <TabsTrigger value="radar" className="gap-1.5 text-xs"><Target size={13} /> Radar Desempeño</TabsTrigger>
        </TabsList>

        {/* Proyección */}
        <TabsContent value="proyeccion">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-3">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold">📈 Proyección producción 6 meses</div>
                  <div className="text-xs text-muted-foreground">Abr (real) + May–Sep (IA proyectado)</div>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <div className="flex items-center gap-1"><span className="w-3 h-2 bg-violet-600 rounded-sm inline-block" /><span className="text-muted-foreground">Producción</span></div>
                  <div className="flex items-center gap-1"><span className="w-3 h-1 border-t-2 border-dashed border-amber-400 inline-block" /><span className="text-muted-foreground">Meta</span></div>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dataProy} margin={{top:20,right:10,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#444" tick={{fill:'#888',fontSize:11}} />
                    <YAxis stroke="#444" tick={{fill:'#888',fontSize:10}} width={42} tickFormatter={(v:number)=>`${(v/1000).toFixed(0)}K`} />
                    <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} formatter={(v:number)=>[`${v.toLocaleString('es-CO')} L`]} />
                    <Bar dataKey="litros" fill="#7c3aed" radius={[4,4,0,0]} name="Producción">
                      <LabelList dataKey="litros" position="top" style={{fill:'#888',fontSize:9}} formatter={(v:number)=>`${(v/1000).toFixed(0)}K`} />
                    </Bar>
                    <Line type="monotone" dataKey="meta" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Meta" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="text-center bg-muted/20 rounded-lg p-2">
                  <div className="text-[10px] text-muted-foreground">Abr (Real)</div>
                  <div className="text-sm font-bold text-foreground">61.3K L</div>
                </div>
                <div className="text-center bg-muted/20 rounded-lg p-2">
                  <div className="text-[10px] text-muted-foreground">Sep (Proy.)</div>
                  <div className="text-sm font-bold text-green-400">68K L</div>
                </div>
                <div className="text-center bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                  <div className="text-[10px] text-muted-foreground">Crecimiento</div>
                  <div className="text-sm font-bold text-green-400">↑ +11.9%</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-semibold mb-1">📊 Proyección financiera 6M</div>
              <div className="text-xs text-muted-foreground mb-4">Ingresos proyectados mensualmente</div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataProy.map((d, i) => ({...d, ingreso: d.litros * precio, util: d.litros * (precio - costo)}))} margin={{top:16,right:10,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#444" tick={{fill:'#888',fontSize:11}} />
                    <YAxis stroke="#444" tick={{fill:'#888',fontSize:10}} width={52} tickFormatter={(v:number)=>`${(v/1000000).toFixed(0)}M`} />
                    <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} formatter={(v:number) => [fmt(v)]} />
                    <Line type="monotone" dataKey="ingreso" stroke="#22c55e" strokeWidth={2} dot={{ fill:'#22c55e', r:3 }} name="Ingreso" />
                    <Line type="monotone" dataKey="util" stroke="#7c3aed" strokeWidth={2} dot={{ fill:'#7c3aed', r:3 }} name="Utilidad" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="text-center bg-green-500/10 rounded-lg p-2">
                  <div className="text-[10px] text-muted-foreground">Ingreso Sep est.</div>
                  <div className="text-sm font-bold text-green-400">{fmt(68000 * precio)}</div>
                </div>
                <div className="text-center bg-purple-500/10 rounded-lg p-2">
                  <div className="text-[10px] text-muted-foreground">Utilidad Sep est.</div>
                  <div className="text-sm font-bold text-purple-400">{fmt(68000 * (precio - costo))}</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Escenarios */}
        <TabsContent value="escenarios">
          <div className="space-y-5 mt-3">
            {/* Scenario cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {escenarios.map(e => (
                <div key={e.nombre} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="px-5 py-3 border-b border-border" style={{background: `${e.color}15`}}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{background: e.color}} />
                      <div className="font-semibold text-foreground">{e.nombre}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{e.desc}</div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Vacas nuevas</span>
                      <span className="text-xs font-bold" style={{color:e.color}}>+{e.vacas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">IEP proyectado</span>
                      <span className="text-xs font-bold" style={{color:e.color}}>{e.iep}d</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Producción Sep</span>
                      <span className="text-xs font-bold text-foreground">{(e.data[5]/1000).toFixed(0)}K L</span>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <div className="text-[10px] text-muted-foreground">Utilidad mensual proyectada</div>
                      <div className="text-lg font-bold mt-0.5" style={{color:e.color}}>{fmt(e.utilidad)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison chart */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-semibold mb-1">📊 Comparación de escenarios — Producción mensual</div>
              <div className="text-xs text-muted-foreground mb-4">Litros producidos por mes según cada escenario</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={escenarioData} margin={{top:16,right:10,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="mes" stroke="#444" tick={{fill:'#888',fontSize:11}} />
                    <YAxis stroke="#444" tick={{fill:'#888',fontSize:10}} width={42} tickFormatter={(v:number)=>`${(v/1000).toFixed(0)}K`} />
                    <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} formatter={(v:number)=>[`${v.toLocaleString('es-CO')} L`]} />
                    <Bar dataKey="Conservador" fill="#3b82f6" radius={[3,3,0,0]} />
                    <Bar dataKey="Moderado" fill="#f59e0b" radius={[3,3,0,0]} />
                    <Bar dataKey="Optimista" fill="#22c55e" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-3 text-xs">
                {escenarios.map(e => (
                  <div key={e.nombre} className="flex items-center gap-1.5">
                    <span className="w-3 h-2 rounded-sm inline-block" style={{background: e.color}} />
                    <span className="text-muted-foreground">{e.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Simulador */}
        <TabsContent value="simulador">
          <div className="bg-card border border-border rounded-xl p-5 mt-3">
            <div className="font-semibold mb-1">🎛️ Simulador Financiero en Tiempo Real</div>
            <div className="text-xs text-muted-foreground mb-6">Ajuste los parámetros y vea el impacto inmediato en la rentabilidad</div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {[
                  { label:'Precio litro (COP/L)', value:precio, setValue:setPrecio, min:800, max:2000, step:50, display:`$${precio.toLocaleString('es-CO')}`, minLabel:'$800', maxLabel:'$2.000' },
                  { label:'Vacas en producción', value:vacas, setValue:setVacas, min:1, max:50, step:1, display:String(vacas), minLabel:'1', maxLabel:'50' },
                  { label:'Litros/vaca/día', value:litrosVaca, setValue:setLitrosVaca, min:5, max:30, step:0.5, display:`${litrosVaca.toFixed(1)} L`, minLabel:'5L', maxLabel:'30L' },
                  { label:'Costo producción/L', value:costo, setValue:setCosto, min:400, max:1500, step:10, display:`$${costo.toLocaleString('es-CO')}`, minLabel:'$400', maxLabel:'$1.500' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-bold text-foreground">{s.display}</span>
                    </div>
                    <Slider min={s.min} max={s.max} step={s.step} value={[s.value]} onValueChange={([v]) => s.setValue(v)} />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5"><span>{s.minLabel}</span><span>{s.maxLabel}</span></div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/20 border border-border rounded-xl p-5 space-y-4 self-start">
                <div className="text-xs font-bold text-muted-foreground uppercase">📊 Resultado proyectado</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label:'L/día', val:`${litrosDia.toFixed(0)} L`, color:'text-cyan-400' },
                    { label:'L/mes', val:`${litrosMes.toLocaleString('es-CO')} L`, color:'text-blue-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-card rounded-lg p-3 text-center border border-border">
                      <div className="text-[10px] text-muted-foreground">{s.label}</div>
                      <div className={`text-base font-bold ${s.color}`}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { label:'Ingreso bruto', val:fmt(ingresoMes), color:'text-green-400' },
                    { label:'Costo total', val:`(${fmt(costoMes)})`, color:'text-red-400' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className={`font-medium ${r.color}`}>{r.val}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-border flex justify-between items-center">
                    <span className="font-bold text-foreground">UTILIDAD NETA</span>
                    <span className={`font-bold text-xl ${utilidad >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(utilidad)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Margen neto</span>
                    <span className={`font-bold ${Number(margen) > 30 ? 'text-green-400' : Number(margen) > 15 ? 'text-amber-400' : 'text-red-400'}`}>{margen}%</span>
                  </div>
                </div>
                {utilidad < 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-400">
                    ⚠️ Con estos parámetros el negocio genera pérdidas. Aumente precio o reduzca costos.
                  </div>
                )}
                {utilidad > 30000000 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-xs text-green-400">
                    ✅ Escenario muy favorable. Rentabilidad superior al benchmark del sector.
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Radar */}
        <TabsContent value="radar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-3">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-semibold mb-1">🎯 Radar de Desempeño — Análisis 360°</div>
              <div className="text-xs text-muted-foreground mb-4">Comparación: estado actual vs. óptimo recomendado por SoftGan IA</div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="subject" tick={{fill:'#888',fontSize:11}} />
                    <PolarRadiusAxis angle={30} domain={[0,100]} tick={{fill:'#555',fontSize:9}} />
                    <Radar name="Actual" dataKey="Actual" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
                    <Radar name="Óptimo" dataKey="Optimo" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeDasharray="5 5" />
                    <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 text-xs mt-2">
                <div className="flex items-center gap-1.5"><span className="w-3 h-2 bg-violet-600 rounded-sm inline-block" /><span className="text-muted-foreground">Estado actual</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-2 bg-green-500 rounded-sm inline-block opacity-40" /><span className="text-muted-foreground">Óptimo IA</span></div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-semibold mb-4">Brechas de mejora identificadas</div>
              <div className="space-y-3">
                {radarData.map(r => {
                  const brecha = r.Optimo - r.Actual;
                  const pctActual = r.Actual;
                  return (
                    <div key={r.subject}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-foreground">{r.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${pctActual >= 80 ? 'text-green-400' : pctActual >= 65 ? 'text-amber-400' : 'text-red-400'}`}>{pctActual}%</span>
                          <span className="text-[10px] text-muted-foreground">→ meta {r.Optimo}%</span>
                          <span className="text-[10px] font-bold text-orange-400">brecha {brecha}pts</span>
                        </div>
                      </div>
                      <div className="relative h-2 bg-muted/30 rounded-full">
                        <div className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-violet-400" style={{width:`${pctActual}%`}} />
                        <div className="absolute top-0 h-2 w-0.5 bg-green-400 opacity-50" style={{left:`${r.Optimo}%`}} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 bg-violet-500/10 border border-violet-500/30 rounded-xl p-4">
                <div className="text-xs font-semibold text-violet-400 mb-2">🤖 Prioridades SoftGan IA:</div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div>1. <strong className="text-foreground">Reproducción (52%)</strong> — mayor brecha, máximo impacto económico</div>
                  <div>2. <strong className="text-foreground">Eficiencia (58%)</strong> — optimizar costos por litro producido</div>
                  <div>3. <strong className="text-foreground">Manejo (65%)</strong> — protocolos de ordeño y bienestar</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
