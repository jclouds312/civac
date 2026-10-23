import { useState, useEffect, useCallback } from "react";
import {
  UserCheck, UserX, RefreshCw, Link2, Shield, Crown, Loader2,
  Mail, Calendar, AlertTriangle, CheckCircle2, XCircle, Clock,
  Search, Copy, ExternalLink, User, Gift, Zap, RotateCcw,
} from "lucide-react";

const PLAN_PRECIOS_LABEL: Record<string, string> = {
  basico: "Gratis", pro: "$89.000/mes", premium: "$189.000/mes", platino: "$399.000/mes",
};
const PLAN_COLOR: Record<string, string> = {
  basico: "#94a3b8", pro: "#00f5d4", premium: "#fbbf24", platino: "#cd7f32",
};
const PLAN_ICON: Record<string, string> = {
  basico: "⚪", pro: "🌿", premium: "⭐", platino: "👑",
};
const ESTADO_CONFIG: Record<string, { label: string; color: string; glow: string; icon: React.ReactNode }> = {
  activo:    { label: "Activo",    color: "#39ff7e", glow: "57,255,126",   icon: <CheckCircle2 size={11}/> },
  pendiente: { label: "Pendiente", color: "#fbbf24", glow: "251,191,36",   icon: <Clock size={11}/> },
  bloqueado: { label: "Bloqueado", color: "#f87171", glow: "248,113,113",  icon: <XCircle size={11}/> },
  demo:      { label: "Demo",      color: "#e879f9", glow: "232,121,249",  icon: <Gift size={11}/> },
};

interface DbUser {
  id: string; nombre: string; cargo: string; finca: string; email: string;
  role: string; planCode: string; activo: boolean;
  googleId: string | null; googleFoto: string | null;
  estado: string; createdAt: string;
  demoExpiry?: string | null; demoDias?: number;
  planExpiry?: string | null; planDias?: number;
  loginCount?: number; lastLogin?: string | null;
}

interface PayLinkResult {
  paymentLink: string; referencia: string; plan: string; precio: number;
  user: { nombre: string; email: string };
}

const API = "/api";
const DEMO_DIAS_OPTIONS = [3, 7, 14, 30];

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  let token: string | null = null;
  try { token = localStorage.getItem("civac_server_token"); } catch {}
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function diasRestantes(expiry: string | null | undefined): number | null {
  if (!expiry) return null;
  const ms = new Date(expiry).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

function DayCounterBadge({ expiry, type }: { expiry?: string | null; type: "demo" | "plan" }) {
  const dias = diasRestantes(expiry);
  if (dias === null) return null;
  const isExpired = dias === 0;
  const isUrgent  = dias > 0 && dias <= 3;
  const color = isExpired ? "#f87171" : isUrgent ? "#fbbf24" : type === "demo" ? "#e879f9" : "#00f5d4";
  const glow  = isExpired ? "248,113,113" : isUrgent ? "251,191,36" : type === "demo" ? "232,121,249" : "0,245,212";
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
      style={{ background:`rgba(${glow},0.12)`, border:`1px solid rgba(${glow},0.3)`, color }}>
      <Clock size={8}/>
      {isExpired ? `${type==="demo"?"Demo":"Plan"} vencido` : `${dias}d`}
    </span>
  );
}

export default function GoogleUsersPanel() {
  const [users, setUsers]           = useState<DbUser[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState<"todos"|"pendiente"|"activo"|"bloqueado"|"demo"|"google">("todos");
  const [busy, setBusy]             = useState<string | null>(null);
  const [payLink, setPayLink]       = useState<PayLinkResult | null>(null);
  const [payUser, setPayUser]       = useState<DbUser | null>(null);
  const [payPlan, setPayPlan]       = useState("pro");
  const [planModal, setPlanModal]   = useState<DbUser | null>(null);
  const [newPlan, setNewPlan]       = useState("pro");
  const [demoModal, setDemoModal]   = useState<DbUser | null>(null);
  const [demoDias, setDemoDias]     = useState(7);
  const [activarModal, setActivarModal] = useState<DbUser | null>(null);
  const [activarPlan, setActivarPlan]   = useState("pro");
  const [activarDias, setActivarDias]   = useState(30);
  const [copiedRef, setCopiedRef]   = useState(false);
  const [notify, setNotify]         = useState<{msg:string;ok:boolean}|null>(null);

  const showNotif = (msg: string, ok = true) => {
    setNotify({ msg, ok });
    setTimeout(() => setNotify(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch(`${API}/admin/users`, { headers: authHeaders() });
      const d = await r.json() as { ok: boolean; users: DbUser[] };
      if (d.ok) setUsers(d.users ?? []);
      else setError("Error cargando usuarios");
    } catch { setError("No se pudo conectar con la API"); }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const changeEstado = async (u: DbUser, estado: string) => {
    setBusy(u.id);
    try {
      const r = await fetch(`${API}/admin/users/${u.id}`, {
        method: "PATCH", headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ estado, activo: estado === "activo" }),
      });
      const d = await r.json() as { ok: boolean };
      if (d.ok) {
        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, estado, activo: estado === "activo" } : x));
        showNotif(`Cuenta ${estado === "activo" ? "activada" : "bloqueada"}: ${u.nombre}`);
      } else { showNotif("Error actualizando estado", false); }
    } catch { showNotif("Error de red", false); }
    setBusy(null);
  };

  const changePlan = async (u: DbUser, plan: string) => {
    setBusy(u.id);
    try {
      const r = await fetch(`${API}/admin/users/${u.id}`, {
        method: "PATCH", headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ planCode: plan }),
      });
      const d = await r.json() as { ok: boolean };
      if (d.ok) {
        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, planCode: plan } : x));
        showNotif(`Plan actualizado a ${plan.toUpperCase()} para ${u.nombre}`);
        setPlanModal(null);
      } else { showNotif("Error actualizando plan", false); }
    } catch { showNotif("Error de red", false); }
    setBusy(null);
  };

  const otorgarDemo = async (u: DbUser, dias: number) => {
    setBusy(u.id);
    try {
      const r = await fetch(`${API}/admin/users/${u.id}/demo`, {
        method: "POST", headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ dias }),
      });
      const d = await r.json() as { ok: boolean; message?: string; demoExpiry?: string };
      if (d.ok) {
        setUsers(prev => prev.map(x => x.id === u.id
          ? { ...x, estado: "demo", activo: true, demoDias: dias, demoExpiry: d.demoExpiry ?? null } : x));
        showNotif(d.message ?? `Demo de ${dias} días otorgado a ${u.nombre}`);
        setDemoModal(null);
      } else { showNotif("Error otorgando demo", false); }
    } catch { showNotif("Error de red", false); }
    setBusy(null);
  };

  const activarCuenta = async (u: DbUser, plan: string, dias: number) => {
    setBusy(u.id);
    try {
      const r = await fetch(`${API}/admin/users/${u.id}/activate`, {
        method: "POST", headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ planCode: plan, dias }),
      });
      const d = await r.json() as { ok: boolean; message?: string; planExpiry?: string };
      if (d.ok) {
        setUsers(prev => prev.map(x => x.id === u.id
          ? { ...x, estado: "activo", activo: true, planCode: plan, planDias: dias, planExpiry: d.planExpiry ?? null, demoExpiry: null } : x));
        showNotif(d.message ?? `Cuenta activada con plan ${plan} por ${dias} días`);
        setActivarModal(null);
      } else { showNotif("Error activando cuenta", false); }
    } catch { showNotif("Error de red", false); }
    setBusy(null);
  };

  const getPayLink = async (u: DbUser, plan: string) => {
    setBusy(u.id);
    try {
      const r = await fetch(`${API}/admin/payment-link/${u.id}?plan=${plan}`, {
        headers: authHeaders(),
      });
      const d = await r.json() as { ok: boolean } & PayLinkResult;
      if (d.ok) { setPayLink(d); setPayUser(u); }
      else showNotif("Error generando enlace de pago", false);
    } catch { showNotif("Error de red", false); }
    setBusy(null);
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.finca.toLowerCase().includes(q);
    const matchF = filter === "todos" ? true : filter === "google" ? !!u.googleId : u.estado === filter;
    return matchQ && matchF;
  });

  const counts = {
    todos: users.length,
    pendiente: users.filter(u => u.estado === "pendiente").length,
    activo: users.filter(u => u.estado === "activo").length,
    bloqueado: users.filter(u => u.estado === "bloqueado").length,
    demo: users.filter(u => u.estado === "demo").length,
    google: users.filter(u => !!u.googleId).length,
  };

  const copyRef = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* ── Toast ── */}
      {notify && (
        <div className="fixed top-4 right-4 z-[100] px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-2xl"
          style={{ background: notify.ok ? "rgba(0,245,212,0.15)" : "rgba(248,113,113,0.15)",
            border: `1px solid ${notify.ok ? "rgba(0,245,212,0.4)" : "rgba(248,113,113,0.4)"}`,
            backdropFilter: "blur(16px)", color: notify.ok ? "#00f5d4" : "#f87171" }}>
          {notify.ok ? <CheckCircle2 size={14}/> : <AlertTriangle size={14}/>}
          {notify.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="rounded-2xl p-4" style={{ background:"linear-gradient(135deg,rgba(0,245,212,0.07),rgba(57,255,126,0.05))", border:"1px solid rgba(0,245,212,0.18)" }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-black text-base text-white flex items-center gap-2">
              <User size={16} style={{ color:"#00f5d4" }}/>
              Usuarios Registrados
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:"rgba(0,245,212,0.12)", border:"1px solid rgba(0,245,212,0.25)", color:"#00f5d4" }}>
                {users.length} total
              </span>
            </h3>
            <p className="text-[11px] text-white/40 mt-0.5">Gestión DB · Google OAuth + registro · Demo días · Activación con plan</p>
          </div>
          <button onClick={() => void load()} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
            style={{ background:"rgba(0,245,212,0.1)", border:"1px solid rgba(0,245,212,0.25)", color:"#00f5d4" }}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""}/>
            Actualizar
          </button>
        </div>

        {/* KPI mini */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
          {(["todos","pendiente","activo","bloqueado","demo","google"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-2 py-1.5 rounded-xl text-center transition-all"
              style={{
                background: filter===f ? (f==="pendiente"?"rgba(251,191,36,0.15)":f==="bloqueado"?"rgba(248,113,113,0.15)":f==="google"?"rgba(66,133,244,0.15)":f==="demo"?"rgba(232,121,249,0.15)":"rgba(0,245,212,0.15)") : "rgba(255,255,255,0.04)",
                border:`1px solid ${filter===f?(f==="pendiente"?"rgba(251,191,36,0.4)":f==="bloqueado"?"rgba(248,113,113,0.4)":f==="google"?"rgba(66,133,244,0.4)":f==="demo"?"rgba(232,121,249,0.4)":"rgba(0,245,212,0.4)"):"rgba(255,255,255,0.08)"}`,
              }}>
              <div className="text-base font-black" style={{ color:filter===f?(f==="pendiente"?"#fbbf24":f==="bloqueado"?"#f87171":f==="google"?"#4285F4":f==="demo"?"#e879f9":"#00f5d4"):"rgba(255,255,255,0.5)" }}>
                {counts[f]}
              </div>
              <div className="text-[9px] text-white/35 capitalize leading-none mt-0.5">
                {f==="google"?"Google":f==="todos"?"Total":f.charAt(0).toUpperCase()+f.slice(1)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email, finca…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs text-white placeholder:text-white/25 outline-none"
          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}/>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"rgba(255,255,255,0.3)" }}/>
      </div>

      {error && (
        <div className="rounded-2xl p-4 flex items-center gap-2 text-sm" style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171" }}>
          <AlertTriangle size={14}/> {error}
          <button onClick={() => void load()} className="ml-auto text-xs underline underline-offset-2">Reintentar</button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 text-white/30">
          <Loader2 size={20} className="animate-spin" style={{ color:"#00f5d4" }}/>
          <span className="text-sm">Cargando usuarios de la base de datos…</span>
        </div>
      )}

      {/* ── Users Cards ── */}
      {!loading && !error && (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-white/25 text-sm">
              {search ? "Sin resultados para tu búsqueda" : "No hay usuarios en este estado"}
            </div>
          ) : filtered.map((u) => {
            const estado = ESTADO_CONFIG[u.estado] ?? ESTADO_CONFIG["pendiente"];
            const planCol = PLAN_COLOR[u.planCode] ?? "#94a3b8";
            const demoLeft = diasRestantes(u.demoExpiry);
            const planLeft = diasRestantes(u.planExpiry);
            return (
              <div key={u.id} className="rounded-2xl p-4 transition-all"
                style={{ background:"rgba(4,13,26,0.7)", border:"1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-start gap-3 flex-wrap">
                  {/* Avatar */}
                  {u.googleFoto
                    ? <img src={u.googleFoto} alt={u.nombre} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" style={{ border:"1px solid rgba(66,133,244,0.4)" }}/>
                    : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                        style={{ background:"rgba(0,245,212,0.1)", border:"1px solid rgba(0,245,212,0.2)" }}>
                        {u.nombre[0]?.toUpperCase()}
                      </div>
                  }

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-xs font-black text-white">{u.nombre}</p>
                      {u.googleId && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background:"rgba(66,133,244,0.15)", border:"1px solid rgba(66,133,244,0.3)", color:"#4285F4" }}>G</span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background:`rgba(${estado.glow},0.1)`, border:`1px solid rgba(${estado.glow},0.25)`, color:estado.color }}>
                        {estado.icon}{estado.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background:`${planCol}12`, border:`1px solid ${planCol}30`, color:planCol }}>
                        {PLAN_ICON[u.planCode]}{u.planCode}
                      </span>
                      {/* Day counters */}
                      {demoLeft !== null && <DayCounterBadge expiry={u.demoExpiry} type="demo"/>}
                      {planLeft !== null && u.planCode !== "basico" && <DayCounterBadge expiry={u.planExpiry} type="plan"/>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-[10px]" style={{ color:"rgba(255,255,255,0.35)" }}>
                      <span className="flex items-center gap-1"><Mail size={9}/>{u.email}</span>
                      {u.finca && u.finca !== "Sin asignar" && <span>🏡 {u.finca}</span>}
                      <span className="flex items-center gap-1"><Calendar size={9}/>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"2-digit"}) : "—"}</span>
                      {(u.loginCount ?? 0) > 0 && <span>🔑 {u.loginCount} accesos</span>}
                    </div>
                    {/* Demo info */}
                    {u.demoExpiry && (
                      <div className="mt-1 text-[9px]" style={{ color:"rgba(232,121,249,0.6)" }}>
                        Demo vence: {new Date(u.demoExpiry).toLocaleDateString("es-CO")} · {u.demoDias ?? 0} días totales
                      </div>
                    )}
                    {u.planExpiry && u.planCode !== "basico" && (
                      <div className="mt-0.5 text-[9px]" style={{ color:"rgba(0,245,212,0.5)" }}>
                        Plan {u.planCode} vence: {new Date(u.planExpiry).toLocaleDateString("es-CO")} · {u.planDias ?? 0} días totales
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-wrap flex-shrink-0">
                    {/* Otorgar Demo (solo pendientes/demo/bloqueados) */}
                    {(u.estado === "pendiente" || u.estado === "demo" || u.estado === "bloqueado") && (
                      <button onClick={() => { setDemoModal(u); setDemoDias(7); }} title="Otorgar días demo"
                        className="flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-bold transition-all"
                        style={{ background:"rgba(232,121,249,0.1)", border:"1px solid rgba(232,121,249,0.3)", color:"#e879f9" }}>
                        <Gift size={9}/>{u.estado === "demo" ? "Extender" : "Demo"}
                      </button>
                    )}
                    {/* Activar con plan */}
                    {u.estado !== "activo" && (
                      <button onClick={() => { setActivarModal(u); setActivarPlan("pro"); setActivarDias(30); }} title="Activar cuenta con plan"
                        className="flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-bold transition-all"
                        style={{ background:"rgba(57,255,126,0.1)", border:"1px solid rgba(57,255,126,0.3)", color:"#39ff7e" }}>
                        <UserCheck size={9}/>Activar
                      </button>
                    )}
                    {/* Reactivar plan (si plan expiró) */}
                    {u.estado === "activo" && planLeft !== null && planLeft === 0 && (
                      <button onClick={() => { setActivarModal(u); setActivarPlan(u.planCode); setActivarDias(30); }} title="Reactivar plan"
                        className="flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-bold transition-all"
                        style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)", color:"#fbbf24" }}>
                        <RotateCcw size={9}/>Reactivar
                      </button>
                    )}
                    {/* Bloquear */}
                    {u.estado !== "bloqueado" && (
                      <button onClick={() => void changeEstado(u, "bloqueado")} disabled={busy === u.id} title="Bloquear"
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/15"
                        style={{ color:"rgba(248,113,113,0.5)" }}>
                        {busy === u.id ? <Loader2 size={9} className="animate-spin"/> : <UserX size={9}/>}
                      </button>
                    )}
                    {/* Plan */}
                    <button onClick={() => { setPlanModal(u); setNewPlan(u.planCode); }} title="Cambiar plan"
                      className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-purple-500/15 transition-colors"
                      style={{ color:"#c084fc" }}>
                      <Crown size={10}/>
                    </button>
                    {/* Enlace de pago */}
                    <button onClick={() => { setPayUser(u); setPayPlan(u.planCode === "basico" ? "pro" : u.planCode); setPayLink(null); }} title="Generar enlace Wompi"
                      className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-teal-500/15 transition-colors"
                      style={{ color:"#00f5d4" }}>
                      <Link2 size={10}/>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════ MODAL: DEMO DÍAS ══════════════════════════════════ */}
      {demoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.85)", backdropFilter:"blur(10px)" }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ background:"linear-gradient(145deg,#0d0620,#150b30)", border:"1px solid rgba(232,121,249,0.3)", boxShadow:"0 0 60px rgba(232,121,249,0.12)" }}>
            <div className="h-1" style={{ background:"linear-gradient(90deg,#a855f7,#e879f9,transparent)" }}/>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <Gift size={14} style={{ color:"#e879f9" }}/> Otorgar Demo
                </h3>
                <button onClick={() => setDemoModal(null)} className="text-white/30 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10">
                  <XCircle size={14}/>
                </button>
              </div>

              <div className="p-3 rounded-xl" style={{ background:"rgba(232,121,249,0.06)", border:"1px solid rgba(232,121,249,0.15)" }}>
                <p className="text-xs font-bold text-white">{demoModal.nombre}</p>
                <p className="text-[10px]" style={{ color:"rgba(232,121,249,0.5)" }}>{demoModal.email}</p>
                {demoModal.demoExpiry && (
                  <p className="text-[9px] mt-1" style={{ color:"rgba(232,121,249,0.4)" }}>
                    Demo actual: {new Date(demoModal.demoExpiry).toLocaleDateString("es-CO")}
                    {" "}· {diasRestantes(demoModal.demoExpiry) ?? 0} días restantes
                  </p>
                )}
              </div>

              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-2">Días a otorgar</p>
                <div className="grid grid-cols-4 gap-2">
                  {DEMO_DIAS_OPTIONS.map(d => (
                    <button key={d} onClick={() => setDemoDias(d)}
                      className="py-3 rounded-xl text-center font-black transition-all"
                      style={{
                        background: demoDias===d ? "rgba(232,121,249,0.2)" : "rgba(255,255,255,0.04)",
                        border:`1.5px solid ${demoDias===d?"rgba(232,121,249,0.6)":"rgba(255,255,255,0.08)"}`,
                        color: demoDias===d ? "#e879f9" : "rgba(255,255,255,0.4)",
                      }}>
                      <div className="text-xl">{d}</div>
                      <div className="text-[9px] mt-0.5">días</div>
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-white/25 mt-2 text-center">
                  El usuario podrá acceder hasta: {(() => { const d=new Date(); d.setDate(d.getDate()+demoDias); return d.toLocaleDateString("es-CO"); })()}
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setDemoModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)" }}>
                  Cancelar
                </button>
                <button onClick={() => void otorgarDemo(demoModal, demoDias)} disabled={busy === demoModal.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all disabled:opacity-50"
                  style={{ background:"linear-gradient(135deg,#a855f7,#e879f9)", color:"white" }}>
                  {busy === demoModal.id ? <Loader2 size={12} className="animate-spin"/> : <Gift size={12}/>}
                  Otorgar {demoDias} días
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════ MODAL: ACTIVAR CUENTA ════════════════════════════ */}
      {activarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.85)", backdropFilter:"blur(10px)" }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ background:"linear-gradient(145deg,#020d1a,#0a1a2e)", border:"1px solid rgba(57,255,126,0.3)", boxShadow:"0 0 60px rgba(57,255,126,0.1)" }}>
            <div className="h-1" style={{ background:"linear-gradient(90deg,#00f5d4,#39ff7e,transparent)" }}/>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <Zap size={14} style={{ color:"#39ff7e" }}/> Activar Cuenta
                </h3>
                <button onClick={() => setActivarModal(null)} className="text-white/30 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10">
                  <XCircle size={14}/>
                </button>
              </div>

              <div className="p-3 rounded-xl" style={{ background:"rgba(57,255,126,0.06)", border:"1px solid rgba(57,255,126,0.15)" }}>
                <p className="text-xs font-bold text-white">{activarModal.nombre}</p>
                <p className="text-[10px]" style={{ color:"rgba(57,255,126,0.5)" }}>{activarModal.email}</p>
              </div>

              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-2">Plan a asignar</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["basico","pro","premium","platino"] as const).map(p => (
                    <button key={p} onClick={() => setActivarPlan(p)}
                      className="p-2.5 rounded-xl text-left transition-all"
                      style={{ background:activarPlan===p?`${PLAN_COLOR[p]}15`:"rgba(255,255,255,0.03)", border:`1.5px solid ${activarPlan===p?`${PLAN_COLOR[p]}55`:"rgba(255,255,255,0.07)"}` }}>
                      <p className="text-[10px] font-black" style={{ color:PLAN_COLOR[p] }}>{PLAN_ICON[p]} {p.toUpperCase()}</p>
                      <p className="text-[9px] text-white/30">{PLAN_PRECIOS_LABEL[p]}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-2">Días de acceso</p>
                <div className="grid grid-cols-4 gap-2">
                  {[7, 30, 60, 365].map(d => (
                    <button key={d} onClick={() => setActivarDias(d)}
                      className="py-2.5 rounded-xl text-center font-black transition-all text-xs"
                      style={{
                        background:activarDias===d?"rgba(57,255,126,0.15)":"rgba(255,255,255,0.04)",
                        border:`1.5px solid ${activarDias===d?"rgba(57,255,126,0.5)":"rgba(255,255,255,0.08)"}`,
                        color:activarDias===d?"#39ff7e":"rgba(255,255,255,0.4)",
                      }}>
                      {d<365?d+"d":"1 año"}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-white/25 mt-1 text-center">
                  Acceso hasta: {(() => { const d=new Date(); d.setDate(d.getDate()+activarDias); return d.toLocaleDateString("es-CO"); })()}
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setActivarModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)" }}>
                  Cancelar
                </button>
                <button onClick={() => void activarCuenta(activarModal, activarPlan, activarDias)} disabled={busy === activarModal.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all disabled:opacity-50"
                  style={{ background:"linear-gradient(135deg,#00f5d4,#39ff7e)", color:"black" }}>
                  {busy === activarModal.id ? <Loader2 size={12} className="animate-spin"/> : <Shield size={12}/>}
                  Activar {activarDias}d
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════ MODAL: PLAN ═══════════════════════════════════════ */}
      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)" }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ background:"linear-gradient(145deg,#020d1a,#0a1a2e)", border:"1px solid rgba(192,132,252,0.25)", boxShadow:"0 0 60px rgba(192,132,252,0.1)" }}>
            <div className="h-1" style={{ background:"linear-gradient(90deg,#a855f7,#e879f9,transparent)" }}/>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <Crown size={14} style={{ color:"#c084fc" }}/> Cambiar Plan
                </h3>
                <button onClick={() => setPlanModal(null)} className="text-white/30 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10">
                  <XCircle size={14}/>
                </button>
              </div>
              <p className="text-xs text-white/50 mb-4">{planModal.nombre} · {planModal.email}</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {(["basico","pro","premium","platino"] as const).map(p => (
                  <button key={p} onClick={() => setNewPlan(p)}
                    className="p-2.5 rounded-xl text-left transition-all"
                    style={{ background:newPlan===p?`${PLAN_COLOR[p]}15`:"rgba(255,255,255,0.03)", border:`1.5px solid ${newPlan===p?`${PLAN_COLOR[p]}55`:"rgba(255,255,255,0.07)"}` }}>
                    <p className="text-[10px] font-black" style={{ color:PLAN_COLOR[p] }}>{PLAN_ICON[p]} {p.toUpperCase()}</p>
                    <p className="text-[9px] text-white/30">{PLAN_PRECIOS_LABEL[p]}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => void changePlan(planModal, newPlan)} disabled={busy === planModal.id}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all disabled:opacity-50"
                style={{ background:"linear-gradient(135deg,#a855f7,#e879f9)", color:"white" }}>
                {busy === planModal.id ? <Loader2 size={14} className="animate-spin"/> : <Crown size={14}/>}
                Asignar plan {newPlan}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════ MODAL: PAGO WOMPI ════════════════════════════════ */}
      {payUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)" }}>
          <div className="w-full max-w-md rounded-3xl overflow-hidden" style={{ background:"linear-gradient(145deg,#020d1a,#0a1a2e)", border:"1px solid rgba(0,245,212,0.25)", boxShadow:"0 0 60px rgba(0,245,212,0.1)" }}>
            <div className="h-1" style={{ background:"linear-gradient(90deg,#00f5d4,#00c8ff,transparent)" }}/>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <Link2 size={14} style={{ color:"#00f5d4" }}/> Enlace de Pago Wompi
                </h3>
                <button onClick={() => { setPayUser(null); setPayLink(null); }} className="text-white/30 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10">
                  <XCircle size={14}/>
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ background:"rgba(0,245,212,0.05)", border:"1px solid rgba(0,245,212,0.12)" }}>
                {payUser.googleFoto
                  ? <img src={payUser.googleFoto} alt={payUser.nombre} className="w-10 h-10 rounded-xl object-cover"/>
                  : <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg" style={{ background:"rgba(0,245,212,0.1)" }}>{payUser.nombre[0]}</div>
                }
                <div>
                  <p className="text-xs font-bold text-white">{payUser.nombre}</p>
                  <p className="text-[10px]" style={{ color:"rgba(0,245,212,0.5)" }}>{payUser.email}</p>
                </div>
              </div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-2">Plan a asignar</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(["pro","premium","platino","basico"] as const).map(p => (
                  <button key={p} onClick={() => setPayPlan(p)}
                    className="p-2.5 rounded-xl text-left transition-all"
                    style={{ background:payPlan===p?`${PLAN_COLOR[p]}15`:"rgba(255,255,255,0.03)", border:`1.5px solid ${payPlan===p?`${PLAN_COLOR[p]}55`:"rgba(255,255,255,0.07)"}` }}>
                    <p className="text-[10px] font-black" style={{ color:PLAN_COLOR[p] }}>{PLAN_ICON[p]} {p.toUpperCase()}</p>
                    <p className="text-[9px] text-white/30">{PLAN_PRECIOS_LABEL[p]}</p>
                  </button>
                ))}
              </div>
              {payLink ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl" style={{ background:"rgba(0,245,212,0.05)", border:"1px solid rgba(0,245,212,0.15)" }}>
                    <p className="text-[9px] text-white/30 mb-1">Referencia</p>
                    <p className="font-mono text-xs text-white font-bold">{payLink.referencia}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyRef(payLink.paymentLink)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background:"rgba(0,245,212,0.1)", border:"1px solid rgba(0,245,212,0.25)", color:copiedRef?"#39ff7e":"#00f5d4" }}>
                      <Copy size={12}/>{copiedRef?"¡Copiado!":"Copiar enlace"}
                    </button>
                    <a href={payLink.paymentLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background:"linear-gradient(135deg,#00f5d4,#00a896)", color:"black" }}>
                      <ExternalLink size={12}/> Abrir
                    </a>
                  </div>
                </div>
              ) : (
                <button onClick={() => void getPayLink(payUser, payPlan)} disabled={busy === payUser.id}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all disabled:opacity-50"
                  style={{ background:"linear-gradient(135deg,#00f5d4,#00a896)", color:"black" }}>
                  {busy === payUser.id ? <Loader2 size={14} className="animate-spin"/> : <Link2 size={14}/>}
                  Generar enlace Wompi
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
