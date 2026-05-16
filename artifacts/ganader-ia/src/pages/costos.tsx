import { Download, Plus, TrendingUp, TrendingDown, DollarSign, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

const fmt = (n:number) => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
const fmtM = (n:number) => `$${(n/1000000).toFixed(1)}M`;

const ingresos = [
  { concepto:'Venta leche 56,040L × $1,250', val:70050000, pct:82 },
  { concepto:'Venta ganado (4 cabezas)',      val:12500000, pct:15 },
  { concepto:'Venta embriones (3 lotes)',     val: 3200000, pct:4  },
];
const egresos = [
  { concepto:'Alimentación / concentrados', val:22400000, pct:49, c:'#39ff7e'  },
  { concepto:'Nómina y prestaciones',       val:17200000, pct:38, c:'#00c8ff'  },
  { concepto:'Medicamentos y sanidad',      val: 3800000, pct:8,  c:'#ff9a3c'  },
  { concepto:'Mantenimiento y servicios',   val: 2100000, pct:5,  c:'#fbbf24'  },
];
const costoLitro = [
  { concepto:'Alimentación', pct:49, valor:400, c:'#39ff7e', g:'57,255,126'   },
  { concepto:'Nómina',       pct:31, valor:254, c:'#00c8ff', g:'0,200,255'    },
  { concepto:'Medicamentos', pct: 8, valor: 68, c:'#ff9a3c', g:'255,154,60'   },
  { concepto:'Otros',        pct:12, valor: 98, c:'#fbbf24', g:'251,191,36'   },
];
const dataBar = [
  { name:'Oct', ing:72, egr:40 },{ name:'Nov', ing:78, egr:42 },
  { name:'Dic', ing:81, egr:44 },{ name:'Ene', ing:86, egr:46 },
  { name:'Feb', ing:83, egr:43 },{ name:'Mar', ing:80, egr:44 },
  { name:'Abr', ing:86, egr:46 },
];

const totalIngresos = ingresos.reduce((s,r)=>s+r.val,0);
const totalEgresos  = egresos.reduce((s,r)=>s+r.val,0);
const utilidad      = totalIngresos - totalEgresos;
const margen        = Math.round(utilidad/totalIngresos*100);

const TIP = { backgroundColor:'#030f0b', border:'1px solid rgba(52,211,153,0.2)', color:'#e2e8f0', borderRadius:'12px', fontSize:'12px' };

export default function Costos() {
  return (
    <div className="space-y-4 sm:space-y-5 pb-8 civac-animate">

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative overflow-hidden"
        style={{
          background:'linear-gradient(135deg,#001a0f 0%,#002e1a 40%,#002a18 70%,#001a12 100%)',
          border:'1px solid rgba(52,211,153,0.3)',
          boxShadow:'0 0 40px rgba(52,211,153,0.08),inset 0 1px 0 rgba(52,211,153,0.12)',
        }}>
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle,rgba(52,211,153,0.18),transparent 65%)'}}/>
        <div className="absolute -left-8 -bottom-12 w-48 h-48 rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle,rgba(0,245,212,0.1),transparent 65%)'}}/>
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{background:'linear-gradient(90deg,transparent,#34d399,#00f5d4,transparent)'}}/>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"
              style={{background:'linear-gradient(135deg,rgba(52,211,153,0.2),rgba(52,211,153,0.06))',border:'1px solid rgba(52,211,153,0.4)',boxShadow:'0 0 20px rgba(52,211,153,0.3)'}}>
              💰
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-white" style={{fontFamily:"'Sora',sans-serif"}}>
                  Costos y Estado de Resultados
                </h1>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-black"
                  style={{background:'rgba(52,211,153,0.15)',color:'#34d399',border:'1px solid rgba(52,211,153,0.3)'}}>
                  Margen {margen}%
                </span>
              </div>
              <p className="text-xs sm:text-sm" style={{color:'rgba(52,211,153,0.7)'}}>
                Rentabilidad y análisis financiero mensual · P&G detallado
              </p>
            </div>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-xs sm:text-sm"
            style={{background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.3)',color:'#34d399'}}>
            <Download size={13}/> Exportar P&G
          </Button>
        </div>
      </div>

      {/* ── KPI CARDS ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {[
          { label:'Ingresos',      val:fmtM(totalIngresos), sub:'total mes',       c:'#39ff7e', g:'57,255,126',  icon:<TrendingUp size={14}/>, up:true  },
          { label:'Egresos',       val:fmtM(totalEgresos),  sub:'total mes',       c:'#ff4d6d', g:'255,77,109',  icon:<TrendingDown size={14}/>, up:false },
          { label:'Utilidad neta', val:fmtM(utilidad),      sub:`${margen}% margen`, c:'#00f5d4', g:'0,245,212', icon:<DollarSign size={14}/>, up:true  },
          { label:'Costo/litro',   val:'$820',              sub:'Meta: $800/L',    c:'#ff9a3c', g:'255,154,60',  icon:<BarChart2 size={14}/>, up:false },
          { label:'Margen/litro',  val:'$430',              sub:'34.4% sobre precio', c:'#a855f7', g:'168,85,247', icon:<TrendingUp size={14}/>, up:true },
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
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px]" style={{color:k.up?'rgba(57,255,126,0.7)':'rgba(255,77,109,0.7)'}}>
              {k.up?<TrendingUp size={9}/>:<TrendingDown size={9}/>}
              <span>{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── P&G + CHART ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

        {/* P&G Detallado */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden"
          style={{border:'1px solid rgba(52,211,153,0.15)',borderRadius:20}}>
          <div className="px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between"
            style={{background:'linear-gradient(135deg,#001a0f,#002e1a)',borderBottom:'1px solid rgba(52,211,153,0.15)'}}>
            <div className="font-black text-sm sm:text-base text-white flex items-center gap-2">
              <span>📊</span> P&G Detallado
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" className="h-8 gap-1 text-[10px] sm:text-xs"
                style={{background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.2)',color:'#34d399'}}>
                <Download size={11}/> CSV
              </Button>
              <Button size="sm" className="h-8 gap-1 text-[10px] sm:text-xs"
                style={{background:'rgba(52,211,153,0.15)',border:'1px solid rgba(52,211,153,0.3)',color:'white'}}>
                <Plus size={11}/> Registro
              </Button>
            </div>
          </div>
          <div className="p-4 sm:p-5 space-y-4" style={{background:'rgba(3,15,10,0.85)'}}>
            {/* Ingresos */}
            <div>
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2.5 flex items-center gap-2" style={{color:'#39ff7e'}}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#39ff7e] inline-block"/>
                Ingresos
              </div>
              <div className="space-y-1.5">
                {ingresos.map(r=>(
                  <div key={r.concepto} className="py-2 border-b last:border-0" style={{borderColor:'rgba(255,255,255,0.05)'}}>
                    <div className="flex justify-between items-center text-xs sm:text-sm mb-1.5">
                      <span className="text-white/55 pr-2">{r.concepto}</span>
                      <span className="font-black text-white flex-shrink-0">{fmtM(r.val)}</span>
                    </div>
                    <div className="h-1 rounded-full" style={{background:'rgba(57,255,126,0.1)'}}>
                      <div className="h-full rounded-full" style={{width:`${r.pct}%`,background:'linear-gradient(90deg,#39ff7e,#34d399)'}}/>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2.5 mt-1 rounded-xl px-3"
                  style={{background:'rgba(57,255,126,0.08)',border:'1px solid rgba(57,255,126,0.15)'}}>
                  <span className="font-black text-sm text-white">Total ingresos</span>
                  <span className="font-black text-base sm:text-lg" style={{color:'#39ff7e'}}>{fmtM(totalIngresos)}</span>
                </div>
              </div>
            </div>

            {/* Egresos */}
            <div>
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2.5 flex items-center gap-2" style={{color:'#ff4d6d'}}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d6d] inline-block"/>
                Egresos
              </div>
              <div className="space-y-1.5">
                {egresos.map(r=>(
                  <div key={r.concepto} className="py-2 border-b last:border-0" style={{borderColor:'rgba(255,255,255,0.05)'}}>
                    <div className="flex justify-between items-center text-xs sm:text-sm mb-1.5">
                      <span className="text-white/55 pr-2">{r.concepto}</span>
                      <span className="font-black" style={{color:'#ff4d6d'}}>({fmtM(r.val)})</span>
                    </div>
                    <div className="h-1 rounded-full" style={{background:'rgba(255,77,109,0.1)'}}>
                      <div className="h-full rounded-full" style={{width:`${r.pct}%`,background:'linear-gradient(90deg,#ff4d6d,#c9184a)'}}/>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2.5 mt-1 rounded-xl px-3"
                  style={{background:'rgba(255,77,109,0.08)',border:'1px solid rgba(255,77,109,0.15)'}}>
                  <span className="font-black text-sm text-white">Total egresos</span>
                  <span className="font-black text-base sm:text-lg" style={{color:'#ff4d6d'}}>({fmtM(totalEgresos)})</span>
                </div>
              </div>
            </div>

            {/* Utilidad */}
            <div className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              style={{background:'linear-gradient(135deg,rgba(0,245,212,0.1),rgba(52,211,153,0.06))',border:'1px solid rgba(0,245,212,0.25)'}}>
              <div>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1" style={{color:'rgba(0,245,212,0.6)'}}>
                  UTILIDAD NETA
                </div>
                <div className="text-2xl sm:text-3xl font-black" style={{color:'#00f5d4',fontFamily:"'Sora',sans-serif"}}>
                  {fmtM(utilidad)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black" style={{color:'#39ff7e'}}>{margen}%</div>
                <div className="text-[10px] sm:text-xs text-white/40">margen sobre ingresos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Costo por litro + Gráfico */}
        <div className="space-y-3 sm:space-y-4">
          {/* Costo por litro */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5"
            style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(255,154,60,0.18)',borderRadius:20}}>
            <div className="font-black text-sm sm:text-base text-white mb-4">Costo por litro producido</div>
            <div className="space-y-3">
              {costoLitro.map(c=>(
                <div key={c.concepto}>
                  <div className="flex justify-between text-[10px] sm:text-xs mb-1.5">
                    <span className="text-white/50">{c.concepto}</span>
                    <span className="font-black" style={{color:c.c}}>${c.valor}/L <span className="text-white/30">({c.pct}%)</span></span>
                  </div>
                  <div className="h-2 sm:h-2.5 rounded-full" style={{background:'rgba(255,255,255,0.06)'}}>
                    <div className="h-full rounded-full" style={{
                      width:`${c.pct}%`,
                      background:`linear-gradient(90deg,rgba(${c.g},0.9),rgba(${c.g},0.5))`,
                      boxShadow:`0 0 6px rgba(${c.g},0.4)`,
                    }}/>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs sm:text-sm"
              style={{borderColor:'rgba(255,255,255,0.06)'}}>
              <span className="text-white/40">Total costo/litro</span>
              <div>
                <span className="font-black text-white">$820/L</span>
                <span className="text-white/30 text-[10px] ml-1.5">· Meta $800/L</span>
              </div>
            </div>
          </div>

          {/* Margen por litro */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5"
            style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(0,245,212,0.15)',borderRadius:20}}>
            <div className="font-black text-sm sm:text-base text-white mb-3">Margen neto por litro</div>
            <div className="grid grid-cols-5 gap-2 items-center text-center mb-4">
              <div className="col-span-2 rounded-xl sm:rounded-2xl p-2.5 sm:p-3"
                style={{background:'rgba(57,255,126,0.08)',border:'1px solid rgba(57,255,126,0.2)'}}>
                <div className="text-[9px] sm:text-[10px] text-white/40 mb-1">Precio</div>
                <div className="text-lg sm:text-xl font-black" style={{color:'#39ff7e'}}>$1.250</div>
              </div>
              <div className="text-xl sm:text-2xl text-white/30 font-light">−</div>
              <div className="col-span-2 rounded-xl sm:rounded-2xl p-2.5 sm:p-3"
                style={{background:'rgba(255,77,109,0.08)',border:'1px solid rgba(255,77,109,0.2)'}}>
                <div className="text-[9px] sm:text-[10px] text-white/40 mb-1">Costo</div>
                <div className="text-lg sm:text-xl font-black" style={{color:'#ff4d6d'}}>$820</div>
              </div>
            </div>
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center"
              style={{background:'rgba(0,245,212,0.08)',border:'1px solid rgba(0,245,212,0.2)'}}>
              <div className="text-[10px] text-white/40 mb-1">Margen por litro</div>
              <div className="text-2xl sm:text-3xl font-black" style={{color:'#00f5d4',fontFamily:"'Sora',sans-serif"}}>$430/L</div>
              <div className="text-[10px] text-white/30 mt-1">56.040 L × $430 = $24.1M utilidad leche</div>
            </div>
          </div>

          {/* Mini bar chart */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5"
            style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(52,211,153,0.12)',borderRadius:20}}>
            <div className="font-black text-xs sm:text-sm text-white mb-3">📈 Ing. vs Egr. — últimos 7 meses</div>
            <div className="h-32 sm:h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataBar} margin={{top:0,right:8,left:0,bottom:0}}>
                  <defs>
                    <linearGradient id="gIng" x1="0" y1="0" x2="0" y2="1">
                      <stop stopColor="#39ff7e"/><stop offset="1" stopColor="#00c850" stopOpacity={0.5}/>
                    </linearGradient>
                    <linearGradient id="gEgr" x1="0" y1="0" x2="0" y2="1">
                      <stop stopColor="#ff4d6d"/><stop offset="1" stopColor="#c9184a" stopOpacity={0.5}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                  <XAxis dataKey="name" stroke="transparent" tick={{fill:'rgba(255,255,255,0.4)',fontSize:10}}/>
                  <YAxis stroke="transparent" tick={{fill:'rgba(255,255,255,0.4)',fontSize:10}} width={32}/>
                  <RTooltip contentStyle={TIP} formatter={(v:any,n:any)=>[`$${v}M`,n==='ing'?'Ingresos':'Egresos']}/>
                  <Bar dataKey="ing" fill="url(#gIng)" radius={[5,5,0,0]}/>
                  <Bar dataKey="egr" fill="url(#gEgr)" radius={[5,5,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
