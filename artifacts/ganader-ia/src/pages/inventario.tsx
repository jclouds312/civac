import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "../lib/data";
import { Search, Plus, Download, Pencil, Trash2, Bluetooth } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const getCatBadge = (cat: string) => {
  switch (cat) {
    case "Ternero": return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    case "Ternera": return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    case "Novilla": return "bg-teal-500/20 text-teal-400 border border-teal-500/30";
    case "Vaca adulta": return "bg-teal-600/20 text-teal-300 border border-teal-600/30";
    case "Toro": return "bg-red-500/20 text-red-400 border border-red-500/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const getLoteBadge = (lote: string) => {
  switch (lote) {
    case "Lote A": return "bg-purple-500/20 text-purple-400";
    case "Lote B": return "bg-blue-500/20 text-blue-400";
    case "Lote C": return "bg-teal-500/20 text-teal-400";
    case "Lote D": return "bg-orange-500/20 text-orange-400";
    case "Lote E": return "bg-red-500/20 text-red-400";
    default: return "bg-muted/30 text-muted-foreground";
  }
};

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "Producción": return "text-green-400";
    case "Tratamiento": return "text-red-400";
    case "Destete": return "text-orange-400";
    case "Abierta": return "text-yellow-400";
    case "Gestante": return "text-purple-400";
    case "Seca": return "text-gray-400";
    case "Activo": return "text-green-400";
    default: return "text-muted-foreground";
  }
};

function calcEdad(fechaNacimiento: string): string {
  if (!fechaNacimiento) return "—";
  const nac = new Date(fechaNacimiento);
  const hoy = new Date();
  const diffMs = hoy.getTime() - nac.getTime();
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (dias < 30) return `${dias}d`;
  const meses = Math.floor(dias / 30);
  if (meses < 12) return `${meses}m`;
  const años = Math.floor(meses / 12);
  const mRest = meses % 12;
  return mRest > 0 ? `${años}a ${mRest}m` : `${años}a`;
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

export default function Inventario() {
  const { animals, setAnimals } = useAppState();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todos");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [open, setOpen] = useState(false);
  const [editAnimal, setEditAnimal] = useState<typeof animals[0] | null>(null);

  // Form state for dialog
  const [formRegistro, setFormRegistro] = useState("NO");
  const [formFechaNac, setFormFechaNac] = useState("");
  const [formEdad, setFormEdad] = useState("");
  const [formPeso, setFormPeso] = useState("");
  const [formValorKilo, setFormValorKilo] = useState("0");
  const [formValorAnimal, setFormValorAnimal] = useState(0);
  const [btConnecting, setBtConnecting] = useState(false);

  useEffect(() => {
    setFormEdad(calcEdad(formFechaNac));
  }, [formFechaNac]);

  useEffect(() => {
    const p = Number(formPeso) || 0;
    const vk = Number(formValorKilo) || 0;
    setFormValorAnimal(p * vk);
  }, [formPeso, formValorKilo]);

  const resetForm = () => {
    setFormRegistro("NO");
    setFormFechaNac("");
    setFormEdad("");
    setFormPeso("");
    setFormValorKilo("0");
    setFormValorAnimal(0);
    setEditAnimal(null);
  };

  const openNew = () => { resetForm(); setOpen(true); };
  const openEdit = (a: typeof animals[0]) => {
    setEditAnimal(a);
    setFormRegistro(a.registro || "NO");
    setFormFechaNac(a.fechaNacimiento || "");
    setFormEdad(calcEdad(a.fechaNacimiento || ""));
    setFormPeso(String(a.peso));
    setFormValorKilo(String(a.valorKilo || 0));
    setFormValorAnimal((a.peso || 0) * (a.valorKilo || 0));
    setOpen(true);
  };

  // Simulate Bluetooth weight reading
  const handleBluetooth = () => {
    setBtConnecting(true);
    setTimeout(() => {
      const simPeso = (Math.random() * 400 + 100).toFixed(1);
      setFormPeso(simPeso);
      setBtConnecting(false);
    }, 1500);
  };

  const filtered = animals.filter(a => {
    const matchSearch = a.nombre.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()) || a.raza.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Todos" || a.categoria === catFilter;
    const matchEstado = estadoFilter === "Todos" || a.estado === estadoFilter;
    return matchSearch && matchCat && matchEstado;
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const entry = {
      id: editAnimal ? editAnimal.id : (fd.get('arete') as string),
      nombre: fd.get('nombre') as string,
      raza: fd.get('raza') as string,
      categoria: fd.get('categoria') as string,
      peso: Number(formPeso),
      lote: fd.get('lote') as string,
      estado: fd.get('estado') as string,
      litrosDia: Number(fd.get('litrosDia') || 0),
      partos: Number(fd.get('partos') || 0),
      fechaNacimiento: formFechaNac,
      registro: formRegistro,
      numeroRegistro: formRegistro === "SI" ? (fd.get('numeroRegistro') as string || "") : "",
      valorKilo: Number(formValorKilo) || 0,
    };
    if (editAnimal) {
      setAnimals(animals.map(a => a.id === editAnimal.id ? entry : a));
    } else {
      setAnimals([entry, ...animals]);
    }
    setOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setAnimals(animals.filter(a => a.id !== id));
  };

  const totalLeche = animals.reduce((s, a) => s + (a.litrosDia || 0), 0);

  return (
    <div className="space-y-5 pb-8">
      {/* CIVAC Banner */}
      <div className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden civac-animate"
        style={{background:'linear-gradient(135deg,#001a11 0%,#002e1a 100%)', border:'1px solid rgba(0,245,212,0.35)', boxShadow:'0 0 40px rgba(0,245,212,0.1), inset 0 1px 0 rgba(0,245,212,0.08)'}}>
        <div className="absolute right-0 top-0 w-48 h-full pointer-events-none opacity-10" style={{background:'radial-gradient(ellipse at right, #00f5d4, transparent 70%)'}} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{background:'rgba(0,245,212,0.1)', border:'1px solid rgba(0,245,212,0.4)', boxShadow:'0 0 16px rgba(0,245,212,0.2)'}}>🐄</div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{fontFamily:'Sora,sans-serif'}}>Inventario Animal — {animals.length} cabezas</h1>
            <p className="text-sm" style={{color:'rgba(0,245,212,0.7)'}}>Registro RFID GES3S · Básculas Tru-Test · Hato completo · Offline</p>
          </div>
        </div>
        <div className="relative flex gap-2">
          <Button variant="outline" className="h-9 gap-1.5 text-sm" style={{background:'rgba(0,245,212,0.08)', border:'1px solid rgba(0,245,212,0.3)', color:'#00f5d4'}}>
            <Download size={14} /> CSV
          </Button>
          <Dialog open={open} onOpenChange={v => { if (!v) resetForm(); setOpen(v); }}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="h-9 gap-1.5 text-sm" style={{background:'rgba(0,245,212,0.15)', border:'1px solid rgba(0,245,212,0.4)', color:'#fff'}}>
                <Plus size={14} /> Agregar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSave}>
                <DialogHeader>
                  <DialogTitle>{editAnimal ? `Editar: ${editAnimal.nombre}` : "Agregar Nuevo Animal"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-4">

                  {/* Arete / Nombre / Raza */}
                  {!editAnimal && (
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-sm">Arete</Label>
                      <Input name="arete" className="col-span-3" required placeholder="Ej. A-1234" />
                    </div>
                  )}
                  {[['nombre','Nombre',''],['raza','Raza','Holstein']].map(([name,label,ph]) => (
                    <div key={name} className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-sm">{label}</Label>
                      <Input name={name} className="col-span-3" required placeholder={ph} defaultValue={editAnimal ? (editAnimal as any)[name] : ""} />
                    </div>
                  ))}

                  {/* Fecha de Nacimiento + Edad auto */}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">F. Nacimiento</Label>
                    <div className="col-span-3 flex gap-2 items-center">
                      <Input type="date" value={formFechaNac} onChange={e => setFormFechaNac(e.target.value)} className="flex-1" />
                      {formEdad && formEdad !== "—" && (
                        <span className="text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap" style={{background:'rgba(0,245,212,0.12)',color:'#00f5d4',border:'1px solid rgba(0,245,212,0.25)'}}>
                          Edad: {formEdad}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Registro SI / NO / N° */}
                  <div className="grid grid-cols-4 items-start gap-3">
                    <Label className="text-right text-sm pt-2">Registro</Label>
                    <div className="col-span-3 space-y-2">
                      <div className="flex gap-2">
                        {["SI","NO"].map(v => (
                          <button key={v} type="button"
                            onClick={() => setFormRegistro(v)}
                            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                            style={formRegistro === v
                              ? {background:'rgba(0,245,212,0.2)',color:'#00f5d4',border:'1px solid rgba(0,245,212,0.5)'}
                              : {background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.1)'}}>
                            {v}
                          </button>
                        ))}
                      </div>
                      {formRegistro === "SI" && (
                        <Input name="numeroRegistro" placeholder="N° de Registro oficial"
                          defaultValue={editAnimal?.numeroRegistro || ""}
                          className="w-full" />
                      )}
                    </div>
                  </div>

                  {/* Categoría / Estado / Lote */}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">Categoría</Label>
                    <div className="col-span-3">
                      <Select name="categoria" defaultValue={editAnimal?.categoria || "Vaca adulta"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{['Vaca adulta','Novilla','Ternero','Ternera','Toro'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">Estado</Label>
                    <div className="col-span-3">
                      <Select name="estado" defaultValue={editAnimal?.estado || "Producción"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{['Producción','Seca','Gestante','Abierta','Tratamiento','Destete','Lactancia','Activo'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">Lote</Label>
                    <div className="col-span-3">
                      <Select name="lote" defaultValue={editAnimal?.lote || "Lote A"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{['Lote A','Lote B','Lote C','Lote D','Lote E','Lote F'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Peso con botón báscula BT */}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">Peso (kg)</Label>
                    <div className="col-span-3 flex gap-2">
                      <Input
                        type="number" step="0.1"
                        value={formPeso}
                        onChange={e => setFormPeso(e.target.value)}
                        placeholder="0.0"
                        className="flex-1"
                        required
                      />
                      <Button type="button" onClick={handleBluetooth} disabled={btConnecting}
                        className="gap-1.5 px-3 text-xs flex-shrink-0"
                        style={{background:btConnecting?'rgba(0,200,255,0.2)':'rgba(0,200,255,0.1)',border:'1px solid rgba(0,200,255,0.4)',color:'#00c8ff'}}>
                        <Bluetooth size={13} className={btConnecting ? "animate-pulse" : ""} />
                        {btConnecting ? "Leyendo…" : "Báscula"}
                      </Button>
                    </div>
                  </div>

                  {/* Valor kilo + valor animal auto */}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">Valor/kg ($)</Label>
                    <div className="col-span-3 flex gap-2 items-center">
                      <Input
                        type="number" step="100"
                        value={formValorKilo}
                        onChange={e => setFormValorKilo(e.target.value)}
                        placeholder="0"
                        className="flex-1"
                      />
                      {formValorAnimal > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full whitespace-nowrap font-semibold" style={{background:'rgba(57,255,126,0.1)',color:'#39ff7e',border:'1px solid rgba(57,255,126,0.25)'}}>
                          {fmt(formValorAnimal)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* L/día y Partos */}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">L/día</Label>
                    <Input name="litrosDia" type="number" step="0.1" className="col-span-3" defaultValue={editAnimal?.litrosDia ?? 0} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">Partos</Label>
                    <Input name="partos" type="number" className="col-span-3" defaultValue={editAnimal?.partos ?? 0} />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button></DialogClose>
                  <Button type="submit" style={{background:'rgba(0,245,212,0.2)',border:'1px solid rgba(0,245,212,0.4)',color:'#00f5d4'}}>
                    {editAnimal ? "Actualizar" : "Guardar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:'TOTAL CABEZAS', val: String(animals.length), sub:'en sistema', c:'#00f5d4' },
          { label:'EN PRODUCCIÓN', val:String(animals.filter(a=>a.estado==='Producción').length), sub:'ordeño activo', c:'#00c8ff' },
          { label:'GESTANTES', val:String(animals.filter(a=>a.estado==='Gestante').length), sub:'confirmadas', c:'#bf00ff' },
          { label:'EN TRATAMIENTO', val:String(animals.filter(a=>a.estado==='Tratamiento').length), sub:'revisar hoy', c:'#ff006e' },
          { label:'LECHE/DÍA', val:`${totalLeche.toFixed(0)}L`, sub:'producción total', c:'#ff9500' },
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

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <Input placeholder="Buscar arete, nombre, raza..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-muted/30 border-border" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-36 bg-muted/30"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>{['Todos','Vaca adulta','Novilla','Ternero','Ternera','Toro'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="w-36 bg-muted/30"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>{['Todos','Producción','Seca','Gestante','Abierta','Tratamiento','Destete','Lactancia','Activo'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border" style={{background:'rgba(0,245,212,0.06)'}}>
              {['ARETE','NOMBRE','RAZA','CATEGORÍA','F.NAC / EDAD','REGISTRO','PESO','VALOR/KG','LOTE','ESTADO','ACC.'].map(h=>(
                <TableHead key={h} className="font-semibold text-[10px] uppercase py-3 whitespace-nowrap" style={{color:'rgba(0,245,212,0.75)'}}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(a => (
              <TableRow key={a.id} className="border-border hover:bg-muted/20 transition-colors">
                <TableCell className="font-mono text-xs text-green-400 font-semibold">{a.id}</TableCell>
                <TableCell className="font-semibold text-foreground">{a.nombre}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{a.raza}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCatBadge(a.categoria)}`}>{a.categoria}</span>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {a.fechaNacimiento ? (
                    <div>
                      <div className="text-xs text-white/60">{a.fechaNacimiento}</div>
                      <div className="text-[10px] font-bold" style={{color:'#00f5d4'}}>{calcEdad(a.fechaNacimiento)}</div>
                    </div>
                  ) : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  {a.registro === "SI" ? (
                    <div>
                      <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{background:'rgba(57,255,126,0.12)',color:'#39ff7e',border:'1px solid rgba(57,255,126,0.25)'}}>SI</span>
                      {a.numeroRegistro && <div className="text-[10px] text-white/40 mt-0.5">{a.numeroRegistro}</div>}
                    </div>
                  ) : (
                    <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.3)',border:'1px solid rgba(255,255,255,0.1)'}}>NO</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm font-semibold">{a.peso}kg</TableCell>
                <TableCell className="text-sm">
                  {(a.valorKilo || 0) > 0 ? (
                    <div>
                      <div className="text-xs text-white/50">{fmt(a.valorKilo || 0)}/kg</div>
                      <div className="text-[10px] font-bold" style={{color:'#39ff7e'}}>{fmt((a.peso || 0) * (a.valorKilo || 0))}</div>
                    </div>
                  ) : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getLoteBadge(a.lote)}`}>{a.lote}</span>
                </TableCell>
                <TableCell>
                  <span className={`text-sm font-medium ${getEstadoColor(a.estado)}`}>{a.estado}</span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <button className="text-muted-foreground hover:text-primary p-1" onClick={() => openEdit(a)}><Pencil size={13} /></button>
                    <button className="text-muted-foreground hover:text-destructive p-1" onClick={() => handleDelete(a.id)}><Trash2 size={13} /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
