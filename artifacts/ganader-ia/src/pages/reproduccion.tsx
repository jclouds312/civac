import { useAppState } from "../lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Download, Pencil, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";

export default function Reproduccion() {
  const { reproduccion, setReproduccion, animals } = useAppState();
  const [open, setOpen] = useState(false);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setReproduccion([{
      arete: fd.get('arete') as string,
      animal: fd.get('animal') as string,
      servicio: fd.get('servicio') as string,
      fechaParto: fd.get('fechaParto') as string,
      dias: Number(fd.get('dias')),
      partosPrev: Number(fd.get('partosPrev') || 0),
      estado: fd.get('estado') as string,
    }, ...reproduccion]);
    setOpen(false);
  };

  const getDiasColor = (dias: number) => dias < 20 ? 'text-green-400 bg-green-400/10' : dias < 35 ? 'text-orange-400 bg-orange-400/10' : 'text-muted-foreground bg-muted/30';

  const stats = useMemo(() => {
    const totalAnimales = animals.length || 1;
    const gestantes = reproduccion.length;
    const proxPartos30d = reproduccion.filter(r => r.dias <= 30).length;
    const proxPartos7d = reproduccion.filter(r => r.dias <= 7).length;
    const vacasAbiertas = animals.filter(a =>
      (a.categoria === 'Vaca adulta' || a.categoria === 'Novilla') &&
      a.estado === 'Abierta'
    ).length;
    const pctHato = ((gestantes / totalAnimales) * 100).toFixed(0);
    return { gestantes, proxPartos30d, proxPartos7d, vacasAbiertas, pctHato };
  }, [reproduccion, animals]);

  const kpisTop = [
    { label:'TASA CONCEPCIÓN', val:'62%', sub:'Meta 70% ↓', dot:'bg-orange-400' },
    { label:'PRÓX. PARTOS 30D', val: String(stats.proxPartos30d), sub:'gestantes confirmadas', dot: stats.proxPartos30d > 0 ? 'bg-green-400' : 'bg-muted-foreground' },
    { label:'ANESTROS >90D', val:'8', sub:'acción urgente', dot:'bg-red-500' },
    { label:'GESTANTES', val: String(stats.gestantes), sub:`${stats.pctHato}% del hato`, dot: stats.gestantes > 0 ? 'bg-green-400' : 'bg-muted-foreground' },
    { label:'IEP PROMEDIO', val:'428d', sub:'Meta <390d', dot:'bg-red-500' },
  ];

  const kpisBot = [
    { label:'TASA PREÑEZ', val:'52%', sub:'Meta 60%', dot:'bg-orange-400' },
    { label:'VACAS ABIERTAS', val: String(stats.vacasAbiertas), sub:'revisar protocolo', dot: stats.vacasAbiertas > 2 ? 'bg-red-500' : 'bg-orange-400' },
    { label:'DÍAS ABIERTOS PROM.', val:'142d', sub:'Meta <90d', dot:'bg-red-500' },
    { label:'DESTETES EXITOSOS', val:'94%', sub:'Meta 90% ✓', dot:'bg-green-400' },
  ];

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">🔁 Reproducción y Ciclos</h1>
          <p className="text-muted-foreground text-sm">Control de montas, I.A. y partos · IEP · Protocolos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 gap-1.5 text-sm"><Download size={14} /> CSV</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-9 gap-1.5 text-sm"><Plus size={14} /> Registrar Evento</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAdd}>
                <DialogHeader><DialogTitle>Registrar Gestación</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  {[['arete','Arete'],['animal','Animal'],['servicio','Servicio'],['fechaParto','Fecha Parto']].map(([n,l]) => (
                    <div key={n} className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right">{l}</Label>
                      <Input name={n} className="col-span-3" required />
                    </div>
                  ))}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right">Días</Label>
                    <Input name="dias" type="number" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right">Partos Prev.</Label>
                    <Input name="partosPrev" type="number" className="col-span-3" defaultValue="0" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right">Estado</Label>
                    <div className="col-span-3"><Select name="estado" defaultValue="Gestante"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Gestante','Próximo parto','En seguimiento'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                  <Button type="submit">Guardar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Top KPI cards (bordered style) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpisTop.map(k => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">{k.label}</span>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${k.dot}`} />
            </div>
            <div className="text-2xl font-bold text-foreground">{k.val}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 2-col: Próximos partos + Anestros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Próximos partos */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-gradient-to-r from-[#1b5e20]/40 to-[#2e7d32]/20">
            <div className="font-semibold text-sm">🐄 Próximos partos esperados</div>
            <Button size="sm" className="h-8 text-xs gap-1"><Plus size={12} /> Agregar</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1a4a2e] border-b border-[#2d6a3f]">
                  {['Arete','Animal','Servicio','Fecha Parto','Días','Partos Prev.','Estado',''].map(h => (
                    <th key={h} className="text-white/70 font-semibold text-[10px] uppercase px-3 py-2.5 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reproduccion.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-3 py-3 font-mono text-xs text-green-400 font-semibold">{r.arete}</td>
                    <td className="px-3 py-3 font-medium text-sm">{r.animal}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{r.servicio}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{r.fechaParto}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getDiasColor(r.dias)}`}>{r.dias}d</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-center text-muted-foreground">{r.partosPrev}</td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-medium text-purple-400 bg-purple-400/10 border border-purple-400/30 px-2 py-0.5 rounded-full">{r.estado}</span>
                    </td>
                    <td className="px-3 py-3"><button className="text-muted-foreground hover:text-primary p-1"><Pencil size={12} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Anestros */}
        <div className="bg-card border border-red-500/20 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-red-500/20 bg-red-500/5">
            <AlertTriangle size={16} className="text-red-400" />
            <div className="font-semibold text-sm text-red-400">Vacas con anestro prolongado — acción urgente</div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-400">8</span>
              <span className="text-sm text-muted-foreground">vacas con anestro &gt;90 días identificadas</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['A-0108','A-0319','A-0551','A-0712','A-0890','A-0445','A-0180','A-0320'].map(a => (
                <span key={a} className="text-xs font-mono bg-muted/30 border border-border text-muted-foreground px-2 py-0.5 rounded">{a}</span>
              ))}
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-1.5">
              <div className="text-xs font-semibold text-green-400 mb-2">🤖 Diagnóstico SoftGan IA:</div>
              <div className="text-xs text-muted-foreground">• IEP promedio 428d → pérdida estimada <strong className="text-foreground">$8.2M COP/mes</strong></div>
              <div className="text-xs text-muted-foreground">• 8 vacas en anestro &gt;90d → protocolo GnRH + PGF₂α</div>
              <div className="text-xs text-muted-foreground">• Posible déficit energético postparto — revisar BCS</div>
              <div className="mt-2 text-xs text-green-400 font-semibold">💡 Si reduce IEP a 390d → +14 vacas en producción → +$8.4M/mes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpisBot.map(k => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">{k.label}</span>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${k.dot}`} />
            </div>
            <div className="text-2xl font-bold text-foreground">{k.val}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
