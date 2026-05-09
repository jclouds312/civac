import { useState } from "react";
import { useAuth, Account } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye, EyeOff, Leaf, Lock, User, ChevronRight,
  Shield, Stethoscope, Crown, Zap, Star, Check, X
} from "lucide-react";

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="w-6 h-6" />,
  vet: <Stethoscope className="w-6 h-6" />,
  field: <Leaf className="w-6 h-6" />,
  viewer: <Crown className="w-6 h-6" />,
};

const roleColors: Record<string, string> = {
  admin: "from-emerald-600 to-emerald-800",
  vet: "from-blue-600 to-blue-800",
  field: "from-orange-500 to-orange-700",
  viewer: "from-purple-600 to-purple-800",
};

const roleBorder: Record<string, string> = {
  admin: "border-emerald-500/40 hover:border-emerald-400",
  vet: "border-blue-500/40 hover:border-blue-400",
  field: "border-orange-500/40 hover:border-orange-400",
  viewer: "border-purple-500/40 hover:border-purple-400",
};

const PLANES_CARDS = [
  {
    id: "basico",
    nombre: "Básico",
    precio: "Gratis",
    color: "from-slate-600 to-slate-700",
    border: "border-slate-500/30",
    icon: <Leaf className="w-4 h-4" />,
    features: ["50 animales", "1 usuario", "Módulos base"],
    badge: null,
  },
  {
    id: "pro",
    nombre: "PRO",
    precio: "$89.000/mes",
    color: "from-emerald-600 to-teal-600",
    border: "border-emerald-400/50",
    icon: <Zap className="w-4 h-4" />,
    features: ["300 animales", "5 usuarios", "Pesaje BT + GPS"],
    badge: "Popular",
    highlight: true,
  },
  {
    id: "premium",
    nombre: "Premium",
    precio: "$189.000/mes",
    color: "from-violet-600 to-purple-700",
    border: "border-violet-400/40",
    icon: <Star className="w-4 h-4" />,
    features: ["1.000 animales", "15 usuarios", "IA avanzada"],
    badge: "Recomendado",
  },
  {
    id: "platino",
    nombre: "Platino",
    precio: "$399.000/mes",
    color: "from-amber-500 to-orange-600",
    border: "border-amber-400/40",
    icon: <Crown className="w-4 h-4" />,
    features: ["Ilimitado", "Multi-finca", "SLA 99.9%"],
    badge: "Empresa",
  },
];

export default function Login() {
  const { login, loginAs, accounts } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Account | null>(null);
  const [tab, setTab] = useState<"login" | "planes">("login");

  const handleCard = (account: Account) => {
    setSelected(account);
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      const ok = login(email, password);
      if (!ok) setError("Credenciales incorrectas. Intente de nuevo.");
      setLoading(false);
    }, 600);
  };

  const handleQuickLogin = (account: Account) => {
    setLoading(true);
    setTimeout(() => { loginAs(account); setLoading(false); }, 400);
  };

  return (
    <div className="min-h-screen bg-[#060e09] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-900/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-emerald-950/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-950/15 rounded-full blur-3xl" />
      </div>
      <div className="absolute inset-0 opacity-[0.025]" style={{backgroundImage:'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)',backgroundSize:'40px 40px'}} />

      <div className="relative z-10 w-full max-w-5xl">
        {/* Logo */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 border border-emerald-500/30 shadow-2xl shadow-emerald-900/50 mb-3">
            <Leaf className="w-8 h-8 text-emerald-200" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
            Ganader<span className="text-emerald-400">IA</span>
            <span className="ml-2 text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-400 text-transparent bg-clip-text">PRO</span>
          </h1>
          <p className="text-emerald-300/60 text-sm">Sistema Inteligente de Ganadería · Colombia</p>

          {/* Tab switcher */}
          <div className="flex items-center justify-center gap-1 mt-3 bg-white/5 rounded-xl p-1 w-fit mx-auto border border-white/10">
            <button onClick={() => setTab("login")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab==="login"?"bg-emerald-600 text-white shadow":"text-white/50 hover:text-white/80"}`}>
              Iniciar sesión
            </button>
            <button onClick={() => setTab("planes")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${tab==="planes"?"bg-amber-600 text-white shadow":"text-white/50 hover:text-white/80"}`}>
              <Crown className="w-3 h-3" /> Planes y Precios
            </button>
          </div>
        </div>

        {tab === "planes" ? (
          <div className="space-y-4">
            <p className="text-center text-white/60 text-xs mb-2">Facturación en COP · IVA incluido · Wompi Colombia · Cancela cuando quieras</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PLANES_CARDS.map(p => (
                <div key={p.id} className={`relative rounded-2xl border-2 ${p.border} ${p.highlight ? 'shadow-2xl shadow-emerald-900/40 scale-[1.02]' : ''} bg-white/5 backdrop-blur overflow-hidden`}>
                  {p.badge && (
                    <div className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${p.color} text-white`}>{p.badge}</div>
                  )}
                  <div className={`bg-gradient-to-br ${p.color} p-4`}>
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white mb-2 shadow">{p.icon}</div>
                    <h3 className="text-base font-bold text-white">{p.nombre}</h3>
                    <p className="text-white/80 text-xs mt-1 font-semibold">{p.precio}</p>
                  </div>
                  <div className="p-3">
                    <ul className="space-y-1.5 mb-3">
                      {p.features.map(f => (
                        <li key={f} className="flex items-center gap-1.5 text-xs text-white/70">
                          <Check className="w-3 h-3 text-green-400 flex-shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setTab("login")}
                      className={`w-full py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r ${p.color} hover:opacity-90 transition-all`}>
                      {p.id === "basico" ? "Empezar gratis" : "Suscribirme"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 text-xs text-white/30 mt-2">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" />Pago seguro Wompi</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3" />Factura DIAN</span>
              <span className="flex items-center gap-1"><X className="w-3 h-3" />Sin permanencia</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
            {/* Profile cards */}
            <div className="lg:col-span-3">
              <p className="text-center text-xs text-emerald-400/50 uppercase tracking-widest font-semibold mb-3">Seleccione su perfil</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5">
                {accounts.slice(0, 8).map(account => (
                  <button key={account.id} onClick={() => handleCard(account)}
                    className={`relative group rounded-xl border-2 p-3 text-left transition-all duration-200 cursor-pointer ${roleBorder[account.role] || 'border-gray-500/40 hover:border-gray-400'} ${
                      selected?.id === account.id ? 'bg-white/12 scale-[1.03] shadow-lg' : 'bg-white/5 hover:bg-white/8 hover:scale-[1.01]'
                    }`}>
                    {selected?.id === account.id && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColors[account.role] || 'from-slate-600 to-slate-800'} flex items-center justify-center text-white mb-2 shadow`}>
                      {roleIcons[account.role] || <User className="w-5 h-5" />}
                    </div>
                    <p className="font-semibold text-white text-xs leading-tight mb-0.5 truncate">{account.nombre.split(' ').slice(0,2).join(' ')}</p>
                    <p className="text-[10px] text-white/45 truncate">{account.cargo || account.role}</p>
                    {selected?.id === account.id && (
                      <button
                        onClick={e => { e.stopPropagation(); handleQuickLogin(account); }}
                        className="mt-2 w-full text-center text-[9px] bg-emerald-600/60 hover:bg-emerald-500/80 text-white rounded-lg py-1 transition-all font-semibold">
                        ⚡ Acceso rápido
                      </button>
                    )}
                    {selected?.id !== account.id && (
                      <div className="flex items-center gap-0.5 mt-1.5">
                        <ChevronRight className="w-2.5 h-2.5 text-white/25 group-hover:text-white/50" />
                        <span className="text-[9px] text-white/35 group-hover:text-white/55">Seleccionar</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Login form */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4 text-emerald-400" /> Iniciar sesión
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label className="text-white/55 text-xs mb-1 block">Correo o usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                    <Input type="text" value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      placeholder="admin@ganader.ia"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/25 pl-8 text-sm focus:border-emerald-500/60" />
                  </div>
                </div>
                <div>
                  <Label className="text-white/55 text-xs mb-1 block">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                    <Input type={showPass ? "text" : "password"} value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      placeholder="••••••••"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/25 pl-8 pr-9 text-sm focus:border-emerald-500/60" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                <Button type="submit" disabled={loading || !email}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-0 font-semibold text-sm">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verificando...
                    </span>
                  ) : "Ingresar al sistema"}
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[10px] text-white/35 text-center mb-2">Plan activo</p>
                <div className="grid grid-cols-2 gap-2">
                  {PLANES_CARDS.slice(1).map(p => (
                    <div key={p.id} className={`rounded-xl border ${p.border} bg-gradient-to-br ${p.color} p-2.5 cursor-pointer hover:opacity-90 transition-all`}
                      onClick={() => setTab("planes")}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="text-white">{p.icon}</div>
                        <span className="text-white font-bold text-xs">{p.nombre}</span>
                      </div>
                      <p className="text-white/75 text-[9px]">{p.precio}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-white/20 text-[10px] mt-5">
          GanaderIA PRO v3.0 · Ganadería Inteligente Colombia · {new Date().getFullYear()} · Offline-ready PWA · Pago seguro Wompi
        </p>
      </div>
    </div>
  );
}
