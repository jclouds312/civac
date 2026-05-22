import { Router } from "express";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, usuariosTable, userSessionsTable } from "@workspace/db";

const router = Router();

// Fallback users (used if DB is not yet seeded)
const FALLBACK_USERS = [
  { id:"u-admin",  nombre:"Administrador General",    cargo:"Administrador",   finca:"Finca El Rancho Verde", email:"admin@ganader.ia",  password:"admin",    role:"admin",    planCode:"pro" },
  { id:"u-vet",    nombre:"Dr. Carlos Ramírez",        cargo:"Veterinario",     finca:"Finca El Rancho Verde", email:"vet@ganader.ia",    password:"vet2026",  role:"vet",      planCode:"pro" },
  { id:"u-field",  nombre:"Luis Patiño",               cargo:"Operario campo",  finca:"Finca El Rancho Verde", email:"luis@ganader.ia",   password:"campo2026",role:"field",    planCode:"basic" },
  { id:"u-viewer", nombre:"Propietario / Inversor",    cargo:"Propietario",     finca:"Finca El Rancho Verde", email:"visor@ganader.ia",  password:"visor",    role:"viewer",   planCode:"basic" },
  { id:"u-dev",    nombre:"Dev · Arquitecto CIVAC",    cargo:"Desarrollador",   finca:"CIVAC HQ",             email:"dev@civac.co",     password:"dev2026",  role:"developer",planCode:"platinum" },
  { id:"u-super",  nombre:"Super Administrador",       cargo:"Super Admin",     finca:"CIVAC HQ",             email:"super@civac.co",   password:"super2026",role:"superadmin",planCode:"platinum" },
];

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña requeridos" });
    }

    // Try DB first
    let user: typeof FALLBACK_USERS[0] | null = null;
    try {
      const rows = await db.select().from(usuariosTable)
        .where(eq(usuariosTable.email, email.toLowerCase().trim()))
        .limit(1);
      if (rows[0] && rows[0].password === password) {
        user = {
          id: rows[0].id,
          nombre: rows[0].nombre,
          cargo: rows[0].cargo,
          finca: rows[0].finca,
          email: rows[0].email,
          password: rows[0].password,
          role: rows[0].role,
          planCode: rows[0].planCode ?? "basic",
        };
      }
    } catch { /* DB not ready — use fallback */ }

    // Fallback to hardcoded users
    if (!user) {
      const fb = FALLBACK_USERS.find(u => u.email === email.toLowerCase().trim() && u.password === password);
      if (fb) user = fb;
    }

    if (!user) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    try {
      await db.insert(userSessionsTable).values({
        id: token,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        userName: user.nombre,
        planCode: user.planCode,
        ipAddress: req.ip ?? "",
        userAgent: req.headers["user-agent"] ?? "",
        expiresAt,
      });
    } catch { /* DB not ready */ }

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        cargo: user.cargo,
        finca: user.finca,
        planCode: user.planCode,
      },
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/auth/me
router.get("/auth/me", async (req, res) => {
  try {
    const token = (req.headers.authorization ?? "").replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ error: "No token" });

    try {
      const rows = await db.select().from(userSessionsTable).where(eq(userSessionsTable.id, token)).limit(1);
      if (rows[0] && new Date(rows[0].expiresAt) > new Date()) {
        return res.json({
          id: rows[0].userId,
          nombre: rows[0].userName,
          email: rows[0].userEmail,
          role: rows[0].userRole,
          cargo: "",
          finca: "Finca El Rancho Verde",
          planCode: rows[0].planCode,
        });
      }
    } catch { /* DB not ready */ }

    res.status(401).json({ error: "Sesión inválida o expirada" });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/auth/logout
router.post("/auth/logout", async (req, res) => {
  try {
    const token = (req.headers.authorization ?? "").replace("Bearer ", "").trim();
    if (token) {
      try { await db.delete(userSessionsTable).where(eq(userSessionsTable.id, token)); } catch { /* ok */ }
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
