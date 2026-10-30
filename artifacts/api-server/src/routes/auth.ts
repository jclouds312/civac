import { Router } from "express";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from "crypto";
import { db, auditLogTable, codigosActivacionTable, usuariosTable, userSessionsTable } from "@workspace/db";
import { authMiddleware, type AuthRequest } from "../middleware/auth";

const router = Router();

const PASSWORD_KEY_LENGTH = 64;

function derivePasswordKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, PASSWORD_KEY_LENGTH, (error, key) => {
      if (error) reject(error);
      else resolve(Buffer.from(key));
    });
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await derivePasswordKey(password, salt);
  return `scrypt$${salt}$${key.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash, ...extra] = stored.split("$");
  if (scheme === "scrypt" && !extra.length && /^[a-f0-9]{32}$/i.test(salt) && /^[a-f0-9]{128}$/i.test(hash)) {
    const expected = Buffer.from(hash, "hex");
    const actual = await derivePasswordKey(password, salt);
    return expected.length === actual.length && timingSafeEqual(actual, expected);
  }
  // Existing accounts still have legacy plaintext passwords; keep them usable.
  return stored === password;
}

function appBaseUrl(): string | null {
  const configuredUrl = process.env.PUBLIC_APP_URL?.trim();
  if (configuredUrl) {
    try {
      const parsed = new URL(configuredUrl);
      if (parsed.protocol === "https:" || (process.env.NODE_ENV !== "production" && parsed.hostname === "localhost")) {
        return parsed.origin;
      }
    } catch { /* ignore invalid public URL */ }
  }

  const devDomain = process.env.REPLIT_DEV_DOMAIN?.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (devDomain && process.env.NODE_ENV !== "production") return `https://${devDomain}`;
  return process.env.NODE_ENV === "production" ? null : "http://localhost:5000";
}

function googleCallbackUrl(path: "callback" | "link/callback"): string | null {
  const base = appBaseUrl();
  return base ? `${base}/api/auth/google/${path}` : null;
}

function requestCookie(req: AuthRequest, name: string): string | null {
  const cookie = req.headers.cookie ?? "";
  const entry = cookie.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`));
  if (!entry) return null;
  try { return decodeURIComponent(entry.slice(name.length + 1)); } catch { return null; }
}

const GOOGLE_STAFF_ACCOUNTS: Record<string, { role: string; cargo: string; finca: string; planCode: string; permisos: string[] }> = {
  "johnatanvallejomarulanda@gmail.com": {
    role: "developer",
    cargo: "Arquitecto Principal · Dev PWA & IA",
    finca: "CIVAC Labs · Colombia",
    planCode: "platino",
    permisos: ["*"],
  },
  "john474nvallejo@gmail.com": {
    role: "developer",
    cargo: "Developer · Super Administrador Multirole",
    finca: "CIVAC Labs · Colombia",
    planCode: "platino",
    permisos: ["*"],
  },
};

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
      const loginId = email.toLowerCase().trim();
      const rows = await db.select().from(usuariosTable)
        .where(or(eq(usuariosTable.email, loginId), eq(usuariosTable.id, loginId))).limit(1);
      if (rows[0] && !rows[0].password.startsWith("CARD_ONLY:") && await verifyPassword(password, rows[0].password)) {
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
      const fb = FALLBACK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (fb && await verifyPassword(password, fb.password)) user = fb;
    }
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });

    /* ── Increment loginCount + set lastLogin in DB ───────────��───────── */
    if (dbRow) {
      try {
        await db.update(usuariosTable).set({
          loginCount: (dbRow.loginCount ?? 0) + 1,
          lastLogin: new Date(),
          updatedAt: new Date(),
        }).where(eq(usuariosTable.id, dbRow.id));
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
    if (dbRow) {
      try {
        await db.insert(auditLogTable).values({
          userId: dbRow.id,
          userEmail: dbRow.email,
          userRole: dbRow.role,
          accion: "login",
          entidad: "user",
          entidadId: dbRow.id,
          detalles: JSON.stringify({ method: "password" }),
          ipAddress: req.ip ?? "",
          resultado: "ok",
        });
      } catch { /* login must not fail because of optional usage tracking */ }
    }

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

/* ── POST /api/auth/password — create or change the signed-in user's password ─ */
router.post("/auth/password", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId || userId === "anon") return res.status(401).json({ error: "Inicia sesión para cambiar tu contraseña." });

    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
    if (typeof newPassword !== "string" || newPassword.length < 10 || newPassword.length > 128) {
      return res.status(400).json({ error: "La contraseña nueva debe tener entre 10 y 128 caracteres." });
    }

    const rows = await db.select().from(usuariosTable).where(eq(usuariosTable.id, userId)).limit(1);
    const account = rows[0];
    if (!account || account.estado === "bloqueado" || account.activo === false) {
      return res.status(403).json({ error: "La cuenta no está disponible." });
    }

    const firstPassword = !account.password || account.password.startsWith("CARD_ONLY:");
    if (!firstPassword) {
      if (typeof currentPassword !== "string" || !await verifyPassword(currentPassword, account.password)) {
        return res.status(403).json({ error: "La contraseña actual no es correcta." });
      }
    }

    const passwordHash = await hashPassword(newPassword);
    await db.update(usuariosTable).set({ password: passwordHash, updatedAt: new Date() })
      .where(eq(usuariosTable.id, userId));
    return res.json({ ok: true, hasPassword: true });
  } catch {
    return res.status(503).json({ error: "No fue posible actualizar la contraseña. Intenta de nuevo." });
  }
});

/* ── POST /api/auth/card/activate — one-time customer access card ─────────── */
router.post("/auth/card/activate", async (req, res) => {
  const code = typeof req.body?.code === "string" ? req.body.code.trim().toUpperCase() : "";
  if (!/^CIVAC-WILLIAM-NOVIEMBRE2026-[A-F0-9]{48}$/.test(code)) {
    return res.status(400).json({ error: "Abre el enlace privado de activación o pega el código completo de la tarjeta." });
  }

  const codeHash = createHash("sha256").update(code).digest("hex");
  const storedCode = `CARD_SHA256:${codeHash}`;
  const now = new Date();

  try {
    const result = await db.transaction(async tx => {
      const cards = await tx.select().from(codigosActivacionTable)
        .where(eq(codigosActivacionTable.codigo, storedCode)).limit(1);
      const card = cards[0];
      if (
        !card ||
        card.estado !== "disponible" ||
        !(
          (card.planCode === "premium" && [0, 30].includes(card.diasPlan)) ||
          (card.planCode === "platino" && card.diasPlan === 0)
        ) ||
        !card.notas.startsWith("LOGIN_CARD:WILLIAM:") ||
        (card.expiresAt && new Date(card.expiresAt) <= now)
      ) {
        return { error: "invalid" as const };
      }

      const userId = card.notas.slice("LOGIN_CARD:WILLIAM:".length);
      const users = await tx.select().from(usuariosTable)
        .where(eq(usuariosTable.id, userId)).limit(1);
      const current = users[0];
      if (
        !current ||
        current.estado === "bloqueado" ||
        current.activo === false ||
        ["admin", "superadmin", "developer"].includes(current.role)
      ) {
        return { error: "account" as const };
      }

      const [claimed] = await tx.update(codigosActivacionTable).set({
        estado: "usado",
        usadoPor: current.id,
        usadoPorEmail: current.email,
        usadoPorNombre: current.nombre,
        usadoAt: now,
      }).where(and(
        eq(codigosActivacionTable.id, card.id),
        eq(codigosActivacionTable.estado, "disponible"),
        or(isNull(codigosActivacionTable.expiresAt), gt(codigosActivacionTable.expiresAt, now)),
      )).returning();
      if (!claimed) return { error: "invalid" as const };

      const permanentWilliamPlan = current.id === "civac_william";
      const activatedPlanCode = permanentWilliamPlan ? "premium" : card.planCode;
      const planExpiry = permanentWilliamPlan ? null : new Date(now.getTime() + card.diasPlan * 86_400_000);
      const sessionExpiresAt = new Date(now.getTime() + 7 * 86_400_000);
      const [updated] = await tx.update(usuariosTable).set({
        role: "cliente",
        estado: "activo",
        activo: true,
        planCode: activatedPlanCode,
        planExpiry,
        planDias: permanentWilliamPlan ? 0 : card.diasPlan,
        demoExpiry: null,
        demoDias: 0,
        loginCount: (current.loginCount ?? 0) + 1,
        lastLogin: now,
        updatedAt: now,
      }).where(eq(usuariosTable.id, current.id)).returning();

      const token = randomBytes(32).toString("hex");
      await tx.insert(userSessionsTable).values({
        id: token,
        userId: updated.id,
        userEmail: updated.email,
        userRole: "cliente",
        userName: updated.nombre,
        planCode: activatedPlanCode,
        ipAddress: req.ip ?? "",
        userAgent: req.headers["user-agent"] ?? "",
        expiresAt: sessionExpiresAt,
      });
      await tx.insert(auditLogTable).values({
        userId: updated.id,
        userEmail: updated.email,
        userRole: updated.role,
        accion: "login",
        entidad: "user",
        entidadId: updated.id,
        detalles: JSON.stringify({ method: "activation_card" }),
        ipAddress: req.ip ?? "",
        resultado: "ok",
      });

      return { token, user: updated };
    });

    if ("error" in result) {
      return res.status(result.error === "account" ? 403 : 401).json({
        error: result.error === "account"
          ? "La cuenta no está disponible. Contacta al administrador CIVAC."
          : "La tarjeta no es válida, venció o ya fue utilizada.",
      });
    }

    return res.json({
      token: result.token,
      user: {
        id: result.user.id,
        nombre: result.user.nombre,
        email: result.user.email,
        role: "cliente",
        cargo: result.user.cargo,
        finca: result.user.finca,
        planCode: result.user.planCode,
        estado: result.user.estado,
        planExpiry: result.user.planExpiry?.toISOString() ?? null,
      },
    });
  } catch {
    return res.status(503).json({ error: "No fue posible activar la tarjeta. Intenta de nuevo." });
  }
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
        let accountEmail = s.userEmail;
        let hasPassword = false;
        let googleLinked = false;
        try {
          const users = await db.select().from(usuariosTable)
            .where(eq(usuariosTable.id, s.userId)).limit(1);
          if (users[0]) {
            accountEmail = users[0].email;
            hasPassword = !!users[0].password && !users[0].password.startsWith("CARD_ONLY:");
            googleLinked = !!users[0].googleId;
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
          id: s.userId, nombre: s.userName, email: accountEmail,
          role: s.userRole, cargo, finca, planCode: s.planCode, estado, googleFoto,
          googleLinked, googleEmail: googleLinked ? accountEmail : null, hasPassword,
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
router.get("/auth/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const requestedReturnTo = typeof req.query.returnTo === "string" ? req.query.returnTo : "/";
  const returnTo = requestedReturnTo.startsWith("/") && !requestedReturnTo.startsWith("//") ? requestedReturnTo : "/";
  const frontendUrl = appBaseUrl() ?? "";
  const callbackUrl = googleCallbackUrl("callback");

  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET || !callbackUrl) {
    return res.redirect(`${frontendUrl}/?google_error=no_config`);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "email profile openid",
    access_type: "offline",
    prompt: "select_account",
    state: Buffer.from(returnTo, "utf8").toString("base64url"),
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

/* ── GET /api/auth/google/callback ───────────────────────────────────────── */
router.get("/auth/google/callback", async (req, res) => {
  const frontendUrl = appBaseUrl() ?? "";
  const callbackUrl = googleCallbackUrl("callback");
  if (!callbackUrl || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${frontendUrl}/?google_error=no_config`);
  }

  const { code, error: oauthError, state } = req.query as { code?: string; error?: string; state?: string };
  const returnTo = typeof state === "string" ? (() => { try { const value = Buffer.from(state, "base64url").toString("utf8"); return value.startsWith("/") && !value.startsWith("//") ? value : "/"; } catch { return "/"; } })() : "/";
  const redirectWithError = (reason: string) => `${frontendUrl}${returnTo}?google_error=${encodeURIComponent(reason)}`;
  
  if (oauthError || !code) {
    return res.redirect(redirectWithError("cancelled"));
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
    const normalizedGoogleEmail = gUser.email.toLowerCase().trim();
    const googleStaff = GOOGLE_STAFF_ACCOUNTS[normalizedGoogleEmail];
    const existing = await db.select().from(usuariosTable)
      .where(or(eq(usuariosTable.googleId, gUser.id), eq(usuariosTable.email, normalizedGoogleEmail)))
      .limit(1);

    if (existing[0]) {
      if (existing[0].estado === "bloqueado") {
        return res.redirect(`${frontendUrl}/?google_error=blocked`);
      }
      const [updated] = await db.update(usuariosTable).set({
        googleId: gUser.id,
        googleFoto: gUser.picture ?? null,
        ...(googleStaff ? {
          role: googleStaff.role,
          cargo: googleStaff.cargo,
          finca: googleStaff.finca,
          planCode: googleStaff.planCode,
          permisos: JSON.stringify(googleStaff.permisos),
          activo: true,
          estado: "activo",
        } : {}),
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
        cargo: googleStaff?.cargo ?? "Usuario Google",
        finca: googleStaff?.finca ?? "Sin asignar",
        email: normalizedGoogleEmail,
        password: "",
        role: googleStaff?.role ?? "viewer",
        permisos: JSON.stringify(googleStaff?.permisos ?? ["dashboard", "alertas"]),
        planCode: googleStaff?.planCode ?? "basico",
        activo: Boolean(googleStaff),
        googleId: gUser.id,
        googleFoto: gUser.picture ?? null,
        estado: googleStaff ? "activo" : "pendiente",
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

    res.redirect(`${frontendUrl}${returnTo}?civac_token=${token}&google=1`);
  } catch (err) {
    console.error("[Google OAuth error]", err);
    res.redirect(`${frontendUrl}/?google_error=server_error`);
  }
});

/* ── GET /api/auth/google/status ─────────────────────────────────────────── */
router.get("/auth/google/status", (_req, res) => {
  res.json({ configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && appBaseUrl()) });
});

/* ── Google account linking for William's Premium account ─────────────────── */
router.post("/auth/google/link/start", authMiddleware, (req: AuthRequest, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl = googleCallbackUrl("link/callback");
  const sessionToken = req.token;
  if (req.user?.userId !== "civac_william") {
    return res.status(403).json({ error: "Esta vinculación está habilitada para la cuenta William." });
  }
  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET || !callbackUrl) {
    return res.status(503).json({ error: "Google OAuth requiere credenciales y una URL pública configurada." });
  }
  if (!sessionToken) return res.status(401).json({ error: "Inicia sesión nuevamente para vincular Gmail." });

  const state = randomBytes(32).toString("hex");
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || req.headers["x-forwarded-proto"] === "https",
    sameSite: "lax" as const,
    maxAge: 5 * 60 * 1000,
    path: "/api/auth/google/link/callback",
  };
  res.cookie("civac_google_link_state", state, cookieOptions);
  res.cookie("civac_google_link_session", sessionToken, cookieOptions);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "email profile openid",
    access_type: "offline",
    prompt: "select_account consent",
    state,
  });
  return res.json({ authorizationUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
});

router.get("/auth/google/link/callback", async (req: AuthRequest, res) => {
  const frontendUrl = appBaseUrl() ?? "";
  const callbackUrl = googleCallbackUrl("link/callback");
  const fail = (reason: string) => res.redirect(`${frontendUrl}/mi-cuenta?google_link_error=${encodeURIComponent(reason)}`);
  const state = typeof req.query.state === "string" ? req.query.state : "";
  const expectedState = requestCookie(req, "civac_google_link_state") ?? "";
  const sessionToken = requestCookie(req, "civac_google_link_session");
  const clearOptions = { path: "/api/auth/google/link/callback" };
  res.clearCookie("civac_google_link_state", clearOptions);
  res.clearCookie("civac_google_link_session", clearOptions);

  if (!state || !expectedState || state.length !== expectedState.length ||
      !timingSafeEqual(Buffer.from(state), Buffer.from(expectedState))) {
    return fail("state");
  }
  if (!callbackUrl || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return fail("config");
  if (!sessionToken || typeof req.query.code !== "string") return fail("cancelled");

  try {
    const sessions = await db.select().from(userSessionsTable)
      .where(eq(userSessionsTable.id, sessionToken)).limit(1);
    const session = sessions[0];
    if (!session || session.userId !== "civac_william" || new Date(session.expiresAt) <= new Date()) {
      return fail("session");
    }

    const users = await db.select().from(usuariosTable)
      .where(eq(usuariosTable.id, session.userId)).limit(1);
    const account = users[0];
    if (!account || account.estado === "bloqueado" || account.activo === false) return fail("account");

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: req.query.code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }).toString(),
    });
    const tokenData = await tokenRes.json() as { access_token?: string };
    if (!tokenRes.ok || !tokenData.access_token) return fail("token");

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const gUser = await userInfoRes.json() as {
      id?: string; email?: string; name?: string; picture?: string; verified_email?: boolean;
    };
    const googleEmail = gUser.email?.toLowerCase().trim();
    if (!userInfoRes.ok || !gUser.id || !googleEmail || gUser.verified_email !== true) return fail("unverified");

    const matches = await db.select().from(usuariosTable)
      .where(or(eq(usuariosTable.googleId, gUser.id), eq(usuariosTable.email, googleEmail))).limit(1);
    if (matches[0] && matches[0].id !== account.id) return fail("already_linked");

    await db.transaction(async tx => {
      await tx.update(usuariosTable).set({
        email: googleEmail,
        googleId: gUser.id!,
        googleFoto: gUser.picture ?? null,
        updatedAt: new Date(),
      }).where(eq(usuariosTable.id, account.id));
      await tx.update(userSessionsTable).set({ userEmail: googleEmail })
        .where(eq(userSessionsTable.userId, account.id));
    });

    return res.redirect(`${frontendUrl}/mi-cuenta?google_linked=1`);
  } catch {
    return fail("server");
  }
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
      }).returning();

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
