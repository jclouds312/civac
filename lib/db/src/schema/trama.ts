import { pgTable, serial, integer, decimal, text, timestamp, jsonb, varchar } from 'drizzle-orm/pg-core';

/**
 * Animal Traceability Records (Trama)
 */
export const animalTramaTable = pgTable('animal_trama', {
  id: serial('id').primaryKey(),
  animalId: integer('animal_id').notNull(),
  animalNombre: varchar('animal_nombre', { length: 255 }).notNull(),
  peso: decimal('peso', { precision: 8, scale: 2 }).notNull(),
  pesoPrevio: decimal('peso_previo', { precision: 8, scale: 2 }),
  dispositivoId: integer('dispositivo_id').notNull(),
  dispositivoNombre: varchar('dispositivo_nombre', { length: 255 }).notNull(),
  protocolo: varchar('protocolo', { length: 50 }),
  operadorId: integer('operador_id').notNull(),
  operadorNombre: varchar('operador_nombre', { length: 255 }).notNull(),
  lat: decimal('lat', { precision: 10, scale: 7 }),
  lng: decimal('lng', { precision: 10, scale: 7 }),
  precisionM: decimal('precision_m', { precision: 10, scale: 2 }),
  lote: varchar('lote', { length: 100 }),
  potrero: varchar('potrero', { length: 255 }),
  propietarioNombre: varchar('propietario_nombre', { length: 255 }).notNull(),
  propietarioNit: varchar('propietario_nit', { length: 50 }).notNull(),
  destino: varchar('destino', { length: 255 }),
  destinoTipo: varchar('destino_tipo', { length: 50 }),
  precioKilo: decimal('precio_kilo', { precision: 10, scale: 2 }),
  valorTotal: decimal('valor_total', { precision: 12, scale: 2 }),
  eidRfid: varchar('eid_rfid', { length: 50 }),
  observaciones: text('observaciones'),
  receiptUrl: varchar('receipt_url', { length: 500 }),
  receiptJson: jsonb('receipt_json'),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Scale Device Configuration
 */
export const pesajeConfigTable = pgTable('pesaje_config', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  dispositivoId: integer('dispositivo_id').notNull(),
  modelo: varchar('modelo', { length: 100 }).notNull(),
  tipoConexion: varchar('tipo_conexion', { length: 50 }).notNull(),
  puerto: varchar('puerto', { length: 50 }),
  baudRate: integer('baud_rate').default(9600),
  configJson: jsonb('config_json'),
  testeado: timestamp('testeado'),
  activo: integer('activo').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
