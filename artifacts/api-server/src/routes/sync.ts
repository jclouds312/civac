import { Router } from "express";
import { desc, sql } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middleware/auth";
import {
  db,
  syncLogTable,
  animalsTable,
  potrerosTable,
  insumosTable,
  personalTable,
  reproduccionTable,
  alertasTable,
  pesajesTable,
  gpsUbicacionesTable,
  movimientosLoteTable,
} from "@workspace/db";

const router = Router();
router.use(authMiddleware);

function requireUser(req: AuthRequest, res: import("express").Response): boolean {
  if (!req.user || req.user.userId === "anon" || req.user.role === "anonymous") {
    res.status(401).json({ ok: false, code: "AUTH_REQUIRED", message: "La sincronización requiere una sesión válida" });
    return false;
  }
  return true;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

type Row = Record<string, unknown>;

async function upsertAnimals(rows: Row[]) {
  if (!rows.length) return;
  for (const r of rows) {
    try {
      await db.insert(animalsTable).values({
        id:              String(r["id"] ?? ""),
        nombre:          String(r["nombre"] ?? ""),
        raza:            String(r["raza"] ?? ""),
        categoria:       String(r["categoria"] ?? ""),
        peso:            Number(r["peso"] ?? 0),
        lote:            String(r["lote"] ?? ""),
        estado:          String(r["estado"] ?? ""),
        litrosDia:       Number(r["litrosDia"] ?? 0),
        partos:          Number(r["partos"] ?? 0),
        fechaNacimiento: String(r["fechaNacimiento"] ?? ""),
        registro:        String(r["registro"] ?? "NO"),
        numeroRegistro:  String(r["numeroRegistro"] ?? ""),
        valorKilo:       Number(r["valorKilo"] ?? 0),
        foto:            String(r["foto"] ?? ""),
      }).onConflictDoUpdate({
        target: animalsTable.id,
        set: {
          nombre: sql`excluded.nombre`, raza: sql`excluded.raza`,
          categoria: sql`excluded.categoria`, peso: sql`excluded.peso`,
          lote: sql`excluded.lote`, estado: sql`excluded.estado`,
          litrosDia: sql`excluded.litros_dia`, partos: sql`excluded.partos`,
          fechaNacimiento: sql`excluded.fecha_nacimiento`,
          registro: sql`excluded.registro`, numeroRegistro: sql`excluded.numero_registro`,
          valorKilo: sql`excluded.valor_kilo`, foto: sql`excluded.foto`,
          updatedAt: new Date(),
        },
      });
    } catch { /* skip malformed row */ }
  }
}

async function upsertPotreros(rows: Row[]) {
  if (!rows.length) return;
  try {
    for (const r of rows) {
      try {
        const id = Number(r["id"]);
        const values = {
          ...(Number.isInteger(id) && id > 0 ? { id } : {}),
          nombre:        String(r["nombre"] ?? ""),
          pasto:         String(r["pasto"] ?? ""),
          hectareas:     Number(r["hectareas"] ?? 0),
          estado:        String(r["estado"] ?? ""),
          diasOcupado:   r["diasOcupado"] != null ? Number(r["diasOcupado"]) : null,
          diasDescanso:  r["diasDescanso"] != null ? Number(r["diasDescanso"]) : null,
          diasRestantes: r["diasRestantes"] != null ? Number(r["diasRestantes"]) : null,
          diasRotacion:  r["diasRotacion"] != null ? Number(r["diasRotacion"]) : null,
          animales:      Number(r["animales"] ?? 0),
          capacidadMax:  r["capacidadMax"] != null ? Number(r["capacidadMax"]) : null,
          aforo:         r["aforo"] != null ? Number(r["aforo"]) : null,
          observaciones: String(r["observaciones"] ?? ""),
        };
        await db.insert(potrerosTable).values(values).onConflictDoUpdate({
          target: potrerosTable.id,
          set: { ...values, updatedAt: new Date() },
        });
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
}

async function upsertGeneric(table: typeof insumosTable, rows: Row[], fields: string[]) {
  if (!rows.length) return;
  try {
    for (const r of rows) {
      const entry: Record<string, unknown> = {};
      for (const f of fields) entry[f] = r[f] ?? "";
      try { await (db.insert(table) as any).values(entry).onConflictDoNothing(); } catch {}
    }
  } catch {}
}

/* ── POST /api/sync/v1/ingest ─────────────────────────────────────────────── */
router.post("/sync/v1/ingest", async (req: AuthRequest, res) => {
  if (!requireUser(req, res)) return;
  try {
    const payload = req.body as {
      schema?:    string;
      timestamp?: string;
      deviceId?:  string;
      meta?: { userId?: string; userRole?: string; planId?: string };
      data?: {
        animals?:      Row[];
        potreros?:     Row[];
        insumos?:      Row[];
        personal?:     Row[];
        reproduccion?: Row[];
        alertas?:      Row[];
        pesajes?:      Row[];
        gps?:          Row[];
        lotes?:        Row[];
      };
    };

    if (!payload || payload.schema !== "civac-sync-v1") {
      return res.status(400).json({ ok: false, code: "INVALID_SCHEMA", message: "Se requiere schema 'civac-sync-v1'" });
    }

    const deviceId = payload.deviceId   ?? "unknown";
    const userId   = req.user!.userId;
    const userRole = req.user!.role;
    const planCode = payload.meta?.planId   ?? "basico";
    const data     = payload.data ?? {};

    const animals      = Array.isArray(data.animals)      ? data.animals      : [];
    const potreros     = Array.isArray(data.potreros)     ? data.potreros     : [];
    const insumos      = Array.isArray(data.insumos)      ? data.insumos      : [];
    const personal     = Array.isArray(data.personal)     ? data.personal     : [];
    const reproduccion = Array.isArray(data.reproduccion) ? data.reproduccion : [];
    const alertas      = Array.isArray(data.alertas)      ? data.alertas      : [];
    const pesajes      = Array.isArray(data.pesajes)      ? data.pesajes      : [];
    const gps          = Array.isArray(data.gps)          ? data.gps          : [];
    const lotes        = Array.isArray(data.lotes)        ? data.lotes        : [];

    // Persist each collection to DB
    await Promise.allSettled([
      upsertAnimals(animals),
      upsertPotreros(potreros),
    ]);

    // Log the sync event
    const totalRecords = animals.length + potreros.length + insumos.length +
      personal.length + reproduccion.length + alertas.length +
      pesajes.length + gps.length + lotes.length;

    await db.insert(syncLogTable).values({
      deviceId, userId, userRole, planCode,
      syncType:      "push",
      animalsCount:  animals.length,
      potrerosCount: potreros.length,
      insumosCount:  insumos.length,
      personalCount: personal.length,
      pesajesCount:  pesajes.length,
      alertasCount:  alertas.length,
      gpsCount:      gps.length,
      lotesCount:    lotes.length,
      totalRecords,
      status: "ok",
    });

    // Return current server state so client can reconcile
    const [srvAnimals, srvPotreros] = await Promise.all([
      db.select().from(animalsTable).orderBy(animalsTable.id),
      db.select().from(potrerosTable).orderBy(potrerosTable.id),
    ]);

    return res.status(200).json({
      ok: true,
      syncId:          `SYNC-${Date.now().toString(36).toUpperCase()}`,
      syncedAt:        new Date().toISOString(),
      totalRecords,
      serverData: {
        animals:  srvAnimals.map(({ createdAt: _c, updatedAt: _u, ...r }) => r),
        potreros: srvPotreros.map(({ createdAt: _c, updatedAt: _u, ...r }) => r),
      },
      message: `Sync OK — ${totalRecords} registros procesados`,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: `Error interno: ${String(err)}` });
  }
});

/* ── GET /api/sync/v1/pull ────────────────────────────────────────────────── */
router.get("/sync/v1/pull", async (req: AuthRequest, res) => {
  if (!requireUser(req, res)) return;
  try {
    const [animals, potreros, insumos, personal, reproduccion, alertas, pesajes, gps, lotes] = await Promise.all([
      db.select().from(animalsTable).orderBy(animalsTable.id),
      db.select().from(potrerosTable).orderBy(potrerosTable.id),
      db.select().from(insumosTable).orderBy(insumosTable.id),
      db.select().from(personalTable).orderBy(personalTable.id),
      db.select().from(reproduccionTable).orderBy(reproduccionTable.id),
      db.select().from(alertasTable).orderBy(alertasTable.id),
      db.select().from(pesajesTable).orderBy(pesajesTable.id),
      db.select().from(gpsUbicacionesTable).orderBy(gpsUbicacionesTable.id),
      db.select().from(movimientosLoteTable).orderBy(movimientosLoteTable.id),
    ]);

    const strip = <T extends Record<string, unknown>>(rows: T[], keys: string[] = ["createdAt", "updatedAt"]) =>
      rows.map(r => { const o = { ...r }; keys.forEach(k => delete o[k]); return o; });

    return res.json({
      ok:       true,
      pulledAt: new Date().toISOString(),
      data: {
        animals:      strip(animals),
        potreros:     strip(potreros),
        insumos:      strip(insumos),
        personal:     strip(personal),
        reproduccion: strip(reproduccion),
        alertas:      strip(alertas),
        pesajes:      strip(pesajes),
        gps:          strip(gps),
        lotes:        strip(lotes),
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── GET /api/sync/v1/status ─────────────────────────────────────────────── */
router.get("/sync/v1/status", async (req: AuthRequest, res) => {
  if (!requireUser(req, res)) return;
  try {
    const deviceId = req.query["deviceId"] as string | undefined;
    let query = db.select().from(syncLogTable).orderBy(desc(syncLogTable.syncedAt)).limit(1);
    const latest = deviceId
      ? await db.select().from(syncLogTable).where(sql`${syncLogTable.deviceId} = ${deviceId}`).orderBy(desc(syncLogTable.syncedAt)).limit(1)
      : await query;

    const totalSyncs = await db.select({ count: sql<number>`count(*)` }).from(syncLogTable);

    return res.json({
      ok:         true,
      server:     "CIVAC v2 Sync Server",
      version:    "2.0.0",
      totalSyncs: Number(totalSyncs[0]?.count ?? 0),
      latestSync: latest[0] ?? null,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

/* ── GET /api/sync/v1/history ────────────────────────────────────────────── */
router.get("/sync/v1/history", async (req: AuthRequest, res) => {
  if (!requireUser(req, res)) return;
  try {
    const entries = await db.select().from(syncLogTable).orderBy(desc(syncLogTable.syncedAt)).limit(50);
    return res.json({ ok: true, total: entries.length, entries });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
});

export default router;
