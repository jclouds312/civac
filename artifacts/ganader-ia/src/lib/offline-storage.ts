// CIVAC PRO — Offline Storage
// Persistencia 100% local: localStorage para GPS devices, BT devices y track history.
// Sin dependencias externas. Funciona completamente sin internet.

/* ─── Types ──────────────────────────────────────────────────────────────────── */
export interface StoredPos { lat: number; lng: number; acc: number; ts: number; speed?: number; alt?: number; }
export interface StoredBtDevice { id: string; name: string; controllerId: string; lastSeen: number; address?: string; }

/* ─── Keys ───────────────────────────────────────────────────────────────────── */
const KEY_GPS_DEVICES   = 'civac_gps_devices_v2';
const KEY_GPS_TRACK     = 'civac_gps_track_v2';
const KEY_BT_DEVICE     = 'civac_bt_last_device';
const KEY_BT_SESSIONS   = 'civac_bt_sessions_v2';
const MAX_TRACK_POINTS  = 500;
const MAX_SESSIONS      = 100;

/* ─── Safe JSON helpers ─────────────────────────────────────────────────────── */
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

/* ─── GPS Track (ring buffer of last MAX_TRACK_POINTS positions) ─────────────── */
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

/* ─── Bluetooth Weighing Sessions ──────────────────────────────────────────── */
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
}
export function saveBtSession(session: BtSession): void {
  const sessions = loadBtSessions();
  sessions.unshift(session);
  safeSet(KEY_BT_SESSIONS, sessions.slice(0, MAX_SESSIONS));
}
export function loadBtSessions(): BtSession[] {
  return safeParse<BtSession[]>(KEY_BT_SESSIONS, []);
}
export function clearBtSessions(): void {
  localStorage.removeItem(KEY_BT_SESSIONS);
}
export function exportBtSessions(): string {
  const sessions = loadBtSessions();
  const header = 'fecha,animal,peso_kg,bcs,gmd,controlador,offline';
  const rows = sessions.map(s =>
    `${new Date(s.ts).toISOString()},${s.animalNom},${s.peso},${s.bcs},${s.gmd},${s.controllerId},${s.offline}`
  );
  return [header, ...rows].join('\n');
}

/* ─── Storage status ─────────────────────────────────────────────────────────── */
export interface OfflineStorageStatus {
  gpsDevices: number;
  gpsTrackPoints: number;
  hasBtDevice: boolean;
  btSessions: number;
  estimatedKB: number;
}
export function getOfflineStorageStatus(): OfflineStorageStatus {
  const gpsDevices    = (loadGpsDevices() ?? []).length;
  const track         = loadGpsTrack();
  const hasBtDevice   = !!loadLastBtDevice();
  const btSessions    = loadBtSessions().length;
  let bytes = 0;
  try {
    for (const key of [KEY_GPS_DEVICES, KEY_GPS_TRACK, KEY_BT_DEVICE, KEY_BT_SESSIONS]) {
      bytes += (localStorage.getItem(key) || '').length * 2;
    }
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
