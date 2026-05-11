import { useAppState } from "../lib/data";
import { Download, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const getCatStyle = (cat: string) => {
  switch (cat) {
    case "Alimentacion": return "bg-lime-500/20 text-lime-400 border border-lime-500/30";
    case "Reproductivo": return "bg-pink-500/20 text-pink-400 border border-pink-500/30";
    case "Mineral": return "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";
    case "Antibiotico": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "Biologico": return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
    case "Antiparasitario": return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function Insumos() {
  const { insumos, setInsumos } = useAppState();
  const [open, setOpen] = useState(false);
  const [catFilter, setCatFilter] = useState("Todos");

  const criticos = insumos.filter(i => i.stock <= i.minimo);
  const filtered = catFilter === "Todos" ? insumos : insumos.filter(i => i.categoria === catFilter);

  const updateStock = (idx: number, delta: number) => {
    const arr = [...insumos];
    arr[idx] = { ...arr[idx], stock: Math.max(0, arr[idx].stock + delta) };
    setInsumos(arr);
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setInsumos([...insumos, {
      nombre: fd.get('nombre') as string,
      categoria: fd.get('categoria') as string,
      stock: Number(fd.get('stock')),
      maximo: Number(fd.get('maximo')),
      minimo: Number(fd.get('minimo')),
      unidad: fd.get('unidad') as string,
    }]);
    setOpen(false);
  };

  const valorInventario = insumos.reduce((s, i) => s + i.stock * 15000, 0);

  return (
    <div className="space-y-5 pb-8">
      {/* CIVAC Banner */}
      <div className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden civac-animate"
        style={{background:'linear-gradient(135deg,#1a0f00 0%,#2e1200 100%)', border:'1px solid rgba(255,149,0,0.4)', boxShadow:'0 0 40px rgba(255,149,0,0.12), inset 0 1px 0 rgba(255,149,0,0.08)'}}>
        <div className="absolute right-0 top-0 w-48 h-full pointer-events-none opacity-10" style={{background:'radial-gradient(ellipse at right, #ff9500, transparent 70%)'}} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{background:'rgba(255,149,0,0.1)', border:'1px solid rgba(255,149,0,0.4)', boxShadow:'0 0 16px rgba(255,149,0,0.2)'}}>💊</div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{fontFamily:'Sora,sans-serif'}}>Insumos y Kardex</h1>
            <p className="text-sm" style={{color:'rgba(255,180,80,0.8)'}}>Control de stock · Medicamentos · Vacunas · Alertas de reposición</p>
          </div>
        </div>
        <div className="relative flex gap-2">
          <Button variant="outline" className="h-9 gap-1.5 text-sm" style={{background:'rgba(255,149,0,0.08)', border:'1px solid rgba(255,149,0,0.3)', color:'#ff9500'}}>
            <Download size={14} /> CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-9 gap-1.5 text-sm" style={{background:'rgba(255,149,0,0.15)', border:'1px solid rgba(255,149,0,0.4)', color:'#fff'}}>
                <Plus size={14} /> Insumo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAdd}>
                <DialogHeader><DialogTitle>Nuevo Insumo</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right">Nombre</Label>
                    <Input name="nombre" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right">Categoría</Label>
                    <div className="col-span-3"><Select name="categoria" defaultValue="Reproductivo"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Alimentacion','Reproductivo','Mineral','Antibiotico','Biologico','Antiparasitario'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  {[['stock','Stock actual','0'],['maximo','Stock máximo','30'],['minimo','Stock mínimo','10']].map(([n,l,d]) => (
                    <div key={n} className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right">{l}</Label>
                      <Input name={n} type="number" className="col-span-3" defaultValue={d} required />
                    </div>
                  ))}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right">Unidad</Label>
                    <Input name="unidad" className="col-span-3" defaultValue="frascos" />
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
          { label:'STOCK MÍNIMO', val:String(criticos.length), sub:'a reponer urgente', c:'#ff006e' },
          { label:'PRODUCTOS', val:String(insumos.length), sub:'registrados', c:'#39ff7e' },
          { label:'VALOR INVENTARIO', val:`$${(valorInventario/1000000).toFixed(1)}M`, sub:'COP estimado', c:'#bf00ff' },
          { label:'CATEGORÍAS', val:'6', sub:'tipos activos', c:'#ff9500' },
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

      {/* Alert banner */}
      {criticos.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-semibold text-red-400">{criticos.length} producto(s) bajo stock mínimo — Reponer urgente</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {criticos.map(c => (
                <span key={c.nombre} className="bg-orange-500/20 text-orange-300 text-xs font-medium px-2.5 py-1 rounded-full border border-orange-500/30">{c.nombre}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inventario */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between" style={{background:'linear-gradient(135deg,#1a0f00,#2e1200)', borderBottom:'1px solid rgba(255,149,0,0.2)'}}>
          <div className="flex items-center gap-2">
            <span className="text-base">📦</span>
            <div>
              <div className="font-semibold text-white text-sm">Inventario de Insumos</div>
              <div className="text-white/60 text-xs">{insumos.length} productos registrados</div>
            </div>
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['Todos','Alimentacion','Reproductivo','Mineral','Antibiotico','Biologico','Antiparasitario'].map(v => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((ins, idx) => {
            const pct = Math.round((ins.stock / ins.maximo) * 100);
            const isLow = ins.stock <= ins.minimo;
            const realIdx = insumos.indexOf(ins);
            return (
              <div key={ins.nombre} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full min-w-[100px] text-center ${getCatStyle(ins.categoria)}`}>
                  {ins.categoria}
                </span>
                <span className="flex-1 font-medium text-sm text-foreground">{ins.nombre}</span>
                <div className="w-28 hidden sm:block">
                  <div className="text-[10px] text-muted-foreground mb-1">{pct}% del máx</div>
                  <div className="h-1.5 bg-muted/30 rounded-full">
                    <div className="h-1.5 rounded-full transition-all" style={{width:`${pct}%`, background: isLow ? '#ef4444' : '#22c55e'}} />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateStock(realIdx, -1)} className="w-7 h-7 rounded border border-border bg-muted/30 hover:bg-muted flex items-center justify-center text-foreground font-bold text-sm">−</button>
                  <span className="text-sm font-mono w-28 text-center text-foreground">{ins.stock}/{ins.maximo} {ins.unidad}</span>
                  <button onClick={() => updateStock(realIdx, 1)} className="w-7 h-7 rounded border border-border bg-muted/30 hover:bg-muted flex items-center justify-center text-foreground font-bold text-sm">+</button>
                </div>
                <span className={`text-xs font-semibold border rounded-md px-2 py-0.5 min-w-[60px] text-center ${isLow ? 'text-red-400 border-red-400/40 bg-red-400/5' : 'text-green-400 border-green-400/40 bg-green-400/5'}`}>
                  {isLow ? '⚠ Pedir' : '✓ OK'}
                </span>
                <div className="flex gap-1 ml-1">
                  <button className="text-muted-foreground hover:text-primary p-1"><Pencil size={13} /></button>
                  <button className="text-muted-foreground hover:text-destructive p-1" onClick={() => setInsumos(insumos.filter((_,i)=>i!==realIdx))}><Trash2 size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
