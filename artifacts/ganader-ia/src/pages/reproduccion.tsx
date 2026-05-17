import { useAppState } from "../lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Download, Pencil, AlertTriangle, TrendingUp, TrendingDown, Activity, Printer } from "lucide-react";
import { printModule } from "@/lib/print";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Reproduccion() {
  const { reproduccion, setReproduccion } = useAppState();
  const [open, setOpen] = useState(false);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setReproduccion([{
      arete:      fd.get('arete')     as string,
      animal:     fd.get('animal')    as string,
      servicio:   fd.get('servicio')  as string,
      fechaParto: fd.get('fechaParto')as string,
      dias:       Number(fd.get('dias')),
      partosPrev: Number(fd.get('partosPrev')||0),
      estado:     fd.get('estado')    as string,
    }, ...reproduccion]);
    setOpen(false);
  };

  const getDiasStyle = (dias: number) =>
    dias < 20
      ? { bg:'rgba(57,255,126,0.1)',   text:'#39ff7e', border:'rgba(57,255,126,0.3)'  }
      : dias < 35
      ? { bg:'rgba(255,154,60,0.1)',  text:'#ff9a3c', border:'rgba(255,154,60,0.3)'  }
      : { bg:'rgba(255,255,255,0.06)',text:'rgba(255,255,255,0.4)',border:'rgba(255,255,255,0.1)' };

  const kpisTop = [
    { label:'Tasa concepción', val:'62%', sub:'Meta 70%', c:'#ff9a3c', g:'255,154,60',  icon:<TrendingDown size={13}/>, up:false },
    { label:'Próx. partos 30d',val:'3',   sub:'gestantes', c:'#39ff7e', g:'57,255,126', icon:<TrendingUp size={13}/>,  up:true  },
    { label:'Anestros >90d',   val:'8',   sub:'acción urgente', c:'#ff4d6d', g:'255,77,109', icon:<AlertTriangle size={13}/>, up:false },
    { label:'Vacas gestantes', val:'1',   sub:'8% del hato', c:'#00f5d4', g:'0,245,212',    icon:<Activity size={13}/>,   up:true  },
    { label:'IEP promedio',    val:'428d',sub:'Meta <390d', c:'#ff4d6d', g:'255,77,109',    icon:<TrendingDown size={13}/>,up:false },
  ];

  const kpisBot = [
    { label:'Tasa preñez',      val:'52%',  sub:'Meta 60%',   c:'#ff9a3c', g:'255,154,60'  },
    { label:'Vacas abiertas',   val:'2',    sub:'seguimiento', c:'#fbbf24', g:'251,191,36'  },
    { label:'Días abiertos prom',val:'142d',sub:'Meta <90d',  c:'#ff4d6d', g:'255,77,109'  },
    { label:'Destetes exitosos', val:'94%', sub:'Meta 90% ✓', c:'#39ff7e', g:'57,255,126'  },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 civac-animate">

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative overflow-hidden"
        style={{
          background:'linear-gradient(135deg,#130020 0%,#1e0030 40%,#250038 70%,#130020 100%)',
          border:'1px solid rgba(255,111,216,0.32)',
          boxShadow:'0 0 40px rgba(255,111,216,0.1),inset 0 1px 0 rgba(255,111,216,0.1)',
        }}>
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle,rgba(255,111,216,0.2),transparent 65%)'}}/>
        <div className="absolute -left-8 -bottom-12 w-48 h-48 rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle,rgba(168,85,247,0.1),transparent 65%)'}}/>
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{background:'linear-gradient(90deg,transparent,#ff6fd8,#a855f7,transparent)'}}/>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"
              style={{background:'rgba(255,111,216,0.12)',border:'1px solid rgba(255,111,216,0.38)',boxShadow:'0 0 20px rgba(255,111,216,0.3)'}}>
              🔁
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-white" style={{fontFamily:"'Sora',sans-serif"}}>
                  Reproducción y Ciclos
                </h1>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-black"
                  style={{background:'rgba(255,77,109,0.2)',color:'#ff4d6d',border:'1px solid rgba(255,77,109,0.35)'}}>
                  ⚠ 8 anestros
                </span>
              </div>
              <p className="text-xs sm:text-sm" style={{color:'rgba(255,150,230,0.75)'}}>
                Control de montas · I.A. · Gestación · IEP · Protocolos
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-9 gap-1.5 text-xs sm:text-sm"
              style={{background:'rgba(255,111,216,0.08)',border:'1px solid rgba(255,111,216,0.28)',color:'#ff6fd8'}}>
              <Download size={13}/> CSV
            </Button>
            <Button size="sm" onClick={() => printModule('Reproducción y Ciclos', 'Control reproductivo del hato')}
              className="h-9 gap-1.5 text-xs sm:text-sm"
              style={{background:'rgba(255,111,216,0.08)',border:'1px solid rgba(255,111,216,0.25)',color:'#ff6fd8'}}>
              <Printer size={13}/> PDF
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-1.5 text-xs sm:text-sm"
                  style={{background:'rgba(255,111,216,0.15)',border:'1px solid rgba(255,111,216,0.38)',color:'white'}}>
                  <Plus size={13}/> Registrar Evento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAdd}>
                  <DialogHeader><DialogTitle>Registrar Gestación</DialogTitle></DialogHeader>
                  <div className="grid gap-3 py-4">
                    {[['arete','Arete'],['animal','Animal'],['servicio','Servicio'],['fechaParto','Fecha Parto']].map(([n,l])=>(
                      <div key={n} className="grid grid-cols-4 items-center gap-3">
                        <Label className="text-right text-xs">{l}</Label>
                        <Input name={n} className="col-span-3" required/>
                      </div>
                    ))}
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-xs">Días</Label>
                      <Input name="dias" type="number" className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-xs">Partos Prev.</Label>
                      <Input name="partosPrev" type="number" className="col-span-3" defaultValue="0"/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-xs">Estado</Label>
                      <div className="col-span-3">
                        <Select name="estado" defaultValue="Gestante">
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>
                            {['Gestante','Próximo parto','En seguimiento'].map(v=>
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
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

      {/* ── TOP KPI CARDS ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {kpisTop.map(k=>(
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

      {/* ── PARTOS + ANESTROS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

        {/* Próximos partos */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden"
          style={{border:'1px solid rgba(255,111,216,0.18)',borderRadius:20}}>
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4"
            style={{background:'linear-gradient(135deg,#130020,#1e0030)',borderBottom:'1px solid rgba(255,111,216,0.15)'}}>
            <div className="font-black text-sm sm:text-base text-white flex items-center gap-2">
              <span>🐄</span> Próximos partos esperados
            </div>
            <Button size="sm" className="h-8 gap-1 text-[10px] sm:text-xs"
              style={{background:'rgba(255,111,216,0.1)',border:'1px solid rgba(255,111,216,0.25)',color:'#ff6fd8'}}>
              <Plus size={11}/> Agregar
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr style={{background:'rgba(255,111,216,0.05)',borderBottom:'1px solid rgba(255,111,216,0.1)'}}>
                  {['Arete','Animal','Servicio','Fecha Parto','Días','Partos','Estado',''].map(h=>(
                    <th key={h} className="text-[9px] sm:text-[10px] font-black uppercase px-3 py-2.5 text-left whitespace-nowrap"
                      style={{color:'rgba(255,111,216,0.65)'}}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reproduccion.map((r,i)=>{
                  const ds = getDiasStyle(r.dias);
                  return (
                    <tr key={i} className="border-b transition-colors hover:bg-white/[0.02]"
                      style={{borderColor:'rgba(255,255,255,0.04)'}}>
                      <td className="px-3 py-2.5 font-mono text-[10px] sm:text-xs font-black" style={{color:'#39ff7e'}}>{r.arete}</td>
                      <td className="px-3 py-2.5 font-black text-xs sm:text-sm text-white">{r.animal}</td>
                      <td className="px-3 py-2.5 text-[10px] sm:text-xs text-white/40">{r.servicio}</td>
                      <td className="px-3 py-2.5 text-[10px] sm:text-xs text-white/40">{r.fechaParto}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full"
                          style={{background:ds.bg,color:ds.text,border:`1px solid ${ds.border}`}}>
                          {r.dias}d
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[10px] sm:text-xs text-center text-white/40">{r.partosPrev}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{background:'rgba(168,85,247,0.1)',color:'#a855f7',border:'1px solid rgba(168,85,247,0.25)'}}>
                          {r.estado}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{color:'rgba(255,255,255,0.3)'}}>
                          <Pencil size={12}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Anestros */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden"
          style={{border:'1px solid rgba(255,77,109,0.22)',borderRadius:20}}>
          <div className="flex items-center gap-2.5 px-4 sm:px-5 py-3 sm:py-4"
            style={{background:'linear-gradient(135deg,rgba(255,77,109,0.08),rgba(255,77,109,0.03))',borderBottom:'1px solid rgba(255,77,109,0.18)'}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{background:'rgba(255,77,109,0.12)',border:'1px solid rgba(255,77,109,0.3)'}}>
              <AlertTriangle size={16} className="text-rose-400"/>
            </div>
            <div>
              <div className="font-black text-sm sm:text-base text-white">Vacas con anestro prolongado</div>
              <div className="text-[10px] sm:text-xs" style={{color:'rgba(255,100,130,0.7)'}}>Acción urgente requerida</div>
            </div>
          </div>
          <div className="p-4 sm:p-5 space-y-4" style={{background:'rgba(3,15,10,0.85)'}}>
            <div className="flex items-center gap-3">
              <div className="text-3xl sm:text-4xl font-black" style={{color:'#ff4d6d',fontFamily:"'Sora',sans-serif"}}>8</div>
              <div className="text-xs sm:text-sm text-white/50">vacas con anestro<br/>&gt;90 días identificadas</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['A-0108','A-0319','A-0551','A-0712','A-0890','A-0445','A-0180','A-0320'].map(a=>(
                <span key={a} className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-lg"
                  style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.08)'}}>
                  {a}
                </span>
              ))}
            </div>
            <div className="rounded-2xl p-3.5 sm:p-4 space-y-2"
              style={{background:'rgba(57,255,126,0.06)',border:'1px solid rgba(57,255,126,0.15)'}}>
              <div className="text-[10px] sm:text-xs font-black mb-2 flex items-center gap-1.5" style={{color:'#39ff7e'}}>
                🤖 Diagnóstico SoftGan IA:
              </div>
              {[
                'IEP promedio 428d → pérdida estimada <strong class="text-white">$8.2M COP/mes</strong>',
                '8 vacas en anestro &gt;90d → protocolo GnRH + PGF₂α',
                'Posible déficit energético postparto — revisar BCS',
              ].map((t,i)=>(
                <div key={i} className="text-[10px] sm:text-xs text-white/50 flex gap-2 leading-relaxed">
                  <span>•</span>
                  <span dangerouslySetInnerHTML={{__html:t}}/>
                </div>
              ))}
              <div className="mt-2 text-[10px] sm:text-xs font-black flex items-center gap-1.5" style={{color:'#39ff7e'}}>
                💡 Si reduce IEP a 390d → +14 vacas en producción → +$8.4M/mes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM KPI CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {kpisBot.map(k=>(
          <div key={k.label} className="rounded-2xl p-3 sm:p-4 relative overflow-hidden transition-all hover:scale-[1.03]"
            style={{background:`linear-gradient(145deg,rgba(${k.g},0.1),rgba(${k.g},0.04),rgba(0,0,0,0.3))`,border:`1px solid rgba(${k.g},0.22)`,borderRadius:18}}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-12 pointer-events-none"
              style={{background:`radial-gradient(circle,rgba(${k.g},1),transparent)`,transform:'translate(40%,-40%)'}}/>
            <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider mb-2" style={{color:`rgba(${k.g},0.65)`}}>{k.label}</div>
            <div className="text-2xl sm:text-3xl font-black leading-none mb-1" style={{color:`rgba(${k.g},1)`,fontFamily:"'Sora',sans-serif"}}>{k.val}</div>
            <div className="text-[9px] sm:text-[10px] text-white/40">{k.sub}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
