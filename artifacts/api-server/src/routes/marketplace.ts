import { Router } from 'express';
import { db, marketplaceListingsTable, marketplaceDealsTable, marketplaceMessagesTable, marketplaceCommissionLedgerTable } from '@workspace/db';

const router = Router();

/**
 * GET /api/marketplace/listings
 * Get marketplace listings with filters
 */
router.get('/listings', async (req, res) => {
  try {
    const { categoria, departamento, condicion } = req.query;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const offset = parseInt(req.query.offset as string) || 0;

    let query = db.select().from(marketplaceListingsTable);

    if (categoria) query = query.where((t) => t.categoria.eq(categoria as string));
    if (departamento) query = query.where((t) => t.departamento.eq(departamento as string));
    if (condicion) query = query.where((t) => t.condicion.eq(condicion as string));

    const listings = await query
      .orderBy((t) => ({ createdAt: t.createdAt }))
      .limit(limit)
      .offset(offset);

    res.json({ listings, count: listings.length });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/marketplace/listings
 * Create a new listing
 */
router.post('/listings', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { titulo, descripcion, categoria, marca, modelo, precioCop, condicion, departamento, municipio, fotosJson } = req.body;

    if (!titulo || !categoria || !precioCop || !condicion || !departamento) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const listing = await db
      .insert(marketplaceListingsTable)
      .values({
        userId,
        titulo,
        descripcion: descripcion || null,
        categoria,
        marca: marca || null,
        modelo: modelo || null,
        precioCop,
        condicion,
        departamento,
        municipio: municipio || null,
        fotosJson: fotosJson || null,
        estado: 'activo',
      })
      .returning();

    res.status(201).json({ listing: listing[0] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * PATCH /api/marketplace/listings/:id
 * Update a listing
 */
router.patch('/listings/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { titulo, descripcion, precioCop, condicion, estado } = req.body;

    const updated = await db
      .update(marketplaceListingsTable)
      .set({ titulo, descripcion, precioCop, condicion, estado, updatedAt: new Date() })
      .where((t) => t.id.eq(parseInt(id)).and(t.userId.eq(userId)))
      .returning();

    res.json({ listing: updated[0] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * DELETE /api/marketplace/listings/:id
 * Delete a listing
 */
router.delete('/listings/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    await db
      .delete(marketplaceListingsTable)
      .where((t) => t.id.eq(parseInt(id)).and(t.userId.eq(userId)));

    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/marketplace/deals
 * Close a deal
 */
router.post('/deals', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { listingId, sellerId, buyerId, precioAcordado, comisionPct = 3 } = req.body;

    if (!listingId || !sellerId || !buyerId || !precioAcordado) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const comisionCop = (precioAcordado * comisionPct) / 100;

    const deal = await db
      .insert(marketplaceDealsTable)
      .values({
        listingId,
        sellerId,
        buyerId,
        precioAcordado,
        comisionPct,
        comisionCop,
        estado: 'abierto',
      })
      .returning();

    res.status(201).json({ deal: deal[0] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * PATCH /api/marketplace/deals/:id/close
 * Close a deal
 */
router.patch('/deals/:id/close', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;

    const updated = await db
      .update(marketplaceDealsTable)
      .set({ estado: 'cerrado', closedAt: new Date() })
      .where((t) => t.id.eq(parseInt(id)))
      .returning();

    res.json({ deal: updated[0] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/marketplace/messages
 * Send a message
 */
router.post('/messages', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { dealId, listingId, toUserId, mensaje } = req.body;

    if (!mensaje || !toUserId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const message = await db
      .insert(marketplaceMessagesTable)
      .values({
        dealId: dealId || null,
        listingId: listingId || null,
        fromUserId: userId,
        toUserId,
        mensaje,
        leido: false,
      })
      .returning();

    res.status(201).json({ message: message[0] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
