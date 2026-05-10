import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "../lib/data";
import { Search, Plus, Download, Pencil, Trash2, LayoutGrid, LayoutList, Filter, Beef } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const getCatBadge = (cat: string) => {
  switch (cat) {
    case "Ternero": return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    case "Novilla": return "bg-teal-500/20 text-teal-400 border border-teal-500/30";
    case "Vaca adulta": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "Toro": return "bg-red-500/20 text-red-400 border border-red-500/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const getCatEmoji = (cat: string) => {
  switch (cat) {
    case "Vaca adulta": return "🐄";
    case "Novilla": return "🐮";
    case "Ternero": return "🐣";
    case "Toro": return "🐂";
    default: return "🐄";
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

const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case "Producción": return "bg-green-500/20 text-green-400 border border-green-500/30";
    case "Tratamiento": return "bg-red-500/20 text-red-400 border border-red-500/30";
    case "Destete": return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    case "Abierta": return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    case "Gestante": return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
    case "Seca": return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    case "Activo": return "bg-green-500/20 text-green-400 border border-green-500/30";
    default: return "bg-muted/20 text-muted-foreground border border-border";
  }
};

export default function Inventario() {
  const { animals, setAnimals } = useAppState();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todos");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [loteFilter, setLoteFilter] = useState("Todos");
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => animals.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.nombre.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.raza.toLowerCase().includes(q);
    const matchCat = catFilter === "Todos" || a.categoria === catFilter;
    const matchEstado = estadoFilter === "Todos" || a.estado === estadoFilter;
    const matchLote = loteFilter === "Todos" || a.lote === loteFilter;
    return matchSearch && matchCat && matchEstado && matchLote;
  }), [animals, search, catFilter, estadoFilter, loteFilter]);

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

  const handleDelete = (id: string) => setAnimals(animals.filter(a => a.id !== id));
  const handleBulkDelete = () => {
    setAnimals(animals.filter(a => !selectedIds.has(a.id)));
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    const s = new Set(selectedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedIds(s);
  };

  const totalLeche = animals.reduce((s, a) => s + (a.litrosDia || 0), 0);
  const enProduccion = animals.filter(a => a.estado === 'Producción').length;
  const gestantes = animals.filter(a => a.estado === 'Gestante').length;
  const enTratamiento = animals.filter(a => a.estado === 'Tratamiento').length;
  const pesoTotal = animals.reduce((s, a) => s + a.peso, 0);

  // Category breakdown
  const catBreakdown = ['Vaca adulta','Novilla','Ternero','Toro'].map(cat => ({
    cat,
    count: animals.filter(a => a.categoria === cat).length,
  }));

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#1a5c2e] to-[#2d8a4e] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">🐄</div>
          <div>
            <h1 className="text-xl font-bold text-white">Inventario Animal — {animals.length} cabezas</h1>
            <p className="text-white/70 text-sm">Registro RFID GES3S · Básculas Tru-Test · Hato completo · Offline</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-9 gap-1.5 text-sm">
            <Download size={14} /> CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 h-9 gap-1.5 text-sm">
                <Plus size={14} /> Agregar Animal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <form onSubmit={handleAdd}>
                <DialogHeader><DialogTitle>Registrar Nuevo Animal</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Arete / RFID</Label>
                      <Input name="arete" placeholder="Ej: A-1234" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Nombre</Label>
                      <Input name="nombre" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Raza</Label>
                      <Input name="raza" placeholder="Holstein" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Peso (kg)</Label>
                      <Input name="peso" type="number" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Categoría</Label>
                      <Select name="categoria" defaultValue="Vaca adulta">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{['Vaca adulta','Novilla','Ternero','Toro'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Estado</Label>
                      <Select name="estado" defaultValue="Producción">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{['Producción','Seca','Gestante','Abierta','Tratamiento','Destete','Activo'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label>Lote</Label>
                      <Select name="lote" defaultValue="Lote A">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{['Lote A','Lote B','Lote C','Lote D','Lote E'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>L/día</Label>
                      <Input name="litrosDia" type="number" step="0.1" defaultValue="0" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Partos</Label>
                      <Input name="partos" type="number" defaultValue="0" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                  <Button type="submit">Registrar Animal</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:'TOTAL CABEZAS', val: String(animals.length), sub:'en sistema', gradient:'linear-gradient(135deg,#1b5e20,#2e7d32)' },
          { label:'EN PRODUCCIÓN', val:String(enProduccion), sub:'ordeño activo', gradient:'linear-gradient(135deg,#0d47a1,#1565c0)' },
          { label:'GESTANTES', val:String(gestantes), sub:'confirmadas', gradient:'linear-gradient(135deg,#4a148c,#6a1b9a)' },
          { label:'EN TRATAMIENTO', val:String(enTratamiento), sub:'revisar hoy', gradient:'linear-gradient(135deg,#b71c1c,#c62828)' },
          { label:'LECHE/DÍA', val:`${totalLeche.toFixed(0)} L`, sub:`Prom. ${animals.filter(a=>a.litrosDia).length > 0 ? (totalLeche/animals.filter(a=>a.litrosDia).length).toFixed(1) : 0}L/vaca`, gradient:'linear-gradient(135deg,#e65100,#f57c00)' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white shadow" style={{background:k.gradient}}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">{k.label}</div>
            <div className="text-2xl font-bold">{k.val}</div>
            <div className="text-[10px] text-white/60">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Category distribution */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {catBreakdown.map(({ cat, count }) => (
          <div key={cat} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center text-xl flex-shrink-0">
              {getCatEmoji(cat)}
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{count}</div>
              <div className="text-xs text-muted-foreground">{cat}</div>
              <div className="text-[10px] text-muted-foreground">{animals.length > 0 ? Math.round(count/animals.length*100) : 0}% del hato</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filters + view toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <Input placeholder="Buscar arete, nombre, raza..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-muted/30 border-border" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-36 bg-muted/30"><SelectValue placeholder="Categoría" /></SelectTrigger>
            <SelectContent>{['Todos','Vaca adulta','Novilla','Ternero','Toro'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-36 bg-muted/30"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>{['Todos','Producción','Seca','Gestante','Abierta','Tratamiento','Destete','Activo'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={loteFilter} onValueChange={setLoteFilter}>
            <SelectTrigger className="w-28 bg-muted/30"><SelectValue placeholder="Lote" /></SelectTrigger>
            <SelectContent>{['Todos','Lote A','Lote B','Lote C','Lote D','Lote E'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('table')} className={`px-3 py-2 ${viewMode === 'table' ? 'bg-primary text-white' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}>
              <LayoutList size={15} />
            </button>
            <button onClick={() => setViewMode('cards')} className={`px-3 py-2 ${viewMode === 'cards' ? 'bg-primary text-white' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}>
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-xl">
          <span className="text-sm font-semibold text-foreground">{selectedIds.size} animal(es) seleccionado(s)</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-8 text-xs gap-1.5">
            <Trash2 size={12} /> Eliminar selección
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())} className="h-8 text-xs">
            Cancelar
          </Button>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-muted/10">
            <span className="text-xs text-muted-foreground">{filtered.length} de {animals.length} animales · Peso total: {pesoTotal.toLocaleString('es-CO')} kg</span>
            <Filter size={13} className="text-muted-foreground" />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#1a4a2e] hover:bg-[#1a4a2e] border-b border-[#2d6a3f]">
                  <TableHead className="w-8 py-3">
                    <input type="checkbox" className="rounded" onChange={e => {
                      if (e.target.checked) setSelectedIds(new Set(filtered.map(a => a.id)));
                      else setSelectedIds(new Set());
                    }} checked={selectedIds.size === filtered.length && filtered.length > 0} />
                  </TableHead>
                  {['ARETE','NOMBRE','RAZA','CATEGORÍA','PESO','LOTE','ESTADO','L/DÍA','PARTOS','ACC.'].map(h => (
                    <TableHead key={h} className="text-white/80 font-semibold text-[10px] uppercase py-3">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(a => (
                  <TableRow key={a.id} className={`border-border hover:bg-muted/20 transition-colors ${selectedIds.has(a.id) ? 'bg-primary/5' : ''}`}>
                    <TableCell>
                      <input type="checkbox" className="rounded" checked={selectedIds.has(a.id)} onChange={() => toggleSelect(a.id)} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-green-400 font-semibold">{a.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getCatEmoji(a.categoria)}</span>
                        <span className="font-semibold text-foreground">{a.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{a.raza}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCatBadge(a.categoria)}`}>{a.categoria}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-medium">{a.peso} kg</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getLoteBadge(a.lote)}`}>{a.lote}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getEstadoBadge(a.estado)}`}>{a.estado}</span>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {a.litrosDia ? <span className="text-cyan-400">{a.litrosDia} L</span> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">{a.partos}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <button className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-muted/30"><Pencil size={13} /></button>
                        <button className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-red-500/10" onClick={() => handleDelete(a.id)}><Trash2 size={13} /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(a => (
            <div key={a.id} className={`bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer ${selectedIds.has(a.id) ? 'border-primary shadow-primary/20 shadow-md' : 'border-border'}`}
              onClick={() => toggleSelect(a.id)}>
              <div className="bg-gradient-to-r from-[#1a5c2e]/60 to-[#2d8a4e]/40 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCatEmoji(a.categoria)}</span>
                  <div>
                    <div className="font-bold text-foreground text-sm">{a.nombre}</div>
                    <div className="font-mono text-[10px] text-green-400">{a.id}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getEstadoBadge(a.estado)}`}>{a.estado}</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Raza</span>
                  <span className="font-medium">{a.raza}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Peso</span>
                  <span className="font-bold text-foreground">{a.peso} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lote</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getLoteBadge(a.lote)}`}>{a.lote}</span>
                </div>
                {a.litrosDia > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Producción</span>
                    <span className="font-bold text-cyan-400">{a.litrosDia} L/día</span>
                  </div>
                )}
                {a.partos > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Partos</span>
                    <span className="font-medium">{a.partos}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getCatBadge(a.categoria)}`}>{a.categoria}</span>
                  <button onClick={e => { e.stopPropagation(); handleDelete(a.id); }} className="ml-auto text-muted-foreground hover:text-destructive p-1">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
          <Beef size={32} className="opacity-30" />
          <p className="text-sm">No se encontraron animales con los filtros actuales</p>
        </div>
      )}
    </div>
  );
}
