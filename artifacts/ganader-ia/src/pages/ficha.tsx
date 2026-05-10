import { useAppState } from "../lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Baby, Scale, Syringe, ClipboardList, Plus, Heart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const historialVacunas: Record<string, Array<{fecha:string;vacuna:string;dosis:string;aplicador:string;proxima:string;lote:string}>> = {
  'A-0042': [
    { fecha:'15/01/2025', vacuna:'Brucelosis', dosis:'2 ml', aplicador:'Dr. Ramírez', proxima:'15/01/2026', lote:'BRU-2025-01' },
    { fecha:'10/02/2025', vacuna:'IBR/BVD', dosis:'5 ml', aplicador:'Dr. Ramírez', proxima:'10/02/2026', lote:'IBR-2025-02' },
    { fecha:'01/03/2025', vacuna:'Fiebre aftosa', dosis:'2 ml', aplicador:'Rodrigo V.', proxima:'01/09/2025', lote:'FA-2025-03' },
    { fecha:'15/04/2025', vacuna:'Carbón bacteridiano', dosis:'3 ml', aplicador:'Dr. Ramírez', proxima:'15/04/2026', lote:'CB-2025-04' },
  ],
  'default': [
    { fecha:'01/03/2025', vacuna:'Fiebre aftosa', dosis:'2 ml', aplicador:'Rodrigo V.', proxima:'01/09/2025', lote:'FA-2025-03' },
    { fecha:'10/02/2025', vacuna:'IBR/BVD', dosis:'5 ml', aplicador:'Dr. Ramírez', proxima:'10/02/2026', lote:'IBR-2025-02' },
  ],
};

const historialPartos: Record<string, Array<{num:number;fecha:string;tipo:string;cria:string;pesoNac:number;complicaciones:string;inseminacion:string}>> = {
  'A-0042': [
    { num:1, fecha:'12/03/2022', tipo:'Normal', cria:'Manchas (M)', pesoNac:38, complicaciones:'Ninguna', inseminacion:'IA Altísimo' },
    { num:2, fecha:'05/04/2023', tipo:'Normal', cria:'Lila (H)', pesoNac:36, complicaciones:'Ninguna', inseminacion:'IA Furacao' },
    { num:3, fecha:'18/04/2024', tipo:'Distócico', cria:'Bruno (M)', pesoNac:40, complicaciones:'Asistencia veterinaria', inseminacion:'IA Titan USA' },
    { num:4, fecha:'10/05/2025', tipo:'Normal', cria:'Pendiente', pesoNac:0, complicaciones:'—', inseminacion:'IA Altísimo' },
  ],
  'A-0604': [
    { num:1, fecha:'15/02/2022', tipo:'Normal', cria:'Estrellita (H)', pesoNac:37, complicaciones:'Ninguna', inseminacion:'Monta natural' },
    { num:2, fecha:'20/03/2023', tipo:'Normal', cria:'Sol (M)', pesoNac:39, complicaciones:'Ninguna', inseminacion:'IA Furacao' },
    { num:3, fecha:'05/06/2025', tipo:'—', cria:'Por nacer', pesoNac:0, complicaciones:'—', inseminacion:'IA Titan USA' },
  ],
  'default': [],
};

const eventosData: Record<string, Array<{icon:string;fecha:string;evento:string;tipo:string;color:string}>> = {
  'A-0042': [
    { icon:'🐣', fecha:'10/05/2025', evento:'Parto N°4 esperado — en seguimiento', tipo:'Reproductivo', color:'text-purple-400' },
    { icon:'💊', fecha:'02/04/2025', evento:'Inicio tratamiento antibiótico — Mastitis leve subclinica', tipo:'Tratamiento', color:'text-red-400' },
    { icon:'🔬', fecha:'28/03/2025', evento:'Control RCS — 192,000 cel/ml · Grado A', tipo:'Calidad', color:'text-blue-400' },
    { icon:'⚖️', fecha:'01/04/2025', evento:'Pesaje periódico — 520 kg (+4 kg vs anterior)', tipo:'Productivo', color:'text-cyan-400' },
    { icon:'💉', fecha:'01/03/2025', evento:'Vacunación fiebre aftosa — dosis completa', tipo:'Sanitario', color:'text-green-400' },
  ],
  'A-0712': [
    { icon:'💊', fecha:'28/04/2025', evento:'Día 2/3 antibiótico L.A. — revisión mañana', tipo:'Tratamiento', color:'text-red-400' },
    { icon:'⚖️', fecha:'01/04/2025', evento:'Pérdida de peso: −8 kg (tratamiento en curso)', tipo:'Productivo', color:'text-orange-400' },
    { icon:'🔬', fecha:'15/04/2025', evento:'Palpación: vacía — 88 días abiertos', tipo:'Reproductivo', color:'text-amber-400' },
  ],
  'default': [
    { icon:'💉', fecha:'01/03/2025', evento:'Vacunación fiebre aftosa — completa', tipo:'Sanitario', color:'text-green-400' },
    { icon:'⚖️', fecha:'01/04/2025', evento:'Pesaje periódico — estado normal', tipo:'Productivo', color:'text-blue-400' },
  ],
};

export default function Ficha() {
  const { animals, pesaje } = useAppState();
  const [selId, setSelId] = useState(animals[0]?.id || '');
  const animal = animals.find(a => a.id === selId) || animals[0];
  const [activeTab, setActiveTab] = useState("vacunas");
  const [openAddVacuna, setOpenAddVacuna] = useState(false);

  const pesajeAnimal = useMemo(() =>
    pesaje
      .filter(p => p.animalId === selId)
      .sort((a, b) => new Date(a.fecha.split('/').reverse().join('-')).getTime() - new Date(b.fecha.split('/').reverse().join('-')).getTime()),
    [pesaje, selId]
  );

  const vacunas = historialVacunas[selId] || historialVacunas['default'];
  const partos = historialPartos[selId] || historialPartos['default'];
  const eventos = eventosData[selId] || eventosData['default'];

  if (!animal) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">No hay animales registrados.</div>
  );

  const getCatEmoji = (cat: string) => {
    switch (cat) {
      case 'Vaca adulta': return '🐄';
      case 'Novilla': return '🐮';
      case 'Ternero': return '🐣';
      case 'Toro': return '🐂';
      default: return '🐄';
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Producción': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Tratamiento': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'Gestante': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'Seca': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      case 'Abierta': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default: return 'bg-muted/20 text-muted-foreground border border-border';
    }
  };

  const pesoInicial = pesajeAnimal.length > 0 ? pesajeAnimal[0].peso : animal.peso;
  const pesoActual = pesajeAnimal.length > 0 ? pesajeAnimal[pesajeAnimal.length - 1].peso : animal.peso;
  const gananciaTotal = pesoActual - pesoInicial;
  const bcsActual = pesajeAnimal.length > 0 ? pesajeAnimal[pesajeAnimal.length - 1].condicionCorporal : 3;

  const chartData = pesajeAnimal.map(p => ({
    fecha: p.fecha.substring(3),
    peso: p.peso,
    bcs: p.condicionCorporal * 100,
  }));

  return (
    <div className="space-y-5 pb-8">
      {/* Banner con selector */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1565c0] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <ClipboardList size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Ficha Individual — Historia Clínica</h1>
            <p className="text-white/70 text-sm">Vacunas · Pesajes con gráfica · Partos · Eventos sanitarios</p>
          </div>
        </div>
        <Select value={selId} onValueChange={id => { setSelId(id); }}>
          <SelectTrigger className="w-56 bg-white/10 border-white/30 text-white">
            <SelectValue placeholder="Seleccionar animal" />
          </SelectTrigger>
          <SelectContent>
            {animals.map(a => (
              <SelectItem key={a.id} value={a.id}>{a.id} — {a.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Animal Card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted/60 to-muted/30 border border-border flex items-center justify-center text-4xl flex-shrink-0">
            {getCatEmoji(animal.categoria)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h2 className="text-2xl font-bold text-foreground">{animal.nombre}</h2>
              <span className="font-mono text-sm text-green-400 font-bold bg-green-400/10 px-2.5 py-1 rounded-lg">{animal.id}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getEstadoBadge(animal.estado)}`}>{animal.estado}</span>
              {animal.estado === 'Tratamiento' && (
                <span className="flex items-center gap-1 text-xs text-red-400 animate-pulse">
                  <AlertTriangle size={12} /> En tratamiento
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span>🐄 {animal.raza}</span>
              <span>📍 {animal.lote}</span>
              <span>🏷️ {animal.categoria}</span>
              {animal.partos > 0 && <span>🐣 {animal.partos} partos</span>}
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {[
              { icon:'⚖️', label:'Peso actual', val:`${animal.peso} kg`, color:'text-foreground' },
              { icon:'📈', label:'Ganancia', val: gananciaTotal !== 0 ? `${gananciaTotal > 0 ? '+' : ''}${gananciaTotal} kg` : 'N/A', color: gananciaTotal >= 0 ? 'text-green-400' : 'text-red-400' },
              { icon:'🥛', label:'L/Día', val:`${animal.litrosDia || 0} L`, color: animal.litrosDia ? 'text-cyan-400' : 'text-muted-foreground' },
              { icon:'❤️', label:'BCS', val:`${bcsActual}/5`, color: bcsActual >= 3 ? 'text-green-400' : bcsActual >= 2 ? 'text-amber-400' : 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="text-center bg-muted/20 rounded-xl p-3 border border-border">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
                <div className={`text-sm font-bold mt-0.5 ${s.color}`}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/40">
          <TabsTrigger value="vacunas" className="gap-1.5 text-xs"><Syringe size={13} /> Vacunas</TabsTrigger>
          <TabsTrigger value="pesos" className="gap-1.5 text-xs"><Scale size={13} /> Pesajes</TabsTrigger>
          <TabsTrigger value="partos" className="gap-1.5 text-xs"><Baby size={13} /> Partos</TabsTrigger>
          <TabsTrigger value="eventos" className="gap-1.5 text-xs"><Activity size={13} /> Eventos</TabsTrigger>
        </TabsList>

        {/* Vacunas */}
        <TabsContent value="vacunas">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-[#1a4a2e]/40">
              <div>
                <div className="font-semibold text-sm">💉 Historial de Vacunación</div>
                <div className="text-xs text-muted-foreground">{vacunas.length} vacunas registradas · Trazabilidad completa</div>
              </div>
              <Dialog open={openAddVacuna} onOpenChange={setOpenAddVacuna}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 text-xs gap-1"><Plus size={12} /> Vacuna</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader><DialogTitle>Registrar Vacuna</DialogTitle></DialogHeader>
                  <div className="grid gap-3 py-4">
                    <div className="space-y-1.5"><Label>Fecha de aplicación</Label><Input placeholder="DD/MM/AAAA" /></div>
                    <div className="space-y-1.5"><Label>Vacuna / Biológico</Label><Input /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>Dosis</Label><Input defaultValue="2 ml" /></div>
                      <div className="space-y-1.5"><Label>Lote</Label><Input /></div>
                    </div>
                    <div className="space-y-1.5"><Label>Aplicador</Label><Input defaultValue="Dr. Ramírez" /></div>
                    <div className="space-y-1.5"><Label>Próxima dosis</Label><Input placeholder="DD/MM/AAAA" /></div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
                    <Button size="sm" onClick={() => setOpenAddVacuna(false)}>Guardar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1a4a2e]/20 border-b border-border">
                    {['FECHA','VACUNA','DOSIS','LOTE','APLICADOR','PRÓXIMA DOSIS','ESTADO'].map(h => (
                      <th key={h} className="text-muted-foreground font-semibold text-[10px] uppercase px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vacunas.map((v, i) => {
                    const hoy = new Date();
                    const proxDate = new Date(v.proxima.split('/').reverse().join('-'));
                    const daysLeft = Math.round((proxDate.getTime() - hoy.getTime()) / 86400000);
                    return (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono text-xs text-green-400 font-semibold">{v.fecha}</td>
                        <td className="px-4 py-3 font-medium text-sm text-foreground">{v.vacuna}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{v.dosis}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.lote}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{v.aplicador}</td>
                        <td className="px-4 py-3 font-mono text-xs text-amber-400">{v.proxima}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            daysLeft < 30 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            daysLeft < 90 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-green-500/20 text-green-400 border-green-500/30'
                          }`}>
                            {daysLeft < 0 ? 'Vencida' : daysLeft < 30 ? `${daysLeft}d` : '✓ Al día'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Pesajes con gráfica */}
        <TabsContent value="pesos">
          <div className="space-y-4 mt-3">
            {/* Gráfica de peso */}
            {chartData.length > 0 ? (
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold">📈 Evolución de Peso — {animal.nombre}</div>
                    <div className="text-xs text-muted-foreground">{pesajeAnimal.length} registros de pesaje · Tendencia</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">{pesoActual} kg</div>
                    <div className={`text-xs font-semibold ${gananciaTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {gananciaTotal >= 0 ? '↑' : '↓'} {gananciaTotal >= 0 ? '+' : ''}{gananciaTotal} kg total
                    </div>
                  </div>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{top:16,right:20,left:0,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="fecha" stroke="#444" tick={{fill:'#888',fontSize:10}} />
                      <YAxis stroke="#444" tick={{fill:'#888',fontSize:10}} width={42} domain={['auto','auto']} />
                      <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} formatter={(v:number) => [`${v} kg`, 'Peso']} />
                      <Line type="monotone" dataKey="peso" stroke="#22c55e" strokeWidth={2.5} dot={{ fill:'#22c55e', r:4, strokeWidth:2, stroke:'#111' }} activeDot={{ r:6 }} name="Peso (kg)" />
                      <ReferenceLine y={animal.peso} stroke="#7c3aed" strokeDasharray="5 5" label={{ value:'Actual', fill:'#7c3aed', fontSize:10 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                <Scale size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay registros de pesaje para este animal</p>
              </div>
            )}

            {/* Tabla de pesajes */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-[#1a4a2e]/40">
                <div>
                  <div className="font-semibold text-sm">📋 Registros de Pesaje</div>
                  <div className="text-xs text-muted-foreground">{pesajeAnimal.length} pesajes registrados</div>
                </div>
                <Button size="sm" className="h-8 text-xs gap-1"><Plus size={12} /> Pesaje</Button>
              </div>
              {pesajeAnimal.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#1a4a2e]/20 border-b border-border">
                        {['FECHA','PESO','VARIACIÓN','BCS','BÁSCULA','OPERADOR','OBSERVACIONES'].map(h => (
                          <th key={h} className="text-muted-foreground font-semibold text-[10px] uppercase px-4 py-3 text-left whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...pesajeAnimal].reverse().map((p, i) => (
                        <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="px-4 py-3 font-mono text-xs text-green-400 font-semibold">{p.fecha}</td>
                          <td className="px-4 py-3 text-base font-bold text-foreground">{p.peso} kg</td>
                          <td className="px-4 py-3">
                            {p.variacion !== null ? (
                              <span className={`text-sm font-bold ${p.variacion > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {p.variacion > 0 ? '+' : ''}{p.variacion} kg
                              </span>
                            ) : <span className="text-muted-foreground text-sm">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(star => (
                                <div key={star} className={`w-3 h-3 rounded-sm ${p.condicionCorporal >= star ? 'bg-amber-400' : 'bg-muted/40'}`} />
                              ))}
                              <span className="ml-1 text-xs font-semibold text-amber-400">{p.condicionCorporal}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{p.bascula}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{p.operador}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{p.observaciones || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">Sin pesajes para este animal</div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Partos */}
        <TabsContent value="partos">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-[#1a4a2e]/40">
              <div>
                <div className="font-semibold text-sm">🐣 Historial Reproductivo y de Partos</div>
                <div className="text-xs text-muted-foreground">{partos.length} partos registrados</div>
              </div>
              <Button size="sm" className="h-8 text-xs gap-1"><Plus size={12} /> Parto</Button>
            </div>
            {partos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#1a4a2e]/20 border-b border-border">
                      {['N°','FECHA','INSEMINACIÓN','TIPO PARTO','CRÍA','PESO NAC.','COMPLICACIONES'].map(h => (
                        <th key={h} className="text-muted-foreground font-semibold text-[10px] uppercase px-4 py-3 text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {partos.map(p => (
                      <tr key={p.num} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${p.num === 1 ? 'bg-amber-500/20 text-amber-400' : 'bg-muted/40 text-muted-foreground'}`}>{p.num}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-green-400 font-semibold">{p.fecha}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">{p.inseminacion}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${p.tipo === 'Normal' ? 'bg-green-500/20 text-green-400 border-green-500/30' : p.tipo === 'Distócico' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-muted/20 text-muted-foreground border-border'}`}>{p.tipo}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground font-medium">{p.cria}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-foreground">{p.pesoNac > 0 ? `${p.pesoNac} kg` : '—'}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{p.complicaciones}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Baby size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Sin partos registrados para este animal</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Eventos */}
        <TabsContent value="eventos">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm flex items-center gap-2"><Heart size={15} className="text-red-400" /> Eventos Sanitarios y Productivos</div>
                <div className="text-xs text-muted-foreground">{eventos.length} eventos registrados</div>
              </div>
              <Button size="sm" className="h-8 text-xs gap-1"><Plus size={12} /> Evento</Button>
            </div>
            <div className="p-4 space-y-3">
              {eventos.map((ev, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-muted/20 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                  <span className="text-2xl flex-shrink-0">{ev.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        ev.tipo === 'Tratamiento' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        ev.tipo === 'Reproductivo' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        ev.tipo === 'Calidad' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        ev.tipo === 'Sanitario' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                      }`}>{ev.tipo}</span>
                      <span className="font-mono text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">{ev.fecha}</span>
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
