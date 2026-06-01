import { useState } from "react";
import {
  TrendingUp, Users, Star, Bell, BookOpen, Settings, LogOut,
  ChevronLeft, Menu, X, Target, DollarSign, CreditCard,
  MessageSquare, BarChart3, Globe, Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import VentasDashboard from "@/pages/ventas-dashboard";
import Ventas from "@/pages/ventas";
import Planes from "@/pages/planes";
import Asesora from "@/pages/asesora";
import Alertas from "@/pages/alertas";
import Documentacion from "@/pages/documentacion";
import Usuarios from "@/pages/usuarios";
import CivacAgent from "@/components/civac-agent";

type SalesSection =
  | "dashboard" | "pipeline" | "planes" | "asesora"
  | "alertas" | "clientes" | "documentacion" | "configuracion";

const SALES_NAV = [
  {
    label: "CRM",
    items: [
      { id: "dashboard" as SalesSection,    icon: BarChart3,     label: "Dashboard",       sub: "KPIs · Métricas · Metas",  c: "#e879f9" },
      { id: "pipeline" as SalesSection,     icon: TrendingUp,    label: "Pipeline CRM",    sub: "Prospectos · Seguimiento", c: "#a855f7" },
    ]
  },
  {
    label: "COMERCIAL",
    items: [
      { id: "planes" as SalesSection,       icon: CreditCard,    label: "Planes & Precios",sub: "Básico · PRO · Platino",   c: "#fbbf24" },
      { id: "clientes" as SalesSection,     icon: Users,         label: "Clientes",        sub: "Cuentas · Demos · Leads",  c: "#60a5fa" },
    ]
  },
  {
    label: "HERRAMIENTAS",
    items: [
      { id: "asesora" as SalesSection,      icon: Star,          label: "Asesora IA",      sub: "Script · Objeciones · Tips",c: "#e879f9" },
      { id: "alertas" as SalesSection,      icon: Bell,          label: "Alertas",         sub: "Demos · Seguimientos",     c: "#ff6b35" },
      { id: "documentacion" as SalesSection,icon: BookOpen,      label: "Materiales",      sub: "Demos · Guías · Docs",     c: "#00c8ff" },
    ]
  },
];

function renderSection(section: SalesSection) {
  switch (section) {
    case "dashboard":     return <VentasDashboard />;
    case "pipeline":      return <Ventas />;
    case "planes":        return <Planes />;
    case "asesora":       return <Asesora />;
    case "alertas":       return <Alertas />;
    case "clientes":      return <Usuarios />;
    case "documentacion": return <Documentacion />;
    default:              return <VentasDashboard />;
  }
}

/* KPI strips shown in header */
function HeaderKpis() {
  const { user } = useAuth();
  const contacts: { estado: string; valor: number }[] = (() => {
    try { return JSON.parse(localStorage.getItem("civac_crm_contacts") || "[]"); } catch { return []; }
  })();
  const pipeline  = contacts.filter(c => !["comprador", "no_interesado"].includes(c.estado));
  const compradores = contacts.filter(c => c.estado === "comprador");
  const ingresos  = compradores.reduce((s, c) => s + c.valor, 0);
  const pipelineVal = pipeline.reduce((s, c) => s + c.valor, 0);

  const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}k`;

  const kpis = [
    { icon: TrendingUp, label: "Pipeline", val: fmt(pipelineVal), c: "#e879f9" },
    { icon: DollarSign, label: "Cerradas", val: fmt(ingresos),    c: "#39ff7e" },
    { icon: Users,      label: "Prospectos",val: `${pipeline.length}`, c: "#00c8ff" },
    { icon: Target,     label: "Meta",     val: "66%",            c: "#fbbf24" },
  ];

  return (
    <div className="hidden lg:flex items-center gap-3">
      {kpis.map(k => {
        const Icon = k.icon;
        return (
          <div key={k.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
            style={{ background: `${k.c}08`, border: `1px solid ${k.c}18` }}>
            <Icon size={11} style={{ color: k.c }} />
            <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>{k.label}</span>
            <span className="text-[11px] font-black" style={{ color: k.c }}>{k.val}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SalesGate() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState<SalesSection>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sideW = collapsed ? "w-[56px]" : "w-[224px]";

  const allItems = SALES_NAV.flatMap(g => g.items);
  const current = allItems.find(i => i.id === active);

  return (
    <div className="min-h-screen flex" style={{
      background: "linear-gradient(145deg,#0d0520,#100628 50%,#0a0318)",
      fontFamily: "'Space Grotesk','Sora',sans-serif",
    }}>
      {mobileOpen && <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 ${sideW} z-50 flex flex-col transition-all duration-200 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: "linear-gradient(180deg,#0c0520 0%,#0e0628 50%,#0b041e 100%)",
          borderRight: "1px solid rgba(232,121,249,0.12)",
          boxShadow: "2px 0 24px rgba(0,0,0,0.6)",
        }}>

        {/* Logo */}
        <div className="h-[64px] flex items-center justify-between px-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(232,121,249,0.08)" }}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#e879f9,#a855f7)", boxShadow: "0 0 14px rgba(232,121,249,0.5)" }}>
                <Zap size={16} style={{ color: "#fff" }} />
              </div>
              <div>
                <p className="font-black text-white text-[14px] leading-tight" style={{ fontFamily: "'Sora',sans-serif" }}>
                  CIVAC <span style={{ color: "#e879f9" }}>Sales</span>
                </p>
                <p className="text-[8px] font-bold tracking-widest" style={{ color: "rgba(232,121,249,0.45)" }}>CRM COLOMBIA</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#e879f9,#a855f7)", boxShadow: "0 0 12px rgba(232,121,249,0.5)" }}>
              <Zap size={15} style={{ color: "#fff" }} />
            </div>
          )}
          <button className="hidden lg:flex p-1.5 rounded-lg transition-all text-white/20 hover:text-white/60 hover:bg-white/5"
            onClick={() => setCollapsed(!collapsed)}>
            <ChevronLeft size={13} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          <button className="lg:hidden p-1.5" style={{ color: "rgba(232,121,249,0.4)" }} onClick={() => setMobileOpen(false)}><X size={15} /></button>
        </div>

        {/* User badge */}
        {!collapsed && user && (
          <div className="px-2.5 py-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(232,121,249,0.06)" }}>
            <div className="flex items-center gap-2 px-2 py-2 rounded-[11px]"
              style={{ background: "rgba(232,121,249,0.05)", border: "1px solid rgba(232,121,249,0.10)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#e879f9,#a855f7)", color: "#fff", fontWeight: 900 }}>
                {user.nombre.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-white/80 truncate">{user.nombre.split(" ").slice(0, 2).join(" ")}</p>
                <p className="text-[8px] font-mono" style={{ color: "#e879f9" }}>⬡ Asesora CIVAC</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                style={{ background: "#e879f9", boxShadow: "0 0 6px rgba(232,121,249,0.9)" }} />
            </div>
          </div>
        )}

        {/* Meta de hoy */}
        {!collapsed && (
          <div className="px-2.5 py-2.5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(232,121,249,0.06)" }}>
            <p className="text-[8px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: "rgba(232,121,249,0.3)" }}>Meta del mes</p>
            <div className="relative h-2 rounded-full overflow-hidden mb-1" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="absolute inset-y-0 left-0 rounded-full animated-bar"
                style={{ width: "66%", background: "linear-gradient(90deg,#e879f9,#a855f7)", boxShadow: "0 0 8px rgba(232,121,249,0.5)" }} />
            </div>
            <div className="flex justify-between">
              <span className="text-[9px] font-bold" style={{ color: "#e879f9" }}>$1.32M COP</span>
              <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>/ $2.0M</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-3">
          {SALES_NAV.map(group => (
            <div key={group.label}>
              {!collapsed && (
                <p className="text-[8px] uppercase font-black tracking-[0.25em] px-2 pb-1 pt-1"
                  style={{ color: "rgba(232,121,249,0.22)" }}>— {group.label} —</p>
              )}
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = active === item.id;
                  return (
                    <button key={item.id}
                      onClick={() => { setActive(item.id); setMobileOpen(false); }}
                      className="w-full flex items-center gap-2 px-2 py-2 transition-all group relative overflow-hidden"
                      style={{
                        borderRadius: 11,
                        background: isActive ? `${item.c}12` : "transparent",
                        border: isActive ? `1px solid ${item.c}28` : "1px solid transparent",
                      }}>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full"
                          style={{ background: item.c, boxShadow: `0 0 6px ${item.c}` }} />
                      )}
                      <div className="flex-shrink-0 flex items-center justify-center transition-all group-hover:scale-110"
                        style={{
                          width: 26, height: 26, borderRadius: 8,
                          background: isActive ? `${item.c}20` : "rgba(255,255,255,0.04)",
                          border: `1px solid ${item.c}${isActive ? "38" : "18"}`,
                          color: item.c,
                        }}>
                        <Icon size={13} strokeWidth={2.2} />
                      </div>
                      {!collapsed && (
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-[12px] truncate leading-tight"
                            style={{ color: isActive ? item.c : "rgba(255,255,255,0.55)", fontWeight: isActive ? 700 : 500 }}>
                            {item.label}
                          </p>
                          <p className="text-[9px] truncate" style={{ color: `${item.c}40` }}>{item.sub}</p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 pb-3 pt-2 flex-shrink-0" style={{ borderTop: "1px solid rgba(232,121,249,0.06)" }}>
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-[8px] font-mono mb-1" style={{ color: "rgba(232,121,249,0.2)" }}>
              <Globe size={8} /> CIVAC Sales · Colombia · v8
            </div>
          )}
          <button onClick={logout}
            className={`w-full flex items-center gap-2 px-2 py-2 text-xs text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all ${collapsed ? "justify-center" : ""}`}
            style={{ borderRadius: 10 }}>
            <LogOut size={13} />{!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? "lg:pl-[56px]" : "lg:pl-[224px]"}`}
        style={{ background: "linear-gradient(160deg,#0d0520,#100628 40%,#0e0525 70%,#0d0520)" }}>

        {/* Topbar */}
        <header className="h-[54px] sticky top-0 z-30 flex items-center justify-between px-4 lg:px-5 flex-shrink-0"
          style={{
            background: "rgba(13,5,32,0.97)",
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(232,121,249,0.08)",
            boxShadow: "0 1px 20px rgba(0,0,0,0.4)",
          }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-white/50 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all"
              onClick={() => setMobileOpen(true)}>
              <Menu size={18} />
            </button>
            {current && (() => {
              const Icon = current.icon;
              return (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex w-7 h-7 items-center justify-center rounded-lg"
                    style={{ background: `${current.c}18`, border: `1px solid ${current.c}28`, color: current.c }}>
                    <Icon size={14} strokeWidth={2.2} />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[12px] font-bold text-white leading-tight">{current.label}</p>
                    <p className="text-[9px]" style={{ color: "rgba(232,121,249,0.3)" }}>{current.sub}</p>
                  </div>
                </div>
              );
            })()}
            <HeaderKpis />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:block text-xs font-mono" style={{ color: "rgba(232,121,249,0.3)" }}>{user?.email}</span>
            <div className="w-px h-4 hidden sm:block" style={{ background: "rgba(232,121,249,0.1)" }} />
            <button onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{ background: "rgba(255,80,80,0.07)", color: "#ff7070", border: "1px solid rgba(255,80,80,0.16)" }}>
              <LogOut size={11} /> <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-x-hidden pb-10">
          <div className="sales-gate-content civac-animate">
            {renderSection(active)}
          </div>
        </div>
      </main>

      <CivacAgent />
    </div>
  );
}
