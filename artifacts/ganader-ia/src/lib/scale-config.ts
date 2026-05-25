// CIVAC PRO — Scale Device Configuration
// Persistencia offline-first para configuración de básculas BT/COM

/* ─── Types ──────────────────────────────────────────────────────────────────── */
export interface ScaleDeviceConfig {
  tramaId: string;
  printMode: 'individual' | 'batch' | 'continuo';
  autoPrint: boolean;
  copies: number;
  stabilityThreshold: number;
  valorKilo: number;
  enabled: boolean;
}

export interface CustomTrama {
  id: string;
  nombre: string;
  descripcion: string;
  regex: string;
  stableChar?: string;
  icon: string;
  color: string;
  estabilidad_directa: boolean;
  ejemplo?: string;
}

export interface PrintTemplate {
  headerLine1: string;
  headerLine2: string;
  footerText: string;
  showFoto: boolean;
  showIA: boolean;
  showFirma: boolean;
  showValor: boolean;
  showReg: boolean;
  paperSize: 'thermal58' | 'thermal80' | 'a4' | 'letter';
  copies: number;
  autoPrint: boolean;
  marginTop: number;
  marginSide: number;
}

/* ─── Keys ───────────────────────────────────────────────────────────────────── */
const KEY_DEVICE_CONFIGS  = 'civac_scale_device_configs_v1';
const KEY_CUSTOM_TRAMAS   = 'civac_custom_tramas_v1';
const KEY_PRINT_TEMPLATE  = 'civac_print_template_v1';

/* ─── Defaults ─────────────────────────────────────────────────────────────── */
export const DEFAULT_DEVICE_CONFIG: ScaleDeviceConfig = {
  tramaId: 'civac_9b',
  printMode: 'individual',
  autoPrint: false,
  copies: 1,
  stabilityThreshold: 1.5,
  valorKilo: 11000,
  enabled: true,
};

export const DEFAULT_PRINT_TEMPLATE: PrintTemplate = {
  headerLine1: 'GanaderIA PRO',
  headerLine2: 'Ganadería Inteligente · Colombia',
  footerText: 'GanaderIA PRO — Gestión Ganadera Inteligente',
  showFoto: true,
  showIA: true,
  showFirma: false,
  showValor: true,
  showReg: true,
  paperSize: 'thermal80',
  copies: 1,
  autoPrint: false,
  marginTop: 8,
  marginSide: 10,
};

/* ─── Safe helpers ───────────────────────────────────────────────────────────── */
function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}
function safeSet(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

/* ─── Device Configs ─────────────────────────────────────────────────────────── */
export function loadDeviceConfigs(): Record<string, ScaleDeviceConfig> {
  return safeParse<Record<string, ScaleDeviceConfig>>(KEY_DEVICE_CONFIGS, {});
}
export function saveDeviceConfigs(configs: Record<string, ScaleDeviceConfig>): void {
  safeSet(KEY_DEVICE_CONFIGS, configs);
}
export function getDeviceConfig(id: string): ScaleDeviceConfig {
  const all = loadDeviceConfigs();
  return { ...DEFAULT_DEVICE_CONFIG, ...all[id] };
}

/* ─── Custom Tramas ─────────────────────────────────────────────────────────── */
export function loadCustomTramas(): CustomTrama[] {
  return safeParse<CustomTrama[]>(KEY_CUSTOM_TRAMAS, []);
}
export function saveCustomTramas(tramas: CustomTrama[]): void {
  safeSet(KEY_CUSTOM_TRAMAS, tramas);
}
export function addCustomTrama(trama: CustomTrama): void {
  const all = loadCustomTramas();
  saveCustomTramas([...all.filter(t => t.id !== trama.id), trama]);
}
export function deleteCustomTrama(id: string): void {
  saveCustomTramas(loadCustomTramas().filter(t => t.id !== id));
}

/* ─── Print Template ─────────────────────────────────────────────────────────── */
export function loadPrintTemplate(): PrintTemplate {
  const saved = safeParse<Partial<PrintTemplate>>(KEY_PRINT_TEMPLATE, {});
  return { ...DEFAULT_PRINT_TEMPLATE, ...saved };
}
export function savePrintTemplate(template: PrintTemplate): void {
  safeSet(KEY_PRINT_TEMPLATE, template);
}

/* ─── Test regex against a raw frame ────────────────────────────────────────── */
export function testCustomTrama(regex: string, input: string): { match: boolean; peso: number | null; raw: string } {
  try {
    const re = new RegExp(regex);
    const m  = input.match(re);
    if (m && m[1]) {
      const peso = parseFloat(m[1]);
      return { match: true, peso: isNaN(peso) ? null : peso, raw: m[0] };
    }
    return { match: false, peso: null, raw: '' };
  } catch {
    return { match: false, peso: null, raw: 'Regex inválido' };
  }
}
