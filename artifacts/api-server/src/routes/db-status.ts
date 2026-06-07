/**
 * /api/db/status — Estado del Code Gateway (PG vs SQLite)
 * /api/db/info   — Información detallada de la BD local SQLite
 * /api/db/reconnect — Forzar reconexión a PostgreSQL
 * /api/db/sync-queue — Ver cola de sincronización pendiente
 */
import { Router } from "express";
import { initGateway, getGatewayState } from "@workspace/db";

const router = Router();

/** GET /api/db/status — estado resumido del gateway */
router.get("/db/status", async (_req, res) => {
  try {
    const gw    = await initGateway();
    const state = gw.state;
    const alive = await gw.ping();

    res.json({
      ok:      true,
      mode:    state.mode,
      alive,
      pgAvailable:     state.pgAvailable,
      sqliteAvailable: state.sqliteAvailable,
      pgUrl:           state.pgUrl,
      sqlitePath:      state.sqlitePath,
      lastCheck:       state.lastCheck,
      errorMsg:        state.errorMsg,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/** GET /api/db/info — info detallada de SQLite (tablas, tamaño, versión) */
router.get("/db/info", async (_req, res) => {
  try {
    const gw = await initGateway();
    if (gw.mode !== "sqlite") {
      const state = await getGatewayState();
      return res.json({ ok: true, mode: gw.mode, message: "PostgreSQL activo — SQLite no es la BD principal.", state });
    }

    const { getSqliteInfo } = await import("@workspace/db");
    const info = getSqliteInfo();

    res.json({ ok: true, mode: "sqlite", ...info });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/** POST /api/db/reconnect — intenta reconectar a PostgreSQL */
router.post("/db/reconnect", async (_req, res) => {
  try {
    const gw      = await initGateway();
    const success = await gw.reconnect();
    const newGw   = await initGateway();

    res.json({
      ok:      true,
      success,
      mode:    newGw.mode,
      message: success
        ? "Reconectado a PostgreSQL exitosamente"
        : `Reconexión fallida — modo activo: ${newGw.mode}`,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/** GET /api/db/sync-queue — cola de operaciones pendientes de sincronizar */
router.get("/db/sync-queue", async (_req, res) => {
  try {
    const gw = await initGateway();
    if (gw.mode !== "sqlite") {
      return res.json({ ok: true, mode: gw.mode, pendientes: 0, items: [], message: "PostgreSQL activo — sin cola de sincronización." });
    }

    const { getRawSqlite } = await import("@workspace/db");
    const db = getRawSqlite();
    const pendientes = db.prepare(
      "SELECT id, operacion, tabla, entidad_id, intentos, estado, created_at FROM sync_queue WHERE estado = 'pendiente' ORDER BY id LIMIT 100"
    ).all();

    const total = (db.prepare("SELECT COUNT(*) as n FROM sync_queue WHERE estado='pendiente'").get() as { n: number }).n;

    res.json({ ok: true, mode: "sqlite", pendientes: total, items: pendientes });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/** GET /api/db/meta — metadatos internos de la BD local */
router.get("/db/meta", async (_req, res) => {
  try {
    const gw = await initGateway();
    if (gw.mode !== "sqlite") {
      return res.json({ ok: true, mode: gw.mode, meta: {} });
    }
    const { getRawSqlite } = await import("@workspace/db");
    const rows = getRawSqlite().prepare("SELECT key, value, updated_at FROM db_meta").all();
    const meta = Object.fromEntries((rows as { key: string; value: string; updated_at: string }[]).map(r => [r.key, r.value]));
    res.json({ ok: true, mode: "sqlite", meta });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
