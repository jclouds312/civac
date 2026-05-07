import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, alertasTable } from "@workspace/db";

const router = Router();

router.get("/alertas", async (_req, res) => {
  try {
    const rows = await db.select().from(alertasTable).orderBy(alertasTable.id);
    const alertas = rows.map(({ createdAt: _c, ...r }) => r);
    res.json(alertas);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/alertas", async (req, res) => {
  try {
    const { id: _id, ...body } = req.body;
    const [row] = await db.insert(alertasTable).values(body).returning();
    const { createdAt: _c, ...alerta } = row;
    res.status(201).json(alerta);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/alertas/bulk", async (req, res) => {
  try {
    const { alertas } = req.body as { alertas: Record<string, unknown>[] };
    await db.delete(alertasTable);
    if (alertas && alertas.length > 0) {
      const rows = alertas.map(({ id: _id, ...a }) => a);
      await db.insert(alertasTable).values(rows as typeof alertasTable.$inferInsert[]);
    }
    res.json({ ok: true, count: alertas?.length ?? 0 });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.put("/alertas/:id", async (req, res) => {
  try {
    const { id: _id, ...body } = req.body;
    const [row] = await db
      .update(alertasTable)
      .set(body)
      .where(eq(alertasTable.id, Number(req.params.id)))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    const { createdAt: _c, ...alerta } = row;
    res.json(alerta);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.delete("/alertas/:id", async (req, res) => {
  try {
    await db.delete(alertasTable).where(eq(alertasTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
