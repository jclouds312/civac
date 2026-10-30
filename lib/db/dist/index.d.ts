import * as schema from "./schema/index.js";
export declare const pool: import("pg").Pool | null;
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: import("pg").Pool;
};
export { initGateway, getGateway, getDb, getDbMode, getGatewayState, type CivacGateway, type GatewayState, type DbMode, type SyncOp, } from "./gateway.js";
export { getSqliteDb, getRawSqlite, closeSqlite, getSqliteInfo, } from "./sqlite.js";
export * from "./schema/index.js";
//# sourceMappingURL=index.d.ts.map