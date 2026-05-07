import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList } from "recharts";
import { Download, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppState } from "../lib/data";

const dataHistorico = [
  { name: 'Oct', litros: 52000 },
  { name: 'Nov', litros: 55000 },
  { name: 'Dic', litros: 58000 },
  { name: 'Ene', litros: 62000 },
  { name: 'Feb', litros: 60000 },
  { name: 'Mar', litros: 56000 },
  { name: 'Abr', litros: 61300 },
];

const registrosIniciales = [
  { fecha: '29/04/2025', litros: 1980, precio: 1250, ingreso: 2475000, nota: 'Ordeño normal' },
  { fecha: '28/04/2025', litros: 2010, precio: 1250, ingreso: 2512500, nota: 'Lluvia intensa' },
  { fecha: '27/04/2025', litros: 1950, precio: 1250, ingreso: 2437500, nota: '—' },
  { fecha: '26/04/2025', litros: 2025, precio: 1250, ingreso: 2531250, nota: '—' },
  { fecha: '25/04/2025', litros: 1890, precio: 1250, ingreso: 2362500, nota: 'Vacuna IBR' },
];

const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function Produccion() {
  const { animals } = useAppState();
  const [open, setOpen] = useState(false);
  const [regs, setRegs] = useState(registrosIniciales);

  const vacasEnProduccion = useMemo(() =>
    animals.filter(a => a.estado === 'Producción' && (a.litrosDia || 0) > 0)
      .sort((a, b) => (b.litrosDia || 0) - (a.litrosDia || 0)),
    [animals]
  );

  const totalLitrosDia = useMemo(() => Math.round(vacasEnProduccion.reduce((s, a) => s + (a.litrosDia || 0), 0)), [vacasEnProduccion]);
  const litrosMes = useMemo(() => totalLitrosDia * 30, [totalLitrosDia]);
  const litrosPorVaca = vacasEnProduccion.length > 0 ? (totalLitrosDia / vacasEnProduccion.length).toFixed(1) : '0';
  const ingresoMes = litrosMes * 1250;
  const costoMes = litrosMes * 820;
  const margen = ingresoMes > 0 ? ((ingresoMes - costoMes) / ingresoMes * 100).toFixed(1) : '0';

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const litros = Number(fd.get('litros'));
    const precio = 1250;
    setRegs([{ fecha: fd.get('fecha') as string, litros, precio, ingreso: litros * precio, nota: fd.get('nota') as string || '—' }, ...regs]);
    setOpen(false);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0f3460] to-[#1565c0] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">🥛</div>
          <div>
            <h1 className="text-xl font-bold text-white">Producción Leche y Carne</h1>
            <p className="text-white/70 text-sm">Ordeños diarios · Tendencias · Ranking de vacas · Análisis financiero</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-9 gap-1.5 text-sm">
            <Download size={14} /> CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 h-9 gap-1.5 text-sm">
                <Plus size={14} /> Registrar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAdd}>
                <DialogHeader><DialogTitle>Registrar Ordeño</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right">Fecha</Label>
                    <Input name="fecha" type="text" className="col-span-3" placeholder="DD/MM/AAAA" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right">Litros</Label>
                    <Input name="litros" type="number" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right">Nota</Label>
                    <Input name="nota" className="col-span-3" />
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

      {/* KPI Cards — computed from real animals */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:'VACAS EN ORDEÑO', val:String(vacasEnProduccion.length), sub:`${litrosPorVaca} L/vaca/día`, gradient:'linear-gradient(135deg,#0d47a1,#1565c0)' },
          { label:'LITROS HOY', val:`${totalLitrosDia} L`, sub:'producción diaria', gradient:'linear-gradient(135deg,#1b5e20,#2e7d32)' },
          { label:'INGRESO MES EST.', val:`${fmt(ingresoMes)}`, sub:`${(litrosMes/1000).toFixed(0)}K litros × $1.250`, gradient:'linear-gradient(135deg,#e65100,#f57c00)' },
          { label:'COSTO/LITRO', val:'$820', sub:'Meta <$800', gradient:'linear-gradient(135deg,#b71c1c,#c62828)' },
          { label:'MARGEN', val:`${margen}%`, sub:'neto mensual', gradient:'linear-gradient(135deg,#4a148c,#6a1b9a)' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white shadow" style={{background:k.gradient}}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">{k.label}</div>
            <div className="text-lg font-bold leading-tight">{k.val}</div>
            <div className="text-[10px] text-white/60 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 2-col: Top vacas + Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top vacas — from real animals */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-base">🏆</div>
            <div>
              <div className="font-semibold">Top vacas en producción</div>
              <div className="text-xs text-muted-foreground">{vacasEnProduccion.length} en ordeño activo · {totalLitrosDia} L/día total</div>
            </div>
          </div>
          {vacasEnProduccion.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay vacas en producción actualmente.</p>
          ) : (
            <div className="space-y-3">
              {vacasEnProduccion.map((v, i) => (
                <div key={v.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-gray-400/20 text-gray-400' : i === 2 ? 'bg-orange-600/20 text-orange-400' : 'bg-primary/15 text-primary'}`}>{i+1}</span>
                  <div className="text-sm font-medium w-20 truncate">{v.nombre}</div>
                  <div className="flex-1 bg-muted/30 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{width:`${Math.min(((v.litrosDia||0)/25)*100, 100)}%`}} />
                  </div>
                  <span className="text-xs font-bold text-cyan-400 w-14 text-right">{v.litrosDia}L/d</span>
                </div>
              ))}
            </div>
          )}
          {vacasEnProduccion.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border flex justify-between text-xs text-muted-foreground">
              <span>Mejor: <strong className="text-amber-400">{vacasEnProduccion[0]?.nombre} — {vacasEnProduccion[0]?.litrosDia} L/d</strong></span>
              <span>Prom: <strong className="text-foreground">{litrosPorVaca} L/d</strong></span>
            </div>
          )}
        </div>

        {/* Histórico */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-semibold">Histórico 7 meses</div>
              <div className="text-xs text-muted-foreground">Litros por mes</div>
            </div>
            <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">↑ 9.4%</span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataHistorico} margin={{top:16,right:10,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#444" tick={{fill:'#888',fontSize:10}} />
                <YAxis stroke="#444" tick={{fill:'#888',fontSize:10}} width={42} />
                <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} formatter={(v:number) => [`${v.toLocaleString('es-CO')} L`, 'Litros']} />
                <Bar dataKey="litros" fill="#1565c0" radius={[4,4,0,0]}>
                  <LabelList dataKey="litros" position="top" style={{fill:'#888',fontSize:9}} formatter={(v: number) => `${(v/1000).toFixed(0)}K`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="bg-green-500/10 rounded-lg p-2 text-center">
              <div className="text-xs text-muted-foreground">Precio/L</div>
              <div className="text-sm font-bold text-green-400">$1.250</div>
            </div>
            <div className="bg-red-500/10 rounded-lg p-2 text-center">
              <div className="text-xs text-muted-foreground">Costo/L</div>
              <div className="text-sm font-bold text-red-400">$820</div>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-2 text-center">
              <div className="text-xs text-muted-foreground">Margen</div>
              <div className="text-sm font-bold text-purple-400">{margen}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Registros diarios */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0f3460] to-[#1565c0] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <div>
              <div className="font-semibold text-white text-sm">Planilla de Registros Diarios</div>
              <div className="text-white/60 text-xs">{regs.length} registros · Producción lechera</div>
            </div>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-[#1a3a6e] border-b border-blue-900/50">
              {['FECHA','LITROS','PRECIO/L','INGRESO BRUTO','ANOTACIÓN'].map(h => (
                <th key={h} className="text-white/70 font-semibold text-xs uppercase px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regs.map((r,i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                <td className="px-4 py-3"><span className="bg-muted/40 text-foreground text-xs px-2 py-1 rounded font-mono">{r.fecha}</span></td>
                <td className="px-4 py-3 text-cyan-400 font-bold text-sm">{r.litros.toLocaleString('es-CO')} L</td>
                <td className="px-4 py-3 text-muted-foreground text-sm">${r.precio.toLocaleString('es-CO')}</td>
                <td className="px-4 py-3 text-green-400 font-bold text-sm">{fmt(r.ingreso)}</td>
                <td className="px-4 py-3 text-muted-foreground text-sm">{r.nota}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/20 border-t border-border">
              <td className="px-4 py-3 font-bold text-sm text-foreground">TOTAL</td>
              <td className="px-4 py-3 font-bold text-cyan-400">{regs.reduce((s,r)=>s+r.litros,0).toLocaleString('es-CO')} L</td>
              <td />
              <td className="px-4 py-3 font-bold text-green-400">{fmt(regs.reduce((s,r)=>s+r.ingreso,0))}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
