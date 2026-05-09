import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usuariosTable } from "@workspace/db";

const router = Router();

router.get("/usuarios", async (_req, res) => {
  try {
    const rows = await db.select().from(usuariosTable).orderBy(usuariosTable.nombre);
    res.json(rows.map(({ createdAt: _c, updatedAt: _u, ...r }) => r));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/usuarios", async (req, res) => {
  try {
    const [row] = await db.insert(usuariosTable).values(req.body).returning();
    const { createdAt: _c, updatedAt: _u, ...u } = row;
    res.status(201).json(u);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/usuarios/bulk", async (req, res) => {
  try {
    const { usuarios } = req.body as { usuarios: typeof usuariosTable.$inferInsert[] };
    await db.delete(usuariosTable);
    if (usuarios && usuarios.length > 0) await db.insert(usuariosTable).values(usuarios);
    res.json({ ok: true, count: usuarios?.length ?? 0 });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/usuarios/:id", async (req, res) => {
  try {
    const [row] = await db.update(usuariosTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(usuariosTable.id, req.params.id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    const { createdAt: _c, updatedAt: _u, ...u } = row;
    res.json(u);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/usuarios/:id", async (req, res) => {
  try {
    await db.delete(usuariosTable).where(eq(usuariosTable.id, req.params.id));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
