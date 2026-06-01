import { useState, useEffect, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle } from "lucide-react";

type SyncState = "online" | "offline" | "syncing" | "synced";

function getSyncQueueCount(): number {
  try {
    const q = localStorage.getItem("civac_sync_queue_v2");
    if (!q) return 0;
    const arr = JSON.parse(q);
    return Array.isArray(arr) ? arr.filter((i: { status?: string }) => i.status === "pending").length : 0;
  } catch { return 0; }
}

function getLastSyncTime(): string {
  try {
    const t = localStorage.getItem("civac_last_sync");
    if (!t) return "";
    const d = new Date(parseInt(t));
    return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

async function flushSyncQueue(): Promise<number> {
  let flushed = 0;
  try {
    const q = localStorage.getItem("civac_sync_queue_v2");
    if (!q) return 0;
    const arr: Array<{ id: string; action: string; payload: unknown; status: string; retries: number }> = JSON.parse(q);
    const pending = arr.filter(i => i.status === "pending");

    const token = localStorage.getItem("civac_session_token") || "";
    const updated = [...arr];

    for (const item of pending) {
      try {
        const res = await fetch("/api/sync/v1/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ action: item.action, payload: item.payload }),
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const idx = updated.findIndex(i => i.id === item.id);
          if (idx >= 0) updated[idx] = { ...updated[idx], status: "synced" };
          flushed++;
        }
      } catch {
        const idx = updated.findIndex(i => i.id === item.id);
        if (idx >= 0) updated[idx] = { ...updated[idx], retries: (updated[idx].retries || 0) + 1 };
      }
    }

    localStorage.setItem("civac_sync_queue_v2", JSON.stringify(updated));
    localStorage.setItem("civac_last_sync", String(Date.now()));
  } catch { /* ignore */ }
  return flushed;
}

export default function NetworkSync() {
  const [state, setState] = useState<SyncState>(navigator.onLine ? "online" : "offline");
  const [pending, setPending] = useState(getSyncQueueCount);
  const [expanded, setExpanded] = useState(false);
  const [lastSync, setLastSync] = useState(getLastSyncTime);

  const doSync = useCallback(async () => {
    if (!navigator.onLine) return;
    setState("syncing");
    const n = await flushSyncQueue();
    setState("synced");
    setPending(getSyncQueueCount());
    setLastSync(getLastSyncTime());
    setTimeout(() => setState("online"), 2200);
    return n;
  }, []);

  useEffect(() => {
    const onOnline  = () => { setState("online");  setPending(getSyncQueueCount()); doSync(); };
    const onOffline = () => { setState("offline"); };
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);

    // Poll queue count every 30 s
    const poll = setInterval(() => setPending(getSyncQueueCount()), 30_000);
    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
      clearInterval(poll);
    };
  }, [doSync]);

  // Only show indicator if offline OR there are pending items OR recently synced
  if (state === "online" && pending === 0) return null;

  const configs: Record<SyncState, { icon: React.ReactNode; label: string; sub: string; bg: string; border: string; glow: string }> = {
    online:  { icon: <Wifi size={12}/>,          label: "En línea",     sub: `${pending} pendientes`, bg: "rgba(0,200,80,0.10)",     border: "rgba(0,200,80,0.22)",    glow: "rgba(0,200,80,0.15)"    },
    offline: { icon: <WifiOff size={12}/>,        label: "Sin conexión", sub: "Modo offline activo",   bg: "rgba(255,80,80,0.10)",    border: "rgba(255,80,80,0.22)",   glow: "rgba(255,80,80,0.12)"   },
    syncing: { icon: <RefreshCw size={12} className="animate-spin"/>, label: "Sincronizando", sub: `${pending} elementos`, bg: "rgba(0,200,255,0.10)", border: "rgba(0,200,255,0.22)", glow: "rgba(0,200,255,0.15)" },
    synced:  { icon: <CheckCircle size={12}/>,    label: "Sincronizado", sub: `${getLastSyncTime() || "ahora"}`, bg: "rgba(0,245,212,0.10)", border: "rgba(0,245,212,0.22)", glow: "rgba(0,245,212,0.15)" },
  };

  const cfg = configs[state];
  const textColor = {
    online: "#4ade80", offline: "#f87171", syncing: "#38bdf8", synced: "#00f5d4"
  }[state];

  return (
    <div className="fixed bottom-20 right-4 z-[60] flex flex-col items-end gap-2">
      {/* Main pill */}
      <button
        onClick={() => { setExpanded(v => !v); if (state === "online" && pending > 0) doSync(); }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
        style={{
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          boxShadow: `0 4px 20px ${cfg.glow}, 0 2px 8px rgba(0,0,0,0.3)`,
          backdropFilter: "blur(12px)",
          color: textColor,
        }}>
        {cfg.icon}
        <span className="text-[11px] font-bold">{cfg.label}</span>
        {pending > 0 && (
          <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black"
            style={{ background: "rgba(255,255,255,0.12)", color: textColor }}>
            {pending}
          </span>
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="rounded-xl p-3 w-52 text-xs"
          style={{
            background: "rgba(4,13,26,0.96)",
            border: `1px solid ${cfg.border}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 16px ${cfg.glow}`,
            backdropFilter: "blur(16px)",
          }}>
          <p className="font-bold mb-2" style={{ color: textColor }}>Estado de sincronización</p>
          <div className="space-y-1.5 text-white/50">
            <div className="flex justify-between">
              <span>Estado</span>
              <span style={{ color: textColor }}>{cfg.label}</span>
            </div>
            <div className="flex justify-between">
              <span>Pendientes</span>
              <span style={{ color: textColor }}>{pending}</span>
            </div>
            {lastSync && (
              <div className="flex justify-between">
                <span>Última sync</span>
                <span style={{ color: textColor }}>{lastSync}</span>
              </div>
            )}
          </div>
          {pending > 0 && state === "online" && (
            <button onClick={() => doSync()}
              className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
              style={{ background: cfg.border, color: textColor }}>
              <RefreshCw size={10}/> Sincronizar ahora
            </button>
          )}
        </div>
      )}
    </div>
  );
}
