/**
 * Middleware para validar sesión y acceso a módulos
 */

import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: {
    email: string;
    role: string;
    plan: string;
    permissions: string[];
    userId: string;
  };
  token?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthRequest["user"];
      token?: string;
    }
  }
}

const activeSessions = new Map<string, any>();

/**
 * Middleware: Validar token JWT/sesión
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    // Permitir lectura anónima, pero no escritura
    if (['GET', 'HEAD'].includes(req.method)) {
      req.user = {
        email: 'anonymous',
        role: 'anonymous',
        plan: 'Basic',
        permissions: ['inventario', 'produccion'],
        userId: 'anon',
      };
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'Session expired' });
  }

  req.user = {
    email: session.email,
    role: session.role,
    plan: session.plan,
    permissions: session.permissions,
    userId: session.userId,
  };
  req.token = token;

  return next();
}

/**
 * Middleware: Validar acceso a módulo específico
 */
export function moduleAccessMiddleware(allowedModules: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const hasAccess = 
      req.user.permissions.includes('*') ||
      allowedModules.some(m => req.user!.permissions.includes(m));

    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied',
        reason: `Plan ${req.user.plan} does not have access to these modules`,
        requiredModules: allowedModules,
        availableModules: req.user.permissions,
      });
    }

    return next();
  };
}

/**
 * Middleware: Solo admin o superadmin
 */
export function adminOnlyMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!['admin', 'superadmin', 'developer'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  return next();
}

/**
 * Middleware: Solo desarrolladores
 */
export function devOnlyMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!['developer', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Developer access required' });
  }

  return next();
}

/**
 * Registrar sesión activa
 */
export function createSession(email: string, role: string, plan: string, permissions: string[]): string {
  const token = require('crypto').randomBytes(32).toString('hex');
  activeSessions.set(token, {
    email,
    role,
    plan,
    permissions,
    userId: email.split('@')[0],
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });
  return token;
}

/**
 * Invalidar sesión
 */
export function destroySession(token: string): void {
  activeSessions.delete(token);
}
