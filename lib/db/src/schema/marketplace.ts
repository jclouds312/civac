import { pgTable, serial, integer, text, decimal, timestamp, jsonb, varchar, boolean } from 'drizzle-orm/pg-core';

/**
 * Marketplace Listings
 */
export const marketplaceListingsTable = pgTable('marketplace_listings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  categoria: varchar('categoria', { length: 50 }).notNull(),
  marca: varchar('marca', { length: 100 }),
  modelo: varchar('modelo', { length: 100 }),
  precioCop: decimal('precio_cop', { precision: 12, scale: 2 }).notNull(),
  condicion: varchar('condicion', { length: 50 }).notNull(),
  departamento: varchar('departamento', { length: 100 }).notNull(),
  municipio: varchar('municipio', { length: 100 }),
  fotosJson: jsonb('fotos_json'),
  estado: varchar('estado', { length: 50 }).default('activo'),
  vistas: integer('vistas').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  soldoAt: timestamp('vendido_at'),
});

/**
 * Marketplace Deals
 */
export const marketplaceDealsTable = pgTable('marketplace_deals', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id').notNull(),
  sellerId: integer('seller_id').notNull(),
  buyerId: integer('buyer_id').notNull(),
  precioAcordado: decimal('precio_acordado', { precision: 12, scale: 2 }).notNull(),
  comisionPct: decimal('comision_pct', { precision: 5, scale: 2 }).default('3'),
  comisionCop: decimal('comision_cop', { precision: 12, scale: 2 }),
  estado: varchar('estado', { length: 50 }).default('abierto'),
  pdfReceiptUrl: varchar('pdf_receipt_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  closedAt: timestamp('closed_at'),
});

/**
 * Marketplace Messages
 */
export const marketplaceMessagesTable = pgTable('marketplace_messages', {
  id: serial('id').primaryKey(),
  dealId: integer('deal_id'),
  listingId: integer('listing_id'),
  fromUserId: integer('from_user_id').notNull(),
  toUserId: integer('to_user_id').notNull(),
  mensaje: text('mensaje').notNull(),
  leido: boolean('leido').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Marketplace Commission Ledger
 */
export const marketplaceCommissionLedgerTable = pgTable('marketplace_commission_ledger', {
  id: serial('id').primaryKey(),
  dealId: integer('deal_id').notNull(),
  sellerId: integer('seller_id').notNull(),
  comisionCop: decimal('comision_cop', { precision: 12, scale: 2 }).notNull(),
  mesRef: varchar('mes_ref', { length: 7 }),
  facturado: boolean('facturado').default(false),
  invoiceId: integer('invoice_id'),
  createdAt: timestamp('created_at').defaultNow(),
});
