import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, gpsUbicacionesTable } from "@workspace/db";

const router = Router();

router.get("/gps", async (_req, res) => {
  try {
    const rows = await db.select().from(gpsUbicacionesTable).orderBy(gpsUbicacionesTable.nombre);
    res.json(rows.map(({ createdAt: _c, updatedAt: _u, ...r }) => r));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/gps", async (req, res) => {
  try {
    const [row] = await db.insert(gpsUbicacionesTable).values(req.body).returning();
    const { createdAt: _c, updatedAt: _u, ...gps } = row;
    res.status(201).json(gps);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/gps/bulk", async (req, res) => {
  try {
    const { ubicaciones } = req.body as { ubicaciones: typeof gpsUbicacionesTable.$inferInsert[] };
    await db.delete(gpsUbicacionesTable);
    if (ubicaciones && ubicaciones.length > 0) await db.insert(gpsUbicacionesTable).values(ubicaciones);
    res.json({ ok: true, count: ubicaciones?.length ?? 0 });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/gps/:id", async (req, res) => {
  try {
    const [row] = await db.update(gpsUbicacionesTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(gpsUbicacionesTable.id, Number(req.params.id)))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    const { createdAt: _c, updatedAt: _u, ...gps } = row;
    res.json(gps);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/gps/:id", async (req, res) => {
  try {
    await db.delete(gpsUbicacionesTable).where(eq(gpsUbicacionesTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
