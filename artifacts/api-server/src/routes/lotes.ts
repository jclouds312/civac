import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, movimientosLoteTable } from "@workspace/db";

const router = Router();

// GET all movimientos
router.get("/lotes", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(movimientosLoteTable)
      .orderBy(desc(movimientosLoteTable.createdAt));
    const data = rows.map(({ createdAt: _c, ...r }) => r);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET single movimiento
router.get("/lotes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await db
      .select()
      .from(movimientosLoteTable)
      .where(eq(movimientosLoteTable.id, id));
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    const { createdAt: _c, ...row } = rows[0];
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST create movimiento
router.post("/lotes", async (req, res) => {
  try {
    const body = req.body as typeof movimientosLoteTable.$inferInsert;
    // Auto-calculate promedio and valor total
    const cantidad = body.cantidadAnimales ?? 0;
    const pesoTotal = body.pesoTotalLote ?? 0;
    const costoKilo = body.costoKilo ?? 0;
    const promedio = cantidad > 0 ? pesoTotal / cantidad : 0;
    const valorTotal = costoKilo * pesoTotal;

    const [row] = await db
      .insert(movimientosLoteTable)
      .values({ ...body, promedioPesoAnimal: promedio, valorTotalLote: valorTotal })
      .returning();
    const { createdAt: _c, ...result } = row;
    res.status(201).json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// PUT update movimiento
router.put("/lotes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as typeof movimientosLoteTable.$inferInsert;
    const cantidad = body.cantidadAnimales ?? 0;
    const pesoTotal = body.pesoTotalLote ?? 0;
    const costoKilo = body.costoKilo ?? 0;
    const promedio = cantidad > 0 ? pesoTotal / cantidad : 0;
    const valorTotal = costoKilo * pesoTotal;

    const [row] = await db
      .update(movimientosLoteTable)
      .set({ ...body, promedioPesoAnimal: promedio, valorTotalLote: valorTotal })
      .where(eq(movimientosLoteTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    const { createdAt: _c, ...result } = row;
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// DELETE movimiento
router.delete("/lotes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(movimientosLoteTable).where(eq(movimientosLoteTable.id, id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST bulk replace
router.post("/lotes/bulk", async (req, res) => {
  try {
    const { lotes } = req.body as { lotes: typeof movimientosLoteTable.$inferInsert[] };
    await db.delete(movimientosLoteTable);
    if (lotes && lotes.length > 0) {
      await db.insert(movimientosLoteTable).values(lotes);
    }
    res.json({ ok: true, count: lotes?.length ?? 0 });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
