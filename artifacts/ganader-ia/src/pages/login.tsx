import { useState } from "react";
import { useAuth, Account } from "@/lib/auth";
import { Eye, EyeOff, Lock, User, ChevronRight, Shield, Zap, Star, Crown, Check, X, Leaf } from "lucide-react";

// Pineapple neon logo inline SVG
function CivacLogoBig() {
  return (
    <svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="llbg" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#003d2e"/><stop offset="1" stopColor="#001a14"/></linearGradient>
        <linearGradient id="llbody" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#00f5d4"/><stop offset="1" stopColor="#00a070"/></linearGradient>
        <linearGradient id="llleaf" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#39ff7e"/><stop offset="1" stopColor="#00c850"/></linearGradient>
        <filter id="llglow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="100" height="100" rx="26" fill="url(#llbg)"/>
      <rect width="100" height="100" rx="26" fill="none" stroke="#00f5d4" strokeWidth="2" opacity="0.5"/>
      <ellipse cx="38" cy="24" rx="5" ry="13" fill="url(#llleaf)" transform="rotate(-25 38 24)" filter="url(#llglow)"/>
      <ellipse cx="50" cy="19" rx="5" ry="15" fill="url(#llleaf)" filter="url(#llglow)"/>
      <ellipse cx="62" cy="24" rx="5" ry="13" fill="url(#llleaf)" transform="rotate(25 62 24)" filter="url(#llglow)"/>
      <ellipse cx="50" cy="63" rx="21" ry="27" fill="url(#llbody)" filter="url(#llglow)"/>
      <g opacity="0.22" stroke="#001a14" strokeWidth="1.2">
        <line x1="35" y1="42" x2="65" y2="84"/><line x1="43" y1="38" x2="70" y2="80"/>
        <line x1="28" y1="55" x2="72" y2="55"/><line x1="30" y1="65" x2="70" y2="65"/><line x1="33" y1="75" x2="67" y2="75"/>
      </g>
      <circle cx="50" cy="50" r="2.5" fill="white" opacity="0.85"/>
      <circle cx="40" cy="59" r="1.8" fill="white" opacity="0.65"/>
      <circle cx="60" cy="59" r="1.8" fill="white" opacity="0.65"/>
      <circle cx="50" cy="70" r="1.8" fill="white" opacity="0.55"/>
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
      style={{background:'#020d09',fontFamily:"'Space Grotesk','Sora',sans-serif"}}>

      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-12" style={{background:'radial-gradient(ellipse,#00f5d4,transparent 70%)',top:'-200px'}}/>
        <div className="absolute bottom-0 left-1/4 w-[800px] h-[500px] opacity-8" style={{background:'radial-gradient(ellipse,#a855f7,transparent 70%)'}}/>
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] opacity-6" style={{background:'radial-gradient(ellipse,#00c8ff,transparent 70%)'}}/>
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(rgba(0,245,212,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,212,1) 1px,transparent 1px)',backgroundSize:'50px 50px'}}/>
        {/* Scan line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] opacity-20" style={{background:'linear-gradient(90deg,transparent,#00f5d4,transparent)',animation:'scan-line 8s linear infinite'}}/>
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
