import { useAppState } from "../lib/data";
import { Download, Plus, Pencil, Trash2, AlertTriangle, Package, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CAT_STYLE: Record<string, { bg:string; text:string; border:string; emoji:string; g:string }> = {
  "Alimentacion":   { bg:'rgba(132,239,52,0.1)',  text:'#84ef34', border:'rgba(132,239,52,0.3)',  emoji:'🌾', g:'132,239,52'   },
  "Reproductivo":   { bg:'rgba(255,111,216,0.1)', text:'#ff6fd8', border:'rgba(255,111,216,0.3)', emoji:'🔁', g:'255,111,216'  },
  "Mineral":        { bg:'rgba(0,200,255,0.1)',   text:'#00c8ff', border:'rgba(0,200,255,0.3)',   emoji:'💎', g:'0,200,255'    },
  "Antibiotico":    { bg:'rgba(0,245,212,0.1)',   text:'#00f5d4', border:'rgba(0,245,212,0.3)',   emoji:'💉', g:'0,245,212'    },
  "Biologico":      { bg:'rgba(168,85,247,0.1)',  text:'#a855f7', border:'rgba(168,85,247,0.3)',  emoji:'🧬', g:'168,85,247'   },
  "Antiparasitario":{ bg:'rgba(251,191,36,0.1)',  text:'#fbbf24', border:'rgba(251,191,36,0.3)',  emoji:'🛡️', g:'251,191,36'   },
};
const getCat = (c: string) => CAT_STYLE[c] || { bg:'rgba(255,255,255,0.06)',text:'rgba(255,255,255,0.5)',border:'rgba(255,255,255,0.1)',emoji:'📦',g:'255,255,255' };

export default function Insumos() {
  const { insumos, setInsumos } = useAppState();
  const [open, setOpen] = useState(false);
  const [catFilter, setCatFilter] = useState("Todos");

  const criticos = insumos.filter(i=>i.stock<=i.minimo);
  const filtered = catFilter==="Todos" ? insumos : insumos.filter(i=>i.categoria===catFilter);

  const updateStock = (idx: number, delta: number) => {
    const arr = [...insumos];
    arr[idx] = { ...arr[idx], stock: Math.max(0, arr[idx].stock+delta) };
    setInsumos(arr);
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setInsumos([...insumos, {
      nombre:    fd.get('nombre') as string,
      categoria: fd.get('categoria') as string,
      stock:     Number(fd.get('stock')),
      maximo:    Number(fd.get('maximo')),
      minimo:    Number(fd.get('minimo')),
      unidad:    fd.get('unidad') as string,
    }]);
    setOpen(false);
  };

  const valorInventario = insumos.reduce((s,i)=>s+i.stock*15000, 0);

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 civac-animate">

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative overflow-hidden"
        style={{
          background:'linear-gradient(135deg,#1a0c00 0%,#2e1800 40%,#3a1e00 70%,#1a0c00 100%)',
          border:'1px solid rgba(255,154,60,0.32)',
          boxShadow:'0 0 40px rgba(255,154,60,0.1),inset 0 1px 0 rgba(255,154,60,0.1)',
        }}>
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle,rgba(255,154,60,0.18),transparent 65%)'}}/>
        <div className="absolute -left-8 -bottom-12 w-48 h-48 rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle,rgba(251,191,36,0.08),transparent 65%)'}}/>
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{background:'linear-gradient(90deg,transparent,#ff9a3c,#fbbf24,transparent)'}}/>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"
              style={{background:'rgba(255,154,60,0.12)',border:'1px solid rgba(255,154,60,0.38)',boxShadow:'0 0 20px rgba(255,154,60,0.3)'}}>
              💊
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-white" style={{fontFamily:"'Sora',sans-serif"}}>
                  Insumos y Kardex
                </h1>
                {criticos.length > 0 && (
                  <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse"
                    style={{background:'rgba(255,77,109,0.2)',color:'#ff4d6d',border:'1px solid rgba(255,77,109,0.4)'}}>
                    ⚠ {criticos.length} bajo mínimo
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm" style={{color:'rgba(255,180,100,0.8)'}}>
                Control de stock · Medicamentos · Vacunas · Alertas reposición
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-9 gap-1.5 text-xs sm:text-sm"
              style={{background:'rgba(255,154,60,0.08)',border:'1px solid rgba(255,154,60,0.3)',color:'#ff9a3c'}}>
              <Download size={13}/> CSV
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-1.5 text-xs sm:text-sm"
                  style={{background:'rgba(255,154,60,0.15)',border:'1px solid rgba(255,154,60,0.4)',color:'white'}}>
                  <Plus size={13}/> Insumo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAdd}>
                  <DialogHeader><DialogTitle>Nuevo Insumo</DialogTitle></DialogHeader>
                  <div className="grid gap-3 py-4">
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-xs">Nombre</Label>
                      <Input name="nombre" className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-xs">Categoría</Label>
                      <div className="col-span-3">
                        <Select name="categoria" defaultValue="Reproductivo">
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>
                            {['Alimentacion','Reproductivo','Mineral','Antibiotico','Biologico','Antiparasitario'].map(v=>(
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {[['stock','Stock actual','0'],['maximo','Stock máximo','30'],['minimo','Stock mínimo','10']].map(([n,l,d])=>(
                      <div key={n} className="grid grid-cols-4 items-center gap-3">
                        <Label className="text-right text-xs">{l}</Label>
                        <Input name={n} type="number" className="col-span-3" defaultValue={d} required/>
                      </div>
                    ))}
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-xs">Unidad</Label>
                      <Input name="unidad" className="col-span-3" defaultValue="frascos"/>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline" size="sm">Cancelar</Button></DialogClose>
                    <Button type="submit" size="sm">Guardar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          { label:'Bajo stock mínimo', val:String(criticos.length),          sub:'reposición urgente', c:'#ff4d6d', g:'255,77,109',  icon:<AlertTriangle size={14}/> },
          { label:'Productos total',   val:String(insumos.length),           sub:'registrados',        c:'#39ff7e', g:'57,255,126',  icon:<Package size={14}/> },
          { label:'Valor inventario',  val:`$${(valorInventario/1e6).toFixed(1)}M`, sub:'COP estimado', c:'#a855f7', g:'168,85,247', icon:<TrendingDown size={14}/> },
          { label:'Categorías',        val:'6',                              sub:'tipos activos',      c:'#ff9a3c', g:'255,154,60',  icon:<Package size={14}/> },
        ].map(k=>(
          <div key={k.label} className="rounded-2xl p-3 sm:p-4 relative overflow-hidden transition-all hover:scale-[1.03]"
            style={{background:`linear-gradient(145deg,rgba(${k.g},0.12),rgba(${k.g},0.05),rgba(0,0,0,0.3))`,border:`1px solid rgba(${k.g},0.25)`,borderRadius:18}}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-15 pointer-events-none"
              style={{background:`radial-gradient(circle,rgba(${k.g},1),transparent)`,transform:'translate(40%,-40%)'}}/>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider" style={{color:`rgba(${k.g},0.7)`}}>{k.label}</div>
              <div style={{color:`rgba(${k.g},0.5)`}}>{k.icon}</div>
            </div>
            <div className="text-2xl sm:text-3xl font-black leading-none mb-1" style={{color:`rgba(${k.g},1)`,fontFamily:"'Sora',sans-serif"}}>{k.val}</div>
            <div className="text-[9px] sm:text-[10px] text-white/40">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── ALERT BANNER ─────────────────────────────────────────────────── */}
      {criticos.length > 0 && (
        <div className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex items-start gap-3"
          style={{background:'rgba(255,77,109,0.08)',border:'1px solid rgba(255,77,109,0.25)',borderRadius:18}}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{background:'rgba(255,77,109,0.15)',border:'1px solid rgba(255,77,109,0.3)'}}>
            <AlertTriangle size={16} className="text-rose-400"/>
          </div>
          <div className="flex-1">
            <div className="text-xs sm:text-sm font-black mb-2" style={{color:'#ff4d6d'}}>
              {criticos.length} producto(s) bajo stock mínimo — Reponer urgente
            </div>
            <div className="flex flex-wrap gap-1.5">
              {criticos.map(c=>(
                <span key={c.nombre} className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{background:'rgba(255,154,60,0.12)',color:'#ff9a3c',border:'1px solid rgba(255,154,60,0.25)'}}>
                  {c.nombre}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INVENTARIO ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl overflow-hidden"
        style={{border:'1px solid rgba(255,154,60,0.15)',borderRadius:20}}>
        <div className="px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between"
          style={{background:'linear-gradient(135deg,#1a0c00,#2e1800)',borderBottom:'1px solid rgba(255,154,60,0.18)'}}>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📦</span>
            <div>
              <div className="font-black text-sm sm:text-base text-white">Inventario de Insumos</div>
              <div className="text-[10px] sm:text-xs text-white/50">{insumos.length} productos registrados</div>
            </div>
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-32 sm:w-40 text-[10px] sm:text-xs h-8 border-white/15 text-white/70"
              style={{background:'rgba(255,255,255,0.06)'}}>
              <SelectValue/>
            </SelectTrigger>
            <SelectContent>
              {['Todos','Alimentacion','Reproductivo','Mineral','Antibiotico','Biologico','Antiparasitario'].map(v=>(
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {filtered.map((ins)=>{
            const pct = Math.round((ins.stock/ins.maximo)*100);
            const isLow = ins.stock<=ins.minimo;
            const realIdx = insumos.indexOf(ins);
            const cat = getCat(ins.categoria);
            const barColor = isLow?'#ff4d6d':'#39ff7e';
            const barGlow  = isLow?'255,77,109':'57,255,126';
            return (
              <div key={ins.nombre} className="flex items-center gap-2.5 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 transition-colors hover:bg-white/[0.02]"
                style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                {/* Category badge */}
                <span className="text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0"
                  style={{background:cat.bg,color:cat.text,border:`1px solid ${cat.border}`,minWidth:90,justifyContent:'center'}}>
                  {cat.emoji} {ins.categoria}
                </span>

                {/* Name */}
                <span className="flex-1 font-black text-xs sm:text-sm text-white min-w-0 truncate">{ins.nombre}</span>

                {/* Progress bar */}
                <div className="w-24 sm:w-32 hidden sm:block flex-shrink-0">
                  <div className="flex justify-between text-[9px] mb-1" style={{color:'rgba(255,255,255,0.35)'}}>
                    <span>{pct}%</span><span>del máx</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{background:'rgba(255,255,255,0.06)'}}>
                    <div className="h-full rounded-full transition-all"
                      style={{width:`${pct}%`,background:`linear-gradient(90deg,${barColor},${barColor}88)`,boxShadow:`0 0 5px rgba(${barGlow},0.5)`}}/>
                  </div>
                </div>

                {/* +/- Controls */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={()=>updateStock(realIdx,-1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-white font-black text-base transition-all hover:scale-110"
                    style={{background:'rgba(255,77,109,0.12)',border:'1px solid rgba(255,77,109,0.25)',color:'#ff4d6d'}}>
                    −
                  </button>
                  <span className="text-[10px] sm:text-xs font-black text-white w-20 sm:w-28 text-center">
                    {ins.stock}/{ins.maximo} {ins.unidad}
                  </span>
                  <button onClick={()=>updateStock(realIdx,1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-white font-black text-base transition-all hover:scale-110"
                    style={{background:'rgba(57,255,126,0.12)',border:'1px solid rgba(57,255,126,0.25)',color:'#39ff7e'}}>
                    +
                  </button>
                </div>

                {/* Status */}
                <span className="text-[9px] sm:text-[10px] font-black px-2 py-1 rounded-full flex-shrink-0"
                  style={isLow
                    ?{background:'rgba(255,77,109,0.12)',color:'#ff4d6d',border:'1px solid rgba(255,77,109,0.3)'}
                    :{background:'rgba(57,255,126,0.08)',color:'#39ff7e',border:'1px solid rgba(57,255,126,0.2)'}}>
                  {isLow?'⚠ Pedir':'✓ OK'}
                </span>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{color:'rgba(255,255,255,0.3)'}}>
                    <Pencil size={12}/>
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{color:'rgba(255,255,255,0.3)'}}
                    onClick={()=>setInsumos(insumos.filter((_,i)=>i!==realIdx))}>
                    <Trash2 size={12}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
