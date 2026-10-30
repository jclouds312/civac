import { useAppState } from "../lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Baby, Calendar, Scale, Syringe, ClipboardList } from "lucide-react";
import { useState } from "react";

const historialVacunas = [
  { fecha: '15/01/2025', vacuna: 'Brucelosis', dosis: '2ml', aplicador: 'Dr. Ramírez' },
  { fecha: '10/02/2025', vacuna: 'IBR/BVD', dosis: '5ml', aplicador: 'Dr. Ramírez' },
  { fecha: '01/03/2025', vacuna: 'Fiebre aftosa', dosis: '2ml', aplicador: 'Rodrigo V.' },
  { fecha: '15/04/2025', vacuna: 'Carbón bacteridiano', dosis: '3ml', aplicador: 'Dr. Ramírez' },
];

const historialPesos = [
  { fecha: 'Ene 2025', peso: 498 },
  { fecha: 'Feb 2025', peso: 504 },
  { fecha: 'Mar 2025', peso: 510 },
  { fecha: 'Abr 2025', peso: 520 },
];

const historialPartos = [
  { num: 1, fecha: '12/03/2022', tipo: 'Normal', cria: 'Manchas (M)', pesoNac: 38, complicaciones: 'Ninguna' },
  { num: 2, fecha: '05/04/2023', tipo: 'Normal', cria: 'Lila (H)', pesoNac: 36, complicaciones: 'Ninguna' },
  { num: 3, fecha: '18/04/2024', tipo: 'Distócico', cria: 'Bruno (M)', pesoNac: 40, complicaciones: 'Asistencia veterinaria' },
];

export default function Ficha() {
  const { animals } = useAppState();
  const [selId, setSelId] = useState(animals[0]?.id || '');
  const animal = animals.find(a => a.id === selId) || animals[0];

  if (!animal) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-muted-foreground">No hay animales registrados.</div>
    </div>
  );

  const getCatColor = (cat: string) => {
    switch (cat) {
      case 'Vaca adulta': return 'bg-teal-500/20 text-teal-400';
      case 'Novilla': return 'bg-blue-500/20 text-blue-400';
      case 'Ternero': return 'bg-orange-500/20 text-orange-400';
      case 'Toro': return 'bg-red-500/20 text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* CIVAC Banner */}
      <div className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden civac-animate"
        style={{background:'linear-gradient(135deg,#000d1a 0%,#001a2e 100%)', border:'1px solid rgba(0,200,255,0.35)', boxShadow:'0 0 40px rgba(0,200,255,0.1), inset 0 1px 0 rgba(0,200,255,0.08)'}}>
        <div className="absolute right-0 top-0 w-48 h-full pointer-events-none opacity-10" style={{background:'radial-gradient(ellipse at right, #00c8ff, transparent 70%)'}} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{background:'rgba(0,200,255,0.1)', border:'1px solid rgba(0,200,255,0.4)', boxShadow:'0 0 16px rgba(0,200,255,0.2)'}}>
            <ClipboardList size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{fontFamily:'Sora,sans-serif'}}>Ficha Individual</h1>
            <p className="text-sm" style={{color:'rgba(0,200,255,0.75)'}}>Historia clínica · Pesajes · Vacunas · Partos · Eventos</p>
          </div>
        </div>
        <Select value={selId} onValueChange={setSelId}>
          <SelectTrigger className="w-52" style={{background:'rgba(0,200,255,0.08)', border:'1px solid rgba(0,200,255,0.35)', color:'#fff'}}>
            <SelectValue placeholder="Seleccionar animal" />
          </SelectTrigger>
          <SelectContent>
            {animals.map(a => (
              <SelectItem key={a.id} value={a.id}>{a.id} — {a.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Animal Header */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border flex items-center justify-center text-3xl">🐄</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-foreground">{animal.nombre}</h2>
              <span className="font-mono text-sm text-green-400 font-semibold bg-green-400/10 px-2 py-0.5 rounded">{animal.id}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCatColor(animal.categoria)}`}>{animal.categoria}</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-green-400 bg-green-400/10 border border-green-400/20">{animal.estado}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">{animal.raza} · {animal.lote}</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon:'⚖️', label:'Peso', val:`${animal.peso}kg` },
              { icon:'🥛', label:'L/Día', val:`${animal.litrosDia || 0}L` },
              { icon:'🐣', label:'Partos', val:String(animal.partos) },
            ].map(s => (
              <div key={s.label} className="text-center bg-muted/20 rounded-xl p-3 border border-border">
                <div className="text-xl">{s.icon}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                <div className="text-sm font-bold text-foreground">{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="vacunas">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="vacunas" className="gap-1.5"><Syringe size={14} /> Vacunas</TabsTrigger>
          <TabsTrigger value="pesos" className="gap-1.5"><Scale size={14} /> Pesajes</TabsTrigger>
          <TabsTrigger value="partos" className="gap-1.5"><Baby size={14} /> Partos</TabsTrigger>
          <TabsTrigger value="eventos" className="gap-1.5"><Activity size={14} /> Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="vacunas">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border" style={{background:'rgba(0,200,255,0.06)'}}>
                  {['Fecha','Vacuna','Dosis','Aplicador'].map(h => (
                    <th key={h} className="font-semibold text-[10px] uppercase px-4 py-3 text-left" style={{color:'rgba(0,200,255,0.75)'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historialVacunas.map((v, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs text-green-400">{v.fecha}</td>
                    <td className="px-4 py-3 font-medium text-sm">{v.vacuna}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{v.dosis}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{v.aplicador}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="pesos">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border" style={{background:'rgba(0,200,255,0.06)'}}>
                  {['Fecha','Peso (kg)','Variación'].map(h => (
                    <th key={h} className="font-semibold text-[10px] uppercase px-4 py-3 text-left" style={{color:'rgba(0,200,255,0.75)'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historialPesos.map((p, i) => {
                  const prev = historialPesos[i - 1];
                  const diff = prev ? p.peso - prev.peso : 0;
                  return (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-3 text-sm text-muted-foreground">{p.fecha}</td>
                      <td className="px-4 py-3 font-bold text-foreground">{p.peso} kg</td>
                      <td className="px-4 py-3">
                        {diff !== 0 && (
                          <span className={`text-sm font-semibold ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>{diff > 0 ? '+' : ''}{diff} kg</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="partos">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border" style={{background:'rgba(0,200,255,0.06)'}}>
                  {['#','Fecha','Tipo','Cría','Peso Nac.','Complicaciones'].map(h => (
                    <th key={h} className="font-semibold text-[10px] uppercase px-4 py-3 text-left" style={{color:'rgba(0,200,255,0.75)'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historialPartos.map(p => (
                  <tr key={p.num} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-3 font-bold text-foreground">{p.num}</td>
                    <td className="px-4 py-3 font-mono text-xs text-green-400">{p.fecha}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.tipo === 'Normal' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>{p.tipo}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{p.cria}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.pesoNac} kg</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.complicaciones}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="eventos">
          <div className="bg-card border border-border rounded-xl p-5 mt-3">
            <div className="space-y-3">
              {[
                { icon:'💊', fecha:'02/04/2025', evento:'Inicio tratamiento antibiótico — Mastitis leve', tipo:'Tratamiento', color:'text-red-400' },
                { icon:'🔬', fecha:'28/03/2025', evento:'Diagnóstico gestación negativo — Reabierta', tipo:'Reproductivo', color:'text-orange-400' },
                { icon:'⚖️', fecha:'15/03/2025', evento:'Pesaje periódico — 510kg (+6kg vs anterior)', tipo:'Productivo', color:'text-blue-400' },
                { icon:'💉', fecha:'01/03/2025', evento:'Vacunación fiebre aftosa — completa', tipo:'Sanitario', color:'text-green-400' },
              ].map((ev, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted/20 rounded-xl border border-border">
                  <span className="text-xl flex-shrink-0">{ev.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-semibold ${ev.color}`}>{ev.tipo}</span>
                      <span className="text-[10px] text-muted-foreground">{ev.fecha}</span>
                    </div>
                    <div className="text-sm text-foreground">{ev.evento}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
