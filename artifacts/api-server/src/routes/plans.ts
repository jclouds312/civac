import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, plansTable } from "@workspace/db";

const router = Router();

const DEFAULT_PLANS = [
  {
    code: "basic",
    name: "Básico",
    nameLong: "Plan Básico CIVAC",
    priceMonthly: 0,
    maxAnimals: 50,
    maxUsers: 1,
    maxGpsCollars: 2,
    features: JSON.stringify(["Inventario", "Producción", "Alertas", "Pesaje manual", "App PWA"]),
    colorPrimary: "#00f5d4",
    colorSecondary: "#00c8ff",
    colorAccent: "#39ff7e",
    badgeLabel: "GRATIS",
    active: true,
  },
  {
    code: "pro",
    name: "PRO",
    nameLong: "Plan PRO CIVAC",
    priceMonthly: 89000,
    maxAnimals: 300,
    maxUsers: 5,
    maxGpsCollars: 10,
    features: JSON.stringify(["Todo Básico", "GPS Bovino", "Reproducción", "Genética", "Pesaje BT", "Multi-Finca", "Predicción IA", "Huella CO₂", "Fotos animales"]),
    colorPrimary: "#00c8ff",
    colorSecondary: "#7c3aed",
    colorAccent: "#a855f7",
    badgeLabel: "POPULAR",
    active: true,
  },
  {
    code: "platinum",
    name: "Platino",
    nameLong: "Plan Platino CIVAC",
    priceMonthly: 189000,
    maxAnimals: 2000,
    maxUsers: 20,
    maxGpsCollars: 50,
    features: JSON.stringify(["Todo PRO", "API pública", "Reportes BI", "Backup automático", "Soporte prioritario 24/7", "White-label"]),
    colorPrimary: "#ff9500",
    colorSecondary: "#fbbf24",
    colorAccent: "#f59e0b",
    badgeLabel: "PREMIUM",
    active: true,
  },
  {
    code: "enterprise",
    name: "Enterprise",
    nameLong: "Plan Enterprise CIVAC",
    priceMonthly: 490000,
    maxAnimals: 99999,
    maxUsers: 999,
    maxGpsCollars: 999,
    features: JSON.stringify(["Todo Platino", "Servidores dedicados", "SLA 99.9%", "Consultoría agro", "Integración ERP"]),
    colorPrimary: "#e2e8f0",
    colorSecondary: "#94a3b8",
    colorAccent: "#cbd5e1",
    badgeLabel: "CORPORATIVO",
    active: true,
  },
];

// Ensure plans exist helper
async function ensurePlans() {
  const rows = await db.select().from(plansTable).limit(1);
  if (!rows.length) {
    await db.insert(plansTable).values(DEFAULT_PLANS);
  }
}

// GET /api/plans
router.get("/plans", async (_req, res) => {
  try {
    await ensurePlans();
    const rows = await db.select().from(plansTable).where(eq(plansTable.active, true));
    const plans = rows.map(({ createdAt: _c, ...r }) => r);
    res.json(plans);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/plans/:code
router.get("/plans/:code", async (req, res) => {
  try {
    await ensurePlans();
    const rows = await db.select().from(plansTable)
      .where(eq(plansTable.code, req.params.code)).limit(1);
    if (!rows[0]) return res.status(404).json({ error: "Plan no encontrado" });
    const { createdAt: _c, ...plan } = rows[0];
    res.json(plan);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
