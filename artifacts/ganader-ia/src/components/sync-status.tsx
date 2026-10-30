import { useSyncEngine, SyncStatus } from "@/lib/sync";
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle, Clock } from "lucide-react";

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1)  return "ahora mismo";
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return `hace ${diffH}h`;
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

const CONFIG: Record<SyncStatus, { label: string; color: string; bg: string; border: string; Icon: typeof Cloud }> = {
  idle:    { label: "En espera",    color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)", Icon: Cloud },
  syncing: { label: "Sincronizando", color: "#00c8ff", bg: "rgba(0,200,255,0.10)",  border: "rgba(0,200,255,0.28)",  Icon: RefreshCw },
  synced:  { label: "Sincronizado",  color: "#39ff7e", bg: "rgba(57,255,126,0.08)", border: "rgba(57,255,126,0.22)", Icon: CheckCircle2 },
  offline: { label: "Sin conexión",  color: "#ff9a3c", bg: "rgba(255,154,60,0.10)", border: "rgba(255,154,60,0.28)", Icon: CloudOff },
  error:   { label: "Error sync",    color: "#ff4d6d", bg: "rgba(255,77,109,0.10)", border: "rgba(255,77,109,0.28)", Icon: AlertCircle },
};

interface Props {
  compact?: boolean;
  className?: string;
}

export function SyncStatusPill({ compact = false, className = "" }: Props) {
  const sync = useSyncEngine();
  const cfg  = CONFIG[sync.status];

  return (
    <button
      onClick={() => { if (sync.status !== "syncing") sync.flush(); }}
      title={sync.status === "syncing" ? "Sincronizando…" : `Clic para sincronizar · ${formatTime(sync.lastSyncAt)}`}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold transition-all hover:opacity-90 active:scale-95 cursor-pointer select-none ${className}`}
      style={{
        color:        cfg.color,
        background:   cfg.bg,
        border:       `1px solid ${cfg.border}`,
        borderRadius: 10,
        boxShadow:    sync.status === "synced" ? `0 0 8px ${cfg.bg}` : "none",
      }}
    >
      <cfg.Icon
        size={10}
        className={sync.status === "syncing" ? "animate-spin" : ""}
        strokeWidth={2.5}
      />
      {!compact && (
        <>
          <span>
            {sync.status === "offline" && sync.pendingChanges > 0
              ? `${sync.pendingChanges} pendientes`
              : sync.status === "synced"
                ? formatTime(sync.lastSyncAt)
                : cfg.label}
          </span>
        </>
      )}
    </button>
  );
}

export function SyncStatusBadge() {
  const sync = useSyncEngine();
  const cfg  = CONFIG[sync.status];

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <cfg.Icon
        size={14}
        style={{ color: cfg.color }}
        className={sync.status === "syncing" ? "animate-spin" : ""}
      />
      <div>
        <p className="text-[12px] font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
        <p className="text-[10px] text-white/40 flex items-center gap-1">
          <Clock size={8} />
          {sync.status === "offline"
            ? `${sync.pendingChanges} cambios sin subir`
            : sync.status === "synced"
              ? `Último sync: ${formatTime(sync.lastSyncAt)}`
              : sync.status === "error"
                ? (sync.errorMsg ?? "Error desconocido")
                : "Dispositivo: " + sync.deviceId}
        </p>
      </div>
      {sync.status !== "syncing" && (
        <button
          onClick={() => sync.flush()}
          className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-lg transition-all hover:opacity-80"
          style={{ color: cfg.color, background: cfg.border }}
        >
          Sync
        </button>
      )}
    </div>
  );
}
