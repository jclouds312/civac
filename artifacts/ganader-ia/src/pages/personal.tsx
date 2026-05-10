import { useAppState } from "../lib/data";
import { Download, Plus, Pencil, Trash2, Users, Clock, CheckSquare, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const getCargoBadge = (cargo: string) => {
  switch (cargo) {
    case "Vaquero jefe": return "bg-teal-500/20 text-teal-400 border border-teal-500/30";
    case "Ordeñador": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "Ordeñadora": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "Inseminador": return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
    case "Administradora": return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    case "Mantenimiento": return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    default: return "bg-muted text-muted-foreground border border-border";
  }
};

const getCargoEmoji = (cargo: string) => {
  switch (cargo) {
    case "Vaquero jefe": return "👨‍🌾";
    case "Ordeñador": return "🧑‍🔧";
    case "Ordeñadora": return "👩‍🔧";
    case "Inseminador": return "🩺";
    case "Administradora": return "👩‍💼";
    case "Mantenimiento": return "🔧";
    default: return "👤";
  }
};

const asistencia = [
  { nombre:'Carlos Meza', dias: [true,true,true,true,true,false,false,true,true,true,true,true,false,false,true] },
  { nombre:'Luis Patiño', dias: [true,true,false,true,true,false,false,true,true,true,false,true,false,false,true] },
  { nombre:'Sandra Roa', dias: [true,true,true,true,true,false,false,true,true,false,true,true,false,false,true] },
  { nombre:'Pedro Villa', dias: [true,true,true,false,true,false,false,true,true,true,true,true,false,false,true] },
  { nombre:'Ana Gomez', dias: [true,true,true,true,true,false,false,true,true,true,true,true,false,false,true] },
  { nombre:'Jorge Cruz', dias: [true,false,true,true,true,false,false,true,false,true,true,true,false,false,true] },
];

const tareas = [
  { id:1, titulo:'Desparasitar lote B (12 animales)', asignado:'Carlos Meza', prioridad:'Alta', fecha:'30/04/2025', estado:'Pendiente' },
  { id:2, titulo:'Ordeño turno mañana — Potrero 1 y 2', asignado:'Luis Patiño', prioridad:'Alta', fecha:'Diario', estado:'Completado' },
  { id:3, titulo:'Aplicar protocolo IATF vacas abiertas', asignado:'Pedro Villa', prioridad:'Alta', fecha:'02/05/2025', estado:'En proceso' },
  { id:4, titulo:'Mantenimiento cercado eléctrico P.4', asignado:'Jorge Cruz', prioridad:'Media', fecha:'05/05/2025', estado:'Pendiente' },
  { id:5, titulo:'Pesaje mensual lote novillas', asignado:'Carlos Meza', prioridad:'Media', fecha:'05/05/2025', estado:'Pendiente' },
  { id:6, titulo:'Registro de producción diaria', asignado:'Sandra Roa', prioridad:'Baja', fecha:'Diario', estado:'Completado' },
  { id:7, titulo:'Informe financiero semanal', asignado:'Ana Gomez', prioridad:'Alta', fecha:'03/05/2025', estado:'En proceso' },
];

const valorHoraExtra = 12500;

export default function Personal() {
  const { personal, setPersonal } = useAppState();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("nomina");

  const nominaTotal = personal.reduce((acc, p) => acc + p.salario + (p.hExtras * valorHoraExtra), 0);
  const extrasTotal = personal.reduce((acc, p) => acc + p.hExtras, 0);
  const salarioBase = personal.reduce((acc, p) => acc + p.salario, 0);
  const extrasValor = personal.reduce((acc, p) => acc + p.hExtras * valorHoraExtra, 0);
  const parafiscales = Math.round(salarioBase * 0.52);

  const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPersonal([...personal, {
      nombre: fd.get('nombre') as string,
      cargo: fd.get('cargo') as string,
      cedula: fd.get('cedula') as string,
      ingreso: fd.get('ingreso') as string,
      salario: Number(fd.get('salario')),
      hExtras: 0,
      eps: fd.get('eps') as string,
      arl: fd.get('arl') as string,
    }]);
    setOpen(false);
  };

  const addHorasExtra = (idx: number, delta: number) => {
    const arr = [...personal];
    arr[idx] = { ...arr[idx], hExtras: Math.max(0, arr[idx].hExtras + delta) };
    setPersonal(arr);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#7c3d10] to-[#bf360c] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Personal, Nómina y Tareas</h1>
            <p className="text-white/70 text-sm">Empleados activos · Salarios · H. extras · Asistencia · Asignación de tareas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-9 gap-1.5 text-sm">
            <Download size={14} /> CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 h-9 gap-1.5 text-sm">
                <Plus size={14} /> Empleado
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <form onSubmit={handleAdd}>
                <DialogHeader><DialogTitle>Agregar Empleado</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Nombre completo</Label><Input name="nombre" required /></div>
                    <div className="space-y-1.5">
                      <Label>Cargo</Label>
                      <Select name="cargo" defaultValue="Ordeñador">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{['Vaquero jefe','Ordeñador','Ordeñadora','Inseminador','Administradora','Mantenimiento'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Cédula</Label><Input name="cedula" required /></div>
                    <div className="space-y-1.5"><Label>Fecha ingreso</Label><Input name="ingreso" placeholder="DD/MM/AAAA" required /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Salario base (COP)</Label><Input name="salario" type="number" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>EPS</Label><Input name="eps" required /></div>
                    <div className="space-y-1.5"><Label>ARL</Label><Input name="arl" required /></div>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'EMPLEADOS ACTIVOS', val:`${personal.length}`, sub:'en planilla', gradient:'linear-gradient(135deg,#e65100,#f57c00)' },
          { label:'NÓMINA BASE', val:fmt(salarioBase), sub:'salarios mes', gradient:'linear-gradient(135deg,#1b5e20,#2e7d32)' },
          { label:'HORAS EXTRAS', val:`${extrasTotal}h`, sub: fmt(extrasValor), gradient:'linear-gradient(135deg,#00695c,#00897b)' },
          { label:'PARAFISCALES', val:fmt(parafiscales), sub:'52% sobre base', gradient:'linear-gradient(135deg,#4a148c,#6a1b9a)' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white shadow" style={{background:k.gradient}}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">{k.label}</div>
            <div className="text-base font-bold leading-tight">{k.val}</div>
            <div className="text-[10px] text-white/60">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="nomina" className="gap-1.5 text-xs"><Users size={13} /> Nómina</TabsTrigger>
          <TabsTrigger value="asistencia" className="gap-1.5 text-xs"><Clock size={13} /> Asistencia</TabsTrigger>
          <TabsTrigger value="tareas" className="gap-1.5 text-xs"><CheckSquare size={13} /> Tareas</TabsTrigger>
        </TabsList>

        {/* Nómina */}
        <TabsContent value="nomina">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <div className="bg-gradient-to-r from-[#7c3d10] to-[#bf360c] px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="text-base">👷</span>
                <div>
                  <div className="font-semibold text-white text-sm">Planilla de Nómina — Mayo 2025</div>
                  <div className="text-white/60 text-xs">{personal.length} empleados · Nómina total: {fmt(nominaTotal)}</div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#5c2e00]/30 border-b border-border">
                    {['EMPLEADO','CARGO','CÉDULA','INGRESO','SALARIO BASE','H.EXTRAS','VALOR EXTRAS','TOTAL MES','EPS / ARL',''].map(h => (
                      <th key={h} className="text-muted-foreground font-semibold text-[10px] uppercase px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {personal.map((p, i) => {
                    const extrasVal = p.hExtras * valorHoraExtra;
                    const totalMes = p.salario + extrasVal;
                    return (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getCargoEmoji(p.cargo)}</span>
                            <div>
                              <div className="font-semibold text-sm text-foreground">{p.nombre}</div>
                              <span className="text-[10px] font-semibold bg-green-400/10 text-green-400 border border-green-400/30 px-1.5 py-0.5 rounded-full">Activo</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCargoBadge(p.cargo)}`}>{p.cargo}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.cedula}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{p.ingreso}</td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{fmt(p.salario)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => addHorasExtra(i, -1)} className="w-6 h-6 rounded border border-border bg-muted/30 hover:bg-muted flex items-center justify-center text-foreground text-xs font-bold">−</button>
                            <span className={`text-sm font-semibold w-8 text-center ${p.hExtras > 0 ? 'text-orange-400' : 'text-muted-foreground'}`}>{p.hExtras}h</span>
                            <button onClick={() => addHorasExtra(i, 1)} className="w-6 h-6 rounded border border-border bg-muted/30 hover:bg-muted flex items-center justify-center text-foreground text-xs font-bold">+</button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-orange-400">{extrasVal > 0 ? fmt(extrasVal) : '—'}</td>
                        <td className="px-4 py-3 text-sm font-bold text-green-400">{fmt(totalMes)}</td>
                        <td className="px-4 py-3">
                          <div className="text-[10px] text-muted-foreground">{p.eps}</div>
                          <div className="text-[10px] text-muted-foreground">{p.arl}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-muted/30"><Pencil size={13} /></button>
                            <button className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-red-500/10" onClick={() => setPersonal(personal.filter((_,j) => j !== i))}><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/20 border-t border-border">
                    <td className="px-4 py-3 font-bold text-sm text-foreground" colSpan={4}>TOTAL NÓMINA MES</td>
                    <td className="px-4 py-3 font-bold text-foreground">{fmt(salarioBase)}</td>
                    <td className="px-4 py-3 font-bold text-orange-400">{extrasTotal}h</td>
                    <td className="px-4 py-3 font-bold text-orange-400">{fmt(extrasValor)}</td>
                    <td className="px-4 py-3 font-bold text-xl text-green-400">{fmt(nominaTotal)}</td>
                    <td colSpan={2} />
                  </tr>
                  <tr className="bg-purple-500/5 border-t border-purple-500/20">
                    <td className="px-4 py-2 text-xs text-muted-foreground" colSpan={4}>+ Parafiscales (52%)</td>
                    <td colSpan={3} />
                    <td className="px-4 py-2 font-bold text-purple-400">{fmt(parafiscales)}</td>
                    <td colSpan={2} />
                  </tr>
                  <tr className="bg-muted/10 border-t border-border">
                    <td className="px-4 py-2 font-bold text-sm text-foreground" colSpan={4}>COSTO TOTAL LABORAL</td>
                    <td colSpan={3} />
                    <td className="px-4 py-2 font-bold text-lg text-foreground">{fmt(nominaTotal + parafiscales)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Asistencia */}
        <TabsContent value="asistencia">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <div className="px-5 py-3 border-b border-border">
              <div className="font-semibold text-sm">📅 Control de Asistencia — Abril 2025</div>
              <div className="text-xs text-muted-foreground">Días trabajados · Verde = Presente · Rojo = Ausente · Gris = Descanso</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="text-muted-foreground font-semibold text-[10px] uppercase px-4 py-2.5 text-left">EMPLEADO</th>
                    {Array.from({length:15},(_,i)=>(
                      <th key={i} className="text-muted-foreground font-semibold text-[10px] uppercase px-2 py-2.5 text-center">{15+i}</th>
                    ))}
                    <th className="text-muted-foreground font-semibold text-[10px] uppercase px-4 py-2.5 text-center">PRES.</th>
                    <th className="text-muted-foreground font-semibold text-[10px] uppercase px-4 py-2.5 text-center">%</th>
                  </tr>
                </thead>
                <tbody>
                  {asistencia.map((emp, ei) => {
                    const presentes = emp.dias.filter(Boolean).length;
                    const pct = Math.round(presentes / emp.dias.length * 100);
                    return (
                      <tr key={ei} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium text-sm text-foreground whitespace-nowrap">{emp.nombre}</td>
                        {emp.dias.map((presente, di) => {
                          const isWeekend = di === 5 || di === 6 || di === 12 || di === 13;
                          return (
                            <td key={di} className="px-2 py-3 text-center">
                              <span className={`w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-bold mx-auto ${
                                isWeekend ? 'bg-muted/30 text-muted-foreground' :
                                presente ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {isWeekend ? 'D' : presente ? '✓' : '✗'}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center font-bold text-foreground">{presentes}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-bold ${pct >= 90 ? 'text-green-400' : pct >= 75 ? 'text-amber-400' : 'text-red-400'}`}>{pct}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tareas */}
        <TabsContent value="tareas">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm flex items-center gap-2"><CheckSquare size={15} className="text-primary" /> Asignación de Tareas</div>
                <div className="text-xs text-muted-foreground">{tareas.filter(t=>t.estado==='Pendiente').length} pendientes · {tareas.filter(t=>t.estado==='En proceso').length} en proceso · {tareas.filter(t=>t.estado==='Completado').length} completadas</div>
              </div>
              <Button size="sm" className="h-8 text-xs gap-1"><Plus size={12} /> Nueva Tarea</Button>
            </div>
            <div className="divide-y divide-border">
              {tareas.map(t => (
                <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                  <div className={`w-2 h-10 rounded-full flex-shrink-0 ${t.prioridad === 'Alta' ? 'bg-red-500' : t.prioridad === 'Media' ? 'bg-amber-500' : 'bg-green-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">{t.titulo}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Asignado: <span className="font-medium text-foreground">{t.asignado}</span> · Fecha: {t.fecha}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${t.prioridad === 'Alta' ? 'text-red-400 border-red-400/30 bg-red-400/5' : t.prioridad === 'Media' ? 'text-amber-400 border-amber-400/30 bg-amber-400/5' : 'text-green-400 border-green-400/30 bg-green-400/5'}`}>
                      {t.prioridad}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      t.estado === 'Completado' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      t.estado === 'En proceso' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>{t.estado}</span>
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
