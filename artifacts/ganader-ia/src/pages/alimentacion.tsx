import { useState } from "react";
import { Download, Plus, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";

const raciones = [
  { lote: 'Lote A', animales: 7, tipo: 'Vacas en producción', concentrado: 8, heno: 15, sal: 0.05, mineral: 0.15 },
  { lote: 'Lote B', animales: 3, tipo: 'Novillas', concentrado: 3, heno: 12, sal: 0.04, mineral: 0.10 },
  { lote: 'Lote C', animales: 2, tipo: 'Terneros', concentrado: 1.5, heno: 5, sal: 0.02, mineral: 0.05 },
  { lote: 'Lote D', animales: 1, tipo: 'Toros', concentrado: 4, heno: 18, sal: 0.06, mineral: 0.15 },
];

const suplementos = [
  { nombre: 'Sal mineralizada', dosis: '150g/an/día', stock: 120, unidad: 'kg', color: 'bg-cyan-500/20 text-cyan-400' },
  { nombre: 'Urea ganadera', dosis: '50g/an/día (max)', stock: 45, unidad: 'kg', color: 'bg-amber-500/20 text-amber-400' },
  { nombre: 'Calcio chelado', dosis: '30g/an/día', stock: 28, unidad: 'kg', color: 'bg-blue-500/20 text-blue-400' },
  { nombre: 'Vitamina ADE', dosis: '5ml/semana', stock: 12, unidad: 'frascos', color: 'bg-purple-500/20 text-purple-400' },
];

export default function Alimentacion() {
  return (
    <div className="space-y-5 pb-8">
      {/* CIVAC Banner */}
      <div className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden civac-animate"
        style={{background:'linear-gradient(135deg,#001a06 0%,#002e0a 100%)', border:'1px solid rgba(57,255,126,0.35)', boxShadow:'0 0 40px rgba(57,255,126,0.1), inset 0 1px 0 rgba(57,255,126,0.08)'}}>
        <div className="absolute right-0 top-0 w-48 h-full pointer-events-none opacity-10" style={{background:'radial-gradient(ellipse at right, #39ff7e, transparent 70%)'}} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{background:'rgba(57,255,126,0.1)', border:'1px solid rgba(57,255,126,0.4)', boxShadow:'0 0 16px rgba(57,255,126,0.2)'}}>
            <Wheat size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{fontFamily:'Sora,sans-serif'}}>Alimentación y Raciones</h1>
            <p className="text-sm" style={{color:'rgba(57,255,126,0.75)'}}>Formulación nutricional · Suplementos · Balance energético por lote</p>
          </div>
        </div>
        <div className="relative flex gap-2">
          <Button variant="outline" className="h-9 gap-1.5 text-sm" style={{background:'rgba(57,255,126,0.08)', border:'1px solid rgba(57,255,126,0.3)', color:'#39ff7e'}}>
            <Download size={14} /> CSV
          </Button>
          <Button className="h-9 gap-1.5 text-sm" style={{background:'rgba(57,255,126,0.15)', border:'1px solid rgba(57,255,126,0.4)', color:'#fff'}}>
            <Plus size={14} /> Ración
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'LOTES ACTIVOS', val:'4', sub:'con ración asignada', c:'#39ff7e' },
          { label:'CONCENTRADO/DÍA', val:'57kg', sub:'total hato', c:'#ff9500' },
          { label:'HENO/DÍA', val:'148kg', sub:'total hato', c:'#00c8ff' },
          { label:'COSTO ALIM/DÍA', val:'$746K', sub:'COP estimado', c:'#bf00ff' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white relative overflow-hidden"
            style={{background:'linear-gradient(135deg,#020d09,#041208)', border:'1px solid rgba(0,245,212,0.15)'}}>
            <div className="absolute top-0 right-0 w-14 h-14 rounded-full pointer-events-none" style={{background:k.c, opacity:0.15, filter:'blur(18px)', transform:'translate(30%,-30%)'}} />
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{color:'rgba(0,245,212,0.55)'}}>{k.label}</div>
            <div className="text-2xl font-bold" style={{color:k.c, fontFamily:'Sora,sans-serif'}}>{k.val}</div>
            <div className="text-[10px]" style={{color:'rgba(255,255,255,0.4)'}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Raciones por lote */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3" style={{background:'linear-gradient(135deg,#001a06,#002e0a)', borderBottom:'1px solid rgba(57,255,126,0.2)'}}>
          <div className="font-semibold text-white text-sm">🌾 Raciones por Lote</div>
          <div className="text-xs" style={{color:'rgba(57,255,126,0.6)'}}>Formulación diaria por categoría</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border" style={{background:'rgba(57,255,126,0.06)'}}>
                {['LOTE','TIPO','ANIMALES','CONCENTRADO/AN','HENO/AN','SAL/AN','MINERAL/AN','TOTAL/LOTE'].map(h => (
                  <th key={h} className="font-semibold text-[10px] uppercase px-4 py-3 text-left whitespace-nowrap" style={{color:'rgba(57,255,126,0.75)'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {raciones.map(r => (
                <tr key={r.lote} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 font-bold text-primary">{r.lote}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.tipo}</td>
                  <td className="px-4 py-3 text-center font-semibold">{r.animales}</td>
                  <td className="px-4 py-3 text-sm text-orange-400 font-medium">{r.concentrado} kg</td>
                  <td className="px-4 py-3 text-sm text-blue-400 font-medium">{r.heno} kg</td>
                  <td className="px-4 py-3 text-sm text-cyan-400 font-medium">{r.sal} kg</td>
                  <td className="px-4 py-3 text-sm text-purple-400 font-medium">{r.mineral} kg</td>
                  <td className="px-4 py-3 text-sm font-bold text-foreground">{((r.concentrado + r.heno + r.sal + r.mineral) * r.animales).toFixed(1)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suplementos */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="font-semibold mb-4">💊 Suplementos y Minerales</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suplementos.map(s => (
            <div key={s.nombre} className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl border border-border">
              <div className="flex-1">
                <div className="font-medium text-sm">{s.nombre}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.dosis}</div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>{s.stock} {s.unidad}</div>
                <div className="text-[10px] text-muted-foreground mt-1">En stock</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
