import { useState, useEffect } from "react";
import { useAuth, PLAN_LABEL, PLAN_COLOR, PLAN_GLOW, PLAN_ICON, type PlanId } from "@/lib/auth";
import {
  Eye, EyeOff, Lock, User, Mail, Check, ChevronRight, Phone,
  AlertTriangle, Shield, ArrowLeft, Building2, Users, MapPin,
  Zap, Globe, Smartphone, Wifi
} from "lucide-react";

const PLAN_FEATURES: Record<PlanId, string[]> = {
  basico:  ["50 animales máx","1 usuario","Dashboard básico","Inventario","Producción","Alertas","Potreros"],
  pro:     ["Animales ilimitados","5 usuarios","Pesaje Bluetooth","GPS ganado","Reproducción","Genética","Insumos","Costos","Personal","Predicción IA","3 Multi-fincas","Básculas COM/USB"],
  premium: ["Todo el plan PRO","15 usuarios","GPS 50 collares","IA avanzada","Multi-finca ilimitada","Google Drive sync","Soporte 24/7","API REST"],
  platino: ["TODO ilimitado","Usuarios ilimitados","SLA 99.9%","Instancia dedicada","Capacitación en finca","Módulos a medida","Contrato empresarial","Webhooks + API"],
};

export default function Signup({ onCancel }: { onCancel: () => void }) {
  const { accounts, loginAs } = useAuth();
  const [step, setStep] = useState<"plan" | "info" | "auth">("plan");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("basico");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [confirmPass, setConfirmPass] = useState(false);
  const [entered, setEntered] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    finca: "",
    departamento: "",
    municipio: "",
    telefono: "",
    nit: "",
    password: "",
    passwordConfirm: "",
  });

  useEffect(() => { const t = setTimeout(() => setEntered(true), 50); return () => clearTimeout(t); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === "info") {
      if (!formData.nombre.trim()) { setError("Nombre requerido"); return; }
      if (!formData.email.trim()) { setError("Email requerido"); return; }
      if (!formData.finca.trim()) { setError("Nombre de la finca requerido"); return; }
      if (!formData.departamento) { setError("Departamento requerido"); return; }
      setStep("auth");
      return;
    }

    if (step === "auth") {
      if (formData.password.length < 6) { setError("Contraseña mínimo 6 caracteres"); return; }
      if (formData.password !== formData.passwordConfirm) { setError("Las contraseñas no coinciden"); return; }

      const newAcc = {
        id: `new_${Date.now()}`,
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        role: "admin" as const,
        plan: selectedPlan,
        cargo: "Propietario/Gerente Finca",
        finca: formData.finca,
        avatar: "👨‍🌾",
        gradient: "from-[#1e40af] to-[#3b82f6]",
        permisos: ["inventario", "produccion", "alertas", "pesaje", "gps"],
      };

      const existing = accounts.find(a => a.email === formData.email);
      if (existing) { setError("Email ya registrado. Intenta con otro."); return; }

      setLoading(true);
      setTimeout(() => {
        loginAs(newAcc as Parameters<typeof loginAs>[0]);
      }, 600);
    }
  };

  const DEPARTAMENTOS = [
    "Antioquia", "Arauca", "Atlantico", "Bolívar", "Boyacá", "Caldas",
    "Caquetá", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca",
    "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño",
    "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "Santander",
    "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"
  ];

  const pglow = PLAN_GLOW[selectedPlan];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(12px)" }}>
      <div className={`w-full max-w-2xl rounded-3xl overflow-hidden transition-all duration-700 ${entered ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        style={{
          background: "linear-gradient(145deg,#040d1a,#071325)",
          border: `1px solid rgba(${pglow},0.3)`,
          boxShadow: `0 0 80px rgba(${pglow},0.15), 0 20px 60px rgba(0,0,0,0.7)`,
        }}>
        
        <div className="h-1" style={{ background: `linear-gradient(90deg,#00f5d4,#00c8ff)` }} />
        <div className="p-5 sm:p-6 border-b" style={{ borderColor: `rgba(${pglow},0.15)` }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                🚀 Crear Cuenta Gratis
              </h1>
              <p className="text-xs text-white/40 mt-1">
                Empieza con GanaderIA — Control inteligente para tu ganadería
              </p>
            </div>
            <button onClick={onCancel}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
              <ArrowLeft size={18} className="text-white/60" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            {["plan", "info", "auth"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all`}
                  style={{
                    background: step === s ? `linear-gradient(135deg,#00f5d4,#00c8ff)` : `rgba(${pglow},0.15)`,
                    color: step === s ? "black" : "white/50",
                  }}>
                  {i + 1}
                </div>
                <span className="text-xs font-bold hidden sm:block" style={{ color: step === s ? `#00f5d4` : "rgba(255,255,255,0.3)" }}>
                  {s === "plan" ? "Plan" : s === "info" ? "Datos" : "Seguridad"}
                </span>
                {i < 2 && <div className="flex-1 h-0.5 mx-2" style={{ background: `rgba(${pglow},0.1)` }} />}
              </div>
            ))}
          </div>

          {step === "plan" && (
            <div className="space-y-4">
              <p className="text-sm font-bold" style={{ color: "#00f5d4" }}>Selecciona tu plan inicial</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["basico", "pro"] as PlanId[]).map(plan => {
                  const feats = PLAN_FEATURES[plan];
                  const isSelected = selectedPlan === plan;
                  return (
                    <button key={plan}
                      onClick={() => setSelectedPlan(plan)}
                      className="relative rounded-2xl overflow-hidden transition-all text-left p-4 group hover:scale-[1.02]"
                      style={{
                        background: isSelected ? `rgba(${PLAN_GLOW[plan]},0.12)` : "rgba(255,255,255,0.03)",
                        border: `1.5px solid rgba(${PLAN_GLOW[plan]},${isSelected ? "0.5" : "0.2"})`,
                        boxShadow: isSelected ? `0 0 24px rgba(${PLAN_GLOW[plan]},0.25)` : "none",
                      }}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-black text-white">{PLAN_ICON[plan]} {PLAN_LABEL[plan]}</div>
                          <div className="text-[10px] text-white/30 mt-0.5">{plan === "basico" ? "Gratis" : "$89.000/mes"}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all`}
                          style={{ borderColor: isSelected ? `#00f5d4` : "rgba(255,255,255,0.2)" }}>
                          {isSelected && <Check size={12} style={{ color: "#00f5d4" }} />}
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {feats.slice(0, 3).map(f => (
                          <li key={f} className="text-[9px] text-white/50 flex items-center gap-1">
                            <span style={{ color: "#39ff7e" }}>✓</span>{f}
                          </li>
                        ))}
                        {feats.length > 3 && <li className="text-[9px] text-white/30">+{feats.length - 3} más…</li>}
                      </ul>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setStep("info")}
                className="w-full py-3 rounded-2xl font-black text-sm text-black transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#00f5d4,#00c8ff)", boxShadow: "0 0 24px rgba(0,245,212,0.4)" }}>
                Continuar → 
              </button>
            </div>
          )}

          {step === "info" && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Nombre completo *</label>
                  <input type="text" value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej: Juan García"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white transition-all"
                    style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.15)", outline: "none" }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Email *</label>
                  <input type="email" value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="correo@ganaderia.co"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white transition-all"
                    style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.15)", outline: "none" }}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Nombre de la finca *</label>
                <input type="text" value={formData.finca}
                  onChange={e => setFormData({...formData, finca: e.target.value})}
                  placeholder="Ej: Finca La Esperanza"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white transition-all"
                  style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.15)", outline: "none" }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Departamento *</label>
                  <select value={formData.departamento}
                    onChange={e => setFormData({...formData, departamento: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white transition-all"
                    style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.15)", outline: "none" }}>
                    <option value="">Selecciona...</option>
                    {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">NIT / Cédula (opcional)</label>
                  <input type="text" value={formData.nit}
                    onChange={e => setFormData({...formData, nit: e.target.value})}
                    placeholder="Ej: 123456789-1"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white transition-all"
                    style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.15)", outline: "none" }}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
                  style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.25)", color: "#ff6b8a" }}>
                  <AlertTriangle size={12} />{error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setStep("plan"); setError(""); }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs transition-all hover:bg-white/10"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
                  ← Atrás
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl font-black text-xs text-black transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg,#00f5d4,#00c8ff)" }}>
                  Siguiente →
                </button>
              </div>
            </form>
          )}

          {step === "auth" && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs font-bold" style={{ color: "#00f5d4" }}>Crear contraseña segura</p>
              
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(0,245,212,0.45)" }} />
                  <input type={showPass ? "text" : "password"} value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white transition-all"
                    style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.15)", outline: "none" }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[9px] text-white/30 mt-1">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Confirmar contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(0,245,212,0.45)" }} />
                  <input type={confirmPass ? "text" : "password"} value={formData.passwordConfirm}
                    onChange={e => setFormData({...formData, passwordConfirm: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white transition-all"
                    style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.15)", outline: "none" }}
                  />
                  <button type="button" onClick={() => setConfirmPass(!confirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                    {confirmPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl p-3" style={{ background: "rgba(57,255,126,0.06)", border: "1px solid rgba(57,255,126,0.15)" }}>
                <div className="flex items-start gap-2">
                  <Shield size={12} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] font-bold text-green-300/80">Seguridad de datos</p>
                    <p className="text-[8px] text-green-300/50">Tu contraseña se cifra con AES-256 · SSL 256-bit</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
                  style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.25)", color: "#ff6b8a" }}>
                  <AlertTriangle size={12} />{error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setStep("info"); setError(""); }}
                  className="flex-1 py-3 rounded-xl font-bold text-xs transition-all hover:bg-white/10"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
                  ← Atrás
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-xl font-black text-xs text-black transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#00f5d4,#00c8ff)" }}>
                  {loading ? "Creando cuenta…" : "Crear cuenta gratis →"}
                </button>
              </div>
            </form>
          )}

          <p className="text-[8px] text-center text-white/20">
            Al registrarte aceptas nuestros Términos de Servicio · Política de Privacidad · Colombia 🇨🇴
          </p>
        </div>
      </div>
    </div>
  );
}
