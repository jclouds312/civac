import { useState } from "react";
import { useAuth, ACCOUNTS, Account } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye, EyeOff, Lock, User, ChevronRight, Shield, Stethoscope,
  Milk, BarChart3, Wifi, CheckCircle2, Sparkles, ArrowRight
} from "lucide-react";

const roleIcons: Record<string, React.ReactNode> = {
  admin:  <Shield      className="w-5 h-5" />,
  vet:    <Stethoscope className="w-5 h-5" />,
  field:  <Milk        className="w-5 h-5" />,
  viewer: <BarChart3   className="w-5 h-5" />,
};

const roleColors: Record<string, { bg: string; border: string; badge: string }> = {
  admin:  { bg: "from-emerald-600 to-emerald-800", border: "border-emerald-500/40 hover:border-emerald-400", badge: "bg-emerald-500/20 text-emerald-300" },
  vet:    { bg: "from-sky-600 to-sky-800",         border: "border-sky-500/40 hover:border-sky-400",         badge: "bg-sky-500/20 text-sky-300"         },
  field:  { bg: "from-orange-500 to-orange-700",   border: "border-orange-500/40 hover:border-orange-400",   badge: "bg-orange-500/20 text-orange-300"   },
  viewer: { bg: "from-violet-600 to-violet-800",   border: "border-violet-500/40 hover:border-violet-400",   badge: "bg-violet-500/20 text-violet-300"   },
};

const FEATURES = [
  "Inventario RFID y fichas individuales",
  "Producción lechera con 3 turnos",
  "Reproducción, gestación y partos",
  "Genética DEP y mejoramiento genético",
  "Potreros, rotación y aforo de pasto",
  "Costos, P&G y análisis financiero",
  "Predicciones IA a 12 meses",
  "Huella de carbono CO₂ · Bonos verdes",
  "PWA offline · Sin instalar nada",
];

function GanaderIALogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="180" rx="40" fill="url(#lgBg)"/>
      <defs>
        <linearGradient id="lgBg" x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f2d1a"/>
          <stop offset="100%" stopColor="#1a4a2e"/>
        </linearGradient>
        <linearGradient id="lgCow" x1="48" y1="60" x2="132" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>
      </defs>
      <line x1="20" y1="30" x2="55" y2="30" stroke="#4ade80" strokeWidth="0.8" opacity="0.25"/>
      <line x1="55" y1="30" x2="55" y2="52" stroke="#4ade80" strokeWidth="0.8" opacity="0.25"/>
      <line x1="125" y1="30" x2="160" y2="30" stroke="#4ade80" strokeWidth="0.8" opacity="0.25"/>
      <line x1="125" y1="30" x2="125" y2="52" stroke="#4ade80" strokeWidth="0.8" opacity="0.25"/>
      <circle cx="20" cy="30" r="2.5" fill="#4ade80" opacity="0.5"/>
      <circle cx="160" cy="30" r="2.5" fill="#4ade80" opacity="0.5"/>
      <path d="M58 82 Q44 56 52 44 Q62 58 68 78" fill="#6ee7b7" opacity="0.9"/>
      <path d="M122 82 Q136 56 128 44 Q118 58 112 78" fill="#6ee7b7" opacity="0.9"/>
      <ellipse cx="52" cy="88" rx="12" ry="8" fill="#2d8a4e" transform="rotate(-25 52 88)"/>
      <ellipse cx="128" cy="88" rx="12" ry="8" fill="#2d8a4e" transform="rotate(25 128 88)"/>
      <ellipse cx="90" cy="100" rx="43" ry="38" fill="url(#lgCow)"/>
      <circle cx="75" cy="93" r="9" fill="white"/>
      <circle cx="105" cy="93" r="9" fill="white"/>
      <circle cx="76" cy="93" r="5" fill="#0f2d1a"/>
      <circle cx="106" cy="93" r="5" fill="#0f2d1a"/>
      <circle cx="78" cy="91" r="1.8" fill="white"/>
      <circle cx="108" cy="91" r="1.8" fill="white"/>
      <ellipse cx="90" cy="118" rx="23" ry="15" fill="#1a5c2e"/>
      <ellipse cx="82" cy="118" r="4.5" fill="#0f3322"/>
      <ellipse cx="98" cy="118" r="4.5" fill="#0f3322"/>
      <circle cx="90" cy="34" r="4" fill="#4ade80" opacity="0.9"/>
      <circle cx="72" cy="42" r="2.5" fill="#4ade80" opacity="0.7"/>
      <circle cx="108" cy="42" r="2.5" fill="#4ade80" opacity="0.7"/>
      <line x1="90" y1="34" x2="72" y2="42" stroke="#4ade80" strokeWidth="1.2" opacity="0.5"/>
      <line x1="90" y1="34" x2="108" y2="42" stroke="#4ade80" strokeWidth="1.2" opacity="0.5"/>
    </svg>
  );
}

export default function Login() {
  const { login, loginAs } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState<Account | null>(null);

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
    <div className="min-h-screen bg-[#050e07] flex lg:flex-row flex-col">

      {/* ════ LEFT PANEL — Brand hero ════ */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-10 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#071810] via-[#0c2416] to-[#0f2d1a]" />
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)',
          backgroundSize: '44px 44px'
        }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-600/8 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <GanaderIALogo size={44} />
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none">
                Ganader<span className="text-emerald-400">IA</span>
              </h1>
              <p className="text-[11px] text-emerald-400/60 font-medium tracking-widest uppercase">Ganadería Inteligente</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-6">
              <Sparkles size={11} /> Sistema de gestión v3.0
            </span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            La plataforma ganadera<br/>
            <span className="text-emerald-400">más completa</span><br/>
            de Colombia
          </h2>
          <p className="text-white/50 text-base leading-relaxed mb-8 max-w-sm">
            16+ módulos integrados. Gestione su hato, producción, finanzas y más — desde cualquier dispositivo, incluso sin internet.
          </p>

          <div className="space-y-2.5">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-white/65">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs text-white/25">
            <Wifi size={11} />
            <span>Colombia · Hecho para ganaderos colombianos · {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* ════ RIGHT PANEL — Login ════ */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 relative">
        <div className="absolute inset-0 bg-[#060e09]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <GanaderIALogo size={56} />
            <h1 className="text-3xl font-black text-white mt-3">
              Ganader<span className="text-emerald-400">IA</span>
            </h1>
            <p className="text-emerald-400/60 text-xs mt-1">Ganadería Inteligente · Colombia</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Bienvenido de vuelta</h2>
            <p className="text-white/45 text-sm">Seleccione su perfil o ingrese sus credenciales</p>
          </div>

          {/* Quick access cards */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {ACCOUNTS.map(account => {
              const rc = roleColors[account.role];
              const isSelected = selected?.id === account.id;
              return (
                <button
                  key={account.id}
                  onClick={() => handleCard(account)}
                  className={`relative group flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${rc.border} ${
                    isSelected
                      ? 'bg-white/10 shadow-lg scale-[1.02]'
                      : 'bg-white/4 hover:bg-white/7'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${rc.bg} flex items-center justify-center text-white flex-shrink-0 shadow`}>
                    {roleIcons[account.role]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-xs leading-tight truncate">{account.nombre.split(' ')[0]}</p>
                    <p className="text-white/45 text-[10px] truncate">{account.cargo}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${rc.badge}`}>
                      {account.role.toUpperCase()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/25 text-[11px] font-medium">O ingresa manualmente</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-white/55 text-xs mb-1.5 block font-medium">Correo electrónico o usuario</Label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <Input
                  type="text"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="admin@ganader.ia"
                  className="bg-white/8 border-white/15 text-white placeholder:text-white/25 pl-9 focus:border-emerald-500/60 focus:bg-white/10 h-10"
                />
              </div>
            </div>

            <div>
              <Label className="text-white/55 text-xs mb-1.5 block font-medium">Contraseña</Label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <Input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="bg-white/8 border-white/15 text-white placeholder:text-white/25 pl-9 pr-10 focus:border-emerald-500/60 focus:bg-white/10 h-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-0 font-bold text-sm shadow-lg shadow-emerald-900/40 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Ingresar al sistema
                  <ArrowRight size={15} />
                </span>
              )}
            </Button>

            {selected && (
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 border-white/15 text-white/70 hover:bg-white/8 hover:text-white text-xs font-semibold"
                onClick={() => handleQuickLogin(selected)}
                disabled={loading}
              >
                <ChevronRight size={13} className="mr-1" />
                Acceso rápido como {selected.nombre.split(' ')[0]}
              </Button>
            )}
          </form>

          {/* Bottom strip */}
          <div className="mt-6 pt-5 border-t border-white/8">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[10px] text-white/25 text-center">
              <span>16+ módulos integrados</span>
              <span className="text-white/15">·</span>
              <span>PWA sin internet</span>
              <span className="text-white/15">·</span>
              <span>Datos en Colombia</span>
              <span className="text-white/15">·</span>
              <span>
                <a href="/planes" className="text-emerald-500/70 hover:text-emerald-400 transition-colors">
                  Ver planes →
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
