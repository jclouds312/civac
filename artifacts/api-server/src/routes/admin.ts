import { Router } from "express";
import { desc, eq, sql } from "drizzle-orm";
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
  tramaLogsTable,
  appVersionsTable,
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

/* ── DELETE /api/admin/sync-log/:id — delete single sync record ──────────── */
router.delete("/admin/sync-log/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    await db.delete(syncLogTable).where(eq(syncLogTable.id, id));
    return res.json({ ok: true, message: `Sync log #${id} deleted` });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── DELETE /api/admin/sync-log — bulk delete sync records ──────────────── */
router.delete("/admin/sync-log", async (req, res) => {
  try {
    const { before, deviceId } = req.query as { before?: string; deviceId?: string };
    if (deviceId) {
      await db.delete(syncLogTable).where(eq(syncLogTable.deviceId, deviceId));
      return res.json({ ok: true, message: `Sync logs for device ${deviceId} deleted` });
    }
    if (before) {
      await db.delete(syncLogTable).where(sql`${syncLogTable.syncedAt} < ${before}::timestamp`);
      return res.json({ ok: true, message: `Sync logs before ${before} deleted` });
    }
    await db.delete(syncLogTable);
    return res.json({ ok: true, message: "All sync logs deleted" });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── GET /api/admin/users — list all users ───────────────────────────────── */
router.get("/admin/users", async (_req, res) => {
  try {
    const users = await db.select().from(usuariosTable).orderBy(usuariosTable.id);
    return res.json({ ok: true, total: users.length, users });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── PUT /api/admin/users/:id/plan — update user plan ───────────────────── */
router.put("/admin/users/:id/plan", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const { plan } = req.body as { plan: string };
    if (!["basico","pro","premium","platino"].includes(plan))
      return res.status(400).json({ ok: false, message: "Invalid plan" });
    const [row] = await db
      .update(usuariosTable)
      .set({ plan } as any)
      .where(eq(usuariosTable.id, id))
      .returning();
    return res.json({ ok: true, user: row });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── POST /api/admin/broadcast — broadcast message to all users ──────────── */
router.post("/admin/broadcast", async (req, res) => {
  try {
    const { titulo, mensaje, tipo = "info", planFilter } = req.body as {
      titulo: string; mensaje: string; tipo?: string; planFilter?: string;
    };
    if (!titulo || !mensaje)
      return res.status(400).json({ ok: false, message: "titulo and mensaje are required" });

    // Record the broadcast as an alert visible to all users
    const [row] = await db.insert(alertasTable).values({
      tipo: "sistema" as any,
      titulo: `[ADMIN] ${titulo}`,
      mensaje,
      severidad: tipo === "urgente" ? "alta" : tipo === "advertencia" ? "media" : "baja",
      resuelta: false,
      animalId: "",
      fincaId: "all",
    } as any).returning();

    return res.json({ ok: true, broadcast: row, message: "Broadcast sent to all users" });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── GET /api/admin/tramas — trama log overview ──────────────────────────── */
router.get("/admin/tramas", async (req, res) => {
  try {
    const limit  = Math.min(Number(req.query["limit"]  ?? 100), 500);
    const offset = Number(req.query["offset"] ?? 0);
    const rows = await db.select().from(tramaLogsTable)
      .orderBy(desc(tramaLogsTable.createdAt))
      .limit(limit).offset(offset);
    const countRows = await db.select({ count: sql<number>`count(*)` }).from(tramaLogsTable);
    return res.json({ ok: true, total: Number(countRows[0]?.count ?? 0), rows });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── DELETE /api/admin/tramas — bulk delete trama logs (admin) ───────────── */
router.delete("/admin/tramas", async (_req, res) => {
  try {
    await db.delete(tramaLogsTable);
    return res.json({ ok: true, message: "All trama logs deleted" });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── GET /api/admin/versions — list app versions by plan ────────────────── */
router.get("/admin/versions", async (_req, res) => {
  try {
    const versions = await db.select().from(appVersionsTable)
      .orderBy(desc(appVersionsTable.createdAt));
    return res.json({ ok: true, total: versions.length, versions });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── POST /api/admin/versions — create/register new version ─────────────── */
router.post("/admin/versions", async (req, res) => {
  try {
    const {
      version, nombre, descripcion = "", changelog = "",
      planReq = "basico", downloadUrl = "", fileName = "",
      fileSizeKb = 0, buildDate = new Date().toISOString().slice(0,10),
      active = true,
    } = req.body as Record<string, any>;
    if (!version || !nombre)
      return res.status(400).json({ ok: false, message: "version and nombre are required" });
    const [row] = await db.insert(appVersionsTable).values({
      version: String(version), nombre: String(nombre),
      descripcion: String(descripcion), changelog: String(changelog),
      planReq: String(planReq), downloadUrl: String(downloadUrl),
      fileName: String(fileName), fileSizeKb: Number(fileSizeKb),
      buildDate: String(buildDate), active: Boolean(active),
    }).returning();
    return res.status(201).json({ ok: true, version: row });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── PUT /api/admin/versions/:id — update version ───────────────────────── */
router.put("/admin/versions/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const updates = req.body as Partial<typeof appVersionsTable.$inferInsert>;
    const [row] = await db.update(appVersionsTable).set(updates).where(eq(appVersionsTable.id, id)).returning();
    return res.json({ ok: true, version: row });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── DELETE /api/admin/versions/:id — delete version ────────────────────── */
router.delete("/admin/versions/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    await db.delete(appVersionsTable).where(eq(appVersionsTable.id, id));
    return res.json({ ok: true, message: `Version #${id} deleted` });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── GET /api/admin/versions/:id/download — increment download counter ───── */
router.get("/admin/versions/:id/download", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const planCode = (req.query["plan"] as string) || "basico";
    const [ver] = await db.select().from(appVersionsTable).where(eq(appVersionsTable.id, id));
    if (!ver) return res.status(404).json({ ok: false, message: "Version not found" });

    const planOrder: Record<string,number> = { basico:0, pro:1, premium:2, platino:3 };
    if ((planOrder[planCode] ?? -1) < (planOrder[ver.planReq] ?? 99))
      return res.status(403).json({ ok: false, message: `Plan ${ver.planReq} required` });

    await db.update(appVersionsTable)
      .set({ downloads: ver.downloads + 1 })
      .where(eq(appVersionsTable.id, id));

    if (ver.downloadUrl) {
      return res.json({ ok: true, downloadUrl: ver.downloadUrl, version: ver.version, nombre: ver.nombre });
    }
    return res.json({ ok: true, version: ver.version, nombre: ver.nombre, message: "No download URL configured" });
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
