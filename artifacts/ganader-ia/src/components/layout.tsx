import { Link, useLocation } from "wouter";
import {
  Bell, Menu, X, Sun, Moon,
  LogOut, ChevronDown, Download, Scale,
  Database, ChevronLeft,
  Wifi, Crown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { PLAN_ICON, PLAN_COLOR } from "@/lib/auth";

interface LayoutProps { children: React.ReactNode; }

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
  '/pesaje':        { from:'#ff9a3c', to:'#ea580c', glow:'255,154,60',  emoji:'⚖️', label:'Básculas BT',         shortLabel:'BT' },
  '/pesaje-manual': { from:'#c084fc', to:'#7c3aed', glow:'192,132,252', emoji:'⚡', label:'Pesaje Automatizado',  shortLabel:'Auto' },
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
  '/datos':         { from:'#818cf8', to:'#4f46e5', glow:'129,140,248', emoji:'🗄️', label:'Data Warehouse',       shortLabel:'Datos' },
};

const ROLE_COLORS: Record<string, string> = {
  admin:  'bg-[#00f5d4] text-black',
  vet:    'bg-[#00c8ff] text-black',
  field:  'bg-[#39ff7e] text-black',
  viewer: 'bg-[#c084fc] text-black',
};
const ROLE_LABELS: Record<string, string> = {
  admin:'Admin', vet:'Veterinario', field:'Campo', viewer:'Visor'
};

/* ─── Logo profesional ganadero PRO ───────────────────────────────────────── */
function CivacLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Fondos */}
        <linearGradient id="lBg" x1="0" y1="0" x2="0.6" y2="1">
          <stop stopColor="#071a2f"/>
          <stop offset="0.5" stopColor="#0a2140"/>
          <stop offset="1" stopColor="#060f1e"/>
        </linearGradient>
        <radialGradient id="lBgRadial" cx="40%" cy="30%" r="60%">
          <stop stopColor="#0d2d1a" stopOpacity="0.7"/>
          <stop offset="1" stopColor="#071a2f" stopOpacity="0"/>
        </radialGradient>
        {/* Cabeza */}
        <linearGradient id="lHead" x1="0" y1="0" x2="0.3" y2="1">
          <stop stopColor="#3aaf68"/>
          <stop offset="0.45" stopColor="#228b4a"/>
          <stop offset="1" stopColor="#0f5028"/>
        </linearGradient>
        <linearGradient id="lForehead" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop stopColor="#44c47a"/>
          <stop offset="1" stopColor="#1d7a42"/>
        </linearGradient>
        {/* Hocico */}
        <linearGradient id="lMuzzle" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#2a8a50"/>
          <stop offset="1" stopColor="#184f2d"/>
        </linearGradient>
        <linearGradient id="lMuzzleDark" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#163c24"/>
          <stop offset="1" stopColor="#0c2416"/>
        </linearGradient>
        {/* Cuernos */}
        <linearGradient id="lHorn" x1="0" y1="1" x2="1" y2="0">
          <stop stopColor="#fde68a"/>
          <stop offset="0.5" stopColor="#f59e0b"/>
          <stop offset="1" stopColor="#b45309"/>
        </linearGradient>
        {/* Ojos */}
        <radialGradient id="lEyeRim" cx="50%" cy="50%" r="50%">
          <stop stopColor="#0c2016"/>
          <stop offset="1" stopColor="#051008"/>
        </radialGradient>
        <radialGradient id="lIris" cx="40%" cy="38%" r="60%">
          <stop stopColor="#2d8a52"/>
          <stop offset="0.6" stopColor="#1a5c34"/>
          <stop offset="1" stopColor="#0e3a20"/>
        </radialGradient>
        {/* Orejas */}
        <linearGradient id="lEarOut" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#2a8a50"/>
          <stop offset="1" stopColor="#155e30"/>
        </linearGradient>
        {/* Circuito / IA */}
        <linearGradient id="lCircuit" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#00f5d4"/>
          <stop offset="0.5" stopColor="#00c8ff"/>
          <stop offset="1" stopColor="#00f5d4"/>
        </linearGradient>
        <linearGradient id="lChip" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#00f5d4"/>
          <stop offset="1" stopColor="#0ea5e9"/>
        </linearGradient>
        {/* RFID tag */}
        <radialGradient id="lRfid" cx="40%" cy="35%" r="65%">
          <stop stopColor="#00f5d4"/>
          <stop offset="1" stopColor="#00998a"/>
        </radialGradient>
        {/* Borde */}
        <linearGradient id="lBorder" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#00f5d4" stopOpacity="0.7"/>
          <stop offset="0.4" stopColor="#2d7a4f" stopOpacity="0.4"/>
          <stop offset="1" stopColor="#00c8ff" stopOpacity="0.55"/>
        </linearGradient>
        {/* Brillo superior */}
        <linearGradient id="lShine" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="white" stopOpacity="0.14"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        {/* Sombra interna cuernos */}
        <linearGradient id="lHornShad" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#fde68a" stopOpacity="0.45"/>
          <stop offset="1" stopColor="transparent"/>
        </linearGradient>
        {/* Filtros */}
        <filter id="fGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="fSoft" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="1.4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="fDeep" x="-8%" y="-8%" width="116%" height="116%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.55"/>
        </filter>
        <filter id="fInner" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.4"/>
        </filter>
      </defs>

      {/* ── FONDO ── */}
      <rect width="120" height="120" rx="27" fill="url(#lBg)"/>
      <rect width="120" height="120" rx="27" fill="url(#lBgRadial)"/>

      {/* ── CUERNOS ── */}
      {/* Cuerno izquierdo */}
      <path d="M36 50 Q20 30 24 15 Q28 5 38 13 Q31 22 37 40" fill="url(#lHorn)" filter="url(#fSoft)"/>
      <path d="M36 50 Q22 34 26 22 Q28 15 33 18" stroke="url(#lHornShad)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Cuerno derecho */}
      <path d="M84 50 Q100 30 96 15 Q92 5 82 13 Q89 22 83 40" fill="url(#lHorn)" filter="url(#fSoft)"/>
      <path d="M84 50 Q98 34 94 22 Q92 15 87 18" stroke="url(#lHornShad)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* ── OREJAS ── */}
      {/* Oreja izquierda */}
      <ellipse cx="28" cy="55" rx="11.5" ry="8" fill="url(#lEarOut)" transform="rotate(-18 28 55)" filter="url(#fDeep)"/>
      <ellipse cx="28" cy="55" rx="6.5" ry="4.5" fill="#0e3820" transform="rotate(-18 28 55)"/>
      {/* Oreja derecha */}
      <ellipse cx="92" cy="55" rx="11.5" ry="8" fill="url(#lEarOut)" transform="rotate(18 92 55)" filter="url(#fDeep)"/>
      <ellipse cx="92" cy="55" rx="6.5" ry="4.5" fill="#0e3820" transform="rotate(18 92 55)"/>

      {/* ── CABEZA ── */}
      <ellipse cx="60" cy="65" rx="33" ry="31" fill="url(#lHead)" filter="url(#fDeep)"/>
      <ellipse cx="60" cy="50" rx="28" ry="23" fill="url(#lForehead)"/>

      {/* Mancha Holstein izquierda */}
      <ellipse cx="47" cy="47" rx="9.5" ry="7" fill="rgba(0,0,0,0.22)" opacity="0.7"/>
      {/* Mancha Holstein derecha pequeña */}
      <ellipse cx="73" cy="45" rx="6" ry="5" fill="rgba(0,0,0,0.18)" opacity="0.6"/>
      {/* Mancha entre ojos */}
      <ellipse cx="60" cy="72" rx="11" ry="7" fill="rgba(0,0,0,0.15)" opacity="0.5"/>

      {/* ── CIRCUITO IA — frente ── */}
      {/* Línea horizontal principal */}
      <path d="M43 40 L49 40 L52 36.5 L68 36.5 L71 40 L77 40"
        stroke="url(#lCircuit)" strokeWidth="0.9" fill="none" opacity="0.8" filter="url(#fGlow)"/>
      {/* Ramas verticales */}
      <path d="M52 36.5 L52 32 L57 32" stroke="url(#lCircuit)" strokeWidth="0.75" fill="none" opacity="0.65"/>
      <path d="M68 36.5 L68 32 L63 32" stroke="url(#lCircuit)" strokeWidth="0.75" fill="none" opacity="0.65"/>
      {/* Nodos de circuito */}
      <circle cx="49" cy="40" r="1.6" fill="#00f5d4" opacity="0.9" filter="url(#fGlow)"/>
      <circle cx="71" cy="40" r="1.6" fill="#00f5d4" opacity="0.9" filter="url(#fGlow)"/>
      <circle cx="57" cy="32" r="1.3" fill="#00c8ff" opacity="0.8"/>
      <circle cx="63" cy="32" r="1.3" fill="#00c8ff" opacity="0.8"/>
      {/* Micro chip central */}
      <rect x="56.5" y="27.5" width="7" height="7" rx="1.8" fill="url(#lChip)" opacity="0.9" filter="url(#fGlow)"/>
      <rect x="58.5" y="29.5" width="3" height="3" rx="0.8" fill="#071a2f" opacity="0.9"/>
      {/* Líneas chip hacia arriba */}
      <path d="M58.5 27.5 L58.5 25" stroke="#00f5d4" strokeWidth="0.6" opacity="0.5"/>
      <path d="M61.5 27.5 L61.5 25" stroke="#00f5d4" strokeWidth="0.6" opacity="0.5"/>
      {/* Línea horizontal secundaria sobre ojos */}
      <path d="M43 40 L43 44" stroke="url(#lCircuit)" strokeWidth="0.7" fill="none" opacity="0.4"/>
      <path d="M77 40 L77 44" stroke="url(#lCircuit)" strokeWidth="0.7" fill="none" opacity="0.4"/>

      {/* ── OJOS ── */}
      {/* Ojo izquierdo */}
      <ellipse cx="43" cy="58" rx="8.5" ry="7.5" fill="url(#lEyeRim)" filter="url(#fInner)"/>
      <ellipse cx="43" cy="58" rx="6.2" ry="5.8" fill="url(#lIris)"/>
      <circle cx="43" cy="58" r="3.2" fill="#040e07"/>
      <circle cx="44.8" cy="56.2" r="1.5" fill="white" opacity="0.92"/>
      <circle cx="41.8" cy="59.2" r="0.75" fill="white" opacity="0.4"/>
      {/* Ceja izquierda */}
      <path d="M36.5 52.5 Q43 50 49.5 52.5" stroke="#0a2514" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5"/>

      {/* Ojo derecho */}
      <ellipse cx="77" cy="58" rx="8.5" ry="7.5" fill="url(#lEyeRim)" filter="url(#fInner)"/>
      <ellipse cx="77" cy="58" rx="6.2" ry="5.8" fill="url(#lIris)"/>
      <circle cx="77" cy="58" r="3.2" fill="#040e07"/>
      <circle cx="78.8" cy="56.2" r="1.5" fill="white" opacity="0.92"/>
      <circle cx="75.8" cy="59.2" r="0.75" fill="white" opacity="0.4"/>
      {/* Ceja derecha */}
      <path d="M70.5 52.5 Q77 50 83.5 52.5" stroke="#0a2514" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5"/>

      {/* ── HOCICO ── */}
      <ellipse cx="60" cy="83" rx="20" ry="15" fill="url(#lMuzzle)" filter="url(#fDeep)"/>
      <ellipse cx="60" cy="85" rx="16.5" ry="11.5" fill="url(#lMuzzleDark)"/>
      {/* Fosas nasales */}
      <ellipse cx="52.5" cy="86.5" rx="4.8" ry="3.5" fill="#081409" opacity="0.95"/>
      <ellipse cx="67.5" cy="86.5" rx="4.8" ry="3.5" fill="#081409" opacity="0.95"/>
      {/* Reflejos fosas */}
      <ellipse cx="53.5" cy="85.5" rx="1.6" ry="1.0" fill="rgba(255,255,255,0.14)"/>
      <ellipse cx="68.5" cy="85.5" rx="1.6" ry="1.0" fill="rgba(255,255,255,0.14)"/>
      {/* Línea boca */}
      <path d="M60 90 Q56.5 94 52.5 92" stroke="#081409" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M60 90 Q63.5 94 67.5 92" stroke="#081409" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.65"/>

      {/* ── ARETE RFID ── */}
      <circle cx="21" cy="56" r="5.5" fill="url(#lRfid)" filter="url(#fGlow)"/>
      <circle cx="21" cy="56" r="3" fill="#071a2f"/>
      <circle cx="21" cy="56" r="1.2" fill="#00f5d4" opacity="0.95"/>

      {/* ── FRANJA TEAL frente (marca IA) ── */}
      <path d="M42 50 Q60 43 78 50" stroke="url(#lCircuit)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.45" filter="url(#fGlow)"/>

      {/* ── BRILLO SUPERIOR ── */}
      <ellipse cx="60" cy="26" rx="36" ry="17" fill="url(#lShine)"/>

      {/* ── BORDE GLOW ── */}
      <rect width="120" height="120" rx="27" fill="none" stroke="url(#lBorder)" strokeWidth="1.5"/>
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

  const mod = MODULES[location] || MODULES['/'];

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setInstallPrompt(e); (window as any).__pwaInstallPrompt = e; };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const isActive = (p: string) => location === p;

  /* ── Nav item — full-color icons ──────────────────────────────────────── */
  const NavItem = ({ href, badge, accent, accentColor, pulse }: {
    href: string; badge?: number | string; accent?: string; accentColor?: string; pulse?: boolean;
  }) => {
    const active = isActive(href);
    const m = MODULES[href] || MODULES['/'];
    return (
      <Link href={href} onClick={() => setMobileOpen(false)}>
        <div
          className="flex items-center gap-2.5 px-2 py-1.5 mx-1.5 my-0.5 cursor-pointer group relative overflow-hidden transition-all duration-150"
          style={{
            borderRadius: 14,
            background: active
              ? `linear-gradient(135deg,rgba(${m.glow},0.18),rgba(${m.glow},0.07))`
              : `rgba(${m.glow},0.04)`,
            border: active
              ? `1px solid rgba(${m.glow},0.45)`
              : `1px solid rgba(${m.glow},0.10)`,
            boxShadow: active ? `0 0 18px rgba(${m.glow},0.15)` : 'none',
          }}
        >
          {/* Left accent bar */}
          {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
              style={{ background: m.from, boxShadow: `0 0 10px ${m.from}cc` }} />
          )}
          {/* Colored icon — always visible, brighter when active */}
          <div
            className="flex-shrink-0 flex items-center justify-center transition-all duration-200 group-hover:scale-110"
            style={{
              width: 28, height: 28, fontSize: 13, borderRadius: 10,
              background: active
                ? `linear-gradient(135deg,${m.from},${m.to})`
                : `linear-gradient(135deg,rgba(${m.glow},0.22),rgba(${m.glow},0.10))`,
              border: active ? 'none' : `1px solid rgba(${m.glow},0.25)`,
              boxShadow: active
                ? `0 0 14px rgba(${m.glow},0.6), inset 0 1px 0 rgba(255,255,255,0.2)`
                : `0 0 6px rgba(${m.glow},0.18)`,
            }}
          >
            <span style={{ filter: active ? 'drop-shadow(0 0 3px rgba(0,0,0,0.4))' : 'none' }}>{m.emoji}</span>
          </div>
          {!collapsed && (
            <>
              <span
                className="flex-1 text-[12.5px] font-medium leading-none transition-all truncate"
                style={{ color: active ? 'white' : `rgba(${m.glow},0.72)`, fontWeight: active ? 600 : 400 }}
              >
                {m.label}
              </span>
              {badge != null && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white min-w-[18px] text-center flex items-center gap-0.5"
                  style={{ background: 'rgba(255,77,109,0.9)', boxShadow: '0 0 8px rgba(255,77,109,0.6)' }}>
                  {pulse && <span className="w-1 h-1 rounded-full bg-white animate-pulse" />}
                  {badge}
                </span>
              )}
              {accent && !badge && (
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${accentColor || 'bg-[#00f5d4]/15 text-[#00f5d4] border-[#00f5d4]/25'}`}>{accent}</span>
              )}
            </>
          )}
          {/* Collapsed badge */}
          {collapsed && badge != null && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-white text-[7px] font-black flex items-center justify-center"
              style={{ background: 'rgba(255,77,109,0.9)', boxShadow: '0 0 6px rgba(255,77,109,0.7)' }}>
              {badge}
            </span>
          )}
        </div>
      </Link>
    );
  };

  const SECTION_COLORS: Record<string, string> = {
    'Principal':   '#00f5d4', 'Animales': '#39ff7e', 'Campo': '#84ef34',
    'Gestión':     '#fbbf24', 'IA & Analytics': '#e879f9', 'Sistema': '#818cf8',
  };
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const c = SECTION_COLORS[title] || '#00f5d4';
    return (
      <div className="mb-0.5">
        {!collapsed && (
          <div className="px-4 pt-3 pb-1 flex items-center gap-2">
            <div className="w-1 h-3 rounded-full flex-shrink-0" style={{ background: c, boxShadow: `0 0 6px ${c}99` }} />
            <p className="text-[9px] uppercase font-black tracking-[0.18em]" style={{ color: `${c}99` }}>{title}</p>
          </div>
        )}
        {collapsed && <div className="mx-3 my-2 border-t border-white/8" />}
        {children}
      </div>
    );
  };

  const sideW = collapsed ? 'w-[58px]' : 'w-[226px]';

  /* ── Quick-access Pesaje Manual (sidebar banner) ─────────────────────── */
  const PesajeQuickAccess = () => {
    if (collapsed) return null;
    return (
      <Link href="/pesaje-manual">
        <div className="mx-2 mb-2 px-3 py-2.5 cursor-pointer group transition-all hover:scale-[1.02]"
          style={{
            borderRadius: 14,
            background: 'linear-gradient(135deg,rgba(192,132,252,0.12),rgba(124,58,237,0.08))',
            border: '1px solid rgba(192,132,252,0.28)',
            boxShadow: '0 0 12px rgba(192,132,252,0.08)',
          }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg,rgba(192,132,252,0.25),rgba(124,58,237,0.15))',
                border: '1px solid rgba(192,132,252,0.4)',
                boxShadow: '0 0 10px rgba(192,132,252,0.2)',
              }}>
              ⚡
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black leading-tight" style={{ color: '#c084fc' }}>Pesaje Automatizado</p>
              <p className="text-[9px] leading-tight" style={{ color: 'rgba(192,132,252,0.55)' }}>
                Foto · IA · Lote · Recibo WA
              </p>
            </div>
            <div className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'rgba(192,132,252,0.15)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.3)' }}>
              PRO
            </div>
          </div>
        </div>
      </Link>
    );
  };

  /* ── Bottom nav mobile tabs ───────────────────────────────────────────── */
  const bottomTabs = [
    { href: '/',              emoji: '📊', label: 'Inicio' },
    { href: '/inventario',    emoji: '🐄', label: 'Ganado' },
    { href: '/pesaje-manual', emoji: '⚡', label: 'Pesaje' },
    { href: '/alertas',       emoji: '🔔', label: 'Alertas', badge: 4 },
    { href: '/produccion',    emoji: '🥛', label: 'Leche' },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground" style={{ fontFamily: "'Space Grotesk','Sora',sans-serif" }}>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 ${sideW} z-50 flex flex-col border-r transition-all duration-250
          lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'linear-gradient(180deg,#071325 0%,#0a1a30 60%,#071325 100%)',
          borderColor: 'rgba(0,245,212,0.10)',
        }}
      >
        {/* Textura sutil */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: 'inherit' }}>
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 15%, rgba(0,200,255,0.06) 0%, transparent 50%),
              radial-gradient(circle at 80% 85%, rgba(45,122,79,0.08) 0%, transparent 50%),
              repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(0,245,212,0.012) 40px,rgba(0,245,212,0.012) 41px)
            `
          }} />
        </div>

        {/* Logo */}
        <div className="h-[62px] flex items-center justify-between px-3 border-b flex-shrink-0 relative"
          style={{ borderColor: 'rgba(0,245,212,0.10)' }}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <CivacLogo size={38} />
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-black text-[17px] tracking-tight leading-none" style={{ fontFamily: "'Sora',sans-serif" }}>
                    <span className="text-white">CI</span>
                    <span style={{ color: '#00f5d4', textShadow: '0 0 12px rgba(0,245,212,0.8)' }}>VAC</span>
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                    style={{ background: 'linear-gradient(135deg,#fbbf24,#ea580c)', color: 'white', letterSpacing: '0.05em' }}>
                    PRO
                  </span>
                </div>
                <span className="text-[9px] leading-none" style={{ color: 'rgba(0,245,212,0.45)' }}>
                  Ganadería Inteligente · Colombia
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto"><CivacLogo size={34} /></div>
          )}
          <div className="flex items-center gap-0.5">
            <button
              className="hidden lg:flex p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
              style={{ borderRadius: 10 }}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
            </button>
            <button className="lg:hidden p-1.5 text-white/40" onClick={() => setMobileOpen(false)}><X size={16} /></button>
          </div>
        </div>

        {/* User badge */}
        {user && !collapsed && (
          <div className="px-2.5 py-2 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 px-2.5 py-2.5"
              style={{
                background: 'rgba(13,33,55,0.7)',
                border: '1px solid rgba(0,245,212,0.12)',
                borderRadius: 14,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}>
              <div className={`w-8 h-8 rounded-full ${ROLE_COLORS[user.role]} flex items-center justify-center font-black text-[12px] flex-shrink-0`}
                style={{ boxShadow: '0 0 10px rgba(0,245,212,0.3)' }}>
                {user.nombre.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-white/90 truncate leading-tight">
                  {user.nombre.split(' ').slice(0, 2).join(' ')}
                </p>
                <p className="text-[9px] leading-none mt-0.5 flex items-center gap-1" style={{ color: '#00f5d4' }}>
                  <span>{ROLE_LABELS[user.role]}</span>
                  {user.plan && user.plan !== 'basico' && (
                    <span style={{ color: PLAN_COLOR[user.plan] }}>
                      {PLAN_ICON[user.plan]} {user.plan.toUpperCase()}
                    </span>
                  )}
                </p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full civac-pulse flex-shrink-0"
                style={{ background: '#39ff7e', boxShadow: '0 0 8px rgba(57,255,126,0.9)' }} />
            </div>
          </div>
        )}
        {user && collapsed && (
          <div className="flex justify-center py-2 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className={`w-8 h-8 rounded-full ${ROLE_COLORS[user.role]} flex items-center justify-center font-black text-[12px]`}>
              {user.nombre.charAt(0)}
            </div>
          </div>
        )}

        {/* ── Pesaje Rápido quick-access ────────────────────────────────── */}
        <div className="pt-2 flex-shrink-0">
          <PesajeQuickAccess />
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-1 scrollbar-thin">
          <Section title="Principal">
            <NavItem href="/" accent="LIVE" accentColor="bg-[#39ff7e]/15 text-[#39ff7e] border-[#39ff7e]/25" />
            <NavItem href="/alertas" badge={4} />
          </Section>
          <Section title="Animales">
            <NavItem href="/inventario" />
            <NavItem href="/lotes" accent="NEW" accentColor="bg-[#00c8ff]/15 text-[#00c8ff] border-[#00c8ff]/25" />
            <NavItem href="/ficha" />
            <NavItem href="/reproduccion" />
            <NavItem href="/produccion" />
            <NavItem href="/genetica" />
            <NavItem href="/pesaje" accent="BT⚡" accentColor="bg-[#ff9500]/15 text-[#ff9500] border-[#ff9500]/25" />
            <NavItem href="/pesaje-manual" accent="CC" accentColor="bg-[#c084fc]/15 text-[#c084fc] border-[#c084fc]/25" />
          </Section>
          <Section title="Campo">
            <NavItem href="/potreros" />
            <NavItem href="/alimentacion" />
            <NavItem href="/gps" accent="GPS" accentColor="bg-[#00c8ff]/15 text-[#00c8ff] border-[#00c8ff]/25" />
          </Section>
          <Section title="Gestión">
            <NavItem href="/insumos" badge={3} />
            <NavItem href="/semen" />
            <NavItem href="/costos" />
            <NavItem href="/personal" />
          </Section>
          <Section title="IA & Analytics">
            <NavItem href="/prediccion" accent="IA" accentColor="bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25" />
            <NavItem href="/co2" />
            <NavItem href="/multifinca" />
          </Section>
          <Section title="Sistema">
            <NavItem href="/datos" accent="DB" accentColor="bg-indigo-500/15 text-indigo-400 border-indigo-500/25" />
            <NavItem href="/usuarios" />
            <NavItem href="/configuracion" />
            <NavItem href="/documentacion" />
            <NavItem href="/planes" accent="💳" accentColor="bg-amber-500/15 text-amber-400 border-amber-500/25" />
          </Section>
        </div>

        {/* Footer */}
        <div className="px-2.5 pb-3 pt-2 border-t space-y-1 flex-shrink-0" style={{ borderColor: 'rgba(0,245,212,0.08)' }}>
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-[9px] text-white/20">
              <Wifi size={9} /><span>CIVAC v3.0 · Offline PWA · Navy Edition</span>
            </div>
          )}
          {installPrompt && !collapsed && (
            <button
              onClick={() => { (installPrompt as any).prompt(); setInstallPrompt(null); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-all"
              style={{ color: '#00f5d4', background: 'rgba(0,245,212,0.08)', border: '1px solid rgba(0,245,212,0.15)', borderRadius: 12 }}
            >
              <Download size={13} /><span>Instalar app CIVAC</span>
            </button>
          )}
          <button
            onClick={logout}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all ${collapsed ? 'justify-center' : ''}`}
            style={{ borderRadius: 12 }}
          >
            <LogOut size={13} />{!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-250 ${collapsed ? 'lg:pl-[58px]' : 'lg:pl-[226px]'}`}>

        {/* ── Topbar ──────────────────────────────────────────────────────── */}
        <header
          className="h-[56px] sticky top-0 z-30 flex items-center justify-between px-3 lg:px-5 border-b"
          style={{
            background: 'rgba(7,19,37,0.96)',
            backdropFilter: 'blur(28px)',
            borderColor: 'rgba(0,245,212,0.09)',
            boxShadow: '0 1px 20px rgba(0,0,0,0.35)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <button
              className="lg:hidden text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Current module */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex w-8 h-8 items-center justify-center text-base"
                style={{
                  borderRadius: 12,
                  background: `linear-gradient(135deg,${mod.from},${mod.to})`,
                  boxShadow: `0 0 14px rgba(${mod.glow},0.5)`,
                }}>
                {mod.emoji}
              </div>
              <div className="hidden md:block">
                <p className="text-[13px] font-semibold text-white leading-tight">{mod.label}</p>
                <p className="text-[9px] text-white/35 leading-none">
                  CIVAC PRO · {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Status pills */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold"
              style={{ color: '#39ff7e', background: 'rgba(57,255,126,0.08)', border: '1px solid rgba(57,255,126,0.2)', borderRadius: 10 }}>
              <Database size={10} /><span>BD Sync</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold"
              style={{ color: '#00c8ff', background: 'rgba(0,200,255,0.08)', border: '1px solid rgba(0,200,255,0.2)', borderRadius: 10 }}>
              <Wifi size={10} /><span>PWA Offline</span>
            </div>

            {/* 📐 Pesaje Manual quick-access en topbar */}
            <Link href="/pesaje-manual">
              <button className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold transition-all hover:scale-[1.04]"
                style={{
                  color: '#c084fc',
                  background: 'rgba(192,132,252,0.10)',
                  border: '1px solid rgba(192,132,252,0.30)',
                  borderRadius: 10,
                  boxShadow: '0 0 12px rgba(192,132,252,0.1)',
                }}>
                ⚡ <span>Pesaje Automatizado</span>
              </button>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            {installPrompt && (
              <button
                onClick={() => { (installPrompt as any).prompt(); setInstallPrompt(null); }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold transition-all"
                style={{ color: '#00f5d4', background: 'rgba(0,245,212,0.08)', border: '1px solid rgba(0,245,212,0.2)', borderRadius: 10 }}
              >
                <Download size={12} /> Instalar
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl text-white/50 hover:text-white/90 hover:bg-white/5 transition-all flex items-center justify-center"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Alerts */}
            <Link href="/alertas">
              <button className="relative w-8 h-8 rounded-xl text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex items-center justify-center">
                <Bell size={15} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: '#ff4d6d', boxShadow: '0 0 6px rgba(255,77,109,0.9)' }} />
              </button>
            </Link>

            {/* PRO badge */}
            <Link href="/planes">
              <button className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.22)', borderRadius: 10 }}>
                <Crown size={12} /> PRO
              </button>
            </Link>

            {/* User dropdown */}
            <div className="relative ml-0.5">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl hover:bg-white/5 transition-all"
                style={{ borderRadius: 12 }}
              >
                <div className={`w-7 h-7 rounded-full ${ROLE_COLORS[user?.role || 'admin']} flex items-center justify-center font-black text-[11px] shadow`}>
                  {user?.nombre?.charAt(0) || 'C'}
                </div>
                <span className="text-[13px] font-medium text-white/80 hidden sm:block max-w-[70px] truncate">
                  {user?.nombre?.split(' ')[0]}
                </span>
                <ChevronDown size={11} className="text-white/30" />
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div
                    className="absolute right-0 top-full mt-1.5 w-60 shadow-2xl z-50 overflow-hidden border"
                    style={{
                      borderRadius: 18,
                      background: 'rgba(7,19,37,0.98)',
                      backdropFilter: 'blur(24px)',
                      borderColor: 'rgba(0,245,212,0.16)',
                      boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,245,212,0.1)' }}>
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className={`w-9 h-9 rounded-full ${ROLE_COLORS[user?.role || 'admin']} flex items-center justify-center font-black text-sm`}>
                          {user?.nombre?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">{user?.nombre?.split(' ').slice(0, 2).join(' ')}</p>
                          <p className="text-[10px]" style={{ color: '#00f5d4' }}>{ROLE_LABELS[user?.role || 'admin']}</p>
                        </div>
                      </div>
                      {user?.plan && (
                        <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1 rounded-lg text-[10px] font-bold"
                          style={{ background: `${PLAN_COLOR[user.plan]}15`, color: PLAN_COLOR[user.plan], border: `1px solid ${PLAN_COLOR[user.plan]}30` }}>
                          {PLAN_ICON[user.plan]} Plan {user.plan.toUpperCase()}
                          {user.planExpiry && <span className="ml-auto text-white/30 font-normal">vence {user.planExpiry}</span>}
                        </div>
                      )}
                      <p className="text-[10px] text-white/35 mt-1">{user?.finca}</p>
                    </div>
                    <div className="p-1">
                      {[
                        { href: '/configuracion', emoji: '⚙️', label: 'Configuración' },
                        { href: '/usuarios',      emoji: '👤', label: 'Gestión de usuarios' },
                        { href: '/documentacion', emoji: '📚', label: 'Documentación' },
                        { href: '/planes',        emoji: '👑', label: 'Planes · Wompi', gold: true },
                      ].map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setShowUserMenu(false)}>
                          <div
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/5 cursor-pointer transition-all"
                            style={item.gold ? { color: '#fbbf24' } : { color: 'rgba(255,255,255,0.7)' }}
                          >
                            <span className="text-base">{item.emoji}</span>{item.label}
                          </div>
                        </Link>
                      ))}
                      <div className="border-t my-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-all"
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

        {/* ── Page content ─────────────────────────────────────────────────── */}
        <div className="flex-1 p-3 lg:p-5 overflow-x-hidden pb-20 lg:pb-5">
          {children}
        </div>

        {/* ── Mobile bottom nav ─────────────────────────────────────────── */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t"
          style={{
            background: 'rgba(7,19,37,0.97)',
            backdropFilter: 'blur(28px)',
            borderColor: 'rgba(0,245,212,0.12)',
            paddingBottom: 'env(safe-area-inset-bottom,0px)',
            height: 66,
            boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
          }}
        >
          {bottomTabs.map(tab => {
            const active = isActive(tab.href);
            const m = MODULES[tab.href];
            return (
              <Link key={tab.href} href={tab.href}>
                <div className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative cursor-pointer">
                  {active && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                      style={{ background: m.from, boxShadow: `0 0 10px rgba(${m.glow},1)` }} />
                  )}
                  <div className="relative flex items-center justify-center transition-all duration-200"
                    style={{
                      width: 38, height: 38, fontSize: 18, borderRadius: 13,
                      background: active ? `linear-gradient(135deg,${m.from},${m.to})` : 'rgba(255,255,255,0.05)',
                      boxShadow: active ? `0 0 16px rgba(${m.glow},0.55)` : 'none',
                      transform: active ? 'scale(1.12)' : 'scale(1)',
                    }}>
                    {tab.emoji}
                    {tab.badge && !active && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-medium leading-none transition-colors"
                    style={{ color: active ? m.from : 'rgba(255,255,255,0.38)' }}>
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Más → abre sidebar */}
          <button onClick={() => setMobileOpen(true)} className="flex flex-col items-center gap-0.5 px-3 py-1.5 cursor-pointer">
            <div className="flex items-center justify-center" style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.05)', borderRadius: 13 }}>
              <Menu size={18} className="text-white/50" />
            </div>
            <span className="text-[9px] font-medium text-white/38 leading-none">Más</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
