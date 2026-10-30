import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, reproduccionTable } from "@workspace/db";

const router = Router();

router.get("/reproduccion", async (_req, res) => {
  try {
    const rows = await db.select().from(reproduccionTable).orderBy(reproduccionTable.id);
    const reproduccion = rows.map(({ id: _id, createdAt: _c, updatedAt: _u, ...r }) => r);
    res.json(reproduccion);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/reproduccion", async (req, res) => {
  try {
    const { id: _id, ...body } = req.body;
    const [row] = await db.insert(reproduccionTable).values(body).returning();
    const { id: _rid, createdAt: _c, updatedAt: _u, ...repro } = row;
    res.status(201).json(repro);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/reproduccion/bulk", async (req, res) => {
  try {
    const { reproduccion } = req.body as { reproduccion: Record<string, unknown>[] };
    await db.delete(reproduccionTable);
    if (reproduccion && reproduccion.length > 0) {
      const rows = reproduccion.map(({ id: _id, ...r }) => r);
      await db.insert(reproduccionTable).values(rows as typeof reproduccionTable.$inferInsert[]);
    }
    res.json({ ok: true, count: reproduccion?.length ?? 0 });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.put("/reproduccion/:id", async (req, res) => {
  try {
    const { id: _id, ...body } = req.body;
    const [row] = await db
      .update(reproduccionTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(reproduccionTable.id, Number(req.params.id)))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    const { id: _rid, createdAt: _c, updatedAt: _u, ...repro } = row;
    res.json(repro);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.delete("/reproduccion/:id", async (req, res) => {
  try {
    await db.delete(reproduccionTable).where(eq(reproduccionTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
