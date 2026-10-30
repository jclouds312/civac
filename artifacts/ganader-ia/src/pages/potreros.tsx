import { useAppState } from "../lib/data";
import { Download, Plus, Layers, Printer, Edit2, Trash2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";

type Potrero = {
  id: number; nombre: string; pasto: string; hectareas: number;
  estado: string; diasOcupado?: number; diasDescanso?: number;
  diasRestantes?: number; diasRotacion: number; animales: number;
  capacidadMax?: number; aforo?: number; observaciones?: string;
};

const PASTOS = ["Kikuyo","Raigrás","Brachiaria","Estrella","Pasto nativo","Penisetum","Angleton","King grass","Maralfalfa","Ryegrass","Mombasa","Motivo"];
const ESTADOS = ["Disponible","Ocupado","Descanso","Rotar pronto","En renovación","Cerrado"];

const stateColor = (e: string) =>
  e === "Disponible" ? "#1b5e20" : e === "Ocupado" ? "#e65100" : e === "Rotar pronto" ? "#b71c1c" : e === "Descanso" ? "#0d47a1" : e === "En renovación" ? "#6a1b9a" : "#37474f";

const stateBadge = (e: string) =>
  e === "Disponible" ? "text-green-400 border-green-400/40" :
  e === "Ocupado" ? "text-orange-400 border-orange-400/40" :
  e === "Rotar pronto" ? "text-red-400 border-red-400/40" :
  e === "Descanso" ? "text-blue-400 border-blue-400/40" :
  e === "En renovación" ? "text-purple-400 border-purple-400/40" : "text-gray-400 border-gray-400/40";

const BLANK: Omit<Potrero, "id"> = {
  nombre: "", pasto: "Kikuyo", hectareas: 4.0, estado: "Disponible",
  diasOcupado: 0, diasDescanso: 0, diasRestantes: undefined,
  diasRotacion: 28, animales: 0, capacidadMax: 25, aforo: 0, observaciones: "",
};

function exportCSV(potreros: Potrero[]) {
  const h = ["Nombre","Pasto","Hectáreas","Estado","Días Ocupado","Días Descanso","Ciclo Rotación","Animales","Cap. Max","Observaciones"];
  const rows = potreros.map(p => [p.nombre, p.pasto, p.hectareas, p.estado, p.diasOcupado ?? 0, p.diasDescanso ?? 0, p.diasRotacion, p.animales, p.capacidadMax ?? "", p.observaciones ?? ""].join(","));
  const csv = [h.join(","), ...rows].join("\n");
  const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = `potreros_${new Date().toLocaleDateString("es-CO").replace(/\//g,"-")}.csv`; a.click();
}

function printPotreros(potreros: Potrero[]) {
  const html = `<!DOCTYPE html><html><head><title>Potreros</title><style>
    body{font-family:sans-serif;font-size:12px;margin:20px}
    h2{color:#1a4a2e;margin-bottom:8px}
    table{width:100%;border-collapse:collapse}
    th{background:#1a4a2e;color:white;padding:6px 8px;text-align:left}
    td{padding:5px 8px;border-bottom:1px solid #eee}
    tr:nth-child(even){background:#f9f9f9}
  </style></head><body>
    <h2>Potreros y Praderas — GanaderIA</h2>
    <p style="color:#666;margin-bottom:12px">Fecha: ${new Date().toLocaleDateString("es-CO")} · Total: ${potreros.length} potreros · ${potreros.reduce((s,p)=>s+p.hectareas,0).toFixed(1)} ha</p>
    <table>
      <thead><tr><th>Nombre</th><th>Pasto</th><th>Hectáreas</th><th>Estado</th><th>Días</th><th>Ciclo</th><th>Animales</th><th>Observaciones</th></tr></thead>
      <tbody>${potreros.map(p=>`<tr><td><b>${p.nombre}</b></td><td>${p.pasto}</td><td>${p.hectareas} ha</td><td>${p.estado}</td><td>${p.diasOcupado||p.diasDescanso||p.diasRestantes||0}</td><td>${p.diasRotacion}d</td><td>${p.animales}</td><td>${p.observaciones||"—"}</td></tr>`).join("")}</tbody>
    </table>
  </body></html>`;
  const w = window.open("","_blank","width=900,height=600"); w?.document.write(html); w?.print();
}

export default function Potreros() {
  const { potreros, setPotreros } = useAppState();
  const [view, setView] = useState<"mapa" | "lista">("mapa");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Potrero | null>(null);
  const [form, setForm] = useState<Omit<Potrero,"id">>(BLANK);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const totalHa = potreros.reduce((s, p) => s + p.hectareas, 0);

  function openAdd() { setEditTarget(null); setForm(BLANK); setDialogOpen(true); }
  function openEdit(p: Potrero) { setEditTarget(p); setForm({ ...p }); setDialogOpen(true); }

  function handleSave() {
    if (!form.nombre.trim() || !form.hectareas) return;
    if (editTarget) {
      setPotreros(prev => prev.map(p => p.id === editTarget.id ? { ...editTarget, ...form } : p));
    } else {
      const newId = Math.max(0, ...potreros.map(p => p.id)) + 1;
      setPotreros(prev => [...prev, { id: newId, ...form }]);
    }
    setDialogOpen(false);
  }

  function handleDelete(id: number) {
    setPotreros(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
  }

  function setF(k: keyof typeof BLANK, v: string | number) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  const mapParcelas = potreros.slice(0, 6).map(p => ({
    n: p.nombre, pasto: p.pasto, ha: p.hectareas,
    animals: p.animales, maxAnim: p.capacidadMax || p.animales,
    dias: p.diasOcupado || p.diasDescanso || p.diasRestantes || 0,
    ciclo: p.diasRotacion, estado: p.estado,
    bg: `${stateColor(p.estado)}CC`,
  }));

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden civac-animate"
        style={{background:"linear-gradient(135deg,#001a0d 0%,#002e14 100%)",border:"1px solid rgba(57,255,126,0.35)",boxShadow:"0 0 40px rgba(57,255,126,0.1)"}}>
        <div className="absolute inset-0 pointer-events-none"
          style={{backgroundImage:"url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80&auto=format&fit=crop')", backgroundSize:"cover", backgroundPosition:"center", opacity:0.1}}/>
        <div className="absolute inset-0 pointer-events-none" style={{background:"linear-gradient(135deg,#001a0dee 0%,#002e1488 50%,#001a0dcc 100%)"}}/>
        <div className="absolute right-0 top-0 w-48 h-full pointer-events-none opacity-10" style={{background:"radial-gradient(ellipse at right,#39ff7e,transparent 70%)"}} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{background:"rgba(57,255,126,0.1)",border:"1px solid rgba(57,255,126,0.4)",boxShadow:"0 0 16px rgba(57,255,126,0.2)"}}>
            <Layers size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{fontFamily:"Sora,sans-serif", textShadow:"0 0 30px rgba(57,255,126,0.25)"}}>Potreros y Praderas</h1>
            <p className="text-sm" style={{color:"rgba(57,255,126,0.75)"}}>Rotación activa · Carga animal · Kikuyo · CIVAC PRO v2.0</p>
          </div>
        </div>
        <div className="relative flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => exportCSV(potreros)}
            className="h-9 gap-1.5 text-sm" style={{background:"rgba(57,255,126,0.08)",border:"1px solid rgba(57,255,126,0.3)",color:"#39ff7e"}}>
            <Download size={14} /> CSV
          </Button>
          <Button variant="outline" onClick={() => printPotreros(potreros)}
            className="h-9 gap-1.5 text-sm" style={{background:"rgba(57,255,126,0.06)",border:"1px solid rgba(57,255,126,0.22)",color:"#39ff7e"}}>
            <Printer size={14} /> PDF
          </Button>
          <Button onClick={openAdd}
            className="h-9 gap-1.5 text-sm" style={{background:"rgba(57,255,126,0.2)",border:"1px solid rgba(57,255,126,0.5)",color:"#fff"}}>
            <Plus size={14} /> Nuevo Potrero
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:"POTREROS", val:`${potreros.length}`, sub:"registrados", c:"#39ff7e" },
          { label:"ÁREA TOTAL", val:`${totalHa.toFixed(1)} ha`, sub:"hectáreas totales", c:"#00f5d4" },
          { label:"DISPONIBLES", val:String(potreros.filter(p=>p.estado==="Disponible").length), sub:"para uso", c:"#4ade80" },
          { label:"EN DESCANSO", val:String(potreros.filter(p=>p.estado==="Descanso").length), sub:"recuperando", c:"#60a5fa" },
          { label:"ROTAR URGENTE", val:String(potreros.filter(p=>p.estado==="Rotar pronto").length), sub:"revisar hoy", c:"#ff006e" },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white relative overflow-hidden"
            style={{background:"linear-gradient(135deg,#020d09,#041208)",border:"1px solid rgba(0,245,212,0.15)"}}>
            <div className="absolute top-0 right-0 w-14 h-14 rounded-full pointer-events-none" style={{background:k.c,opacity:0.15,filter:"blur(18px)",transform:"translate(30%,-30%)"}} />
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{color:"rgba(0,245,212,0.55)"}}>{k.label}</div>
            <div className="text-2xl font-bold" style={{color:k.c,fontFamily:"Sora,sans-serif"}}>{k.val}</div>
            <div className="text-[10px]" style={{color:"rgba(255,255,255,0.4)"}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <button onClick={() => setView("mapa")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view==="mapa" ? "bg-primary text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}>
          🗺️ Mapa
        </button>
        <button onClick={() => setView("lista")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view==="lista" ? "bg-primary text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}>
          📋 Lista detallada
        </button>
      </div>

      {/* ── MAP VIEW ── */}
      {view === "mapa" ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-4 flex-wrap">
            <span className="text-sm font-semibold text-foreground">Leyenda:</span>
            {[
              {label:"Disponible",color:"#1b5e20"},{label:"Ocupado OK",color:"#e65100"},
              {label:"Rotar YA",color:"#b71c1c"},{label:"Descanso",color:"#0d47a1"},
              {label:"Renovación",color:"#6a1b9a"},
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{background:l.color}} />
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
          <div className="relative p-6" style={{background:"#c8e6c9",minHeight:420}}>
            <div className="absolute top-3 right-5 bg-white/60 rounded-full px-2 py-1 text-gray-700 font-bold text-xs backdrop-blur-sm">N↑</div>
            <div className="grid grid-cols-3 grid-rows-2 gap-4" style={{minHeight:340}}>
              {mapParcelas.map(p => {
                const diasLabel = p.estado === "Disponible" ? `Disponible · ${p.dias}d 💤` :
                  p.estado === "Descanso" ? `Descansando · ${p.dias}d 💤 · Ciclo ${p.ciclo}d` :
                  `${p.animals}/${p.maxAnim} an. · ${p.dias}d ↺`;
                const potrero = potreros.find(pt => pt.nombre === p.n);
                return (
                  <div key={p.n} onClick={() => potrero && openEdit(potrero)}
                    className="rounded-xl p-4 flex flex-col justify-between shadow-lg cursor-pointer hover:opacity-90 transition-all hover:scale-[1.02]"
                    style={{background:`${stateColor(p.estado)}DD`,minHeight:140}}>
                    <div>
                      <div className="text-white font-bold text-sm">{p.n} — {p.pasto}</div>
                      <div className="text-white/80 text-xs mt-1">{p.ha} ha</div>
                    </div>
                    <div>
                      <div className="text-white/80 text-xs">{diasLabel}</div>
                      {p.estado === "Rotar pronto" && (
                        <div className="mt-1 bg-white/20 rounded text-white text-[10px] font-bold px-2 py-0.5 inline-block">⚠ ROTAR YA</div>
                      )}
                      <div className="mt-1 text-white/50 text-[9px]">✏ Click para editar</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {potreros.length > 6 && (
              <div className="mt-3 text-center text-xs text-gray-600">+{potreros.length - 6} potreros más — ver en lista</div>
            )}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-blue-200/80 rounded-full px-6 py-2 text-blue-700 text-xs font-medium shadow">~ Laguna ~</div>
            <div className="absolute bottom-3 left-5 flex items-center gap-2">
              <div className="w-14 h-0.5 bg-green-800" />
              <span className="text-[10px] text-gray-600">escala ref.</span>
            </div>
          </div>
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div className="space-y-3">
          {potreros.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-xl p-5 hover:bg-muted/10 transition-colors">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <div className="font-bold text-foreground text-base">{p.nombre}</div>
                    <span className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 ${stateBadge(p.estado)}`}>{p.estado}</span>
                    <span className="text-xs text-muted-foreground">{p.hectareas} ha · {p.pasto}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{p.estado === "Descanso" ? "Días Descanso" : "Días Ocupado"}</span>
                      <span className="font-semibold text-foreground">{p.diasOcupado || p.diasDescanso || p.diasRestantes || 0} días</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Ciclo Rotación</span>
                      <span className="font-semibold text-foreground">{p.diasRotacion} días</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Animales</span>
                      <span className="font-semibold text-foreground">{p.animales} / {p.capacidadMax || "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Aforo (UAM/ha)</span>
                      <span className="font-semibold text-foreground">{p.aforo ? `${p.aforo}` : "—"}</span>
                    </div>
                  </div>
                  {p.observaciones && (
                    <div className="mt-2 text-xs text-muted-foreground italic">📝 {p.observaciones}</div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" onClick={() => openEdit(p)}
                    className="h-8 gap-1 text-xs"
                    style={{background:"rgba(57,255,126,0.1)",border:"1px solid rgba(57,255,126,0.3)",color:"#39ff7e"}}>
                    <Edit2 size={12} /> Editar
                  </Button>
                  {deleteConfirm === p.id ? (
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => handleDelete(p.id)}
                        className="h-8 gap-1 text-xs" style={{background:"rgba(255,80,80,0.2)",border:"1px solid rgba(255,80,80,0.5)",color:"#ff7070"}}>
                        <CheckCircle2 size={12} /> Sí, borrar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)} className="h-8 px-2">
                        <X size={12} />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(p.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400">
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
              </div>
              {/* Occupancy bar */}
              {p.estado === "Ocupado" && p.capacidadMax && p.capacidadMax > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Carga animal</span>
                    <span>{Math.round(p.animales / p.capacidadMax * 100)}% capacidad</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/30">
                    <div className="h-full rounded-full transition-all" style={{
                      width:`${Math.min(100, Math.round(p.animales / p.capacidadMax * 100))}%`,
                      background: p.animales >= p.capacidadMax ? "#ef4444" : p.animales >= p.capacidadMax * 0.8 ? "#f59e0b" : "#39ff7e"
                    }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── ADD / EDIT DIALOG ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers size={16} className="text-green-400" />
              {editTarget ? `Editar — ${editTarget.nombre}` : "Nuevo Potrero"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Nombre del potrero *</Label>
                <Input value={form.nombre} onChange={e => setF("nombre", e.target.value)} placeholder="Ej: Potrero Norte" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Pasto / Especie forrajera</Label>
                <Select value={form.pasto} onValueChange={v => setF("pasto", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PASTOS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Estado actual</Label>
                <Select value={form.estado} onValueChange={v => setF("estado", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ESTADOS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Hectáreas *</Label>
                <Input type="number" step="0.1" min="0" value={form.hectareas} onChange={e => setF("hectareas", Number(e.target.value))} placeholder="4.5" />
              </div>
              <div className="space-y-1.5">
                <Label>Cap. máx animales</Label>
                <Input type="number" min="0" value={form.capacidadMax ?? ""} onChange={e => setF("capacidadMax", Number(e.target.value))} placeholder="25" />
              </div>
              <div className="space-y-1.5">
                <Label>Animales actuales</Label>
                <Input type="number" min="0" value={form.animales} onChange={e => setF("animales", Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Ciclo rotación (días)</Label>
                <Input type="number" min="1" value={form.diasRotacion} onChange={e => setF("diasRotacion", Number(e.target.value))} />
              </div>
              {(form.estado === "Ocupado" || form.estado === "Rotar pronto") && (
                <div className="space-y-1.5">
                  <Label>Días ocupado</Label>
                  <Input type="number" min="0" value={form.diasOcupado ?? ""} onChange={e => setF("diasOcupado", Number(e.target.value))} />
                </div>
              )}
              {form.estado === "Descanso" && (
                <div className="space-y-1.5">
                  <Label>Días descanso</Label>
                  <Input type="number" min="0" value={form.diasDescanso ?? ""} onChange={e => setF("diasDescanso", Number(e.target.value))} />
                </div>
              )}
              {form.estado === "Rotar pronto" && (
                <div className="space-y-1.5">
                  <Label>Días restantes</Label>
                  <Input type="number" min="0" value={form.diasRestantes ?? ""} onChange={e => setF("diasRestantes", Number(e.target.value))} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Aforo (UAM/ha)</Label>
                <Input type="number" step="0.1" min="0" value={form.aforo ?? ""} onChange={e => setF("aforo", Number(e.target.value))} placeholder="0" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observaciones / Notas</Label>
              <Input value={form.observaciones ?? ""} onChange={e => setF("observaciones", e.target.value)} placeholder="Ej: Requiere resembrado en sector sur…" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.nombre.trim()}
              style={{background:"rgba(57,255,126,0.9)",color:"#052010"}}>
              <CheckCircle2 size={14} className="mr-1.5" />
              {editTarget ? "Guardar cambios" : "Crear potrero"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
