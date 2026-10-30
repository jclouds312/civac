// ─── CIVAC PRO — Sync Engine v2.0 ────────────────────────────────────────────
// Offline-first: localStorage como verdad local.
// Cuando hay conexión: push al API server y pull de vuelta.
// Singleton: importar { syncEngine } o el hook { useSyncEngine }.

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface SyncState {
  status:         SyncStatus;
  lastSyncAt:     string | null;  // ISO timestamp último sync exitoso
  pendingChanges: number;          // mutaciones sin confirmar en servidor
  errorMsg:       string | null;
  deviceId:       string;
}

type SyncListener = (state: SyncState) => void;

// ── Storage keys ──────────────────────────────────────────────────────────────
const K_DEVICE   = 'civac_device_id';
const K_STATE    = 'civac_sync_state';
const K_PENDING  = 'civac_sync_pending';

// ── Helpers ───────────────────────────────────────────────────────────────────
function ls<T>(key: string): T | null {
  try { const s = localStorage.getItem(key); return s ? (JSON.parse(s) as T) : null; } catch { return null; }
}
function lsSet(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }

function loadDeviceId(): string {
  let id = ls<string>(K_DEVICE);
  if (!id) {
    id = `DEV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    lsSet(K_DEVICE, id);
  }
  return id;
}

function getLsArray(localKey: string): unknown[] {
  try { const s = localStorage.getItem(`civac_${localKey}`); return s ? JSON.parse(s) : []; } catch { return []; }
}

// ── Class ─────────────────────────────────────────────────────────────────────
class SyncEngine {
  private state: SyncState;
  private listeners: SyncListener[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private _online: boolean;

  constructor() {
    const deviceId = loadDeviceId();
    const stored   = ls<Partial<SyncState>>(K_STATE);
    const pending  = ls<number>(K_PENDING) ?? 0;
    this._online   = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.state     = { status: 'idle', lastSyncAt: null, pendingChanges: pending, errorMsg: null, deviceId, ...(stored ?? {}) };
    if (!this._online) this.state.status = 'offline';

    if (typeof window !== 'undefined') {
      window.addEventListener('online',  () => this._handleOnline());
      window.addEventListener('offline', () => this._handleOffline());
    }
  }

  // ── Public ──────────────────────────────────────────────────────────────────

  subscribe(fn: SyncListener): () => void {
    this.listeners.push(fn);
    fn({ ...this.state });
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  getState(): SyncState { return { ...this.state }; }
  get isOnline()        { return this._online; }

  /** Llamar después de cada mutación local. Programa flush automático. */
  markPending(): void {
    this._patch({ pendingChanges: this.state.pendingChanges + 1 });
    lsSet(K_PENDING, this.state.pendingChanges);
    if (this._online) this._scheduleFlush();
  }

  clearPending(): void {
    this._patch({ pendingChanges: 0 });
    lsSet(K_PENDING, 0);
  }

  /** Fuerza sync inmediato — push local → pull servidor. */
  async flush(): Promise<void> {
    if (!this._online)                     { this._patch({ status: 'offline' }); return; }
    if (this.state.status === 'syncing')   return;
    this._patch({ status: 'syncing', errorMsg: null });

    try {
      const payload = this._buildPayload();
      const token = localStorage.getItem('civac_session_token') || localStorage.getItem('civac_server_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/sync/v1/ingest', {
        method:  'POST',
        headers,
        body:    JSON.stringify(payload),
        signal:  AbortSignal.timeout(20_000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json() as { ok: boolean; serverData?: Record<string, unknown[]> };

      // Si el servidor devuelve datos autoritativos, los aplicamos localmente
      if (result.serverData) this._applyServerData(result.serverData);

      this._patch({ status: 'synced', lastSyncAt: new Date().toISOString(), pendingChanges: 0, errorMsg: null });
      lsSet(K_PENDING, 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this._patch({ status: 'error', errorMsg: msg });
    }
  }

  /** Solo pull — trae cambios del servidor sin push. */
  async pull(): Promise<boolean> {
    if (!this._online) return false;
    try {
      const since = this.state.lastSyncAt ?? '1970-01-01T00:00:00.000Z';
      const url   = `/api/sync/v1/pull?since=${encodeURIComponent(since)}&deviceId=${this.state.deviceId}`;
      const token = localStorage.getItem('civac_session_token') || localStorage.getItem('civac_server_token');
      const res   = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {}, signal: AbortSignal.timeout(10_000) });
      if (!res.ok) return false;
      const body = await res.json() as { ok: boolean; data: Record<string, unknown[]> };
      if (body.ok && body.data) { this._applyServerData(body.data); return true; }
      return false;
    } catch { return false; }
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private _handleOnline(): void {
    this._online = true;
    this._patch({ status: 'idle' });
    if (this.state.pendingChanges > 0) setTimeout(() => this.flush(), 600);
    else this.pull();
  }

  private _handleOffline(): void {
    this._online = false;
    this._patch({ status: 'offline' });
  }

  private _scheduleFlush(): void {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => this.flush(), 1800);
  }

  private _patch(delta: Partial<SyncState>): void {
    this.state = { ...this.state, ...delta };
    lsSet(K_STATE, this.state);
    this.listeners.forEach(fn => fn({ ...this.state }));
  }

  private _buildPayload() {
    const auth = ls<{ email?: string; role?: string; name?: string }>('civac_auth_user');
    return {
      schema:    'civac-sync-v1',
      timestamp: new Date().toISOString(),
      deviceId:  this.state.deviceId,
      meta: {
        userId:   auth?.email ?? 'anonymous',
        userRole: auth?.role  ?? 'viewer',
        planId:   ls<string>('civac_plan') ?? 'basico',
      },
      data: {
        animals:      getLsArray('animals'),
        potreros:     getLsArray('potreros'),
        insumos:      getLsArray('insumos'),
        personal:     getLsArray('personal'),
        reproduccion: getLsArray('reproduccion'),
        alertas:      getLsArray('alertas'),
        pesajes:      getLsArray('pesajes'),
        gps:          getLsArray('gps'),
        lotes:        getLsArray('lotes'),
      },
    };
  }

  private _applyServerData(serverData: Record<string, unknown[]>): void {
    const mapping: Record<string, string> = {
      animals: 'animals', potreros: 'potreros', insumos: 'insumos',
      personal: 'personal', reproduccion: 'reproduccion', alertas: 'alertas',
      pesajes: 'pesajes', gps: 'gps', lotes: 'lotes',
    };
    let applied = false;
    for (const [sKey, lKey] of Object.entries(mapping)) {
      const rows = serverData[sKey];
      if (Array.isArray(rows) && rows.length > 0) {
        try { localStorage.setItem(`civac_${lKey}`, JSON.stringify(rows)); applied = true; } catch {}
      }
    }
    if (applied && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('civac:server-sync', { detail: serverData }));
    }
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────
export const syncEngine = new SyncEngine();

// ── React hook ────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';

export function useSyncEngine(): SyncState & { flush: () => void; pull: () => void } {
  const [state, setState] = useState<SyncState>(() => syncEngine.getState());
  useEffect(() => syncEngine.subscribe(setState), []);
  return { ...state, flush: () => syncEngine.flush(), pull: () => syncEngine.pull() };
}

// ── Compat exports (mantiene compatibilidad con imports anteriores) ────────────

export function getLastSyncInfo() {
  const s = syncEngine.getState();
  return { lastSync: s.lastSyncAt, deviceId: s.deviceId, pendingChanges: s.pendingChanges, offlineSince: null };
}

/** Devuelve la cola pendiente como array de strings (1 entrada por cambio pendiente). */
export function getSyncQueue(): string[] {
  const n = syncEngine.getState().pendingChanges;
  return Array.from({ length: n }, (_, i) => `pending-${i}`);
}

/** Construye un payload compatible con el endpoint /api/sync/v1/ingest. */
export function buildSyncPayload(userId: string, planId: string) {
  const s    = syncEngine.getState();
  const auth = (() => { try { const v = localStorage.getItem('civac_auth_user'); return v ? JSON.parse(v) as { role?: string } : null; } catch { return null; } })();
  return {
    schema:    'civac-sync-v1' as const,
    timestamp: new Date().toISOString(),
    deviceId:  s.deviceId,
    meta: { userId, userRole: auth?.role ?? 'viewer', planId },
    data: {
      animals:      [] as unknown[],
      potreros:     [] as unknown[],
      insumos:      [] as unknown[],
      personal:     [] as unknown[],
      reproduccion: [] as unknown[],
      alertas:      [] as unknown[],
      pesajes:      [] as unknown[],
      gps:          [] as unknown[],
      lotes:        [] as unknown[],
    },
  };
}

/** Envía el payload al servidor y retorna resultado. */
export async function syncToCloud(payload: ReturnType<typeof buildSyncPayload>): Promise<{ ok: boolean; message: string }> {
  try {
    const token = localStorage.getItem('civac_session_token') || localStorage.getItem('civac_server_token');
    const res = await fetch('/api/sync/v1/ingest', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body:    JSON.stringify(payload),
      signal:  AbortSignal.timeout(20_000),
    });
    if (!res.ok) return { ok: false, message: `Error HTTP ${res.status}` };
    const body = await res.json() as { ok: boolean; serverData?: Record<string, unknown[]> };
    if (body.ok) {
      syncEngine.clearPending();
      return { ok: true, message: 'Sincronización exitosa con servidor CIVAC' };
    }
    return { ok: false, message: 'El servidor rechazó la sincronización' };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Error de red' };
  }
}
