import { useAppState } from "../lib/data";
import { Download, Plus, Pencil, Trash2, AlertTriangle, Package, ShoppingCart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const ordenes = [
  { id:'OC-001', producto:'Prostaglandina PGF2α', cantidad:20, unidad:'frascos', proveedor:'Vetoquinol Colombia', precio:85000, total:1700000, fecha:'02/05/2025', estado:'Pendiente' },
  { id:'OC-002', producto:'Vacuna IBR/BVD', cantidad:300, unidad:'dosis', proveedor:'Biogénesis Bagó', precio:4200, total:1260000, fecha:'05/05/2025', estado:'En tránsito' },
  { id:'OC-003', producto:'Calcio i.v.', cantidad:15, unidad:'frascos', proveedor:'Distribuidora Agro', precio:18000, total:270000, fecha:'28/04/2025', estado:'Recibido' },
  { id:'OC-004', producto:'Oxitocina 10UI', cantidad:20, unidad:'frascos', proveedor:'Laboquimia', precio:12000, total:240000, fecha:'25/04/2025', estado:'Recibido' },
];

const movimientos = [
  { fecha:'29/04/2025', producto:'Ivermectina 1%', tipo:'Salida', cantidad:-2, responsable:'Carlos Meza', motivo:'Desparasitación lote B' },
  { fecha:'28/04/2025', producto:'Antibiotico L.A.', tipo:'Salida', cantidad:-1, responsable:'Dr. Ramírez', motivo:'Tratamiento Perla' },
  { fecha:'27/04/2025', producto:'Concentrado 16%', tipo:'Entrada', cantidad:200, responsable:'Carlos Meza', motivo:'Compra semanal' },
  { fecha:'26/04/2025', producto:'Oxitocina 10UI', tipo:'Entrada', cantidad:20, responsable:'Pedro Villa', motivo:'Recepción OC-004' },
  { fecha:'25/04/2025', producto:'Prostaglandina', tipo:'Salida', cantidad:-3, responsable:'Pedro Villa', motivo:'Protocolo IATF 5 vacas' },
  { fecha:'24/04/2025', producto:'Sal mineralizada', tipo:'Salida', cantidad:-20, responsable:'Luis Patiño', motivo:'Suministro semanal lotes' },
];

export default function Insumos() {
  const { insumos, setInsumos } = useAppState();
  const [open, setOpen] = useState(false);
  const [catFilter, setCatFilter] = useState("Todos");
  const [activeTab, setActiveTab] = useState("inventario");

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
  const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#7c3d10] to-[#e65100] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">💊</div>
          <div>
            <h1 className="text-xl font-bold text-white">Insumos, Kardex y Proveedores</h1>
            <p className="text-white/70 text-sm">Stock · Medicamentos · Vacunas · Órdenes de compra · Movimientos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-9 gap-1.5 text-sm">
            <Download size={14} /> CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 h-9 gap-1.5 text-sm">
                <Plus size={14} /> Insumo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <form onSubmit={handleAdd}>
                <DialogHeader><DialogTitle>Registrar Nuevo Insumo</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Nombre</Label><Input name="nombre" required /></div>
                    <div className="space-y-1.5">
                      <Label>Categoría</Label>
                      <Select name="categoria" defaultValue="Reproductivo">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{['Alimentacion','Reproductivo','Mineral','Antibiotico','Biologico','Antiparasitario'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5"><Label>Stock actual</Label><Input name="stock" type="number" defaultValue="0" required /></div>
                    <div className="space-y-1.5"><Label>Stock máximo</Label><Input name="maximo" type="number" defaultValue="30" required /></div>
                    <div className="space-y-1.5"><Label>Stock mínimo</Label><Input name="minimo" type="number" defaultValue="10" required /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Unidad</Label><Input name="unidad" defaultValue="frascos" /></div>
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
          { label:'BAJO MÍNIMO', val:String(criticos.length), sub:'a reponer urgente', gradient:'linear-gradient(135deg,#b71c1c,#c62828)' },
          { label:'PRODUCTOS', val:String(insumos.length), sub:'registrados en sistema', gradient:'linear-gradient(135deg,#1b5e20,#2e7d32)' },
          { label:'VALOR INVENTARIO', val:`$${(valorInventario/1000000).toFixed(1)}M`, sub:'COP estimado', gradient:'linear-gradient(135deg,#4a148c,#6a1b9a)' },
          { label:'ÓRDENES ACTIVAS', val:String(ordenes.filter(o=>o.estado!=='Recibido').length), sub:'pendientes/tránsito', gradient:'linear-gradient(135deg,#00695c,#00897b)' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white shadow" style={{background:k.gradient}}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">{k.label}</div>
            <div className="text-2xl font-bold">{k.val}</div>
            <div className="text-[10px] text-white/60">{k.sub}</div>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="inventario" className="gap-1.5 text-xs"><Package size={13} /> Inventario</TabsTrigger>
          <TabsTrigger value="ordenes" className="gap-1.5 text-xs"><ShoppingCart size={13} /> Órdenes de Compra</TabsTrigger>
          <TabsTrigger value="movimientos" className="gap-1.5 text-xs"><Clock size={13} /> Movimientos Kardex</TabsTrigger>
        </TabsList>

        {/* Inventario */}
        <TabsContent value="inventario">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <div className="bg-gradient-to-r from-[#7c3d10] to-[#e65100] px-5 py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white text-sm">📦 Inventario de Insumos</div>
                <div className="text-white/60 text-xs">{insumos.length} productos registrados</div>
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
                  <div key={ins.nombre} className="flex items-center gap-3 px-5 py-4 hover:bg-muted/20 transition-colors">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full min-w-[100px] text-center ${getCatStyle(ins.categoria)}`}>
                      {ins.categoria}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">{ins.nombre}</div>
                      <div className="text-[10px] text-muted-foreground">Mín: {ins.minimo} · Máx: {ins.maximo} {ins.unidad}</div>
                    </div>
                    <div className="w-28 hidden sm:block">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>{pct}%</span>
                        <span>{ins.stock}/{ins.maximo}</span>
                      </div>
                      <div className="h-1.5 bg-muted/30 rounded-full">
                        <div className="h-1.5 rounded-full transition-all" style={{width:`${Math.min(pct,100)}%`, background: isLow ? '#ef4444' : pct < 50 ? '#f59e0b' : '#22c55e'}} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateStock(realIdx, -1)} className="w-7 h-7 rounded border border-border bg-muted/30 hover:bg-muted flex items-center justify-center text-foreground font-bold text-sm">−</button>
                      <span className="text-sm font-mono w-24 text-center text-foreground">{ins.stock} {ins.unidad}</span>
                      <button onClick={() => updateStock(realIdx, 1)} className="w-7 h-7 rounded border border-border bg-muted/30 hover:bg-muted flex items-center justify-center text-foreground font-bold text-sm">+</button>
                    </div>
                    <span className={`text-xs font-semibold border rounded-md px-2 py-0.5 min-w-[60px] text-center ${isLow ? 'text-red-400 border-red-400/40 bg-red-400/5' : 'text-green-400 border-green-400/40 bg-green-400/5'}`}>
                      {isLow ? '⚠ Pedir' : '✓ OK'}
                    </span>
                    <div className="flex gap-1">
                      <button className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-muted/30"><Pencil size={13} /></button>
                      <button className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-red-500/10" onClick={() => setInsumos(insumos.filter((_,i)=>i!==realIdx))}><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Órdenes de compra */}
        <TabsContent value="ordenes">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">🛒 Órdenes de Compra</div>
                <div className="text-xs text-muted-foreground">{ordenes.length} órdenes registradas</div>
              </div>
              <Button size="sm" className="h-8 text-xs gap-1"><Plus size={12} /> Nueva Orden</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    {['OC #','PRODUCTO','CANTIDAD','PROVEEDOR','VALOR UNIT.','TOTAL','FECHA','ESTADO'].map(h => (
                      <th key={h} className="text-muted-foreground font-semibold text-[10px] uppercase px-4 py-2.5 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map(o => (
                    <tr key={o.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs text-primary font-bold">{o.id}</td>
                      <td className="px-4 py-3 font-medium text-sm">{o.producto}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{o.cantidad} {o.unidad}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{o.proveedor}</td>
                      <td className="px-4 py-3 text-sm">{fmt(o.precio)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-foreground">{fmt(o.total)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{o.fecha}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                          o.estado === 'Recibido' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          o.estado === 'En tránsito' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>{o.estado}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/20 border-t border-border">
                    <td className="px-4 py-3 font-bold text-sm text-foreground" colSpan={5}>TOTAL ÓRDENES</td>
                    <td className="px-4 py-3 font-bold text-green-400">{fmt(ordenes.reduce((s,o)=>s+o.total,0))}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Movimientos Kardex */}
        <TabsContent value="movimientos">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <div className="px-5 py-3 border-b border-border">
              <div className="font-semibold text-sm">📋 Movimientos Kardex — Historial</div>
              <div className="text-xs text-muted-foreground">Entradas y salidas de inventario registradas</div>
            </div>
            <div className="divide-y divide-border">
              {movimientos.map((m, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.tipo === 'Entrada' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    <span className="text-lg font-bold leading-none">{m.tipo === 'Entrada' ? '+' : '−'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">{m.producto}</div>
                    <div className="text-xs text-muted-foreground truncate">{m.motivo} · {m.responsable}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`font-bold text-sm ${m.tipo === 'Entrada' ? 'text-green-400' : 'text-red-400'}`}>
                      {m.tipo === 'Entrada' ? '+' : ''}{m.cantidad}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{m.fecha}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${m.tipo === 'Entrada' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    {m.tipo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
