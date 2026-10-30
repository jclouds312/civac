import { useState } from "react";
import {
  Monitor, Server, Database, Globe, BookOpen, Settings, Beef,
  MapPin, DollarSign, TreePine, Bell, LogOut, ChevronLeft,
  Menu, X, Shield, Activity, Cpu, Code, Layers, RefreshCw,
  Heart, Droplets, Dna, Package, Users, Navigation,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import DeveloperDashboard from "@/pages/developer-dashboard";
import ServerDashboard from "@/pages/server-dashboard";
import Dashboard from "@/pages/dashboard";
import Inventario from "@/pages/inventario";
import Produccion from "@/pages/produccion";
import Reproduccion from "@/pages/reproduccion";
import Genetica from "@/pages/genetica";
import Potreros from "@/pages/potreros";
import Gps from "@/pages/gps";
import GpsChips from "@/pages/gps-chips";
import Costos from "@/pages/costos";
import Prediccion from "@/pages/prediccion";
import Co2 from "@/pages/co2";
import Sanidad from "@/pages/sanidad";
import Trazabilidad from "@/pages/trazabilidad";
import Alertas from "@/pages/alertas";
import Documentacion from "@/pages/documentacion";
import Configuracion from "@/pages/configuracion";
import Pesaje from "@/pages/pesaje";
import Ficha from "@/pages/ficha";
import Lotes from "@/pages/lotes";
import Datos from "@/pages/datos";
import CivacAgent from "@/components/civac-agent";

type DevSection =
  | "hub" | "server"
  | "finca" | "inventario" | "produccion" | "reproduccion" | "genetica"
  | "potreros" | "gps" | "gps-chips" | "sanidad" | "trazabilidad"
  | "costos" | "prediccion" | "co2"
  | "alertas" | "pesaje" | "ficha" | "lotes" | "datos"
  | "documentacion" | "configuracion";

const NAV_GROUPS = [
  {
    label: "CORE DEV",
    items: [
      { id: "hub" as DevSection,    icon: Cpu,       label: "Hub Dev",       sub: "Dashboard principal",   c: "#00ff88" },
      { id: "server" as DevSection, icon: Server,    label: "Server Panel",  sub: "CIVAC Backend v8",      c: "#00f5d4" },
    ]
  },
  {
    label: "APLICACIÓN FINCA",
    items: [
      { id: "finca" as DevSection,       icon: Monitor,   label: "Vista Finca",   sub: "Dashboard cliente",     c: "#39ff7e" },
      { id: "inventario" as DevSection,  icon: Beef,      label: "Inventario",    sub: "Bovinos · RFID",        c: "#39ff7e" },
      { id: "produccion" as DevSection,  icon: Droplets,  label: "Producción",    sub: "Ordeños diarios",       c: "#00c8ff" },
      { id: "reproduccion" as DevSection,icon: Heart,     label: "Reproducción",  sub: "Partos · IA bovina",    c: "#ff6fd8" },
      { id: "genetica" as DevSection,    icon: Dna,       label: "Genética",      sub: "DEP · Pedigrí",         c: "#a855f7" },
      { id: "pesaje" as DevSection,      icon: Activity,  label: "Pesaje BT",     sub: "Báscula · BCS · GMD",   c: "#ff9a3c" },
      { id: "ficha" as DevSection,       icon: BookOpen,  label: "Ficha Animal",  sub: "Historia clínica",      c: "#fbbf24" },
      { id: "lotes" as DevSection,       icon: Layers,    label: "Lotes",         sub: "Movimiento de animales", c: "#86efac" },
    ]
  },
  {
    label: "CAMPO & SALUD",
    items: [
      { id: "potreros" as DevSection,    icon: MapPin,    label: "Potreros",      sub: "Rotación · Mapa CSS",   c: "#4ade80" },
      { id: "gps" as DevSection,         icon: Navigation,label: "GPS Bovino",    sub: "Real-time · Geovallado",c: "#0ea5e9" },
      { id: "gps-chips" as DevSection,   icon: Globe,     label: "GPS Chips",     sub: "Dispositivos · MQTT",   c: "#38bdf8" },
      { id: "sanidad" as DevSection,     icon: Shield,    label: "Sanidad",       sub: "Vacunas · Tratamientos",c: "#22c55e" },
      { id: "trazabilidad" as DevSection,icon: Package,   label: "Trazabilidad",  sub: "ICA · SINIGAN",         c: "#f97316" },
    ]
  },
  {
    label: "FINANZAS & IA",
    items: [
      { id: "costos" as DevSection,      icon: DollarSign,label: "Costos P&G",    sub: "Ingresos · Egresos",    c: "#fbbf24" },
      { id: "prediccion" as DevSection,  icon: Cpu,       label: "Predicción IA", sub: "Simulador 12 meses",    c: "#e879f9" },
      { id: "co2" as DevSection,         icon: TreePine,  label: "Huella CO₂",    sub: "IPCC 2019 · Bonos",     c: "#86efac" },
    ]
  },
  {
    label: "SISTEMA",
    items: [
      { id: "alertas" as DevSection,       icon: Bell,      label: "Alertas",       sub: "Centro notificaciones", c: "#ff6b35" },
      { id: "datos" as DevSection,         icon: Database,  label: "Centro Datos",  sub: "Export · Import · DB",  c: "#94a3b8" },
      { id: "documentacion" as DevSection, icon: BookOpen,  label: "Documentación", sub: "24 secciones",          c: "#60a5fa" },
      { id: "configuracion" as DevSection, icon: Settings,  label: "Configuración", sub: "Sistema · Finca",       c: "#64748b" },
    ]
  },
];

function renderSection(section: DevSection) {
  switch (section) {
    case "hub":          return <DeveloperDashboard />;
    case "server":       return <ServerDashboard />;
    case "finca":        return <Dashboard />;
    case "inventario":   return <Inventario />;
    case "produccion":   return <Produccion />;
    case "reproduccion": return <Reproduccion />;
    case "genetica":     return <Genetica />;
    case "pesaje":       return <Pesaje />;
    case "ficha":        return <Ficha />;
    case "lotes":        return <Lotes />;
    case "potreros":     return <Potreros />;
    case "gps":          return <Gps />;
    case "gps-chips":    return <GpsChips />;
    case "sanidad":      return <Sanidad />;
    case "trazabilidad": return <Trazabilidad />;
    case "costos":       return <Costos />;
    case "prediccion":   return <Prediccion />;
    case "co2":          return <Co2 />;
    case "alertas":      return <Alertas />;
    case "datos":        return <Datos />;
    case "documentacion":return <Documentacion />;
    case "configuracion":return <Configuracion />;
    default:             return <DeveloperDashboard />;
  }
}

export default function DevGate() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState<DevSection>("hub");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sideW = collapsed ? "w-[58px]" : "w-[232px]";

  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const current = allItems.find(i => i.id === active);

  return (
    <div className="min-h-screen flex" style={{
      background: "linear-gradient(145deg,#010c06,#020f08 50%,#010c06)",
      fontFamily: "'Space Grotesk','Sora',sans-serif",
    }}>
      {mobileOpen && <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 ${sideW} z-50 flex flex-col transition-all duration-200 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: "linear-gradient(180deg,#060e08 0%,#080f0a 50%,#050d07 100%)",
          borderRight: "1px solid rgba(0,255,136,0.12)",
          boxShadow: "2px 0 24px rgba(0,0,0,0.6)",
        }}>

        {/* Logo */}
        <div className="h-[64px] flex items-center justify-between px-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(0,255,136,0.08)" }}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#00ff88,#00d4ff)", boxShadow: "0 0 14px rgba(0,255,136,0.5)" }}>
                <Code size={16} style={{ color: "#010c06" }} />
              </div>
              {!collapsed && (
                <div>
                  <p className="font-black text-white text-[14px] leading-tight" style={{ fontFamily: "'Sora',sans-serif" }}>
                    CIVAC <span style={{ color: "#00ff88" }}>Dev</span>
                  </p>
                  <p className="text-[8px] font-bold tracking-widest" style={{ color: "rgba(0,255,136,0.45)" }}>DEVELOPER CONSOLE</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mx-auto w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#00ff88,#00d4ff)", boxShadow: "0 0 12px rgba(0,255,136,0.5)" }}>
              <Code size={15} style={{ color: "#010c06" }} />
            </div>
          )}
          <button className="hidden lg:flex p-1.5 rounded-lg transition-all text-white/20 hover:text-white/60 hover:bg-white/5"
            onClick={() => setCollapsed(!collapsed)}>
            <ChevronLeft size={13} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          <button className="lg:hidden p-1.5" style={{ color: "rgba(0,255,136,0.4)" }} onClick={() => setMobileOpen(false)}><X size={15} /></button>
        </div>

        {/* User badge */}
        {!collapsed && user && (
          <div className="px-2.5 py-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,255,136,0.06)" }}>
            <div className="flex items-center gap-2 px-2 py-2 rounded-[11px]"
              style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.10)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#00ff88,#00d4ff)", color: "#010c06", fontWeight: 900 }}>
                {user.nombre.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-white/80 truncate">{user.nombre.split(" ").slice(0, 3).join(" ")}</p>
                <p className="text-[8px] font-mono" style={{ color: "#00ff88" }}>⬡ CIVAC Developer</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: "#00ff88", boxShadow: "0 0 6px rgba(0,255,136,0.9)" }} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-3">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              {!collapsed && (
                <p className="text-[8px] uppercase font-black tracking-[0.25em] px-2 pb-1 pt-1"
                  style={{ color: "rgba(0,255,136,0.22)" }}>— {group.label} —</p>
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
                          background: isActive ? `${item.c}22` : "rgba(255,255,255,0.04)",
                          border: `1px solid ${item.c}${isActive ? "40" : "18"}`,
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
        <div className="px-2 pb-3 pt-2 flex-shrink-0" style={{ borderTop: "1px solid rgba(0,255,136,0.06)" }}>
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-[8px] font-mono mb-1" style={{ color: "rgba(0,255,136,0.2)" }}>
              <Code size={8} /> CIVAC Dev Console · v8
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
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? "lg:pl-[58px]" : "lg:pl-[232px]"}`}
        style={{ background: "linear-gradient(160deg,#010c06,#020f08 40%,#011008 70%,#010c06)" }}>

        {/* Topbar */}
        <header className="h-[54px] sticky top-0 z-30 flex items-center justify-between px-4 lg:px-5 flex-shrink-0"
          style={{
            background: "rgba(1,12,6,0.97)",
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(0,255,136,0.08)",
            boxShadow: "0 1px 20px rgba(0,0,0,0.4)",
          }}>
          <div className="flex items-center gap-2.5">
            <button className="lg:hidden text-white/50 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all"
              onClick={() => setMobileOpen(true)}>
              <Menu size={18} />
            </button>
            {current && (() => {
              const Icon = current.icon;
              return (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex w-7 h-7 items-center justify-center rounded-lg"
                    style={{ background: `${current.c}18`, border: `1px solid ${current.c}30`, color: current.c }}>
                    <Icon size={14} strokeWidth={2.2} />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[12px] font-bold text-white leading-tight">{current.label}</p>
                    <p className="text-[9px] font-mono" style={{ color: "rgba(0,255,136,0.3)" }}>{current.sub}</p>
                  </div>
                </div>
              );
            })()}
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold rounded-lg"
              style={{ color: "#00ff88", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)" }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00ff88" }} />
              Dev Mode Active
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:block text-xs font-mono" style={{ color: "rgba(0,255,136,0.3)" }}>{user?.email}</span>
            <div className="w-px h-4 hidden sm:block" style={{ background: "rgba(0,255,136,0.1)" }} />
            <button onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{ background: "rgba(255,80,80,0.07)", color: "#ff7070", border: "1px solid rgba(255,80,80,0.16)" }}>
              <LogOut size={11} /> <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-x-hidden pb-10">
          <div className="dev-gate-content civac-animate">
            {renderSection(active)}
          </div>
        </div>
      </main>

      <CivacAgent />
    </div>
  );
}
