import { Router } from "express";

const router = Router();

/* ── In-memory telemetry store (persists while server is up) ─────────────── */
export interface TelemetryEvent {
  id:         string;
  ts:         string;
  type:       "connection"|"error"|"weighing"|"usage"|"driver"|"pwa"|"session"|"report";
  userId?:    string;
  userEmail?: string;
  deviceId?:  string;
  deviceName?:string;
  module?:    string;
  event:      string;
  data?:      Record<string, unknown>;
  ua?:        string;
  severity?:  "info"|"warn"|"error";
  platform?:  string;
  version?:   string;
}

const events: TelemetryEvent[] = [];
const MAX = 1000;

function addEvent(ev: Omit<TelemetryEvent,"id"|"ts">): TelemetryEvent {
  const entry: TelemetryEvent = {
    ...ev,
    id: `tel_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    ts: new Date().toISOString(),
    severity: ev.severity ?? "info",
  };
  events.unshift(entry);
  if (events.length > MAX) events.splice(MAX);
  return entry;
}

/* ── POST /api/telemetry — registrar evento ──────────────────────────────── */
router.post("/telemetry", (req, res) => {
  try {
    const { type, event } = req.body;
    if (!type || !event) {
      return res.status(400).json({ error: "type y event son requeridos" });
    }
    const entry = addEvent(req.body as Omit<TelemetryEvent,"id"|"ts">);
    res.json({ ok: true, id: entry.id });
  } catch (err) {
    res.status(500).json({ error: "Error guardando evento", detail: String(err) });
  }
});

/* ── POST /api/telemetry/batch — múltiples eventos ───────────────────────── */
router.post("/telemetry/batch", (req, res) => {
  try {
    const { items } = req.body as { items: Array<Omit<TelemetryEvent,"id"|"ts">> };
    if (!Array.isArray(items)) return res.status(400).json({ error: "items debe ser array" });
    const results = items.slice(0, 50).map(it => addEvent(it));
    res.json({ ok: true, count: results.length, ids: results.map(r => r.id) });
  } catch (err) {
    res.status(500).json({ error: "Error en batch telemetría", detail: String(err) });
  }
});

/* ── GET /api/telemetry — listar eventos ─────────────────────────────────── */
router.get("/telemetry", (req, res) => {
  try {
    const limit    = Math.min(parseInt(String(req.query.limit    ?? "100"), 10), 500);
    const type     = req.query.type     as string | undefined;
    const userId   = req.query.userId   as string | undefined;
    const severity = req.query.severity as string | undefined;
    const module   = req.query.module   as string | undefined;
    const since    = req.query.since    as string | undefined;

    let filtered = events;
    if (type)     filtered = filtered.filter(e => e.type     === type);
    if (userId)   filtered = filtered.filter(e => e.userId   === userId);
    if (severity) filtered = filtered.filter(e => e.severity === severity);
    if (module)   filtered = filtered.filter(e => e.module   === module);
    if (since)    filtered = filtered.filter(e => e.ts >= since);

    res.json({ ok: true, events: filtered.slice(0, limit), total: filtered.length });
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo telemetría", detail: String(err) });
  }
});

/* ── GET /api/telemetry/stats — estadísticas ─────────────────────────────── */
router.get("/telemetry/stats", (req, res) => {
  try {
    const byType:     Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byModule:   Record<string, number> = {};
    const byUser:     Record<string, number> = {};
    const errors: TelemetryEvent[] = [];

    for (const e of events) {
      byType[e.type]               = (byType[e.type]               ?? 0) + 1;
      bySeverity[e.severity ?? "info"] = (bySeverity[e.severity ?? "info"] ?? 0) + 1;
      if (e.module) byModule[e.module] = (byModule[e.module] ?? 0) + 1;
      if (e.userId) byUser[e.userId]   = (byUser[e.userId]   ?? 0) + 1;
      if (e.severity === "error") errors.push(e);
    }

    const topModules = Object.entries(byModule).sort((a,b) => b[1]-a[1]).slice(0,10);
    const topUsers   = Object.entries(byUser).sort((a,b) => b[1]-a[1]).slice(0,10);

    res.json({
      ok: true, total: events.length,
      byType, bySeverity, byModule, byUser,
      topModules, topUsers,
      recentErrors: errors.slice(0, 20),
      lastEvent: events[0] ?? null,
    });
  } catch (err) {
    res.status(500).json({ error: "Error calculando estadísticas", detail: String(err) });
  }
});

/* ── DELETE /api/telemetry — limpiar eventos ─────────────────────────────── */
router.delete("/telemetry", (req, res) => {
  try {
    const count = events.length;
    events.splice(0);
    res.json({ ok: true, removed: count });
  } catch (err) {
    res.status(500).json({ error: "Error limpiando telemetría", detail: String(err) });
  }
});

export default router;
