import { Router } from "express";

const router = Router();

/* ── CIVAC v1 — CRM Sales Endpoint ───────────────────────────────────────────
   Simple in-memory CRM store for the API server.
   In production, replace with a real database (PostgreSQL).
   ─────────────────────────────────────────────────────────────────────────── */

interface CrmContact {
  id: string;
  deviceId?: string;
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  tipo: string;
  estado: string;
  planInteres: string;
  valor: number;
  fecha: string;
  notas?: string;
  seguimiento?: string;
  syncedAt: string;
}

const contacts: CrmContact[] = [];

/* POST /api/crm/contacts — Upsert contacts from PWA */
router.post("/crm/contacts", (req, res) => {
  try {
    const { data, deviceId } = req.body;
    if (!Array.isArray(data)) return res.status(400).json({ ok: false, message: "data debe ser un array" });

    let upserted = 0;
    for (const c of data) {
      const idx = contacts.findIndex(x => x.id === c.id);
      const record: CrmContact = { ...c, deviceId, syncedAt: new Date().toISOString() };
      if (idx >= 0) contacts[idx] = record;
      else { contacts.push(record); }
      upserted++;
    }
    return res.json({ ok: true, upserted, total: contacts.length });
  } catch { return res.status(500).json({ ok: false, message: "Error procesando contactos" }); }
});

/* GET /api/crm/contacts — Get all contacts */
router.get("/crm/contacts", (_req, res) => {
  return res.json({ ok: true, total: contacts.length, contacts });
});

/* GET /api/crm/stats — Sales statistics */
router.get("/crm/stats", (_req, res) => {
  const compradores   = contacts.filter(c => c.estado === "comprador");
  const pipeline      = contacts.filter(c => !["comprador","no_interesado"].includes(c.estado));
  const ingresosTotal = compradores.reduce((s, c) => s + (c.valor || 0), 0);
  const pipelineTotal = pipeline.reduce((s, c) => s + (c.valor || 0), 0);

  return res.json({
    ok: true,
    total: contacts.length,
    compradores: compradores.length,
    pipeline: pipeline.length,
    lista_espera: contacts.filter(c => c.estado === "lista_espera").length,
    ingresosCOP: ingresosTotal,
    pipelineCOP: pipelineTotal,
    conversion: contacts.length ? Math.round(compradores.length / contacts.length * 100) : 0,
  });
});

export default router;
