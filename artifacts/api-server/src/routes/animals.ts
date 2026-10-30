import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, animalsTable } from "@workspace/db";

const router = Router();

// GET all animals
router.get("/animals", async (_req, res) => {
  try {
    const rows = await db.select().from(animalsTable).orderBy(animalsTable.id);
    const animals = rows.map(({ createdAt: _c, updatedAt: _u, ...r }) => r);
    res.json(animals);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET single animal
router.get("/animals/:id", async (req, res) => {
  try {
    const rows = await db.select().from(animalsTable).where(eq(animalsTable.id, req.params.id));
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    const { createdAt: _c, updatedAt: _u, ...animal } = rows[0];
    res.json(animal);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST create animal
router.post("/animals", async (req, res) => {
  try {
    const [row] = await db.insert(animalsTable).values(req.body).returning();
    const { createdAt: _c, updatedAt: _u, ...animal } = row;
    res.status(201).json(animal);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST bulk replace all animals
router.post("/animals/bulk", async (req, res) => {
  try {
    const { animals } = req.body as { animals: typeof animalsTable.$inferInsert[] };
    await db.delete(animalsTable);
    if (animals && animals.length > 0) {
      await db.insert(animalsTable).values(animals);
    }
    res.json({ ok: true, count: animals?.length ?? 0 });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// PUT update animal
router.put("/animals/:id", async (req, res) => {
  try {
    const [row] = await db
      .update(animalsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(animalsTable.id, req.params.id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    const { createdAt: _c, updatedAt: _u, ...animal } = row;
    res.json(animal);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// DELETE animal
router.delete("/animals/:id", async (req, res) => {
  try {
    await db.delete(animalsTable).where(eq(animalsTable.id, req.params.id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
