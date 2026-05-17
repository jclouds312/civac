import { useState, useEffect } from "react";
import { useAuth, Account } from "@/lib/auth";
import {
  Eye, EyeOff, Lock, User, Shield, Zap, Star, Crown,
  Check, X, Leaf, ArrowRight, Wifi, Smartphone,
} from "lucide-react";

/* ── Logo vaca moderna GanaderIA — login page ─────────────────────────────── */
function CivacLogo({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="llBg1" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#0e3a20"/><stop offset="1" stopColor="#082818"/>
        </linearGradient>
        <radialGradient id="llBgR" cx="35%" cy="28%" r="55%">
          <stop stopColor="#1a6640" stopOpacity="0.5"/><stop offset="1" stopColor="#082818" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="llBody" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop stopColor="#f0ede0"/><stop offset="1" stopColor="#d8d0b8"/>
        </linearGradient>
        <linearGradient id="llHead" x1="0" y1="0" x2="0.5" y2="1">
          <stop stopColor="#f0ede0"/><stop offset="1" stopColor="#ccc4a8"/>
        </linearGradient>
        <linearGradient id="llMuzz" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#e8c8b0"/><stop offset="1" stopColor="#d0a888"/>
        </linearGradient>
        <linearGradient id="llHorn" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f5d878"/><stop offset="1" stopColor="#c8a030"/>
        </linearGradient>
        <linearGradient id="llSpot" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#3a2818"/><stop offset="1" stopColor="#281808"/>
        </linearGradient>
        <linearGradient id="llEar" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ddd4b8"/><stop offset="1" stopColor="#b8a880"/>
        </linearGradient>
        <linearGradient id="llChip" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#00f5d4"/><stop offset="1" stopColor="#00a8e8"/>
        </linearGradient>
        <linearGradient id="llCirc" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#00f5d4"/><stop offset="0.5" stopColor="#00c8ff"/><stop offset="1" stopColor="#00f5d4"/>
        </linearGradient>
        <linearGradient id="llBord" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#00f5d4" stopOpacity="0.85"/>
          <stop offset="0.5" stopColor="#2aaa60" stopOpacity="0.5"/>
          <stop offset="1" stopColor="#00c8ff" stopOpacity="0.75"/>
        </linearGradient>
        <radialGradient id="llEye" cx="38%" cy="32%" r="65%">
          <stop stopColor="#4a3020"/><stop offset="0.5" stopColor="#281808"/><stop offset="1" stopColor="#180c04"/>
        </radialGradient>
        <filter id="llGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="llShad" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.35"/>
        </filter>
        <filter id="llInner" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.25"/>
        </filter>
        <linearGradient id="llShine" x1="0" y1="0" x2="0.3" y2="1">
          <stop stopColor="white" stopOpacity="0.18"/><stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <radialGradient id="llRfid" cx="40%" cy="35%" r="60%">
          <stop stopColor="#00f5d4"/><stop offset="1" stopColor="#008870"/>
        </radialGradient>
      </defs>
      <rect width="120" height="120" rx="26" fill="url(#llBg1)"/>
      <rect width="120" height="120" rx="26" fill="url(#llBgR)"/>
      {/* Cuernos */}
      <path d="M38 46 C30 38 22 26 26 14 C29 5 38 8 40 18 C38 26 38 36 40 44" fill="url(#llHorn)" filter="url(#llShad)"/>
      <path d="M82 46 C90 38 98 26 94 14 C91 5 82 8 80 18 C82 26 82 36 80 44" fill="url(#llHorn)" filter="url(#llShad)"/>
      <path d="M36 38 C31 30 28 20 31 13" stroke="rgba(255,240,160,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M84 38 C89 30 92 20 89 13" stroke="rgba(255,240,160,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Orejas */}
      <ellipse cx="27" cy="54" rx="13" ry="9" fill="url(#llEar)" transform="rotate(-22 27 54)" filter="url(#llShad)"/>
      <ellipse cx="27" cy="54" rx="7.5" ry="5" fill="#e8c0a0" transform="rotate(-22 27 54)"/>
      <ellipse cx="93" cy="54" rx="13" ry="9" fill="url(#llEar)" transform="rotate(22 93 54)" filter="url(#llShad)"/>
      <ellipse cx="93" cy="54" rx="7.5" ry="5" fill="#e8c0a0" transform="rotate(22 93 54)"/>
      {/* Arete RFID */}
      <circle cx="18" cy="55" r="6" fill="url(#llRfid)" filter="url(#llGlow)"/>
      <circle cx="18" cy="55" r="3.2" fill="#0a2818"/>
      <circle cx="18" cy="55" r="1.3" fill="#00f5d4" opacity="0.95"/>
      {/* Cuerpo */}
      <ellipse cx="60" cy="72" rx="34" ry="32" fill="url(#llBody)" filter="url(#llShad)"/>
      <ellipse cx="60" cy="56" rx="29" ry="25" fill="url(#llHead)" filter="url(#llInner)"/>
      {/* Manchas Holstein */}
      <path d="M42 44 C38 40 35 46 38 52 C41 56 48 54 50 48 C52 42 46 40 42 44Z" fill="url(#llSpot)" opacity="0.75"/>
      <path d="M70 48 C67 44 63 46 64 52 C65 57 71 57 73 52 C75 48 73 44 70 48Z" fill="url(#llSpot)" opacity="0.65"/>
      <path d="M55 72 C52 68 50 74 53 78 C56 80 62 79 63 74 C64 70 58 68 55 72Z" fill="url(#llSpot)" opacity="0.45"/>
      {/* Circuito IA */}
      <path d="M43 38 L48 38 L51 34 L69 34 L72 38 L77 38" stroke="url(#llCirc)" strokeWidth="1.1" fill="none" opacity="0.85" filter="url(#llGlow)"/>
      <path d="M51 34 L51 29 L56 29" stroke="url(#llCirc)" strokeWidth="0.85" fill="none" opacity="0.7"/>
      <path d="M69 34 L69 29 L64 29" stroke="url(#llCirc)" strokeWidth="0.85" fill="none" opacity="0.7"/>
      <rect x="56" y="24" width="8" height="8" rx="2.2" fill="url(#llChip)" opacity="0.95" filter="url(#llGlow)"/>
      <rect x="58" y="26" width="4" height="4" rx="1" fill="#071a2f" opacity="0.95"/>
      <line x1="58.5" y1="24" x2="58.5" y2="22" stroke="#00f5d4" strokeWidth="0.7" opacity="0.55"/>
      <line x1="61.5" y1="24" x2="61.5" y2="22" stroke="#00f5d4" strokeWidth="0.7" opacity="0.55"/>
      <circle cx="48" cy="38" r="1.8" fill="#00f5d4" opacity="0.9" filter="url(#llGlow)"/>
      <circle cx="72" cy="38" r="1.8" fill="#00f5d4" opacity="0.9" filter="url(#llGlow)"/>
      <circle cx="56" cy="29" r="1.4" fill="#00c8ff" opacity="0.85"/>
      <circle cx="64" cy="29" r="1.4" fill="#00c8ff" opacity="0.85"/>
      {/* Ojos */}
      <ellipse cx="44" cy="58" rx="9" ry="8.5" fill="#1a1008" filter="url(#llInner)"/>
      <ellipse cx="44" cy="58" rx="7" ry="6.5" fill="url(#llEye)"/>
      <circle cx="44" cy="58" r="3.8" fill="#0e0804"/>
      <circle cx="46" cy="55.5" r="2" fill="white" opacity="0.95"/>
      <circle cx="42.5" cy="60" r="0.9" fill="white" opacity="0.4"/>
      <path d="M37 53 Q44 50.5 51 53" stroke="#2a1808" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6"/>
      <ellipse cx="76" cy="58" rx="9" ry="8.5" fill="#1a1008" filter="url(#llInner)"/>
      <ellipse cx="76" cy="58" rx="7" ry="6.5" fill="url(#llEye)"/>
      <circle cx="76" cy="58" r="3.8" fill="#0e0804"/>
      <circle cx="78" cy="55.5" r="2" fill="white" opacity="0.95"/>
      <circle cx="74.5" cy="60" r="0.9" fill="white" opacity="0.4"/>
      <path d="M69 53 Q76 50.5 83 53" stroke="#2a1808" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6"/>
      {/* Hocico */}
      <ellipse cx="60" cy="84" rx="19" ry="14" fill="url(#llMuzz)" filter="url(#llShad)"/>
      <ellipse cx="60" cy="86" rx="15" ry="10" fill="#c89870" opacity="0.6"/>
      <ellipse cx="53" cy="87" rx="4.2" ry="3.2" fill="#1a0e08" opacity="0.9"/>
      <ellipse cx="67" cy="87" rx="4.2" ry="3.2" fill="#1a0e08" opacity="0.9"/>
      <ellipse cx="54" cy="86" rx="1.4" ry="0.9" fill="rgba(255,255,255,0.15)"/>
      <ellipse cx="68" cy="86" rx="1.4" ry="0.9" fill="rgba(255,255,255,0.15)"/>
      <path d="M60 91 Q57 95.5 53 93.5" stroke="#180e06" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M60 91 Q63 95.5 67 93.5" stroke="#180e06" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      {/* Brillo */}
      <ellipse cx="58" cy="28" rx="34" ry="18" fill="url(#llShine)"/>
      {/* Borde */}
      <rect width="120" height="120" rx="26" fill="none" stroke="url(#llBord)" strokeWidth="2"/>
      <rect x="2" y="2" width="116" height="116" rx="24" fill="none" stroke="rgba(0,245,212,0.12)" strokeWidth="0.8"/>
    </svg>
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
              <span className="text-white">Ganad</span>
              <span style={{
                color:"#00f5d4",
                textShadow:"0 0 28px rgba(0,245,212,0.95),0 0 60px rgba(0,245,212,0.5),0 0 100px rgba(0,200,255,0.3)",
              }}>erIA</span>
            </h1>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg leading-none"
                style={{background:"linear-gradient(135deg,#00f5d4,#00a896)",color:"black",letterSpacing:"0.05em"}}>
                v4.0
              </span>
              <span className="text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-md leading-none"
                style={{background:"linear-gradient(135deg,#fbbf24,#ea580c)",color:"white",letterSpacing:"0.03em"}}>
                PRO
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base font-semibold mb-1" style={{color:"rgba(0,245,212,0.65)"}}>
            Ganadería Inteligente · Colombia · CIVAC
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
