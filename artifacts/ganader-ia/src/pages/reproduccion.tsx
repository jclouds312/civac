import { useAppState } from "../lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Download, Pencil, AlertTriangle, Calendar, Activity, Target, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";

const iatfProtocol = [
  { dia: 0, evento: 'Dispositivo CIDR + Benzoato estradiol 2mg', tipo: 'Inicio', color: 'bg-blue-500' },
  { dia: 7, evento: 'Prostaglandina PGF₂α + PMSG (eCG)', tipo: 'Día 7', color: 'bg-orange-500' },
  { dia: 9, evento: 'Retiro CIDR + GnRH (Buserelina)', tipo: 'Día 9', color: 'bg-purple-500' },
  { dia: 11, evento: 'Inseminación artificial fija (IATF)', tipo: 'Día 11', color: 'bg-green-500' },
  { dia: 32, evento: 'Diagnóstico gestación (ecografía)', tipo: 'Día 32', color: 'bg-teal-500' },
];

const palpacionData = [
  { arete:'A-0108', animal:'Canela', fecha:'15/04/2025', resultado:'Vacía', dias_abiertos:142, bcs:2.5, protocolo:'IATF programada', veterinario:'Dr. Ramírez' },
  { arete:'A-0319', animal:'Luna', fecha:'12/04/2025', resultado:'Vacía', dias_abiertos:118, bcs:3.0, protocolo:'Observación celo', veterinario:'Dr. Ramírez' },
  { arete:'A-0551', animal:'Aurora', fecha:'10/04/2025', resultado:'Vacía', dias_abiertos:95, bcs:3.0, protocolo:'IATF programada', veterinario:'Pedro Villa' },
  { arete:'A-0712', animal:'Perla', fecha:'08/04/2025', resultado:'Vacía', dias_abiertos:88, bcs:2.0, protocolo:'Esperar recuperación', veterinario:'Dr. Ramírez' },
];

export default function Reproduccion() {
  const { reproduccion, setReproduccion, animals } = useAppState();
  const [open, setOpen] = useState(false);
  const [openIATF, setOpenIATF] = useState(false);
  const [activeTab, setActiveTab] = useState("partos");

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

  const getDiasStyle = (dias: number) =>
    dias <= 15 ? 'text-red-400 bg-red-400/10 border border-red-400/30' :
    dias <= 30 ? 'text-orange-400 bg-orange-400/10 border border-orange-400/30' :
    'text-muted-foreground bg-muted/20 border border-border';

  const stats = useMemo(() => {
    const gestantes = reproduccion.length;
    const proxPartos30d = reproduccion.filter(r => r.dias <= 30).length;
    const proxPartos7d = reproduccion.filter(r => r.dias <= 7).length;
    const vacasAbiertas = animals.filter(a => (a.categoria === 'Vaca adulta' || a.categoria === 'Novilla') && a.estado === 'Abierta').length;
    const totalHembras = animals.filter(a => a.categoria === 'Vaca adulta' || a.categoria === 'Novilla').length;
    const pctGestacion = totalHembras > 0 ? Math.round((gestantes / totalHembras) * 100) : 0;
    return { gestantes, proxPartos30d, proxPartos7d, vacasAbiertas, pctGestacion };
  }, [reproduccion, animals]);

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#1a1a5c] to-[#3730a3] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">🔁</div>
          <div>
            <h1 className="text-xl font-bold text-white">Reproducción y Ciclos Reproductivos</h1>
            <p className="text-white/70 text-sm">I.A. · IATF · Partos · IEP · Protocolos hormonales · Palpación</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-9 gap-1.5 text-sm">
            <Download size={14} /> CSV
          </Button>
          <Button onClick={() => setOpenIATF(true)} className="bg-white/15 hover:bg-white/25 text-white border border-white/30 h-9 gap-1.5 text-sm">
            <Target size={14} /> Protocolo IATF
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 h-9 gap-1.5 text-sm">
                <Plus size={14} /> Registrar Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <form onSubmit={handleAdd}>
                <DialogHeader><DialogTitle>Registrar Gestación / Evento Reproductivo</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Arete</Label><Input name="arete" required /></div>
                    <div className="space-y-1.5"><Label>Animal</Label><Input name="animal" required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Tipo servicio</Label>
                      <Select name="servicio" defaultValue="IA Altísimo">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['IA Altísimo','IA Furacao','IA Titan USA','IATF','Monta natural','Embrión'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>Fecha parto esperada</Label><Input name="fechaParto" placeholder="DD/MM/AAAA" required /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5"><Label>Días restantes</Label><Input name="dias" type="number" required /></div>
                    <div className="space-y-1.5"><Label>Partos previos</Label><Input name="partosPrev" type="number" defaultValue="0" /></div>
                    <div className="space-y-1.5">
                      <Label>Estado</Label>
                      <Select name="estado" defaultValue="Normal">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{['Normal','Primipara','Vigilar','En seguimiento'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
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

      {/* IATF Protocol Dialog */}
      <Dialog open={openIATF} onOpenChange={setOpenIATF}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader><DialogTitle>Protocolo IATF — GnRH + PGF₂α</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="text-sm text-muted-foreground">Protocolo estándar para sincronización de ovulación e inseminación artificial a tiempo fijo:</div>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
              <div className="space-y-4">
                {iatfProtocol.map((paso, i) => (
                  <div key={i} className="flex items-start gap-4 pl-10 relative">
                    <div className={`absolute left-2.5 w-3 h-3 rounded-full ${paso.color} border-2 border-background`}></div>
                    <div className="flex-1 bg-muted/20 rounded-lg p-3 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${paso.color}`}>{paso.tipo}</span>
                        <span className="text-xs text-muted-foreground">Día {paso.dia}</span>
                      </div>
                      <div className="text-sm font-medium text-foreground">{paso.evento}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-xs text-muted-foreground">
              <strong className="text-green-400">Tasa de preñez esperada:</strong> 50–65% con buen manejo nutricional y aplicación correcta del protocolo.
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cerrar</Button></DialogClose>
            <Button>Programar para hato</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KPI Cards Top */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:'TASA CONCEPCIÓN', val:'62%', sub:'Meta 70% ↓', dot:'bg-orange-400', icon:'🎯' },
          { label:'PRÓX. PARTOS 30D', val: String(stats.proxPartos30d), sub:`${stats.proxPartos7d} en menos de 7d`, dot: stats.proxPartos30d > 0 ? 'bg-green-400' : 'bg-muted-foreground', icon:'🐣' },
          { label:'ANESTROS >90D', val:'8', sub:'protocolo urgente', dot:'bg-red-500', icon:'⚠️' },
          { label:'GESTANTES', val: String(stats.gestantes), sub:`${stats.pctGestacion}% hato gestando`, dot: stats.gestantes > 0 ? 'bg-green-400' : 'bg-muted-foreground', icon:'🤰' },
          { label:'IEP PROMEDIO', val:'428d', sub:'Meta <390d ↑ urgente', dot:'bg-red-500', icon:'📅' },
        ].map(k => (
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

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="partos" className="gap-1.5 text-xs"><Calendar size={13} /> Próximos Partos</TabsTrigger>
          <TabsTrigger value="palpacion" className="gap-1.5 text-xs"><Activity size={13} /> Palpación</TabsTrigger>
          <TabsTrigger value="anestros" className="gap-1.5 text-xs"><AlertTriangle size={13} /> Anestros</TabsTrigger>
          <TabsTrigger value="indicadores" className="gap-1.5 text-xs"><CheckCircle2 size={13} /> Indicadores</TabsTrigger>
        </TabsList>

        {/* Próximos partos */}
        <TabsContent value="partos">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-gradient-to-r from-[#1a1a5c]/40 to-[#3730a3]/20">
              <div>
                <div className="font-semibold text-sm">🐄 Gestantes con parto esperado</div>
                <div className="text-xs text-muted-foreground">{reproduccion.length} gestaciones confirmadas · ordenadas por urgencia</div>
              </div>
              <Button size="sm" onClick={() => setOpen(true)} className="h-8 text-xs gap-1"><Plus size={12} /> Agregar</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1a1a5c]/30 border-b border-border">
                    {['ARETE','ANIMAL','TIPO SERVICIO','FECHA PARTO','DÍAS','PARTOS PREV.','ESTADO','ACCIÓN'].map(h => (
                      <th key={h} className="text-muted-foreground font-semibold text-[10px] uppercase px-4 py-2.5 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...reproduccion].sort((a,b) => a.dias - b.dias).map((r, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs text-green-400 font-semibold">{r.arete}</td>
                      <td className="px-4 py-3 font-medium text-sm">{r.animal}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{r.servicio}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.fechaParto}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getDiasStyle(r.dias)}`}>
                          {r.dias <= 7 ? '🚨 ' : r.dias <= 30 ? '⚠️ ' : ''}{r.dias}d
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-foreground">{r.partosPrev}</span>
                        <span className="text-xs text-muted-foreground ml-1">{r.partosPrev === 0 ? '(primípara)' : ''}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${r.estado === 'Primipara' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : r.estado === 'Vigilar' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'}`}>
                          {r.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-muted/30"><Pencil size={12} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Palpación */}
        <TabsContent value="palpacion">
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
            <div className="px-5 py-3 border-b border-border">
              <div className="font-semibold text-sm">🔬 Registros de Diagnóstico y Palpación</div>
              <div className="text-xs text-muted-foreground">{palpacionData.length} diagnósticos recientes · Vacas abiertas con seguimiento</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    {['ARETE','ANIMAL','FECHA DX','RESULTADO','DÍAS ABIERTOS','BCS','PROTOCOLO','VETERINARIO'].map(h => (
                      <th key={h} className="text-muted-foreground font-semibold text-[10px] uppercase px-4 py-2.5 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {palpacionData.map((p, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs text-green-400 font-semibold">{p.arete}</td>
                      <td className="px-4 py-3 font-medium text-sm">{p.animal}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.fecha}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">{p.resultado}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${p.dias_abiertos > 120 ? 'text-red-400' : p.dias_abiertos > 90 ? 'text-orange-400' : 'text-amber-400'}`}>
                          {p.dias_abiertos}d
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(star => (
                            <div key={star} className={`w-3 h-3 rounded-sm ${p.bcs >= star ? 'bg-amber-400' : p.bcs >= star - 0.5 ? 'bg-amber-400/50' : 'bg-muted/40'}`} />
                          ))}
                          <span className="ml-1 text-xs text-muted-foreground">{p.bcs}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{p.protocolo}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.veterinario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Anestros */}
        <TabsContent value="anestros">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-3">
            <div className="bg-card border border-red-500/30 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-red-500/20 bg-red-500/5">
                <AlertTriangle size={16} className="text-red-400" />
                <div>
                  <div className="font-semibold text-sm text-red-400">Anestros prolongados — Acción urgente</div>
                  <div className="text-xs text-red-400/70">8 vacas con anestro mayor a 90 días</div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-400">8</div>
                    <div className="text-xs text-muted-foreground">Vacas anestro &gt;90d</div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-400">142d</div>
                    <div className="text-xs text-muted-foreground">Días abiertos prom.</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['A-0108','A-0319','A-0551','A-0712','A-0890','A-0445','A-0180','A-0320'].map(a => (
                    <span key={a} className="text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-full">{a}</span>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase">Protocolo recomendado:</div>
                  {[
                    { paso: '1', texto: 'Evaluación BCS — corregir si BCS < 2.5', color: 'bg-blue-500' },
                    { paso: '2', texto: 'Aplicar GnRH día 0 (Buserelina 10mcg)', color: 'bg-purple-500' },
                    { paso: '3', texto: 'PGF₂α día 7 (Dinoprost 25mg)', color: 'bg-orange-500' },
                    { paso: '4', texto: 'GnRH día 9 + IATF 16h después', color: 'bg-green-500' },
                  ].map(p => (
                    <div key={p.paso} className="flex items-center gap-3 text-sm">
                      <span className={`w-5 h-5 rounded-full ${p.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>{p.paso}</span>
                      <span className="text-muted-foreground">{p.texto}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-card border border-amber-500/30 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl flex-shrink-0">🤖</div>
                <div>
                  <div className="font-semibold text-foreground">Diagnóstico SoftGan IA</div>
                  <div className="text-xs text-muted-foreground">Análisis reproductivo — Mayo 2025</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-muted-foreground">
                  ⚠️ IEP 428d → pérdida estimada <strong className="text-foreground">$8.2M COP/mes</strong>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-sm text-muted-foreground">
                  🔬 8 vacas en anestro &gt;90d → aplicar GnRH + PGF₂α inmediatamente
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-muted-foreground">
                  💊 Posible déficit energético postparto — revisar BCS &lt;2.5 y ajustar ración
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-400 font-semibold">
                  💡 Si reduce IEP a 390d → +14 vacas activas → <strong>+$8.4M/mes</strong>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-muted-foreground">
                  📅 Destetes exitosos: 94% ✓ — Tasa preñez: 52% (meta 60%)
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Indicadores */}
        <TabsContent value="indicadores">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {[
              { label:'TASA PREÑEZ', val:'52%', meta:'Meta 60%', ok: false, dot:'bg-orange-400', desc:'% vacas preñadas/servidas' },
              { label:'VACAS ABIERTAS', val: String(stats.vacasAbiertas), meta:'Revisar protocolo', ok: false, dot:'bg-red-500', desc:'Hembras sin gestación' },
              { label:'DÍAS ABIERTOS', val:'142d', meta:'Meta <90d', ok: false, dot:'bg-red-500', desc:'Prom. desde parto a concepción' },
              { label:'DESTETES EXIT.', val:'94%', meta:'Meta 90% ✓', ok: true, dot:'bg-green-400', desc:'Crías destetadas exitosamente' },
              { label:'TASA CONCEPCIÓN', val:'62%', meta:'Meta 70%', ok: false, dot:'bg-orange-400', desc:'1IA exitosas/total IAs' },
              { label:'IEP PROMEDIO', val:'428d', meta:'Meta 390d', ok: false, dot:'bg-red-500', desc:'Intervalo entre partos' },
              { label:'MORTALIDAD CRÍA', val:'3.2%', meta:'Meta <5% ✓', ok: true, dot:'bg-green-400', desc:'Terneros muertos/nacidos' },
              { label:'NATALIDAD', val:'88%', meta:'Meta 90%', ok: false, dot:'bg-amber-400', desc:'Partos/vacas en reproducción' },
            ].map(k => (
              <div key={k.label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">{k.label}</span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${k.dot}`} />
                </div>
                <div className="text-2xl font-bold text-foreground">{k.val}</div>
                <div className={`text-[10px] font-semibold mt-0.5 ${k.ok ? 'text-green-400' : 'text-orange-400'}`}>{k.meta}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{k.desc}</div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
