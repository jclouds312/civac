/**
 * CIVAC GPS Chips — Panel de gestión de dispositivos GPS
 * Conecta con Django GPS Server via /api/gps/*
 * Muestra límites por plan, chips activos, catálogo y alertas
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth, PLAN_COLOR, PLAN_LABEL, type PlanId } from "@/lib/auth";
import { Link } from "wouter";
import {
  Satellite, MapPin, Wifi, WifiOff, Battery, BatteryLow,
  BatteryWarning, Plus, Trash2, Edit, RefreshCw, AlertTriangle,
  CheckCircle2, ShoppingBag, ChevronRight, Signal, Radio,
  Zap, Clock, Package, Crown, Lock, Activity, Navigation,
  BarChart3, Shield, Star, TrendingUp, Eye, X, Save,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────────────────────── */
interface DjangoDevice {
  id: number; nombre: string; imei: string; tipo: string;
  plan_required: string; animal_id: string; animal_nombre: string;
  vinculado: boolean; fecha_vinculo: string | null; potrero_id: number | null;
  lat: number | null; lng: number | null; precision: number | null;
  velocidad: number; altitud: number | null;
  bateria: number; activo: boolean; status: string;
  network_type: string; signal_strength: number; firmware_version: string;
  ultima_actualizacion: string; tiempo_desde_update: number;
  posicion_count: number;
}
interface DjangoAlert {
  id: number; device: number; device_nombre: string; animal_nombre: string;
  tipo: string; severidad: string; mensaje: string;
  lat: number | null; lng: number | null; timestamp: string; resuelta: boolean;
}
interface ChipModel {
  marca: string; modelo: string; tipo: string; precio: number;
  plan_min: string; desc: string;
}
interface PlanInfo {
  id: string; limit: number; precio_plan: number; label: string; descripcion: string;
}

/* ── Plan GPS limits ────────────────────────────────────────────────────── */
const GPS_LIMITS: Record<string, number> = { basico:0, pro:5, premium:20, platino:999 };
const GPS_ICON: Record<string, string>   = { basico:'❌', pro:'📡', premium:'🛰️', platino:'🌐' };

const TIPO_LABEL: Record<string, string> = {
  'collar-gps':'Collar GPS-LTE','collar-bt':'Collar BT','bolus':'Bolo Ruminal','oreja':'Caravana RFID',
};
const TIPO_EMOJI: Record<string, string> = {
  'collar-gps':'📡','collar-bt':'🔵','bolus':'💊','oreja':'🏷️',
};
const STATUS_STYLE: Record<string, { color:string; label:string; bg:string }> = {
  active:   { color:'#39ff7e', label:'Activo',     bg:'rgba(57,255,126,0.1)' },
  inactive: { color:'#94a3b8', label:'Inactivo',   bg:'rgba(148,163,184,0.1)' },
  lost:     { color:'#ff4d6d', label:'Sin señal',  bg:'rgba(255,77,109,0.1)' },
  charging: { color:'#fbbf24', label:'Cargando',   bg:'rgba(251,191,36,0.1)' },
};
const SEVER_COLOR: Record<string, string> = {
  info:'#00c8ff', warning:'#fbbf24', critical:'#ff4d6d',
};

function fmt(n: number) { return n.toLocaleString('es-CO'); }
function timeSince(secs: number): string {
  if (secs < 60)  return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs/60)}m`;
  return `${Math.floor(secs/3600)}h`;
}
function BatIcon({ pct }: { pct: number }) {
  const C = pct <= 10 ? BatteryLow : pct <= 25 ? BatteryWarning : Battery;
  const c = pct <= 10 ? '#ff4d6d' : pct <= 25 ? '#fbbf24' : '#39ff7e';
  return <C size={13} style={{ color:c }} />;
}

/* ── GPS Chips Plan Banner ───────────────────────────────────────────────── */
function PlanGPSBanner({ plan, used, limit }: { plan:string; used:number; limit:number }) {
  const pc   = PLAN_COLOR[(plan as PlanId)] ?? '#94a3b8';
  const pct  = limit === 0 ? 0 : limit >= 999 ? 100 : Math.min(100, (used/limit)*100);
  const free = limit >= 999 ? '∞' : String(Math.max(0, limit - used));
  const barColor = pct >= 90 ? '#ff4d6d' : pct >= 70 ? '#fbbf24' : '#39ff7e';
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background:`linear-gradient(135deg,rgba(5,15,40,0.95),rgba(8,20,55,0.90))`, border:`1px solid rgba(${plan==='pro'?'0,245,212':'168,85,247'},0.25)` }}>
      <div className="absolute right-0 top-0 h-full w-40 opacity-10 pointer-events-none"
        style={{ background:`radial-gradient(ellipse at right, ${pc}, transparent 70%)` }} />
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
            style={{ background:`linear-gradient(135deg,${pc}22,${pc}10)`, border:`1px solid ${pc}33` }}>
            {GPS_ICON[plan] ?? '📡'}
          </div>
          <div>
            <h2 className="font-black text-white text-base leading-none">GPS Chips Plan <span style={{color:pc}}>{PLAN_LABEL[plan as PlanId] ?? plan}</span></h2>
            <p className="text-[10px] mt-0.5" style={{ color:`${pc}80` }}>
              {limit === 0 ? 'Sin soporte GPS — Actualiza tu plan' : limit >= 999 ? 'Chips ilimitados · Instancia dedicada' : `${used} / ${limit} chips activos · ${free} disponibles`}
            </p>
          </div>
        </div>
        {limit > 0 && (
          <div className="text-right">
            <span className="text-2xl font-black" style={{color:pc}}>{used}</span>
            <span className="text-sm text-white/40">/{limit>=999?'∞':limit}</span>
            <p className="text-[9px] text-white/30 mt-0.5">chips registrados</p>
          </div>
        )}
      </div>
      {limit > 0 && limit < 999 && (
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.08)'}}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width:`${pct}%`, background:`linear-gradient(90deg,${barColor},${barColor}99)`, boxShadow:`0 0 8px ${barColor}80` }} />
        </div>
      )}
      {limit === 0 && (
        <Link href="/planes">
          <button className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all hover:scale-[1.02]"
            style={{ background:`linear-gradient(135deg,#00f5d4,#00a896)`, color:'#000' }}>
            <Zap size={12}/> Actualizar a Plan PRO — 5 GPS chips incluidos
          </button>
        </Link>
      )}
    </div>
  );
}

/* ── Device Card ─────────────────────────────────────────────────────────── */
function DeviceCard({ dev, onDelete, onResolveAlert }: {
  dev: DjangoDevice;
  onDelete: (id:number) => void;
  onResolveAlert?: () => void;
}) {
  const st = STATUS_STYLE[dev.status] ?? STATUS_STYLE.inactive;
  return (
    <div className="rounded-2xl p-4 relative overflow-hidden transition-all hover:scale-[1.005]"
      style={{ background:'linear-gradient(135deg,rgba(5,15,40,0.95),rgba(8,20,55,0.9))', border:`1px solid rgba(255,255,255,0.07)` }}>
      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background:st.color, opacity:0.5 }} />

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background:st.bg, border:`1px solid ${st.color}30` }}>
          {TIPO_EMOJI[dev.tipo] ?? '📡'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-sm text-white leading-none">{dev.nombre}</span>
            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background:st.bg, color:st.color }}>{st.label}</span>
            {dev.animal_nombre && (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background:'rgba(0,200,255,0.1)', color:'#00c8ff', border:'1px solid rgba(0,200,255,0.2)' }}>
                🐄 {dev.animal_nombre}
              </span>
            )}
          </div>
          <p className="text-[9px] text-white/35 mt-0.5 font-mono">{dev.imei}</p>
        </div>
        <button onClick={() => onDelete(dev.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex-shrink-0">
          <Trash2 size={12}/>
        </button>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        {[
          { ico: <BatIcon pct={dev.bateria}/>, val:`${dev.bateria}%`,    lab:'Batería' },
          { ico: <Signal size={12} style={{color:'#39ff7e'}}/>,  val:`${dev.signal_strength}%`, lab:'Señal' },
          { ico: <Navigation size={12} style={{color:'#00c8ff'}}/>, val:dev.lat ? `${dev.lat.toFixed(4)}` : '—', lab:'Lat' },
          { ico: <Clock size={12} style={{color:'#a855f7'}}/>,    val:timeSince(dev.tiempo_desde_update), lab:'Última act.' },
        ].map(({ ico, val, lab }) => (
          <div key={lab} className="text-center rounded-xl py-1.5" style={{ background:'rgba(255,255,255,0.03)' }}>
            <div className="flex justify-center mb-0.5">{ico}</div>
            <p className="text-[11px] font-black text-white leading-none">{val}</p>
            <p className="text-[8px] text-white/25 mt-0.5">{lab}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-3 text-[9px] text-white/30 flex-wrap">
        <span>{TIPO_LABEL[dev.tipo] ?? dev.tipo}</span>
        <span>·</span>
        <span>{dev.network_type}</span>
        <span>·</span>
        <span>FW {dev.firmware_version}</span>
        {dev.potrero_id && <><span>·</span><span>Potrero {dev.potrero_id}</span></>}
        <span className="ml-auto">{dev.posicion_count} posiciones</span>
      </div>
    </div>
  );
}

/* ── Chip Catalog Card ───────────────────────────────────────────────────── */
function ChipCatalogCard({ chip, plan }: { chip: ChipModel; plan: string }) {
  const planOrder = ['basico','pro','premium','platino'];
  const locked = planOrder.indexOf(chip.plan_min) > planOrder.indexOf(plan);
  const planC  = PLAN_COLOR[chip.plan_min as PlanId] ?? '#94a3b8';
  return (
    <div className="rounded-2xl p-4 transition-all hover:scale-[1.01]"
      style={{
        background:'linear-gradient(135deg,rgba(5,15,40,0.95),rgba(8,20,55,0.9))',
        border:`1px solid rgba(255,255,255,${locked?'0.05':'0.10'})`,
        opacity: locked ? 0.55 : 1,
      }}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{TIPO_EMOJI[chip.tipo] ?? '📡'}</span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-xs text-white leading-none">{chip.modelo}</p>
          <p className="text-[9px] text-white/40 mt-0.5">{chip.marca}</p>
          <p className="text-[9px] text-white/55 mt-1.5 leading-relaxed">{chip.desc}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div>
          <span className="text-sm font-black text-white">${fmt(chip.precio)}</span>
          <span className="text-[9px] text-white/30 ml-1">COP/unidad</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background:`${planC}15`, color:planC, border:`1px solid ${planC}30` }}>
            {locked ? <><Lock size={6} className="inline mr-0.5"/></> : '✓ '}
            {PLAN_LABEL[chip.plan_min as PlanId] ?? chip.plan_min}+
          </span>
          {!locked && (
            <button className="px-2.5 py-1 rounded-lg text-[9px] font-black transition-all hover:scale-[1.03]"
              style={{ background:'linear-gradient(135deg,#00f5d4,#00a896)', color:'#000' }}>
              Adquirir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function GpsChips() {
  const { user } = useAuth();
  const plan  = (user?.plan ?? 'pro') as PlanId;
  const limit = GPS_LIMITS[plan] ?? 0;

  const [devices,  setDevices]  = useState<DjangoDevice[]>([]);
  const [alerts,   setAlerts]   = useState<DjangoAlert[]>([]);
  const [catalog,  setCatalog]  = useState<ChipModel[]>([]);
  const [plans,    setPlans]    = useState<PlanInfo[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string|null>(null);
  const [activeTab,setActiveTab]= useState<'dispositivos'|'catalogo'|'alertas'|'planes'>('dispositivos');
  const [showAdd,  setShowAdd]  = useState(false);
  const [adding,   setAdding]   = useState(false);
  const [refreshTs,setRefreshTs]= useState(Date.now());
  const pollRef = useRef<number | null>(null);

  // Form state
  const [form, setForm] = useState({
    nombre:'', imei:'', tipo:'collar-gps', animal_id:'', animal_nombre:'', potrero_id: 1,
  });

  const fetchData = useCallback(async () => {
    try {
      const [devRes, alertRes, planRes] = await Promise.all([
        fetch(`/api/gps/devices/?plan=${plan}`),
        fetch('/api/gps/alerts/?only_active=true'),
        fetch('/api/gps/plans/'),
      ]);
      if (!devRes.ok) throw new Error('GPS Server no disponible');
      const [devData, alertData, planData] = await Promise.all([
        devRes.json(), alertRes.json(), planRes.json(),
      ]);
      if (devData.ok)   setDevices(devData.devices);
      if (alertData.ok) setAlerts(alertData.alerts);
      if (planData.ok)  { setCatalog(planData.chip_catalog); setPlans(planData.plans); }
      setError(null);
    } catch(e) {
      setError(e instanceof Error ? e.message : 'Error de conexión con GPS Server');
    } finally {
      setLoading(false);
    }
  }, [plan]);

  useEffect(() => {
    fetchData();
    pollRef.current = window.setInterval(fetchData, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchData, refreshTs]);

  const handleAdd = async () => {
    if (!form.nombre || !form.imei) return;
    setAdding(true);
    try {
      const res = await fetch('/api/gps/devices/', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...form, plan_required: plan, vinculado: !!form.animal_id, plan }),
      });
      const data = await res.json();
      if (data.ok) {
        setDevices(prev => [data.device, ...prev]);
        setShowAdd(false);
        setForm({ nombre:'', imei:'', tipo:'collar-gps', animal_id:'', animal_nombre:'', potrero_id:1 });
      } else {
        setError(data.error || 'Error al registrar chip');
      }
    } catch(e) {
      setError('Error al conectar con GPS Server');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/gps/devices/${id}/`, { method:'DELETE' });
      setDevices(prev => prev.filter(d => d.id !== id));
    } catch(e) {
      setError('Error al eliminar dispositivo');
    }
  };

  const handleResolveAlert = async (id: number) => {
    try {
      await fetch(`/api/gps/alerts/${id}/`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:'{}' });
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch(e) {
      setError('Error al resolver alerta');
    }
  };

  const used = devices.filter(d => d.vinculado).length;

  return (
    <div className="space-y-5 pb-14">

      {/* ── Banner ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background:'linear-gradient(135deg,#020d1a,#0a2745 50%,#020d1a)', border:'1px solid rgba(0,200,255,0.2)', boxShadow:'0 0 60px rgba(0,200,255,0.06)' }}>
        <div className="absolute right-0 top-0 w-56 h-full opacity-10 pointer-events-none"
          style={{ background:'radial-gradient(ellipse at right,#00c8ff,transparent 70%)' }} />
        <div className="absolute left-0 bottom-0 w-32 h-32 opacity-5 pointer-events-none"
          style={{ background:'radial-gradient(circle,#a855f7,transparent 70%)' }} />
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background:'linear-gradient(135deg,#00c8ff,#1d4ed8)', boxShadow:'0 0 28px rgba(0,200,255,0.45)', color:'white' }}>
            <Satellite size={26}/>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-2xl text-white" style={{ fontFamily:"'Sora',sans-serif" }}>
                GPS <span style={{ color:'#00c8ff', textShadow:'0 0 20px rgba(0,200,255,0.8)' }}>Chips</span>
              </h1>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ background:'linear-gradient(135deg,#00c8ff,#1d4ed8)', color:'white' }}>DJANGO API</span>
              <div className="flex items-center gap-1 text-[9px] font-bold" style={{ color:'#39ff7e' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#39ff7e] animate-pulse"/>
                Django 6 · DRF · SQLite
              </div>
            </div>
            <p className="text-sm mt-1" style={{ color:'rgba(0,200,255,0.55)' }}>
              Gestión de chips GPS reales · Rastreo bovino · Geovallado por plan
            </p>
            <div className="flex items-center gap-4 mt-2.5 flex-wrap">
              {[['📡',`${devices.length}`,'Chips registrados'],['✅',`${devices.filter(d=>d.activo).length}`,'En línea'],['🚨',`${alerts.length}`,'Alertas activas'],['⚡',`${limit>=999?'∞':limit}`,'Límite plan']].map(([ico,val,lab]) => (
                <div key={lab} className="flex items-center gap-1.5">
                  <span>{ico}</span>
                  <div><p className="text-[12px] font-black text-white leading-none">{val}</p><p className="text-[9px]" style={{ color:'rgba(0,200,255,0.4)' }}>{lab}</p></div>
                </div>
              ))}
              <button onClick={() => setRefreshTs(Date.now())}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold hover:scale-[1.03] transition-all"
                style={{ background:'rgba(0,200,255,0.1)', border:'1px solid rgba(0,200,255,0.25)', color:'#00c8ff' }}>
                <RefreshCw size={10} className={loading?'animate-spin':''}/>{loading?'Cargando…':'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plan GPS banner */}
      <PlanGPSBanner plan={plan} used={used} limit={limit}/>

      {/* Error */}
      {error && (
        <div className="rounded-2xl px-4 py-3 flex items-center gap-2 text-xs"
          style={{ background:'rgba(255,77,109,0.08)', border:'1px solid rgba(255,77,109,0.2)', color:'#ff4d6d' }}>
          <AlertTriangle size={14}/><span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X size={12}/></button>
        </div>
      )}

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {([['dispositivos','📡 Dispositivos'],['catalogo','🛒 Catálogo chips'],['alertas','🚨 Alertas'],['planes','💎 GPS por Plan']] as [string,string][]).map(([id,lbl]) => (
          <button key={id} onClick={() => setActiveTab(id as 'dispositivos'|'catalogo'|'alertas'|'planes')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all"
            style={{
              background: activeTab===id ? 'rgba(0,200,255,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeTab===id ? 'rgba(0,200,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
              color: activeTab===id ? '#00c8ff' : 'rgba(255,255,255,0.45)',
            }}>
            {lbl}
            {id==='alertas' && alerts.length > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full ml-1" style={{ background:'rgba(255,77,109,0.9)', color:'white' }}>{alerts.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Dispositivos ─────────────────────────────────────────────── */}
      {activeTab === 'dispositivos' && (
        <div className="space-y-3">
          {/* Add button */}
          {limit > 0 && used < limit && (
            <button onClick={() => setShowAdd(v => !v)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all hover:scale-[1.01] border-2 border-dashed"
              style={{ borderColor:'rgba(0,200,255,0.2)', color:'rgba(0,200,255,0.5)', background:'rgba(0,200,255,0.03)' }}>
              <Plus size={16}/> Registrar nuevo chip GPS
            </button>
          )}
          {limit > 0 && used >= limit && limit < 999 && (
            <div className="rounded-2xl p-3 text-center text-xs" style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', color:'#fbbf24' }}>
              Límite de {limit} chips alcanzado. <Link href="/planes"><span className="underline cursor-pointer">Mejora tu plan</span></Link> para agregar más.
            </div>
          )}

          {/* Add form */}
          {showAdd && (
            <div className="rounded-2xl p-5 space-y-3" style={{ background:'rgba(0,200,255,0.04)', border:'1px solid rgba(0,200,255,0.2)' }}>
              <p className="font-black text-sm text-white mb-3">Registrar nuevo chip GPS</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key:'nombre', label:'Nombre del chip', placeholder:'Collar Pepita' },
                  { key:'imei',   label:'IMEI / ID', placeholder:'354071230987658' },
                  { key:'animal_id',   label:'ID Animal (opcional)', placeholder:'A-0099' },
                  { key:'animal_nombre', label:'Nombre animal (opcional)', placeholder:'Pepita' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold text-white/50 mb-1">{label}</label>
                    <input value={(form as Record<string,string|number>)[key] as string}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 rounded-xl text-xs text-white outline-none"
                      style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}/>
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-bold text-white/50 mb-1">Tipo de dispositivo</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo:e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white outline-none"
                    style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
                    {[['collar-gps','📡 Collar GPS-LTE'],['collar-bt','🔵 Collar Bluetooth'],['bolus','💊 Bolo Ruminal'],['oreja','🏷️ Caravana RFID']].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/50 mb-1">Potrero inicial</label>
                  <select value={form.potrero_id} onChange={e => setForm(f => ({ ...f, potrero_id:Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white outline-none"
                    style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
                    {[1,2,3,4,5,6].map(p => <option key={p} value={p}>Potrero {p}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={handleAdd} disabled={adding || !form.nombre || !form.imei}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl font-black text-xs transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background:'linear-gradient(135deg,#00c8ff,#1d4ed8)', color:'white' }}>
                  <Save size={13}/>{adding ? 'Guardando…' : 'Guardar chip'}
                </button>
                <button onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-xl font-bold text-xs"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.4)' }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {loading ? (
            Array(3).fill(0).map((_,i) => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background:'rgba(255,255,255,0.04)' }}/>)
          ) : devices.length === 0 ? (
            <div className="rounded-2xl py-12 text-center">
              <Satellite size={36} className="mx-auto mb-3" style={{ color:'rgba(0,200,255,0.3)' }}/>
              <p className="text-white/40 text-sm">Sin chips registrados</p>
              <p className="text-white/20 text-xs mt-1">Tu plan {PLAN_LABEL[plan]} soporta hasta {limit} chips GPS</p>
            </div>
          ) : (
            devices.map(dev => (
              <DeviceCard key={dev.id} dev={dev} onDelete={handleDelete}/>
            ))
          )}
        </div>
      )}

      {/* ── Tab: Catálogo ─────────────────────────────────────────────────── */}
      {activeTab === 'catalogo' && (
        <div className="space-y-3">
          <p className="text-xs text-white/40 px-1">Chips GPS homologados para Colombia · Precios de referencia COP</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {catalog.map((c, i) => <ChipCatalogCard key={i} chip={c} plan={plan}/>)}
          </div>
        </div>
      )}

      {/* ── Tab: Alertas ──────────────────────────────────────────────────── */}
      {activeTab === 'alertas' && (
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="rounded-2xl py-10 text-center">
              <CheckCircle2 size={32} className="mx-auto mb-3" style={{ color:'rgba(57,255,126,0.4)' }}/>
              <p className="text-white/40 text-sm">Sin alertas activas</p>
              <p className="text-white/20 text-xs mt-1">Todos los dispositivos funcionan correctamente</p>
            </div>
          ) : (
            alerts.map(al => {
              const sc = SEVER_COLOR[al.severidad] ?? '#94a3b8';
              return (
                <div key={al.id} className="rounded-2xl p-4"
                  style={{ background:`linear-gradient(135deg,${sc}08,rgba(5,15,40,0.9))`, border:`1px solid ${sc}25` }}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={16} style={{ color:sc, flexShrink:0, marginTop:2 }}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-black text-sm text-white leading-none">{al.device_nombre}</span>
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background:`${sc}18`, color:sc }}>{al.severidad}</span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">{al.mensaje}</p>
                      <p className="text-[9px] text-white/30 mt-1.5">{new Date(al.timestamp).toLocaleString('es-CO')}</p>
                    </div>
                    <button onClick={() => handleResolveAlert(al.id)}
                      className="px-3 py-1.5 rounded-xl text-[10px] font-black flex-shrink-0 transition-all hover:scale-[1.03]"
                      style={{ background:'rgba(57,255,126,0.12)', border:'1px solid rgba(57,255,126,0.25)', color:'#39ff7e' }}>
                      Resolver
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Tab: Planes GPS ───────────────────────────────────────────────── */}
      {activeTab === 'planes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {plans.map(p => {
            const pc  = PLAN_COLOR[p.id as PlanId] ?? '#94a3b8';
            const isActual = p.id === plan;
            return (
              <div key={p.id} className="rounded-2xl p-5 transition-all"
                style={{
                  background: isActual ? `rgba(${pc.replace('#','')},0.08)` : 'rgba(5,15,40,0.95)',
                  border: `1px solid rgba(255,255,255,${isActual?0.15:0.06})`,
                  borderTopColor: pc, borderTopWidth: isActual ? 2 : 1,
                }}>
                <div className="text-2xl mb-2">{GPS_ICON[p.id] ?? '📡'}</div>
                <h3 className="font-black text-base text-white">{p.label}</h3>
                <p className="text-2xl font-black mt-1" style={{ color:pc }}>
                  {p.limit === 0 ? '0' : p.limit >= 999 ? '∞' : String(p.limit)}
                  <span className="text-sm font-bold text-white/30 ml-1">chips</span>
                </p>
                <p className="text-[10px] text-white/45 mt-2 leading-relaxed">{p.descripcion}</p>
                <p className="text-xs font-black mt-3" style={{ color:pc }}>
                  {p.precio_plan === 0 ? 'Gratis' : `$${fmt(p.precio_plan)}/mes`}
                </p>
                {!isActual && (
                  <Link href="/planes">
                    <button className="w-full mt-3 py-2 rounded-xl text-[11px] font-black transition-all hover:scale-[1.02]"
                      style={{ background:`linear-gradient(135deg,${pc}22,${pc}10)`, border:`1px solid ${pc}30`, color:pc }}>
                      Ver plan {p.label} →
                    </button>
                  </Link>
                )}
                {isActual && (
                  <div className="w-full mt-3 py-2 rounded-xl text-[11px] font-black text-center"
                    style={{ background:`${pc}15`, color:pc }}>✓ Tu plan actual</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
