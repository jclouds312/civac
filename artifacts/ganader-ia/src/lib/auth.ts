import React, { createContext, useContext, useState, useCallback } from "react";

export type PlanId = 'Basic' | 'Professional' | 'Enterprise' | 'Developer';

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
  /* ── Plan CIVAC 2026 ── */
  plan: PlanId;
  planExpiry?: string;       // ISO date string
  wompiRef?: string;         // última referencia de pago
  planActivadoEn?: string;   // ISO date
}

/* ═══════════════════════════════════════════════════════════════════════════
   DEFINICIÓN DE PLANES Y MÓDULOS PERMITIDOS
   ═══════════════════════════════════════════════════════════════════════════ */

export const PLAN_PRECIOS: Record<PlanId, number> = {
  Basic:        0,
  Professional: 89000,
  Enterprise:   189000,
  Developer:    0,  // Para desarrolladores (sin costo)
};

export const PLAN_LABEL: Record<PlanId, string> = {
  Basic:        'Básico',
  Professional: 'Professional',
  Enterprise:   'Enterprise',
  Developer:    'Developer',
};

export const PLAN_COLOR: Record<PlanId, string> = {
  Basic:        '#b8c4d4',
  Professional: '#00f5d4',
  Enterprise:   '#fbbf24',
  Developer:    '#a78bfa',
};

export const PLAN_COLOR2: Record<PlanId, string> = {
  Basic:        '#94a3b8',
  Professional: '#00c8ff',
  Enterprise:   '#f59e0b',
  Developer:    '#8b5cf6',
};

export const PLAN_GLOW: Record<PlanId, string> = {
  Basic:        '184,196,212',
  Professional: '0,245,212',
  Enterprise:   '251,191,36',
  Developer:    '167,139,250',
};

export const PLAN_GRADIENT: Record<PlanId, [string, string]> = {
  Basic:        ['#b8c4d4', '#94a3b8'],
  Professional: ['#00f5d4', '#00c8ff'],
  Enterprise:   ['#fbbf24', '#f59e0b'],
  Developer:    ['#a78bfa', '#8b5cf6'],
};

export const PLAN_ICON: Record<PlanId, string> = {
  Basic:        '📦',
  Professional: '⚡',
  Enterprise:   '🏆',
  Developer:    '👨‍💻',
};

/* ═══════════════════════════════════════════════════════════════════════════
   MÓDULOS DISPONIBLES POR PLAN (28 módulos total)
   ═══════════════════════════════════════════════════════════════════════════ */

export const PLAN_MODULES: Record<PlanId, string[]> = {
  Basic: [
    'inventario',           // 1. Inventario de animales (lectura)
    'produccion',           // 2. Registro de producción
    'pesaje',               // 3. Pesaje de animales
    'alertas',              // 4. Centro de alertas
    'potreros',             // 5. Gestión de potreros
    'gps',                  // 6. Rastreo GPS básico
  ],
  Professional: [
    'inventario',           // 1. Inventario completo
    'produccion',           // 2. Producción avanzada
    'reproduccion',         // 3. Gestión reproductiva
    'genetica',             // 4. Análisis genético
    'potreros',             // 5. Manejo de potreros
    'alimentacion',         // 6. Plan alimenticio
    'insumos',              // 7. Control de insumos
    'semen',                // 8. Banco de semen
    'costos',               // 9. Análisis de costos
    'pesaje',               // 10. Pesaje PRO
    'prediccion',           // 11. Predicciones ML
    'alertas',              // 12. Alertas avanzadas
    'gps',                  // 13. GPS en tiempo real
    'ficha',                // 14. Ficha técnica de animal
    'documentacion',        // 15. Documentación
  ],
  Enterprise: [
    'inventario',           // 1
    'produccion',           // 2
    'reproduccion',         // 3
    'genetica',             // 4
    'potreros',             // 5
    'alimentacion',         // 6
    'insumos',              // 7
    'semen',                // 8
    'costos',               // 9
    'pesaje',               // 10
    'prediccion',           // 11
    'alertas',              // 12
    'gps',                  // 13
    'ficha',                // 14
    'documentacion',        // 15
    'personal',             // 16. Gestión de personal
    'multifinca',           // 17. Múltiples fincas
    'api',                  // 18. API keys
    'reportes',             // 19. Reportes avanzados
    'usuarios',             // 20. Gestión de usuarios
    'integraciones',        // 21. Integraciones externas
    'configuracion',        // 22. Configuración avanzada
    'auditoria',            // 23. Log de auditoría
    'datos',                // 24. Exportar datos
    'lotes',                // 25. Manejo de lotes
    'mercado',              // 26. Análisis de mercado
    'sostenibilidad',       // 27. Indicadores de sostenibilidad
    'soporte-prioritario',  // 28. Soporte 24/7
  ],
  Developer: [
    '*',  // Acceso a todos los módulos
  ],
};

export const DEFAULT_ACCOUNTS: Account[] = [
  // Cuentas existentes del repositorio
  {
    id: 'admin',
    nombre: 'Administrador General',
    cargo: 'Propietario / Admin',
    finca: 'Finca El Rancho Verde',
    email: 'admin@civac.co',
    password: 'admin',
    avatar: '👑',
    gradient: 'from-[#0d2137] to-[#1a4a2e]',
    role: 'admin',
    activo: true,
    plan: 'Enterprise',
    planExpiry: '2027-12-31',
    permisos: ['*'],
  },
  {
    id: 'vet',
    nombre: 'Dr. Carlos Ramírez',
    cargo: 'Médico Veterinario',
    finca: 'Finca El Rancho Verde',
    email: 'vet@civac.co',
    password: 'vet2026',
    avatar: '🩺',
    gradient: 'from-[#0d2137] to-[#1565c0]',
    role: 'vet',
    activo: true,
    plan: 'Professional',
    planExpiry: '2026-12-31',
    permisos: PLAN_MODULES.Professional,
  },
  {
    id: 'campo',
    nombre: 'Luis Patiño',
    cargo: 'Vaquero / Ordeñador',
    finca: 'Finca El Rancho Verde',
    email: 'luis@civac.co',
    password: 'campo2026',
    avatar: '🐄',
    gradient: 'from-[#e65100] to-[#f57c00]',
    role: 'field',
    activo: true,
    plan: 'Professional',
    planExpiry: '2026-12-31',
    permisos: PLAN_MODULES.Professional,
  },
  {
    id: 'visor',
    nombre: 'Propietario / Inversor',
    cargo: 'Solo Lectura',
    finca: 'Finca El Rancho Verde',
    email: 'visor@civac.co',
    password: 'visor',
    avatar: '💼',
    gradient: 'from-[#4a148c] to-[#6a1b9a]',
    role: 'viewer',
    activo: true,
    plan: 'Basic',
    planExpiry: '2026-12-31',
    permisos: PLAN_MODULES.Basic,
  },
  {
    id: 'developer',
    nombre: 'Dev · Arquitecto CIVAC',
    cargo: 'Desarrollador Principal',
    finca: 'CIVAC Labs · Colombia',
    email: 'dev@civac.co',
    password: 'dev2026',
    avatar: '🛠️',
    gradient: 'from-[#0a0f1e] to-[#0d1a2e]',
    role: 'developer',
    activo: true,
    plan: 'Developer',
    planExpiry: '2099-12-31',
    permisos: ['*'],
  },
  {
    id: 'superadmin',
    nombre: 'Super Administrador',
    cargo: 'Super Admin · CIVAC Platform',
    finca: 'CIVAC HQ · Bogotá',
    email: 'super@civac.co',
    password: 'super2026',
    avatar: '🔱',
    gradient: 'from-[#1a0500] to-[#2d0e00]',
    role: 'superadmin',
    activo: true,
    plan: 'Enterprise',
    planExpiry: '2099-12-31',
    permisos: ['*'],
  },

  /* ═══════════════════════════════════════════════════════════════════════════
     CUENTAS DE PRUEBA ADICIONALES POR PLAN
     ═══════════════════════════════════════════════════════════════════════════ */

  // PLAN: BASIC (3 cuentas de prueba)
  {
    id: 'test-basic-1',
    nombre: 'Juan Acosta — Plan Basic',
    cargo: 'Ganadero Pequeño',
    finca: 'Finca Las Marías',
    email: 'juanacosta@test.civac.co',
    password: 'test123456',
    avatar: '👨‍🌾',
    gradient: 'from-[#b8c4d4] to-[#94a3b8]',
    role: 'field',
    activo: true,
    plan: 'Basic',
    planExpiry: '2026-12-31',
    permisos: PLAN_MODULES.Basic,
  },
  {
    id: 'test-basic-2',
    nombre: 'Patricia López — Plan Basic',
    cargo: 'Supervisora Finca',
    finca: 'Hacienda El Espino',
    email: 'patricialopez@test.civac.co',
    password: 'test123456',
    avatar: '👩‍💼',
    gradient: 'from-[#b8c4d4] to-[#94a3b8]',
    role: 'viewer',
    activo: true,
    plan: 'Basic',
    planExpiry: '2026-12-31',
    permisos: PLAN_MODULES.Basic,
  },
  {
    id: 'test-basic-3',
    nombre: 'Carlos Martínez — Plan Basic',
    cargo: 'Operador Pesaje',
    finca: 'Finca Santa Rosa',
    email: 'carlosmartinez@test.civac.co',
    password: 'test123456',
    avatar: '⚙️',
    gradient: 'from-[#b8c4d4] to-[#94a3b8]',
    role: 'field',
    activo: true,
    plan: 'Basic',
    planExpiry: '2026-12-31',
    permisos: PLAN_MODULES.Basic,
  },

  // PLAN: PROFESSIONAL (3 cuentas de prueba)
  {
    id: 'test-professional-1',
    nombre: 'Dra. Sandra González — Plan Professional',
    cargo: 'Médica Veterinaria',
    finca: 'Clínica Veterinaria San José',
    email: 'sandragónzalez@test.civac.co',
    password: 'test123456',
    avatar: '👩‍⚕️',
    gradient: 'from-[#00f5d4] to-[#00c8ff]',
    role: 'vet',
    activo: true,
    plan: 'Professional',
    planExpiry: '2026-12-31',
    permisos: PLAN_MODULES.Professional,
  },
  {
    id: 'test-professional-2',
    nombre: 'Roberto Fernández — Plan Professional',
    cargo: 'Gerente de Producción',
    finca: 'Granja Integral Boyacá',
    email: 'robertofernandez@test.civac.co',
    password: 'test123456',
    avatar: '👨‍💻',
    gradient: 'from-[#00f5d4] to-[#00c8ff]',
    role: 'admin',
    activo: true,
    plan: 'Professional',
    planExpiry: '2026-12-31',
    permisos: PLAN_MODULES.Professional,
  },
  {
    id: 'test-professional-3',
    nombre: 'Mónica Ruiz — Plan Professional',
    cargo: 'Especialista en Nutrición',
    finca: 'Centro de Asesoría Pecuaria',
    email: 'monicaruiz@test.civac.co',
    password: 'test123456',
    avatar: '🔬',
    gradient: 'from-[#00f5d4] to-[#00c8ff]',
    role: 'viewer',
    activo: true,
    plan: 'Professional',
    planExpiry: '2026-12-31',
    permisos: PLAN_MODULES.Professional,
  },

  // PLAN: ENTERPRISE (3 cuentas de prueba)
  {
    id: 'test-enterprise-1',
    nombre: 'Francisco Díaz — Plan Enterprise',
    cargo: 'Director de Operaciones',
    finca: 'Corporación Agraria Ltda.',
    email: 'franciscodiaz@test.civac.co',
    password: 'test123456',
    avatar: '👔',
    gradient: 'from-[#fbbf24] to-[#f59e0b]',
    role: 'admin',
    activo: true,
    plan: 'Enterprise',
    planExpiry: '2027-12-31',
    permisos: PLAN_MODULES.Enterprise,
  },
  {
    id: 'test-enterprise-2',
    nombre: 'Lucía Morales — Plan Enterprise',
    cargo: 'Analista de Datos',
    finca: 'Big Data Ganadería SA',
    email: 'luciamorales@test.civac.co',
    password: 'test123456',
    avatar: '📊',
    gradient: 'from-[#fbbf24] to-[#f59e0b]',
    role: 'developer',
    activo: true,
    plan: 'Enterprise',
    planExpiry: '2027-12-31',
    permisos: PLAN_MODULES.Enterprise,
  },
  {
    id: 'test-enterprise-3',
    nombre: 'Andrés Castillo — Plan Enterprise',
    cargo: 'Superintendente General',
    finca: 'Grupo Ganadero del Cauca',
    email: 'andrescastillo@test.civac.co',
    password: 'test123456',
    avatar: '🎖️',
    gradient: 'from-[#fbbf24] to-[#f59e0b]',
    role: 'admin',
    activo: true,
    plan: 'Enterprise',
    planExpiry: '2027-12-31',
    permisos: PLAN_MODULES.Enterprise,
  },

  // PLAN: DEVELOPER (1 cuenta de prueba)
  {
    id: 'test-developer-1',
    nombre: 'Miguel Gómez — Plan Developer',
    cargo: 'Desarrollador Backend',
    finca: 'Universal Business Technology',
    email: 'miguelgomez@test.civac.co',
    password: 'test123456',
    avatar: '💻',
    gradient: 'from-[#a78bfa] to-[#8b5cf6]',
    role: 'developer',
    activo: true,
    plan: 'Developer',
    planExpiry: '2099-12-31',
    permisos: ['*'],
  },
];

/* ─── Versión de cuentas (fuerza refresh cuando cambian los planes) ────────── */
const ACCOUNTS_VERSION = '6.0.0';

/* ─── Persistencia de pagos Wompi ─────────────────────────────────────────── */
function loadPayments(): WompiPayment[] {
  try {
    const s = localStorage.getItem('civac_wompi_payments');
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}
function savePayments(payments: WompiPayment[]) {
  try { localStorage.setItem('civac_wompi_payments', JSON.stringify(payments)); } catch {}
}

function loadAccounts(): Account[] {
  try {
    const version = localStorage.getItem('civac_accounts_version');
    if (version !== ACCOUNTS_VERSION) {
      /* Version changed — reset default accounts but keep user-created ones */
      const stored = localStorage.getItem('civac_accounts');
      const defaultIds = new Set(DEFAULT_ACCOUNTS.map(a => a.id));
      let extra: Account[] = [];
      if (stored) {
        const parsed: Account[] = JSON.parse(stored);
        extra = parsed.filter(a => !defaultIds.has(a.id));
      }
      const merged = [...DEFAULT_ACCOUNTS, ...extra];
      localStorage.setItem('civac_accounts', JSON.stringify(merged));
      localStorage.setItem('civac_accounts_version', ACCOUNTS_VERSION);
      /* Clear cached user so they re-login with fresh plan */
      localStorage.removeItem('civac_user');
      return merged;
    }
    const stored = localStorage.getItem('civac_accounts');
    if (stored) {
      const parsed: Account[] = JSON.parse(stored);
      if (parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_ACCOUNTS;
}
function saveAccounts(accounts: Account[]) {
  try {
    localStorage.setItem('civac_accounts', JSON.stringify(accounts));
    localStorage.setItem('civac_accounts_version', ACCOUNTS_VERSION);
  } catch {}
}

/* ─── Contexto Auth ────────────────────────────────────────────────────────── */
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
  canAccessModule: (moduleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Account | null>(() => {
    try {
      const s = localStorage.getItem('civac_user');
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
    try { localStorage.setItem('civac_user', JSON.stringify(account)); } catch {}
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
    try { localStorage.removeItem('civac_user'); } catch {}
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
      try { localStorage.setItem('civac_user', JSON.stringify(updatedUser)); } catch {}
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
      permisos: PLAN_MODULES[plan],
    });
  };

  const canAccessModule = (moduleName: string): boolean => {
    if (!user) return false;
    if (user.permisos.includes('*')) return true;
    return user.permisos.includes(moduleName);
  };

  return React.createElement(AuthContext.Provider, {
    value: {
      user, accounts, wompiPayments,
      login, loginAs, logout,
      registerUser, updateUser, deleteUser,
      activatePlan, addWompiPayment,
      canAccessModule,
    }
  }, children);
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const ACCOUNTS = DEFAULT_ACCOUNTS;
