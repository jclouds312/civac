/**
 * Scale Configuration Management
 * Manages device configs, custom tramas, print templates, and persistence
 */

export interface ScaleDeviceConfig {
  id: string;
  nombre: string;
  marca: string;
  tipo: string;
  enabled: boolean;
  baudRate?: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 1.5 | 2;
  parity?: 'none' | 'even' | 'odd';
  color: string;
  glow: string;
}

export interface CustomTrama {
  id: string;
  nombre: string;
  descripcion: string;
  regex: string;
  icon: string;
  color: string;
  estabilidad_directa: boolean;
  ejemplo: string;
  createdAt: number;
  active: boolean;
}

export interface PrintTemplate {
  paperSize: 'thermal58' | 'thermal80' | 'a4' | 'letter';
  copies: number;
  marginTop: number;
  marginSide: number;
  headerLine1: string;
  headerLine2: string;
  footerText: string;
  showIA: boolean;
  showFoto: boolean;
  showFirma: boolean;
  showValor: boolean;
  showReg: boolean;
  autoPrint: boolean;
}

export const DEFAULT_PRINT_TEMPLATE: PrintTemplate = {
  paperSize: 'thermal80',
  copies: 1,
  marginTop: 8,
  marginSide: 10,
  headerLine1: 'GanaderIA PRO',
  headerLine2: 'Ganadería Inteligente · Colombia',
  footerText: 'GanaderIA PRO · Gestión Ganadera Inteligente',
  showIA: true,
  showFoto: true,
  showFirma: true,
  showValor: true,
  showReg: true,
  autoPrint: false,
};

export const DEFAULT_DEVICE_CONFIG: Record<string, ScaleDeviceConfig> = {
  'tru-test-xr3': {
    id: 'tru-test-xr3',
    nombre: 'Tru-Test XR3000',
    marca: 'Tru-Test',
    tipo: 'Indicador BLE 5.0',
    enabled: true,
    color: '#00f5d4',
    glow: '0,245,212',
  },
  'gallagher-w210-bt': {
    id: 'gallagher-w210-bt',
    nombre: 'Gallagher W210 BT',
    marca: 'Gallagher',
    tipo: 'Báscula WiFi/BT',
    enabled: true,
    color: '#fbbf24',
    glow: '251,191,36',
  },
};

/**
 * Load device configurations from localStorage
 */
export function loadDeviceConfigs(): Record<string, ScaleDeviceConfig> {
  try {
    const stored = localStorage.getItem('ganader_device_configs');
    return stored ? JSON.parse(stored) : DEFAULT_DEVICE_CONFIG;
  } catch {
    return DEFAULT_DEVICE_CONFIG;
  }
}

/**
 * Save device configurations to localStorage
 */
export function saveDeviceConfigs(configs: Record<string, ScaleDeviceConfig>): void {
  try {
    localStorage.setItem('ganader_device_configs', JSON.stringify(configs));
  } catch (e) {
    console.error('Error saving device configs:', e);
  }
}

/**
 * Load custom tramas from localStorage
 */
export function loadCustomTramas(): CustomTrama[] {
  try {
    const stored = localStorage.getItem('ganader_custom_tramas');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save custom tramas to localStorage
 */
export function saveCustomTramas(tramas: CustomTrama[]): void {
  try {
    localStorage.setItem('ganader_custom_tramas', JSON.stringify(tramas));
  } catch (e) {
    console.error('Error saving custom tramas:', e);
  }
}

/**
 * Load print template from localStorage
 */
export function loadPrintTemplate(): PrintTemplate {
  try {
    const stored = localStorage.getItem('ganader_print_template');
    return stored ? JSON.parse(stored) : DEFAULT_PRINT_TEMPLATE;
  } catch {
    return DEFAULT_PRINT_TEMPLATE;
  }
}

/**
 * Save print template to localStorage
 */
export function savePrintTemplate(template: PrintTemplate): void {
  try {
    localStorage.setItem('ganader_print_template', JSON.stringify(template));
  } catch (e) {
    console.error('Error saving print template:', e);
  }
}

/**
 * Test a custom trama regex against sample data
 */
export function testCustomTrama(trama: CustomTrama, testData: string): number[] {
  try {
    const regex = new RegExp(trama.regex, 'gi');
    const matches = testData.matchAll(regex);
    const weights: number[] = [];
    
    for (const match of matches) {
      if (match[1]) {
        const w = parseFloat(match[1]);
        if (!isNaN(w) && w > 0 && w < 3000) {
          weights.push(w);
        }
      }
    }
    
    return weights;
  } catch {
    return [];
  }
}

/**
 * Export all scale configurations as JSON
 */
export function exportScaleConfig(
  devices: Record<string, ScaleDeviceConfig>,
  tramas: CustomTrama[],
  template: PrintTemplate
): string {
  const config = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    devices,
    tramas,
    printTemplate: template,
  };
  return JSON.stringify(config, null, 2);
}

/**
 * Import scale configurations from JSON
 */
export function importScaleConfig(jsonStr: string): {
  devices: Record<string, ScaleDeviceConfig>;
  tramas: CustomTrama[];
  template: PrintTemplate;
} | null {
  try {
    const config = JSON.parse(jsonStr);
    return {
      devices: config.devices || DEFAULT_DEVICE_CONFIG,
      tramas: config.tramas || [],
      template: config.printTemplate || DEFAULT_PRINT_TEMPLATE,
    };
  } catch {
    return null;
  }
}

/**
 * Validate custom trama regex
 */
export function validateTramaRegex(regex: string): { valid: boolean; error?: string } {
  try {
    new RegExp(regex);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

/**
 * Get default trama for a device type
 */
export function getDefaultTramaForDevice(deviceType: string): string {
  const tramaMappings: Record<string, string> = {
    'tru-test': 'civac_9b',
    'gallagher': 'toledo_scs',
    'sema': 'sema_co',
    'ruddweigh': 'ruddweigh',
    'generic': 'generic_line',
  };

  for (const [key, trama] of Object.entries(tramaMappings)) {
    if (deviceType.toLowerCase().includes(key)) {
      return trama;
    }
  }

  return 'generic_line';
}
