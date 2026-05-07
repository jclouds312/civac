import { useAppState } from "../lib/data";
import { Download, Plus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const mapParcelas = [
  { n: 'Potrero 6', pasto: 'Kikuyo', ha: 3.5, animals: 22, maxAnim: 23, dias: 18, ciclo: 23, estado: 'Ocupado', bg: 'rgba(245,124,0,0.85)' },
  { n: 'Potrero 5', pasto: 'Pasto nativo', ha: 6, animals: 0, maxAnim: 0, dias: 21, ciclo: 0, estado: 'Disponible', bg: 'rgba(27,94,32,0.85)' },
  { n: 'Potrero 4', pasto: 'Estrella', ha: 4.2, animals: 26, maxAnim: 28, dias: 3, ciclo: 28, estado: 'Rotar ya', bg: 'rgba(183,28,28,0.88)' },
  { n: 'Potrero 3', pasto: 'Brachiaria', ha: 5.1, animals: 20, maxAnim: 24, dias: 14, ciclo: 34, estado: 'Ocupado', bg: 'rgba(245,124,0,0.85)' },
  { n: 'Potrero 2', pasto: 'Raigrás', ha: 3.8, animals: 0, maxAnim: 0, dias: 8, ciclo: 22, estado: 'Descanso', bg: 'rgba(13,71,161,0.82)' },
  { n: 'Potrero 1', pasto: 'Kikuyo', ha: 4.5, animals: 22, maxAnim: 25, dias: 6, ciclo: 30, estado: 'Ocupado', bg: 'rgba(245,124,0,0.85)' },
];

const legend = [
  { label: 'Disponible', color: '#1b5e20' },
  { label: 'Ocupado OK', color: '#e65100' },
  { label: 'Rotar YA', color: '#b71c1c' },
  { label: 'Descanso', color: '#0d47a1' },
];

export default function Potreros() {
  const { potreros } = useAppState();
  const [view, setView] = useState<'mapa' | 'lista'>('mapa');

  const totalHa = potreros.reduce((s, p) => s + p.hectareas, 0);
  const disponibles = potreros.filter(p => p.estado === 'Disponible').length;
  const enDescanso = potreros.filter(p => p.estado === 'Descanso').length;
  const rotarUrgente = potreros.filter(p => p.estado === 'Rotar pronto').length;

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0d4a3d] to-[#00796b] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Layers size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Potreros y Praderas</h1>
            <p className="text-white/70 text-sm">Mapa interactivo · Semáforo de rotación · Carga animal · Aforo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-9 gap-1.5 text-sm">
            <Download size={14} /> CSV
          </Button>
          <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 h-9 gap-1.5 text-sm">
            <Plus size={14} /> Potrero
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:'POTREROS', val:`${potreros.length}`, sub:'registrados', gradient:'linear-gradient(135deg,#1b5e20,#2e7d32)' },
          { label:'ÁREA TOTAL', val:`${totalHa.toFixed(1)} ha`, sub:'hectáreas', gradient:'linear-gradient(135deg,#00695c,#00897b)' },
          { label:'DISPONIBLES', val:String(disponibles), sub:'para uso', gradient:'linear-gradient(135deg,#4a148c,#6a1b9a)' },
          { label:'EN DESCANSO', val:String(enDescanso), sub:'recuperando', gradient:'linear-gradient(135deg,#0d47a1,#1565c0)' },
          { label:'ROTAR URGENTE', val:String(rotarUrgente), sub:'revisar hoy', gradient:'linear-gradient(135deg,#b71c1c,#c62828)' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white shadow" style={{background:k.gradient}}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">{k.label}</div>
            <div className="text-2xl font-bold">{k.val}</div>
            <div className="text-[10px] text-white/60">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <button onClick={() => setView('mapa')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view==='mapa' ? 'bg-primary text-white' : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'}`}>
          🗺️ Mapa
        </button>
        <button onClick={() => setView('lista')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view==='lista' ? 'bg-primary text-white' : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'}`}>
          📋 Lista
        </button>
      </div>

      {view === 'mapa' ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Legend */}
          <div className="px-5 py-3 border-b border-border flex items-center gap-4 flex-wrap">
            <span className="text-sm font-semibold text-foreground">Leyenda:</span>
            {legend.map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{background: l.color}} />
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
          {/* Farm map */}
          <div className="relative p-6" style={{background:'#c8e6c9', minHeight:400}}>
            {/* Compass */}
            <div className="absolute top-3 right-5 bg-white/60 rounded-full px-2 py-1 text-gray-700 font-bold text-xs backdrop-blur-sm">N↑</div>
            {/* Grid */}
            <div className="grid grid-cols-3 grid-rows-2 gap-4" style={{minHeight:340}}>
              {mapParcelas.map(p => {
                const diasLabel = p.estado === 'Disponible' ? `Disponible · ${p.dias}d 💤` : p.estado === 'Descanso' ? `Descansando · ${p.dias}d 💤 · Ciclo ${p.ciclo}d` : `${p.animals}/${p.maxAnim} an. · ${p.dias}d ↺`;
                return (
                  <div key={p.n} className="rounded-xl p-4 flex flex-col justify-between shadow-lg cursor-pointer hover:opacity-95 transition-opacity" style={{background: p.bg, minHeight: 140}}>
                    <div>
                      <div className="text-white font-bold text-sm">{p.n} — {p.pasto}</div>
                      <div className="text-white/80 text-xs mt-1">{p.ha} ha</div>
                    </div>
                    <div>
                      <div className="text-white/80 text-xs">{diasLabel}</div>
                      {p.estado === 'Rotar ya' && (
                        <div className="mt-1 bg-white/20 rounded text-white text-[10px] font-bold px-2 py-0.5 inline-block">⚠ ROTAR YA</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Laguna */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-blue-200/80 rounded-full px-6 py-2 text-blue-700 text-xs font-medium shadow">~ Laguna ~</div>
            {/* Scale */}
            <div className="absolute bottom-3 left-5 flex items-center gap-2">
              <div className="w-14 h-0.5 bg-green-800" />
              <span className="text-[10px] text-gray-600">escala ref.</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {potreros.map(p => {
            const stateColor = p.estado === 'Disponible' ? 'text-green-400' : p.estado === 'Ocupado' ? 'text-orange-400' : p.estado === 'Rotar pronto' ? 'text-amber-400' : p.estado === 'Descanso' ? 'text-blue-400' : 'text-red-400';
            const stateBg = p.estado === 'Disponible' ? 'bg-green-400' : p.estado === 'Ocupado' ? 'bg-orange-400' : p.estado === 'Rotar pronto' ? 'bg-amber-400' : p.estado === 'Descanso' ? 'bg-blue-400' : 'bg-red-400';
            return (
              <div key={p.nombre} className="bg-card border border-border rounded-xl p-5 hover:bg-muted/10 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-foreground">{p.nombre}</div>
                    <div className="text-xs text-muted-foreground">{p.hectareas} ha · {p.pasto}</div>
                  </div>
                  <span className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 ${stateColor} border-current/40`}>{p.estado}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{p.estado === 'Descanso' ? 'Días Descanso' : 'Días Ocupado'}</span>
                    <span className={`font-semibold ${(p.diasRestantes && p.diasRestantes <= 5) ? 'text-red-400' : stateColor}`}>{p.diasOcupado || p.diasDescanso || p.diasRestantes || '—'} días</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Ciclo Rotación</span>
                    <span className="font-semibold text-foreground">{p.cicloRotacion || '—'} días</span>
                  </div>
                  {p.animales != null && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Animales</span>
                      <span className="font-semibold text-foreground">{p.animales}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
