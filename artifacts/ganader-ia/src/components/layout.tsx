import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Bell, List, Activity, ActivitySquare, Baby, Dna,
  Wheat, Package, TestTube, DollarSign, Users, LineChart, Leaf, Map,
  Settings, BookOpen, UserCircle, HelpCircle, Menu, X, Sun, Moon,
  LogOut, ChevronDown, Download, Scale, Navigation, Wifi, Crown,
  Database, ChevronLeft, TrendingUp, MoreHorizontal, Home,
  Beef, Milk, FlaskConical, TreePine, BarChart3, Zap, Globe,
  ShieldCheck, FileText, CreditCard, Search
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

interface LayoutProps { children: React.ReactNode; }

// ── Module config: color + icon emoji + label ──────────────────────────────
const MODULES: Record<string, {
  from: string; to: string; glow: string;
  emoji: string; label: string; shortLabel: string;
}> = {
  '/':              { from:'#00f5d4', to:'#00c896', glow:'0,245,212',   emoji:'📊', label:'Dashboard PRO',       shortLabel:'Inicio' },
  '/alertas':       { from:'#ff4d6d', to:'#c9184a', glow:'255,77,109',  emoji:'🔔', label:'Alertas',             shortLabel:'Alertas' },
  '/inventario':    { from:'#39ff7e', to:'#00c850', glow:'57,255,126',  emoji:'🐄', label:'Inventario',          shortLabel:'Inventario' },
  '/ficha':         { from:'#00f5d4', to:'#00a8cc', glow:'0,245,212',   emoji:'📋', label:'Ficha Individual',    shortLabel:'Ficha' },
  '/reproduccion':  { from:'#ff6fd8', to:'#c026d3', glow:'255,111,216', emoji:'🔁', label:'Reproducción',        shortLabel:'Reprod.' },
  '/produccion':    { from:'#00c8ff', to:'#0ea5e9', glow:'0,200,255',   emoji:'🥛', label:'Producción',          shortLabel:'Producción' },
  '/genetica':      { from:'#a855f7', to:'#7c3aed', glow:'168,85,247',  emoji:'🧬', label:'Genética y Pedigrí',  shortLabel:'Genética' },
  '/potreros':      { from:'#84ef34', to:'#65a30d', glow:'132,239,52',  emoji:'🌿', label:'Potreros',            shortLabel:'Potreros' },
  '/alimentacion':  { from:'#ffd166', to:'#f59e0b', glow:'255,209,102', emoji:'🌾', label:'Alimentación',        shortLabel:'Alimento' },
  '/pesaje':        { from:'#ff9a3c', to:'#ea580c', glow:'255,154,60',  emoji:'⚖️', label:'Pesaje Bluetooth',    shortLabel:'Pesaje' },
  '/insumos':       { from:'#fbbf24', to:'#d97706', glow:'251,191,36',  emoji:'💊', label:'Insumos y Medicinas', shortLabel:'Insumos' },
  '/semen':         { from:'#818cf8', to:'#4f46e5', glow:'129,140,248', emoji:'🧪', label:'Semen y Embriones',   shortLabel:'Semen' },
  '/costos':        { from:'#34d399', to:'#059669', glow:'52,211,153',  emoji:'💰', label:'Costos y P&G',        shortLabel:'Costos' },
  '/personal':      { from:'#94a3b8', to:'#64748b', glow:'148,163,184', emoji:'👥', label:'Personal',            shortLabel:'Personal' },
  '/prediccion':    { from:'#e879f9', to:'#9333ea', glow:'232,121,249', emoji:'🤖', label:'Predicciones IA',     shortLabel:'IA' },
  '/co2':           { from:'#4ade80', to:'#16a34a', glow:'74,222,128',  emoji:'🌱', label:'Huella de Carbono',   shortLabel:'CO₂' },
  '/multifinca':    { from:'#22d3ee', to:'#0891b2', glow:'34,211,238',  emoji:'🗺️', label:'Multi-Finca',         shortLabel:'Fincas' },
  '/gps':           { from:'#00c8ff', to:'#1d4ed8', glow:'0,200,255',   emoji:'📡', label:'Rastreo GPS',         shortLabel:'GPS' },
  '/usuarios':      { from:'#c084fc', to:'#7c3aed', glow:'192,132,252', emoji:'👤', label:'Usuarios',            shortLabel:'Usuarios' },
  '/configuracion': { from:'#9ca3af', to:'#6b7280', glow:'156,163,175', emoji:'⚙️', label:'Configuración',       shortLabel:'Config.' },
  '/documentacion': { from:'#38bdf8', to:'#0369a1', glow:'56,189,248',  emoji:'📚', label:'Documentación',       shortLabel:'Docs' },
  '/manual':        { from:'#2dd4bf', to:'#0d9488', glow:'45,212,191',  emoji:'📖', label:'Manual de Uso',       shortLabel:'Manual' },
  '/planes':        { from:'#fbbf24', to:'#ea580c', glow:'251,191,36',  emoji:'👑', label:'Planes · Wompi',      shortLabel:'Planes' },
  '/lotes':         { from:'#00c8ff', to:'#0891b2', glow:'0,200,255',   emoji:'🐂', label:'Movimiento Lotes',    shortLabel:'Lotes' },
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-[#00f5d4] text-black',
  vet: 'bg-[#00c8ff] text-black',
  field: 'bg-[#39ff7e] text-black',
  viewer: 'bg-[#c084fc] text-black',
};
const ROLE_LABELS: Record<string, string> = {
  admin:'Admin', vet:'Veterinario', field:'Campo', viewer:'Visor'
};

// ── CIVAC Pineapple Logo SVG ───────────────────────────────────────────────
function CivacLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#003d2e"/><stop offset="1" stopColor="#001a14"/></linearGradient>
        <linearGradient id="bd2" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#00f5d4"/><stop offset="1" stopColor="#00a070"/></linearGradient>
        <linearGradient id="bl2" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#39ff7e"/><stop offset="1" stopColor="#00c850"/></linearGradient>
        <filter id="gw2"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#bg2)"/>
      <ellipse cx="38" cy="24" rx="5" ry="13" fill="url(#bl2)" transform="rotate(-25 38 24)" filter="url(#gw2)"/>
      <ellipse cx="50" cy="19" rx="5" ry="15" fill="url(#bl2)" filter="url(#gw2)"/>
      <ellipse cx="62" cy="24" rx="5" ry="13" fill="url(#bl2)" transform="rotate(25 62 24)" filter="url(#gw2)"/>
      <ellipse cx="50" cy="63" rx="21" ry="27" fill="url(#bd2)" filter="url(#gw2)"/>
      <g opacity="0.22" stroke="#001a14" strokeWidth="1.2">
        <line x1="35" y1="42" x2="65" y2="84"/><line x1="43" y1="38" x2="70" y2="80"/>
        <line x1="28" y1="55" x2="72" y2="55"/><line x1="30" y1="65" x2="70" y2="65"/><line x1="33" y1="75" x2="67" y2="75"/>
      </g>
      <circle cx="50" cy="50" r="2.5" fill="white" opacity="0.85"/>
      <circle cx="40" cy="59" r="1.8" fill="white" opacity="0.6"/>
      <circle cx="60" cy="59" r="1.8" fill="white" opacity="0.6"/>
      <circle cx="50" cy="70" r="1.8" fill="white" opacity="0.5"/>
    </svg>
  );
}

// ── Module Icon Badge (colorful) ───────────────────────────────────────────
function ModuleIcon({ path, size = 28, textSize = 14 }: { path: string; size?: number; textSize?: number }) {
  const m = MODULES[path] || MODULES['/'];
  return (
    <div
      className="flex items-center justify-center flex-shrink-0 rounded-xl transition-all duration-200"
      style={{
        width: size, height: size, fontSize: textSize,
        background: `linear-gradient(135deg,${m.from},${m.to})`,
        boxShadow: `0 0 10px rgba(${m.glow},0.45)`,
      }}
    >
      {m.emoji}
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const mod = MODULES[location] || MODULES['/'];

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setInstallPrompt(e); (window as any).__pwaInstallPrompt = e; };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); setMoreOpen(false); }, [location]);

  const isActive = (p: string) => location === p;

  // ── Sidebar Nav Item ────────────────────────────────────────────────────
  const NavItem = ({ href, badge, accent, accentColor }: {
    href: string; badge?: number | string; accent?: string; accentColor?: string;
  }) => {
    const active = isActive(href);
    const m = MODULES[href] || MODULES['/'];
    return (
      <Link href={href} onClick={() => setMobileOpen(false)}>
        <div className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl mx-1.5 my-0.5 cursor-pointer group relative overflow-hidden transition-all duration-150`}
          style={active ? {
            background: `linear-gradient(135deg,${m.from}18,${m.to}0c)`,
            border: `1px solid ${m.from}30`,
            boxShadow: `0 0 14px rgba(${m.glow},0.12)`
          } : { border:'1px solid transparent' }}>
          {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{background:m.from, boxShadow:`0 0 8px ${m.from}80`}} />}

          {/* Colorful icon badge */}
          <div className={`flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 ${active ? '' : 'opacity-60 group-hover:opacity-90'}`}
            style={{
              width:28, height:28, fontSize:13,
              background: active
                ? `linear-gradient(135deg,${m.from},${m.to})`
                : 'rgba(255,255,255,0.06)',
              boxShadow: active ? `0 0 10px rgba(${m.glow},0.45)` : 'none',
            }}>
            <span style={active ? {filter:'drop-shadow(0 0 3px rgba(0,0,0,0.4))'} : {}}>{m.emoji}</span>
          </div>

          {!collapsed && (
            <>
              <span className={`flex-1 text-[12.5px] font-medium leading-none transition-colors truncate ${active ? 'text-white font-semibold' : 'text-white/50 group-hover:text-white/85'}`}>
                {m.label}
              </span>
              {badge != null && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white min-w-[18px] text-center">{badge}</span>
              )}
              {accent && !badge && (
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${accentColor || 'bg-[#00f5d4]/15 text-[#00f5d4] border-[#00f5d4]/25'}`}>{accent}</span>
              )}
            </>
          )}
        </div>
      </Link>
    );
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-0.5">
      {!collapsed && <p className="px-4 pt-3 pb-1 text-[9px] uppercase font-bold tracking-[0.15em] text-white/20">{title}</p>}
      {collapsed && <div className="mx-3 my-2 border-t border-white/8"/>}
      {children}
    </div>
  );

  const sideW = collapsed ? 'w-[58px]' : 'w-[220px]';

  // ── Mobile bottom nav tabs ─────────────────────────────────────────────
  const bottomTabs = [
    { href:'/', emoji:'📊', label:'Inicio' },
    { href:'/inventario', emoji:'🐄', label:'Ganado' },
    { href:'/produccion', emoji:'🥛', label:'Producción' },
    { href:'/alertas', emoji:'🔔', label:'Alertas', badge:4 },
    { href:'/pesaje', emoji:'⚖️', label:'Pesaje' },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground" style={{fontFamily:"'Space Grotesk','Sora',sans-serif"}}>
      {mobileOpen && <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* ── Desktop/Mobile Sidebar ──────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 ${sideW} z-50 flex flex-col border-r transition-all duration-250
        lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        border-white/6`}
        style={{background:'linear-gradient(180deg,#020d09 0%,#030f0b 100%)'}}>

        {/* Scan line */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0" style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,245,212,0.01) 3px,rgba(0,245,212,0.01) 4px)'}} />
        </div>

        {/* Logo */}
        <div className="h-[58px] flex items-center justify-between px-3 border-b border-white/6 flex-shrink-0 relative">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <CivacLogo size={34} />
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-black text-[17px] tracking-tight leading-none" style={{fontFamily:"'Sora',sans-serif"}}>
                    <span className="text-white">CI</span><span style={{color:'#00f5d4',textShadow:'0 0 10px rgba(0,245,212,0.7)'}}>VAC</span>
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{background:'linear-gradient(135deg,#fbbf24,#ea580c)',color:'white'}}>PRO</span>
                </div>
                <span className="text-[9px] text-white/30 leading-none">Ganadería Inteligente · Colombia</span>
              </div>
            </div>
          ) : (
            <div className="mx-auto"><CivacLogo size={32} /></div>
          )}
          <div className="flex items-center gap-0.5">
            <button className="hidden lg:flex p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <Menu size={14}/> : <ChevronLeft size={14}/>}
            </button>
            <button className="lg:hidden p-1.5 text-white/40" onClick={() => setMobileOpen(false)}><X size={16}/></button>
          </div>
        </div>

        {/* User badge */}
        {user && !collapsed && (
          <div className="px-2.5 py-2 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2 px-2 py-2 rounded-xl" style={{background:'rgba(0,245,212,0.05)',border:'1px solid rgba(0,245,212,0.1)'}}>
              <div className={`w-8 h-8 rounded-full ${ROLE_COLORS[user.role]} flex items-center justify-center font-black text-[12px] flex-shrink-0`}>
                {user.nombre.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-white/90 truncate leading-tight">{user.nombre.split(' ').slice(0,2).join(' ')}</p>
                <p className="text-[9px] leading-none mt-0.5" style={{color:'#00f5d4'}}>{ROLE_LABELS[user.role]} · {user.finca?.split(' ')[0]}</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full civac-pulse flex-shrink-0" style={{background:'#39ff7e',boxShadow:'0 0 6px rgba(57,255,126,0.8)'}}/>
            </div>
          </div>
        )}
        {user && collapsed && (
          <div className="flex justify-center py-2 border-b border-white/5 flex-shrink-0">
            <div className={`w-8 h-8 rounded-full ${ROLE_COLORS[user.role]} flex items-center justify-center font-black text-[12px]`}>
              {user.nombre.charAt(0)}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-1 scrollbar-thin">
          <Section title="Principal">
            <NavItem href="/" accent="LIVE" accentColor="bg-[#39ff7e]/15 text-[#39ff7e] border-[#39ff7e]/25"/>
            <NavItem href="/alertas" badge={4}/>
          </Section>
          <Section title="Animales">
            <NavItem href="/inventario"/>
            <NavItem href="/lotes" accent="NEW" accentColor="bg-[#00c8ff]/15 text-[#00c8ff] border-[#00c8ff]/25"/>
            <NavItem href="/ficha"/>
            <NavItem href="/reproduccion"/>
            <NavItem href="/produccion"/>
            <NavItem href="/genetica"/>
            <NavItem href="/pesaje" accent="BT" accentColor="bg-[#00c8ff]/15 text-[#00c8ff] border-[#00c8ff]/25"/>
          </Section>
          <Section title="Campo">
            <NavItem href="/potreros"/>
            <NavItem href="/alimentacion"/>
            <NavItem href="/gps" accent="GPS" accentColor="bg-[#00c8ff]/15 text-[#00c8ff] border-[#00c8ff]/25"/>
          </Section>
          <Section title="Gestión">
            <NavItem href="/insumos" badge={3}/>
            <NavItem href="/semen"/>
            <NavItem href="/costos"/>
            <NavItem href="/personal"/>
          </Section>
          <Section title="IA & Analytics">
            <NavItem href="/prediccion" accent="IA" accentColor="bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25"/>
            <NavItem href="/co2"/>
            <NavItem href="/multifinca"/>
          </Section>
          <Section title="Sistema">
            <NavItem href="/usuarios"/>
            <NavItem href="/configuracion"/>
            <NavItem href="/documentacion"/>
            <NavItem href="/manual"/>
            <NavItem href="/planes" accent="💳" accentColor="bg-amber-500/15 text-amber-400 border-amber-500/25"/>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-2.5 pb-3 pt-2 border-t border-white/5 space-y-1 flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-[9px] text-white/20">
              <Wifi size={9}/><span>CIVAC v3.0 · Offline PWA Ready</span>
            </div>
          )}
          {installPrompt && !collapsed && (
            <button onClick={() => { (installPrompt as any).prompt(); setInstallPrompt(null); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all"
              style={{color:'#00f5d4',background:'rgba(0,245,212,0.08)',border:'1px solid rgba(0,245,212,0.15)'}}>
              <Download size={13}/><span>Instalar app CIVAC</span>
            </button>
          )}
          <button onClick={logout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all ${collapsed?'justify-center':''}`}>
            <LogOut size={13}/>{!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-250 ${collapsed?'lg:pl-[58px]':'lg:pl-[220px]'}`}>

        {/* ── Topbar ─────────────────────────────────────────────────────── */}
        <header className="h-[54px] sticky top-0 z-30 flex items-center justify-between px-3 lg:px-5 border-b"
          style={{background:'rgba(2,13,9,0.95)',backdropFilter:'blur(24px)',borderColor:'rgba(0,245,212,0.08)'}}>
          <div className="flex items-center gap-2.5">
            {/* Mobile menu button */}
            <button className="lg:hidden text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all" onClick={() => setMobileOpen(true)}>
              <Menu size={20}/>
            </button>

            {/* Current module indicator */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex w-7 h-7 items-center justify-center rounded-lg text-base"
                style={{background:`linear-gradient(135deg,${mod.from},${mod.to})`, boxShadow:`0 0 10px rgba(${mod.glow},0.5)`}}>
                {mod.emoji}
              </div>
              <div className="hidden md:block">
                <p className="text-[13px] font-semibold text-white leading-tight">{mod.label}</p>
                <p className="text-[9px] text-white/35 leading-none">CIVAC PRO · {new Date().toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})}</p>
              </div>
            </div>

            {/* DB status pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold"
              style={{color:'#39ff7e',background:'rgba(57,255,126,0.08)',border:'1px solid rgba(57,255,126,0.2)'}}>
              <Database size={10}/><span>BD Sync</span>
            </div>

            {/* Offline badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold"
              style={{color:'#00c8ff',background:'rgba(0,200,255,0.08)',border:'1px solid rgba(0,200,255,0.2)'}}>
              <Wifi size={10}/><span>Offline PWA</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Install button */}
            {installPrompt && (
              <button onClick={() => { (installPrompt as any).prompt(); setInstallPrompt(null); }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                style={{color:'#00f5d4',background:'rgba(0,245,212,0.08)',border:'1px solid rgba(0,245,212,0.2)'}}>
                <Download size={12}/> Instalar
              </button>
            )}

            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="w-8 h-8 rounded-lg text-white/50 hover:text-white/90 hover:bg-white/5 transition-all flex items-center justify-center">
              {theme==='dark'?<Sun size={15}/>:<Moon size={15}/>}
            </button>

            {/* Alerts */}
            <Link href="/alertas">
              <button className="relative w-8 h-8 rounded-lg text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex items-center justify-center">
                <Bell size={15}/>
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full animate-pulse" style={{background:'#ff4d6d',boxShadow:'0 0 6px rgba(255,77,109,0.8)'}}/>
              </button>
            </Link>

            {/* PRO badge */}
            <Link href="/planes">
              <button className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                style={{color:'#fbbf24',background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.2)'}}>
                <span>👑</span> PRO
              </button>
            </Link>

            {/* User dropdown */}
            <div className="relative ml-0.5">
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl hover:bg-white/5 transition-all">
                <div className={`w-7 h-7 rounded-full ${ROLE_COLORS[user?.role||'admin']} flex items-center justify-center font-black text-[11px] shadow`}>
                  {user?.nombre?.charAt(0)||'C'}
                </div>
                <span className="text-[13px] font-medium text-white/80 hidden sm:block max-w-[70px] truncate">{user?.nombre?.split(' ')[0]}</span>
                <ChevronDown size={11} className="text-white/30"/>
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}/>
                  <div className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl shadow-2xl z-50 overflow-hidden border"
                    style={{background:'rgba(3,15,10,0.98)',backdropFilter:'blur(20px)',borderColor:'rgba(0,245,212,0.15)'}}>
                    <div className="px-4 py-3 border-b" style={{borderColor:'rgba(0,245,212,0.1)'}}>
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className={`w-9 h-9 rounded-full ${ROLE_COLORS[user?.role||'admin']} flex items-center justify-center font-black text-sm`}>
                          {user?.nombre?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">{user?.nombre?.split(' ').slice(0,2).join(' ')}</p>
                          <p className="text-[10px]" style={{color:'#00f5d4'}}>{ROLE_LABELS[user?.role||'admin']}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/35">{user?.finca}</p>
                    </div>
                    <div className="p-1">
                      {[
                        {href:'/configuracion', emoji:'⚙️', label:'Configuración'},
                        {href:'/usuarios',      emoji:'👤', label:'Gestión de usuarios'},
                        {href:'/documentacion', emoji:'📚', label:'Documentación'},
                        {href:'/planes',        emoji:'👑', label:'Planes CIVAC · Wompi', gold:true},
                      ].map(item=>(
                        <Link key={item.href} href={item.href} onClick={()=>setShowUserMenu(false)}>
                          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/5 cursor-pointer transition-all"
                            style={item.gold ? {color:'#fbbf24'} : {color:'rgba(255,255,255,0.7)'}}>
                            <span className="text-base">{item.emoji}</span>{item.label}
                          </div>
                        </Link>
                      ))}
                      <div className="border-t my-1" style={{borderColor:'rgba(255,255,255,0.06)'}}/>
                      <button onClick={()=>{logout();setShowUserMenu(false);}}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-all">
                        <LogOut size={14}/> Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ───────────────────────────────────────────────── */}
        <div className="flex-1 p-3 lg:p-5 overflow-x-hidden pb-20 lg:pb-5">
          {children}
        </div>

        {/* ── Mobile bottom navigation bar ──────────────────────────────── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t"
          style={{
            background:'rgba(2,13,9,0.97)',
            backdropFilter:'blur(24px)',
            borderColor:'rgba(0,245,212,0.12)',
            paddingBottom:'env(safe-area-inset-bottom,0px)',
            height:'64px',
          }}>
          {bottomTabs.map(tab => {
            const active = isActive(tab.href);
            const m = MODULES[tab.href];
            return (
              <Link key={tab.href} href={tab.href}>
                <div className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative cursor-pointer">
                  {/* Active glow line */}
                  {active && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                      style={{background:m.from, boxShadow:`0 0 8px rgba(${m.glow},0.9)`}}/>
                  )}
                  {/* Icon */}
                  <div className="relative flex items-center justify-center rounded-xl transition-all duration-200"
                    style={{
                      width:36, height:36, fontSize:18,
                      background: active
                        ? `linear-gradient(135deg,${m.from},${m.to})`
                        : 'rgba(255,255,255,0.05)',
                      boxShadow: active ? `0 0 14px rgba(${m.glow},0.5)` : 'none',
                      transform: active ? 'scale(1.1)' : 'scale(1)',
                    }}>
                    {tab.emoji}
                    {tab.badge && !active && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">{tab.badge}</span>
                    )}
                  </div>
                  <span className="text-[9px] font-medium leading-none transition-colors"
                    style={{color: active ? m.from : 'rgba(255,255,255,0.4)'}}>
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* "Más" button opens full sidebar */}
          <button onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 cursor-pointer">
            <div className="flex items-center justify-center rounded-xl transition-all"
              style={{width:36,height:36,background:'rgba(255,255,255,0.05)'}}>
              <Menu size={18} className="text-white/50"/>
            </div>
            <span className="text-[9px] font-medium text-white/40 leading-none">Más</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
