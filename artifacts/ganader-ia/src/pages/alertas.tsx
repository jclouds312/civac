import { useAppState } from "../lib/data";
import { Bell, AlertCircle, AlertTriangle, CheckCircle, Info, Check } from "lucide-react";
import { useState } from "react";

const allAlertas = [
  { id: 'a1', tipo: 'CRÍTICO', titulo: '1 animal(es) en tratamiento médico — revisar hoy', desc: 'Perla (A-0712): Antibiótico L.A. día 2/3 — Revisión veterinaria requerida', hace: '1h', type: 'danger' },
  { id: 'a2', tipo: 'ADVERTENCIA', titulo: '4 insumo(s) por debajo del stock mínimo', desc: 'Prostaglandina · Calcio i.v. · Vacuna IBR/BVD · Oxitocina 10UI', hace: '2h', type: 'warning' },
  { id: 'a3', tipo: 'ADVERTENCIA', titulo: '1 potrero(s) deben rotar en menos de 5 días', desc: 'Potrero 4 — Estrella: 3 días restantes · 26/28 animales', hace: '3h', type: 'warning' },
  { id: 'a4', tipo: 'CRÍTICO', titulo: '8 vacas con anestro >90 días', desc: 'IEP promedio 428d → pérdida estimada $8.2M COP/mes — Protocolo GnRH recomendado', hace: '4h', type: 'danger' },
  { id: 'a5', tipo: 'ADVERTENCIA', titulo: 'Parto inminente — Rosaura A-0042 (11 días)', desc: 'Preparar instalaciones de parto · Asignar personal · Revisar protocolo calostro', hace: '5h', type: 'warning' },
  { id: 'a6', tipo: 'ADVERTENCIA', titulo: 'Stock mínimo — Oxitocina: 3/10 unidades', desc: 'Requiere reposición urgente antes del próximo parto programado', hace: '6h', type: 'warning' },
];

export default function Alertas() {
  const { alertas } = useAppState();
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'todas' | 'criticas' | 'advertencias'>('todas');

  const handleResolve = (id: string) => setResolved(prev => new Set([...prev, id]));

  const filtered = allAlertas.filter(a => {
    if (resolved.has(a.id)) return false;
    if (filter === 'criticas') return a.type === 'danger';
    if (filter === 'advertencias') return a.type === 'warning';
    return true;
  });

  const criticas = allAlertas.filter(a => a.type === 'danger' && !resolved.has(a.id)).length;
  const advertencias = allAlertas.filter(a => a.type === 'warning' && !resolved.has(a.id)).length;

  return (
    <div className="space-y-5 pb-8">
      {/* CIVAC Banner */}
      <div className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden civac-animate"
        style={{background:'linear-gradient(135deg,#1a000d 0%,#2e0011 100%)', border:'1px solid rgba(255,0,110,0.4)', boxShadow:'0 0 40px rgba(255,0,110,0.12), inset 0 1px 0 rgba(255,0,110,0.08)'}}>
        <div className="absolute right-0 top-0 w-48 h-full pointer-events-none opacity-10" style={{background:'radial-gradient(ellipse at right, #ff006e, transparent 70%)'}} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{background:'rgba(255,0,110,0.12)', border:'1px solid rgba(255,0,110,0.4)', boxShadow:'0 0 16px rgba(255,0,110,0.2)'}}>
            <Bell size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{fontFamily:'Sora,sans-serif'}}>Alertas y Notificaciones</h1>
            <p className="text-sm" style={{color:'rgba(255,100,150,0.8)'}}>Centro de alertas · Monitoreo continuo · Resolución de eventos</p>
          </div>
        </div>
        <div className="relative flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{background:'rgba(255,0,110,0.2)', border:'1px solid rgba(255,0,110,0.4)', color:'#ff6090'}}>{criticas} Críticas</span>
          <span className="text-xs font-medium px-3 py-1.5 rounded-full" style={{background:'rgba(255,150,0,0.15)', border:'1px solid rgba(255,150,0,0.3)', color:'#ff9500'}}>{advertencias} Advertencias</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'CRÍTICAS ACTIVAS', val:String(criticas), sub:'requieren acción ya', c:'#ff006e' },
          { label:'ADVERTENCIAS', val:String(advertencias), sub:'seguimiento', c:'#ff9500' },
          { label:'RESUELTAS', val:String(resolved.size), sub:'hoy', c:'#39ff7e' },
          { label:'TOTAL', val:String(allAlertas.length), sub:'en el período', c:'#00c8ff' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white relative overflow-hidden"
            style={{background:'linear-gradient(135deg,#020d09,#041208)', border:'1px solid rgba(0,245,212,0.15)'}}>
            <div className="absolute top-0 right-0 w-14 h-14 rounded-full pointer-events-none" style={{background:k.c, opacity:0.18, filter:'blur(18px)', transform:'translate(30%,-30%)'}} />
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{color:'rgba(0,245,212,0.55)'}}>{k.label}</div>
            <div className="text-2xl font-bold" style={{color:k.c, fontFamily:'Sora,sans-serif'}}>{k.val}</div>
            <div className="text-[10px]" style={{color:'rgba(255,255,255,0.4)'}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[['todas','Todas'],['criticas','Críticas'],['advertencias','Advertencias']].map(([val,label]) => (
          <button key={val} onClick={() => setFilter(val as typeof filter)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === val ? 'bg-primary text-white' : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <CheckCircle size={32} className="text-green-400 mx-auto mb-3" />
            <div className="font-semibold text-foreground">¡Todo en orden!</div>
            <div className="text-muted-foreground text-sm mt-1">No hay alertas {filter !== 'todas' ? `de tipo ${filter}` : ''} activas en este momento.</div>
          </div>
        ) : filtered.map(a => (
          <div key={a.id} className={`bg-card border rounded-xl p-5 flex items-start gap-4 ${a.type === 'danger' ? 'border-l-[4px] border-l-red-500 border-border' : 'border-l-[4px] border-l-amber-500 border-border'}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${a.type === 'danger' ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
              {a.type === 'danger'
                ? <AlertCircle size={18} className="text-red-400" />
                : <AlertTriangle size={18} className="text-amber-400" />
              }
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${a.type === 'danger' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{a.tipo}</span>
                  <div className={`font-semibold text-sm ${a.type === 'danger' ? 'text-red-300' : 'text-amber-300'}`}>{a.titulo}</div>
                  <div className="text-xs text-muted-foreground mt-1">{a.desc}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Hace {a.hace}</span>
                  <button onClick={() => handleResolve(a.id)} className="flex items-center gap-1 text-xs font-semibold text-green-400 border border-green-400/30 bg-green-400/5 hover:bg-green-400/10 px-2.5 py-1.5 rounded-lg transition-colors">
                    <Check size={12} /> Resolver
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
