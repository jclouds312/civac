import { Router } from "express";
import { eq, or } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, usuariosTable, userSessionsTable } from "@workspace/db";

const router = Router();

const FALLBACK_USERS = [
  { id:"u-admin",  nombre:"Lizeth Daza",             cargo:"Co-Fundadora · Dir. Ejecutiva", finca:"CIVAC HQ · Bogotá",       email:"admin@ganader.ia",  password:"admin",     role:"admin",      planCode:"pro",      estado:"activo" },
  { id:"u-vet",    nombre:"Dr. Carlos Ramírez",       cargo:"Médico Veterinario",             finca:"Finca El Rancho Verde",   email:"vet@ganader.ia",    password:"vet2026",   role:"vet",        planCode:"pro",      estado:"activo" },
  { id:"u-field",  nombre:"Luis Patiño",              cargo:"Jefe de Campo",                  finca:"Finca El Rancho Verde",   email:"luis@ganader.ia",   password:"campo2026", role:"field",      planCode:"basico",   estado:"activo" },
  { id:"u-viewer", nombre:"Propietario / Inversor",   cargo:"Propietario",                    finca:"Finca El Rancho Verde",   email:"visor@ganader.ia",  password:"visor",     role:"viewer",     planCode:"basico",   estado:"activo" },
  { id:"u-dev",    nombre:"Johnatan Vallejo",         cargo:"Arquitecto CIVAC",               finca:"CIVAC HQ",               email:"dev@civac.co",      password:"dev2026",   role:"developer",  planCode:"platino",  estado:"activo" },
  { id:"u-super",  nombre:"Javier · CEO CIVAC",       cargo:"Co-Fundador · CEO",              finca:"CIVAC HQ",               email:"super@civac.co",    password:"super2026", role:"superadmin", planCode:"platino",  estado:"activo" },
  { id:"u-ventas", nombre:"María Salazar",            cargo:"Asesora Comercial Senior",       finca:"CIVAC Sales Colombia",    email:"ventas@civac.co",   password:"ventas2026",role:"sales",      planCode:"pro",      estado:"activo" },
];

/* ── POST /api/auth/login ─────────────────────────────────────────────────── */
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: "Email y contraseña requeridos" });

    let user: typeof FALLBACK_USERS[0] | null = null;
    try {
      const rows = await db.select().from(usuariosTable)
        .where(eq(usuariosTable.email, email.toLowerCase().trim())).limit(1);
      if (rows[0] && rows[0].password === password) {
        if (rows[0].estado === "bloqueado") return res.status(403).json({ error: "Cuenta bloqueada. Contacte al administrador." });
        user = { id: rows[0].id, nombre: rows[0].nombre, cargo: rows[0].cargo, finca: rows[0].finca,
          email: rows[0].email, password: rows[0].password, role: rows[0].role,
          planCode: rows[0].planCode ?? "basico", estado: rows[0].estado ?? "activo" };
      }
    } catch { /* DB not ready — use fallback */ }

    if (!user) {
      const fb = FALLBACK_USERS.find(u => u.email === email.toLowerCase().trim() && u.password === password);
      if (fb) user = fb;
    }
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });

    const token = randomUUID();
    try {
      await db.insert(userSessionsTable).values({
        id: token, userId: user.id, userEmail: user.email, userRole: user.role,
        userName: user.nombre, planCode: user.planCode,
        ipAddress: req.ip ?? "", userAgent: req.headers["user-agent"] ?? "",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } catch { /* ok */ }

    res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email,
      role: user.role, cargo: user.cargo, finca: user.finca, planCode: user.planCode, estado: user.estado } });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* ── GET /api/auth/me ─────────────────────────────────────────────────────── */
router.get("/auth/me", async (req, res) => {
  try {
    const token = (req.headers.authorization ?? "").replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ error: "No token" });

    try {
      const sessions = await db.select().from(userSessionsTable)
        .where(eq(userSessionsTable.id, token)).limit(1);
      if (sessions[0] && new Date(sessions[0].expiresAt) > new Date()) {
        const s = sessions[0];
        let estado = "activo";
        let googleFoto: string | null = null;
        let finca = "Finca El Rancho Verde";
        let cargo = "";
        try {
          const users = await db.select().from(usuariosTable)
            .where(eq(usuariosTable.id, s.userId)).limit(1);
          if (users[0]) {
            estado = users[0].estado ?? "activo";
            googleFoto = users[0].googleFoto ?? null;
            finca = users[0].finca ?? finca;
            cargo = users[0].cargo ?? "";
          }
        } catch { /* ok */ }
        return res.json({ id: s.userId, nombre: s.userName, email: s.userEmail,
          role: s.userRole, cargo, finca, planCode: s.planCode, estado, googleFoto });
      }
    } catch { /* DB not ready */ }

    res.status(401).json({ error: "Sesión inválida o expirada" });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* ── POST /api/auth/logout ────────────────────────────────────────────────── */
router.post("/auth/logout", async (req, res) => {
  try {
    const token = (req.headers.authorization ?? "").replace("Bearer ", "").trim();
    if (token) { try { await db.delete(userSessionsTable).where(eq(userSessionsTable.id, token)); } catch { /* ok */ } }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* ── GET /api/auth/google ─────────────────────────────────────────────────── */
router.get("/auth/google", (_req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const domain = process.env.REPLIT_DEV_DOMAIN ?? "";
  const frontendUrl = domain ? `https://${domain}` : "http://localhost:5000";

  if (!clientId) {
    return res.redirect(`${frontendUrl}/?google_error=no_config`);
  }

  const callbackUrl = domain
    ? `https://${domain}/api/auth/google/callback`
    : "http://localhost:8080/api/auth/google/callback";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "email profile openid",
    access_type: "offline",
    prompt: "select_account",
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

/* ── GET /api/auth/google/callback ───────────────────────────────────────── */
router.get("/auth/google/callback", async (req, res) => {
  const domain = process.env.REPLIT_DEV_DOMAIN ?? "";
  const frontendUrl = domain ? `https://${domain}` : "http://localhost:5000";
  const callbackUrl = domain
    ? `https://${domain}/api/auth/google/callback`
    : "http://localhost:8080/api/auth/google/callback";

  const { code, error: oauthError } = req.query as { code?: string; error?: string };

  if (oauthError || !code) {
    return res.redirect(`${frontendUrl}/?google_error=cancelled`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }).toString(),
    });
    const tokenData = await tokenRes.json() as { access_token?: string; error?: string };

    if (!tokenData.access_token) {
      return res.redirect(`${frontendUrl}/?google_error=token_failed`);
    }

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const gUser = await userInfoRes.json() as { id: string; email: string; name: string; picture?: string };

    if (!gUser.email || !gUser.id) {
      return res.redirect(`${frontendUrl}/?google_error=userinfo_failed`);
    }

    let dbUser: typeof usuariosTable.$inferSelect;
    const existing = await db.select().from(usuariosTable)
      .where(or(eq(usuariosTable.googleId, gUser.id), eq(usuariosTable.email, gUser.email.toLowerCase())))
      .limit(1);

    if (existing[0]) {
      if (existing[0].estado === "bloqueado") {
        return res.redirect(`${frontendUrl}/?google_error=blocked`);
      }
      const [updated] = await db.update(usuariosTable).set({
        googleId: gUser.id,
        googleFoto: gUser.picture ?? null,
        updatedAt: new Date(),
      }).where(eq(usuariosTable.id, existing[0].id)).returning();
      dbUser = updated;
    } else {
      const newId = `g_${randomUUID().slice(0, 8)}`;
      const [created] = await db.insert(usuariosTable).values({
        id: newId,
        nombre: gUser.name,
        cargo: "Usuario Google",
        finca: "Sin asignar",
        email: gUser.email.toLowerCase(),
        password: "",
        role: "viewer",
        permisos: JSON.stringify(["dashboard", "alertas"]),
        planCode: "basico",
        activo: false,
        googleId: gUser.id,
        googleFoto: gUser.picture ?? null,
        estado: "pendiente",
      }).returning();
      dbUser = created;
    }

    const token = randomUUID();
    await db.insert(userSessionsTable).values({
      id: token,
      userId: dbUser.id,
      userEmail: dbUser.email,
      userRole: dbUser.role,
      userName: dbUser.nombre,
      planCode: dbUser.planCode,
      ipAddress: req.ip ?? "",
      userAgent: req.headers["user-agent"] ?? "",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.redirect(`${frontendUrl}/?civac_token=${token}&google=1`);
  } catch (err) {
    console.error("[Google OAuth error]", err);
    res.redirect(`${frontendUrl}/?google_error=server_error`);
  }
});

/* ── GET /api/auth/google/status ─────────────────────────────────────────── */
router.get("/auth/google/status", (_req, res) => {
  res.json({ configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) });
});

/* ── POST /api/auth/register ─────────────────────────────────────────────── */
router.post("/auth/register", async (req, res) => {
  try {
    const { nombre, email, password, finca, cargo } = req.body as {
      nombre?: string; email?: string; password?: string; finca?: string; cargo?: string;
    };

    if (!nombre?.trim()) return res.status(400).json({ ok: false, error: "El nombre es requerido" });
    if (!email?.trim())  return res.status(400).json({ ok: false, error: "El correo es requerido" });
    if (!password || password.length < 6)
      return res.status(400).json({ ok: false, error: "La contraseña debe tener al menos 6 caracteres" });

    const normalEmail = email.toLowerCase().trim();
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(normalEmail))
      return res.status(400).json({ ok: false, error: "Correo electrónico inválido" });

    try {
      const existing = await db.select({ id: usuariosTable.id })
        .from(usuariosTable).where(eq(usuariosTable.email, normalEmail)).limit(1);
      if (existing[0])
        return res.status(409).json({ ok: false, error: "Ya existe una cuenta con ese correo" });

      const FALLBACK_EMAILS = FALLBACK_USERS.map(u => u.email);
      if (FALLBACK_EMAILS.includes(normalEmail))
        return res.status(409).json({ ok: false, error: "Ya existe una cuenta con ese correo" });

      const newId = `r_${randomUUID().slice(0, 8)}`;
      const [created] = await db.insert(usuariosTable).values({
        id: newId,
        nombre: nombre.trim(),
        cargo: cargo?.trim() || "Propietario de Finca",
        finca: finca?.trim() || "Sin asignar",
        email: normalEmail,
        password,
        role: "viewer",
        permisos: JSON.stringify(["dashboard","alertas","inventario","produccion"]),
        planCode: "basico",
        activo: false,
        estado: "pendiente",
      } as Parameters<typeof db.insert>[0]).returning();

      return res.status(201).json({
        ok: true,
        message: "Registro recibido. Tu cuenta está pendiente de activación por el administrador.",
        userId: created.id,
      });
    } catch (dbErr) {
      console.error("[register] DB error", dbErr);
      return res.status(500).json({ ok: false, error: "Error al crear la cuenta. Intenta de nuevo." });
    }
  } catch (e) { return res.status(500).json({ ok: false, error: String(e) }); }
});

export default router;
