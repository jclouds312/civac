import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "../lib/data";
import { Search, Plus, Download, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const getCatBadge = (cat: string) => {
  switch (cat) {
    case "Ternero": return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
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

export default function Inventario() {
  const { animals, setAnimals } = useAppState();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todos");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [open, setOpen] = useState(false);

  const filtered = animals.filter(a => {
    const matchSearch = a.nombre.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()) || a.raza.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Todos" || a.categoria === catFilter;
    const matchEstado = estadoFilter === "Todos" || a.estado === estadoFilter;
    return matchSearch && matchCat && matchEstado;
  });

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setAnimals([{
      id: fd.get('arete') as string,
      nombre: fd.get('nombre') as string,
      raza: fd.get('raza') as string,
      categoria: fd.get('categoria') as string,
      peso: Number(fd.get('peso')),
      lote: fd.get('lote') as string,
      estado: fd.get('estado') as string,
      litrosDia: Number(fd.get('litrosDia') || 0),
      partos: Number(fd.get('partos') || 0),
    }, ...animals]);
    setOpen(false);
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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-9 gap-1.5 text-sm" style={{background:'rgba(0,245,212,0.15)', border:'1px solid rgba(0,245,212,0.4)', color:'#fff'}}>
                <Plus size={14} /> Agregar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAdd}>
                <DialogHeader><DialogTitle>Agregar Nuevo Animal</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  {[['arete','Arete','Ej. A-1234'],['nombre','Nombre',''],['raza','Raza','Holstein']].map(([name,label,ph]) => (
                    <div key={name} className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-sm">{label}</Label>
                      <Input name={name} className="col-span-3" required placeholder={ph} />
                    </div>
                  ))}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">Categoría</Label>
                    <div className="col-span-3"><Select name="categoria" defaultValue="Vaca adulta"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Vaca adulta','Novilla','Ternero','Toro'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">Peso (kg)</Label>
                    <Input name="peso" type="number" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">Estado</Label>
                    <div className="col-span-3"><Select name="estado" defaultValue="Producción"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Producción','Seca','Gestante','Abierta','Tratamiento','Destete','Activo'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">Lote</Label>
                    <div className="col-span-3"><Select name="lote" defaultValue="Lote A"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Lote A','Lote B','Lote C','Lote D','Lote E'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">L/día</Label>
                    <Input name="litrosDia" type="number" step="0.1" className="col-span-3" defaultValue="0" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">Partos</Label>
                    <Input name="partos" type="number" className="col-span-3" defaultValue="0" />
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
          <SelectContent>{['Todos','Vaca adulta','Novilla','Ternero','Toro'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="w-36 bg-muted/30"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>{['Todos','Producción','Seca','Gestante','Abierta','Tratamiento','Destete','Activo'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border" style={{background:'rgba(0,245,212,0.06)'}}>
              {['ARETE','NOMBRE','RAZA','CATEGORÍA','PESO','LOTE','ESTADO','L/DÍA','PARTOS','ACC.'].map(h=>(
                <TableHead key={h} className="font-semibold text-[10px] uppercase py-3" style={{color:'rgba(0,245,212,0.75)'}}>{h}</TableHead>
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
                <TableCell className="text-muted-foreground text-sm">{a.peso}kg</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getLoteBadge(a.lote)}`}>{a.lote}</span>
                </TableCell>
                <TableCell>
                  <span className={`text-sm font-medium ${getEstadoColor(a.estado)}`}>{a.estado}</span>
                </TableCell>
                <TableCell className="text-right font-bold">
                  {a.litrosDia ? <span className="text-cyan-400">{a.litrosDia}L</span> : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-sm">{a.partos}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <button className="text-muted-foreground hover:text-primary p-1"><Pencil size={13} /></button>
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
