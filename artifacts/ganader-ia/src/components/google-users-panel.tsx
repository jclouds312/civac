import { useState, useEffect, useCallback } from "react";
import {
  UserCheck, UserX, RefreshCw, Link2, Shield, Crown, Loader2,
  Mail, Calendar, AlertTriangle, CheckCircle2, XCircle, Clock,
  Search, ChevronDown, Copy, ExternalLink, User,
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
};

interface DbUser {
  id: string; nombre: string; cargo: string; finca: string; email: string;
  role: string; planCode: string; activo: boolean;
  googleId: string | null; googleFoto: string | null;
  estado: string; createdAt: string;
}

interface PayLinkResult {
  paymentLink: string; referencia: string; plan: string; precio: number;
  user: { nombre: string; email: string };
}

const API = "/api";

export default function GoogleUsersPanel() {
  const [users, setUsers]           = useState<DbUser[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState<"todos"|"pendiente"|"activo"|"bloqueado"|"google">("todos");
  const [busy, setBusy]             = useState<string | null>(null);
  const [payLink, setPayLink]       = useState<PayLinkResult | null>(null);
  const [payUser, setPayUser]       = useState<DbUser | null>(null);
  const [payPlan, setPayPlan]       = useState("pro");
  const [planModal, setPlanModal]   = useState<DbUser | null>(null);
  const [newPlan, setNewPlan]       = useState("pro");
  const [copiedRef, setCopiedRef]   = useState(false);
  const [notify, setNotify]         = useState<{msg:string;ok:boolean}|null>(null);

  const showNotif = (msg: string, ok = true) => {
    setNotify({ msg, ok });
    setTimeout(() => setNotify(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch(`${API}/admin/users`);
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
        method: "PATCH", headers: { "Content-Type": "application/json" },
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
        method: "PATCH", headers: { "Content-Type": "application/json" },
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

  const getPayLink = async (u: DbUser, plan: string) => {
    setBusy(u.id);
    try {
      const r = await fetch(`${API}/admin/payment-link/${u.id}?plan=${plan}`);
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
    todos: users.length, pendiente: users.filter(u => u.estado === "pendiente").length,
    activo: users.filter(u => u.estado === "activo").length,
    bloqueado: users.filter(u => u.estado === "bloqueado").length,
    google: users.filter(u => !!u.googleId).length,
  };

  const copyRef = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* ── Notification Toast ── */}
      {notify && (
        <div className="fixed top-4 right-4 z-[100] px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-2xl animate-in slide-in-from-top-4"
          style={{ background: notify.ok ? "rgba(0,245,212,0.15)" : "rgba(248,113,113,0.15)",
            border: `1px solid ${notify.ok ? "rgba(0,245,212,0.4)" : "rgba(248,113,113,0.4)"}`,
            backdropFilter: "blur(16px)", color: notify.ok ? "#00f5d4" : "#f87171" }}>
          {notify.ok ? <CheckCircle2 size={14}/> : <AlertTriangle size={14}/>}
          {notify.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg,rgba(0,245,212,0.07),rgba(57,255,126,0.05))", border: "1px solid rgba(0,245,212,0.18)" }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-black text-base text-white flex items-center gap-2">
              <User size={16} style={{ color: "#00f5d4" }}/>
              Usuarios Registrados
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(0,245,212,0.12)", border: "1px solid rgba(0,245,212,0.25)", color: "#00f5d4" }}>
                {users.length} total
              </span>
            </h3>
            <p className="text-[11px] text-white/40 mt-0.5">Gestión de cuentas desde DB · Google OAuth + cuentas locales</p>
          </div>
          <button onClick={() => void load()} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
            style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.25)", color: "#00f5d4" }}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""}/>
            Actualizar
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {(["todos","pendiente","activo","bloqueado","google"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all"
              style={{
                background: filter === f ? (f === "pendiente" ? "rgba(251,191,36,0.2)" : f === "bloqueado" ? "rgba(248,113,113,0.2)" : f === "google" ? "rgba(66,133,244,0.2)" : "rgba(0,245,212,0.2)") : "rgba(255,255,255,0.05)",
                border: `1px solid ${filter === f ? (f === "pendiente" ? "rgba(251,191,36,0.5)" : f === "bloqueado" ? "rgba(248,113,113,0.5)" : f === "google" ? "rgba(66,133,244,0.5)" : "rgba(0,245,212,0.5)") : "rgba(255,255,255,0.1)"}`,
                color: filter === f ? (f === "pendiente" ? "#fbbf24" : f === "bloqueado" ? "#f87171" : f === "google" ? "#4285F4" : "#00f5d4") : "rgba(255,255,255,0.4)",
              }}>
              {f === "google" ? "🔵" : f === "pendiente" ? "🕐" : f === "activo" ? "✅" : f === "bloqueado" ? "🚫" : "🌐"}{" "}
              {f === "google" ? "Google" : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1 opacity-60">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email, finca…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs text-white placeholder:text-white/25 outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}/>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }}/>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-2xl p-4 flex items-center gap-2 text-sm" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
          <AlertTriangle size={14}/> {error}
          <button onClick={() => void load()} className="ml-auto text-xs underline underline-offset-2">Reintentar</button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 text-white/30">
          <Loader2 size={20} className="animate-spin" style={{ color: "#00f5d4" }}/>
          <span className="text-sm">Cargando usuarios de la base de datos…</span>
        </div>
      )}

      {/* ── Users Table ── */}
      {!loading && !error && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-white/25 text-sm">
              {search ? "Sin resultados para tu búsqueda" : "No hay usuarios registrados"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr style={{ background: "rgba(0,245,212,0.06)", borderBottom: "1px solid rgba(0,245,212,0.1)" }}>
                    {["Usuario","Rol","Plan","Estado","Acceso","Acciones"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-bold"
                        style={{ color: "rgba(0,245,212,0.6)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => {
                    const estado = ESTADO_CONFIG[u.estado] ?? ESTADO_CONFIG["pendiente"];
                    const planCol = PLAN_COLOR[u.planCode] ?? "#94a3b8";
                    return (
                      <tr key={u.id}
                        style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        {/* Usuario */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            {u.googleFoto
                              ? <img src={u.googleFoto} alt={u.nombre} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" style={{ border: "1px solid rgba(66,133,244,0.4)" }}/>
                              : <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                                  style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.2)" }}>
                                  {u.nombre[0]?.toUpperCase()}
                                </div>
                            }
                            <div>
                              <div className="flex items-center gap-1">
                                <p className="text-xs font-bold text-white">{u.nombre}</p>
                                {u.googleId && (
                                  <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold"
                                    style={{ background: "rgba(66,133,244,0.15)", border: "1px solid rgba(66,133,244,0.3)", color: "#4285F4" }}>G</span>
                                )}
                              </div>
                              <p className="text-[9px] flex items-center gap-1" style={{ color: "rgba(0,245,212,0.4)" }}>
                                <Mail size={8}/>{u.email}
                              </p>
                              {u.finca && u.finca !== "Sin asignar" && (
                                <p className="text-[8px] text-white/25">{u.finca}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Rol */}
                        <td className="px-3 py-2.5">
                          <span className="text-[10px] text-white/50 capitalize">{u.role}</span>
                        </td>
                        {/* Plan */}
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${planCol}14`, border: `1px solid ${planCol}35`, color: planCol }}>
                            {PLAN_ICON[u.planCode]}{u.planCode}
                          </span>
                        </td>
                        {/* Estado */}
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `rgba(${estado.glow},0.1)`, border: `1px solid rgba(${estado.glow},0.3)`, color: estado.color }}>
                            {estado.icon}{estado.label}
                          </span>
                        </td>
                        {/* Acceso */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            <Calendar size={9} className="text-white/20"/>
                            <span className="text-[9px] text-white/30">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"2-digit" }) : "—"}
                            </span>
                          </div>
                        </td>
                        {/* Acciones */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            {/* Activar */}
                            {u.estado !== "activo" && (
                              <button onClick={() => void changeEstado(u, "activo")} disabled={busy === u.id} title="Activar cuenta"
                                className="flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-bold transition-all disabled:opacity-50"
                                style={{ background: "rgba(57,255,126,0.12)", border: "1px solid rgba(57,255,126,0.35)", color: "#39ff7e" }}>
                                {busy === u.id ? <Loader2 size={9} className="animate-spin"/> : <UserCheck size={9}/>}
                                Activar
                              </button>
                            )}
                            {/* Bloquear */}
                            {u.estado !== "bloqueado" && (
                              <button onClick={() => void changeEstado(u, "bloqueado")} disabled={busy === u.id} title="Bloquear cuenta"
                                className="flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-bold transition-all disabled:opacity-50"
                                style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171" }}>
                                {busy === u.id ? <Loader2 size={9} className="animate-spin"/> : <UserX size={9}/>}
                                Bloquear
                              </button>
                            )}
                            {/* Plan */}
                            <button onClick={() => { setPlanModal(u); setNewPlan(u.planCode); }} title="Cambiar plan"
                              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-purple-500/15 transition-colors"
                              style={{ color: "#c084fc" }}>
                              <Crown size={10}/>
                            </button>
                            {/* Enlace de pago */}
                            <button onClick={() => { setPayUser(u); setPayPlan(u.planCode === "basico" ? "pro" : u.planCode); setPayLink(null); }} title="Generar enlace de pago"
                              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-teal-500/15 transition-colors"
                              style={{ color: "#00f5d4" }}>
                              <Link2 size={10}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Payment Link Modal ── */}
      {payUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-3xl overflow-hidden" style={{ background: "linear-gradient(145deg,#020d1a,#0a1a2e)", border: "1px solid rgba(0,245,212,0.25)", boxShadow: "0 0 60px rgba(0,245,212,0.1)" }}>
            <div className="h-1" style={{ background: "linear-gradient(90deg,#00f5d4,#00c8ff,transparent)" }}/>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <Link2 size={14} style={{ color: "#00f5d4" }}/> Enlace de Pago Wompi
                </h3>
                <button onClick={() => { setPayUser(null); setPayLink(null); }} className="text-white/30 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ background: "rgba(0,245,212,0.05)", border: "1px solid rgba(0,245,212,0.12)" }}>
                {payUser.googleFoto
                  ? <img src={payUser.googleFoto} alt={payUser.nombre} className="w-10 h-10 rounded-xl object-cover"/>
                  : <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: "rgba(0,245,212,0.1)" }}>{payUser.nombre[0]}</div>
                }
                <div>
                  <p className="text-xs font-bold text-white">{payUser.nombre}</p>
                  <p className="text-[10px]" style={{ color: "rgba(0,245,212,0.5)" }}>{payUser.email}</p>
                </div>
              </div>

              <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-2">Plan a asignar</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(["pro","premium","platino","basico"] as const).map(p => (
                  <button key={p} onClick={() => setPayPlan(p)}
                    className="p-2.5 rounded-xl text-left transition-all"
                    style={{ background: payPlan === p ? `${PLAN_COLOR[p]}15` : "rgba(255,255,255,0.03)", border: `1.5px solid ${payPlan === p ? `${PLAN_COLOR[p]}55` : "rgba(255,255,255,0.07)"}` }}>
                    <p className="text-[10px] font-black" style={{ color: PLAN_COLOR[p] }}>{PLAN_ICON[p]} {p.toUpperCase()}</p>
                    <p className="text-[9px] text-white/30">{PLAN_PRECIOS_LABEL[p]}</p>
                  </button>
                ))}
              </div>

              {payLink ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl" style={{ background: "rgba(0,245,212,0.05)", border: "1px solid rgba(0,245,212,0.15)" }}>
                    <p className="text-[9px] text-white/30 mb-1">Referencia</p>
                    <p className="font-mono text-xs text-white font-bold">{payLink.referencia}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyRef(payLink.paymentLink)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.25)", color: copiedRef ? "#39ff7e" : "#00f5d4" }}>
                      <Copy size={12}/>{copiedRef ? "¡Copiado!" : "Copiar enlace"}
                    </button>
                    <a href={payLink.paymentLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background: "linear-gradient(135deg,#00f5d4,#00a896)", color: "black" }}>
                      <ExternalLink size={12}/> Abrir
                    </a>
                  </div>
                </div>
              ) : (
                <button onClick={() => void getPayLink(payUser, payPlan)} disabled={busy === payUser.id}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#00f5d4,#00a896)", color: "black" }}>
                  {busy === payUser.id ? <Loader2 size={14} className="animate-spin"/> : <Link2 size={14}/>}
                  Generar enlace Wompi
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Plan Modal ── */}
      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ background: "linear-gradient(145deg,#020d1a,#0a1a2e)", border: "1px solid rgba(192,132,252,0.25)", boxShadow: "0 0 60px rgba(192,132,252,0.1)" }}>
            <div className="h-1" style={{ background: "linear-gradient(90deg,#a855f7,#e879f9,transparent)" }}/>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <Crown size={14} style={{ color: "#c084fc" }}/> Cambiar Plan
                </h3>
                <button onClick={() => setPlanModal(null)} className="text-white/30 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <p className="text-xs text-white/50 mb-4">{planModal.nombre} · {planModal.email}</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {(["basico","pro","premium","platino"] as const).map(p => (
                  <button key={p} onClick={() => setNewPlan(p)}
                    className="p-2.5 rounded-xl text-left transition-all"
                    style={{ background: newPlan === p ? `${PLAN_COLOR[p]}15` : "rgba(255,255,255,0.03)", border: `1.5px solid ${newPlan === p ? `${PLAN_COLOR[p]}55` : "rgba(255,255,255,0.07)"}` }}>
                    <p className="text-[10px] font-black" style={{ color: PLAN_COLOR[p] }}>{PLAN_ICON[p]} {p.toUpperCase()}</p>
                    <p className="text-[9px] text-white/30">{PLAN_PRECIOS_LABEL[p]}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPlanModal(null)} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white/40 hover:bg-white/5">Cancelar</button>
                <button onClick={() => void changePlan(planModal, newPlan)} disabled={busy === planModal.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#a855f7,#e879f9)", color: "white" }}>
                  {busy === planModal.id ? <Loader2 size={12} className="animate-spin"/> : <Shield size={12}/>}
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
