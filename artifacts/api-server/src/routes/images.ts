import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db, imagesTable } from "@workspace/db";

const router = Router();

// GET /api/images?entityType=animal&entityId=A-0042
router.get("/images", async (req, res) => {
  try {
    const { entityType, entityId } = req.query as { entityType?: string; entityId?: string };
    const conditions = [];
    if (entityType) conditions.push(eq(imagesTable.entityType, entityType));
    if (entityId) conditions.push(eq(imagesTable.entityId, entityId));

    const rows = conditions.length
      ? await db.select({
          id: imagesTable.id,
          entityType: imagesTable.entityType,
          entityId: imagesTable.entityId,
          filename: imagesTable.filename,
          mimetype: imagesTable.mimetype,
          sizeBytes: imagesTable.sizeBytes,
          width: imagesTable.width,
          height: imagesTable.height,
          createdAt: imagesTable.createdAt,
        }).from(imagesTable).where(and(...conditions))
      : [];
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/images/:id  — returns full record including dataUrl
router.get("/images/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
    const rows = await db.select().from(imagesTable).where(eq(imagesTable.id, id)).limit(1);
    if (!rows[0]) return res.status(404).json({ error: "No encontrada" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/images — stores base64 dataUrl in DB
router.post("/images", async (req, res) => {
  try {
    const { entityType, entityId, filename, mimetype, dataUrl, sizeBytes, width, height } =
      req.body as {
        entityType: string; entityId: string; filename?: string;
        mimetype?: string; dataUrl: string; sizeBytes?: number;
        width?: number; height?: number;
      };

    if (!entityType || !entityId || !dataUrl) {
      return res.status(400).json({ error: "entityType, entityId y dataUrl son requeridos" });
    }

    // Limit dataUrl size to ~4 MB
    if (dataUrl.length > 4_200_000) {
      return res.status(413).json({ error: "Imagen demasiado grande (máx 4 MB)" });
    }

    const [row] = await db.insert(imagesTable).values({
      entityType,
      entityId,
      filename: filename ?? "foto.jpg",
      mimetype: mimetype ?? "image/jpeg",
      dataUrl,
      sizeBytes: sizeBytes ?? Math.round(dataUrl.length * 0.75),
      width: width ?? null,
      height: height ?? null,
    }).returning();

    // Return metadata only (no dataUrl to keep response small)
    const { dataUrl: _d, ...meta } = row;
    res.status(201).json(meta);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// DELETE /api/images/:id
router.delete("/images/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
    await db.delete(imagesTable).where(eq(imagesTable.id, id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
