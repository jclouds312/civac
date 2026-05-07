import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList } from "recharts";
import { Download, Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const dataHistorico = [
  { name: 'Oct', litros: 52000 },
  { name: 'Nov', litros: 55000 },
  { name: 'Dic', litros: 58000 },
  { name: 'Ene', litros: 62000 },
  { name: 'Feb', litros: 60000 },
  { name: 'Mar', litros: 56000 },
  { name: 'Abr', litros: 61300 },
];

const topVacas = [
  { rank: 1, nombre: 'Rosaura', litros: 18.4 },
  { rank: 2, nombre: 'Estrella', litros: 17.8 },
  { rank: 3, nombre: 'Cielo', litros: 16.9 },
  { rank: 4, nombre: 'Niebla', litros: 15.8 },
  { rank: 5, nombre: 'Palmera', litros: 15.2 },
  { rank: 6, nombre: 'Perla', litros: 12.1 },
];

const registros = [
  { fecha: '29/04/2025', litros: 1980, precio: 1250, ingreso: 2475000, nota: 'Ordeño normal' },
  { fecha: '28/04/2025', litros: 2010, precio: 1250, ingreso: 2512500, nota: 'Lluvia intensa' },
  { fecha: '27/04/2025', litros: 1950, precio: 1250, ingreso: 2437500, nota: '—' },
  { fecha: '26/04/2025', litros: 2025, precio: 1250, ingreso: 2531250, nota: '—' },
  { fecha: '25/04/2025', litros: 1890, precio: 1250, ingreso: 2362500, nota: 'Vacuna IBR' },
];

export default function Produccion() {
  const [open, setOpen] = useState(false);
  const [regs, setRegs] = useState(registros);

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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:'PRODUCCIÓN MES', val:'9.855 L', gradient:'linear-gradient(135deg,#0d47a1,#1565c0)' },
          { label:'PRECIO LITRO', val:'$1.250', gradient:'linear-gradient(135deg,#1b5e20,#2e7d32)' },
          { label:'INGRESO BRUTO', val:'$12.3M', gradient:'linear-gradient(135deg,#e65100,#f57c00)' },
          { label:'COSTO/LITRO', val:'$820', gradient:'linear-gradient(135deg,#b71c1c,#c62828)' },
          { label:'MARGEN', val:'34.4%', gradient:'linear-gradient(135deg,#4a148c,#6a1b9a)' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white shadow" style={{background:k.gradient}}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">{k.label}</div>
            <div className="text-2xl font-bold">{k.val}</div>
          </div>
        ))}
      </div>

      {/* 2-col: Top vacas + Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top vacas */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-base">🏆</div>
            <div>
              <div className="font-semibold">Top vacas en producción</div>
              <div className="text-xs text-muted-foreground">6 en ordeño activo</div>
            </div>
          </div>
          <div className="space-y-3">
            {topVacas.map(v => (
              <div key={v.nombre} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">{v.rank}</span>
                <span className="text-sm font-medium w-20">{v.nombre}</span>
                <div className="flex-1 bg-muted/30 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{width:`${(v.litros/20)*100}%`}} />
                </div>
                <span className="text-xs font-bold text-cyan-400 w-14 text-right">{v.litros}L/d</span>
              </div>
            ))}
          </div>
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
                <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} />
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
              <div className="text-sm font-bold text-purple-400">34.4%</div>
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
                <td className="px-4 py-3 text-cyan-400 font-bold text-sm">${r.ingreso.toLocaleString('es-CO')}</td>
                <td className="px-4 py-3 text-muted-foreground text-sm">{r.nota}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
