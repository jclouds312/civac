import { Switch, Route, Router as WouterRouter } from "wouter";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "./components/layout";
import CivacAgent from "./components/civac-agent";
import DevGate from "./components/dev-gate";
import SalesGate from "./components/sales-gate";
import NetworkSync from "./components/network-sync";
import Acerca from "./pages/acerca";
import PlanLanding from "./pages/plan-landing";
import InvitePage from "./pages/invite";
import { AppStateProvider } from "./lib/data";
import { AuthProvider, useAuth } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import NotFound from "@/pages/not-found";
import {
  Users, Crown, Activity, Server, LogOut, Menu, X,
  ChevronLeft, Shield, Globe, LayoutDashboard, Bell,
  Settings, CreditCard, Download, RefreshCw,
  Layers, BarChart3, Building2,
} from "lucide-react";

import Login from "./pages/login";
import ServerLogin from "./pages/server-login";
import ServerDashboard from "./pages/server-dashboard";
import Dashboard from "./pages/dashboard";
import AdminDashboard from "./pages/admin-dashboard";
import DeveloperDashboard from "./pages/developer-dashboard";
import Alertas from "./pages/alertas";
import Inventario from "./pages/inventario";
import Ficha from "./pages/ficha";
import Reproduccion from "./pages/reproduccion";
import Produccion from "./pages/produccion";
import Genetica from "./pages/genetica";
import Potreros from "./pages/potreros";
import Alimentacion from "./pages/alimentacion";
import Insumos from "./pages/insumos";
import Semen from "./pages/semen";
import Costos from "./pages/costos";
import Personal from "./pages/personal";
import Prediccion from "./pages/prediccion";
import Co2 from "./pages/co2";
import Multifinca from "./pages/multifinca";
import Usuarios from "./pages/usuarios";
import Configuracion from "./pages/configuracion";
import Documentacion from "./pages/documentacion";
import Manual from "./pages/manual";
import Pesaje from "./pages/pesaje";
import PesajeManual from "./pages/pesaje-manual";
import Gps from "./pages/gps";
import Planes from "./pages/planes";
import Lotes from "./pages/lotes";
import Datos from "./pages/datos";
import Asesora from "./pages/asesora";
import GpsChips from "./pages/gps-chips";
import Ventas from "./pages/ventas";
import VentasDashboard from "./pages/ventas-dashboard";
import Drive from "./pages/drive";
import Sanidad from "./pages/sanidad";
import Trazabilidad from "./pages/trazabilidad";

const queryClient = new QueryClient();

function HomeRoute() {
  const { user } = useAuth();
  if (user?.role === "admin" || user?.role === "superadmin") return <AdminDashboard />;
  if (user?.role === "developer") return <DeveloperDashboard />;
  if (user?.role === "sales") return <VentasDashboard />;
  return <Dashboard />;
}

const ADMIN_SECTIONS = [
  { id: "resumen",   icon: LayoutDashboard, label: "Resumen General",   sub: "KPIs y métricas",       emoji: "📊", from: "#00f5d4", to: "#00a896", glow: "0,245,212"   },
  { id: "cuentas",   icon: Users,           label: "Gestión Clientes",  sub: "Cuentas y accesos",     emoji: "👥", from: "#39ff7e", to: "#16a34a", glow: "57,255,126"  },
  { id: "planes",    icon: Crown,           label: "Planes & Precios",  sub: "Suscripciones",         emoji: "⭐", from: "#a78bfa", to: "#7c3aed", glow: "167,139,250" },
  { id: "pagos",     icon: CreditCard,      label: "Facturación",       sub: "Pagos y cobros",        emoji: "💳", from: "#fbbf24", to: "#ea580c", glow: "251,191,36"  },
  { id: "sesiones",  icon: Activity,        label: "Sesiones Activas",  sub: "Monitoreo en vivo",     emoji: "📡", from: "#00c8ff", to: "#0ea5e9", glow: "0,200,255"   },
  { id: "modulos",   icon: Layers,          label: "Módulos",           sub: "Control de accesos",    emoji: "🧩", from: "#e879f9", to: "#a855f7", glow: "232,121,249" },
  { id: "apis",      icon: Globe,           label: "Integraciones API", sub: "Conexiones externas",   emoji: "🔌", from: "#f97316", to: "#ea580c", glow: "249,115,22"  },
  { id: "basculas",  icon: Server,          label: "Básculas & Pesaje", sub: "Dispositivos BT/COM",   emoji: "⚖️", from: "#fb923c", to: "#f97316", glow: "251,146,60"  },
  { id: "reportes",  icon: BarChart3,       label: "Reportes",          sub: "Analíticas plataforma", emoji: "📈", from: "#facc15", to: "#eab308", glow: "250,204,21"  },
  { id: "finca",     icon: Building2,       label: "Datos Finca",       sub: "Configuración base",    emoji: "🏡", from: "#4ade80", to: "#22c55e", glow: "74,222,128"  },
  { id: "logs",      icon: Download,        label: "Logs & Auditoría",  sub: "Registro de eventos",   emoji: "📋", from: "#60a5fa", to: "#3b82f6", glow: "96,165,250"  },
  { id: "soporte",   icon: Bell,            label: "Soporte",           sub: "Tickets y ayuda",       emoji: "🎧", from: "#f472b6", to: "#ec4899", glow: "244,114,182" },
  { id: "seguridad", icon: Shield,          label: "Seguridad",         sub: "Permisos y accesos",    emoji: "🔒", from: "#34d399", to: "#10b981", glow: "52,211,153"  },
  { id: "sistema",   icon: RefreshCw,       label: "Sistema & Config",  sub: "Estado del servidor",   emoji: "⚙️", from: "#9ca3af", to: "#6b7280", glow: "156,163,175" },
];

function AdminGate() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("resumen");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sideW = collapsed ? "w-[60px]" : "w-[240px]";

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(145deg,#040d1a,#071325 50%,#040d1a)", fontFamily: "'Space Grotesk','Sora',sans-serif" }}>
      {mobileOpen && <div className="fixed inset-0 bg-black/75 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* ── Admin Sidebar ────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 ${sideW} z-50 flex flex-col border-r transition-all duration-250 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "linear-gradient(180deg,#06101f 0%,#09162c 50%,#06101f 100%)", borderColor: "rgba(255,149,0,0.18)", boxShadow: "2px 0 20px rgba(0,0,0,0.5)" }}>

        {/* Logo header */}
        <div className="h-[68px] flex items-center justify-between px-3 border-b flex-shrink-0"
          style={{ borderColor: "rgba(255,149,0,0.14)" }}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#ff9500,#ff6b00)", boxShadow: "0 0 16px rgba(255,149,0,0.5)" }}>
                <span className="text-lg">👑</span>
              </div>
              <div>
                <p className="font-black text-white text-[15px] leading-tight" style={{ fontFamily: "'Sora',sans-serif" }}>GanaderIA</p>
                <p className="text-[8px] font-bold px-1.5 py-0.5 rounded-md leading-none mt-0.5"
                  style={{ background: "linear-gradient(135deg,#ff9500,#ff6b00)", color: "white", letterSpacing: "0.06em" }}>SUPER ADMIN</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#ff9500,#ff6b00)", boxShadow: "0 0 12px rgba(255,149,0,0.45)" }}>
              <span className="text-base">👑</span>
            </div>
          )}
          <button className="hidden lg:flex p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
            onClick={() => setCollapsed(!collapsed)}>
            <ChevronLeft size={14} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.25s" }} />
          </button>
          <button className="lg:hidden p-1.5 text-white/40" onClick={() => setMobileOpen(false)}><X size={16}/></button>
        </div>

        {/* Admin user badge */}
        {!collapsed && user && (
          <div className="px-2.5 py-2 border-b flex-shrink-0" style={{ borderColor: "rgba(255,149,0,0.10)" }}>
            <div className="flex items-center gap-2 px-2.5 py-2.5 rounded-[13px]"
              style={{ background: "rgba(255,149,0,0.06)", border: "1px solid rgba(255,149,0,0.14)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#ff9500,#ff6b00)", color: "white" }}>
                {user.nombre.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-white/90 truncate leading-tight">
                  {user.nombre.split(" ").slice(0,2).join(" ")}
                </p>
                <p className="text-[9px] leading-none mt-0.5" style={{ color: "#ff9500" }}>
                  Administrador · Platino
                </p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                style={{ background: "#39ff7e", boxShadow: "0 0 8px rgba(57,255,126,0.9)" }} />
            </div>
          </div>
        )}

        {/* Navigation sections */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {!collapsed && (
            <p className="text-[9px] uppercase font-black tracking-[0.2em] px-2 pt-2 pb-1" style={{ color: "rgba(255,149,0,0.4)" }}>
              — Panel de control —
            </p>
          )}
          {collapsed && <div className="mx-2 my-2 border-t border-white/8" />}

          {ADMIN_SECTIONS.map(sec => {
            const Icon = sec.icon;
            const active = activeSection === sec.id;
            return (
              <button key={sec.id} onClick={() => { setActiveSection(sec.id); setMobileOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2 py-2 transition-all group relative overflow-hidden"
                style={{
                  borderRadius: 13,
                  background: active ? `linear-gradient(135deg,rgba(${sec.glow},0.14),rgba(${sec.glow},0.06))` : "transparent",
                  border: active ? `1px solid rgba(${sec.glow},0.35)` : "1px solid transparent",
                  boxShadow: active ? `0 0 18px rgba(${sec.glow},0.12)` : "none",
                }}>
                {!active && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-[13px]"
                    style={{ background: `rgba(${sec.glow},0.05)` }} />
                )}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ background: `linear-gradient(180deg,${sec.from},${sec.to})`, boxShadow: `0 0 8px ${sec.from}cc` }} />
                )}
                <div className="flex-shrink-0 flex items-center justify-center transition-all group-hover:scale-110"
                  style={{
                    width: 30, height: 30, borderRadius: 10,
                    background: active ? `linear-gradient(135deg,${sec.from},${sec.to})` : `rgba(${sec.glow},0.10)`,
                    border: active ? "none" : `1px solid rgba(${sec.glow},0.2)`,
                    color: active ? "#000" : sec.from,
                  }}>
                  <Icon size={15} strokeWidth={2.3} />
                </div>
                {!collapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[13px] leading-tight truncate"
                      style={{ color: active ? sec.from : "rgba(255,255,255,0.68)", fontWeight: active ? 700 : 500 }}>
                      {sec.label}
                    </p>
                    <p className="text-[9px] leading-none mt-0.5 truncate" style={{ color: `rgba(${sec.glow},0.45)` }}>
                      {sec.sub}
                    </p>
                  </div>
                )}
              </button>
            );
          })}

          {/* Separator */}
          <div className="mx-2 my-2 border-t" style={{ borderColor: "rgba(255,149,0,0.08)" }} />

          {/* Settings link */}
          <button onClick={() => setActiveSection("sistema")}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 text-white/30 hover:text-white/60 hover:bg-white/4 transition-all"
            style={{ borderRadius: 13 }}>
            <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Settings size={13} strokeWidth={2} />
            </div>
            {!collapsed && <span className="text-[12px]">Configuración global</span>}
          </button>
        </nav>

        {/* Footer */}
        <div className="px-2.5 pb-3 pt-2 border-t space-y-1 flex-shrink-0" style={{ borderColor: "rgba(255,149,0,0.08)" }}>
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-[9px]" style={{ color: "rgba(255,149,0,0.25)" }}>
              <Shield size={9}/> <span>CIVAC Platform v1.0 · Admin</span>
            </div>
          )}
          <button onClick={logout}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all ${collapsed ? "justify-center" : ""}`}
            style={{ borderRadius: 12 }}>
            <LogOut size={13}/>{!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-250 ${collapsed ? "lg:pl-[60px]" : "lg:pl-[240px]"}`}>

        {/* Admin topbar */}
        <header className="h-[56px] sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 border-b"
          style={{ background: "rgba(4,13,26,0.97)", backdropFilter: "blur(28px)", borderColor: "rgba(255,149,0,0.10)", boxShadow: "0 1px 20px rgba(0,0,0,0.35)" }}>
          <div className="flex items-center gap-2.5">
            <button className="lg:hidden text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all"
              onClick={() => setMobileOpen(true)}>
              <Menu size={20}/>
            </button>
            {/* Section title */}
            {(() => {
              const sec = ADMIN_SECTIONS.find(s => s.id === activeSection);
              if (!sec) return null;
              const Icon = sec.icon;
              return (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex w-8 h-8 items-center justify-center rounded-xl"
                    style={{ background: `linear-gradient(135deg,${sec.from},${sec.to})`, boxShadow: `0 0 14px rgba(${sec.glow},0.4)`, color: "#000" }}>
                    <Icon size={16} strokeWidth={2.3}/>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[13px] font-bold text-white leading-tight">{sec.label}</p>
                    <p className="text-[9px] leading-none" style={{ color: "rgba(255,149,0,0.4)" }}>CIVAC Admin · {new Date().toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              );
            })()}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold rounded-[10px]"
              style={{ color: "#39ff7e", background: "rgba(57,255,126,0.08)", border: "1px solid rgba(57,255,126,0.2)" }}>
              <Activity size={10}/><span>Sistema operativo</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:block text-xs text-white/30">{user?.email}</span>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: "rgba(255,80,80,0.08)", color: "#ff7070", border: "1px solid rgba(255,80,80,0.2)" }}>
              <LogOut size={12}/> <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Admin content */}
        <div className="flex-1 p-4 lg:p-6 overflow-x-hidden pb-10">
          <AdminDashboard activeTab={activeSection} onTabChange={setActiveSection} />
        </div>
      </main>

      {/* ── CIVAC Agent IA (Principal - único botón) ────── */}
      <CivacAgent />
    </div>
  );
}

function AuthGate() {
  const { user } = useAuth();

  if (!user) return <Login />;

  if (user.role === "admin" || user.role === "superadmin") return <AdminGate />;
  if (user.role === "developer") return <DevGate />;
  if (user.role === "sales") return <SalesGate />;

  return (
    <>
    <Layout>
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/alertas" component={Alertas} />
        <Route path="/inventario" component={Inventario} />
        <Route path="/ficha" component={Ficha} />
        <Route path="/reproduccion" component={Reproduccion} />
        <Route path="/produccion" component={Produccion} />
        <Route path="/genetica" component={Genetica} />
        <Route path="/potreros" component={Potreros} />
        <Route path="/alimentacion" component={Alimentacion} />
        <Route path="/insumos" component={Insumos} />
        <Route path="/semen" component={Semen} />
        <Route path="/costos" component={Costos} />
        <Route path="/personal" component={Personal} />
        <Route path="/prediccion" component={Prediccion} />
        <Route path="/co2" component={Co2} />
        <Route path="/multifinca" component={Multifinca} />
        <Route path="/usuarios" component={Usuarios} />
        <Route path="/configuracion" component={Configuracion} />
        <Route path="/documentacion" component={Documentacion} />
        <Route path="/manual" component={Manual} />
        <Route path="/pesaje" component={Pesaje} />
        <Route path="/pesaje-manual" component={PesajeManual} />
        <Route path="/gps" component={Gps} />
        <Route path="/planes" component={Planes} />
        <Route path="/lotes" component={Lotes} />
        <Route path="/datos" component={Datos} />
        <Route path="/ventas" component={Ventas} />
        <Route path="/drive" component={Drive} />
        <Route path="/asesora" component={Asesora} />
        <Route path="/gps-chips" component={GpsChips} />
        <Route path="/sanidad" component={Sanidad} />
        <Route path="/trazabilidad" component={Trazabilidad} />
        <Route path="/acerca" component={Acerca} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
    <CivacAgent />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppStateProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Switch>
                  <Route path="/plan/:planId" component={PlanLanding} />
                  <Route path="/invite/:token" component={InvitePage} />
                  <Route path="/server" component={ServerLogin} />
                  <Route path="/server-dashboard" component={ServerDashboard} />
                  <Route component={AuthGate} />
                </Switch>
              </WouterRouter>
              <Toaster />
              <NetworkSync />
            </AppStateProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
