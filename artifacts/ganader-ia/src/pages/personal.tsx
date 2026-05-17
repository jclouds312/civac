import { useAppState } from "../lib/data";
import { Download, Plus, Pencil, Trash2, Users, DollarSign, Clock, Shield, Printer } from "lucide-react";
import { printModule } from "@/lib/print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";

const CARGO_STYLES: Record<string, { bg: string; text: string; border: string; emoji: string }> = {
  "Vaquero jefe":   { bg:'rgba(0,245,212,0.1)',  text:'#00f5d4', border:'rgba(0,245,212,0.3)',  emoji:'👑' },
  "Ordeñador":      { bg:'rgba(0,200,255,0.1)',  text:'#00c8ff', border:'rgba(0,200,255,0.3)',  emoji:'🥛' },
  "Ordeñadora":     { bg:'rgba(0,200,255,0.1)',  text:'#00c8ff', border:'rgba(0,200,255,0.3)',  emoji:'🥛' },
  "Inseminador":    { bg:'rgba(168,85,247,0.1)', text:'#a855f7', border:'rgba(168,85,247,0.3)', emoji:'🧬' },
  "Administradora": { bg:'rgba(251,191,36,0.1)', text:'#fbbf24', border:'rgba(251,191,36,0.3)', emoji:'📊' },
  "Mantenimiento":  { bg:'rgba(148,163,184,0.1)',text:'#94a3b8', border:'rgba(148,163,184,0.3)',emoji:'🔧' },
};
const getCargo = (c: string) => CARGO_STYLES[c] || { bg:'rgba(255,255,255,0.06)',text:'rgba(255,255,255,0.5)',border:'rgba(255,255,255,0.1)',emoji:'👷' };

const valorHoraExtra = 12500;
const fmt = (n: number) => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);

export default function Personal() {
  const { personal, setPersonal } = useAppState();
  const [open, setOpen] = useState(false);

  const nominaTotal = personal.reduce((acc,p)=>acc+p.salario+(p.hExtras*valorHoraExtra),0);
  const extrasTotal = personal.reduce((acc,p)=>acc+p.hExtras,0);
  const extrasVal   = extrasTotal * valorHoraExtra;

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPersonal([...personal,{
      nombre:   fd.get('nombre') as string,
      cargo:    fd.get('cargo') as string,
      cedula:   fd.get('cedula') as string,
      ingreso:  fd.get('ingreso') as string,
      salario:  Number(fd.get('salario')),
      hExtras:  0,
      eps:      fd.get('eps') as string,
      arl:      fd.get('arl') as string,
    }]);
    setOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 civac-animate">

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative overflow-hidden"
        style={{
          background:'linear-gradient(135deg,#100018 0%,#1a0028 40%,#200030 70%,#100018 100%)',
          border:'1px solid rgba(168,85,247,0.3)',
          boxShadow:'0 0 40px rgba(168,85,247,0.1),inset 0 1px 0 rgba(168,85,247,0.1)',
        }}>
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle,rgba(168,85,247,0.2),transparent 65%)'}}/>
        <div className="absolute -left-8 -bottom-12 w-48 h-48 rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle,rgba(192,132,252,0.1),transparent 65%)'}}/>
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{background:'linear-gradient(90deg,transparent,#a855f7,#c084fc,transparent)'}}/>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{background:'rgba(168,85,247,0.15)',border:'1px solid rgba(168,85,247,0.4)',boxShadow:'0 0 20px rgba(168,85,247,0.35)'}}>
              <Users size={24} className="text-purple-300"/>
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-white" style={{fontFamily:"'Sora',sans-serif"}}>
                Personal y Nómina
              </h1>
              <p className="text-xs sm:text-sm" style={{color:'rgba(192,132,252,0.8)'}}>
                Empleados activos · Salarios · Horas extras · EPS · ARL
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-9 gap-1.5 text-xs sm:text-sm"
              style={{background:'rgba(168,85,247,0.1)',border:'1px solid rgba(168,85,247,0.3)',color:'#a855f7'}}>
              <Download size={13}/> CSV
            </Button>
            <Button size="sm" onClick={() => printModule('Personal y Nómina', 'Planilla de empleados y salarios')}
              className="h-9 gap-1.5 text-xs sm:text-sm"
              style={{background:'rgba(168,85,247,0.08)',border:'1px solid rgba(168,85,247,0.25)',color:'#a855f7'}}>
              <Printer size={13}/> PDF
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-1.5 text-xs sm:text-sm"
                  style={{background:'rgba(168,85,247,0.18)',border:'1px solid rgba(168,85,247,0.4)',color:'white'}}>
                  <Plus size={13}/> Empleado
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleAdd}>
                  <DialogHeader><DialogTitle>Agregar Empleado</DialogTitle></DialogHeader>
                  <div className="grid gap-3 py-4">
                    {[['nombre','Nombre'],['cargo','Cargo'],['cedula','Cédula'],['ingreso','Fecha Ingreso']].map(([n,l])=>(
                      <div key={n} className="grid grid-cols-4 items-center gap-3">
                        <Label className="text-right text-xs">{l}</Label>
                        <Input name={n} className="col-span-3" required/>
                      </div>
                    ))}
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-xs">Salario</Label>
                      <Input name="salario" type="number" className="col-span-3" required/>
                    </div>
                    {[['eps','EPS'],['arl','ARL']].map(([n,l])=>(
                      <div key={n} className="grid grid-cols-4 items-center gap-3">
                        <Label className="text-right text-xs">{l}</Label>
                        <Input name={n} className="col-span-3" required/>
                      </div>
                    ))}
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
          { label:'Empleados activos', val:String(personal.length), sub:'total planilla',     c:'#a855f7', g:'168,85,247',  icon:<Users size={14}/> },
          { label:'Nómina mensual',    val:fmt(nominaTotal),        sub:'COP estimado',       c:'#39ff7e', g:'57,255,126',  icon:<DollarSign size={14}/> },
          { label:'H. extras mes',     val:`${extrasTotal}h`,       sub:fmt(extrasVal),       c:'#ff9a3c', g:'255,154,60',  icon:<Clock size={14}/> },
          { label:'Prestaciones',      val:'✓ Al día',              sub:'EPS + ARL vigentes', c:'#00c8ff', g:'0,200,255',   icon:<Shield size={14}/> },
        ].map(k=>(
          <div key={k.label} className="rounded-2xl p-3 sm:p-4 relative overflow-hidden transition-all hover:scale-[1.03]"
            style={{background:`linear-gradient(145deg,rgba(${k.g},0.12),rgba(${k.g},0.05),rgba(0,0,0,0.3))`,border:`1px solid rgba(${k.g},0.25)`,borderRadius:18}}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-15 pointer-events-none"
              style={{background:`radial-gradient(circle,rgba(${k.g},1),transparent)`,transform:'translate(40%,-40%)'}}/>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider" style={{color:`rgba(${k.g},0.7)`}}>{k.label}</div>
              <div style={{color:`rgba(${k.g},0.5)`}}>{k.icon}</div>
            </div>
            <div className="text-lg sm:text-2xl font-black leading-tight mb-1" style={{color:`rgba(${k.g},1)`,fontFamily:"'Sora',sans-serif"}}>{k.val}</div>
            <div className="text-[9px] sm:text-[10px] text-white/40">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── TABLA PERSONAL ───────────────────────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl overflow-hidden"
        style={{border:'1px solid rgba(168,85,247,0.18)',borderRadius:20}}>
        <div className="px-4 sm:px-5 py-3 sm:py-4 flex items-center gap-2.5"
          style={{background:'linear-gradient(135deg,#100018,#1a0028)',borderBottom:'1px solid rgba(168,85,247,0.2)'}}>
          <span className="text-xl">👷</span>
          <div>
            <div className="font-black text-sm sm:text-base text-white">Planilla de Personal</div>
            <div className="text-[10px] sm:text-xs text-white/50">{personal.length} empleados registrados · CIVAC PRO</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr style={{background:'rgba(168,85,247,0.06)',borderBottom:'1px solid rgba(168,85,247,0.12)'}}>
                {['Empleado','Cargo','Cédula','Ingreso','Salario Base','H. Extras','Total Mes','EPS / ARL',''].map(h=>(
                  <th key={h} className="text-[9px] sm:text-[10px] font-black uppercase px-3 sm:px-4 py-2.5 sm:py-3 text-left whitespace-nowrap"
                    style={{color:'rgba(168,85,247,0.7)'}}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {personal.map((p,i)=>{
                const totalMes = p.salario + (p.hExtras * valorHoraExtra);
                const cargo = getCargo(p.cargo);
                return (
                  <tr key={i} className="border-b transition-colors hover:bg-white/[0.02]"
                    style={{borderColor:'rgba(255,255,255,0.04)'}}>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="font-black text-xs sm:text-sm text-white">{p.nombre}</div>
                      <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{background:'rgba(57,255,126,0.1)',color:'#39ff7e',border:'1px solid rgba(57,255,126,0.2)'}}>
                        ● Activo
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"
                        style={{background:cargo.bg,color:cargo.text,border:`1px solid ${cargo.border}`}}>
                        {cargo.emoji} {p.cargo}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 font-mono text-[10px] sm:text-xs text-white/40">{p.cedula}</td>
                    <td className="px-3 sm:px-4 py-3 text-[10px] sm:text-xs text-white/40">{p.ingreso}</td>
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-black text-white">{fmt(p.salario)}</td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className="text-xs sm:text-sm font-black" style={{color:p.hExtras>0?'#ff9a3c':'rgba(255,255,255,0.3)'}}>
                        {p.hExtras}h
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className="text-xs sm:text-sm font-black" style={{color:'#39ff7e'}}>{fmt(totalMes)}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="text-[9px] sm:text-[10px] text-white/40 leading-relaxed">
                        <div>{p.eps}</div>
                        <div>{p.arl}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{color:'rgba(255,255,255,0.3)'}}>
                          <Pencil size={13}/>
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                          style={{color:'rgba(255,255,255,0.3)'}}
                          onClick={()=>setPersonal(personal.filter((_,j)=>j!==i))}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{background:'rgba(57,255,126,0.06)',borderTop:'1px solid rgba(57,255,126,0.15)'}}>
                <td className="px-3 sm:px-4 py-3 font-black text-sm text-white" colSpan={6}>
                  TOTAL NÓMINA MENSUAL
                </td>
                <td className="px-3 sm:px-4 py-3">
                  <span className="text-sm sm:text-base font-black" style={{color:'#39ff7e'}}>{fmt(nominaTotal)}</span>
                </td>
                <td colSpan={2}/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
