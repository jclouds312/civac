import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import {
  Sparkles, TrendingUp, TrendingDown, DollarSign, BarChart3,
  Zap, AlertTriangle, CheckCircle2, RefreshCw, ChevronRight,
  Brain, ShoppingBag, Activity, ArrowUpRight, ArrowDownRight,
  Lightbulb, Star, Clock, Target, Package, Beef,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, LineChart, Line, Legend,
} from "recharts";

/* ── Types ───────────────────────────────────────────────────────────────── */
interface Kpis {
  animales: number; vacas_en_ordeno: number; litros_dia: number;
  precio_litro: number; ingreso_dia: number; costo_dia: number;
  utilidad_dia: number; margen_pct: number; iep_dias: number;
  tasa_preñez: number; eficiencia_cc: number; score_salud: number;
}
interface Tip {
  id: number; categoria: string; prioridad: "alta"|"media"|"baja";
  titulo: string; detalle: string; impacto_cop: number; impacto_pct: number; icon: string;
}
interface PrecioItem {
  producto: string; unidad: string; precio: number; variacion: number; fuente: string;
}
interface MensualRow { mes: string; litros: number; ingreso: number; costo: number; margen_pct: number; }

function fmt(n: number, dec = 0) {
  return n.toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtCOP(n: number) {
  if (n >= 1_000_000) return `$${fmt(n/1_000_000, 1)}M`;
  if (n >= 1_000)     return `$${fmt(n/1_000, 0)}K`;
  return `$${fmt(n)}`;
}

const PRIORIDAD_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  alta:  { bg: "rgba(255,77,109,0.12)",  color: "#ff4d6d", label: "🔴 Alta"  },
  media: { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", label: "🟡 Media" },
  baja:  { bg: "rgba(52,211,153,0.12)",  color: "#34d399", label: "🟢 Baja"  },
};

const CAT_COLORS: Record<string, string> = {
  Producción: "#00c8ff", Alimentación: "#39ff7e", Reproducción: "#ff6fd8",
  Costos: "#34d399", Sanidad: "#ff4d6d", Tecnología: "#a855f7",
  Financiero: "#fbbf24", "CO₂": "#4ade80",
};

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />;
}

/* ── KPI Card ────────────────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, color, glow, icon: Icon, trend: t }:
  { label: string; value: string; sub: string; color: string; glow: string; icon: React.ElementType; trend?: number }) {
  return (
    <div className="rounded-2xl p-4 relative overflow-hidden" style={{
      background: `linear-gradient(135deg,rgba(5,15,40,0.95),rgba(8,20,55,0.90))`,
      border: `1px solid rgba(${glow},0.28)`,
      boxShadow: `0 0 20px rgba(${glow},0.08)`,
    }}>
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 pointer-events-none"
        style={{ background: `radial-gradient(circle, rgb(${glow}), transparent 70%)` }} />
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg,rgba(${glow},0.25),rgba(${glow},0.10))`, border: `1px solid rgba(${glow},0.30)` }}>
          <Icon size={15} style={{ color }} />
        </div>
        {t !== undefined && (
          <div className="flex items-center gap-1 text-[10px] font-bold"
            style={{ color: t >= 0 ? "#39ff7e" : "#ff4d6d" }}>
            {t >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(t).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-[22px] font-black leading-none mt-1" style={{ color }}>{value}</p>
      <p className="text-[11px] font-semibold text-white/70 mt-1 leading-tight">{label}</p>
      <p className="text-[9px] text-white/35 mt-0.5 leading-tight">{sub}</p>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function Asesora() {
  const { user } = useAuth();

  const [kpis,      setKpis]      = useState<Kpis | null>(null);
  const [tips,      setTips]      = useState<Tip[]>([]);
  const [precios,   setPrecios]   = useState<PrecioItem[]>([]);
  const [mensual,   setMensual]   = useState<MensualRow[]>([]);
  const [ventas,    setVentas]    = useState<MensualRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [refreshTs, setRefreshTs] = useState(Date.now());
  const [activeTip, setActiveTip] = useState<number | null>(null);
  const [filterCat, setFilterCat] = useState<string>("Todas");

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [sumRes, tipsRes, precRes, prodRes, ventRes] = await Promise.all([
        fetch("/api/analytics/summary"),
        fetch("/api/analytics/tips"),
        fetch("/api/analytics/precios"),
        fetch("/api/analytics/produccion"),
        fetch("/api/analytics/ventas"),
      ]);
      if (!sumRes.ok) throw new Error("Analytics server no disponible");
      const [sumD, tipsD, precD, prodD, ventD] = await Promise.all([
        sumRes.json(), tipsRes.json(), precRes.json(), prodRes.json(), ventRes.json(),
      ]);
      if (sumD.ok)  setKpis(sumD.kpis);
      if (tipsD.ok) setTips(tipsD.tips);
      if (precD.ok) setPrecios(precD.mercado);
      if (prodD.ok) setMensual(prodD.mensual);
      if (ventD.ok) setVentas(ventD.mensual);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll, refreshTs]);

  const cats   = ["Todas", ...Array.from(new Set(tips.map(t => t.categoria)))];
  const shownTips = filterCat === "Todas" ? tips : tips.filter(t => t.categoria === filterCat);

  return (
    <div className="space-y-6 pb-14">

      {/* ── Banner ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background:"linear-gradient(135deg,#0d0520,#1a0840 40%,#0d0a38)", border:"1px solid rgba(168,85,247,0.25)", boxShadow:"0 0 60px rgba(168,85,247,0.08)" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -right-10 -top-10 w-72 h-72 opacity-10"
            style={{ background:"radial-gradient(circle,#a855f7,transparent 70%)" }} />
          <div className="absolute -left-6 bottom-0 w-48 h-48 opacity-8"
            style={{ background:"radial-gradient(circle,#00c8ff,transparent 70%)" }} />
          <svg className="absolute right-4 bottom-2 opacity-5" width="200" height="120" viewBox="0 0 200 120">
            <polyline points="0,100 30,70 60,85 90,40 120,55 150,20 200,30" fill="none" stroke="#a855f7" strokeWidth="3"/>
          </svg>
        </div>
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background:"linear-gradient(135deg,#a855f7,#7c3aed)", boxShadow:"0 0 30px rgba(168,85,247,0.5)" }}>
            <Brain size={26} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-2xl text-white leading-tight" style={{ fontFamily:"'Sora',sans-serif" }}>
                Asesora <span style={{ color:"#a855f7", textShadow:"0 0 20px rgba(168,85,247,0.8)" }}>IA</span>
              </h1>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse"
                style={{ background:"linear-gradient(135deg,#a855f7,#7c3aed)", color:"white", letterSpacing:"0.05em" }}>CIVAC PRO</span>
            </div>
            <p className="text-sm mt-1 leading-relaxed" style={{ color:"rgba(200,180,255,0.65)" }}>
              Estadísticas reales · Precios Colombia en vivo · Recomendaciones IA · Simulador financiero
            </p>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {[["📡","Flask + pandas","Motor analítico"],["💡","8 tips activos","Recomendaciones IA"],["📊","12 meses","Proyecciones históricas"]].map(([ico,val,lab]) => (
                <div key={lab} className="flex items-center gap-1.5">
                  <span className="text-base">{ico}</span>
                  <div><p className="text-[11px] font-bold text-white leading-none">{val}</p><p className="text-[9px]" style={{ color:"rgba(168,85,247,0.5)" }}>{lab}</p></div>
                </div>
              ))}
              <button onClick={() => setRefreshTs(Date.now())} disabled={loading}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all hover:scale-[1.04]"
                style={{ background:"rgba(168,85,247,0.12)", border:"1px solid rgba(168,85,247,0.28)", color:"#c084fc" }}>
                <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
                {loading ? "Cargando…" : "Actualizar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3 text-sm"
          style={{ background:"rgba(255,77,109,0.08)", border:"1px solid rgba(255,77,109,0.2)", color:"#ff4d6d" }}>
          <AlertTriangle size={15} />
          <span className="font-medium">{error}</span>
          <span className="text-xs text-white/30 ml-auto">Verifica que el servidor de analytics esté activo</span>
        </div>
      )}

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {Array(6).fill(0).map((_,i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : kpis && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard label="Litros / día" value={`${kpis.litros_dia}L`} sub={`${kpis.vacas_en_ordeno} vacas en ordeño`} color="#00c8ff" glow="0,200,255" icon={Activity} trend={2.4} />
          <KpiCard label="Precio leche" value={`$${fmt(kpis.precio_litro)}`} sub="COP por litro · Fedegán" color="#39ff7e" glow="57,255,126" icon={DollarSign} trend={0.8} />
          <KpiCard label="Ingreso diario" value={fmtCOP(kpis.ingreso_dia)} sub="Ventas brutas estimadas" color="#fbbf24" glow="251,191,36" icon={TrendingUp} trend={3.1} />
          <KpiCard label="Margen neto" value={`${kpis.margen_pct}%`} sub={`Costo: ${fmtCOP(kpis.costo_dia)}/día`} color="#a855f7" glow="168,85,247" icon={BarChart3} trend={-0.5} />
          <KpiCard label="Tasa preñez" value={`${kpis.tasa_preñez}%`} sub={`IEP: ${kpis.iep_dias} días`} color="#ff6fd8" glow="255,111,216" icon={Target} trend={1.2} />
          <KpiCard label="Score Salud" value={`${kpis.score_salud}`} sub={`${kpis.animales} animales · CC ${kpis.eficiencia_cc}`} color="#4ade80" glow="74,222,128" icon={Zap} trend={0.3} />
        </div>
      )}

      {/* ── Charts row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Producción mensual */}
        <div className="rounded-2xl p-4" style={{ background:"linear-gradient(135deg,#001428,#001e3c)", border:"1px solid rgba(0,200,255,0.15)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background:"linear-gradient(135deg,#00c8ff,#0ea5e9)", color:"#000" }}>
              <Activity size={14} strokeWidth={2.5}/>
            </div>
            <div>
              <p className="font-black text-sm text-white leading-none">Producción de leche</p>
              <p className="text-[9px]" style={{ color:"rgba(0,200,255,0.5)" }}>Litros mensuales · 12 meses</p>
            </div>
          </div>
          {loading ? <Skeleton className="h-48" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mensual} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mes" tick={{ fill:"rgba(255,255,255,0.35)", fontSize:9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"rgba(255,255,255,0.35)", fontSize:9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:"rgba(4,15,26,0.98)", border:"1px solid rgba(0,200,255,0.2)", borderRadius:10, fontSize:11 }}
                  formatter={(v: number) => [`${fmt(v)} L`, "Litros"]} />
                <Bar dataKey="litros" fill="#00c8ff" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ventas vs Costos */}
        <div className="rounded-2xl p-4" style={{ background:"linear-gradient(135deg,#0f0020,#18003a)", border:"1px solid rgba(168,85,247,0.15)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background:"linear-gradient(135deg,#a855f7,#7c3aed)", color:"white" }}>
              <BarChart3 size={14} strokeWidth={2.5}/>
            </div>
            <div>
              <p className="font-black text-sm text-white leading-none">Ingresos vs Costos</p>
              <p className="text-[9px]" style={{ color:"rgba(168,85,247,0.5)" }}>COP mensuales · 12 meses</p>
            </div>
          </div>
          {loading ? <Skeleton className="h-48" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mensual} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="gIngs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ff4d6d" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mes" tick={{ fill:"rgba(255,255,255,0.35)", fontSize:9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"rgba(255,255,255,0.35)", fontSize:9 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${Math.round(v/1_000_000)}M`} />
                <Tooltip contentStyle={{ background:"rgba(4,15,26,0.98)", border:"1px solid rgba(168,85,247,0.2)", borderRadius:10, fontSize:11 }}
                  formatter={(v: number) => [`$${fmt(Math.round(v/1_000))}K`, ""]} />
                <Legend wrapperStyle={{ fontSize:10, color:"rgba(255,255,255,0.5)" }} />
                <Area type="monotone" dataKey="ingreso" name="Ingresos" stroke="#a855f7" fill="url(#gIngs)" strokeWidth={2} />
                <Area type="monotone" dataKey="costo"   name="Costos"   stroke="#ff4d6d" fill="url(#gCost)"  strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Precios de mercado ────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(57,255,126,0.15)" }}>
        <div className="px-5 py-3 flex items-center gap-3"
          style={{ background:"linear-gradient(135deg,#021a08,#042a10)" }}>
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background:"linear-gradient(135deg,#39ff7e,#00c850)", color:"#000" }}>
            <ShoppingBag size={14} strokeWidth={2.5}/>
          </div>
          <div>
            <p className="font-black text-sm text-white">Precios de mercado Colombia</p>
            <p className="text-[9px]" style={{ color:"rgba(57,255,126,0.5)" }}>Fedegán · Frigocol · ICA · Tiempo real</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[9px] font-bold"
            style={{ color:"#39ff7e" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#39ff7e] animate-pulse" />
            EN VIVO
          </div>
        </div>
        {loading ? <Skeleton className="h-32 m-4" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr style={{ background:"rgba(57,255,126,0.04)", borderBottom:"1px solid rgba(57,255,126,0.1)" }}>
                  {["Producto","Unidad","Precio COP","Var. %","Fuente"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-black" style={{ color:"rgba(57,255,126,0.6)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {precios.map((p, i) => (
                  <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background:i%2===0?"transparent":"rgba(255,255,255,0.01)" }}>
                    <td className="px-4 py-2.5 font-semibold text-white/80">{p.producto}</td>
                    <td className="px-4 py-2.5 text-white/40">{p.unidad}</td>
                    <td className="px-4 py-2.5 font-black" style={{ color:"#39ff7e" }}>${fmt(p.precio)}</td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1 font-bold"
                        style={{ color: p.variacion >= 0 ? "#39ff7e" : "#ff4d6d" }}>
                        {p.variacion >= 0 ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
                        {p.variacion >= 0 ? "+" : ""}{p.variacion}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-white/30">{p.fuente}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Recomendaciones IA ───────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(251,191,36,0.15)" }}>
        <div className="px-5 py-3 flex items-center gap-3"
          style={{ background:"linear-gradient(135deg,#1a1000,#2a1800)" }}>
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background:"linear-gradient(135deg,#fbbf24,#d97706)", color:"#000" }}>
            <Lightbulb size={14} strokeWidth={2.5}/>
          </div>
          <div>
            <p className="font-black text-sm text-white">Recomendaciones IA</p>
            <p className="text-[9px]" style={{ color:"rgba(251,191,36,0.5)" }}>{tips.length} acciones detectadas · Motor CIVAC Pro</p>
          </div>
          {/* Category filter */}
          <div className="ml-auto flex items-center gap-1.5 flex-wrap justify-end">
            {cats.slice(0, 5).map(c => (
              <button key={c} onClick={() => setFilterCat(c)}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold transition-all"
                style={{
                  background: filterCat === c ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${filterCat === c ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: filterCat === c ? "#fbbf24" : "rgba(255,255,255,0.35)",
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-2">
          {loading ? (
            Array(4).fill(0).map((_,i) => <Skeleton key={i} className="h-16" />)
          ) : shownTips.length === 0 ? (
            <p className="text-center text-white/30 text-sm py-6">Sin recomendaciones para esta categoría</p>
          ) : (
            shownTips.map(tip => {
              const ps   = PRIORIDAD_STYLE[tip.prioridad];
              const catC = CAT_COLORS[tip.categoria] || "#818cf8";
              const isOpen = activeTip === tip.id;
              return (
                <div key={tip.id} className="rounded-xl overflow-hidden transition-all" style={{ border:`1px solid rgba(255,255,255,0.07)` }}>
                  <button onClick={() => setActiveTip(isOpen ? null : tip.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/3 transition-all">
                    <span className="text-xl flex-shrink-0">{tip.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white/90 leading-tight">{tip.titulo}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background:ps.bg, color:ps.color }}>{ps.label}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background:`${catC}14`, color:catC, border:`1px solid ${catC}25` }}>{tip.categoria}</span>
                        {tip.impacto_cop > 0 && (
                          <span className="text-[9px] font-black" style={{ color:"#39ff7e" }}>+{fmtCOP(tip.impacto_cop)}</span>
                        )}
                        {tip.impacto_pct > 0 && (
                          <span className="text-[9px] font-bold" style={{ color:"#fbbf24" }}>+{tip.impacto_pct}% potencial</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={14} className="flex-shrink-0 transition-transform" style={{
                      color:"rgba(255,255,255,0.25)", transform: isOpen ? "rotate(90deg)" : "none",
                    }} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 border-t border-white/5">
                      <p className="text-xs text-white/55 leading-relaxed mt-2">{tip.detalle}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all hover:scale-[1.03]"
                          style={{ background:`linear-gradient(135deg,${catC}25,${catC}10)`, border:`1px solid ${catC}35`, color:catC }}>
                          <CheckCircle2 size={11}/> Marcar como aplicada
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all hover:opacity-80"
                          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.4)" }}>
                          Descartar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Plan info strip ──────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 flex items-center gap-4 flex-wrap"
        style={{ background:"linear-gradient(135deg,#071325,#0d2137)", border:"1px solid rgba(0,245,212,0.15)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background:"linear-gradient(135deg,#00f5d4,#00a896)", color:"#000" }}>
          <Star size={18} strokeWidth={2.5}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-sm">Plan activo: <span style={{ color:"#00f5d4" }}>{user?.plan?.toUpperCase() ?? "PRO"}</span></p>
          <p className="text-[10px] mt-0.5" style={{ color:"rgba(0,245,212,0.5)" }}>
            Análisis pandas · Precios en tiempo real · Tips IA · Simulador financiero incluidos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold"
            style={{ color:"#39ff7e" }}>
            <Package size={11}/> {user?.nombre?.split(" ")[0]}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold"
            style={{ color:"rgba(0,245,212,0.6)" }}>
            <Clock size={11}/>
            {new Date().toLocaleString("es-CO", { day:"numeric", month:"short", year:"numeric" })}
          </div>
        </div>
      </div>

    </div>
  );
}
