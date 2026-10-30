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
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as pgSchema from "./schema/index.js";
import * as sqliteSchema from "./sqlite-schema.js";
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
export declare function initGateway(): Promise<CivacGateway>;
/** Obtener el gateway (lanza error si no fue inicializado) */
export declare function getGateway(): CivacGateway;
/** Atajos directos para uso en rutas */
export declare function getDb(): Promise<BetterSQLite3Database<typeof sqliteSchema> | NodePgDatabase<typeof pgSchema>>;
export declare function getDbMode(): Promise<DbMode>;
export declare function getGatewayState(): Promise<GatewayState>;
//# sourceMappingURL=gateway.d.ts.map