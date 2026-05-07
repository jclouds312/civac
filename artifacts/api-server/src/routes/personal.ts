import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, personalTable } from "@workspace/db";

const router = Router();

router.get("/personal", async (_req, res) => {
  try {
    const rows = await db.select().from(personalTable).orderBy(personalTable.id);
    const personal = rows.map(({ id: _id, createdAt: _c, updatedAt: _u, ...r }) => r);
    res.json(personal);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/personal", async (req, res) => {
  try {
    const { id: _id, ...body } = req.body;
    const [row] = await db.insert(personalTable).values(body).returning();
    const { id: _rid, createdAt: _c, updatedAt: _u, ...person } = row;
    res.status(201).json(person);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/personal/bulk", async (req, res) => {
  try {
    const { personal } = req.body as { personal: Record<string, unknown>[] };
    await db.delete(personalTable);
    if (personal && personal.length > 0) {
      const rows = personal.map(({ id: _id, ...p }) => p);
      await db.insert(personalTable).values(rows as typeof personalTable.$inferInsert[]);
    }
    res.json({ ok: true, count: personal?.length ?? 0 });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.put("/personal/:id", async (req, res) => {
  try {
    const { id: _id, ...body } = req.body;
    const [row] = await db
      .update(personalTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(personalTable.id, Number(req.params.id)))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    const { id: _rid, createdAt: _c, updatedAt: _u, ...person } = row;
    res.json(person);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.delete("/personal/:id", async (req, res) => {
  try {
    await db.delete(personalTable).where(eq(personalTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
