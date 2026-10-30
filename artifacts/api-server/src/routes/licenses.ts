import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { randomUUID, createHmac } from "crypto";
import { db, licenciasTable, usuariosTable, planAsignacionesTable, auditLogTable } from "@workspace/db";
import { authMiddleware, adminOnlyMiddleware, type AuthRequest } from "../middleware/auth";

const router = Router();

/* ── Firma HMAC de licencia ──────────────────────────────────────────────── */
function signLicense(payload: object): string {
  const secret = process.env.LICENSE_SECRET ?? "civac_license_secret_2026";
  return createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex")
    .slice(0, 32);
}

/* ── POST /api/licenses/generate ── admin genera licencia para user ────── */
router.post("/licenses/generate", authMiddleware, adminOnlyMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      userId, planCode, diasValidos = 30, sessionLimit = 1,
      maxAnimales = 50, maxUsuarios = 1, notas = "",
      generadaPor = "admin",
    } = req.body as {
      userId: string; planCode: string; diasValidos?: number;
      sessionLimit?: number; maxAnimales?: number; maxUsuarios?: number;
      notas?: string; generadaPor?: string;
    };
    if (!userId || !planCode) return res.status(400).json({ error: "userId y planCode requeridos" });

    /* buscar usuario para completar datos */
    let userEmail = userId;
    let userNombre = userId;
    try {
      const rows = await db.select().from(usuariosTable).where(eq(usuariosTable.id, userId)).limit(1);
      if (rows[0]) { userEmail = rows[0].email; userNombre = rows[0].nombre; }
    } catch { /* tabla no lista todavía */ }

    const id = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + diasValidos);

    const payload = { id, userId, planCode, diasValidos, sessionLimit, maxAnimales, maxUsuarios };
    const signature = signLicense(payload);

    const permisos = getPermisosByPlan(planCode);

    try {
      await db.insert(licenciasTable).values({
        id, userId, userEmail, userNombre, planCode, diasValidos,
        sessionLimit, maxAnimales, maxUsuarios, permisos: JSON.stringify(permisos),
        signature, estado: "activa", generadaPor, notas, expiresAt,
      });
    } catch { /* offline or table missing — continue */ }

    /* audit */
    try {
      await db.insert(auditLogTable).values({
        userId: generadaPor, userEmail: generadaPor, userRole: "admin",
        accion: "generate_license", entidad: "licencia", entidadId: id,
        detalles: JSON.stringify({ userId, planCode, diasValidos }),
      });
    } catch { /* skip */ }

    /* actualizar plan del usuario en DB */
    try {
      await db.update(usuariosTable).set({ planCode, planExpiry: expiresAt }).where(eq(usuariosTable.id, userId));
    } catch { /* skip */ }

    const licenseData = {
      id,
      tipo: "civac_license_v2",
      version: "2.0",
      generada: new Date().toISOString(),
      userId, userEmail, userNombre,
      plan: { code: planCode, label: getPlanLabel(planCode), dias: diasValidos },
      limites: { sesiones: sessionLimit, animales: maxAnimales, usuarios: maxUsuarios },
      permisos,
      expira: expiresAt.toISOString().slice(0, 10),
      signature,
      issuer: "CIVAC Colombia · civac.co",
      instrucciones: [
        "1. Abre GanaderIA en tu dispositivo",
        "2. Ve a Configuración → Licencia → Importar",
        "3. Selecciona este archivo .json",
        `4. Tu plan ${getPlanLabel(planCode)} estará activo por ${diasValidos} días`,
      ],
    };

    res.json({ ok: true, license: licenseData, id });
  } catch (err) {
    res.status(500).json({ error: "Error generando licencia", detail: String(err) });
  }
});

/* ── GET /api/licenses/download/:id ── descarga exclusiva del propietario ── */
router.get("/licenses/download/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user || req.user.userId === "anon") return res.status(401).json({ ok: false, error: "Sesión requerida" });
    const rows = await db.select().from(licenciasTable).where(eq(licenciasTable.id, req.params.id)).limit(1);
    const license = rows[0];
    const isStaff = ["admin", "superadmin", "developer"].includes(req.user.role);
    if (!license || (!isStaff && license.userId !== req.user.userId)) {
      return res.status(404).json({ ok: false, error: "Licencia no disponible para esta cuenta" });
    }
    if (license.estado !== "activa" || new Date(license.expiresAt) <= new Date()) {
      return res.status(410).json({ ok: false, error: "La licencia está vencida o revocada" });
    }
    const permisos = typeof license.permisos === "string" ? JSON.parse(license.permisos) : license.permisos;
    const file = {
      id: license.id,
      tipo: "civac_license_v2",
      version: "2.0",
      generada: license.createdAt,
      userId: license.userId,
      userEmail: license.userEmail,
      userNombre: license.userNombre,
      plan: { code: license.planCode, label: getPlanLabel(license.planCode), dias: license.diasValidos },
      limites: { sesiones: license.sessionLimit, animales: license.maxAnimales, usuarios: license.maxUsuarios },
      permisos,
      expira: new Date(license.expiresAt).toISOString().slice(0, 10),
      signature: license.signature,
      issuer: "CIVAC Colombia · civac.co",
    };
    await db.update(licenciasTable).set({ descargada: true, descargadaAt: new Date() }).where(eq(licenciasTable.id, license.id));
    res.setHeader("Content-Disposition", `attachment; filename=civac-${license.userId}-${license.planCode}.json`);
    res.type("application/json").send(JSON.stringify(file, null, 2));
  } catch (err) {
    res.status(500).json({ ok: false, error: "Error descargando la licencia", detail: String(err) });
  }
});

/* ── POST /api/licenses/validate ── validar archivo de licencia ─────────── */
router.post("/licenses/validate", async (req, res) => {
  try {
    const { license } = req.body as { license: { id: string; signature: string; userId: string; plan: { code: string; dias: number }; limites: Record<string,number> } };
    if (!license?.id || !license?.signature) return res.status(400).json({ error: "Licencia inválida" });

    const payload = {
      id: license.id,
      userId: license.userId,
      planCode: license.plan.code,
      diasValidos: license.plan.dias,
      sessionLimit: license.limites.sesiones,
      maxAnimales: license.limites.animales,
      maxUsuarios: license.limites.usuarios,
    };
    const expected = signLicense(payload);
    const valid = expected === license.signature;

    if (!valid) return res.status(403).json({ ok: false, error: "Firma de licencia inválida" });

    /* marcar como descargada en DB */
    try {
      await db.update(licenciasTable)
        .set({ descargada: true, descargadaAt: new Date() })
        .where(eq(licenciasTable.id, license.id));
    } catch { /* skip */ }

    res.json({ ok: true, valid: true, plan: license.plan.code });
  } catch (err) {
    res.status(500).json({ error: "Error validando licencia", detail: String(err) });
  }
});

/* ── GET /api/licenses ── listar licencias (admin) ─────────────────────── */
router.get("/licenses", authMiddleware, adminOnlyMiddleware, async (req: AuthRequest, res) => {
  try {
    const rows = await db.select().from(licenciasTable).orderBy(desc(licenciasTable.createdAt)).limit(100);
    res.json({ ok: true, licenses: rows });
  } catch (err) {
    res.status(500).json({ error: "Error listando licencias", detail: String(err) });
  }
});

/* ── GET /api/licenses/user/:userId ── licencias de un usuario ───────────── */
router.get("/licenses/user/:userId", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user || (req.user.userId !== req.params.userId && !["admin", "superadmin", "developer"].includes(req.user.role))) {
    return res.status(403).json({ ok: false, error: "Solo puedes consultar tus propias licencias." });
  }
  try {
    const { userId } = req.params;
    const rows = await db.select().from(licenciasTable)
      .where(eq(licenciasTable.userId, userId))
      .orderBy(desc(licenciasTable.createdAt))
      .limit(20);
    res.json({ ok: true, licenses: rows });
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo licencias del usuario", detail: String(err) });
  }
});

/* ── POST /api/licenses/revoke/:id ── revocar licencia ─────────────────── */
router.post("/licenses/revoke/:id", authMiddleware, adminOnlyMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { revokedPor = "admin" } = req.body ?? {};
    await db.update(licenciasTable)
      .set({ estado: "revocada", revokedAt: new Date(), revokedPor })
      .where(eq(licenciasTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error revocando licencia", detail: String(err) });
  }
});

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function getPlanLabel(code: string): string {
  const map: Record<string, string> = { basico: "Básico", pro: "PRO", premium: "Premium", platino: "Platino" };
  return map[code] ?? code;
}

function getPermisosByPlan(plan: string): string[] {
  const base = ["alertas","inventario","produccion","potreros"];
  const pro  = [...base,"reproduccion","genetica","pesaje","ficha","alimentacion","gps","gps-chips","insumos","semen","costos","personal","multifinca","prediccion","ventas","asesora","sanidad","trazabilidad"];
  const prem = [...pro,"pesaje-manual","co2","lotes","datos","drive"];
  const plat = [...prem,"usuarios","configuracion","documentacion","manual","planes"];
  const map: Record<string,string[]> = { basico: base, pro, premium: prem, platino: plat };
  return map[plan] ?? base;
}

export default router;
