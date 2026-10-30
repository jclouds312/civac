import { pgTable, serial, text, integer, decimal, timestamp, jsonb, varchar, boolean, index } from 'drizzle-orm/pg-core';

/**
 * GPS Devices Registry
 * Persistent storage of all GPS collars, ear tags, and tracking devices
 */
export const dispositivosGpsTable = pgTable('dispositivos_gps', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  imei: varchar('imei', { length: 50 }).unique().notNull(),
  nombre: varchar('nombre', { length: 120 }).notNull().default('Dispositivo GPS'),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  fabricante: varchar('fabricante', { length: 100 }).notNull(),
  modelo: varchar('modelo', { length: 100 }).notNull(),
  protocolo: varchar('protocolo', { length: 50 }),
  animalId: text('animal_id'),
  potreroId: integer('potrero_id'),
  bateria: decimal('bateria', { precision: 5, scale: 2 }),
  estado: varchar('estado', { length: 50 }).default('activo'),
  ultimaSenial: timestamp('ultima_senial'),
  lat: decimal('lat', { precision: 10, scale: 7 }),
  lng: decimal('lng', { precision: 10, scale: 7 }),
  precision: decimal('precision', { precision: 10, scale: 2 }),
  speed: decimal('speed', { precision: 8, scale: 2 }),
  altitude: decimal('altitude', { precision: 10, scale: 2 }),
  configJson: jsonb('config_json'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userStatusIdx: index('dispositivos_gps_user_estado_idx').on(table.userId, table.estado),
  userImeiIdx: index('dispositivos_gps_user_imei_idx').on(table.userId, table.imei),
}));

/**
 * GPS Breadcrumb History
 */
export const gpsTracksTable = pgTable('gps_tracks', {
  id: serial('id').primaryKey(),
  dispositivoId: integer('dispositivo_id').notNull(),
  lat: decimal('lat', { precision: 10, scale: 7 }).notNull(),
  lng: decimal('lng', { precision: 10, scale: 7 }).notNull(),
  speed: decimal('speed', { precision: 8, scale: 2 }),
  altitude: decimal('altitude', { precision: 10, scale: 2 }),
  precision: decimal('precision', { precision: 10, scale: 2 }),
  potreroId: integer('potrero_id'),
  timestamp: timestamp('timestamp').defaultNow(),
  rawData: jsonb('raw_data'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  deviceTimeIdx: index('gps_tracks_device_timestamp_idx').on(table.dispositivoId, table.timestamp),
}));

/**
 * Geofence Alerts
 */
export const geofenceAlertsTable = pgTable('geofence_alerts', {
  id: serial('id').primaryKey(),
  dispositivoId: integer('dispositivo_id').notNull(),
  userId: text('user_id').notNull(),
  animalId: text('animal_id').notNull(),
  potreroId: integer('potrero_id').notNull(),
  alertType: varchar('alert_type', { length: 50 }).notNull(),
  lat: decimal('lat', { precision: 10, scale: 7 }),
  lng: decimal('lng', { precision: 10, scale: 7 }),
  estado: varchar('estado', { length: 50 }).default('activa'),
  mensaje: text('mensaje'),
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
}, (table) => ({
  userCreatedIdx: index('geofence_alerts_user_created_idx').on(table.userId, table.createdAt),
  deviceStateIdx: index('geofence_alerts_device_state_idx').on(table.dispositivoId, table.estado),
}));
