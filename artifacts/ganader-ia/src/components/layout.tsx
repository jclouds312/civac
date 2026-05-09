import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Bell,
  List, Activity, ActivitySquare, Baby, Dna,
  Wheat, Package, TestTube,
  DollarSign, Users, LineChart, Leaf, Map,
  Settings, BookOpen, UserCircle, HelpCircle,
  Menu, X, Sun, Moon, LogOut, ChevronDown, Download,
  Scale, Navigation, Wifi
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

interface LayoutProps { children: React.ReactNode; }

const MODULE_COLORS: Record<string, string> = {
  '/': 'from-emerald-600 to-teal-600',
  '/alertas': 'from-red-600 to-rose-600',
  '/inventario': 'from-green-700 to-emerald-600',
  '/ficha': 'from-teal-600 to-cyan-600',
  '/reproduccion': 'from-pink-600 to-rose-600',
  '/produccion': 'from-blue-600 to-cyan-600',
  '/genetica': 'from-violet-600 to-purple-600',
  '/potreros': 'from-lime-600 to-green-600',
  '/alimentacion': 'from-yellow-600 to-amber-600',
  '/pesaje': 'from-orange-700 to-red-700',
  '/insumos': 'from-amber-600 to-orange-600',
  '/semen': 'from-indigo-600 to-blue-600',
  '/costos': 'from-emerald-700 to-green-600',
  '/personal': 'from-slate-600 to-gray-600',
  '/prediccion': 'from-purple-600 to-violet-600',
  '/co2': 'from-green-600 to-teal-600',
  '/multifinca': 'from-cyan-600 to-blue-600',
  '/gps': 'from-blue-700 to-indigo-700',
  '/usuarios': 'from-purple-700 to-indigo-600',
  '/configuracion': 'from-gray-600 to-slate-600',
  '/documentacion': 'from-sky-600 to-blue-600',
  '/manual': 'from-teal-600 to-cyan-600',
};

const MODULE_BG: Record<string, string> = {
  '/': 'bg-emerald-500/20',
  '/alertas': 'bg-red-500/20',
  '/inventario': 'bg-green-500/20',
  '/ficha': 'bg-teal-500/20',
  '/reproduccion': 'bg-pink-500/20',
  '/produccion': 'bg-blue-500/20',
  '/genetica': 'bg-violet-500/20',
  '/potreros': 'bg-lime-500/20',
  '/alimentacion': 'bg-yellow-500/20',
  '/pesaje': 'bg-orange-600/20',
  '/insumos': 'bg-amber-500/20',
  '/semen': 'bg-indigo-500/20',
  '/costos': 'bg-emerald-500/20',
  '/personal': 'bg-slate-500/20',
  '/prediccion': 'bg-purple-500/20',
  '/co2': 'bg-green-500/20',
  '/multifinca': 'bg-cyan-500/20',
  '/gps': 'bg-blue-600/20',
  '/usuarios': 'bg-purple-600/20',
  '/configuracion': 'bg-gray-500/20',
  '/documentacion': 'bg-sky-500/20',
  '/manual': 'bg-teal-500/20',
};

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location === path;

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    (installPrompt as any).prompt();
    setInstallPrompt(null);
  };

  const avatarColors: Record<string, string> = {
    admin: "bg-emerald-600",
    vet: "bg-blue-600",
    field: "bg-orange-500",
    viewer: "bg-purple-600",
  };

  const NavItem = ({ href, icon: Icon, label, badge, accent }: {
    href: string; icon: any; label: string; badge?: number | string; accent?: string;
  }) => {
    const active = isActive(href);
    const bg = MODULE_BG[href] || 'bg-primary/20';
    return (
      <Link href={href} onClick={() => setIsMobileOpen(false)}>
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mx-2 my-0.5 transition-all cursor-pointer group ${
          active
            ? `${bg} text-primary font-semibold border border-primary/20 shadow-sm`
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }`}>
          <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
            active ? `bg-gradient-to-br ${MODULE_COLORS[href] || 'from-primary to-primary'} shadow-sm` : 'bg-transparent group-hover:bg-sidebar-accent'
          }`}>
            <Icon size={14} className={active ? "text-white" : ""} />
          </div>
          <span className="flex-1 text-sm">{label}</span>
          {badge != null ? (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {badge}
            </span>
          ) : null}
          {accent && !badge && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{accent}</span>
          )}
        </div>
      </Link>
    );
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-3">
      <h3 className="px-5 text-[9px] uppercase font-bold text-sidebar-foreground/35 tracking-widest mb-1.5">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-200 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
              <Leaf size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-sidebar-foreground tracking-tight leading-none block">
                Ganader<span className="text-emerald-400">IA</span>
              </span>
              <span className="text-[10px] text-sidebar-foreground/40 leading-none">Ganadería Inteligente</span>
            </div>
          </div>
          <button className="lg:hidden text-sidebar-foreground/50" onClick={() => setIsMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* User badge */}
        {user && (
          <div className="px-3 py-2.5 border-b border-sidebar-border/50 flex-shrink-0">
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-sidebar-accent/50">
              <div className={`w-8 h-8 rounded-full ${avatarColors[user.role]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {user.nombre.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-sidebar-foreground truncate leading-tight">{user.nombre.split(' ').slice(0,2).join(' ')}</p>
                <p className="text-[10px] text-sidebar-foreground/50 truncate leading-tight">{user.cargo}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="En línea" />
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="py-3 overflow-y-auto flex-1">
          <Section title="Principal">
            <NavItem href="/" icon={LayoutDashboard} label="Tablero KPIs" accent="PRO" />
            <NavItem href="/alertas" icon={Bell} label="Alertas" badge={4} />
          </Section>

          <Section title="Animales">
            <NavItem href="/inventario" icon={List} label="Inventario" />
            <NavItem href="/ficha" icon={ActivitySquare} label="Ficha Individual" />
            <NavItem href="/reproduccion" icon={Baby} label="Reproducción" />
            <NavItem href="/produccion" icon={Activity} label="Producción" />
            <NavItem href="/genetica" icon={Dna} label="Genética" />
            <NavItem href="/pesaje" icon={Scale} label="Pesaje Bluetooth" accent="BT" />
          </Section>

          <Section title="Campo">
            <NavItem href="/potreros" icon={Map} label="Potreros" />
            <NavItem href="/alimentacion" icon={Wheat} label="Alimentación" />
            <NavItem href="/gps" icon={Navigation} label="Rastreo GPS" accent="GPS" />
          </Section>

          <Section title="Gestión">
            <NavItem href="/insumos" icon={Package} label="Insumos" badge={3} />
            <NavItem href="/semen" icon={TestTube} label="Semen y Embriones" />
            <NavItem href="/costos" icon={DollarSign} label="Costos y P&G" />
            <NavItem href="/personal" icon={Users} label="Personal" />
          </Section>

          <Section title="Inteligencia IA">
            <NavItem href="/prediccion" icon={LineChart} label="Predicciones IA" accent="IA" />
            <NavItem href="/co2" icon={Leaf} label="Huella de Carbono" />
            <NavItem href="/multifinca" icon={Map} label="Multi-Finca" />
          </Section>

          <Section title="Sistema">
            <NavItem href="/usuarios" icon={UserCircle} label="Usuarios" />
            <NavItem href="/configuracion" icon={Settings} label="Configuración" />
            <NavItem href="/documentacion" icon={BookOpen} label="Documentación" />
            <NavItem href="/manual" icon={HelpCircle} label="Manual de Uso" />
          </Section>
        </div>

        {/* Sidebar footer */}
        <div className="px-3 pb-4 flex-shrink-0 border-t border-sidebar-border/50 pt-3 space-y-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-sidebar-foreground/40">
            <Wifi size={10} />
            <span>GanaderIA v3.0 PRO · Offline-ready</span>
          </div>
          {installPrompt && (
            <button
              onClick={handleInstall}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-emerald-400 hover:bg-emerald-900/30 transition-colors"
            >
              <Download size={14} />
              <span>Instalar app (PWA)</span>
            </button>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <LogOut size={14} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-14 border-b border-border bg-card/60 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-foreground" onClick={() => setIsMobileOpen(true)}>
              <Menu size={22} />
            </button>
            {/* Module color strip */}
            <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-gradient-to-r ${MODULE_COLORS[location] || 'from-emerald-600 to-teal-600'} bg-opacity-20`}>
              <div className={`w-1.5 h-1.5 rounded-full bg-white animate-pulse`} />
              <span className="text-xs text-white font-medium">
                {new Date().toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {installPrompt && (
              <Button variant="ghost" size="sm" onClick={handleInstall} className="text-xs text-emerald-600 dark:text-emerald-400 hidden sm:flex items-center gap-1.5 h-8">
                <Download size={13} /> Instalar
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>

            <Link href="/alertas">
              <Button variant="ghost" size="icon" className="w-8 h-8 relative text-muted-foreground hover:text-foreground">
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
              </Button>
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className={`w-7 h-7 rounded-full ${avatarColors[user?.role || 'admin']} flex items-center justify-center text-white font-bold text-xs`}>
                  {user?.nombre?.charAt(0) || 'A'}
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:block max-w-[100px] truncate">
                  {user?.nombre?.split(' ')[0]}
                </span>
                <ChevronDown size={12} className="text-muted-foreground" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                      <p className="font-semibold text-sm text-foreground">{user?.nombre}</p>
                      <p className="text-xs text-muted-foreground">{user?.cargo}</p>
                      <p className="text-xs text-muted-foreground">{user?.finca}</p>
                    </div>
                    <div className="p-1">
                      <Link href="/configuracion" onClick={() => setShowUserMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent/50 cursor-pointer text-foreground">
                          <Settings size={14} /> Configuración
                        </div>
                      </Link>
                      <Link href="/usuarios" onClick={() => setShowUserMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent/50 cursor-pointer text-foreground">
                          <UserCircle size={14} /> Gestión de usuarios
                        </div>
                      </Link>
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={14} /> Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
