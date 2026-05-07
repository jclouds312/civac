import { useAppState } from "../lib/data";
import { Download, Plus, Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";

const getCargoBadge = (cargo: string) => {
  switch (cargo) {
    case "Vaquero jefe": return "bg-teal-500/20 text-teal-400 border border-teal-500/30";
    case "Ordeñador": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "Ordeñadora": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "Inseminador": return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
    case "Administradora": return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    case "Mantenimiento": return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const valorHoraExtra = 12500;

export default function Personal() {
  const { personal, setPersonal } = useAppState();
  const [open, setOpen] = useState(false);

  const nominaTotal = personal.reduce((acc, p) => acc + p.salario + (p.hExtras * valorHoraExtra), 0);
  const extrasTotal = personal.reduce((acc, p) => acc + p.hExtras, 0);

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

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#7c3d10] to-[#bf360c] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Personal y Nómina</h1>
            <p className="text-white/70 text-sm">Empleados activos · Salarios · Horas extras · EPS · ARL</p>
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
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAdd}>
                <DialogHeader><DialogTitle>Agregar Empleado</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  {[['nombre','Nombre'],['cargo','Cargo'],['cedula','Cédula'],['ingreso','Ingreso']].map(([n,l]) => (
                    <div key={n} className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right">{l}</Label>
                      <Input name={n} className="col-span-3" required />
                    </div>
                  ))}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right">Salario</Label>
                    <Input name="salario" type="number" className="col-span-3" required />
                  </div>
                  {[['eps','EPS'],['arl','ARL']].map(([n,l]) => (
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
          { label:'ACTIVOS', val:`${personal.length}`, sub:'empleados', gradient:'linear-gradient(135deg,#e65100,#f57c00)' },
          { label:'NÓMINA MENSUAL', val:fmt(nominaTotal), sub:'COP estimado', gradient:'linear-gradient(135deg,#1b5e20,#2e7d32)' },
          { label:'H. EXTRAS', val:`${extrasTotal}h`, sub:'este mes', gradient:'linear-gradient(135deg,#00695c,#00897b)' },
          { label:'PRESTACIONES', val:'✓ AL DÍA', sub:'afiliaciones ok', gradient:'linear-gradient(135deg,#4a148c,#6a1b9a)' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white shadow" style={{background:k.gradient}}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">{k.label}</div>
            <div className="text-lg font-bold leading-tight">{k.val}</div>
            <div className="text-[10px] text-white/60">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#7c3d10] to-[#bf360c] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-base">👷</span>
            <div>
              <div className="font-semibold text-white text-sm">Planilla de Personal</div>
              <div className="text-white/60 text-xs">{personal.length} empleados registrados</div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#5c2e00]/40 border-b border-border">
                {['EMPLEADO','CARGO','CÉDULA','INGRESO','SALARIO','H.EXTRAS','TOTAL MES','EPS / ARL',''].map(h => (
                  <th key={h} className="text-muted-foreground font-semibold text-xs uppercase px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {personal.map((p, i) => {
                const totalMes = p.salario + (p.hExtras * valorHoraExtra);
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-sm text-foreground">{p.nombre}</div>
                      <span className="text-[10px] font-semibold bg-green-400/10 text-green-400 border border-green-400/30 px-1.5 py-0.5 rounded-full">Activo</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCargoBadge(p.cargo)}`}>{p.cargo}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.cedula}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.ingreso}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{fmt(p.salario)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${p.hExtras > 0 ? 'text-orange-400' : 'text-muted-foreground'}`}>{p.hExtras}h</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-400">{fmt(totalMes)}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-muted-foreground">{p.eps}</div>
                      <div className="text-xs text-muted-foreground">{p.arl}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="text-muted-foreground hover:text-primary p-1"><Pencil size={13} /></button>
                        <button className="text-muted-foreground hover:text-destructive p-1" onClick={() => setPersonal(personal.filter((_,j) => j !== i))}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-muted/20 border-t border-border">
                <td className="px-4 py-3 font-bold text-sm text-foreground" colSpan={6}>TOTAL NÓMINA</td>
                <td className="px-4 py-3 font-bold text-base text-green-400">{fmt(nominaTotal)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
