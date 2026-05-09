import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Bell, List, Activity, ActivitySquare, Baby, Dna,
  Wheat, Package, TestTube, DollarSign, Users, LineChart, Leaf, Map,
  Settings, BookOpen, UserCircle, HelpCircle, Menu, X, Sun, Moon,
  LogOut, ChevronDown, Download, Scale, Navigation, Wifi, Crown,
  Shield, Stethoscope, Eye, Database, CreditCard
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

interface LayoutProps { children: React.ReactNode; }

const MODULE_COLORS: Record<string, string> = {
  '/': 'from-emerald-600 to-teal-600',
  '/alertas': 'from-red-600 to-rose-600',
  '/inventario': 'from-green-600 to-emerald-600',
  '/ficha': 'from-teal-600 to-cyan-600',
  '/reproduccion': 'from-pink-600 to-rose-600',
  '/produccion': 'from-blue-600 to-cyan-600',
  '/genetica': 'from-violet-600 to-purple-600',
  '/potreros': 'from-lime-600 to-green-600',
  '/alimentacion': 'from-yellow-600 to-amber-600',
  '/pesaje': 'from-orange-600 to-amber-600',
  '/insumos': 'from-amber-600 to-orange-600',
  '/semen': 'from-indigo-600 to-blue-600',
  '/costos': 'from-emerald-700 to-green-600',
  '/personal': 'from-slate-600 to-gray-600',
  '/prediccion': 'from-purple-600 to-violet-600',
  '/co2': 'from-green-600 to-teal-600',
  '/multifinca': 'from-cyan-600 to-blue-600',
  '/gps': 'from-cyan-600 to-blue-700',
  '/usuarios': 'from-purple-700 to-indigo-600',
  '/configuracion': 'from-gray-600 to-slate-600',
  '/documentacion': 'from-sky-600 to-blue-600',
  '/manual': 'from-teal-600 to-cyan-600',
  '/planes': 'from-amber-500 to-orange-600',
};

const MODULE_BG: Record<string, string> = {
  '/': 'bg-emerald-500/15',
  '/alertas': 'bg-red-500/15',
  '/inventario': 'bg-green-500/15',
  '/ficha': 'bg-teal-500/15',
  '/reproduccion': 'bg-pink-500/15',
  '/produccion': 'bg-blue-500/15',
  '/genetica': 'bg-violet-500/15',
  '/potreros': 'bg-lime-500/15',
  '/alimentacion': 'bg-yellow-500/15',
  '/pesaje': 'bg-orange-500/15',
  '/insumos': 'bg-amber-500/15',
  '/semen': 'bg-indigo-500/15',
  '/costos': 'bg-emerald-500/15',
  '/personal': 'bg-slate-500/15',
  '/prediccion': 'bg-purple-500/15',
  '/co2': 'bg-green-500/15',
  '/multifinca': 'bg-cyan-500/15',
  '/gps': 'bg-cyan-500/15',
  '/usuarios': 'bg-purple-600/15',
  '/configuracion': 'bg-gray-500/15',
  '/documentacion': 'bg-sky-500/15',
  '/manual': 'bg-teal-500/15',
  '/planes': 'bg-amber-500/15',
};

const MODULE_TEXT: Record<string, string> = {
  '/': 'text-emerald-400',
  '/alertas': 'text-red-400',
  '/inventario': 'text-green-400',
  '/ficha': 'text-teal-400',
  '/reproduccion': 'text-pink-400',
  '/produccion': 'text-blue-400',
  '/genetica': 'text-violet-400',
  '/potreros': 'text-lime-400',
  '/alimentacion': 'text-yellow-400',
  '/pesaje': 'text-orange-400',
  '/insumos': 'text-amber-400',
  '/semen': 'text-indigo-400',
  '/costos': 'text-emerald-400',
  '/personal': 'text-slate-400',
  '/prediccion': 'text-purple-400',
  '/co2': 'text-green-400',
  '/multifinca': 'text-cyan-400',
  '/gps': 'text-cyan-400',
  '/usuarios': 'text-purple-400',
  '/configuracion': 'text-gray-400',
  '/documentacion': 'text-sky-400',
  '/manual': 'text-teal-400',
  '/planes': 'text-amber-400',
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Shield className="w-4 h-4" />,
  vet: <Stethoscope className="w-4 h-4" />,
  field: <Leaf className="w-4 h-4" />,
  viewer: <Eye className="w-4 h-4" />,
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-emerald-600",
  vet: "bg-blue-600",
  field: "bg-orange-500",
  viewer: "bg-purple-600",
};

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  vet: "Veterinario",
  field: "Campo",
  viewer: "Solo lectura",
};

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location === path;
  const modColor = MODULE_COLORS[location] || 'from-emerald-600 to-teal-600';
  const modText = MODULE_TEXT[location] || 'text-emerald-400';

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      (window as any).__pwaInstallPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    (installPrompt as any).prompt();
    setInstallPrompt(null);
  };

  const NavItem = ({ href, icon: Icon, label, badge, accent, accentColor }: {
    href: string; icon: any; label: string; badge?: number | string; accent?: string; accentColor?: string;
  }) => {
    const active = isActive(href);
    const bg = MODULE_BG[href] || 'bg-primary/15';
    const txt = MODULE_TEXT[href] || 'text-primary';
    return (
      <Link href={href} onClick={() => setIsMobileOpen(false)}>
        <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mx-2 my-0.5 transition-all cursor-pointer group ${
          active
            ? `${bg} ${txt} font-semibold border border-current/10 shadow-sm`
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        }`}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
            active
              ? `bg-gradient-to-br ${MODULE_COLORS[href] || 'from-primary to-primary'} shadow-md`
              : 'bg-sidebar-accent/40 group-hover:bg-sidebar-accent/70'
          }`}>
            <Icon size={13} className={active ? "text-white" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"} />
          </div>
          {!collapsed && (
            <>
              <span className="flex-1 text-[13px] leading-none">{label}</span>
              {badge != null && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {badge}
                </span>
              )}
              {accent && !badge && (
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${accentColor || 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                  {accent}
                </span>
              )}
            </>
          )}
        </div>
      </Link>
    );
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-1">
      {!collapsed && (
        <h3 className="px-5 text-[9px] uppercase font-bold text-sidebar-foreground/30 tracking-widest mb-1 mt-3">{title}</h3>
      )}
      {collapsed && <div className="mx-2 my-1 border-t border-sidebar-border/30" />}
      {children}
    </div>
  );

  const sidebarW = collapsed ? "w-[62px]" : "w-64";

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 ${sidebarW} bg-sidebar border-r border-sidebar-border z-50 transform transition-all duration-200 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        {/* Logo */}
        <div className="h-[58px] flex items-center justify-between px-3 border-b border-sidebar-border flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg flex-shrink-0">
                <Leaf size={15} className="text-white" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-[15px] text-sidebar-foreground tracking-tight leading-none block">
                  Ganader<span className="text-emerald-400">IA</span>
                  <span className="ml-1.5 text-[9px] font-bold bg-gradient-to-r from-amber-400 to-orange-400 text-transparent bg-clip-text">PRO</span>
                </span>
                <span className="text-[9px] text-sidebar-foreground/40 leading-none">Ganadería Inteligente</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg mx-auto">
              <Leaf size={15} className="text-white" />
            </div>
          )}
          <div className="flex items-center gap-1">
            <button className="hidden lg:flex text-sidebar-foreground/40 hover:text-sidebar-foreground p-1 rounded-md hover:bg-sidebar-accent/50 transition-colors" onClick={() => setCollapsed(!collapsed)}>
              <Menu size={15} />
            </button>
            <button className="lg:hidden text-sidebar-foreground/50 p-1" onClick={() => setIsMobileOpen(false)}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* User badge */}
        {user && !collapsed && (
          <div className="px-3 py-2.5 border-b border-sidebar-border/40 flex-shrink-0">
            <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-sidebar-accent/40">
              <div className={`w-8 h-8 rounded-full ${ROLE_COLORS[user.role]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow`}>
                {user.nombre.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-sidebar-foreground truncate leading-tight">{user.nombre.split(' ').slice(0,2).join(' ')}</p>
                <div className="flex items-center gap-1">
                  <span className={`text-[9px] ${MODULE_TEXT['/' + user.role] || 'text-emerald-400'}`}>{ROLE_LABEL[user.role]}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>
        )}
        {user && collapsed && (
          <div className="flex justify-center py-2 border-b border-sidebar-border/40 flex-shrink-0">
            <div className={`w-8 h-8 rounded-full ${ROLE_COLORS[user.role]} flex items-center justify-center text-white font-bold text-sm shadow`}>
              {user.nombre.charAt(0)}
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="py-1 overflow-y-auto flex-1 scrollbar-thin">
          <Section title="Principal">
            <NavItem href="/" icon={LayoutDashboard} label="Tablero KPIs" accent="PRO" accentColor="bg-emerald-500/20 text-emerald-400 border-emerald-500/30" />
            <NavItem href="/alertas" icon={Bell} label="Alertas" badge={4} />
          </Section>

          <Section title="Animales">
            <NavItem href="/inventario" icon={List} label="Inventario" />
            <NavItem href="/ficha" icon={ActivitySquare} label="Ficha Individual" />
            <NavItem href="/reproduccion" icon={Baby} label="Reproducción" />
            <NavItem href="/produccion" icon={Activity} label="Producción" />
            <NavItem href="/genetica" icon={Dna} label="Genética" />
            <NavItem href="/pesaje" icon={Scale} label="Pesaje Bluetooth" accent="BT" accentColor="bg-blue-500/20 text-blue-400 border-blue-500/30" />
          </Section>

          <Section title="Campo y Pastoreo">
            <NavItem href="/potreros" icon={Map} label="Potreros" />
            <NavItem href="/alimentacion" icon={Wheat} label="Alimentación" />
            <NavItem href="/gps" icon={Navigation} label="Rastreo GPS" accent="GPS" accentColor="bg-cyan-500/20 text-cyan-400 border-cyan-500/30" />
          </Section>

          <Section title="Gestión">
            <NavItem href="/insumos" icon={Package} label="Insumos / Kardex" badge={3} />
            <NavItem href="/semen" icon={TestTube} label="Semen y Embriones" />
            <NavItem href="/costos" icon={DollarSign} label="Costos y P&G" />
            <NavItem href="/personal" icon={Users} label="Personal" />
          </Section>

          <Section title="Inteligencia">
            <NavItem href="/prediccion" icon={LineChart} label="Predicciones IA" accent="IA" accentColor="bg-purple-500/20 text-purple-400 border-purple-500/30" />
            <NavItem href="/co2" icon={Leaf} label="Huella de Carbono" />
            <NavItem href="/multifinca" icon={Map} label="Multi-Finca" />
          </Section>

          <Section title="Sistema">
            <NavItem href="/usuarios" icon={UserCircle} label="Usuarios" />
            <NavItem href="/configuracion" icon={Settings} label="Configuración" />
            <NavItem href="/documentacion" icon={BookOpen} label="Documentación" />
            <NavItem href="/manual" icon={HelpCircle} label="Manual de Uso" />
            <NavItem href="/planes" icon={Crown} label="Planes y Precios" accent="Wompi" accentColor="bg-amber-500/20 text-amber-400 border-amber-500/30" />
          </Section>
        </div>

        {/* Footer */}
        <div className={`px-3 pb-3 flex-shrink-0 border-t border-sidebar-border/40 pt-2 space-y-1`}>
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-[9px] text-sidebar-foreground/35">
              <Wifi size={9} /><span>GanaderIA v3.0 PRO · Offline-ready PWA</span>
            </div>
          )}
          {installPrompt && !collapsed && (
            <button onClick={handleInstall}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-emerald-400 hover:bg-emerald-900/30 transition-colors">
              <Download size={13} /><span>Instalar app (PWA)</span>
            </button>
          )}
          <button onClick={logout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors ${collapsed ? 'justify-center' : ''}`}>
            <LogOut size={13} />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 transition-all duration-200 ${collapsed ? 'lg:pl-[62px]' : 'lg:pl-64'} flex flex-col min-h-screen`}>
        {/* Topbar */}
        <header className="h-[54px] border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-foreground" onClick={() => setIsMobileOpen(true)}>
              <Menu size={20} />
            </button>
            {/* Module color strip */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${modColor} shadow-md`} style={{backgroundSize:'200%'}}>
              <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
              <span className="text-[11px] text-white font-semibold">
                {new Date().toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>
            {/* DB status */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Database size={11} className="text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-medium">BD Online</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {installPrompt && (
              <Button variant="ghost" size="sm" onClick={handleInstall}
                className="text-xs text-emerald-600 dark:text-emerald-400 hidden sm:flex items-center gap-1.5 h-8 px-2">
                <Download size={12} /> Instalar
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={toggleTheme}
              className="w-8 h-8 text-muted-foreground hover:text-foreground" title={theme==='dark'?'Modo claro':'Modo oscuro'}>
              {theme==='dark' ? <Sun size={15} /> : <Moon size={15} />}
            </Button>
            <Link href="/alertas">
              <Button variant="ghost" size="icon" className="w-8 h-8 relative text-muted-foreground hover:text-foreground">
                <Bell size={15} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
              </Button>
            </Link>
            <Link href="/planes">
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1.5 h-8 px-2 text-amber-500 hover:text-amber-400 text-xs">
                <Crown size={12} /> PRO
              </Button>
            </Link>

            {/* User menu */}
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg hover:bg-accent/50 transition-colors">
                <div className={`w-7 h-7 rounded-full ${ROLE_COLORS[user?.role||'admin']} flex items-center justify-center text-white font-bold text-xs shadow`}>
                  {user?.nombre?.charAt(0)||'A'}
                </div>
                <span className="text-[13px] font-medium text-foreground hidden sm:block max-w-[90px] truncate">
                  {user?.nombre?.split(' ')[0]}
                </span>
                <ChevronDown size={11} className="text-muted-foreground" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/20">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-7 h-7 rounded-full ${ROLE_COLORS[user?.role||'admin']} flex items-center justify-center text-white font-bold text-xs`}>
                          {user?.nombre?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{user?.nombre?.split(' ').slice(0,2).join(' ')}</p>
                          <p className="text-xs text-muted-foreground">{user?.cargo}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{user?.finca}</p>
                    </div>
                    <div className="p-1">
                      <Link href="/configuracion" onClick={()=>setShowUserMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent/50 cursor-pointer">
                          <Settings size={14} className="text-muted-foreground"/> Configuración
                        </div>
                      </Link>
                      <Link href="/usuarios" onClick={()=>setShowUserMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent/50 cursor-pointer">
                          <UserCircle size={14} className="text-muted-foreground"/> Gestión de usuarios
                        </div>
                      </Link>
                      <Link href="/documentacion" onClick={()=>setShowUserMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent/50 cursor-pointer">
                          <BookOpen size={14} className="text-muted-foreground"/> Documentación
                        </div>
                      </Link>
                      <Link href="/planes" onClick={()=>setShowUserMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent/50 cursor-pointer text-amber-400">
                          <Crown size={14}/> Planes y Precios
                        </div>
                      </Link>
                      <div className="border-t border-border/50 my-1"/>
                      <button onClick={()=>{logout();setShowUserMenu(false);}}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors">
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
