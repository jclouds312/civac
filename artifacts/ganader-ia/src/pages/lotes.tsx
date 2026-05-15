import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useAppState, MovimientoLote } from "../lib/data";
import { useAuth } from "../lib/auth";
import {
  Plus, Trash2, FileText, Printer, Scale, Bluetooth,
  Package, ShoppingCart, ArrowDownToLine, ArrowUpFromLine,
  Layers, Receipt, Banknote,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}
function fmtKg(n: number) { return n.toFixed(1); }
function getToday() { return new Date().toISOString().slice(0, 10); }

const TIPO_CONFIG = {
  compra:  { label: "Compra de Lote",  color: "#4ade80", glow: "74,222,128",  bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.35)",  emoji: "🛒" },
  ingreso: { label: "Ingreso de Lote", color: "#38bdf8", glow: "56,189,248",  bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.35)",  emoji: "📥" },
  venta:   { label: "Venta de Lote",   color: "#f87171", glow: "248,113,113", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.35)", emoji: "📤" },
} as const;

type TipoLote = keyof typeof TIPO_CONFIG;

// ── Recibo ────────────────────────────────────────────────────────────────────
function Recibo({ mov, onClose, userName }: { mov: MovimientoLote; onClose: () => void; userName: string }) {
  const t = TIPO_CONFIG[mov.tipo as TipoLote] ?? TIPO_CONFIG.ingreso;
  const precioAnimal = mov.promedioPesoAnimal * mov.costoKilo;

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid rgba(${t.glow},0.3)` }}>
        <div className="h-1.5" style={{ background: `linear-gradient(90deg,${t.color},transparent)` }} />
        <div className="p-5 space-y-4" style={{ background: "linear-gradient(135deg,#020d09,#030c07)" }}>

          {/* Header */}
          <div className="text-center space-y-1 border-b border-white/10 pb-4">
            <div className="text-2xl font-black" style={{ fontFamily: "Sora,sans-serif", color: t.color }}>🐄 CIVAC PRO</div>
            <div className="text-xs text-white/40">Ganadería Inteligente · Colombia</div>
            <div className="text-base font-black text-white mt-2 uppercase">Recibo de {mov.tipo}</div>
            <div className="text-[10px] text-white/30">Fecha: {mov.fecha} · ID #{mov.id}</div>
          </div>

          {/* Tipo badge */}
          <div className="rounded-lg p-3 text-center" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
            <div className="font-black text-lg" style={{ color: t.color }}>{t.emoji} {t.label}</div>
          </div>

          {/* Data table */}
          <div className="rounded-lg overflow-hidden border border-white/10">
            <table className="w-full text-xs">
              <tbody>
                {[
                  ["Nombre del Lote", mov.nombreLote],
                  ["Cantidad de Animales", `${mov.cantidadAnimales} cabezas`],
                  ["Peso Total del Lote", `${fmtKg(mov.pesoTotalLote)} kg`],
                  ["Promedio Peso/Animal", `${fmtKg(mov.promedioPesoAnimal)} kg`],
                  ["$ Costo por Kilo", fmt(mov.costoKilo)],
                  ["Precio Estimado/Animal", precioAnimal > 0 ? fmt(precioAnimal) : "—"],
                  ["Proveedor / Origen", mov.proveedor || "—"],
                  ["Destino / Comprador", mov.destino || "—"],
                  ["Registrado por", userName],
                  ["Observaciones", mov.notas || "—"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-t border-white/5">
                    <td className="p-2 text-white/40 w-44 font-semibold">{k}</td>
                    <td className="p-2 text-white/80 font-bold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="rounded-xl p-4 flex justify-between items-center"
            style={{ background: `rgba(${t.glow},0.08)`, border: `1px solid rgba(${t.glow},0.3)` }}>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40">Valor Total del Lote</div>
              <div className="text-[10px] text-white/25 mt-0.5">
                {fmt(mov.costoKilo)}/kg × {fmtKg(mov.pesoTotalLote)} kg
              </div>
            </div>
            <div className="font-black text-2xl" style={{ color: t.color, fontFamily: "Sora,sans-serif" }}>
              {fmt(mov.valorTotalLote)}
            </div>
          </div>

          <div className="text-center text-[9px] text-white/20 border-t border-white/5 pt-3">
            CIVAC PRO v3.0 · GanaderIA Colombia · {new Date().getFullYear()}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1 gap-2" onClick={() => window.print()}
          style={{ background: `rgba(${t.glow},0.12)`, border: `1px solid rgba(${t.glow},0.35)`, color: t.color }}>
          <Printer size={14} /> Imprimir Recibo
        </Button>
        <Button className="flex-1" variant="outline" onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Lotes() {
  const { lotes, setLotes } = useAppState();
  const { user } = useAuth();

  // Form
  const [open, setOpen] = useState(false);
  const [tipoForm, setTipoForm] = useState<TipoLote>("compra");
  const [cantidad, setCantidad] = useState("");
  const [pesoTotal, setPesoTotal] = useState("");
  const [costoKilo, setCostoKilo] = useState("");
  const [btLoading, setBtLoading] = useState(false);

  // UI
  const [filterTipo, setFilterTipo] = useState("todos");
  const [reciboMov, setReciboMov] = useState<MovimientoLote | null>(null);

  // Auto-calc
  const promedio  = Number(cantidad) > 0 && Number(pesoTotal) > 0 ? Number(pesoTotal) / Number(cantidad) : 0;
  const valorTotal = Number(costoKilo) > 0 && Number(pesoTotal) > 0 ? Number(costoKilo) * Number(pesoTotal) : 0;
  const precioAnimal = promedio * Number(costoKilo);

  const resetForm = () => { setCantidad(""); setPesoTotal(""); setCostoKilo(""); setBtLoading(false); };

  const openNew = (tipo: TipoLote) => { resetForm(); setTipoForm(tipo); setOpen(true); };

  // Simulated market price reference via "BT"
  const btSimCosto = () => {
    setBtLoading(true);
    setTimeout(() => {
      const refs = [9800, 10500, 11000, 11500, 12000, 12500];
      setCostoKilo(String(refs[Math.floor(Math.random() * refs.length)]));
      setBtLoading(false);
    }, 1400);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newMov: MovimientoLote = {
      id: Date.now(),
      tipo: tipoForm,
      nombreLote: fd.get("nombreLote") as string,
      cantidadAnimales: Number(cantidad),
      pesoTotalLote: Number(pesoTotal),
      promedioPesoAnimal: promedio,
      costoKilo: Number(costoKilo),
      valorTotalLote: valorTotal,
      fecha: (fd.get("fecha") as string) || getToday(),
      notas: (fd.get("notas") as string) || "",
      reciboGenerado: true,
      proveedor: (fd.get("proveedor") as string) || "",
      destino: (fd.get("destino") as string) || "",
    };
    setLotes((prev: MovimientoLote[]) => [newMov, ...prev]);
    setOpen(false);
    resetForm();
    setReciboMov(newMov);
  };

  const handleDelete = (id: number) => setLotes(lotes.filter((l: MovimientoLote) => l.id !== id));

  const filtered = filterTipo === "todos" ? lotes : lotes.filter((l: MovimientoLote) => l.tipo === filterTipo);

  // KPIs
  const totalCompras  = lotes.filter((l: MovimientoLote) => l.tipo === "compra").reduce((s: number, l: MovimientoLote)  => s + l.valorTotalLote, 0);
  const totalIngresos = lotes.filter((l: MovimientoLote) => l.tipo === "ingreso").reduce((s: number, l: MovimientoLote) => s + l.valorTotalLote, 0);
  const totalVentas   = lotes.filter((l: MovimientoLote) => l.tipo === "venta").reduce((s: number, l: MovimientoLote)   => s + l.valorTotalLote, 0);
  const totalAnimalesEnt = lotes.filter((l: MovimientoLote) => l.tipo !== "venta").reduce((s: number, l: MovimientoLote) => s + l.cantidadAnimales, 0);
  const pesoTotalAcc  = lotes.filter((l: MovimientoLote) => l.tipo !== "venta").reduce((s: number, l: MovimientoLote)   => s + l.pesoTotalLote, 0);

  const tc = TIPO_CONFIG[tipoForm];

  return (
    <div className="space-y-5 pb-8">

      {/* ── BANNER ─────────────────────────────────────────────────────────── */}
      <div className="rounded-xl p-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#000d1a 0%,#001a2e 50%,#000d1a 100%)",
          border: "1px solid rgba(0,200,255,0.35)",
          boxShadow: "0 0 60px rgba(0,200,255,0.07), inset 0 1px 0 rgba(0,200,255,0.08)",
        }}>
        <div className="absolute right-0 top-0 bottom-0 w-64 pointer-events-none opacity-10"
          style={{ background: "radial-gradient(ellipse at right, #00c8ff, transparent 70%)" }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: "rgba(0,200,255,0.1)", border: "1px solid rgba(0,200,255,0.4)", boxShadow: "0 0 20px rgba(0,200,255,0.2)" }}>
              🐂
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: "Sora,sans-serif" }}>
                  Movimiento de Lotes
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: "rgba(0,200,255,0.12)", color: "#00c8ff", border: "1px solid rgba(0,200,255,0.3)" }}>
                  {lotes.length} registros
                </span>
              </div>
              <p className="text-sm" style={{ color: "rgba(0,200,255,0.65)" }}>
                Comprar · Ingresar · Vender · Recibo automático · Cálculos en tiempo real
              </p>
              <div className="flex gap-3 mt-1.5 flex-wrap">
                {(Object.entries(TIPO_CONFIG) as [TipoLote, typeof TIPO_CONFIG[TipoLote]][]).map(([t, conf]) => {
                  const n = lotes.filter((l: MovimientoLote) => l.tipo === t).length;
                  return (
                    <span key={t} className="text-[10px] flex items-center gap-1" style={{ color: conf.color }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: conf.color }} />
                      {n} {conf.label.split(" ")[0]}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3 ACTION CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.entries(TIPO_CONFIG) as [TipoLote, typeof TIPO_CONFIG[TipoLote]][]).map(([t, conf]) => {
          const count = lotes.filter((l: MovimientoLote) => l.tipo === t).length;
          const valor = lotes.filter((l: MovimientoLote) => l.tipo === t).reduce((s: number, l: MovimientoLote) => s + l.valorTotalLote, 0);
          return (
            <button key={t} onClick={() => openNew(t)}
              className="rounded-xl p-4 text-left transition-all hover:scale-[1.02] active:scale-100"
              style={{
                background: `linear-gradient(135deg,rgba(${conf.glow},0.08),rgba(${conf.glow},0.02))`,
                border: `1px solid rgba(${conf.glow},0.28)`,
              }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `rgba(${conf.glow},0.12)`, border: `1px solid rgba(${conf.glow},0.3)` }}>
                  {conf.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm text-white">{conf.label}</div>
                  <div className="text-[10px]" style={{ color: `rgba(${conf.glow},0.55)` }}>
                    {count} movimiento{count !== 1 ? "s" : ""}
                  </div>
                </div>
                <Plus size={15} style={{ color: `rgba(${conf.glow},0.45)`, flexShrink: 0 }} />
              </div>
              <div className="font-black text-lg" style={{ color: conf.color, fontFamily: "Sora,sans-serif" }}>
                {valor > 0 ? fmt(valor) : "—"}
              </div>
              <div className="text-[9px] text-white/20 mt-0.5">valor acumulado</div>
            </button>
          );
        })}
      </div>

      {/* ── KPI CARDS ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: "🛒", label: "COMPRAS",      val: fmt(totalCompras),                          sub: "valor total",        c: "#4ade80", glow: "74,222,128" },
          { icon: "📥", label: "INGRESOS",     val: fmt(totalIngresos),                         sub: "valor total",        c: "#38bdf8", glow: "56,189,248" },
          { icon: "📤", label: "VENTAS",       val: fmt(totalVentas),                           sub: "valor total",        c: "#f87171", glow: "248,113,113" },
          { icon: "🐄", label: "ANIMALES",     val: String(totalAnimalesEnt),                   sub: "entradas acum.",     c: "#ff9500", glow: "255,149,0" },
          { icon: "⚖️", label: "PESO ENTRADA", val: `${(pesoTotalAcc / 1000).toFixed(1)}t`,     sub: "toneladas métricas", c: "#a78bfa", glow: "167,139,250" },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-3.5 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#020d09,#041208)", border: `1px solid rgba(${k.glow},0.18)` }}>
            <div className="absolute top-0 right-0 w-10 h-10 rounded-full pointer-events-none"
              style={{ background: `rgb(${k.glow})`, opacity: 0.12, filter: "blur(14px)", transform: "translate(30%,-30%)" }} />
            <div className="text-lg mb-1">{k.icon}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: `rgba(${k.glow},0.55)` }}>{k.label}</div>
            <div className="text-lg font-black truncate" style={{ color: k.c, fontFamily: "Sora,sans-serif" }}>{k.val}</div>
            <div className="text-[9px] text-white/30">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── FILTER TABS ────────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {([
          ["todos",   "Todos",    "#00c8ff"],
          ["compra",  "Compras",  "#4ade80"],
          ["ingreso", "Ingresos", "#38bdf8"],
          ["venta",   "Ventas",   "#f87171"],
        ] as [string, string, string][]).map(([v, l, c]) => (
          <button key={v} onClick={() => setFilterTipo(v)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={filterTipo === v
              ? { background: `${c}22`, color: c, border: `1px solid ${c}55` }
              : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {l}
            {v !== "todos" && (
              <span className="ml-1.5 text-[10px] opacity-60">
                {lotes.filter((l2: MovimientoLote) => l2.tipo === v).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── HISTORY TABLE ──────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-xl py-16 text-center"
          style={{ background: "rgba(0,200,255,0.03)", border: "1px dashed rgba(0,200,255,0.15)" }}>
          <Package size={40} className="mx-auto mb-3" style={{ color: "rgba(0,200,255,0.2)" }} />
          <p className="text-white/30 text-sm">Sin movimientos registrados</p>
          <p className="text-white/20 text-xs mt-1">Usa los botones de arriba para registrar compras, ingresos o ventas</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,200,255,0.12)" }}>
          <div className="px-4 py-3 flex items-center gap-2"
            style={{ background: "rgba(0,200,255,0.05)", borderBottom: "1px solid rgba(0,200,255,0.1)" }}>
            <Layers size={14} style={{ color: "#00c8ff" }} />
            <span className="font-bold text-sm text-white">Historial de Movimientos</span>
            <span className="ml-auto text-xs text-white/30">{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(0,200,255,0.04)", borderBottom: "1px solid rgba(0,200,255,0.08)" }}>
                  {["TIPO", "LOTE", "FECHA", "ANIM.", "PESO TOTAL", "PROM/ANIMAL", "$/KG", "VALOR TOTAL", "ORIGEN/DESTINO", "ACC."].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "rgba(0,200,255,0.6)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m: MovimientoLote) => {
                  const mt = TIPO_CONFIG[m.tipo as TipoLote] ?? TIPO_CONFIG.ingreso;
                  return (
                    <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap"
                          style={{ background: mt.bg, color: mt.color, border: `1px solid ${mt.border}` }}>
                          {mt.emoji} {m.tipo}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-bold text-white text-xs">{m.nombreLote}</td>
                      <td className="px-3 py-2.5 text-xs text-white/40 whitespace-nowrap">{m.fecha}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-black text-white">{m.cantidadAnimales}</td>
                      <td className="px-3 py-2.5 font-bold text-orange-300 whitespace-nowrap">{fmtKg(m.pesoTotalLote)} kg</td>
                      <td className="px-3 py-2.5 text-xs text-white/50 whitespace-nowrap">{fmtKg(m.promedioPesoAnimal)} kg</td>
                      <td className="px-3 py-2.5 text-xs text-white/40">{m.costoKilo > 0 ? fmt(m.costoKilo) : "—"}</td>
                      <td className="px-3 py-2.5">
                        {m.valorTotalLote > 0
                          ? <span className="font-black text-xs" style={{ color: mt.color }}>{fmt(m.valorTotalLote)}</span>
                          : <span className="text-white/20">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-white/35 max-w-[120px] truncate">
                        {m.proveedor || m.destino || <span className="text-white/15">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-0.5">
                          <button title="Ver recibo" onClick={() => setReciboMov(m)}
                            className="p-1.5 rounded hover:bg-white/5 transition-colors"
                            style={{ color: "rgba(0,245,212,0.6)" }}>
                            <Receipt size={12} />
                          </button>
                          <button title="Eliminar" onClick={() => handleDelete(m.id)}
                            className="p-1.5 rounded hover:bg-red-500/20 transition-colors text-red-400/40 hover:text-red-400">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary footer */}
          <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/5"
            style={{ background: "rgba(0,200,255,0.02)" }}>
            {[
              { label: "Total movimientos",    val: String(lotes.length),                                                             c: "#00c8ff" },
              { label: "Animales movilizados", val: String(lotes.reduce((s: number, m: MovimientoLote) => s + m.cantidadAnimales, 0)), c: "#ff9500" },
              { label: "Valor acumulado",      val: fmt(lotes.reduce((s: number, m: MovimientoLote) => s + m.valorTotalLote, 0)),      c: "#39ff7e" },
              {
                label: "Compras / Ventas",
                val: `${lotes.filter((m: MovimientoLote) => m.tipo === "compra").length} / ${lotes.filter((m: MovimientoLote) => m.tipo === "venta").length}`,
                c: "#a78bfa",
              },
            ].map(s => (
              <div key={s.label}>
                <div className="text-[9px] uppercase tracking-wider text-white/25">{s.label}</div>
                <div className="font-black text-sm" style={{ color: s.c }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FORM DIALOG ────────────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={v => { if (!v) resetForm(); setOpen(v); }}>
        <DialogContent className="sm:max-w-[560px] max-h-[92vh] overflow-y-auto">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-xl">{tc.emoji}</span>
                {tc.label}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">

              {/* Tipo selector */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Tipo de Movimiento</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(TIPO_CONFIG) as [TipoLote, typeof TIPO_CONFIG[TipoLote]][]).map(([t, conf]) => (
                    <button key={t} type="button" onClick={() => setTipoForm(t)}
                      className="p-3 rounded-xl text-center transition-all"
                      style={tipoForm === t
                        ? { background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }
                        : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}>
                      <div className="text-xl">{conf.emoji}</div>
                      <div className="text-xs font-bold mt-1">{conf.label.split(" ")[0]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre + fecha */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Nombre del Lote</Label>
                  <Input name="nombreLote" required placeholder="Ej. Lote Engorde Nov" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Fecha</Label>
                  <Input name="fecha" type="date" defaultValue={getToday()} />
                </div>
              </div>

              {/* Proveedor / destino */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  {tipoForm === "venta" ? "Destino / Comprador" : "Proveedor / Origen"}
                </Label>
                <Input name="proveedor"
                  placeholder={tipoForm === "venta" ? "Frigorífico, comprador, destino final" : "Finca o proveedor de origen"} />
              </div>
              {tipoForm === "venta" && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Destino Final</Label>
                  <Input name="destino" placeholder="Frigorífico, otro municipio, etc." />
                </div>
              )}

              {/* Cantidad + Peso total */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Cantidad de Animales</Label>
                  <Input type="number" min="1" required value={cantidad}
                    onChange={e => setCantidad(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Peso Total del Lote (kg)</Label>
                  <Input type="number" step="0.1" min="0" required value={pesoTotal}
                    onChange={e => setPesoTotal(e.target.value)} placeholder="0.0 kg" />
                </div>
              </div>

              {/* Promedio auto-calc */}
              <div className="rounded-lg px-4 py-3 flex items-center gap-3"
                style={{ background: "rgba(255,149,0,0.06)", border: "1px solid rgba(255,149,0,0.2)" }}>
                <Scale size={16} style={{ color: "#ff9500", flexShrink: 0 }} />
                <div className="flex-1">
                  <div className="text-[9px] uppercase tracking-wider text-white/30">Promedio de Peso por Animal — Auto calculado</div>
                  <div className="font-black text-xl" style={{ color: promedio > 0 ? "#ff9500" : "rgba(255,255,255,0.15)", fontFamily: "Sora,sans-serif" }}>
                    {promedio > 0 ? `${fmtKg(promedio)} kg` : "— kg"}
                  </div>
                </div>
                {promedio > 0 && (
                  <div className="text-[9px] text-white/25 text-right">
                    {pesoTotal} kg ÷ {cantidad}
                  </div>
                )}
              </div>

              {/* Costo por kilo + price-reference button */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">$ Costo por Kilo (COP)</Label>
                <div className="flex gap-2">
                  <Input type="number" step="100" min="0" required value={costoKilo}
                    onChange={e => setCostoKilo(e.target.value)} placeholder="Ej. 11000" className="flex-1" />
                  <Button type="button" onClick={btSimCosto} disabled={btLoading}
                    className="gap-1.5 px-3 text-xs whitespace-nowrap"
                    style={{ background: btLoading ? "rgba(0,200,255,0.2)" : "rgba(0,200,255,0.1)", border: "1px solid rgba(0,200,255,0.4)", color: "#00c8ff" }}>
                    <Bluetooth size={13} className={btLoading ? "animate-pulse" : ""} />
                    {btLoading ? "Obteniendo…" : "Precio Ref."}
                  </Button>
                </div>
                <p className="text-[10px] text-white/25">Mercado colombiano: ~$10,500–$12,500/kg ganado en pie</p>
              </div>

              {/* Valor total auto-calc */}
              <div className="rounded-xl p-4"
                style={{
                  background: valorTotal > 0 ? tc.bg : "rgba(255,255,255,0.03)",
                  border: valorTotal > 0 ? `1px solid ${tc.border}` : "1px solid rgba(255,255,255,0.06)",
                }}>
                <div className="text-[9px] uppercase tracking-wider text-white/35 mb-1">Valor Total del Lote — Auto calculado</div>
                <div className="font-black text-2xl" style={{ color: valorTotal > 0 ? tc.color : "rgba(255,255,255,0.15)", fontFamily: "Sora,sans-serif" }}>
                  {valorTotal > 0 ? fmt(valorTotal) : "—"}
                </div>
                {valorTotal > 0 && (
                  <div className="text-[9px] text-white/30 mt-0.5">
                    = {fmt(Number(costoKilo))}/kg × {fmtKg(Number(pesoTotal))} kg totales
                  </div>
                )}
              </div>

              {/* Precio por animal reference */}
              {precioAnimal > 0 && (
                <div className="rounded-lg px-4 py-2.5 flex items-center gap-3"
                  style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <Banknote size={14} style={{ color: "#fbbf24", flexShrink: 0 }} />
                  <div className="text-xs text-white/50 flex-1">
                    Precio estimado por animal:
                    <strong className="text-[#fbbf24] text-sm ml-2">{fmt(precioAnimal)}</strong>
                  </div>
                  <span className="text-[10px] text-white/20">
                    {fmt(Number(costoKilo))} × {fmtKg(promedio)} kg
                  </span>
                </div>
              )}

              {/* Notas */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Notas (opcional)</Label>
                <Input name="notas" placeholder="Observaciones del movimiento…" />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.color }}>
                <Receipt size={14} className="mr-1.5" />
                {tc.emoji} Registrar y Generar Recibo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── RECIBO DIALOG ──────────────────────────────────────────────────── */}
      <Dialog open={!!reciboMov} onOpenChange={v => { if (!v) setReciboMov(null); }}>
        <DialogContent className="sm:max-w-[480px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={15} style={{ color: "#00f5d4" }} />
              Recibo de Movimiento de Lote
            </DialogTitle>
          </DialogHeader>
          {reciboMov && (
            <Recibo
              mov={reciboMov}
              onClose={() => setReciboMov(null)}
              userName={user?.nombre ?? "Admin"}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
