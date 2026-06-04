import { createElement, createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

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
  role: 'admin' | 'vet' | 'field' | 'viewer' | 'developer' | 'superadmin' | 'sales';
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
}

export const PLAN_PRECIOS: Record<PlanId, number> = {
  basico:  0,
  pro:     89000,
  premium: 189000,
  platino: 399000,
};

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
export const CIVAC_STAFF_IDS: string[] = ['superadmin', 'developer', 'admin', 'ventas'];

export const DEFAULT_ACCOUNTS: Account[] = [
  /* ── CIVAC STAFF — propietarios y equipo ── */
  {
    id: 'superadmin',
    nombre: 'Javier Hernando Sánchez Bernal',
    cargo: 'CEO · Fundador & Propietario CIVAC',
    finca: 'CIVAC HQ · Bogotá, Colombia',
    email: 'Softganventas@gmail.com',
    password: 'civac2026',
    avatar: '🔱',
    phone: '3187351262',
    gradient: 'from-[#1a0500] to-[#3d0f00]',
    role: 'superadmin',
    activo: true,
    plan: 'platino',
    planExpiry: '2099-12-31',
    etiquetas: ['Propietario','CEO','Fundador CIVAC'],
    permisos: ['*'],
  },
  {
    id: 'admin',
    nombre: 'Lizet Daza',
    cargo: 'Co-Fundadora · Directora Ejecutiva CIVAC',
    finca: 'CIVAC HQ · Bogotá, Colombia',
    email: 'lizet.daza@civac.co',
    password: 'lizet2026',
    avatar: '👑',
    gradient: 'from-[#2d1b00] to-[#4a2e00]',
    role: 'admin',
    activo: true,
    plan: 'platino',
    planExpiry: '2099-12-31',
    etiquetas: ['Co-Fundadora','Directora Ejecutiva'],
    permisos: ['*'],
  },
  {
    id: 'developer',
    nombre: 'Johnatan Vallejo Marulanda',
    cargo: 'Arquitecto Principal · Desarrollador PWA & IA',
    finca: 'CIVAC Labs · Colombia',
    email: 'johnatanvallejomarulanda@gmail.com',
    password: 'dev2026',
    avatar: '🛠️',
    gradient: 'from-[#001a14] to-[#003d2e]',
    role: 'developer',
    activo: true,
    plan: 'platino',
    planExpiry: '2099-12-31',
    etiquetas: ['Desarrollador','Arquitecto CIVAC'],
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

  /* ── CUENTAS CLIENTE — representantes reales por nivel de plan ── */
  {
    id: 'demo_basico',
    nombre: 'Agropecuaria El Palmar',
    cargo: 'Propietario — Finca Pequeña',
    finca: 'Finca El Palmar · Boyacá',
    email: 'demo_basico@ganaderia.co',
    password: 'demo2026',
    avatar: '🥈',
    gradient: 'from-[#1a2a3a] to-[#243040]',
    role: 'admin',
    activo: true,
    plan: 'basico',
    planActivadoEn: '2026-01-15',
    permisos: ['inventario','produccion','potreros','alertas','documentacion','manual','pesaje','pesaje-manual','sanidad'],
  },
  {
    id: 'demo_pro',
    nombre: 'Ganadería Los Llanos S.A.S.',
    cargo: 'Gerente de Producción',
    finca: 'Hacienda Los Llanos · Meta',
    email: 'demo_pro@ganaderia.co',
    password: 'demo2026',
    avatar: '⚡',
    gradient: 'from-[#001a1a] to-[#003030]',
    role: 'admin',
    activo: true,
    plan: 'pro',
    planExpiry: '2027-06-30',
    planActivadoEn: '2026-03-01',
    wompiRef: 'CIVAC-PRO-2026-001',
    permisos: ['inventario','produccion','reproduccion','genetica','potreros','alimentacion','insumos','semen','costos','personal','prediccion','alertas','pesaje','gps','gps-chips','pesaje-manual','ficha','lotes','datos','documentacion','manual','sanidad','trazabilidad','asesora','ventas'],
  },
  {
    id: 'demo_premium',
    nombre: 'Inversiones Bovinas del Cesar',
    cargo: 'Director Agropecuario',
    finca: 'Hacienda Sierra Nevada · Cesar',
    email: 'demo_premium@ganaderia.co',
    password: 'demo2026',
    avatar: '🥇',
    gradient: 'from-[#2a1a00] to-[#3d2800]',
    role: 'admin',
    activo: true,
    plan: 'premium',
    planExpiry: '2027-06-30',
    planActivadoEn: '2026-02-10',
    wompiRef: 'CIVAC-PREM-2026-003',
    permisos: ['inventario','produccion','reproduccion','genetica','potreros','alimentacion','insumos','semen','costos','personal','prediccion','co2','alertas','multifinca','pesaje','gps','gps-chips','pesaje-manual','ficha','lotes','datos','usuarios','configuracion','documentacion','manual','sanidad','trazabilidad','asesora','ventas','drive'],
  },
  {
    id: 'demo_platino',
    nombre: 'Grupo Ganadero Córdoba Corp.',
    cargo: 'CEO · Presidente',
    finca: 'Corporativo · Montería, Córdoba',
    email: 'demo_platino@ganaderia.co',
    password: 'demo2026',
    avatar: '🔶',
    gradient: 'from-[#1a0a00] to-[#2d1500]',
    role: 'admin',
    activo: true,
    plan: 'platino',
    planExpiry: '2027-12-31',
    planActivadoEn: '2025-12-01',
    wompiRef: 'CIVAC-PLAT-2025-001',
    permisos: ['inventario','produccion','reproduccion','genetica','potreros','alimentacion','insumos','semen','costos','personal','prediccion','co2','alertas','multifinca','usuarios','configuracion','documentacion','manual','pesaje','gps','gps-chips','pesaje-manual','ficha','lotes','datos','planes','admin_pagos','sanidad','trazabilidad','asesora','ventas','drive'],
  },
];

/* ─── Versión de cuentas (fuerza refresh cuando cambian los planes) ────────── */
const ACCOUNTS_VERSION = '7.2.0';

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
      /* Clear cached user so they re-login with fresh plan */
      localStorage.removeItem('ganader_user');
      return merged;
    }
    const stored = localStorage.getItem('ganader_accounts');
    if (stored) {
      const parsed: Account[] = JSON.parse(stored);
      if (parsed.length > 0) return parsed;
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
  loginAs: (account: Account) => void;
  logout: () => void;
  registerUser: (data: Omit<Account, 'id'>) => Account;
  updateUser: (id: string, data: Partial<Account>) => void;
  deleteUser: (id: string) => void;
  activatePlan: (userId: string, plan: PlanId, payment: Omit<WompiPayment,'id'|'fecha'|'hora'>) => void;
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
    if (account) { loginAs(account); return true; }
    return false;
  };

  const loginAs = (account: Account) => {
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
    setUser(null);
    try { localStorage.removeItem('ganader_user'); } catch {}
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

  const deleteUser = (id: string) => {
    if (id === 'admin') return;
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
    });
  };

  return createElement(AuthContext.Provider, {
    value: {
      user, accounts, wompiPayments, invoices, loginActivity,
      login, loginAs, logout,
      registerUser, updateUser, deleteUser,
      activatePlan, addWompiPayment, addInvoice, updateInvoice,
    }
  }, children);
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const ACCOUNTS = DEFAULT_ACCOUNTS;
