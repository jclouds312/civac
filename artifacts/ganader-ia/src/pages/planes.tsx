import { useState } from "react";
import { Check, X, Crown, Zap, Star, Shield, ChevronRight, CreditCard, Lock, Smartphone, Globe, Download, Building2, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const PLANES = [
  {
    id: "basico",
    nombre: "Básico",
    subtitle: "Para fincas pequeñas",
    precio: 0,
    precioAnual: 0,
    color: "from-slate-600 to-slate-700",
    border: "border-slate-600/30",
    highlight: false,
    badge: null,
    icon: <Leaf className="w-5 h-5" />,
    iconBg: "bg-slate-700",
    features: [
      { label: "Hasta 50 animales", ok: true },
      { label: "Dashboard básico", ok: true },
      { label: "Inventario y fichas", ok: true },
      { label: "1 usuario", ok: true },
      { label: "Producción lechera", ok: true },
      { label: "Alertas básicas", ok: true },
      { label: "Pesaje Bluetooth", ok: false },
      { label: "GPS Ganado", ok: false },
      { label: "Predicciones IA", ok: false },
      { label: "Multi-Finca", ok: false },
      { label: "Soporte prioritario", ok: false },
      { label: "Google Drive sync", ok: false },
    ],
  },
  {
    id: "pro",
    nombre: "PRO",
    subtitle: "Para ganaderos activos",
    precio: 89000,
    precioAnual: 75000,
    color: "from-emerald-600 to-teal-600",
    border: "border-emerald-500/50",
    highlight: true,
    badge: "Más popular",
    icon: <Zap className="w-5 h-5" />,
    iconBg: "bg-emerald-600",
    features: [
      { label: "Hasta 300 animales", ok: true },
      { label: "Dashboard PRO completo", ok: true },
      { label: "Todos los módulos base", ok: true },
      { label: "Hasta 5 usuarios", ok: true },
      { label: "Pesaje Bluetooth BT", ok: true },
      { label: "GPS Ganado (5 collares)", ok: true },
      { label: "Predicciones IA básicas", ok: true },
      { label: "Exportar a Excel/PDF", ok: true },
      { label: "Google Drive sync", ok: true },
      { label: "Multi-Finca (2 fincas)", ok: false },
      { label: "Soporte chat 8h", ok: true },
      { label: "App Windows / iOS", ok: true },
    ],
  },
  {
    id: "premium",
    nombre: "Premium",
    subtitle: "Operaciones medianas",
    precio: 189000,
    precioAnual: 159000,
    color: "from-violet-600 to-purple-700",
    border: "border-violet-500/50",
    highlight: false,
    badge: "Recomendado",
    icon: <Star className="w-5 h-5" />,
    iconBg: "bg-violet-600",
    features: [
      { label: "Hasta 1.000 animales", ok: true },
      { label: "Dashboard PRO + widgets IA", ok: true },
      { label: "Todos los módulos activos", ok: true },
      { label: "Hasta 15 usuarios", ok: true },
      { label: "Pesaje BT ilimitado", ok: true },
      { label: "GPS ilimitado (50 collares)", ok: true },
      { label: "Predicciones IA avanzadas", ok: true },
      { label: "Exportar ilimitado", ok: true },
      { label: "Google Drive sync auto", ok: true },
      { label: "Multi-Finca (5 fincas)", ok: true },
      { label: "Soporte prioritario 24h", ok: true },
      { label: "App Windows / iOS / Android", ok: true },
    ],
  },
  {
    id: "platino",
    nombre: "Platino",
    subtitle: "Empresas y haciendas",
    precio: 399000,
    precioAnual: 329000,
    color: "from-amber-500 to-orange-600",
    border: "border-amber-500/50",
    highlight: false,
    badge: "Empresarial",
    icon: <Crown className="w-5 h-5" />,
    iconBg: "bg-amber-600",
    features: [
      { label: "Animales ilimitados", ok: true },
      { label: "Dashboard empresarial + API", ok: true },
      { label: "Todos los módulos + API REST", ok: true },
      { label: "Usuarios ilimitados", ok: true },
      { label: "Pesaje BT ilimitado + IA", ok: true },
      { label: "GPS ilimitado + geocercas IA", ok: true },
      { label: "IA predictiva avanzada", ok: true },
      { label: "Exportar + integración ERP", ok: true },
      { label: "Google Drive + OneDrive", ok: true },
      { label: "Multi-Finca ilimitado", ok: true },
      { label: "SLA 99.9% + soporte 24/7", ok: true },
      { label: "Marca propia (white-label)", ok: true },
    ],
  },
];

function formatCOP(n: number) {
  return n === 0 ? "Gratis" : "$" + n.toLocaleString("es-CO") + " COP/mes";
}

function WompiCheckout({ plan }: { plan: typeof PLANES[0] }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form"|"processing"|"success">("form");
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", nit: "", pago: "tarjeta" });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const { user } = useAuth();

  if (plan.precio === 0) return null;

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.nombre.trim()) e.nombre = "Nombre requerido";
    if (!form.email.includes("@")) e.email = "Email inválido";
    if (form.telefono.replace(/\D/g,"").length < 10) e.telefono = "Teléfono inválido";
    return e;
  };

  const handlePay = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      setLoading(false);
    }, 2500);
  };

  if (step === "success") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">¡Pago exitoso!</h3>
        <p className="text-white/70 text-sm mb-1">Plan <strong>{plan.nombre}</strong> activado</p>
        <p className="text-white/50 text-xs">Recibirá un correo de confirmación. Referencia Wompi: <strong>WMP{Date.now().toString().slice(-8)}</strong></p>
        <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-xs text-green-300">
          Su suscripción se renovará automáticamente cada mes. Puede cancelarla en cualquier momento.
        </div>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white font-semibold">Procesando pago con Wompi...</p>
        <p className="text-white/50 text-xs mt-2">Conectando con la pasarela segura</p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-xs text-green-400">Transacción cifrada SSL · Wompi Colombia</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white font-bold text-lg">{plan.nombre}</p>
            <p className="text-white/60 text-sm">{plan.subtitle}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{formatCOP(plan.precio)}</p>
            <p className="text-xs text-white/40">Anual: {formatCOP(plan.precioAnual)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/60 block mb-1">Nombre completo *</label>
          <input
            value={form.nombre || user?.nombre || ""}
            onChange={e => setForm({...form, nombre: e.target.value})}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-white/40 outline-none"
            placeholder="Juan Pérez"
          />
          {errors.nombre && <p className="text-red-400 text-[10px] mt-0.5">{errors.nombre}</p>}
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">Correo electrónico *</label>
          <input
            value={form.email || user?.email || ""}
            onChange={e => setForm({...form, email: e.target.value})}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-white/40 outline-none"
            placeholder="correo@ejemplo.com"
          />
          {errors.email && <p className="text-red-400 text-[10px] mt-0.5">{errors.email}</p>}
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">Teléfono / Celular *</label>
          <input
            value={form.telefono}
            onChange={e => setForm({...form, telefono: e.target.value})}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-white/40 outline-none"
            placeholder="3001234567"
          />
          {errors.telefono && <p className="text-red-400 text-[10px] mt-0.5">{errors.telefono}</p>}
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">NIT / Cédula (opcional)</label>
          <input
            value={form.nit}
            onChange={e => setForm({...form, nit: e.target.value})}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-white/40 outline-none"
            placeholder="900123456-7"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-white/60 block mb-2">Método de pago</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: "tarjeta", label: "Tarjeta", icon: <CreditCard className="w-4 h-4" /> },
            { id: "nequi", label: "Nequi", icon: <Smartphone className="w-4 h-4" /> },
            { id: "pse", label: "PSE", icon: <Building2 className="w-4 h-4" /> },
            { id: "bancolombia", label: "Bancolombia", icon: <Globe className="w-4 h-4" /> },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setForm({...form, pago: m.id})}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                form.pago === m.id
                  ? "border-emerald-400 bg-emerald-500/20 text-white"
                  : "border-white/20 bg-white/5 text-white/60 hover:border-white/40"
              }`}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {form.pago === "tarjeta" && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/60 block mb-1">Número de tarjeta</label>
            <input
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-white/40 outline-none"
              placeholder="4242 4242 4242 4242"
              maxLength={19}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60 block mb-1">Vencimiento</label>
              <input className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-white/40 outline-none" placeholder="MM/AA" maxLength={5} />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1">CVV</label>
              <input className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-white/40 outline-none" placeholder="•••" maxLength={4} type="password" />
            </div>
          </div>
        </div>
      )}
      {form.pago === "nequi" && (
        <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 text-center">
          <p className="text-pink-300 font-semibold text-sm">Pago con Nequi</p>
          <p className="text-white/50 text-xs mt-1">Al confirmar, recibirá una notificación push en su app Nequi al número registrado.</p>
        </div>
      )}
      {form.pago === "pse" && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
          <p className="text-blue-300 font-semibold text-sm">Pago PSE — Débito bancario</p>
          <p className="text-white/50 text-xs mt-1">Será redirigido al portal de su banco para autorizar el débito.</p>
        </div>
      )}
      {form.pago === "bancolombia" && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
          <p className="text-yellow-300 font-semibold text-sm">Botón de Pagos Bancolombia</p>
          <p className="text-white/50 text-xs mt-1">Pague directamente desde su app Bancolombia o sucursal virtual.</p>
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-white/50">
        <Lock className="w-3 h-3 mt-0.5 text-green-400 flex-shrink-0" />
        <span>Pago seguro procesado por <strong className="text-white/80">Wompi — Bancolombia</strong>. Sus datos están cifrados. No almacenamos información de tarjetas.</span>
      </div>

      <button
        onClick={handlePay}
        disabled={loading}
        className={`w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${plan.color} hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg`}
      >
        <Lock className="w-4 h-4" />
        Pagar {formatCOP(plan.precio)} con Wompi
      </button>

      <div className="flex items-center justify-center gap-4 text-[10px] text-white/30">
        <span className="flex items-center gap-1"><Check className="w-2.5 h-2.5" />Cancela cuando quieras</span>
        <span className="flex items-center gap-1"><Shield className="w-2.5 h-2.5" />SSL 256-bit</span>
        <span className="flex items-center gap-1"><Check className="w-2.5 h-2.5" />Factura electrónica</span>
      </div>
    </div>
  );
}

export default function Planes() {
  const [period, setPeriod] = useState<"mensual"|"anual">("mensual");
  const [checkout, setCheckout] = useState<typeof PLANES[0] | null>(null);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-1.5 rounded-full mb-3">
          <Crown className="w-3.5 h-3.5" /> Planes y Precios · Wompi Colombia
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Elige tu plan GanaderIA</h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Todos los planes incluyen actualizaciones automáticas, PWA offline y soporte técnico.
          Facturación en pesos colombianos (COP) · IVA incluido.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPeriod("mensual")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${period==="mensual"?"bg-primary text-white":"bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}>Mensual</button>
          <button onClick={() => setPeriod("anual")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${period==="anual"?"bg-primary text-white":"bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}>
            Anual
            <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">-16%</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {PLANES.map(plan => (
          <div key={plan.id} className={`relative rounded-2xl border-2 ${plan.border} ${plan.highlight ? 'shadow-2xl shadow-emerald-900/40 scale-[1.02]' : ''} bg-card overflow-hidden flex flex-col`}>
            {plan.badge && (
              <div className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${plan.color} text-white shadow`}>
                {plan.badge}
              </div>
            )}
            <div className={`bg-gradient-to-br ${plan.color} p-5`}>
              <div className={`w-10 h-10 rounded-xl ${plan.iconBg} bg-white/20 flex items-center justify-center text-white mb-3 shadow`}>
                {plan.icon}
              </div>
              <h3 className="text-xl font-bold text-white">{plan.nombre}</h3>
              <p className="text-white/70 text-xs">{plan.subtitle}</p>
              <div className="mt-3">
                <span className="text-3xl font-bold text-white">
                  {plan.precio === 0 ? "Gratis" : "$" + (period === "anual" ? plan.precioAnual : plan.precio).toLocaleString("es-CO")}
                </span>
                {plan.precio > 0 && <span className="text-white/60 text-xs ml-1">COP/mes</span>}
              </div>
              {plan.precio > 0 && period === "anual" && (
                <p className="text-white/60 text-[10px] mt-0.5">Facturado anualmente · ahorras ${((plan.precio - plan.precioAnual) * 12).toLocaleString("es-CO")}/año</p>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <ul className="space-y-2 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2 text-xs ${f.ok ? 'text-foreground' : 'text-muted-foreground/50 line-through'}`}>
                    {f.ok
                      ? <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                      : <X className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                    }
                    {f.label}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => plan.precio > 0 ? setCheckout(plan) : null}
                className={`mt-5 w-full py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${plan.color} hover:opacity-90 transition-all flex items-center justify-center gap-2`}
              >
                {plan.precio === 0 ? "Plan actual" : <>Suscribirse <ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Wompi checkout modal */}
      {checkout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1f15] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className={`bg-gradient-to-r ${checkout.color} px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white">{checkout.icon}</div>
                <div>
                  <p className="font-bold text-white">Suscripción Plan {checkout.nombre}</p>
                  <p className="text-white/70 text-xs flex items-center gap-1"><Lock className="w-3 h-3" />Pago seguro · Wompi Colombia</p>
                </div>
              </div>
              <button onClick={() => setCheckout(null)} className="text-white/60 hover:text-white text-xl font-bold">✕</button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <WompiCheckout plan={checkout} />
            </div>
          </div>
        </div>
      )}

      {/* Wompi trust badges */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="text-center mb-4">
          <p className="text-sm font-semibold text-muted-foreground">Pago 100% seguro procesado por</p>
          <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold px-4 py-2 rounded-xl text-sm">🏦 Wompi · Bancolombia</div>
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold px-4 py-2 rounded-xl text-sm">🔒 SSL 256-bit</div>
            <div className="bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold px-4 py-2 rounded-xl text-sm">📱 Nequi</div>
            <div className="bg-slate-500/10 border border-slate-500/20 text-slate-400 font-bold px-4 py-2 rounded-xl text-sm">🏛 PSE</div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {[
            { icon:"🔐", title:"Datos cifrados", desc:"Encriptación AES-256" },
            { icon:"📄", title:"Factura DIAN", desc:"Factura electrónica incluida" },
            { icon:"↩", title:"Cancela cuando quieras", desc:"Sin permanencia mínima" },
            { icon:"🇨🇴", title:"Precios en COP", desc:"IVA incluido · Régimen común" },
          ].map(b => (
            <div key={b.title} className="text-center">
              <div className="text-2xl mb-1">{b.icon}</div>
              <p className="text-xs font-semibold text-foreground">{b.title}</p>
              <p className="text-[10px] text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4">Preguntas frecuentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { q:"¿Puedo cambiar de plan?", a:"Sí, en cualquier momento. El cambio se refleja de forma inmediata y se prorratea el cobro." },
            { q:"¿Cómo cancelo?", a:"Desde Configuración > Plan > Cancelar suscripción. Sus datos se conservan 30 días." },
            { q:"¿Hay versión de prueba?", a:"El plan Básico es siempre gratis. Los planes de pago tienen 14 días de prueba sin cargo." },
            { q:"¿Facturas electrónicas?", a:"Sí, emitimos factura electrónica DIAN automáticamente por cada cobro realizado." },
          ].map(f => (
            <div key={f.q} className="bg-muted/20 rounded-xl p-4">
              <p className="font-semibold text-sm text-foreground mb-1">{f.q}</p>
              <p className="text-xs text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
