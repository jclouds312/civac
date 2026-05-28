/**
 * Rutas de autenticación y planes
 * Endpoints: /api/auth/*, /api/plans/*
 */

import { Router, Request, Response } from "express";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";

const authRouter = Router();

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS Y SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

type PlanCode = 'Basic' | 'Professional' | 'Enterprise' | 'Developer';

const PlanModules: Record<PlanCode, string[]> = {
  Basic: [
    'inventario', 'produccion', 'pesaje', 'alertas', 'potreros', 'gps'
  ],
  Professional: [
    'inventario', 'produccion', 'reproduccion', 'genetica', 'potreros',
    'alimentacion', 'insumos', 'semen', 'costos', 'pesaje', 'prediccion',
    'alertas', 'gps', 'ficha', 'documentacion'
  ],
  Enterprise: [
    'inventario', 'produccion', 'reproduccion', 'genetica', 'potreros',
    'alimentacion', 'insumos', 'semen', 'costos', 'pesaje', 'prediccion',
    'alertas', 'gps', 'ficha', 'documentacion', 'personal', 'multifinca',
    'api', 'reportes', 'usuarios', 'integraciones', 'configuracion',
    'auditoria', 'datos', 'lotes', 'mercado', 'sostenibilidad', 'soporte-prioritario'
  ],
  Developer: ['*'],
};

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
});

const RegisterSchema = z.object({
  nombre: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  cargo: z.string(),
  finca: z.string(),
  plan: z.enum(['Basic', 'Professional', 'Enterprise', 'Developer']),
});

interface UserSession {
  id: string;
  userId: string;
  email: string;
  role: string;
  plan: PlanCode;
  permissions: string[];
  expiresAt: number;
}

// En producción, usar base de datos real
const sessions = new Map<string, UserSession>();

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

function hasAccessToModule(plan: PlanCode, module: string): boolean {
  const modules = PlanModules[plan];
  return modules.includes('*') || modules.includes(module);
}

// ═══════════════════════════════════════════════════════════════════════════
// ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/login
 * Autentica usuario y crea sesión
 */
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    // En producción, validar contra base de datos
    // Por ahora simulamos con datos de prueba
    const mockUsers: Record<string, { password: string; role: string; plan: PlanCode }> = {
      'admin@civac.co': { password: 'admin', role: 'admin', plan: 'Enterprise' },
      'vet@civac.co': { password: 'vet2026', role: 'vet', plan: 'Professional' },
      'luis@civac.co': { password: 'campo2026', role: 'field', plan: 'Professional' },
      'visor@civac.co': { password: 'visor', role: 'viewer', plan: 'Basic' },
      'dev@civac.co': { password: 'dev2026', role: 'developer', plan: 'Developer' },
      'super@civac.co': { password: 'super2026', role: 'superadmin', plan: 'Enterprise' },
      // Cuentas de prueba
      'juanacosta@test.civac.co': { password: 'test123456', role: 'field', plan: 'Basic' },
      'patricialopez@test.civac.co': { password: 'test123456', role: 'viewer', plan: 'Basic' },
      'carlosmartinez@test.civac.co': { password: 'test123456', role: 'field', plan: 'Basic' },
      'sandragónzalez@test.civac.co': { password: 'test123456', role: 'vet', plan: 'Professional' },
      'robertofernandez@test.civac.co': { password: 'test123456', role: 'admin', plan: 'Professional' },
      'monicaruiz@test.civac.co': { password: 'test123456', role: 'viewer', plan: 'Professional' },
      'franciscodiaz@test.civac.co': { password: 'test123456', role: 'admin', plan: 'Enterprise' },
      'luciamorales@test.civac.co': { password: 'test123456', role: 'developer', plan: 'Enterprise' },
      'andrescastillo@test.civac.co': { password: 'test123456', role: 'admin', plan: 'Enterprise' },
      'miguelgomez@test.civac.co': { password: 'test123456', role: 'developer', plan: 'Developer' },
    };

    const user = mockUsers[email];
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken();
    const session: UserSession = {
      id: token,
      userId: email.split('@')[0],
      email,
      role: user.role,
      plan: user.plan,
      permissions: PlanModules[user.plan],
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
    };

    sessions.set(token, session);

    res.json({
      token,
      user: {
        email,
        role: user.role,
        plan: user.plan,
        permissions: PlanModules[user.plan],
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

/**
 * POST /api/auth/register
 * Registra nuevo usuario
 */
authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const data = RegisterSchema.parse(req.body);

    // En producción, guardar en base de datos
    const userId = `user_${Date.now()}`;
    const token = generateToken();

    const session: UserSession = {
      id: token,
      userId,
      email: data.email,
      role: 'viewer',
      plan: data.plan,
      permissions: PlanModules[data.plan],
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    sessions.set(token, session);

    res.status(201).json({
      token,
      user: {
        id: userId,
        email: data.email,
        plan: data.plan,
        permissions: PlanModules[data.plan],
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

/**
 * POST /api/auth/verify
 * Verifica sesión actual
 */
authRouter.post('/verify', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Session expired' });
  }

  res.json({ session });
});

/**
 * POST /api/auth/logout
 * Invalida sesión
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) sessions.delete(token);
  res.json({ message: 'Logged out' });
});

/**
 * POST /api/auth/check-module
 * Verifica acceso a módulo específico
 */
authRouter.post('/check-module', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { module } = req.body;

  if (!token || !module) {
    return res.status(400).json({ error: 'Missing token or module' });
  }

  const session = sessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const hasAccess = hasAccessToModule(session.plan, module);

  res.json({
    hasAccess,
    plan: session.plan,
    module,
  });
});

/**
 * GET /api/plans
 * Lista todos los planes disponibles
 */
authRouter.get('/plans', (req: Request, res: Response) => {
  const plans = [
    {
      code: 'Basic',
      name: 'Básico',
      price: 0,
      maxAnimals: 50,
      maxUsers: 1,
      maxGpsCollars: 5,
      modules: PlanModules.Basic,
      icon: '📦',
      color: '#b8c4d4',
    },
    {
      code: 'Professional',
      name: 'Professional',
      price: 89000,
      maxAnimals: 500,
      maxUsers: 10,
      maxGpsCollars: 50,
      modules: PlanModules.Professional,
      icon: '⚡',
      color: '#00f5d4',
    },
    {
      code: 'Enterprise',
      name: 'Enterprise',
      price: 189000,
      maxAnimals: 5000,
      maxUsers: 100,
      maxGpsCollars: 500,
      modules: PlanModules.Enterprise,
      icon: '🏆',
      color: '#fbbf24',
    },
    {
      code: 'Developer',
      name: 'Developer',
      price: 0,
      maxAnimals: -1,
      maxUsers: -1,
      maxGpsCollars: -1,
      modules: PlanModules.Developer,
      icon: '👨‍💻',
      color: '#a78bfa',
    }
  ];

  res.json(plans);
});

/**
 * GET /api/plans/:code
 * Obtiene detalles de un plan específico
 */
authRouter.get('/plans/:code', (req: Request, res: Response) => {
  const { code } = req.params;
  const plan = code as PlanCode;

  if (!(plan in PlanModules)) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  const planDetails: Record<PlanCode, any> = {
    Basic: {
      code: 'Basic',
      name: 'Básico',
      description: 'Plan para ganaderos pequeños',
      price: 0,
      maxAnimals: 50,
      maxUsers: 1,
      maxGpsCollars: 5,
      modules: PlanModules.Basic,
      features: ['Pesaje manual', 'Alertas básicas', 'GPS limitado'],
    },
    Professional: {
      code: 'Professional',
      name: 'Professional',
      description: 'Plan para operaciones medianas',
      price: 89000,
      maxAnimals: 500,
      maxUsers: 10,
      maxGpsCollars: 50,
      modules: PlanModules.Professional,
      features: ['Todas las características Basic', 'Predicciones ML', 'Análisis avanzado'],
    },
    Enterprise: {
      code: 'Enterprise',
      name: 'Enterprise',
      description: 'Plan para corporaciones y multifinca',
      price: 189000,
      maxAnimals: 5000,
      maxUsers: 100,
      maxGpsCollars: 500,
      modules: PlanModules.Enterprise,
      features: ['Todas las características', 'Soporte 24/7', 'API custom', 'Integraciones'],
    },
    Developer: {
      code: 'Developer',
      name: 'Developer',
      description: 'Plan para desarrolladores e integradores',
      price: 0,
      maxAnimals: -1,
      maxUsers: -1,
      maxGpsCollars: -1,
      modules: PlanModules.Developer,
      features: ['Acceso completo', 'API documentation', 'Sandbox environment'],
    }
  };

  res.json(planDetails[plan]);
});

/**
 * GET /api/test-accounts
 * Lista todas las cuentas de prueba disponibles
 */
authRouter.get('/test-accounts', (req: Request, res: Response) => {
  const testAccounts = [
    {
      plan: 'Basic',
      accounts: [
        { email: 'juanacosta@test.civac.co', password: 'test123456', role: 'field', name: 'Juan Acosta' },
        { email: 'patricialopez@test.civac.co', password: 'test123456', role: 'viewer', name: 'Patricia López' },
        { email: 'carlosmartinez@test.civac.co', password: 'test123456', role: 'field', name: 'Carlos Martínez' },
      ]
    },
    {
      plan: 'Professional',
      accounts: [
        { email: 'sandragónzalez@test.civac.co', password: 'test123456', role: 'vet', name: 'Dra. Sandra González' },
        { email: 'robertofernandez@test.civac.co', password: 'test123456', role: 'admin', name: 'Roberto Fernández' },
        { email: 'monicaruiz@test.civac.co', password: 'test123456', role: 'viewer', name: 'Mónica Ruiz' },
      ]
    },
    {
      plan: 'Enterprise',
      accounts: [
        { email: 'franciscodiaz@test.civac.co', password: 'test123456', role: 'admin', name: 'Francisco Díaz' },
        { email: 'luciamorales@test.civac.co', password: 'test123456', role: 'developer', name: 'Lucía Morales' },
        { email: 'andrescastillo@test.civac.co', password: 'test123456', role: 'admin', name: 'Andrés Castillo' },
      ]
    },
    {
      plan: 'Developer',
      accounts: [
        { email: 'miguelgomez@test.civac.co', password: 'test123456', role: 'developer', name: 'Miguel Gómez' },
      ]
    }
  ];

  res.json(testAccounts);
});

export default authRouter;
