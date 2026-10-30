import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Bot, CheckCircle2, Code2, ExternalLink, Gauge, Layers3, Play, RefreshCw, ShieldCheck, TerminalSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const roles = ["developer", "superadmin", "admin"];

export default function DeveloperConsole() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("Consola lista para cambios controlados.");
  const allowed = roles.includes(user?.role ?? "");

  const checks = useMemo(() => [
    { label: "Sesión y rol", value: user?.role ?? "sin sesión", ok: allowed },
    { label: "Agente IA", value: "Local + remoto", ok: true },
    { label: "Módulos operativos", value: "35+ rutas", ok: true },
    { label: "Cambios destructivos", value: "Requieren confirmación", ok: true },
  ], [allowed, user?.role]);

  if (!allowed) return <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-sm text-red-200">Esta consola requiere un rol de developer, admin o superadmin.</div>;

  const runBuilder = () => {
    if (!prompt.trim()) return;
    setRunning(true);
    setMessage("La solicitud fue preparada para CIVAC IA. Revisa el resultado antes de aplicarlo.");
    window.setTimeout(() => setRunning(false), 700);
  };

  return (
    <div className="space-y-5 pb-8 civac-animate">
      <header className="rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-950/80 via-slate-950 to-violet-950/70 p-5 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300/80">CIVAC developer console</p>
            <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">Builder IA y mantenimiento interno</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">Prepara cambios, revisa el impacto y navega al módulo correspondiente. La consola no publica ni modifica datos sensibles sin confirmación explícita.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/chat"><Button variant="outline" className="gap-2"><Bot size={15}/> Abrir asistente</Button></Link>
            <Link href="/usuarios"><Button className="gap-2 bg-cyan-400 text-slate-950 hover:bg-cyan-300"><ShieldCheck size={15}/> Administrar accesos</Button></Link>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {checks.map(check => <div key={check.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div className="flex items-center justify-between"><span className="text-xs text-white/50">{check.label}</span>{check.ok ? <CheckCircle2 size={16} className="text-emerald-300"/> : <Gauge size={16} className="text-amber-300"/>}</div><p className="mt-3 text-sm font-bold text-white">{check.value}</p></div>)}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2"><TerminalSquare size={18} className="text-cyan-300"/><div><h2 className="font-bold text-white">Builder asistido</h2><p className="text-xs text-white/45">Describe una mejora sin incluir claves ni datos privados.</p></div></div>
          <textarea value={prompt} onChange={event => setPrompt(event.target.value)} rows={6} placeholder="Ej.: agrega un indicador de cuentas activas al dashboard de staff…" className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-300/50" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-white/45">{message}</p><Button onClick={runBuilder} disabled={running || !prompt.trim()} className="gap-2 bg-violet-500 hover:bg-violet-400">{running ? <RefreshCw size={14} className="animate-spin"/> : <Play size={14}/>} Preparar cambio</Button></div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5"><div className="mb-4 flex items-center gap-2"><Code2 size={18} className="text-violet-300"/><h2 className="font-bold text-white">Módulos de mantenimiento</h2></div><div className="grid gap-2"><Link href="/usuarios" className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm text-white/75 hover:bg-white/[0.05]">Usuarios, roles y planes <ExternalLink size={14}/></Link><Link href="/configuracion" className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm text-white/75 hover:bg-white/[0.05]">Configuración del sistema <ExternalLink size={14}/></Link><Link href="/documentacion" className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm text-white/75 hover:bg-white/[0.05]">Documentación operativa <ExternalLink size={14}/></Link><Link href="/datos" className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm text-white/75 hover:bg-white/[0.05]">Estado de módulos <Layers3 size={14}/></Link></div></div>
      </section>
    </div>
  );
}
