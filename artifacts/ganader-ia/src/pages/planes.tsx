import { useState } from "react";
import {
  Shield, CheckCircle2, Crown, Zap, Star, Leaf, Lock,
  ChevronRight, Award, Building2, Users, TrendingUp,
  DollarSign, Beef, Globe, Wifi, Download, Clock,
  CreditCard, Phone, Mail, MapPin, Package, BarChart3,
  Sparkles, Check, X as XIcon, ArrowUpRight,
} from "lucide-react";
import { useAuth, PLAN_LABEL, PLAN_COLOR, PLAN_ICON, type PlanId } from "@/lib/auth";

/* ── Plan definitions ────────────────────────────────────────────────────── */
const PLANS = [
  {
    id: "basico" as PlanId,
    nombre: "Básico",
    precio: 0,
    precioLabel: "Gratis",
    desc: "Para fincas pequeñas que empiezan",
    icon: <Leaf size={20}/>,
    color: "#94a3b8", glow: "148,163,184",
    from: "#64748b", to: "#475569",
    highlight: false,
    modulos: 5,
    animales: "Hasta 50",
    usuarios: "1",
    soporte: "Comunidad",
    features: [
      "Dashboard básico con 4 KPIs",
      "Inventario hasta 50 animales",
      "Registro de producción lechera",
      "Potreros (hasta 3 lotes)",
      "Alertas básicas del sistema",
      "Exportar datos en JSON",
      "App PWA instalable",
    ],
  },
  {
    id: "pro" as PlanId,
    nombre: "PRO",
    precio: 129_000,
    precioLabel: "$129K/mes",
    desc: "El más popular para fincas medianas",
    icon: <Zap size={20}/>,
    color: "#00f5d4", glow: "0,245,212",
    from: "#00f5d4", to: "#00a896",
    highlight: true,
    modulos: 17,
    animales: "Ilimitados",
    usuarios: "3",
    soporte: "Chat 9-6",
    features: [
      "Todo el plan Básico incluido",
      "Inventario ilimitado + RFID",
      "Pesaje Bluetooth (Tru-Test · Gallagher)",
      "GPS Ganado en tiempo real",
      "Reproducción y control de partos",
      "Genética y DEP ranking",
      "Insumos y Kardex farmacia",
      "Personal y nómina Colombia",
      "Costos P&G detallados",
      "Predicciones IA con sliders",
      "Multi-Finca (3 fincas)",
      "Semen criogénico + Embriones TE",
      "Alimentación TMR + minerales",
      "Huella CO₂ IPCC 2019",
      "Asesora IA con precios en vivo",
      "Centro de alertas avanzado",
      "Sincronización en la nube",
    ],
  },
  {
    id: "premium" as PlanId,
    nombre: "Premium",
    precio: 289_000,
    precioLabel: "$289K/mes",
    desc: "Para empresas ganaderas con escala",
    icon: <Star size={20}/>,
    color: "#a855f7", glow: "168,85,247",
    from: "#a855f7", to: "#7c3aed",
    highlight: false,
    modulos: 22,
    animales: "Ilimitados",
    usuarios: "10",
    soporte: "Prioritario 24/7",
    features: [
      "Todo el plan PRO incluido",
      "Multi-Finca ilimitada",
      "Google Drive sync automático",
      "API de integración REST",
      "Exportación Excel/PDF avanzada",
      "Usuarios adicionales (hasta 10)",
      "Historial 5 años completo",
      "Pesaje Manual + COM port",
      "Lotes y movimiento de ganado",
      "Data Warehouse completo",
      "Soporte prioritario 24/7",
    ],
  },
  {
    id: "platino" as PlanId,
    nombre: "Platino",
    precio: 890_000,
    precioLabel: "$890K/mes",
    desc: "Instancia dedicada para corporativos",
    icon: <Crown size={20}/>,
    color: "#f59e0b", glow: "245,158,11",
    from: "#fbbf24", to: "#d97706",
    highlight: false,
    modulos: 28,
    animales: "Ilimitados",
    usuarios: "∞",
    soporte: "Dedicado en finca",
    features: [
      "Todo el plan Premium incluido",
      "Instancia dedicada exclusiva",
      "Branding personalizado",
      "SLA de disponibilidad 99.9%",
      "Capacitación presencial en finca",
      "Integración básculas industriales",
      "Usuarios ilimitados + roles",
      "Módulos a medida",
      "Contrato empresarial anual",
      "Manager de cuenta asignado",
      "Reportes ejecutivos mensuales",
    ],
  },
];

const COMPARE_FEATURES = [
  { label: "Animales", values: ["50", "∞", "∞", "∞"] },
  { label: "Usuarios", values: ["1", "3", "10", "∞"] },
  { label: "Módulos activos", values: ["5", "17", "22", "28"] },
  { label: "GPS collares", values: [false, true, true, true] },
  { label: "Bluetooth BT", values: [false, true, true, true] },
  { label: "Predicciones IA", values: [false, true, true, true] },
  { label: "Multi-Finca", values: [false, "3", "∞", "∞"] },
  { label: "Google Drive", values: [false, false, true, true] },
  { label: "API REST", values: [false, false, true, true] },
  { label: "SLA 99.9%", values: [false, false, false, true] },
  { label: "Instancia dedicada", values: [false, false, false, true] },
];

const PAYMENT_METHODS = [
  { id:"wompi",  label:"Wompi",      icon:"💳", desc:"PSE, Nequi, Daviplata, Tarjetas" },
  { id:"nequi",  label:"Nequi",      icon:"📱", desc:"Pago inmediato desde la app" },
  { id:"bancol", label:"Bancolombia", icon:"🏦", desc:"Sucursal virtual o botón" },
  { id:"pse",    label:"PSE",         icon:"🔐", desc:"Débito bancario directo" },
];

function fmt(n: number) { return n.toLocaleString("es-CO"); }

export default function Planes() {
  const { user } = useAuth();
  const planActual = (user?.plan ?? "basico") as PlanId;
  const isAdmin    = user?.role === "admin" || user?.role === "superadmin";

  const [selectedPlan,  setSelectedPlan]  = useState<PlanId>(planActual);
  const [showPayment,   setShowPayment]   = useState(false);
  const [payMethod,     setPayMethod]     = useState("wompi");
  const [activeTab,     setActiveTab]     = useState<"planes"|"comparar"|"factura">("planes");
  const [showSuccess,   setShowSuccess]   = useState(false);

  const selectedInfo = PLANS.find(p => p.id === selectedPlan)!;
  const actualInfo   = PLANS.find(p => p.id === planActual)!;
  const isUpgrade    = PLANS.findIndex(p => p.id === selectedPlan) > PLANS.findIndex(p => p.id === planActual);

  const handleActivar = () => {
    setShowPayment(true);
  };

  const handlePay = () => {
    setShowPayment(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 pb-14">

      {/* ── Banner ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background:"linear-gradient(135deg,#071325,#0d2137 50%,#0a1c38)", border:`1px solid rgba(${actualInfo.glow},0.25)`, boxShadow:`0 0 60px rgba(${actualInfo.glow},0.06)` }}>
        <div className="absolute right-0 top-0 w-72 h-full opacity-10 pointer-events-none"
          style={{ background:`radial-gradient(ellipse at right, rgb(${actualInfo.glow}), transparent 70%)` }} />
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background:`linear-gradient(135deg,${actualInfo.from},${actualInfo.to})`, boxShadow:`0 0 24px rgba(${actualInfo.glow},0.5)`, color: planActual === "basico" || planActual === "premium" ? "#000" : "#fff" }}>
            <Shield size={24}/>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-xl text-white leading-tight" style={{ fontFamily:"'Sora',sans-serif" }}>
                Licencia CIVAC PRO
              </h1>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full"
                style={{ background:`linear-gradient(135deg,${actualInfo.from},${actualInfo.to})`, color: planActual === "basico" || planActual === "premium" ? "#000" : "#fff" }}>
                {actualInfo.icon} Plan {actualInfo.nombre}
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color:`rgba(${actualInfo.glow},0.6)` }}>
              {isAdmin ? "Administrador · Gestión de planes para todos los clientes" : `${user?.nombre} · ${actualInfo.modulos} módulos activos · ${actualInfo.animales} animales`}
            </p>
            {/* Mini stats */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {[
                { ico:"🐄", val:`${actualInfo.animales}`, lab:"Animales" },
                { ico:"📱", val:`${actualInfo.modulos}`, lab:"Módulos" },
                { ico:"👥", val:`${actualInfo.usuarios}`, lab:"Usuarios" },
                { ico:"🛡️", val:actualInfo.soporte, lab:"Soporte" },
              ].map(({ ico, val, lab }) => (
                <div key={lab} className="flex items-center gap-1.5">
                  <span className="text-base">{ico}</span>
                  <div>
                    <p className="text-[12px] font-black text-white leading-none">{val}</p>
                    <p className="text-[9px]" style={{ color:`rgba(${actualInfo.glow},0.45)` }}>{lab}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      {showSuccess && (
        <div className="rounded-2xl px-5 py-4 flex items-center gap-3 animate-pulse"
          style={{ background:"rgba(57,255,126,0.08)", border:"1px solid rgba(57,255,126,0.25)", color:"#39ff7e" }}>
          <CheckCircle2 size={18}/>
          <span className="font-bold text-sm">¡Plan actualizado exitosamente! Recargando módulos…</span>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {[["planes","Planes & Precios","🛡️"],["comparar","Comparar planes","📊"],["factura","Facturación","💳"]].map(([id,lbl,ico]) => (
          <button key={id} onClick={() => setActiveTab(id as "planes"|"comparar"|"factura")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all"
            style={{
              background: activeTab === id ? "rgba(0,245,212,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${activeTab === id ? "rgba(0,245,212,0.35)" : "rgba(255,255,255,0.08)"}`,
              color: activeTab === id ? "#00f5d4" : "rgba(255,255,255,0.45)",
              boxShadow: activeTab === id ? "0 0 14px rgba(0,245,212,0.12)" : "none",
            }}>
            {ico} {lbl}
          </button>
        ))}
      </div>

      {/* ── Tab: Planes ───────────────────────────────────────────────────── */}
      {activeTab === "planes" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {PLANS.map(plan => {
              const isActual   = plan.id === planActual;
              const isSelected = plan.id === selectedPlan;
              return (
                <div key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] relative overflow-hidden"
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg,rgba(${plan.glow},0.12),rgba(${plan.glow},0.05))`
                      : "linear-gradient(135deg,rgba(5,15,40,0.95),rgba(8,20,55,0.90))",
                    border: `1px solid rgba(${plan.glow},${isSelected ? 0.45 : 0.18})`,
                    boxShadow: isSelected ? `0 0 30px rgba(${plan.glow},0.15)` : "none",
                  }}>
                  {plan.highlight && (
                    <div className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{ background:`linear-gradient(90deg,transparent,${plan.color},transparent)` }} />
                  )}
                  {isActual && (
                    <div className="absolute top-3 right-3 text-[8px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background:`rgba(${plan.glow},0.2)`, color:plan.color, border:`1px solid rgba(${plan.glow},0.3)` }}>
                      ACTIVO
                    </div>
                  )}
                  {plan.highlight && !isActual && (
                    <div className="absolute top-3 right-3 text-[8px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background:`rgba(${plan.glow},0.2)`, color:plan.color }}>
                      🔥 POPULAR
                    </div>
                  )}

                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background:`linear-gradient(135deg,${plan.from},${plan.to})`, color: plan.id === "basico" || plan.id === "premium" ? "#000" : "#fff" }}>
                    {plan.icon}
                  </div>

                  <h3 className="font-black text-lg text-white">{plan.nombre}</h3>
                  <p className="text-[10px] mt-0.5" style={{ color:`rgba(${plan.glow},0.5)` }}>{plan.desc}</p>

                  <div className="mt-3 mb-4">
                    <span className="text-2xl font-black" style={{ color:plan.color }}>{plan.precioLabel}</span>
                    {plan.precio > 0 && <span className="text-[9px] text-white/25 ml-1">+ IVA</span>}
                  </div>

                  <ul className="space-y-1.5">
                    {plan.features.slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[10px] text-white/60">
                        <CheckCircle2 size={10} className="flex-shrink-0 mt-0.5" style={{ color:plan.color }}/>
                        {f}
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-[10px] font-bold" style={{ color:`rgba(${plan.glow},0.5)` }}>
                        +{plan.features.length - 5} más incluidos…
                      </li>
                    )}
                  </ul>

                  <div className="mt-4">
                    {isActual ? (
                      <div className="w-full text-center py-2 rounded-xl text-[11px] font-black"
                        style={{ background:`rgba(${plan.glow},0.08)`, border:`1px solid rgba(${plan.glow},0.2)`, color:plan.color }}>
                        ✓ Plan actual
                      </div>
                    ) : (
                      <button onClick={() => { setSelectedPlan(plan.id); setShowPayment(true); }}
                        className="w-full py-2 rounded-xl text-[11px] font-black transition-all hover:scale-[1.02]"
                        style={{
                          background:`linear-gradient(135deg,${plan.from},${plan.to})`,
                          color: plan.id === "basico" || plan.id === "premium" ? "#000" : "#fff",
                          boxShadow:`0 4px 16px rgba(${plan.glow},0.3)`,
                        }}>
                        {PLANS.findIndex(p=>p.id===plan.id) > PLANS.findIndex(p=>p.id===planActual) ? "Mejorar plan" : "Cambiar"}
                        <ChevronRight size={12} className="inline ml-1"/>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Features list for selected plan */}
          <div className="rounded-2xl p-5"
            style={{ background:`linear-gradient(135deg,rgba(5,15,40,0.95),rgba(8,20,55,0.90))`, border:`1px solid rgba(${selectedInfo.glow},0.2)` }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background:`linear-gradient(135deg,${selectedInfo.from},${selectedInfo.to})`, color: selectedInfo.id === "basico" || selectedInfo.id === "premium" ? "#000" : "#fff" }}>
                <Package size={14}/>
              </div>
              <div>
                <p className="font-black text-sm text-white">Incluido en plan {selectedInfo.nombre}</p>
                <p className="text-[9px]" style={{ color:`rgba(${selectedInfo.glow},0.5)` }}>{selectedInfo.features.length} características</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedInfo.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <CheckCircle2 size={11} className="flex-shrink-0 mt-0.5" style={{ color:selectedInfo.color }}/>
                  <span className="text-white/70">{f}</span>
                </div>
              ))}
            </div>
            {selectedInfo.id !== planActual && (
              <button onClick={handleActivar}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-[1.02]"
                style={{
                  background:`linear-gradient(135deg,${selectedInfo.from},${selectedInfo.to})`,
                  color: selectedInfo.id === "basico" || selectedInfo.id === "premium" ? "#000" : "#fff",
                  boxShadow:`0 4px 20px rgba(${selectedInfo.glow},0.35)`,
                }}>
                <ArrowUpRight size={15}/>
                {isUpgrade ? `Actualizar a ${selectedInfo.nombre}` : `Cambiar a ${selectedInfo.nombre}`} · {selectedInfo.precioLabel}
              </button>
            )}
          </div>
        </>
      )}

      {/* ── Tab: Comparar ─────────────────────────────────────────────────── */}
      {activeTab === "comparar" && (
        <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr style={{ background:"rgba(255,255,255,0.03)" }}>
                  <th className="px-4 py-3 text-left font-black text-white/50 text-[10px]">Característica</th>
                  {PLANS.map(p => (
                    <th key={p.id} className="px-4 py-3 text-center font-black text-[10px]"
                      style={{ color:p.color, borderBottom:`2px solid rgba(${p.glow},0.2)` }}>
                      {p.nombre}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_FEATURES.map((row, i) => (
                  <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background:i%2===0?"transparent":"rgba(255,255,255,0.01)" }}>
                    <td className="px-4 py-2.5 font-semibold text-white/60">{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="px-4 py-2.5 text-center">
                        {v === false ? (
                          <XIcon size={13} className="mx-auto" style={{ color:"rgba(255,255,255,0.15)" }}/>
                        ) : v === true ? (
                          <Check size={13} className="mx-auto" style={{ color:PLANS[j].color }}/>
                        ) : (
                          <span className="font-bold" style={{ color:PLANS[j].color }}>{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr style={{ background:"rgba(255,255,255,0.02)" }}>
                  <td className="px-4 py-3 font-black text-white/60 text-[10px]">Precio/mes</td>
                  {PLANS.map(p => (
                    <td key={p.id} className="px-4 py-3 text-center">
                      <span className="font-black text-sm" style={{ color:p.color }}>{p.precioLabel}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: Facturación ──────────────────────────────────────────────── */}
      {activeTab === "factura" && (
        <div className="space-y-4">
          {/* Current subscription */}
          <div className="rounded-2xl p-5"
            style={{ background:"linear-gradient(135deg,rgba(5,15,40,0.95),rgba(8,20,55,0.90))", border:`1px solid rgba(${actualInfo.glow},0.2)` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background:`linear-gradient(135deg,${actualInfo.from},${actualInfo.to})`, color: planActual === "basico" || planActual === "premium" ? "#000" : "#fff" }}>
                  <Shield size={18}/>
                </div>
                <div>
                  <p className="font-black text-white text-sm">Suscripción activa</p>
                  <p className="text-[10px]" style={{ color:`rgba(${actualInfo.glow},0.5)` }}>Plan {actualInfo.nombre} · {actualInfo.precioLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black"
                style={{ color:"#39ff7e" }}>
                <span className="w-2 h-2 rounded-full bg-[#39ff7e] animate-pulse"/>
                Activo
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon:Clock,      label:"Próxima factura", val:"26 Jun 2026" },
                { icon:Users,      label:"Usuarios activos", val:`1 / ${actualInfo.usuarios}` },
                { icon:Beef,       label:"Animales regist.", val:"13 / ∞" },
                { icon:TrendingUp, label:"Módulos usados",   val:`${actualInfo.modulos}` },
              ].map(({ icon:Icon, label, val }) => (
                <div key={label} className="rounded-xl p-3" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <Icon size={13} style={{ color:`rgba(${actualInfo.glow},0.6)` }}/>
                  <p className="font-black text-white text-sm mt-1">{val}</p>
                  <p className="text-[9px] text-white/35 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment methods */}
          <div className="rounded-2xl p-5"
            style={{ background:"rgba(5,15,40,0.95)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <p className="font-black text-sm text-white mb-3">Métodos de pago disponibles</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PAYMENT_METHODS.map(pm => (
                <div key={pm.id} className="rounded-xl p-3 text-center"
                  style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-2xl">{pm.icon}</span>
                  <p className="font-black text-xs text-white mt-1">{pm.label}</p>
                  <p className="text-[9px] text-white/30 mt-0.5">{pm.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-2xl p-5"
            style={{ background:"rgba(5,15,40,0.95)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <p className="font-black text-sm text-white mb-3">Contacto comercial CIVAC</p>
            <div className="space-y-2">
              {[
                { icon:Phone, val:"+57 (4) 448-1000", lab:"Línea comercial" },
                { icon:Mail,  val:"ventas@ganaderia.co", lab:"Email ventas" },
                { icon:Globe, val:"www.civac.co",  lab:"Portal web" },
                { icon:MapPin,val:"Medellín, Colombia", lab:"Oficina principal" },
              ].map(({ icon:Icon, val, lab }) => (
                <div key={lab} className="flex items-center gap-3 text-[11px]">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background:"rgba(0,245,212,0.08)", border:"1px solid rgba(0,245,212,0.15)" }}>
                    <Icon size={11} style={{ color:"#00f5d4" }}/>
                  </div>
                  <span className="text-white/80 font-semibold">{val}</span>
                  <span className="text-white/30">{lab}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Modal ─────────────────────────────────────────────────── */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.8)", backdropFilter:"blur(12px)" }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{ background:"rgba(4,15,26,0.99)", border:`1px solid rgba(${selectedInfo.glow},0.3)` }}>
            <div className="h-1" style={{ background:`linear-gradient(90deg,${selectedInfo.from},${selectedInfo.to})` }} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background:`linear-gradient(135deg,${selectedInfo.from},${selectedInfo.to})`, color: selectedInfo.id === "basico" || selectedInfo.id === "premium" ? "#000" : "#fff" }}>
                  <CreditCard size={18}/>
                </div>
                <div>
                  <p className="font-black text-white text-base">Activar plan {selectedInfo.nombre}</p>
                  <p className="text-[10px]" style={{ color:`rgba(${selectedInfo.glow},0.5)` }}>{selectedInfo.precioLabel} + IVA · Cancela cuando quieras</p>
                </div>
              </div>

              {/* Payment method select */}
              <p className="text-[11px] font-bold text-white/50 mb-2">Método de pago</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {PAYMENT_METHODS.map(pm => (
                  <button key={pm.id} onClick={() => setPayMethod(pm.id)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all"
                    style={{
                      background: payMethod === pm.id ? `rgba(${selectedInfo.glow},0.12)` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${payMethod === pm.id ? `rgba(${selectedInfo.glow},0.35)` : "rgba(255,255,255,0.07)"}`,
                      color: payMethod === pm.id ? selectedInfo.color : "rgba(255,255,255,0.5)",
                    }}>
                    <span className="text-base">{pm.icon}</span> {pm.label}
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="rounded-xl p-3 mb-4"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex justify-between text-[11px] text-white/50 mb-1">
                  <span>Plan {selectedInfo.nombre}</span><span>{selectedInfo.precioLabel}</span>
                </div>
                <div className="flex justify-between text-[11px] text-white/50 mb-2">
                  <span>IVA 19%</span><span>${fmt(Math.round(selectedInfo.precio * 0.19))}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white border-t border-white/8 pt-2">
                  <span>Total</span>
                  <span style={{ color:selectedInfo.color }}>${fmt(Math.round(selectedInfo.precio * 1.19))}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowPayment(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.4)" }}>
                  Cancelar
                </button>
                <button onClick={handlePay}
                  className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-[1.02]"
                  style={{
                    background:`linear-gradient(135deg,${selectedInfo.from},${selectedInfo.to})`,
                    color: selectedInfo.id === "basico" || selectedInfo.id === "premium" ? "#000" : "#fff",
                    boxShadow:`0 4px 20px rgba(${selectedInfo.glow},0.4)`,
                  }}>
                  Pagar con {PAYMENT_METHODS.find(p=>p.id===payMethod)?.label}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
