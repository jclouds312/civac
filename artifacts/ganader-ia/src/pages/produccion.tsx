import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LabelList, LineChart, Line, ReferenceLine,
} from "recharts";
import { Download, Plus, TrendingUp, TrendingDown, Droplets, Award, Target, Printer } from "lucide-react";
import { printModule } from "@/lib/print";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const dataHistorico = [
  { name:'Oct', litros:52000, meta:50000 },
  { name:'Nov', litros:55000, meta:53000 },
  { name:'Dic', litros:58000, meta:56000 },
  { name:'Ene', litros:62000, meta:60000 },
  { name:'Feb', litros:60000, meta:62000 },
  { name:'Mar', litros:56000, meta:60000 },
  { name:'Abr', litros:61300, meta:62000 },
];

const topVacas = [
  { rank:1, nombre:'Rosaura',  litros:18.4, rfid:'A-0042', pct:92, badge:'🥇' },
  { rank:2, nombre:'Estrella', litros:17.8, rfid:'A-0118', pct:89, badge:'🥈' },
  { rank:3, nombre:'Cielo',    litros:16.9, rfid:'A-0205', pct:84, badge:'🥉' },
  { rank:4, nombre:'Niebla',   litros:15.8, rfid:'A-0331', pct:79, badge:'4°' },
  { rank:5, nombre:'Palmera',  litros:15.2, rfid:'A-0407', pct:76, badge:'5°' },
  { rank:6, nombre:'Perla',    litros:12.1, rfid:'A-0712', pct:60, badge:'6°' },
];

const registros = [
  { fecha:'29/04/2025', litros:1980, precio:1250, ingreso:2475000, nota:'Ordeño normal' },
  { fecha:'28/04/2025', litros:2010, precio:1250, ingreso:2512500, nota:'Lluvia intensa' },
  { fecha:'27/04/2025', litros:1950, precio:1250, ingreso:2437500, nota:'—' },
  { fecha:'26/04/2025', litros:2025, precio:1250, ingreso:2531250, nota:'—' },
  { fecha:'25/04/2025', litros:1890, precio:1250, ingreso:2362500, nota:'Vacuna IBR' },
];

const TIP = { backgroundColor:'#030f0b', border:'1px solid rgba(0,200,255,0.2)', color:'#e2e8f0', borderRadius:'12px', fontSize:'12px' };

export default function Produccion() {
  const [open, setOpen] = useState(false);
  const [regs, setRegs] = useState(registros);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const litros = Number(fd.get('litros'));
    const precio = 1250;
    setRegs([{ fecha:fd.get('fecha') as string, litros, precio, ingreso:litros*precio, nota:fd.get('nota') as string||'—' }, ...regs]);
    setOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 civac-animate">

      {/* ── HERO BANNER ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative overflow-hidden module-banner"
        style={{
          background:'linear-gradient(135deg,#001830 0%,#002040 40%,#002850 70%,#001a30 100%)',
          border:'1px solid rgba(0,200,255,0.3)',
          boxShadow:'0 0 40px rgba(0,200,255,0.1),inset 0 1px 0 rgba(0,200,255,0.12)',
        }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:"url('https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1400&q=80&auto=format&fit=crop')", backgroundSize:"cover", backgroundPosition:"center", opacity:0.11 }}/>
        <div className="absolute inset-0 pointer-events-none" style={{background:'linear-gradient(135deg,#001830ee 0%,#00204088 50%,#002850cc 100%)'}}/>
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle,rgba(0,200,255,0.2),transparent 65%)'}}/>
        <div className="absolute -left-8 -bottom-12 w-48 h-48 rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle,rgba(57,255,126,0.1),transparent 65%)'}}/>
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{background:'linear-gradient(90deg,transparent,#00c8ff,#39ff7e,transparent)'}}/>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"
              style={{background:'linear-gradient(135deg,rgba(0,200,255,0.15),rgba(0,200,255,0.05))',border:'1px solid rgba(0,200,255,0.4)',boxShadow:'0 0 20px rgba(0,200,255,0.3)'}}>
              🥛
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-white" style={{fontFamily:"'Sora',sans-serif"}}>Producción Lechera</h1>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-black"
                  style={{background:'rgba(57,255,126,0.15)',color:'#39ff7e',border:'1px solid rgba(57,255,126,0.3)'}}>
                  ↑ 9.4% vs mes anterior
                </span>
              </div>
              <p className="text-xs sm:text-sm" style={{color:'rgba(0,200,255,0.7)'}}>
                Ordeños diarios · Ranking vacas · Análisis financiero
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-9 gap-1.5 text-xs sm:text-sm font-semibold"
              style={{background:'rgba(0,200,255,0.08)',border:'1px solid rgba(0,200,255,0.3)',color:'#00c8ff'}}>
              <Download size={13}/> CSV
            </Button>
            <Button size="sm" onClick={() => printModule('Producción Lechera', 'Reporte de ordeños y ranking')}
              className="h-9 gap-1.5 text-xs sm:text-sm font-semibold"
              style={{background:'rgba(0,200,255,0.08)',border:'1px solid rgba(0,200,255,0.25)',color:'#00c8ff'}}>
              <Printer size={13}/> PDF
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-1.5 text-xs sm:text-sm font-semibold"
                  style={{background:'linear-gradient(135deg,rgba(0,200,255,0.2),rgba(0,200,255,0.1))',border:'1px solid rgba(0,200,255,0.4)',color:'white'}}>
                  <Plus size={13}/> Registrar ordeño
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAdd}>
                  <DialogHeader><DialogTitle>Registrar Ordeño</DialogTitle></DialogHeader>
                  <div className="grid gap-3 py-4">
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-xs">Fecha</Label>
                      <Input name="fecha" type="text" className="col-span-3" placeholder="DD/MM/AAAA" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-xs">Litros</Label>
                      <Input name="litros" type="number" className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-xs">Nota</Label>
                      <Input name="nota" className="col-span-3"/>
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

      {/* ── KPI CARDS ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {[
          { label:'Producción mes',   val:'61.300 L',  sub:'Litros totales',    c:'#00c8ff', g:'0,200,255',   icon:<Droplets size={14}/>, up:true  },
          { label:'Precio / litro',   val:'$1.250',    sub:'COP vigente',       c:'#39ff7e', g:'57,255,126',  icon:<TrendingUp size={14}/>, up:true  },
          { label:'Ingreso bruto',    val:'$76.6M',    sub:'Leche este mes',    c:'#ff9a3c', g:'255,154,60',  icon:<Award size={14}/>, up:true  },
          { label:'Costo / litro',    val:'$820',      sub:'Meta: $800',        c:'#ff4d6d', g:'255,77,109',  icon:<TrendingDown size={14}/>, up:false },
          { label:'Margen neto',      val:'34.4%',     sub:'34.4% sobre precio',c:'#a855f7', g:'168,85,247',  icon:<Target size={14}/>, up:true  },
        ].map(k=>(
          <div key={k.label} className="rounded-2xl p-3 sm:p-4 relative overflow-hidden transition-all hover:scale-[1.03]"
            style={{
              background:`linear-gradient(145deg,rgba(${k.g},0.12),rgba(${k.g},0.05),rgba(0,0,0,0.3))`,
              border:`1px solid rgba(${k.g},0.25)`,
              borderRadius:18,
            }}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-15 pointer-events-none"
              style={{background:`radial-gradient(circle,rgba(${k.g},1),transparent)`,transform:'translate(40%,-40%)'}}/>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider" style={{color:`rgba(${k.g},0.7)`}}>
                {k.label}
              </div>
              <div style={{color:`rgba(${k.g},0.5)`}}>{k.icon}</div>
            </div>
            <div className="text-xl sm:text-2xl font-black leading-none mb-1" style={{color:`rgba(${k.g},1)`,fontFamily:"'Sora',sans-serif"}}>
              {k.val}
            </div>
            <div className="text-[9px] sm:text-[10px] text-white/40">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── RANKING + HISTÓRICO ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

        {/* Top vacas */}
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5"
          style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(251,191,36,0.2)',borderRadius:20}}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{background:'linear-gradient(135deg,#fbbf24,#f59e0b)',boxShadow:'0 0 18px rgba(251,191,36,0.5)'}}>
              🏆
            </div>
            <div>
              <div className="font-black text-sm sm:text-base text-white">Top vacas en producción</div>
              <div className="text-[10px] sm:text-xs text-white/40">Ranking diario · 6 en ordeño activo</div>
            </div>
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            {topVacas.map((v,i)=>{
              const colors = ['#fbbf24','#94a3b8','#c084fc','#39ff7e','#00c8ff','#ff9a3c'];
              const glows  = ['251,191,36','148,163,184','192,132,252','57,255,126','0,200,255','255,154,60'];
              const c = colors[i]; const g = glows[i];
              return (
                <div key={v.nombre} className="flex items-center gap-2.5 sm:gap-3 p-2.5 rounded-xl transition-all hover:bg-white/5"
                  style={{border:`1px solid rgba(${g},0.12)`,borderRadius:14}}>
                  <div className="text-lg sm:text-xl w-6 text-center flex-shrink-0">{v.badge}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-black text-white">{v.nombre}</span>
                      <span className="text-xs font-black" style={{color:c}}>{v.litros} L/d</span>
                    </div>
                    <div className="h-1.5 sm:h-2 rounded-full" style={{background:'rgba(255,255,255,0.06)'}}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{width:`${v.pct}%`,background:`linear-gradient(90deg,${c},${c}88)`,boxShadow:`0 0 6px rgba(${g},0.5)`}}/>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-white/30 flex-shrink-0">{v.rfid}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Histórico */}
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5"
          style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(0,200,255,0.2)',borderRadius:20}}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-black text-sm sm:text-base text-white">Histórico 7 meses</div>
              <div className="text-[10px] sm:text-xs text-white/40">Litros mes · Oct 2024 — Abr 2025</div>
            </div>
            <span className="text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1"
              style={{background:'rgba(57,255,126,0.15)',color:'#39ff7e',border:'1px solid rgba(57,255,126,0.3)'}}>
              <TrendingUp size={11}/> ↑ 9.4%
            </span>
          </div>
          <div className="h-40 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataHistorico} margin={{top:18,right:10,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="barProd" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#00c8ff" stopOpacity={0.95}/>
                    <stop offset="1" stopColor="#0ea5e9" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="barMeta" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#a855f7" stopOpacity={0.6}/>
                    <stop offset="1" stopColor="#a855f7" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <XAxis dataKey="name" stroke="transparent" tick={{fill:'rgba(255,255,255,0.4)',fontSize:11}}/>
                <YAxis stroke="transparent" tick={{fill:'rgba(255,255,255,0.4)',fontSize:11}} width={42}/>
                <RechartsTooltip contentStyle={TIP}/>
                <Bar dataKey="meta"   fill="url(#barMeta)" radius={[6,6,0,0]}/>
                <Bar dataKey="litros" fill="url(#barProd)" radius={[6,6,0,0]}>
                  <LabelList dataKey="litros" position="top" style={{fill:'rgba(0,200,255,0.7)',fontSize:9}}
                    formatter={(v:number)=>`${(v/1000).toFixed(0)}K`}/>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              {label:'Precio/L', val:'$1.250', c:'#39ff7e', g:'57,255,126'},
              {label:'Costo/L',  val:'$820',   c:'#ff4d6d', g:'255,77,109'},
              {label:'Margen',   val:'34.4%',  c:'#a855f7', g:'168,85,247'},
            ].map(s=>(
              <div key={s.label} className="rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-center"
                style={{background:`rgba(${s.g},0.08)`,border:`1px solid rgba(${s.g},0.2)`}}>
                <div className="text-[9px] sm:text-[10px] text-white/40 mb-0.5">{s.label}</div>
                <div className="text-sm sm:text-base font-black" style={{color:s.c}}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── REGISTROS ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl overflow-hidden"
        style={{border:'1px solid rgba(0,200,255,0.15)',borderRadius:20}}>
        <div className="px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between"
          style={{background:'linear-gradient(135deg,#001830,#002040)',borderBottom:'1px solid rgba(0,200,255,0.2)'}}>
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📋</span>
            <div>
              <div className="font-black text-sm sm:text-base text-white">Planilla de Registros Diarios</div>
              <div className="text-[10px] sm:text-xs text-white/50">{regs.length} registros · Producción lechera</div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr style={{background:'rgba(0,200,255,0.06)',borderBottom:'1px solid rgba(0,200,255,0.12)'}}>
                {['Fecha','Litros','Precio/L','Ingreso Bruto','Anotación'].map(h=>(
                  <th key={h} className="text-[10px] sm:text-xs font-black uppercase px-3 sm:px-4 py-2.5 sm:py-3 text-left"
                    style={{color:'rgba(0,200,255,0.7)'}}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {regs.map((r,i)=>(
                <tr key={i} className="border-b transition-colors hover:bg-white/[0.02]"
                  style={{borderColor:'rgba(255,255,255,0.04)'}}>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                    <span className="text-[10px] sm:text-xs px-2 py-1 rounded-lg font-mono text-white/70"
                      style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)'}}>
                      {r.fecha}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                    <span className="text-xs sm:text-sm font-black" style={{color:'#00c8ff'}}>{r.litros.toLocaleString('es-CO')} L</span>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white/50">${r.precio.toLocaleString('es-CO')}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                    <span className="text-xs sm:text-sm font-black" style={{color:'#39ff7e'}}>${r.ingreso.toLocaleString('es-CO')}</span>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white/40">{r.nota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
