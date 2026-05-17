import { useState, useEffect } from "react";
import { useAuth, Account } from "@/lib/auth";
import {
  Eye, EyeOff, Lock, User, Shield, Zap, Star, Crown,
  Check, X, Leaf, ArrowRight, Wifi, Smartphone,
} from "lucide-react";

/* ── Real cow photo logo — login page ─────────────────────────────────────── */
function CivacLogo({ size = 80 }: { size?: number }) {
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <div className="w-full h-full rounded-[26%] overflow-hidden"
        style={{ border: "2.5px solid rgba(0,245,212,0.8)", boxShadow: "0 0 28px rgba(0,245,212,0.55), 0 0 60px rgba(0,200,255,0.25)" }}>
        <img
          src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=240&h=240&q=80&auto=format&fit=crop&crop=face"
          alt="CIVAC"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => {
            e.currentTarget.style.display = "none";
            (e.currentTarget.parentElement as HTMLElement).style.background = "linear-gradient(135deg,#0a3d22,#082818)";
            (e.currentTarget.parentElement as HTMLElement).innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem">🐄</div>';
          }}
        />
      </div>
      <div className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center font-black"
        style={{ width: size * 0.28, height: size * 0.28, background: "linear-gradient(135deg,#00f5d4,#00a896)", fontSize: size * 0.09, color: "#000", border: "2px solid #0e1e38", boxShadow: "0 0 10px rgba(0,245,212,0.8)" }}>
        IA
      </div>
    </div>
  );
}

/* ── Role config ──────────────────────────────────────────────────────────── */
const ROLE_CONFIG: Record<string, {
  emoji: string; icon: React.ReactNode; label: string; sub: string;
  from: string; to: string; glow: string; color: string;
}> = {
  admin: {
    emoji: "🛡️",
    icon: <Shield className="w-7 h-7"/>,
    label: "Administrador General",
    sub: "Acceso total al sistema",
    from: "#00f5d4", to: "#00a896", glow: "0,245,212", color: "#00f5d4",
  },
  vet: {
    emoji: "🩺",
    icon: <span className="text-3xl leading-none">🩺</span>,
    label: "Dr. Carlos Ramírez",
    sub: "Médico Veterinario",
    from: "#00c8ff", to: "#0ea5e9", glow: "0,200,255", color: "#00c8ff",
  },
  field: {
    emoji: "🌿",
    icon: <Leaf className="w-7 h-7"/>,
    label: "Luis Patiño",
    sub: "Operario de Campo",
    from: "#39ff7e", to: "#16a34a", glow: "57,255,126", color: "#39ff7e",
  },
  viewer: {
    emoji: "👁️",
    icon: <Eye className="w-7 h-7"/>,
    label: "Propietario / Inversor",
    sub: "Solo Lectura",
    from: "#c084fc", to: "#7c3aed", glow: "192,132,252", color: "#c084fc",
  },
};

const PLANES_FULL = [
  { id:"basico",  nombre:"Básico",  precio:"Gratis",     from:"#4b5563", to:"#374151", icon:<Leaf className="w-5 h-5"/>,
    features:["50 animales","1 usuario","Módulos base","Dashboard CIVAC","Alertas básicas"], badge:null },
  { id:"pro",     nombre:"PRO",     precio:"$89.000",    from:"#00f5d4", to:"#00c896", icon:<Zap className="w-5 h-5"/>,
    features:["300 animales","5 usuarios","Pesaje BT + GPS","Predicción IA","Google Drive sync","App Windows/iOS"], badge:"Popular", highlight:true },
  { id:"premium", nombre:"Premium", precio:"$189.000",   from:"#a855f7", to:"#7c3aed", icon:<Star className="w-5 h-5"/>,
    features:["1.000 animales","15 usuarios","GPS 50 collares","IA avanzada + GPT","Multi-finca (5)","Soporte 24h"], badge:"Recomendado" },
  { id:"platino", nombre:"Platino", precio:"$399.000",   from:"#fbbf24", to:"#ea580c", icon:<Crown className="w-5 h-5"/>,
    features:["Ilimitado","Usuarios ilimitados","GPS + geocercas IA","API REST + webhooks","Multi-finca ilimitada","SLA 99.9%"], badge:"Empresarial" },
];

/* ── Animated background particles ───────────────────────────────────────── */
function Particles() {
  const items = [
    { emoji:"🐄", x:8,  y:15, s:1.4, d:5.2, o:0.12 },
    { emoji:"🌿", x:88, y:20, s:1.1, d:4.8, o:0.10 },
    { emoji:"⚡", x:15, y:70, s:0.9, d:6.0, o:0.08 },
    { emoji:"📡", x:80, y:75, s:1.2, d:5.5, o:0.09 },
    { emoji:"🧬", x:50, y:8,  s:1.0, d:7.0, o:0.07 },
    { emoji:"💊", x:92, y:45, s:0.8, d:4.5, o:0.08 },
    { emoji:"🥛", x:5,  y:45, s:1.0, d:5.8, o:0.09 },
    { emoji:"🌾", x:45, y:88, s:1.3, d:6.5, o:0.08 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {items.map((p, i) => (
        <div key={i} className="absolute select-none"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            fontSize: `${p.s * 2}rem`,
            opacity: p.o,
            animation: `float ${p.d}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
            filter: "blur(0.5px)",
          }}>
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function Login() {
  const { login, loginAs, accounts } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [loadingId, setLoadingId] = useState<string|null>(null);
  const [tab, setTab]           = useState<"login"|"planes">("login");
  const [entered, setEntered]   = useState(false);

  useEffect(() => { setTimeout(() => setEntered(true), 80); }, []);

  const handleQuick = (a: Account) => {
    setLoadingId(a.id);
    setLoading(true);
    setTimeout(() => { loginAs(a); setLoading(false); }, 420);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    setTimeout(() => {
      if (!login(email, password)) setError("Credenciales incorrectas. Verifica email y contraseña.");
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg,#0e1e38 0%,#122440 35%,#162c50 65%,#112038 100%)",
        fontFamily: "'Space Grotesk','Sora',sans-serif",
      }}>

      {/* ── Animated ambient layers ─────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 10%, rgba(0,245,212,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 60% 60% at 80% 90%, rgba(45,122,79,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 85% 15%, rgba(0,200,255,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 10% 85%, rgba(192,132,252,0.04) 0%, transparent 60%)
          `,
        }}/>
        {/* Dot grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle, rgba(0,200,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}/>
        {/* Top scan line */}
        <div className="absolute top-0 left-0 right-0 h-px opacity-20"
          style={{background:"linear-gradient(90deg,transparent,#00f5d4,transparent)",animation:"scan-line 8s linear infinite"}}/>
      </div>

      <Particles/>

      {/* ── Main container ──────────────────────────────────────────────── */}
      <div className={`relative z-10 w-full max-w-5xl px-4 py-6 transition-all duration-700 ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          {/* Logo con glow animado */}
          <div className="inline-flex items-center justify-center mb-4 civac-float"
            style={{filter:"drop-shadow(0 0 30px rgba(0,245,212,0.45)) drop-shadow(0 0 60px rgba(0,200,255,0.2))"}}>
            <CivacLogo size={88}/>
          </div>

          {/* Brand name */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight" style={{fontFamily:"'Sora',sans-serif", letterSpacing:'-0.03em'}}>
              <span className="text-white">CI</span>
              <span style={{
                color:"#00f5d4",
                textShadow:"0 0 28px rgba(0,245,212,0.95),0 0 60px rgba(0,245,212,0.5),0 0 100px rgba(0,200,255,0.3)",
              }}>VAC</span>
            </h1>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg leading-none"
                style={{background:"linear-gradient(135deg,#00f5d4,#00a896)",color:"black",letterSpacing:"0.05em"}}>
                v4.2
              </span>
              <span className="text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-md leading-none"
                style={{background:"linear-gradient(135deg,#fbbf24,#ea580c)",color:"white",letterSpacing:"0.03em"}}>
                PRO
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base font-semibold mb-1" style={{color:"rgba(0,245,212,0.65)"}}>
            Control Inteligente de Valor Agropecuario · Colombia
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3">
            {[
              {icon:<Wifi size={10}/>,  label:"Offline PWA",   c:"0,245,212"},
              {icon:<Zap size={10}/>,   label:"Bluetooth BT",  c:"255,149,0"},
              {icon:<Smartphone size={10}/>,label:"GPS Ganado",c:"0,200,255"},
              {icon:<Star size={10}/>,  label:"IA predictiva", c:"232,121,249"},
            ].map(p=>(
              <span key={p.label} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold"
                style={{
                  background:`rgba(${p.c},0.08)`,
                  border:`1px solid rgba(${p.c},0.22)`,
                  color:`rgba(${p.c},0.85)`,
                }}>
                {p.icon}{p.label}
              </span>
            ))}
          </div>

          {/* Tab switcher */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <button
              className="px-6 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-250"
              style={{background:`linear-gradient(135deg,#00f5d4,#00c896)`,color:"black",boxShadow:`0 0 20px #00f5d455`,transform:"scale(1.04)"}}>
              Iniciar sesión
            </button>
          </div>
        </div>

        {/* ── PLANES TAB ────────────────────────────────────────────────── */}
        {tab === "planes" ? (
          <div className="space-y-5 civac-animate">
            <p className="text-center text-xs sm:text-sm" style={{color:"rgba(255,255,255,0.3)"}}>
              Facturación COP · IVA incluido · Pago seguro{" "}
              <strong style={{color:"#00f5d4"}}>Wompi — Bancolombia</strong> · Cancela cuando quieras
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {PLANES_FULL.map(p=>(
                <div key={p.id}
                  className={`relative rounded-3xl overflow-hidden card-lift ${p.highlight?"ring-1":""}`}
                  style={{
                    background:"rgba(4,13,26,0.95)",
                    border:`1px solid rgba(${p.from.replace("#","")},0.2)`,
                    boxShadow:p.highlight?`0 0 40px ${p.from}30, 0 0 80px ${p.from}15`:"none",
                    ...(p.highlight ? {ringColor:p.from} : {}),
                  }}>
                  {p.badge && (
                    <div className="absolute top-3 right-3 text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full text-white z-10"
                      style={{background:`linear-gradient(135deg,${p.from},${p.to})`}}>
                      {p.badge}
                    </div>
                  )}
                  <div className="h-1 w-full" style={{background:`linear-gradient(90deg,${p.from},${p.to})`}}/>
                  <div className="p-4 sm:p-5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg"
                      style={{background:`linear-gradient(135deg,${p.from},${p.to})`,boxShadow:`0 0 20px ${p.from}55`}}>
                      {p.icon}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-0.5" style={{fontFamily:"'Sora',sans-serif"}}>{p.nombre}</h3>
                    <p className="font-black text-lg sm:text-xl" style={{color:p.from}}>
                      {p.precio}<span className="text-white/35 text-xs font-normal">{p.id!=="basico"?"/mes":""}</span>
                    </p>
                    <ul className="mt-4 space-y-2 mb-5">
                      {p.features.map(f=>(
                        <li key={f} className="flex items-center gap-2 text-xs sm:text-sm text-white/65">
                          <Check className="w-3.5 h-3.5 flex-shrink-0" style={{color:"#39ff7e"}}/>{f}
                        </li>
                      ))}
                    </ul>
                    <button onClick={()=>setTab("login")}
                      className="w-full py-3 rounded-2xl font-black text-sm transition-all btn-neon"
                      style={{background:`linear-gradient(135deg,${p.from},${p.to})`,color:p.id==="basico"?"white":"black",boxShadow:`0 0 16px ${p.from}40`}}>
                      {p.id==="basico"?"Empezar gratis":"Suscribirme · Wompi"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs" style={{color:"rgba(255,255,255,0.25)"}}>
              <span className="flex items-center gap-1.5"><Lock className="w-3 h-3"/>Wompi · Bancolombia</span>
              <span className="flex items-center gap-1.5"><Check className="w-3 h-3"/>Factura electrónica DIAN</span>
              <span className="flex items-center gap-1.5"><X className="w-3 h-3"/>Sin permanencia mínima</span>
            </div>
          </div>
        ) : (

        /* ── LOGIN TAB ──────────────────────────────────────────────────── */
        <div className="civac-animate">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5 items-start">

            {/* ── PROFILE CARDS (3 cols on lg) ────────────────────────── */}
            <div className="lg:col-span-3 space-y-3">
              <p className="text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]"
                style={{color:"rgba(0,245,212,0.45)"}}>
                — Seleccione su perfil —
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {accounts.slice(0, 4).map(account => {
                  const rc = ROLE_CONFIG[account.role] || ROLE_CONFIG.viewer;
                  const isLoading = loadingId === account.id;
                  return (
                    <button
                      key={account.id}
                      onClick={() => handleQuick(account)}
                      disabled={loading}
                      className="relative rounded-3xl text-left transition-all duration-300 group overflow-hidden disabled:opacity-70 hover:scale-[1.025] active:scale-[0.98]"
                      style={{
                        background: `linear-gradient(145deg,rgba(${rc.glow},0.10),rgba(${rc.glow},0.04),rgba(0,0,0,0.4))`,
                        border: `1.5px solid rgba(${rc.glow},0.22)`,
                        boxShadow: `0 0 0 rgba(${rc.glow},0)`,
                        backdropFilter: "blur(16px)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 30px rgba(${rc.glow},0.22), 0 8px 30px rgba(0,0,0,0.4)`;
                        (e.currentTarget as HTMLButtonElement).style.borderColor = `rgba(${rc.glow},0.5)`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 rgba(0,0,0,0)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = `rgba(${rc.glow},0.22)`;
                      }}
                    >
                      {/* Top accent bar */}
                      <div className="h-0.5 w-full" style={{background:`linear-gradient(90deg,${rc.from},${rc.to},transparent)`}}/>

                      <div className="p-4 sm:p-5">
                        {/* Icon */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 duration-300"
                          style={{
                            background: `linear-gradient(135deg,${rc.from},${rc.to})`,
                            boxShadow: `0 0 20px rgba(${rc.glow},0.5), inset 0 1px 0 rgba(255,255,255,0.2)`,
                            color: "white",
                          }}>
                          {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
                          ) : (
                            <span style={{fontSize:"1.75rem",lineHeight:1}}>{rc.emoji}</span>
                          )}
                        </div>

                        {/* Name */}
                        <p className="font-black text-white text-sm sm:text-base leading-tight mb-0.5 truncate">
                          {account.nombre.split(" ").slice(0, 2).join(" ")}
                        </p>

                        {/* Role badge */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{background:`rgba(${rc.glow},0.15)`,color:rc.color,border:`1px solid rgba(${rc.glow},0.3)`}}>
                            {rc.sub}
                          </span>
                        </div>

                        {/* Auto-login CTA */}
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black"
                          style={{color:`rgba(${rc.glow},0.7)`}}>
                          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform"/>
                          <span>Toque para acceder</span>
                        </div>
                      </div>

                      {/* Loading overlay */}
                      {isLoading && (
                        <div className="absolute inset-0 rounded-3xl flex items-center justify-center"
                          style={{background:`linear-gradient(135deg,rgba(${rc.glow},0.2),rgba(${rc.glow},0.08))`,backdropFilter:"blur(4px)"}}>
                          <div className="text-center">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2"/>
                            <p className="text-xs font-bold text-white">Ingresando…</p>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Security note */}
              <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-2xl text-[9px] sm:text-[10px]"
                style={{background:"rgba(57,255,126,0.04)",border:"1px solid rgba(57,255,126,0.1)",color:"rgba(57,255,126,0.5)"}}>
                <Shield size={11}/>
                <span>Autenticación segura · Sesión cifrada · Sin contraseña almacenada en servidor</span>
              </div>
            </div>

            {/* ── LOGIN FORM (2 cols on lg) ────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl overflow-hidden"
                style={{
                  background:"linear-gradient(145deg,rgba(4,13,26,0.97),rgba(7,20,38,0.95))",
                  border:"1px solid rgba(0,245,212,0.18)",
                  boxShadow:"0 0 40px rgba(0,245,212,0.08), 0 24px 60px rgba(0,0,0,0.5)",
                  backdropFilter:"blur(24px)",
                }}>
                {/* Top accent */}
                <div className="h-0.5" style={{background:"linear-gradient(90deg,#00f5d4,#00c8ff,transparent)"}}/>

                <div className="p-5 sm:p-6">
                  <h2 className="font-black text-base sm:text-lg text-white mb-1 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                      style={{background:"rgba(0,245,212,0.12)",border:"1px solid rgba(0,245,212,0.3)"}}>
                      <Lock className="w-3.5 h-3.5" style={{color:"#00f5d4"}}/>
                    </div>
                    Iniciar sesión
                  </h2>
                  <p className="text-[10px] sm:text-xs mb-4" style={{color:"rgba(255,255,255,0.3)"}}>
                    O ingresa manualmente con tus credenciales
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider block">
                        Correo o usuario
                      </label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                          style={{color:"rgba(0,245,212,0.4)"}}/>
                        <input
                          type="text" value={email} autoComplete="off"
                          onChange={e=>{setEmail(e.target.value);setError("");}}
                          placeholder="admin@civac.co"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white placeholder:text-white/20 transition-all"
                          style={{
                            background:"rgba(0,245,212,0.04)",
                            border:"1px solid rgba(0,245,212,0.14)",
                            outline:"none",
                          }}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider block">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{color:"rgba(0,245,212,0.4)"}}/>
                        <input
                          type={showPass?"text":"password"} value={password} autoComplete="current-password"
                          onChange={e=>{setPassword(e.target.value);setError("");}}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-11 py-3 rounded-2xl text-sm text-white placeholder:text-white/20 transition-all"
                          style={{background:"rgba(0,245,212,0.04)",border:"1px solid rgba(0,245,212,0.14)",outline:"none"}}
                        />
                        <button type="button" onClick={()=>setShowPass(!showPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 transition-colors">
                          {showPass?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                        </button>
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs"
                        style={{background:"rgba(255,77,109,0.08)",border:"1px solid rgba(255,77,109,0.2)",color:"#ff6b8a"}}>
                        <X className="w-3.5 h-3.5 flex-shrink-0"/>{error}
                      </div>
                    )}

                    {/* Submit */}
                    <button type="submit" disabled={loading || !email}
                      className="w-full py-3.5 rounded-2xl font-black text-sm text-black transition-all btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{background:"linear-gradient(135deg,#00f5d4,#00c896)",boxShadow:"0 0 24px rgba(0,245,212,0.4)"}}>
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black/80 rounded-full animate-spin"/>
                          Verificando CIVAC…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Ingresar al sistema <ArrowRight className="w-4 h-4"/>
                        </span>
                      )}
                    </button>
                  </form>

                  {/* Sistema privado CIVAC */}
                  <div className="mt-5 pt-4 border-t" style={{borderColor:"rgba(0,245,212,0.08)"}}>
                    <div className="flex items-center justify-center gap-2 py-2">
                      <span className="text-[10px] text-white/20 text-center">Sistema privado CIVAC · Solo acceso autorizado por la empresa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <p className="text-center mt-6 sm:mt-8 text-[9px] sm:text-[10px]" style={{color:"rgba(255,255,255,0.14)"}}>
          CIVAC PRO v4.0 · Control Inteligente Agropecuario · Colombia {new Date().getFullYear()} · Sistema privado · Solo uso empresarial
        </p>
      </div>
    </div>
  );
}
