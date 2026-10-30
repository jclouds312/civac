import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, pesajesTable } from "@workspace/db";

const router = Router();

router.get("/pesajes", async (_req, res) => {
  try {
    const rows = await db.select().from(pesajesTable).orderBy(desc(pesajesTable.createdAt));
    res.json(rows.map(({ createdAt: _c, ...r }) => r));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get("/pesajes/animal/:id", async (req, res) => {
  try {
    const rows = await db.select().from(pesajesTable).where(eq(pesajesTable.animalId, req.params.id)).orderBy(desc(pesajesTable.createdAt));
    res.json(rows.map(({ createdAt: _c, ...r }) => r));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/pesajes", async (req, res) => {
  try {
    const [row] = await db.insert(pesajesTable).values(req.body).returning();
    const { createdAt: _c, ...pesaje } = row;
    res.status(201).json(pesaje);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/pesajes/bulk", async (req, res) => {
  try {
    const { pesajes } = req.body as { pesajes: typeof pesajesTable.$inferInsert[] };
    await db.delete(pesajesTable);
    if (pesajes && pesajes.length > 0) await db.insert(pesajesTable).values(pesajes);
    res.json({ ok: true, count: pesajes?.length ?? 0 });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/pesajes/:id", async (req, res) => {
  try {
    await db.delete(pesajesTable).where(eq(pesajesTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
