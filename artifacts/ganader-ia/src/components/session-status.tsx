import { useEffect, useMemo, useState } from "react";
import { Activity, Cloud, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m ${String(s).padStart(2, "0")}s`;
}

export function SessionStatus({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);

  useEffect(() => {
    if (!user?.id) return;
    const key = `civac_session_started_${user.id}`;
    const existing = Number(localStorage.getItem(key));
    const start = Number.isFinite(existing) && existing > 0 ? existing : Date.now();
    localStorage.setItem(key, String(start));
    setStartedAt(start);
    const update = () => setSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [user?.id]);

  const lastAccess = useMemo(() => {
    if (!startedAt) return "Preparando sesión";
    return new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit" }).format(startedAt);
  }, [startedAt]);

  if (!user) return null;
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-white/60" title={`Sesión iniciada a las ${lastAccess}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-emerald-400" : "bg-amber-400"}`} />
        {formatDuration(seconds)}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/55">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-2.5 py-1.5">
        <Activity size={12} className="text-cyan-300" /> Sesión {formatDuration(seconds)}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1.5">
        {online ? <Cloud size={12} className="text-emerald-300" /> : <ShieldCheck size={12} className="text-amber-300" />}
        {online ? "Sincronización activa" : "Modo offline protegido"}
      </span>
    </div>
  );
}
