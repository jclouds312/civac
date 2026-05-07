import React, { createContext, useContext, useState } from "react";

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
}

export const ACCOUNTS: Account[] = [
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
    permisos: ['inventario','produccion','reproduccion','genetica','potreros','alimentacion','insumos','semen','costos','personal','prediccion','co2','alertas','multifinca','usuarios','configuracion','documentacion'],
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
    permisos: ['inventario','produccion','reproduccion','genetica','potreros','alimentacion','insumos','semen','prediccion','alertas','documentacion'],
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
    permisos: ['inventario','produccion','potreros','alimentacion','insumos','alertas'],
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
    permisos: ['inventario','produccion','costos','prediccion','co2','alertas'],
  },
];

interface AuthContextType {
  user: Account | null;
  login: (email: string, password: string) => boolean;
  loginAs: (account: Account) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Account | null>(() => {
    try {
      const stored = localStorage.getItem('ganader_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = (email: string, password: string): boolean => {
    const account = ACCOUNTS.find(a => (a.email === email || a.id === email) && a.password === password);
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

  return React.createElement(AuthContext.Provider, { value: { user, login, loginAs, logout } }, children);
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
