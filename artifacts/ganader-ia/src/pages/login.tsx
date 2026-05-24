import { useState, useRef } from "react";
import { useAuth, Account, PLAN_LABEL, PLAN_COLOR, PLAN_ICON, PLAN_PRECIOS, type PlanId } from "@/lib/auth";
import {
  Eye, EyeOff, Lock, User, Shield, Zap, Star, Crown,
  Check, X, Leaf, ArrowRight, Wifi, Smartphone, CreditCard,
  Phone, Building2, ChevronRight, ChevronDown, CheckCircle2, ExternalLink,
  Settings2, AlertTriangle, Copy
} from "lucide-react";

/* ── Logo ───────────────────────────────────────────────────────────────────── */
function CivacLogo({ size = 80 }: { size?: number }) {
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <div className="w-full h-full rounded-[26%] overflow-hidden"
        style={{ border: "2.5px solid rgba(0,245,212,0.8)", boxShadow: "0 0 28px rgba(0,245,212,0.55), 0 0 60px rgba(0,200,255,0.25)" }}>
        <img src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=240&h=240&q=80&auto=format&fit=crop&crop=face"
          alt="GanaderIA" style={{ width:"100%", height:"100%", objectFit:"cover" }}
          onError={e => { e.currentTarget.style.display="none"; (e.currentTarget.parentElement as HTMLElement).innerHTML='<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;background:linear-gradient(135deg,#0a3d22,#082818)">🐄</div>'; }} />
      </div>
      <div className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center font-black"
        style={{ width: size*0.28, height: size*0.28, background:"linear-gradient(135deg,#00f5d4,#00a896)", fontSize: size*0.09, color:"#000", border:"2px solid #0e1e38", boxShadow:"0 0 10px rgba(0,245,212,0.8)" }}>
        IA
      </div>
    </div>
  );
}

/* ── Plan badge ─────────────────────────────────────────────────────────────── */
function PlanBadge({ plan, size = "md" }: { plan?: PlanId; size?: "sm" | "md" | "lg" }) {
  const p = plan ?? "basico";
  const sizes = { sm:"text-[9px] px-1.5 py-0.5", md:"text-xs px-2.5 py-1", lg:"text-sm px-3 py-1.5" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-black uppercase tracking-wide ${sizes[size]}`}
      style={{ background:`${PLAN_COLOR[p]}20`, border:`1.5px solid ${PLAN_COLOR[p]}55`, color:PLAN_COLOR[p] }}>
      {PLAN_ICON[p]} {PLAN_LABEL[p]}
    </span>
  );
}

/* ── Plan features ──────────────────────────────────────────────────────────── */
const PLAN_FEATURES: Record<PlanId, string[]> = {
  basico:  ["50 animales máx","1 usuario","Dashboard básico","Inventario","Producción","Alertas","Potreros"],
  pro:     ["Animales ilimitados","5 usuarios","Pesaje Bluetooth","GPS ganado","Reproducción","Genética","Insumos","Costos","Personal","Predicción IA","3 Multi-fincas","Básculas COM/USB"],
  premium: ["Todo el plan PRO","15 usuarios","GPS 50 collares","IA avanzada","Multi-finca ilimitada","Google Drive sync","Soporte 24/7","API REST"],
  platino: ["TODO ilimitado","Usuarios ilimitados","SLA 99.9%","Instancia dedicada","Capacitación en finca","Módulos a medida","Contrato empresarial","Webhooks + API"],
};

const PLAN_COLORS_GRADIENT: Record<PlanId, [string,string]> = {
  basico:  ["#4b5563","#374151"],
  pro:     ["#00f5d4","#00a896"],
  premium: ["#a855f7","#7c3aed"],
  platino: ["#fbbf24","#ea580c"],
};

const PLAN_PRECIOS_LABEL: Record<PlanId, string> = {
  basico:  "Gratis",
  pro:     "$89.000/mes",
  premium: "$189.000/mes",
  platino: "$399.000/mes",
};

/* ── Client accounts config ──────────────────────────────────────────────────── */
const CLIENT_CONFIG: Record<string, { emoji:string; label:string; sub:string; from:string; to:string; glow:string; color:string }> = {
  admin:       { emoji:"👑",  label:"Administrador General",  sub:"Super Admin · Gestión total · Panel de plataforma",          from:"#fbbf24", to:"#ea580c", glow:"251,191,36",   color:"#fbbf24" },
  vet:         { emoji:"🩺",  label:"Médico Veterinario",     sub:"Sanidad animal · Reproducción · Genética",                    from:"#00c8ff", to:"#0ea5e9", glow:"0,200,255",     color:"#00c8ff" },
  field:       { emoji:"🌿",  label:"Operario de Campo",      sub:"Pesaje · Potreros · Insumos · Producción",                    from:"#39ff7e", to:"#16a34a", glow:"57,255,126",    color:"#39ff7e" },
  viewer:      { emoji:"💼",  label:"Propietario / Inversor", sub:"Sólo lectura · Dashboard · Costos · IA",                      from:"#c084fc", to:"#7c3aed", glow:"192,132,252",   color:"#c084fc" },
  developer:   { emoji:"🛠️", label:"Dev · Arquitecto CIVAC", sub:"Panel técnico · Versiones · APIs · Feature Flags · Deploy",   from:"#00ff88", to:"#00d4aa", glow:"0,255,136",     color:"#00ff88" },
  superadmin:  { emoji:"🔱",  label:"Super Administrador",    sub:"Plataforma completa · Auditoría · Versiones · Config global", from:"#ff6b35", to:"#f7931e", glow:"255,107,53",    color:"#ff6b35" },
};

/* ── Payment modal ──────────────────────────────────────────────────────────── */
function PaymentModal({ plan, onClose }: { plan: PlanId; onClose: () => void }) {
  const [method, setMethod] = useState<"nequi"|"pse"|"tarjeta"|"bancolombia"|null>(null);
  const [copied, setCopied] = useState(false);
  const ref = `CIVAC-${plan.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const precio = PLAN_PRECIOS[plan];
  const fg = PLAN_COLORS_GRADIENT[plan];
  const copyRef = () => { navigator.clipboard?.writeText(ref); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  const WOMPI_KEY = "pub_test_civac_demo_key"; // reemplazar con llave real Wompi
  const wompiUrl = `https://checkout.wompi.co/p/?public-key=${WOMPI_KEY}&currency=COP&amount-in-cents=${precio * 100}&reference=${ref}&redirect-url=${encodeURIComponent(window.location.href)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)" }}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background:"linear-gradient(145deg,#040d1a,#071325)", border:"1px solid rgba(0,245,212,0.2)", boxShadow:"0 0 60px rgba(0,245,212,0.08)" }}>
        <div className="h-1 w-full" style={{ background:`linear-gradient(90deg,${fg[0]},${fg[1]})` }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black text-white">Adquirir Plan <span style={{ color:fg[0] }}>{PLAN_LABEL[plan]}</span></h2>
              <p className="text-xs text-white/40 mt-0.5">{PLAN_PRECIOS_LABEL[plan]} · COP · IVA incluido</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
              <X size={16} className="text-white/60" />
            </button>
          </div>

          {/* Referencia */}
          <div className="rounded-2xl p-3 mb-5 flex items-center justify-between gap-3" style={{ background:"rgba(0,245,212,0.05)", border:"1px solid rgba(0,245,212,0.15)" }}>
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Referencia de pago</div>
              <div className="font-mono text-sm font-bold text-white">{ref}</div>
            </div>
            <button onClick={copyRef} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl transition-colors"
              style={{ background:"rgba(0,245,212,0.1)", border:"1px solid rgba(0,245,212,0.2)", color:copied?"#39ff7e":"#00f5d4" }}>
              {copied ? <CheckCircle2 size={12}/> : <Copy size={12}/>}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>

          {/* Methods */}
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-3">Selecciona método de pago</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              { id:"tarjeta" as const, icon:"💳", label:"Tarjeta", sub:"Débito / Crédito", col:"#00f5d4" },
              { id:"nequi"   as const, icon:"📱", label:"Nequi",   sub:"Pago inmediato",   col:"#c084fc" },
              { id:"pse"     as const, icon:"🏦", label:"PSE",     sub:"Débito bancario",  col:"#60a5fa" },
              { id:"bancolombia" as const, icon:"🟡", label:"Bancolombia", sub:"Botón de pago", col:"#fbbf24" },
            ].map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className="p-3 rounded-2xl text-left transition-all hover:scale-[1.02]"
                style={{
                  background: method===m.id ? `${m.col}15` : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${method===m.id ? `${m.col}55` : "rgba(255,255,255,0.07)"}`,
                }}>
                <div className="text-xl mb-1">{m.icon}</div>
                <div className="text-xs font-bold text-white">{m.label}</div>
                <div className="text-[10px] text-white/40">{m.sub}</div>
              </button>
            ))}
          </div>

          {/* Payment instructions per method */}
          {method === "nequi" && (
            <div className="rounded-2xl p-4 mb-4" style={{ background:"rgba(192,132,252,0.08)", border:"1px solid rgba(192,132,252,0.2)" }}>
              <p className="text-xs font-bold text-purple-300 mb-2">Pago con Nequi</p>
              <p className="text-xs text-white/60 mb-1">1. Abre Nequi → Pagar → Escanear QR o número</p>
              <p className="text-xs text-white/60 mb-1">2. Número: <span className="font-mono font-bold text-purple-300">3XX XXX XXXX</span></p>
              <p className="text-xs text-white/60 mb-2">3. Monto: <span className="font-bold text-white">${PLAN_PRECIOS[plan].toLocaleString("es-CO")} COP</span></p>
              <p className="text-[10px] text-white/30">Referencia: {ref} · Se activa en máx 24h hábiles</p>
            </div>
          )}
          {method === "pse" && (
            <div className="rounded-2xl p-4 mb-4" style={{ background:"rgba(96,165,250,0.08)", border:"1px solid rgba(96,165,250,0.2)" }}>
              <p className="text-xs font-bold text-blue-300 mb-2">Pago PSE — Débito bancario</p>
              <p className="text-xs text-white/60 mb-1">Banco destino: <span className="font-bold text-white">Bancolombia</span></p>
              <p className="text-xs text-white/60 mb-1">Cuenta: <span className="font-mono font-bold text-blue-300">XXX-XXXXXXXX</span></p>
              <p className="text-xs text-white/60 mb-1">Tipo: Ahorro · NIT: <span className="font-mono text-blue-300">XXXXXXXXX-X</span></p>
              <p className="text-xs text-white/60 mb-2">Monto exacto: <span className="font-bold text-white">${PLAN_PRECIOS[plan].toLocaleString("es-CO")} COP</span></p>
              <p className="text-[10px] text-white/30">Referencia obligatoria: {ref}</p>
            </div>
          )}
          {method === "bancolombia" && (
            <div className="rounded-2xl p-4 mb-4" style={{ background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.25)" }}>
              <p className="text-xs font-bold text-yellow-300 mb-2">Botón de pago Bancolombia</p>
              <p className="text-xs text-white/60 mb-3">Serás redirigido al portal seguro de Bancolombia para completar el pago de <span className="font-bold text-white">${PLAN_PRECIOS[plan].toLocaleString("es-CO")} COP</span></p>
              <a href={`https://www.bancolombia.com/empresas/pagos-en-linea?ref=${ref}&amount=${PLAN_PRECIOS[plan]}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-black text-sm transition-all"
                style={{ background:"linear-gradient(135deg,#fbbf24,#ea580c)", color:"black" }}>
                <ExternalLink size={14}/> Ir a Bancolombia →
              </a>
            </div>
          )}
          {method === "tarjeta" && (
            <div className="rounded-2xl p-4 mb-4" style={{ background:"rgba(0,245,212,0.06)", border:"1px solid rgba(0,245,212,0.2)" }}>
              <p className="text-xs font-bold text-teal-300 mb-2">Pago seguro con Wompi · Bancolombia</p>
              <p className="text-xs text-white/60 mb-3">Visa · Mastercard · Amex · Diners · Tarjeta débito</p>
              <a href={wompiUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-black text-sm transition-all"
                style={{ background:"linear-gradient(135deg,#00f5d4,#00a896)", color:"black" }}>
                <CreditCard size={14}/> Pagar con Wompi →
              </a>
              <p className="text-[10px] text-white/25 text-center mt-2">256-bit SSL · Certificado PCI DSS · Bancolombia</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-sm font-bold transition-colors"
              style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)" }}>
              Cancelar
            </button>
            {method && (
              <button onClick={() => { alert(`Pago iniciado con referencia ${ref}. Una vez confirmado recibirás tu acceso por correo.`); onClose(); }}
                className="flex-1 py-3 rounded-2xl text-sm font-black transition-all"
                style={{ background:`linear-gradient(135deg,${fg[0]},${fg[1]})`, color:"black" }}>
                Confirmar pago
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Particles ──────────────────────────────────────────────────────────────── */
function Particles() {
  const items = [
    {e:"🐄",x:6,y:12,s:1.4,d:5.2,o:0.10},{e:"🌿",x:88,y:18,s:1.1,d:4.8,o:0.09},
    {e:"⚡",x:14,y:70,s:0.9,d:6.0,o:0.07},{e:"📡",x:82,y:76,s:1.2,d:5.5,o:0.08},
    {e:"🧬",x:50,y:6, s:1.0,d:7.0,o:0.06},{e:"💊",x:93,y:44,s:0.8,d:4.5,o:0.07},
    {e:"🥛",x:4, y:44,s:1.0,d:5.8,o:0.08},{e:"🌾",x:46,y:90,s:1.3,d:6.5,o:0.07},
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {items.map((p,i)=>(
        <div key={i} className="absolute select-none" style={{ left:`${p.x}%`, top:`${p.y}%`, fontSize:`${p.s*2}rem`, opacity:p.o, animation:`float ${p.d}s ease-in-out infinite`, animationDelay:`${i*0.7}s`, filter:"blur(0.5px)" }}>
          {p.e}
        </div>
      ))}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function Login() {
  const { login, loginAs, accounts } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [loadingId, setLoadingId] = useState<string|null>(null);
  const [tab, setTab]           = useState<"clientes"|"planes"|"admin">("clientes");
  const [entered, setEntered]   = useState(true);
  const [payPlan, setPayPlan]   = useState<PlanId|null>(null);
  const [showAdminForm, setShowAdminForm] = useState(false);

  /* Client accounts (farm users) — shown in main cards */
  const CLIENT_ROLES = ["admin", "vet", "field", "viewer"];
  const clientAccounts = accounts.filter(a => CLIENT_ROLES.includes(a.role))
    .sort((a) => a.role === "admin" ? -1 : 0);
  /* System accounts (CIVAC platform team) — shown collapsed at bottom */
  const systemAccounts = accounts.filter(a => !CLIENT_ROLES.includes(a.role));
  const [showSystemAccounts, setShowSystemAccounts] = useState(false);

  const handleQuick = (a: Account) => {
    setLoadingId(a.id); setLoading(true);
    setTimeout(() => { loginAs(a); setLoading(false); }, 420);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    setTimeout(() => {
      if (!login(email, password)) setError("Credenciales incorrectas.");
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background:"linear-gradient(145deg,#0e1e38 0%,#122440 35%,#162c50 65%,#112038 100%)", fontFamily:"'Space Grotesk','Sora',sans-serif" }}>

      {/* Ambient layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background:`
          radial-gradient(ellipse 80% 50% at 20% 10%, rgba(0,245,212,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 60% 60% at 80% 90%, rgba(45,122,79,0.08) 0%, transparent 70%),
          radial-gradient(ellipse 50% 40% at 85% 15%, rgba(0,200,255,0.04) 0%, transparent 60%),
          radial-gradient(ellipse 40% 50% at 10% 85%, rgba(192,132,252,0.04) 0%, transparent 60%)` }} />
        <div className="absolute inset-0" style={{ backgroundImage:"radial-gradient(circle, rgba(0,200,255,0.06) 1px, transparent 1px)", backgroundSize:"48px 48px" }} />
        <div className="absolute top-0 left-0 right-0 h-px opacity-20"
          style={{ background:"linear-gradient(90deg,transparent,#00f5d4,transparent)", animation:"scan-line 8s linear infinite" }} />
      </div>
      <Particles />

      {/* Payment modal */}
      {payPlan && <PaymentModal plan={payPlan} onClose={() => setPayPlan(null)} />}

      {/* Main container */}
      <div className={`relative z-10 w-full max-w-5xl px-4 py-6 transition-all duration-700 ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

        {/* Hero */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center mb-4"
            style={{ filter:"drop-shadow(0 0 30px rgba(0,245,212,0.45)) drop-shadow(0 0 60px rgba(0,200,255,0.2))" }}>
            <CivacLogo size={82} />
          </div>
          <div className="flex items-center justify-center gap-3 mb-1">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ fontFamily:"'Sora',sans-serif", letterSpacing:"-0.03em" }}>
              <span className="text-white">GanaderIA</span>
            </h1>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-lg leading-none" style={{ background:"linear-gradient(135deg,#00f5d4,#00a896)", color:"black", letterSpacing:"0.05em" }}>v4.2</span>
              <span className="text-[8px] font-black px-2 py-0.5 rounded-md leading-none" style={{ background:"linear-gradient(135deg,#fbbf24,#ea580c)", color:"white", letterSpacing:"0.03em" }}>PRO</span>
            </div>
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color:"rgba(0,245,212,0.65)" }}>Ganadería Inteligente · Colombia · Gestión Bovina Premium</p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
            {[{icon:<Wifi size={10}/>,label:"Offline PWA",c:"0,245,212"},{icon:<Zap size={10}/>,label:"Bluetooth BT",c:"255,149,0"},{icon:<Smartphone size={10}/>,label:"GPS Ganado",c:"0,200,255"},{icon:<Star size={10}/>,label:"IA predictiva",c:"232,121,249"}].map(p=>(
              <span key={p.label} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                style={{ background:`rgba(${p.c},0.08)`, border:`1px solid rgba(${p.c},0.22)`, color:`rgba(${p.c},0.85)` }}>
                {p.icon}{p.label}
              </span>
            ))}
          </div>

          {/* Main tabs */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {[
              {id:"clientes" as const, label:"Acceso Clientes"},
              {id:"planes"   as const, label:"Planes y Precios"},
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="px-5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-250"
                style={tab===t.id ? {background:"linear-gradient(135deg,#00f5d4,#00c896)",color:"black",boxShadow:"0 0 20px #00f5d455",transform:"scale(1.04)"} : {background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.55)",border:"1px solid rgba(255,255,255,0.1)"}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB: PLANES ─────────────────────────────────────────────────────── */}
        {tab === "planes" && (
          <div className="space-y-5">
            <p className="text-center text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>
              Facturación mensual COP · IVA incluido · Pago seguro <strong style={{ color:"#00f5d4" }}>Wompi / Nequi / PSE / Bancolombia</strong> · Sin permanencia mínima
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(["basico","pro","premium","platino"] as PlanId[]).map(pid => {
                const fg = PLAN_COLORS_GRADIENT[pid];
                const feats = PLAN_FEATURES[pid];
                const badges: Record<PlanId, string|null> = { basico:null, pro:"Popular ⭐", premium:"Recomendado 🏆", platino:"Empresarial 👑" };
                return (
                  <div key={pid} className="relative rounded-3xl overflow-hidden transition-transform hover:scale-[1.02]"
                    style={{ background:"rgba(4,13,26,0.97)", border:`1px solid ${fg[0]}30`, boxShadow: pid==="pro" ? `0 0 40px ${fg[0]}25` : "none" }}>
                    {badges[pid] && (
                      <div className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full text-white z-10"
                        style={{ background:`linear-gradient(135deg,${fg[0]},${fg[1]})` }}>{badges[pid]}</div>
                    )}
                    <div className="h-0.5 w-full" style={{ background:`linear-gradient(90deg,${fg[0]},${fg[1]})` }} />
                    <div className="p-4">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                        style={{ background:`linear-gradient(135deg,${fg[0]},${fg[1]})`, boxShadow:`0 0 16px ${fg[0]}55` }}>
                        <span className="text-xl">{PLAN_ICON[pid]}</span>
                      </div>
                      <h3 className="text-lg font-black text-white mb-0.5">{PLAN_LABEL[pid]}</h3>
                      <p className="font-black text-base mb-3" style={{ color:fg[0] }}>
                        {PLAN_PRECIOS_LABEL[pid]}
                      </p>
                      <ul className="space-y-1.5 mb-4">
                        {feats.slice(0,6).map(f=>(
                          <li key={f} className="flex items-start gap-1.5 text-[10px] text-white/65">
                            <CheckCircle2 size={10} className="flex-shrink-0 mt-0.5" style={{ color:"#39ff7e" }} />{f}
                          </li>
                        ))}
                        {feats.length > 6 && <li className="text-[10px] text-white/30">+{feats.length-6} más…</li>}
                      </ul>
                      {pid === "basico" ? (
                        <button onClick={() => setTab("clientes")}
                          className="w-full py-2.5 rounded-2xl font-black text-xs transition-all"
                          style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.6)", border:"1px solid rgba(255,255,255,0.1)" }}>
                          Empezar gratis → acceder
                        </button>
                      ) : (
                        <button onClick={() => setPayPlan(pid)}
                          className="w-full py-2.5 rounded-2xl font-black text-xs transition-all hover:opacity-90"
                          style={{ background:`linear-gradient(135deg,${fg[0]},${fg[1]})`, color: pid==="platino"?"white":"black", boxShadow:`0 0 16px ${fg[0]}40` }}>
                          💳 Comprar plan — {PLAN_PRECIOS_LABEL[pid]}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px]" style={{ color:"rgba(255,255,255,0.2)" }}>
              <span className="flex items-center gap-1"><Lock size={10}/>Wompi · Bancolombia seguro</span>
              <span className="flex items-center gap-1"><Check size={10}/>Factura electrónica DIAN</span>
              <span className="flex items-center gap-1"><X size={10}/>Sin permanencia mínima</span>
              <span className="flex items-center gap-1"><Phone size={10}/>Soporte WhatsApp</span>
            </div>
          </div>
        )}

        {/* ── TAB: CLIENTES ───────────────────────────────────────────────────── */}
        {tab === "clientes" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5 items-start">

            {/* Client account cards (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <p className="text-center text-[10px] font-black uppercase tracking-[0.2em]" style={{ color:"rgba(0,245,212,0.4)" }}>
                — Seleccione su cuenta —
              </p>
              <div className="space-y-2.5">
                {clientAccounts.map(account => {
                  const rc = CLIENT_CONFIG[account.role] ?? CLIENT_CONFIG.viewer;
                  const isLoading = loadingId === account.id;
                  const plan = (account.plan ?? "basico") as PlanId;
                  const features = PLAN_FEATURES[plan];
                  return (
                    <div key={account.id} className="relative rounded-3xl overflow-hidden transition-all group"
                      style={{ background:`linear-gradient(145deg,rgba(${rc.glow},0.08),rgba(${rc.glow},0.03),rgba(0,0,0,0.4))`, border:`1.5px solid rgba(${rc.glow},0.2)`, backdropFilter:"blur(16px)" }}>
                      <div className="h-0.5 w-full" style={{ background:`linear-gradient(90deg,${rc.from},${rc.to},transparent)` }} />
                      <div className="p-4 flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                          style={{ background:`linear-gradient(135deg,${rc.from},${rc.to})`, boxShadow:`0 0 20px rgba(${rc.glow},0.5)` }}>
                          <span style={{ fontSize:"1.75rem", lineHeight:1 }}>{rc.emoji}</span>
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="font-black text-white text-base">{account.nombre.split(" ").slice(0,3).join(" ")}</span>
                            <PlanBadge plan={plan} size="sm" />
                          </div>
                          <p className="text-xs text-white/50 mb-1.5">{rc.sub}</p>
                          {/* Mini plan features */}
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                            {features.slice(0,4).map(f=>(
                              <span key={f} className="text-[9px] text-white/35 flex items-center gap-0.5">
                                <span style={{ color:"#39ff7e", fontSize:"7px" }}>✓</span>{f}
                              </span>
                            ))}
                          </div>
                        </div>
                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleQuick(account)} disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-xs transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background:`linear-gradient(135deg,${rc.from},${rc.to})`, color: account.role==="viewer"?"white":"black", boxShadow:`0 0 14px rgba(${rc.glow},0.35)` }}>
                            {isLoading ? <div className="w-3 h-3 border border-current/40 border-t-current rounded-full animate-spin"/> : <ArrowRight size={12}/>}
                            {isLoading ? "Entrando…" : "Entrar"}
                          </button>
                          {plan !== "platino" && (
                            <button onClick={() => setPayPlan(plan === "basico" ? "pro" : plan === "pro" ? "premium" : "platino")}
                              className="flex items-center gap-1 px-3 py-1 rounded-xl text-[9px] font-bold transition-all hover:opacity-80"
                              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.3)" }}>
                              ⬆ Mejorar plan
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Plan progress bar */}
                      <div className="px-4 pb-3">
                        <div className="flex items-center justify-between text-[9px] mb-1">
                          <span style={{ color:`rgba(${rc.glow},0.5)` }}>Plan {PLAN_LABEL[plan]} · {features.length} módulos activos</span>
                          <button onClick={() => setTab("planes")} className="text-white/20 hover:text-white/50 transition-colors">Ver planes →</button>
                        </div>
                        <div className="h-0.5 rounded-full" style={{ background:"rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full" style={{
                            width: plan==="basico"?"25%":plan==="pro"?"50%":plan==="premium"?"75%":"100%",
                            background:`linear-gradient(90deg,${rc.from},${rc.to})`,
                            boxShadow:`0 0 4px rgba(${rc.glow},0.5)`
                          }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-2xl text-[9px]"
                style={{ background:"rgba(57,255,126,0.04)", border:"1px solid rgba(57,255,126,0.1)", color:"rgba(57,255,126,0.45)" }}>
                <Shield size={11} /> Autenticación segura · Sesión cifrada · Sin contraseña en servidor
              </div>

              {/* ── System / CIVAC Platform Accounts ── */}
              <div className="mt-3">
                <button
                  onClick={() => setShowSystemAccounts(v => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-[10px] font-bold transition-all hover:opacity-80"
                  style={{ background:"rgba(255,107,53,0.06)", border:"1px solid rgba(255,107,53,0.15)", color:"rgba(255,107,53,0.6)" }}>
                  <span className="flex items-center gap-2">
                    <span>🔱</span> Acceso Plataforma CIVAC ({systemAccounts.length})
                  </span>
                  <ChevronDown size={12} className={`transition-transform ${showSystemAccounts ? "rotate-180" : ""}`}/>
                </button>
                {showSystemAccounts && (
                  <div className="mt-2 space-y-2">
                    <p className="text-center text-[9px] font-black uppercase tracking-[0.2em]" style={{ color:"rgba(255,107,53,0.4)" }}>
                      — Cuentas de sistema — uso exclusivo CIVAC —
                    </p>
                    {systemAccounts.map(account => {
                      const rc = CLIENT_CONFIG[account.role] ?? CLIENT_CONFIG.viewer;
                      const isLoading = loadingId === account.id;
                      return (
                        <div key={account.id} className="relative rounded-2xl overflow-hidden transition-all group"
                          style={{ background:`linear-gradient(145deg,rgba(${rc.glow},0.06),rgba(0,0,0,0.4))`, border:`1px solid rgba(${rc.glow},0.18)`, backdropFilter:"blur(12px)" }}>
                          <div className="h-px w-full" style={{ background:`linear-gradient(90deg,${rc.from},${rc.to},transparent)` }} />
                          <div className="p-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background:`linear-gradient(135deg,${rc.from},${rc.to})`, boxShadow:`0 0 14px rgba(${rc.glow},0.4)` }}>
                              <span style={{ fontSize:"1.25rem", lineHeight:1 }}>{rc.emoji}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                <span className="font-black text-white text-[13px]">{account.nombre.split(" ").slice(0,2).join(" ")}</span>
                                <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold"
                                  style={{ background:`rgba(${rc.glow},0.12)`, color:rc.color, border:`1px solid rgba(${rc.glow},0.25)` }}>
                                  {account.role.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-[9px] text-white/35 truncate">{rc.sub}</p>
                              <p className="text-[9px] font-mono text-white/20">{account.email}</p>
                            </div>
                            <button
                              onClick={() => handleQuick(account)} disabled={loading}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-[10px] transition-all hover:opacity-90 disabled:opacity-50 flex-shrink-0"
                              style={{ background:`linear-gradient(135deg,${rc.from},${rc.to})`, color:"black", boxShadow:`0 0 10px rgba(${rc.glow},0.3)` }}>
                              {isLoading ? <div className="w-2.5 h-2.5 border border-current/40 border-t-current rounded-full animate-spin"/> : <ArrowRight size={11}/>}
                              {isLoading ? "…" : "Entrar"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="px-3 py-2 rounded-xl text-[9px] text-center"
                      style={{ background:"rgba(255,107,53,0.04)", border:"1px solid rgba(255,107,53,0.1)", color:"rgba(255,107,53,0.4)" }}>
                      ⚠️ Uso exclusivo del equipo técnico CIVAC · No compartir credenciales
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Login form (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="rounded-3xl overflow-hidden"
                style={{ background:"linear-gradient(145deg,rgba(4,13,26,0.97),rgba(7,20,38,0.95))", border:"1px solid rgba(0,245,212,0.18)", boxShadow:"0 0 40px rgba(0,245,212,0.08), 0 24px 60px rgba(0,0,0,0.5)", backdropFilter:"blur(24px)" }}>
                <div className="h-0.5" style={{ background:"linear-gradient(90deg,#00f5d4,#00c8ff,transparent)" }} />
                <div className="p-5 sm:p-6">
                  <h2 className="font-black text-base text-white mb-1 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:"rgba(0,245,212,0.12)", border:"1px solid rgba(0,245,212,0.3)" }}>
                      <Lock className="w-3.5 h-3.5" style={{ color:"#00f5d4" }} />
                    </div>
                    Iniciar sesión
                  </h2>
                  <p className="text-[10px] mb-4" style={{ color:"rgba(255,255,255,0.3)" }}>Con email y contraseña de tu cuenta</p>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Correo o usuario</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"rgba(0,245,212,0.4)" }} />
                        <input type="text" value={email} autoComplete="off"
                          onChange={e=>{setEmail(e.target.value);setError("");}}
                          placeholder="correo@ganaderia.co"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white placeholder:text-white/20 transition-all"
                          style={{ background:"rgba(0,245,212,0.04)", border:"1px solid rgba(0,245,212,0.14)", outline:"none" }} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"rgba(0,245,212,0.4)" }} />
                        <input type={showPass?"text":"password"} value={password} autoComplete="current-password"
                          onChange={e=>{setPassword(e.target.value);setError("");}}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-11 py-3 rounded-2xl text-sm text-white placeholder:text-white/20 transition-all"
                          style={{ background:"rgba(0,245,212,0.04)", border:"1px solid rgba(0,245,212,0.14)", outline:"none" }} />
                        <button type="button" onClick={()=>setShowPass(!showPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 transition-colors">
                          {showPass?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                        </button>
                      </div>
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs"
                        style={{ background:"rgba(255,77,109,0.08)", border:"1px solid rgba(255,77,109,0.2)", color:"#ff6b8a" }}>
                        <X className="w-3.5 h-3.5 flex-shrink-0"/>{error}
                      </div>
                    )}
                    <button type="submit" disabled={loading || !email}
                      className="w-full py-3.5 rounded-2xl font-black text-sm text-black transition-all disabled:opacity-50"
                      style={{ background:"linear-gradient(135deg,#00f5d4,#00c896)", boxShadow:"0 0 24px rgba(0,245,212,0.4)" }}>
                      {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-black/20 border-t-black/80 rounded-full animate-spin"/>Verificando…</span>
                        : <span className="flex items-center justify-center gap-2">Ingresar al sistema <ArrowRight className="w-4 h-4"/></span>}
                    </button>
                  </form>
                  <div className="mt-4 pt-4 border-t text-center text-[10px] text-white/15" style={{ borderColor:"rgba(0,245,212,0.08)" }}>
                    Sistema privado GanaderIA PRO · Solo acceso autorizado
                  </div>
                </div>
              </div>

              {/* Credentials hint for clients */}
              <div className="rounded-2xl p-3 space-y-1.5" style={{ background:"rgba(0,245,212,0.03)", border:"1px solid rgba(0,245,212,0.1)" }}>
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/25">Demo — credenciales de acceso rápido</p>
                {clientAccounts.map(a => (
                  <div key={a.id} className="flex items-center justify-between text-[9px]">
                    <span className="text-white/35">{a.nombre.split(" ")[0]} ({a.role})</span>
                    <span className="font-mono text-white/25">{a.email} / {a.password}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ADMIN ACCESS FORM ────────────────────────────────────────────────── */}
        {showAdminForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.90)", backdropFilter:"blur(8px)" }}>
            <div className="w-full max-w-sm rounded-3xl overflow-hidden"
              style={{ background:"linear-gradient(145deg,#040d1a,#071325)", border:"1px solid rgba(255,149,0,0.25)", boxShadow:"0 0 60px rgba(255,149,0,0.08)" }}>
              <div className="h-0.5" style={{ background:"linear-gradient(90deg,#ff9500,#ff6b00)" }} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background:"rgba(255,149,0,0.12)", border:"1px solid rgba(255,149,0,0.3)" }}>
                    <Shield size={18} className="text-orange-400" />
                  </div>
                  <div>
                    <h2 className="font-black text-white text-base">Panel de Administración</h2>
                    <p className="text-[10px] text-white/30">Acceso restringido — Solo administradores</p>
                  </div>
                  <button onClick={() => setShowAdminForm(false)} className="ml-auto w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10">
                    <X size={14} className="text-white/40" />
                  </button>
                </div>
                <div className="rounded-2xl p-3 mb-4" style={{ background:"rgba(255,149,0,0.06)", border:"1px solid rgba(255,149,0,0.15)" }}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={12} className="text-orange-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-orange-300/70">Este acceso es exclusivo para la administración de la plataforma. No es para uso del sistema de ganadería.</p>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1">Email admin</label>
                    <input type="text" value={email} onChange={e=>{setEmail(e.target.value);setError("");}}
                      placeholder="admin@ganader.ia"
                      className="w-full px-4 py-3 rounded-2xl text-sm text-white"
                      style={{ background:"rgba(255,149,0,0.04)", border:"1px solid rgba(255,149,0,0.18)", outline:"none" }} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1">Contraseña</label>
                    <div className="relative">
                      <input type={showPass?"text":"password"} value={password} onChange={e=>{setPassword(e.target.value);setError("");}}
                        placeholder="••••••••"
                        className="w-full pl-4 pr-11 py-3 rounded-2xl text-sm text-white"
                        style={{ background:"rgba(255,149,0,0.04)", border:"1px solid rgba(255,149,0,0.18)", outline:"none" }} />
                      <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                        {showPass?<EyeOff size={14}/>:<Eye size={14}/>}
                      </button>
                    </div>
                  </div>
                  {error && <div className="text-xs text-red-400 flex items-center gap-1.5"><AlertTriangle size={11}/>{error}</div>}
                  <button type="submit" disabled={loading || !email}
                    className="w-full py-3 rounded-2xl font-black text-sm text-black transition-all disabled:opacity-50"
                    style={{ background:"linear-gradient(135deg,#ff9500,#ff6b00)", boxShadow:"0 0 20px rgba(255,149,0,0.3)" }}>
                    {loading ? "Verificando…" : "Acceder al panel"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        <p className="text-center mt-6 text-[9px]" style={{ color:"rgba(255,255,255,0.12)" }}>
          GanaderIA PRO v4.2 · Control Inteligente Agropecuario · Colombia {new Date().getFullYear()} · Sistema privado
        </p>
      </div>
    </div>
  );
}
