import { useEffect, useState } from "react";
import { Activity, Cloud, Code2, Database, Gauge, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Link } from "wouter";
import { useSyncEngine } from "@/lib/sync";

export function CivacSystemWidgets({ compact = false }: { compact?: boolean }) {
  const sync = useSyncEngine();
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health", { signal: AbortSignal.timeout(5000) })
      .then(response => { if (!response.ok) throw new Error("health"); return response.json(); })
      .then(() => { if (!cancelled) { setApiStatus("online"); setLastCheck(new Date().toLocaleTimeString()); } })
      .catch(() => { if (!cancelled) setApiStatus("offline"); });
    return () => { cancelled = true; };
  }, [sync.lastSyncAt]);

  const color = apiStatus === "online" ? "#39ff7e" : apiStatus === "offline" ? "#fb7185" : "#fbbf24";
  const syncColor = sync.status === "synced" ? "#39ff7e" : sync.status === "offline" ? "#fbbf24" : "#00c8ff";
  const cards = [
    { label: "Servidor API", value: apiStatus === "online" ? "Operativo" : apiStatus === "offline" ? "Sin respuesta" : "Comprobando", icon: <Activity size={15}/>, color },
    { label: "Sincronización", value: sync.status === "offline" ? "Modo offline" : `${sync.pendingChanges} pendientes`, icon: sync.status === "offline" ? <WifiOff size={15}/> : <Cloud size={15}/>, color: syncColor },
    { label: "Cola local", value: `${sync.pendingChanges} cambios`, icon: <Database size={15}/>, color: sync.pendingChanges ? "#fbbf24" : "#39ff7e" },
    { label: "Runtime", value: "Sass + Python API", icon: <Code2 size={15}/>, color: "#c084fc" },
  ];

  return (
    <section aria-label="Estado del sistema CIVAC" className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4"}`}>
      {cards.map(card => <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center justify-between" style={{ color: card.color }}><span className="flex items-center gap-2 text-xs font-semibold">{card.icon}{card.label}</span><Gauge size={14}/></div>
        <p className="mt-3 text-sm font-bold text-white">{card.value}</p>
        {card.label === "Servidor API" && lastCheck && <p className="mt-1 text-[10px] text-white/35">Última comprobación: {lastCheck}</p>}
      </div>)}
      {!compact && <div className="sm:col-span-2 xl:col-span-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] px-4 py-3">
        <p className="flex items-center gap-2 text-xs text-white/60"><Wifi size={14} className="text-cyan-300"/> Los registros se guardan localmente y se envían al servidor al recuperar conexión.</p>
        <div className="flex gap-2"><button onClick={() => sync.flush()} className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-300/10"><RefreshCw size={13}/> Sincronizar</button><Link href="/developer-console" className="inline-flex items-center gap-2 rounded-lg border border-violet-300/25 px-3 py-1.5 text-xs font-bold text-violet-200 hover:bg-violet-300/10"><Code2 size={13}/> Consola</Link></div>
      </div>}
    </section>
  );
}
