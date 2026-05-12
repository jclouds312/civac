import { useState } from "react";
import {
  Check, X, Crown, Zap, Star, Shield, ChevronRight, CreditCard, Lock,
  Smartphone, Globe, Building2, Leaf, TrendingUp, DollarSign, Users,
  BarChart3, Calendar, RefreshCw, CheckCircle, Clock, AlertTriangle
} from "lucide-react";
import { useAuth, PLAN_LABEL, PLAN_COLOR, PLAN_ICON, PLAN_PRECIOS, type PlanId, type WompiPayment } from "@/lib/auth";

const PLANES = [
  {
    id: "basico" as PlanId,
    nombre: "Básico",
    subtitle: "Para fincas pequeñas",
    precio: 0,
    precioAnual: 0,
    colorFrom: "#334155", colorTo: "#1e293b",
    border: "rgba(100,116,139,0.4)",
    highlight: false,
    badge: null,
    icon: <Leaf className="w-5 h-5" />,
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
    id: "pro" as PlanId,
    nombre: "PRO",
    subtitle: "Para ganaderos activos",
    precio: 89000,
    precioAnual: 75000,
    colorFrom: "#065f46", colorTo: "#0d2137",
    border: "rgba(0,245,212,0.45)",
    highlight: true,
    badge: "Más popular",
    icon: <Zap className="w-5 h-5" />,
    features: [
      { label: "Hasta 300 animales", ok: true },
      { label: "Dashboard PRO completo", ok: true },
      { label: "Todos los módulos base", ok: true },
      { label: "Hasta 5 usuarios", ok: true },
      { label: "Pesaje Bluetooth BT ⚡", ok: true },
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
    id: "premium" as PlanId,
    nombre: "Premium",
    subtitle: "Operaciones medianas",
    precio: 189000,
    precioAnual: 159000,
    colorFrom: "#4c1d95", colorTo: "#1e1b4b",
    border: "rgba(167,139,250,0.45)",
    highlight: false,
    badge: "Recomendado",
    icon: <Star className="w-5 h-5" />,
    features: [
      { label: "Hasta 1.000 animales", ok: true },
      { label: "Dashboard PRO + widgets IA", ok: true },
      { label: "Todos los módulos activos", ok: true },
      { label: "Hasta 15 usuarios", ok: true },
      { label: "Pesaje BT ilimitado ⚡", ok: true },
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
    id: "platino" as PlanId,
    nombre: "Platino",
    subtitle: "Empresas y haciendas",
    precio: 399000,
    precioAnual: 329000,
    colorFrom: "#78350f", colorTo: "#1c0a00",
    border: "rgba(251,191,36,0.5)",
    highlight: false,
    badge: "Empresarial",
    icon: <Crown className="w-5 h-5" />,
    features: [
      { label: "Animales ilimitados", ok: true },
      { label: "Dashboard empresarial + API", ok: true },
      { label: "Todos los módulos + API REST", ok: true },
      { label: "Usuarios ilimitados", ok: true },
      { label: "Pesaje BT ilimitado + IA ⚡", ok: true },
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

function fmt(n: number) {
  return n === 0 ? "Gratis" : "$" + n.toLocaleString("es-CO") + " COP/mes";
}

/* ─── Wompi Checkout ──────────────────────────────────────────────────────── */
function WompiCheckout({ plan, onClose }: { plan: typeof PLANES[0]; onClose: () => void }) {
  const { user, activatePlan } = useAuth();
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [form, setForm] = useState({
    nombre: user?.nombre || "",
    email: user?.email || "",
    telefono: "",
    nit: "",
    pago: "tarjeta",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pagRef, setPagRef] = useState("");

  if (plan.precio === 0) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = "Nombre requerido";
    if (!form.email.includes("@")) e.email = "Email inválido";
    if (form.telefono.replace(/\D/g, "").length < 10) e.telefono = "Teléfono requerido (10 dígitos)";
    if (form.pago === "tarjeta") {
      if (form.cardNumber.replace(/\s/g, "").length < 15) e.cardNumber = "Número inválido";
      if (!form.cardExpiry.includes("/")) e.cardExpiry = "Formato MM/AA";
      if (form.cardCvv.length < 3) e.cardCvv = "CVV requerido";
    }
    return e;
  };

  const handlePay = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep("processing");
    const ref = `WMP${Date.now()}`;
    setPagRef(ref);
    setTimeout(() => {
      if (user) {
        activatePlan(user.id, plan.id, {
          userId: user.id,
          userNombre: form.nombre,
          userEmail: form.email,
          plan: plan.id,
          monto: plan.precio,
          moneda: 'COP',
          metodo: form.pago as WompiPayment['metodo'],
          referencia: ref,
          estado: 'aprobado',
          telefono: form.telefono,
          nit: form.nit,
        });
      }
      setStep("success");
    }, 2800);
  };

  /* ── Success ── */
  if (step === "success") {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ background: 'rgba(45,122,79,0.18)', border: '2px solid rgba(0,245,212,0.5)', boxShadow: '0 0 30px rgba(0,245,212,0.15)' }}>
          <CheckCircle className="w-10 h-10" style={{ color: '#00f5d4' }} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white mb-1">¡Pago Aprobado!</h3>
          <p className="text-white/60 text-sm">Plan <strong style={{ color: PLAN_COLOR[plan.id] }}>{PLAN_ICON[plan.id]} {plan.nombre}</strong> activado en tu cuenta</p>
        </div>
        <div className="rounded-xl p-4 text-left space-y-2 text-sm"
          style={{ background: 'rgba(0,245,212,0.07)', border: '1px solid rgba(0,245,212,0.2)' }}>
          <div className="flex justify-between"><span className="text-white/50">Referencia:</span><span className="font-mono font-bold text-white">{pagRef}</span></div>
          <div className="flex justify-between"><span className="text-white/50">Plan:</span><span className="font-bold" style={{ color: PLAN_COLOR[plan.id] }}>{plan.nombre}</span></div>
          <div className="flex justify-between"><span className="text-white/50">Monto:</span><span className="font-bold text-white">${plan.precio.toLocaleString('es-CO')} COP</span></div>
          <div className="flex justify-between"><span className="text-white/50">Método:</span><span className="capitalize text-white">{form.pago}</span></div>
          <div className="flex justify-between"><span className="text-white/50">Factura DIAN:</span><span style={{ color: '#39ff7e' }}>Enviada a {form.email}</span></div>
        </div>
        <p className="text-xs text-white/40">La suscripción se renueva automáticamente cada mes. Puedes cancelar desde Configuración.</p>
        <button onClick={onClose}
          className="w-full py-3 rounded-2xl font-bold text-sm text-black transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#00f5d4,#00c8a0)' }}>
          Continuar al sistema ✓
        </button>
      </div>
    );
  }

  /* ── Processing ── */
  if (step === "processing") {
    return (
      <div className="text-center py-14 space-y-4">
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-[#00f5d4] animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-white/5 border-t-[#39ff7e] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
        </div>
        <div>
          <p className="text-white font-black text-lg">Procesando pago...</p>
          <p className="text-white/45 text-sm mt-1">Conectando con Wompi · Bancolombia Colombia</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-[#00f5d4]" />
          <span className="text-xs text-[#00f5d4]">Transacción cifrada SSL 256-bit</span>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="space-y-4">
      {/* Resumen plan */}
      <div className="rounded-2xl p-4"
        style={{ background: `linear-gradient(135deg,${plan.colorFrom}80,${plan.colorTo}80)`, border: `1px solid ${plan.border}` }}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white font-black text-lg flex items-center gap-2">
              {PLAN_ICON[plan.id]} {plan.nombre}
            </p>
            <p className="text-white/60 text-xs">{plan.subtitle}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-white">${plan.precio.toLocaleString('es-CO')}</p>
            <p className="text-xs text-white/40">COP/mes · IVA incl.</p>
          </div>
        </div>
      </div>

      {/* Datos del cliente */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { k: 'nombre', label: 'Nombre completo *', ph: 'Juan García', half: false },
          { k: 'email', label: 'Correo electrónico *', ph: 'correo@finca.co', half: false },
          { k: 'telefono', label: 'Celular *', ph: '3001234567', half: true },
          { k: 'nit', label: 'NIT / Cédula', ph: '900123456-7', half: true },
        ].map(f => (
          <div key={f.k} className={f.half ? '' : 'col-span-2'}>
            <label className="text-xs text-white/55 block mb-1">{f.label}</label>
            <input
              value={(form as any)[f.k]}
              onChange={e => setForm({ ...form, [f.k]: e.target.value })}
              className="w-full px-3 py-2 text-white text-sm placeholder:text-white/25 outline-none"
              style={{
                background: 'rgba(13,33,55,0.8)',
                border: `1px solid ${(errors as any)[f.k] ? 'rgba(248,113,113,0.5)' : 'rgba(0,245,212,0.18)'}`,
                borderRadius: 12,
              }}
              placeholder={f.ph}
            />
            {(errors as any)[f.k] && <p className="text-red-400 text-[10px] mt-0.5">{(errors as any)[f.k]}</p>}
          </div>
        ))}
      </div>

      {/* Método de pago */}
      <div>
        <label className="text-xs text-white/55 block mb-2">Método de pago</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "tarjeta",     label: "Tarjeta",     emoji: "💳" },
            { id: "nequi",       label: "Nequi",       emoji: "📱" },
            { id: "pse",         label: "PSE",         emoji: "🏛" },
            { id: "bancolombia", label: "Bancolombia", emoji: "🏦" },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setForm({ ...form, pago: m.id })}
              className="flex flex-col items-center gap-1 p-2.5 text-xs font-semibold transition-all"
              style={{
                borderRadius: 12,
                border: `1px solid ${form.pago === m.id ? 'rgba(0,245,212,0.55)' : 'rgba(255,255,255,0.12)'}`,
                background: form.pago === m.id ? 'rgba(0,245,212,0.12)' : 'rgba(255,255,255,0.04)',
                color: form.pago === m.id ? '#00f5d4' : 'rgba(255,255,255,0.5)',
                boxShadow: form.pago === m.id ? '0 0 14px rgba(0,245,212,0.15)' : 'none',
              }}
            >
              <span className="text-lg">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campos tarjeta */}
      {form.pago === "tarjeta" && (
        <div className="space-y-3 p-3 rounded-2xl" style={{ background: 'rgba(13,33,55,0.6)', border: '1px solid rgba(0,245,212,0.1)' }}>
          <div>
            <label className="text-xs text-white/55 block mb-1">Número de tarjeta</label>
            <input
              value={form.cardNumber}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                setForm({ ...form, cardNumber: v.replace(/(.{4})/g, '$1 ').trim() });
              }}
              className="w-full px-3 py-2 text-white text-sm font-mono placeholder:text-white/25 outline-none"
              style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${errors.cardNumber ? 'rgba(248,113,113,0.5)' : 'rgba(0,245,212,0.18)'}`, borderRadius: 10 }}
              placeholder="4242 4242 4242 4242"
              maxLength={19}
            />
            {errors.cardNumber && <p className="text-red-400 text-[10px] mt-0.5">{errors.cardNumber}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/55 block mb-1">Vencimiento</label>
              <input
                value={form.cardExpiry}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                  setForm({ ...form, cardExpiry: v });
                }}
                className="w-full px-3 py-2 text-white text-sm font-mono placeholder:text-white/25 outline-none"
                style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${errors.cardExpiry ? 'rgba(248,113,113,0.5)' : 'rgba(0,245,212,0.18)'}`, borderRadius: 10 }}
                placeholder="MM/AA"
                maxLength={5}
              />
              {errors.cardExpiry && <p className="text-red-400 text-[10px] mt-0.5">{errors.cardExpiry}</p>}
            </div>
            <div>
              <label className="text-xs text-white/55 block mb-1">CVV</label>
              <input
                value={form.cardCvv}
                onChange={e => setForm({ ...form, cardCvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                className="w-full px-3 py-2 text-white text-sm font-mono placeholder:text-white/25 outline-none"
                style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${errors.cardCvv ? 'rgba(248,113,113,0.5)' : 'rgba(0,245,212,0.18)'}`, borderRadius: 10 }}
                placeholder="•••"
                maxLength={4}
                type="password"
              />
              {errors.cardCvv && <p className="text-red-400 text-[10px] mt-0.5">{errors.cardCvv}</p>}
            </div>
          </div>
        </div>
      )}

      {form.pago === "nequi" && (
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.25)' }}>
          <p className="font-bold text-pink-300">📱 Pago con Nequi</p>
          <p className="text-white/50 text-xs mt-1">Al confirmar, recibirás una notificación push en tu app Nequi al número registrado.</p>
        </div>
      )}
      {form.pago === "pse" && (
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <p className="font-bold text-blue-300">🏛 Débito PSE</p>
          <p className="text-white/50 text-xs mt-1">Serás redirigido al portal de tu banco para autorizar el débito.</p>
        </div>
      )}
      {form.pago === "bancolombia" && (
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}>
          <p className="font-bold text-yellow-300">🏦 Botón Bancolombia</p>
          <p className="text-white/50 text-xs mt-1">Paga directo desde tu app Bancolombia o sucursal virtual.</p>
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-white/45">
        <Lock className="w-3 h-3 mt-0.5 text-[#00f5d4] flex-shrink-0" />
        <span>Pago seguro procesado por <strong className="text-white/75">Wompi — Bancolombia</strong>. No almacenamos datos de tarjetas. Cifrado SSL 256-bit.</span>
      </div>

      <button
        onClick={handlePay}
        className="w-full py-3.5 rounded-2xl font-black text-sm text-black transition-all flex items-center justify-center gap-2 hover:opacity-90"
        style={{ background: `linear-gradient(135deg,${plan.colorFrom === '#065f46' ? '#00f5d4' : plan.colorFrom === '#4c1d95' ? '#a78bfa' : plan.colorFrom === '#78350f' ? '#fbbf24' : '#94a3b8'},${plan.colorFrom === '#065f46' ? '#00c8a0' : plan.colorFrom === '#4c1d95' ? '#7c3aed' : plan.colorFrom === '#78350f' ? '#d97706' : '#64748b'})`, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
      >
        <Lock className="w-4 h-4" />
        Pagar ${plan.precio.toLocaleString('es-CO')} COP con Wompi
      </button>

      <div className="flex items-center justify-center gap-4 text-[10px] text-white/30">
        <span className="flex items-center gap-1"><Check className="w-2.5 h-2.5" />Cancela cuando quieras</span>
        <span className="flex items-center gap-1"><Shield className="w-2.5 h-2.5" />SSL 256-bit</span>
        <span className="flex items-center gap-1"><Check className="w-2.5 h-2.5" />Factura DIAN</span>
      </div>
    </div>
  );
}

/* ─── Panel Admin Wompi ───────────────────────────────────────────────────── */
function AdminWompiPanel() {
  const { wompiPayments, accounts } = useAuth();

  const totalCOP = wompiPayments
    .filter(p => p.estado === 'aprobado')
    .reduce((s, p) => s + p.monto, 0);

  const byPlan = (['pro', 'premium', 'platino'] as PlanId[]).map(pid => ({
    plan: pid,
    count: wompiPayments.filter(p => p.plan === pid && p.estado === 'aprobado').length,
    total: wompiPayments.filter(p => p.plan === pid && p.estado === 'aprobado').reduce((s, p) => s + p.monto, 0),
  }));

  const suscriptores = accounts.filter(a => a.plan && a.plan !== 'basico' && a.activo !== false);

  return (
    <div className="space-y-5">
      {/* Header admin */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#071325,#0d2137)', border: '1px solid rgba(251,191,36,0.35)', boxShadow: '0 0 40px rgba(251,191,36,0.06)' }}>
        <div className="absolute right-0 top-0 w-48 h-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at right, #fbbf24, transparent 70%)' }} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)' }}>
            👑
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Panel Admin — Wompi Pagos</h2>
            <p className="text-sm" style={{ color: 'rgba(251,191,36,0.7)' }}>
              admin@ganader.ia · Cuenta receptora de pagos CIVAC PRO Colombia
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Ingresos totales', value: `$${totalCOP.toLocaleString('es-CO')}`, sub: 'COP aprobados', color: '#00f5d4', emoji: '💰' },
          { label: 'Pagos aprobados', value: wompiPayments.filter(p => p.estado === 'aprobado').length, sub: 'transacciones', color: '#39ff7e', emoji: '✅' },
          { label: 'Suscriptores activos', value: suscriptores.length, sub: 'usuarios con plan', color: '#fbbf24', emoji: '👥' },
          { label: 'Ticket promedio', value: wompiPayments.length > 0 ? `$${Math.round(totalCOP / Math.max(wompiPayments.filter(p=>p.estado==='aprobado').length,1)).toLocaleString('es-CO')}` : '$0', sub: 'COP por pago', color: '#a78bfa', emoji: '📊' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-4 kpi-card"
            style={{ background: 'rgba(13,33,55,0.8)', border: `1px solid ${k.color}25` }}>
            <div className="text-2xl mb-1">{k.emoji}</div>
            <div className="font-black text-xl" style={{ color: k.color }}>{k.value}</div>
            <div className="text-[10px] text-white/30 mt-0.5">{k.label}</div>
            <div className="text-[9px] text-white/20">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Por plan */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider"
          style={{ background: 'rgba(13,33,55,0.8)', color: 'rgba(255,255,255,0.4)' }}>
          Ingresos por plan
        </div>
        {byPlan.map(b => (
          <div key={b.plan} className="px-4 py-3 flex items-center gap-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: `${PLAN_COLOR[b.plan]}15`, border: `1px solid ${PLAN_COLOR[b.plan]}30` }}>
              {PLAN_ICON[b.plan]}
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-white">{PLAN_LABEL[b.plan]}</div>
              <div className="text-[10px] text-white/35">{b.count} suscriptor{b.count !== 1 ? 'es' : ''} · ${PLAN_PRECIOS[b.plan].toLocaleString('es-CO')} COP/mes c/u</div>
            </div>
            <div className="text-right">
              <div className="font-black text-base" style={{ color: PLAN_COLOR[b.plan] }}>${b.total.toLocaleString('es-CO')}</div>
              <div className="text-[9px] text-white/30">COP recibidos</div>
            </div>
          </div>
        ))}
      </div>

      {/* Suscriptores */}
      {suscriptores.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider"
            style={{ background: 'rgba(13,33,55,0.8)', color: 'rgba(255,255,255,0.4)' }}>
            Suscriptores activos ({suscriptores.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[540px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Usuario', 'Email', 'Plan', 'Activado', 'Vence', 'Ref. Wompi'].map(h => (
                    <th key={h} className="text-left py-2.5 px-4 font-bold uppercase text-[10px] tracking-wide" style={{ color: 'rgba(255,255,255,0.25)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suscriptores.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="py-2.5 px-4 font-bold text-white">{a.nombre}</td>
                    <td className="py-2.5 px-4 font-mono" style={{ color: '#00c8ff' }}>{a.email}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: `${PLAN_COLOR[a.plan!]}18`, color: PLAN_COLOR[a.plan!], border: `1px solid ${PLAN_COLOR[a.plan!]}30` }}>
                        {PLAN_ICON[a.plan!]} {PLAN_LABEL[a.plan!]}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-white/40">{a.planActivadoEn || '—'}</td>
                    <td className="py-2.5 px-4 text-white/40">{a.planExpiry || '—'}</td>
                    <td className="py-2.5 px-4 font-mono" style={{ color: '#fbbf24', fontSize: 10 }}>{a.wompiRef || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historial de pagos */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-between"
          style={{ background: 'rgba(13,33,55,0.8)', color: 'rgba(255,255,255,0.4)' }}>
          <span>Historial de transacciones Wompi</span>
          <span style={{ color: '#00f5d4' }}>{wompiPayments.length} pagos</span>
        </div>
        {wompiPayments.length === 0 ? (
          <div className="text-center py-10 text-white/30">
            <DollarSign size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">Sin pagos registrados aún</p>
            <p className="text-xs mt-1">Los pagos aparecerán aquí cuando los usuarios compren un plan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[640px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Referencia', 'Usuario', 'Plan', 'Monto', 'Método', 'Estado', 'Fecha/Hora'].map(h => (
                    <th key={h} className="text-left py-2.5 px-4 font-bold uppercase text-[10px] tracking-wide" style={{ color: 'rgba(255,255,255,0.25)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wompiPayments.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="py-2.5 px-4 font-mono font-bold" style={{ color: '#fbbf24', fontSize: 10 }}>{p.id}</td>
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-white">{p.userNombre}</div>
                      <div className="text-[10px] text-white/35">{p.userEmail}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: `${PLAN_COLOR[p.plan]}18`, color: PLAN_COLOR[p.plan] }}>
                        {PLAN_ICON[p.plan]} {PLAN_LABEL[p.plan]}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-black" style={{ color: '#39ff7e' }}>${p.monto.toLocaleString('es-CO')}</td>
                    <td className="py-2.5 px-4 capitalize text-white/55">{p.metodo}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          background: p.estado === 'aprobado' ? 'rgba(57,255,126,0.12)' : p.estado === 'pendiente' ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)',
                          color: p.estado === 'aprobado' ? '#39ff7e' : p.estado === 'pendiente' ? '#fbbf24' : '#f87171',
                        }}>
                        {p.estado === 'aprobado' ? '✓ Aprobado' : p.estado === 'pendiente' ? '⏳ Pendiente' : '✗ Rechazado'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-white/40">{p.fecha} · {p.hora}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Página principal Planes ─────────────────────────────────────────────── */
export default function Planes() {
  const [period, setPeriod] = useState<"mensual" | "anual">("mensual");
  const [checkout, setCheckout] = useState<typeof PLANES[0] | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [tab, setTab] = useState<'planes' | 'admin'>('planes');

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#071325,#0d2137 50%,#0a1c38)', border: '1px solid rgba(0,245,212,0.2)', boxShadow: '0 0 60px rgba(0,245,212,0.05)' }}>
        <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at right, #00f5d4, transparent 70%)' }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 text-xs font-bold rounded-full"
            style={{ background: 'rgba(0,245,212,0.1)', border: '1px solid rgba(0,245,212,0.25)', color: '#00f5d4' }}>
            <Crown className="w-3.5 h-3.5" /> Planes y Precios · Wompi Colombia
          </div>
          <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Sora',sans-serif" }}>
            Elige tu plan GanaderIA
          </h1>
          <p className="text-sm max-w-xl" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Facturación en pesos colombianos (COP) · IVA incluido · Sin permanencia mínima · 14 días gratis
          </p>

          {/* Plan actual del usuario */}
          {user?.plan && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold"
              style={{ background: `${PLAN_COLOR[user.plan]}15`, border: `1px solid ${PLAN_COLOR[user.plan]}35`, color: PLAN_COLOR[user.plan] }}>
              {PLAN_ICON[user.plan]} Tu plan actual: {PLAN_LABEL[user.plan]}
              {user.planExpiry && <span className="text-xs font-normal opacity-60">· vence {user.planExpiry}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Tabs admin */}
      {isAdmin && (
        <div className="flex gap-2">
          {[
            { id: 'planes', label: '📋 Planes', },
            { id: 'admin', label: '👑 Panel Admin Wompi', },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={tab === t.id
                ? { background: 'rgba(0,245,212,0.12)', border: '1px solid rgba(0,245,212,0.35)', color: '#00f5d4' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === 'admin' && isAdmin ? <AdminWompiPanel /> : (
        <>
          {/* Toggle mensual/anual */}
          <div className="flex items-center justify-center gap-2">
            {(['mensual', 'anual'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                style={period === p
                  ? { background: 'rgba(0,245,212,0.12)', border: '1px solid rgba(0,245,212,0.35)', color: '#00f5d4' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
                {p === 'mensual' ? 'Mensual' : 'Anual'}
                {p === 'anual' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black text-black" style={{ background: '#39ff7e' }}>-16%</span>
                )}
              </button>
            ))}
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {PLANES.map(plan => {
              const isCurrentPlan = user?.plan === plan.id;
              return (
                <div key={plan.id}
                  className={`relative flex flex-col overflow-hidden transition-all duration-200 ${plan.highlight ? 'scale-[1.02]' : ''}`}
                  style={{
                    borderRadius: 20,
                    border: `2px solid ${plan.border}`,
                    background: `linear-gradient(160deg,${plan.colorFrom}55,${plan.colorTo}88)`,
                    boxShadow: plan.highlight ? `0 0 40px rgba(0,245,212,0.12), 0 12px 40px rgba(0,0,0,0.4)` : '0 4px 24px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(10px)',
                  }}>
                  {plan.badge && (
                    <div className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full text-white"
                      style={{ background: `linear-gradient(135deg,${plan.colorFrom},${plan.colorTo === '#0d2137' ? '#00c896' : plan.colorTo})` }}>
                      {plan.badge}
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute top-3 left-3 text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,245,212,0.2)', color: '#00f5d4', border: '1px solid rgba(0,245,212,0.4)' }}>
                      ✓ Actual
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3"
                      style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-black text-white">{plan.nombre}</h3>
                    <p className="text-white/55 text-xs">{plan.subtitle}</p>
                    <div className="mt-3">
                      <span className="text-3xl font-black text-white">
                        {plan.precio === 0 ? "Gratis" : "$" + (period === "anual" ? plan.precioAnual : plan.precio).toLocaleString("es-CO")}
                      </span>
                      {plan.precio > 0 && <span className="text-white/45 text-xs ml-1">COP/mes</span>}
                    </div>
                    {plan.precio > 0 && period === "anual" && (
                      <p className="text-[10px] mt-0.5" style={{ color: '#39ff7e' }}>
                        Ahorrás ${((plan.precio - plan.precioAnual) * 12).toLocaleString("es-CO")}/año
                      </p>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <ul className="space-y-2 flex-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className={`flex items-start gap-2 text-xs ${f.ok ? 'text-white/80' : 'text-white/25 line-through'}`}>
                          {f.ok
                            ? <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#00f5d4' }} />
                            : <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-40" />
                          }
                          {f.label}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => plan.precio > 0 && !isCurrentPlan ? setCheckout(plan) : undefined}
                      className="mt-5 w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2"
                      style={{
                        background: isCurrentPlan
                          ? 'rgba(0,245,212,0.1)'
                          : plan.precio === 0
                            ? 'rgba(255,255,255,0.08)'
                            : `linear-gradient(135deg,${plan.colorFrom === '#065f46' ? '#00f5d4,#00c8a0' : plan.colorFrom === '#4c1d95' ? '#a78bfa,#7c3aed' : plan.colorFrom === '#78350f' ? '#fbbf24,#d97706' : '#94a3b8,#64748b'})`,
                        color: isCurrentPlan ? '#00f5d4' : plan.precio === 0 ? 'rgba(255,255,255,0.5)' : '#000',
                        border: isCurrentPlan ? '1px solid rgba(0,245,212,0.3)' : 'none',
                        borderRadius: 12,
                      }}
                    >
                      {isCurrentPlan ? '✓ Plan activo' : plan.precio === 0 ? 'Plan Gratuito' : <>Suscribirse <ChevronRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust badges */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(13,33,55,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-white/50">Pago 100% seguro procesado por</p>
              <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
                {[
                  { label: '🏦 Wompi · Bancolombia', c: 'rgba(234,179,8,0.15)', tc: '#fbbf24', bc: 'rgba(234,179,8,0.3)' },
                  { label: '🔒 SSL 256-bit',          c: 'rgba(59,130,246,0.1)',  tc: '#60a5fa', bc: 'rgba(59,130,246,0.25)' },
                  { label: '📱 Nequi',                c: 'rgba(236,72,153,0.1)', tc: '#f472b6', bc: 'rgba(236,72,153,0.25)' },
                  { label: '🏛 PSE',                  c: 'rgba(100,116,139,0.1)',tc: '#94a3b8', bc: 'rgba(100,116,139,0.25)' },
                ].map(b => (
                  <div key={b.label} className="font-bold px-4 py-2 text-sm"
                    style={{ background: b.c, color: b.tc, border: `1px solid ${b.bc}`, borderRadius: 12 }}>
                    {b.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                { icon: '🔐', title: 'Datos cifrados',     desc: 'Encriptación AES-256' },
                { icon: '📄', title: 'Factura DIAN',       desc: 'Factura electrónica incluida' },
                { icon: '↩',  title: 'Cancela cuando quieras', desc: 'Sin permanencia mínima' },
                { icon: '🇨🇴', title: 'Precios en COP',    desc: 'IVA incluido · Régimen común' },
              ].map(b => (
                <div key={b.title} className="text-center">
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <p className="text-xs font-semibold text-white/70">{b.title}</p>
                  <p className="text-[10px] text-white/35">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(13,33,55,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="font-black text-lg text-white mb-4">Preguntas frecuentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { q: '¿Puedo cambiar de plan?',     a: 'Sí, en cualquier momento. El cambio se refleja de forma inmediata y se prorratea el cobro.' },
                { q: '¿Cómo cancelo?',               a: 'Desde Configuración → Plan → Cancelar suscripción. Tus datos se conservan 30 días.' },
                { q: '¿Hay versión de prueba?',      a: 'El plan Básico es siempre gratis. Los planes de pago tienen 14 días de prueba sin cargo.' },
                { q: '¿Facturas electrónicas?',      a: 'Sí, emitimos factura electrónica DIAN automáticamente por cada cobro realizado.' },
                { q: '¿Dónde van los pagos?',        a: 'Los pagos van directamente a la cuenta bancaria de CIVAC registrada en Wompi Colombia.' },
                { q: '¿El pesaje BT necesita plan?', a: 'Pesaje Rápido básico es gratis. Para báscula BT real con historial completo se requiere plan PRO o superior.' },
              ].map(f => (
                <div key={f.q} className="p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
                  <p className="font-bold text-sm text-white mb-1">{f.q}</p>
                  <p className="text-xs text-white/45">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Checkout modal */}
      {checkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-lg shadow-2xl overflow-hidden"
            style={{
              borderRadius: 24,
              background: 'linear-gradient(160deg,#071325,#0d2137)',
              border: `1px solid ${checkout.border}`,
              maxHeight: '90vh',
            }}>
            {/* Modal header */}
            <div className="px-6 py-4 flex items-center justify-between border-b"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: `linear-gradient(135deg,${checkout.colorFrom}80,${checkout.colorTo}80)` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  {checkout.icon}
                </div>
                <div>
                  <p className="font-black text-white">Plan {checkout.nombre}</p>
                  <p className="text-white/55 text-xs flex items-center gap-1"><Lock className="w-3 h-3" /> Pago seguro · Wompi Colombia</p>
                </div>
              </div>
              <button onClick={() => setCheckout(null)} className="text-white/50 hover:text-white text-2xl font-bold transition-colors">✕</button>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <WompiCheckout plan={checkout} onClose={() => setCheckout(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
