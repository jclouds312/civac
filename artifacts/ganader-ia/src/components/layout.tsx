import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Bell,
  List, Activity, ActivitySquare, Baby, Dna,
  Wheat, Package, TestTube,
  DollarSign, Users, LineChart, Leaf, Map,
  Settings, BookOpen, UserCircle, HelpCircle,
  Menu, X, Sun, Moon, LogOut, ChevronDown, Download, Scale
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

interface LayoutProps { children: React.ReactNode; }

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

  const NavItem = ({ href, icon: Icon, label, badge }: { href: string; icon: any; label: string; badge?: number }) => (
    <Link href={href} onClick={() => setIsMobileOpen(false)}>
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mx-2 my-0.5 transition-all cursor-pointer ${
        isActive(href)
          ? "bg-primary/20 text-primary font-semibold border border-primary/20"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}>
        <Icon size={17} className={isActive(href) ? "text-primary" : ""} />
        <span className="flex-1 text-sm">{label}</span>
        {badge ? (
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {badge}
          </span>
        ) : null}
      </div>
    </Link>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-3">
      <h3 className="px-5 text-[9px] uppercase font-bold text-sidebar-foreground/35 tracking-widest mb-1.5">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-200 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
              <Leaf size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-sidebar-foreground tracking-tight leading-none block">
                Ganader<span className="text-primary">IA</span>
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
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="py-3 overflow-y-auto flex-1">
          <Section title="Principal">
            <NavItem href="/" icon={LayoutDashboard} label="Tablero KPIs" />
            <NavItem href="/alertas" icon={Bell} label="Alertas" badge={4} />
          </Section>

          <Section title="Animales">
            <NavItem href="/inventario" icon={List} label="Inventario" />
            <NavItem href="/ficha" icon={ActivitySquare} label="Ficha Individual" />
            <NavItem href="/reproduccion" icon={Baby} label="Reproducción" />
            <NavItem href="/produccion" icon={Activity} label="Producción" />
            <NavItem href="/pesaje" icon={Scale} label="Básculas y Pesaje" />
            <NavItem href="/genetica" icon={Dna} label="Genética" />
          </Section>

          <Section title="Campo">
            <NavItem href="/potreros" icon={Map} label="Potreros" />
            <NavItem href="/alimentacion" icon={Wheat} label="Alimentación" />
          </Section>

          <Section title="Gestión">
            <NavItem href="/insumos" icon={Package} label="Insumos" badge={3} />
            <NavItem href="/semen" icon={TestTube} label="Semen y Embriones" />
            <NavItem href="/costos" icon={DollarSign} label="Costos y P&G" />
            <NavItem href="/personal" icon={Users} label="Personal" />
          </Section>

          <Section title="Inteligencia IA">
            <NavItem href="/prediccion" icon={LineChart} label="Predicciones IA" />
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

      {/* ── Main ── */}
      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-14 border-b border-border bg-card/60 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-foreground" onClick={() => setIsMobileOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {installPrompt && (
              <Button variant="ghost" size="sm" onClick={handleInstall} className="text-xs text-emerald-600 dark:text-emerald-400 hidden sm:flex items-center gap-1.5 h-8">
                <Download size={13} />
                Instalar
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>

            <Button variant="ghost" size="icon" className="w-8 h-8 relative text-muted-foreground hover:text-foreground">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
            </Button>

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
                          <Settings size={14} />
                          Configuración
                        </div>
                      </Link>
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={14} />
                        Cerrar sesión
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
