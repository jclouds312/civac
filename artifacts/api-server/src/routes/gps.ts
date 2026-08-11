import { Router } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { dispositivosGpsTable, gpsTracksTable, geofenceAlertsTable } from '@/lib/db/src/schema/gps';

const router = Router();

/**
 * GET /api/gps/dispositivos
 * List all GPS devices for a user
 */
router.get('/dispositivos', async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const devices = await db
      .select()
      .from(dispositivosGpsTable)
      .where(eq(dispositivosGpsTable.userId, userId));

    res.json({ devices });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/gps/dispositivos
 * Create a new GPS device
 */
router.post('/dispositivos', async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { imei, tipo, fabricante, modelo, protocolo, potreroId } = req.body;
    if (!imei || !tipo || !fabricante || !modelo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = await db
      .insert(dispositivosGpsTable)
      .values({
        userId,
        imei,
        tipo,
        fabricante,
        modelo,
        protocolo: protocolo || null,
        potreroId: potreroId || null,
        estado: 'activo',
      })
      .returning();

    res.status(201).json({ device: device[0] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * PATCH /api/gps/dispositivos/:id
 * Update a GPS device
 */
router.patch('/dispositivos/:id', async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { animalId, potreroId, estado, bateria } = req.body;

    const updated = await db
      .update(dispositivosGpsTable)
      .set({ animalId, potreroId, estado, bateria, updatedAt: new Date() })
      .where(and(
        eq(dispositivosGpsTable.id, parseInt(id)),
        eq(dispositivosGpsTable.userId, userId),
      ))
      .returning();

    res.json({ device: updated[0] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * DELETE /api/gps/dispositivos/:id
 * Delete a GPS device
 */
router.delete('/dispositivos/:id', async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    await db
      .delete(dispositivosGpsTable)
      .where(and(
        eq(dispositivosGpsTable.id, parseInt(id)),
        eq(dispositivosGpsTable.userId, userId),
      ));

    res.json({ message: 'Device deleted' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/gps/tracks
 * Create GPS track breadcrumbs
 */
router.post('/tracks', async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { dispositivoId, lat, lng, speed, altitude, precision, potreroId, rawData } = req.body;
    if (!dispositivoId || !lat || !lng) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const track = await db
      .insert(gpsTracksTable)
      .values({
        dispositivoId,
        lat,
        lng,
        speed: speed || null,
        altitude: altitude || null,
        precision: precision || null,
        potreroId: potreroId || null,
        rawData: rawData || null,
      })
      .returning();

    res.status(201).json({ track: track[0] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/gps/tracks/:deviceId
 * Get paginated track history for a device
 */
router.get('/tracks/:deviceId', async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { deviceId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const offset = parseInt(req.query.offset as string) || 0;

    const tracks = await db
      .select()
      .from(gpsTracksTable)
      .where(eq(gpsTracksTable.dispositivoId, parseInt(deviceId)))
      .orderBy(gpsTracksTable.timestamp)
      .limit(limit)
      .offset(offset);

    res.json({ tracks, count: tracks.length });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
