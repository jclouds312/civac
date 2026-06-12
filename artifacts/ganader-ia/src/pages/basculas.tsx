import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bluetooth, Usb, Settings, Plus, Trash2, CheckCircle2, XCircle,
  AlertTriangle, RefreshCw, Download, Activity, Zap, Scale, Cpu,
  MessageSquare, BarChart3, ChevronRight, Copy, ExternalLink,
  Wifi, Signal, Battery, Circle, Play, Square, FileText,
  Monitor, HardDrive, Layers, Info, Shield, Wrench,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

/* ── Tipos ───────────────────────────────────────────────────────────────── */
type DeviceTipo = "bluetooth" | "serial";
type DeviceStatus = "idle" | "connecting" | "connected" | "error" | "disconnected";

interface CivacDevice {
  id: string;
  nombre: string;
  marca: string;
  modelo: string;
  tipo: DeviceTipo;
  color: string;
  glow: string;
  icon: string;
  desc: string;
  baudRate?: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: "none" | "even" | "odd";
  comPort?: string;
  serviceUUIDs?: string[];
  nameFilters?: string[];
  status: DeviceStatus;
  lastConnected?: string;
  lastError?: string;
  liveWeight?: number | null;
  totalSessions: number;
  totalPesajes: number;
  createdAt: string;
}

interface ConnectionSession {
  id: string;
  deviceId: string;
  deviceNombre: string;
  tipo: DeviceTipo;
  inicio: string;
  fin?: string;
  pesajes: number;
  errores: number;
  estado: "activa" | "finalizada" | "error";
}

interface TelemetryItem {
  id: string;
  ts: string;
  type: string;
  event: string;
  deviceName?: string;
  severity: string;
  data?: Record<string, unknown>;
}

/* ── Controladores ───────────────────────────────────────────────────────── */
const BT_MODELS = [
  { id:"civac-scale-bt",    nombre:"CIVAC Scale v2",     marca:"CIVAC",        color:"#FFD60A", glow:"255,214,10",   icon:"🇨🇴", desc:"Protocolo CIVAC-9B · ±20 g",    services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilters:["CIVAC","SoftGan","CSCL"] },
  { id:"tru-test-xr3",      nombre:"Tru-Test XR3000",    marca:"Tru-Test",     color:"#00f5d4", glow:"0,245,212",    icon:"⚖️", desc:"±0.1 kg · IP67 · BLE 5.0",      services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilters:["TruTest","Tru-Test","XR3"] },
  { id:"gallagher-w210-bt", nombre:"Gallagher W210 BT",  marca:"Gallagher",    color:"#fbbf24", glow:"251,191,36",   icon:"🏋️", desc:"NLIS · ±50 g · BT 4.2",         services:["0000181d-0000-1000-8000-00805f9b34fb"], nameFilters:["Gallagher","W210","W450"] },
  { id:"ahi-caroplus",      nombre:"AHI Caroplus 2",     marca:"AHI",          color:"#a78bfa", glow:"167,139,250",  icon:"📡", desc:"RFID ISO 11784 · BLE",           services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilters:["AHI","Caroplus"] },
  { id:"tru-test-s3",       nombre:"Tru-Test S3",        marca:"Tru-Test",     color:"#34d399", glow:"52,211,153",   icon:"📱", desc:"5000 registros · BLE 5.0",       services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilters:["TruTest","S3000","S3 "] },
  { id:"herd-manager-bt",   nombre:"Herd Manager HM7",   marca:"Herd Manager", color:"#e879f9", glow:"232,121,249",  icon:"🗂️", desc:"7\" display · BLE 5.0 · NFC",    services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilters:["HerdMgr","HM7","Herd"] },
  { id:"smaxtec-cbt",       nombre:"smaXtec CBT Sensor", marca:"smaXtec",      color:"#00c8ff", glow:"0,200,255",    icon:"🌡️", desc:"Temperatura rumen · pH · BLE",   services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilters:["smaXtec","cbt","CBT"] },
  { id:"zee-tag-bt",        nombre:"Zee Tag EID BT",     marca:"Zee Tag",      color:"#fb923c", glow:"251,146,60",   icon:"🏷️", desc:"EID ISO 11784/85 · Colombia",    services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilters:["ZeeTag","Zee","EID"] },
  { id:"agersens-ear-bt",   nombre:"Agersens eShepherd", marca:"Agersens",     color:"#f59e0b", glow:"245,158,11",   icon:"🛡️", desc:"Pastoreo virtual · GPS + BLE",   services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilters:["Agersens","eShepherd"] },
];
const COM_MODELS = [
  { id:"tru-test-xr3-com",  nombre:"Tru-Test XR3000 COM", marca:"Tru-Test",       color:"#00f5d4", glow:"0,245,212",   icon:"⚖️", desc:"RS232 · STW format · IP67",    baudRate:9600,   dataBits:8 as const, stopBits:1 as const, parity:"none" as const },
  { id:"gallagher-w210-com", nombre:"Gallagher W210 COM",  marca:"Gallagher",      color:"#fbbf24", glow:"251,191,36",  icon:"🏋️", desc:"RS232 · NLIS compatible",      baudRate:9600,   dataBits:8 as const, stopBits:1 as const, parity:"none" as const },
  { id:"civac-scale-com",    nombre:"CIVAC Scale v2 COM",  marca:"CIVAC",          color:"#FFD60A", glow:"255,214,10",  icon:"🇨🇴", desc:"Protocolo CIVAC-9B COM",       baudRate:9600,   dataBits:8 as const, stopBits:1 as const, parity:"none" as const },
  { id:"sema-bascula",       nombre:"SEMA Báscula",        marca:"SEMA",           color:"#f59e0b", glow:"245,158,11",  icon:"🇨🇴", desc:"Marca colombiana pecuaria",    baudRate:9600,   dataBits:8 as const, stopBits:1 as const, parity:"none" as const },
  { id:"mettler-toledo",     nombre:"Mettler Toledo IND",  marca:"Mettler Toledo", color:"#e879f9", glow:"232,121,249", icon:"🏭", desc:"RS232 · formato SCS · ±0.05 kg", baudRate:9600,  dataBits:8 as const, stopBits:1 as const, parity:"none" as const },
  { id:"ruddweigh-600",      nombre:"Ruddweigh 600",       marca:"Ruddweigh",      color:"#a3e635", glow:"163,230,53",  icon:"🔌", desc:"RS232 · 4800 bps · Latam",     baudRate:4800,   dataBits:8 as const, stopBits:1 as const, parity:"none" as const },
  { id:"agrident-apr650",    nombre:"Agrident APR650",     marca:"Agrident",       color:"#38bdf8", glow:"56,189,248",  icon:"📟", desc:"USB · RFID ISO 11784 + peso",  baudRate:115200, dataBits:8 as const, stopBits:1 as const, parity:"none" as const },
  { id:"toledo-prix3",       nombre:"Toledo Prix 3",       marca:"Toledo do Brasil", color:"#fb7185", glow:"251,113,133", icon:"⚡", desc:"COM · 9600 7E2 · Brasil/CO", baudRate:9600,  dataBits:7 as const, stopBits:2 as const, parity:"even" as const },
  { id:"generic-com",        nombre:"Generic RS232",       marca:"Genérico",       color:"#94a3b8", glow:"148,163,184", icon:"🔧", desc:"Detecta cualquier nº >100 kg", baudRate:9600,   dataBits:8 as const, stopBits:1 as const, parity:"none" as const },
];

const DRIVERS = [
  { id:"ch340",   nombre:"CH340 / CH341",       icon:"🇨🇳", color:"#fbbf24", glow:"251,191,36",  url:"https://www.wch-ic.com/downloads/CH341SER_EXE.html",  vid:"VID_1A86&PID_7523", desc:"El más común en básculas económicas y conversores USB-RS232. Reconocible por chip 'CH340'/'CH341' en la PCB. Necesario en Windows 7/8/10 primera vez.", recomendado:true },
  { id:"cp210x",  nombre:"Silicon Labs CP210x", icon:"💎", color:"#a78bfa", glow:"167,139,250",  url:"https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers", vid:"VID_10C4&PID_EA60", desc:"Muy estable. Común en Tru-Test, Gallagher y adaptadores de calidad. Necesita driver manual en Windows 7/8.", recomendado:true },
  { id:"ftdi",    nombre:"FTDI FT232 / FT2232",  icon:"🏭", color:"#39ff7e", glow:"57,255,126",  url:"https://ftdichip.com/drivers/vcp-drivers/",              vid:"VID_0403&PID_6001", desc:"Alta calidad industrial. Drivers incluidos en Windows 10+. Si hay problemas, instalar driver manual.", recomendado:false },
  { id:"prolific",nombre:"Prolific PL2303",      icon:"🔌", color:"#00c8ff", glow:"0,200,255",   url:"http://www.prolific.com.tw/US/ShowProduct.aspx?p_id=225", vid:"VID_067B&PID_2303", desc:"Frecuente en cables USB-RS232 económicos. Si Windows muestra 'Código 10', instalar driver oficial Prolific.", recomendado:false },
  { id:"cdc-acm", nombre:"USB CDC-ACM (nativo)", icon:"🖥️", color:"#34d399", glow:"52,211,153",  url:"https://learn.microsoft.com/windows-hardware/drivers/usbcon", vid:"CDC class",        desc:"Clase nativa del SO — sin driver extra. Indicadores modernos lo implementan. Aparece como COM# automáticamente.", recomendado:false },
  { id:"ch348",   nombre:"CH348 (8 puertos COM)",icon:"🔀", color:"#f97316", glow:"249,115,22",  url:"https://www.wch-ic.com/products/CH348.html",             vid:"VID_1A86&PID_55D3", desc:"Hub USB-Serial multipuerto. Permite conectar báscula + EID reader + impresora por un solo USB.", recomendado:false },
  { id:"cp2102n", nombre:"Silicon Labs CP2102N", icon:"⚡", color:"#e879f9", glow:"232,121,249", url:"https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers", vid:"VID_10C4&PID_EA60", desc:"Versión mejorada CP210x, velocidades hasta 3 Mbps. En básculas industriales modernas.", recomendado:false },
];

/* ── Persistencia ────────────────────────────────────────────────────────── */
const DEVS_KEY  = "civac_basculas_devices";
const SESS_KEY  = "civac_basculas_sessions";
const TELE_KEY  = "civac_basculas_telemetry";

function loadDevices(): CivacDevice[] {
  try { const s = localStorage.getItem(DEVS_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveDevices(d: CivacDevice[]) {
  try { localStorage.setItem(DEVS_KEY, JSON.stringify(d)); } catch {}
}
function loadSessions(): ConnectionSession[] {
  try { const s = localStorage.getItem(SESS_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveSessions(s: ConnectionSession[]) {
  try { localStorage.setItem(SESS_KEY, JSON.stringify(s.slice(0, 100))); } catch {}
}
function loadTelemetry(): TelemetryItem[] {
  try { const s = localStorage.getItem(TELE_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}

/* ── Telemetría helper ───────────────────────────────────────────────────── */
function sendTelemetry(event: Omit<TelemetryItem, "id" | "ts">) {
  const item: TelemetryItem = {
    ...event, id: `t${Date.now()}`, ts: new Date().toISOString(),
  };
  try {
    const all = loadTelemetry();
    all.unshift(item);
    localStorage.setItem(TELE_KEY, JSON.stringify(all.slice(0, 200)));
  } catch {}
  fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...event, platform: navigator.platform, version: "CIVAC-v1.0" }),
  }).catch(() => {});
}

/* ── StatusDot ───────────────────────────────────────────────────────────── */
function StatusDot({ status }: { status: DeviceStatus }) {
  const cfg = {
    idle:         { color:"#94a3b8", label:"Inactivo",    pulse:false },
    connecting:   { color:"#fbbf24", label:"Conectando…", pulse:true  },
    connected:    { color:"#39ff7e", label:"Conectado",   pulse:true  },
    error:        { color:"#f87171", label:"Error",       pulse:false },
    disconnected: { color:"#64748b", label:"Desconectado",pulse:false },
  }[status];
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full inline-block ${cfg.pulse ? "animate-pulse" : ""}`} style={{ background:cfg.color }}/>
      <span className="text-[9px] font-bold" style={{ color:cfg.color }}>{cfg.label}</span>
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────────────────── */
export default function Basculas() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"dispositivos"|"agregar"|"com"|"bluetooth"|"drivers"|"reportes">("dispositivos");
  const [devices, setDevices] = useState<CivacDevice[]>(loadDevices);
  const [sessions, setSessions] = useState<ConnectionSession[]>(loadSessions);
  const [telemetry, setTelemetry] = useState<TelemetryItem[]>(loadTelemetry);

  /* ── Active connections refs ── */
  const connsRef = useRef<Map<string, {
    port?: unknown; reader?: unknown; device?: unknown; char?: unknown;
    interval?: ReturnType<typeof setInterval>;
  }>>(new Map());

  /* ── Device weights live ── */
  const [weights, setWeights] = useState<Record<string, number | null>>({});

  /* ── BT scan ── */
  const [btScanning, setBtScanning] = useState(false);
  const [btScanResult, setBtScanResult] = useState<string>("");

  /* ── COM ports ── */
  const [comPorts, setComPorts] = useState<string[]>([]);
  const [comScanning, setComScanning] = useState(false);

  /* ── PWA / browser checks ── */
  const hasSerial    = typeof navigator !== "undefined" && "serial"    in navigator;
  const hasBluetooth = typeof navigator !== "undefined" && "bluetooth" in navigator;
  const isSecure     = typeof window !== "undefined" && (window.isSecureContext ?? location.protocol === "https:");
  const isPwa        = typeof window !== "undefined" && (window.matchMedia?.("(display-mode: standalone)")?.matches ?? false);

  /* ── Add form state ── */
  const [addTipo, setAddTipo] = useState<DeviceTipo>("serial");
  const [addModel, setAddModel] = useState(COM_MODELS[0].id);
  const [addNombre, setAddNombre] = useState("");
  const [addComPort, setAddComPort] = useState("COM1");
  const [addBaud, setAddBaud] = useState("9600");
  const [addDataBits, setAddDataBits] = useState<"7"|"8">("8");
  const [addStopBits, setAddStopBits] = useState<"1"|"2">("1");
  const [addParity, setAddParity] = useState<"none"|"even"|"odd">("none");
  const [addSuccess, setAddSuccess] = useState(false);

  /* ── Report form ── */
  const [reportMsg, setReportMsg] = useState("");
  const [reportType, setReportType] = useState<"error"|"usage"|"driver">("error");
  const [reportSent, setReportSent] = useState(false);

  const updateDevice = useCallback((id: string, patch: Partial<CivacDevice>) => {
    setDevices(prev => {
      const next = prev.map(d => d.id === id ? { ...d, ...patch } : d);
      saveDevices(next);
      return next;
    });
  }, []);

  const addSession = useCallback((sess: ConnectionSession) => {
    setSessions(prev => { const n=[sess,...prev].slice(0,100); saveSessions(n); return n; });
  }, []);

  /* ── Scan COM ports via Web Serial ── */
  const scanComPorts = async () => {
    setComScanning(true);
    try {
      if (!hasSerial) { setComPorts(["COM1","COM3","COM4"]); setComScanning(false); return; }
      const ports = await (navigator as unknown as { serial: { getPorts: () => Promise<SerialPort[]> } }).serial.getPorts();
      const labels = ports.map((_p, i) => `COM${i+1}`);
      setComPorts(labels.length > 0 ? labels : ["No hay puertos COM autorizados"]);
      sendTelemetry({ type:"usage", event:"scan_com_ports", severity:"info", data:{ count:ports.length } });
    } catch (err) {
      setComPorts(["Error al escanear puertos"]);
      sendTelemetry({ type:"error", event:"scan_com_error", severity:"error", data:{ error:String(err) } });
    }
    setComScanning(false);
  };

  /* ── Request COM port ── */
  const requestComPort = async (deviceId: string) => {
    if (!hasSerial) {
      setBtScanResult("Web Serial API no disponible. Usa Chrome/Edge en Windows.");
      sendTelemetry({ type:"error", event:"serial_not_available", severity:"warn", deviceId });
      return;
    }
    const dev = devices.find(d => d.id === deviceId);
    if (!dev) return;
    updateDevice(deviceId, { status:"connecting" });
    try {
      const serial = (navigator as unknown as { serial: { requestPort: (o?: unknown) => Promise<SerialPort> } }).serial;
      const port = await serial.requestPort();
      await (port as { open: (o: unknown) => Promise<void> }).open({
        baudRate:  dev.baudRate  ?? 9600,
        dataBits:  dev.dataBits  ?? 8,
        stopBits:  dev.stopBits  ?? 1,
        parity:    dev.parity    ?? "none",
      });
      connsRef.current.set(deviceId, { port });
      updateDevice(deviceId, { status:"connected", lastConnected:new Date().toISOString(), totalSessions:(dev.totalSessions??0)+1 });
      addSession({ id:`sess_${Date.now()}`, deviceId, deviceNombre:dev.nombre, tipo:"serial", inicio:new Date().toISOString(), pesajes:0, errores:0, estado:"activa" });
      sendTelemetry({ type:"connection", event:"serial_connected", severity:"info", deviceId, deviceName:dev.nombre });
      // Start reading
      startSerialRead(deviceId, port as SerialPort);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      updateDevice(deviceId, { status:"error", lastError:msg });
      sendTelemetry({ type:"error", event:"serial_connect_error", severity:"error", deviceId, deviceName:dev.nombre, data:{ error:msg } });
    }
  };

  /* ── Serial read loop ── */
  const startSerialRead = async (deviceId: string, port: SerialPort) => {
    try {
      const conn = connsRef.current.get(deviceId);
      if (!conn) return;
      const reader = (port as unknown as { readable: ReadableStream }).readable.getReader();
      conn.reader = reader;
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await (reader as ReadableStreamDefaultReader<Uint8Array>).read();
        if (done) break;
        buf += decoder.decode(value, { stream:true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const m = line.match(/([0-9]{2,4}\.?\d{0,2})/);
          if (m) {
            const kg = parseFloat(m[1]);
            if (kg > 10 && kg < 5000) {
              setWeights(w => ({ ...w, [deviceId]: kg }));
              updateDevice(deviceId, { liveWeight:kg, totalPesajes:(devices.find(d=>d.id===deviceId)?.totalPesajes??0)+1 });
              sendTelemetry({ type:"weighing", event:"weight_reading", severity:"info", deviceId, data:{ kg } });
            }
          }
        }
      }
    } catch (_err) { /* port closed */ }
  };

  /* ── Disconnect device ── */
  const disconnectDevice = async (deviceId: string) => {
    const conn = connsRef.current.get(deviceId);
    if (conn?.reader) {
      try { await (conn.reader as ReadableStreamDefaultReader).cancel(); } catch {}
    }
    if (conn?.port) {
      try { await (conn.port as { close: () => Promise<void> }).close(); } catch {}
    }
    if (conn?.interval) clearInterval(conn.interval);
    connsRef.current.delete(deviceId);
    setWeights(w => ({ ...w, [deviceId]: null }));
    updateDevice(deviceId, { status:"disconnected", liveWeight:null });
    sendTelemetry({ type:"connection", event:"device_disconnected", severity:"info", deviceId });
  };

  /* ── Scan BT ── */
  const scanBluetooth = async (deviceId?: string) => {
    if (!hasBluetooth) {
      setBtScanResult("Web Bluetooth API no disponible. Usa Chrome/Edge en Windows/Android.");
      sendTelemetry({ type:"error", event:"bluetooth_not_available", severity:"warn" });
      return;
    }
    setBtScanning(true);
    setBtScanResult("Escaneando…");
    try {
      const dev = deviceId ? devices.find(d => d.id === deviceId) : null;
      const bt = (navigator as unknown as { bluetooth: { requestDevice: (o: unknown) => Promise<BluetoothDevice> } }).bluetooth;
      const btDev = await bt.requestDevice({
        filters: dev?.nameFilters?.map(n => ({ namePrefix:n })) ?? [{ namePrefix:"" }],
        optionalServices: dev?.serviceUUIDs ?? ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
      });
      setBtScanResult(`Dispositivo encontrado: ${btDev.name ?? "Sin nombre"}`);
      if (deviceId) {
        updateDevice(deviceId, { status:"connecting" });
        const server = await (btDev as { gatt?: { connect: () => Promise<unknown> } }).gatt?.connect();
        if (!server) throw new Error("No GATT server");
        connsRef.current.set(deviceId, { device:btDev });
        updateDevice(deviceId, { status:"connected", lastConnected:new Date().toISOString(), totalSessions:(devices.find(d=>d.id===deviceId)?.totalSessions??0)+1 });
        sendTelemetry({ type:"connection", event:"bt_connected", severity:"info", deviceId, deviceName:dev?.nombre, data:{ btName:btDev.name } });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setBtScanResult(`Error: ${msg}`);
      if (deviceId) updateDevice(deviceId, { status:"error", lastError:msg });
      sendTelemetry({ type:"error", event:"bt_scan_error", severity:"error", data:{ error:msg } });
    }
    setBtScanning(false);
  };

  /* ── Add device ── */
  const addDevice = () => {
    const modelList = addTipo === "bluetooth" ? BT_MODELS : COM_MODELS;
    const model = modelList.find(m => m.id === addModel) ?? modelList[0];
    const newDev: CivacDevice = {
      id:     `dev_${Date.now()}`,
      nombre: addNombre || model.nombre,
      marca:  model.marca,
      modelo: model.id,
      tipo:   addTipo,
      color:  model.color,
      glow:   model.glow,
      icon:   model.icon,
      desc:   model.desc,
      status: "idle",
      totalSessions: 0,
      totalPesajes:  0,
      createdAt: new Date().toISOString(),
      ...(addTipo === "serial" ? {
        baudRate:  parseInt(addBaud) || 9600,
        dataBits:  parseInt(addDataBits) as 7|8,
        stopBits:  parseInt(addStopBits) as 1|2,
        parity:    addParity,
        comPort:   addComPort,
      } : {
        serviceUUIDs: (model as typeof BT_MODELS[0]).services,
        nameFilters:  (model as typeof BT_MODELS[0]).nameFilters,
      }),
    };
    const next = [newDev, ...devices];
    setDevices(next); saveDevices(next);
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 3000);
    sendTelemetry({ type:"usage", event:"device_registered", severity:"info", deviceName:newDev.nombre, data:{ tipo:addTipo, modelo:model.id } });
  };

  /* ── Remove device ── */
  const removeDevice = async (id: string) => {
    await disconnectDevice(id).catch(() => {});
    const next = devices.filter(d => d.id !== id);
    setDevices(next); saveDevices(next);
  };

  /* ── Send report ── */
  const sendReport = () => {
    if (!reportMsg.trim()) return;
    sendTelemetry({ type:reportType, event:"user_report", severity:reportType==="error"?"error":"info", data:{ message:reportMsg, userId:user?.id, userEmail:user?.email } });
    setReportSent(true);
    setReportMsg("");
    setTimeout(() => setReportSent(false), 4000);
    setTelemetry(loadTelemetry());
  };

  /* ── Simulate weight (demo) ── */
  const simulateWeight = (deviceId: string) => {
    const kg = Math.round((200 + Math.random()*300) * 10) / 10;
    setWeights(w => ({ ...w, [deviceId]:kg }));
    updateDevice(deviceId, { liveWeight:kg, status:"connected", totalPesajes:(devices.find(d=>d.id===deviceId)?.totalPesajes??0)+1 });
    sendTelemetry({ type:"weighing", event:"simulated_weight", severity:"info", deviceId, data:{ kg } });
  };

  const connectedCount = devices.filter(d => d.status === "connected").length;
  const errorCount     = devices.filter(d => d.status === "error").length;
  const telemItems     = loadTelemetry();

  const TABS = [
    { id:"dispositivos" as const, ico:"⚖️",  label:"Mis Dispositivos" },
    { id:"agregar"      as const, ico:"➕",  label:"Agregar" },
    { id:"com"          as const, ico:"🔌",  label:"Puertos COM" },
    { id:"bluetooth"    as const, ico:"📶",  label:"Bluetooth" },
    { id:"drivers"      as const, ico:"💿",  label:"Drivers" },
    { id:"reportes"     as const, ico:"📊",  label:"Reportes" },
  ];

  return (
    <div className="space-y-5 pb-16">
      {/* ── Banner ── */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background:"linear-gradient(135deg,#0d1e35,#0a1825)", border:"1px solid rgba(251,146,60,0.25)", boxShadow:"0 0 60px rgba(251,146,60,0.06)" }}>
        <div className="absolute right-0 top-0 w-64 h-full opacity-[0.06]"
          style={{ background:"radial-gradient(ellipse at right,#fb923c,transparent 70%)" }}/>
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background:"linear-gradient(135deg,#ea580c,#c2410c)", boxShadow:"0 0 24px rgba(251,146,60,0.5)" }}>
            <Scale size={24} className="text-white"/>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-black text-xl text-white" style={{ fontFamily:"'Sora',sans-serif" }}>Básculas & Dispositivos</h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400">CIVAC v1.0</span>
            </div>
            <p className="text-[12px] text-white/50">Gestión multi-báscula · BT + COM simultáneos · Drivers Windows · Telemetría</p>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {[
                { val:devices.length,  lab:"Registradas",  color:"#fb923c" },
                { val:connectedCount,  lab:"Conectadas",   color:"#39ff7e" },
                { val:errorCount,      lab:"Con error",    color:"#f87171" },
                { val:sessions.length, lab:"Sesiones",     color:"#00f5d4" },
              ].map(({ val, lab, color }) => (
                <div key={lab} className="flex items-center gap-1.5">
                  <p className="text-[14px] font-black" style={{ color }}>{val}</p>
                  <p className="text-[9px] text-white/35">{lab}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── API / PWA status ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { ico:<Usb size={13}/>,       label:"Web Serial",    ok:hasSerial,    note:"COM ports" },
          { ico:<Bluetooth size={13}/>, label:"Web Bluetooth", ok:hasBluetooth, note:"BT devices" },
          { ico:<Shield size={13}/>,    label:"HTTPS seguro",  ok:isSecure,     note:"API requerida" },
          { ico:<Monitor size={13}/>,   label:"Modo PWA",      ok:isPwa,        note:"Instalada" },
        ].map(({ ico, label, ok, note }) => (
          <div key={label} className="rounded-xl p-2.5 flex items-center gap-2"
            style={{ background:`rgba(${ok?"57,255,126":"248,113,113"},0.06)`, border:`1px solid rgba(${ok?"57,255,126":"248,113,113"},0.2)` }}>
            <span style={{ color: ok ? "#39ff7e" : "#f87171" }}>{ico}</span>
            <div>
              <p className="text-[10px] font-black text-white leading-none">{label}</p>
              <p className="text-[8px]" style={{ color: ok?"#39ff7e":"#f87171" }}>{ok?"Disponible":note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ id, ico, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[11px] transition-all"
            style={{
              background: tab===id ? "rgba(251,146,60,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${tab===id ? "rgba(251,146,60,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: tab===id ? "#fb923c" : "rgba(255,255,255,0.45)",
            }}>
            {ico} {label}
          </button>
        ))}
      </div>

      {/* ══ TAB: DISPOSITIVOS ══ */}
      {tab === "dispositivos" && (
        <div className="space-y-3">
          {devices.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)" }}>
              <Scale size={36} className="mx-auto mb-3 text-white/20"/>
              <p className="text-white/40 font-bold text-sm mb-1">Sin básculas registradas</p>
              <p className="text-white/25 text-[11px] mb-4">Agrega tu primera báscula para empezar a pesar</p>
              <button onClick={() => setTab("agregar")} className="px-5 py-2.5 rounded-xl font-black text-[12px]"
                style={{ background:"linear-gradient(135deg,#ea580c,#c2410c)", color:"#fff" }}>
                <Plus size={13} className="inline mr-1"/> Agregar báscula
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {devices.map(dev => {
                const isConn = dev.status === "connected";
                const w = weights[dev.id];
                return (
                  <div key={dev.id} className="rounded-2xl overflow-hidden"
                    style={{ background:"rgba(5,12,30,0.97)", border:`1px solid rgba(${dev.glow},${isConn?0.45:0.2})`, boxShadow:isConn?`0 0 30px rgba(${dev.glow},0.12)`:"none" }}>
                    <div className="h-0.5 w-full" style={{ background:isConn?`linear-gradient(90deg,transparent,${dev.color},transparent)`:"transparent" }}/>
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background:`rgba(${dev.glow},0.12)`, border:`1px solid rgba(${dev.glow},0.2)` }}>
                          {dev.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-white text-[13px] leading-tight truncate">{dev.nombre}</p>
                          <p className="text-[10px]" style={{ color:`rgba(${dev.glow},0.6)` }}>{dev.marca} · {dev.tipo==="serial"?"COM":"BT"}</p>
                          <StatusDot status={dev.status}/>
                        </div>
                        <button onClick={() => removeDevice(dev.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors">
                          <Trash2 size={12}/>
                        </button>
                      </div>

                      {/* Live weight */}
                      {isConn && (
                        <div className="rounded-xl p-3 text-center mb-3"
                          style={{ background:`rgba(${dev.glow},0.06)`, border:`1px solid rgba(${dev.glow},0.2)` }}>
                          <p className="text-3xl font-black" style={{ color:dev.color }}>
                            {w != null ? `${w.toFixed(1)} kg` : "— kg"}
                          </p>
                          <p className="text-[9px] text-white/30 mt-0.5">{w != null ? "Lectura en vivo" : "Esperando lectura…"}</p>
                        </div>
                      )}

                      {/* Error */}
                      {dev.status === "error" && dev.lastError && (
                        <div className="rounded-lg p-2 mb-3 flex items-start gap-1.5 text-[10px]"
                          style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171" }}>
                          <AlertTriangle size={11} className="flex-shrink-0 mt-0.5"/>
                          <span>{dev.lastError}</span>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-1.5 mb-3">
                        {[
                          { label:"Sesiones",  val:dev.totalSessions },
                          { label:"Pesajes",   val:dev.totalPesajes  },
                          { label:"Tipo",      val:dev.tipo==="serial"?"COM":"BT" },
                        ].map(({ label, val }) => (
                          <div key={label} className="rounded-lg p-1.5 text-center" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                            <p className="font-black text-white text-[11px]">{val}</p>
                            <p className="text-[8px] text-white/30">{label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {!isConn ? (
                          <button onClick={() => dev.tipo==="serial" ? requestComPort(dev.id) : scanBluetooth(dev.id)}
                            className="flex-1 py-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all"
                            style={{ background:`linear-gradient(135deg,rgba(${dev.glow},0.25),rgba(${dev.glow},0.15))`, border:`1px solid rgba(${dev.glow},0.35)`, color:dev.color }}>
                            {dev.tipo==="serial" ? <Usb size={12}/> : <Bluetooth size={12}/>}
                            Conectar
                          </button>
                        ) : (
                          <button onClick={() => disconnectDevice(dev.id)}
                            className="flex-1 py-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all"
                            style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)", color:"#f87171" }}>
                            <Square size={12}/> Desconectar
                          </button>
                        )}
                        <button onClick={() => simulateWeight(dev.id)}
                          className="px-3 py-2 rounded-xl text-[10px] font-bold transition-all"
                          style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.45)" }}
                          title="Simular lectura de peso">
                          <Activity size={12}/>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Session history */}
          {sessions.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                <p className="font-black text-white text-sm flex items-center gap-2"><Activity size={13} style={{ color:"#00f5d4" }}/> Historial de sesiones</p>
                <span className="text-[10px] text-white/35">{sessions.length} registradas</span>
              </div>
              <div className="divide-y" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                {sessions.slice(0, 8).map(sess => (
                  <div key={sess.id} className="px-4 py-2.5 flex items-center gap-3 text-[11px]">
                    <span>{sess.tipo==="serial"?"🔌":"📶"}</span>
                    <div className="flex-1">
                      <p className="font-bold text-white/80">{sess.deviceNombre}</p>
                      <p className="text-white/35">{new Date(sess.inicio).toLocaleString("es-CO")} · {sess.pesajes} pesajes</p>
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${sess.estado==="activa"?"bg-green-500/10 text-green-400 border border-green-500/25":"bg-white/5 text-white/30 border border-white/10"}`}>{sess.estado}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ TAB: AGREGAR ══ */}
      {tab === "agregar" && (
        <div className="space-y-4">
          {addSuccess && (
            <div className="rounded-xl p-3 flex items-center gap-2 text-sm" style={{ background:"rgba(57,255,126,0.08)", border:"1px solid rgba(57,255,126,0.25)", color:"#39ff7e" }}>
              <CheckCircle2 size={15}/> <span className="font-bold">Dispositivo registrado exitosamente</span>
            </div>
          )}

          {/* Tipo selector */}
          <div className="flex gap-3">
            {(["serial","bluetooth"] as DeviceTipo[]).map(t => (
              <button key={t} onClick={() => { setAddTipo(t); setAddModel((t==="bluetooth"?BT_MODELS:COM_MODELS)[0].id); }}
                className="flex-1 py-3 rounded-xl font-black text-[13px] flex items-center justify-center gap-2 transition-all"
                style={{
                  background: addTipo===t ? (t==="serial"?"rgba(251,146,60,0.15)":"rgba(96,165,250,0.15)") : "rgba(255,255,255,0.04)",
                  border: `1px solid ${addTipo===t ? (t==="serial"?"rgba(251,146,60,0.4)":"rgba(96,165,250,0.4)") : "rgba(255,255,255,0.08)"}`,
                  color: addTipo===t ? (t==="serial"?"#fb923c":"#60a5fa") : "rgba(255,255,255,0.35)",
                }}>
                {t==="serial" ? <Usb size={15}/> : <Bluetooth size={15}/>}
                {t==="serial" ? "Puerto COM / Serial" : "Bluetooth BLE"}
              </button>
            ))}
          </div>

          {/* Model selector */}
          <div>
            <label className="text-[10px] font-bold text-white/40 block mb-2 uppercase tracking-wide">Modelo de báscula</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(addTipo==="serial" ? COM_MODELS : BT_MODELS).map(m => (
                <button key={m.id} onClick={() => setAddModel(m.id)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={{
                    background: addModel===m.id ? `rgba(${m.glow},0.1)` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${addModel===m.id ? `rgba(${m.glow},0.35)` : "rgba(255,255,255,0.07)"}`,
                  }}>
                  <span className="text-xl">{m.icon}</span>
                  <div>
                    <p className={`font-bold text-[12px] ${addModel===m.id?"text-white":"text-white/60"}`}>{m.nombre}</p>
                    <p className="text-[9px] text-white/30">{m.desc}</p>
                  </div>
                  {addModel===m.id && <Check size={13} className="ml-auto flex-shrink-0" style={{ color:m.color }}/>}
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/40 font-semibold block mb-1">Nombre personalizado</label>
              <input value={addNombre} onChange={e => setAddNombre(e.target.value)} placeholder="Ej: Báscula Potrero Norte"
                className="w-full px-3 py-2 rounded-xl text-[12px] text-white placeholder-white/20 outline-none"
                style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}/>
            </div>
            {addTipo === "serial" && (
              <>
                <div>
                  <label className="text-[10px] text-white/40 font-semibold block mb-1">Puerto COM (Windows)</label>
                  <input value={addComPort} onChange={e => setAddComPort(e.target.value)} placeholder="COM1"
                    className="w-full px-3 py-2 rounded-xl text-[12px] text-white placeholder-white/20 outline-none"
                    style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}/>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-semibold block mb-1">Velocidad (Baudios)</label>
                  <select value={addBaud} onChange={e => setAddBaud(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-[12px] text-white outline-none"
                    style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)" }}>
                    {[1200,2400,4800,9600,19200,38400,57600,115200].map(b => <option key={b} value={b}>{b} bps</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-semibold block mb-1">Paridad</label>
                  <select value={addParity} onChange={e => setAddParity(e.target.value as "none"|"even"|"odd")}
                    className="w-full px-3 py-2 rounded-xl text-[12px] text-white outline-none"
                    style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)" }}>
                    <option value="none">Ninguna (N)</option>
                    <option value="even">Par (E)</option>
                    <option value="odd">Impar (O)</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <button onClick={addDevice}
            className="w-full py-3 rounded-xl font-black text-[13px] flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            style={{ background:"linear-gradient(135deg,#ea580c,#c2410c)", color:"#fff", boxShadow:"0 4px 20px rgba(251,146,60,0.35)" }}>
            <Plus size={15}/> Registrar Dispositivo
          </button>
        </div>
      )}

      {/* ══ TAB: COM ══ */}
      {tab === "com" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={scanComPorts} disabled={comScanning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[12px] transition-all disabled:opacity-50"
              style={{ background:"linear-gradient(135deg,#ea580c,#c2410c)", color:"#fff" }}>
              <RefreshCw size={13} className={comScanning?"animate-spin":""}/>
              {comScanning ? "Escaneando…" : "Escanear puertos COM"}
            </button>
            {!hasSerial && <span className="text-[11px] text-yellow-400 flex items-center gap-1"><AlertTriangle size={11}/> Web Serial requiere Chrome/Edge</span>}
          </div>

          {comPorts.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
              <div className="px-4 py-3" style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                <p className="font-black text-white text-sm flex items-center gap-2"><Usb size={13} style={{ color:"#fb923c" }}/> Puertos COM detectados</p>
              </div>
              {comPorts.map((p, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3 border-b last:border-b-0" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"rgba(251,146,60,0.1)", border:"1px solid rgba(251,146,60,0.2)" }}>
                    <Usb size={13} style={{ color:"#fb923c" }}/>
                  </div>
                  <div className="flex-1"><p className="font-bold text-white text-[12px]">{p}</p><p className="text-[10px] text-white/35">Puerto serie disponible</p></div>
                  <button onClick={() => setAddComPort(p.startsWith("COM") ? p : "COM1")} className="text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10 hover:bg-white/5 transition-all text-white/40">
                    Usar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Windows COM guide */}
          <div className="rounded-2xl p-5" style={{ background:"rgba(5,12,30,0.97)", border:"1px solid rgba(251,146,60,0.15)" }}>
            <p className="font-black text-white text-sm mb-3 flex items-center gap-2"><Monitor size={14} style={{ color:"#fb923c" }}/> Verificar puertos COM en Windows</p>
            <div className="space-y-2 text-[11px] text-white/60">
              {[
                "1. Presiona Win + X → Administrador de dispositivos",
                "2. Expande 'Puertos (COM y LPT)'",
                "3. El puerto de tu báscula aparece como 'USB Serial Port (COM3)'",
                "4. Si no aparece, instala el driver del chip USB-Serial (ver tab Drivers)",
                "5. Anota el número COM y úsalo en la configuración de la báscula",
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-black" style={{ background:"rgba(251,146,60,0.15)", color:"#fb923c" }}>{i+1}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Multiple COM info */}
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background:"rgba(0,245,212,0.05)", border:"1px solid rgba(0,245,212,0.15)" }}>
            <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color:"#00f5d4" }}/>
            <div className="text-[11px] text-white/60">
              <p className="font-bold text-white mb-1">Multi-báscula COM simultáneo</p>
              <p>Puedes conectar varias básculas al mismo computador usando un hub USB-Serial multipuerto (CH348, FTDI Quad). Cada báscula aparece en su propio puerto COM (COM3, COM4, COM5…). Registra cada una por separado y conéctalas simultáneamente desde el tab Dispositivos.</p>
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: BLUETOOTH ══ */}
      {tab === "bluetooth" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => scanBluetooth()} disabled={btScanning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[12px] transition-all disabled:opacity-50"
              style={{ background:"linear-gradient(135deg,#2563eb,#1d4ed8)", color:"#fff" }}>
              <Bluetooth size={13} className={btScanning?"animate-pulse":""}/>
              {btScanning ? "Escaneando BT…" : "Escanear Bluetooth"}
            </button>
            {!hasBluetooth && <span className="text-[11px] text-yellow-400 flex items-center gap-1"><AlertTriangle size={11}/> Web Bluetooth requiere Chrome/Edge</span>}
          </div>
          {btScanResult && (
            <div className="rounded-xl p-3 text-[11px] flex items-center gap-2" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.7)" }}>
              <Signal size={12}/> {btScanResult}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BT_MODELS.map(m => (
              <div key={m.id} className="rounded-xl p-4" style={{ background:"rgba(5,12,30,0.97)", border:`1px solid rgba(${m.glow},0.2)` }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <p className="font-bold text-white text-[12px]">{m.nombre}</p>
                    <p className="text-[10px]" style={{ color:`rgba(${m.glow},0.6)` }}>{m.marca} · {m.desc}</p>
                  </div>
                </div>
                <p className="text-[9px] text-white/30 mb-2 font-mono">{m.services[0].slice(0,20)}…</p>
                <p className="text-[9px] text-white/30">Filtros: {m.nameFilters.join(", ")}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background:"rgba(96,165,250,0.05)", border:"1px solid rgba(96,165,250,0.15)" }}>
            <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color:"#60a5fa" }}/>
            <div className="text-[11px] text-white/60">
              <p className="font-bold text-white mb-1">Multi-báscula Bluetooth simultáneo</p>
              <p>CIVAC soporta múltiples conexiones BLE simultáneas si tu adaptador lo permite. Registra cada báscula y conéctalas desde el tab Dispositivos. La pila BLE del navegador gestiona el emparejamiento. Para mayor estabilidad, usa adaptadores BT 5.0+ (Intel AX200, Qualcomm WCN3950).</p>
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: DRIVERS ══ */}
      {tab === "drivers" && (
        <div className="space-y-4">
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.2)" }}>
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" style={{ color:"#fbbf24" }}/>
            <div className="text-[11px] text-white/70">
              <p className="font-bold text-white mb-1">¿Cómo saber qué driver necesito?</p>
              <p>Conecta la báscula por USB → abre Administrador de dispositivos → si aparece '¡' amarillo o "dispositivo desconocido", necesitas instalar el driver del chip. El nombre del chip (CH340, CP210x, FTDI, PL2303) suele estar impreso en la PCB del conversor USB-Serial.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DRIVERS.map(d => (
              <div key={d.id} className="rounded-2xl p-4 flex flex-col gap-3"
                style={{ background:"rgba(5,12,30,0.97)", border:`1px solid rgba(${d.glow},${d.recomendado?0.3:0.15})` }}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{d.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-white text-[13px]">{d.nombre}</p>
                      {d.recomendado && <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background:`rgba(${d.glow},0.15)`, color:d.color }}>RECOMENDADO</span>}
                    </div>
                    <p className="font-mono text-[9px] text-white/30">{d.vid}</p>
                  </div>
                </div>
                <p className="text-[10px] text-white/55 leading-relaxed">{d.desc}</p>
                <a href={d.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
                  style={{ background:`rgba(${d.glow},0.12)`, border:`1px solid rgba(${d.glow},0.25)`, color:d.color }}>
                  <Download size={12}/> Descargar driver <ExternalLink size={10} className="ml-auto"/>
                </a>
              </div>
            ))}
          </div>

          {/* C++ check */}
          <div className="rounded-2xl p-5" style={{ background:"rgba(5,12,30,0.97)", border:"1px solid rgba(255,255,255,0.1)" }}>
            <p className="font-black text-white text-sm mb-3 flex items-center gap-2"><Cpu size={13} style={{ color:"#a78bfa" }}/> Requisitos de C++ / Runtimes Windows</p>
            <div className="space-y-2">
              {[
                { label:"Visual C++ Redistributable 2015-2022 (x64)", note:"Requerido por CP210x y algunos drivers FTDI", url:"https://aka.ms/vs/17/release/vc_redist.x64.exe", color:"#a78bfa", glow:"167,139,250" },
                { label:".NET Framework 4.8", note:"Requerido por utilidades de configuración Gallagher/Tru-Test", url:"https://dotnet.microsoft.com/download/dotnet-framework/net48", color:"#60a5fa", glow:"96,165,250" },
                { label:"Zadig (USB driver utility)", note:"Para remplazar drivers problemáticos con WinUSB/libusb", url:"https://zadig.akeo.ie", color:"#39ff7e", glow:"57,255,126" },
              ].map(({ label, note, url, color, glow }) => (
                <div key={label} className="rounded-xl p-3 flex items-center gap-3" style={{ background:`rgba(${glow},0.05)`, border:`1px solid rgba(${glow},0.15)` }}>
                  <HardDrive size={13} style={{ color }} className="flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-[11px] leading-tight">{label}</p>
                    <p className="text-[9px] text-white/40 mt-0.5">{note}</p>
                  </div>
                  <a href={url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all whitespace-nowrap"
                    style={{ color, border:`1px solid rgba(${glow},0.3)`, background:`rgba(${glow},0.08)` }}>
                    <Download size={10}/> Descargar
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: REPORTES ══ */}
      {tab === "reportes" && (
        <div className="space-y-4">
          {/* Report form */}
          <div className="rounded-2xl p-5" style={{ background:"rgba(5,12,30,0.97)", border:"1px solid rgba(255,255,255,0.1)" }}>
            <p className="font-black text-white text-sm mb-4 flex items-center gap-2"><MessageSquare size={13} style={{ color:"#00f5d4" }}/> Enviar reporte al equipo CIVAC</p>
            {reportSent && (
              <div className="rounded-xl p-3 mb-3 flex items-center gap-2 text-[11px]" style={{ background:"rgba(57,255,126,0.08)", border:"1px solid rgba(57,255,126,0.25)", color:"#39ff7e" }}>
                <CheckCircle2 size={13}/> Reporte enviado al servidor CIVAC
              </div>
            )}
            <div className="flex gap-2 mb-3">
              {(["error","usage","driver"] as const).map(t => (
                <button key={t} onClick={() => setReportType(t)}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                  style={{
                    background: reportType===t ? (t==="error"?"rgba(248,113,113,0.15)":t==="usage"?"rgba(0,245,212,0.15)":"rgba(167,139,250,0.15)") : "rgba(255,255,255,0.04)",
                    border: `1px solid ${reportType===t ? (t==="error"?"rgba(248,113,113,0.4)":t==="usage"?"rgba(0,245,212,0.4)":"rgba(167,139,250,0.4)") : "rgba(255,255,255,0.08)"}`,
                    color: reportType===t ? (t==="error"?"#f87171":t==="usage"?"#00f5d4":"#a78bfa") : "rgba(255,255,255,0.35)",
                  }}>
                  {t==="error"?"🔴 Error":t==="usage"?"🟢 Uso":"🟣 Driver"}
                </button>
              ))}
            </div>
            <textarea value={reportMsg} onChange={e => setReportMsg(e.target.value)}
              placeholder="Describe el problema, la báscula, puerto COM o error exacto que aparece en pantalla…"
              rows={4} className="w-full px-3 py-2 rounded-xl text-[12px] text-white placeholder-white/20 outline-none resize-none mb-3"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}/>
            <button onClick={sendReport} disabled={!reportMsg.trim()}
              className="px-5 py-2.5 rounded-xl font-black text-[12px] disabled:opacity-40 flex items-center gap-2 transition-all"
              style={{ background:"linear-gradient(135deg,#00f5d4,#00a896)", color:"#000" }}>
              <MessageSquare size={14}/> Enviar reporte
            </button>
          </div>

          {/* Local telemetry log */}
          <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <p className="font-black text-white text-sm flex items-center gap-2"><BarChart3 size={13} style={{ color:"#fbbf24" }}/> Telemetría local reciente</p>
              <span className="text-[10px] text-white/35">{telemItems.length} eventos</span>
            </div>
            {telemItems.length === 0 ? (
              <div className="p-6 text-center text-white/30 text-[11px]">Sin eventos registrados aún</div>
            ) : (
              <div className="divide-y" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                {telemItems.slice(0, 15).map(item => (
                  <div key={item.id} className="px-4 py-2.5 flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.severity==="error"?"bg-red-400":item.severity==="warn"?"bg-yellow-400":"bg-green-400"}`}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white/70 font-semibold truncate">{item.event}</p>
                      <p className="text-[9px] text-white/30">{new Date(item.ts).toLocaleString("es-CO")} · {item.type}</p>
                    </div>
                    {item.deviceName && <span className="text-[9px] text-white/30 flex-shrink-0">{item.deviceName}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Check({ size, className, style }: { size: number; className?: string; style?: React.CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><polyline points="20 6 9 17 4 12"/></svg>;
}
