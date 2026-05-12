import { useState, useEffect, useRef } from "react";
import { useAppState } from "../lib/data";
import { useAuth } from "../lib/auth";
import {
  Scale, Bluetooth, BluetoothConnected, BluetoothOff, Plus, Trash2,
  Download, RefreshCw, CheckCircle2, TrendingUp, TrendingDown,
  Minus, Zap, BarChart3, Search, FileText, Printer, Calculator,
  Beef, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ── Peso esperado por raza y categoría ──────────────────────────────────────
const PESOS_RAZA: Record<string, Record<string, { min: number; max: number; promedio: number }>> = {
  "Holstein":   { "Vaca adulta":{ min:490, max:650, promedio:560 }, "Novilla":{ min:280, max:380, promedio:330 }, "Ternero":{ min:40,  max:120, promedio:80  }, "Ternera":{ min:38,  max:110, promedio:75  }, "Toro":{ min:700, max:950, promedio:820 } },
  "Simmental":  { "Vaca adulta":{ min:520, max:700, promedio:600 }, "Novilla":{ min:300, max:420, promedio:360 }, "Ternero":{ min:45,  max:130, promedio:90  }, "Ternera":{ min:42,  max:125, promedio:85  }, "Toro":{ min:750, max:1000,promedio:870 } },
  "Brahman":    { "Vaca adulta":{ min:400, max:580, promedio:490 }, "Novilla":{ min:250, max:360, promedio:300 }, "Ternero":{ min:35,  max:100, promedio:65  }, "Ternera":{ min:32,  max:95,  promedio:60  }, "Toro":{ min:650, max:900, promedio:780 } },
  "Gyr X":      { "Vaca adulta":{ min:380, max:550, promedio:470 }, "Novilla":{ min:240, max:350, promedio:290 }, "Ternero":{ min:32,  max:95,  promedio:62  }, "Ternera":{ min:30,  max:90,  promedio:58  }, "Toro":{ min:600, max:850, promedio:730 } },
  "Gyr":        { "Vaca adulta":{ min:380, max:540, promedio:460 }, "Novilla":{ min:240, max:345, promedio:285 }, "Ternero":{ min:32,  max:92,  promedio:60  }, "Ternera":{ min:30,  max:88,  promedio:56  }, "Toro":{ min:590, max:840, promedio:720 } },
  "Jersey":     { "Vaca adulta":{ min:330, max:470, promedio:400 }, "Novilla":{ min:200, max:290, promedio:245 }, "Ternero":{ min:25,  max:80,  promedio:52  }, "Ternera":{ min:24,  max:76,  promedio:49  }, "Toro":{ min:500, max:700, promedio:600 } },
};

// Peso por defecto si la raza no está mapeada
const PESO_DEFAULT: Record<string, { min: number; max: number; promedio: number }> = {
  "Vaca adulta":{ min:420, max:600, promedio:510 },
  "Novilla":    { min:250, max:370, promedio:310 },
  "Ternero":    { min:35,  max:110, promedio:70  },
  "Ternera":    { min:33,  max:105, promedio:67  },
  "Toro":       { min:600, max:900, promedio:750 },
};

function getPesoEsperado(raza: string, categoria: string) {
  return PESOS_RAZA[raza]?.[categoria] ?? PESO_DEFAULT[categoria] ?? { min:100, max:800, promedio:400 };
}

type BtStatus = 'idle' | 'scanning' | 'connected' | 'error';

const DISPOSITIVOS_BT = [
  { id: 'tru-test-xr', nombre: 'Tru-Test XR3000', tipo: 'Báscula electrónica', bateria: 87 },
  { id: 'tru-test-s3', nombre: 'Tru-Test S3', tipo: 'Indicador portátil', bateria: 64 },
  { id: 'gallagher-w210', nombre: 'Gallagher W210', tipo: 'Báscula WiFi', bateria: 92 },
  { id: 'ahi-caroplus', nombre: 'AHI Caroplus 2', tipo: 'Báscula RFID', bateria: 41 },
];

function fmt(n: number) {
  return new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(n);
}

function fmtDate() {
  return new Date().toLocaleDateString('es-CO');
}

// ── Recibo / Factura de Pesaje ───────────────────────────────────────────────
interface PesajeConValor {
  id: number;
  animalId: string;
  animalNombre: string;
  raza?: string;
  categoria: string;
  peso: number;
  pesoAnterior: number;
  fecha: string;
  hora: string;
  metodo: string;
  dispositivo: string;
  operador: string;
  observacion: string;
  lote: string;
  valorKilo?: number;
  valorTotal?: number;
  condicionCorporal?: string;
  finca?: string;
}

function ReciboPesaje({ p, onClose, finca }: { p: PesajeConValor; onClose: () => void; finca?: string }) {
  const diff = p.peso - p.pesoAnterior;
  const diffPct = p.pesoAnterior > 0 ? ((diff / p.pesoAnterior) * 100).toFixed(1) : "0";
  const vk = p.valorKilo || 0;
  const vt = p.peso * vk;
  const pesoEsp = getPesoEsperado(p.raza || "", p.categoria || "");

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden" style={{border:'1px solid rgba(255,149,0,0.3)'}}>
        {/* Encabezado */}
        <div className="p-4 text-center" style={{background:'linear-gradient(135deg,#1a0d00,#2e1500)'}}>
          <div className="font-black text-2xl mb-0.5" style={{fontFamily:'Sora,sans-serif',color:'#ff9500'}}>CIVAC PRO</div>
          <div className="text-xs text-white/40">Ganadería Inteligente · Colombia</div>
          <div className="mt-2 font-bold text-white text-sm uppercase tracking-wider">Recibo de Pesaje</div>
          <div className="text-[10px] text-white/30 mt-0.5">Folio #{p.id} · {finca || 'Finca CIVAC'}</div>
        </div>

        <div className="p-4 space-y-4" style={{background:'#020d09'}}>
          {/* Info animal */}
          <div className="rounded-lg p-3 space-y-2 text-sm" style={{background:'rgba(255,149,0,0.06)',border:'1px solid rgba(255,149,0,0.2)'}}>
            <div className="font-bold text-white text-base flex items-center gap-2">
              <span>🐄</span> {p.animalNombre}
              <span className="text-xs font-mono text-orange-400">#{p.animalId}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {[
                ["Raza", p.raza || "—"],
                ["Categoría", p.categoria || "—"],
                ["Lote", p.lote],
                ["Fecha", p.fecha],
                ["Hora", p.hora],
                ["Operador", p.operador],
                ["Método", p.metodo === "bluetooth" ? "Báscula BT" : "Manual"],
                ["Dispositivo", p.dispositivo || "—"],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between gap-1">
                  <span className="text-white/40">{k}:</span>
                  <span className="text-white/80 font-medium truncate max-w-[100px]">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Datos de pesaje */}
          <div className="rounded-lg overflow-hidden border border-white/10">
            <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-white/40 border-b border-white/5">
              Datos del Pesaje
            </div>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Peso actual", <span className="font-black text-lg text-orange-300">{p.peso.toFixed(1)} kg</span>],
                  ["Peso anterior", <span>{p.pesoAnterior.toFixed(1)} kg</span>],
                  ["Diferencia", <span className={`font-bold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-white/50'}`}>{diff > 0 ? "+" : ""}{diff.toFixed(1)} kg ({diffPct}%)</span>],
                  ...(p.condicionCorporal ? [["Condición corporal", <span>{p.condicionCorporal}</span>]] : []),
                  ...(p.observacion ? [["Observación", <span className="text-white/60 text-xs">{p.observacion}</span>]] : []),
                ].map(([k,v], i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td className="px-3 py-2 text-white/50">{k as string}</td>
                    <td className="px-3 py-2 text-right">{v as React.ReactNode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Referencia por raza */}
          {p.raza && p.categoria && (
            <div className="rounded-lg p-3" style={{background:'rgba(0,200,255,0.06)',border:'1px solid rgba(0,200,255,0.2)'}}>
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-bold">Referencia Raza {p.raza} — {p.categoria}</div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-white/30 text-[9px]">Mínimo</div>
                  <div className="font-bold text-blue-400">{pesoEsp.min} kg</div>
                </div>
                <div>
                  <div className="text-white/30 text-[9px]">Promedio</div>
                  <div className="font-bold text-cyan-300">{pesoEsp.promedio} kg</div>
                </div>
                <div>
                  <div className="text-white/30 text-[9px]">Máximo</div>
                  <div className="font-bold text-blue-400">{pesoEsp.max} kg</div>
                </div>
              </div>
              <div className="mt-2 text-[10px] text-center">
                {p.peso >= pesoEsp.min && p.peso <= pesoEsp.max
                  ? <span className="text-green-400 font-semibold">✓ Peso dentro del rango esperado para la raza</span>
                  : p.peso < pesoEsp.min
                    ? <span className="text-amber-400">⚠ Peso por debajo del rango mínimo de raza</span>
                    : <span className="text-blue-400">↑ Peso por encima del rango — excelente condición</span>
                }
              </div>
            </div>
          )}

          {/* Valor económico */}
          {vk > 0 && (
            <div className="rounded-xl p-4 space-y-2" style={{background:'rgba(57,255,126,0.07)',border:'1px solid rgba(57,255,126,0.25)'}}>
              <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Valor Económico del Animal</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-white/40">Costo por kilo</div>
                  <div className="font-bold text-white">{fmt(vk)}</div>
                </div>
                <div>
                  <div className="text-white/40">Peso actual</div>
                  <div className="font-bold text-white">{p.peso.toFixed(1)} kg</div>
                </div>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                <span className="font-bold text-white text-sm">VALOR TOTAL ANIMAL</span>
                <span className="font-black text-2xl" style={{color:'#39ff7e',fontFamily:'Sora,sans-serif'}}>{fmt(vt)}</span>
              </div>
              <div className="text-[10px] text-white/30 text-right">{fmt(vk)}/kg × {p.peso.toFixed(1)} kg</div>
            </div>
          )}

          <div className="text-center text-[9px] text-white/20 pt-1 border-t border-white/5">
            Documento generado por CIVAC PRO — Sistema de Gestión Ganadera Colombia
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1 gap-2" onClick={() => window.print()}
          style={{background:'rgba(255,149,0,0.12)',border:'1px solid rgba(255,149,0,0.3)',color:'#ff9500'}}>
          <Printer size={14} /> Imprimir
        </Button>
        <Button className="flex-1" variant="outline" onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Pesaje() {
  const { animals, pesajes, setPesajes } = useAppState();
  const { user } = useAuth();

  const [btStatus, setBtStatus] = useState<BtStatus>('idle');
  const [selectedDevice, setSelectedDevice] = useState(DISPOSITIVOS_BT[0]);
  const [liveWeight, setLiveWeight] = useState<number | null>(null);
  const [stable, setStable] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(animals[0]);
  const [manualOpen, setManualOpen] = useState(false);
  const [searchAnim, setSearchAnim] = useState("");
  const [filterLote, setFilterLote] = useState("Todos");
  const [reciboP, setReciboP] = useState<PesajeConValor | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Manual form state
  const [manualAnimalId, setManualAnimalId] = useState(animals[0]?.id || "");
  const [manualPeso, setManualPeso] = useState("");
  const [manualValorKilo, setManualValorKilo] = useState("11000");
  const [manualCondicion, setManualCondicion] = useState("3.0");

  const manualAnimal = animals.find(a => a.id === manualAnimalId) || animals[0];

  // Auto-calculate suggested weight from breed when animal changes
  useEffect(() => {
    if (manualAnimal && !manualPeso) {
      const esp = getPesoEsperado(manualAnimal.raza, manualAnimal.categoria);
      setManualPeso(String(esp.promedio));
    }
  }, [manualAnimalId]);

  const manualValorTotal = Number(manualPeso) > 0 && Number(manualValorKilo) > 0
    ? Number(manualPeso) * Number(manualValorKilo)
    : 0;

  const pesoEsperadoManual = manualAnimal
    ? getPesoEsperado(manualAnimal.raza, manualAnimal.categoria)
    : { min:0, max:0, promedio:0 };

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
    const base = selectedAnimal?.peso || getPesoEsperado(selectedAnimal?.raza || "", selectedAnimal?.categoria || "").promedio;
    let count = 0;
    intervalRef.current = setInterval(() => {
      const w = +(base + (Math.random() - 0.5) * 4).toFixed(1);
      setLiveWeight(w);
      count++;
      if (count >= 5) { setStable(true); if (intervalRef.current) clearInterval(intervalRef.current); }
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
    const vk = selectedAnimal.valorKilo || 11000;
    const newP: PesajeConValor = {
      id: Date.now(),
      animalId: selectedAnimal.id,
      animalNombre: selectedAnimal.nombre,
      raza: selectedAnimal.raza,
      categoria: selectedAnimal.categoria || "",
      peso: liveWeight,
      pesoAnterior: prev?.peso ?? selectedAnimal.peso,
      fecha: now.toLocaleDateString('es-CO'),
      hora: now.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' }),
      metodo: 'bluetooth',
      dispositivo: selectedDevice.nombre,
      operador: user?.nombre || 'Sistema',
      observacion: '',
      lote: selectedAnimal.lote,
      valorKilo: vk,
      valorTotal: liveWeight * vk,
    };
    setPesajes([newP, ...pesajes]);
    setStable(false);
    setLiveWeight(null);
    setReciboP(newP);
    startLiveReading();
  };

  const handleManualAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const anim = manualAnimal;
    const prev = pesajes.filter(p => p.animalId === anim?.id).sort((a,b) => b.id - a.id)[0];
    const peso = Number(manualPeso);
    const vk = Number(manualValorKilo) || 11000;
    const newP: PesajeConValor = {
      id: Date.now(),
      animalId: anim?.id || "",
      animalNombre: anim?.nombre || "",
      raza: anim?.raza,
      categoria: anim?.categoria || "",
      peso,
      pesoAnterior: prev?.peso ?? (anim?.peso ?? 0),
      fecha: fd.get('fecha') as string || fmtDate(),
      hora: fd.get('hora') as string || new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}),
      metodo: 'manual',
      dispositivo: '',
      operador: fd.get('operador') as string || user?.nombre || '',
      observacion: fd.get('observacion') as string || '',
      lote: anim?.lote || '',
      valorKilo: vk,
      valorTotal: peso * vk,
      condicionCorporal: manualCondicion ? `CC ${manualCondicion}` : undefined,
    };
    setPesajes([newP, ...pesajes]);
    setManualOpen(false);
    setManualPeso("");
    setReciboP(newP);
  };

  const deletePesaje = (id: number) => setPesajes(pesajes.filter(p => p.id !== id));

  // Stats
  const totalPesajes = pesajes.length;
  const btPesajes = pesajes.filter(p => p.metodo === 'bluetooth').length;
  const pesoPromedio = pesajes.length ? (pesajes.reduce((s,p) => s + p.peso, 0) / pesajes.length).toFixed(1) : '0';
  const hoy = pesajes.filter(p => p.fecha === fmtDate()).length;

  const animalHistory = (aid: string) =>
    pesajes.filter(p => p.animalId === aid).slice(0, 8).reverse().map((p, i) => ({ name:`P${i+1}`, kg:p.peso }));

  const diffColor = (cur: number, prev: number) => cur > prev ? 'text-green-400' : cur < prev ? 'text-red-400' : 'text-muted-foreground';
  const diffIcon = (cur: number, prev: number) => cur > prev ? <TrendingUp size={12}/> : cur < prev ? <TrendingDown size={12}/> : <Minus size={12}/>;

  // Selected animal breed reference
  const selAnimalEsp = selectedAnimal ? getPesoEsperado(selectedAnimal.raza, selectedAnimal.categoria) : null;

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="rounded-xl p-5 relative overflow-hidden civac-animate"
        style={{background:'linear-gradient(135deg,#1a0d00 0%,#2e1500 100%)', border:'1px solid rgba(255,149,0,0.4)', boxShadow:'0 0 40px rgba(255,149,0,0.12)'}}>
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
              <p className="text-sm" style={{color:'rgba(255,180,80,0.8)'}}>Auto-cálculo por raza · Factura imprimible · Bluetooth · Manual</p>
            </div>
          </div>
          <Dialog open={manualOpen} onOpenChange={v => { if (!v) setManualPeso(""); setManualOpen(v); }}>
            <DialogTrigger asChild>
              <Button className="h-9 gap-1.5 text-sm" style={{background:'rgba(255,149,0,0.15)', border:'1px solid rgba(255,149,0,0.4)', color:'#fff'}}>
                <Plus size={14}/> Pesaje Manual
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[540px] max-h-[92vh] overflow-y-auto">
              <form onSubmit={handleManualAdd}>
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Scale size={16} className="text-orange-400"/>Registrar Pesaje Manual</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">

                  {/* Animal */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Animal</Label>
                    <Select value={manualAnimalId} onValueChange={id => { setManualAnimalId(id); setManualPeso(""); }}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>{animals.map(a => <SelectItem key={a.id} value={a.id}>{a.nombre} — {a.id} ({a.raza} · {a.categoria})</SelectItem>)}</SelectContent>
                    </Select>
                    {manualAnimal && (
                      <div className="flex gap-2 text-xs text-white/50 flex-wrap">
                        <span>Raza: <strong className="text-white/80">{manualAnimal.raza}</strong></span>
                        <span>·</span>
                        <span>Categoría: <strong className="text-white/80">{manualAnimal.categoria}</strong></span>
                        <span>·</span>
                        <span>Lote: <strong className="text-white/80">{manualAnimal.lote}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Auto-cálculo por raza */}
                  {manualAnimal && (
                    <div className="rounded-xl p-3" style={{background:'rgba(0,200,255,0.07)',border:'1px solid rgba(0,200,255,0.2)'}}>
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator size={13} className="text-cyan-400"/>
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Auto-cálculo · Raza {manualAnimal.raza}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-2">
                        <div className="rounded-lg p-2" style={{background:'rgba(0,200,255,0.1)'}}>
                          <div className="text-white/40 text-[9px]">Mínimo</div>
                          <div className="font-bold text-blue-300">{pesoEsperadoManual.min} kg</div>
                        </div>
                        <div className="rounded-lg p-2" style={{background:'rgba(0,245,212,0.15)',border:'1px solid rgba(0,245,212,0.3)'}}>
                          <div className="text-white/40 text-[9px]">Promedio raza</div>
                          <div className="font-black text-cyan-300">{pesoEsperadoManual.promedio} kg</div>
                        </div>
                        <div className="rounded-lg p-2" style={{background:'rgba(0,200,255,0.1)'}}>
                          <div className="text-white/40 text-[9px]">Máximo</div>
                          <div className="font-bold text-blue-300">{pesoEsperadoManual.max} kg</div>
                        </div>
                      </div>
                      <Button type="button" size="sm"
                        className="w-full gap-2 text-xs"
                        style={{background:'rgba(0,200,255,0.15)',border:'1px solid rgba(0,200,255,0.35)',color:'#00c8ff'}}
                        onClick={() => setManualPeso(String(pesoEsperadoManual.promedio))}>
                        <Zap size={12}/> Usar peso promedio de raza ({pesoEsperadoManual.promedio} kg)
                      </Button>
                    </div>
                  )}

                  {/* Peso */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Peso (kg)</Label>
                    <Input type="number" step="0.1" min="0" required
                      value={manualPeso} onChange={e => setManualPeso(e.target.value)}
                      placeholder="Ingrese o use auto-cálculo de raza"/>
                    {manualPeso && Number(manualPeso) > 0 && (
                      <div className="text-xs">
                        {Number(manualPeso) < pesoEsperadoManual.min && <span className="text-amber-400">⚠ Por debajo del mínimo esperado para {manualAnimal?.raza}</span>}
                        {Number(manualPeso) >= pesoEsperadoManual.min && Number(manualPeso) <= pesoEsperadoManual.max && <span className="text-green-400">✓ Dentro del rango esperado para la raza</span>}
                        {Number(manualPeso) > pesoEsperadoManual.max && <span className="text-blue-400">↑ Por encima del rango — excelente condición corporal</span>}
                      </div>
                    )}
                  </div>

                  {/* Valor por kilo + total automático */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">$ Valor por Kilo (COP)</Label>
                    <Input type="number" step="100"
                      value={manualValorKilo} onChange={e => setManualValorKilo(e.target.value)}
                      placeholder="11000"/>
                    <p className="text-[10px] text-white/30">Referencia mercado: ~$11,000/kg</p>
                  </div>

                  {/* Valor total automático */}
                  {manualValorTotal > 0 && (
                    <div className="rounded-xl p-4 flex justify-between items-center"
                      style={{background:'rgba(57,255,126,0.08)',border:'1px solid rgba(57,255,126,0.3)'}}>
                      <div>
                        <div className="text-xs text-white/40">Valor total del animal</div>
                        <div className="text-[10px] text-white/25">{manualPeso} kg × {fmt(Number(manualValorKilo))}/kg</div>
                      </div>
                      <div className="font-black text-2xl" style={{color:'#39ff7e',fontFamily:'Sora,sans-serif'}}>{fmt(manualValorTotal)}</div>
                    </div>
                  )}

                  {/* Condición corporal */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Condición Corporal (1-5)</Label>
                    <div className="flex gap-2">
                      {["1.0","1.5","2.0","2.5","3.0","3.5","4.0","4.5","5.0"].map(v => (
                        <button key={v} type="button" onClick={() => setManualCondicion(v)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={manualCondicion === v
                            ? {background:'rgba(255,149,0,0.25)',color:'#ff9500',border:'1px solid rgba(255,149,0,0.5)'}
                            : {background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.3)',border:'1px solid rgba(255,255,255,0.08)'}}>
                          {v}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-white/30">1=Emaciado · 3=Óptimo · 5=Obeso</p>
                  </div>

                  {/* Fecha / hora / operador / observación */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Fecha</Label>
                      <Input name="fecha" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Hora</Label>
                      <Input name="hora" type="time" defaultValue={new Date().toTimeString().slice(0,5)}/>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Operador</Label>
                    <Input name="operador" defaultValue={user?.nombre || ""}/>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Observación</Label>
                    <Input name="observacion" placeholder="Estado del animal, notas..."/>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                  <Button type="submit" style={{background:'rgba(255,149,0,0.2)',border:'1px solid rgba(255,149,0,0.4)',color:'#ff9500'}}>
                    <FileText size={14} className="mr-1.5"/> Guardar y Generar Recibo
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'PESAJES TOTAL', val:String(totalPesajes), sub:'historial completo', c:'#ff9500', icon:'⚖️' },
          { label:'VÍA BLUETOOTH', val:String(btPesajes), sub:'básculas digitales', c:'#00c8ff', icon:'📡' },
          { label:'PESO PROMEDIO', val:`${pesoPromedio}kg`, sub:'todos los registros', c:'#39ff7e', icon:'📊' },
          { label:'PESAJES HOY', val:String(hoy), sub:'jornada actual', c:'#bf00ff', icon:'📅' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white relative overflow-hidden"
            style={{background:'linear-gradient(135deg,#020d09,#041208)', border:'1px solid rgba(0,245,212,0.15)'}}>
            <div className="absolute top-0 right-0 w-14 h-14 rounded-full pointer-events-none" style={{background:k.c, opacity:0.15, filter:'blur(18px)', transform:'translate(30%,-30%)'}}/>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{color:'rgba(0,245,212,0.55)'}}>{k.icon} {k.label}</div>
            <div className="text-2xl font-bold" style={{color:k.c, fontFamily:'Sora,sans-serif'}}>{k.val}</div>
            <div className="text-[10px]" style={{color:'rgba(255,255,255,0.4)'}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="bluetooth" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="bluetooth" className="gap-1.5"><Bluetooth size={14}/>Báscula BT</TabsTrigger>
          <TabsTrigger value="historial" className="gap-1.5"><BarChart3 size={14}/>Historial</TabsTrigger>
          <TabsTrigger value="analisis" className="gap-1.5"><TrendingUp size={14}/>Análisis</TabsTrigger>
        </TabsList>

        {/* ── BT Tab ── */}
        <TabsContent value="bluetooth">
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Device selector */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><Bluetooth size={16} className="text-blue-400"/></div>
                <div><div className="font-semibold text-sm">Control Bluetooth</div><div className="text-xs text-muted-foreground">Báscula digital</div></div>
                <div className={`ml-auto flex items-center gap-1.5 text-xs font-medium ${btStatus==='connected'?'text-green-400':btStatus==='scanning'?'text-amber-400':'text-muted-foreground'}`}>
                  {btStatus==='connected'?<><BluetoothConnected size={14}/>Conectado</>:btStatus==='scanning'?<><RefreshCw size={14} className="animate-spin"/>Buscando...</>:<><BluetoothOff size={14}/>Desconectado</>}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dispositivos</p>
                {DISPOSITIVOS_BT.map(d => (
                  <div key={d.id} onClick={() => { setSelectedDevice(d); if(btStatus==='connected') disconnectBluetooth(); }}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedDevice.id===d.id?'border-blue-500/50 bg-blue-500/10':'border-border hover:border-blue-500/30 hover:bg-muted/20'}`}>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center"><Scale size={15} className="text-blue-400"/></div>
                    <div className="flex-1"><div className="text-sm font-medium">{d.nombre}</div><div className="text-xs text-muted-foreground">{d.tipo}</div></div>
                    <div className="text-xs text-right">
                      <div className={`font-semibold ${d.bateria>50?'text-green-400':d.bateria>20?'text-amber-400':'text-red-400'}`}>{d.bateria}%</div>
                      <div className="text-muted-foreground">batería</div>
                    </div>
                    {selectedDevice.id===d.id&&<div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"/>}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                {btStatus==='idle'||btStatus==='error' ? (
                  <Button onClick={connectBluetooth} className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"><Bluetooth size={15}/>Conectar {selectedDevice.nombre}</Button>
                ) : btStatus==='scanning' ? (
                  <Button disabled className="flex-1 gap-2"><RefreshCw size={15} className="animate-spin"/>Buscando...</Button>
                ) : (
                  <Button onClick={disconnectBluetooth} variant="outline" className="flex-1 gap-2 text-red-400 border-red-500/30"><BluetoothOff size={15}/>Desconectar</Button>
                )}
              </div>
            </div>

            {/* Live weighing */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center"><Scale size={16} className="text-orange-400"/></div>
                <div><div className="font-semibold text-sm">Lectura en Vivo</div><div className="text-xs text-muted-foreground">Selecciona animal · auto-cálculo por raza</div></div>
              </div>

              {/* Animal selector */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Animal a pesar</Label>
                <Select value={selectedAnimal?.id} onValueChange={id => setSelectedAnimal(animals.find(a=>a.id===id)||animals[0])}>
                  <SelectTrigger className="bg-muted/30"><SelectValue/></SelectTrigger>
                  <SelectContent>{animals.map(a=><SelectItem key={a.id} value={a.id}>{a.nombre} — {a.id} ({a.raza} · {a.categoria})</SelectItem>)}</SelectContent>
                </Select>
                {selectedAnimal && selAnimalEsp && (
                  <div className="rounded-lg p-2.5" style={{background:'rgba(0,200,255,0.07)',border:'1px solid rgba(0,200,255,0.2)'}}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Calculator size={11} className="text-cyan-400"/>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Raza {selectedAnimal.raza} — {selectedAnimal.categoria}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      {[["Mín.", selAnimalEsp.min],["Prom.", selAnimalEsp.promedio],["Máx.", selAnimalEsp.max]].map(([l,v]) => (
                        <div key={String(l)} className="text-xs">
                          <div className="text-white/30 text-[9px]">{l}</div>
                          <div className="font-bold text-cyan-300">{v} kg</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Live display */}
              <div className={`rounded-xl p-6 text-center transition-all ${btStatus==='connected'?'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700':'bg-muted/20 border border-border'}`}>
                {btStatus!=='connected' ? (
                  <div className="text-muted-foreground"><Scale size={36} className="mx-auto mb-2 opacity-30"/><p className="text-sm">Conecte la báscula BT para ver la lectura en tiempo real</p></div>
                ) : (
                  <>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">PESO EN BÁSCULA</div>
                    <div className={`text-6xl font-bold font-mono transition-all ${stable?'text-green-400':'text-amber-400'}`}>
                      {liveWeight!==null?`${liveWeight}`:'---'}
                    </div>
                    <div className="text-lg text-slate-400 font-semibold mt-1">kg</div>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      {stable ? (
                        <span className="flex items-center gap-1.5 text-green-400 text-sm font-semibold"><CheckCircle2 size={16}/>Peso estable · Listo</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-400 text-sm"><RefreshCw size={14} className="animate-spin"/>Estabilizando...</span>
                      )}
                    </div>
                    {liveWeight && selectedAnimal && selAnimalEsp && (
                      <div className="mt-2 space-y-1">
                        <div className={`text-xs ${diffColor(liveWeight, selectedAnimal.peso)}`}>
                          <span className="inline-flex items-center gap-1">{diffIcon(liveWeight, selectedAnimal.peso)}{liveWeight>selectedAnimal.peso?'+':''}{(liveWeight-selectedAnimal.peso).toFixed(1)} kg vs. último</span>
                        </div>
                        <div className="text-[10px] text-white/40">
                          Rango esperado {selectedAnimal.raza}: {selAnimalEsp.min}–{selAnimalEsp.max} kg
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Valor estimado en vivo */}
              {liveWeight && btStatus==='connected' && (
                <div className="rounded-lg p-3 flex justify-between items-center"
                  style={{background:'rgba(57,255,126,0.07)',border:'1px solid rgba(57,255,126,0.2)'}}>
                  <div className="text-xs">
                    <div className="text-white/40">Valor estimado</div>
                    <div className="text-white/30 text-[10px]">{liveWeight} kg × {fmt(selectedAnimal?.valorKilo||11000)}/kg</div>
                  </div>
                  <div className="font-black text-lg" style={{color:'#39ff7e',fontFamily:'Sora,sans-serif'}}>
                    {fmt(liveWeight*(selectedAnimal?.valorKilo||11000))}
                  </div>
                </div>
              )}

              <Button onClick={capturePeso} disabled={!stable||!liveWeight||btStatus!=='connected'}
                className="w-full gap-2 h-11 text-base font-semibold bg-orange-600 hover:bg-orange-700">
                <Zap size={16}/> Capturar y Generar Recibo ({liveWeight?`${liveWeight} kg`:'---'})
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── Historial Tab ── */}
        <TabsContent value="historial">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="font-semibold flex items-center gap-2"><BarChart3 size={15} className="text-orange-400"/>Historial de Pesajes</div>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13}/>
                  <Input placeholder="Buscar animal..." value={searchAnim} onChange={e=>setSearchAnim(e.target.value)} className="pl-8 h-8 text-sm w-40 bg-muted/30"/>
                </div>
                <Select value={filterLote} onValueChange={setFilterLote}>
                  <SelectTrigger className="w-28 h-8 text-sm bg-muted/30"><SelectValue/></SelectTrigger>
                  <SelectContent>{['Todos','Lote A','Lote B','Lote C','Lote D','Lote E','Lote F'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border" style={{background:'rgba(255,149,0,0.07)'}}>
                    {['FECHA','HORA','ANIMAL','RAZA','PESO','ANTERIOR','DIFER.','VALOR/KG','VALOR TOTAL','CC','MÉTODO','OPERADOR','ACC.'].map(h => (
                      <th key={h} className="text-left px-3 py-3 text-[10px] uppercase font-semibold whitespace-nowrap" style={{color:'rgba(255,149,0,0.75)'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pesajes.filter(p => {
                    const ms = p.animalNombre.toLowerCase().includes(searchAnim.toLowerCase())||p.animalId.toLowerCase().includes(searchAnim.toLowerCase());
                    const ml = filterLote==="Todos"||p.lote===filterLote;
                    return ms&&ml;
                  }).map(p => {
                    const pp = p as PesajeConValor;
                    const diff = p.peso - p.pesoAnterior;
                    const anim = animals.find(a=>a.id===p.animalId);
                    const vk = pp.valorKilo || anim?.valorKilo || 0;
                    const vt = vk ? p.peso * vk : 0;
                    return (
                      <tr key={p.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">{p.fecha}</td>
                        <td className="px-3 py-3 text-muted-foreground text-xs">{p.hora}</td>
                        <td className="px-3 py-3">
                          <div className="font-semibold">{p.animalNombre}</div>
                          <div className="text-[10px] font-mono text-orange-400">{p.animalId}</div>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{anim?.raza||'—'}</td>
                        <td className="px-3 py-3 font-bold text-orange-300 whitespace-nowrap">{p.peso.toFixed(1)} kg</td>
                        <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">{p.pesoAnterior.toFixed(1)} kg</td>
                        <td className={`px-3 py-3 text-xs font-semibold whitespace-nowrap ${diff>0?'text-green-400':diff<0?'text-red-400':'text-muted-foreground'}`}>
                          <span className="inline-flex items-center gap-1">{diff>0?<TrendingUp size={11}/>:diff<0?<TrendingDown size={11}/>:<Minus size={11}/>}{diff>0?'+':''}{diff.toFixed(1)} kg</span>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{vk?`${(vk/1000).toFixed(0)}k/kg`:'—'}</td>
                        <td className="px-3 py-3 text-xs font-bold whitespace-nowrap" style={{color:vt?'#39ff7e':'rgba(255,255,255,0.3)'}}>{vt?`$${(vt/1000000).toFixed(2)}M`:'—'}</td>
                        <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{pp.condicionCorporal||'—'}</td>
                        <td className="px-3 py-3">
                          {p.metodo==='bluetooth'
                            ? <span className="inline-flex items-center gap-1 text-xs bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full"><Bluetooth size={10}/>BT</span>
                            : <span className="text-xs bg-muted/40 text-muted-foreground px-2 py-0.5 rounded-full">Manual</span>
                          }
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">{p.operador}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1">
                            <button title="Ver recibo" onClick={() => setReciboP({...pp, raza:anim?.raza, categoria:anim?.categoria||pp.categoria, valorKilo:vk, valorTotal:vt})}
                              className="p-1 rounded hover:bg-white/5 transition-colors" style={{color:'rgba(255,149,0,0.7)'}}>
                              <FileText size={13}/>
                            </button>
                            <button onClick={()=>deletePesaje(p.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {pesajes.length===0&&(
                <div className="text-center py-12 text-muted-foreground"><Scale size={36} className="mx-auto mb-2 opacity-30"/><p>No hay pesajes registrados</p></div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Análisis Tab ── */}
        <TabsContent value="analisis">
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-semibold mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-orange-400"/>Tendencia por Animal</div>
              <div className="space-y-4">
                {filteredAnimals.slice(0,5).map(a => {
                  const hist = animalHistory(a.id);
                  const lastP = pesajes.filter(p=>p.animalId===a.id).sort((x,y)=>y.id-x.id)[0];
                  const cur = lastP?.peso ?? a.peso;
                  const prev = lastP?.pesoAnterior ?? a.peso;
                  const diff = cur - prev;
                  const esp = getPesoEsperado(a.raza, a.categoria);
                  return (
                    <div key={a.id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="font-semibold text-sm">{a.nombre}</span>
                          <span className="text-xs text-muted-foreground ml-2">{a.id} · {a.raza}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-orange-400">{cur} kg</div>
                          <div className={`text-xs ${diff>0?'text-green-400':diff<0?'text-red-400':'text-muted-foreground'}`}>{diff>0?'+':''}{diff.toFixed(1)} kg</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-white/30 mb-2">Rango esperado {a.raza}: {esp.min}–{esp.max} kg · Prom. {esp.promedio} kg</div>
                      {hist.length>1 ? (
                        <div className="h-16">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hist} margin={{top:2,right:2,left:0,bottom:0}}>
                              <defs><linearGradient id={`grad_${a.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient></defs>
                              <Area type="monotone" dataKey="kg" stroke="#f97316" strokeWidth={1.5} fill={`url(#grad_${a.id})`} dot={false}/>
                              <Tooltip contentStyle={{backgroundColor:'#111',border:'1px solid #333',fontSize:'11px'}} formatter={(v:number)=>[`${v} kg`]}/>
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

            <div className="space-y-5">
              {/* Distribución pesos */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="font-semibold mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-amber-400"/>Pesos Actuales</div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={animals.slice(0,8).map(a=>({name:a.nombre.split(' ')[0],kg:a.peso}))} margin={{top:5,right:10,left:0,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
                      <XAxis dataKey="name" tick={{fontSize:10,fill:'#888'}}/>
                      <YAxis tick={{fontSize:10,fill:'#888'}} width={40}/>
                      <Tooltip contentStyle={{backgroundColor:'#111',border:'1px solid #333',fontSize:'11px'}} formatter={(v:number)=>[`${v} kg`]}/>
                      <Bar dataKey="kg" fill="#f97316" radius={[3,3,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Resumen por raza */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="font-semibold mb-3 text-sm flex items-center gap-2"><Beef size={14} className="text-orange-400"/>Resumen por Raza</div>
                {Array.from(new Set(animals.map(a=>a.raza))).map(raza => {
                  const group = animals.filter(a=>a.raza===raza);
                  if (!group.length) return null;
                  const avg = group.reduce((s,a)=>s+a.peso,0)/group.length;
                  const esp = getPesoEsperado(raza, group[0].categoria);
                  const pct = Math.min(100, (avg/esp.max)*100);
                  return (
                    <div key={raza} className="py-2 border-b border-border/40 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{raza}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-orange-300">{avg.toFixed(0)} kg</span>
                          <span className="text-xs text-muted-foreground ml-2">{group.length} anim.</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted/30 rounded-full">
                          <div className="h-2 bg-orange-500 rounded-full transition-all" style={{width:`${pct}%`}}/>
                        </div>
                        <span className="text-[10px] text-white/30 w-20 text-right">Esp. {esp.min}–{esp.max}kg</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog recibo */}
      <Dialog open={!!reciboP} onOpenChange={v => { if(!v) setReciboP(null); }}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText size={16} style={{color:'#ff9500'}}/>Recibo de Pesaje</DialogTitle>
          </DialogHeader>
          {reciboP && <ReciboPesaje p={reciboP} onClose={() => setReciboP(null)} finca={user?.finca}/>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
