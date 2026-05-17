import { useState, useEffect, useRef, useCallback } from "react";
import { useAppState } from "../lib/data";
import { useAuth } from "../lib/auth";
import {
  Scale, Bluetooth, BluetoothConnected, BluetoothOff, BluetoothSearching,
  Plus, Download, RefreshCw, CheckCircle2, TrendingUp, TrendingDown,
  Minus, Zap, BarChart3, Search, Printer, Calculator, Wifi, WifiOff,
  AlertTriangle, Settings2, Play, Pause, Target, Cpu, Radio,
  ChevronRight, Activity, Beef, Star, Clock, DollarSign, FileText,
  List, UserPlus, X as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/* ── Controladores de báscula reales ─────────────────────────────────────── */
const CONTROLLERS = [
  {
    id: "tru-test-xr3", nombre: "Tru-Test XR3000", marca: "Tru-Test",
    tipo: "Indicador electrónico Bluetooth", bateria: 87, protocol: "uart",
    color: "#00f5d4", glow: "0,245,212",
    services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
    nameFilter: ["TruTest", "Tru-Test", "XR3"],
    desc: "Báscula de precisión ±0.1 kg · BLE 5.0 · IP67",
    icon: "⚖️",
  },
  {
    id: "gallagher-w210", nombre: "Gallagher W210", marca: "Gallagher",
    tipo: "Báscula WiFi/BT", bateria: 92, protocol: "weight_scale",
    color: "#fbbf24", glow: "251,191,36",
    services: ["weight_scale", "0000181d-0000-1000-8000-00805f9b34fb"],
    nameFilter: ["Gallagher", "W210", "W450"],
    desc: "NLIS · 300 kg · ±50 g · Bluetooth 4.2",
    icon: "🏋️",
  },
  {
    id: "ahi-caroplus", nombre: "AHI Caroplus 2", marca: "AHI",
    tipo: "Báscula RFID Bluetooth", bateria: 64, protocol: "uart",
    color: "#a78bfa", glow: "167,139,250",
    services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
    nameFilter: ["AHI", "Caroplus"],
    desc: "RFID ISO 11784 · BLE · CSV export",
    icon: "📡",
  },
  {
    id: "tru-test-s3", nombre: "Tru-Test S3", marca: "Tru-Test",
    tipo: "Indicador portátil BLE", bateria: 71, protocol: "uart",
    color: "#34d399", glow: "52,211,153",
    services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
    nameFilter: ["TruTest", "S3000", "S3 "],
    desc: "Portátil · 5000 registros · BLE 5.0",
    icon: "📱",
  },
  {
    id: "simcro-biotrack", nombre: "Simcro BioTrack", marca: "Simcro",
    tipo: "Panel RFID + Báscula", bateria: 55, protocol: "uart",
    color: "#f87171", glow: "248,113,113",
    services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
    nameFilter: ["Simcro", "BioTrack"],
    desc: "ISO 11785 · EID lectura dual · Colombia",
    icon: "🔖",
  },
  {
    id: "manual-entry", nombre: "Ingreso Manual", marca: "Manual",
    tipo: "Sin dispositivo Bluetooth", bateria: 100, protocol: "manual",
    color: "#94a3b8", glow: "148,163,184",
    services: [],
    nameFilter: [],
    desc: "Registro manual con teclado",
    icon: "✏️",
  },
];

const PESOS_RAZA: Record<string, Record<string, { min: number; max: number; prom: number }>> = {
  Holstein:  { "Vaca adulta":{min:490,max:650,prom:560}, Novilla:{min:280,max:380,prom:330}, Ternero:{min:40,max:120,prom:80}, Ternera:{min:38,max:110,prom:75}, Toro:{min:700,max:950,prom:820} },
  Brahman:   { "Vaca adulta":{min:400,max:580,prom:490}, Novilla:{min:250,max:360,prom:300}, Ternero:{min:35,max:100,prom:65}, Ternera:{min:32,max:95, prom:60}, Toro:{min:650,max:900,prom:780} },
  Simmental: { "Vaca adulta":{min:520,max:700,prom:600}, Novilla:{min:300,max:420,prom:360}, Ternero:{min:45,max:130,prom:90}, Ternera:{min:42,max:125,prom:85}, Toro:{min:750,max:1000,prom:870} },
  Jersey:    { "Vaca adulta":{min:330,max:470,prom:400}, Novilla:{min:200,max:290,prom:245}, Ternero:{min:25,max:80, prom:52}, Ternera:{min:24,max:76, prom:49}, Toro:{min:500,max:700,prom:600} },
  "Gyr X":   { "Vaca adulta":{min:380,max:550,prom:470}, Novilla:{min:240,max:350,prom:290}, Ternero:{min:32,max:95, prom:62}, Ternera:{min:30,max:90, prom:58}, Toro:{min:600,max:850,prom:730} },
};

function getPesoRef(raza: string, cat: string) {
  return PESOS_RAZA[raza]?.[cat] ?? { min: 100, max: 800, prom: 400 };
}

type BtStatus = "idle" | "scanning" | "connected" | "simulating" | "error";

interface PesajeRec {
  id: number; animalId: string; animalNombre: string;
  raza?: string; categoria: string; peso: number; pesoAnterior: number;
  fecha: string; hora: string; metodo: string; dispositivo: string;
  operador: string; observacion: string; lote: string;
  valorKilo?: number; valorTotal?: number; condicionCorporal?: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}
function fmtDate() { return new Date().toLocaleDateString("es-CO"); }

/* ── Pantalla de peso en vivo ─────────────────────────────────────────────── */
function LiveScale({
  weight, stability, stable, status, onCapture, autoCapture,
}: {
  weight: number | null; stability: number; stable: boolean;
  status: BtStatus; onCapture: () => void; autoCapture: boolean;
}) {
  const connected = status === "connected" || status === "simulating";

  return (
    <div className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-center py-8 px-6"
      style={{
        background: stable
          ? "linear-gradient(145deg,rgba(57,255,126,0.08),rgba(0,200,100,0.04))"
          : "linear-gradient(145deg,rgba(255,149,0,0.06),rgba(255,100,0,0.03))",
        border: stable
          ? "1px solid rgba(57,255,126,0.35)"
          : connected ? "1px solid rgba(255,149,0,0.3)" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: stable ? "0 0 32px rgba(57,255,126,0.15)" : "none",
        minHeight: 200,
      }}>

      {/* Status pill */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
        style={{
          background: status === "connected" ? "rgba(57,255,126,0.15)" : status === "simulating" ? "rgba(0,200,255,0.15)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${status === "connected" ? "rgba(57,255,126,0.4)" : status === "simulating" ? "rgba(0,200,255,0.35)" : "rgba(255,255,255,0.1)"}`,
          color: status === "connected" ? "#39ff7e" : status === "simulating" ? "#00c8ff" : "#666",
        }}>
        {status === "connected" && <><BluetoothConnected size={10} /> Báscula real</>}
        {status === "simulating" && <><Activity size={10} className="animate-pulse" /> Simulación</>}
        {status === "scanning" && <><BluetoothSearching size={10} className="animate-pulse" /> Buscando...</>}
        {(status === "idle" || status === "error") && <><BluetoothOff size={10} /> Sin conexión</>}
      </div>

      {/* Big weight number */}
      {connected && weight !== null ? (
        <>
          <div className="font-black text-center leading-none mb-3 transition-all"
            style={{
              fontSize: "clamp(52px,10vw,80px)",
              fontFamily: "'Sora',monospace",
              color: stable ? "#39ff7e" : "#ff9500",
              textShadow: stable ? "0 0 30px rgba(57,255,126,0.6)" : "0 0 20px rgba(255,149,0,0.5)",
              letterSpacing: "-0.02em",
            }}>
            {weight.toFixed(1)}
            <span className="text-2xl ml-2 font-bold" style={{ color: "rgba(255,255,255,0.4)", textShadow: "none" }}>kg</span>
          </div>

          {/* Stability bar */}
          <div className="w-full max-w-[260px] mb-4">
            <div className="flex justify-between text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              <span>Estabilidad</span>
              <span className={stable ? "text-green-400 font-bold" : ""}>{stability}%</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${stability}%`,
                  background: stability >= 90
                    ? "linear-gradient(90deg,#39ff7e,#00f5d4)"
                    : stability >= 50
                    ? "linear-gradient(90deg,#fbbf24,#f59e0b)"
                    : "linear-gradient(90deg,#f87171,#ef4444)",
                  boxShadow: stability >= 90 ? "0 0 8px rgba(57,255,126,0.5)" : "none",
                }} />
            </div>
          </div>

          {stable ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-green-400 mb-1">
                <CheckCircle2 size={14} /> Peso estable — Listo para capturar
              </div>
              <Button
                onClick={onCapture}
                className="gap-2 font-bold text-sm h-10 px-6"
                style={{ background: "linear-gradient(135deg,#39ff7e,#00c864)", color: "#052010", boxShadow: "0 0 20px rgba(57,255,126,0.4)" }}>
                <Target size={16} /> Capturar peso
              </Button>
              {autoCapture && <p className="text-[10px] text-green-400/60">Auto-captura activa</p>}
            </div>
          ) : (
            <p className="text-xs animate-pulse" style={{ color: "rgba(255,149,0,0.7)" }}>
              Pesando... mantener animal quieto
            </p>
          )}
        </>
      ) : (
        <div className="text-center">
          <Scale size={48} className="mx-auto mb-3 opacity-10" />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            {status === "scanning" ? "Buscando báscula Bluetooth..." : "Conectar báscula para ver peso en vivo"}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Recibo de pesaje imprimible ─────────────────────────────────────────── */
function ReciboPesaje({ p, onClose }: { p: PesajeRec; onClose: () => void }) {
  const diff = p.peso - p.pesoAnterior;
  const ref = getPesoRef(p.raza || "", p.categoria);
  const vt = (p.peso) * (p.valorKilo || 0);
  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,149,0,0.3)" }}>
        <div className="p-4 text-center" style={{ background: "linear-gradient(135deg,#1a0d00,#2e1500)" }}>
          <div className="font-black text-2xl mb-0.5" style={{ fontFamily: "Sora,sans-serif", color: "#ff9500" }}>
            GanaderIA PRO
          </div>
          <div className="text-xs text-white/40">Ganadería Inteligente · Colombia</div>
          <div className="mt-2 font-bold text-white text-sm uppercase tracking-wider">Recibo de Pesaje</div>
          <div className="text-[10px] text-white/30 mt-0.5">Folio #{p.id} · {new Date().toLocaleDateString("es-CO")}</div>
        </div>
        <div className="p-4 space-y-4" style={{ background: "#050d0a" }}>
          <div className="rounded-lg p-3 space-y-2 text-sm" style={{ background: "rgba(255,149,0,0.06)", border: "1px solid rgba(255,149,0,0.2)" }}>
            <div className="font-bold text-white text-base flex items-center gap-2">
              <span>🐄</span> {p.animalNombre}
              <span className="text-xs font-mono text-orange-400">#{p.animalId}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {[
                ["Raza", p.raza || "—"], ["Categoría", p.categoria],
                ["Lote", p.lote], ["Método", p.metodo === "bluetooth" ? "Báscula BT" : p.metodo === "simulated" ? "Simulado" : "Manual"],
                ["Dispositivo", p.dispositivo || "—"], ["Operador", p.operador],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-1">
                  <span className="text-white/40">{k}:</span>
                  <span className="text-white/80 font-medium truncate">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <table className="w-full text-sm rounded-lg overflow-hidden">
            <tbody>
              {[
                ["Peso capturado", <span className="font-black text-lg text-orange-300">{p.peso.toFixed(1)} kg</span>],
                ["Peso anterior", <span>{p.pesoAnterior.toFixed(1)} kg</span>],
                ["Diferencia", <span className={`font-bold ${diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-white/50"}`}>{diff > 0 ? "+" : ""}{diff.toFixed(1)} kg</span>],
                ...(p.condicionCorporal ? [["Cond. corporal", <span>{p.condicionCorporal}</span>]] : []),
              ].map(([k, v], i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-2 text-white/50 text-xs">{k as string}</td>
                  <td className="py-2 text-right">{v as React.ReactNode}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {p.raza && p.categoria && (
            <div className="rounded-lg p-3" style={{ background: "rgba(0,200,255,0.06)", border: "1px solid rgba(0,200,255,0.2)" }}>
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-bold">Referencia raza {p.raza}</div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[["Mínimo", ref.min, "#60a5fa"], ["Promedio", ref.prom, "#00c8ff"], ["Máximo", ref.max, "#60a5fa"]].map(([l, v, c]) => (
                  <div key={String(l)}>
                    <div className="text-white/30 text-[9px]">{l}</div>
                    <div className="font-bold" style={{ color: String(c) }}>{v} kg</div>
                  </div>
                ))}
              </div>
              <div className="mt-1.5 text-[10px] text-center">
                {p.peso >= ref.min && p.peso <= ref.max
                  ? <span className="text-green-400">✓ Dentro del rango esperado</span>
                  : p.peso < ref.min
                  ? <span className="text-amber-400">⚠ Por debajo del mínimo de raza</span>
                  : <span className="text-blue-400">↑ Excelente condición corporal</span>}
              </div>
            </div>
          )}
          {(p.valorKilo || 0) > 0 && (
            <div className="rounded-xl p-3" style={{ background: "rgba(57,255,126,0.07)", border: "1px solid rgba(57,255,126,0.25)" }}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">Valor estimado</span>
                <span className="font-black text-xl" style={{ color: "#39ff7e" }}>{fmt(vt)}</span>
              </div>
              <div className="text-[10px] text-white/30 text-right mt-0.5">{fmt(p.valorKilo || 0)}/kg × {p.peso.toFixed(1)} kg</div>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1 gap-2" onClick={() => window.print()}
          style={{ background: "rgba(255,149,0,0.12)", border: "1px solid rgba(255,149,0,0.3)", color: "#ff9500" }}>
          <Printer size={14} /> Imprimir
        </Button>
        <Button className="flex-1" variant="outline" onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
}

/* ── Componente principal ─────────────────────────────────────────────────── */
export default function Pesaje() {
  const { animals, pesajes, setPesajes, setAnimals } = useAppState();
  const { user } = useAuth();

  const [btStatus, setBtStatus] = useState<BtStatus>("idle");
  const [selectedCtrl, setSelectedCtrl] = useState(CONTROLLERS[0]);
  const [liveWeight, setLiveWeight] = useState<number | null>(null);
  const [stability, setStability] = useState(0);
  const [stable, setStable] = useState(false);
  const [autoCapture, setAutoCapture] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(animals[0]);
  const [searchAnim, setSearchAnim] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [reciboP, setReciboP] = useState<PesajeRec | null>(null);
  const [manualPeso, setManualPeso] = useState("");
  const [manualValorKilo, setManualValorKilo] = useState("11000");
  const [manualCondicion, setManualCondicion] = useState("3.0");
  const [manualAnimalId, setManualAnimalId] = useState(animals[0]?.id || "");
  const [btError, setBtError] = useState("");

  /* ── Cola de pesaje ── */
  const [queueMode, setQueueMode] = useState(false);
  const [animalQueue, setAnimalQueue] = useState<string[]>([]);
  const [queueIdx, setQueueIdx] = useState(0);
  const [showNewAnimal, setShowNewAnimal] = useState(false);
  const [newAId, setNewAId]           = useState("");
  const [newANombre, setNewANombre]   = useState("");
  const [newARaza, setNewARaza]       = useState("Holstein");
  const [newACat, setNewACat]         = useState("Vaca adulta");
  const [newALote, setNewALote]       = useState("Lote A");

  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const weightSamplesRef = useRef<number[]>([]);
  const btDeviceRef = useRef<any>(null);

  const manualAnimal = animals.find(a => a.id === manualAnimalId) || animals[0];

  const updateStabilityFromSamples = useCallback((w: number) => {
    const samples = weightSamplesRef.current;
    samples.push(w);
    if (samples.length > 8) samples.shift();

    if (samples.length < 4) {
      setStability(Math.min(40, samples.length * 10));
      setStable(false);
      return;
    }
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    const maxDev = Math.max(...samples.map(s => Math.abs(s - avg)));
    const pct = Math.max(0, Math.min(100, Math.round(100 - maxDev * 20)));
    setStability(pct);
    const isStable = pct >= 90 && samples.length >= 6;
    setStable(isStable);
    if (isStable && autoCapture) {
      setTimeout(() => capturePeso(w), 400);
    }
  }, [autoCapture]);

  /* ── Simulación de peso ── */
  const startSimulation = useCallback((animal?: typeof animals[0]) => {
    if (simRef.current) clearInterval(simRef.current);
    weightSamplesRef.current = [];
    const base = animal
      ? getPesoRef(animal.raza, animal.categoria).prom
      : getPesoRef(selectedAnimal?.raza || "", selectedAnimal?.categoria || "").prom;
    let ticks = 0;
    simRef.current = setInterval(() => {
      ticks++;
      const noise = ticks < 6 ? (Math.random() - 0.5) * 10 : (Math.random() - 0.5) * 1.2;
      const w = +(base + noise).toFixed(1);
      setLiveWeight(w);
      updateStabilityFromSamples(w);
    }, 550);
  }, [selectedAnimal, updateStabilityFromSamples]);

  /* ── Conectar Bluetooth real ── */
  const connectBluetooth = async () => {
    if (selectedCtrl.protocol === "manual") {
      setBtError("Este modo no usa Bluetooth. Use Pesaje Manual.");
      return;
    }
    setBtStatus("scanning");
    setBtError("");
    weightSamplesRef.current = [];

    if ("bluetooth" in navigator) {
      try {
        const nameFilters = selectedCtrl.nameFilter.map(prefix => ({ namePrefix: prefix }));
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [
            ...nameFilters,
            { services: ["weight_scale"] },
          ],
          optionalServices: [
            "weight_scale",
            "0000181d-0000-1000-8000-00805f9b34fb",
            "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
            "battery_service",
          ],
        });

        btDeviceRef.current = device;
        const server = await device.gatt!.connect();
        let handlerAttached = false;

        /* Try standard Weight Scale Service (0x181D) */
        try {
          const svc = await server.getPrimaryService("weight_scale");
          const char = await svc.getCharacteristic("weight_measurement");
          await char.startNotifications();
          char.addEventListener("characteristicvaluechanged", (e: Event) => {
            const val = (e.target as any).value as DataView;
            const flags = val.getUint8(0);
            const unit = flags & 0x01;
            const raw = val.getUint16(1, true);
            const w = unit === 0 ? raw * 0.005 : raw * 0.01 * 0.453592;
            const rounded = Math.round(w * 10) / 10;
            setLiveWeight(rounded);
            updateStabilityFromSamples(rounded);
          });
          handlerAttached = true;
        } catch { /* try UART */ }

        /* Try Nordic UART Service (Tru-Test, Gallagher serial-over-BLE) */
        if (!handlerAttached) {
          try {
            const svc = await server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
            const char = await svc.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
            await char.startNotifications();
            char.addEventListener("characteristicvaluechanged", (e: Event) => {
              const val = (e.target as any).value as DataView;
              const text = new TextDecoder().decode(val);
              /* Parse: "352.5\r\n", "W00352.5\r\n", "STW,  352.5,kg\r\n", "+  352.5 S\r\n" */
              const match = text.match(/(?:W0*|STW,\s*|[+\-]\s*)?(\d{2,4}\.?\d{0,2})/);
              if (match) {
                const w = parseFloat(match[1]);
                if (w > 0 && w < 3000) {
                  setLiveWeight(Math.round(w * 10) / 10);
                  updateStabilityFromSamples(w);
                }
              }
            });
            handlerAttached = true;
          } catch { /* neither service found */ }
        }

        if (handlerAttached) {
          setBtStatus("connected");
          device.addEventListener("gattserverdisconnected", () => {
            setBtStatus("idle");
            setLiveWeight(null);
            setStable(false);
            setStability(0);
            weightSamplesRef.current = [];
          });
          return;
        }
        /* Connected but no recognized service — fallback to simulation */
        server.disconnect();
      } catch (err: unknown) {
        const btErr = err as { name?: string; message?: string };
        if (btErr?.name !== "NotFoundError" && btErr?.name !== "NotAllowedError") {
          setBtError(`Error BT: ${btErr?.message || String(err)}`);
          setBtStatus("error");
          return;
        }
        /* User cancelled picker → fall through to simulation */
      }
    }

    /* Simulation fallback (no BT hardware or user cancelled) */
    setBtStatus("simulating");
    startSimulation();
  };

  const disconnectBluetooth = () => {
    if (simRef.current) { clearInterval(simRef.current); simRef.current = null; }
    if (btDeviceRef.current?.gatt?.connected) btDeviceRef.current.gatt.disconnect();
    btDeviceRef.current = null;
    setBtStatus("idle");
    setLiveWeight(null);
    setStable(false);
    setStability(0);
    weightSamplesRef.current = [];
    setBtError("");
  };

  /* Restart live reading when animal changes */
  useEffect(() => {
    if (btStatus === "simulating") {
      setStable(false);
      setStability(0);
      weightSamplesRef.current = [];
      startSimulation(selectedAnimal);
    }
  }, [selectedAnimal]);

  useEffect(() => () => { if (simRef.current) clearInterval(simRef.current); }, []);

  /* ── Capturar peso ── */
  const capturePeso = useCallback((overrideWeight?: number) => {
    const w = overrideWeight ?? liveWeight;
    if (!w || !selectedAnimal) return;
    const prev = pesajes.filter(p => p.animalId === selectedAnimal.id).sort((a, b) => b.id - a.id)[0];
    const now = new Date();
    const vk = selectedAnimal.valorKilo || 11000;
    const newP: PesajeRec = {
      id: Date.now(),
      animalId: selectedAnimal.id, animalNombre: selectedAnimal.nombre,
      raza: selectedAnimal.raza, categoria: selectedAnimal.categoria || "",
      peso: w, pesoAnterior: prev?.peso ?? selectedAnimal.peso,
      fecha: now.toLocaleDateString("es-CO"),
      hora: now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
      metodo: btStatus === "connected" ? "bluetooth" : btStatus === "simulating" ? "simulated" : "manual",
      dispositivo: btStatus === "connected" || btStatus === "simulating" ? selectedCtrl.nombre : "",
      operador: user?.nombre || "Sistema",
      observacion: "", lote: selectedAnimal.lote,
      valorKilo: vk, valorTotal: w * vk,
    };
    setPesajes([newP, ...pesajes]);
    setStable(false);
    setStability(0);
    weightSamplesRef.current = [];
    setReciboP(newP);
    /* ── Auto-advance queue ── */
    if (queueMode && animalQueue.length > 0) {
      const nextIdx = queueIdx + 1;
      if (nextIdx < animalQueue.length) {
        const nextA = animals.find(a => a.id === animalQueue[nextIdx]);
        if (nextA) {
          setTimeout(() => {
            setSelectedAnimal(nextA);
            setQueueIdx(nextIdx);
            weightSamplesRef.current = [];
            if (btStatus === "simulating") startSimulation(nextA);
          }, 1800);
        }
      } else {
        setTimeout(() => { setQueueMode(false); setQueueIdx(0); setAnimalQueue([]); }, 1200);
      }
    }
    if (btStatus === "simulating") {
      setTimeout(() => startSimulation(), 300);
    }
  }, [liveWeight, selectedAnimal, pesajes, btStatus, selectedCtrl, user, setPesajes, startSimulation]);

  /* ── Pesaje manual ── */
  const handleManualAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const peso = Number(manualPeso);
    if (!peso || !manualAnimal) return;
    const prev = pesajes.filter(p => p.animalId === manualAnimal.id).sort((a, b) => b.id - a.id)[0];
    const now = new Date();
    const vk = Number(manualValorKilo) || 11000;
    const newP: PesajeRec = {
      id: Date.now(), animalId: manualAnimal.id, animalNombre: manualAnimal.nombre,
      raza: manualAnimal.raza, categoria: manualAnimal.categoria || "",
      peso, pesoAnterior: prev?.peso ?? manualAnimal.peso,
      fecha: now.toLocaleDateString("es-CO"),
      hora: now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
      metodo: "manual", dispositivo: "", operador: user?.nombre || "",
      observacion: `CC ${manualCondicion}`, lote: manualAnimal.lote,
      valorKilo: vk, valorTotal: peso * vk,
      condicionCorporal: `CC ${manualCondicion}`,
    };
    setPesajes([newP, ...pesajes]);
    setManualOpen(false);
    setManualPeso("");
    setReciboP(newP);
  };

  /* ── Registrar nuevo animal rápido ── */
  const handleRegNewAnimal = () => {
    const tid = newAId.trim();
    const tnombre = newANombre.trim();
    if (!tid || !tnombre) return;
    if (animals.find(a => a.id === tid)) return;
    const newA = {
      id: tid,
      nombre: tnombre,
      raza: newARaza,
      categoria: newACat,
      lote: newALote,
      peso: 0,
      estado: "Activa",
      edad: "Sin registro",
      rfid: `RFID-${Date.now()}`,
      valorKilo: 11000,
      sexo: (newACat.includes("Toro") || newACat.includes("Novillo")) ? "M" : "F",
      parto: 0,
      produccionDiaria: 0,
    };
    setAnimals((prev: any[]) => [...prev, newA]);
    if (queueMode) {
      setAnimalQueue(prev => [...prev, tid]);
    } else {
      setSelectedAnimal(newA as any);
    }
    setShowNewAnimal(false);
    setNewAId(""); setNewANombre("");
  };

  /* ── Stats ── */
  const hoy = pesajes.filter(p => p.fecha === fmtDate()).length;
  const btCount = pesajes.filter(p => p.metodo === "bluetooth").length;
  const pesoAvg = pesajes.length ? +(pesajes.reduce((s, p) => s + p.peso, 0) / pesajes.length).toFixed(1) : 0;
  const filtered = animals.filter(a =>
    a.nombre.toLowerCase().includes(searchAnim.toLowerCase()) ||
    a.id.toLowerCase().includes(searchAnim.toLowerCase())
  );

  const animalHistory = (aid: string) =>
    pesajes.filter(p => p.animalId === aid).slice(0, 8).reverse().map((p, i) => ({ name: `#${i + 1}`, kg: p.peso }));

  const selRef = selectedAnimal ? getPesoRef(selectedAnimal.raza, selectedAnimal.categoria) : null;
  const lastPesaje = selectedAnimal ? pesajes.filter(p => p.animalId === selectedAnimal.id)[0] : null;
  const diff = lastPesaje ? lastPesaje.peso - lastPesaje.pesoAnterior : 0;

  return (
    <div className="space-y-5 pb-8">
      {/* ── Banner ── */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#1a0d00 0%,#2e1500 50%,#1a0800 100%)",
          border: "1px solid rgba(255,149,0,0.4)",
          boxShadow: "0 0 40px rgba(255,149,0,0.10)",
        }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "url('https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=30&auto=format&fit=crop') center/cover no-repeat", opacity: 0.04 }} />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none">
          <Scale className="w-36 h-36 text-white" />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,149,0,0.12)", border: "1px solid rgba(255,149,0,0.45)", boxShadow: "0 0 20px rgba(255,149,0,0.25)" }}>
              <Scale size={28} className="text-orange-300" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white" style={{ fontFamily: "Sora,sans-serif" }}>
                Pesaje de Animales
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,180,80,0.8)" }}>
                Bluetooth real · Tru-Test · Gallagher · AHI · RFID · Recibo imprimible
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: btStatus === "connected" ? "rgba(57,255,126,0.2)" : btStatus === "simulating" ? "rgba(0,200,255,0.2)" : "rgba(255,255,255,0.08)", color: btStatus === "connected" ? "#39ff7e" : btStatus === "simulating" ? "#00c8ff" : "#888" }}>
                  {btStatus === "connected" ? "● Báscula conectada" : btStatus === "simulating" ? "◎ Modo simulación" : btStatus === "scanning" ? "⟳ Buscando..." : "○ Sin conexión"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button className="h-9 gap-1.5 text-sm" onClick={() => { setQueueMode(v => !v); if (queueMode) { setAnimalQueue([]); setQueueIdx(0); } }}
              style={{ background: queueMode ? "rgba(0,200,255,0.25)" : "rgba(0,200,255,0.10)", border: `1px solid ${queueMode ? "rgba(0,200,255,0.6)" : "rgba(0,200,255,0.3)"}`, color: "#00c8ff" }}>
              <List size={14} /> {queueMode ? "Cola activa" : "Modo Cola"}
            </Button>
            <Dialog open={manualOpen} onOpenChange={setManualOpen}>
              <DialogTrigger asChild>
                <Button className="h-9 gap-1.5 text-sm"
                  style={{ background: "rgba(255,149,0,0.15)", border: "1px solid rgba(255,149,0,0.4)", color: "#fff" }}>
                  <Plus size={14} /> Pesaje Manual
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Scale size={16} className="text-orange-400" />Registrar Pesaje Manual</DialogTitle></DialogHeader>
                <form onSubmit={handleManualAdd}>
                  <div className="grid gap-4 py-3">
                    <div className="space-y-1.5">
                      <Label>Animal</Label>
                      <Select value={manualAnimalId} onValueChange={setManualAnimalId}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{animals.map(a => <SelectItem key={a.id} value={a.id}>{a.nombre} — {a.id}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Peso (kg)</Label>
                      <Input type="number" step="0.1" min="0" required value={manualPeso} onChange={e => setManualPeso(e.target.value)} placeholder="Ej: 385.5" />
                      {manualAnimal && (
                        <p className="text-xs text-muted-foreground">
                          Referencia {manualAnimal.raza}: {getPesoRef(manualAnimal.raza, manualAnimal.categoria).prom} kg promedio
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Valor/kg (COP)</Label>
                        <Input type="number" value={manualValorKilo} onChange={e => setManualValorKilo(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Cond. corporal</Label>
                        <Select value={manualCondicion} onValueChange={setManualCondicion}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["1.0","1.5","2.0","2.5","3.0","3.5","4.0","4.5","5.0"].map(v => (
                              <SelectItem key={v} value={v}>CC {v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {manualPeso && Number(manualPeso) > 0 && (
                      <div className="rounded-lg p-3 text-center" style={{ background: "rgba(57,255,126,0.07)", border: "1px solid rgba(57,255,126,0.25)" }}>
                        <div className="text-xs text-muted-foreground">Valor estimado</div>
                        <div className="font-black text-xl" style={{ color: "#39ff7e" }}>
                          {fmt(Number(manualPeso) * Number(manualValorKilo))}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="gap-2" style={{ background: "rgba(255,149,0,0.9)", color: "black" }}>
                      <CheckCircle2 size={14} /> Guardar pesaje
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: "HOY", v: String(hoy), s: "pesajes registrados", g: "linear-gradient(135deg,#92400e,#b45309)", icon: <Clock size={15} className="text-white" /> },
          { l: "TOTAL", v: String(pesajes.length), s: "en historial", g: "linear-gradient(135deg,#064e3b,#065f46)", icon: <BarChart3 size={15} className="text-white" /> },
          { l: "BLUETOOTH", v: String(btCount), s: "con báscula real/simulada", g: "linear-gradient(135deg,#1e3a5f,#1e40af)", icon: <Bluetooth size={15} className="text-white" /> },
          { l: "PROMEDIO", v: `${pesoAvg}`, s: "kg por animal", g: "linear-gradient(135deg,#4a044e,#7e22ce)", icon: <Scale size={15} className="text-white" /> },
        ].map(k => (
          <div key={k.l} className="rounded-xl p-4 text-white shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl" style={{ background: k.g }}>
            <div className="flex items-center gap-1.5 mb-1">{k.icon}<div className="text-[10px] font-bold uppercase tracking-wider text-white/70">{k.l}</div></div>
            <div className="text-2xl font-black">{k.v}</div>
            <div className="text-[10px] text-white/55">{k.s}</div>
          </div>
        ))}
      </div>

      {/* ── Queue Mode Panel ── */}
      {queueMode && (
        <div className="rounded-xl overflow-hidden"
          style={{ background: "rgba(0,200,255,0.04)", border: "1px solid rgba(0,200,255,0.22)" }}>
          <div className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: "rgba(0,200,255,0.15)", background: "rgba(0,200,255,0.07)" }}>
            <div className="flex items-center gap-2.5">
              <List size={14} style={{ color: "#00c8ff" }} />
              <span className="text-sm font-bold" style={{ color: "#00c8ff" }}>Cola de Pesaje — Modo Lote</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(0,200,255,0.15)", color: "#00c8ff" }}>
                {queueIdx} / {animalQueue.length} pesados
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setShowNewAnimal(true)}
                style={{ background: "rgba(57,255,126,0.12)", border: "1px solid rgba(57,255,126,0.35)", color: "#39ff7e" }}>
                <UserPlus size={11} /> Nuevo animal
              </Button>
              <Button size="sm" className="h-7 gap-1.5 text-xs"
                onClick={() => { setQueueMode(false); setAnimalQueue([]); setQueueIdx(0); }}
                style={{ background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff7070" }}>
                <XIcon size={11} /> Cancelar
              </Button>
            </div>
          </div>

          {/* Queue items */}
          <div className="p-3 space-y-2">
            {animalQueue.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                Agrega animales a la cola usando los botones de abajo
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {animalQueue.map((id, i) => {
                  const a = animals.find(x => x.id === id);
                  const done = i < queueIdx;
                  const current = i === queueIdx;
                  return (
                    <div key={id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{
                        background: done ? "rgba(57,255,126,0.1)" : current ? "rgba(0,200,255,0.15)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${done ? "rgba(57,255,126,0.4)" : current ? "rgba(0,200,255,0.5)" : "rgba(255,255,255,0.08)"}`,
                        color: done ? "#39ff7e" : current ? "#00c8ff" : "rgba(255,255,255,0.45)",
                      }}>
                      {done
                        ? <CheckCircle2 size={10}/>
                        : current
                        ? <Scale size={10}/>
                        : <span className="w-2 h-2 rounded-full border inline-block" style={{ borderColor: "rgba(255,255,255,0.2)" }}/>
                      }
                      <span>{a ? a.nombre : id}</span>
                      {current && <span className="text-[9px] animate-pulse">●</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add to queue */}
            {animals.filter(a => !animalQueue.includes(a.id)).length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold mb-1.5">
                  + Agregar a cola:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {animals.filter(a => !animalQueue.includes(a.id)).map(a => (
                    <button key={a.id}
                      onClick={() => {
                        setAnimalQueue(prev => [...prev, a.id]);
                        if (animalQueue.length === 0) setSelectedAnimal(a);
                      }}
                      className="text-[10px] px-2 py-1 rounded-lg transition-all hover:opacity-80"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}>
                      + {a.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── New Animal Quick Registration Dialog ── */}
      <Dialog open={showNewAnimal} onOpenChange={setShowNewAnimal}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={16} className="text-green-400" /> Registrar Nuevo Animal
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>ID / Arete</Label>
                <Input value={newAId} onChange={e => setNewAId(e.target.value)} placeholder="Ej: VCA-014" />
              </div>
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input value={newANombre} onChange={e => setNewANombre(e.target.value)} placeholder="Ej: Bonita" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Raza</Label>
                <Select value={newARaza} onValueChange={setNewARaza}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Holstein","Jersey","Cebú","Simmental","Angus","Brahman","Gyr","Criollo"].map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select value={newACat} onValueChange={setNewACat}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Vaca adulta","Novilla","Ternera","Toro","Novillo","Ternero"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Lote</Label>
              <Select value={newALote} onValueChange={setNewALote}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Lote A","Lote B","Lote C","Lote D","Ordeño","Maternidad"].map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newAId && animals.find(a => a.id === newAId) && (
              <p className="text-xs text-red-400">Ya existe un animal con este ID</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAnimal(false)}>Cancelar</Button>
            <Button onClick={handleRegNewAnimal}
              disabled={!newAId.trim() || !newANombre.trim() || !!animals.find(a => a.id === newAId.trim())}
              style={{ background: "rgba(57,255,126,0.9)", color: "black" }}>
              <UserPlus size={14} className="mr-1" /> Registrar
              {queueMode ? " y agregar a cola" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Main interface ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: controller + live scale */}
        <div className="lg:col-span-1 space-y-4">

          {/* Controller selector */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Cpu size={14} className="text-orange-400" />
              <span className="font-semibold text-sm">Controlador / Báscula</span>
            </div>
            <div className="p-3 space-y-1.5">
              {CONTROLLERS.map(ctrl => (
                <button key={ctrl.id}
                  onClick={() => { if (btStatus !== "idle" && btStatus !== "error") return; setSelectedCtrl(ctrl); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group hover:scale-[1.01]"
                  style={{
                    background: selectedCtrl.id === ctrl.id
                      ? `rgba(${ctrl.glow},0.12)`
                      : "rgba(255,255,255,0.02)",
                    border: `1px solid ${selectedCtrl.id === ctrl.id ? `rgba(${ctrl.glow},0.4)` : "rgba(255,255,255,0.06)"}`,
                    cursor: btStatus !== "idle" && btStatus !== "error" ? "not-allowed" : "pointer",
                  }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: `rgba(${ctrl.glow},0.15)`, border: `1px solid rgba(${ctrl.glow},0.3)` }}>
                    {ctrl.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: selectedCtrl.id === ctrl.id ? `rgb(${ctrl.glow})` : "rgba(255,255,255,0.8)" }}>
                      {ctrl.nombre}
                    </div>
                    <div className="text-[9px] text-muted-foreground truncate">{ctrl.desc}</div>
                  </div>
                  {selectedCtrl.id === ctrl.id && <CheckCircle2 size={13} style={{ color: `rgb(${ctrl.glow})`, flexShrink: 0 }} />}
                </button>
              ))}
            </div>

            {/* Connect button */}
            <div className="p-3 pt-0 space-y-2">
              {btError && (
                <div className="text-xs text-red-400 flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)" }}>
                  <AlertTriangle size={12} /> {btError}
                </div>
              )}
              {btStatus === "idle" || btStatus === "error" ? (
                <Button className="w-full h-10 gap-2 font-bold"
                  onClick={connectBluetooth}
                  disabled={selectedCtrl.protocol === "manual"}
                  style={{
                    background: selectedCtrl.protocol === "manual"
                      ? "rgba(255,255,255,0.05)"
                      : `linear-gradient(135deg,rgba(${selectedCtrl.glow},0.9),rgba(${selectedCtrl.glow},0.7))`,
                    color: selectedCtrl.protocol === "manual" ? "#666" : "#000",
                    boxShadow: selectedCtrl.protocol !== "manual" ? `0 0 20px rgba(${selectedCtrl.glow},0.3)` : "none",
                  }}>
                  <Bluetooth size={15} />
                  {selectedCtrl.protocol === "manual" ? "Sin Bluetooth" : `Conectar ${selectedCtrl.marca}`}
                </Button>
              ) : btStatus === "scanning" ? (
                <Button disabled className="w-full h-10 gap-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <BluetoothSearching size={15} className="animate-pulse" /> Buscando báscula...
                </Button>
              ) : (
                <Button onClick={disconnectBluetooth} className="w-full h-10 gap-2 font-bold"
                  style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }}>
                  <BluetoothOff size={15} /> Desconectar
                </Button>
              )}
              <label className="flex items-center gap-2 px-2 cursor-pointer">
                <input type="checkbox" checked={autoCapture} onChange={e => setAutoCapture(e.target.checked)} className="rounded" />
                <span className="text-xs text-muted-foreground">Auto-capturar al estabilizar</span>
              </label>
            </div>
          </div>

          {/* Live scale display */}
          <LiveScale
            weight={liveWeight} stability={stability} stable={stable}
            status={btStatus} onCapture={() => capturePeso()}
            autoCapture={autoCapture}
          />
        </div>

        {/* Right: animal selector + history */}
        <div className="lg:col-span-2 space-y-4">
          {/* Animal selector */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2">
                <Beef size={15} className="text-orange-400" />
                <span className="font-semibold text-sm">Seleccionar animal</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
                <Input value={searchAnim} onChange={e => setSearchAnim(e.target.value)}
                  placeholder="Buscar..." className="pl-8 h-8 w-48 text-xs" />
              </div>
            </div>
            <div className="divide-y divide-border max-h-64 overflow-y-auto">
              {filtered.map(a => {
                const isSelected = selectedAnimal?.id === a.id;
                const lastP = pesajes.filter(p => p.animalId === a.id)[0];
                const d = lastP ? lastP.peso - lastP.pesoAnterior : 0;
                return (
                  <div key={a.id}
                    onClick={() => setSelectedAnimal(a)}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all hover:scale-[1.005]"
                    style={{
                      background: isSelected ? "rgba(255,149,0,0.07)" : undefined,
                      borderLeft: isSelected ? "3px solid #ff9500" : "3px solid transparent",
                    }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: isSelected ? "rgba(255,149,0,0.15)" : "rgba(255,255,255,0.04)" }}>
                      🐄
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{a.nombre}</div>
                      <div className="text-xs text-muted-foreground">{a.id} · {a.raza} · {a.lote}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold">{lastP ? `${lastP.peso} kg` : `${a.peso} kg`}</div>
                      {d !== 0 && (
                        <div className={`text-xs flex items-center justify-end gap-0.5 ${d > 0 ? "text-green-400" : "text-red-400"}`}>
                          {d > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {d > 0 ? "+" : ""}{d.toFixed(1)} kg
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected animal info + chart */}
          {selectedAnimal && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🐄</span>
                  <div>
                    <div className="font-bold text-sm">{selectedAnimal.nombre}</div>
                    <div className="text-xs text-muted-foreground">{selectedAnimal.id} · {selectedAnimal.raza} · {selectedAnimal.categoria}</div>
                  </div>
                </div>
                {selRef && (
                  <div className="text-right text-xs">
                    <div className="text-muted-foreground">Ref. raza</div>
                    <div className="font-bold">{selRef.min}–{selRef.max} kg</div>
                  </div>
                )}
              </div>
              {animalHistory(selectedAnimal.id).length > 0 ? (
                <div className="p-4">
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Activity size={12} /> Historial de pesajes
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={animalHistory(selectedAnimal.id)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#666" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#666" }} domain={["auto", "auto"]} />
                      <Tooltip formatter={(v) => [`${v} kg`, "Peso"]} contentStyle={{ fontSize: 12 }} />
                      <Bar dataKey="kg" fill="#ff9500" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">Sin pesajes registrados</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Historial de pesajes ── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-orange-400" />
            <span className="font-semibold text-sm">Historial de pesajes</span>
          </div>
          <span className="text-xs text-muted-foreground">{pesajes.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#1a4a2e" }}>
                {["Animal", "Peso", "Anterior", "Diferencia", "Método", "Fecha", "Valor", ""].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-white/70 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pesajes.slice(0, 30).map((p, i) => {
                const d = p.peso - p.pesoAnterior;
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/10 transition-colors group">
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-sm">{p.animalNombre}</div>
                      <div className="text-xs text-muted-foreground">{p.animalId}</div>
                    </td>
                    <td className="px-4 py-2.5 font-bold">{p.peso.toFixed(1)} kg</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.pesoAnterior.toFixed(1)} kg</td>
                    <td className="px-4 py-2.5">
                      <span className={`font-bold flex items-center gap-0.5 ${d > 0 ? "text-green-400" : d < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                        {d > 0 ? <TrendingUp size={12} /> : d < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                        {d > 0 ? "+" : ""}{d.toFixed(1)} kg
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        {p.metodo === "bluetooth" ? <><BluetoothConnected size={9} /> BT Real</> :
                         p.metodo === "simulated" ? <><Activity size={9} /> Simulado</> :
                         <><Minus size={9} /> Manual</>}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{p.fecha} {p.hora}</td>
                    <td className="px-4 py-2.5 text-xs font-bold"
                      style={{ color: "#39ff7e" }}>
                      {(p as any).valorKilo ? fmt(p.peso * (p as any).valorKilo) : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Printer size={11} /> Recibo
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md max-h-[88vh] overflow-y-auto">
                          <ReciboPesaje p={p as PesajeRec} onClose={() => {}} />
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recibo automático */}
      <Dialog open={!!reciboP} onOpenChange={v => { if (!v) setReciboP(null); }}>
        <DialogContent className="sm:max-w-md max-h-[88vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Star size={15} className="text-orange-400" /> Pesaje registrado</DialogTitle></DialogHeader>
          {reciboP && <ReciboPesaje p={reciboP} onClose={() => setReciboP(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
