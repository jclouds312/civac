// CIVAC PRO v7 — Offline Storage (IndexedDB + localStorage fallback)
// Persistencia 100% local: IndexedDB para grandes volúmenes, localStorage para config ligera.
// Sin dependencias externas. Funciona completamente sin internet.

/* ─── Types ──────────────────────────────────────────────────────────────────── */
export interface StoredPos { lat: number; lng: number; acc: number; ts: number; speed?: number; alt?: number; }
export interface StoredBtDevice { id: string; name: string; controllerId: string; lastSeen: number; address?: string; }

/* ─── localStorage Keys ─────────────────────────────────────────────────────── */
const KEY_GPS_DEVICES   = 'civac_gps_devices_v2';
const KEY_GPS_TRACK     = 'civac_gps_track_v3';
const KEY_BT_DEVICE     = 'civac_bt_last_device';
const KEY_BT_SESSIONS   = 'civac_bt_sessions_v3';
const KEY_SESSION_META  = 'civac_session_meta_v7';
const MAX_TRACK_POINTS  = 2000;   // v7: 4× more capacity
const MAX_SESSIONS      = 500;    // v7: 5× more sessions

/* ─── IndexedDB (v7) ─────────────────────────────────────────────────────────── */
const IDB_NAME    = 'civac_offline_v7';
const IDB_VERSION = 1;

type IDBStoreName = 'gps_track' | 'bt_sessions' | 'sync_queue' | 'sanidad' | 'trazabilidad';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error('IndexedDB not supported')); return; }
    const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      // GPS track (ring buffer in IDB — up to 50k points)
      if (!db.objectStoreNames.contains('gps_track')) {
        db.createObjectStore('gps_track', { keyPath: 'ts' });
      }
      // BT weighing sessions
      if (!db.objectStoreNames.contains('bt_sessions')) {
        const s = db.createObjectStore('bt_sessions', { keyPath: 'id' });
        s.createIndex('ts', 'ts');
        s.createIndex('animalId', 'animalId');
      }
      // Offline sync queue (actions pending server sync)
      if (!db.objectStoreNames.contains('sync_queue')) {
        const sq = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        sq.createIndex('status', 'status');
        sq.createIndex('ts', 'ts');
      }
      // Sanidad offline records
      if (!db.objectStoreNames.contains('sanidad')) {
        const san = db.createObjectStore('sanidad', { keyPath: 'id' });
        san.createIndex('animalId', 'animalId');
        san.createIndex('fecha', 'fecha');
      }
      // Trazabilidad offline records
      if (!db.objectStoreNames.contains('trazabilidad')) {
        const tr = db.createObjectStore('trazabilidad', { keyPath: 'id' });
        tr.createIndex('animalId', 'animalId');
        tr.createIndex('fecha', 'fecha');
      }
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror   = () => reject(req.error);
  });
}

async function idbGetAll<T>(storeName: IDBStoreName): Promise<T[]> {
  try {
    const db  = await openDB();
    const tx  = db.transaction(storeName, 'readonly');
    const st  = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const req = st.getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror   = () => reject(req.error);
    });
  } catch { return []; }
}

async function idbPut(storeName: IDBStoreName, value: unknown): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const st = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const req = st.put(value);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  } catch { /* silently fail */ }
}

async function idbDelete(storeName: IDBStoreName, key: IDBValidKey): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const st = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const req = st.delete(key);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  } catch { /* silently fail */ }
}

async function idbClear(storeName: IDBStoreName): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).clear();
  } catch { /* silently fail */ }
}

async function idbCount(storeName: IDBStoreName): Promise<number> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const st = tx.objectStore(storeName);
    return new Promise((resolve) => {
      const req = st.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => resolve(0);
    });
  } catch { return 0; }
}

/* ─── Safe JSON helpers (localStorage) ─────────────────────────────────────── */
function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function safeSet(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota exceeded — ignore */ }
}

/* ─── GPS Devices ────────────────────────────────────────────────────────────── */
export function saveGpsDevices(devices: unknown[]): void {
  safeSet(KEY_GPS_DEVICES, devices);
}
export function loadGpsDevices<T>(): T[] | null {
  const data = safeParse<T[] | null>(KEY_GPS_DEVICES, null);
  return Array.isArray(data) && data.length > 0 ? data : null;
}

/* ─── GPS Track v7 — IndexedDB ring buffer (50k points) ─────────────────────── */
export async function appendGpsPositionIDB(pos: StoredPos): Promise<void> {
  await idbPut('gps_track', pos);
  // Keep only last 50k points — trim oldest
  const all = await idbGetAll<StoredPos>('gps_track');
  if (all.length > 50_000) {
    const sorted = all.sort((a, b) => a.ts - b.ts);
    const toDelete = sorted.slice(0, all.length - 50_000);
    for (const p of toDelete) await idbDelete('gps_track', p.ts);
  }
}
export async function loadGpsTrackIDB(): Promise<StoredPos[]> {
  const all = await idbGetAll<StoredPos>('gps_track');
  return all.sort((a, b) => a.ts - b.ts);
}
export async function clearGpsTrackIDB(): Promise<void> {
  await idbClear('gps_track');
}

// localStorage fallback (legacy)
export function appendGpsPosition(pos: StoredPos): StoredPos[] {
  const track = loadGpsTrack();
  track.push(pos);
  const trimmed = track.slice(-MAX_TRACK_POINTS);
  safeSet(KEY_GPS_TRACK, trimmed);
  return trimmed;
}
export function loadGpsTrack(): StoredPos[] {
  return safeParse<StoredPos[]>(KEY_GPS_TRACK, []);
}
export function clearGpsTrack(): void {
  localStorage.removeItem(KEY_GPS_TRACK);
  idbClear('gps_track');
}
export function exportGpsTrack(): string {
  const track = loadGpsTrack();
  const header = 'timestamp,lat,lng,precision,velocidad,altitud';
  const rows = track.map(p =>
    `${new Date(p.ts).toISOString()},${p.lat},${p.lng},${p.acc},${p.speed ?? ''},${p.alt ?? ''}`
  );
  return [header, ...rows].join('\n');
}

/* ─── Bluetooth Last Device ─────────────────────────────────────────────────── */
export function saveLastBtDevice(dev: StoredBtDevice): void {
  safeSet(KEY_BT_DEVICE, dev);
}
export function loadLastBtDevice(): StoredBtDevice | null {
  return safeParse<StoredBtDevice | null>(KEY_BT_DEVICE, null);
}
export function clearLastBtDevice(): void {
  localStorage.removeItem(KEY_BT_DEVICE);
}

/* ─── Bluetooth Weighing Sessions v7 (IDB + localStorage) ──────────────────── */
export interface BtSession {
  id: string;
  animalId: string;
  animalNom: string;
  peso: number;
  bcs: number;
  gmd: number;
  controllerId: string;
  ts: number;
  offline: boolean;
  synced?: boolean;
}
export function saveBtSession(session: BtSession): void {
  // localStorage (fast)
  const sessions = loadBtSessions();
  sessions.unshift(session);
  safeSet(KEY_BT_SESSIONS, sessions.slice(0, MAX_SESSIONS));
  // IDB async (persistent)
  idbPut('bt_sessions', session);
  // Add to sync queue if offline
  if (session.offline) {
    enqueueSyncAction({ type: 'pesaje', payload: session });
  }
}
export function loadBtSessions(): BtSession[] {
  return safeParse<BtSession[]>(KEY_BT_SESSIONS, []);
}
export async function loadBtSessionsIDB(): Promise<BtSession[]> {
  const all = await idbGetAll<BtSession>('bt_sessions');
  return all.sort((a, b) => b.ts - a.ts);
}
export function clearBtSessions(): void {
  localStorage.removeItem(KEY_BT_SESSIONS);
  idbClear('bt_sessions');
}
export function exportBtSessions(): string {
  const sessions = loadBtSessions();
  const header = 'fecha,animal,peso_kg,bcs,gmd,controlador,offline,sincronizado';
  const rows = sessions.map(s =>
    `${new Date(s.ts).toISOString()},${s.animalNom},${s.peso},${s.bcs},${s.gmd},${s.controllerId},${s.offline},${s.synced ?? false}`
  );
  return [header, ...rows].join('\n');
}

/* ─── Session Metadata v7 ────────────────────────────────────────────────────── */
export interface SessionMeta {
  userId: string;
  loginTs: number;
  deviceId: string;
  plan: string;
  lastSync: number;
  offlineMode: boolean;
  totalPesajes: number;
  totalGpsPoints: number;
}
export function saveSessionMeta(meta: Partial<SessionMeta>): void {
  const existing = loadSessionMeta();
  safeSet(KEY_SESSION_META, { ...existing, ...meta });
}
export function loadSessionMeta(): SessionMeta {
  return safeParse<SessionMeta>(KEY_SESSION_META, {
    userId: '', loginTs: 0, deviceId: `CIVAC-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
    plan: 'basico', lastSync: 0, offlineMode: false, totalPesajes: 0, totalGpsPoints: 0,
  });
}
export function clearSessionMeta(): void {
  localStorage.removeItem(KEY_SESSION_META);
}

/* ─── Offline Sync Queue v7 ──────────────────────────────────────────────────── */
export interface SyncAction {
  type: 'pesaje' | 'sanidad' | 'trazabilidad' | 'animal' | 'potrero';
  payload: unknown;
  ts: number;
  status: 'pending' | 'syncing' | 'done' | 'error';
  retries: number;
}
export function enqueueSyncAction(action: Omit<SyncAction, 'ts' | 'status' | 'retries'>): void {
  const full: SyncAction = { ...action, ts: Date.now(), status: 'pending', retries: 0 };
  idbPut('sync_queue', full);
}
export async function getPendingSyncActions(): Promise<SyncAction[]> {
  const all = await idbGetAll<SyncAction>('sync_queue');
  return all.filter(a => a.status === 'pending').sort((a, b) => a.ts - b.ts);
}
export async function clearSyncQueue(): Promise<void> {
  await idbClear('sync_queue');
}
export async function getSyncQueueCount(): Promise<number> {
  return idbCount('sync_queue');
}

/* ─── Offline Sanidad / Trazabilidad (IDB) ───────────────────────────────────── */
export async function saveSanidadOffline(record: Record<string, unknown>): Promise<void> {
  await idbPut('sanidad', record);
  enqueueSyncAction({ type: 'sanidad', payload: record });
}
export async function loadSanidadOffline<T>(): Promise<T[]> {
  return idbGetAll<T>('sanidad');
}
export async function saveTrazabilidadOffline(event: Record<string, unknown>): Promise<void> {
  await idbPut('trazabilidad', event);
  enqueueSyncAction({ type: 'trazabilidad', payload: event });
}
export async function loadTrazabilidadOffline<T>(): Promise<T[]> {
  return idbGetAll<T>('trazabilidad');
}

/* ─── Storage status v7 ─────────────────────────────────────────────────────── */
export interface OfflineStorageStatus {
  gpsDevices: number;
  gpsTrackPoints: number;
  hasBtDevice: boolean;
  btSessions: number;
  pendingSync: number;
  idbAvailable: boolean;
  estimatedKB: number;
}
export async function getOfflineStorageStatus(): Promise<OfflineStorageStatus> {
  const gpsDevices     = (loadGpsDevices() ?? []).length;
  const track          = loadGpsTrack();
  const hasBtDevice    = !!loadLastBtDevice();
  const btSessions     = loadBtSessions().length;
  const pendingSync    = await getSyncQueueCount();
  let idbAvailable     = false;
  try { await openDB(); idbAvailable = true; } catch { /* unavailable */ }
  let bytes = 0;
  try {
    [KEY_GPS_DEVICES, KEY_GPS_TRACK, KEY_BT_DEVICE, KEY_BT_SESSIONS, KEY_SESSION_META].forEach(k => {
      bytes += (localStorage.getItem(k) || '').length * 2;
    });
  } catch { /* ignore */ }
  return { gpsDevices, gpsTrackPoints: track.length, hasBtDevice, btSessions, pendingSync, idbAvailable, estimatedKB: Math.round(bytes / 1024) };
}

// sync compat (old callers)
export function getOfflineStorageStatusSync(): Omit<OfflineStorageStatus, 'pendingSync' | 'idbAvailable'> {
  const gpsDevices  = (loadGpsDevices() ?? []).length;
  const track       = loadGpsTrack();
  const hasBtDevice = !!loadLastBtDevice();
  const btSessions  = loadBtSessions().length;
  let bytes = 0;
  try {
    [KEY_GPS_DEVICES, KEY_GPS_TRACK, KEY_BT_DEVICE, KEY_BT_SESSIONS].forEach(k => {
      bytes += (localStorage.getItem(k) || '').length * 2;
    });
  } catch { /* ignore */ }
  return { gpsDevices, gpsTrackPoints: track.length, hasBtDevice, btSessions, estimatedKB: Math.round(bytes / 1024) };
}

/* ─── Permission helpers (GPS + Bluetooth) ──────────────────────────────────── */
export async function checkGeolocationPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unavailable'> {
  if (!navigator.geolocation) return 'unavailable';
  try {
    const result = await (navigator.permissions as any).query({ name: 'geolocation' });
    return result.state as 'granted' | 'denied' | 'prompt';
  } catch {
    return 'prompt';
  }
}
export async function checkBluetoothAvailability(): Promise<'available' | 'unavailable' | 'disabled'> {
  if (!('bluetooth' in navigator)) return 'unavailable';
  try {
    const available = await (navigator as any).bluetooth.getAvailability();
    return available ? 'available' : 'disabled';
  } catch {
    return 'unavailable';
  }
}

/* ─── IDB Health check ──────────────────────────────────────────────────────── */
export async function checkIDBHealth(): Promise<{ available: boolean; stores: string[] }> {
  try {
    const db = await openDB();
    const stores = Array.from(db.objectStoreNames);
    return { available: true, stores };
  } catch {
    return { available: false, stores: [] };
  }
}

/* ─── Full offline purge ─────────────────────────────────────────────────────── */
export function purgeAllOfflineData(): void {
  [KEY_GPS_DEVICES, KEY_GPS_TRACK, KEY_BT_DEVICE, KEY_BT_SESSIONS, KEY_SESSION_META].forEach(k => {
    try { localStorage.removeItem(k); } catch { /* ignore */ }
  });
  ['gps_track','bt_sessions','sync_queue','sanidad','trazabilidad'].forEach(s => {
    idbClear(s as IDBStoreName);
  });
}
