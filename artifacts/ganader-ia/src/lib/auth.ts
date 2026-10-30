import { createElement, createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { PLAN_RETAIL_MONTHLY } from "./plan-pricing";

export type PlanId = 'basico' | 'pro' | 'premium' | 'platino';

export interface WompiPayment {
  id: string;
  userId: string;
  userNombre: string;
  userEmail: string;
  plan: PlanId;
  monto: number;
  moneda: 'COP';
  metodo: 'tarjeta' | 'nequi' | 'pse' | 'bancolombia';
  referencia: string;
  estado: 'aprobado' | 'rechazado' | 'pendiente';
  fecha: string;
  hora: string;
  telefono?: string;
  nit?: string;
  tipo?: 'nuevo' | 'renovacion';
  invoiceId?: string;
}

export interface CivacInvoice {
  id: string;
  paymentId: string;
  userId: string;
  userNombre: string;
  userEmail: string;
  userNit?: string;
  userTelefono?: string;
  userDireccion?: string;
  plan: PlanId;
  concepto: string;
  precio: number;
  iva: number;
  total: number;
  metodo: string;
  referencia: string;
  fecha: string;
  hora: string;
  estado: 'pagada' | 'pendiente' | 'anulada';
  tipo: 'nuevo' | 'renovacion';
  periodoDesde: string;
  periodoHasta: string;
  comprobante?: string;
}

export interface Account {
  id: string;
  nombre: string;
  cargo: string;
  finca: string;
  email: string;
  password: string;
  avatar: string;
  gradient: string;
  role: 'admin' | 'vet' | 'field' | 'viewer' | 'developer' | 'superadmin' | 'sales' | 'cliente';
  permisos: string[];
  activo?: boolean;
  /* ── Contacto ── */
  phone?: string;
  foto?: string;             // base64 o URL de foto de perfil personalizada
  etiquetas?: string[];      // etiquetas editables por admin
  /* ── Plan Wompi ── */
  plan?: PlanId;
  planExpiry?: string;       // ISO date string
  wompiRef?: string;         // última referencia de pago
  planActivadoEn?: string;   // ISO date
  /* ── Template / Backup ── */
  isTemplate?: boolean;      // cuenta plantilla — nunca se puede eliminar
  isDemo?: boolean;          // cuenta demo de plan — acceso a módulos de granja
  /* ── Sesiones y Acceso ── */
  sessionLimit?: number;     // 0 = ilimitado, >0 = máx sesiones concurrentes por admin
  totalConexiones?: number;  // contador total de logins acumulados
  ultimaConexion?: string;   // ISO timestamp del último login
  loginMethod?: 'email' | 'google' | 'outlook' | 'card';
  googleEmail?: string;      // email Google vinculado para OAuth
  outlookEmail?: string;     // email Outlook/Microsoft vinculado
  googleAvatar?: string;     // avatar obtenido desde Google OAuth
  /* ── Licencias y Activación ── */
  codigoActivacion?: string; // último código de activación canjeado
  licenseKey?: string;       // ID de la última licencia descargada
  licenseExpiry?: string;    // ISO date vencimiento de la licencia
  fechaCreacion?: string;    // ISO date creación de la cuenta
  /* ── Límites por plan ── */
  maxAnimales?: number;      // máximo de animales permitidos (override del plan)
  maxUsuarios?: number;      // máximo de sub-usuarios (override del plan)
  diasPlan?: number;         // días totales del plan asignado por admin
  notas?: string;            // notas internas del administrador
}

export const PLAN_PRECIOS: Record<PlanId, number> = PLAN_RETAIL_MONTHLY;

export const PLAN_LABEL: Record<PlanId, string> = {
  basico:  'Básico',
  pro:     'PRO',
  premium: 'Premium',
  platino: 'Platino',
};

export const PLAN_COLOR: Record<PlanId, string> = {
  basico:  '#b8c4d4',
  pro:     '#00f5d4',
  premium: '#fbbf24',
  platino: '#cd7f32',
};

export const PLAN_COLOR2: Record<PlanId, string> = {
  basico:  '#94a3b8',
  pro:     '#00c8ff',
  premium: '#f59e0b',
  platino: '#e07b54',
};

export const PLAN_GLOW: Record<PlanId, string> = {
  basico:  '184,196,212',
  pro:     '0,245,212',
  premium: '251,191,36',
  platino: '205,127,50',
};

export const PLAN_GRADIENT: Record<PlanId, [string, string]> = {
  basico:  ['#b8c4d4', '#94a3b8'],
  pro:     ['#00f5d4', '#00c8ff'],
  premium: ['#fbbf24', '#f59e0b'],
  platino: ['#cd7f32', '#e07b54'],
};

export const PLAN_LABEL_METAL: Record<PlanId, string> = {
  basico:  'Cromo',
  pro:     'Teal Neón',
  premium: 'Oro',
  platino: 'Cobre',
};

export const PLAN_ICON: Record<PlanId, string> = {
  basico:  '🥈',
  pro:     '⚡',
  premium: '🥇',
  platino: '🔶',
};

/* ─── CIVAC Staff IDs — these have access to the Server Panel ─────────────── */
export const CIVAC_STAFF_IDS: string[] = ['superadmin', 'developer', 'admin', 'sales'];

/* ─── Plan tier labels (Enterprise / Professional / Basic / Developer) ─────── */
export const PLAN_LABEL_TIER: Record<string, string> = {
  platino:    'Enterprise',
  premium:    'Professional',
  pro:        'PRO',
  basico:     'Basic',
};

export const PLAN_LABEL_ROLE: Record<string, string> = {
  superadmin: 'Enterprise',
  admin:      'Enterprise',
  developer:  'Developer',
  sales:      'Sales',
  vet:        'Professional',
  field:      'Professional',
  viewer:     'Basic',
};

export const PLAN_COLOR_TIER: Record<string, string> = {
  Enterprise:   '#FFD700',
  Professional: '#00f5d4',
  Developer:    '#39ff7e',
  Sales:        '#e879f9',
  Basic:        '#94a3b8',
  PRO:          '#00c8ff',
};

export const DEFAULT_ACCOUNTS: Account[] = [
  /* ── CIVAC STAFF — acceso Server Panel + badge ⬡ CIVAC ── */
  {
    id: 'superadmin',
    nombre: 'Super Administrador',
    cargo: 'Super Administrador · Acceso Total Plataforma',
    finca: 'CIVAC HQ · Bogotá, Colombia',
    email: 'super@civac.co',
    password: 'super2026',
    avatar: '🔱',
    gradient: 'from-[#1a0500] to-[#3d0f00]',
    role: 'superadmin',
    activo: true,
    plan: 'platino',
    planExpiry: '2099-12-31',
    etiquetas: ['Super Admin','Acceso Total','Enterprise'],
    permisos: ['*'],
  },
  {
    id: 'admin',
    nombre: 'Administrador General',
    cargo: 'Administrador General · Panel Admin Completo',
    finca: 'CIVAC HQ · Bogotá, Colombia',
    email: 'admin@civac.co',
    password: 'admin',
    avatar: '👑',
    gradient: 'from-[#2d1b00] to-[#4a2e00]',
    role: 'admin',
    activo: true,
    plan: 'platino',
    planExpiry: '2099-12-31',
    etiquetas: ['Admin General','Panel Admin','Enterprise'],
    permisos: ['*'],
  },
  {
    id: 'developer',
    nombre: 'Dev · Arquitecto CIVAC',
    cargo: 'Arquitecto Principal · Desarrollador PWA & IA',
    finca: 'CIVAC Labs · Colombia',
    email: 'dev@civac.co',
    password: 'dev2026',
    avatar: '🛠️',
    gradient: 'from-[#001a14] to-[#003d2e]',
    role: 'developer',
    activo: true,
    plan: 'platino',
    planExpiry: '2099-12-31',
    etiquetas: ['Developer','Arquitecto CIVAC','Developer Plan'],
    permisos: ['*'],
  },
  {
    id: 'ventas',
    nombre: 'Asesora CIVAC · Ventas',
    cargo: 'Asesora Comercial Senior',
    finca: 'CIVAC Sales Colombia · Bogotá',
    email: 'ventas@civac.co',
    password: 'ventas2026',
    avatar: '💼',
    gradient: 'from-[#1a0540] to-[#2d0a60]',
    role: 'sales',
    activo: true,
    plan: 'platino',
    planExpiry: '2099-12-31',
    etiquetas: ['Asesora','Ventas CIVAC'],
    permisos: ['ventas','planes','usuarios','dashboard','alertas','documentacion','manual','chat'],
  },

  /* ── CUENTAS CLIENTE — acceso módulos de finca por plan ── */
  {
    id: 'vet_civac',
    nombre: 'Dr. Carlos Ramírez',
    cargo: 'Médico Veterinario · Módulos Clínicos',
    finca: 'Finca Demostrativa CIVAC · Colombia',
    email: 'vet@civac.co',
    password: 'vet2026',
    avatar: '🩺',
    gradient: 'from-[#001a10] to-[#003020]',
    role: 'vet',
    activo: true,
    plan: 'premium',
    planExpiry: '2099-12-31',
    etiquetas: ['Veterinario','Módulos Clínicos','Professional'],
    permisos: [
      'alertas','inventario','produccion','potreros',
      'reproduccion','genetica','pesaje','ficha','alimentacion',
      'gps','gps-chips','insumos','semen','costos','personal',
      'multifinca','prediccion','asesora','sanidad','trazabilidad',
      'pesaje-manual','co2','lotes','datos','drive','documentacion','manual',
    ],
  },
  {
    id: 'field_civac',
    nombre: 'Luis Patiño',
    cargo: 'Jefe de Campo · Pesaje, GPS, Potreros',
    finca: 'Finca Demostrativa CIVAC · Colombia',
    email: 'luis@civac.co',
    password: 'campo2026',
    avatar: '🌾',
    gradient: 'from-[#0a1a00] to-[#182d00]',
    role: 'field',
    activo: true,
    plan: 'premium',
    planExpiry: '2099-12-31',
    etiquetas: ['Campo','GPS · Pesaje · Potreros','Professional'],
    permisos: [
      'alertas','inventario','produccion','potreros',
      'pesaje','pesaje-manual','gps','gps-chips',
      'alimentacion','insumos','lotes','costos','asesora',
      'documentacion','manual',
    ],
  },
  {
    id: 'viewer_civac',
    nombre: 'Propietario / Inversor',
    cargo: 'Propietario · Solo Lectura / Dashboards',
    finca: 'Finca Demostrativa CIVAC · Colombia',
    email: 'visor@civac.co',
    password: 'visor',
    avatar: '📊',
    gradient: 'from-[#1a2a3a] to-[#243040]',
    role: 'viewer',
    activo: true,
    plan: 'basico',
    planExpiry: '2099-12-31',
    etiquetas: ['Visor','Solo Lectura','Basic'],
    permisos: [
      'alertas','inventario','produccion','potreros',
      'costos','prediccion','co2','multifinca','documentacion','manual',
    ],
  },

  /* ── CUENTAS CLIENTE DEMO — ganaderos reales usando el sistema por plan ── */
  {
    id: 'demo_basico',
    nombre: 'Agropecuaria El Palmar',
    cargo: 'Propietario · Finca Pequeña · Plan Básico',
    finca: 'Finca El Palmar · Boyacá, Colombia',
    email: 'demo_basico@ganaderia.co',
    password: 'demo2026',
    avatar: '🥈',
    gradient: 'from-[#1a2a3a] to-[#243040]',
    role: 'field',
    activo: true,
    isTemplate: true,
    isDemo: true,
    plan: 'basico',
    planActivadoEn: '2026-01-15',
    etiquetas: ['Demo', 'Plan Básico', 'Gratis'],
    /* Módulos Plan Básico: Dashboard, Alertas, Inventario, Producción, Potreros */
    permisos: ['alertas','inventario','produccion','potreros'],
  },
  {
    id: 'demo_pro',
    nombre: 'Ganadería Los Llanos S.A.S.',
    cargo: 'Propietario · Ganadero PRO · Plan Profesional',
    finca: 'Hacienda Los Llanos · Villavicencio, Meta',
    email: 'demo_pro@ganaderia.co',
    password: 'demo2026',
    avatar: '⚡',
    gradient: 'from-[#001a1a] to-[#003030]',
    role: 'field',
    activo: true,
    isTemplate: true,
    isDemo: true,
    plan: 'pro',
    planExpiry: '2027-06-30',
    planActivadoEn: '2026-03-01',
    wompiRef: 'CIVAC-PRO-2026-001',
    etiquetas: ['Demo', 'Plan PRO', 'GPS · Básculas · IA'],
    /* Módulos Plan PRO: todo Básico + GPS, Reproducción, Genética, Pesaje BT, Ficha, Alimentación,
       Insumos, Semen, Costos, Personal, Multi-Finca, Predicción IA, Asesora, Sanidad, Trazabilidad */
    permisos: [
      'alertas','inventario','produccion','potreros',
      'reproduccion','genetica','pesaje','ficha','alimentacion',
      'gps','gps-chips','insumos','semen','costos','personal',
      'multifinca','prediccion','ventas','asesora','sanidad','trazabilidad',
    ],
  },
  {
    id: 'demo_premium',
    nombre: 'Inversiones Bovinas del Cesar',
    cargo: 'Director Agropecuario · Plan Premium',
    finca: 'Hacienda Sierra Nevada · Valledupar, Cesar',
    email: 'demo_premium@ganaderia.co',
    password: 'demo2026',
    avatar: '🥇',
    gradient: 'from-[#2a1a00] to-[#3d2800]',
    role: 'vet',
    activo: true,
    isTemplate: true,
    isDemo: true,
    plan: 'premium',
    planExpiry: '2027-06-30',
    planActivadoEn: '2026-02-10',
    wompiRef: 'CIVAC-PREM-2026-003',
    etiquetas: ['Demo', 'Plan Premium', 'Multi-Finca · IA · Drive · CO₂'],
    /* Módulos Plan Premium: todo PRO + Pesaje Automatizado, Huella CO₂, Lotes, Centro Datos, Drive */
    permisos: [
      'alertas','inventario','produccion','potreros',
      'reproduccion','genetica','pesaje','ficha','alimentacion',
      'gps','gps-chips','insumos','semen','costos','personal',
      'multifinca','prediccion','ventas','asesora','sanidad','trazabilidad',
      'pesaje-manual','co2','lotes','datos','drive',
    ],
  },
  {
    id: 'civac_william',
    nombre: 'William',
    cargo: 'Cliente CIVAC · Plan Premium',
    finca: 'CIVAC',
    email: 'william',
    password: '',
    avatar: '👤',
    gradient: 'from-[#2a1a00] to-[#3d2800]',
    role: 'cliente',
    activo: true,
    isTemplate: true,
    isDemo: false,
    plan: 'premium',
    etiquetas: ['Cliente CIVAC', 'Premium permanente', 'No demo'],
    permisos: [
      'alertas','inventario','produccion','potreros',
      'reproduccion','genetica','pesaje','ficha','alimentacion',
      'gps','gps-chips','insumos','semen','costos','personal',
      'multifinca','prediccion','ventas','asesora','sanidad','trazabilidad',
      'pesaje-manual','co2','lotes','datos','drive',
    ],
  },
  {
    id: 'demo_platino',
    nombre: 'Grupo Ganadero Córdoba Corp.',
    cargo: 'CEO · Propietario · Plan Platino — Todo Incluido',
    finca: 'Corporativo Ganadero · Montería, Córdoba',
    email: 'demo_platino@ganaderia.co',
    password: 'demo2026',
    avatar: '🔶',
    gradient: 'from-[#1a0a00] to-[#2d1500]',
    role: 'vet',
    activo: true,
    isTemplate: true,
    isDemo: true,
    plan: 'platino',
    planExpiry: '2027-12-31',
    planActivadoEn: '2025-12-01',
    wompiRef: 'CIVAC-PLAT-2025-001',
    etiquetas: ['Demo', 'Plan Platino', 'Todo incluido · SLA 99.9% · Corporativo'],
    /* Módulos Plan Platino: TODO — Premium + Usuarios, Config., Documentación, Manual, Planes */
    permisos: [
      'alertas','inventario','produccion','potreros',
      'reproduccion','genetica','pesaje','ficha','alimentacion',
      'gps','gps-chips','insumos','semen','costos','personal',
      'multifinca','prediccion','ventas','asesora','sanidad','trazabilidad',
      'pesaje-manual','co2','lotes','datos','drive',
      'usuarios','configuracion','documentacion','manual','planes',
    ],
  },
];

/* ─── Versión de cuentas (fuerza refresh cuando cambian los planes) ────────── */
const ACCOUNTS_VERSION = '7.6.0';

/* ─── Template backup — persiste siempre las cuentas demo originales ─────── */
function saveTemplateBackup() {
  try {
    const templates = DEFAULT_ACCOUNTS.filter(a => a.isTemplate);
    localStorage.setItem('civac_account_templates', JSON.stringify(templates));
  } catch {}
}
export function loadTemplateBackup(): Account[] {
  try {
    const s = localStorage.getItem('civac_account_templates');
    return s ? JSON.parse(s) : DEFAULT_ACCOUNTS.filter(a => a.isTemplate);
  } catch { return DEFAULT_ACCOUNTS.filter(a => a.isTemplate); }
}

/* ─── Persistencia de pagos Wompi ─────────────────────────────────────────── */
function loadPayments(): WompiPayment[] {
  try {
    const s = localStorage.getItem('civac_wompi_payments');
    if (s) return JSON.parse(s);
    // migrate old key
    const old = localStorage.getItem('ganader_wompi_payments');
    return old ? JSON.parse(old) : [];
  } catch { return []; }
}
function savePayments(payments: WompiPayment[]) {
  try { localStorage.setItem('civac_wompi_payments', JSON.stringify(payments)); } catch {}
}

/* ─── Persistencia de facturas CIVAC ─────────────────────────────────────── */
function loadInvoices(): CivacInvoice[] {
  try { const s = localStorage.getItem('civac_invoices'); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveInvoices(inv: CivacInvoice[]) {
  try { localStorage.setItem('civac_invoices', JSON.stringify(inv)); } catch {}
}

function loadAccounts(): Account[] {
  /* Always persist template backup so it's available as restore point */
  saveTemplateBackup();
  try {
    const version = localStorage.getItem('ganader_accounts_version');
    if (version !== ACCOUNTS_VERSION) {
      /* Version changed — reset default accounts but keep user-created ones */
      const stored = localStorage.getItem('ganader_accounts');
      const defaultIds = new Set(DEFAULT_ACCOUNTS.map(a => a.id));
      let extra: Account[] = [];
      if (stored) {
        const parsed: Account[] = JSON.parse(stored);
        extra = parsed.filter(a => !defaultIds.has(a.id));
      }
      const merged = [...DEFAULT_ACCOUNTS, ...extra];
      localStorage.setItem('ganader_accounts', JSON.stringify(merged));
      localStorage.setItem('ganader_accounts_version', ACCOUNTS_VERSION);
      /* Clear cached user so they re-login with fresh plan/role */
      localStorage.removeItem('ganader_user');
      return merged;
    }
    const stored = localStorage.getItem('ganader_accounts');
    if (stored) {
      const parsed: Account[] = JSON.parse(stored);
      if (parsed.length > 0) {
        /* Ensure template accounts are always up-to-date from DEFAULT_ACCOUNTS */
          const defaultMap = new Map(DEFAULT_ACCOUNTS.map(a => [a.id, a]));
        const withRefreshedTemplates = parsed.map(a =>
          (a.isTemplate && defaultMap.has(a.id)) ? defaultMap.get(a.id)! : a
        );
          const storedIds = new Set(withRefreshedTemplates.map(a => a.id));
          const newTemplates = DEFAULT_ACCOUNTS.filter(a => a.isTemplate && !storedIds.has(a.id));
          return [...withRefreshedTemplates, ...newTemplates];
      }
    }
  } catch {}
  return DEFAULT_ACCOUNTS;
}
function saveAccounts(accounts: Account[]) {
  try {
    localStorage.setItem('ganader_accounts', JSON.stringify(accounts));
    localStorage.setItem('ganader_accounts_version', ACCOUNTS_VERSION);
  } catch {}
}

/* ─── LoginActivity — quién accede, cuándo, desde dónde ──────────────────── */
export interface LoginActivity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  plan: PlanId;
  timestamp: string;   // ISO
  hora: string;        // HH:MM
  fecha: string;       // DD/MM/YYYY
  ua: string;          // user-agent short
  isDemo: boolean;
  isCivac: boolean;
}

function loadActivities(): LoginActivity[] {
  try { const s = localStorage.getItem('civac_login_activity'); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveActivities(a: LoginActivity[]) {
  try { localStorage.setItem('civac_login_activity', JSON.stringify(a.slice(0, 200))); } catch {}
}

/* ─── Contexto Auth ───────────────────────────────────────────────────────── */
interface AuthContextType {
  user: Account | null;
  accounts: Account[];
  wompiPayments: WompiPayment[];
  invoices: CivacInvoice[];
  loginActivity: LoginActivity[];
  login: (email: string, password: string) => boolean;
  loginAs: (account: Account, serverToken?: string) => void;
  loginWithOAuth: (provider: 'google'|'outlook', email: string, name: string, avatarUrl?: string) => { ok: boolean; account: Account | null };
  logout: () => void;
  registerUser: (data: Omit<Account, 'id'> & { pendiente?: boolean }) => Account;
  updateUser: (id: string, data: Partial<Account>) => void;
  updateProfile: (updates: Partial<Account>) => void;
  deleteUser: (id: string) => void;
  activatePlan: (userId: string, plan: PlanId, payment: Omit<WompiPayment,'id'|'fecha'|'hora'>) => void;
  assignPlan: (userId: string, plan: PlanId, dias: number, opts?: { sessionLimit?: number; maxAnimales?: number; maxUsuarios?: number; motivo?: string }) => void;
  redeemCode: (codigo: string) => { ok: boolean; message: string; plan?: PlanId };
  addWompiPayment: (payment: Omit<WompiPayment,'id'|'fecha'|'hora'>) => WompiPayment;
  addInvoice: (inv: Omit<CivacInvoice,'id'>) => CivacInvoice;
  updateInvoice: (id: string, data: Partial<CivacInvoice>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(() => {
    try {
      const s = localStorage.getItem('ganader_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [accounts, setAccountsState] = useState<Account[]>(loadAccounts);
  const [wompiPayments, setWompiPaymentsState] = useState<WompiPayment[]>(loadPayments);
  const [invoices, setInvoicesState] = useState<CivacInvoice[]>(loadInvoices);
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>(loadActivities);

  useEffect(() => {
    if (user?.loginMethod !== 'card') return;
    const token = localStorage.getItem('civac_session_token') || localStorage.getItem('civac_server_token');
    if (!token) {
      setUser(null);
      localStorage.removeItem('ganader_user');
      return;
    }
    let active = true;
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async response => {
        if (!response.ok) throw new Error('Sesión vencida');
        return response.json() as Promise<{id:string;nombre:string;email:string;role:string;planCode:string;estado:string;planExpiry?:string|null}>;
      })
      .then(serverUser => {
        if (!active) return;
        if (serverUser.estado === 'bloqueado') throw new Error('Cuenta bloqueada');
        setUser(current => {
          if (!current) return current;
          const refreshed: Account = {
            ...current,
            id: serverUser.id,
            nombre: serverUser.nombre,
            email: serverUser.email,
            role: serverUser.role as Account['role'],
            plan: (serverUser.planCode ?? 'premium') as PlanId,
            planExpiry: serverUser.planExpiry ?? undefined,
          };
          localStorage.setItem('ganader_user', JSON.stringify(refreshed));
          return refreshed;
        });
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        localStorage.removeItem('ganader_user');
        localStorage.removeItem('civac_session_token');
        localStorage.removeItem('civac_server_token');
      });
    return () => { active = false; };
  // Validate card-based sessions once when the app boots.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAccounts = useCallback((next: Account[]) => {
    setAccountsState(next);
    saveAccounts(next);
  }, []);

  const setWompiPayments = useCallback((next: WompiPayment[]) => {
    setWompiPaymentsState(next);
    savePayments(next);
  }, []);

  const setInvoices = useCallback((next: CivacInvoice[]) => {
    setInvoicesState(next);
    saveInvoices(next);
  }, []);

  const login = (email: string, password: string): boolean => {
    const account = accounts.find(
      a => (a.email === email || a.id === email) && a.password === password && a.activo !== false
    );
    if (account) {
      const now = new Date().toISOString();
      const updates: Partial<Account> = {
        totalConexiones: (account.totalConexiones || 0) + 1,
        ultimaConexion: now,
        loginMethod: 'email',
      };
      updateUser(account.id, updates);
      loginAs({ ...account, ...updates });
      return true;
    }
    return false;
  };

  const loginWithOAuth = (provider: 'google'|'outlook', email: string, name: string, avatarUrl?: string): { ok: boolean; account: Account | null } => {
    const found = accounts.find(a =>
      a.activo !== false && (
        a.email.toLowerCase() === email.toLowerCase() ||
        (provider === 'google' && a.googleEmail?.toLowerCase() === email.toLowerCase()) ||
        (provider === 'outlook' && a.outlookEmail?.toLowerCase() === email.toLowerCase())
      )
    );
    if (found) {
      const now = new Date().toISOString();
      const updates: Partial<Account> = {
        loginMethod: provider,
        totalConexiones: (found.totalConexiones || 0) + 1,
        ultimaConexion: now,
      };
      if (provider === 'google') {
        updates.googleEmail = email;
        if (avatarUrl) updates.googleAvatar = avatarUrl;
      }
      if (provider === 'outlook') updates.outlookEmail = email;
      updateUser(found.id, updates);
      loginAs({ ...found, ...updates });
      return { ok: true, account: found };
    }
    return { ok: false, account: null };
  };

  const loginAs = (account: Account, serverToken?: string) => {
    setUser(account);
    try { localStorage.setItem('ganader_user', JSON.stringify(account)); } catch {}
    // Record login activity
    try {
      const now = new Date();
      const activity: LoginActivity = {
        id: `act_${Date.now()}`,
        userId: account.id,
        userName: account.nombre,
        userEmail: account.email,
        userRole: account.role,
        plan: account.plan ?? 'basico',
        timestamp: now.toISOString(),
        hora: now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        fecha: now.toLocaleDateString('es-CO'),
        ua: (navigator.userAgent.match(/Chrome|Firefox|Safari|Edge/)??['Web'])[0],
        isDemo: account.id.startsWith('demo_'),
        isCivac: CIVAC_STAFF_IDS.includes(account.id),
      };
      setLoginActivity(prev => { const next=[activity,...prev].slice(0,200); saveActivities(next); return next; });
    } catch { /* ignore */ }
    if (serverToken) {
      try {
        localStorage.setItem('civac_session_token', serverToken);
        localStorage.setItem('civac_server_token', serverToken);
      } catch { /* session remains active in memory */ }
      return;
    }
    // Background: also get a real server session token for API access
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: account.email, password: account.password }),
    }).then(r => r.ok ? r.json() : null).then(data => {
      if (data?.token) {
        try { localStorage.setItem('civac_session_token', data.token); } catch {}
      }
    }).catch(() => { /* offline — token stays empty */ });
  };

  const logout = () => {
    const token = localStorage.getItem('civac_session_token') || localStorage.getItem('civac_server_token');
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setUser(null);
    try {
      localStorage.removeItem('ganader_user');
      localStorage.removeItem('civac_session_token');
      localStorage.removeItem('civac_server_token');
    } catch {}
  };

  const registerUser = (data: Omit<Account, 'id'>): Account => {
    const id = `user_${Date.now()}`;
    const newAccount: Account = { id, ...data, activo: true };
    setAccounts([...accounts, newAccount]);
    return newAccount;
  };

  const updateUser = (id: string, data: Partial<Account>) => {
    const updated = accounts.map(a => a.id === id ? { ...a, ...data } : a);
    setAccounts(updated);
    if (user?.id === id) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      try { localStorage.setItem('ganader_user', JSON.stringify(updatedUser)); } catch {}
    }
  };

  const updateProfile = (updates: Partial<Account>) => {
    if (!user) return;
    updateUser(user.id, updates);
  };

  const deleteUser = (id: string) => {
    const target = accounts.find(a => a.id === id);
    if (!target) return;
    if (target.isTemplate) return; // plantillas protegidas — nunca se eliminan
    if (CIVAC_STAFF_IDS.includes(id)) return; // staff CIVAC no se puede eliminar
    setAccounts(accounts.filter(a => a.id !== id));
  };

  const addWompiPayment = (payment: Omit<WompiPayment,'id'|'fecha'|'hora'>): WompiPayment => {
    const now = new Date();
    // Detect if renewal (user already had this plan before)
    const prevPayments = wompiPayments.filter(p => p.userId === payment.userId && p.plan === payment.plan && p.estado === 'aprobado');
    const tipo: 'nuevo' | 'renovacion' = prevPayments.length > 0 ? 'renovacion' : 'nuevo';
    const full: WompiPayment = {
      ...payment,
      id: `WMP${Date.now()}`,
      tipo,
      fecha: now.toLocaleDateString('es-CO'),
      hora: now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    };
    setWompiPayments([full, ...wompiPayments]);
    return full;
  };

  const addInvoice = (inv: Omit<CivacInvoice,'id'>): CivacInvoice => {
    const all = loadInvoices();
    const seq = String(all.length + 1).padStart(4, '0');
    const year = new Date().getFullYear();
    const id = `INV-${year}-${seq}`;
    const full: CivacInvoice = { ...inv, id };
    setInvoices([full, ...all]);
    return full;
  };

  const updateInvoice = (id: string, data: Partial<CivacInvoice>) => {
    const next = invoices.map(inv => inv.id === id ? { ...inv, ...data } : inv);
    setInvoices(next);
  };

  const activatePlan = (
    userId: string,
    plan: PlanId,
    payment: Omit<WompiPayment,'id'|'fecha'|'hora'>
  ) => {
    const pmt = addWompiPayment(payment);
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    updateUser(userId, {
      plan,
      planExpiry: expiry.toISOString().slice(0,10),
      wompiRef: pmt.id,
      planActivadoEn: new Date().toISOString().slice(0,10),
      diasPlan: 30,
    });
  };

  const assignPlan = (
    userId: string,
    plan: PlanId,
    dias: number,
    opts: { sessionLimit?: number; maxAnimales?: number; maxUsuarios?: number; motivo?: string } = {}
  ) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + dias);
    const updates: Partial<Account> = {
      plan,
      planExpiry: expiry.toISOString().slice(0,10),
      planActivadoEn: new Date().toISOString().slice(0,10),
      diasPlan: dias,
    };
    if (opts.sessionLimit !== undefined) updates.sessionLimit = opts.sessionLimit;
    if (opts.maxAnimales !== undefined) updates.maxAnimales = opts.maxAnimales;
    if (opts.maxUsuarios !== undefined) updates.maxUsuarios = opts.maxUsuarios;
    updateUser(userId, updates);
  };

  const redeemCode = (codigo: string): { ok: boolean; message: string; plan?: PlanId } => {
    try {
      const stored = localStorage.getItem('civac_activation_codes');
      const codes: Array<{
        codigo: string; planCode: PlanId; diasPlan: number;
        sessionLimit?: number; maxAnimales?: number; estado: string; usadoAt?: string;
      }> = stored ? JSON.parse(stored) : [];
      const found = codes.find(c => c.codigo.toUpperCase() === codigo.toUpperCase() && c.estado === 'disponible');
      if (!found) return { ok: false, message: 'Código inválido o ya utilizado' };
      const updated = codes.map(c =>
        c.codigo === found.codigo ? { ...c, estado: 'usado', usadoAt: new Date().toISOString() } : c
      );
      localStorage.setItem('civac_activation_codes', JSON.stringify(updated));
      if (user) {
        assignPlan(user.id, found.planCode, found.diasPlan, {
          sessionLimit: found.sessionLimit,
          maxAnimales: found.maxAnimales,
        });
        updateUser(user.id, { codigoActivacion: codigo });
      }
      return { ok: true, message: `Plan ${found.planCode.toUpperCase()} activado por ${found.diasPlan} días`, plan: found.planCode };
    } catch {
      return { ok: false, message: 'Error al procesar el código' };
    }
  };

  return createElement(AuthContext.Provider, {
    value: {
      user, accounts, wompiPayments, invoices, loginActivity,
      login, loginAs, loginWithOAuth, logout,
      registerUser, updateUser, updateProfile, deleteUser,
      activatePlan, assignPlan, redeemCode,
      addWompiPayment, addInvoice, updateInvoice,
    }
  }, children);
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const ACCOUNTS = DEFAULT_ACCOUNTS;
