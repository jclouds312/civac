import { Router } from 'express';
import { db, animalTramaTable } from '@workspace/db';

const router = Router();

/**
 * POST /api/trama
 * Create a new trama (weighing traceability record)
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const {
      animalId, animalNombre, peso, dispositivoId, dispositivoNombre,
      operadorId, operadorNombre, lat, lng, lote, potrero,
      propietarioNombre, propietarioNit, destino, destinoTipo,
      precioKilo, valorTotal, eidRfid, observaciones
    } = req.body;

    if (!animalNombre || !peso || !dispositivoNombre || !operadorNombre) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const trama = await db
      .insert(animalTramaTable)
      .values({
        animalId: animalId || null,
        animalNombre,
        peso,
        dispositivoId,
        dispositivoNombre,
        operadorId,
        operadorNombre,
        lat: lat || null,
        lng: lng || null,
        lote: lote || null,
        potrero: potrero || null,
        propietarioNombre,
        propietarioNit,
        destino: destino || null,
        destinoTipo: destinoTipo || null,
        precioKilo: precioKilo || null,
        valorTotal: valorTotal || null,
        eidRfid: eidRfid || null,
        observaciones: observaciones || null,
      })
      .returning();

    res.status(201).json({ trama: trama[0] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/trama
 * Get trama history with filters
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { animalId, operadorId, fecha } = req.query;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const offset = parseInt(req.query.offset as string) || 0;

    let query = db.select().from(animalTramaTable);

    if (animalId) query = query.where((t) => t.animalId.eq(parseInt(animalId as string)));
    if (operadorId) query = query.where((t) => t.operadorId.eq(parseInt(operadorId as string)));

    const tramas = await query
      .orderBy((t) => ({ createdAt: t.createdAt }))
      .limit(limit)
      .offset(offset);

    res.json({ tramas, count: tramas.length });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/trama/:id/receipt
 * Generate receipt JSON for a trama
 */
router.get('/:id/receipt', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const trama = await db
      .select()
      .from(animalTramaTable)
      .where((t) => t.id.eq(parseInt(id)));

    if (!trama[0]) return res.status(404).json({ error: 'Trama not found' });

    res.json({ receipt: trama[0] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
