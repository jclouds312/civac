import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, insumosTable } from "@workspace/db";

const router = Router();

router.get("/insumos", async (_req, res) => {
  try {
    const rows = await db.select().from(insumosTable).orderBy(insumosTable.id);
    const insumos = rows.map(({ id: _id, createdAt: _c, updatedAt: _u, ...r }) => r);
    res.json(insumos);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/insumos", async (req, res) => {
  try {
    const { id: _id, ...body } = req.body;
    const [row] = await db.insert(insumosTable).values(body).returning();
    const { id: _rid, createdAt: _c, updatedAt: _u, ...insumo } = row;
    res.status(201).json(insumo);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/insumos/bulk", async (req, res) => {
  try {
    const { insumos } = req.body as { insumos: Record<string, unknown>[] };
    await db.delete(insumosTable);
    if (insumos && insumos.length > 0) {
      const rows = insumos.map(({ id: _id, ...i }) => i);
      await db.insert(insumosTable).values(rows as typeof insumosTable.$inferInsert[]);
    }
    res.json({ ok: true, count: insumos?.length ?? 0 });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.put("/insumos/:id", async (req, res) => {
  try {
    const { id: _id, ...body } = req.body;
    const [row] = await db
      .update(insumosTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(insumosTable.id, Number(req.params.id)))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    const { id: _rid, createdAt: _c, updatedAt: _u, ...insumo } = row;
    res.json(insumo);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.delete("/insumos/:id", async (req, res) => {
  try {
    await db.delete(insumosTable).where(eq(insumosTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
