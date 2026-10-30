/**
 * SQLite Client — base de datos local embebida para modo offline.
 * Usa better-sqlite3 (sincrónico) + drizzle-orm/better-sqlite3.
 * Archivo: civac-local.db en la raíz del proyecto.
 *
 * NOTA: better-sqlite3 se carga dinámicamente para no bloquear el arranque
 * cuando el módulo nativo no está compilado (modo PostgreSQL activo).
 */
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as sqliteSchema from "./sqlite-schema.js";
type BetterSqlite3 = typeof import("better-sqlite3");
type DatabaseInstance = InstanceType<BetterSqlite3>;
export declare function getSqliteDb(): ReturnType<typeof drizzle<typeof sqliteSchema>>;
export declare function getRawSqlite(): DatabaseInstance;
export declare function closeSqlite(): void;
export declare function getSqliteInfo(): {
    path: string;
    sizeKb: number;
    version: string;
    tables: string[];
};
export {};
//# sourceMappingURL=sqlite.d.ts.map