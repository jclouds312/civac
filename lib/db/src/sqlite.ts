/**
 * SQLite Client — base de datos local embebida para modo offline.
 * Usa better-sqlite3 (sincrónico) + drizzle-orm/better-sqlite3.
 * Archivo: civac-local.db en la raíz del proyecto.
 *
 * NOTA: better-sqlite3 se carga dinámicamente para no bloquear el arranque
 * cuando el módulo nativo no está compilado (modo PostgreSQL activo).
 */
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import * as sqliteSchema from "./sqlite-schema.js";

type BetterSqlite3 = typeof import("better-sqlite3");
type DatabaseInstance = InstanceType<BetterSqlite3>;

// Ruta absoluta al archivo de base de datos (junto al workspace root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH   = process.env.SQLITE_DB_PATH
  ?? path.resolve(__dirname, "../../../../civac-local.db");

let _sqliteClient: ReturnType<typeof drizzle> | null = null;
let _raw: DatabaseInstance | null = null;

function loadBetterSqlite3(): BetterSqlite3 {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = (typeof require !== "undefined" ? require : null);
    if (mod) return mod("better-sqlite3");
    throw new Error("require not available");
  } catch {
    throw new Error("[CIVAC SQLite] better-sqlite3 no disponible — modo offline requiere compilar el módulo nativo.");
  }
}

export function getSqliteDb(): ReturnType<typeof drizzle<typeof sqliteSchema>> {
  if (_sqliteClient) return _sqliteClient as ReturnType<typeof drizzle<typeof sqliteSchema>>;

  const Database = loadBetterSqlite3();
  _raw = new Database(DB_PATH);

  // Optimizaciones WAL para mayor concurrencia
  _raw.pragma("journal_mode = WAL");
  _raw.pragma("synchronous = NORMAL");
  _raw.pragma("foreign_keys = ON");
  _raw.pragma("cache_size = -8000"); // 8MB cache

  _sqliteClient = drizzle(_raw, { schema: sqliteSchema });

  // Crear todas las tablas si no existen
  initSchema(_raw);

  console.log(`[CIVAC SQLite] BD local inicializada: ${DB_PATH}`);
  return _sqliteClient as ReturnType<typeof drizzle<typeof sqliteSchema>>;
}

export function getRawSqlite(): DatabaseInstance {
  if (!_raw) getSqliteDb();
  return _raw!;
}

export function closeSqlite(): void {
  if (_raw) {
    _raw.close();
    _raw = null;
    _sqliteClient = null;
    console.log("[CIVAC SQLite] Conexión cerrada.");
  }
}

export function getSqliteInfo(): {
  path: string; sizeKb: number; version: string; tables: string[];
} {
  const db = getRawSqlite();
  const version = (db.prepare("SELECT sqlite_version()").get() as Record<string,string>)["sqlite_version()"] ?? "?";
  const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[]).map(r => r.name);
  let sizeKb = 0;
  try {
    const fs = require("fs");
    sizeKb = Math.round(fs.statSync(DB_PATH).size / 1024);
  } catch { /* ignore */ }
  return { path: DB_PATH, sizeKb, version, tables };
}

/** Crea todas las tablas SQLite usando CREATE TABLE IF NOT EXISTS */
function initSchema(db: DatabaseInstance): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS animals (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      raza TEXT NOT NULL DEFAULT '',
      categoria TEXT NOT NULL DEFAULT '',
      peso REAL NOT NULL DEFAULT 0,
      lote TEXT NOT NULL DEFAULT '',
      estado TEXT NOT NULL DEFAULT '',
      litros_dia REAL NOT NULL DEFAULT 0,
      partos INTEGER NOT NULL DEFAULT 0,
      fecha_nacimiento TEXT NOT NULL DEFAULT '',
      registro TEXT NOT NULL DEFAULT 'NO',
      numero_registro TEXT NOT NULL DEFAULT '',
      valor_kilo REAL NOT NULL DEFAULT 0,
      foto TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS potreros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      pasto TEXT NOT NULL DEFAULT '',
      hectareas REAL NOT NULL DEFAULT 0,
      estado TEXT NOT NULL DEFAULT '',
      dias_ocupado INTEGER,
      dias_descanso INTEGER,
      dias_restantes INTEGER,
      dias_rotacion INTEGER,
      animales INTEGER NOT NULL DEFAULT 0,
      capacidad_max INTEGER,
      aforo REAL,
      observaciones TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS insumos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL DEFAULT '',
      stock REAL NOT NULL DEFAULT 0,
      maximo REAL NOT NULL DEFAULT 0,
      minimo REAL NOT NULL DEFAULT 0,
      unidad TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS personal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      cargo TEXT NOT NULL DEFAULT '',
      cedula TEXT NOT NULL DEFAULT '',
      ingreso TEXT NOT NULL DEFAULT '',
      salario INTEGER NOT NULL DEFAULT 0,
      h_extras INTEGER NOT NULL DEFAULT 0,
      eps TEXT NOT NULL DEFAULT '',
      arl TEXT NOT NULL DEFAULT '',
      foto TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reproduccion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      arete TEXT NOT NULL,
      animal TEXT NOT NULL,
      servicio TEXT NOT NULL DEFAULT '',
      fecha_parto TEXT NOT NULL DEFAULT '',
      dias INTEGER NOT NULL DEFAULT 0,
      partos_prev INTEGER NOT NULL DEFAULT 0,
      estado TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS alertas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      desc TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT 'info',
      time TEXT NOT NULL DEFAULT '',
      resolved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pesajes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      animal_id TEXT NOT NULL,
      animal_nombre TEXT NOT NULL DEFAULT '',
      peso REAL NOT NULL DEFAULT 0,
      peso_anterior REAL NOT NULL DEFAULT 0,
      fecha TEXT NOT NULL DEFAULT '',
      hora TEXT NOT NULL DEFAULT '',
      metodo TEXT NOT NULL DEFAULT 'manual',
      dispositivo TEXT NOT NULL DEFAULT '',
      operador TEXT NOT NULL DEFAULT '',
      observacion TEXT NOT NULL DEFAULT '',
      lote TEXT NOT NULL DEFAULT '',
      categoria TEXT NOT NULL DEFAULT '',
      raza TEXT NOT NULL DEFAULT '',
      condicion_corporal TEXT NOT NULL DEFAULT '',
      temperatura TEXT NOT NULL DEFAULT '',
      estado_sanitario TEXT NOT NULL DEFAULT '',
      potrero_actual TEXT NOT NULL DEFAULT '',
      observacion_vet TEXT NOT NULL DEFAULT '',
      proxima_vacuna TEXT NOT NULL DEFAULT '',
      valor_kilo REAL NOT NULL DEFAULT 0,
      valor_total REAL NOT NULL DEFAULT 0,
      ia_score INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gps_ubicaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      animal_id TEXT NOT NULL,
      nombre TEXT NOT NULL DEFAULT '',
      lat REAL NOT NULL DEFAULT 0,
      lng REAL NOT NULL DEFAULT 0,
      potrero_id INTEGER,
      potrero_nom TEXT NOT NULL DEFAULT '',
      bateria INTEGER NOT NULL DEFAULT 100,
      activo INTEGER NOT NULL DEFAULT 1,
      ultima_senal TEXT NOT NULL DEFAULT '',
      dispositivo TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS usuarios_sistema (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      cargo TEXT NOT NULL DEFAULT '',
      finca TEXT NOT NULL DEFAULT 'Finca El Rancho Verde',
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      permisos TEXT NOT NULL DEFAULT '[]',
      plan_code TEXT NOT NULL DEFAULT 'basico',
      activo INTEGER NOT NULL DEFAULT 1,
      foto TEXT DEFAULT '',
      google_id TEXT UNIQUE,
      google_foto TEXT,
      estado TEXT NOT NULL DEFAULT 'activo',
      demo_expiry TEXT,
      demo_dias INTEGER NOT NULL DEFAULT 0,
      plan_expiry TEXT,
      plan_dias INTEGER NOT NULL DEFAULT 0,
      login_count INTEGER NOT NULL DEFAULT 0,
      last_login TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS movimientos_lote (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL DEFAULT 'ingreso',
      nombre_lote TEXT NOT NULL DEFAULT '',
      cantidad_animales INTEGER NOT NULL DEFAULT 0,
      peso_total_lote REAL NOT NULL DEFAULT 0,
      promedio_peso_animal REAL NOT NULL DEFAULT 0,
      costo_kilo REAL NOT NULL DEFAULT 0,
      valor_total_lote REAL NOT NULL DEFAULT 0,
      fecha TEXT NOT NULL DEFAULT '',
      notas TEXT NOT NULL DEFAULT '',
      recibo_generado INTEGER NOT NULL DEFAULT 0,
      proveedor TEXT NOT NULL DEFAULT '',
      destino TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trama_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      animal_id TEXT NOT NULL DEFAULT '',
      animal_nombre TEXT NOT NULL DEFAULT '',
      peso REAL NOT NULL DEFAULT 0,
      raw_trama TEXT NOT NULL DEFAULT '',
      trama_type TEXT NOT NULL DEFAULT 'unknown',
      metodo TEXT NOT NULL DEFAULT 'serial',
      dispositivo TEXT NOT NULL DEFAULT '',
      puerto TEXT NOT NULL DEFAULT '',
      baud_rate INTEGER NOT NULL DEFAULT 9600,
      stable INTEGER NOT NULL DEFAULT 0,
      operador TEXT NOT NULL DEFAULT '',
      user_id TEXT NOT NULL DEFAULT '',
      plan_code TEXT NOT NULL DEFAULT 'basico',
      device_id TEXT NOT NULL DEFAULT '',
      capturado INTEGER NOT NULL DEFAULT 0,
      pesaje_id INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS finca_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL DEFAULT 'Finca El Rancho Verde',
      nit TEXT NOT NULL DEFAULT '',
      municipio TEXT NOT NULL DEFAULT 'Bogotá',
      departamento TEXT NOT NULL DEFAULT 'Cundinamarca',
      telefono TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      direccion TEXT NOT NULL DEFAULT '',
      plan_code TEXT NOT NULL DEFAULT 'basic',
      theme_mode TEXT NOT NULL DEFAULT 'dark',
      primary_color TEXT NOT NULL DEFAULT '#00f5d4',
      logo_image_id INTEGER,
      hectareas_totales REAL NOT NULL DEFAULT 27,
      capacidad_total INTEGER NOT NULL DEFAULT 100,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS licencias (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_nombre TEXT NOT NULL DEFAULT '',
      plan_code TEXT NOT NULL DEFAULT 'basico',
      dias_validos INTEGER NOT NULL DEFAULT 30,
      session_limit INTEGER NOT NULL DEFAULT 1,
      max_animales INTEGER NOT NULL DEFAULT 50,
      max_usuarios INTEGER NOT NULL DEFAULT 1,
      permisos TEXT NOT NULL DEFAULT '[]',
      signature TEXT NOT NULL DEFAULT '',
      estado TEXT NOT NULL DEFAULT 'activa',
      generada_por TEXT NOT NULL DEFAULT '',
      descargada INTEGER NOT NULL DEFAULT 0,
      descargada_at TEXT,
      expires_at TEXT,
      revoked_at TEXT,
      revoked_por TEXT,
      notas TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS codigos_activacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      plan_code TEXT NOT NULL DEFAULT 'basico',
      dias_plan INTEGER NOT NULL DEFAULT 30,
      session_limit INTEGER NOT NULL DEFAULT 1,
      max_animales INTEGER NOT NULL DEFAULT 50,
      max_usuarios INTEGER NOT NULL DEFAULT 1,
      estado TEXT NOT NULL DEFAULT 'disponible',
      creado_por TEXT NOT NULL DEFAULT '',
      usado_por TEXT,
      usado_por_email TEXT,
      usado_por_nombre TEXT,
      usado_at TEXT,
      expires_at TEXT,
      notas TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_role TEXT NOT NULL DEFAULT '',
      accion TEXT NOT NULL,
      entidad TEXT NOT NULL DEFAULT '',
      entidad_id TEXT NOT NULL DEFAULT '',
      detalles TEXT NOT NULL DEFAULT '{}',
      ip_address TEXT NOT NULL DEFAULT '',
      resultado TEXT NOT NULL DEFAULT 'ok',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operacion TEXT NOT NULL,
      tabla TEXT NOT NULL,
      entidad_id TEXT NOT NULL DEFAULT '',
      payload TEXT NOT NULL DEFAULT '{}',
      intentos INTEGER NOT NULL DEFAULT 0,
      max_intentos INTEGER NOT NULL DEFAULT 5,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      error_msg TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS db_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now'))
    );

    INSERT OR IGNORE INTO db_meta (key, value) VALUES
      ('schema_version', '1'),
      ('civac_version', '1.0.0'),
      ('created_at', datetime('now')),
      ('mode', 'offline');
  `);
}
