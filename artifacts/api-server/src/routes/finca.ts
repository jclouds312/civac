import { Router } from "express";
import { db, fincaConfigTable } from "@workspace/db";

const router = Router();

const DEFAULT_FINCA = {
  nombre: "Finca El Rancho Verde",
  nit: "900.123.456-7",
  municipio: "Bogotá",
  departamento: "Cundinamarca",
  telefono: "+57 310 555 1234",
  email: "contacto@ranchoverde.co",
  direccion: "Vereda El Bosque, Km 12 Vía Rural",
  planCode: "pro",
  themeMode: "dark",
  primaryColor: "#00f5d4",
  hectareasTotales: 27,
  capacidadTotal: 100,
};

// GET /api/finca
router.get("/finca", async (_req, res) => {
  try {
    const rows = await db.select().from(fincaConfigTable).limit(1);
    if (rows[0]) {
      const { updatedAt: _u, ...config } = rows[0];
      return res.json(config);
    }
    // Auto-create default config
    const [created] = await db.insert(fincaConfigTable).values(DEFAULT_FINCA).returning();
    const { updatedAt: _u, ...config } = created;
    res.json(config);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// PUT /api/finca
router.put("/finca", async (req, res) => {
  try {
    const rows = await db.select().from(fincaConfigTable).limit(1);

    if (rows[0]) {
      const [updated] = await db
        .update(fincaConfigTable)
        .set({ ...req.body, updatedAt: new Date() })
        .returning();
      const { updatedAt: _u, ...config } = updated;
      return res.json(config);
    }

    const [created] = await db
      .insert(fincaConfigTable)
      .values({ ...DEFAULT_FINCA, ...req.body })
      .returning();
    const { updatedAt: _u, ...config } = created;
    res.status(201).json(config);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
