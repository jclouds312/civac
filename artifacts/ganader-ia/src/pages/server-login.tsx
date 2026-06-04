import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { CIVAC_STAFF_IDS } from "@/lib/auth";
import {
  Eye, EyeOff, Lock, Mail, Shield, Activity, Server,
  Terminal, Cpu, Globe, Wifi, AlertTriangle, ChevronRight,
} from "lucide-react";

/* ── Server status mock ──────────────────────────────────────────────── */
const SERVICES = [
  { id: "api",       label: "API Server",       port: 8080, color: "#00f5d4", glow: "0,245,212" },
  { id: "analytics", label: "Analytics",         port: 8099, color: "#a78bfa", glow: "167,139,250" },
  { id: "gps",       label: "GPS Server",        port: 8000, color: "#39ff7e", glow: "57,255,126" },
  { id: "frontend",  label: "Frontend PWA",      port: 5000, color: "#00c8ff", glow: "0,200,255" },
];

/* ── Animated grid background ────────────────────────────────────────── */
function ServerBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Deep space base */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(145deg, #020810 0%, #040d1a 40%, #020810 100%)" }} />

      {/* Animated grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" style={{ animation: "grid-pan 40s linear infinite" }}>
        <defs>
          <pattern id="sgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00f5d4" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sgrid)" />
      </svg>

      {/* Teal glow orb top-left */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #00f5d4 0%, transparent 70%)" }} />
      {/* Purple glow orb bottom-right */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-8" style={{ background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)" }} />

      {/* Scan line */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,212,0.3) 2px, rgba(0,245,212,0.3) 3px)",
        animation: "scan-lines 8s linear infinite",
      }} />
    </div>
  );
}

export default function ServerLogin() {
  const { login, user } = useAuth();
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  // Redirect if already logged in as CIVAC staff
  useEffect(() => {
    if (user && CIVAC_STAFF_IDS.includes(user.id)) {
      navigate("/server-dashboard");
    }
  }, [user]);

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const dateStr = now.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  void tick;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const ok = login(email.trim(), password);
      if (ok) {
        navigate("/server-dashboard");
      } else {
        setError("Credenciales inválidas para el servidor CIVAC");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ fontFamily: "'Space Grotesk','Sora',monospace" }}>
      <ServerBackground />

      <style>{`
        @keyframes grid-pan { from { transform: translate(0,0); } to { transform: translate(40px,40px); } }
        @keyframes scan-lines { from { backgroundPositionY: 0; } to { backgroundPositionY: 100vh; } }
        @keyframes pulse-border { 0%,100% { box-shadow: 0 0 0 0 rgba(0,245,212,0.15); } 50% { box-shadow: 0 0 0 4px rgba(0,245,212,0.06); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes float-in { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .server-input { background: rgba(0,245,212,0.04) !important; border-color: rgba(0,245,212,0.15) !important; color: #e2e8f0 !important; }
        .server-input:focus { border-color: rgba(0,245,212,0.5) !important; box-shadow: 0 0 0 2px rgba(0,245,212,0.08) !important; background: rgba(0,245,212,0.06) !important; }
        .server-input::placeholder { color: rgba(148,163,184,0.4) !important; }
      `}</style>

      {/* ── Top status bar ────────────────────────────────────────────── */}
      <header className="relative z-10 w-full h-10 flex items-center justify-between px-6 border-b" style={{ background: "rgba(2,8,16,0.9)", borderColor: "rgba(0,245,212,0.10)" }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: "#00f5d4" }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00f5d4", boxShadow: "0 0 6px #00f5d4" }} />
            <span>CIVAC PLATFORM SERVER</span>
          </div>
          <div className="hidden sm:flex gap-2">
            {SERVICES.map(s => (
              <div key={s.id} className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: `rgba(${s.glow},0.08)`, color: s.color, border: `1px solid rgba(${s.glow},0.15)` }}>
                <div className="w-1 h-1 rounded-full" style={{ background: s.color }} />
                <span>:{s.port}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: "rgba(148,163,184,0.5)" }}>
          <span className="hidden sm:block">{dateStr}</span>
          <span style={{ color: "rgba(0,245,212,0.6)" }}>{timeStr}</span>
          <Wifi size={10} style={{ color: "#39ff7e" }} />
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md" style={{ animation: "float-in 0.4s ease-out" }}>

          {/* CIVAC Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 relative"
              style={{ background: "linear-gradient(135deg,rgba(0,245,212,0.12),rgba(0,200,255,0.06))", border: "1.5px solid rgba(0,245,212,0.25)", boxShadow: "0 0 40px rgba(0,245,212,0.12)", animation: "pulse-border 3s ease-in-out infinite" }}>
              <div className="text-4xl">🐄</div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#00f5d4,#00c8ff)", boxShadow: "0 0 12px rgba(0,245,212,0.6)" }}>
                <Terminal size={14} style={{ color: "#040d1a" }} />
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: "#fff", fontFamily: "'Sora',sans-serif", letterSpacing: "-0.02em" }}>
              CIVAC <span style={{ color: "#00f5d4" }}>SERVER</span>
            </h1>
            <p className="text-[11px] font-mono mt-1.5" style={{ color: "rgba(0,245,212,0.45)", letterSpacing: "0.2em" }}>
              PLATFORM CONTROL · ACCESO RESTRINGIDO
            </p>
          </div>

          {/* Login card */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(4,13,26,0.85)", border: "1px solid rgba(0,245,212,0.14)", backdropFilter: "blur(20px)", boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,245,212,0.06)" }}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.2)" }}>
                <Shield size={15} style={{ color: "#00f5d4" }} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white">Autenticación de Servidor</p>
                <p className="text-[10px] font-mono" style={{ color: "rgba(0,245,212,0.4)" }}>Solo cuentas CIVAC Staff autorizadas</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold mb-1.5 font-mono" style={{ color: "rgba(0,245,212,0.6)", letterSpacing: "0.05em" }}>USUARIO / EMAIL</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(0,245,212,0.35)" }} />
                  <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="usuario@civac.co"
                    className="server-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-all font-mono"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold mb-1.5 font-mono" style={{ color: "rgba(0,245,212,0.6)", letterSpacing: "0.05em" }}>CONTRASEÑA</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(0,245,212,0.35)" }} />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="server-input w-full pl-9 pr-10 py-2.5 rounded-xl text-sm border outline-none transition-all font-mono"
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "rgba(0,245,212,0.35)" }}>
                    {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px]" style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#ff7070" }}>
                  <AlertTriangle size={13}/><span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-[14px] font-bold transition-all flex items-center justify-center gap-2 relative overflow-hidden"
                style={{ background: loading ? "rgba(0,245,212,0.1)" : "linear-gradient(135deg,#00f5d4,#00c8ff)", color: loading ? "#00f5d4" : "#040d1a", boxShadow: loading ? "none" : "0 0 24px rgba(0,245,212,0.35)", border: "1px solid rgba(0,245,212,0.3)" }}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-[12px]">AUTENTICANDO...</span>
                  </>
                ) : (
                  <>
                    <Shield size={15}/>
                    <span>ACCEDER AL SERVIDOR</span>
                    <ChevronRight size={14}/>
                  </>
                )}
              </button>
            </form>

            {/* Staff quick access — Credential cards */}
            <div className="mt-5 pt-4 border-t" style={{ borderColor: "rgba(0,245,212,0.08)" }}>
              <p className="text-[10px] font-mono text-center mb-3" style={{ color: "rgba(148,163,184,0.3)", letterSpacing: "0.1em" }}>— CREDENCIALES CIVAC STAFF —</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: "superadmin", label: "Super Admin",   email: "Softganventas@gmail.com",          pwd: "civac2026",  icon: "🔱", color: "#ff6b35", glow: "255,107,53",  role: "superadmin" },
                  { id: "developer",  label: "Desarrollador", email: "johnatanvallejomarulanda@gmail.com", pwd: "dev2026",    icon: "💻", color: "#00ff88", glow: "0,255,136",   role: "developer"  },
                  { id: "admin",      label: "Administrador", email: "lizet.daza@civac.co",               pwd: "lizet2026",  icon: "👑", color: "#fbbf24", glow: "251,191,36",  role: "admin"      },
                  { id: "ventas",     label: "Ventas CRM",    email: "ventas@civac.co",                   pwd: "ventas2026", icon: "📊", color: "#e879f9", glow: "232,121,249", role: "sales"      },
                ] as const).map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => { setEmail(acc.id); setPassword(acc.pwd); }}
                    className="flex flex-col gap-1.5 p-2.5 rounded-xl transition-all hover:scale-[1.03] text-left"
                    style={{
                      background: `rgba(${acc.glow},0.05)`,
                      border: `1px solid rgba(${acc.glow},0.18)`,
                      boxShadow: `0 0 0 0 rgba(${acc.glow},0)`,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 16px rgba(${acc.glow},0.2)`; (e.currentTarget as HTMLButtonElement).style.borderColor = `rgba(${acc.glow},0.4)`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 0 rgba(${acc.glow},0)`; (e.currentTarget as HTMLButtonElement).style.borderColor = `rgba(${acc.glow},0.18)`; }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{acc.icon}</span>
                      <span className="text-[10px] font-black" style={{ color: acc.color }}>{acc.label}</span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[8px] font-mono truncate" style={{ color: "rgba(255,255,255,0.3)" }}>
                        ID: <span style={{ color: "rgba(255,255,255,0.5)" }}>{acc.id}</span>
                      </div>
                      <div className="text-[8px] font-mono" style={{ color: acc.color, opacity: 0.7 }}>
                        🔑 {acc.pwd}
                      </div>
                    </div>
                    <div className="text-[8px] font-mono px-1.5 py-0.5 rounded-md text-center w-full"
                      style={{ background: `rgba(${acc.glow},0.1)`, color: acc.color }}>
                      Clic para llenar →
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[8px] font-mono text-center mt-2" style={{ color: "rgba(148,163,184,0.2)" }}>
                Usar ID de cuenta como usuario (ej: superadmin, admin, developer, ventas)
              </p>
            </div>
          </div>

          {/* Server status mini */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {SERVICES.map(s => (
              <div key={s.id} className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ background: "rgba(2,8,16,0.7)", border: `1px solid rgba(${s.glow},0.12)` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                <span className="text-[8px] font-mono" style={{ color: `rgba(${s.glow},0.5)` }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Back to client */}
          <div className="text-center mt-5">
            <a href="/" className="text-[11px] font-mono transition-colors hover:text-white" style={{ color: "rgba(148,163,184,0.25)" }}>
              ← Acceso Clientes / Demo
            </a>
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="relative z-10 h-8 flex items-center justify-center border-t" style={{ background: "rgba(2,8,16,0.9)", borderColor: "rgba(0,245,212,0.06)" }}>
        <p className="text-[9px] font-mono" style={{ color: "rgba(0,245,212,0.2)", letterSpacing: "0.15em" }}>
          CIVAC PLATFORM · ACCESO SERVIDOR · © 2026 · COLOMBIA
          <span className="ml-2 animate-pulse" style={{ animation: "blink 1s step-end infinite" }}>█</span>
        </p>
      </footer>
    </div>
  );
}

