import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db, auditLogTable } from "@workspace/db";

const router = Router();

/* ── GET /api/audit ── listar entradas del audit log ─────────────────────── */
router.get("/audit", async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? "100"), 10), 500);
    const rows = await db.select().from(auditLogTable)
      .orderBy(desc(auditLogTable.createdAt))
      .limit(limit);
    res.json({ ok: true, entries: rows });
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo audit log", detail: String(err) });
  }
});

/* ── GET /api/audit/user/:userId ── audit de un usuario específico ──────── */
router.get("/audit/user/:userId", async (req, res) => {
  try {
    const rows = await db.select().from(auditLogTable)
      .where(eq(auditLogTable.userId, req.params.userId))
      .orderBy(desc(auditLogTable.createdAt))
      .limit(50);
    res.json({ ok: true, entries: rows });
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo audit del usuario", detail: String(err) });
  }
});

/* ── POST /api/audit ── registrar entrada de audit ──────────────────────── */
router.post("/audit", async (req, res) => {
  try {
    const { userId, userEmail, userRole, accion, entidad, entidadId, detalles, ipAddress } = req.body;
    if (!userId || !accion) return res.status(400).json({ error: "userId y accion requeridos" });

    const [row] = await db.insert(auditLogTable).values({
      userId, userEmail: userEmail ?? userId, userRole: userRole ?? "",
      accion, entidad: entidad ?? "", entidadId: entidadId ?? "",
      detalles: typeof detalles === "object" ? JSON.stringify(detalles) : (detalles ?? "{}"),
      ipAddress: ipAddress ?? (req.ip ?? ""),
    }).returning();

    res.json({ ok: true, id: row?.id });
  } catch (err) {
    res.status(500).json({ error: "Error registrando audit", detail: String(err) });
  }
});

export default router;
