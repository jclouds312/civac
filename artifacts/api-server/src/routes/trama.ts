import { Router } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { db, animalTramaTable } from '@workspace/db';
import { authMiddleware, type AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/trama
 * Create a new trama (weighing traceability record)
 */
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
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
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { animalId, operadorId, fecha } = req.query;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const offset = parseInt(req.query.offset as string) || 0;

    const filters = [];
    if (animalId) filters.push(eq(animalTramaTable.animalId, Number(animalId)));
    if (operadorId) filters.push(eq(animalTramaTable.operadorId, Number(operadorId)));

    const tramas = await db
      .select()
      .from(animalTramaTable)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(animalTramaTable.createdAt))
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
router.get('/:id/receipt', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const trama = await db
      .select()
      .from(animalTramaTable)
      .where(eq(animalTramaTable.id, Number(Array.isArray(id) ? id[0] : id)));

    if (!trama[0]) return res.status(404).json({ error: 'Trama not found' });

    res.json({ receipt: trama[0] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
