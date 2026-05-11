import { useState, useEffect, useRef } from "react";
import { useAppState } from "../lib/data";
import { useAuth } from "../lib/auth";
import {
  Scale, Bluetooth, BluetoothConnected, BluetoothOff, Plus, Trash2,
  Download, RefreshCw, CheckCircle2, XCircle, TrendingUp, TrendingDown,
  Minus, Wifi, WifiOff, Zap, BarChart3, Filter, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type BtStatus = 'idle' | 'scanning' | 'connected' | 'error';

const DISPOSITIVOS_BT = [
  { id: 'tru-test-xr', nombre: 'Tru-Test XR3000', tipo: 'Báscula electrónica', bateria: 87 },
  { id: 'tru-test-s3', nombre: 'Tru-Test S3', tipo: 'Indicador portátil', bateria: 64 },
  { id: 'gallagher-w210', nombre: 'Gallagher W210', tipo: 'Báscula WiFi', bateria: 92 },
  { id: 'ahi-caroplus', nombre: 'AHI Caroplus 2', tipo: 'Báscula RFID', bateria: 41 },
];

function simWeightReading(baseWeight: number): number {
  return +(baseWeight + (Math.random() - 0.5) * 4).toFixed(1);
}

export default function Pesaje() {
  const { animals, pesajes, setPesajes } = useAppState();
  const { user } = useAuth();

  const [btStatus, setBtStatus] = useState<BtStatus>('idle');
  const [selectedDevice, setSelectedDevice] = useState(DISPOSITIVOS_BT[0]);
  const [liveWeight, setLiveWeight] = useState<number | null>(null);
  const [stable, setStable] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(animals[0]);
  const [open, setOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [searchAnim, setSearchAnim] = useState("");
  const [filterLote, setFilterLote] = useState("Todos");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredAnimals = animals.filter(a => {
    const ms = a.nombre.toLowerCase().includes(searchAnim.toLowerCase()) || a.id.toLowerCase().includes(searchAnim.toLowerCase());
    const ml = filterLote === "Todos" || a.lote === filterLote;
    return ms && ml;
  });

  const connectBluetooth = async () => {
    setBtStatus('scanning');
    setLiveWeight(null);
    setStable(false);
    await new Promise(r => setTimeout(r, 1800));
    setBtStatus('connected');
    startLiveReading();
  };

  const disconnectBluetooth = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setBtStatus('idle');
    setLiveWeight(null);
    setStable(false);
  };

  const startLiveReading = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const base = selectedAnimal?.peso || 400;
    let count = 0;
    intervalRef.current = setInterval(() => {
      const w = simWeightReading(base);
      setLiveWeight(w);
      count++;
      if (count >= 5) {
        setStable(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 600);
  };

  useEffect(() => {
    if (btStatus === 'connected' && selectedAnimal) {
      setStable(false);
      startLiveReading();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnimal]);

  const capturePeso = () => {
    if (!liveWeight || !stable || !selectedAnimal) return;
    const prev = pesajes.filter(p => p.animalId === selectedAnimal.id).sort((a,b) => b.id - a.id)[0];
    const now = new Date();
    const newPesaje = {
      id: Date.now(),
      animalId: selectedAnimal.id,
      animalNombre: selectedAnimal.nombre,
      peso: liveWeight,
      pesoAnterior: prev?.peso ?? selectedAnimal.peso,
      fecha: now.toLocaleDateString('es-CO'),
      hora: now.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' }),
      metodo: 'bluetooth',
      dispositivo: selectedDevice.nombre,
      operador: user?.nombre || 'Sistema',
      observacion: '',
      lote: selectedAnimal.lote,
      categoria: selectedAnimal.categoria,
    };
    setPesajes([newPesaje, ...pesajes]);
    setStable(false);
    setLiveWeight(null);
    startLiveReading();
  };

  const handleManualAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const aid = fd.get('animal') as string;
    const anim = animals.find(a => a.id === aid);
    const prev = pesajes.filter(p => p.animalId === aid).sort((a,b) => b.id - a.id)[0];
    const newPesaje = {
      id: Date.now(),
      animalId: aid,
      animalNombre: anim?.nombre || aid,
      peso: Number(fd.get('peso')),
      pesoAnterior: prev?.peso ?? (anim?.peso ?? 0),
      fecha: fd.get('fecha') as string || new Date().toLocaleDateString('es-CO'),
      hora: fd.get('hora') as string || '',
      metodo: 'manual',
      dispositivo: '',
      operador: fd.get('operador') as string || user?.nombre || '',
      observacion: fd.get('observacion') as string || '',
      lote: anim?.lote || '',
      categoria: anim?.categoria || '',
    };
    setPesajes([newPesaje, ...pesajes]);
    setManualOpen(false);
  };

  const deletePesaje = (id: number) => setPesajes(pesajes.filter(p => p.id !== id));

  // Stats
  const totalPesajes = pesajes.length;
  const btPesajes = pesajes.filter(p => p.metodo === 'bluetooth').length;
  const pesoPromedio = pesajes.length ? (pesajes.reduce((s,p) => s + p.peso, 0) / pesajes.length).toFixed(1) : '0';
  const hoy = pesajes.filter(p => p.fecha === new Date().toLocaleDateString('es-CO')).length;

  // Chart data per animal
  const animalHistory = (aid: string) => {
    return pesajes.filter(p => p.animalId === aid)
      .slice(0, 8).reverse()
      .map((p, i) => ({ name: `P${i+1}`, kg: p.peso }));
  };

  const diffColor = (cur: number, prev: number) => cur > prev ? 'text-green-400' : cur < prev ? 'text-red-400' : 'text-muted-foreground';
  const diffIcon = (cur: number, prev: number) => cur > prev ? <TrendingUp size={12} /> : cur < prev ? <TrendingDown size={12} /> : <Minus size={12} />;

  return (
    <div className="space-y-5 pb-8">
      {/* CIVAC Banner */}
      <div className="rounded-xl p-5 relative overflow-hidden civac-animate"
        style={{background:'linear-gradient(135deg,#1a0d00 0%,#2e1500 100%)', border:'1px solid rgba(255,149,0,0.4)', boxShadow:'0 0 40px rgba(255,149,0,0.12), inset 0 1px 0 rgba(255,149,0,0.08)'}}>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <Scale className="w-32 h-32 text-white" />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{background:'rgba(255,149,0,0.1)', border:'1px solid rgba(255,149,0,0.4)', boxShadow:'0 0 16px rgba(255,149,0,0.2)'}}>
              <Scale className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white" style={{fontFamily:'Sora,sans-serif'}}>Pesaje de Animales</h1>
              <p className="text-sm" style={{color:'rgba(255,180,80,0.8)'}}>Bluetooth · Tru-Test · Gallagher · Manual · RFID</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={manualOpen} onOpenChange={setManualOpen}>
              <DialogTrigger asChild>
                <Button className="h-9 gap-1.5 text-sm" style={{background:'rgba(255,149,0,0.15)', border:'1px solid rgba(255,149,0,0.4)', color:'#fff'}}>
                  <Plus size={14} /> Pesaje Manual
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleManualAdd}>
                  <DialogHeader><DialogTitle>Registrar Pesaje Manual</DialogTitle></DialogHeader>
                  <div className="grid gap-3 py-4">
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-sm">Animal</Label>
                      <div className="col-span-3">
                        <Select name="animal" defaultValue={animals[0]?.id}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{animals.map(a => <SelectItem key={a.id} value={a.id}>{a.nombre} ({a.id})</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-sm">Peso (kg)</Label>
                      <Input name="peso" type="number" step="0.1" className="col-span-3" required placeholder="Ej. 485.5" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-sm">Fecha</Label>
                      <Input name="fecha" className="col-span-3" placeholder={new Date().toLocaleDateString('es-CO')} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-sm">Hora</Label>
                      <Input name="hora" className="col-span-3" placeholder="08:30" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-sm">Operador</Label>
                      <Input name="operador" className="col-span-3" defaultValue={user?.nombre} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-sm">Observación</Label>
                      <Input name="observacion" className="col-span-3" placeholder="Opcional" />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700">Guardar Pesaje</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'PESAJES REGISTRADOS', val: String(totalPesajes), sub:'historial completo', c:'#ff9500', icon:'⚖️' },
          { label:'VÍA BLUETOOTH', val: String(btPesajes), sub:'básculas digitales', c:'#00c8ff', icon:'📡' },
          { label:'PESO PROMEDIO', val:`${pesoPromedio}kg`, sub:'todos los registros', c:'#39ff7e', icon:'📊' },
          { label:'PESAJES HOY', val: String(hoy), sub:'jornada actual', c:'#bf00ff', icon:'📅' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white relative overflow-hidden"
            style={{background:'linear-gradient(135deg,#020d09,#041208)', border:'1px solid rgba(0,245,212,0.15)'}}>
            <div className="absolute top-0 right-0 w-14 h-14 rounded-full pointer-events-none" style={{background:k.c, opacity:0.15, filter:'blur(18px)', transform:'translate(30%,-30%)'}} />
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{color:'rgba(0,245,212,0.55)'}}>{k.icon} {k.label}</div>
            <div className="text-2xl font-bold" style={{color:k.c, fontFamily:'Sora,sans-serif'}}>{k.val}</div>
            <div className="text-[10px]" style={{color:'rgba(255,255,255,0.4)'}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="bluetooth" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="bluetooth" className="gap-1.5"><Bluetooth size={14} />Báscula BT</TabsTrigger>
          <TabsTrigger value="historial" className="gap-1.5"><BarChart3 size={14} />Historial</TabsTrigger>
          <TabsTrigger value="analisis" className="gap-1.5"><TrendingUp size={14} />Análisis</TabsTrigger>
        </TabsList>

        {/* Bluetooth Tab */}
        <TabsContent value="bluetooth">
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Device selector + connection */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Bluetooth size={16} className="text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Control Bluetooth</div>
                  <div className="text-xs text-muted-foreground">Conectar báscula digital</div>
                </div>
                <div className={`ml-auto flex items-center gap-1.5 text-xs font-medium ${btStatus === 'connected' ? 'text-green-400' : btStatus === 'scanning' ? 'text-amber-400' : 'text-muted-foreground'}`}>
                  {btStatus === 'connected' ? <><BluetoothConnected size={14} />Conectado</> : btStatus === 'scanning' ? <><RefreshCw size={14} className="animate-spin" />Buscando...</> : <><BluetoothOff size={14} />Desconectado</>}
                </div>
              </div>

              {/* Device list */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dispositivos disponibles</p>
                {DISPOSITIVOS_BT.map(d => (
                  <div
                    key={d.id}
                    onClick={() => { setSelectedDevice(d); if(btStatus==='connected') { disconnectBluetooth(); } }}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedDevice.id === d.id ? 'border-blue-500/50 bg-blue-500/10' : 'border-border hover:border-blue-500/30 hover:bg-muted/20'}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                      <Scale size={15} className="text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{d.nombre}</div>
                      <div className="text-xs text-muted-foreground">{d.tipo}</div>
                    </div>
                    <div className="text-xs text-right">
                      <div className={`font-semibold ${d.bateria > 50 ? 'text-green-400' : d.bateria > 20 ? 'text-amber-400' : 'text-red-400'}`}>{d.bateria}%</div>
                      <div className="text-muted-foreground">batería</div>
                    </div>
                    {selectedDevice.id === d.id && <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                {btStatus === 'idle' || btStatus === 'error' ? (
                  <Button onClick={connectBluetooth} className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2">
                    <Bluetooth size={15} /> Conectar {selectedDevice.nombre}
                  </Button>
                ) : btStatus === 'scanning' ? (
                  <Button disabled className="flex-1 gap-2">
                    <RefreshCw size={15} className="animate-spin" /> Buscando dispositivo...
                  </Button>
                ) : (
                  <Button onClick={disconnectBluetooth} variant="outline" className="flex-1 gap-2 text-red-400 border-red-500/30">
                    <BluetoothOff size={15} /> Desconectar
                  </Button>
                )}
              </div>
            </div>

            {/* Live weighing */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Scale size={16} className="text-orange-400" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Lectura en Vivo</div>
                  <div className="text-xs text-muted-foreground">Selecciona el animal y captura el peso</div>
                </div>
              </div>

              {/* Animal selector */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Animal a pesar</Label>
                <Select value={selectedAnimal?.id} onValueChange={id => setSelectedAnimal(animals.find(a => a.id === id) || animals[0])}>
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {animals.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nombre} — {a.id} ({a.categoria})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedAnimal && (
                  <div className="text-xs text-muted-foreground">
                    Último peso registrado: <strong className="text-foreground">{selectedAnimal.peso} kg</strong> · {selectedAnimal.raza} · {selectedAnimal.lote}
                  </div>
                )}
              </div>

              {/* Live display */}
              <div className={`rounded-xl p-6 text-center transition-all ${btStatus === 'connected' ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-muted/20 border border-border'}`}>
                {btStatus !== 'connected' ? (
                  <div className="text-muted-foreground">
                    <Scale size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Conecte la báscula Bluetooth para ver la lectura en tiempo real</p>
                  </div>
                ) : (
                  <>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">PESO EN BÁSCULA</div>
                    <div className={`text-6xl font-bold font-mono transition-all ${stable ? 'text-green-400' : 'text-amber-400'}`}>
                      {liveWeight !== null ? `${liveWeight}` : '---'}
                    </div>
                    <div className="text-lg text-slate-400 font-semibold mt-1">kg</div>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      {stable ? (
                        <span className="flex items-center gap-1.5 text-green-400 text-sm font-semibold">
                          <CheckCircle2 size={16} /> Peso estable · Listo para capturar
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-400 text-sm">
                          <RefreshCw size={14} className="animate-spin" /> Estabilizando...
                        </span>
                      )}
                    </div>
                    {liveWeight && selectedAnimal && (
                      <div className={`mt-2 text-xs ${diffColor(liveWeight, selectedAnimal.peso)}`}>
                        <span className="inline-flex items-center gap-1">
                          {diffIcon(liveWeight, selectedAnimal.peso)}
                          {liveWeight > selectedAnimal.peso ? '+' : ''}{(liveWeight - selectedAnimal.peso).toFixed(1)} kg vs. último pesaje
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Button
                onClick={capturePeso}
                disabled={!stable || !liveWeight || btStatus !== 'connected'}
                className="w-full bg-orange-600 hover:bg-orange-700 gap-2 h-11 text-base font-semibold"
              >
                <Zap size={16} /> Capturar Peso ({liveWeight ? `${liveWeight} kg` : '---'})
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="historial">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="font-semibold">Historial de Pesajes</div>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
                  <Input
                    placeholder="Buscar animal..."
                    value={searchAnim}
                    onChange={e => setSearchAnim(e.target.value)}
                    className="pl-8 h-8 text-sm w-40 bg-muted/30"
                  />
                </div>
                <Select value={filterLote} onValueChange={setFilterLote}>
                  <SelectTrigger className="w-28 h-8 text-sm bg-muted/30"><SelectValue /></SelectTrigger>
                  <SelectContent>{['Todos','Lote A','Lote B','Lote C','Lote D','Lote E'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border" style={{background:'rgba(255,149,0,0.07)'}}>
                    {['Fecha','Hora','Animal','Arete','Peso','Anterior','Diferencia','Método','Dispositivo','Operador','Acc.'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs uppercase font-semibold whitespace-nowrap" style={{color:'rgba(255,149,0,0.75)'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pesajes.filter(p => {
                    const ms = p.animalNombre.toLowerCase().includes(searchAnim.toLowerCase()) || p.animalId.toLowerCase().includes(searchAnim.toLowerCase());
                    const ml = filterLote === "Todos" || p.lote === filterLote;
                    return ms && ml;
                  }).map(p => {
                    const diff = p.peso - p.pesoAnterior;
                    return (
                      <tr key={p.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{p.fecha}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{p.hora}</td>
                        <td className="px-4 py-3 font-semibold">{p.animalNombre}</td>
                        <td className="px-4 py-3 font-mono text-xs text-orange-400">{p.animalId}</td>
                        <td className="px-4 py-3 font-bold text-orange-300">{p.peso} kg</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{p.pesoAnterior} kg</td>
                        <td className={`px-4 py-3 text-xs font-semibold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                          <span className="inline-flex items-center gap-1">
                            {diff > 0 ? <TrendingUp size={11} /> : diff < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {p.metodo === 'bluetooth' ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                              <Bluetooth size={10} /> BT
                            </span>
                          ) : (
                            <span className="text-xs bg-muted/40 text-muted-foreground px-2 py-0.5 rounded-full">Manual</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[120px] truncate">{p.dispositivo || '—'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{p.operador}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => deletePesaje(p.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {pesajes.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Scale size={36} className="mx-auto mb-2 opacity-30" />
                  <p>No hay pesajes registrados aún</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analisis">
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Per-animal trend */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-orange-400" />
                Tendencia de Peso por Animal
              </div>
              <div className="space-y-4">
                {filteredAnimals.slice(0,5).map(a => {
                  const hist = animalHistory(a.id);
                  const lastPesaje = pesajes.filter(p => p.animalId === a.id).sort((x,y) => y.id - x.id)[0];
                  const currentWeight = lastPesaje?.peso ?? a.peso;
                  const prevWeight = lastPesaje?.pesoAnterior ?? a.peso;
                  const diff = currentWeight - prevWeight;
                  return (
                    <div key={a.id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold text-sm">{a.nombre}</span>
                          <span className="text-xs text-muted-foreground ml-2">{a.id}</span>
                          <span className="text-xs text-muted-foreground ml-2">{a.categoria}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-orange-400">{currentWeight} kg</div>
                          <div className={`text-xs ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                          </div>
                        </div>
                      </div>
                      {hist.length > 1 ? (
                        <div className="h-16">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hist} margin={{top:2,right:2,left:0,bottom:0}}>
                              <defs>
                                <linearGradient id={`grad_${a.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="kg" stroke="#f97316" strokeWidth={1.5} fill={`url(#grad_${a.id})`} dot={false} />
                              <Tooltip contentStyle={{backgroundColor:'#111',border:'1px solid #333',fontSize:'11px'}} formatter={(v:number) => [`${v} kg`]} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-16 flex items-center justify-center text-xs text-muted-foreground">Sin historial suficiente</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary chart */}
            <div className="space-y-5">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 size={16} className="text-amber-400" />
                  Distribución Pesos Actuales
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={animals.slice(0,8).map(a => ({ name: a.nombre.split(' ')[0], kg: a.peso, categoria: a.categoria }))} margin={{top:5,right:10,left:0,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="name" tick={{fontSize:10, fill:'#888'}} />
                      <YAxis tick={{fontSize:10, fill:'#888'}} width={40} />
                      <Tooltip contentStyle={{backgroundColor:'#111',border:'1px solid #333',fontSize:'11px'}} formatter={(v:number) => [`${v} kg`]} />
                      <Bar dataKey="kg" fill="#f97316" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="font-semibold mb-3 text-sm">Resumen por Categoría</div>
                {(['Vaca adulta','Novilla','Ternero','Toro'] as const).map(cat => {
                  const group = animals.filter(a => a.categoria === cat);
                  if (!group.length) return null;
                  const avg = (group.reduce((s,a) => s + a.peso, 0) / group.length).toFixed(0);
                  return (
                    <div key={cat} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm w-24 text-muted-foreground">{cat}</span>
                      <div className="flex-1 h-2 bg-muted/30 rounded-full">
                        <div className="h-2 bg-orange-500 rounded-full" style={{width:`${Math.min(100, Number(avg)/10)}%`}} />
                      </div>
                      <span className="text-sm font-bold text-orange-300 w-16 text-right">{avg} kg</span>
                      <span className="text-xs text-muted-foreground w-12 text-right">{group.length} anim.</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
