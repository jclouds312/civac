import { Router } from "express";
import { desc, sql } from "drizzle-orm";
import {
  db,
  syncLogTable,
  animalsTable,
  potrerosTable,
  insumosTable,
  personalTable,
  alertasTable,
  pesajesTable,
  usuariosTable,
  plansTable,
} from "@workspace/db";

const router = Router();

/* ── GET /api/admin/stats ─────────────────────────────────────────────────── */
router.get("/admin/stats", async (_req, res) => {
  try {
    const [
      animalsCount,
      potrerosCount,
      insumosCount,
      personalCount,
      alertasCount,
      pesajesCount,
      usuariosCount,
      syncsCount,
      recentSyncs,
      plansDist,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(animalsTable),
      db.select({ count: sql<number>`count(*)` }).from(potrerosTable),
      db.select({ count: sql<number>`count(*)` }).from(insumosTable),
      db.select({ count: sql<number>`count(*)` }).from(personalTable),
      db.select({ count: sql<number>`count(*)` }).from(alertasTable),
      db.select({ count: sql<number>`count(*)` }).from(pesajesTable),
      db.select({ count: sql<number>`count(*)` }).from(usuariosTable),
      db.select({ count: sql<number>`count(*)` }).from(syncLogTable),
      db.select().from(syncLogTable).orderBy(desc(syncLogTable.syncedAt)).limit(5),
      db.select({
        plan: syncLogTable.planCode,
        count: sql<number>`count(*)`,
      }).from(syncLogTable).groupBy(syncLogTable.planCode),
    ]);

    // Unique devices in last 7 days
    const activeDevices = await db
      .selectDistinct({ deviceId: syncLogTable.deviceId })
      .from(syncLogTable)
      .where(sql`${syncLogTable.syncedAt} >= now() - interval '7 days'`);

    return res.json({
      ok: true,
      stats: {
        animals:       Number(animalsCount[0]?.count  ?? 0),
        potreros:      Number(potrerosCount[0]?.count ?? 0),
        insumos:       Number(insumosCount[0]?.count  ?? 0),
        personal:      Number(personalCount[0]?.count ?? 0),
        alertas:       Number(alertasCount[0]?.count  ?? 0),
        pesajes:       Number(pesajesCount[0]?.count  ?? 0),
        usuarios:      Number(usuariosCount[0]?.count ?? 0),
        totalSyncs:    Number(syncsCount[0]?.count    ?? 0),
        activeDevices: activeDevices.length,
      },
      recentSyncs,
      planDistribution: plansDist.map(p => ({ plan: p.plan, count: Number(p.count) })),
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── GET /api/admin/clients ───────────────────────────────────────────────── */
router.get("/admin/clients", async (_req, res) => {
  try {
    // One row per unique device — latest sync per device
    const clients = await db
      .selectDistinctOn([syncLogTable.deviceId], {
        deviceId:     syncLogTable.deviceId,
        userId:       syncLogTable.userId,
        userRole:     syncLogTable.userRole,
        planCode:     syncLogTable.planCode,
        lastSyncedAt: syncLogTable.syncedAt,
        totalRecords: syncLogTable.totalRecords,
        status:       syncLogTable.status,
      })
      .from(syncLogTable)
      .orderBy(syncLogTable.deviceId, desc(syncLogTable.syncedAt));

    return res.json({ ok: true, total: clients.length, clients });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── GET /api/admin/sync-log ──────────────────────────────────────────────── */
router.get("/admin/sync-log", async (req, res) => {
  try {
    const limit  = Math.min(Number(req.query["limit"] ?? 50), 200);
    const offset = Number(req.query["offset"] ?? 0);
    const entries = await db
      .select()
      .from(syncLogTable)
      .orderBy(desc(syncLogTable.syncedAt))
      .limit(limit)
      .offset(offset);

    const total = await db.select({ count: sql<number>`count(*)` }).from(syncLogTable);

    return res.json({ ok: true, total: Number(total[0]?.count ?? 0), entries });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── GET /api/admin/plans ─────────────────────────────────────────────────── */
router.get("/admin/plans", async (_req, res) => {
  try {
    const plans = await db.select().from(plansTable).orderBy(plansTable.priceMonthly);
    return res.json({ ok: true, plans });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── GET /api/admin/health ────────────────────────────────────────────────── */
router.get("/admin/health", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    return res.json({
      ok:      true,
      status:  "healthy",
      db:      "connected",
      server:  "CIVAC Admin API v2.0",
      uptime:  process.uptime(),
      memMb:   Math.round(process.memoryUsage().rss / 1024 / 1024),
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(503).json({ ok: false, status: "degraded", error: String(err) });
  }
});

export default router;
