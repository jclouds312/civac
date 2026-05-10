import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import {
  Check, X, Crown, Star, Zap, Shield, Users, Leaf, Globe,
  ChevronDown, ChevronRight, Smartphone, Wifi, BarChart3,
  MessageSquare, BookOpen, Download, Headphones, Clock,
  Building2, ArrowRight, Sparkles, CreditCard
} from "lucide-react";

const fmt = (n: number) =>
  n === 0
    ? "Gratis"
    : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

const PLANES = [
  {
    id: "basico",
    nombre: "Básico",
    subtitulo: "Para pequeños productores",
    icon: Leaf,
    gradient: "from-slate-700 to-slate-900",
    accentText: "text-slate-300",
    accentBg: "bg-slate-500/20",
    accentBorder: "border-slate-500/30",
    ringColor: "ring-slate-500/30",
    precio: { mensual: 0, anual: 0 },
    popular: false,
    descripcion: "Digitaliza tu finca sin costo. Módulos esenciales para comenzar tu gestión ganadera.",
    animales: "Hasta 50",
    fincas: "1 finca",
    soporte: "Comunidad",
    features: [
      { label: "Hasta 50 animales", ok: true },
      { label: "1 finca registrada", ok: true },
      { label: "Tablero KPIs básico", ok: true },
      { label: "Inventario de animales", ok: true },
      { label: "Registro de producción", ok: true },
      { label: "Potreros (hasta 5)", ok: true },
      { label: "Alertas simples", ok: true },
      { label: "Insumos / Kardex", ok: true },
      { label: "PWA offline incluida", ok: true },
      { label: "Ficha individual por animal", ok: false },
      { label: "Reproducción y partos", ok: false },
      { label: "Genética y DEP", ok: false },
      { label: "Básculas y Pesaje avanzado", ok: false },
      { label: "Alimentación y raciones", ok: false },
      { label: "Semen y embriones", ok: false },
      { label: "Costos y P&G financiero", ok: false },
      { label: "Personal / Nómina", ok: false },
      { label: "Predicciones IA 12 meses", ok: false },
      { label: "Huella de Carbono CO₂", ok: false },
      { label: "Multi-Finca", ok: false },
      { label: "Exportación CSV / PDF", ok: false },
      { label: "API REST + Webhooks", ok: false },
    ],
  },
  {
    id: "profesional",
    nombre: "Profesional",
    subtitulo: "Para ganaderos medianos",
    icon: Star,
    gradient: "from-emerald-600 to-emerald-900",
    accentText: "text-emerald-300",
    accentBg: "bg-emerald-500/20",
    accentBorder: "border-emerald-500/40",
    ringColor: "ring-emerald-500/40",
    precio: { mensual: 149000, anual: 119000 },
    popular: true,
    descripcion: "Gestión completa del hato con IA, genética, reproducción y análisis financiero.",
    animales: "Hasta 200",
    fincas: "2 fincas",
    soporte: "Email 24h",
    features: [
      { label: "Hasta 200 animales", ok: true },
      { label: "2 fincas incluidas", ok: true },
      { label: "Tablero KPIs avanzado", ok: true },
      { label: "Inventario completo (RFID)", ok: true },
      { label: "Producción lechera 3 turnos", ok: true },
      { label: "Potreros ilimitados", ok: true },
      { label: "Alertas inteligentes", ok: true },
      { label: "Insumos / Kardex completo", ok: true },
      { label: "PWA offline incluida", ok: true },
      { label: "Ficha individual por animal", ok: true },
      { label: "Reproducción y partos", ok: true },
      { label: "Genética y DEP completo", ok: true },
      { label: "Básculas y Pesaje avanzado", ok: true },
      { label: "Alimentación y raciones", ok: true },
      { label: "Semen y embriones", ok: true },
      { label: "Costos y P&G financiero", ok: true },
      { label: "Personal / Nómina", ok: true },
      { label: "Predicciones IA 12 meses", ok: true },
      { label: "Huella de Carbono CO₂", ok: true },
      { label: "Multi-Finca (2 predios)", ok: true },
      { label: "Exportación CSV / PDF", ok: true },
      { label: "API REST + Webhooks", ok: false },
    ],
  },
  {
    id: "empresarial",
    nombre: "Empresarial",
    subtitulo: "Para agroempresas",
    icon: Crown,
    gradient: "from-purple-700 to-purple-950",
    accentText: "text-purple-300",
    accentBg: "bg-purple-500/20",
    accentBorder: "border-purple-500/40",
    ringColor: "ring-purple-500/40",
    precio: { mensual: 399000, anual: 319000 },
    popular: false,
    descripcion: "Escala sin límites. API, fincas ilimitadas, soporte prioritario y onboarding personalizado.",
    animales: "Ilimitados",
    fincas: "Sin límite",
    soporte: "WhatsApp VIP",
    features: [
      { label: "Animales ilimitados", ok: true },
      { label: "Fincas ilimitadas", ok: true },
      { label: "Todos los módulos Profesional", ok: true },
      { label: "Multi-Finca ilimitada", ok: true },
      { label: "Dashboard ejecutivo consolidado", ok: true },
      { label: "API REST + Webhooks completa", ok: true },
      { label: "Integración báscula IoT/Bluetooth", ok: true },
      { label: "Usuarios ilimitados por finca", ok: true },
      { label: "Reportes automáticos mensuales", ok: true },
      { label: "Exportación Excel + PDF avanzado", ok: true },
      { label: "SLA 99.9% uptime garantizado", ok: true },
      { label: "Soporte WhatsApp prioritario", ok: true },
      { label: "Onboarding personalizado (4h)", ok: true },
      { label: "Capacitación para su equipo", ok: true },
      { label: "Actualizaciones prioritarias", ok: true },
      { label: "Backup automático diario", ok: true },
      { label: "Personalización de logo/finca", ok: true },
    ],
  },
];

const TABLE_FEATURES = [
  { feature: "Animales registrados", basico: "50", profesional: "200", empresarial: "Ilimitados" },
  { feature: "Fincas simultáneas", basico: "1", profesional: "2", empresarial: "Ilimitadas" },
  { feature: "Inventario y RFID", basico: true, profesional: true, empresarial: true },
  { feature: "Producción lechera", basico: true, profesional: true, empresarial: true },
  { feature: "Alertas automáticas", basico: true, profesional: true, empresarial: true },
  { feature: "Potreros y rotación", basico: "5 máx", profesional: true, empresarial: true },
  { feature: "Insumos / Kardex", basico: true, profesional: true, empresarial: true },
  { feature: "PWA offline", basico: true, profesional: true, empresarial: true },
  { feature: "Ficha individual animal", basico: false, profesional: true, empresarial: true },
  { feature: "Reproducción y partos", basico: false, profesional: true, empresarial: true },
  { feature: "Genética y DEP", basico: false, profesional: true, empresarial: true },
  { feature: "Básculas y Pesaje", basico: false, profesional: true, empresarial: true },
  { feature: "Alimentación y raciones", basico: false, profesional: true, empresarial: true },
  { feature: "Semen y embriones", basico: false, profesional: true, empresarial: true },
  { feature: "Costos y P&G", basico: false, profesional: true, empresarial: true },
  { feature: "Personal / Nómina", basico: false, profesional: true, empresarial: true },
  { feature: "Predicciones IA (12M)", basico: false, profesional: true, empresarial: true },
  { feature: "Huella de Carbono CO₂", basico: false, profesional: true, empresarial: true },
  { feature: "Multi-Finca", basico: false, profesional: "2 fincas", empresarial: true },
  { feature: "Exportación CSV / PDF", basico: false, profesional: true, empresarial: true },
  { feature: "Exportación Excel avanzada", basico: false, profesional: false, empresarial: true },
  { feature: "API REST + Webhooks", basico: false, profesional: false, empresarial: true },
  { feature: "Integración báscula IoT", basico: false, profesional: false, empresarial: true },
  { feature: "Usuarios por finca", basico: "2", profesional: "5", empresarial: "Ilimitados" },
  { feature: "Onboarding / capacitación", basico: "Autoservicio", profesional: "Guiado", empresarial: "Personalizado" },
  { feature: "Soporte", basico: "Comunidad", profesional: "Email 24h", empresarial: "WhatsApp VIP" },
  { feature: "SLA garantizado", basico: false, profesional: "95%", empresarial: "99.9%" },
];

const FAQS = [
  {
    q: "¿Puedo cambiar de plan en cualquier momento?",
    a: "Sí. Puedes subir de plan inmediatamente y el acceso a los nuevos módulos se activa al instante. Al bajar de plan, conservas tus datos pero el acceso a los módulos superiores se suspende al final del período pagado.",
  },
  {
    q: "¿Qué pasa con mis datos si cancelo?",
    a: "Tus datos permanecen almacenados por 90 días después de cancelar. Durante ese período puedes exportarlos en CSV o JSON. Pasado ese tiempo se eliminan de forma permanente.",
  },
  {
    q: "¿El plan Básico es realmente gratis para siempre?",
    a: "Sí. El plan Básico no tiene vencimiento ni tarjeta de crédito requerida. Es nuestra manera de democratizar la gestión ganadera en Colombia.",
  },
  {
    q: "¿Qué forma de pago aceptan?",
    a: "Aceptamos transferencia bancaria PSE, tarjeta de crédito/débito (Visa, Mastercard, Amex) y pago en efectivo vía Efecty / Baloto para el mercado colombiano.",
  },
  {
    q: "¿El descuento anual aplica desde el primer mes?",
    a: "Sí. Al elegir facturación anual pagas el precio reducido desde el primer mes. El descuento es del 20% comparado con el precio mensual.",
  },
  {
    q: "¿Necesito instalar algo en mi computador?",
    a: "No. GanaderIA es 100% web. Funciona en cualquier navegador moderno (Chrome, Edge, Safari, Firefox). Además puede instalarse como app en tu celular/tableta mediante la función PWA, sin pasar por tiendas de apps.",
  },
  {
    q: "¿Hay descuentos para asociaciones o cooperativas ganaderas?",
    a: "Sí. Para organizaciones con más de 10 fincas afiliadas ofrecemos precios especiales y facturación centralizada. Contáctanos en ventas@ganader.ia",
  },
];

const TESTIMONIOS = [
  { nombre: "Pedro Hernández", cargo: "Propietario, 3 fincas · Boyacá", texto: "Con GanaderIA Empresarial coordinamos 3 predios desde el celular. El módulo de Multi-Finca nos ahorra 2 días de trabajo al mes.", plan: "Empresarial", avatar: "PH" },
  { nombre: "Dra. Luz Torres", cargo: "Médico veterinario · Cundinamarca", texto: "El módulo de Reproducción y Genética es el mejor que he visto en software ganadero nacional. Los DEP están bien implementados.", plan: "Profesional", avatar: "LT" },
  { nombre: "Carlos Meza", cargo: "Vaquero jefe · Finca El Rancho Verde", texto: "La app en el celular sin internet es lo mejor. Registro los pesos en el potrero y se sincroniza solo cuando tengo señal.", plan: "Básico", avatar: "CM" },
];

type PlanKey = "basico" | "profesional" | "empresarial";

function TableCell({ val }: { val: boolean | string }) {
  if (val === true)  return <Check size={16} className="text-emerald-400 mx-auto" />;
  if (val === false) return <X size={14} className="text-slate-600 mx-auto" />;
  return <span className="text-xs text-foreground font-medium">{val}</span>;
}

export default function Planes() {
  const { user } = useAuth();
  const [billing, setBilling] = useState<"mensual" | "anual">("mensual");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showFullTable, setShowFullTable] = useState(false);

  const planActual: PlanKey = user?.role === "admin" ? "empresarial" : user?.role === "vet" ? "profesional" : "basico";

  const visibleTable = showFullTable ? TABLE_FEATURES : TABLE_FEATURES.slice(0, 12);

  return (
    <div className="space-y-8 pb-12">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-8 shadow-2xl">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/70 mb-4">
            <Sparkles size={14} className="text-amber-400" />
            Escoge el plan ideal para tu finca
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Planes y Precios</h1>
          <p className="text-white/60 text-base mb-6 max-w-lg mx-auto">
            Desde el pequeño productor hasta la empresa agroindustrial. GanaderIA crece con tu finca.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-white/10 rounded-xl p-1 border border-white/15 gap-1">
            <button
              onClick={() => setBilling("mensual")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${billing === "mensual" ? "bg-white text-slate-900 shadow" : "text-white/60 hover:text-white"}`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling("anual")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${billing === "anual" ? "bg-white text-slate-900 shadow" : "text-white/60 hover:text-white"}`}
            >
              Anual
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Plan Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANES.map(plan => {
          const PlanIcon = plan.icon;
          const precioMostrar = billing === "anual" ? plan.precio.anual : plan.precio.mensual;
          const isCurrent = planActual === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col ${
                plan.popular
                  ? "border-emerald-500/50 ring-2 ring-emerald-500/20 scale-[1.02] shadow-xl shadow-emerald-900/30"
                  : "border-border hover:border-border/80"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Star size={9} className="fill-white" /> MÁS POPULAR
                  </span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/30 backdrop-blur-sm">
                    Plan actual
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className={`bg-gradient-to-br ${plan.gradient} p-6 text-white`}>
                <div className={`w-10 h-10 ${plan.accentBg} border ${plan.accentBorder} rounded-xl flex items-center justify-center mb-3`}>
                  <PlanIcon size={20} className={plan.accentText} />
                </div>
                <h3 className="font-bold text-xl mb-0.5">{plan.nombre}</h3>
                <p className="text-white/60 text-xs mb-4">{plan.subtitulo}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold">{fmt(precioMostrar)}</span>
                  {precioMostrar > 0 && <span className="text-white/50 text-sm">/mes</span>}
                </div>
                {billing === "anual" && precioMostrar > 0 && (
                  <p className="text-white/50 text-[11px] mt-1">
                    Facturado anualmente · {fmt(precioMostrar * 12)}/año
                  </p>
                )}
                <p className="text-white/60 text-xs mt-3 leading-relaxed">{plan.descripcion}</p>
              </div>

              {/* Plan body */}
              <div className="bg-card flex-1 p-5 flex flex-col">
                <div className="grid grid-cols-3 gap-2 mb-5 pb-4 border-b border-border">
                  {[
                    { label: "Animales", val: plan.animales },
                    { label: "Fincas", val: plan.fincas },
                    { label: "Soporte", val: plan.soporte },
                  ].map(s => (
                    <div key={s.label} className="text-center bg-muted/20 rounded-lg py-2 px-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold mb-0.5">{s.label}</div>
                      <div className="text-[11px] font-semibold text-foreground leading-tight">{s.val}</div>
                    </div>
                  ))}
                </div>

                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.slice(0, 12).map((f, i) => (
                    <li key={i} className={`flex items-center gap-2 text-xs ${f.ok ? "text-foreground" : "text-muted-foreground/40"}`}>
                      {f.ok
                        ? <Check size={13} className="text-emerald-400 flex-shrink-0" />
                        : <X size={12} className="text-slate-600 flex-shrink-0" />
                      }
                      {f.label}
                    </li>
                  ))}
                  {plan.features.length > 12 && (
                    <li className="text-xs text-muted-foreground pl-5">+{plan.features.length - 12} características más...</li>
                  )}
                </ul>

                <button className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isCurrent
                    ? "bg-muted/40 text-muted-foreground cursor-default border border-border"
                    : plan.popular
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg"
                      : plan.id === "empresarial"
                        ? "bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700 text-white"
                        : "bg-muted/60 hover:bg-muted text-foreground border border-border"
                }`}>
                  {isCurrent ? "Plan actual" : plan.id === "basico" ? "Usar gratis" : plan.id === "empresarial" ? "Contactar ventas" : "Comenzar ahora"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Feature comparison table ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Comparación detallada de funcionalidades</h2>
            <p className="text-sm text-muted-foreground">Revisa exactamente qué incluye cada plan</p>
          </div>
          <button
            onClick={() => setShowFullTable(v => !v)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            {showFullTable ? "Ver menos" : "Ver todo"} <ChevronDown size={13} className={showFullTable ? "rotate-180" : ""} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4 w-1/2">Funcionalidad</th>
                {["Básico", "Profesional", "Empresarial"].map((p, i) => (
                  <th key={p} className={`text-center text-xs font-bold py-3 px-3 ${i === 1 ? "text-emerald-400" : i === 2 ? "text-purple-400" : "text-foreground"}`}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleTable.map((row, idx) => (
                <tr key={idx} className={`border-b border-border/50 last:border-0 ${idx % 2 === 0 ? "" : "bg-muted/5"}`}>
                  <td className="text-xs text-foreground py-2.5 px-4">{row.feature}</td>
                  <td className="text-center py-2.5 px-3"><TableCell val={row.basico} /></td>
                  <td className="text-center py-2.5 px-3"><TableCell val={row.profesional} /></td>
                  <td className="text-center py-2.5 px-3"><TableCell val={row.empresarial} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!showFullTable && (
          <div className="px-6 py-3 bg-gradient-to-t from-card to-transparent -mt-8 relative z-10 flex justify-center pt-10">
            <button
              onClick={() => setShowFullTable(true)}
              className="text-xs text-primary bg-card border border-primary/30 rounded-full px-4 py-1.5 hover:bg-primary/10 transition-colors flex items-center gap-1.5"
            >
              <ChevronDown size={13} /> Mostrar los {TABLE_FEATURES.length - 12} restantes
            </button>
          </div>
        )}
      </div>

      {/* ── Highlights strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Smartphone, title: "PWA offline", desc: "Funciona sin internet en todos los planes", color: "text-emerald-400" },
          { icon: Shield, title: "Datos seguros", desc: "Cifrado de extremo a extremo + backups", color: "text-blue-400" },
          { icon: Globe, title: "Hecho en Colombia", desc: "Metodología adaptada al sistema ganadero colombiano", color: "text-amber-400" },
          { icon: Clock, title: "Sin permanencia", desc: "Cancela cuando quieras, sin penalizaciones", color: "text-purple-400" },
        ].map(h => (
          <div key={h.title} className="bg-card border border-border rounded-xl p-4">
            <h.icon size={20} className={`${h.color} mb-2`} />
            <h4 className="font-semibold text-sm mb-1">{h.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Testimonios ── */}
      <div>
        <h2 className="font-bold text-xl mb-4">Lo que dicen nuestros ganaderos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIOS.map(t => (
            <div key={t.nombre} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-amber-400" />)}
              </div>
              <p className="text-sm text-muted-foreground italic mb-4">"{t.texto}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-300 font-bold text-xs flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.nombre}</p>
                  <p className="text-[11px] text-muted-foreground">{t.cargo}</p>
                </div>
                <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">{t.plan}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div>
        <h2 className="font-bold text-xl mb-4">Preguntas frecuentes sobre planes</h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/20 transition-colors"
              >
                <span className="font-medium text-sm text-foreground">{faq.q}</span>
                <ChevronDown size={16} className={`text-muted-foreground flex-shrink-0 ml-2 transition-transform ${expanded === i ? "rotate-180" : ""}`} />
              </button>
              {expanded === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA empresarial ── */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-2xl p-8 text-center border border-white/10">
        <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 size={24} className="text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">¿Tienes más de 5 fincas o eres una cooperativa?</h3>
        <p className="text-white/60 text-sm mb-5 max-w-md mx-auto">
          Ofrecemos precios especiales para asociaciones ganaderas, cooperativas y empresas agroindustriales con múltiples predios y equipos grandes.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="mailto:ventas@ganader.ia" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <MessageSquare size={15} />
            Hablar con ventas
          </a>
          <Link href="/documentacion">
            <span className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white/40 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer">
              <BookOpen size={15} />
              Ver documentación
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
