import { Router } from "express";
import { and, desc, eq, gt, isNull, or } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import { db, codigosActivacionTable, usuariosTable, planAsignacionesTable, auditLogTable } from "@workspace/db";
import { adminOnlyMiddleware, authMiddleware, type AuthRequest } from "../middleware/auth";

const router = Router();
const WILLIAM_EMAIL = "williamtoroparrado@gmail.com";

/* ── Generar código único ─────────────────────────────────────────────────── */
function genCodigo(planCode: string): string {
  const plan = planCode.slice(0, 4).toUpperCase();
  const rand = randomBytes(12).toString("hex").toUpperCase();
  return `CIVAC-${plan}-${rand}`;
}

/* ── POST /api/codigos ── crear nuevo código de activación ────────────────── */
router.post("/codigos", authMiddleware, adminOnlyMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      planCode = "basico",
      diasPlan = 30,
      sessionLimit = 1,
      maxAnimales = 50,
      maxUsuarios = 1,
      notas = "",
      creadoPor = "admin",
      expiresInDias,
    } = req.body as {
      planCode?: string; diasPlan?: number; sessionLimit?: number;
      maxAnimales?: number; maxUsuarios?: number; notas?: string;
      creadoPor?: string; expiresInDias?: number;
    };
    if (!["basico", "pro", "premium", "platino"].includes(planCode)) {
      return res.status(400).json({ error: "Plan inválido." });
    }
    if (!Number.isInteger(diasPlan) || diasPlan < 1 || diasPlan > 3650) {
      return res.status(400).json({ error: "La duración debe estar entre 1 y 3650 días." });
    }

    const codigo = genCodigo(planCode);
    const expiresAt = expiresInDias
      ? (() => { const d = new Date(); d.setDate(d.getDate() + expiresInDias); return d; })()
      : undefined;

    try {
      const [row] = await db.insert(codigosActivacionTable).values({
        codigo, planCode, diasPlan, sessionLimit, maxAnimales, maxUsuarios,
        notas, creadoPor: req.user?.userId ?? "admin", expiresAt,
      }).returning();

      /* audit */
      try {
        await db.insert(auditLogTable).values({
          userId: req.user?.userId ?? "admin", userEmail: req.user?.email ?? "admin", userRole: req.user?.role ?? "admin",
          accion: "create_codigo", entidad: "codigo_activacion", entidadId: String(row?.id ?? 0),
          detalles: JSON.stringify({ codigo, planCode, diasPlan }),
        });
      } catch { /* skip */ }

      return res.json({ ok: true, codigo, id: row?.id });
    } catch {
      return res.status(503).json({ error: "Base de datos no disponible; no se creó el código." });
    }
  } catch (err) {
    res.status(500).json({ error: "Error creando código" });
  }
});

/* ── GET /api/codigos ── listar todos los códigos ─────────────────────────── */
router.get("/codigos", authMiddleware, adminOnlyMiddleware, async (_req, res) => {
  try {
    const rows = await db.select().from(codigosActivacionTable)
      .orderBy(desc(codigosActivacionTable.createdAt)).limit(200);
    const safeRows = rows.map(row => row.codigo.startsWith("CARD_SHA256:")
      ? { ...row, codigo: "Tarjeta de activación protegida", notas: "Acceso cliente William" }
      : row);
    res.json({ ok: true, codigos: safeRows });
  } catch {
    res.status(503).json({ error: "No fue posible cargar los códigos." });
  }
});

/* ── POST /api/codigos/william-card — crear cuenta cliente y tarjeta de acceso ─ */
router.post("/codigos/william-card", authMiddleware, adminOnlyMiddleware, async (req: AuthRequest, res) => {
  const marker = "LOGIN_CARD:WILLIAM:";
  const now = new Date();

  try {
    const issued = await db.transaction(async tx => {
      const emailOwner = await tx.select({ id: usuariosTable.id }).from(usuariosTable)
        .where(eq(usuariosTable.email, WILLIAM_EMAIL)).limit(1);
      if (emailOwner[0] && emailOwner[0].id !== "civac_william") {
        return { error: "email_conflict" as const };
      }

      const existingRows = await tx.select().from(usuariosTable)
        .where(or(
          eq(usuariosTable.id, "civac_william"),
          eq(usuariosTable.email, "william"),
          eq(usuariosTable.email, WILLIAM_EMAIL),
        )).limit(1);
      let user = existingRows[0];
      if (user && user.id !== "civac_william") {
        return { error: "account_id_conflict" as const };
      }
      if (user && ["admin", "superadmin", "developer"].includes(user.role)) {
        return { error: "privileged" as const };
      }
      if (user && (user.estado === "bloqueado" || user.activo === false)) {
        return { error: "account_unavailable" as const };
      }

      if (!user) {
        const [created] = await tx.insert(usuariosTable).values({
          id: "civac_william",
          nombre: "William",
          cargo: "Cliente CIVAC",
          finca: "CIVAC",
          email: WILLIAM_EMAIL,
          password: `CARD_ONLY:${randomBytes(32).toString("hex")}`,
          role: "cliente",
          permisos: "[]",
          planCode: "premium",
          activo: true,
          estado: "activo",
          planExpiry: new Date(now.getTime() + 30 * 86_400_000),
          planDias: 30,
          demoExpiry: null,
          demoDias: 0,
        }).returning();
        user = created;
      } else {
        const [updated] = await tx.update(usuariosTable).set({
          role: "cliente",
          nombre: "William",
          cargo: "Cliente Premium CIVAC",
          planCode: "premium",
          email: WILLIAM_EMAIL,
          planExpiry: user.planExpiry ?? new Date(now.getTime() + 30 * 86_400_000),
          planDias: user.planExpiry ? (user.planDias ?? 30) : 30,
          demoExpiry: null,
          demoDias: 0,
          ...(user.estado === "demo" ? { estado: "activo" } : {}),
          updatedAt: now,
        }).where(eq(usuariosTable.id, user.id)).returning();
        user = updated;
      }

      const codigo = `CIVAC-WILLIAM-NOVIEMBRE2026-${randomBytes(24).toString("hex").toUpperCase()}`;
      const digest = createHash("sha256").update(codigo).digest("hex");
      const expiresAt = new Date(now.getTime() + 30 * 86_400_000);
      const [row] = await tx.insert(codigosActivacionTable).values({
        codigo: `CARD_SHA256:${digest}`,
        planCode: "premium",
        diasPlan: 30,
        sessionLimit: 20,
        maxAnimales: 2000,
        maxUsuarios: 15,
        estado: "disponible",
        creadoPor: req.user?.userId ?? "admin",
        expiresAt,
        notas: `${marker}${user.id}:NOVIEMBRE2026`,
      }).returning();

      return { codigo, expiresAt, id: row.id };
    });

    if ("error" in issued) {
      if (issued.error === "account_unavailable") {
        return res.status(409).json({ error: "La cuenta está bloqueada o inactiva; no se emitió un acceso." });
      }
      if (issued.error === "email_conflict") {
        return res.status(409).json({ error: "Ese Gmail ya está asignado a otra cuenta CIVAC; no se modificó." });
      }
      if (issued.error === "account_id_conflict") {
        return res.status(409).json({ error: "El identificador heredado de William no coincide; no se modificó ninguna cuenta." });
      }
      return res.status(409).json({ error: "Ese identificador ya pertenece a una cuenta de personal; no se modificó." });
    }

    return res.json({
      ok: true,
      username: "william",
      email: WILLIAM_EMAIL,
      nombre: "William",
      role: "cliente",
      planCode: "premium",
      diasPlan: 30,
      codigo: issued.codigo,
      expiresAt: issued.expiresAt.toISOString(),
      id: issued.id,
    });
  } catch {
    return res.status(503).json({ error: "No fue posible crear la cuenta y la tarjeta en la base de datos activa." });
  }
});

/* ── POST /api/codigos/redeem ── canjear un código de activación ─────────── */
router.post("/codigos/redeem", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { codigo } = req.body as { codigo?: string };
    const sessionUser = req.user;
    if (!codigo || !sessionUser || sessionUser.role === "anonymous") {
      return res.status(400).json({ error: "Se requiere una sesión y un código." });
    }

    let found;
    try {
      const rows = await db.select().from(codigosActivacionTable)
        .where(eq(codigosActivacionTable.codigo, codigo.toUpperCase())).limit(1);
      found = rows[0];
    } catch {
      return res.status(503).json({ error: "Base de datos no disponible" });
    }

    if (!found) return res.status(404).json({ ok: false, error: "Código no encontrado" });
    if (found.notas.startsWith("LOGIN_CARD:")) {
      return res.status(403).json({ ok: false, error: "Esta tarjeta solo se canjea desde el acceso de cliente." });
    }
    if (found.estado !== "disponible") return res.status(409).json({ ok: false, error: "Código ya utilizado o expirado" });
    if (found.expiresAt && new Date(found.expiresAt) < new Date()) {
      await db.update(codigosActivacionTable).set({ estado: "expirado" }).where(eq(codigosActivacionTable.id, found.id));
      return res.status(410).json({ ok: false, error: "Código expirado" });
    }

    const users = await db.select().from(usuariosTable)
      .where(eq(usuariosTable.id, sessionUser.userId)).limit(1);
    const current = users[0];
    if (!current) return res.status(401).json({ ok: false, error: "La cuenta de la sesión no existe." });

    const now = new Date();
    const expiry = new Date(now.getTime() + found.diasPlan * 86_400_000);
    const claimed = await db.transaction(async tx => {
      const [row] = await tx.update(codigosActivacionTable).set({
        estado: "usado",
        usadoPor: current.id,
        usadoPorEmail: current.email,
        usadoPorNombre: current.nombre,
        usadoAt: now,
      }).where(and(
        eq(codigosActivacionTable.id, found.id),
        eq(codigosActivacionTable.estado, "disponible"),
        or(isNull(codigosActivacionTable.expiresAt), gt(codigosActivacionTable.expiresAt, now)),
      )).returning();
      if (!row) return false;
      await tx.update(usuariosTable).set({
        planCode: found.planCode,
        planExpiry: expiry,
        planDias: found.diasPlan,
        updatedAt: now,
      }).where(eq(usuariosTable.id, current.id));
      return true;
    });
    if (!claimed) return res.status(409).json({ ok: false, error: "Código ya utilizado o expirado" });

    /* audit */
    try {
      await db.insert(auditLogTable).values({
        userId: current.id, userEmail: current.email, userRole: current.role,
        accion: "redeem_code", entidad: "codigo_activacion", entidadId: String(found.id),
        detalles: JSON.stringify({ codigo: "redacted", planCode: found.planCode, diasPlan: found.diasPlan }),
      });
    } catch { /* skip */ }

    res.json({
      ok: true,
      planCode: found.planCode,
      diasPlan: found.diasPlan,
      sessionLimit: found.sessionLimit,
      maxAnimales: found.maxAnimales,
      message: `Plan ${found.planCode.toUpperCase()} activado por ${found.diasPlan} días`,
    });
  } catch (err) {
    res.status(500).json({ error: "Error canjeando código", detail: String(err) });
  }
});

/* ── DELETE /api/codigos/:id ── eliminar/expirar código ─────────────────── */
router.delete("/codigos/:id", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.update(codigosActivacionTable).set({ estado: "expirado" }).where(eq(codigosActivacionTable.id, id));
    res.json({ ok: true });
  } catch {
    res.status(503).json({ error: "Error eliminando código" });
  }
});

export default router;
