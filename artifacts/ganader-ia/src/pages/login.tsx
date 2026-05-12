import { useState } from "react";
import { useAuth, Account } from "@/lib/auth";
import { Eye, EyeOff, Lock, User, ChevronRight, Shield, Zap, Star, Crown, Check, X, Leaf } from "lucide-react";

// ── Logo profesional ganadero (res / cabeza de bovino) ────────────────────
function CivacLogoBig() {
  return (
    <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lgNavyL" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#0d2137"/><stop offset="1" stopColor="#071325"/>
        </linearGradient>
        <linearGradient id="lgForestL" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#1a7a3e"/><stop offset="1" stopColor="#0e4f26"/>
        </linearGradient>
        <linearGradient id="lgTealL" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#00f5d4"/><stop offset="1" stopColor="#00c8a0"/>
        </linearGradient>
        <linearGradient id="lgHornL" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fbbf24"/><stop offset="1" stopColor="#d97706"/>
        </linearGradient>
        <filter id="glowL" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="softglowL" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Fondo redondeado navy con borde teal */}
      <rect width="120" height="120" rx="28" fill="url(#lgNavyL)"/>
      <rect width="120" height="120" rx="28" fill="none" stroke="url(#lgTealL)" strokeWidth="1.5" strokeOpacity="0.5"/>
      {/* Cuernos */}
      <path d="M34 52 Q18 30 22 18 Q26 8 36 14 Q30 22 34 38" fill="url(#lgHornL)" filter="url(#softglowL)"/>
      <path d="M86 52 Q102 30 98 18 Q94 8 84 14 Q90 22 86 38" fill="url(#lgHornL)" filter="url(#softglowL)"/>
      {/* Cabeza */}
      <ellipse cx="60" cy="64" rx="32" ry="30" fill="url(#lgForestL)" filter="url(#softglowL)"/>
      <ellipse cx="60" cy="48" rx="28" ry="22" fill="url(#lgForestL)"/>
      {/* Orejas */}
      <ellipse cx="30" cy="56" rx="10" ry="7" fill="#1a5c34" transform="rotate(-20 30 56)" filter="url(#softglowL)"/>
      <ellipse cx="30" cy="56" rx="5.5" ry="4" fill="#0d3a20" transform="rotate(-20 30 56)"/>
      <ellipse cx="90" cy="56" rx="10" ry="7" fill="#1a5c34" transform="rotate(20 90 56)" filter="url(#softglowL)"/>
      <ellipse cx="90" cy="56" rx="5.5" ry="4" fill="#0d3a20" transform="rotate(20 90 56)"/>
      {/* Hocico */}
      <ellipse cx="60" cy="82" rx="19" ry="14" fill="#1f6b3a"/>
      <ellipse cx="60" cy="84" rx="15" ry="10" fill="#163e23"/>
      {/* Fosas nasales */}
      <ellipse cx="53" cy="85" rx="4" ry="3" fill="#0a2514" opacity="0.9"/>
      <ellipse cx="67" cy="85" rx="4" ry="3" fill="#0a2514" opacity="0.9"/>
      {/* Ojos */}
      <ellipse cx="44" cy="58" rx="7" ry="6" fill="#0a2514"/>
      <ellipse cx="44" cy="58" rx="5" ry="4.5" fill="#1a4a24"/>
      <circle cx="44" cy="58" r="2.8" fill="#050f08"/>
      <circle cx="45.5" cy="56.5" r="1.3" fill="white" opacity="0.9"/>
      <ellipse cx="76" cy="58" rx="7" ry="6" fill="#0a2514"/>
      <ellipse cx="76" cy="58" rx="5" ry="4.5" fill="#1a4a24"/>
      <circle cx="76" cy="58" r="2.8" fill="#050f08"/>
      <circle cx="77.5" cy="56.5" r="1.3" fill="white" opacity="0.9"/>
      {/* Arete RFID */}
      <circle cx="24" cy="58" r="4.5" fill="url(#lgTealL)" opacity="0.9" filter="url(#glowL)"/>
      <circle cx="24" cy="58" r="2" fill="#071325"/>
      {/* Franja teal en frente */}
      <path d="M44 44 Q60 38 76 44" stroke="url(#lgTealL)" strokeWidth="3" strokeLinecap="round" opacity="0.55" filter="url(#glowL)"/>
    </svg>
  );
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Shield className="w-6 h-6"/>,
  vet: <span className="text-xl">🩺</span>,
  field: <Leaf className="w-6 h-6"/>,
  viewer: <Eye className="w-6 h-6"/>,
};
const ROLE_GRAD: Record<string, { bg: string; border: string; iconBg: string; color: string }> = {
  admin: { bg:'rgba(0,245,212,0.06)', border:'rgba(0,245,212,0.25)', iconBg:'linear-gradient(135deg,#00f5d4,#00c896)', color:'#00f5d4' },
  vet:   { bg:'rgba(0,200,255,0.06)', border:'rgba(0,200,255,0.25)', iconBg:'linear-gradient(135deg,#00c8ff,#0ea5e9)', color:'#00c8ff' },
  field: { bg:'rgba(57,255,126,0.06)', border:'rgba(57,255,126,0.25)', iconBg:'linear-gradient(135deg,#39ff7e,#16a34a)', color:'#39ff7e' },
  viewer:{ bg:'rgba(192,132,252,0.06)', border:'rgba(192,132,252,0.25)', iconBg:'linear-gradient(135deg,#c084fc,#7c3aed)', color:'#c084fc' },
};
const ROLE_LABEL: Record<string,string> = { admin:'Admin · Propietario', vet:'Médico Veterinario', field:'Operario de Campo', viewer:'Solo Lectura' };

const PLANES_MINI = [
  { id:'pro',     label:'PRO',     precio:'$89.000/mes',   icon:<Zap className="w-4 h-4"/>,   from:'#00f5d4', to:'#00c896', badge:'Popular' },
  { id:'premium', label:'Premium', precio:'$189.000/mes',  icon:<Star className="w-4 h-4"/>,  from:'#a855f7', to:'#7c3aed', badge:'Recomendado' },
  { id:'platino', label:'Platino', precio:'$399.000/mes',  icon:<Crown className="w-4 h-4"/>, from:'#fbbf24', to:'#ea580c', badge:'Empresa' },
];
const PLANES_FULL = [
  { id:'basico', nombre:'Básico', precio:'Gratis', from:'#4b5563', to:'#374151', icon:<Leaf className="w-5 h-5"/>,
    features:['50 animales','1 usuario','Módulos base','Dashboard CIVAC','Alertas básicas'], badge:null },
  { id:'pro', nombre:'PRO', precio:'$89.000', from:'#00f5d4', to:'#00c896', icon:<Zap className="w-5 h-5"/>,
    features:['300 animales','5 usuarios','Pesaje BT + GPS','Predicción IA básica','Google Drive sync','App Windows/iOS'], badge:'Popular', highlight:true },
  { id:'premium', nombre:'Premium', precio:'$189.000', from:'#a855f7', to:'#7c3aed', icon:<Star className="w-5 h-5"/>,
    features:['1.000 animales','15 usuarios','GPS ilimitado (50 collares)','IA avanzada + GPT','Multi-finca (5)','Soporte 24h'], badge:'Recomendado' },
  { id:'platino', nombre:'Platino', precio:'$399.000', from:'#fbbf24', to:'#ea580c', icon:<Crown className="w-5 h-5"/>,
    features:['Ilimitado','Usuarios ilimitados','GPS ilimitado + geocercas IA','API REST + webhooks','Multi-finca ilimitada','SLA 99.9% + soporte dedicado'], badge:'Empresarial' },
];

export default function Login() {
  const { login, loginAs, accounts } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Account|null>(null);
  const [tab, setTab] = useState<"login"|"planes">("login");

  const handleCard = (a: Account) => { setSelected(a); setEmail(a.email); setPassword(a.password); setError(""); };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    setTimeout(() => { if(!login(email,password)) setError("Credenciales incorrectas"); setLoading(false); }, 600);
  };
  const handleQuick = (a: Account) => { setLoading(true); setTimeout(()=>{ loginAs(a); setLoading(false); }, 350); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{background:'linear-gradient(145deg,#071325 0%,#0a1c38 40%,#0d2137 70%,#071325 100%)',fontFamily:"'Space Grotesk','Sora',sans-serif"}}>

      {/* Animated background — azul marino + verde bosque */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Navy glow top */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[1200px] h-[600px]" style={{background:'radial-gradient(ellipse,rgba(0,200,255,0.07),transparent 65%)',top:'-180px'}}/>
        {/* Forest green bottom-left */}
        <div className="absolute bottom-0 left-1/4 w-[800px] h-[500px]" style={{background:'radial-gradient(ellipse,rgba(45,122,79,0.09),transparent 65%)'}}/>
        {/* Teal accent right */}
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px]" style={{background:'radial-gradient(ellipse,rgba(0,245,212,0.05),transparent 65%)'}}/>
        {/* Subtle grid */}
        <div className="absolute inset-0" style={{backgroundImage:'linear-gradient(rgba(0,200,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.025) 1px,transparent 1px)',backgroundSize:'60px 60px'}}/>
        {/* Scan line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] opacity-15" style={{background:'linear-gradient(90deg,transparent,#00f5d4,transparent)',animation:'scan-line 10s linear infinite'}}/>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Logo + Brand */}
        <div className="text-center mb-6">
          <div className="inline-block mb-3 civac-float" style={{filter:'drop-shadow(0 0 20px rgba(0,245,212,0.4))'}}>
            <CivacLogoBig/>
          </div>
          <div className="flex items-center justify-center gap-3 mb-1">
            <h1 className="text-4xl font-black tracking-tight" style={{fontFamily:"'Sora',sans-serif"}}>
              <span className="text-white">CI</span><span style={{color:'#00f5d4',textShadow:'0 0 20px rgba(0,245,212,0.8),0 0 40px rgba(0,245,212,0.4)'}}>VAC</span>
            </h1>
            <span className="text-sm font-black px-3 py-1 rounded-xl" style={{background:'linear-gradient(135deg,#fbbf24,#ea580c)',color:'white',boxShadow:'0 0 12px rgba(251,191,36,0.4)'}}>PRO v3.0</span>
          </div>
          <p className="text-sm" style={{color:'rgba(0,245,212,0.5)'}}>Control Inteligente de Valor Agropecuario · Colombia</p>
          <div className="flex items-center justify-center gap-3 mt-2 text-[10px]" style={{color:'rgba(255,255,255,0.3)'}}>
            <span>🌿 Offline-ready PWA</span><span>·</span><span>⚡ Bluetooth BT</span><span>·</span><span>📡 GPS Ganado</span><span>·</span><span>🤖 IA predictiva</span>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {[{id:'login',label:'Iniciar sesión'},{id:'planes',label:'Planes · Wompi 💳'}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id as any)}
                className="px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                style={tab===t.id
                  ?t.id==='login'
                    ?{background:'linear-gradient(135deg,#00f5d4,#00c896)',color:'black',boxShadow:'0 0 16px rgba(0,245,212,0.4)'}
                    :{background:'linear-gradient(135deg,#fbbf24,#ea580c)',color:'white',boxShadow:'0 0 16px rgba(251,191,36,0.4)'}
                  :{background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.45)',border:'1px solid rgba(255,255,255,0.08)'}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab==='planes' ? (
          <div className="space-y-4">
            <p className="text-center text-xs" style={{color:'rgba(255,255,255,0.3)'}}>
              Facturación en COP · IVA incluido · Pago seguro <strong style={{color:'#00f5d4'}}>Wompi — Bancolombia</strong> · Cancela cuando quieras
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANES_FULL.map(p=>(
                <div key={p.id} className={`relative rounded-2xl overflow-hidden card-lift ${p.highlight?'scale-[1.03]':''}`}
                  style={{background:'rgba(3,15,10,0.9)',border:`1px solid ${p.from}30`,boxShadow:p.highlight?`0 0 30px ${p.from}25`:undefined}}>
                  {p.badge && <div className="absolute top-2.5 right-2.5 text-[9px] font-black px-2.5 py-1 rounded-full text-white"
                    style={{background:`linear-gradient(135deg,${p.from},${p.to})`}}>{p.badge}</div>}
                  <div className="p-4" style={{background:`linear-gradient(135deg,${p.from}20,${p.to}10)`}}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-2.5 shadow-lg"
                      style={{background:`linear-gradient(135deg,${p.from},${p.to})`,boxShadow:`0 0 14px ${p.from}50`}}>
                      {p.icon}
                    </div>
                    <h3 className="text-lg font-black text-white" style={{fontFamily:"'Sora',sans-serif"}}>{p.nombre}</h3>
                    <p className="font-black mt-1" style={{color:p.from}}>{p.precio}<span className="text-white/40 text-xs font-medium">{p.id!=='basico'?'/mes':''}</span></p>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-1.5 mb-4">
                      {p.features.map(f=>(
                        <li key={f} className="flex items-center gap-2 text-xs text-white/65">
                          <Check className="w-3 h-3 flex-shrink-0" style={{color:'#39ff7e'}}/>{f}
                        </li>
                      ))}
                    </ul>
                    <button onClick={()=>setTab('login')}
                      className="w-full py-2.5 rounded-xl font-black text-xs transition-all btn-neon"
                      style={{background:`linear-gradient(135deg,${p.from},${p.to})`,color:p.id==='basico'?'white':'black',boxShadow:`0 0 12px ${p.from}30`}}>
                      {p.id==='basico'?'Empezar gratis':'Suscribirme · Wompi'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 text-[10px]" style={{color:'rgba(255,255,255,0.25)'}}>
              <span className="flex items-center gap-1"><Lock className="w-3 h-3"/>Wompi · Bancolombia</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3"/>Factura electrónica DIAN</span>
              <span className="flex items-center gap-1"><X className="w-3 h-3"/>Sin permanencia mínima</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
            {/* Profile cards */}
            <div className="lg:col-span-3">
              <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{color:'rgba(0,245,212,0.4)'}}>Seleccione su perfil</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5">
                {accounts.slice(0,8).map(account=>{
                  const r = ROLE_GRAD[account.role] || ROLE_GRAD.viewer;
                  const isSelected = selected?.id===account.id;
                  return (
                    <button key={account.id} onClick={()=>handleCard(account)}
                      className="relative rounded-2xl p-3.5 text-left transition-all duration-200 cursor-pointer card-lift group"
                      style={{background:isSelected?r.bg:'rgba(3,15,10,0.7)',border:`1.5px solid ${isSelected?r.border:'rgba(255,255,255,0.06)'}`,boxShadow:isSelected?`0 0 18px ${r.color}20`:undefined}}>
                      {isSelected && <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full civac-pulse" style={{background:'#39ff7e',boxShadow:'0 0 8px rgba(57,255,126,0.8)'}}/>}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-2.5 transition-transform group-hover:scale-105"
                        style={{background:r.iconBg,boxShadow:`0 0 12px ${r.color}40`}}>
                        {ROLE_ICONS[account.role]||<User className="w-5 h-5"/>}
                      </div>
                      <p className="font-bold text-white text-xs leading-tight mb-0.5 truncate">{account.nombre.split(' ').slice(0,2).join(' ')}</p>
                      <p className="text-[9px] truncate" style={{color:r.color}}>{ROLE_LABEL[account.role]}</p>
                      {isSelected ? (
                        <button onClick={e=>{e.stopPropagation();handleQuick(account);}}
                          className="mt-2.5 w-full text-center text-[9px] font-black py-1.5 rounded-lg transition-all"
                          style={{background:r.color,color:'black'}}>
                          ⚡ Acceso rápido
                        </button>
                      ) : (
                        <div className="flex items-center gap-0.5 mt-2">
                          <ChevronRight className="w-2.5 h-2.5 text-white/20 group-hover:text-white/50 transition-colors"/>
                          <span className="text-[9px] text-white/25 group-hover:text-white/45 transition-colors">Seleccionar</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login form */}
            <div className="lg:col-span-2 rounded-2xl p-5"
              style={{background:'rgba(3,15,10,0.9)',border:'1px solid rgba(0,245,212,0.15)',boxShadow:'0 0 30px rgba(0,245,212,0.08)'}}>
              <h2 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4" style={{color:'#00f5d4'}}/> Iniciar sesión
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs text-white/40 block mb-1.5">Correo o usuario</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{color:'rgba(0,245,212,0.4)'}}/>
                    <input type="text" value={email} onChange={e=>{setEmail(e.target.value);setError("");}}
                      placeholder="admin@civac.co"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20"
                      style={{background:'rgba(0,245,212,0.05)',border:'1px solid rgba(0,245,212,0.15)'}}/>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1.5">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{color:'rgba(0,245,212,0.4)'}}/>
                    <input type={showPass?"text":"password"} value={password} onChange={e=>{setPassword(e.target.value);setError("");}}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20"
                      style={{background:'rgba(0,245,212,0.05)',border:'1px solid rgba(0,245,212,0.15)'}}/>
                    <button type="button" onClick={()=>setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPass?<EyeOff className="w-3.5 h-3.5"/>:<Eye className="w-3.5 h-3.5"/>}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="text-xs px-3 py-2 rounded-xl" style={{background:'rgba(255,77,109,0.1)',border:'1px solid rgba(255,77,109,0.2)',color:'#ff4d6d'}}>
                    {error}
                  </div>
                )}
                <button type="submit" disabled={loading||!email}
                  className="w-full py-3 rounded-xl font-black text-sm text-black transition-all btn-neon disabled:opacity-50"
                  style={{background:'linear-gradient(135deg,#00f5d4,#00c896)',boxShadow:'0 0 16px rgba(0,245,212,0.4)'}}>
                  {loading?(
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black/80 rounded-full animate-spin"/>
                      Verificando CIVAC...
                    </span>
                  ):'Ingresar al sistema'}
                </button>
              </form>

              {/* Mini plan cards */}
              <div className="mt-4 pt-4 border-t" style={{borderColor:'rgba(0,245,212,0.1)'}}>
                <p className="text-[10px] text-white/25 text-center mb-2.5">Planes de suscripción · Wompi Colombia</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {PLANES_MINI.map(p=>(
                    <button key={p.id} onClick={()=>setTab('planes')}
                      className="rounded-xl p-2.5 text-center transition-all hover:scale-105 card-lift"
                      style={{background:`linear-gradient(135deg,${p.from}18,${p.to}10)`,border:`1px solid ${p.from}30`}}>
                      <div className="flex justify-center mb-1 text-white" style={{color:p.from}}>{p.icon}</div>
                      <p className="font-black text-[10px]" style={{color:p.from}}>{p.label}</p>
                      <p className="text-[8px] text-white/35 mt-0.5">{p.precio}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-center mt-6 text-[10px]" style={{color:'rgba(255,255,255,0.15)'}}>
          CIVAC PRO v3.0 · Control Inteligente Agropecuario · Colombia {new Date().getFullYear()} · PWA Offline · Pago seguro <span style={{color:'rgba(0,245,212,0.4)'}}>Wompi</span>
        </p>
      </div>
    </div>
  );
}
