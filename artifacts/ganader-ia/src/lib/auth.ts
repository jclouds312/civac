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
  {
    id: 'admin',
    nombre: 'Lizeth Daza',
    cargo: 'Co-Fundadora · Dirección Ejecutiva CIVAC',
    finca: 'CIVAC HQ · Bogotá, Colombia',
    email: 'Softganventas@gmail.com',
    password: 'lizeth2026',
    avatar: '👑',
    gradient: 'from-[#2d1b00] to-[#4a2e00]',
    role: 'admin',
    activo: true,
    plan: 'platino',
    planExpiry: '2099-12-31',
    permisos: ['*'],
  },
  {
    id: 'vet',
    nombre: 'Dr. Carlos Ramírez',
    cargo: 'Médico Veterinario',
    finca: 'Finca El Rancho Verde',
    email: 'vet@ganader.ia',
    password: 'vet2026',
    avatar: '🩺',
    gradient: 'from-[#0d2137] to-[#1565c0]',
    role: 'vet',
    activo: true,
    plan: 'premium',
    planExpiry: '2026-12-31',
    permisos: ['inventario','produccion','reproduccion','genetica','potreros','alimentacion','insumos','semen','prediccion','alertas','documentacion','pesaje','gps','co2','lotes','datos','pesaje-manual'],
  },
  {
    id: 'campo',
    nombre: 'Luis Patiño',
    cargo: 'Vaquero / Jefe de Campo',
    finca: 'Finca El Rancho Verde',
    email: 'luis@ganader.ia',
    password: 'campo2026',
    avatar: '🐄',
    gradient: 'from-[#e65100] to-[#f57c00]',
    role: 'field',
    activo: true,
    plan: 'pro',
    planExpiry: '2026-12-31',
    permisos: ['inventario','produccion','potreros','alertas','alimentacion','insumos','gps','gps-chips','pesaje','pesaje-manual','lotes','sanidad','trazabilidad'],
  },
  {
    id: 'visor',
    nombre: 'Propietario / Inversor',
    cargo: 'Solo Lectura',
    finca: 'Finca El Rancho Verde',
    email: 'visor@ganader.ia',
    password: 'visor',
    avatar: '💼',
    gradient: 'from-[#4a148c] to-[#6a1b9a]',
    role: 'viewer',
    activo: true,
    plan: 'pro',
    planExpiry: '2026-12-31',
    permisos: ['inventario','produccion','reproduccion','genetica','ficha','potreros','alimentacion','insumos','semen','costos','personal','multifinca','prediccion','alertas','gps'],
  },
  {
    id: 'developer',
    nombre: 'Johnatan Vallejo',
    cargo: 'Arquitecto Principal · Soporte PWA & Dev',
    finca: 'CIVAC Labs · Colombia',
    email: 'johnatanvallejomarulanda@gmail.com',
    password: 'dev2026',
    avatar: '🛠️',
    gradient: 'from-[#001a14] to-[#003d2e]',
    role: 'developer',
    activo: true,
    plan: 'platino',
    planExpiry: '2099-12-31',
    permisos: ['*'],
  },
  {
    id: 'superadmin',
    nombre: 'Javier · Dueño CIVAC',
    cargo: 'Co-Fundador · CEO CIVAC Platform',
    finca: 'CIVAC HQ · Bogotá, Colombia',
    email: 'super@civac.co',
    password: 'super2026',
    avatar: '🔱',
    gradient: 'from-[#1a0500] to-[#3d0f00]',
    role: 'superadmin',
    activo: true,
    plan: 'platino',
    planExpiry: '2099-12-31',
    permisos: ['*'],
  },
  {
    id: 'ventas',
    nombre: 'María Salazar — Asesora CIVAC',
    cargo: 'Asesora Comercial Senior',
    finca: 'CIVAC Sales Colombia · Bogotá',
    email: 'ventas@civac.co',
    password: 'ventas2026',
    avatar: '💼',
    gradient: 'from-[#1a0540] to-[#2d0a60]',
    role: 'sales',
    activo: true,
    plan: 'pro',
    planExpiry: '2027-12-31',
    permisos: ['ventas','planes','usuarios','dashboard','alertas','documentacion','manual'],
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
const ACCOUNTS_VERSION = '7.1.0';

/* ─── Persistencia de pagos Wompi ─────────────────────────────────────────── */
function loadPayments(): WompiPayment[] {
  try {
    const s = localStorage.getItem('ganader_wompi_payments');
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}
function savePayments(payments: WompiPayment[]) {
  try { localStorage.setItem('ganader_wompi_payments', JSON.stringify(payments)); } catch {}
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

/* ─── Contexto Auth ───────────────────────────────────────────────────────── */
interface AuthContextType {
  user: Account | null;
  accounts: Account[];
  wompiPayments: WompiPayment[];
  login: (email: string, password: string) => boolean;
  loginAs: (account: Account) => void;
  logout: () => void;
  registerUser: (data: Omit<Account, 'id'>) => Account;
  updateUser: (id: string, data: Partial<Account>) => void;
  deleteUser: (id: string) => void;
  activatePlan: (userId: string, plan: PlanId, payment: Omit<WompiPayment,'id'|'fecha'|'hora'>) => void;
  addWompiPayment: (payment: Omit<WompiPayment,'id'|'fecha'|'hora'>) => WompiPayment;
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

  const setAccounts = useCallback((next: Account[]) => {
    setAccountsState(next);
    saveAccounts(next);
  }, []);

  const setWompiPayments = useCallback((next: WompiPayment[]) => {
    setWompiPaymentsState(next);
    savePayments(next);
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
    const full: WompiPayment = {
      ...payment,
      id: `WMP${Date.now()}`,
      fecha: now.toLocaleDateString('es-CO'),
      hora: now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    };
    setWompiPayments([full, ...wompiPayments]);
    return full;
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
      user, accounts, wompiPayments,
      login, loginAs, logout,
      registerUser, updateUser, deleteUser,
      activatePlan, addWompiPayment,
    }
  }, children);
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const ACCOUNTS = DEFAULT_ACCOUNTS;
