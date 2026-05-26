/* ─────────────────────────────────────────────────────────────────────────
   CIVAC v1 — Cloud Sync Module
   Esquema de sincronización offline → servidor padre
   ───────────────────────────────────────────────────────────────────────── */

export interface SyncPayload {
  version:     string;
  deviceId:    string;
  timestamp:   string;
  appVersion:  'civac-v1';
  schema:      'civac-sync-v1';
  data: {
    accounts:     unknown[];
    animals:      unknown[];
    pesajes:      unknown[];
    sesiones:     unknown[];
    alertas:      unknown[];
    payments:     unknown[];
    contacts_crm: unknown[];
    sales_crm:    unknown[];
  };
  meta: {
    totalRecords: number;
    offlineSince: string | null;
    lastSyncAt:   string | null;
    planId:       string;
    userId:       string;
  };
}

const DEVICE_ID_KEY   = 'civac_device_id';
const SYNC_QUEUE_KEY  = 'civac_sync_queue';
const LAST_SYNC_KEY   = 'civac_last_sync';
const OFFLINE_SINCE_KEY = 'civac_offline_since';

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `DEV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function buildSyncPayload(userId: string, planId: string): SyncPayload {
  const get = (key: string) => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : []; } catch { return []; } };
  const accounts   = get('ganader_accounts');
  const animals    = get('ganader_animals');
  const pesajes    = get('ganader_pesajes');
  const alertas    = get('ganader_alertas');
  const payments   = get('ganader_wompi_payments');
  const contacts   = get('civac_crm_contacts');
  const sales      = get('civac_crm_sales');
  const sesiones   = get('civac_sesiones');
  const lastSync   = localStorage.getItem(LAST_SYNC_KEY);
  const offlineSince = localStorage.getItem(OFFLINE_SINCE_KEY);
  const total = accounts.length + animals.length + pesajes.length + alertas.length + payments.length + contacts.length + sales.length;

  return {
    version:    '1.0.0',
    deviceId:   getDeviceId(),
    timestamp:  new Date().toISOString(),
    appVersion: 'civac-v1',
    schema:     'civac-sync-v1',
    data: { accounts, animals, pesajes, sesiones, alertas, payments, contacts_crm: contacts, sales_crm: sales },
    meta: { totalRecords: total, offlineSince, lastSyncAt: lastSync, planId, userId },
  };
}

export function markSynced() {
  const now = new Date().toISOString();
  localStorage.setItem(LAST_SYNC_KEY, now);
  localStorage.removeItem(OFFLINE_SINCE_KEY);
}

export function queueForSync(record: { type: string; id: string; data: unknown }) {
  const queue = getSyncQueue();
  const exists = queue.findIndex(q => q.type === record.type && q.id === record.id);
  if (exists >= 0) queue[exists] = { ...record, ts: new Date().toISOString() };
  else queue.push({ ...record, ts: new Date().toISOString() });
  try { localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue)); } catch {}
}

export function getSyncQueue(): Array<{ type: string; id: string; data: unknown; ts: string }> {
  try { const s = localStorage.getItem(SYNC_QUEUE_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}

export function clearSyncQueue() {
  localStorage.removeItem(SYNC_QUEUE_KEY);
}

export function getLastSyncInfo(): { lastSync: string | null; offlineSince: string | null; deviceId: string; pendingChanges: number } {
  return {
    lastSync:      localStorage.getItem(LAST_SYNC_KEY),
    offlineSince:  localStorage.getItem(OFFLINE_SINCE_KEY),
    deviceId:      getDeviceId(),
    pendingChanges: getSyncQueue().length,
  };
}

/* Simulated sync to parent server — replace URL with real endpoint */
export async function syncToCloud(payload: SyncPayload): Promise<{ ok: boolean; message: string }> {
  try {
    const PARENT_SERVER = import.meta.env.VITE_SYNC_SERVER_URL ?? 'https://api.civac.co/sync/v1';
    const res = await fetch(`${PARENT_SERVER}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CIVAC-Device': payload.deviceId, 'X-CIVAC-Schema': payload.schema },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) { markSynced(); clearSyncQueue(); return { ok: true, message: 'Sincronización exitosa con servidor CIVAC' }; }
    return { ok: false, message: `Error del servidor: ${res.status}` };
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'AbortError') return { ok: false, message: 'Timeout — servidor no respondió en 10s' };
    if (!navigator.onLine) {
      if (!localStorage.getItem(OFFLINE_SINCE_KEY)) localStorage.setItem(OFFLINE_SINCE_KEY, new Date().toISOString());
      return { ok: false, message: 'Sin conexión — datos en cola local para sync automático' };
    }
    return { ok: false, message: 'No se pudo conectar al servidor padre CIVAC' };
  }
}
