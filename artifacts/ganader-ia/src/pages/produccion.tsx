import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList, LineChart, Line, ComposedChart, Area } from "recharts";
import { Download, Plus, TrendingUp, TrendingDown, Droplets, Activity, Award, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState } from "../lib/data";

const dataHistorico = [
  { name: 'Oct', litros: 52000, meta: 60000, rcs: 245, grasa: 3.8, proteina: 3.2 },
  { name: 'Nov', litros: 55000, meta: 60000, rcs: 232, grasa: 3.9, proteina: 3.3 },
  { name: 'Dic', litros: 58000, meta: 60000, rcs: 218, grasa: 4.0, proteina: 3.3 },
  { name: 'Ene', litros: 62000, meta: 60000, rcs: 198, grasa: 4.1, proteina: 3.4 },
  { name: 'Feb', litros: 60000, meta: 60000, rcs: 210, grasa: 3.9, proteina: 3.3 },
  { name: 'Mar', litros: 56000, meta: 60000, rcs: 225, grasa: 3.8, proteina: 3.2 },
  { name: 'Abr', litros: 61300, meta: 60000, rcs: 195, grasa: 4.0, proteina: 3.4 },
];

const registrosIniciales = [
  { id: 1, fecha: '29/04/2025', turno: 'Mañana', litros: 1120, precioCOP: 1250, nota: 'Ordeño normal', operador: 'Luis Patiño', rcs: 192, grasa: 4.0, proteina: 3.4 },
  { id: 2, fecha: '29/04/2025', turno: 'Tarde', litros: 860, precioCOP: 1250, nota: 'Ordeño normal', operador: 'Sandra Roa', rcs: 198, grasa: 3.9, proteina: 3.3 },
  { id: 3, fecha: '28/04/2025', turno: 'Mañana', litros: 1150, precioCOP: 1250, nota: 'Lluvia intensa', operador: 'Luis Patiño', rcs: 205, grasa: 3.8, proteina: 3.3 },
  { id: 4, fecha: '28/04/2025', turno: 'Tarde', litros: 860, precioCOP: 1250, nota: 'Lluvia intensa', operador: 'Sandra Roa', rcs: 210, grasa: 3.8, proteina: 3.2 },
  { id: 5, fecha: '27/04/2025', turno: 'Mañana', litros: 1100, precioCOP: 1250, nota: '—', operador: 'Luis Patiño', rcs: 195, grasa: 4.0, proteina: 3.4 },
  { id: 6, fecha: '27/04/2025', turno: 'Tarde', litros: 850, precioCOP: 1250, nota: '—', operador: 'Sandra Roa', rcs: 200, grasa: 3.9, proteina: 3.3 },
  { id: 7, fecha: '26/04/2025', turno: 'Mañana', litros: 1180, precioCOP: 1250, nota: '—', operador: 'Luis Patiño', rcs: 188, grasa: 4.1, proteina: 3.5 },
  { id: 8, fecha: '26/04/2025', turno: 'Tarde', litros: 845, precioCOP: 1250, nota: '—', operador: 'Sandra Roa', rcs: 192, grasa: 4.0, proteina: 3.4 },
  { id: 9, fecha: '25/04/2025', turno: 'Mañana', litros: 1060, precioCOP: 1250, nota: 'Vacuna IBR', operador: 'Luis Patiño', rcs: 220, grasa: 3.7, proteina: 3.2 },
  { id: 10, fecha: '25/04/2025', turno: 'Tarde', litros: 830, precioCOP: 1250, nota: 'Vacuna IBR', operador: 'Sandra Roa', rcs: 225, grasa: 3.7, proteina: 3.1 },
];

const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const PRECIO_LITRO = 1250;
const COSTO_LITRO = 820;

export default function Produccion() {
  const { animals } = useAppState();
  const [open, setOpen] = useState(false);
  const [regs, setRegs] = useState(registrosIniciales);
  const [activeTab, setActiveTab] = useState("registros");
  const [turnoFilter, setTurnoFilter] = useState("Todos");

  const vacasEnProduccion = useMemo(() =>
    animals.filter(a => a.estado === 'Producción' && (a.litrosDia || 0) > 0)
      .sort((a, b) => (b.litrosDia || 0) - (a.litrosDia || 0)),
    [animals]
  );

  const totalLitrosDia = useMemo(() => Math.round(vacasEnProduccion.reduce((s, a) => s + (a.litrosDia || 0), 0)), [vacasEnProduccion]);
  const litrosMes = useMemo(() => totalLitrosDia * 30, [totalLitrosDia]);
  const litrosPorVaca = vacasEnProduccion.length > 0 ? (totalLitrosDia / vacasEnProduccion.length).toFixed(1) : '0';
  const ingresoMes = litrosMes * PRECIO_LITRO;
  const costoMes = litrosMes * COSTO_LITRO;
  const margen = ingresoMes > 0 ? ((ingresoMes - costoMes) / ingresoMes * 100).toFixed(1) : '0';
  const utilidadMes = ingresoMes - costoMes;

  const registrosFiltrados = turnoFilter === 'Todos' ? regs : regs.filter(r => r.turno === turnoFilter);

  const rcsPromedio = Math.round(dataHistorico[dataHistorico.length - 1].rcs);
  const grasaPromedio = dataHistorico[dataHistorico.length - 1].grasa;
  const proteinaPromedio = dataHistorico[dataHistorico.length - 1].proteina;

  const litrosHoy = regs.filter(r => r.fecha === '29/04/2025').reduce((s, r) => s + r.litros, 0);
  const litrosMañana = regs.filter(r => r.turno === 'Mañana' && r.fecha === '29/04/2025').reduce((s, r) => s + r.litros, 0);
  const litrosTarde = regs.filter(r => r.turno === 'Tarde' && r.fecha === '29/04/2025').reduce((s, r) => s + r.litros, 0);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const litros = Number(fd.get('litros'));
    setRegs([{
      id: regs.length + 1,
      fecha: fd.get('fecha') as string,
      turno: fd.get('turno') as string,
      litros,
      precioCOP: PRECIO_LITRO,
      nota: fd.get('nota') as string || '—',
      operador: fd.get('operador') as string || '—',
      rcs: Number(fd.get('rcs') || 200),
      grasa: Number(fd.get('grasa') || 3.9),
      proteina: Number(fd.get('proteina') || 3.3),
    }, ...regs]);
    setOpen(false);
  };

  const getTurnoIcon = (turno: string) => turno === 'Mañana' ? '🌅' : '🌆';

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0f3460] to-[#1565c0] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">🥛</div>
          <div>
            <h1 className="text-xl font-bold text-white">Producción — Leche y Carne</h1>
            <p className="text-white/70 text-sm">Ordeño 2 turnos · Calidad RCS/grasa/proteína · Tendencias · Ranking vacas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-9 gap-1.5 text-sm">
            <Download size={14} /> CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 h-9 gap-1.5 text-sm">
                <Plus size={14} /> Registrar Ordeño
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleAdd}>
                <DialogHeader><DialogTitle>Registrar Ordeño</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Fecha</Label>
                      <Input name="fecha" placeholder="DD/MM/AAAA" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Turno</Label>
                      <Select name="turno" defaultValue="Mañana">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mañana">🌅 Mañana</SelectItem>
                          <SelectItem value="Tarde">🌆 Tarde</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Litros totales</Label>
                      <Input name="litros" type="number" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Operador</Label>
                      <Input name="operador" />
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase mt-1">Calidad (opcional)</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">RCS (miles)</Label>
                      <Input name="rcs" type="number" placeholder="200" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">% Grasa</Label>
                      <Input name="grasa" type="number" step="0.1" placeholder="3.9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">% Proteína</Label>
                      <Input name="proteina" type="number" step="0.1" placeholder="3.3" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Anotación</Label>
                    <Input name="nota" placeholder="Observaciones..." />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                  <Button type="submit">Guardar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:'VACAS EN ORDEÑO', val: String(vacasEnProduccion.length), sub:`${litrosPorVaca} L/vaca/día`, gradient:'linear-gradient(135deg,#0d47a1,#1565c0)', icon:'🐄' },
          { label:'LITROS HOY', val:`${litrosHoy.toLocaleString('es-CO')} L`, sub:`🌅 ${litrosMañana}L · 🌆 ${litrosTarde}L`, gradient:'linear-gradient(135deg,#1b5e20,#2e7d32)', icon:'🥛' },
          { label:'INGRESO MES EST.', val: fmt(ingresoMes), sub:`${(litrosMes/1000).toFixed(0)}K L × $${PRECIO_LITRO.toLocaleString('es-CO')}`, gradient:'linear-gradient(135deg,#e65100,#f57c00)', icon:'💰' },
          { label:'COSTO/LITRO', val:`$${COSTO_LITRO.toLocaleString('es-CO')}`, sub:'Meta $800/L — revisar', gradient:'linear-gradient(135deg,#b71c1c,#c62828)', icon:'📊' },
          { label:'MARGEN NETO', val:`${margen}%`, sub: fmt(utilidadMes) + '/mes', gradient:'linear-gradient(135deg,#4a148c,#6a1b9a)', icon:'✅' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white shadow" style={{background:k.gradient}}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">{k.label}</div>
            <div className="text-lg font-bold leading-tight">{k.val}</div>
            <div className="text-[10px] text-white/60 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* KPI Calidad */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Droplets size={18} className="text-blue-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-muted-foreground">RCS PROMEDIO</div>
            <div className="text-xl font-bold text-foreground">{rcsPromedio}K</div>
            <div className={`text-[10px] font-semibold ${rcsPromedio < 200 ? 'text-green-400' : rcsPromedio < 300 ? 'text-amber-400' : 'text-red-400'}`}>
              {rcsPromedio < 200 ? '✓ Excelente' : rcsPromedio < 300 ? '⚠ Aceptable' : '✗ Alto'} · Meta &lt;200K
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Activity size={18} className="text-amber-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-muted-foreground">% GRASA</div>
            <div className="text-xl font-bold text-foreground">{grasaPromedio}%</div>
            <div className={`text-[10px] font-semibold ${grasaPromedio >= 3.8 ? 'text-green-400' : 'text-orange-400'}`}>
              {grasaPromedio >= 3.8 ? '✓ Óptima' : '⚠ Baja'} · Meta ≥3.8%
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-purple-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-muted-foreground">% PROTEÍNA</div>
            <div className="text-xl font-bold text-foreground">{proteinaPromedio}%</div>
            <div className={`text-[10px] font-semibold ${proteinaPromedio >= 3.3 ? 'text-green-400' : 'text-orange-400'}`}>
              {proteinaPromedio >= 3.3 ? '✓ Óptima' : '⚠ Baja'} · Meta ≥3.3%
            </div>
          </div>
        </div>
      </div>

      {/* Charts 2-col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Histórico producción con tendencia */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold">Histórico Producción vs Meta</div>
              <div className="text-xs text-muted-foreground">Litros/mes · Oct 2024 – Abr 2025</div>
            </div>
            <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">↑ +9.4%</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dataHistorico} margin={{top:16,right:10,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#444" tick={{fill:'#888',fontSize:10}} />
                <YAxis stroke="#444" tick={{fill:'#888',fontSize:10}} width={42} tickFormatter={(v:number)=>`${(v/1000).toFixed(0)}K`} />
                <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} formatter={(v:number) => [`${v.toLocaleString('es-CO')} L`]} />
                <Bar dataKey="litros" fill="#1565c0" radius={[4,4,0,0]} name="Producción">
                  <LabelList dataKey="litros" position="top" style={{fill:'#888',fontSize:9}} formatter={(v:number) => `${(v/1000).toFixed(0)}K`} />
                </Bar>
                <Line type="monotone" dataKey="meta" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Meta" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-green-500/10 rounded-lg p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Precio/L</div>
              <div className="text-sm font-bold text-green-400">${PRECIO_LITRO.toLocaleString('es-CO')}</div>
            </div>
            <div className="bg-red-500/10 rounded-lg p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Costo/L</div>
              <div className="text-sm font-bold text-red-400">${COSTO_LITRO.toLocaleString('es-CO')}</div>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Margen/L</div>
              <div className="text-sm font-bold text-blue-400">${(PRECIO_LITRO - COSTO_LITRO).toLocaleString('es-CO')}</div>
            </div>
          </div>
        </div>

        {/* Ranking vacas */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Award size={16} className="text-amber-400" />
            </div>
            <div>
              <div className="font-semibold">Ranking — Top Vacas en Producción</div>
              <div className="text-xs text-muted-foreground">{vacasEnProduccion.length} en ordeño · {totalLitrosDia} L/día total</div>
            </div>
          </div>
          {vacasEnProduccion.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay vacas en producción actualmente.</p>
          ) : (
            <div className="space-y-3">
              {vacasEnProduccion.map((v, i) => {
                const pct = Math.min(((v.litrosDia||0)/25)*100, 100);
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`;
                const barColor = i === 0 ? 'from-amber-500 to-yellow-400' : i === 1 ? 'from-gray-400 to-gray-300' : i === 2 ? 'from-orange-500 to-orange-400' : 'from-blue-600 to-cyan-400';
                return (
                  <div key={v.id} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 bg-muted/30">{medal}</span>
                    <div className="w-20 shrink-0">
                      <div className="text-sm font-semibold truncate">{v.nombre}</div>
                      <div className="text-[10px] text-muted-foreground">{v.raza}</div>
                    </div>
                    <div className="flex-1 bg-muted/30 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full bg-gradient-to-r ${barColor}`} style={{width:`${pct}%`}} />
                    </div>
                    <span className="text-xs font-bold text-cyan-400 w-16 text-right">{v.litrosDia}L/d</span>
                    <span className={`text-[10px] w-14 text-right font-medium ${i === 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                      {fmt((v.litrosDia||0) * 30 * PRECIO_LITRO).replace('$','$').replace(',000,000','M').replace(',000','K')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {vacasEnProduccion.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border flex justify-between text-xs text-muted-foreground">
              <span>🏆 Mejor: <strong className="text-amber-400">{vacasEnProduccion[0]?.nombre} — {vacasEnProduccion[0]?.litrosDia}L/d</strong></span>
              <span>Prom: <strong className="text-foreground">{litrosPorVaca} L/d</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Planilla registros */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0f3460] to-[#1565c0] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-white/70" />
            <div>
              <div className="font-semibold text-white text-sm">Planilla de Ordeños — 2 Turnos</div>
              <div className="text-white/60 text-xs">{regs.length} registros · Producción lechera diaria</div>
            </div>
          </div>
          <Select value={turnoFilter} onValueChange={setTurnoFilter}>
            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['Todos','Mañana','Tarde'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-5 pt-3 border-b border-border">
            <TabsList className="bg-muted/30 h-8">
              <TabsTrigger value="registros" className="text-xs h-7">📋 Registros</TabsTrigger>
              <TabsTrigger value="calidad" className="text-xs h-7">🔬 Calidad</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="registros" className="m-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1a3a6e]/40 border-b border-border">
                    {['FECHA','TURNO','LITROS','PRECIO/L','INGRESO BRUTO','OPERADOR','ANOTACIÓN'].map(h => (
                      <th key={h} className="text-muted-foreground font-semibold text-[10px] uppercase px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.map(r => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-3"><span className="bg-muted/40 text-foreground text-xs px-2 py-1 rounded font-mono">{r.fecha}</span></td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.turno === 'Mañana' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                          {getTurnoIcon(r.turno)} {r.turno}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-cyan-400 font-bold text-sm">{r.litros.toLocaleString('es-CO')} L</td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">${r.precioCOP.toLocaleString('es-CO')}</td>
                      <td className="px-4 py-3 text-green-400 font-bold text-sm">{fmt(r.litros * r.precioCOP)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{r.operador}</td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">{r.nota}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/20 border-t border-border">
                    <td className="px-4 py-3 font-bold text-sm text-foreground" colSpan={2}>TOTAL PERÍODO</td>
                    <td className="px-4 py-3 font-bold text-cyan-400">{registrosFiltrados.reduce((s,r)=>s+r.litros,0).toLocaleString('es-CO')} L</td>
                    <td />
                    <td className="px-4 py-3 font-bold text-green-400">{fmt(registrosFiltrados.reduce((s,r)=>s+r.litros*r.precioCOP,0))}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="calidad" className="m-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1a3a6e]/40 border-b border-border">
                    {['FECHA','TURNO','LITROS','RCS (miles)','% GRASA','% PROTEÍNA','CALIDAD'].map(h => (
                      <th key={h} className="text-muted-foreground font-semibold text-[10px] uppercase px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.map(r => {
                    const calidad = r.rcs < 200 && r.grasa >= 3.8 && r.proteina >= 3.3 ? 'A' : r.rcs < 300 ? 'B' : 'C';
                    return (
                      <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-4 py-3"><span className="font-mono text-xs bg-muted/40 px-2 py-1 rounded">{r.fecha}</span></td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.turno === 'Mañana' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                            {getTurnoIcon(r.turno)} {r.turno}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-cyan-400 font-bold text-sm">{r.litros.toLocaleString('es-CO')} L</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold ${r.rcs < 200 ? 'text-green-400' : r.rcs < 300 ? 'text-amber-400' : 'text-red-400'}`}>{r.rcs}K</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold ${r.grasa >= 3.8 ? 'text-green-400' : 'text-orange-400'}`}>{r.grasa}%</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold ${r.proteina >= 3.3 ? 'text-green-400' : 'text-orange-400'}`}>{r.proteina}%</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${calidad === 'A' ? 'bg-green-500/20 text-green-400 border-green-500/30' : calidad === 'B' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                            Grado {calidad}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-muted/10 border-t border-border">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div><span className="text-green-400 font-bold">Grado A</span><span className="text-muted-foreground ml-1">RCS &lt;200K · Grasa ≥3.8% · Prot ≥3.3%</span></div>
                <div><span className="text-amber-400 font-bold">Grado B</span><span className="text-muted-foreground ml-1">RCS 200–300K · dentro parámetros</span></div>
                <div><span className="text-red-400 font-bold">Grado C</span><span className="text-muted-foreground ml-1">RCS &gt;300K · fuera de parámetros</span></div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
