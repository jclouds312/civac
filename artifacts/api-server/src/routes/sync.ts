import { Router } from "express";

const router = Router();

/* ── CIVAC v1 — Sync Ingest Endpoint ─────────────────────────────────────────
   POST /api/sync/v1/ingest
   Receives the complete offline payload from the PWA and stores/processes it.
   ─────────────────────────────────────────────────────────────────────────── */

const receivedPayloads: unknown[] = [];

router.post("/sync/v1/ingest", (req, res) => {
  try {
    const payload = req.body;

    if (!payload || payload.schema !== "civac-sync-v1") {
      return res.status(400).json({
        ok: false,
        code: "INVALID_SCHEMA",
        message: "Se requiere schema 'civac-sync-v1'",
      });
    }

    const deviceId  = payload.deviceId   ?? "unknown";
    const userId    = payload.meta?.userId ?? "unknown";
    const planId    = payload.meta?.planId ?? "basico";
    const records   = payload.meta?.totalRecords ?? 0;
    const timestamp = payload.timestamp ?? new Date().toISOString();

    receivedPayloads.push({
      receivedAt: new Date().toISOString(),
      deviceId, userId, planId, records, timestamp,
      summary: {
        accounts:  (payload.data?.accounts  ?? []).length,
        animals:   (payload.data?.animals   ?? []).length,
        pesajes:   (payload.data?.pesajes   ?? []).length,
        alertas:   (payload.data?.alertas   ?? []).length,
        contacts:  (payload.data?.contacts_crm ?? []).length,
        sales:     (payload.data?.sales_crm ?? []).length,
        payments:  (payload.data?.payments  ?? []).length,
      },
    });

    return res.status(200).json({
      ok: true,
      syncId: `SYNC-${Date.now().toString(36).toUpperCase()}`,
      receivedAt: new Date().toISOString(),
      recordsProcessed: records,
      message: `Sincronización exitosa — ${records} registros recibidos del dispositivo ${deviceId}`,
      next_sync_in: 3600,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Error interno al procesar sync" });
  }
});

/* GET /api/sync/v1/status — Check sync status for a device */
router.get("/sync/v1/status", (req, res) => {
  const deviceId = req.query["deviceId"] as string | undefined;
  const entries = deviceId
    ? receivedPayloads.filter((p: any) => p.deviceId === deviceId)
    : receivedPayloads;

  return res.json({
    ok: true,
    server: "CIVAC v1 Sync Server",
    version: "1.0.0",
    totalSyncs: receivedPayloads.length,
    latestSync: entries.length > 0 ? entries[entries.length - 1] : null,
  });
});

/* GET /api/sync/v1/history — Last N sync events */
router.get("/sync/v1/history", (_req, res) => {
  return res.json({
    ok: true,
    total: receivedPayloads.length,
    entries: receivedPayloads.slice(-20).reverse(),
  });
});

export default router;
