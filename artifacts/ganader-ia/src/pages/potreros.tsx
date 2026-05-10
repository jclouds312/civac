import { useAppState } from "../lib/data";
import { Download, Plus, Layers, RotateCcw, AlertTriangle, Leaf, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const mapParcelas = [
  { n:'Potrero 6', pasto:'Kikuyo', ha:3.5, animals:22, maxAnim:23, dias:18, ciclo:23, estado:'Ocupado', bg:'rgba(245,124,0,0.88)', aforoKgHa:1800, aforoPct:62 },
  { n:'Potrero 5', pasto:'Pasto nativo', ha:6.0, animals:0, maxAnim:36, dias:21, ciclo:0, estado:'Disponible', bg:'rgba(27,94,32,0.88)', aforoKgHa:2100, aforoPct:78 },
  { n:'Potrero 4', pasto:'Estrella', ha:4.2, animals:26, maxAnim:28, dias:3, ciclo:28, estado:'Rotar ya', bg:'rgba(183,28,28,0.92)', aforoKgHa:850, aforoPct:22 },
  { n:'Potrero 3', pasto:'Brachiaria', ha:5.1, animals:20, maxAnim:24, dias:14, ciclo:34, estado:'Ocupado', bg:'rgba(245,124,0,0.88)', aforoKgHa:1650, aforoPct:55 },
  { n:'Potrero 2', pasto:'Raigrás', ha:3.8, animals:0, maxAnim:0, dias:8, ciclo:22, estado:'Descanso', bg:'rgba(13,71,161,0.85)', aforoKgHa:2400, aforoPct:88 },
  { n:'Potrero 1', pasto:'Kikuyo', ha:4.5, animals:22, maxAnim:25, dias:6, ciclo:30, estado:'Ocupado', bg:'rgba(245,124,0,0.88)', aforoKgHa:1500, aforoPct:50 },
];

const legend = [
  { label:'Disponible', color:'#1b5e20' },
  { label:'Ocupado OK', color:'#e65100' },
  { label:'Rotar YA', color:'#b71c1c' },
  { label:'Descanso', color:'#0d47a1' },
];

const rotacionTimeline = [
  { potrero:'Potrero 1', pasto:'Kikuyo', entrada:'01/04/2025', salida:'01/05/2025', dias:30, estado:'En curso' },
  { potrero:'Potrero 4', pasto:'Estrella', entrada:'03/04/2025', salida:'01/05/2025', dias:28, estado:'Vence pronto' },
  { potrero:'Potrero 3', pasto:'Brachiaria', entrada:'15/04/2025', salida:'19/05/2025', dias:34, estado:'En curso' },
  { potrero:'Potrero 6', pasto:'Kikuyo', entrada:'10/04/2025', salida:'03/05/2025', dias:23, estado:'En curso' },
  { potrero:'Potrero 2', pasto:'Raigrás', entrada:'22/03/2025', salida:'13/04/2025', dias:22, estado:'Completado' },
  { potrero:'Potrero 5', pasto:'Nativo', entrada:'—', salida:'—', dias:0, estado:'Disponible' },
];

export default function Potreros() {
  const { potreros, setPotreros } = useAppState();
  const [view, setView] = useState<'mapa' | 'lista'>('mapa');
  const [openAdd, setOpenAdd] = useState(false);
  const [activeTab, setActiveTab] = useState("mapa");

  const totalHa = potreros.reduce((s, p) => s + p.hectareas, 0);
  const totalAnimales = potreros.reduce((s, p) => s + (p.animales || 0), 0);
  const disponibles = potreros.filter(p => p.estado === 'Disponible').length;
  const enDescanso = potreros.filter(p => p.estado === 'Descanso').length;
  const rotarUrgente = potreros.filter(p => p.estado === 'Rotar pronto').length;
  const cargaAnimal = totalHa > 0 ? (totalAnimales / totalHa).toFixed(2) : '0';

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newId = potreros.length + 1;
    setPotreros([...potreros, {
      id: newId,
      nombre: fd.get('nombre') as string,
      pasto: fd.get('pasto') as string,
      hectareas: Number(fd.get('hectareas')),
      estado: fd.get('estado') as string,
      diasDescanso: 0,
      diasRotacion: Number(fd.get('ciclo')),
      animales: 0,
    } as any]);
    setOpenAdd(false);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Disponible': return 'text-green-400 border-green-400/40 bg-green-400/5';
      case 'Ocupado': return 'text-orange-400 border-orange-400/40 bg-orange-400/5';
      case 'Rotar pronto': return 'text-red-400 border-red-400/40 bg-red-400/5';
      case 'Descanso': return 'text-blue-400 border-blue-400/40 bg-blue-400/5';
      default: return 'text-muted-foreground border-border bg-muted/10';
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0d4a3d] to-[#00796b] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Layers size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Potreros y Manejo de Praderas</h1>
            <p className="text-white/70 text-sm">Mapa rotación · Aforo forrajero · Carga animal · Semáforo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-9 gap-1.5 text-sm">
            <Download size={14} /> CSV
          </Button>
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 h-9 gap-1.5 text-sm">
                <Plus size={14} /> Potrero
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <form onSubmit={handleAdd}>
                <DialogHeader><DialogTitle>Agregar Potrero</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Nombre</Label><Input name="nombre" placeholder="Potrero 7" required /></div>
                    <div className="space-y-1.5"><Label>Especie forrajera</Label><Input name="pasto" placeholder="Kikuyo" required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Hectáreas</Label><Input name="hectareas" type="number" step="0.1" required /></div>
                    <div className="space-y-1.5"><Label>Ciclo rotación (días)</Label><Input name="ciclo" type="number" defaultValue="30" /></div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Estado inicial</Label>
                    <Select name="estado" defaultValue="Disponible">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{['Disponible','Ocupado','Descanso','Rotar pronto'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                    </Select>
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
          { label:'POTREROS', val:`${potreros.length}`, sub:'registrados', gradient:'linear-gradient(135deg,#1b5e20,#2e7d32)' },
          { label:'ÁREA TOTAL', val:`${totalHa.toFixed(1)} ha`, sub:'superficie forrajera', gradient:'linear-gradient(135deg,#00695c,#00897b)' },
          { label:'CARGA ANIMAL', val:`${cargaAnimal}`, sub:'UA/ha promedio', gradient:'linear-gradient(135deg,#e65100,#f57c00)' },
          { label:'EN DESCANSO', val:String(enDescanso), sub:'recuperando pasto', gradient:'linear-gradient(135deg,#0d47a1,#1565c0)' },
          { label:'ROTAR URGENTE', val:String(rotarUrgente), sub:'actuar hoy', gradient:'linear-gradient(135deg,#b71c1c,#c62828)' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white shadow" style={{background:k.gradient}}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">{k.label}</div>
            <div className="text-2xl font-bold">{k.val}</div>
            <div className="text-[10px] text-white/60">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Alert if urgent */}
      {rotarUrgente > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-red-400">{rotarUrgente} potrero(s) requieren rotación inmediata</div>
            <div className="text-xs text-muted-foreground mt-1">El pasto está agotado — mover animales previene sobrepastoreo y erosión del suelo</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="mapa" className="gap-1.5 text-xs">🗺️ Mapa</TabsTrigger>
          <TabsTrigger value="lista" className="gap-1.5 text-xs"><BarChart2 size={13} /> Aforo</TabsTrigger>
          <TabsTrigger value="rotacion" className="gap-1.5 text-xs"><RotateCcw size={13} /> Rotación</TabsTrigger>
        </TabsList>

        {/* Mapa */}
        <TabsContent value="mapa">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <div className="px-5 py-3 border-b border-border flex items-center gap-4 flex-wrap">
              <span className="text-sm font-semibold text-foreground">Leyenda:</span>
              {legend.map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{background: l.color}} />
                  <span className="text-xs text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
            <div className="relative p-6" style={{background:'#c8e6c9', minHeight:420}}>
              <div className="absolute top-3 right-5 bg-white/70 rounded-full px-2 py-1 text-gray-700 font-bold text-xs backdrop-blur-sm shadow">N ↑</div>
              <div className="grid grid-cols-3 grid-rows-2 gap-4" style={{minHeight:360}}>
                {mapParcelas.map(p => {
                  const label = p.estado === 'Disponible'
                    ? `Listo · ${p.dias}d recuperado 🌿`
                    : p.estado === 'Descanso'
                    ? `Descansando · ${p.dias}d 💤`
                    : p.estado === 'Rotar ya'
                    ? `⚠️ ${p.animals}/${p.maxAnim} an. · ¡Rotar!`
                    : `${p.animals}/${p.maxAnim} an. · ${p.dias}d`;
                  return (
                    <div key={p.n} className="rounded-xl p-4 flex flex-col justify-between shadow-lg cursor-pointer hover:opacity-95 transition-opacity group"
                      style={{background: p.bg, minHeight: 140}}>
                      <div>
                        <div className="text-white font-bold text-sm">{p.n}</div>
                        <div className="text-white/80 text-xs mt-0.5">{p.pasto} · {p.ha} ha</div>
                      </div>
                      <div>
                        <div className="text-white/80 text-xs">{label}</div>
                        <div className="mt-2">
                          <div className="text-white/60 text-[10px] mb-0.5">Aforo: {p.aforoKgHa.toLocaleString('es-CO')} kg MS/ha</div>
                          <div className="h-1.5 bg-black/20 rounded-full">
                            <div className="h-1.5 bg-white/70 rounded-full" style={{width:`${p.aforoPct}%`}} />
                          </div>
                        </div>
                        {p.estado === 'Rotar ya' && (
                          <div className="mt-1 bg-white/25 rounded text-white text-[10px] font-bold px-2 py-0.5 inline-block animate-pulse">⚠ ROTAR YA</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-200/80 rounded-full px-6 py-2 text-blue-700 text-xs font-medium shadow">~ Laguna 0.8 ha ~</div>
              <div className="absolute bottom-3 left-5 flex items-center gap-2">
                <div className="w-14 h-0.5 bg-green-800" />
                <span className="text-[10px] text-gray-600">escala ref.</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Aforo */}
        <TabsContent value="lista">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <Leaf size={15} className="text-green-400" />
              <div>
                <div className="font-semibold text-sm">Aforo Forrajero y Carga Animal</div>
                <div className="text-xs text-muted-foreground">Disponibilidad de biomasa · MS = Materia Seca</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0d4a3d]/30 border-b border-border">
                    {['POTRERO','PASTO','ÁREA','ESTADO','ANIMALES','CARGA UA/ha','AFORO kg MS/ha','DISPONIB. %','DÍAS PASTO'].map(h => (
                      <th key={h} className="text-muted-foreground font-semibold text-[10px] uppercase px-4 py-2.5 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mapParcelas.map(p => {
                    const carga = p.animals > 0 ? (p.animals / p.ha).toFixed(1) : '—';
                    const diasPasto = p.aforoPct > 0 ? Math.round((p.aforoKgHa * p.ha) / (p.animals > 0 ? p.animals * 10 : 1)) : '—';
                    return (
                      <tr key={p.n} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-4 py-3 font-bold text-sm text-foreground">{p.n}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{p.pasto}</td>
                        <td className="px-4 py-3 text-sm font-medium">{p.ha} ha</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getEstadoColor(p.estado === 'Rotar ya' ? 'Rotar pronto' : p.estado)}`}>{p.estado}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground font-medium">{p.animals || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold ${carga !== '—' && Number(carga) > 3 ? 'text-red-400' : carga !== '—' && Number(carga) > 2 ? 'text-amber-400' : 'text-green-400'}`}>{carga}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{p.aforoKgHa.toLocaleString('es-CO')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-xs font-bold text-foreground mb-1">{p.aforoPct}%</div>
                            <div className="w-20 h-1.5 bg-muted/30 rounded-full">
                              <div className="h-1.5 rounded-full" style={{width:`${p.aforoPct}%`, background: p.aforoPct > 60 ? '#22c55e' : p.aforoPct > 30 ? '#f59e0b' : '#ef4444'}} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold ${typeof diasPasto === 'number' && diasPasto <= 3 ? 'text-red-400' : typeof diasPasto === 'number' && diasPasto <= 7 ? 'text-amber-400' : 'text-green-400'}`}>
                            {diasPasto}{typeof diasPasto === 'number' ? 'd' : ''}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/20 border-t border-border">
                    <td className="px-4 py-3 font-bold text-sm text-foreground" colSpan={2}>TOTAL / PROMEDIO</td>
                    <td className="px-4 py-3 font-bold text-foreground">{totalHa.toFixed(1)} ha</td>
                    <td colSpan={2} />
                    <td className="px-4 py-3 font-bold text-foreground">{cargaAnimal} UA/ha</td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">Prom. {Math.round(mapParcelas.reduce((s,p)=>s+p.aforoKgHa,0)/mapParcelas.length).toLocaleString('es-CO')} kg/ha</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Rotación */}
        <TabsContent value="rotacion">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <div className="px-5 py-3 border-b border-border">
              <div className="font-semibold text-sm">📅 Calendario de Rotación — Plan actual</div>
              <div className="text-xs text-muted-foreground">Historial y programación de entradas/salidas por potrero</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0d4a3d]/30 border-b border-border">
                    {['POTRERO','ESPECIE','ENTRADA','SALIDA PROG.','CICLO','ESTADO','PROGRESO'].map(h => (
                      <th key={h} className="text-muted-foreground font-semibold text-[10px] uppercase px-4 py-2.5 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rotacionTimeline.map((r, i) => {
                    const progressPct = r.dias > 0 ? Math.min(Math.round((r.estado === 'En curso' ? 18 : r.dias) / r.dias * 100), 100) : 0;
                    return (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-4 py-3 font-bold text-sm text-foreground">{r.potrero}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{r.pasto}</td>
                        <td className="px-4 py-3 font-mono text-xs text-green-400">{r.entrada}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.salida}</td>
                        <td className="px-4 py-3 text-sm font-medium">{r.dias > 0 ? `${r.dias}d` : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            r.estado === 'Completado' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            r.estado === 'Vence pronto' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            r.estado === 'Disponible' ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' :
                            'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          }`}>{r.estado}</span>
                        </td>
                        <td className="px-4 py-3 w-32">
                          {r.dias > 0 ? (
                            <div>
                              <div className="text-[10px] text-muted-foreground mb-1">{progressPct}%</div>
                              <div className="h-2 bg-muted/30 rounded-full">
                                <div className="h-2 rounded-full transition-all" style={{width:`${progressPct}%`, background: progressPct >= 100 ? '#22c55e' : progressPct > 80 ? '#ef4444' : '#f59e0b'}} />
                              </div>
                            </div>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-muted/10 border-t border-border">
              <div className="text-xs text-muted-foreground">
                <strong className="text-foreground">Recomendación INTA:</strong> Rotación cada 28–35 días en praderas tropicales · Carga máxima 2.5–3 UA/ha · Dejar crecer mínimo 25 cm antes de ingresar
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  function getEstadoColor(estado: string) {
    switch (estado) {
      case 'Disponible': return 'text-green-400 border-green-400/40 bg-green-400/5';
      case 'Ocupado': return 'text-orange-400 border-orange-400/40 bg-orange-400/5';
      case 'Rotar pronto': return 'text-red-400 border-red-400/40 bg-red-400/5';
      case 'Descanso': return 'text-blue-400 border-blue-400/40 bg-blue-400/5';
      default: return 'text-muted-foreground border-border bg-muted/10';
    }
  }
}
