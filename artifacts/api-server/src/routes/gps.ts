import { Router, type Response } from "express";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
  alertasTable,
  animalsTable,
  db,
  dispositivosGpsTable,
  geofenceAlertsTable,
  gpsTracksTable,
} from "@workspace/db";
import { authMiddleware, type AuthRequest } from "../middleware/auth";

const router = Router();
const gpsRouter = Router();

gpsRouter.use(authMiddleware);

const DEVICE_TYPES = new Set(["collar-gps", "collar-bt", "bolus", "oreja", "pedometro", "implante", "panel-solar", "camara-ia"]);
const ALERT_COOLDOWN_MS = 5 * 60 * 1000;

function userId(req: AuthRequest): string | null {
  return req.user?.userId ?? null;
}

function sendError(res: Response, status: number, message: string, details?: unknown) {
  res.status(status).json({ error: message, ...(details ? { details } : {}) });
}

function positiveInt(value: unknown): number | null {
  const text = String(value ?? "");
  if (!/^[1-9]\d*$/.test(text)) return null;
  const parsed = Number(text);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function finiteNumber(value: unknown, min: number, max: number): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

function decimalNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDeviceInput(body: Record<string, unknown>) {
  const imei = String(body.imei ?? "").trim();
  const tipo = String(body.tipo ?? "").trim();
  const fabricante = String(body.fabricante ?? "Manual").trim();
  const modelo = String(body.modelo ?? "Dispositivo GPS").trim();
  if (!imei || imei.length > 50) return { error: "El IMEI/ID es obligatorio y debe tener máximo 50 caracteres" as const };
  if (!DEVICE_TYPES.has(tipo)) return { error: "Tipo de dispositivo no válido" as const };
  if (!fabricante || !modelo) return { error: "Fabricante y modelo son obligatorios" as const };

  const animalId = body.animalId === "" || body.animalId == null ? null : String(body.animalId);
  const potreroId = body.potreroId === "" || body.potreroId == null ? null : positiveInt(body.potreroId);
  if (body.potreroId != null && body.potreroId !== "" && potreroId === null) return { error: "Potrero no válido" as const };

  return {
    value: {
      imei,
      nombre: String(body.nombre ?? `${fabricante} ${modelo}`).trim().slice(0, 120) || `${fabricante} ${modelo}`,
      tipo,
      fabricante: fabricante.slice(0, 100),
      modelo: modelo.slice(0, 100),
      protocolo: body.protocolo ? String(body.protocolo).slice(0, 50) : null,
      animalId,
      potreroId,
      bateria: decimalNumber(body.bateria),
      estado: body.estado ? String(body.estado).slice(0, 50) : "activo",
      configJson: body.configJson && typeof body.configJson === "object" ? body.configJson : null,
    },
  };
}

async function ownedDevice(req: AuthRequest, idValue: unknown) {
  const id = positiveInt(idValue);
  const owner = userId(req);
  if (!id || !owner) return null;
  const rows = await db
    .select()
    .from(dispositivosGpsTable)
    .where(and(eq(dispositivosGpsTable.id, id), eq(dispositivosGpsTable.userId, owner)))
    .limit(1);
  return rows[0] ?? null;
}

async function linkAnimal(animalId: string | null, imei: string, previousAnimalId?: string | null) {
  if (previousAnimalId && previousAnimalId !== animalId) {
    await db
      .update(animalsTable)
      .set({ gpsCollarId: "" })
      .where(and(eq(animalsTable.id, previousAnimalId), eq(animalsTable.gpsCollarId, imei)));
  }
  if (animalId) {
    await db
      .update(animalsTable)
      .set({ gpsCollarId: imei, updatedAt: new Date() })
      .where(eq(animalsTable.id, animalId));
  }
}

function toCsv(rows: Array<Record<string, unknown>>) {
  const headers = ["id", "dispositivoId", "lat", "lng", "speed", "altitude", "precision", "potreroId", "timestamp"];
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [headers.join(","), ...rows.map(row => headers.map(header => escape(row[header])).join(","))].join("\n");
}

async function maybeCreateGeofenceAlert(
  req: AuthRequest,
  device: typeof dispositivosGpsTable.$inferSelect,
  track: { lat: number; lng: number; potreroId: number | null; timestamp?: Date },
  insideGeofence: boolean | undefined,
) {
  const leftAssignedPotrero = device.potreroId != null && track.potreroId != null && device.potreroId !== track.potreroId;
  if (insideGeofence !== false && !leftAssignedPotrero) return;
  const owner = userId(req);
  if (!owner) return;

  const recent = await db
    .select({ id: geofenceAlertsTable.id })
    .from(geofenceAlertsTable)
    .where(and(
      eq(geofenceAlertsTable.dispositivoId, device.id),
      eq(geofenceAlertsTable.userId, owner),
      eq(geofenceAlertsTable.estado, "activa"),
    ))
    .orderBy(desc(geofenceAlertsTable.createdAt))
    .limit(1);
  if (recent[0]) {
    const recentRows = await db
      .select({ createdAt: geofenceAlertsTable.createdAt })
      .from(geofenceAlertsTable)
      .where(eq(geofenceAlertsTable.id, recent[0].id))
      .limit(1);
    const createdAt = recentRows[0]?.createdAt?.getTime?.() ?? 0;
    if (createdAt && Date.now() - createdAt < ALERT_COOLDOWN_MS) return;
  }

  const animalName = device.animalId
    ? (await db.select({ nombre: animalsTable.nombre }).from(animalsTable).where(eq(animalsTable.id, device.animalId)).limit(1))[0]?.nombre
    : "Animal sin asignar";
  const potreroLabel = track.potreroId == null ? "su potrero asignado" : `el potrero ${track.potreroId}`;
  const mensaje = `${animalName ?? "Animal"} salió de ${potreroLabel}. Revisa la ubicación del dispositivo ${device.imei}.`;
  await db.insert(geofenceAlertsTable).values({
    dispositivoId: device.id,
    userId: owner,
    animalId: device.animalId ?? "",
    potreroId: track.potreroId ?? device.potreroId ?? 0,
    alertType: "salida",
    lat: track.lat,
    lng: track.lng,
    estado: "activa",
    mensaje,
  });
  await db.insert(alertasTable).values({
    title: `Geovallado: ${animalName ?? "Animal"} fuera de zona`,
    desc: mensaje,
    type: "danger",
    time: "Ahora",
    resolved: false,
  });
}

// GET /api/gps/dispositivos
gpsRouter.get("/dispositivos", async (req: AuthRequest, res) => {
  const owner = userId(req);
  if (!owner) return sendError(res, 401, "Sesión requerida");
  try {
    const devices = await db
      .select()
      .from(dispositivosGpsTable)
      .where(eq(dispositivosGpsTable.userId, owner))
      .orderBy(asc(dispositivosGpsTable.id));
    res.json({ devices });
  } catch (error) {
    sendError(res, 500, "No se pudieron cargar los dispositivos", error instanceof Error ? error.message : error);
  }
});

// POST /api/gps/dispositivos
gpsRouter.post("/dispositivos", async (req: AuthRequest, res) => {
  const owner = userId(req);
  if (!owner) return sendError(res, 401, "Sesión requerida");
  const normalized = normalizeDeviceInput(req.body as Record<string, unknown>);
  if ("error" in normalized) return sendError(res, 400, normalized.error);
  try {
    const existing = await db.select({ id: dispositivosGpsTable.id }).from(dispositivosGpsTable).where(eq(dispositivosGpsTable.imei, normalized.value.imei)).limit(1);
    if (existing[0]) return sendError(res, 409, "Ya existe un dispositivo con ese IMEI/ID");
    const [device] = await db.insert(dispositivosGpsTable).values({ ...normalized.value, userId: owner }).returning();
    await linkAnimal(device.animalId, device.imei);
    res.status(201).json({ device });
  } catch (error) {
    sendError(res, 500, "No se pudo registrar el dispositivo", error instanceof Error ? error.message : error);
  }
});

// PATCH /api/gps/dispositivos/:id
gpsRouter.patch("/dispositivos/:id", async (req: AuthRequest, res) => {
  const device = await ownedDevice(req, req.params.id);
  if (!device) return sendError(res, 404, "Dispositivo no encontrado");
  const body = req.body as Record<string, unknown>;
  const nextAnimalId = body.animalId === "" || body.animalId == null ? null : String(body.animalId);
  const nextPotreroId = body.potreroId === "" || body.potreroId == null ? null : positiveInt(body.potreroId);
  if (body.potreroId != null && body.potreroId !== "" && nextPotreroId === null) return sendError(res, 400, "Potrero no válido");
  const patch: Record<string, unknown> = {
    updatedAt: new Date(),
    ...(body.nombre !== undefined ? { nombre: String(body.nombre).trim().slice(0, 120) } : {}),
    ...(body.animalId !== undefined ? { animalId: nextAnimalId } : {}),
    ...(body.potreroId !== undefined ? { potreroId: nextPotreroId } : {}),
    ...(body.estado !== undefined ? { estado: String(body.estado).slice(0, 50) } : {}),
    ...(body.bateria !== undefined ? { bateria: decimalNumber(body.bateria) } : {}),
    ...(body.configJson !== undefined ? { configJson: body.configJson } : {}),
  };
  try {
    const [updated] = await db
      .update(dispositivosGpsTable)
      .set(patch as typeof dispositivosGpsTable.$inferInsert)
      .where(and(eq(dispositivosGpsTable.id, device.id), eq(dispositivosGpsTable.userId, userId(req)!)))
      .returning();
    if (body.animalId !== undefined) await linkAnimal(nextAnimalId, device.imei, device.animalId);
    res.json({ device: updated });
  } catch (error) {
    sendError(res, 500, "No se pudo actualizar el dispositivo", error instanceof Error ? error.message : error);
  }
});

// DELETE /api/gps/dispositivos/:id
gpsRouter.delete("/dispositivos/:id", async (req: AuthRequest, res) => {
  const device = await ownedDevice(req, req.params.id);
  if (!device) return sendError(res, 404, "Dispositivo no encontrado");
  try {
    await db.delete(gpsTracksTable).where(eq(gpsTracksTable.dispositivoId, device.id));
    await db.delete(geofenceAlertsTable).where(and(eq(geofenceAlertsTable.dispositivoId, device.id), eq(geofenceAlertsTable.userId, userId(req)!)));
    await db.delete(dispositivosGpsTable).where(and(eq(dispositivosGpsTable.id, device.id), eq(dispositivosGpsTable.userId, userId(req)!)));
    await linkAnimal(null, device.imei, device.animalId);
    res.json({ ok: true });
  } catch (error) {
    sendError(res, 500, "No se pudo eliminar el dispositivo", error instanceof Error ? error.message : error);
  }
});

// POST /api/gps/tracks — accepts one breadcrumb or a batch.
gpsRouter.post("/tracks", async (req: AuthRequest, res) => {
  const owner = userId(req);
  if (!owner) return sendError(res, 401, "Sesión requerida");
  const raw = req.body as Record<string, unknown>;
  const input = Array.isArray(raw.tracks) ? raw.tracks : [raw];
  if (input.length === 0 || input.length > 250) return sendError(res, 400, "El lote debe contener entre 1 y 250 puntos");
  try {
    const grouped = new Map<number, { device: typeof dispositivosGpsTable.$inferSelect; rows: Array<Record<string, unknown>> }>();
    for (const item of input) {
      const dispositivoId = positiveInt(item.dispositivoId);
      const lat = finiteNumber(item.lat, -90, 90);
      const lng = finiteNumber(item.lng, -180, 180);
      if (!dispositivoId || lat === null || lng === null) return sendError(res, 400, "Cada punto debe tener dispositivoId, latitud y longitud válidos");
      const device = await ownedDevice(req, dispositivoId);
      if (!device) return sendError(res, 404, `Dispositivo ${dispositivoId} no encontrado`);
      const potreroId = item.potreroId == null || item.potreroId === "" ? null : positiveInt(item.potreroId);
      if (item.potreroId != null && item.potreroId !== "" && potreroId === null) return sendError(res, 400, "Potrero no válido");
      const timestamp = item.timestamp ? new Date(String(item.timestamp)) : new Date();
      if (Number.isNaN(timestamp.getTime())) return sendError(res, 400, "Timestamp no válido");
      const row = {
        dispositivoId,
        lat,
        lng,
        speed: decimalNumber(item.speed),
        altitude: decimalNumber(item.altitude),
        precision: decimalNumber(item.precision ?? item.accuracy),
        potreroId,
        timestamp,
        rawData: item.rawData && typeof item.rawData === "object" ? item.rawData : null,
      };
      const current = grouped.get(dispositivoId) ?? { device, rows: [] };
      current.rows.push(row);
      grouped.set(dispositivoId, current);
    }

    const created: unknown[] = [];
    for (const { device, rows } of grouped.values()) {
      const inserted = await db.insert(gpsTracksTable).values(rows as typeof gpsTracksTable.$inferInsert[]).returning();
      created.push(...inserted);
      const latest = rows[rows.length - 1];
      await db.update(dispositivosGpsTable).set({
        lat: latest.lat,
        lng: latest.lng,
        speed: latest.speed,
        altitude: latest.altitude,
        precision: latest.precision,
        potreroId: latest.potreroId,
        ultimaSenial: latest.timestamp,
        ...(raw.bateria !== undefined ? { bateria: decimalNumber(raw.bateria) } : {}),
        estado: "activo",
        updatedAt: new Date(),
      }).where(and(eq(dispositivosGpsTable.id, device.id), eq(dispositivosGpsTable.userId, owner)));
      await maybeCreateGeofenceAlert(req, device, latest as { lat: number; lng: number; potreroId: number | null; timestamp: Date }, raw.insideGeofence === false ? false : undefined);
    }
    res.status(201).json({ tracks: created, count: created.length });
  } catch (error) {
    sendError(res, 500, "No se pudieron guardar los puntos GPS", error instanceof Error ? error.message : error);
  }
});

// GET /api/gps/tracks/:deviceId?limit=100&offset=0&format=csv
gpsRouter.get("/tracks/:deviceId", async (req: AuthRequest, res) => {
  const device = await ownedDevice(req, req.params.deviceId);
  if (!device) return sendError(res, 404, "Dispositivo no encontrado");
  const rawLimit = Number(req.query.limit ?? 100);
  const rawOffset = Number(req.query.offset ?? 0);
  const limit = Number.isInteger(rawLimit) ? Math.max(1, Math.min(rawLimit, 1000)) : 100;
  const offset = Number.isInteger(rawOffset) ? Math.max(0, rawOffset) : 0;
  try {
    const [tracks, totalRows] = await Promise.all([
      db.select().from(gpsTracksTable)
        .where(eq(gpsTracksTable.dispositivoId, device.id))
        .orderBy(desc(gpsTracksTable.timestamp))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(gpsTracksTable).where(eq(gpsTracksTable.dispositivoId, device.id)),
    ]);
    const total = Number(totalRows[0]?.count ?? 0);
    const mapped = tracks.map(track => ({
      ...track,
      lat: Number(track.lat),
      lng: Number(track.lng),
      speed: track.speed == null ? null : Number(track.speed),
      altitude: track.altitude == null ? null : Number(track.altitude),
      precision: track.precision == null ? null : Number(track.precision),
    }));
    if (req.query.format === "csv") {
      res.type("text/csv").send(toCsv(mapped as Array<Record<string, unknown>>));
      return;
    }
    res.json({ tracks: mapped, total, limit, offset, hasMore: offset + tracks.length < total });
  } catch (error) {
    sendError(res, 500, "No se pudo cargar el historial GPS", error instanceof Error ? error.message : error);
  }
});

// GET /api/gps/geofence-alerts
gpsRouter.get("/geofence-alerts", async (req: AuthRequest, res) => {
  const owner = userId(req);
  if (!owner) return sendError(res, 401, "Sesión requerida");
  try {
    const alerts = await db.select().from(geofenceAlertsTable)
      .where(eq(geofenceAlertsTable.userId, owner))
      .orderBy(desc(geofenceAlertsTable.createdAt))
      .limit(100);
    res.json({ alerts });
  } catch (error) {
    sendError(res, 500, "No se pudieron cargar las alertas GPS", error instanceof Error ? error.message : error);
  }
});

export default gpsRouter;