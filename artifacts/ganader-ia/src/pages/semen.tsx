import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Download, Pencil, Trash2, Snowflake } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";

const initialSemen = [
  { id: 'S-001', toro: 'Altísimo IA', raza: 'Holstein', dep: '+820L', canecas: 2, pajillas: 24, origen: 'Canadá', tipo: 'Convencional', cria: 2026 },
  { id: 'S-002', toro: 'El Campeón', raza: 'Gyr', dep: '+680L', canecas: 1, pajillas: 12, origen: 'Brasil', tipo: 'Sexado', cria: 2025 },
  { id: 'S-003', toro: 'Montana Star', raza: 'Angus', dep: '+540kg', canecas: 1, pajillas: 8, origen: 'EE.UU.', tipo: 'Convencional', cria: 2025 },
  { id: 'S-004', toro: 'Brahman Royal', raza: 'Brahman', dep: '+410L', canecas: 1, pajillas: 18, origen: 'Colombia', tipo: 'Convencional', cria: 2024 },
];

const embriones = [
  { id: 'E-001', donante: 'Rosaura A-0042', receptor: 'Perla A-0712', fecha: '15/03/2025', estado: 'Transferido', raza: 'Holstein' },
  { id: 'E-002', donante: 'Estrella A-0604', receptor: 'Canela A-0108', fecha: '28/03/2025', estado: 'En criopreservación', raza: 'Holstein' },
  { id: 'E-003', donante: 'Rosaura A-0042', receptor: '—', fecha: '10/04/2025', estado: 'En criopreservación', raza: 'Holstein' },
];

export default function Semen() {
  const [semen, setSemen] = useState(initialSemen);
  const [open, setOpen] = useState(false);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSemen([...semen, {
      id: `S-00${semen.length + 1}`,
      toro: fd.get('toro') as string,
      raza: fd.get('raza') as string,
      dep: fd.get('dep') as string,
      canecas: 1,
      pajillas: Number(fd.get('pajillas')),
      origen: fd.get('origen') as string,
      tipo: fd.get('tipo') as string,
      cria: 2025,
    }]);
    setOpen(false);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0d3d4a] to-[#00838f] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Snowflake size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Semen y Embriones</h1>
            <p className="text-white/70 text-sm">Inventario criogénico · Donantes · Transferencia de embriones</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-9 gap-1.5 text-sm">
            <Download size={14} /> CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 h-9 gap-1.5 text-sm">
                <Plus size={14} /> Registro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAdd}>
                <DialogHeader><DialogTitle>Nuevo Registro de Semen</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  {[['toro','Toro'],['raza','Raza'],['dep','DEP'],['pajillas','Pajillas'],['origen','Origen'],['tipo','Tipo']].map(([n,l]) => (
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
          { label:'TOROS DISPONIBLES', val:String(semen.length), sub:'en inventario', gradient:'linear-gradient(135deg,#0d3d4a,#00838f)' },
          { label:'TOTAL PAJILLAS', val:String(semen.reduce((s,r)=>s+r.pajillas,0)), sub:'en criopreservación', gradient:'linear-gradient(135deg,#1b5e20,#2e7d32)' },
          { label:'EMBRIONES', val:String(embriones.length), sub:'lotes registrados', gradient:'linear-gradient(135deg,#4a148c,#6a1b9a)' },
          { label:'CANECAS', val:String(semen.reduce((s,r)=>s+r.canecas,0)), sub:'nitrógeno líquido', gradient:'linear-gradient(135deg,#0d47a1,#1565c0)' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white shadow" style={{background:k.gradient}}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">{k.label}</div>
            <div className="text-2xl font-bold">{k.val}</div>
            <div className="text-[10px] text-white/60">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Semen table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0d3d4a] to-[#00838f] px-5 py-3">
          <div className="font-semibold text-white text-sm">❄️ Inventario de Semen</div>
          <div className="text-white/60 text-xs">{semen.length} toros registrados en stock criogénico</div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-[#0a3040] hover:bg-[#0a3040] border-b border-teal-900/40">
              {['ID','Toro','Raza','DEP','Pajillas','Tipo','Origen','Año Cría',''].map(h => (
                <TableHead key={h} className="text-white/70 font-semibold text-xs uppercase">{h}</TableHead>
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
                <TableCell><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.tipo === 'Sexado' ? 'bg-purple-500/20 text-purple-400' : 'bg-teal-500/20 text-teal-400'}`}>{s.tipo}</span></TableCell>
                <TableCell className="text-muted-foreground text-sm">{s.origen}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{s.cria}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <button className="text-muted-foreground hover:text-primary p-1"><Pencil size={13} /></button>
                    <button className="text-muted-foreground hover:text-destructive p-1" onClick={() => setSemen(semen.filter(x=>x.id!==s.id))}><Trash2 size={13} /></button>
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
            <TableRow className="bg-[#1a4a2e] hover:bg-[#1a4a2e] border-b border-[#2d6a3f]">
              {['ID','Donante','Receptor','Raza','Fecha TE','Estado'].map(h => (
                <TableHead key={h} className="text-white/70 font-semibold text-xs uppercase">{h}</TableHead>
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
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${e.estado === 'Transferido' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{e.estado}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
