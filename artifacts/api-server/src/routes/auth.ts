import { Router } from "express";
import { eq, or } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, usuariosTable, userSessionsTable } from "@workspace/db";

const router = Router();

const FALLBACK_USERS = [
  { id:"superadmin", nombre:"Javier Hernando Sánchez Bernal", cargo:"CEO · Fundador & Propietario CIVAC",    finca:"CIVAC HQ · Bogotá",    email:"Softganventas@gmail.com",             password:"civac2026",  role:"superadmin", planCode:"platino", estado:"activo" },
  { id:"admin",      nombre:"Lizet Daza",                      cargo:"Co-Fundadora · Directora Ejecutiva",   finca:"CIVAC HQ · Bogotá",    email:"lizet.daza@civac.co",                 password:"lizet2026",  role:"admin",      planCode:"platino", estado:"activo" },
  { id:"developer",  nombre:"Johnatan Vallejo Marulanda",      cargo:"Arquitecto Principal · Dev PWA & IA",  finca:"CIVAC Labs · Colombia", email:"johnatanvallejomarulanda@gmail.com",  password:"dev2026",    role:"developer",  planCode:"platino", estado:"activo" },
  { id:"ventas",     nombre:"Asesora CIVAC · Ventas",          cargo:"Asesora Comercial Senior",             finca:"CIVAC Sales Colombia",  email:"ventas@civac.co",                     password:"ventas2026", role:"sales",      planCode:"platino", estado:"activo" },
  { id:"u-vet",      nombre:"Dr. Carlos Ramírez",              cargo:"Médico Veterinario",                   finca:"Finca El Rancho Verde", email:"vet@ganader.ia",                      password:"vet2026",    role:"vet",        planCode:"pro",     estado:"activo" },
  { id:"u-field",    nombre:"Luis Patiño",                     cargo:"Jefe de Campo",                        finca:"Finca El Rancho Verde", email:"luis@ganader.ia",                     password:"campo2026",  role:"field",      planCode:"basico",  estado:"activo" },
  { id:"u-viewer",   nombre:"Propietario / Inversor",          cargo:"Propietario",                          finca:"Finca El Rancho Verde", email:"visor@ganader.ia",                    password:"visor",      role:"viewer",     planCode:"basico",  estado:"activo" },
];

function msLeft(expiry: Date | null | undefined): number {
  if (!expiry) return Infinity;
  return new Date(expiry).getTime() - Date.now();
}

/* ── POST /api/auth/login ─────────────────────────────────────────────────── */
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: "Email y contraseña requeridos" });

    let user: typeof FALLBACK_USERS[0] | null = null;
    let dbRow: typeof usuariosTable.$inferSelect | null = null;

    try {
      const rows = await db.select().from(usuariosTable)
        .where(eq(usuariosTable.email, email.toLowerCase().trim())).limit(1);
      if (rows[0] && rows[0].password === password) {
        dbRow = rows[0];

        if (rows[0].estado === "bloqueado")
          return res.status(403).json({ error: "Cuenta bloqueada. Contacte al administrador." });

        if (rows[0].estado === "pendiente")
          return res.status(403).json({ error: "Tu cuenta está pendiente de activación por el administrador. Te notificaremos por correo.", code: "pending" });

        /* ── Demo expiry check ────────────────────────────────────────── */
        if (rows[0].demoExpiry && msLeft(rows[0].demoExpiry) <= 0) {
          const expStr = new Date(rows[0].demoExpiry).toLocaleDateString("es-CO");
          return res.status(402).json({
            error: `Tu período de demo venció el ${expStr}. Contacta a CIVAC para activar tu plan.`,
            code: "demo_expired",
            expiredAt: rows[0].demoExpiry,
          });
        }

        /* ── Plan expiry check (only for non-free plans) ─────────────── */
        if (rows[0].planExpiry && rows[0].planCode !== "basico" && msLeft(rows[0].planExpiry) <= 0) {
          const expStr = new Date(rows[0].planExpiry).toLocaleDateString("es-CO");
          return res.status(402).json({
            error: `Tu plan ${rows[0].planCode.toUpperCase()} venció el ${expStr}. Renueva tu suscripción para continuar.`,
            code: "plan_expired",
            expiredAt: rows[0].planExpiry,
            planCode: rows[0].planCode,
          });
        }

        user = {
          id: rows[0].id, nombre: rows[0].nombre, cargo: rows[0].cargo, finca: rows[0].finca,
          email: rows[0].email, password: rows[0].password, role: rows[0].role,
          planCode: rows[0].planCode ?? "basico", estado: rows[0].estado ?? "activo",
        };
      }
    } catch { /* DB not ready — use fallback */ }

    if (!user) {
      const fb = FALLBACK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);
      if (fb) user = fb;
    }
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });

    /* ── Increment loginCount + set lastLogin in DB ───────────────────── */
    if (dbRow) {
      try {
        await db.update(usuariosTable).set({
          loginCount: (dbRow.loginCount ?? 0) + 1,
          lastLogin: new Date(),
          updatedAt: new Date(),
        } as Parameters<typeof db.update>[0]).where(eq(usuariosTable.id, dbRow.id));
      } catch { /* ok */ }
    }

    const token = randomUUID();
    try {
      await db.insert(userSessionsTable).values({
        id: token, userId: user.id, userEmail: user.email, userRole: user.role,
        userName: user.nombre, planCode: user.planCode,
        ipAddress: req.ip ?? "", userAgent: req.headers["user-agent"] ?? "",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } catch { /* ok */ }

    const demoExpiry = dbRow?.demoExpiry ?? null;
    const planExpiry = dbRow?.planExpiry ?? null;
    const demoDiasRestantes = demoExpiry ? Math.max(0, Math.ceil(msLeft(demoExpiry) / 86_400_000)) : null;
    const planDiasRestantes = planExpiry ? Math.max(0, Math.ceil(msLeft(planExpiry) / 86_400_000)) : null;

    res.json({
      token,
      user: {
        id: user.id, nombre: user.nombre, email: user.email,
        role: user.role, cargo: user.cargo, finca: user.finca,
        planCode: user.planCode, estado: user.estado,
        demoExpiry: demoExpiry?.toISOString() ?? null,
        planExpiry: planExpiry?.toISOString() ?? null,
        demoDiasRestantes,
        planDiasRestantes,
        loginCount: dbRow ? (dbRow.loginCount ?? 0) + 1 : 1,
      },
    });
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
        let demoExpiry: Date | null = null;
        let planExpiry: Date | null = null;
        let demoDias = 0;
        let planDias = 0;
        let loginCount = 0;
        try {
          const users = await db.select().from(usuariosTable)
            .where(eq(usuariosTable.id, s.userId)).limit(1);
          if (users[0]) {
            estado = users[0].estado ?? "activo";
            googleFoto = users[0].googleFoto ?? null;
            finca = users[0].finca ?? finca;
            cargo = users[0].cargo ?? "";
            demoExpiry = users[0].demoExpiry ?? null;
            planExpiry = users[0].planExpiry ?? null;
            demoDias = users[0].demoDias ?? 0;
            planDias = users[0].planDias ?? 0;
            loginCount = users[0].loginCount ?? 0;
          }
        } catch { /* ok */ }
        return res.json({
          id: s.userId, nombre: s.userName, email: s.userEmail,
          role: s.userRole, cargo, finca, planCode: s.planCode, estado, googleFoto,
          demoExpiry: demoExpiry?.toISOString() ?? null,
          planExpiry: planExpiry?.toISOString() ?? null,
          demoDias, planDias, loginCount,
        });
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
        loginCount: (existing[0].loginCount ?? 0) + 1,
        lastLogin: new Date(),
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

    /* Check demo/plan expiry for google users */
    if (dbUser.demoExpiry && msLeft(dbUser.demoExpiry) <= 0) {
      return res.redirect(`${frontendUrl}/?google_error=demo_expired`);
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
