import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, potrerosTable } from "@workspace/db";

const router = Router();

router.get("/potreros", async (_req, res) => {
  try {
    const rows = await db.select().from(potrerosTable).orderBy(potrerosTable.id);
    const potreros = rows.map(({ createdAt: _c, updatedAt: _u, ...r }) => r);
    res.json(potreros);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get("/potreros/:id", async (req, res) => {
  try {
    const rows = await db.select().from(potrerosTable).where(eq(potrerosTable.id, Number(req.params.id)));
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    const { createdAt: _c, updatedAt: _u, ...potrero } = rows[0];
    res.json(potrero);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/potreros", async (req, res) => {
  try {
    const { id: _id, ...body } = req.body;
    const [row] = await db.insert(potrerosTable).values(body).returning();
    const { createdAt: _c, updatedAt: _u, ...potrero } = row;
    res.status(201).json(potrero);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/potreros/bulk", async (req, res) => {
  try {
    const { potreros } = req.body as { potreros: Record<string, unknown>[] };
    await db.delete(potrerosTable);
    if (potreros && potreros.length > 0) {
      const rows = potreros.map(({ id: _id, ...p }) => p);
      await db.insert(potrerosTable).values(rows as typeof potrerosTable.$inferInsert[]);
    }
    res.json({ ok: true, count: potreros?.length ?? 0 });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.put("/potreros/:id", async (req, res) => {
  try {
    const { id: _id, ...body } = req.body;
    const [row] = await db
      .update(potrerosTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(potrerosTable.id, Number(req.params.id)))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    const { createdAt: _c, updatedAt: _u, ...potrero } = row;
    res.json(potrero);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.delete("/potreros/:id", async (req, res) => {
  try {
    await db.delete(potrerosTable).where(eq(potrerosTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
