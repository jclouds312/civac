import { useState } from "react";
import { useAuth, ACCOUNTS, Account } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Leaf, Wifi, Lock, User, ChevronRight, Shield, Stethoscope, Milk, BarChart3 } from "lucide-react";

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="w-8 h-8" />,
  vet: <Stethoscope className="w-8 h-8" />,
  field: <Milk className="w-8 h-8" />,
  viewer: <BarChart3 className="w-8 h-8" />,
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

export default function Login() {
  const { login, loginAs } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    setTimeout(() => {
      loginAs(account);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#060e09] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-emerald-950/30 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)', backgroundSize: '40px 40px'}} />

      <div className="relative z-10 w-full max-w-4xl">
        {/* Logo & brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 border border-emerald-500/30 shadow-2xl shadow-emerald-900/50 mb-4">
            <Leaf className="w-10 h-10 text-emerald-200" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-1">
            Ganader<span className="text-emerald-400">IA</span>
          </h1>
          <p className="text-emerald-300/70 text-sm">Ganadería Inteligente · Finca El Rancho Verde</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-emerald-400/60">
            <Wifi className="w-3 h-3" />
            <span>Sistema activo · Colombia</span>
          </div>
        </div>

        {/* Account cards grid */}
        <div className="mb-6">
          <p className="text-center text-xs text-emerald-400/60 uppercase tracking-widest font-semibold mb-4">
            Seleccione su perfil de acceso
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ACCOUNTS.map(account => (
              <button
                key={account.id}
                onClick={() => handleCard(account)}
                className={`relative group rounded-xl border-2 p-4 text-left transition-all duration-200 cursor-pointer ${roleBorder[account.role]} ${
                  selected?.id === account.id
                    ? 'bg-white/10 scale-[1.02] shadow-lg'
                    : 'bg-white/5 hover:bg-white/8 hover:scale-[1.01]'
                }`}
              >
                {selected?.id === account.id && (
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${roleColors[account.role]} flex items-center justify-center text-white mb-3 shadow-lg`}>
                  {roleIcons[account.role]}
                </div>
                <p className="font-semibold text-white text-sm leading-tight mb-0.5">{account.nombre}</p>
                <p className="text-xs text-white/50">{account.cargo}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ChevronRight className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors" />
                  <span className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors">Acceso rápido</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Login form */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 max-w-sm mx-auto">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-emerald-400" />
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-white/60 text-xs mb-1 block">Correo o usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="text"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="admin@ganader.ia"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pl-9 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <Label className="text-white/60 text-xs mb-1 block">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pl-9 pr-9 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-0 font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : "Ingresar al sistema"}
            </Button>
          </form>

          {selected && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs"
                onClick={() => handleQuickLogin(selected)}
                disabled={loading}
              >
                ⚡ Acceso rápido como {selected.nombre.split(' ')[0]}
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-white/25 text-xs mt-4">
          GanaderIA v2.0 · Ganadería Inteligente Colombia · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
