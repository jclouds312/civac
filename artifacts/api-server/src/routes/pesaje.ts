import { Router } from "express";
import { db } from "@workspace/db";
import { pesajeTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET all pesaje records
router.get("/pesaje", async (_req, res) => {
  try {
    const rows = await db.select().from(pesajeTable).orderBy(pesajeTable.fecha);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET single pesaje record
router.get("/pesaje/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select().from(pesajeTable).where(eq(pesajeTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(row);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// POST create pesaje record
router.post("/pesaje", async (req, res) => {
  try {
    const { animalId, animalNombre, categoria, fecha, peso, bascula, operador, observaciones, condicionCorporal, variacion } = req.body;
    const [row] = await db.insert(pesajeTable).values({
      animalId: animalId ?? "",
      animalNombre: animalNombre ?? "",
      categoria: categoria ?? "",
      fecha: fecha ?? "",
      peso: Number(peso) || 0,
      bascula: bascula ?? "",
      operador: operador ?? "",
      observaciones: observaciones ?? "",
      condicionCorporal: Number(condicionCorporal) || 3,
      variacion: variacion != null ? Number(variacion) : null,
    }).returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PUT update pesaje record
router.put("/pesaje/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { animalId, animalNombre, categoria, fecha, peso, bascula, operador, observaciones, condicionCorporal, variacion } = req.body;
    const [row] = await db.update(pesajeTable).set({
      animalId: animalId ?? "",
      animalNombre: animalNombre ?? "",
      categoria: categoria ?? "",
      fecha: fecha ?? "",
      peso: Number(peso) || 0,
      bascula: bascula ?? "",
      operador: operador ?? "",
      observaciones: observaciones ?? "",
      condicionCorporal: Number(condicionCorporal) || 3,
      variacion: variacion != null ? Number(variacion) : null,
    }).where(eq(pesajeTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(row);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// DELETE pesaje record
router.delete("/pesaje/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(pesajeTable).where(eq(pesajeTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST bulk replace pesaje records
router.post("/pesaje/bulk", async (req, res) => {
  try {
    const { pesaje } = req.body as { pesaje: typeof pesajeTable.$inferInsert[] };
    if (!Array.isArray(pesaje)) return res.status(400).json({ error: "pesaje must be array" });
    await db.delete(pesajeTable);
    if (pesaje.length > 0) {
      await db.insert(pesajeTable).values(
        pesaje.map(p => ({
          animalId: p.animalId ?? "",
          animalNombre: p.animalNombre ?? "",
          categoria: p.categoria ?? "",
          fecha: p.fecha ?? "",
          peso: Number(p.peso) || 0,
          bascula: p.bascula ?? "",
          operador: p.operador ?? "",
          observaciones: p.observaciones ?? "",
          condicionCorporal: Number(p.condicionCorporal) || 3,
          variacion: p.variacion != null ? Number(p.variacion) : null,
        }))
      );
    }
    const rows = await db.select().from(pesajeTable).orderBy(pesajeTable.fecha);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
