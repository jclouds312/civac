import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, codigosActivacionTable, usuariosTable, planAsignacionesTable, auditLogTable } from "@workspace/db";

const router = Router();

/* ── Generar código único ─────────────────────────────────────────────────── */
function genCodigo(planCode: string): string {
  const plan = planCode.slice(0, 4).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CIVAC-${plan}-${rand}`;
}

/* ── POST /api/codigos ── crear nuevo código de activación ────────────────── */
router.post("/codigos", async (req, res) => {
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

    const codigo = genCodigo(planCode);
    const expiresAt = expiresInDias
      ? (() => { const d = new Date(); d.setDate(d.getDate() + expiresInDias); return d; })()
      : undefined;

    try {
      const [row] = await db.insert(codigosActivacionTable).values({
        codigo, planCode, diasPlan, sessionLimit, maxAnimales, maxUsuarios,
        notas, creadoPor, expiresAt,
      }).returning();

      /* audit */
      try {
        await db.insert(auditLogTable).values({
          userId: creadoPor, userEmail: creadoPor, userRole: "admin",
          accion: "create_codigo", entidad: "codigo_activacion", entidadId: String(row?.id ?? 0),
          detalles: JSON.stringify({ codigo, planCode, diasPlan }),
        });
      } catch { /* skip */ }

      return res.json({ ok: true, codigo, id: row?.id });
    } catch (dbErr) {
      /* DB not ready — return code anyway */
      return res.json({ ok: true, codigo, id: null, warning: "Código generado localmente" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error creando código", detail: String(err) });
  }
});

/* ── GET /api/codigos ── listar todos los códigos ─────────────────────────── */
router.get("/codigos", async (req, res) => {
  try {
    const rows = await db.select().from(codigosActivacionTable)
      .orderBy(desc(codigosActivacionTable.createdAt)).limit(200);
    res.json({ ok: true, codigos: rows });
  } catch (err) {
    res.status(500).json({ error: "Error listando códigos", detail: String(err) });
  }
});

/* ── POST /api/codigos/redeem ── canjear un código de activación ─────────── */
router.post("/codigos/redeem", async (req, res) => {
  try {
    const { codigo, userId, userEmail, userNombre } = req.body as {
      codigo: string; userId: string; userEmail: string; userNombre?: string;
    };
    if (!codigo || !userId) return res.status(400).json({ error: "codigo y userId requeridos" });

    let found;
    try {
      const rows = await db.select().from(codigosActivacionTable)
        .where(eq(codigosActivacionTable.codigo, codigo.toUpperCase())).limit(1);
      found = rows[0];
    } catch {
      return res.status(503).json({ error: "Base de datos no disponible" });
    }

    if (!found) return res.status(404).json({ ok: false, error: "Código no encontrado" });
    if (found.estado !== "disponible") return res.status(409).json({ ok: false, error: "Código ya utilizado o expirado" });
    if (found.expiresAt && new Date(found.expiresAt) < new Date()) {
      await db.update(codigosActivacionTable).set({ estado: "expirado" }).where(eq(codigosActivacionTable.id, found.id));
      return res.status(410).json({ ok: false, error: "Código expirado" });
    }

    /* marcar como usado */
    await db.update(codigosActivacionTable).set({
      estado: "usado",
      usadoPor: userId,
      usadoPorEmail: userEmail,
      usadoPorNombre: userNombre ?? "",
      usadoAt: new Date(),
    }).where(eq(codigosActivacionTable.id, found.id));

    /* actualizar plan del usuario en DB */
    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + found.diasPlan);
      await db.update(usuariosTable).set({
        planCode: found.planCode,
        planExpiry: expiry,
      }).where(eq(usuariosTable.id, userId));
    } catch { /* skip */ }

    /* audit */
    try {
      await db.insert(auditLogTable).values({
        userId, userEmail, userRole: "user",
        accion: "redeem_code", entidad: "codigo_activacion", entidadId: String(found.id),
        detalles: JSON.stringify({ codigo, planCode: found.planCode, diasPlan: found.diasPlan }),
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
router.delete("/codigos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.update(codigosActivacionTable).set({ estado: "expirado" }).where(eq(codigosActivacionTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error eliminando código", detail: String(err) });
  }
});

export default router;
