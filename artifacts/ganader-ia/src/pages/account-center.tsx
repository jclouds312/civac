import { useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, ChevronRight, Crown, Loader2, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Account = { id?: string; nombre?: string; email?: string; role?: string; cargo?: string; finca?: string; planCode?: string; activo?: boolean; categoria?: string };

const planColors: Record<string, string> = { basico: "#94a3b8", pro: "#00f5d4", premium: "#fbbf24", platino: "#c084fc" };
const categoryLabels: Record<string, string> = { staff: "CIVAC Staff", user: "Cuenta de usuario", empresa: "Cuenta empresarial", demo: "Cuenta demo" };

export default function AccountCenter() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; apiGet<Account[]>("/usuarios").then(rows => { if (active) setAccounts(rows ?? []); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  const current = useMemo(() => (accounts.find(account => account.email === user?.email) ?? user) as Account | undefined, [accounts, user]);
  const allAccounts = accounts.length ? accounts : current ? [current] : [];

  return <main className="min-h-full p-4 pb-24 sm:p-6 lg:p-8" style={{ color: "#f8fafc" }}>
    <header className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-[11px] font-black uppercase tracking-[0.24em]" style={{ color: "#00f5d4" }}>Identidad CIVAC</p><h1 className="mt-2 text-3xl font-black tracking-tight">Cuentas y accesos</h1><p className="mt-2 max-w-2xl text-sm" style={{ color: "rgba(226,232,240,.58)" }}>Gestiona tu cuenta, categoría, plan y permisos desde una vista común para PC y móvil.</p></div>
      <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold" style={{ background: "rgba(0,245,212,.08)", border: "1px solid rgba(0,245,212,.18)", color: "#bffdf4" }}><ShieldCheck size={16} /> Sesión protegida</div>
    </header>
    <section className="mx-auto mt-6 grid max-w-7xl gap-4 sm:grid-cols-3">
      {[{ label: "Cuentas visibles", value: allAccounts.length, icon: UsersRound }, { label: "Plan activo", value: current?.planCode?.toUpperCase() ?? "BÁSICO", icon: Crown }, { label: "Categoría", value: categoryLabels[(current as Account | undefined)?.categoria ?? "user"] ?? "Usuario", icon: Building2 }].map(item => <div key={item.label} className="rounded-3xl p-5" style={{ background: "linear-gradient(145deg, rgba(15,35,54,.9), rgba(5,15,27,.9))", border: "1px solid rgba(148,163,184,.14)" }}><item.icon size={18} style={{ color: "#00c8ff" }} /><p className="mt-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(226,232,240,.48)" }}>{item.label}</p><p className="mt-1 text-xl font-black">{item.value}</p></div>)}
    </section>
    <section className="mx-auto mt-6 max-w-7xl rounded-3xl p-4 sm:p-6" style={{ background: "rgba(7,21,36,.76)", border: "1px solid rgba(148,163,184,.14)" }}>
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black">Cuentas disponibles</h2>{loading && <Loader2 className="animate-spin" size={18} style={{ color: "#00f5d4" }} />}</div>
      <div className="grid gap-3 md:grid-cols-2">
        {allAccounts.map((account, index) => { const plan = (account.planCode ?? "basico").toLowerCase(); const color = planColors[plan] ?? "#00c8ff"; const category = account.categoria ?? (account.role && ["admin", "superadmin", "developer", "sales"].includes(account.role) ? "staff" : "user"); return <article key={account.id ?? account.email ?? index} className="flex min-w-0 items-center gap-3 rounded-2xl p-4" style={{ background: "rgba(15,31,49,.72)", border: `1px solid ${color}28` }}><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ color, background: `${color}16` }}>{category === "staff" ? <ShieldCheck size={21} /> : <UserRound size={21} />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-black">{account.nombre ?? account.email ?? "Cuenta CIVAC"}</p><span className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase" style={{ color, background: `${color}16` }}>{plan}</span></div><p className="mt-1 truncate text-xs" style={{ color: "rgba(226,232,240,.52)" }}>{categoryLabels[category] ?? category} · {account.role ?? "usuario"}</p></div><ChevronRight size={17} style={{ color: "rgba(226,232,240,.35)" }} /></article>; })}
        {!loading && !allAccounts.length && <div className="col-span-full rounded-2xl border border-dashed p-8 text-center text-sm" style={{ borderColor: "rgba(148,163,184,.2)", color: "rgba(226,232,240,.55)" }}>No hay cuentas disponibles para esta sesión.</div>}
      </div>
      <div className="mt-5 flex items-center gap-2 text-xs" style={{ color: "rgba(226,232,240,.44)" }}><CheckCircle2 size={15} style={{ color: "#39ff7e" }} /> Los permisos se validan siempre en el servidor.</div>
    </section>
  </main>;
}
