import { pgTable, serial, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Animals ──────────────────────────────────────────────────────────────────
export const animalsTable = pgTable("animals", {
  id:         text("id").primaryKey(),
  nombre:     text("nombre").notNull(),
  raza:       text("raza").notNull().default(""),
  categoria:  text("categoria").notNull().default(""),
  peso:       real("peso").notNull().default(0),
  lote:       text("lote").notNull().default(""),
  estado:     text("estado").notNull().default(""),
  litrosDia:  real("litros_dia").notNull().default(0),
  partos:     integer("partos").notNull().default(0),
  createdAt:  timestamp("created_at").defaultNow(),
  updatedAt:  timestamp("updated_at").defaultNow(),
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

// ── Pesaje ───────────────────────────────────────────────────────────────────
export const pesajeTable = pgTable("pesaje", {
  id:               serial("id").primaryKey(),
  animalId:         text("animal_id").notNull(),
  animalNombre:     text("animal_nombre").notNull(),
  categoria:        text("categoria").notNull().default(""),
  fecha:            text("fecha").notNull(),
  peso:             real("peso").notNull().default(0),
  bascula:          text("bascula").notNull().default(""),
  operador:         text("operador").notNull().default(""),
  observaciones:    text("observaciones").notNull().default(""),
  condicionCorporal: integer("condicion_corporal").notNull().default(3),
  variacion:        real("variacion"),
  createdAt:        timestamp("created_at").defaultNow(),
});
export const insertPesajeSchema = createInsertSchema(pesajeTable).omit({ id: true, createdAt: true });
export type InsertPesaje = z.infer<typeof insertPesajeSchema>;
export type Pesaje = typeof pesajeTable.$inferSelect;
