import { useAppState } from "../lib/data";
import { Bell, AlertCircle, AlertTriangle, CheckCircle, Check, X, Zap, Clock, Shield, Printer } from "lucide-react";
import { useState } from "react";
import { printModule } from "@/lib/print";
import { Button } from "@/components/ui/button";

const SEED_ALERTAS = [
  {
    id:'a1', tipo:'CRÍTICO', titulo:'1 animal en tratamiento médico — revisar hoy',
    desc:'Perla (A-0712): Antibiótico L.A. día 2/3 — Revisión veterinaria requerida',
    hace:'1h', type:'danger', modulo:'Inventario', emoji:'🏥',
  },
  {
    id:'a2', tipo:'ADVERTENCIA', titulo:'4 insumos por debajo del stock mínimo',
    desc:'Prostaglandina · Calcio i.v. · Vacuna IBR/BVD · Oxitocina 10UI',
    hace:'2h', type:'warning', modulo:'Insumos', emoji:'💊',
  },
  {
    id:'a3', tipo:'ADVERTENCIA', titulo:'1 potrero debe rotar en menos de 5 días',
    desc:'Potrero 4 — Estrella: 3 días restantes · 26/28 animales recomendados',
    hace:'3h', type:'warning', modulo:'Potreros', emoji:'🌿',
  },
  {
    id:'a4', tipo:'CRÍTICO', titulo:'8 vacas con anestro > 90 días',
    desc:'IEP promedio 428d → pérdida estimada $8.2M COP/mes — Protocolo GnRH recomendado',
    hace:'4h', type:'danger', modulo:'Reproducción', emoji:'🔁',
  },
  {
    id:'a5', tipo:'ADVERTENCIA', titulo:'Parto inminente — Rosaura A-0042 (11 días)',
    desc:'Preparar instalaciones de parto · Asignar personal · Revisar protocolo calostro',
    hace:'5h', type:'warning', modulo:'Reproducción', emoji:'🐣',
  },
  {
    id:'a6', tipo:'ADVERTENCIA', titulo:'Stock mínimo — Oxitocina: 3/10 unidades',
    desc:'Requiere reposición urgente antes del próximo parto programado',
    hace:'6h', type:'warning', modulo:'Insumos', emoji:'⚗️',
  },
];

export default function Alertas() {
  const { alertas } = useAppState();
  const [resolved, setResolved]   = useState<Set<string>>(new Set());
  const [filter, setFilter]       = useState<'todas'|'criticas'|'advertencias'>('todas');
  const [expanding, setExpanding] = useState<string|null>(null);

  const handleResolve = (id:string) => setResolved(prev=>new Set([...prev,id]));

  const filtered = SEED_ALERTAS.filter(a=>{
    if (resolved.has(a.id)) return false;
    if (filter==='criticas')     return a.type==='danger';
    if (filter==='advertencias') return a.type==='warning';
    return true;
  });

  const criticas     = SEED_ALERTAS.filter(a=>a.type==='danger'  && !resolved.has(a.id)).length;
  const advertencias = SEED_ALERTAS.filter(a=>a.type==='warning' && !resolved.has(a.id)).length;
  const resueltas    = resolved.size;

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 civac-animate">

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative overflow-hidden"
        style={{
          background:'linear-gradient(135deg,#1a0008 0%,#2e0011 40%,#3d001a 70%,#1a0008 100%)',
          border:'1px solid rgba(255,77,109,0.35)',
          boxShadow:'0 0 40px rgba(255,77,109,0.12),inset 0 1px 0 rgba(255,77,109,0.1)',
        }}>
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle,rgba(255,77,109,0.2),transparent 65%)'}}/>
        <div className="absolute -left-8 -bottom-12 w-48 h-48 rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle,rgba(255,154,60,0.1),transparent 65%)'}}/>
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{background:'linear-gradient(90deg,transparent,#ff4d6d,#ff9a3c,transparent)'}}/>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{background:'rgba(255,77,109,0.15)',border:'1px solid rgba(255,77,109,0.4)',boxShadow:'0 0 20px rgba(255,77,109,0.35)'}}>
              <Bell size={24} className="text-rose-300"/>
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-white" style={{fontFamily:"'Sora',sans-serif"}}>
                Alertas y Notificaciones
              </h1>
              <p className="text-xs sm:text-sm" style={{color:'rgba(255,130,160,0.8)'}}>
                Centro de alertas · Monitoreo continuo · Resolución de eventos
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {criticas > 0 && (
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-full animate-pulse"
                style={{background:'rgba(255,77,109,0.2)',border:'1px solid rgba(255,77,109,0.4)',color:'#ff7090'}}>
                <AlertCircle size={12}/> {criticas} Críticas
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full"
              style={{background:'rgba(255,154,60,0.15)',border:'1px solid rgba(255,154,60,0.3)',color:'#ff9a3c'}}>
              <AlertTriangle size={12}/> {advertencias} Advertencias
            </span>
            {resueltas > 0 && (
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full"
                style={{background:'rgba(57,255,126,0.12)',border:'1px solid rgba(57,255,126,0.25)',color:'#39ff7e'}}>
                <CheckCircle size={12}/> {resueltas} Resueltas
              </span>
            )}
            <Button size="sm" onClick={() => printModule('Alertas y Notificaciones', 'Centro de alertas activas')}
              className="h-8 gap-1.5 text-xs"
              style={{background:'rgba(255,77,109,0.08)',border:'1px solid rgba(255,77,109,0.25)',color:'#ff4d6d'}}>
              <Printer size={12}/> PDF
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          { label:'Críticas activas', val:String(criticas),     sub:'acción inmediata', c:'#ff4d6d', g:'255,77,109',  icon:<Zap size={14}/> },
          { label:'Advertencias',     val:String(advertencias), sub:'seguimiento',      c:'#ff9a3c', g:'255,154,60',  icon:<AlertTriangle size={14}/> },
          { label:'Resueltas hoy',    val:String(resueltas),    sub:'gestionadas',      c:'#39ff7e', g:'57,255,126',  icon:<CheckCircle size={14}/> },
          { label:'Total período',    val:String(SEED_ALERTAS.length), sub:'registradas', c:'#00c8ff', g:'0,200,255', icon:<Shield size={14}/> },
        ].map(k=>(
          <div key={k.label} className="rounded-2xl p-3 sm:p-4 relative overflow-hidden transition-all hover:scale-[1.03]"
            style={{background:`linear-gradient(145deg,rgba(${k.g},0.12),rgba(${k.g},0.05),rgba(0,0,0,0.3))`,border:`1px solid rgba(${k.g},0.25)`,borderRadius:18}}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-15 pointer-events-none"
              style={{background:`radial-gradient(circle,rgba(${k.g},1),transparent)`,transform:'translate(40%,-40%)'}}/>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider" style={{color:`rgba(${k.g},0.7)`}}>{k.label}</div>
              <div style={{color:`rgba(${k.g},0.5)`}}>{k.icon}</div>
            </div>
            <div className="text-2xl sm:text-3xl font-black" style={{color:`rgba(${k.g},1)`,fontFamily:"'Sora',sans-serif"}}>{k.val}</div>
            <div className="text-[9px] sm:text-[10px] text-white/40">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── FILTER TABS ──────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        {([['todas','Todas las alertas'],['criticas','🔴 Críticas'],['advertencias','🟡 Advertencias']] as const).map(([val,label])=>(
          <button key={val} onClick={()=>setFilter(val)}
            className="px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-sm font-bold transition-all hover:scale-[1.03]"
            style={filter===val
              ?{background:'linear-gradient(135deg,#ff4d6d,#c9184a)',color:'white',boxShadow:'0 0 14px rgba(255,77,109,0.4)'}
              :{background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.07)'}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── ALERT LIST ───────────────────────────────────────────────────── */}
      <div className="space-y-2.5 sm:space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center"
            style={{background:'rgba(3,15,10,0.85)',border:'1px solid rgba(57,255,126,0.15)',borderRadius:20}}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
              style={{background:'rgba(57,255,126,0.1)',border:'1px solid rgba(57,255,126,0.2)'}}>
              ✅
            </div>
            <div className="font-black text-base sm:text-lg text-white mb-2">¡Todo en orden!</div>
            <div className="text-sm text-white/40">
              No hay alertas {filter!=='todas'?`de tipo ${filter} `:''}activas en este momento.
            </div>
          </div>
        ) : filtered.map(a=>{
          const isDanger = a.type==='danger';
          const neon = isDanger ? '#ff4d6d' : '#ff9a3c';
          const glow = isDanger ? '255,77,109' : '255,154,60';
          const expanded = expanding === a.id;
          return (
            <div key={a.id}
              className="rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-200"
              style={{
                background:`linear-gradient(135deg,rgba(${glow},0.07),rgba(${glow},0.03),rgba(0,0,0,0.4))`,
                border:`1px solid rgba(${glow},0.22)`,
                borderLeft:`3px solid ${neon}`,
                borderRadius:20,
                boxShadow:`inset 0 1px 0 rgba(${glow},0.1)`,
              }}>
              <div className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl mt-0.5"
                  style={{background:`rgba(${glow},0.12)`,border:`1px solid rgba(${glow},0.25)`}}>
                  {a.emoji}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{background:`rgba(${glow},0.15)`,color:neon,border:`1px solid rgba(${glow},0.3)`}}>
                          {a.tipo}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-white/30 flex items-center gap-1">
                          <Clock size={9}/> Hace {a.hace}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-white/25 font-medium">{a.modulo}</span>
                      </div>
                      <div className="text-xs sm:text-sm font-black leading-snug mb-1" style={{color:neon}}>
                        {a.titulo}
                      </div>
                      <div className="text-[10px] sm:text-xs text-white/45 leading-relaxed">{a.desc}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={()=>handleResolve(a.id)}
                        className="flex items-center gap-1 text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-1.5 rounded-xl transition-all hover:scale-105"
                        style={{background:'rgba(57,255,126,0.1)',border:'1px solid rgba(57,255,126,0.25)',color:'#39ff7e'}}>
                        <Check size={11}/> Resolver
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Resueltas ──────────────────────────────────────────────────── */}
      {resueltas > 0 && (
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5"
          style={{background:'rgba(3,20,10,0.6)',border:'1px solid rgba(57,255,126,0.12)',borderRadius:20}}>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black mb-3" style={{color:'#39ff7e'}}>
            <CheckCircle size={15}/> {resueltas} alerta(s) resuelta(s) esta sesión
          </div>
          <div className="text-[10px] sm:text-xs text-white/35 leading-relaxed">
            Las alertas resueltas quedan registradas en el historial del módulo correspondiente.
            En una implementación con BD, se persistirían con sello de tiempo y usuario responsable.
          </div>
        </div>
      )}
    </div>
  );
}
