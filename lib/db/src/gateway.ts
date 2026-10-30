/**
 * CIVAC Code Gateway — Capa de acceso unificada a la base de datos.
 *
 * Estrategia automática:
 *   1. Intenta conectar a PostgreSQL (DATABASE_URL)
 *   2. Si PostgreSQL no está disponible, cambia a SQLite local
 *   3. Expone el mismo objeto `gw` en ambos casos
 *
 * Uso en rutas:
 *   import { gw, getDbMode, DbMode } from "@workspace/db/gateway";
 *   const animals = await gw.select().from(gw.schema.animalsTable);
 *
 * El objeto gateway también tiene un método `enqueue()` para encolar
 * operaciones pendientes de sincronización cuando se trabaja offline.
 */

import pg from "pg";
import { drizzle as pgDrizzle } from "drizzle-orm/node-postgres";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as pgSchema from "./schema/index.js";
import * as sqliteSchema from "./sqlite-schema.js";

const { Pool } = pg;

// ── Tipos públicos ─────────────────────────────────────────────────────────────
export type DbMode = "postgres" | "sqlite" | "unavailable";

export interface GatewayState {
  mode: DbMode;
  pgAvailable: boolean;
  sqliteAvailable: boolean;
  pgUrl: string | null;
  sqlitePath: string | null;
  lastCheck: Date;
  errorMsg: string | null;
}

export interface CivacGateway {
  /** Drizzle ORM instance (PG o SQLite según disponibilidad) */
  db: NodePgDatabase<typeof pgSchema> | BetterSQLite3Database<typeof sqliteSchema>;
  /** Schema de la BD activa */
  schema: typeof pgSchema | typeof sqliteSchema;
  /** Modo activo */
  mode: DbMode;
  /** Estado completo */
  state: GatewayState;
  /** Encola una operación para sincronizar cuando se recupere PG */
  enqueue(op: SyncOp): Promise<void>;
  /** Intentar re-conectar a PG */
  reconnect(): Promise<boolean>;
  /** Verificar salud de la BD activa */
  ping(): Promise<boolean>;
}

export interface SyncOp {
  operacion: "insert" | "update" | "delete";
  tabla: string;
  entidadId?: string;
  payload: Record<string, unknown>;
}

// ── Estado singleton ───────────────────────────────────────────────────────────
let _gateway: CivacGateway | null = null;
let _pgPool: InstanceType<typeof Pool> | null = null;

// ── Inicializar gateway ────────────────────────────────────────────────────────
export async function initGateway(): Promise<CivacGateway> {
  if (_gateway) return _gateway;

  const state: GatewayState = {
    mode: "unavailable",
    pgAvailable: false,
    sqliteAvailable: false,
    pgUrl: process.env.DATABASE_URL ? maskUrl(process.env.DATABASE_URL) : null,
    sqlitePath: null,
    lastCheck: new Date(),
    errorMsg: null,
  };

  // ── Intentar PostgreSQL ──────────────────────────────────────────────────────
  if (process.env.DATABASE_URL) {
    try {
      _pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 3000,
        max: 5,
      });
      const client = await _pgPool.connect();
      client.release();

      const pgDb = pgDrizzle(_pgPool, { schema: pgSchema });
      state.mode = "postgres";
      state.pgAvailable = true;
      state.lastCheck = new Date();

      console.log("[CIVAC Gateway] ✅ PostgreSQL conectado");

      _gateway = buildGateway(pgDb, pgSchema, state);
      return _gateway;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[CIVAC Gateway] ⚠️  PostgreSQL no disponible: ${msg}`);
      state.errorMsg = msg;
      if (_pgPool) { _pgPool.end().catch(() => {}); _pgPool = null; }
    }
  }

  // ── Fallback: SQLite ─────────────────────────────────────────────────────────
  try {
    const { getSqliteDb, getSqliteInfo } = await import("./sqlite.js");
    const sqliteDb = getSqliteDb();
    const info = getSqliteInfo();

    state.mode = "sqlite";
    state.sqliteAvailable = true;
    state.sqlitePath = info.path;
    state.lastCheck = new Date();

    console.log(`[CIVAC Gateway] 🗄️  SQLite activo: ${info.path} (${info.sizeKb} KB)`);

    _gateway = buildGateway(sqliteDb as never, sqliteSchema, state);
    return _gateway;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[CIVAC Gateway] ❌ SQLite también falló: ${msg}`);
    state.errorMsg = msg;
    state.mode = "unavailable";
  }

  // ── Sin BD disponible ────────────────────────────────────────────────────────
  _gateway = buildGateway(null as never, pgSchema, state);
  return _gateway;
}

/** Obtener el gateway (lanza error si no fue inicializado) */
export function getGateway(): CivacGateway {
  if (!_gateway) throw new Error("[CIVAC Gateway] No inicializado. Llama initGateway() primero.");
  return _gateway;
}

/** Atajos directos para uso en rutas */
export async function getDb() {
  const gw = await initGateway();
  return gw.db;
}

export async function getDbMode(): Promise<DbMode> {
  const gw = await initGateway();
  return gw.mode;
}

export async function getGatewayState(): Promise<GatewayState> {
  const gw = await initGateway();
  return gw.state;
}

// ── Factory interno ────────────────────────────────────────────────────────────
function buildGateway(
  db: CivacGateway["db"],
  schema: CivacGateway["schema"],
  state: GatewayState,
): CivacGateway {
  return {
    db,
    schema,
    mode: state.mode,
    state,

    async enqueue(op: SyncOp): Promise<void> {
      if (state.mode !== "sqlite") return; // solo encolar en modo offline
      try {
        const { getSqliteDb } = await import("./sqlite.js");
        const sdb = getSqliteDb();
        (sdb as BetterSQLite3Database<typeof sqliteSchema>)
          .insert(sqliteSchema.syncQueueTable)
          .values({
            operacion: op.operacion,
            tabla:     op.tabla,
            entidadId: op.entidadId ?? "",
            payload:   JSON.stringify(op.payload),
            estado:    "pendiente",
          })
          .run();
      } catch (err) {
        console.warn("[CIVAC Gateway] enqueue error:", err);
      }
    },

    async reconnect(): Promise<boolean> {
      _gateway = null;
      const gw = await initGateway();
      return gw.mode === "postgres";
    },

    async ping(): Promise<boolean> {
      try {
        if (state.mode === "postgres" && _pgPool) {
          const c = await _pgPool.connect();
          c.release();
          return true;
        }
        if (state.mode === "sqlite") {
          const { getRawSqlite } = await import("./sqlite.js");
          getRawSqlite().prepare("SELECT 1").get();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
  };
}

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.username}:***@${u.host}${u.pathname}`;
  } catch {
    return "[invalid url]";
  }
}
