import React, { createContext, useContext, useState, useCallback } from "react";

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
}

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'admin',
    nombre: 'Administrador General',
    cargo: 'Propietario / Admin',
    finca: 'Finca El Rancho Verde',
    email: 'admin@ganader.ia',
    password: 'admin',
    avatar: '👑',
    gradient: 'from-[#1a5c2e] to-[#2d8a4e]',
    role: 'admin',
    activo: true,
    permisos: ['inventario','produccion','reproduccion','genetica','potreros','alimentacion','insumos','semen','costos','personal','prediccion','co2','alertas','multifinca','usuarios','configuracion','documentacion','pesaje','gps'],
  },
  {
    id: 'vet',
    nombre: 'Dr. Carlos Ramírez',
    cargo: 'Médico Veterinario',
    finca: 'Finca El Rancho Verde',
    email: 'vet@ganader.ia',
    password: 'vet2025',
    avatar: '🩺',
    gradient: 'from-[#0d47a1] to-[#1565c0]',
    role: 'vet',
    activo: true,
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
    permisos: ['inventario','produccion','costos','prediccion','co2','alertas','gps'],
  },
];

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

interface AuthContextType {
  user: Account | null;
  accounts: Account[];
  login: (email: string, password: string) => boolean;
  loginAs: (account: Account) => void;
  logout: () => void;
  registerUser: (data: Omit<Account, 'id'>) => Account;
  updateUser: (id: string, data: Partial<Account>) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Account | null>(() => {
    try {
      const stored = localStorage.getItem('ganader_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [accounts, setAccountsState] = useState<Account[]>(loadAccounts);

  const setAccounts = useCallback((next: Account[]) => {
    setAccountsState(next);
    saveAccounts(next);
  }, []);

  const login = (email: string, password: string): boolean => {
    const account = accounts.find(a => (a.email === email || a.id === email) && a.password === password && a.activo !== false);
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
    const newAccount: Account = { id, ...data, activo: true };
    const updated = [...accounts, newAccount];
    setAccounts(updated);
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
    const updated = accounts.filter(a => a.id !== id);
    setAccounts(updated);
  };

  return React.createElement(AuthContext.Provider, {
    value: { user, accounts, login, loginAs, logout, registerUser, updateUser, deleteUser }
  }, children);
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const ACCOUNTS = DEFAULT_ACCOUNTS;
