import { useState, useEffect, useRef } from "react";
import { useAuth, PLAN_LABEL, PLAN_COLOR, PLAN_ICON, PLAN_PRECIOS, type PlanId } from "@/lib/auth";
import {
  User, Mail, Shield, Crown, CreditCard, LogOut, CheckCircle2,
  Clock, AlertTriangle, ExternalLink, Copy, RefreshCw, Zap,
  Building2, Briefcase, Globe, Lock, Smartphone, Star, Camera, Upload, X, Edit2, Check,
} from "lucide-react";
import { publicEnv } from "../lib/runtime-env";

const PLAN_FEATURES: Record<PlanId, string[]> = {
  basico:  ["50 animales","1 usuario","Dashboard","Inventario","Producción","Alertas"],
  pro:     ["Animales ilimitados","5 usuarios","GPS Ganado","Pesaje BT","Reproducción","Genética","Costos","Predicción IA"],
  premium: ["Todo PRO","15 usuarios","GPS 50 collares","IA avanzada","Multi-finca","Drive Sync","Pesaje manual","Huella CO₂","Lotes y datos","Ventas y asesoría","Sanidad y trazabilidad","Soporte 24/7"],
  platino: ["TODO ilimitado","Usuarios ilimitados","SLA 99.9%","Instancia dedicada","API + Webhooks"],
};

const PLAN_PRECIOS_LABEL: Record<PlanId, string> = {
  basico: "Gratis", pro: "$89.000/mes", premium: "$189.000/mes", platino: "$399.000/mes",
};

const PLAN_NEXT: Record<PlanId, PlanId | null> = {
  basico: "pro", pro: "premium", premium: "platino", platino: null,
};

const PLAN_GLOW: Record<PlanId, string> = {
  basico: "148,163,184", pro: "0,245,212", premium: "251,191,36", platino: "205,127,50",
};

const WOMPI_KEY = publicEnv("VITE_WOMPI_PUBLIC_KEY", "NEXT_PUBLIC_WOMPI_PUBLIC_KEY") || "pub_test_civac_demo_key";

function PlanBadgeBig({ plan }: { plan: PlanId }) {
  const c = PLAN_COLOR[plan];
  const g = PLAN_GLOW[plan];
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black uppercase tracking-wide"
      style={{ background: `rgba(${g},0.12)`, border: `1.5px solid rgba(${g},0.4)`, color: c, boxShadow: `0 0 20px rgba(${g},0.15)` }}>
      {PLAN_ICON[plan]} {PLAN_LABEL[plan]}
    </span>
  );
}

export default function MiCuenta() {
  const { user, logout, updateProfile } = useAuth();
  const [serverUser, setServerUser]   = useState<{
    id?: string; email?: string; estado?: string; googleFoto?: string; googleLinked?: boolean;
    googleEmail?: string | null; hasPassword?: boolean; planCode?: string; planExpiry?: string | null;
    cargo?: string; finca?: string;
  } | null>(null);
  const [loading, setLoading]         = useState(false);
  const [payRef, setPayRef]           = useState<string | null>(null);
  const [payPlan, setPayPlan]         = useState<PlanId>("pro");
  const [showPayModal, setShowPayModal] = useState(false);
  const [copied, setCopied]           = useState(false);
  const [tab, setTab]                 = useState<"perfil" | "plan" | "seguridad">("perfil");
  const [googleConfigured, setGoogleConfigured] = useState<boolean | null>(null);
  const [googleLinkBusy, setGoogleLinkBusy] = useState(false);
  const [googleMessage, setGoogleMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const photoKey = `civac_user_foto_${user?.id ?? ""}`;
  const [customFoto, setCustomFoto]   = useState<string | null>(() => { try { return localStorage.getItem(photoKey); } catch { return null; } });
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFoto(true);
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target?.result as string;
      localStorage.setItem(photoKey, b64);
      setCustomFoto(b64);
      setUploadingFoto(false);
    };
    reader.readAsDataURL(file);
  };
  const removePhoto = () => { localStorage.removeItem(photoKey); setCustomFoto(null); };

  useEffect(() => {
    const token = localStorage.getItem("civac_server_token");
    if (!token) return;
    setLoading(true);
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json() as Promise<NonNullable<typeof serverUser>>)
      .then(d => setServerUser(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/auth/google/status")
      .then(r => r.json() as Promise<{ configured?: boolean }>)
      .then(d => setGoogleConfigured(Boolean(d.configured)))
      .catch(() => setGoogleConfigured(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linked = params.get("google_linked");
    const error = params.get("google_link_error");
    if (!linked && !error) return;
    if (linked) setGoogleMessage("Gmail verificado y vinculado a la cuenta William.");
    else {
      const messages: Record<string, string> = {
        state: "No se pudo verificar la solicitud. Intenta vincular Gmail otra vez.",
        cancelled: "La vinculación con Google fue cancelada.",
        session: "La sesión venció. Entra de nuevo con tu tarjeta o contraseña.",
        account: "La cuenta no está disponible para vincular Gmail.",
        token: "Google no pudo confirmar el acceso. Intenta de nuevo.",
        unverified: "Debes elegir una cuenta Gmail verificada.",
        already_linked: "Ese Gmail ya está vinculado a otra cuenta CIVAC.",
        server: "No fue posible completar la vinculación. Intenta más tarde.",
      };
      setGoogleMessage(messages[error ?? ""] ?? "No fue posible vincular Gmail.");
    }
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  useEffect(() => {
    if (!serverUser?.email || !user) return;
    const updates: Parameters<typeof updateProfile>[0] = {};
    if (serverUser.email !== user.email) updates.email = serverUser.email;
    if (serverUser.googleEmail && serverUser.googleEmail !== user.googleEmail) updates.googleEmail = serverUser.googleEmail;
    if (serverUser.googleFoto && serverUser.googleFoto !== user.googleAvatar) updates.googleAvatar = serverUser.googleFoto;
    if (Object.keys(updates).length) updateProfile(updates);
  // updateProfile only applies these server-verified values; keyed to their values to avoid repeating the sync.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUser?.email, serverUser?.googleEmail, serverUser?.googleFoto, user?.id]);

  const hasPassword = serverUser?.hasPassword ?? Boolean(user?.password && !user.password.startsWith("CARD_ONLY:"));

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");
    if (newPassword.length < 10) {
      setPasswordMessage("Usa al menos 10 caracteres para la nueva contraseña.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Las contraseñas nuevas no coinciden.");
      return;
    }
    const token = localStorage.getItem("civac_server_token") || localStorage.getItem("civac_session_token");
    if (!token) {
      setPasswordMessage("No encontramos una sesión segura. Vuelve a iniciar sesión.");
      return;
    }
    setPasswordBusy(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json() as { ok?: boolean; hasPassword?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error ?? "No se pudo actualizar la contraseña.");
      setServerUser(current => current ? { ...current, hasPassword: true } : current);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Contraseña actualizada. Ya puedes usarla junto con tu Gmail.");
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : "No se pudo actualizar la contraseña.");
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleGoogleLink = async () => {
    setGoogleMessage("");
    const token = localStorage.getItem("civac_server_token") || localStorage.getItem("civac_session_token");
    if (!token) {
      setGoogleMessage("Vuelve a iniciar sesión para vincular Gmail.");
      return;
    }
    setGoogleLinkBusy(true);
    try {
      const response = await fetch("/api/auth/google/link/start", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json() as { authorizationUrl?: string; error?: string };
      if (!response.ok || !data.authorizationUrl) throw new Error(data.error ?? "No se pudo iniciar la vinculación.");
      window.location.assign(data.authorizationUrl);
    } catch (error) {
      setGoogleMessage(error instanceof Error ? error.message : "No se pudo iniciar la vinculación con Google.");
      setGoogleLinkBusy(false);
    }
  };

  const currentPlan = (user?.plan ?? "basico") as PlanId;
  const nextPlan    = PLAN_NEXT[currentPlan];
  const estado      = serverUser?.estado ?? (user?.activo === false ? "pendiente" : "activo");
  const googleFoto  = serverUser?.googleFoto;
  const googleLinked = serverUser?.googleLinked ?? Boolean(user?.googleEmail);
  const googleEmail = serverUser?.googleEmail ?? user?.googleEmail;

  const genPayLink = (plan: PlanId) => {
    const ref = `CIVAC-${plan.toUpperCase()}-${user?.id?.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    setPayRef(ref);
    setPayPlan(plan);
    setShowPayModal(true);
  };

  const wompiUrl = (plan: PlanId, ref: string) => {
    const precio = PLAN_PRECIOS[plan];
    return `https://checkout.wompi.co/p/?public-key=${WOMPI_KEY}&currency=COP&amount-in-cents=${precio * 100}&reference=${ref}` +
      (user?.email ? `&customer-data:email=${encodeURIComponent(user.email)}` : "") +
      (user?.nombre ? `&customer-data:full-name=${encodeURIComponent(user.nombre)}` : "");
  };

  const copyRef = () => {
    if (payRef) { navigator.clipboard?.writeText(payRef); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-5 py-4 px-4">
      {/* ── Hero banner ── */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg,#020d1a 0%,#081828 50%,#041018 100%)", border: "1px solid rgba(0,245,212,0.2)", boxShadow: "0 0 50px rgba(0,245,212,0.06)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 90% 20%,rgba(0,245,212,0.08),transparent)" }}/>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,#00f5d4,transparent)" }}/>
        <div className="relative p-5 flex items-center gap-5">
          {/* Avatar con upload */}
          <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload}/>
            {(customFoto || googleFoto)
              ? <img src={customFoto ?? googleFoto!} alt={user.nombre} className="w-20 h-20 rounded-2xl object-cover" style={{ border: "2px solid rgba(0,245,212,0.5)", boxShadow: "0 0 20px rgba(0,245,212,0.2)" }}/>
              : <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black"
                  style={{ background: "linear-gradient(135deg,rgba(0,245,212,0.15),rgba(0,200,255,0.1))", border: "2px solid rgba(0,245,212,0.35)", boxShadow: "0 0 20px rgba(0,245,212,0.15)" }}>
                  {user.nombre?.[0]?.toUpperCase() ?? "U"}
                </div>
            }
            {/* Hover overlay para indicar upload */}
            <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(2px)" }}>
              {uploadingFoto
                ? <RefreshCw size={16} className="animate-spin text-teal-400"/>
                : <><Camera size={16} className="text-teal-400"/><span className="text-[8px] font-bold text-teal-300">Cambiar</span></>
              }
            </div>
            {/* Estado dot */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
              style={{ background: estado === "activo" ? "#39ff7e" : estado === "pendiente" ? "#fbbf24" : "#f87171",
                borderColor: "#020d1a", boxShadow: `0 0 8px ${estado === "activo" ? "#39ff7e" : estado === "pendiente" ? "#fbbf24" : "#f87171"}` }}/>
            {/* Quitar foto */}
            {customFoto && (
              <button onClick={e => { e.stopPropagation(); removePhoto(); }}
                className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
                style={{ background: "rgba(248,113,113,0.9)", boxShadow: "0 0 8px rgba(248,113,113,0.5)" }}>
                <X size={10} color="white"/>
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-white truncate">{user.nombre}</h1>
            <p className="text-xs text-white/50 truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <PlanBadgeBig plan={currentPlan}/>
              {/* Estado badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{
                  background: estado === "activo" ? "rgba(57,255,126,0.12)" : estado === "pendiente" ? "rgba(251,191,36,0.12)" : "rgba(248,113,113,0.12)",
                  border: `1px solid ${estado === "activo" ? "rgba(57,255,126,0.35)" : estado === "pendiente" ? "rgba(251,191,36,0.35)" : "rgba(248,113,113,0.35)"}`,
                  color: estado === "activo" ? "#39ff7e" : estado === "pendiente" ? "#fbbf24" : "#f87171",
                }}>
                {estado === "activo" ? <CheckCircle2 size={9}/> : estado === "pendiente" ? <Clock size={9}/> : <AlertTriangle size={9}/>}
                {estado === "activo" ? "Activo" : estado === "pendiente" ? "Pendiente activación" : "Bloqueado"}
              </span>
            </div>
          </div>

          {loading && <RefreshCw size={14} className="animate-spin text-white/20 flex-shrink-0"/>}
        </div>
      </div>

      {/* ── Cuenta pendiente aviso ── */}
      {estado === "pendiente" && (
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.25)" }}>
          <Clock size={16} style={{ color: "#fbbf24", flexShrink: 0, marginTop: 1 }}/>
          <div>
            <p className="text-xs font-black" style={{ color: "#fbbf24" }}>Cuenta pendiente de activación</p>
            <p className="text-[11px] text-white/50 mt-1">Tu cuenta está siendo revisada por el equipo CIVAC. Recibirás acceso completo una vez el administrador la active. Mientras tanto puedes explorar el sistema con acceso limitado.</p>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {([
          { id: "perfil",    icon: <User size={12}/>,    label: "Perfil" },
          { id: "plan",      icon: <Crown size={12}/>,   label: "Mi Plan" },
          { id: "seguridad", icon: <Shield size={12}/>,  label: "Seguridad" },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: tab === t.id ? "rgba(0,245,212,0.12)" : "transparent",
              border: tab === t.id ? "1px solid rgba(0,245,212,0.25)" : "1px solid transparent",
              color: tab === t.id ? "#00f5d4" : "rgba(255,255,255,0.35)" }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Perfil ── */}
      {tab === "perfil" && (
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              { icon: <User size={13}/>,      label: "Nombre",  val: user.nombre,    c: "#00f5d4" },
              { icon: <Mail size={13}/>,      label: "Email",   val: serverUser?.email ?? user.email, c: "#00c8ff" },
              { icon: <Briefcase size={13}/>, label: "Cargo",   val: user.cargo || serverUser?.cargo || "—", c: "#a78bfa" },
              { icon: <Building2 size={13}/>, label: "Finca",   val: user.finca || serverUser?.finca || "—", c: "#39ff7e" },
              { icon: <Shield size={13}/>,    label: "Rol",     val: user.role,      c: "#fbbf24" },
            ].map((row, i) => (
              <div key={row.label} className="flex items-center gap-3 px-4 py-3"
                style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${row.c}14`, color: row.c }}>{row.icon}</div>
                <div>
                  <p className="text-[9px] text-white/30 uppercase tracking-wider">{row.label}</p>
                  <p className="text-xs font-bold text-white capitalize">{row.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* William can securely link a verified Gmail after the one-use card login. */}
          {user.id === "civac_william" && (
            <div className="rounded-2xl p-4 space-y-3"
              style={{ background: "rgba(66,133,244,0.07)", border: "1px solid rgba(66,133,244,0.2)" }}>
              <div className="flex items-center gap-3">
                {googleFoto
                  ? <img src={googleFoto} alt="" className="w-9 h-9 rounded-full object-cover"/>
                  : <Globe size={16} style={{ color: "#4285F4", flexShrink: 0 }}/>
                }
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold" style={{ color: "#8ab4f8" }}>
                    {googleLinked ? "Gmail vinculada" : "Vincular Gmail"}
                  </p>
                  <p className="text-[10px] text-white/45 truncate">
                    {googleEmail ?? "Usa Google para volver a entrar a la cuenta de William."}
                  </p>
                </div>
                {googleLinked && <CheckCircle2 size={14} style={{ color: "#4285F4", flexShrink: 0 }}/>}
                <button type="button" onClick={handleGoogleLink}
                  disabled={googleLinkBusy || googleConfigured === false}
                  className="flex-shrink-0 px-3 py-2 rounded-xl text-[10px] font-black disabled:opacity-40"
                  style={{ background: "rgba(66,133,244,0.14)", border: "1px solid rgba(66,133,244,0.3)", color: "#8ab4f8" }}>
                  {googleLinkBusy ? "Conectando…" : googleLinked ? "Cambiar Gmail" : "Vincular"}
                </button>
              </div>
              <p className="text-[9px] leading-relaxed text-white/35">
                Google verificará la dirección. Al vincularla, ese Gmail quedará como correo de acceso y el nombre de la cuenta seguirá siendo William.
                {googleConfigured === false ? " El administrador debe configurar Google OAuth antes de activar esta opción." : ""}
              </p>
              {googleMessage && <p role="status" className="text-[10px] text-sky-200">{googleMessage}</p>}
            </div>
          )}

          {/* Logout */}
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-80"
            style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
            <LogOut size={14}/> Cerrar sesión
          </button>
        </div>
      )}

      {/* ── TAB: Plan ── */}
      {tab === "plan" && (
        <div className="space-y-4">
          {/* Current plan */}
          <div className="rounded-2xl p-4" style={{ background: `rgba(${PLAN_GLOW[currentPlan]},0.07)`, border: `1px solid rgba(${PLAN_GLOW[currentPlan]},0.2)` }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Plan Actual</p>
                <div className="flex items-center gap-2 mt-1">
                  <PlanBadgeBig plan={currentPlan}/>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">{PLAN_PRECIOS_LABEL[currentPlan]}</p>
                <p className="text-[10px] text-white/30">IVA incluido</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {PLAN_FEATURES[currentPlan].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                  <CheckCircle2 size={9} style={{ color: PLAN_COLOR[currentPlan], flexShrink: 0 }}/>{f}
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade options */}
          {nextPlan && (
            <>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/30">Mejora tu plan</p>
              {(["pro","premium","platino"] as PlanId[]).filter(p => {
                const order: Record<PlanId, number> = { basico:0, pro:1, premium:2, platino:3 };
                return order[p] > order[currentPlan];
              }).map(plan => {
                const g = PLAN_GLOW[plan];
                const c = PLAN_COLOR[plan];
                return (
                  <div key={plan} className="rounded-2xl p-4" style={{ background: `rgba(${g},0.05)`, border: `1px solid rgba(${g},0.18)` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{PLAN_ICON[plan]}</span>
                        <div>
                          <p className="text-xs font-black" style={{ color: c }}>{PLAN_LABEL[plan].toUpperCase()}</p>
                          <p className="text-[10px] text-white/35">{PLAN_PRECIOS_LABEL[plan]}</p>
                        </div>
                      </div>
                      <button onClick={() => genPayLink(plan)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all hover:opacity-80"
                        style={{ background: `linear-gradient(135deg,rgba(${g},0.25),rgba(${g},0.15))`, border: `1px solid rgba(${g},0.4)`, color: c }}>
                        <Zap size={11}/> Mejorar
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {PLAN_FEATURES[plan].slice(0,4).map(f => (
                        <div key={f} className="flex items-center gap-1 text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                          <Star size={8} style={{ color: c, flexShrink: 0 }}/>{f}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {currentPlan === "platino" && (
            <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(205,127,50,0.07)", border: "1px solid rgba(205,127,50,0.2)" }}>
              <p className="text-2xl mb-2">👑</p>
              <p className="text-sm font-black" style={{ color: "#cd7f32" }}>Plan Platino — El más alto</p>
              <p className="text-xs text-white/40 mt-1">Tienes acceso a todos los módulos y funcionalidades de CIVAC PRO.</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Seguridad ── */}
      {tab === "seguridad" && (
        <div className="space-y-3">
          {[
            { icon: <Lock size={13}/>,       label: "Contraseña",          val: hasPassword ? "Configurada" : "Pendiente de configurar", c: "#fbbf24" },
            { icon: <Smartphone size={13}/>, label: "2FA",                 val: "No activado",     c: "#f87171" },
            { icon: <Globe size={13}/>,      label: "Sesión activa",       val: "Este dispositivo", c: "#39ff7e" },
            { icon: <Shield size={13}/>,     label: "Nivel de acceso",     val: user.role,         c: "#a78bfa" },
          ].map((row, i) => (
            <div key={row.label} className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${row.c}14`, color: row.c }}>{row.icon}</div>
              <div className="flex-1">
                <p className="text-[9px] text-white/30 uppercase tracking-wider">{row.label}</p>
                <p className="text-xs font-bold text-white capitalize">{row.val}</p>
              </div>
            </div>
          ))}
          {user.id === "civac_william" && (
            <form onSubmit={handlePasswordSave} className="rounded-2xl p-4 space-y-3"
              style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.18)" }}>
              <div>
                <p className="text-xs font-black text-amber-200">
                  {hasPassword ? "Cambiar contraseña" : "Crear contraseña de acceso"}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-white/40">
                  {hasPassword
                    ? "Confirma tu contraseña actual para guardar una nueva."
                    : "Después de entrar con la tarjeta privada, crea una contraseña para futuros accesos."}
                </p>
              </div>
              {hasPassword && (
                <input type="password" autoComplete="current-password" value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)} required
                  placeholder="Contraseña actual"
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white placeholder:text-white/25 outline-none"
                  style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.1)" }}/>
              )}
              <input type="password" autoComplete="new-password" value={newPassword}
                onChange={e => setNewPassword(e.target.value)} minLength={10} maxLength={128} required
                placeholder="Nueva contraseña (mínimo 10 caracteres)"
                className="w-full px-3 py-2.5 rounded-xl text-xs text-white placeholder:text-white/25 outline-none"
                style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.1)" }}/>
              <input type="password" autoComplete="new-password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)} minLength={10} maxLength={128} required
                placeholder="Confirmar nueva contraseña"
                className="w-full px-3 py-2.5 rounded-xl text-xs text-white placeholder:text-white/25 outline-none"
                style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.1)" }}/>
              <button type="submit" disabled={passwordBusy}
                className="w-full py-2.5 rounded-xl text-xs font-black disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", color: "#1a1300" }}>
                {passwordBusy ? "Guardando…" : hasPassword ? "Actualizar contraseña" : "Crear contraseña"}
              </button>
              {passwordMessage && <p role="status" className="text-[10px] text-amber-100/80">{passwordMessage}</p>}
            </form>
          )}
          <div className="rounded-2xl p-4 mt-2" style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)" }}>
            <p className="text-xs font-bold text-white/60 mb-2">Zona de peligro</p>
            <button onClick={logout}
              className="flex items-center gap-2 text-xs font-bold transition-all hover:opacity-80"
              style={{ color: "#f87171" }}>
              <LogOut size={12}/> Cerrar sesión en este dispositivo
            </button>
          </div>
        </div>
      )}

      {/* ── Payment Modal ── */}
      {showPayModal && payRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)" }}>
          <div className="w-full max-w-md rounded-3xl overflow-hidden" style={{ background: "linear-gradient(145deg,#040d1a,#071325)", border: "1px solid rgba(0,245,212,0.2)", boxShadow: "0 0 80px rgba(0,245,212,0.10)" }}>
            <div className="h-1" style={{ background: `linear-gradient(90deg,${PLAN_COLOR[payPlan]},#00a896)` }}/>
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-black text-white">Mejorar a <span style={{ color: PLAN_COLOR[payPlan] }}>{PLAN_LABEL[payPlan]}</span></h2>
                  <p className="text-xs text-white/40 mt-0.5">{PLAN_PRECIOS_LABEL[payPlan]} · COP · IVA incluido</p>
                </div>
                <button onClick={() => setShowPayModal(false)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "rgba(255,255,255,0.5)" }}><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Referencia */}
              <div className="rounded-2xl p-3 mb-5 flex items-center justify-between gap-3" style={{ background: "rgba(0,245,212,0.05)", border: "1px solid rgba(0,245,212,0.15)" }}>
                <div>
                  <p className="text-[9px] text-white/30 uppercase tracking-wider">Referencia de pago</p>
                  <p className="font-mono text-xs font-bold text-white">{payRef}</p>
                </div>
                <button onClick={copyRef} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl transition-colors"
                  style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.2)", color: copied ? "#39ff7e" : "#00f5d4" }}>
                  <Copy size={11}/>{copied ? "Copiado" : "Copiar"}
                </button>
              </div>

              {/* Wompi link */}
              <a href={wompiUrl(payPlan, payRef)} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-black text-sm transition-all hover:opacity-90 mb-3"
                style={{ background: `linear-gradient(135deg,${PLAN_COLOR[payPlan]},#00a896)`, color: "black" }}>
                <CreditCard size={14}/> Pagar con Wompi →
              </a>

              {/* Nequi / PSE alternatives */}
              <div className="grid grid-cols-2 gap-2">
                <button className="py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  style={{ background: "rgba(192,132,252,0.08)", border: "1px solid rgba(192,132,252,0.2)", color: "#c084fc" }}>
                  <Smartphone size={11}/> Nequi
                </button>
                <button className="py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa" }}>
                  <Building2 size={11}/> PSE
                </button>
              </div>
              <p className="text-[9px] text-white/20 text-center mt-3">256-bit SSL · PCI DSS · Bancolombia · Tu plan activa en máx 24h</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
