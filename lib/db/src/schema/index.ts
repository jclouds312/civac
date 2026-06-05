import { pgTable, serial, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Animals ──────────────────────────────────────────────────────────────────
export const animalsTable = pgTable("animals", {
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
  createdAt:       timestamp("created_at").defaultNow(),
  updatedAt:       timestamp("updated_at").defaultNow(),
});
export const insertAnimalSchema = createInsertSchema(animalsTable).omit({ createdAt: true, updatedAt: true });
export type InsertAnimal = z.infer<typeof insertAnimalSchema>;
export type Animal = typeof animalsTable.$inferSelect;

// ── Potreros ─────────────────────────────────────────────────────────────────
export const potrerosTable = pgTable("potreros", {
  id:            serial("id").primaryKey(),
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
  createdAt:     timestamp("created_at").defaultNow(),
  updatedAt:     timestamp("updated_at").defaultNow(),
});
export const insertPotreroSchema = createInsertSchema(potrerosTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPotrero = z.infer<typeof insertPotreroSchema>;
export type Potrero = typeof potrerosTable.$inferSelect;

// ── Insumos ──────────────────────────────────────────────────────────────────
export const insumosTable = pgTable("insumos", {
  id:        serial("id").primaryKey(),
  nombre:    text("nombre").notNull(),
  categoria: text("categoria").notNull().default(""),
  stock:     real("stock").notNull().default(0),
  maximo:    real("maximo").notNull().default(0),
  minimo:    real("minimo").notNull().default(0),
  unidad:    text("unidad").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export const insertInsumoSchema = createInsertSchema(insumosTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInsumo = z.infer<typeof insertInsumoSchema>;
export type Insumo = typeof insumosTable.$inferSelect;

// ── Personal ─────────────────────────────────────────────────────────────────
export const personalTable = pgTable("personal", {
  id:        serial("id").primaryKey(),
  nombre:    text("nombre").notNull(),
  cargo:     text("cargo").notNull().default(""),
  cedula:    text("cedula").notNull().default(""),
  ingreso:   text("ingreso").notNull().default(""),
  salario:   integer("salario").notNull().default(0),
  hExtras:   integer("h_extras").notNull().default(0),
  eps:       text("eps").notNull().default(""),
  arl:       text("arl").notNull().default(""),
  foto:      text("foto").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export const insertPersonalSchema = createInsertSchema(personalTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPersonal = z.infer<typeof insertPersonalSchema>;
export type Personal = typeof personalTable.$inferSelect;

// ── Reproduccion ─────────────────────────────────────────────────────────────
export const reproduccionTable = pgTable("reproduccion", {
  id:         serial("id").primaryKey(),
  arete:      text("arete").notNull(),
  animal:     text("animal").notNull(),
  servicio:   text("servicio").notNull().default(""),
  fechaParto: text("fecha_parto").notNull().default(""),
  dias:       integer("dias").notNull().default(0),
  partosPrev: integer("partos_prev").notNull().default(0),
  estado:     text("estado").notNull().default(""),
  createdAt:  timestamp("created_at").defaultNow(),
  updatedAt:  timestamp("updated_at").defaultNow(),
});
export const insertReproduccionSchema = createInsertSchema(reproduccionTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReproduccion = z.infer<typeof insertReproduccionSchema>;
export type Reproduccion = typeof reproduccionTable.$inferSelect;

// ── Alertas ──────────────────────────────────────────────────────────────────
export const alertasTable = pgTable("alertas", {
  id:        serial("id").primaryKey(),
  title:     text("title").notNull(),
  desc:      text("desc").notNull().default(""),
  type:      text("type").notNull().default("info"),
  time:      text("time").notNull().default(""),
  resolved:  boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertAlertaSchema = createInsertSchema(alertasTable).omit({ id: true, createdAt: true });
export type InsertAlerta = z.infer<typeof insertAlertaSchema>;
export type Alerta = typeof alertasTable.$inferSelect;

// ── Pesajes (Weighing) ────────────────────────────────────────────────────────
export const pesajesTable = pgTable("pesajes", {
  id:              serial("id").primaryKey(),
  animalId:        text("animal_id").notNull(),
  animalNombre:    text("animal_nombre").notNull().default(""),
  peso:            real("peso").notNull().default(0),
  pesoAnterior:    real("peso_anterior").notNull().default(0),
  fecha:           text("fecha").notNull().default(""),
  hora:            text("hora").notNull().default(""),
  metodo:          text("metodo").notNull().default("manual"),
  dispositivo:     text("dispositivo").notNull().default(""),
  operador:        text("operador").notNull().default(""),
  observacion:     text("observacion").notNull().default(""),
  lote:            text("lote").notNull().default(""),
  categoria:       text("categoria").notNull().default(""),
  raza:            text("raza").notNull().default(""),
  condicionCorporal: text("condicion_corporal").notNull().default(""),
  temperatura:     text("temperatura").notNull().default(""),
  estadoSanitario: text("estado_sanitario").notNull().default(""),
  potreroActual:   text("potrero_actual").notNull().default(""),
  observacionVet:  text("observacion_vet").notNull().default(""),
  proximaVacuna:   text("proxima_vacuna").notNull().default(""),
  valorKilo:       real("valor_kilo").notNull().default(0),
  valorTotal:      real("valor_total").notNull().default(0),
  iaScore:         integer("ia_score"),
  createdAt:       timestamp("created_at").defaultNow(),
});
export const insertPesajeSchema = createInsertSchema(pesajesTable).omit({ id: true, createdAt: true });
export type InsertPesaje = z.infer<typeof insertPesajeSchema>;
export type Pesaje = typeof pesajesTable.$inferSelect;

// ── GPS Ubicaciones ───────────────────────────────────────────────────────────
export const gpsUbicacionesTable = pgTable("gps_ubicaciones", {
  id:          serial("id").primaryKey(),
  animalId:    text("animal_id").notNull(),
  nombre:      text("nombre").notNull().default(""),
  lat:         real("lat").notNull().default(0),
  lng:         real("lng").notNull().default(0),
  potreroId:   integer("potrero_id"),
  potreroNom:  text("potrero_nom").notNull().default(""),
  bateria:     integer("bateria").notNull().default(100),
  activo:      boolean("activo").notNull().default(true),
  ultimaSenal: text("ultima_senal").notNull().default(""),
  dispositivo: text("dispositivo").notNull().default(""),
  createdAt:   timestamp("created_at").defaultNow(),
  updatedAt:   timestamp("updated_at").defaultNow(),
});
export const insertGpsSchema = createInsertSchema(gpsUbicacionesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGpsUbicacion = z.infer<typeof insertGpsSchema>;
export type GpsUbicacion = typeof gpsUbicacionesTable.$inferSelect;

// ── Usuarios Sistema ──────────────────────────────────────────────────────────
export const usuariosTable = pgTable("usuarios_sistema", {
  id:          text("id").primaryKey(),
  nombre:      text("nombre").notNull(),
  cargo:       text("cargo").notNull().default(""),
  finca:       text("finca").notNull().default("Finca El Rancho Verde"),
  email:       text("email").notNull(),
  password:    text("password").notNull(),
  role:        text("role").notNull().default("viewer"),
  permisos:    text("permisos").notNull().default("[]"),
  planCode:    text("plan_code").notNull().default("basico"),
  activo:      boolean("activo").notNull().default(true),
  foto:        text("foto").default(""),
  googleId:    text("google_id").unique(),
  googleFoto:  text("google_foto"),
  estado:      text("estado").notNull().default("activo"),
  demoExpiry:  timestamp("demo_expiry"),
  demoDias:    integer("demo_dias").notNull().default(0),
  planExpiry:  timestamp("plan_expiry"),
  planDias:    integer("plan_dias").notNull().default(0),
  loginCount:  integer("login_count").notNull().default(0),
  lastLogin:   timestamp("last_login"),
  createdAt:   timestamp("created_at").defaultNow(),
  updatedAt:   timestamp("updated_at").defaultNow(),
});
export const insertUsuarioSchema = createInsertSchema(usuariosTable).omit({ createdAt: true, updatedAt: true, demoExpiry: true, planExpiry: true, lastLogin: true });
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;
export type UsuarioSistema = typeof usuariosTable.$inferSelect;

// ── Movimientos de Lote ───────────────────────────────────────────────────────
export const movimientosLoteTable = pgTable("movimientos_lote", {
  id:                  serial("id").primaryKey(),
  tipo:                text("tipo").notNull().default("ingreso"),
  nombreLote:          text("nombre_lote").notNull().default(""),
  cantidadAnimales:    integer("cantidad_animales").notNull().default(0),
  pesoTotalLote:       real("peso_total_lote").notNull().default(0),
  promedioPesoAnimal:  real("promedio_peso_animal").notNull().default(0),
  costoKilo:           real("costo_kilo").notNull().default(0),
  valorTotalLote:      real("valor_total_lote").notNull().default(0),
  fecha:               text("fecha").notNull().default(""),
  notas:               text("notas").notNull().default(""),
  reciboGenerado:      boolean("recibo_generado").notNull().default(false),
  proveedor:           text("proveedor").notNull().default(""),
  destino:             text("destino").notNull().default(""),
  createdAt:           timestamp("created_at").defaultNow(),
});
export const insertMovimientoLoteSchema = createInsertSchema(movimientosLoteTable).omit({ id: true, createdAt: true });
export type InsertMovimientoLote = z.infer<typeof insertMovimientoLoteSchema>;
export type MovimientoLote = typeof movimientosLoteTable.$inferSelect;

// ── Plans Config ─────────────────────────────────────────────────────────────
export const plansTable = pgTable("plans_config", {
  id:              serial("id").primaryKey(),
  code:            text("code").notNull().unique(),
  name:            text("name").notNull(),
  nameLong:        text("name_long").notNull().default(""),
  priceMonthly:    integer("price_monthly").notNull().default(0),
  maxAnimals:      integer("max_animals").notNull().default(50),
  maxUsers:        integer("max_users").notNull().default(1),
  maxGpsCollars:   integer("max_gps_collars").notNull().default(5),
  features:        text("features").notNull().default("[]"),
  colorPrimary:    text("color_primary").notNull().default("#00f5d4"),
  colorSecondary:  text("color_secondary").notNull().default("#00c8ff"),
  colorAccent:     text("color_accent").notNull().default("#39ff7e"),
  badgeLabel:      text("badge_label").notNull().default(""),
  active:          boolean("active").notNull().default(true),
  createdAt:       timestamp("created_at").defaultNow(),
});
export const insertPlanSchema = createInsertSchema(plansTable).omit({ id: true, createdAt: true });
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plansTable.$inferSelect;

// ── Images Store (base64 / dataURL) ──────────────────────────────────────────
export const imagesTable = pgTable("images", {
  id:           serial("id").primaryKey(),
  entityType:   text("entity_type").notNull(),  // 'animal' | 'finca' | 'personal' | 'logo' | 'user'
  entityId:     text("entity_id").notNull(),
  filename:     text("filename").notNull().default(""),
  mimetype:     text("mimetype").notNull().default("image/jpeg"),
  dataUrl:      text("data_url").notNull(),      // base64 encoded full dataURL
  sizeBytes:    integer("size_bytes").notNull().default(0),
  width:        integer("width"),
  height:       integer("height"),
  createdAt:    timestamp("created_at").defaultNow(),
});
export const insertImageSchema = createInsertSchema(imagesTable).omit({ id: true, createdAt: true });
export type InsertImage = z.infer<typeof insertImageSchema>;
export type StoredImage = typeof imagesTable.$inferSelect;

// ── Finca Config ─────────────────────────────────────────────────────────────
export const fincaConfigTable = pgTable("finca_config", {
  id:               serial("id").primaryKey(),
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
  updatedAt:        timestamp("updated_at").defaultNow(),
});
export const insertFincaConfigSchema = createInsertSchema(fincaConfigTable).omit({ id: true, updatedAt: true });
export type InsertFincaConfig = z.infer<typeof insertFincaConfigSchema>;
export type FincaConfig = typeof fincaConfigTable.$inferSelect;

// ── User Sessions ─────────────────────────────────────────────────────────────
export const userSessionsTable = pgTable("user_sessions", {
  id:        text("id").primaryKey(),         // UUID token
  userId:    text("user_id").notNull(),
  userEmail: text("user_email").notNull(),
  userRole:  text("user_role").notNull(),
  userName:  text("user_name").notNull().default(""),
  planCode:  text("plan_code").notNull().default("basic"),
  ipAddress: text("ip_address").notNull().default(""),
  userAgent: text("user_agent").notNull().default(""),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertUserSessionSchema = createInsertSchema(userSessionsTable).omit({ createdAt: true });
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessionsTable.$inferSelect;

// ── Trama Logs (Scale trama records) ─────────────────────────────────────────
export const tramaLogsTable = pgTable("trama_logs", {
  id:           serial("id").primaryKey(),
  animalId:     text("animal_id").notNull().default(""),
  animalNombre: text("animal_nombre").notNull().default(""),
  peso:         real("peso").notNull().default(0),
  rawTrama:     text("raw_trama").notNull().default(""),
  tramaType:    text("trama_type").notNull().default("unknown"),
  metodo:       text("metodo").notNull().default("serial"),  // serial | bluetooth | manual
  dispositivo:  text("dispositivo").notNull().default(""),
  puerto:       text("puerto").notNull().default(""),
  baudRate:     integer("baud_rate").notNull().default(9600),
  stable:       boolean("stable").notNull().default(false),
  operador:     text("operador").notNull().default(""),
  userId:       text("user_id").notNull().default(""),
  planCode:     text("plan_code").notNull().default("basico"),
  deviceId:     text("device_id").notNull().default(""),
  capturado:    boolean("capturado").notNull().default(false),  // true if weight was saved
  pesajeId:     integer("pesaje_id"),                          // linked pesaje record
  createdAt:    timestamp("created_at").defaultNow(),
});
export const insertTramaLogSchema = createInsertSchema(tramaLogsTable).omit({ id: true, createdAt: true });
export type InsertTramaLog = z.infer<typeof insertTramaLogSchema>;
export type TramaLog = typeof tramaLogsTable.$inferSelect;

// ── App Versions ──────────────────────────────────────────────────────────────
export const appVersionsTable = pgTable("app_versions", {
  id:           serial("id").primaryKey(),
  version:      text("version").notNull().unique(),   // e.g. "1.0.0"
  nombre:       text("nombre").notNull().default(""), // e.g. "GanaderIA PRO v1.0"
  descripcion:  text("descripcion").notNull().default(""),
  changelog:    text("changelog").notNull().default(""),
  planReq:      text("plan_req").notNull().default("basico"),  // minimum plan to download
  downloadUrl:  text("download_url").notNull().default(""),
  fileName:     text("file_name").notNull().default(""),
  fileSizeKb:   integer("file_size_kb").notNull().default(0),
  buildDate:    text("build_date").notNull().default(""),
  active:       boolean("active").notNull().default(true),
  downloads:    integer("downloads").notNull().default(0),
  createdAt:    timestamp("created_at").defaultNow(),
});
export const insertAppVersionSchema = createInsertSchema(appVersionsTable).omit({ id: true, createdAt: true });
export type InsertAppVersion = z.infer<typeof insertAppVersionSchema>;
export type AppVersion = typeof appVersionsTable.$inferSelect;

// ── Sync Log ─────────────────────────────────────────────────────────────────
export const syncLogTable = pgTable("sync_log", {
  id:             serial("id").primaryKey(),
  deviceId:       text("device_id").notNull(),
  userId:         text("user_id").notNull().default("anonymous"),
  userRole:       text("user_role").notNull().default("viewer"),
  planCode:       text("plan_code").notNull().default("basico"),
  syncType:       text("sync_type").notNull().default("push"),  // push | pull | full
  animalsCount:   integer("animals_count").notNull().default(0),
  potrerosCount:  integer("potreros_count").notNull().default(0),
  insumosCount:   integer("insumos_count").notNull().default(0),
  personalCount:  integer("personal_count").notNull().default(0),
  pesajesCount:   integer("pesajes_count").notNull().default(0),
  alertasCount:   integer("alertas_count").notNull().default(0),
  gpsCount:       integer("gps_count").notNull().default(0),
  lotesCount:     integer("lotes_count").notNull().default(0),
  totalRecords:   integer("total_records").notNull().default(0),
  status:         text("status").notNull().default("ok"),       // ok | error
  errorMsg:       text("error_msg").default(""),
  syncedAt:       timestamp("synced_at").defaultNow(),
});
export const insertSyncLogSchema = createInsertSchema(syncLogTable).omit({ id: true, syncedAt: true });
export type InsertSyncLog = z.infer<typeof insertSyncLogSchema>;
export type SyncLog = typeof syncLogTable.$inferSelect;
