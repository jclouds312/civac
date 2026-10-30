import { Router } from "express";
import { desc, sql, eq, and } from "drizzle-orm";
import { db, tramaLogsTable } from "@workspace/db";

const router = Router();

/* ── POST /api/tramas — log a scale trama ────────────────────────────────── */
router.post("/tramas", async (req, res) => {
  try {
    const {
      animalId = "", animalNombre = "", peso = 0, rawTrama = "",
      tramaType = "unknown", metodo = "serial", dispositivo = "",
      puerto = "", baudRate = 9600, stable = false,
      operador = "", userId = "", planCode = "basico",
      deviceId = "", capturado = false, pesajeId,
    } = req.body as Record<string, any>;

    const [row] = await db.insert(tramaLogsTable).values({
      animalId: String(animalId),
      animalNombre: String(animalNombre),
      peso: Number(peso),
      rawTrama: String(rawTrama).slice(0, 500),
      tramaType: String(tramaType),
      metodo: String(metodo),
      dispositivo: String(dispositivo),
      puerto: String(puerto),
      baudRate: Number(baudRate),
      stable: Boolean(stable),
      operador: String(operador),
      userId: String(userId),
      planCode: String(planCode),
      deviceId: String(deviceId),
      capturado: Boolean(capturado),
      pesajeId: pesajeId ? Number(pesajeId) : undefined,
    }).returning();

    return res.status(201).json({ ok: true, trama: row });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── GET /api/tramas — get trama logs ────────────────────────────────────── */
router.get("/tramas", async (req, res) => {
  try {
    const limit  = Math.min(Number(req.query["limit"]  ?? 100), 500);
    const offset = Number(req.query["offset"] ?? 0);
    const userId = req.query["userId"] as string | undefined;
    const animalId = req.query["animalId"] as string | undefined;
    const capturado = req.query["capturado"];

    const conditions = [];
    if (userId)   conditions.push(eq(tramaLogsTable.userId, userId));
    if (animalId) conditions.push(eq(tramaLogsTable.animalId, animalId));
    if (capturado !== undefined) conditions.push(eq(tramaLogsTable.capturado, capturado === "true"));

    const query = db.select().from(tramaLogsTable)
      .orderBy(desc(tramaLogsTable.createdAt))
      .limit(limit).offset(offset);

    const rows = conditions.length > 0
      ? await db.select().from(tramaLogsTable)
          .where(and(...conditions))
          .orderBy(desc(tramaLogsTable.createdAt))
          .limit(limit).offset(offset)
      : await query;

    const countRows = await db.select({ count: sql<number>`count(*)` }).from(tramaLogsTable);
    const total = Number(countRows[0]?.count ?? 0);

    return res.json({ ok: true, total, rows });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── GET /api/tramas/stats — aggregate stats per device/user ─────────────── */
router.get("/tramas/stats", async (_req, res) => {
  try {
    const byDevice = await db
      .select({
        deviceId:     tramaLogsTable.deviceId,
        tramaType:    tramaLogsTable.tramaType,
        totalTramas:  sql<number>`count(*)`,
        capturadas:   sql<number>`count(*) filter (where ${tramaLogsTable.capturado})`,
        avgPeso:      sql<number>`round(avg(${tramaLogsTable.peso})::numeric, 1)`,
        lastSeen:     sql<string>`max(${tramaLogsTable.createdAt})`,
      })
      .from(tramaLogsTable)
      .groupBy(tramaLogsTable.deviceId, tramaLogsTable.tramaType)
      .orderBy(desc(sql`max(${tramaLogsTable.createdAt})`));

    const totals = await db.select({
      total:     sql<number>`count(*)`,
      capturadas: sql<number>`count(*) filter (where ${tramaLogsTable.capturado})`,
      avgPeso:    sql<number>`round(avg(${tramaLogsTable.peso})::numeric, 1)`,
    }).from(tramaLogsTable);

    return res.json({
      ok: true,
      totals: {
        total:      Number(totals[0]?.total      ?? 0),
        capturadas: Number(totals[0]?.capturadas ?? 0),
        avgPeso:    Number(totals[0]?.avgPeso    ?? 0),
      },
      byDevice,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── PATCH /api/tramas/:id — mark as capturado ───────────────────────────── */
router.patch("/tramas/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const { capturado, pesajeId } = req.body as { capturado?: boolean; pesajeId?: number };
    const updates: Partial<typeof tramaLogsTable.$inferInsert> = {};
    if (capturado !== undefined) updates.capturado = capturado;
    if (pesajeId  !== undefined) updates.pesajeId  = pesajeId;
    const [row] = await db.update(tramaLogsTable).set(updates).where(eq(tramaLogsTable.id, id)).returning();
    return res.json({ ok: true, trama: row });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── DELETE /api/tramas — bulk delete (admin) ────────────────────────────── */
router.delete("/tramas", async (req, res) => {
  try {
    const { userId, before } = req.query as { userId?: string; before?: string };
    if (userId) {
      await db.delete(tramaLogsTable).where(eq(tramaLogsTable.userId, userId));
    } else if (before) {
      await db.delete(tramaLogsTable).where(sql`${tramaLogsTable.createdAt} < ${before}::timestamp`);
    } else {
      await db.delete(tramaLogsTable);
    }
    return res.json({ ok: true, message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── DELETE /api/tramas/:id — delete single trama ────────────────────────── */
router.delete("/tramas/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    await db.delete(tramaLogsTable).where(eq(tramaLogsTable.id, id));
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

export default router;
