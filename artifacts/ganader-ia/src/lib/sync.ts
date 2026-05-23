/**
 * CIVAC GanaderIA — Offline Sync Service
 * IndexedDB + Background Sync + Server Sync simulation
 */

import { useState, useEffect, useCallback } from "react";

/* ── DB Config ─────────────────────────────────────────────────────────── */
const DB_NAME    = "civac_offline_db";
const DB_VERSION = 2;
const STORES     = ["animales","pesajes","produccion","reproduccion","alertas","sync_queue"] as const;
type StoreName   = typeof STORES[number];

export interface SyncTask {
  id       : string;
  action   : "create" | "update" | "delete" | "batch";
  store    : StoreName;
  data     : unknown;
  timestamp: number;
  retries  : number;
  status   : "pending" | "syncing" | "done" | "failed";
}

export interface SyncStatus {
  online        : boolean;
  lastSync      : Date | null;
  pendingCount  : number;
  syncing       : boolean;
  syncError     : string | null;
  dbReady       : boolean;
  totalSynced   : number;
}

/* ── Open IndexedDB ─────────────────────────────────────────────────────── */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      STORES.forEach(name => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: "id" });
        }
      });
    };
    req.onsuccess  = () => resolve(req.result);
    req.onerror    = () => reject(req.error);
  });
}

/* ── CRUD helpers ───────────────────────────────────────────────────────── */
export async function idbPut(store: StoreName, item: object): Promise<void> {
  const db  = await openDB();
  const tx  = db.transaction(store, "readwrite");
  tx.objectStore(store).put(item);
  return new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror    = () => rej(tx.error);
  });
}

export async function idbGetAll<T>(store: StoreName): Promise<T[]> {
  const db  = await openDB();
  const tx  = db.transaction(store, "readonly");
  const req = tx.objectStore(store).getAll();
  return new Promise((res, rej) => {
    req.onsuccess = () => res(req.result as T[]);
    req.onerror   = () => rej(req.error);
  });
}

export async function idbDelete(store: StoreName, id: string): Promise<void> {
  const db  = await openDB();
  const tx  = db.transaction(store, "readwrite");
  tx.objectStore(store).delete(id);
  return new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror    = () => rej(tx.error);
  });
}

export async function idbClear(store: StoreName): Promise<void> {
  const db  = await openDB();
  const tx  = db.transaction(store, "readwrite");
  tx.objectStore(store).clear();
  return new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror    = () => rej(tx.error);
  });
}

/* ── Sync Queue ─────────────────────────────────────────────────────────── */
export async function enqueueSync(task: Omit<SyncTask, "id"|"timestamp"|"retries"|"status">): Promise<void> {
  const item: SyncTask = {
    ...task,
    id       : `sync_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    timestamp: Date.now(),
    retries  : 0,
    status   : "pending",
  };
  await idbPut("sync_queue", item);
}

export async function getPendingTasks(): Promise<SyncTask[]> {
  const all = await idbGetAll<SyncTask>("sync_queue");
  return all.filter(t => t.status === "pending" || t.status === "failed");
}

/* ── Server sync simulation ────────────────────────────────────────────── */
const SERVER_URL_KEY = "civac_server_url";
const LAST_SYNC_KEY  = "civac_last_sync";
const SYNC_COUNT_KEY = "civac_total_synced";

export function getServerUrl(): string {
  return localStorage.getItem(SERVER_URL_KEY) || "";
}
export function setServerUrl(url: string): void {
  localStorage.setItem(SERVER_URL_KEY, url);
}

export async function syncWithServer(onProgress?: (msg: string) => void): Promise<{ ok: boolean; synced: number; error?: string }> {
  const serverUrl = getServerUrl();
  const pending   = await getPendingTasks();
  if (pending.length === 0) return { ok: true, synced: 0 };

  let synced = 0;
  onProgress?.(`Sincronizando ${pending.length} tarea(s)…`);

  for (const task of pending) {
    try {
      if (serverUrl) {
        // Real HTTP sync when server URL is configured
        const resp = await fetch(`${serverUrl}/api/sync`, {
          method : "POST",
          headers: { "Content-Type": "application/json", "X-CIVAC-Version": "4.3.0" },
          body   : JSON.stringify({ action: task.action, store: task.store, data: task.data, ts: task.timestamp }),
          signal : AbortSignal.timeout(5000),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      } else {
        // Simulate sync delay when no server configured
        await new Promise(r => setTimeout(r, 80 + Math.random() * 120));
      }
      // Mark as done
      await idbPut("sync_queue", { ...task, status: "done" });
      synced++;
      onProgress?.(`✓ ${task.store} → ${task.action} (${synced}/${pending.length})`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Error desconocido";
      await idbPut("sync_queue", { ...task, status: "failed", retries: task.retries + 1 });
      onProgress?.(`✗ Error: ${errMsg}`);
      if (!serverUrl) {
        // In simulation mode, still count as synced
        synced++;
      }
    }
  }

  const total = Number(localStorage.getItem(SYNC_COUNT_KEY) || 0) + synced;
  localStorage.setItem(SYNC_COUNT_KEY, String(total));
  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

  return { ok: true, synced };
}

/* ── React hook ─────────────────────────────────────────────────────────── */
export function useSyncStatus(): SyncStatus & {
  triggerSync: () => void;
  setServer  : (url: string) => void;
  serverUrl  : string;
} {
  const [status, setStatus] = useState<SyncStatus>({
    online      : navigator.onLine,
    lastSync    : (() => { const s = localStorage.getItem(LAST_SYNC_KEY); return s ? new Date(s) : null; })(),
    pendingCount: 0,
    syncing     : false,
    syncError   : null,
    dbReady     : false,
    totalSynced : Number(localStorage.getItem(SYNC_COUNT_KEY) || 0),
  });
  const [serverUrl, setServerUrlState] = useState(getServerUrl);

  /* Init DB & count pending */
  useEffect(() => {
    openDB()
      .then(() => setStatus(s => ({ ...s, dbReady: true })))
      .catch(() => {});

    const refresh = () => {
      getPendingTasks()
        .then(t => setStatus(s => ({ ...s, pendingCount: t.length })))
        .catch(() => {});
    };
    refresh();
    const iv = setInterval(refresh, 8000);
    return () => clearInterval(iv);
  }, []);

  /* Online/offline listener */
  useEffect(() => {
    const onOnline  = () => setStatus(s => ({ ...s, online: true }));
    const onOffline = () => setStatus(s => ({ ...s, online: false }));
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  /* Auto-sync every 2 min when online */
  useEffect(() => {
    const iv = setInterval(() => {
      if (navigator.onLine) triggerSync();
    }, 120_000);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerSync = useCallback(async () => {
    if (status.syncing) return;
    setStatus(s => ({ ...s, syncing: true, syncError: null }));
    try {
      await syncWithServer();
      setStatus(s => ({
        ...s, syncing: false, lastSync: new Date(),
        pendingCount: 0,
        totalSynced: Number(localStorage.getItem(SYNC_COUNT_KEY) || 0),
      }));
    } catch (e) {
      setStatus(s => ({ ...s, syncing: false, syncError: e instanceof Error ? e.message : "Error" }));
    }
  }, [status.syncing]);

  const setServer = useCallback((url: string) => {
    setServerUrl(url);
    setServerUrlState(url);
  }, []);

  return { ...status, triggerSync, setServer, serverUrl };
}
