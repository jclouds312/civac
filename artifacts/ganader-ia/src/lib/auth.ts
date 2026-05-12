import React, { createContext, useContext, useState, useCallback } from "react";

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
  role: 'admin' | 'vet' | 'field' | 'viewer';
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
  basico:  '#94a3b8',
  pro:     '#00f5d4',
  premium: '#a78bfa',
  platino: '#fbbf24',
};

export const PLAN_ICON: Record<PlanId, string> = {
  basico:  '🌱',
  pro:     '⚡',
  premium: '⭐',
  platino: '👑',
};

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'admin',
    nombre: 'Administrador General',
    cargo: 'Propietario / Admin',
    finca: 'Finca El Rancho Verde',
    email: 'admin@ganader.ia',
    password: 'admin',
    avatar: '👑',
    gradient: 'from-[#0d2137] to-[#1a4a2e]',
    role: 'admin',
    activo: true,
    plan: 'platino',
    planExpiry: '2027-12-31',
    permisos: ['inventario','produccion','reproduccion','genetica','potreros','alimentacion','insumos','semen','costos','personal','prediccion','co2','alertas','multifinca','usuarios','configuracion','documentacion','pesaje','gps','planes','admin_pagos'],
  },
  {
    id: 'vet',
    nombre: 'Dr. Carlos Ramírez',
    cargo: 'Médico Veterinario',
    finca: 'Finca El Rancho Verde',
    email: 'vet@ganader.ia',
    password: 'vet2025',
    avatar: '🩺',
    gradient: 'from-[#0d2137] to-[#1565c0]',
    role: 'vet',
    activo: true,
    plan: 'pro',
    planExpiry: '2026-12-31',
    permisos: ['inventario','produccion','reproduccion','genetica','potreros','alimentacion','insumos','semen','prediccion','alertas','documentacion','pesaje','gps'],
  },
  {
    id: 'campo',
    nombre: 'Luis Patiño',
    cargo: 'Vaquero / Ordeñador',
    finca: 'Finca El Rancho Verde',
    email: 'luis@ganader.ia',
    password: 'campo2025',
    avatar: '🐄',
    gradient: 'from-[#e65100] to-[#f57c00]',
    role: 'field',
    activo: true,
    plan: 'basico',
    permisos: ['inventario','produccion','potreros','alimentacion','insumos','alertas','pesaje'],
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
    plan: 'basico',
    permisos: ['inventario','produccion','costos','prediccion','co2','alertas','gps'],
  },
];

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
    const stored = localStorage.getItem('ganader_accounts');
    if (stored) {
      const parsed: Account[] = JSON.parse(stored);
      if (parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_ACCOUNTS;
}
function saveAccounts(accounts: Account[]) {
  try { localStorage.setItem('ganader_accounts', JSON.stringify(accounts)); } catch {}
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
  };

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem('ganader_user'); } catch {}
  };

  const registerUser = (data: Omit<Account, 'id'>): Account => {
    const id = `user_${Date.now()}`;
    const newAccount: Account = { id, ...data, activo: true, plan: 'basico' };
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

  return React.createElement(AuthContext.Provider, {
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
