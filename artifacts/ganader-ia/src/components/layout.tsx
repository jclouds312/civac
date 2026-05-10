import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Bell, List, Activity, ActivitySquare, Baby, Dna,
  Wheat, Package, TestTube, DollarSign, Users, LineChart, Leaf, Map,
  Settings, BookOpen, UserCircle, HelpCircle, Menu, X, Sun, Moon,
  LogOut, Download, Scale, ChevronDown, ChevronRight, Search,
  PanelLeftClose, PanelLeftOpen, Star, WifiOff, RefreshCw, Zap,
  Home, Smartphone, CreditCard,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useAppState } from "@/lib/data";
import { usePWA } from "@/lib/pwa";

interface LayoutProps { children: React.ReactNode; }

// ── Color palettes per section ────────────────────────────────────────────────
const SECTION_COLORS = {
  principal: {
    dot:    'bg-emerald-500',
    text:   'text-emerald-400',
    active: 'bg-emerald-500/15 border-l-emerald-500 text-emerald-200',
    icon:   'text-emerald-400',
    hover:  'hover:border-l-emerald-500/50',
  },
  animales: {
    dot:    'bg-green-500',
    text:   'text-green-400',
    active: 'bg-green-500/15 border-l-green-500 text-green-200',
    icon:   'text-green-400',
    hover:  'hover:border-l-green-500/50',
  },
  campo: {
    dot:    'bg-teal-500',
    text:   'text-teal-400',
    active: 'bg-teal-500/15 border-l-teal-500 text-teal-200',
    icon:   'text-teal-400',
    hover:  'hover:border-l-teal-500/50',
  },
  gestion: {
    dot:    'bg-amber-500',
    text:   'text-amber-400',
    active: 'bg-amber-500/15 border-l-amber-500 text-amber-200',
    icon:   'text-amber-400',
    hover:  'hover:border-l-amber-500/50',
  },
  ia: {
    dot:    'bg-purple-500',
    text:   'text-purple-400',
    active: 'bg-purple-500/15 border-l-purple-500 text-purple-200',
    icon:   'text-purple-400',
    hover:  'hover:border-l-purple-500/50',
  },
  sistema: {
    dot:    'bg-slate-500',
    text:   'text-slate-400',
    active: 'bg-slate-500/15 border-l-slate-500 text-slate-200',
    icon:   'text-slate-400',
    hover:  'hover:border-l-slate-500/50',
  },
} as const;

type SectionKey = keyof typeof SECTION_COLORS;

interface NavItemDef {
  href:    string;
  icon:    React.ComponentType<{ size?: number; className?: string }>;
  label:   string;
  badge?:  number;
  section: SectionKey;
}

interface SectionDef {
  id:    SectionKey;
  title: string;
  items: NavItemDef[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function usePersistedState<T>(key: string, init: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try { return JSON.parse(localStorage.getItem(`ganader_${key}`) ?? 'null') ?? init; }
    catch { return init; }
  });
  useEffect(() => {
    try { localStorage.setItem(`ganader_${key}`, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

// ── Layout component ──────────────────────────────────────────────────────────
export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen]   = useState(false);
  const [isMini,       setIsMini]         = usePersistedState<boolean>('nav_mini', false);
  const [collapsed,    setCollapsed]      = usePersistedState<Record<string, boolean>>('nav_collapsed', {});
  const [favorites,    setFavorites]      = usePersistedState<string[]>('nav_favorites', []);
  const [searchQuery,  setSearchQuery]    = useState('');
  const [showUserMenu, setShowUserMenu]   = useState(false);

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { animals, alertas, insumos, reproduccion } = useAppState();
  const pwa = usePWA();

  // ── Live badge counts ───────────────────────────────────────────────────────
  const alertasBadge = useMemo(() => alertas.filter(a => !a.resolved).length, [alertas]);
  const insumosBadge = useMemo(() => insumos.filter(i => i.stock < i.minimo).length, [insumos]);
  const reprodBadge  = useMemo(() => reproduccion.filter(r => r.dias <= 7).length, [reproduccion]);

  const avatarColors: Record<string, string> = {
    admin:  'bg-emerald-600',
    vet:    'bg-blue-600',
    field:  'bg-orange-500',
    viewer: 'bg-purple-600',
  };

  // ── Section definitions ─────────────────────────────────────────────────────
  const sections: SectionDef[] = useMemo(() => [
    {
      id: 'principal',
      title: 'Principal',
      items: [
        { href: '/',        icon: LayoutDashboard, label: 'Tablero KPIs', section: 'principal' },
        { href: '/alertas', icon: Bell,            label: 'Alertas',      section: 'principal', badge: alertasBadge || undefined },
      ],
    },
    {
      id: 'animales',
      title: 'Animales',
      items: [
        { href: '/inventario',  icon: List,           label: 'Inventario',        section: 'animales' },
        { href: '/ficha',       icon: ActivitySquare, label: 'Ficha Individual',  section: 'animales' },
        { href: '/reproduccion',icon: Baby,           label: 'Reproducción',      section: 'animales', badge: reprodBadge || undefined },
        { href: '/produccion',  icon: Activity,       label: 'Producción',        section: 'animales' },
        { href: '/pesaje',      icon: Scale,          label: 'Básculas y Pesaje', section: 'animales' },
        { href: '/genetica',    icon: Dna,            label: 'Genética',          section: 'animales' },
      ],
    },
    {
      id: 'campo',
      title: 'Campo',
      items: [
        { href: '/potreros',    icon: Map,   label: 'Potreros',    section: 'campo' },
        { href: '/alimentacion',icon: Wheat, label: 'Alimentación',section: 'campo' },
      ],
    },
    {
      id: 'gestion',
      title: 'Gestión',
      items: [
        { href: '/insumos',  icon: Package,      label: 'Insumos',          section: 'gestion', badge: insumosBadge || undefined },
        { href: '/semen',    icon: TestTube,     label: 'Semen y Embriones',section: 'gestion' },
        { href: '/costos',   icon: DollarSign,   label: 'Costos y P&G',     section: 'gestion' },
        { href: '/personal', icon: Users,        label: 'Personal',         section: 'gestion' },
      ],
    },
    {
      id: 'ia',
      title: 'Inteligencia IA',
      items: [
        { href: '/prediccion', icon: LineChart, label: 'Predicciones IA',   section: 'ia' },
        { href: '/co2',        icon: Leaf,      label: 'Huella de Carbono', section: 'ia' },
        { href: '/multifinca', icon: Map,       label: 'Multi-Finca',       section: 'ia' },
      ],
    },
    {
      id: 'sistema',
      title: 'Sistema',
      items: [
        { href: '/usuarios',      icon: UserCircle,  label: 'Usuarios',      section: 'sistema' },
        { href: '/configuracion', icon: Settings,    label: 'Configuración', section: 'sistema' },
        { href: '/documentacion', icon: BookOpen,    label: 'Documentación', section: 'sistema' },
        { href: '/manual',        icon: HelpCircle,  label: 'Manual de Uso', section: 'sistema' },
        { href: '/planes',        icon: CreditCard,  label: 'Planes',        section: 'sistema' },
      ],
    },
  ], [alertasBadge, insumosBadge, reprodBadge]);

  const allItems = useMemo(() => sections.flatMap(s => s.items), [sections]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return allItems.filter(i => i.label.toLowerCase().includes(q));
  }, [searchQuery, allItems]);

  const favoriteItems = useMemo(() =>
    favorites.map(h => allItems.find(i => i.href === h)).filter(Boolean) as NavItemDef[],
    [favorites, allItems]
  );

  const currentLabel = useMemo(() =>
    allItems.find(i => i.href === location)?.label ?? 'GanaderIA',
    [location, allItems]
  );

  const toggleFavorite = useCallback((href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => prev.includes(href) ? prev.filter(f => f !== href) : [...prev, href]);
  }, [setFavorites]);

  const toggleSection = useCallback((id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  }, [setCollapsed]);

  const isActive = (path: string) => location === path;

  // ── NavItem ─────────────────────────────────────────────────────────────────
  const renderNavItem = (item: NavItemDef, showStar = true) => {
    const active  = isActive(item.href);
    const isFav   = favorites.includes(item.href);
    const col     = SECTION_COLORS[item.section];
    const Icon    = item.icon;

    if (isMini && !isMobileOpen) {
      return (
        <Link key={item.href} href={item.href}>
          <div
            title={item.label}
            className={`relative flex items-center justify-center w-10 h-10 rounded-xl mx-auto my-0.5 cursor-pointer transition-all duration-150 ${
              active
                ? `bg-sidebar-accent border border-sidebar-border ${col.icon}`
                : 'text-sidebar-foreground/50 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground/90'
            }`}
          >
            <Icon size={17} />
            {(item.badge ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                {(item.badge ?? 0) > 9 ? '9+' : item.badge}
              </span>
            )}
          </div>
        </Link>
      );
    }

    return (
      <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
        <div className={`group relative flex items-center gap-2.5 px-3 py-[7px] rounded-lg mx-2 my-0.5 border-l-2 border-transparent cursor-pointer transition-all duration-150 ${
          active
            ? `${col.active} border-l-2`
            : `text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground ${col.hover}`
        }`}>
          <Icon size={15} className={`flex-shrink-0 transition-colors ${active ? col.icon : 'opacity-60 group-hover:opacity-90'}`} />
          <span className="flex-1 text-[12.5px] font-medium truncate leading-tight">{item.label}</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {(item.badge ?? 0) > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {(item.badge ?? 0) > 99 ? '99+' : item.badge}
              </span>
            )}
            {showStar && (
              <button
                onClick={(e) => toggleFavorite(item.href, e)}
                className={`p-0.5 rounded transition-all ${
                  isFav
                    ? 'opacity-100 text-amber-400'
                    : 'opacity-0 group-hover:opacity-60 text-sidebar-foreground/40 hover:text-amber-400'
                }`}
                title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Star size={10} className={isFav ? 'fill-amber-400' : ''} />
              </button>
            )}
          </div>
        </div>
      </Link>
    );
  };

  // ── Section ─────────────────────────────────────────────────────────────────
  const renderSection = (section: SectionDef) => {
    const col        = SECTION_COLORS[section.id];
    const isCollapsed = collapsed[section.id];
    const hasActive  = section.items.some(i => isActive(i.href));

    if (isMini && !isMobileOpen) {
      return (
        <div key={section.id} className="mb-1 flex flex-col items-center">
          <div className={`w-5 h-px ${col.dot} opacity-20 my-1`} />
          {section.items.map(item => renderNavItem(item, false))}
        </div>
      );
    }

    return (
      <div key={section.id} className="mb-1">
        <button
          onClick={() => toggleSection(section.id)}
          className={`w-full flex items-center gap-2 px-4 py-1.5 transition-colors group rounded-md ${
            hasActive ? col.text : 'text-sidebar-foreground/30 hover:text-sidebar-foreground/55'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${col.dot} ${hasActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'}`} />
          <span className="flex-1 text-[10px] uppercase font-bold tracking-widest text-left">{section.title}</span>
          <span className="text-[10px] opacity-40 group-hover:opacity-70 font-mono">{section.items.length}</span>
          {isCollapsed
            ? <ChevronRight size={10} className="opacity-40 group-hover:opacity-70" />
            : <ChevronDown  size={10} className="opacity-40 group-hover:opacity-70" />
          }
        </button>
        {!isCollapsed && section.items.map(item => renderNavItem(item))}
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-background text-foreground">

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ════════════════════ SIDEBAR ════════════════════ */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        bg-sidebar border-r border-sidebar-border
        transform transition-all duration-200 ease-in-out
        lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isMini && !isMobileOpen ? 'w-[60px]' : 'w-64'}
      `}>

        {/* ── Logo + mini toggle ── */}
        <div className={`h-14 flex items-center border-b border-sidebar-border flex-shrink-0 ${
          isMini && !isMobileOpen ? 'justify-center px-2' : 'justify-between px-4'
        }`}>
          {(!isMini || isMobileOpen) && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg flex-shrink-0">
                <Leaf size={13} className="text-white" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-sidebar-foreground tracking-tight leading-none block">
                  Ganader<span className="text-primary">IA</span>
                </span>
                <span className="text-[9px] text-sidebar-foreground/40 leading-none">Ganadería Inteligente</span>
              </div>
            </div>
          )}
          {isMini && !isMobileOpen && (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
              <Leaf size={13} className="text-white" />
            </div>
          )}
          <div className="flex items-center gap-0.5">
            <button
              className="hidden lg:flex text-sidebar-foreground/35 hover:text-sidebar-foreground/70 transition-colors p-1.5 rounded-md hover:bg-sidebar-accent/50"
              onClick={() => setIsMini(m => !m)}
              title={isMini ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              {isMini ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            </button>
            <button
              className="lg:hidden text-sidebar-foreground/50 p-1.5 rounded-md"
              onClick={() => setIsMobileOpen(false)}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── User badge ── */}
        {user && (!isMini || isMobileOpen) && (
          <div className="px-3 py-2 border-b border-sidebar-border/40 flex-shrink-0">
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-sidebar-accent/40">
              <div className={`w-7 h-7 rounded-full ${avatarColors[user.role]} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                {user.nombre.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-semibold text-sidebar-foreground truncate leading-tight">
                  {user.nombre.split(' ').slice(0, 2).join(' ')}
                </p>
                <p className="text-[10px] text-sidebar-foreground/45 truncate leading-tight">{user.cargo}</p>
              </div>
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${pwa.isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}
                title={pwa.isOnline ? 'En línea' : 'Sin conexión'}
              />
            </div>
          </div>
        )}
        {user && isMini && !isMobileOpen && (
          <div className="flex justify-center py-2 border-b border-sidebar-border/40 flex-shrink-0">
            <div
              title={`${user.nombre} · ${user.cargo}`}
              className={`relative w-8 h-8 rounded-full ${avatarColors[user.role]} flex items-center justify-center text-white font-bold text-sm cursor-default`}
            >
              {user.nombre.charAt(0)}
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-sidebar ${pwa.isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </div>
          </div>
        )}

        {/* ── Search ── */}
        {(!isMini || isMobileOpen) && (
          <div className="px-3 py-2 flex-shrink-0">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sidebar-foreground/30 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar módulo..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-7 py-1.5 text-[11.5px] bg-sidebar-accent/40 border border-sidebar-border/50 rounded-lg text-sidebar-foreground placeholder-sidebar-foreground/25 focus:outline-none focus:border-primary/40 focus:bg-sidebar-accent/70 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sidebar-foreground/30 hover:text-sidebar-foreground/60 transition-colors"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Nav content ── */}
        <div className={`flex-1 overflow-y-auto py-1 ${isMini && !isMobileOpen ? 'px-1' : ''}`}
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
        >
          {filteredItems ? (
            /* Search results */
            <div className="px-2 py-1">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6">
                  <Search size={20} className="text-sidebar-foreground/20" />
                  <p className="text-[11px] text-sidebar-foreground/30">Sin resultados para "{searchQuery}"</p>
                </div>
              ) : (
                filteredItems.map(item => renderNavItem(item))
              )}
            </div>
          ) : (
            <>
              {/* Favorites */}
              {favoriteItems.length > 0 && (!isMini || isMobileOpen) && (
                <div className="mb-1">
                  <div className="flex items-center gap-2 px-4 py-1.5">
                    <Star size={9} className="text-amber-400 fill-amber-400" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/60">Favoritos</span>
                  </div>
                  {favoriteItems.map(item => renderNavItem(item, false))}
                  <div className="mx-4 my-1.5 border-b border-sidebar-border/25" />
                </div>
              )}
              {/* Main sections */}
              {sections.map(section => renderSection(section))}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className={`flex-shrink-0 border-t border-sidebar-border/40 pt-2 pb-3 ${isMini && !isMobileOpen ? 'px-1' : 'px-3'}`}>

          {/* SW update */}
          {pwa.swUpdateAvailable && (!isMini || isMobileOpen) && (
            <button
              onClick={pwa.applyUpdate}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors mb-1"
            >
              <RefreshCw size={12} />
              <span>Nueva versión disponible</span>
              <span className="ml-auto text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded-full">Actualizar</span>
            </button>
          )}

          {/* Install PWA */}
          {pwa.isInstallable && (!isMini || isMobileOpen) && (
            <button
              onClick={pwa.install}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 transition-colors mb-1"
            >
              <Download size={12} />
              <span className="flex-1 text-left">Instalar app (PWA)</span>
              <Zap size={10} className="opacity-60" />
            </button>
          )}

          {/* Offline indicator */}
          {!pwa.isOnline && (!isMini || isMobileOpen) && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-900/20 text-amber-400 text-xs mb-1">
              <WifiOff size={12} />
              <span>Sin conexión · Modo offline</span>
            </div>
          )}

          {/* Mini footer icons */}
          {isMini && !isMobileOpen ? (
            <div className="flex flex-col items-center gap-1">
              {pwa.isInstallable && (
                <button title="Instalar app PWA" onClick={pwa.install}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-emerald-400 hover:bg-emerald-900/30 transition-colors">
                  <Download size={15} />
                </button>
              )}
              {pwa.swUpdateAvailable && (
                <button title="Actualizar app" onClick={pwa.applyUpdate}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-blue-400 hover:bg-blue-900/30 transition-colors">
                  <RefreshCw size={15} />
                </button>
              )}
              <button title="Cerrar sesión" onClick={logout}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sidebar-foreground/35 hover:bg-red-900/20 hover:text-red-400 transition-colors">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-sidebar-foreground/40 hover:bg-red-900/20 hover:text-red-400 transition-colors"
            >
              <LogOut size={13} />
              <span>Cerrar sesión</span>
              {!pwa.isOnline && <WifiOff size={11} className="ml-auto text-amber-500" />}
            </button>
          )}
        </div>
      </aside>

      {/* ════════════════════ MAIN ════════════════════ */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${
        isMini ? 'lg:pl-[60px]' : 'lg:pl-64'
      }`}>

        {/* ── Topbar ── */}
        <header className="h-14 border-b border-border bg-card/60 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-foreground p-1 rounded-md hover:bg-accent/50"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={19} />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <Home size={12} className="text-muted-foreground/50" />
              <ChevronRight size={11} className="text-muted-foreground/25" />
              <span className="text-foreground font-semibold">{currentLabel}</span>
            </div>

            {/* Date / offline pill */}
            <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-border">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pwa.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-[11px] text-muted-foreground">
                {pwa.isOnline
                  ? new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
                  : 'Sin conexión — modo offline'
                }
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* SW update */}
            {pwa.swUpdateAvailable && (
              <Button variant="ghost" size="sm" onClick={pwa.applyUpdate}
                className="hidden sm:flex text-xs text-blue-500 dark:text-blue-400 items-center gap-1.5 h-8 px-2">
                <RefreshCw size={12} />
                Actualizar
              </Button>
            )}

            {/* Install */}
            {pwa.isInstallable && (
              <Button variant="ghost" size="sm" onClick={pwa.install}
                className="hidden sm:flex text-xs text-emerald-600 dark:text-emerald-400 items-center gap-1.5 h-8 px-2">
                <Smartphone size={12} />
                Instalar
              </Button>
            )}

            {/* Offline */}
            {!pwa.isOnline && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[11px]">
                <WifiOff size={11} />
                <span>Offline</span>
              </div>
            )}

            {/* PWA standalone badge */}
            {pwa.isStandalone && (
              <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px]">
                <Zap size={10} />
                <span>PWA</span>
              </div>
            )}

            {/* Theme */}
            <Button variant="ghost" size="icon"
              onClick={toggleTheme}
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </Button>

            {/* Alerts bell */}
            <Link href="/alertas">
              <Button variant="ghost" size="icon" className="w-8 h-8 relative text-muted-foreground hover:text-foreground">
                <Bell size={15} />
                {alertasBadge > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                )}
              </Button>
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(v => !v)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className={`w-7 h-7 rounded-full ${avatarColors[user?.role ?? 'admin']} flex items-center justify-center text-white font-bold text-xs`}>
                  {user?.nombre?.charAt(0) ?? 'A'}
                </div>
                <span className="hidden sm:block text-[12.5px] font-medium text-foreground max-w-[80px] truncate">
                  {user?.nombre?.split(' ')[0]}
                </span>
                <ChevronDown size={11} className="text-muted-foreground" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/20">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-full ${avatarColors[user?.role ?? 'admin']} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                          {user?.nombre?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{user?.nombre}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{user?.cargo}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-1">
                      <Link href="/configuracion" onClick={() => setShowUserMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent/50 cursor-pointer text-foreground transition-colors">
                          <Settings size={13} />
                          Configuración
                        </div>
                      </Link>
                      <Link href="/documentacion" onClick={() => setShowUserMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent/50 cursor-pointer text-foreground transition-colors">
                          <BookOpen size={13} />
                          Documentación
                        </div>
                      </Link>
                      {pwa.isInstallable && (
                        <button
                          onClick={() => { pwa.install(); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        >
                          <Download size={13} />
                          Instalar app PWA
                        </button>
                      )}
                      <div className="my-1 border-t border-border" />
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={13} />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <div className="flex-1 p-4 lg:p-6 overflow-x-hidden pb-20 lg:pb-6">
          {children}
        </div>

        {/* ── Mobile bottom navigation bar ── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-sidebar/95 backdrop-blur-md border-t border-sidebar-border z-30">
          <div className="flex justify-around items-center px-1 py-1 safe-area-bottom">
            {[
              { href: '/',          icon: LayoutDashboard, label: 'Tablero',   badge: 0 },
              { href: '/alertas',   icon: Bell,            label: 'Alertas',   badge: alertasBadge },
              { href: '/inventario',icon: List,            label: 'Animales',  badge: 0 },
              { href: '/produccion',icon: Activity,        label: 'Producción',badge: 0 },
              { href: '/insumos',   icon: Package,         label: 'Insumos',   badge: insumosBadge },
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <div className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive(item.href)
                    ? 'text-emerald-400 bg-emerald-900/30'
                    : 'text-sidebar-foreground/40 hover:text-sidebar-foreground/70'
                }`}>
                  <item.icon size={20} />
                  <span className="text-[9px] font-medium leading-none">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </nav>
      </main>
    </div>
  );
}
