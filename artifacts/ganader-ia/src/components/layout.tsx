import { Link, useLocation } from "wouter";
import {
  Bell, Menu, X, Sun, Moon, LogOut, ChevronDown, Download,
  Database, ChevronLeft, Wifi, Crown, LayoutDashboard, Beef,
  FileText, Heart, Droplets, Dna, Layers, Wheat, Zap, Scale,
  Package, FlaskConical, DollarSign, Users, TrendingUp, Leaf,
  Map, Navigation, UserCog, Settings, BookOpen, Truck, Activity,
  ChevronRight, Building2, Cpu, BarChart3, Lock, ShoppingBag, Cloud,
} from "lucide-react";
import { AiAssistant } from "./ai-assistant";
import { SyncStatusPill } from "./sync-status";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { PLAN_ICON, PLAN_COLOR, PLAN_COLOR2, PLAN_GLOW, PLAN_LABEL } from "@/lib/auth";
import { applyPlanTheme } from "@/lib/api";
import { usePlanTheme } from "@/lib/plan-theme";

interface LayoutProps { children: React.ReactNode; }

/* ── PIÑA NEON palette ─────────────────────────────────────────────────────
   Primary accent: #FFD60A (pineapple neon gold)
   Forest bottom nav: #00C896 (forest neon green)
────────────────────────────────────────────────────────────────────────── */
const PIÑA   = '#FFD60A';
const PIÑA2  = '#F59E0B';
const FOREST = '#00C896';

type LucideIcon = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

interface ModuleDef {
  icon: LucideIcon; from: string; to: string; glow: string;
  emoji: string; label: string; shortLabel: string;
}

const MODULES: Record<string, ModuleDef> = {
  '/':              { icon: LayoutDashboard, from:'#FFD60A', to:'#F59E0B', glow:'255,214,10',   emoji:'📊', label:'Dashboard PRO',       shortLabel:'Inicio'    },
  '/alertas':       { icon: Bell,            from:'#ff4d6d', to:'#c9184a', glow:'255,77,109',   emoji:'🔔', label:'Alertas',              shortLabel:'Alertas'   },
  '/inventario':    { icon: Beef,            from:'#39ff7e', to:'#00c850', glow:'57,255,126',   emoji:'🐄', label:'Inventario',           shortLabel:'Inventario'},
  '/ficha':         { icon: FileText,        from:'#00f5d4', to:'#00a8cc', glow:'0,245,212',    emoji:'📋', label:'Ficha Individual',     shortLabel:'Ficha'     },
  '/reproduccion':  { icon: Heart,           from:'#ff6fd8', to:'#c026d3', glow:'255,111,216',  emoji:'🔁', label:'Reproducción',         shortLabel:'Reprod.'   },
  '/produccion':    { icon: Droplets,        from:'#00c8ff', to:'#0ea5e9', glow:'0,200,255',    emoji:'🥛', label:'Producción',           shortLabel:'Producción'},
  '/genetica':      { icon: Dna,             from:'#a855f7', to:'#7c3aed', glow:'168,85,247',   emoji:'🧬', label:'Genética y Pedigrí',   shortLabel:'Genética'  },
  '/potreros':      { icon: Layers,          from:'#84ef34', to:'#65a30d', glow:'132,239,52',   emoji:'🌿', label:'Potreros',             shortLabel:'Potreros'  },
  '/alimentacion':  { icon: Wheat,           from:'#ffd166', to:'#f59e0b', glow:'255,209,102',  emoji:'🌾', label:'Alimentación',         shortLabel:'Alimento'  },
  '/pesaje':        { icon: Scale,           from:'#ff9a3c', to:'#ea580c', glow:'255,154,60',   emoji:'⚖️', label:'Básculas BT',          shortLabel:'BT'        },
  '/pesaje-manual': { icon: Cpu,             from:'#c084fc', to:'#7c3aed', glow:'192,132,252',  emoji:'⚡', label:'Pesaje Automatizado',  shortLabel:'Auto'      },
  '/insumos':       { icon: Package,         from:'#fbbf24', to:'#d97706', glow:'251,191,36',   emoji:'💊', label:'Insumos y Medicinas',  shortLabel:'Insumos'   },
  '/semen':         { icon: FlaskConical,    from:'#818cf8', to:'#4f46e5', glow:'129,140,248',  emoji:'🧪', label:'Semen y Embriones',    shortLabel:'Semen'     },
  '/costos':        { icon: DollarSign,      from:'#34d399', to:'#059669', glow:'52,211,153',   emoji:'💰', label:'Costos y P&G',         shortLabel:'Costos'    },
  '/personal':      { icon: Users,           from:'#94a3b8', to:'#64748b', glow:'148,163,184',  emoji:'👥', label:'Personal',             shortLabel:'Personal'  },
  '/prediccion':    { icon: TrendingUp,      from:'#e879f9', to:'#9333ea', glow:'232,121,249',  emoji:'🤖', label:'Predicciones IA',      shortLabel:'IA'        },
  '/co2':           { icon: Leaf,            from:'#4ade80', to:'#16a34a', glow:'74,222,128',   emoji:'🌱', label:'Huella de Carbono',    shortLabel:'CO₂'       },
  '/multifinca':    { icon: Building2,       from:'#22d3ee', to:'#0891b2', glow:'34,211,238',   emoji:'🗺️', label:'Multi-Finca',          shortLabel:'Fincas'    },
  '/gps':           { icon: Navigation,      from:'#00c8ff', to:'#1d4ed8', glow:'0,200,255',    emoji:'📡', label:'Rastreo GPS',          shortLabel:'GPS'       },
  '/usuarios':      { icon: UserCog,         from:'#c084fc', to:'#7c3aed', glow:'192,132,252',  emoji:'👤', label:'Usuarios',             shortLabel:'Usuarios'  },
  '/configuracion': { icon: Settings,        from:'#9ca3af', to:'#6b7280', glow:'156,163,175',  emoji:'⚙️', label:'Configuración',        shortLabel:'Config.'   },
  '/documentacion': { icon: BookOpen,        from:'#38bdf8', to:'#0369a1', glow:'56,189,248',   emoji:'📚', label:'Documentación',        shortLabel:'Docs'      },
  '/manual':        { icon: BookOpen,        from:'#2dd4bf', to:'#0d9488', glow:'45,212,191',   emoji:'📖', label:'Manual de Uso',        shortLabel:'Manual'    },
  '/planes':        { icon: Crown,           from:'#fbbf24', to:'#ea580c', glow:'251,191,36',   emoji:'🛡️', label:'Licencia CIVAC',       shortLabel:'Licencia'  },
  '/lotes':         { icon: Truck,           from:'#00c8ff', to:'#0891b2', glow:'0,200,255',    emoji:'🐂', label:'Movimiento Lotes',     shortLabel:'Lotes'     },
  '/datos':         { icon: Database,        from:'#818cf8', to:'#4f46e5', glow:'129,140,248',  emoji:'🗄️', label:'Data Warehouse',       shortLabel:'Datos'     },
  '/ventas':        { icon: ShoppingBag,     from:'#e879f9', to:'#a855f7', glow:'232,121,249',  emoji:'💼', label:'Asesora de Ventas',    shortLabel:'CRM'       },
  '/drive':         { icon: Cloud,           from:'#00c8ff', to:'#0070cc', glow:'0,200,255',    emoji:'☁️', label:'Google Drive',          shortLabel:'Drive'     },
};

/* ── Plan-based route access ───────────────────────────────────────────────── */
const PLAN_ROUTES: Record<string, string[]> = {
  basico:  ['/', '/alertas', '/inventario', '/produccion', '/potreros'],
  pro:     ['/', '/alertas', '/inventario', '/produccion', '/potreros',
            '/reproduccion', '/genetica', '/pesaje', '/ficha', '/alimentacion',
            '/gps', '/insumos', '/semen', '/costos', '/personal', '/multifinca', '/prediccion',
            '/ventas'],
  premium: ['/', '/alertas', '/inventario', '/produccion', '/potreros',
            '/reproduccion', '/genetica', '/pesaje', '/ficha', '/alimentacion',
            '/gps', '/insumos', '/semen', '/costos', '/personal', '/multifinca', '/prediccion',
            '/pesaje-manual', '/co2', '/lotes', '/datos', '/ventas', '/drive'],
  platino: ['/', '/alertas', '/inventario', '/produccion', '/potreros',
            '/reproduccion', '/genetica', '/pesaje', '/ficha', '/alimentacion',
            '/gps', '/insumos', '/semen', '/costos', '/personal', '/multifinca', '/prediccion',
            '/pesaje-manual', '/co2', '/lotes', '/datos',
            '/usuarios', '/configuracion', '/documentacion', '/manual', '/planes', '/ventas', '/drive'],
};

const PLAN_REQUIRED: Record<string, string> = {
  '/reproduccion': 'PRO', '/genetica': 'PRO', '/pesaje': 'PRO', '/ficha': 'PRO',
  '/alimentacion': 'PRO', '/gps': 'PRO', '/insumos': 'PRO', '/semen': 'PRO',
  '/costos': 'PRO', '/personal': 'PRO', '/multifinca': 'PRO', '/prediccion': 'PRO',
  '/pesaje-manual': 'PREMIUM', '/co2': 'PREMIUM', '/lotes': 'PREMIUM', '/datos': 'PREMIUM', '/drive': 'PREMIUM',
  '/usuarios': 'PLATINO', '/configuracion': 'PLATINO', '/documentacion': 'PLATINO',
  '/manual': 'PLATINO', '/planes': 'PLATINO',
};

const ROLE_COLORS: Record<string, string> = {
  admin:  'bg-[#FFD60A] text-black',
  vet:    'bg-[#00c8ff] text-black',
  field:  'bg-[#39ff7e] text-black',
  viewer: 'bg-[#c084fc] text-black',
  sales:  'bg-[#e879f9] text-black',
};
const ROLE_LABELS: Record<string, string> = {
  admin:'Admin', vet:'Veterinario', field:'Campo', viewer:'Visor', sales:'Ventas CRM'
};

/* ─── Logo vaca moderna GanaderIA ─────────────────────────────────────────── */
function CivacLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lgBg1" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#0e3a20"/><stop offset="1" stopColor="#082818"/>
        </linearGradient>
        <radialGradient id="lgBgR" cx="35%" cy="28%" r="55%">
          <stop stopColor="#1a6640" stopOpacity="0.5"/>
          <stop offset="1" stopColor="#082818" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="lgBody" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop stopColor="#f0ede0"/><stop offset="1" stopColor="#d8d0b8"/>
        </linearGradient>
        <linearGradient id="lgHead" x1="0" y1="0" x2="0.5" y2="1">
          <stop stopColor="#f0ede0"/><stop offset="1" stopColor="#ccc4a8"/>
        </linearGradient>
        <linearGradient id="lgMuzzle" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#e8c8b0"/><stop offset="1" stopColor="#d0a888"/>
        </linearGradient>
        <linearGradient id="lgHorn" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f5d878"/><stop offset="1" stopColor="#c8a030"/>
        </linearGradient>
        <linearGradient id="lgSpot1" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#3a2818"/><stop offset="1" stopColor="#281808"/>
        </linearGradient>
        <linearGradient id="lgEar" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ddd4b8"/><stop offset="1" stopColor="#b8a880"/>
        </linearGradient>
        <linearGradient id="lgChip" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFD60A"/><stop offset="1" stopColor="#F59E0B"/>
        </linearGradient>
        <linearGradient id="lgCirc" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#FFD60A"/><stop offset="0.5" stopColor="#00c8ff"/><stop offset="1" stopColor="#FFD60A"/>
        </linearGradient>
        <linearGradient id="lgBorder" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFD60A" stopOpacity="0.8"/>
          <stop offset="0.5" stopColor="#2aaa60" stopOpacity="0.5"/>
          <stop offset="1" stopColor="#F59E0B" stopOpacity="0.7"/>
        </linearGradient>
        <radialGradient id="lgEye" cx="38%" cy="32%" r="65%">
          <stop stopColor="#4a3020"/><stop offset="0.5" stopColor="#281808"/><stop offset="1" stopColor="#180c04"/>
        </radialGradient>
        <filter id="lgGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="lgShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.35"/>
        </filter>
        <filter id="lgInner" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.25"/>
        </filter>
        <linearGradient id="lgShine" x1="0" y1="0" x2="0.3" y2="1">
          <stop stopColor="white" stopOpacity="0.18"/><stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <radialGradient id="lgRfid" cx="40%" cy="35%" r="60%">
          <stop stopColor="#FFD60A"/><stop offset="1" stopColor="#c8a030"/>
        </radialGradient>
      </defs>
      <rect width="120" height="120" rx="26" fill="url(#lgBg1)"/>
      <rect width="120" height="120" rx="26" fill="url(#lgBgR)"/>
      <path d="M38 46 C30 38 22 26 26 14 C29 5 38 8 40 18 C38 26 38 36 40 44" fill="url(#lgHorn)" filter="url(#lgShadow)"/>
      <path d="M82 46 C90 38 98 26 94 14 C91 5 82 8 80 18 C82 26 82 36 80 44" fill="url(#lgHorn)" filter="url(#lgShadow)"/>
      <path d="M36 38 C31 30 28 20 31 13" stroke="rgba(255,240,160,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M84 38 C89 30 92 20 89 13" stroke="rgba(255,240,160,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <ellipse cx="27" cy="54" rx="13" ry="9" fill="url(#lgEar)" transform="rotate(-22 27 54)" filter="url(#lgShadow)"/>
      <ellipse cx="27" cy="54" rx="7.5" ry="5" fill="#e8c0a0" transform="rotate(-22 27 54)"/>
      <ellipse cx="93" cy="54" rx="13" ry="9" fill="url(#lgEar)" transform="rotate(22 93 54)" filter="url(#lgShadow)"/>
      <ellipse cx="93" cy="54" rx="7.5" ry="5" fill="#e8c0a0" transform="rotate(22 93 54)"/>
      <circle cx="18" cy="55" r="6" fill="url(#lgRfid)" filter="url(#lgGlow)"/>
      <circle cx="18" cy="55" r="3.2" fill="#0a2818"/>
      <circle cx="18" cy="55" r="1.3" fill="#FFD60A" opacity="0.95"/>
      <ellipse cx="60" cy="72" rx="34" ry="32" fill="url(#lgBody)" filter="url(#lgShadow)"/>
      <ellipse cx="60" cy="56" rx="29" ry="25" fill="url(#lgHead)" filter="url(#lgInner)"/>
      <path d="M42 44 C38 40 35 46 38 52 C41 56 48 54 50 48 C52 42 46 40 42 44Z" fill="url(#lgSpot1)" opacity="0.75"/>
      <path d="M70 48 C67 44 63 46 64 52 C65 57 71 57 73 52 C75 48 73 44 70 48Z" fill="url(#lgSpot1)" opacity="0.65"/>
      <path d="M55 72 C52 68 50 74 53 78 C56 80 62 79 63 74 C64 70 58 68 55 72Z" fill="url(#lgSpot1)" opacity="0.45"/>
      <path d="M43 38 L48 38 L51 34 L69 34 L72 38 L77 38" stroke="url(#lgCirc)" strokeWidth="1.1" fill="none" opacity="0.85" filter="url(#lgGlow)"/>
      <path d="M51 34 L51 29 L56 29" stroke="url(#lgCirc)" strokeWidth="0.85" fill="none" opacity="0.7"/>
      <path d="M69 34 L69 29 L64 29" stroke="url(#lgCirc)" strokeWidth="0.85" fill="none" opacity="0.7"/>
      <rect x="56" y="24" width="8" height="8" rx="2.2" fill="url(#lgChip)" opacity="0.95" filter="url(#lgGlow)"/>
      <rect x="58" y="26" width="4" height="4" rx="1" fill="#071a2f" opacity="0.95"/>
      <line x1="58.5" y1="24" x2="58.5" y2="22" stroke="#FFD60A" strokeWidth="0.7" opacity="0.55"/>
      <line x1="61.5" y1="24" x2="61.5" y2="22" stroke="#FFD60A" strokeWidth="0.7" opacity="0.55"/>
      <circle cx="48" cy="38" r="1.8" fill="#FFD60A" opacity="0.9" filter="url(#lgGlow)"/>
      <circle cx="72" cy="38" r="1.8" fill="#FFD60A" opacity="0.9" filter="url(#lgGlow)"/>
      <circle cx="56" cy="29" r="1.4" fill="#00c8ff" opacity="0.85"/>
      <circle cx="64" cy="29" r="1.4" fill="#00c8ff" opacity="0.85"/>
      <ellipse cx="44" cy="58" rx="9" ry="8.5" fill="#1a1008" filter="url(#lgInner)"/>
      <ellipse cx="44" cy="58" rx="7" ry="6.5" fill="url(#lgEye)"/>
      <circle cx="44" cy="58" r="3.8" fill="#0e0804"/>
      <circle cx="46" cy="55.5" r="2" fill="white" opacity="0.95"/>
      <circle cx="42.5" cy="60" r="0.9" fill="white" opacity="0.4"/>
      <path d="M37 53 Q44 50.5 51 53" stroke="#2a1808" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6"/>
      <ellipse cx="76" cy="58" rx="9" ry="8.5" fill="#1a1008" filter="url(#lgInner)"/>
      <ellipse cx="76" cy="58" rx="7" ry="6.5" fill="url(#lgEye)"/>
      <circle cx="76" cy="58" r="3.8" fill="#0e0804"/>
      <circle cx="78" cy="55.5" r="2" fill="white" opacity="0.95"/>
      <circle cx="74.5" cy="60" r="0.9" fill="white" opacity="0.4"/>
      <path d="M69 53 Q76 50.5 83 53" stroke="#2a1808" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6"/>
      <ellipse cx="60" cy="84" rx="19" ry="14" fill="url(#lgMuzzle)" filter="url(#lgShadow)"/>
      <ellipse cx="60" cy="86" rx="15" ry="10" fill="#c89870" opacity="0.6"/>
      <ellipse cx="53" cy="87" rx="4.2" ry="3.2" fill="#1a0e08" opacity="0.9"/>
      <ellipse cx="67" cy="87" rx="4.2" ry="3.2" fill="#1a0e08" opacity="0.9"/>
      <ellipse cx="54" cy="86" rx="1.4" ry="0.9" fill="rgba(255,255,255,0.15)"/>
      <ellipse cx="68" cy="86" rx="1.4" ry="0.9" fill="rgba(255,255,255,0.15)"/>
      <path d="M60 91 Q57 95.5 53 93.5" stroke="#180e06" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M60 91 Q63 95.5 67 93.5" stroke="#180e06" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <ellipse cx="58" cy="28" rx="34" ry="18" fill="url(#lgShine)"/>
      <rect width="120" height="120" rx="26" fill="none" stroke="url(#lgBorder)" strokeWidth="1.8"/>
      <rect x="2" y="2" width="116" height="116" rx="24" fill="none" stroke="rgba(255,214,10,0.12)" strokeWidth="0.8"/>
    </svg>
  );
}

/* ─── Plan-aware PWA install button ─────────────────────────────────────── */
const PLAN_MOD_COUNTS: Record<string, number> = {
  basico: 5, pro: 17, premium: 21, platino: 26,
};

function PwaInstallButton({
  installPrompt,
  onInstall,
  user,
  compact = false,
}: {
  installPrompt: Event | null;
  onInstall: () => void;
  user: { nombre: string; plan?: string; role?: string } | null;
  compact?: boolean;
}) {
  const [showPanel, setShowPanel] = useState(false);
  const plan = (user?.plan ?? 'basico') as string;
  const planColor = PLAN_COLOR[plan as keyof typeof PLAN_COLOR] ?? '#94a3b8';
  const planLabel = ({ basico:'Básico', pro:'PRO', premium:'Premium', platino:'Platino' } as Record<string,string>)[plan] ?? plan;
  const planIcon  = ({ basico:'⚙️',   pro:'🚀',  premium:'💎',     platino:'👑'       } as Record<string,string>)[plan] ?? '⚙️';
  const modCount  = PLAN_MOD_COUNTS[plan] ?? 5;

  const downloadPlanConfig = () => {
    const config = {
      civac_version: "4.2",
      tipo: "pwa_plan_config",
      generada: new Date().toISOString(),
      usuario: user?.nombre ?? "Usuario",
      plan: { id: plan, label: planLabel, modulos: modCount },
      instrucciones: [
        "1. Instala la PWA de GanaderIA desde tu navegador",
        "2. Al abrir la app, carga este archivo en Configuración → Licencia",
        `3. Tu plan ${planLabel} activa ${modCount} módulos`,
        "4. La app funciona offline con tus datos sincronizados",
      ],
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `civac_pwa_${plan}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowPanel(v => !v)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold transition-all"
          style={{ color: planColor, background: `${planColor}12`, border: `1px solid ${planColor}30`, borderRadius: 10 }}
        >
          <Download size={12} />
          <span>Instalar {planLabel}</span>
        </button>
        {showPanel && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
            <div className="absolute right-0 top-full mt-1.5 w-72 z-50 rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'rgba(4,15,26,0.98)', backdropFilter: 'blur(24px)', border: `1px solid ${planColor}30` }}>
              <div className="h-0.5" style={{ background: `linear-gradient(90deg,${planColor},transparent)` }} />
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{planIcon}</span>
                  <div>
                    <div className="font-black text-sm text-white">Plan {planLabel}</div>
                    <div className="text-[10px]" style={{ color: planColor }}>{modCount} módulos activos</div>
                  </div>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Instala GanaderIA como app nativa en tu dispositivo. Tu plan {planLabel} se activa automáticamente con todos sus módulos.
                </p>
                {installPrompt && (
                  <button onClick={() => { onInstall(); setShowPanel(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all hover:scale-[1.02]"
                    style={{ background: `linear-gradient(135deg,${planColor},${planColor}99)`, color: '#000' }}>
                    <Download size={13} /> Instalar PWA — Plan {planLabel}
                  </button>
                )}
                <button onClick={downloadPlanConfig}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all hover:opacity-90"
                  style={{ background: `${planColor}12`, border: `1px solid ${planColor}30`, color: planColor }}>
                  <Download size={12} /> Descargar config del plan
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {installPrompt && (
        <button onClick={onInstall}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-all hover:scale-[1.02]"
          style={{ color: planColor, background: `${planColor}10`, border: `1px solid ${planColor}25`, borderRadius: 12 }}
        >
          <Download size={13} />
          <span className="flex-1 text-left">Instalar PWA · Plan {planLabel}</span>
          <span className="text-[9px] opacity-60">{modCount} mód.</span>
        </button>
      )}
      <button onClick={downloadPlanConfig}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] transition-all hover:opacity-90"
        style={{ color: `${planColor}80`, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}
      >
        <Download size={11} />
        <span className="flex-1 text-left">Descargar config {planLabel}</span>
      </button>
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string,boolean>>({
    'Principal': true, 'Animales': true, 'Campo': true,
    'Gestión': true, 'IA & Analytics': true, 'Sistema': true,
  });
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pt = usePlanTheme();

  const mod = MODULES[location] || MODULES['/'];

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setInstallPrompt(e); (window as any).__pwaInstallPrompt = e; };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  // Apply plan-based CSS theme variables whenever the user or their plan changes
  useEffect(() => {
    const planCode = user?.plan ?? 'basico';
    applyPlanTheme(planCode);
  }, [user]);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const isActive = (p: string) => location === p;
  const toggleSection = (name: string) =>
    setOpenSections(prev => ({ ...prev, [name]: !prev[name] }));

  /* ── Nav item with lucide icon + piña neon ──────────────────────────────── */
  const NavItem = ({ href, badge, accent, accentColor, pulse }: {
    href: string; badge?: number | string; accent?: string; accentColor?: string; pulse?: boolean;
  }) => {
    const active = isActive(href);
    const m = MODULES[href] || MODULES['/'];
    const Icon = m.icon;

    /* Plan-based locking */
    const userPlan = (user?.plan ?? 'basico') as string;
    const isLocked = user?.role !== 'admin' && !(PLAN_ROUTES[userPlan] ?? PLAN_ROUTES.basico).includes(href);
    const reqPlan = PLAN_REQUIRED[href];

    if (isLocked) {
      return (
        <Link href="/planes">
          <div className="flex items-center gap-2.5 px-2 py-1.5 mx-1.5 my-0.5 cursor-pointer group transition-all"
            style={{ borderRadius: 13, opacity: 0.45 }}>
            <div className="flex-shrink-0 flex items-center justify-center"
              style={{ width: 30, height: 30, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.25)' }}>
              <Icon size={15} strokeWidth={2.3} />
            </div>
            {!collapsed && (
              <>
                <span className="flex-1 text-[13px] text-white/25 truncate" style={{ fontFamily: "'Space Grotesk','Sora',sans-serif", fontWeight: 400 }}>
                  {m.label}
                </span>
                <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0"
                  style={{ background: 'rgba(255,149,0,0.10)', color: 'rgba(255,149,0,0.65)', border: '1px solid rgba(255,149,0,0.18)' }}>
                  <Lock size={6}/>{reqPlan ?? 'PRO'}
                </span>
              </>
            )}
            {collapsed && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,149,0,0.9)' }}>
                <Lock size={6} color="white" />
              </span>
            )}
          </div>
        </Link>
      );
    }

    return (
      <Link href={href} onClick={() => setMobileOpen(false)}>
        <div
          className="flex items-center gap-2.5 px-2 py-1.5 mx-1.5 my-0.5 cursor-pointer group relative overflow-hidden transition-all duration-150"
          style={{
            borderRadius: 13,
            background: active
              ? `linear-gradient(135deg,rgba(255,214,10,0.16),rgba(245,158,11,0.07))`
              : 'transparent',
            border: active
              ? `1px solid rgba(255,214,10,0.40)`
              : `1px solid transparent`,
            boxShadow: active ? `0 0 20px rgba(255,214,10,0.12)` : 'none',
          }}
        >
          {/* Hover fill */}
          {!active && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
              style={{ background: `rgba(${m.glow},0.06)`, borderRadius: 13, border: `1px solid rgba(${m.glow},0.12)` }} />
          )}
          {/* Left accent bar */}
          {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
              style={{ background: `linear-gradient(180deg,${PIÑA},${PIÑA2})`, boxShadow: `0 0 10px ${PIÑA}cc` }} />
          )}
          {/* Icon */}
          <div
            className="flex-shrink-0 flex items-center justify-center transition-all duration-200 group-hover:scale-110"
            style={{
              width: 30, height: 30, borderRadius: 10,
              background: active
                ? `linear-gradient(135deg,${PIÑA},${PIÑA2})`
                : `rgba(${m.glow},0.12)`,
              border: active ? 'none' : `1px solid rgba(${m.glow},0.22)`,
              boxShadow: active
                ? `0 0 16px rgba(255,214,10,0.55), inset 0 1px 0 rgba(255,255,255,0.25)`
                : `0 0 6px rgba(${m.glow},0.12)`,
              color: active ? '#000' : m.from,
            }}
          >
            <Icon size={15} strokeWidth={2.3} />
          </div>
          {!collapsed && (
            <>
              <span
                className="flex-1 text-[13px] leading-none transition-all truncate"
                style={{
                  color: active ? PIÑA : 'rgba(255,255,255,0.68)',
                  fontWeight: active ? 700 : 500,
                  fontFamily: "'Space Grotesk','Sora',sans-serif",
                  textShadow: active ? `0 0 12px rgba(255,214,10,0.4)` : 'none',
                }}
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
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${accentColor || 'bg-[#FFD60A]/15 text-[#FFD60A] border-[#FFD60A]/25'}`}>{accent}</span>
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

  const SECTION_META: Record<string, { color: string; icon: string }> = {
    'Principal':      { color: PIÑA,      icon: '⬡' },
    'Animales':       { color: '#39ff7e', icon: '⬡' },
    'Campo':          { color: '#84ef34', icon: '⬡' },
    'Gestión':        { color: '#fbbf24', icon: '⬡' },
    'IA & Analytics': { color: '#e879f9', icon: '⬡' },
    'Sistema':        { color: '#818cf8', icon: '⬡' },
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const meta = SECTION_META[title] || { color: PIÑA, icon: '⬡' };
    const isOpen = openSections[title] ?? true;
    return (
      <div className="mb-0.5">
        {!collapsed && (
          <button
            onClick={() => toggleSection(title)}
            className="w-full px-3.5 pt-3 pb-1.5 flex items-center gap-2 cursor-pointer group hover:opacity-90 transition-opacity"
          >
            <div className="w-1 h-3 rounded-full flex-shrink-0"
              style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}99` }} />
            <p className="text-[9.5px] uppercase font-black tracking-[0.20em] flex-1 text-left"
              style={{ color: meta.color, textShadow: `0 0 8px ${meta.color}55` }}>
              {title}
            </p>
            <ChevronDown size={11}
              className="transition-transform duration-250 flex-shrink-0"
              style={{ color: `${meta.color}70`, transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
          </button>
        )}
        {collapsed && <div className="mx-3 my-2 border-t border-white/8" />}
        <div
          className="overflow-hidden transition-all duration-250"
          style={{ maxHeight: isOpen || collapsed ? 800 : 0 }}
        >
          {children}
        </div>
      </div>
    );
  };

  const sideW = collapsed ? 'w-[58px]' : 'w-[230px]';

  /* ── Bottom nav tabs ──────────────────────────────────────────────────── */
  const bottomTabs = [
    { href: '/',              Icon: LayoutDashboard, label: 'Inicio',  badge: undefined },
    { href: '/inventario',    Icon: Beef,            label: 'Ganado',  badge: undefined },
    { href: '/pesaje-manual', Icon: Cpu,             label: 'Pesaje',  badge: undefined },
    { href: '/alertas',       Icon: Bell,            label: 'Alertas', badge: 4 },
    { href: '/produccion',    Icon: Droplets,        label: 'Leche',   badge: undefined },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground" style={{ fontFamily: "'Space Grotesk','Sora',sans-serif" }}>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 ${sideW} z-50 flex flex-col border-r transition-all duration-250
          lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'linear-gradient(180deg,#0d2247 0%,#122a58 40%,#0f2550 70%,#0d2247 100%)',
          borderColor: `rgba(${pt.glow},0.28)`,
          boxShadow: mobileOpen ? `6px 0 40px rgba(0,0,0,0.7), 2px 0 0 rgba(${pt.glow},0.18)` : `2px 0 0 rgba(${pt.glow},0.10)`,
        }}
      >
        {/* Plan-tinted glow texture */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 15%, rgba(${pt.glow},0.09) 0%, transparent 50%),
              radial-gradient(circle at 80% 85%, rgba(${pt.glow},0.05) 0%, transparent 45%),
              radial-gradient(circle at 50% 50%, rgba(20,60,160,0.04) 0%, transparent 70%),
              repeating-linear-gradient(0deg,transparent,transparent 44px,rgba(${pt.glow},0.018) 44px,rgba(${pt.glow},0.018) 45px)
            `
          }} />
        </div>

        {/* ── Logo header ── */}
        <div className="h-[68px] flex items-center justify-between px-3 border-b flex-shrink-0 relative"
          style={{ borderColor: `rgba(${pt.glow},0.20)` }}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex-shrink-0">
                <CivacLogo size={44} />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-black text-[19px] tracking-tight leading-none" style={{ fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em' }}>
                    <span className="text-white">Ganad</span>
                    <span style={{ color: PIÑA, textShadow: `0 0 18px rgba(255,214,10,0.9)` }}>erIA</span>
                  </span>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md"
                    style={{ background: `linear-gradient(135deg,${PIÑA},${PIÑA2})`, color: '#000', letterSpacing: '0.03em' }}>
                    v4
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded"
                    style={{ background: 'linear-gradient(135deg,#ff6a00,#ee0979)', color: 'white', letterSpacing: '0.08em' }}>
                    PRO
                  </span>
                  <span className="text-[8px] leading-none" style={{ color: 'rgba(255,214,10,0.40)' }}>
                    CIVAC · Colombia
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto relative">
              <CivacLogo size={38} />
            </div>
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

        {/* ── User badge ── */}
        {user && !collapsed && (() => {
          const plan = (user.plan ?? 'basico') as import("@/lib/auth").PlanId;
          const pc1  = PLAN_COLOR[plan];
          const pc2  = PLAN_COLOR2[plan];
          const pg   = PLAN_GLOW[plan];
          return (
            <div className="px-2.5 py-2 border-b flex-shrink-0" style={{ borderColor: `rgba(${pg},0.14)` }}>
              <div className="flex items-center gap-2 px-2.5 py-2.5 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg,rgba(5,15,40,0.92),rgba(8,20,50,0.88))`,
                  border: `1px solid rgba(${pg},0.28)`,
                  borderRadius: 13,
                  boxShadow: `0 0 14px rgba(${pg},0.12), inset 0 1px 0 rgba(255,255,255,0.04)`,
                }}>
                {/* Metallic shimmer stripe */}
                <div className="absolute top-0 left-0 w-full h-px opacity-60"
                  style={{ background: `linear-gradient(90deg,transparent,${pc1},${pc2},transparent)` }} />
                <div className={`w-8 h-8 rounded-full ${ROLE_COLORS[user.role]} flex items-center justify-center font-black text-[12px] flex-shrink-0`}
                  style={{ boxShadow: `0 0 12px rgba(${pg},0.45), 0 0 4px rgba(${pg},0.3)`, border: `1.5px solid rgba(${pg},0.4)` }}>
                  {user.nombre.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-white/90 truncate leading-tight">
                    {user.nombre.split(' ').slice(0, 2).join(' ')}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9px] leading-none" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                    {user.plan && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md leading-none"
                        style={{
                          background: `linear-gradient(135deg,${pc1},${pc2})`,
                          color: plan === 'basico' || plan === 'premium' ? '#000' : plan === 'pro' ? '#000' : '#fff',
                          letterSpacing: '0.04em',
                          boxShadow: `0 0 8px rgba(${pg},0.5)`,
                        }}>
                        {PLAN_ICON[plan]} {PLAN_LABEL[plan].toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
                  style={{ background: '#39ff7e', boxShadow: '0 0 8px rgba(57,255,126,0.9)' }} />
              </div>
            </div>
          );
        })()}
        {user && collapsed && (
          <div className="flex justify-center py-2 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className={`w-8 h-8 rounded-full ${ROLE_COLORS[user.role]} flex items-center justify-center font-black text-[12px]`}
              style={{ border: `1.5px solid ${PLAN_COLOR[(user.plan ?? 'basico') as import("@/lib/auth").PlanId]}40` }}>
              {user.nombre.charAt(0)}
            </div>
          </div>
        )}

        {/* ── Pesaje Rápido quick-access ── */}
        {!collapsed && (
          <div className="px-2.5 pt-2 pb-1 flex-shrink-0">
            <Link href="/pesaje-manual">
              <div className="px-3 py-2.5 cursor-pointer group transition-all hover:scale-[1.02]"
                style={{
                  borderRadius: 13,
                  background: `linear-gradient(135deg,rgba(255,214,10,0.10),rgba(245,158,11,0.05))`,
                  border: `1px solid rgba(255,214,10,0.22)`,
                  boxShadow: `0 0 14px rgba(255,214,10,0.06)`,
                }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg,${PIÑA},${PIÑA2})`,
                      boxShadow: `0 0 12px rgba(255,214,10,0.35)`,
                      color: '#000',
                    }}>
                    <Cpu size={15} strokeWidth={2.3} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black leading-tight" style={{ color: PIÑA }}>Pesaje Automatizado</p>
                    <p className="text-[9px] leading-tight" style={{ color: 'rgba(255,214,10,0.45)' }}>
                      Foto · IA · Lote · Recibo WA
                    </p>
                  </div>
                  <div className="text-[8px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: `rgba(255,214,10,0.12)`, color: PIÑA, border: `1px solid rgba(255,214,10,0.25)` }}>
                    PRO
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex-1 overflow-y-auto py-1 scrollbar-thin">
          <Section title="Principal">
            <NavItem href="/" accent="LIVE" accentColor="bg-[#39ff7e]/15 text-[#39ff7e] border-[#39ff7e]/25" />
            <NavItem href="/alertas" badge={4} pulse />
          </Section>
          <Section title="Animales">
            <NavItem href="/inventario" />
            <NavItem href="/lotes" accent="NEW" accentColor="bg-[#00c8ff]/15 text-[#00c8ff] border-[#00c8ff]/25" />
            <NavItem href="/ficha" />
            <NavItem href="/reproduccion" />
            <NavItem href="/produccion" />
            <NavItem href="/genetica" />
            <NavItem href="/pesaje" accent="BT⚡" accentColor="bg-[#ff9500]/15 text-[#ff9500] border-[#ff9500]/25" />
            <NavItem href="/pesaje-manual" accent="CC" accentColor="bg-[#FFD60A]/15 text-[#FFD60A] border-[#FFD60A]/25" />
          </Section>
          <Section title="Campo">
            <NavItem href="/potreros" />
            <NavItem href="/alimentacion" />
            <NavItem href="/gps" accent="GPS" accentColor="bg-[#00c8ff]/15 text-[#00c8ff] border-[#00c8ff]/25" />
          </Section>
          <Section title="Ventas CRM">
            <NavItem href="/ventas" accent="CRM" accentColor="bg-[#e879f9]/15 text-[#e879f9] border-[#e879f9]/25" />
            <NavItem href="/drive" accent="NUBE" accentColor="bg-[#00c8ff]/15 text-[#00c8ff] border-[#00c8ff]/25" />
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

        {/* ── Sidebar footer ── */}
        <div className="px-2.5 pb-3 pt-2 border-t space-y-1 flex-shrink-0" style={{ borderColor: `rgba(255,214,10,0.08)` }}>
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-[9px]" style={{ color: 'rgba(255,214,10,0.25)' }}>
              <Wifi size={9} /><span>CIVAC v1 · GanaderIA PRO · Offline PWA · Colombia</span>
            </div>
          )}
          {!collapsed && (
            <PwaInstallButton
              installPrompt={installPrompt}
              onInstall={() => { (installPrompt as any).prompt(); setInstallPrompt(null); }}
              user={user}
            />
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

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-250 ${collapsed ? 'lg:pl-[58px]' : 'lg:pl-[230px]'}`}>

        {/* ── Topbar ────────────────────────────────────────────────────── */}
        <header
          className="h-[56px] sticky top-0 z-30 flex items-center justify-between px-3 lg:px-5 border-b"
          style={{
            background: 'rgba(4,15,26,0.97)',
            backdropFilter: 'blur(28px)',
            borderColor: `rgba(255,214,10,0.08)`,
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

            {/* Active module indicator */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex w-8 h-8 items-center justify-center"
                style={{
                  borderRadius: 12,
                  background: `linear-gradient(135deg,${PIÑA},${PIÑA2})`,
                  boxShadow: `0 0 16px rgba(255,214,10,0.50)`,
                  color: '#000',
                }}>
                <mod.icon size={16} strokeWidth={2.3} />
              </div>
              <div className="hidden md:block">
                <p className="text-[13px] font-bold text-white leading-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                  {mod.label}
                </p>
                <p className="text-[9px] leading-none" style={{ color: 'rgba(255,214,10,0.35)' }}>
                  CIVAC PRO · {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Sync status live pill */}
            <SyncStatusPill className="hidden lg:flex" />

            <Link href="/pesaje-manual">
              <button className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold transition-all hover:scale-[1.04]"
                style={{
                  color: PIÑA, background: `rgba(255,214,10,0.08)`,
                  border: `1px solid rgba(255,214,10,0.28)`, borderRadius: 10,
                  boxShadow: `0 0 12px rgba(255,214,10,0.08)`,
                }}>
                <Cpu size={11} /> <span>Pesaje Auto</span>
              </button>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            {installPrompt && (
              <PwaInstallButton
                installPrompt={installPrompt}
                onInstall={() => { (installPrompt as any).prompt(); setInstallPrompt(null); }}
                user={user}
                compact
              />
            )}

            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl text-white/50 hover:text-white/90 hover:bg-white/5 transition-all flex items-center justify-center"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <Link href="/alertas">
              <button className="relative w-8 h-8 rounded-xl text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex items-center justify-center">
                <Bell size={15} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: '#ff4d6d', boxShadow: '0 0 6px rgba(255,77,109,0.9)' }} />
              </button>
            </Link>

            <Link href="/planes">
              <button className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
                style={{ color: pt.primary, background: pt.topbarBg, border: `1px solid ${pt.topbarBorder}`, borderRadius: 10, boxShadow: `0 0 10px rgba(${pt.glow},0.18)` }}>
                <Crown size={12} /> {pt.label}
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
                      background: 'rgba(4,15,26,0.98)',
                      backdropFilter: 'blur(24px)',
                      borderColor: `rgba(255,214,10,0.16)`,
                      boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 30px rgba(255,214,10,0.04)`,
                    }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: `rgba(255,214,10,0.08)` }}>
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className={`w-9 h-9 rounded-full ${ROLE_COLORS[user?.role || 'admin']} flex items-center justify-center font-black text-sm`}>
                          {user?.nombre?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">{user?.nombre?.split(' ').slice(0, 2).join(' ')}</p>
                          <p className="text-[10px]" style={{ color: PIÑA }}>{ROLE_LABELS[user?.role || 'admin']}</p>
                        </div>
                      </div>
                      {user?.plan && (() => {
                        const p = user.plan as import("@/lib/auth").PlanId;
                        const c1 = PLAN_COLOR[p], c2 = PLAN_COLOR2[p], g = PLAN_GLOW[p];
                        return (
                          <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black relative overflow-hidden"
                            style={{ background: `rgba(${g},0.10)`, color: c1, border: `1px solid rgba(${g},0.35)`, boxShadow: `0 0 12px rgba(${g},0.15)` }}>
                            <div className="absolute top-0 left-0 w-full h-px opacity-50"
                              style={{ background: `linear-gradient(90deg,transparent,${c1},${c2},transparent)` }} />
                            <span>{PLAN_ICON[p]}</span>
                            <span>Plan <span style={{ background: `linear-gradient(90deg,${c1},${c2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{PLAN_LABEL[p]}</span></span>
                            {user.planExpiry && <span className="ml-auto text-white/25 font-normal text-[9px]">vence {user.planExpiry}</span>}
                          </div>
                        );
                      })()}
                      <p className="text-[10px] text-white/35 mt-1">{user?.finca}</p>
                    </div>
                    <div className="p-1">
                      {[
                        { href: '/configuracion', Icon: Settings,  label: 'Configuración',        gold: false },
                        { href: '/usuarios',      Icon: UserCog,   label: 'Gestión de usuarios',  gold: false },
                        { href: '/documentacion', Icon: BookOpen,  label: 'Documentación',        gold: false },
                        { href: '/planes',        Icon: Crown,     label: 'Planes · Wompi',       gold: true  },
                      ].map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setShowUserMenu(false)}>
                          <div
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/5 cursor-pointer transition-all"
                            style={item.gold ? { color: PIÑA } : { color: 'rgba(255,255,255,0.7)' }}
                          >
                            <item.Icon size={14} strokeWidth={2} />
                            {item.label}
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

        {/* ── Page content ──────────────────────────────────────────────── */}
        <div className="flex-1 p-3 lg:p-5 overflow-x-hidden pb-20 lg:pb-5">
          {children}
        </div>

        {/* ── Mobile bottom nav — VERDE BOSQUE NEON ─────────────────────── */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around"
          style={{
            background: 'linear-gradient(180deg,rgba(0,18,10,0.97) 0%,rgba(0,25,14,0.99) 100%)',
            backdropFilter: 'blur(28px)',
            borderTop: `1px solid rgba(0,200,150,0.16)`,
            boxShadow: `0 -4px 30px rgba(0,180,120,0.12), 0 -1px 0 rgba(0,200,150,0.08)`,
            paddingBottom: 'env(safe-area-inset-bottom,0px)',
            height: 68,
          }}
        >
          {bottomTabs.map(tab => {
            const active = isActive(tab.href);
            return (
              <Link key={tab.href} href={tab.href}>
                <div className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative cursor-pointer group">
                  {/* Top glow bar on active */}
                  {active && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-full"
                      style={{ background: `linear-gradient(90deg,transparent,${FOREST},transparent)`, boxShadow: `0 0 12px ${FOREST}cc` }} />
                  )}
                  <div className="relative flex items-center justify-center transition-all duration-200"
                    style={{
                      width: 40, height: 40, borderRadius: 14,
                      background: active
                        ? `linear-gradient(135deg,${FOREST},#00FF88)`
                        : 'rgba(0,180,120,0.08)',
                      boxShadow: active ? `0 0 20px rgba(0,200,150,0.55), 0 4px 12px rgba(0,0,0,0.3)` : 'none',
                      transform: active ? 'scale(1.13)' : 'scale(1)',
                      border: active ? 'none' : `1px solid rgba(0,200,150,0.12)`,
                      color: active ? '#000' : `rgba(0,200,150,0.55)`,
                    }}>
                    <tab.Icon size={18} strokeWidth={active ? 2.5 : 2} />
                    {tab.badge && !active && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[9.5px] font-bold leading-none transition-colors"
                    style={{ color: active ? FOREST : 'rgba(0,200,150,0.38)', fontFamily: "'Space Grotesk',sans-serif" }}>
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Más button */}
          <button onClick={() => setMobileOpen(true)} className="flex flex-col items-center gap-0.5 px-3 py-1.5 cursor-pointer">
            <div className="flex items-center justify-center"
              style={{
                width: 40, height: 40, borderRadius: 14,
                background: 'rgba(0,180,120,0.08)',
                border: `1px solid rgba(0,200,150,0.12)`,
                color: 'rgba(0,200,150,0.45)',
              }}>
              <Menu size={18} strokeWidth={2} />
            </div>
            <span className="text-[9.5px] font-bold leading-none" style={{ color: 'rgba(0,200,150,0.35)', fontFamily: "'Space Grotesk',sans-serif" }}>Más</span>
          </button>
        </nav>
      </main>
      <AiAssistant />
    </div>
  );
}
