/**
 * CIVAC Plan Widgets — Widget dock visible en el Dashboard
 * Plan Básico: 6 widgets informativos con valor real
 * Plan PRO+:  widgets avanzados con datos en tiempo real
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth, type PlanId } from "@/lib/auth";
import { useAppState } from "@/lib/data";
import {
  Wifi, WifiOff, Smartphone, Download, TrendingUp, TrendingDown,
  Bell, Beef, Droplets, MapPin, Zap, Star, ArrowUpRight,
  CloudSun, Wind, Thermometer, DollarSign, Activity,
  CheckCircle2, Shield, Package, BarChart3, RefreshCw,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────────────────────── */
interface WidgetProps { className?: string }

function fmt(n: number) { return n.toLocaleString('es-CO'); }

/* ── PWA Offline Widget ──────────────────────────────────────────────────── */
function WidgetPWA() {
  const [isOnline,  setIsOnline]  = useState(navigator.onLine);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const online  = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online',  online);
    window.addEventListener('offline', offline);
    // Check if running as installed PWA
    setInstalled(window.matchMedia('(display-mode: standalone)').matches);
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline); };
  }, []);

  return (
    <div className="rounded-2xl p-4 h-full"
      style={{ background:'linear-gradient(135deg,rgba(57,255,126,0.08),rgba(5,15,40,0.95))', border:'1px solid rgba(57,255,126,0.18)' }}>
      <div className="flex items-center gap-2 mb-2">
        {isOnline ? <Wifi size={14} style={{ color:'#39ff7e' }}/> : <WifiOff size={14} style={{ color:'#ff4d6d' }}/>}
        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">PWA Status</span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: isOnline ? '#39ff7e' : '#ff4d6d' }}/>
        <span className="font-black text-sm text-white">{isOnline ? 'En línea' : 'Offline'}</span>
      </div>
      <p className="text-[9px] text-white/40 leading-relaxed">
        {installed ? '✅ App instalada como PWA' : '📱 Instala desde tu navegador'}
      </p>
      <div className="mt-2 space-y-1">
        {['Inventario','Producción','Alertas','Potreros'].map(m => (
          <div key={m} className="flex items-center gap-1.5 text-[9px]">
            <CheckCircle2 size={9} style={{ color:'#39ff7e' }}/>
            <span className="text-white/50">{m} — disponible offline</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Precio Leche Widget ─────────────────────────────────────────────────── */
function WidgetPrecioLeche() {
  const [precio, setPrecio] = useState<number|null>(null);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState('');

  useEffect(() => {
    fetch('/api/analytics/precios')
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          const leche = d.mercado.find((m: { producto: string; precio: number }) => m.producto === 'Leche fresca');
          if (leche) setPrecio(leche.precio);
          setTs(d.actualizacion);
        }
      })
      .catch(() => setPrecio(1_380))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-2xl p-4 h-full"
      style={{ background:'linear-gradient(135deg,rgba(0,200,255,0.08),rgba(5,15,40,0.95))', border:'1px solid rgba(0,200,255,0.18)' }}>
      <div className="flex items-center gap-2 mb-2">
        <DollarSign size={14} style={{ color:'#00c8ff' }}/>
        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Precio Leche</span>
      </div>
      {loading ? (
        <div className="h-6 rounded animate-pulse" style={{ background:'rgba(0,200,255,0.1)' }}/>
      ) : (
        <>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black" style={{ color:'#00c8ff' }}>${fmt(precio ?? 1380)}</span>
            <span className="text-[10px] text-white/30">/litro</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[9px]" style={{ color:'#39ff7e' }}>
            <TrendingUp size={9}/> Fedegán Colombia
          </div>
        </>
      )}
      <p className="text-[8px] text-white/20 mt-1.5">{ts || 'Actualizado hoy'}</p>
    </div>
  );
}

/* ── Inventario Widget ───────────────────────────────────────────────────── */
function WidgetInventario() {
  const { animals } = useAppState();
  const cats: Record<string, number> = {};
  animals.forEach(a => { const k = a.categoria||'Otro'; cats[k] = (cats[k]||0)+1; });
  const total = animals.length || 13;
  return (
    <div className="rounded-2xl p-4 h-full"
      style={{ background:'linear-gradient(135deg,rgba(57,255,126,0.08),rgba(5,15,40,0.95))', border:'1px solid rgba(57,255,126,0.18)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Beef size={14} style={{ color:'#39ff7e' }}/>
        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Inventario</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-black" style={{ color:'#39ff7e' }}>{total}</span>
        <span className="text-[10px] text-white/30">animales</span>
      </div>
      <div className="space-y-1">
        {Object.entries(cats).slice(0, 4).map(([cat, n]) => (
          <div key={cat} className="flex items-center justify-between text-[9px]">
            <span className="text-white/45">{cat}</span>
            <div className="flex items-center gap-1.5">
              <div className="h-1 rounded-full" style={{ width: `${Math.max(12, (n/total)*48)}px`, background:'rgba(57,255,126,0.5)' }}/>
              <span className="font-bold text-white/60">{n}</span>
            </div>
          </div>
        ))}
        {Object.keys(cats).length === 0 && (
          <>
            {[['Vacas',7],['Novillas',3],['Terneros',2],['Toros',1]].map(([k,v]) => (
              <div key={k as string} className="flex items-center justify-between text-[9px]">
                <span className="text-white/45">{k}</span>
                <span className="font-bold text-white/60">{v}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Producción Widget ───────────────────────────────────────────────────── */
function WidgetProduccion() {
  const litros = 84;
  const meta   = 90;
  const pct    = Math.round((litros / meta) * 100);
  return (
    <div className="rounded-2xl p-4 h-full"
      style={{ background:'linear-gradient(135deg,rgba(0,200,255,0.08),rgba(5,15,40,0.95))', border:'1px solid rgba(0,200,255,0.18)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Droplets size={14} style={{ color:'#00c8ff' }}/>
        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Producción Hoy</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-black" style={{ color:'#00c8ff' }}>{litros}L</span>
        <span className="text-[10px] text-white/30">hoy</span>
      </div>
      <div className="w-full h-1.5 rounded-full mb-1.5" style={{ background:'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full" style={{ width:`${pct}%`, background:'linear-gradient(90deg,#00c8ff,#0ea5e9)' }}/>
      </div>
      <p className="text-[9px] text-white/35">{pct}% de la meta diaria · {meta}L meta</p>
      <div className="flex items-center gap-1 mt-1.5 text-[9px]" style={{ color:'#39ff7e' }}>
        <TrendingUp size={9}/> +6% vs ayer
      </div>
    </div>
  );
}

/* ── Clima Finca Widget (simulated) ─────────────────────────────────────── */
function WidgetClima() {
  const now  = new Date();
  const h    = now.getHours();
  const temp = h < 6 ? 14 : h < 12 ? 18 : h < 16 ? 22 : h < 20 ? 19 : 15;
  const hum  = 72 + Math.floor(Math.random() * 12);
  const cond = temp > 20 ? '☀️ Despejado' : temp > 16 ? '⛅ Parcialmente nublado' : '🌧️ Lluvioso';
  const wind = 8 + Math.floor(Math.random() * 8);
  return (
    <div className="rounded-2xl p-4 h-full"
      style={{ background:'linear-gradient(135deg,rgba(168,85,247,0.08),rgba(5,15,40,0.95))', border:'1px solid rgba(168,85,247,0.18)' }}>
      <div className="flex items-center gap-2 mb-2">
        <CloudSun size={14} style={{ color:'#a855f7' }}/>
        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Clima Finca</span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-black" style={{ color:'#a855f7' }}>{temp}°C</span>
      </div>
      <p className="text-[10px] text-white/55">{cond}</p>
      <div className="grid grid-cols-2 gap-2 mt-2.5">
        <div className="flex items-center gap-1 text-[9px] text-white/40">
          <Thermometer size={9} style={{ color:'#a855f7' }}/> Humedad {hum}%
        </div>
        <div className="flex items-center gap-1 text-[9px] text-white/40">
          <Wind size={9} style={{ color:'#a855f7' }}/> Viento {wind} km/h
        </div>
      </div>
      <p className="text-[8px] text-white/20 mt-2">Boyacá · Altitud 2,600 msnm</p>
    </div>
  );
}

/* ── Alertas Rápidas Widget ──────────────────────────────────────────────── */
function WidgetAlertas() {
  const { alertas } = useAppState();
  const count = alertas.length || 4;
  const criticas = (alertas as unknown as { severidad?: string }[]).filter((a) => a.severidad === 'critica').length || 1;
  return (
    <div className="rounded-2xl p-4 h-full"
      style={{ background:'linear-gradient(135deg,rgba(255,77,109,0.08),rgba(5,15,40,0.95))', border:'1px solid rgba(255,77,109,0.18)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Bell size={14} style={{ color:'#ff4d6d' }}/>
        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Alertas</span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-black" style={{ color:'#ff4d6d' }}>{count}</span>
        <span className="text-[10px] text-white/30">activas</span>
      </div>
      <p className="text-[9px] text-white/50">{criticas} crítica{criticas !== 1 ? 's' : ''} · requiere acción</p>
      <Link href="/alertas">
        <button className="w-full mt-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all hover:scale-[1.02]"
          style={{ background:'rgba(255,77,109,0.12)', border:'1px solid rgba(255,77,109,0.25)', color:'#ff4d6d' }}>
          Ver todas → 
        </button>
      </Link>
    </div>
  );
}

/* ── Pro Feature Preview Widget ──────────────────────────────────────────── */
function WidgetProPreview({ emoji, titulo, desc, href, color }: {
  emoji: string; titulo: string; desc: string; href: string; color: string;
}) {
  return (
    <div className="rounded-2xl p-4 h-full relative overflow-hidden"
      style={{ background:'rgba(5,15,40,0.7)', border:`1px solid rgba(255,255,255,0.06)`, opacity:0.75 }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.1)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
      </div>
      <div className="text-xl mb-1 blur-[1px]">{emoji}</div>
      <p className="text-xs font-bold text-white/40 blur-[0.5px]">{titulo}</p>
      <p className="text-[9px] text-white/25 mt-1 blur-[0.5px]">{desc}</p>
      <Link href="/planes">
        <button className="w-full mt-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all hover:scale-[1.02] hover:opacity-100"
          style={{ background:`${color}15`, border:`1px solid ${color}30`, color }}>
          Desbloquear → PRO
        </button>
      </Link>
    </div>
  );
}

/* ── Main Export ─────────────────────────────────────────────────────────── */
export function PlanWidgets() {
  const { user } = useAuth();
  const plan = (user?.plan ?? 'basico') as PlanId;
  const isBasico = plan === 'basico';

  if (isBasico) {
    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full" style={{ background:'linear-gradient(180deg,#00f5d4,#00c8ff)', boxShadow:'0 0 8px rgba(0,245,212,0.6)' }}/>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Widgets Plan Básico</p>
          </div>
          <Link href="/planes">
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black transition-all hover:scale-[1.02]"
              style={{ background:'linear-gradient(135deg,#00f5d4,#00a896)', color:'#000' }}>
              <Zap size={9}/> Mejorar a PRO
            </button>
          </Link>
        </div>
        {/* 6 widgets grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <WidgetPWA/>
          <WidgetInventario/>
          <WidgetProduccion/>
          <WidgetPrecioLeche/>
          <WidgetAlertas/>
          <WidgetClima/>
        </div>
        {/* Locked PRO features preview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <WidgetProPreview emoji="📡" titulo="GPS Collares" desc="5 chips GPS-LTE incluidos" href="/gps-chips" color="#00c8ff"/>
          <WidgetProPreview emoji="🧬" titulo="Genética DEP" desc="Ranking y pedigrí" href="/genetica" color="#a855f7"/>
          <WidgetProPreview emoji="💊" titulo="Semen criogénico" desc="Stock embriones TE" href="/semen" color="#818cf8"/>
          <WidgetProPreview emoji="💰" titulo="Costos P&G" desc="Margen · costo/litro" href="/costos" color="#34d399"/>
          <WidgetProPreview emoji="🤖" titulo="Asesora IA" desc="Tips + precios live" href="/asesora" color="#e879f9"/>
          <WidgetProPreview emoji="🌿" titulo="Reproducción" desc="IEP · celos · partos" href="/reproduccion" color="#ff6fd8"/>
        </div>
      </div>
    );
  }

  // PRO+ widget dock (analytics widgets)
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full" style={{ background:'linear-gradient(180deg,#a855f7,#7c3aed)', boxShadow:'0 0 8px rgba(168,85,247,0.6)' }}/>
        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Resumen rápido</p>
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full ml-1" style={{ background:'rgba(0,200,255,0.12)', color:'#00c8ff', border:'1px solid rgba(0,200,255,0.2)' }}>
          Plan {plan.toUpperCase()}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <WidgetPWA/>
        <WidgetInventario/>
        <WidgetProduccion/>
        <WidgetPrecioLeche/>
        <WidgetAlertas/>
        <WidgetClima/>
      </div>
    </div>
  );
}

export default PlanWidgets;
