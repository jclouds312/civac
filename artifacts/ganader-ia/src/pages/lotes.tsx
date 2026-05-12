import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppState, MovimientoLote } from "../lib/data";
import { Plus, Trash2, FileText, TrendingDown, TrendingUp, ShoppingCart, Printer } from "lucide-react";

const TIPO_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; emoji: string }> = {
  ingreso:  { label:"Ingreso de Lote",  color:"#00f5d4", bg:"rgba(0,245,212,0.12)",  border:"rgba(0,245,212,0.35)",  emoji:"📥" },
  venta:    { label:"Venta de Lote",    color:"#39ff7e", bg:"rgba(57,255,126,0.12)", border:"rgba(57,255,126,0.35)", emoji:"📤" },
  compra:   { label:"Compra de Lote",   color:"#00c8ff", bg:"rgba(0,200,255,0.12)",  border:"rgba(0,200,255,0.35)",  emoji:"🛒" },
};

function fmt(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

function fmtNum(n: number, dec = 1) {
  return n.toFixed(dec);
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

interface ReciboProps {
  mov: MovimientoLote;
  onClose: () => void;
}

function Recibo({ mov, onClose }: ReciboProps) {
  const tipo = TIPO_CONFIG[mov.tipo];
  return (
    <div className="space-y-4">
      <div className="rounded-xl p-5 space-y-4" style={{background:'#020d09',border:'1px solid rgba(0,245,212,0.25)'}}>
        {/* Header recibo */}
        <div className="text-center space-y-1 border-b border-white/10 pb-3">
          <div className="text-2xl font-black" style={{fontFamily:'Sora,sans-serif',color:'#00f5d4'}}>CIVAC PRO</div>
          <div className="text-xs text-white/40">Ganadería Inteligente · Colombia</div>
          <div className="text-sm font-bold text-white mt-1">RECIBO DE {mov.tipo.toUpperCase()}</div>
          <div className="text-[10px] text-white/30">{mov.fecha} · ID #{mov.id}</div>
        </div>

        {/* Datos lote */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/50">Lote:</span>
            <span className="font-semibold text-white">{mov.nombreLote}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Tipo operación:</span>
            <span className="font-semibold" style={{color:tipo.color}}>{tipo.emoji} {tipo.label}</span>
          </div>
          {mov.proveedor && (
            <div className="flex justify-between">
              <span className="text-white/50">{mov.tipo === "venta" ? "Cliente/Destino:" : "Proveedor/Origen:"}</span>
              <span className="font-semibold text-white">{mov.proveedor || mov.destino}</span>
            </div>
          )}
          {mov.destino && mov.tipo === "venta" && (
            <div className="flex justify-between">
              <span className="text-white/50">Destino:</span>
              <span className="font-semibold text-white">{mov.destino}</span>
            </div>
          )}
        </div>

        {/* Tabla detalles */}
        <div className="rounded-lg overflow-hidden border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr style={{background:'rgba(0,245,212,0.06)'}}>
                <th className="text-left p-2 text-white/50 font-semibold">Concepto</th>
                <th className="text-right p-2 text-white/50 font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Cantidad animales", `${mov.cantidadAnimales} cabezas`],
                ["Peso total del lote", `${fmtNum(mov.pesoTotalLote)} kg`],
                ["Promedio peso/animal", `${fmtNum(mov.promedioPesoAnimal)} kg`],
                ["Costo por kilo", fmt(mov.costoKilo)],
              ].map(([k,v]) => (
                <tr key={k} className="border-t border-white/5">
                  <td className="p-2 text-white/60">{k}</td>
                  <td className="p-2 text-right text-white font-semibold">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="rounded-xl p-3 flex justify-between items-center" style={{background:tipo.bg,border:`1px solid ${tipo.border}`}}>
          <span className="font-bold text-white text-sm">VALOR TOTAL DEL LOTE</span>
          <span className="font-black text-xl" style={{color:tipo.color,fontFamily:'Sora,sans-serif'}}>{fmt(mov.valorTotalLote)}</span>
        </div>

        {/* Notas */}
        {mov.notas && (
          <div className="text-xs text-white/40 border-t border-white/5 pt-2">
            <span className="font-semibold text-white/60">Notas: </span>{mov.notas}
          </div>
        )}

        <div className="text-center text-[9px] text-white/20 border-t border-white/5 pt-2">
          Documento generado por CIVAC PRO — Sistema de Gestión Ganadera
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1 gap-2" onClick={() => window.print()}
          style={{background:'rgba(0,245,212,0.12)',border:'1px solid rgba(0,245,212,0.3)',color:'#00f5d4'}}>
          <Printer size={14} /> Imprimir
        </Button>
        <Button className="flex-1" variant="outline" onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
}

export default function Lotes() {
  const { lotes, setLotes } = useAppState();
  const [open, setOpen] = useState(false);
  const [tipoForm, setTipoForm] = useState<"ingreso"|"venta"|"compra">("ingreso");
  const [cantidad, setCantidad] = useState("");
  const [pesoTotal, setPesoTotal] = useState("");
  const [costoKilo, setCostoKilo] = useState("");
  const [reciboMov, setReciboMov] = useState<MovimientoLote | null>(null);
  const [filterTipo, setFilterTipo] = useState("todos");

  // Calculated fields
  const promedio = Number(cantidad) > 0 && Number(pesoTotal) > 0
    ? Number(pesoTotal) / Number(cantidad)
    : 0;
  const valorTotal = Number(costoKilo) > 0 && Number(pesoTotal) > 0
    ? Number(costoKilo) * Number(pesoTotal)
    : 0;

  const resetForm = () => {
    setCantidad(""); setPesoTotal(""); setCostoKilo(""); setTipoForm("ingreso");
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newMov: MovimientoLote = {
      id: Date.now(),
      tipo: tipoForm,
      nombreLote: fd.get("nombreLote") as string,
      cantidadAnimales: Number(cantidad),
      pesoTotalLote: Number(pesoTotal),
      promedioPesoAnimal: promedio,
      costoKilo: Number(costoKilo),
      valorTotalLote: valorTotal,
      fecha: (fd.get("fecha") as string) || getToday(),
      notas: fd.get("notas") as string || "",
      reciboGenerado: true,
      proveedor: fd.get("proveedor") as string || "",
      destino: fd.get("destino") as string || "",
    };
    const updated = [newMov, ...lotes];
    setLotes(updated);
    setOpen(false);
    resetForm();
    // Auto-show receipt
    setReciboMov(newMov);
  };

  const handleDelete = (id: number) => {
    setLotes(lotes.filter(l => l.id !== id));
  };

  const filtered = filterTipo === "todos" ? lotes : lotes.filter(l => l.tipo === filterTipo);

  // KPIs
  const totalIngresos = lotes.filter(l => l.tipo === "ingreso").reduce((s,l) => s + l.valorTotalLote, 0);
  const totalVentas   = lotes.filter(l => l.tipo === "venta").reduce((s,l) => s + l.valorTotalLote, 0);
  const totalCompras  = lotes.filter(l => l.tipo === "compra").reduce((s,l) => s + l.valorTotalLote, 0);
  const totalAnimales = lotes.filter(l => l.tipo === "ingreso" || l.tipo === "compra").reduce((s,l) => s + l.cantidadAnimales, 0);

  const tipo = TIPO_CONFIG[tipoForm];

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
        style={{background:'linear-gradient(135deg,#001a11 0%,#002e1a 100%)', border:'1px solid rgba(0,200,255,0.35)', boxShadow:'0 0 40px rgba(0,200,255,0.08)'}}>
        <div className="absolute right-0 top-0 w-48 h-full pointer-events-none opacity-10" style={{background:'radial-gradient(ellipse at right, #00c8ff, transparent 70%)'}} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{background:'rgba(0,200,255,0.1)', border:'1px solid rgba(0,200,255,0.4)', boxShadow:'0 0 16px rgba(0,200,255,0.2)'}}>🐂</div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{fontFamily:'Sora,sans-serif'}}>Movimiento de Lotes</h1>
            <p className="text-sm" style={{color:'rgba(0,200,255,0.7)'}}>Ingreso · Venta · Compra · Recibo automático</p>
          </div>
        </div>
        <Button onClick={() => { resetForm(); setOpen(true); }}
          className="h-9 gap-1.5 text-sm"
          style={{background:'rgba(0,200,255,0.15)', border:'1px solid rgba(0,200,255,0.4)', color:'#fff'}}>
          <Plus size={14} /> Nuevo Movimiento
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'INGRESOS',         val: fmt(totalIngresos),  sub:'valor total ingresos', c:'#00f5d4', icon:'📥' },
          { label:'VENTAS',           val: fmt(totalVentas),    sub:'valor total ventas',   c:'#39ff7e', icon:'📤' },
          { label:'COMPRAS',          val: fmt(totalCompras),   sub:'valor total compras',  c:'#00c8ff', icon:'🛒' },
          { label:'ANIMALES MOVIDOS', val: String(totalAnimales), sub:'entradas + compras', c:'#ff9500', icon:'🐄' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white relative overflow-hidden"
            style={{background:'linear-gradient(135deg,#020d09,#041208)', border:'1px solid rgba(0,245,212,0.15)'}}>
            <div className="absolute top-0 right-0 w-14 h-14 rounded-full pointer-events-none" style={{background:k.c, opacity:0.12, filter:'blur(18px)', transform:'translate(30%,-30%)'}} />
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1" style={{color:'rgba(0,245,212,0.55)'}}>
              <span>{k.icon}</span>{k.label}
            </div>
            <div className="text-xl font-bold truncate" style={{color:k.c, fontFamily:'Sora,sans-serif'}}>{k.val}</div>
            <div className="text-[10px]" style={{color:'rgba(255,255,255,0.4)'}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Filtros tipo */}
      <div className="flex gap-2 flex-wrap">
        {[["todos","Todos","#00f5d4"],["ingreso","Ingresos","#00f5d4"],["venta","Ventas","#39ff7e"],["compra","Compras","#00c8ff"]].map(([v,l,c]) => (
          <button key={v} onClick={() => setFilterTipo(v)}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={filterTipo === v
              ? {background:`rgba(${v==="todos"?"0,245,212":v==="ingreso"?"0,245,212":v==="venta"?"57,255,126":"0,200,255"},0.18)`,color:c,border:`1px solid ${c}50`}
              : {background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.08)'}}>
            {l}
          </button>
        ))}
      </div>

      {/* Tabla movimientos */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <div className="text-4xl mb-3">🐂</div>
            <div className="text-sm">Sin movimientos de lote registrados</div>
            <div className="text-xs mt-1 opacity-60">Crea un nuevo movimiento con el botón de arriba</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border" style={{background:'rgba(0,200,255,0.05)'}}>
                {['TIPO','LOTE','FECHA','CANT.','PESO TOTAL','PROM./ANIMAL','COSTO/KG','VALOR TOTAL','ACC.'].map(h=>(
                  <TableHead key={h} className="font-semibold text-[10px] uppercase py-3 whitespace-nowrap" style={{color:'rgba(0,200,255,0.75)'}}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(mov => {
                const t = TIPO_CONFIG[mov.tipo];
                return (
                  <TableRow key={mov.id} className="border-border hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <span className="text-xs px-2 py-1 rounded-full font-semibold"
                        style={{background:t.bg,color:t.color,border:`1px solid ${t.border}`}}>
                        {t.emoji} {t.label}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-white">{mov.nombreLote}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{mov.fecha}</TableCell>
                    <TableCell className="text-white font-bold">{mov.cantidadAnimales}</TableCell>
                    <TableCell className="text-white">{fmtNum(mov.pesoTotalLote)} kg</TableCell>
                    <TableCell className="text-muted-foreground">{fmtNum(mov.promedioPesoAnimal)} kg</TableCell>
                    <TableCell className="text-muted-foreground">{fmt(mov.costoKilo)}/kg</TableCell>
                    <TableCell className="font-bold text-sm" style={{color:t.color}}>{fmt(mov.valorTotalLote)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button className="p-1 rounded hover:bg-white/5 transition-colors" title="Ver recibo"
                          style={{color:'rgba(0,245,212,0.7)'}}
                          onClick={() => setReciboMov(mov)}>
                          <FileText size={13}/>
                        </button>
                        <button className="p-1 rounded hover:bg-white/5 transition-colors text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(mov.id)}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog nuevo movimiento */}
      <Dialog open={open} onOpenChange={v => { if (!v) resetForm(); setOpen(v); }}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>Nuevo Movimiento de Lote</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">

              {/* Tipo de movimiento */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Tipo de Movimiento</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ingreso","venta","compra"] as const).map(t => {
                    const cfg = TIPO_CONFIG[t];
                    return (
                      <button key={t} type="button" onClick={() => setTipoForm(t)}
                        className="p-3 rounded-xl text-center transition-all"
                        style={tipoForm === t
                          ? {background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color}
                          : {background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.4)'}}>
                        <div className="text-xl">{cfg.emoji}</div>
                        <div className="text-xs font-bold mt-1">{cfg.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nombre lote y fecha */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Nombre del Lote</Label>
                  <Input name="nombreLote" required placeholder="Ej. Lote Engorde A" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Fecha</Label>
                  <Input name="fecha" type="date" defaultValue={getToday()} />
                </div>
              </div>

              {/* Proveedor / destino */}
              <div className="space-y-1.5">
                <Label className="text-sm">{tipoForm === "venta" ? "Cliente / Destino" : "Proveedor / Origen"}</Label>
                <Input name="proveedor" placeholder={tipoForm === "venta" ? "Nombre comprador o destino" : "Finca o proveedor de origen"} />
              </div>
              {tipoForm === "venta" && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Destino Final</Label>
                  <Input name="destino" placeholder="Frigorífico, finca, etc." />
                </div>
              )}

              {/* Cantidad + peso total */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Cantidad de Animales</Label>
                  <Input type="number" min="1" required
                    value={cantidad} onChange={e => setCantidad(e.target.value)}
                    placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Peso Total del Lote (kg)</Label>
                  <Input type="number" step="0.1" min="0" required
                    value={pesoTotal} onChange={e => setPesoTotal(e.target.value)}
                    placeholder="0.0" />
                </div>
              </div>

              {/* Promedio automático */}
              {promedio > 0 && (
                <div className="rounded-lg p-3 flex items-center gap-3"
                  style={{background:'rgba(0,245,212,0.06)',border:'1px solid rgba(0,245,212,0.2)'}}>
                  <div className="text-lg">⚖️</div>
                  <div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">Promedio de Peso por Animal</div>
                    <div className="font-bold text-lg" style={{color:'#00f5d4',fontFamily:'Sora,sans-serif'}}>
                      {fmtNum(promedio)} kg/animal
                    </div>
                    <div className="text-[10px] text-white/30">= {pesoTotal} kg ÷ {cantidad} animales</div>
                  </div>
                </div>
              )}

              {/* Costo por kilo */}
              <div className="space-y-1.5">
                <Label className="text-sm">$ Costo por Kilo</Label>
                <Input type="number" step="100" min="0" required
                  value={costoKilo} onChange={e => setCostoKilo(e.target.value)}
                  placeholder="0" />
                <p className="text-[10px] text-white/30">Precio de referencia: $11,000/kg aprox.</p>
              </div>

              {/* Valor total automático */}
              {valorTotal > 0 && (
                <div className="rounded-xl p-4 space-y-1"
                  style={{background:tipo.bg, border:`1px solid ${tipo.border}`}}>
                  <div className="text-[10px] uppercase tracking-wider text-white/50">Valor Total del Lote</div>
                  <div className="font-black text-2xl" style={{color:tipo.color,fontFamily:'Sora,sans-serif'}}>
                    {fmt(valorTotal)}
                  </div>
                  <div className="text-[10px] text-white/30">
                    = {fmt(Number(costoKilo))}/kg × {fmtNum(Number(pesoTotal))} kg totales
                  </div>
                </div>
              )}

              {/* Notas */}
              <div className="space-y-1.5">
                <Label className="text-sm">Notas (opcional)</Label>
                <Input name="notas" placeholder="Observaciones del movimiento..." />
              </div>

            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              </DialogClose>
              <Button type="submit"
                style={{background:tipo.bg, border:`1px solid ${tipo.border}`, color:tipo.color}}>
                {tipo.emoji} Registrar y Generar Recibo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog recibo */}
      <Dialog open={!!reciboMov} onOpenChange={v => { if (!v) setReciboMov(null); }}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={16} style={{color:'#00f5d4'}} />
              Recibo de Movimiento
            </DialogTitle>
          </DialogHeader>
          {reciboMov && <Recibo mov={reciboMov} onClose={() => setReciboMov(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
