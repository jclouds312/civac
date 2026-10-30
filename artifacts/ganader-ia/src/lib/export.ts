// CIVAC PRO — Data Export & Import Utilities v3.0

export interface ModuleMeta {
  key: string;
  label: string;
  emoji: string;
  color: string;
  glow: string;
}

export const MODULE_META: ModuleMeta[] = [
  { key: 'animals',      label: 'Inventario Animal',   emoji: '🐄', color: '#39ff7e', glow: '57,255,126'   },
  { key: 'pesajes',      label: 'Pesajes',             emoji: '⚖️', color: '#ff9500', glow: '255,149,0'    },
  { key: 'lotes',        label: 'Movimiento Lotes',    emoji: '🐂', color: '#00c8ff', glow: '0,200,255'    },
  { key: 'reproduccion', label: 'Reproducción',        emoji: '🔁', color: '#a78bfa', glow: '167,139,250'  },
  { key: 'insumos',      label: 'Insumos',             emoji: '📦', color: '#fbbf24', glow: '251,191,36'   },
  { key: 'personal',     label: 'Personal',            emoji: '👤', color: '#f87171', glow: '248,113,113'  },
  { key: 'potreros',     label: 'Potreros',            emoji: '🌿', color: '#34d399', glow: '52,211,153'   },
  { key: 'alertas',      label: 'Alertas',             emoji: '🔔', color: '#fb923c', glow: '251,146,60'   },
  { key: 'semen',        label: 'Semen & Material',    emoji: '🧊', color: '#22d3ee', glow: '34,211,238'   },
  { key: 'embriones',    label: 'Embriones',           emoji: '🔬', color: '#c084fc', glow: '192,132,252'  },
  { key: 'gps',          label: 'GPS / Ubicaciones',  emoji: '📍', color: '#38bdf8', glow: '56,189,248'   },
];

// ─── CSV ──────────────────────────────────────────────────────────────────────

function escapeCSV(v: unknown): string {
  const s = String(v ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  return [
    headers.join(','),
    ...rows.map(r => headers.map(h => escapeCSV(r[h])).join(',')),
  ].join('\n');
}

// ─── Download helpers ─────────────────────────────────────────────────────────

export function downloadBlob(content: string, filename: string, type = 'text/plain') {
  const blob = new Blob(['\uFEFF' + content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  downloadBlob(toCSV(rows), filename, 'text/csv;charset=utf-8;');
}

// ─── Storage stats ────────────────────────────────────────────────────────────

export interface ModuleStats extends ModuleMeta {
  count: number;
  bytes: number;
  hasData: boolean;
  lastModified?: string;
}

export function getStorageStats(): ModuleStats[] {
  return MODULE_META.map(m => {
    const raw = localStorage.getItem(`civac_${m.key}`) || '';
    let count = 0;
    try {
      const p = JSON.parse(raw);
      count = Array.isArray(p) ? p.length : 0;
    } catch { /* empty */ }
    return { ...m, count, bytes: new Blob([raw]).size, hasData: count > 0 };
  });
}

export function getTotalStorageBytes(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i) || '';
    if (k.startsWith('civac_')) {
      try { total += new Blob([localStorage.getItem(k) || '']).size; } catch { /* skip */ }
    }
  }
  return total;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// ─── Full backup ──────────────────────────────────────────────────────────────

export interface CivacBackup {
  version: string;
  app: string;
  exportedAt: string;
  exportedBy?: string;
  finca?: Record<string, unknown>;
  data: Record<string, unknown[]>;
}

export function buildFullBackup(
  state: Record<string, unknown[]>,
  exportedBy?: string
): CivacBackup {
  const finca = (() => {
    try { return JSON.parse(localStorage.getItem('ganader_finca') || '{}'); } catch { return {}; }
  })();
  return {
    version: 'CIVAC-3.0',
    app: 'GanaderIA / CIVAC PRO',
    exportedAt: new Date().toISOString(),
    exportedBy,
    finca,
    data: state,
  };
}

export function exportFullBackup(state: Record<string, unknown[]>, userName?: string) {
  const backup = buildFullBackup(state, userName);
  const date = new Date().toISOString().slice(0, 10);
  downloadJSON(backup, `civac-backup-${date}.json`);
  try { localStorage.setItem('civac_last_export', new Date().toISOString()); } catch { /* skip */ }
  try {
    const hist = JSON.parse(localStorage.getItem('civac_export_history') || '[]') as string[];
    hist.unshift(new Date().toISOString());
    localStorage.setItem('civac_export_history', JSON.stringify(hist.slice(0, 10)));
  } catch { /* skip */ }
}

export function exportModuleCSV(rows: Record<string, unknown>[], moduleKey: string) {
  const meta = MODULE_META.find(m => m.key === moduleKey);
  const label = (meta?.label || moduleKey).replace(/[\s/&]/g, '_').toLowerCase();
  const date = new Date().toISOString().slice(0, 10);
  downloadCSV(rows, `civac-${label}-${date}.csv`);
}

export function exportAllModulesCSV(state: Record<string, Record<string, unknown>[]>) {
  const modules = Object.entries(state).filter(([, v]) => Array.isArray(v) && v.length > 0);
  modules.forEach(([key, rows], i) => {
    setTimeout(() => exportModuleCSV(rows as Record<string, unknown>[], key), i * 350);
  });
}

// ─── Import / restore ─────────────────────────────────────────────────────────

export function readBackupFile(file: File): Promise<CivacBackup> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse((e.target?.result as string) || '');
        if (!parsed.data) throw new Error('Formato de backup inválido — campo "data" no encontrado');
        resolve(parsed as CivacBackup);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Error leyendo archivo'));
    reader.readAsText(file);
  });
}

export function applyBackupToLocalStorage(backup: CivacBackup): string[] {
  const restored: string[] = [];
  Object.entries(backup.data).forEach(([key, value]) => {
    try {
      localStorage.setItem(`civac_${key}`, JSON.stringify(value));
      restored.push(key);
    } catch { /* skip */ }
  });
  if (backup.finca) {
    try { localStorage.setItem('ganader_finca', JSON.stringify(backup.finca)); } catch { /* skip */ }
  }
  try { localStorage.setItem('civac_last_import', new Date().toISOString()); } catch { /* skip */ }
  return restored;
}

export function getLastExportTime(): string | null {
  return localStorage.getItem('civac_last_export');
}

export function getExportHistory(): string[] {
  try { return JSON.parse(localStorage.getItem('civac_export_history') || '[]'); } catch { return []; }
}

export function getTotalRecords(state: Record<string, unknown[]>): number {
  return Object.values(state).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
}
