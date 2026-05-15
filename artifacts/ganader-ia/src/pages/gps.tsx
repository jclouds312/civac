import { useState, useEffect, useRef } from "react";
import { useAppState } from "../lib/data";
import {
  MapPin, Navigation, Wifi, WifiOff, Battery, BatteryLow, BatteryWarning,
  RefreshCw, AlertTriangle, CheckCircle2, Signal, Eye, Map, List,
  TrendingUp, Filter, Search, Plus, Bluetooth, Satellite, Trash2,
  Link2, CheckCircle, XCircle, Loader2, LocateFixed, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// ─── Tipos para dispositivos GPS vinculados ───────────────────────────────────
interface GpsDevice {
  id:         string;
  nombre:     string;
  tipo:       'collar-gps' | 'collar-bt' | 'bolus' | 'oreja';
  imei:       string;
  animalId:   string;
  animalNom:  string;
  vinculado:  boolean;
  fechaVin:   string;
  lat?:       number;
  lng?:       number;
  precision?: number;
}

const TIPOS_DISPOSITIVO = [
  { id:'collar-gps', label:'Collar GPS-LTE',       emoji:'📡', desc:'Nedap · HerdDogg · Gallagher' },
  { id:'collar-bt',  label:'Collar Bluetooth',     emoji:'🔵', desc:'Tru-Test · Destron Fearing' },
  { id:'bolus',      label:'Bolo Ruminal GPS',      emoji:'💊', desc:'SmaXtec · Allflex' },
  { id:'oreja',      label:'Caravana electrónica', emoji:'🏷️', desc:'Allflex · SCR · CRV' },
];

const POTREROS_COLORS: Record<number, string> = {
  1: '#22c55e',
  2: '#3b82f6',
  3: '#f97316',
  4: '#a855f7',
  5: '#ec4899',
  6: '#14b8a6',
};

const POTREROS_BOUNDS: Record<number, { x: number; y: number; w: number; h: number; label: string }> = {
  1: { x: 5, y: 5, w: 30, h: 30, label: 'Potrero 1\n4.5 ha · Kikuyo' },
  2: { x: 40, y: 5, w: 25, h: 25, label: 'Potrero 2\n3.8 ha · Raigrás' },
  3: { x: 70, y: 5, w: 28, h: 40, label: 'Potrero 3\n5.1 ha · Brachiaria' },
  4: { x: 5, y: 40, w: 28, h: 30, label: 'Potrero 4\n4.2 ha · Estrella' },
  5: { x: 38, y: 35, w: 30, h: 33, label: 'Potrero 5\n6.0 ha · Nativo' },
  6: { x: 5, y: 74, w: 25, h: 20, label: 'Potrero 6\n3.5 ha · Kikuyo' },
};

const ANIMAL_POSITIONS: Record<string, { x: number; y: number }> = {
  'G-001': { x: 18, y: 18 }, // Rosaura - P1
  'G-002': { x: 51, y: 50 }, // Titan - P4/Alto
  'G-003': { x: 28, y: 15 }, // Perla - P1
  'G-004': { x: 16, y: 52 }, // Bravo - P4
  'G-005': { x: 84, y: 35 }, // Luna - P3
  'G-006': { x: 24, y: 22 }, // Estrella - P1
  'G-007': { x: 15, y: 26 }, // Cielo - P1
  'G-008': { x: 80, y: 20 }, // Tormenta - P3
};

function BatteryIcon({ pct }: { pct: number }) {
  if (pct > 50) return <Battery size={13} className="text-green-400" />;
  if (pct > 20) return <BatteryWarning size={13} className="text-amber-400" />;
  return <BatteryLow size={13} className="text-red-400" />;
}

function BatteryColor(pct: number) {
  return pct > 50 ? 'text-green-400' : pct > 20 ? 'text-amber-400' : 'text-red-400';
}

const INITIAL_DEVICES: GpsDevice[] = [
  { id:'DEV-001', nombre:'Collar Rosaura',  tipo:'collar-gps', imei:'354071230987654', animalId:'A-0042', animalNom:'Rosaura',  vinculado:true, fechaVin:'2026-01-10', lat:4.710988, lng:-74.072092, precision:4 },
  { id:'DEV-002', nombre:'Collar Titan',    tipo:'collar-gps', imei:'354071230987655', animalId:'A-0622', animalNom:'Titan',    vinculado:true, fechaVin:'2026-01-10', lat:4.711245, lng:-74.071887, precision:5 },
  { id:'DEV-003', nombre:'Bolo Perla',      tipo:'bolus',      imei:'354071230987656', animalId:'A-0712', animalNom:'Perla',    vinculado:true, fechaVin:'2026-02-15', lat:4.710502, lng:-74.072341, precision:8 },
  { id:'DEV-004', nombre:'Caravana Bravo',  tipo:'oreja',      imei:'RFID-ISO-40042',  animalId:'A-0401', animalNom:'Bravo',    vinculado:true, fechaVin:'2026-03-01', lat:4.711019, lng:-74.072501, precision:3 },
];

export default function Gps() {
  const { gpsUbicaciones, animals, potreros } = useAppState();
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [search, setSearch] = useState("");
  const [hoveredAnimal, setHoveredAnimal] = useState<string | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<typeof gpsUbicaciones[0] | null>(null);

  // ── Estado para tab "Vincular GPS" ─────────────────────────────────────────
  const [devices, setDevices] = useState<GpsDevice[]>(INITIAL_DEVICES);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{id:string;nombre:string;rssi:number}[]>([]);
  const [locating, setLocating] = useState(false);
  const [geoPos, setGeoPos] = useState<{lat:number;lng:number;acc:number}|null>(null);
  const [geoError, setGeoError] = useState<string|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre:'', tipo:'collar-gps' as GpsDevice['tipo'], imei:'', animalId:'' });
  const [linking, setLinking] = useState<string|null>(null);

  // Obtener posición GPS real del navegador
  const getLocation = () => {
    setLocating(true);
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocalización no disponible en este dispositivo.');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoPos({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: Math.round(pos.coords.accuracy) });
        setLocating(false);
      },
      (err) => {
        setGeoError(err.code === 1 ? 'Permiso de ubicación denegado.' : err.code === 2 ? 'Señal GPS débil. Salga a campo abierto.' : 'Tiempo de espera agotado. Intente de nuevo.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Escanear Bluetooth
  const scanBluetooth = async () => {
    setScanning(true);
    setScanResults([]);
    // Intentar Web Bluetooth API real
    if ('bluetooth' in navigator) {
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service', 'heart_rate'],
        });
        setScanResults([{ id: device.id || 'BT-FOUND', nombre: device.name || 'Dispositivo BT', rssi: -65 }]);
        setScanning(false);
        return;
      } catch {
        // Fallback a simulación si el usuario cancela o no hay BT
      }
    }
    // Simulación cuando BT no disponible o cancelado
    await new Promise(r => setTimeout(r, 2200));
    setScanResults([
      { id:'BT-A1F2', nombre:'TruTest XR3000 · A1:F2:3C', rssi:-58 },
      { id:'BT-B2E4', nombre:'HerdDogg Tag · B2:E4:1A',    rssi:-72 },
      { id:'BT-C3D5', nombre:'Gallagher TSi · C3:D5:9B',   rssi:-81 },
    ]);
    setScanning(false);
  };

  // Vincular dispositivo escaneado
  const linkScanned = async (bt: {id:string;nombre:string;rssi:number}) => {
    setLinking(bt.id);
    await new Promise(r => setTimeout(r, 1500));
    const newDev: GpsDevice = {
      id: `DEV-${Date.now()}`, nombre: bt.nombre, tipo:'collar-bt',
      imei: bt.id, animalId:'', animalNom:'Sin asignar', vinculado:true,
      fechaVin: new Date().toISOString().slice(0,10),
    };
    setDevices(prev => [...prev, newDev]);
    setScanResults(prev => prev.filter(r => r.id !== bt.id));
    setLinking(null);
  };

  // Registrar nuevo dispositivo manual
  const addDevice = () => {
    if (!form.nombre || !form.imei) return;
    const animal = animals.find(a => a.id === form.animalId);
    const newDev: GpsDevice = {
      id: `DEV-${Date.now()}`, nombre: form.nombre, tipo: form.tipo,
      imei: form.imei, animalId: form.animalId, animalNom: animal?.nombre || 'Sin asignar',
      vinculado: true, fechaVin: new Date().toISOString().slice(0,10),
    };
    setDevices(prev => [...prev, newDev]);
    setForm({ nombre:'', tipo:'collar-gps', imei:'', animalId:'' });
    setShowForm(false);
  };

  // Desvincular dispositivo
  const removeDevice = (id: string) => setDevices(prev => prev.filter(d => d.id !== id));

  const refresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    setLastUpdate(new Date());
    setRefreshing(false);
  };

  useEffect(() => {
    const interval = setInterval(() => setLastUpdate(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = gpsUbicaciones.filter(g =>
    g.nombre.toLowerCase().includes(search.toLowerCase()) ||
    g.animalId.toLowerCase().includes(search.toLowerCase()) ||
    g.potreroNom.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = gpsUbicaciones.filter(g => g.activo).length;
  const lowBatteryCount = gpsUbicaciones.filter(g => g.bateria <= 20).length;
  const offlineCount = gpsUbicaciones.filter(g => !g.activo).length;

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0a3d62] via-[#1464a0] to-[#1a78c0] rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
          <Navigation className="w-32 h-32 text-white" />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <MapPin className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Seguimiento GPS Ganadero</h1>
              <p className="text-white/70 text-sm">Rastreo en tiempo real · Collar GPS-BT · Geovallado automático</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-xs">
              Actualizado: {lastUpdate.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
            </span>
            <Button
              onClick={refresh}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 h-9 gap-1.5 text-sm"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'ANIMALES RASTREADOS', val: String(gpsUbicaciones.length), sub:'con collar GPS', g:'linear-gradient(135deg,#0a3d62,#1464a0)', icon:<Navigation size={16} className="text-white" /> },
          { label:'EN LÍNEA AHORA', val: String(activeCount), sub:'señal activa', g:'linear-gradient(135deg,#1b5e20,#2e7d32)', icon:<Wifi size={16} className="text-white" /> },
          { label:'BATERÍA BAJA', val: String(lowBatteryCount), sub:'requieren carga', g:'linear-gradient(135deg,#e65100,#f57c00)', icon:<BatteryLow size={16} className="text-white" /> },
          { label:'SIN SEÑAL', val: String(offlineCount), sub:'offline / perdidos', g:'linear-gradient(135deg,#b71c1c,#c62828)', icon:<WifiOff size={16} className="text-white" /> },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white shadow" style={{background:k.g}}>
            <div className="flex items-center gap-1 mb-1">
              {k.icon}
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">{k.label}</div>
            </div>
            <div className="text-2xl font-bold">{k.val}</div>
            <div className="text-[10px] text-white/60">{k.sub}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="mapa" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="mapa"     className="gap-1.5"><Map size={14} />Mapa de Finca</TabsTrigger>
          <TabsTrigger value="lista"    className="gap-1.5"><List size={14} />Lista Dispositivos</TabsTrigger>
          <TabsTrigger value="vincular" className="gap-1.5"><Link2 size={14} />Vincular GPS</TabsTrigger>
        </TabsList>

        {/* Map Tab */}
        <TabsContent value="mapa">
          <div className="grid lg:grid-cols-3 gap-5">
            {/* SVG Farm Map */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <Map size={15} className="text-blue-400" />
                  Mapa Topográfico — Finca El Rancho Verde
                </div>
                <div className="text-xs text-muted-foreground">
                  {activeCount} activos · {gpsUbicaciones.length} total
                </div>
              </div>

              <div className="relative w-full rounded-xl overflow-hidden border border-border" style={{ paddingBottom: '75%' }}>
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full"
                  style={{ background: 'linear-gradient(180deg, #0f2a0f 0%, #1a4a1a 100%)' }}
                >
                  {/* Grid lines */}
                  {[10,20,30,40,50,60,70,80,90].map(v => (
                    <g key={v}>
                      <line x1={v} y1={0} x2={v} y2={100} stroke="#ffffff08" strokeWidth={0.3} />
                      <line x1={0} y1={v} x2={100} y2={v} stroke="#ffffff08" strokeWidth={0.3} />
                    </g>
                  ))}

                  {/* Potreros */}
                  {Object.entries(POTREROS_BOUNDS).map(([pid, bounds]) => {
                    const id = Number(pid);
                    const color = POTREROS_COLORS[id];
                    const potrero = potreros.find(p => p.id === id);
                    const status = potrero?.estado || 'Descanso';
                    const isRed = status === 'Rotar pronto';
                    return (
                      <g key={pid}>
                        <rect
                          x={bounds.x} y={bounds.y}
                          width={bounds.w} height={bounds.h}
                          fill={`${color}22`}
                          stroke={isRed ? '#ef4444' : color}
                          strokeWidth={isRed ? 0.8 : 0.5}
                          rx={1.5}
                        />
                        <text
                          x={bounds.x + bounds.w / 2}
                          y={bounds.y + 5}
                          textAnchor="middle"
                          fill={color}
                          fontSize={2.5}
                          fontWeight="bold"
                        >
                          P{pid}
                        </text>
                        <text
                          x={bounds.x + bounds.w / 2}
                          y={bounds.y + bounds.h - 3}
                          textAnchor="middle"
                          fill={`${color}99`}
                          fontSize={1.8}
                        >
                          {status}
                        </text>
                      </g>
                    );
                  })}

                  {/* Animal dots */}
                  {gpsUbicaciones.map(g => {
                    const pos = ANIMAL_POSITIONS[g.id] || { x: 50, y: 50 };
                    const color = POTREROS_COLORS[g.potreroId || 1];
                    const isHovered = hoveredAnimal === g.id;
                    const isSelected = selectedAnimal?.id === g.id;
                    return (
                      <g
                        key={g.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedAnimal(prev => prev?.id === g.id ? null : g)}
                        onMouseEnter={() => setHoveredAnimal(g.id)}
                        onMouseLeave={() => setHoveredAnimal(null)}
                      >
                        {g.activo && (
                          <circle cx={pos.x} cy={pos.y} r={isSelected ? 4 : 3} fill={color} opacity={0.2}>
                            <animate attributeName="r" values={`${isSelected ? 4 : 3};${isSelected ? 7 : 5};${isSelected ? 4 : 3}`} dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
                          </circle>
                        )}
                        <circle
                          cx={pos.x} cy={pos.y} r={isHovered || isSelected ? 2.5 : 1.8}
                          fill={g.activo ? color : '#6b7280'}
                          stroke="white"
                          strokeWidth={0.5}
                        />
                        {(isHovered || isSelected) && (
                          <g>
                            <rect
                              x={pos.x + 3} y={pos.y - 6}
                              width={14} height={8}
                              fill="#000000cc" rx={1}
                            />
                            <text x={pos.x + 10} y={pos.y - 1.5} textAnchor="middle" fill="white" fontSize={2}>{g.nombre}</text>
                            <text x={pos.x + 10} y={pos.y + 1.5} textAnchor="middle" fill={g.activo ? '#4ade80' : '#f87171'} fontSize={1.8}>
                              {g.activo ? '● Online' : '○ Offline'} {g.bateria}%
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Legend */}
                  <g>
                    <rect x={0} y={92} width={100} height={8} fill="#00000066" />
                    <circle cx={3} cy={96} r={1.5} fill="#4ade80" />
                    <text x={6} y={97} fill="#4ade80" fontSize={2}>En línea</text>
                    <circle cx={20} cy={96} r={1.5} fill="#6b7280" />
                    <text x={23} y={97} fill="#9ca3af" fontSize={2}>Offline</text>
                    <circle cx={37} cy={96} r={1.5} fill="white" opacity={0.6} />
                    <text x={40} y={97} fill="#9ca3af" fontSize={2}>Clic = detalle</text>
                  </g>
                </svg>
              </div>

              {/* Potrero legend */}
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.entries(POTREROS_BOUNDS).map(([pid, b]) => (
                  <span key={pid} className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full bg-muted/30 border border-border">
                    <span className="w-2 h-2 rounded-full" style={{background: POTREROS_COLORS[Number(pid)]}} />
                    {b.label.split('\n')[0]}
                  </span>
                ))}
              </div>
            </div>

            {/* Side panel */}
            <div className="space-y-3">
              {selectedAnimal ? (
                <div className="bg-card border border-blue-500/30 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/30 px-4 py-3 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{selectedAnimal.nombre}</div>
                      <button onClick={() => setSelectedAnimal(null)} className="text-muted-foreground hover:text-foreground text-xs">✕ cerrar</button>
                    </div>
                    <div className="text-xs text-muted-foreground">{selectedAnimal.animalId}</div>
                  </div>
                  <div className="p-4 space-y-3">
                    {[
                      { label: 'Estado señal', val: selectedAnimal.activo ? '● En línea' : '○ Offline', cls: selectedAnimal.activo ? 'text-green-400' : 'text-red-400' },
                      { label: 'Última señal', val: selectedAnimal.ultimaSenal },
                      { label: 'Potrero actual', val: selectedAnimal.potreroNom },
                      { label: 'Dispositivo', val: selectedAnimal.dispositivo },
                      { label: 'Batería', val: `${selectedAnimal.bateria}%`, cls: BatteryColor(selectedAnimal.bateria) },
                      { label: 'Lat/Lng', val: `${selectedAnimal.lat.toFixed(4)}, ${selectedAnimal.lng.toFixed(4)}` },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0">
                        <span className="text-muted-foreground text-xs">{r.label}</span>
                        <span className={`font-medium text-xs ${r.cls || ''}`}>{r.val}</span>
                      </div>
                    ))}
                    <div className="mt-2">
                      <div className="text-xs text-muted-foreground mb-1">Batería</div>
                      <div className="h-2 bg-muted/30 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all ${selectedAnimal.bateria > 50 ? 'bg-green-500' : selectedAnimal.bateria > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{width:`${selectedAnimal.bateria}%`}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center">
                  <MapPin size={32} className="mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Haz clic en un animal en el mapa para ver su detalle</p>
                </div>
              )}

              {/* Quick list */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <Signal size={14} className="text-blue-400" />
                  <span className="font-semibold text-sm">Animales rastreados</span>
                </div>
                <div className="divide-y divide-border max-h-64 overflow-y-auto">
                  {gpsUbicaciones.map(g => (
                    <div
                      key={g.id}
                      onClick={() => setSelectedAnimal(prev => prev?.id === g.id ? null : g)}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${selectedAnimal?.id === g.id ? 'bg-blue-500/10' : 'hover:bg-muted/20'}`}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${g.activo ? 'bg-green-400' : 'bg-gray-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{g.nombre}</div>
                        <div className="text-xs text-muted-foreground">{g.potreroNom}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <BatteryIcon pct={g.bateria} />
                        <span className={`text-xs ${BatteryColor(g.bateria)}`}>{g.bateria}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* List Tab */}
        <TabsContent value="lista">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="font-semibold">Dispositivos GPS</div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
                <Input
                  placeholder="Buscar animal o potrero..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-8 text-sm w-52 bg-muted/30"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0a2a40] border-b border-[#1a5080]">
                    {['Estado','Animal','Arete','Potrero','Lat','Lng','Batería','Dispositivo','Última Señal'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-white text-xs uppercase font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(g => (
                    <tr key={g.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${g.activo ? 'text-green-400' : 'text-red-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${g.activo ? 'bg-green-400' : 'bg-red-500'}`} />
                          {g.activo ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">{g.nombre}</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-400">{g.animalId}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">{g.potreroNom}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{g.lat.toFixed(5)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{g.lng.toFixed(5)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <BatteryIcon pct={g.bateria} />
                          <span className={`text-xs font-semibold ${BatteryColor(g.bateria)}`}>{g.bateria}%</span>
                          {g.bateria <= 20 && (
                            <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full">¡Cargar!</span>
                          )}
                        </div>
                        <div className="w-16 h-1 bg-muted/30 rounded-full mt-1">
                          <div className={`h-1 rounded-full ${g.bateria > 50 ? 'bg-green-500' : g.bateria > 20 ? 'bg-amber-500' : 'bg-red-500'}`} style={{width:`${g.bateria}%`}} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{g.dispositivo}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{g.ultimaSenal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts for offline / low battery */}
          {(lowBatteryCount > 0 || offlineCount > 0) && (
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {lowBatteryCount > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                  <BatteryLow size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-400 text-sm">Batería crítica</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {gpsUbicaciones.filter(g => g.bateria <= 20).map(g => g.nombre).join(', ')} necesitan carga urgente
                    </div>
                  </div>
                </div>
              )}
              {offlineCount > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-400 text-sm">Animales sin señal</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {gpsUbicaciones.filter(g => !g.activo).map(g => g.nombre).join(', ')} — verificar ubicación
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── Tab Vincular GPS ─────────────────────────────────────────────── */}
        <TabsContent value="vincular">
          <div className="space-y-5">

            {/* GPS real del navegador */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#0a3d62]/60 to-[#0d2137]/40 px-5 py-4 border-b border-border flex items-center gap-3">
                <Satellite size={16} className="text-[#00c8ff]" />
                <span className="font-bold text-sm">GPS del Dispositivo (Browser Geolocation API)</span>
              </div>
              <div className="p-5">
                <p className="text-xs text-muted-foreground mb-4">
                  Usa el GPS del teléfono o tablet para obtener las coordenadas reales de la finca.
                  Útil para marcar la posición exacta de potreros, bebederos o instalaciones.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <Button
                    onClick={getLocation}
                    disabled={locating}
                    className="bg-[#0a3d62] hover:bg-[#1464a0] text-white border border-[#1464a0]/50 gap-2"
                  >
                    {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
                    {locating ? 'Obteniendo ubicación…' : 'Obtener mi posición GPS'}
                  </Button>
                  {geoPos && (
                    <div className="flex-1 rounded-xl p-3 text-xs font-mono space-y-1"
                      style={{ background:'rgba(0,200,255,0.06)', border:'1px solid rgba(0,200,255,0.2)' }}>
                      <div className="flex items-center gap-2 text-green-400 font-bold mb-1">
                        <CheckCircle size={12} /> Posición capturada
                      </div>
                      <div className="text-white/70">Lat: <span className="text-[#00c8ff]">{geoPos.lat.toFixed(7)}</span></div>
                      <div className="text-white/70">Lng: <span className="text-[#00c8ff]">{geoPos.lng.toFixed(7)}</span></div>
                      <div className="text-white/40">Precisión: ±{geoPos.acc} m</div>
                    </div>
                  )}
                  {geoError && (
                    <div className="flex-1 rounded-xl p-3 flex items-start gap-2"
                      style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
                      <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-red-400">{geoError}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Escaneo Bluetooth */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#1a0a4a]/60 to-[#0d0d37]/40 px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bluetooth size={16} className="text-blue-400" />
                  <span className="font-bold text-sm">Escaneo Bluetooth — Collares y Básculas</span>
                </div>
                <Button size="sm" onClick={scanBluetooth} disabled={scanning}
                  className="bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 gap-2 h-8 text-xs">
                  {scanning ? <Loader2 size={12} className="animate-spin" /> : <Bluetooth size={12} />}
                  {scanning ? 'Escaneando…' : 'Escanear BT'}
                </Button>
              </div>
              <div className="p-5">
                {scanning && (
                  <div className="flex items-center gap-3 py-4 justify-center text-sm text-muted-foreground">
                    <Loader2 size={16} className="animate-spin text-blue-400" />
                    Buscando dispositivos Bluetooth cercanos…
                  </div>
                )}
                {!scanning && scanResults.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Presiona "Escanear BT" para detectar collares GPS, básculas o caravanas electrónicas cercanas.
                    Compatible con Tru-Test, Gallagher, HerdDogg, Nedap, Allflex.
                  </p>
                )}
                {scanResults.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground mb-3">{scanResults.length} dispositivo(s) detectado(s)</div>
                    {scanResults.map(bt => (
                      <div key={bt.id} className="flex items-center gap-3 rounded-xl px-4 py-3"
                        style={{ background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)' }}>
                        <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                          <Bluetooth size={14} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{bt.nombre}</div>
                          <div className="text-xs text-muted-foreground">RSSI: {bt.rssi} dBm · ID: {bt.id}</div>
                        </div>
                        <Button size="sm" onClick={() => linkScanned(bt)} disabled={linking === bt.id}
                          className="bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 gap-1.5 h-8 text-xs flex-shrink-0">
                          {linking === bt.id ? <Loader2 size={11} className="animate-spin" /> : <Link2 size={11} />}
                          {linking === bt.id ? 'Vinculando…' : 'Vincular'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Formulario agregar dispositivo manual */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Plus size={15} className="text-green-400" />
                  <span className="font-bold text-sm">Registrar Dispositivo Manualmente</span>
                </div>
                <button onClick={() => setShowForm(f => !f)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{ background:'rgba(74,222,128,0.1)', color:'#4ade80', border:'1px solid rgba(74,222,128,0.2)' }}>
                  {showForm ? '✕ Cancelar' : '+ Nuevo dispositivo'}
                </button>
              </div>
              {showForm && (
                <div className="p-5 space-y-4">
                  {/* Tipo de dispositivo */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2 font-semibold">Tipo de dispositivo</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TIPOS_DISPOSITIVO.map(t => (
                        <button key={t.id} onClick={() => setForm(f => ({...f, tipo: t.id as GpsDevice['tipo']}))}
                          className="rounded-xl p-3 text-center transition-all text-xs"
                          style={form.tipo === t.id
                            ? { background:'rgba(0,245,212,0.1)', border:'1px solid rgba(0,245,212,0.3)', color:'#00f5d4' }
                            : { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>
                          <div className="text-xl mb-1">{t.emoji}</div>
                          <div className="font-bold leading-tight">{t.label}</div>
                          <div className="text-[10px] opacity-60 mt-0.5">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Campos */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Nombre del dispositivo *</label>
                      <Input placeholder="Ej: Collar Rosaura" value={form.nombre}
                        onChange={e => setForm(f => ({...f, nombre: e.target.value}))}
                        className="h-9 text-sm bg-muted/30" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">IMEI / ID dispositivo *</label>
                      <Input placeholder="Ej: 354071230987654" value={form.imei}
                        onChange={e => setForm(f => ({...f, imei: e.target.value}))}
                        className="h-9 text-sm bg-muted/30 font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Animal a vincular</label>
                      <select value={form.animalId}
                        onChange={e => setForm(f => ({...f, animalId: e.target.value}))}
                        className="w-full h-9 rounded-md border border-input bg-muted/30 px-3 text-sm text-foreground">
                        <option value="">— Sin asignar —</option>
                        {animals.map(a => (
                          <option key={a.id} value={a.id}>{a.nombre} ({a.id})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button onClick={addDevice} disabled={!form.nombre || !form.imei}
                    className="bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 gap-2">
                    <Link2 size={14} /> Registrar y vincular dispositivo
                  </Button>
                </div>
              )}
            </div>

            {/* Lista de dispositivos vinculados */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                <Settings size={15} className="text-[#00f5d4]" />
                <span className="font-bold text-sm">Dispositivos vinculados ({devices.length})</span>
              </div>
              <div className="divide-y divide-border">
                {devices.map(d => {
                  const tipo = TIPOS_DISPOSITIVO.find(t => t.id === d.tipo);
                  return (
                    <div key={d.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/10 transition-colors">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background:'rgba(0,200,255,0.08)', border:'1px solid rgba(0,200,255,0.15)' }}>
                        {tipo?.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-white truncate">{d.nombre}</div>
                        <div className="text-xs text-muted-foreground">{tipo?.label} · IMEI: <span className="font-mono">{d.imei}</span></div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Animal: <span className="text-white/70">{d.animalNom || 'Sin asignar'}</span>
                          {d.animalId && <span className="text-muted-foreground"> ({d.animalId})</span>}
                          {d.lat && <span className="ml-2 text-[#00c8ff]/60">· {d.lat.toFixed(5)}, {d.lng?.toFixed(5)}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background:'rgba(74,222,128,0.1)', color:'#4ade80', border:'1px solid rgba(74,222,128,0.2)' }}>
                          ● Vinculado
                        </span>
                        <span className="text-[10px] text-white/30">{d.fechaVin}</span>
                        <button onClick={() => removeDevice(d.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/15 text-muted-foreground hover:text-red-400">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {devices.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    <Link2 size={28} className="mx-auto mb-2 opacity-20" />
                    No hay dispositivos vinculados aún
                  </div>
                )}
              </div>
            </div>

          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
