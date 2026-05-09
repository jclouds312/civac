import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Bell, List, Activity, ActivitySquare, Baby, Dna,
  Wheat, Package, TestTube, DollarSign, Users, LineChart, Leaf, Map,
  Settings, BookOpen, UserCircle, HelpCircle, Menu, X, Sun, Moon,
  LogOut, ChevronDown, Download, Scale, Navigation, Wifi, Crown,
  Shield, Stethoscope, Eye, Database, CreditCard, ChevronLeft,
  Zap, TrendingUp, Star
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

interface LayoutProps { children: React.ReactNode; }

// Neon color per module
const MODULE_NEON: Record<string, { from: string; to: string; text: string; glow: string }> = {
  '/':              { from:'#00f5d4', to:'#00c896', text:'text-[#00f5d4]', glow:'shadow-[0_0_12px_rgba(0,245,212,0.5)]' },
  '/alertas':       { from:'#ff4d6d', to:'#c9184a', text:'text-rose-400',  glow:'shadow-[0_0_12px_rgba(255,77,109,0.5)]' },
  '/inventario':    { from:'#39ff7e', to:'#00c850', text:'text-[#39ff7e]', glow:'shadow-[0_0_12px_rgba(57,255,126,0.5)]' },
  '/ficha':         { from:'#00f5d4', to:'#00a8cc', text:'text-teal-300',  glow:'shadow-[0_0_12px_rgba(0,245,212,0.4)]' },
  '/reproduccion':  { from:'#ff6fd8', to:'#c026d3', text:'text-pink-400',  glow:'shadow-[0_0_12px_rgba(255,111,216,0.5)]' },
  '/produccion':    { from:'#00c8ff', to:'#0ea5e9', text:'text-[#00c8ff]', glow:'shadow-[0_0_12px_rgba(0,200,255,0.5)]' },
  '/genetica':      { from:'#a855f7', to:'#7c3aed', text:'text-violet-400',glow:'shadow-[0_0_12px_rgba(168,85,247,0.5)]' },
  '/potreros':      { from:'#84ef34', to:'#65a30d', text:'text-lime-400',  glow:'shadow-[0_0_12px_rgba(132,239,52,0.5)]' },
  '/alimentacion':  { from:'#ffd166', to:'#f59e0b', text:'text-amber-300', glow:'shadow-[0_0_12px_rgba(255,209,102,0.4)]' },
  '/pesaje':        { from:'#ff9a3c', to:'#ea580c', text:'text-orange-400',glow:'shadow-[0_0_12px_rgba(255,154,60,0.5)]' },
  '/insumos':       { from:'#fbbf24', to:'#d97706', text:'text-yellow-400',glow:'shadow-[0_0_12px_rgba(251,191,36,0.4)]' },
  '/semen':         { from:'#818cf8', to:'#4f46e5', text:'text-indigo-400',glow:'shadow-[0_0_12px_rgba(129,140,248,0.4)]' },
  '/costos':        { from:'#34d399', to:'#059669', text:'text-emerald-400',glow:'shadow-[0_0_12px_rgba(52,211,153,0.4)]' },
  '/personal':      { from:'#94a3b8', to:'#64748b', text:'text-slate-400', glow:'shadow-[0_0_12px_rgba(148,163,184,0.3)]' },
  '/prediccion':    { from:'#e879f9', to:'#9333ea', text:'text-fuchsia-400',glow:'shadow-[0_0_12px_rgba(232,121,249,0.5)]' },
  '/co2':           { from:'#4ade80', to:'#16a34a', text:'text-green-400', glow:'shadow-[0_0_12px_rgba(74,222,128,0.4)]' },
  '/multifinca':    { from:'#22d3ee', to:'#0891b2', text:'text-cyan-400',  glow:'shadow-[0_0_12px_rgba(34,211,238,0.4)]' },
  '/gps':           { from:'#00c8ff', to:'#1d4ed8', text:'text-[#00c8ff]',glow:'shadow-[0_0_12px_rgba(0,200,255,0.5)]' },
  '/usuarios':      { from:'#c084fc', to:'#7c3aed', text:'text-purple-400',glow:'shadow-[0_0_12px_rgba(192,132,252,0.4)]' },
  '/configuracion': { from:'#9ca3af', to:'#6b7280', text:'text-gray-400',  glow:'shadow-[0_0_12px_rgba(156,163,175,0.3)]' },
  '/documentacion': { from:'#38bdf8', to:'#0369a1', text:'text-sky-400',   glow:'shadow-[0_0_12px_rgba(56,189,248,0.4)]' },
  '/manual':        { from:'#2dd4bf', to:'#0d9488', text:'text-teal-400',  glow:'shadow-[0_0_12px_rgba(45,212,191,0.4)]' },
  '/planes':        { from:'#fbbf24', to:'#ea580c', text:'text-amber-400', glow:'shadow-[0_0_12px_rgba(251,191,36,0.5)]' },
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

// Pineapple CIVAC logo SVG
function CivacLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lbg" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#003d2e"/><stop offset="1" stopColor="#001a14"/></linearGradient>
        <linearGradient id="lbody" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#00f5d4"/><stop offset="1" stopColor="#00a070"/></linearGradient>
        <linearGradient id="lleaf" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#39ff7e"/><stop offset="1" stopColor="#00c850"/></linearGradient>
        <filter id="lglow"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#lbg)"/>
      <ellipse cx="38" cy="24" rx="5" ry="13" fill="url(#lleaf)" transform="rotate(-25 38 24)" filter="url(#lglow)"/>
      <ellipse cx="50" cy="19" rx="5" ry="15" fill="url(#lleaf)" filter="url(#lglow)"/>
      <ellipse cx="62" cy="24" rx="5" ry="13" fill="url(#lleaf)" transform="rotate(25 62 24)" filter="url(#lglow)"/>
      <ellipse cx="50" cy="63" rx="21" ry="27" fill="url(#lbody)" filter="url(#lglow)"/>
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

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const mod = MODULE_NEON[location] || MODULE_NEON['/'];
  const isActive = (p: string) => location === p;

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setInstallPrompt(e); (window as any).__pwaInstallPrompt = e; };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  const NavItem = ({ href, icon: Icon, label, badge, accent, accentColor }: {
    href: string; icon: any; label: string; badge?: number | string; accent?: string; accentColor?: string;
  }) => {
    const active = isActive(href);
    const m = MODULE_NEON[href] || MODULE_NEON['/'];
    return (
      <Link href={href} onClick={() => setMobileOpen(false)}>
        <div className={`nav-item flex items-center gap-2.5 px-2.5 py-2 rounded-xl mx-1.5 my-0.5 cursor-pointer group relative overflow-hidden
          ${active
            ? `border border-[${m.from}]/20 bg-[${m.from}]/10`
            : 'border border-transparent hover:border-white/5 hover:bg-white/4'
          }`}
          style={active ? {
            background: `linear-gradient(135deg, ${m.from}14, ${m.to}0a)`,
            borderColor: `${m.from}30`,
            boxShadow: `0 0 10px ${m.from}18`
          } : {}}>
          {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{background: m.from, boxShadow:`0 0 8px ${m.from}80`}} />}
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            active ? 'shadow-lg' : 'bg-white/5 group-hover:bg-white/8'
          }`}
            style={active ? {background:`linear-gradient(135deg,${m.from},${m.to})`, boxShadow:`0 0 10px ${m.from}50`} : {}}>
            <Icon size={13} className={active ? 'text-black' : 'text-white/50 group-hover:text-white/75'} />
          </div>
          {!collapsed && (
            <>
              <span className={`flex-1 text-[12.5px] font-medium leading-none transition-colors ${active ? 'text-white font-semibold' : 'text-white/55 group-hover:text-white/85'}`}>{label}</span>
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
      {collapsed && <div className="mx-2 my-2 border-t border-white/8"/>}
      {children}
    </div>
  );

  const sideW = collapsed ? 'w-[58px]' : 'w-[220px]';

  return (
    <div className="min-h-screen flex bg-background text-foreground" style={{fontFamily:"'Space Grotesk','Sora',sans-serif"}}>
      {mobileOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 ${sideW} z-50 flex flex-col border-r transition-all duration-250
        lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        border-white/6`}
        style={{background:'linear-gradient(180deg,#020d09 0%,#030f0b 100%)'}}>

        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0" style={{backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,245,212,0.012) 3px, rgba(0,245,212,0.012) 4px)'}} />
        </div>

        {/* Logo area */}
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
                <span className="text-[9px] text-white/30 leading-none">Control Inteligente Agropecuario</span>
              </div>
            </div>
          ) : (
            <div className="mx-auto"><CivacLogo size={32} /></div>
          )}
          <div className="flex items-center gap-0.5">
            <button className="hidden lg:flex p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <Menu size={14}/> : <ChevronLeft size={14}/>}
            </button>
            <button className="lg:hidden p-1.5 text-white/40" onClick={() => setMobileOpen(false)}><X size={15}/></button>
          </div>
        </div>

        {/* User badge */}
        {user && !collapsed && (
          <div className="px-2.5 py-2 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2 px-2 py-2 rounded-xl" style={{background:'rgba(0,245,212,0.05)',border:'1px solid rgba(0,245,212,0.1)'}}>
              <div className={`w-7 h-7 rounded-full ${ROLE_COLORS[user.role]} flex items-center justify-center font-black text-[11px] flex-shrink-0`}>
                {user.nombre.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-white/90 truncate leading-tight">{user.nombre.split(' ').slice(0,2).join(' ')}</p>
                <p className="text-[9px] leading-none mt-0.5" style={{color:'#00f5d4'}}>{ROLE_LABELS[user.role]}</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full civac-pulse flex-shrink-0" style={{background:'#39ff7e',boxShadow:'0 0 6px rgba(57,255,126,0.8)'}}/>
            </div>
          </div>
        )}
        {user && collapsed && (
          <div className="flex justify-center py-2 border-b border-white/5 flex-shrink-0">
            <div className={`w-7 h-7 rounded-full ${ROLE_COLORS[user.role]} flex items-center justify-center font-black text-[11px]`}>
              {user.nombre.charAt(0)}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-1 scrollbar-thin">
          <Section title="Principal">
            <NavItem href="/" icon={LayoutDashboard} label="Dashboard PRO" accent="LIVE" accentColor="bg-[#39ff7e]/15 text-[#39ff7e] border-[#39ff7e]/25"/>
            <NavItem href="/alertas" icon={Bell} label="Alertas" badge={4}/>
          </Section>
          <Section title="Animales">
            <NavItem href="/inventario" icon={List} label="Inventario"/>
            <NavItem href="/ficha" icon={ActivitySquare} label="Ficha Individual"/>
            <NavItem href="/reproduccion" icon={Baby} label="Reproducción"/>
            <NavItem href="/produccion" icon={Activity} label="Producción"/>
            <NavItem href="/genetica" icon={Dna} label="Genética"/>
            <NavItem href="/pesaje" icon={Scale} label="Pesaje Bluetooth" accent="BT" accentColor="bg-[#00c8ff]/15 text-[#00c8ff] border-[#00c8ff]/25"/>
          </Section>
          <Section title="Campo">
            <NavItem href="/potreros" icon={Map} label="Potreros"/>
            <NavItem href="/alimentacion" icon={Wheat} label="Alimentación"/>
            <NavItem href="/gps" icon={Navigation} label="Rastreo GPS" accent="GPS" accentColor="bg-[#00c8ff]/15 text-[#00c8ff] border-[#00c8ff]/25"/>
          </Section>
          <Section title="Gestión">
            <NavItem href="/insumos" icon={Package} label="Insumos" badge={3}/>
            <NavItem href="/semen" icon={TestTube} label="Semen y Embriones"/>
            <NavItem href="/costos" icon={DollarSign} label="Costos y P&G"/>
            <NavItem href="/personal" icon={Users} label="Personal"/>
          </Section>
          <Section title="IA">
            <NavItem href="/prediccion" icon={TrendingUp} label="Predicciones IA" accent="IA" accentColor="bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25"/>
            <NavItem href="/co2" icon={Leaf} label="Huella de Carbono"/>
            <NavItem href="/multifinca" icon={Map} label="Multi-Finca"/>
          </Section>
          <Section title="Sistema">
            <NavItem href="/usuarios" icon={UserCircle} label="Usuarios"/>
            <NavItem href="/configuracion" icon={Settings} label="Configuración"/>
            <NavItem href="/documentacion" icon={BookOpen} label="Documentación"/>
            <NavItem href="/manual" icon={HelpCircle} label="Manual de Uso"/>
            <NavItem href="/planes" icon={Crown} label="Planes · Wompi" accent="💳" accentColor="bg-amber-500/15 text-amber-400 border-amber-500/25"/>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-2.5 pb-3 pt-2 border-t border-white/5 space-y-1 flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-[9px] text-white/20">
              <Wifi size={9}/><span>CIVAC v3.0 · Offline PWA</span>
            </div>
          )}
          {installPrompt && !collapsed && (
            <button onClick={() => { (installPrompt as any).prompt(); setInstallPrompt(null); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all btn-neon"
              style={{color:'#00f5d4',background:'rgba(0,245,212,0.08)',border:'1px solid rgba(0,245,212,0.15)'}}>
              <Download size={13}/><span>Instalar CIVAC (PWA)</span>
            </button>
          )}
          <button onClick={logout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all ${collapsed?'justify-center':''}`}>
            <LogOut size={13}/>{!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-250 ${collapsed?'lg:pl-[58px]':'lg:pl-[220px]'}`}>
        {/* Topbar */}
        <header className="h-[54px] sticky top-0 z-30 flex items-center justify-between px-4 lg:px-5 border-b"
          style={{background:'rgba(2,13,9,0.92)',backdropFilter:'blur(20px)',borderColor:'rgba(0,245,212,0.08)'}}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-white/60 hover:text-white p-1.5" onClick={() => setMobileOpen(true)}>
              <Menu size={20}/>
            </button>
            {/* Active module pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-black text-[11px] font-bold transition-all"
              style={{background:`linear-gradient(135deg,${mod.from},${mod.to})`, boxShadow:`0 0 12px ${mod.from}60`}}>
              <span className="w-1.5 h-1.5 rounded-full bg-black/40 animate-pulse"/>
              {new Date().toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short'})}
            </div>
            {/* DB status */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold"
              style={{color:'#39ff7e',background:'rgba(57,255,126,0.08)',border:'1px solid rgba(57,255,126,0.2)'}}>
              <Database size={11}/><span>BD Online</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {installPrompt && (
              <button onClick={() => { (installPrompt as any).prompt(); setInstallPrompt(null); }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                style={{color:'#00f5d4',background:'rgba(0,245,212,0.08)',border:'1px solid rgba(0,245,212,0.2)'}}>
                <Download size={12}/> Instalar
              </button>
            )}
            <button onClick={toggleTheme}
              className="w-8 h-8 rounded-lg text-white/50 hover:text-white/90 hover:bg-white/5 transition-all flex items-center justify-center">
              {theme==='dark'?<Sun size={15}/>:<Moon size={15}/>}
            </button>
            <Link href="/alertas">
              <button className="relative w-8 h-8 rounded-lg text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex items-center justify-center">
                <Bell size={15}/>
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{background:'#ff4d6d',boxShadow:'0 0 6px rgba(255,77,109,0.8)'}}/>
              </button>
            </Link>
            <Link href="/planes">
              <button className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                style={{color:'#fbbf24',background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.2)'}}>
                <Crown size={11}/> PRO
              </button>
            </Link>

            {/* User dropdown */}
            <div className="relative ml-0.5">
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl hover:bg-white/5 transition-all">
                <div className={`w-7 h-7 rounded-full ${ROLE_COLORS[user?.role||'admin']} flex items-center justify-center font-black text-[11px] shadow`}>
                  {user?.nombre?.charAt(0)||'C'}
                </div>
                <span className="text-[13px] font-medium text-white/80 hidden sm:block max-w-[80px] truncate">{user?.nombre?.split(' ')[0]}</span>
                <ChevronDown size={11} className="text-white/30"/>
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}/>
                  <div className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl shadow-2xl z-50 overflow-hidden border"
                    style={{background:'rgba(3,15,10,0.98)',backdropFilter:'blur(20px)',borderColor:'rgba(0,245,212,0.15)'}}>
                    <div className="px-4 py-3 border-b" style={{borderColor:'rgba(0,245,212,0.1)'}}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-8 h-8 rounded-full ${ROLE_COLORS[user?.role||'admin']} flex items-center justify-center font-black text-xs`}>
                          {user?.nombre?.charAt(0)}
                        </div>
                        <div><p className="font-semibold text-sm text-white">{user?.nombre?.split(' ').slice(0,2).join(' ')}</p>
                          <p className="text-[10px]" style={{color:'#00f5d4'}}>{ROLE_LABELS[user?.role||'admin']}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/40">{user?.finca}</p>
                    </div>
                    <div className="p-1">
                      {[
                        {href:'/configuracion',icon:Settings,label:'Configuración'},
                        {href:'/usuarios',icon:UserCircle,label:'Gestión de usuarios'},
                        {href:'/documentacion',icon:BookOpen,label:'Documentación'},
                        {href:'/planes',icon:Crown,label:'Planes CIVAC · Wompi',special:true},
                      ].map(item=>(
                        <Link key={item.href} href={item.href} onClick={()=>setShowUserMenu(false)}>
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-white/5 cursor-pointer transition-all ${item.special?'':'text-white/70 hover:text-white'}`}
                            style={item.special?{color:'#fbbf24'}:{}}>
                            <item.icon size={13}/>{item.label}
                          </div>
                        </Link>
                      ))}
                      <div className="border-t my-1" style={{borderColor:'rgba(255,255,255,0.06)'}}/>
                      <button onClick={()=>{logout();setShowUserMenu(false);}}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-all">
                        <LogOut size={13}/> Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-5 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
