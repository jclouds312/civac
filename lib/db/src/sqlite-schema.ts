/**
 * SQLite schema — espejo del schema PostgreSQL para modo offline.
 * Usa drizzle-orm/sqlite-core en lugar de pg-core.
 * Las fechas se almacenan como TEXT (ISO-8601) porque SQLite no tiene tipo timestamp nativo.
 */
import {
  sqliteTable, text, integer, real,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const now = () => sql`(datetime('now'))`;

// ── Animals ──────────────────────────────────────────────────────────────────
export const animalsTable = sqliteTable("animals", {
  id:              text("id").primaryKey(),
  nombre:          text("nombre").notNull(),
  raza:            text("raza").notNull().default(""),
  categoria:       text("categoria").notNull().default(""),
  peso:            real("peso").notNull().default(0),
  lote:            text("lote").notNull().default(""),
  estado:          text("estado").notNull().default(""),
  litrosDia:       real("litros_dia").notNull().default(0),
  partos:          integer("partos").notNull().default(0),
  fechaNacimiento: text("fecha_nacimiento").notNull().default(""),
  registro:        text("registro").notNull().default("NO"),
  numeroRegistro:  text("numero_registro").notNull().default(""),
  valorKilo:       real("valor_kilo").notNull().default(0),
  foto:            text("foto").default(""),
  createdAt:       text("created_at").default(sql`(datetime('now'))`),
  updatedAt:       text("updated_at").default(sql`(datetime('now'))`),
});

// ── Potreros ─────────────────────────────────────────────────────────────────
export const potrerosTable = sqliteTable("potreros", {
  id:            integer("id").primaryKey({ autoIncrement: true }),
  nombre:        text("nombre").notNull(),
  pasto:         text("pasto").notNull().default(""),
  hectareas:     real("hectareas").notNull().default(0),
  estado:        text("estado").notNull().default(""),
  diasOcupado:   integer("dias_ocupado"),
  diasDescanso:  integer("dias_descanso"),
  diasRestantes: integer("dias_restantes"),
  diasRotacion:  integer("dias_rotacion"),
  animales:      integer("animales").notNull().default(0),
  capacidadMax:  integer("capacidad_max"),
  aforo:         real("aforo"),
  observaciones: text("observaciones").notNull().default(""),
  createdAt:     text("created_at").default(sql`(datetime('now'))`),
  updatedAt:     text("updated_at").default(sql`(datetime('now'))`),
});

// ── Insumos ──────────────────────────────────────────────────────────────────
export const insumosTable = sqliteTable("insumos", {
  id:        integer("id").primaryKey({ autoIncrement: true }),
  nombre:    text("nombre").notNull(),
  categoria: text("categoria").notNull().default(""),
  stock:     real("stock").notNull().default(0),
  maximo:    real("maximo").notNull().default(0),
  minimo:    real("minimo").notNull().default(0),
  unidad:    text("unidad").notNull().default(""),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ── Personal ─────────────────────────────────────────────────────────────────
export const personalTable = sqliteTable("personal", {
  id:        integer("id").primaryKey({ autoIncrement: true }),
  nombre:    text("nombre").notNull(),
  cargo:     text("cargo").notNull().default(""),
  cedula:    text("cedula").notNull().default(""),
  ingreso:   text("ingreso").notNull().default(""),
  salario:   integer("salario").notNull().default(0),
  hExtras:   integer("h_extras").notNull().default(0),
  eps:       text("eps").notNull().default(""),
  arl:       text("arl").notNull().default(""),
  foto:      text("foto").default(""),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ── Reproducción ──────────────────────────────────────────────────────────────
export const reproduccionTable = sqliteTable("reproduccion", {
  id:         integer("id").primaryKey({ autoIncrement: true }),
  arete:      text("arete").notNull(),
  animal:     text("animal").notNull(),
  servicio:   text("servicio").notNull().default(""),
  fechaParto: text("fecha_parto").notNull().default(""),
  dias:       integer("dias").notNull().default(0),
  partosPrev: integer("partos_prev").notNull().default(0),
  estado:     text("estado").notNull().default(""),
  createdAt:  text("created_at").default(sql`(datetime('now'))`),
  updatedAt:  text("updated_at").default(sql`(datetime('now'))`),
});

// ── Alertas ──────────────────────────────────────────────────────────────────
export const alertasTable = sqliteTable("alertas", {
  id:        integer("id").primaryKey({ autoIncrement: true }),
  title:     text("title").notNull(),
  desc:      text("desc").notNull().default(""),
  type:      text("type").notNull().default("info"),
  time:      text("time").notNull().default(""),
  resolved:  integer("resolved", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// ── Pesajes ──────────────────────────────────────────────────────────────────
export const pesajesTable = sqliteTable("pesajes", {
  id:                integer("id").primaryKey({ autoIncrement: true }),
  animalId:          text("animal_id").notNull(),
  animalNombre:      text("animal_nombre").notNull().default(""),
  peso:              real("peso").notNull().default(0),
  pesoAnterior:      real("peso_anterior").notNull().default(0),
  fecha:             text("fecha").notNull().default(""),
  hora:              text("hora").notNull().default(""),
  metodo:            text("metodo").notNull().default("manual"),
  dispositivo:       text("dispositivo").notNull().default(""),
  operador:          text("operador").notNull().default(""),
  observacion:       text("observacion").notNull().default(""),
  lote:              text("lote").notNull().default(""),
  categoria:         text("categoria").notNull().default(""),
  raza:              text("raza").notNull().default(""),
  condicionCorporal: text("condicion_corporal").notNull().default(""),
  temperatura:       text("temperatura").notNull().default(""),
  estadoSanitario:   text("estado_sanitario").notNull().default(""),
  potreroActual:     text("potrero_actual").notNull().default(""),
  observacionVet:    text("observacion_vet").notNull().default(""),
  proximaVacuna:     text("proxima_vacuna").notNull().default(""),
  valorKilo:         real("valor_kilo").notNull().default(0),
  valorTotal:        real("valor_total").notNull().default(0),
  iaScore:           integer("ia_score"),
  createdAt:         text("created_at").default(sql`(datetime('now'))`),
});

// ── GPS Ubicaciones ───────────────────────────────────────────────────────────
export const gpsUbicacionesTable = sqliteTable("gps_ubicaciones", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  animalId:    text("animal_id").notNull(),
  nombre:      text("nombre").notNull().default(""),
  lat:         real("lat").notNull().default(0),
  lng:         real("lng").notNull().default(0),
  potreroId:   integer("potrero_id"),
  potreroNom:  text("potrero_nom").notNull().default(""),
  bateria:     integer("bateria").notNull().default(100),
  activo:      integer("activo", { mode: "boolean" }).notNull().default(true),
  ultimaSenal: text("ultima_senal").notNull().default(""),
  dispositivo: text("dispositivo").notNull().default(""),
  createdAt:   text("created_at").default(sql`(datetime('now'))`),
  updatedAt:   text("updated_at").default(sql`(datetime('now'))`),
});

// ── Usuarios Sistema ──────────────────────────────────────────────────────────
export const usuariosTable = sqliteTable("usuarios_sistema", {
  id:         text("id").primaryKey(),
  nombre:     text("nombre").notNull(),
  cargo:      text("cargo").notNull().default(""),
  finca:      text("finca").notNull().default("Finca El Rancho Verde"),
  email:      text("email").notNull().unique(),
  password:   text("password").notNull(),
  role:       text("role").notNull().default("viewer"),
  permisos:   text("permisos").notNull().default("[]"),
  planCode:   text("plan_code").notNull().default("basico"),
  activo:     integer("activo", { mode: "boolean" }).notNull().default(true),
  foto:       text("foto").default(""),
  googleId:   text("google_id").unique(),
  googleFoto: text("google_foto"),
  estado:     text("estado").notNull().default("activo"),
  demoExpiry: text("demo_expiry"),
  demoDias:   integer("demo_dias").notNull().default(0),
  planExpiry: text("plan_expiry"),
  planDias:   integer("plan_dias").notNull().default(0),
  loginCount: integer("login_count").notNull().default(0),
  lastLogin:  text("last_login"),
  createdAt:  text("created_at").default(sql`(datetime('now'))`),
  updatedAt:  text("updated_at").default(sql`(datetime('now'))`),
});

// ── Movimientos de Lote ───────────────────────────────────────────────────────
export const movimientosLoteTable = sqliteTable("movimientos_lote", {
  id:                 integer("id").primaryKey({ autoIncrement: true }),
  tipo:               text("tipo").notNull().default("ingreso"),
  nombreLote:         text("nombre_lote").notNull().default(""),
  cantidadAnimales:   integer("cantidad_animales").notNull().default(0),
  pesoTotalLote:      real("peso_total_lote").notNull().default(0),
  promedioPesoAnimal: real("promedio_peso_animal").notNull().default(0),
  costoKilo:          real("costo_kilo").notNull().default(0),
  valorTotalLote:     real("valor_total_lote").notNull().default(0),
  fecha:              text("fecha").notNull().default(""),
  notas:              text("notas").notNull().default(""),
  reciboGenerado:     integer("recibo_generado", { mode: "boolean" }).notNull().default(false),
  proveedor:          text("proveedor").notNull().default(""),
  destino:            text("destino").notNull().default(""),
  createdAt:          text("created_at").default(sql`(datetime('now'))`),
});

// ── Trama Logs ────────────────────────────────────────────────────────────────
export const tramaLogsTable = sqliteTable("trama_logs", {
  id:           integer("id").primaryKey({ autoIncrement: true }),
  animalId:     text("animal_id").notNull().default(""),
  animalNombre: text("animal_nombre").notNull().default(""),
  peso:         real("peso").notNull().default(0),
  rawTrama:     text("raw_trama").notNull().default(""),
  tramaType:    text("trama_type").notNull().default("unknown"),
  metodo:       text("metodo").notNull().default("serial"),
  dispositivo:  text("dispositivo").notNull().default(""),
  puerto:       text("puerto").notNull().default(""),
  baudRate:     integer("baud_rate").notNull().default(9600),
  stable:       integer("stable", { mode: "boolean" }).notNull().default(false),
  operador:     text("operador").notNull().default(""),
  userId:       text("user_id").notNull().default(""),
  planCode:     text("plan_code").notNull().default("basico"),
  deviceId:     text("device_id").notNull().default(""),
  capturado:    integer("capturado", { mode: "boolean" }).notNull().default(false),
  pesajeId:     integer("pesaje_id"),
  createdAt:    text("created_at").default(sql`(datetime('now'))`),
});

// ── Finca Config ─────────────────────────────────────────────────────────────
export const fincaConfigTable = sqliteTable("finca_config", {
  id:               integer("id").primaryKey({ autoIncrement: true }),
  nombre:           text("nombre").notNull().default("Finca El Rancho Verde"),
  nit:              text("nit").notNull().default(""),
  municipio:        text("municipio").notNull().default("Bogotá"),
  departamento:     text("departamento").notNull().default("Cundinamarca"),
  telefono:         text("telefono").notNull().default(""),
  email:            text("email").notNull().default(""),
  direccion:        text("direccion").notNull().default(""),
  planCode:         text("plan_code").notNull().default("basic"),
  themeMode:        text("theme_mode").notNull().default("dark"),
  primaryColor:     text("primary_color").notNull().default("#00f5d4"),
  logoImageId:      integer("logo_image_id"),
  hectareasTotales: real("hectareas_totales").notNull().default(27),
  capacidadTotal:   integer("capacidad_total").notNull().default(100),
  updatedAt:        text("updated_at").default(sql`(datetime('now'))`),
});

// ── Licencias ────────────────────────────────────────────────────────────────
export const licenciasTable = sqliteTable("licencias", {
  id:           text("id").primaryKey(),
  userId:       text("user_id").notNull(),
  userEmail:    text("user_email").notNull(),
  userNombre:   text("user_nombre").notNull().default(""),
  planCode:     text("plan_code").notNull().default("basico"),
  diasValidos:  integer("dias_validos").notNull().default(30),
  sessionLimit: integer("session_limit").notNull().default(1),
  maxAnimales:  integer("max_animales").notNull().default(50),
  maxUsuarios:  integer("max_usuarios").notNull().default(1),
  permisos:     text("permisos").notNull().default("[]"),
  signature:    text("signature").notNull().default(""),
  estado:       text("estado").notNull().default("activa"),
  generadaPor:  text("generada_por").notNull().default(""),
  descargada:   integer("descargada", { mode: "boolean" }).notNull().default(false),
  descargadaAt: text("descargada_at"),
  expiresAt:    text("expires_at"),
  revokedAt:    text("revoked_at"),
  revokedPor:   text("revoked_por"),
  notas:        text("notas").notNull().default(""),
  createdAt:    text("created_at").default(sql`(datetime('now'))`),
  updatedAt:    text("updated_at").default(sql`(datetime('now'))`),
});

// ── Códigos de Activación ────────────────────────────────────────────────────
export const codigosActivacionTable = sqliteTable("codigos_activacion", {
  id:             integer("id").primaryKey({ autoIncrement: true }),
  codigo:         text("codigo").notNull().unique(),
  planCode:       text("plan_code").notNull().default("basico"),
  diasPlan:       integer("dias_plan").notNull().default(30),
  sessionLimit:   integer("session_limit").notNull().default(1),
  maxAnimales:    integer("max_animales").notNull().default(50),
  maxUsuarios:    integer("max_usuarios").notNull().default(1),
  estado:         text("estado").notNull().default("disponible"),
  creadoPor:      text("creado_por").notNull().default(""),
  usadoPor:       text("usado_por"),
  usadoPorEmail:  text("usado_por_email"),
  usadoPorNombre: text("usado_por_nombre"),
  usadoAt:        text("usado_at"),
  expiresAt:      text("expires_at"),
  notas:          text("notas").notNull().default(""),
  createdAt:      text("created_at").default(sql`(datetime('now'))`),
});

// ── Audit Log ─────────────────────────────────────────────────────────────────
export const auditLogTable = sqliteTable("audit_log", {
  id:         integer("id").primaryKey({ autoIncrement: true }),
  userId:     text("user_id").notNull(),
  userEmail:  text("user_email").notNull(),
  userRole:   text("user_role").notNull().default(""),
  accion:     text("accion").notNull(),
  entidad:    text("entidad").notNull().default(""),
  entidadId:  text("entidad_id").notNull().default(""),
  detalles:   text("detalles").notNull().default("{}"),
  ipAddress:  text("ip_address").notNull().default(""),
  resultado:  text("resultado").notNull().default("ok"),
  createdAt:  text("created_at").default(sql`(datetime('now'))`),
});

// ── Sync Queue (cola de cambios pendientes de sincronizar) ────────────────────
export const syncQueueTable = sqliteTable("sync_queue", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  operacion:   text("operacion").notNull(),    // insert | update | delete
  tabla:       text("tabla").notNull(),
  entidadId:   text("entidad_id").notNull().default(""),
  payload:     text("payload").notNull().default("{}"),
  intentos:    integer("intentos").notNull().default(0),
  maxIntentos: integer("max_intentos").notNull().default(5),
  estado:      text("estado").notNull().default("pendiente"), // pendiente | sincronizado | error
  errorMsg:    text("error_msg").default(""),
  createdAt:   text("created_at").default(sql`(datetime('now'))`),
  syncedAt:    text("synced_at"),
});

// ── DB Meta (información interna de la BD local) ──────────────────────────────
export const dbMetaTable = sqliteTable("db_meta", {
  key:       text("key").primaryKey(),
  value:     text("value").notNull().default(""),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export type SyncQueue = typeof syncQueueTable.$inferSelect;
export type DbMeta    = typeof dbMetaTable.$inferSelect;
