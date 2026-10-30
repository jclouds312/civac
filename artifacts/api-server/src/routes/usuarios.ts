import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usuariosTable } from "@workspace/db";
import { authMiddleware, type AuthRequest } from "../middleware/auth";

const router = Router();

function staffExportMiddleware(req: AuthRequest, res: Parameters<typeof adminOnlyMiddleware>[1], next: Parameters<typeof adminOnlyMiddleware>[2]) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (!["admin", "superadmin", "developer", "staff"].includes(req.user.role)) {
    return res.status(403).json({ error: "Admin or CIVAC staff access required" });
  }
  next();
}

router.get("/usuarios/export", authMiddleware, staffExportMiddleware, async (_req, res) => {
  try {
    const rows = await db.select().from(usuariosTable).orderBy(usuariosTable.nombre);
    const columns = ["id", "nombre", "email", "role", "cargo", "finca", "planCode", "estado", "activo", "lastLogin", "loginCount", "createdAt"] as const;
    const escapeCsv = (value: unknown) => {
      const text = value instanceof Date ? value.toISOString() : String(value ?? "");
      return `"${text.replaceAll('"', '""')}"`;
    };
    const csv = [columns.join(","), ...rows.map(row => columns.map(column => escapeCsv(row[column])).join(","))].join("\\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="civac-cuentas-${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(`\\ufeff${csv}`);
  } catch {
    return res.status(503).json({ error: "No fue posible exportar las cuentas" });
  }
});

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
