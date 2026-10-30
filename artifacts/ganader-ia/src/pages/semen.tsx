import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Download, Pencil, Trash2, Snowflake, Printer } from "lucide-react";
import { printModule } from "@/lib/print";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useAppState } from "../lib/data";
import { exportModuleCSV } from "../lib/export";

export default function Semen() {
  const { semen, setSemen, embriones } = useAppState();
  const [open, setOpen] = useState(false);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSemen(prev => [...prev, {
      id: `S-${String(prev.length + 1).padStart(3, '0')}`,
      toro: fd.get('toro') as string,
      raza: fd.get('raza') as string,
      dep: fd.get('dep') as string,
      canecas: 1,
      pajillas: Number(fd.get('pajillas')),
      origen: fd.get('origen') as string,
      tipo: fd.get('tipo') as string,
      cria: new Date().getFullYear(),
    }]);
    setOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  const handleDelete = (id: string) => setSemen(prev => prev.filter(x => x.id !== id));

  const handleExportCSV = () => {
    exportModuleCSV(semen as unknown as Record<string, unknown>[], 'semen');
  };

  return (
    <div className="space-y-5 pb-8">
      {/* CIVAC Banner */}
      <div className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden civac-animate"
        style={{background:'linear-gradient(135deg,#00101a 0%,#001a2e 100%)', border:'1px solid rgba(0,200,255,0.35)', boxShadow:'0 0 40px rgba(0,200,255,0.1), inset 0 1px 0 rgba(0,200,255,0.08)'}}>
        <div className="absolute right-0 top-0 w-48 h-full pointer-events-none opacity-10" style={{background:'radial-gradient(ellipse at right, #00c8ff, transparent 70%)'}} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{background:'rgba(0,200,255,0.1)', border:'1px solid rgba(0,200,255,0.4)', boxShadow:'0 0 16px rgba(0,200,255,0.2)'}}>
            <Snowflake size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{fontFamily:'Sora,sans-serif'}}>Semen y Embriones</h1>
            <p className="text-sm" style={{color:'rgba(0,200,255,0.75)'}}>Inventario criogénico · Donantes · Transferencia de embriones</p>
          </div>
        </div>
        <div className="relative flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}
            className="h-9 gap-1.5 text-sm" style={{background:'rgba(0,200,255,0.08)', border:'1px solid rgba(0,200,255,0.3)', color:'#00c8ff'}}>
            <Download size={14} /> CSV
          </Button>
          <Button variant="outline" onClick={() => printModule('Semen y Embriones', 'Inventario criogénico')}
            className="h-9 gap-1.5 text-sm" style={{background:'rgba(0,200,255,0.06)', border:'1px solid rgba(0,200,255,0.22)', color:'#00c8ff'}}>
            <Printer size={14} /> PDF
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-9 gap-1.5 text-sm" style={{background:'rgba(0,200,255,0.15)', border:'1px solid rgba(0,200,255,0.4)', color:'#fff'}}>
                <Plus size={14} /> Registro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAdd}>
                <DialogHeader><DialogTitle>Nuevo Registro de Semen</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  {([['toro','Toro / Nombre'],['raza','Raza'],['dep','DEP'],['pajillas','Pajillas'],['origen','Origen'],['tipo','Tipo']] as [string,string][]).map(([n,l]) => (
                    <div key={n} className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right">{l}</Label>
                      <Input name={n} className="col-span-3" required />
                    </div>
                  ))}
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
          { label:'TOROS DISPONIBLES', val:String(semen.length),                              sub:'en inventario',        c:'#00c8ff' },
          { label:'TOTAL PAJILLAS',    val:String(semen.reduce((s,r)=>s+r.pajillas,0)),       sub:'en criopreservación',  c:'#39ff7e' },
          { label:'EMBRIONES',         val:String(embriones.length),                           sub:'lotes registrados',    c:'#bf00ff' },
          { label:'CANECAS',           val:String(semen.reduce((s,r)=>s+r.canecas,0)),        sub:'nitrógeno líquido',    c:'#00f5d4' },
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

      {/* Semen table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3" style={{background:'linear-gradient(135deg,#00101a,#001a2e)', borderBottom:'1px solid rgba(0,200,255,0.2)'}}>
          <div className="font-semibold text-white text-sm">❄️ Inventario de Semen</div>
          <div className="text-xs" style={{color:'rgba(0,200,255,0.6)'}}>{semen.length} toros · guardado automáticamente en localStorage</div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border" style={{background:'rgba(0,200,255,0.06)'}}>
              {['ID','Toro','Raza','DEP','Pajillas','Tipo','Origen','Año Cría',''].map(h => (
                <TableHead key={h} className="font-semibold text-[10px] uppercase" style={{color:'rgba(0,200,255,0.75)'}}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {semen.map(s => (
              <TableRow key={s.id} className="border-border hover:bg-muted/20">
                <TableCell className="font-mono text-xs text-cyan-400">{s.id}</TableCell>
                <TableCell className="font-semibold text-sm">{s.toro}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{s.raza}</TableCell>
                <TableCell className="text-green-400 font-bold text-sm">{s.dep}</TableCell>
                <TableCell className="font-bold text-blue-400">{s.pajillas}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.tipo === 'Sexado' ? 'bg-purple-500/20 text-purple-400' : 'bg-teal-500/20 text-teal-400'}`}>
                    {s.tipo}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{s.origen}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{s.cria}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <button className="text-muted-foreground hover:text-primary p-1" title="Editar"><Pencil size={13} /></button>
                    <button className="text-muted-foreground hover:text-destructive p-1" title="Eliminar" onClick={() => handleDelete(s.id)}><Trash2 size={13} /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Embriones */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <div className="font-semibold text-sm">🧬 Registro de Embriones</div>
          <div className="text-xs text-muted-foreground">{embriones.length} lotes registrados</div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border" style={{background:'rgba(191,0,255,0.06)'}}>
              {['ID','Donante','Receptor','Raza','Fecha TE','Estado'].map(h => (
                <TableHead key={h} className="font-semibold text-[10px] uppercase" style={{color:'rgba(191,0,255,0.75)'}}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {embriones.map(e => (
              <TableRow key={e.id} className="border-border hover:bg-muted/20">
                <TableCell className="font-mono text-xs text-cyan-400">{e.id}</TableCell>
                <TableCell className="font-medium text-sm">{e.donante}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{e.receptor}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{e.raza}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{e.fecha}</TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${e.estado === 'Transferido' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {e.estado}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
