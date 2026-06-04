import { useState, useRef } from "react";
import {
  Shield, CheckCircle2, Crown, Zap, Star, Leaf, Lock,
  ChevronRight, Award, Users, TrendingUp, DollarSign, Beef,
  Globe, Wifi, Download, Clock, CreditCard, Phone, Mail,
  MapPin, Package, BarChart3, Sparkles, Check, X as XIcon,
  ArrowUpRight, MessageCircle, FileText, Printer, Copy,
  Activity, Layers, Database, GitBranch, AlertTriangle,
  Map, Scale, Dna, Wheat, Pill, Tag, Building2, Leaf as Leaf2,
  PieChart, Brain, BarChart2, Cpu, Cloud, Settings, BookOpen,
  UserCheck, Briefcase, FlaskConical, Truck, Zap as BtIcon,
} from "lucide-react";
import {
  useAuth, PLAN_LABEL, PLAN_COLOR, PLAN_ICON, PLAN_GRADIENT,
  type PlanId, type CivacInvoice,
} from "@/lib/auth";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fmtCOP = (n: number) =>
  n === 0 ? "Gratis" : `$${n.toLocaleString("es-CO")}/mes`;
const fmtCOPFull = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
const today = () => new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
const nextMonth = () => {
  const d = new Date(); d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const nowHH = () => new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
const WA_NUMBER = "573187351262";
const CIVAC_NIT   = "901.432.567-1";
const CIVAC_EMAIL = "ventas@civac.co";
const CIVAC_TEL   = "+57 318 735 1262";

/* ── Módulos por plan ────────────────────────────────────────────────────── */
type ModuleEntry = { id: string; icon: JSX.Element; name: string; desc: string; plan: PlanId };
const ALL_MODULES: ModuleEntry[] = [
  { id:"dashboard",   icon:<BarChart3 size={13}/>,    name:"Dashboard",          desc:"6 KPIs, gráficos, ticker en vivo",       plan:"basico" },
  { id:"inventario",  icon:<Beef size={13}/>,          name:"Inventario",         desc:"RFID, 50 animales, filtros CRUD",        plan:"basico" },
  { id:"produccion",  icon:<Activity size={13}/>,      name:"Producción",         desc:"Ordeños diarios, ranking top-vacas",     plan:"basico" },
  { id:"potreros",    icon:<Map size={13}/>,            name:"Potreros",           desc:"Mapa rotación, 3 lotes, semáforo",       plan:"basico" },
  { id:"alertas",     icon:<AlertTriangle size={13}/>, name:"Alertas",            desc:"Centro notificaciones, severidad",        plan:"basico" },
  { id:"pesaje-manual",icon:<Scale size={13}/>,        name:"Pesaje Manual",      desc:"CC, GMD, recibo PDF imprimible",         plan:"basico" },
  { id:"sanidad",     icon:<Pill size={13}/>,           name:"Sanidad",            desc:"Vacunación, retiro, diagnósticos",       plan:"basico" },
  // PRO
  { id:"pesaje",      icon:<BtIcon size={13}/>,         name:"Pesaje Bluetooth",   desc:"Báscula BT IA — BCS, GMD, 9 razas",     plan:"pro" },
  { id:"gps",         icon:<Wifi size={13}/>,           name:"GPS Bovino",         desc:"Seguimiento real, mapa animado",         plan:"pro" },
  { id:"gps-chips",   icon:<Cpu size={13}/>,            name:"GPS Chips",          desc:"Gestión dispositivos, MQTT broker",      plan:"pro" },
  { id:"reproduccion",icon:<Dna size={13}/>,            name:"Reproducción",       desc:"IEP, celos, IA bovina, partos",         plan:"pro" },
  { id:"genetica",    icon:<FlaskConical size={13}/>,   name:"Genética & DEP",     desc:"Ranking DEP, score bars, pedigrí",      plan:"pro" },
  { id:"alimentacion",icon:<Wheat size={13}/>,          name:"Alimentación",       desc:"Raciones TMR, minerales, suplementos",  plan:"pro" },
  { id:"insumos",     icon:<Package size={13}/>,        name:"Insumos & Kardex",   desc:"Stock mínimo, +/-, alertas vencim.",    plan:"pro" },
  { id:"semen",       icon:<Database size={13}/>,       name:"Semen & Embriones",  desc:"Inventario criogénico, TE bovina",      plan:"pro" },
  { id:"costos",      icon:<DollarSign size={13}/>,     name:"Costos P&G",         desc:"Ingresos/egresos, margen, costo/litro", plan:"pro" },
  { id:"personal",    icon:<Users size={13}/>,          name:"Personal & Nómina",  desc:"6 empleados, EPS/ARL, cargos",          plan:"pro" },
  { id:"prediccion",  icon:<Brain size={13}/>,          name:"Predicción IA",      desc:"Simulador financiero sliders 12 meses", plan:"pro" },
  { id:"multifinca",  icon:<Building2 size={13}/>,      name:"Multi-Finca (3)",    desc:"3 fincas, comparativa centralizada",    plan:"pro" },
  { id:"co2",         icon:<Leaf2 size={13}/>,          name:"Huella CO₂",         desc:"IPCC 2019, benchmarking Colombia",      plan:"pro" },
  { id:"asesora",     icon:<Sparkles size={13}/>,       name:"Asesora IA",         desc:"Chatbot IA ganadería colombiana",       plan:"pro" },
  // Premium
  { id:"trazabilidad",icon:<GitBranch size={13}/>,      name:"Trazabilidad ICA",   desc:"Guías movilización, SINIGAN",           plan:"premium" },
  { id:"ficha",       icon:<FileText size={13}/>,       name:"Ficha Individual",   desc:"Historia clínica tabbed por animal",    plan:"premium" },
  { id:"lotes",       icon:<Layers size={13}/>,          name:"Lotes",              desc:"Movimiento de lotes ganaderos",         plan:"premium" },
  { id:"drive",       icon:<Cloud size={13}/>,           name:"Drive Backup",       desc:"Google Drive, historial 30 versiones",  plan:"premium" },
  { id:"datos",       icon:<Download size={13}/>,       name:"Centro Datos",       desc:"Exportar/importar JSON, reset DB",      plan:"premium" },
  { id:"ventas",      icon:<Briefcase size={13}/>,      name:"CRM Ventas",         desc:"Pipeline comercial, prospectos",        plan:"premium" },
  { id:"documentacion",icon:<BookOpen size={13}/>,      name:"Documentación",      desc:"24 secciones, todos los módulos",       plan:"premium" },
  // Platino
  { id:"usuarios",    icon:<UserCheck size={13}/>,      name:"Usuarios & Roles",   desc:"Gestión cuentas, permisos por módulo",  plan:"platino" },
  { id:"configuracion",icon:<Settings size={13}/>,      name:"Configuración Avz.", desc:"Finca, apariencia, seguridad, API",     plan:"platino" },
  { id:"manual",      icon:<BookOpen size={13}/>,       name:"Manual Completo",    desc:"Guía de usuario en PDF interactivo",    plan:"platino" },
  { id:"reportes",    icon:<PieChart size={13}/>,       name:"Reportes Ejecutivos",desc:"Reportes mensuales PDF por finca",      plan:"platino" },
  { id:"api",         icon:<Cpu size={13}/>,            name:"API REST",           desc:"Integración con sistemas externos",      plan:"platino" },
];
const PLAN_ORDER: PlanId[] = ["basico","pro","premium","platino"];
function planIncludes(modPlan: PlanId, targetPlan: PlanId) {
  return PLAN_ORDER.indexOf(modPlan) <= PLAN_ORDER.indexOf(targetPlan);
}
function modulesForPlan(p: PlanId) {
  return ALL_MODULES.filter(m => planIncludes(m.plan, p));
}

/* ── Plan definitions ────────────────────────────────────────────────────── */
const RETAIL: Record<PlanId,number> = { basico:0, pro:129000, premium:289000, platino:890000 };
const RETAIL_ANNUAL: Record<PlanId,number> = { basico:0, pro:1239000, premium:2775000, platino:8544000 };

const PLANS = [
  {
    id: "basico" as PlanId,
    nombre: "Básico",
    icon: <Leaf size={22}/>,
    color: "#94a3b8", glow: "148,163,184",
    from: "#475569", to: "#334155",
    textColor: "#fff",
    tag: "",
    tagline: "Para fincas pequeñas que empiezan su digitalización",
    longDesc: "Acceso a los módulos esenciales para controlar tu hato: inventario, producción diaria, potreros y alertas básicas. Gratis para siempre, sin tarjeta de crédito.",
    img: "https://images.unsplash.com/photo-1500595046743-cd271d694e30?w=400&q=75&auto=format",
  },
  {
    id: "pro" as PlanId,
    nombre: "PRO",
    icon: <Zap size={22}/>,
    color: "#00f5d4", glow: "0,245,212",
    from: "#009b87", to: "#005c51",
    textColor: "#000",
    tag: "🔥 MÁS POPULAR",
    tagline: "El favorito de los ganaderos colombianos",
    longDesc: "GPS en tiempo real, pesaje Bluetooth, genética, reproducción, predicción IA, asesora virtual y todo lo que necesitas para optimizar tu producción. 21 módulos activos.",
    img: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&q=75&auto=format",
  },
  {
    id: "premium" as PlanId,
    nombre: "Premium",
    icon: <Star size={22}/>,
    color: "#fbbf24", glow: "251,191,36",
    from: "#d97706", to: "#92400e",
    textColor: "#000",
    tag: "⭐ RECOMENDADO",
    tagline: "Para empresas ganaderas con escala y múltiples fincas",
    longDesc: "Trazabilidad ICA completa, Drive backup, CRM ventas, lotes y Multi-Finca ilimitada. Integración con Google Drive y API REST para conectar con ERP corporativo.",
    img: "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=400&q=75&auto=format",
  },
  {
    id: "platino" as PlanId,
    nombre: "Platino",
    icon: <Crown size={22}/>,
    color: "#cd7f32", glow: "205,127,50",
    from: "#92400e", to: "#451a03",
    textColor: "#fff",
    tag: "🏆 CORPORATIVO",
    tagline: "Instancia dedicada para corporativos y grupos ganaderos",
    longDesc: "Todo incluido + instancia privada, branding personalizado, SLA 99.9%, capacitación presencial, manager de cuenta asignado y reportes ejecutivos mensuales.",
    img: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=400&q=75&auto=format",
  },
];

/* ── Payment form state ──────────────────────────────────────────────────── */
interface PayForm {
  nombre: string; email: string; telefono: string;
  nit: string; direccion: string; empresa: string;
  metodo: "wompi"|"nequi"|"pse"|"bancolombia";
  billing: "mensual"|"anual";
}
const initForm = (user: { nombre?:string; email?:string; phone?:string } | null): PayForm => ({
  nombre:   user?.nombre   ?? "",
  email:    user?.email    ?? "",
  telefono: user?.phone    ?? "",
  nit: "", direccion: "", empresa: "",
  metodo: "wompi",
  billing: "mensual",
});

/* ── Invoice display modal ───────────────────────────────────────────────── */
function InvoiceModal({ inv, onClose }: { inv: CivacInvoice; onClose: () => void }) {
  const plan = PLANS.find(p => p.id === inv.plan)!;
  const waText = encodeURIComponent(
    `Hola CIVAC! Adjunto comprobante de pago para la factura ${inv.id}.\n` +
    `Plan: ${PLAN_LABEL[inv.plan]}\n` +
    `Total: ${fmtCOPFull(inv.total)}\n` +
    `Ref: ${inv.referencia}`
  );
  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Factura ${inv.id}</title>
      <style>body{font-family:sans-serif;padding:32px;color:#000;max-width:600px;margin:0 auto}
      h1{color:#005c51;font-size:22px}table{width:100%;border-collapse:collapse}
      td,th{padding:8px;border:1px solid #ddd;font-size:13px}th{background:#f0fdf4}
      .total{font-size:18px;font-weight:900;color:#005c51}</style></head><body>
      <h1>⬡ CIVAC — Factura Electrónica</h1>
      <p><b>No. Factura:</b> ${inv.id} &nbsp; <b>Fecha:</b> ${inv.fecha} ${inv.hora}</p>
      <p><b>Emisor:</b> CIVAC SAS · NIT ${CIVAC_NIT} · ${CIVAC_EMAIL}</p>
      <hr/>
      <p><b>Cliente:</b> ${inv.userNombre}<br/>
      ${inv.userNit ? `NIT/CC: ${inv.userNit}<br/>` : ""}
      ${inv.userTelefono ? `Tel: ${inv.userTelefono}<br/>` : ""}
      ${inv.userDireccion ? `Dir: ${inv.userDireccion}` : ""}</p>
      <table><tr><th>Concepto</th><th>Período</th><th>Valor</th></tr>
      <tr><td>${inv.concepto}</td><td>${inv.periodoDesde} – ${inv.periodoHasta}</td><td>${fmtCOPFull(inv.precio)}</td></tr>
      <tr><td colspan="2">IVA 19%</td><td>${fmtCOPFull(inv.iva)}</td></tr>
      <tr><td colspan="2" class="total">TOTAL COP</td><td class="total">${fmtCOPFull(inv.total)}</td></tr>
      </table>
      <p>Método de pago: ${inv.metodo} · Ref: ${inv.referencia}</p>
      <p style="color:#888;font-size:11px">Factura electrónica generada por CIVAC v1.0 — Resolución DIAN 18764 de 2024</p>
      </body></html>`);
    w.document.close();
    w.print();
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.85)", backdropFilter:"blur(14px)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background:"rgba(3,10,20,0.99)", border:`1px solid rgba(${plan.glow},0.35)` }}>
        <div className="h-1" style={{ background:`linear-gradient(90deg,${plan.from},${plan.to})` }} />
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="font-black text-white text-lg">⬡ CIVAC — Factura</p>
              <p className="font-mono text-xs" style={{ color:plan.color }}>{inv.id}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"><XIcon size={16}/></button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${inv.estado === "pagada" ? "bg-green-500/15 text-green-400 border border-green-500/30" : inv.estado === "pendiente" ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"}`}>
              {inv.estado === "pagada" ? "✓ PAGADA" : inv.estado === "pendiente" ? "⏳ PENDIENTE" : "✗ ANULADA"}
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background:`rgba(${plan.glow},0.12)`, border:`1px solid rgba(${plan.glow},0.25)`, color:plan.color }}>
              {inv.tipo === "nuevo" ? "🆕 NUEVO CLIENTE" : "🔁 RENOVACIÓN"}
            </span>
          </div>

          {/* Details */}
          <div className="rounded-xl p-4 space-y-2" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
            {[
              ["Emisor", `CIVAC SAS · NIT ${CIVAC_NIT}`],
              ["Cliente", inv.userNombre],
              ["Email", inv.userEmail],
              ...(inv.userNit ? [["NIT/CC", inv.userNit]] : []),
              ...(inv.userTelefono ? [["Teléfono", inv.userTelefono]] : []),
              ["Concepto", inv.concepto],
              ["Período", `${inv.periodoDesde} → ${inv.periodoHasta}`],
              ["Método", inv.metodo.toUpperCase()],
              ["Referencia", inv.referencia],
              ["Fecha", `${inv.fecha} ${inv.hora}`],
            ].map(([k,v]) => (
              <div key={k} className="flex items-start justify-between gap-3 text-[11px]">
                <span className="text-white/40 flex-shrink-0">{k}</span>
                <span className="text-white/85 text-right font-medium">{v}</span>
              </div>
            ))}
          </div>

          {/* Amounts */}
          <div className="rounded-xl p-4 space-y-2" style={{ background:`rgba(${plan.glow},0.05)`, border:`1px solid rgba(${plan.glow},0.15)` }}>
            <div className="flex justify-between text-[12px] text-white/55">
              <span>Subtotal</span><span>{fmtCOPFull(inv.precio)}</span>
            </div>
            <div className="flex justify-between text-[12px] text-white/55">
              <span>IVA 19%</span><span>{fmtCOPFull(inv.iva)}</span>
            </div>
            <div className="flex justify-between text-[14px] font-black" style={{ color:plan.color }}>
              <span>TOTAL COP</span><span>{fmtCOPFull(inv.total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:bg-white/10 text-white/60 border border-white/10">
              <Printer size={12}/> Imprimir / PDF
            </button>
            <a href={`https://wa.me/${WA_NUMBER}?text=${waText}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all"
              style={{ background:"rgba(37,211,102,0.12)", border:"1px solid rgba(37,211,102,0.3)", color:"#25d366" }}>
              <MessageCircle size={12}/> Enviar comprobante WhatsApp
            </a>
            <button onClick={() => { navigator.clipboard?.writeText(inv.referencia).catch(()=>{}); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:bg-white/10 text-white/60 border border-white/10">
              <Copy size={12}/> Copiar ref.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Payment modal ───────────────────────────────────────────────────────── */
function PaymentModal({
  plan, onClose, onSuccess,
}: {
  plan: typeof PLANS[0];
  onClose: () => void;
  onSuccess: (inv: CivacInvoice) => void;
}) {
  const { user, addWompiPayment, addInvoice, activatePlan } = useAuth();
  const [form, setForm] = useState<PayForm>(initForm(user));
  const [step, setStep] = useState<"form"|"method"|"confirm">("form");
  const [loading, setLoading] = useState(false);

  const precio  = form.billing === "anual" ? RETAIL_ANNUAL[plan.id] : RETAIL[plan.id];
  const iva     = Math.round(precio * 0.19);
  const total   = precio + iva;
  const refNum  = `CIVAC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  const set = (k: keyof PayForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const wompiUrl = () => {
    const base = "https://checkout.wompi.co/p/";
    const params = new URLSearchParams({
      "public-key":           "pub_test_CIVAC2026_DEMO",
      "currency":             "COP",
      "amount-in-cents":      String(total * 100),
      "reference":            refNum,
      "redirect-url":         window.location.origin + "/planes?pago=ok&ref=" + refNum,
      "customer-data:email":  form.email,
      "customer-data:full-name": form.nombre,
      ...(form.telefono ? { "customer-data:phone-number": form.telefono.replace(/\D/g,"") } : {}),
    });
    return base + "?" + params.toString();
  };

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      const pmt = addWompiPayment({
        userId:     user?.id     ?? "guest",
        userNombre: form.nombre  || (user?.nombre ?? "Cliente"),
        userEmail:  form.email   || (user?.email  ?? ""),
        plan:       plan.id,
        monto:      total,
        moneda:     "COP",
        metodo:     form.metodo as "tarjeta"|"nequi"|"pse"|"bancolombia",
        referencia: refNum,
        estado:     "aprobado",
        telefono:   form.telefono || undefined,
        nit:        form.nit      || undefined,
      });
      const inv = addInvoice({
        paymentId:     pmt.id,
        userId:        user?.id      ?? "guest",
        userNombre:    form.nombre   || (user?.nombre ?? "Cliente"),
        userEmail:     form.email    || (user?.email  ?? ""),
        userNit:       form.nit      || undefined,
        userTelefono:  form.telefono || undefined,
        userDireccion: form.direccion|| undefined,
        plan:          plan.id,
        concepto:      `Suscripción CIVAC ${PLAN_LABEL[plan.id]} — ${form.billing === "anual" ? "Anual" : "Mensual"}`,
        precio,
        iva,
        total,
        metodo:        form.metodo,
        referencia:    refNum,
        fecha:         today(),
        hora:          nowHH(),
        estado:        "pagada",
        tipo:          pmt.tipo ?? "nuevo",
        periodoDesde:  today(),
        periodoHasta:  nextMonth(),
      });
      if (user?.id) {
        activatePlan(user.id, plan.id, {
          userId: user.id, userNombre: form.nombre || (user.nombre ?? ""),
          userEmail: form.email || (user.email ?? ""),
          plan: plan.id, monto: total, moneda: "COP",
          metodo: form.metodo as "tarjeta"|"nequi"|"pse"|"bancolombia",
          referencia: refNum, estado: "aprobado",
        });
      }
      setLoading(false);
      onSuccess(inv);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.85)", backdropFilter:"blur(14px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ background:"rgba(3,10,20,0.99)", border:`1px solid rgba(${plan.glow},0.3)` }}>
        <div className="h-1" style={{ background:`linear-gradient(90deg,${plan.from},${plan.to})` }} />
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:`linear-gradient(135deg,${plan.from},${plan.to})`, color:plan.textColor }}>
              {plan.icon}
            </div>
            <div className="flex-1">
              <p className="font-black text-white text-base">Contratar Plan {plan.nombre}</p>
              <p className="text-[10px] text-white/40">Cancela cuando quieras · Sin penalidad</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"><XIcon size={16}/></button>
          </div>

          {/* Billing toggle */}
          {plan.id !== "basico" && (
            <div className="flex gap-2 mb-4">
              {(["mensual","anual"] as const).map(b => (
                <button key={b} onClick={() => set("billing", b)}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all"
                  style={{
                    background: form.billing === b ? `rgba(${plan.glow},0.18)` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${form.billing === b ? `rgba(${plan.glow},0.4)` : "rgba(255,255,255,0.08)"}`,
                    color: form.billing === b ? plan.color : "rgba(255,255,255,0.4)",
                  }}>
                  {b === "mensual" ? `Mensual · ${fmtCOP(RETAIL[plan.id])}` : `Anual · ${fmtCOP(Math.round(RETAIL_ANNUAL[plan.id]/12))} · -20%`}
                </button>
              ))}
            </div>
          )}

          {/* Steps */}
          {step === "form" && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-white/50 uppercase tracking-wide">Datos de facturación</p>
              {[
                { k:"nombre"   as const, label:"Nombre completo / Razón social", ph:"Ej: Ganadería Los Llanos S.A.S." },
                { k:"email"    as const, label:"Correo electrónico",              ph:"correo@empresa.co" },
                { k:"nit"      as const, label:"NIT o Cédula (para factura)",     ph:"900.123.456-7" },
                { k:"empresa"  as const, label:"Empresa / Finca (opcional)",      ph:"Hacienda El Paraíso" },
                { k:"telefono" as const, label:"WhatsApp / Celular",              ph:"+57 300 000 0000" },
                { k:"direccion"as const, label:"Dirección (opcional)",            ph:"Calle 45 # 12-30, Bogotá" },
              ].map(({ k, label, ph }) => (
                <div key={k}>
                  <label className="text-[10px] text-white/40 font-semibold block mb-0.5">{label}</label>
                  <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
                    className="w-full px-3 py-2 rounded-xl text-[12px] text-white placeholder-white/20 outline-none transition-all"
                    style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }} />
                </div>
              ))}
              <button disabled={!form.nombre || !form.email}
                onClick={() => setStep("method")}
                className="w-full py-3 rounded-xl font-black text-[13px] transition-all mt-2 disabled:opacity-40"
                style={{ background:`linear-gradient(135deg,${plan.from},${plan.to})`, color:plan.textColor, boxShadow:`0 4px 20px rgba(${plan.glow},0.35)` }}>
                Continuar → Método de pago
              </button>
            </div>
          )}

          {step === "method" && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-white/50 uppercase tracking-wide">Método de pago</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id:"wompi"      as const, icon:"💳", label:"Wompi",      desc:"Tarjeta, PSE, Nequi" },
                  { id:"nequi"      as const, icon:"📱", label:"Nequi",      desc:"App Nequi directo" },
                  { id:"pse"        as const, icon:"🔐", label:"PSE",         desc:"Débito bancario" },
                  { id:"bancolombia"as const, icon:"🏦", label:"Bancolombia", desc:"Botón Bancolombia" },
                ]).map(pm => (
                  <button key={pm.id} onClick={() => set("metodo", pm.id)}
                    className="flex items-center gap-2 px-3 py-3 rounded-xl text-[11px] font-bold transition-all"
                    style={{
                      background: form.metodo === pm.id ? `rgba(${plan.glow},0.15)` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${form.metodo === pm.id ? `rgba(${plan.glow},0.4)` : "rgba(255,255,255,0.08)"}`,
                      color: form.metodo === pm.id ? plan.color : "rgba(255,255,255,0.5)",
                    }}>
                    <span className="text-xl">{pm.icon}</span>
                    <div className="text-left">
                      <p>{pm.label}</p>
                      <p className="text-[9px] text-white/30 font-normal">{pm.desc}</p>
                    </div>
                    {form.metodo === pm.id && <Check size={12} className="ml-auto flex-shrink-0"/>}
                  </button>
                ))}
              </div>
              {/* Summary */}
              <div className="rounded-xl p-3 space-y-1" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex justify-between text-[11px] text-white/50"><span>Plan {plan.nombre} {form.billing === "anual" ? "(Anual)" : "(Mensual)"}</span><span>{fmtCOPFull(precio)}</span></div>
                <div className="flex justify-between text-[11px] text-white/50"><span>IVA 19%</span><span>{fmtCOPFull(iva)}</span></div>
                <div className="flex justify-between text-[13px] font-black" style={{ color:plan.color }}><span>TOTAL COP</span><span>{fmtCOPFull(total)}</span></div>
                <p className="text-[9px] text-white/25 mt-0.5">Ref: {refNum}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep("form")} className="px-4 py-2 rounded-xl text-[11px] font-bold text-white/40 border border-white/10 hover:bg-white/5 transition-all">← Volver</button>
                {form.metodo === "wompi" ? (
                  <a href={wompiUrl()} target="_blank" rel="noreferrer" onClick={() => setTimeout(() => setStep("confirm"), 500)}
                    className="flex-1 text-center py-2 rounded-xl font-black text-[12px] transition-all"
                    style={{ background:`linear-gradient(135deg,${plan.from},${plan.to})`, color:plan.textColor, boxShadow:`0 4px 20px rgba(${plan.glow},0.35)` }}>
                    💳 Pagar con Wompi →
                  </a>
                ) : (
                  <button onClick={() => setStep("confirm")} className="flex-1 py-2 rounded-xl font-black text-[12px] transition-all"
                    style={{ background:`linear-gradient(135deg,${plan.from},${plan.to})`, color:plan.textColor, boxShadow:`0 4px 20px rgba(${plan.glow},0.35)` }}>
                    Confirmar pago →
                  </button>
                )}
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <p className="text-[11px] font-bold text-white/50 uppercase tracking-wide">Confirmar y generar factura</p>
              <div className="rounded-xl p-4 space-y-2" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                {[
                  ["Cliente", form.nombre || (user?.nombre ?? "—")],
                  ["Email",   form.email  || (user?.email  ?? "—")],
                  ["Plan",    `CIVAC ${plan.nombre} (${form.billing})`],
                  ["Total",   fmtCOPFull(total)],
                  ["Método",  form.metodo.toUpperCase()],
                  ["Ref.",    refNum],
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between text-[11px]">
                    <span className="text-white/40">{k}</span>
                    <span className="text-white font-semibold">{v}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-3 flex items-start gap-2" style={{ background:"rgba(0,245,212,0.06)", border:"1px solid rgba(0,245,212,0.18)" }}>
                <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5 text-[#00f5d4]"/>
                <p className="text-[10px] text-white/60">Al confirmar se generará una factura electrónica y se activará tu plan {plan.nombre} inmediatamente.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep("method")} className="px-4 py-2 rounded-xl text-[11px] font-bold text-white/40 border border-white/10 hover:bg-white/5 transition-all">← Volver</button>
                <button onClick={handleConfirm} disabled={loading}
                  className="flex-1 py-2 rounded-xl font-black text-[12px] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background:`linear-gradient(135deg,${plan.from},${plan.to})`, color:plan.textColor, boxShadow:`0 4px 20px rgba(${plan.glow},0.35)` }}>
                  {loading ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/> Procesando…</> : <><CheckCircle2 size={14}/> Confirmar y activar</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function Planes() {
  const { user, invoices, wompiPayments } = useAuth();
  const planActual = (user?.plan ?? "basico") as PlanId;
  const isAdmin    = user?.role === "admin" || user?.role === "superadmin";
  const isCivac    = ["admin","superadmin","developer","sales"].includes(user?.role ?? "");

  const [activeTab,   setActiveTab]   = useState<"planes"|"modulos"|"suscripcion"|"ventas">("planes");
  const [payPlan,     setPayPlan]     = useState<typeof PLANS[0] | null>(null);
  const [viewInv,     setViewInv]     = useState<CivacInvoice | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastInv,     setLastInv]     = useState<CivacInvoice | null>(null);

  const actualInfo = PLANS.find(p => p.id === planActual)!;
  const userInvoices = invoices.filter(inv =>
    isCivac ? true : inv.userId === user?.id
  );
  const userPayments = wompiPayments.filter(p =>
    isCivac ? true : p.userId === user?.id
  );

  const handleSuccess = (inv: CivacInvoice) => {
    setPayPlan(null);
    setLastInv(inv);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 8000);
  };

  const TABS = [
    { id:"planes"       as const, label:"Planes & Precios",   ico:"🛡️" },
    { id:"modulos"      as const, label:"Módulos incluidos",  ico:"🔧" },
    { id:"suscripcion"  as const, label:"Mi Suscripción",     ico:"💳" },
    { id:"ventas"       as const, label:"Contacto Ventas",    ico:"💬" },
  ];

  return (
    <div className="space-y-5 pb-16">
      {payPlan && <PaymentModal plan={payPlan} onClose={() => setPayPlan(null)} onSuccess={handleSuccess}/>}
      {viewInv && <InvoiceModal inv={viewInv} onClose={() => setViewInv(null)}/>}

      {/* ── Banner actual plan ── */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background:"linear-gradient(135deg,#071325,#0d2137 50%,#0a1c38)", border:`1px solid rgba(${actualInfo.glow},0.25)`, boxShadow:`0 0 60px rgba(${actualInfo.glow},0.06)` }}>
        <div className="absolute right-0 top-0 w-80 h-full opacity-[0.08] pointer-events-none"
          style={{ background:`radial-gradient(ellipse at right, rgb(${actualInfo.glow}), transparent 70%)` }} />
        <div className="absolute right-4 top-4 bottom-4 w-36 rounded-xl overflow-hidden opacity-20 hidden sm:block">
          <img src={actualInfo.img} alt="" className="w-full h-full object-cover"/>
        </div>
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background:`linear-gradient(135deg,${actualInfo.from},${actualInfo.to})`, boxShadow:`0 0 24px rgba(${actualInfo.glow},0.5)`, color:actualInfo.textColor }}>
            {actualInfo.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-black text-xl text-white" style={{ fontFamily:"'Sora',sans-serif" }}>Licencia CIVAC v1.0</h1>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full"
                style={{ background:`linear-gradient(135deg,${actualInfo.from},${actualInfo.to})`, color:actualInfo.textColor }}>
                {PLAN_ICON[planActual]} Plan {actualInfo.nombre}
              </span>
            </div>
            <p className="text-sm" style={{ color:`rgba(${actualInfo.glow},0.6)` }}>
              {isAdmin ? "Administrador · Gestión de planes y facturación" : `${user?.nombre} · ${modulesForPlan(planActual).length} módulos activos`}
            </p>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {[
                { val:modulesForPlan(planActual).length, lab:"Módulos" },
                { val: planActual==="basico"?"50":"∞", lab:"Animales" },
                { val: planActual==="basico"?"1":planActual==="pro"?"3":planActual==="premium"?"10":"∞", lab:"Usuarios" },
              ].map(({ val, lab }) => (
                <div key={lab} className="flex items-center gap-1.5">
                  <div>
                    <p className="text-[13px] font-black text-white leading-none">{val}</p>
                    <p className="text-[9px]" style={{ color:`rgba(${actualInfo.glow},0.4)` }}>{lab}</p>
                  </div>
                </div>
              ))}
              {userInvoices.length > 0 && (
                <button onClick={() => setActiveTab("suscripcion")}
                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                  style={{ color:actualInfo.color, background:`rgba(${actualInfo.glow},0.1)`, border:`1px solid rgba(${actualInfo.glow},0.2)` }}>
                  <FileText size={10}/> {userInvoices.length} {userInvoices.length===1?"factura":"facturas"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Success banner ── */}
      {showSuccess && lastInv && (
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background:"rgba(57,255,126,0.08)", border:"1px solid rgba(57,255,126,0.25)", color:"#39ff7e" }}>
          <CheckCircle2 size={18}/>
          <div className="flex-1">
            <p className="font-black text-sm">¡Plan {PLAN_LABEL[lastInv.plan]} activado exitosamente!</p>
            <p className="text-[11px] text-green-300/70">Factura {lastInv.id} generada · {fmtCOPFull(lastInv.total)}</p>
          </div>
          <button onClick={() => setViewInv(lastInv)}
            className="text-[10px] font-black px-3 py-1.5 rounded-lg border border-green-400/40 hover:bg-green-400/10 transition-all">
            Ver factura →
          </button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ id, label, ico }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all"
            style={{
              background: activeTab === id ? "rgba(0,245,212,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${activeTab === id ? "rgba(0,245,212,0.35)" : "rgba(255,255,255,0.08)"}`,
              color: activeTab === id ? "#00f5d4" : "rgba(255,255,255,0.45)",
            }}>
            {ico} {label}
          </button>
        ))}
      </div>

      {/* ══════════════════ TAB: PLANES ══════════════════ */}
      {activeTab === "planes" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {PLANS.map(plan => {
              const isActual = plan.id === planActual;
              const mods     = modulesForPlan(plan.id);
              const canBuy   = plan.id !== "basico" && !isCivac;
              return (
                <div key={plan.id} className="rounded-2xl overflow-hidden relative flex flex-col"
                  style={{
                    background:"linear-gradient(160deg,rgba(5,12,30,0.98),rgba(8,18,45,0.96))",
                    border: `1px solid rgba(${plan.glow},${isActual ? 0.5 : 0.2})`,
                    boxShadow: isActual ? `0 0 40px rgba(${plan.glow},0.12)` : "none",
                  }}>
                  {/* Top accent */}
                  <div className="h-0.5 w-full" style={{ background:`linear-gradient(90deg,transparent,${plan.color},transparent)` }} />

                  {/* Photo */}
                  <div className="relative h-28 overflow-hidden">
                    <img src={plan.img} alt={plan.nombre} className="w-full h-full object-cover opacity-40"/>
                    <div className="absolute inset-0" style={{ background:`linear-gradient(to bottom, rgba(${plan.glow},0.15), rgba(5,12,30,0.9))` }} />
                    {/* Tags */}
                    <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background:`linear-gradient(135deg,${plan.from},${plan.to})`, color:plan.textColor, boxShadow:`0 0 16px rgba(${plan.glow},0.5)` }}>
                        {plan.icon}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isActual && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background:`rgba(57,255,126,0.2)`, border:"1px solid rgba(57,255,126,0.4)", color:"#39ff7e" }}>✓ ACTIVO</span>
                        )}
                        {plan.tag && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background:`rgba(${plan.glow},0.25)`, border:`1px solid rgba(${plan.glow},0.4)`, color:plan.color }}>{plan.tag}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-black text-white text-lg leading-tight">{plan.nombre}</h3>
                    <p className="text-[10px] mt-0.5 mb-2" style={{ color:`rgba(${plan.glow},0.55)` }}>{plan.tagline}</p>
                    <p className="text-[10px] text-white/40 mb-3 leading-relaxed">{plan.longDesc}</p>

                    {/* Price */}
                    <div className="mb-3">
                      <span className="text-2xl font-black" style={{ color:plan.color }}>
                        {plan.id === "basico" ? "Gratis" : fmtCOP(RETAIL[plan.id])}
                      </span>
                      {plan.id !== "basico" && <span className="text-[9px] text-white/25 ml-1">+ IVA</span>}
                      {plan.id !== "basico" && (
                        <p className="text-[9px] mt-0.5" style={{ color:`rgba(${plan.glow},0.5)` }}>
                          Anual: {fmtCOP(Math.round(RETAIL_ANNUAL[plan.id]/12))} · ahorra 20%
                        </p>
                      )}
                    </div>

                    {/* Module count pill */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:`rgba(${plan.glow},0.1)`, border:`1px solid rgba(${plan.glow},0.2)`, color:plan.color }}>
                        {mods.length} módulos
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/35 border border-white/10">
                        {plan.id === "basico"?"1 usuario":plan.id==="pro"?"3 usuarios":plan.id==="premium"?"10 usuarios":"∞ usuarios"}
                      </span>
                    </div>

                    {/* Top module icons */}
                    <div className="grid grid-cols-4 gap-1 mb-3">
                      {mods.slice(0, 8).map(m => (
                        <div key={m.id} className="flex flex-col items-center gap-0.5 rounded-lg py-1.5 px-0.5"
                          style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.05)" }}
                          title={m.name}>
                          <span style={{ color:`rgba(${plan.glow},0.8)` }}>{m.icon}</span>
                          <p className="text-[7px] text-white/35 text-center leading-none truncate w-full px-0.5">{m.name.split(" ")[0]}</p>
                        </div>
                      ))}
                    </div>
                    {mods.length > 8 && (
                      <p className="text-[10px] font-bold mb-2" style={{ color:`rgba(${plan.glow},0.5)` }}>
                        +{mods.length - 8} más incluidos
                      </p>
                    )}

                    {/* CTA */}
                    <div className="mt-auto pt-2">
                      {isActual ? (
                        <div className="w-full text-center py-2.5 rounded-xl text-[11px] font-black"
                          style={{ background:`rgba(${plan.glow},0.08)`, border:`1px solid rgba(${plan.glow},0.2)`, color:plan.color }}>
                          ✓ Tu plan actual
                        </div>
                      ) : plan.id === "basico" ? (
                        <div className="w-full text-center py-2.5 rounded-xl text-[11px] font-black text-white/30 border border-white/10">
                          Plan gratuito
                        </div>
                      ) : (
                        <button onClick={() => setPayPlan(plan)}
                          className="w-full py-2.5 rounded-xl text-[11px] font-black transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
                          style={{ background:`linear-gradient(135deg,${plan.from},${plan.to})`, color:plan.textColor, boxShadow:`0 4px 20px rgba(${plan.glow},0.35)` }}>
                          <CreditCard size={12}/> Contratar {plan.nombre} <ChevronRight size={11}/>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* WhatsApp CTA */}
          <div className="rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{ background:"linear-gradient(135deg,rgba(37,211,102,0.06),rgba(37,211,102,0.02))", border:"1px solid rgba(37,211,102,0.18)" }}>
            <div className="flex-1">
              <p className="font-black text-white text-sm">¿Tienes dudas antes de contratar?</p>
              <p className="text-[11px] text-white/50 mt-0.5">Un asesor CIVAC te guía por WhatsApp · Respuesta en minutos · Lun–Sáb 8am–8pm</p>
            </div>
            <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola CIVAC! Quiero información sobre los planes de GanaderIA")}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[12px] transition-all hover:scale-[1.02] whitespace-nowrap"
              style={{ background:"#25d366", color:"#000", boxShadow:"0 4px 16px rgba(37,211,102,0.35)" }}>
              <MessageCircle size={15}/> Chatear con asesor →
            </a>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: MÓDULOS ══════════════════ */}
      {activeTab === "modulos" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALL_MODULES.map(mod => {
              const planIdx    = PLAN_ORDER.indexOf(mod.plan);
              const actualIdx  = PLAN_ORDER.indexOf(planActual);
              const included   = planIdx <= actualIdx;
              const modPlanObj = PLANS.find(p => p.id === mod.plan)!;
              return (
                <div key={mod.id} className="rounded-xl p-3 flex items-start gap-3 transition-all"
                  style={{
                    background: included ? `rgba(${modPlanObj.glow},0.06)` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${included ? `rgba(${modPlanObj.glow},0.2)` : "rgba(255,255,255,0.06)"}`,
                    opacity: included ? 1 : 0.5,
                  }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: included ? `rgba(${modPlanObj.glow},0.15)` : "rgba(255,255,255,0.05)", color: included ? modPlanObj.color : "rgba(255,255,255,0.25)" }}>
                    {mod.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className={`font-bold text-[12px] ${included ? "text-white" : "text-white/40"}`}>{mod.name}</p>
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ background:`rgba(${modPlanObj.glow},0.12)`, border:`1px solid rgba(${modPlanObj.glow},0.25)`, color:modPlanObj.color }}>
                        {PLAN_LABEL[mod.plan]}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/35 mt-0.5">{mod.desc}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {included ? <Check size={14} style={{ color:modPlanObj.color }}/> : <Lock size={11} className="text-white/20"/>}
                  </div>
                </div>
              );
            })}
          </div>
          {!isCivac && planActual !== "platino" && (
            <div className="rounded-2xl p-4 flex items-center gap-3 justify-between"
              style={{ background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.2)" }}>
              <div>
                <p className="font-black text-[#fbbf24] text-sm">Desbloquea más módulos</p>
                <p className="text-[11px] text-white/50 mt-0.5">Mejora tu plan para acceder a todos los módulos de CIVAC</p>
              </div>
              <button onClick={() => setActiveTab("planes")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-[12px] whitespace-nowrap"
                style={{ background:"linear-gradient(135deg,#d97706,#92400e)", color:"#000" }}>
                Ver planes <ChevronRight size={12}/>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ TAB: SUSCRIPCIÓN ══════════════════ */}
      {activeTab === "suscripcion" && (
        <div className="space-y-4">
          {/* Current subscription card */}
          <div className="rounded-2xl p-5"
            style={{ background:"linear-gradient(135deg,rgba(5,15,40,0.97),rgba(8,20,55,0.95))", border:`1px solid rgba(${actualInfo.glow},0.25)` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background:`linear-gradient(135deg,${actualInfo.from},${actualInfo.to})`, color:actualInfo.textColor }}>
                {actualInfo.icon}
              </div>
              <div className="flex-1">
                <p className="font-black text-white text-sm">Plan {actualInfo.nombre}</p>
                <p className="text-[10px]" style={{ color:`rgba(${actualInfo.glow},0.5)` }}>
                  {fmtCOP(RETAIL[planActual])} · {modulesForPlan(planActual).length} módulos activos
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-[#39ff7e]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39ff7e] animate-pulse"/>Activo
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon:Clock,      label:"Próxima renovación", val:user?.planExpiry ? new Date(user.planExpiry).toLocaleDateString("es-CO") : "∞ Ilimitada" },
                { icon:Users,      label:"Usuarios activos",   val:`1 / ${planActual==="basico"?"1":planActual==="pro"?"3":planActual==="premium"?"10":"∞"}` },
                { icon:Beef,       label:"Animales regist.",   val:planActual==="basico"?"hasta 50":"∞ Ilimitados" },
                { icon:FileText,   label:"Facturas emitidas",  val:String(userInvoices.length) },
              ].map(({ icon:Icon, label, val }) => (
                <div key={label} className="rounded-xl p-3" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <Icon size={13} style={{ color:`rgba(${actualInfo.glow},0.6)` }}/>
                  <p className="font-black text-white text-sm mt-1">{val}</p>
                  <p className="text-[9px] text-white/35 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Invoices / payment history */}
          <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <FileText size={14} style={{ color:"#00f5d4" }}/>
                <p className="font-black text-white text-sm">Historial de facturas</p>
              </div>
              <span className="text-[10px] text-white/40">{userInvoices.length} emitidas</span>
            </div>

            {userInvoices.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-white/30 text-sm">Aún no tienes facturas emitidas</p>
                {!isCivac && planActual === "basico" && (
                  <button onClick={() => setActiveTab("planes")} className="mt-3 text-[#00f5d4] text-[11px] font-bold hover:underline">
                    Contratar un plan →
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                {userInvoices.map(inv => {
                  const p = PLANS.find(x => x.id === inv.plan)!;
                  return (
                    <div key={inv.id} className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background:`rgba(${p.glow},0.12)`, border:`1px solid rgba(${p.glow},0.2)` }}>
                        <FileText size={13} style={{ color:p.color }}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-white text-[12px]">{inv.id}</p>
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                            style={{ background:`rgba(${p.glow},0.12)`, border:`1px solid rgba(${p.glow},0.2)`, color:p.color }}>
                            {PLAN_LABEL[inv.plan]}
                          </span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${inv.tipo==="nuevo"?"bg-blue-500/10 text-blue-400 border border-blue-500/25":"bg-purple-500/10 text-purple-400 border border-purple-500/25"}`}>
                            {inv.tipo==="nuevo"?"🆕 Nuevo":"🔁 Renovación"}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/40 mt-0.5">{inv.concepto} · {inv.fecha}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-[12px]" style={{ color:p.color }}>{fmtCOPFull(inv.total)}</p>
                        <p className="text-[9px] text-white/30">{inv.estado}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => setViewInv(inv)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="Ver factura"><FileText size={12}/></button>
                        <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola CIVAC! Adjunto comprobante para factura ${inv.id} - ${PLAN_LABEL[inv.plan]} - ${fmtCOPFull(inv.total)}`)}`}
                          target="_blank" rel="noreferrer"
                          className="p-1.5 rounded-lg hover:bg-green-500/10 text-white/40 hover:text-green-400 transition-colors" title="Enviar comprobante WhatsApp">
                          <MessageCircle size={12}/>
                        </a>
                        <button onClick={() => { if (typeof window !== "undefined") window.print(); }} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="Imprimir"><Printer size={12}/></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payments history */}
          {userPayments.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                  <CreditCard size={14} style={{ color:"#fbbf24" }}/>
                  <p className="font-black text-white text-sm">Historial de pagos</p>
                </div>
                <span className="text-[10px] text-white/40">{userPayments.length} transacciones</span>
              </div>
              <div className="divide-y" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                {userPayments.map(pmt => {
                  const p = PLANS.find(x => x.id === pmt.plan)!;
                  return (
                    <div key={pmt.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-mono text-[10px] text-white/60">{pmt.referencia}</p>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${pmt.estado==="aprobado"?"bg-green-500/10 text-green-400 border border-green-500/25":pmt.estado==="pendiente"?"bg-yellow-500/10 text-yellow-400 border border-yellow-500/25":"bg-red-500/10 text-red-400 border border-red-500/25"}`}>
                            {pmt.estado.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/40">{pmt.metodo.toUpperCase()} · {pmt.fecha} {pmt.hora}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-[12px]" style={{ color:p.color }}>{fmtCOPFull(pmt.monto)}</p>
                        <p className="text-[9px] text-white/30">Plan {PLAN_LABEL[pmt.plan]}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upgrade prompt */}
          {!isCivac && planActual !== "platino" && (
            <button onClick={() => setActiveTab("planes")}
              className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-[13px] transition-all hover:scale-[1.01]"
              style={{ background:`linear-gradient(135deg,${actualInfo.from},${actualInfo.to})`, color:actualInfo.textColor, boxShadow:`0 4px 24px rgba(${actualInfo.glow},0.35)` }}>
              <ArrowUpRight size={15}/> Mejorar mi plan
            </button>
          )}
        </div>
      )}

      {/* ══════════════════ TAB: VENTAS ══════════════════ */}
      {activeTab === "ventas" && (
        <div className="space-y-4">
          {/* WhatsApp primary CTA */}
          <div className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background:"linear-gradient(135deg,rgba(37,211,102,0.08),rgba(37,211,102,0.03))", border:"1px solid rgba(37,211,102,0.2)" }}>
            <div className="absolute right-4 top-4 text-7xl opacity-10">💬</div>
            <div className="relative">
              <p className="font-black text-white text-xl mb-1">Habla con un asesor CIVAC</p>
              <p className="text-[12px] text-white/55 mb-4 max-w-md">
                Nuestro equipo comercial te ayuda a elegir el plan ideal para tu finca. Respuesta inmediata por WhatsApp · Lunes a Sábado 8am–8pm Colombia.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola CIVAC! Quiero información sobre planes de GanaderIA para mi finca")}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[13px] transition-all hover:scale-[1.02]"
                  style={{ background:"#25d366", color:"#000", boxShadow:"0 4px 20px rgba(37,211,102,0.4)" }}>
                  <MessageCircle size={16}/> WhatsApp · +57 318 735 1262
                </a>
                <a href={`mailto:${CIVAC_EMAIL}?subject=Información planes CIVAC GanaderIA`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[12px] border border-white/20 hover:bg-white/5 transition-all text-white">
                  <Mail size={14}/> {CIVAC_EMAIL}
                </a>
              </div>
            </div>
          </div>

          {/* Contact cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon:<MessageCircle size={18}/>, title:"WhatsApp Ventas", val:"+57 318 735 1262", sub:"Asesora comercial disponible", color:"#25d366", href:`https://wa.me/${WA_NUMBER}` },
              { icon:<Mail size={18}/>,          title:"Email Comercial",  val:CIVAC_EMAIL,       sub:"Respuesta en < 2 horas",     color:"#00f5d4", href:`mailto:${CIVAC_EMAIL}` },
              { icon:<Phone size={18}/>,         title:"Línea Directa",   val:CIVAC_TEL,          sub:"Lun–Sáb 8am–8pm Colombia",  color:"#fbbf24", href:`tel:+573187351262` },
              { icon:<Globe size={18}/>,         title:"Portal CIVAC",    val:"www.civac.co",     sub:"Acceso completo a la plataforma", color:"#a855f7", href:"https://www.civac.co" },
            ].map(({ icon, title, val, sub, color, href }) => (
              <a key={title} href={href} target="_blank" rel="noreferrer"
                className="rounded-2xl p-4 flex items-center gap-3 transition-all hover:scale-[1.01] hover:bg-white/[0.02]"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:`${color}18`, border:`1px solid ${color}30`, color }}>
                  {icon}
                </div>
                <div>
                  <p className="font-black text-white text-[13px]">{title}</p>
                  <p className="font-semibold text-[12px]" style={{ color }}>{val}</p>
                  <p className="text-[10px] text-white/35">{sub}</p>
                </div>
                <ArrowUpRight size={14} className="ml-auto text-white/20"/>
              </a>
            ))}
          </div>

          {/* Send comprobante */}
          <div className="rounded-2xl p-5" style={{ background:"rgba(5,15,40,0.95)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <p className="font-black text-white text-sm mb-1">Enviar comprobante de pago</p>
            <p className="text-[11px] text-white/45 mb-4">Si ya realizaste tu pago, envíanos el comprobante por WhatsApp y confirmamos tu plan en minutos.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PLANS.filter(p => p.id !== "basico").map(p => (
                <a key={p.id}
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola CIVAC! Adjunto comprobante de pago para el Plan ${p.nombre} (${fmtCOP(RETAIL[p.id])}). Por favor confirmar activación.`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
                  style={{ background:`rgba(${p.glow},0.08)`, border:`1px solid rgba(${p.glow},0.2)`, color:p.color }}>
                  <MessageCircle size={12}/>
                  Enviar comprobante {p.nombre}
                </a>
              ))}
            </div>
          </div>

          {/* Corporativo */}
          <div className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background:"linear-gradient(135deg,rgba(205,127,50,0.08),rgba(205,127,50,0.03))", border:"1px solid rgba(205,127,50,0.2)" }}>
            <Crown size={40} className="absolute right-5 top-5 opacity-10 text-[#cd7f32]"/>
            <div className="relative">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background:"rgba(205,127,50,0.15)", border:"1px solid rgba(205,127,50,0.3)", color:"#cd7f32" }}>🏆 CORPORATIVO</span>
              <h3 className="font-black text-white text-base mt-2">Plan Platino · Instancia Dedicada</h3>
              <p className="text-[11px] text-white/50 mt-1 mb-4 max-w-md">
                Para grupos ganaderos y empresas con múltiples fincas. Branding propio, SLA 99.9%, capacitación presencial, manager de cuenta y API REST.
              </p>
              <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola CIVAC! Estoy interesado en el Plan Platino Corporativo para mi empresa ganadera. Me gustaría una demostración.")}`}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[12px] transition-all hover:scale-[1.02]"
                style={{ background:"linear-gradient(135deg,#92400e,#451a03)", color:"#cd7f32", border:"1px solid rgba(205,127,50,0.3)", boxShadow:"0 4px 20px rgba(205,127,50,0.2)" }}>
                <Crown size={14}/> Solicitar demo Platino
              </a>
            </div>
          </div>

          {/* Office info */}
          <div className="rounded-2xl p-4" style={{ background:"rgba(5,15,40,0.95)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <p className="font-black text-white text-sm mb-3">CIVAC SAS · Información comercial</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {[
                { icon:<MapPin size={11}/>,  val:"Bogotá, Colombia · Zona T" },
                { icon:<Globe size={11}/>,   val:`NIT: ${CIVAC_NIT}` },
                { icon:<Award size={11}/>,   val:"Resolución DIAN 18764 · 2024" },
                { icon:<Shield size={11}/>,  val:"ISO 27001 · DIAN Electrónica" },
              ].map(({ icon, val }) => (
                <div key={val} className="flex items-center gap-2 text-white/50">
                  <span style={{ color:"#00f5d4" }}>{icon}</span>
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
