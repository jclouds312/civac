/**
 * @workspace/db — Punto de entrada principal
 *
 * Exporta:
 * - `db`          — cliente Drizzle PostgreSQL directo (requiere DATABASE_URL)
 * - `pool`        — Pool de conexiones PostgreSQL
 * - `initGateway` — Code Gateway con auto-failover a SQLite
 * - `getGateway`  — Obtener gateway ya inicializado
 * - `getDb`       — Obtener cliente de BD activo (PG o SQLite)
 * - `getDbMode`   — Modo activo: 'postgres' | 'sqlite' | 'unavailable'
 * - Todo el schema PostgreSQL y tipos
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

// ── Cliente PostgreSQL directo (legacy — para rutas que ya usan `db`) ─────────
if (!process.env.DATABASE_URL) {
  console.warn("[CIVAC DB] DATABASE_URL no definida — usando Gateway con SQLite.");
}

export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

export const db = pool
  ? drizzle(pool, { schema })
  : (null as unknown as ReturnType<typeof drizzle<typeof schema>>);

// ── Code Gateway (auto-failover PG → SQLite) ──────────────────────────────────
export {
  initGateway,
  getGateway,
  getDb,
  getDbMode,
  getGatewayState,
  type CivacGateway,
  type GatewayState,
  type DbMode,
  type SyncOp,
} from "./gateway.js";

// ── SQLite utils ──────────────────────────────────────────────────────────────
export {
  getSqliteDb,
  getRawSqlite,
  closeSqlite,
  getSqliteInfo,
} from "./sqlite.js";

// ── Schema y tipos ────────────────────────────────────────────────────────────
export * from "./schema/index.js";
