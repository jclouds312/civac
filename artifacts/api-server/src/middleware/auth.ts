/**
 * Middleware de autenticación — sesiones persistentes en PostgreSQL
 *
 * Los tokens se validan contra `user_sessions` (PostgreSQL via Drizzle).
 * Un reinicio del servidor NO invalida las sesiones activas.
 */

import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, userSessionsTable } from "@workspace/db";
import { randomBytes } from "crypto";

export interface AuthRequest extends Request {
  user?: {
    email:       string;
    role:        string;
    plan:        string;
    permissions: string[];
    userId:      string;
  };
  token?: string;
}

// ── Middleware principal ──────────────────────────────────────────────────────

/**
 * Valida el token Bearer contra `user_sessions` en PostgreSQL.
 * Las sesiones sobreviven reinicios del servidor porque están en la BD.
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = (req.headers.authorization ?? "").replace("Bearer ", "").trim();

  if (!token) {
    // Lectura anónima permitida; escritura requiere autenticación
    if (req.method === "GET" || req.method === "HEAD") {
      req.user = {
        email:       "anonymous",
        role:        "anonymous",
        plan:        "basico",
        permissions: ["inventario", "produccion"],
        userId:      "anon",
      };
      next();
      return;
    }
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(userSessionsTable)
      .where(eq(userSessionsTable.id, token))
      .limit(1);

    const session = rows[0];
    if (!session || new Date(session.expiresAt) <= new Date()) {
      res.status(401).json({ error: "Session expired" });
      return;
    }

    req.user = {
      email:       session.userEmail,
      role:        session.userRole,
      plan:        session.planCode,
      permissions: ["*"],       // token válido = acceso completo a su rol
      userId:      session.userId,
    };
    req.token = token;
    next();
  } catch {
    // Si la BD no está lista aún, rechazamos (no fallback in-memory)
    res.status(401).json({ error: "Session validation failed" });
  }
}

// ── Middlewares de autorización por rol ───────────────────────────────────────

export function moduleAccessMiddleware(allowedModules: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const hasAccess =
      req.user.permissions.includes("*") ||
      allowedModules.some((m) => req.user!.permissions.includes(m));
    if (!hasAccess) {
      res.status(403).json({
        error:            "Access denied",
        requiredModules:  allowedModules,
        availableModules: req.user.permissions,
      });
      return;
    }
    next();
  };
}

export function adminOnlyMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) { res.status(401).json({ error: "Not authenticated" }); return; }
  if (!["admin", "superadmin", "developer"].includes(req.user.role)) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

export function devOnlyMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) { res.status(401).json({ error: "Not authenticated" }); return; }
  if (!["developer", "superadmin"].includes(req.user.role)) {
    res.status(403).json({ error: "Developer access required" });
    return;
  }
  next();
}

// ── Helpers de sesión (usan la BD — sobreviven reinicios) ─────────────────────

/**
 * Crea una sesión en `user_sessions` y devuelve el token.
 * Usar esto cuando se crea sesión fuera de routes/auth.ts.
 */
export async function createSession(
  userId:   string,
  email:    string,
  role:     string,
  plan:     string,
  nombre:   string,
  ipAddress = "",
  userAgent = "",
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await db.insert(userSessionsTable).values({
    id:        token,
    userId,
    userEmail: email,
    userRole:  role,
    userName:  nombre,
    planCode:  plan,
    ipAddress,
    userAgent,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
  });
  return token;
}

/**
 * Elimina la sesión de la BD (logout persistente).
 */
export async function destroySession(token: string): Promise<void> {
  await db.delete(userSessionsTable).where(eq(userSessionsTable.id, token));
}
