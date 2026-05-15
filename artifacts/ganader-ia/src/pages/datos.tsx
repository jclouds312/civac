import { useState, useRef } from "react";
import { useAppState } from "../lib/data";
import { useAuth } from "../lib/auth";
import {
  getStorageStats, getTotalStorageBytes, formatBytes, getTotalRecords,
  exportFullBackup, exportModuleCSV, exportAllModulesCSV,
  readBackupFile, applyBackupToLocalStorage, getLastExportTime, getExportHistory,
  MODULE_META,
} from "../lib/export";
import {
  Database, Download, Upload, RefreshCw, CheckCircle2, AlertTriangle,
  HardDrive, Archive, FileJson, FileText, Clock, Shield,
  Layers, Zap, Package, WifiOff, Smartphone, RotateCcw,
  FolderOpen, CloudOff, Lock, TrendingUp, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
  } catch { return iso; }
}

/* ── Helpers de color para cards temáticas ──────────────────────────────── */
const CARD_STYLES = {
  green:  { light: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', dark: 'linear-gradient(135deg,#021a08,#042a10)', border: 'rgba(34,197,94,0.22)', accent: '#22c55e', glow: '34,197,94' },
  teal:   { light: 'linear-gradient(135deg,#f0fdfa,#ccfbf1)', dark: 'linear-gradient(135deg,#001a14,#002a1e)', border: 'rgba(20,184,166,0.22)', accent: '#14b8a6', glow: '20,184,166' },
  blue:   { light: 'linear-gradient(135deg,#f0f9ff,#dbeafe)', dark: 'linear-gradient(135deg,#001428,#001e3c)', border: 'rgba(59,130,246,0.22)', accent: '#3b82f6', glow: '59,130,246' },
  amber:  { light: 'linear-gradient(135deg,#fffbeb,#fef3c7)', dark: 'linear-gradient(135deg,#1a1000,#2a1800)', border: 'rgba(245,158,11,0.25)', accent: '#f59e0b', glow: '245,158,11' },
  purple: { light: 'linear-gradient(135deg,#faf5ff,#ede9fe)', dark: 'linear-gradient(135deg,#0f0020,#180030)', border: 'rgba(139,92,246,0.22)', accent: '#8b5cf6', glow: '139,92,246' },
  rose:   { light: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', dark: 'linear-gradient(135deg,#1f0008,#2d000e)', border: 'rgba(244,63,94,0.22)', accent: '#f43f5e', glow: '244,63,94' },
};

export default function Datos() {
  const state = useAppState();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ ok: boolean; msg: string; modules?: string[] } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeSection, setActiveSection] = useState<'overview'|'export'|'import'|'modulos'>('overview');

  const refresh = () => setRefreshKey(k => k + 1);
  void refreshKey;

  const stateMap: Record<string, unknown[]> = {
    animals:      state.animals,
    potreros:     state.potreros,
    insumos:      state.insumos,
    personal:     state.personal,
    reproduccion: state.reproduccion,
    alertas:      state.alertas,
    pesajes:      state.pesajes,
    gps:          state.gpsUbicaciones,
    lotes:        state.lotes,
    semen:        state.semen,
    embriones:    state.embriones,
  };

  const storageStats   = getStorageStats();
  const totalBytes     = getTotalStorageBytes();
  const totalRecords   = getTotalRecords(stateMap);
  const activeModules  = storageStats.filter(s => s.hasData).length;
  const lastExport     = getLastExportTime();
  const exportHistory  = getExportHistory();
  const storePct       = Math.min(100, Math.round((totalBytes / (5 * 1024 * 1024)) * 100));

  const handleExportAll = () => {
    exportFullBackup(stateMap as Record<string, unknown[]>, user?.nombre);
    setTimeout(refresh, 600);
  };
  const handleExportAllCSV = () => {
    exportAllModulesCSV(stateMap as Record<string, Record<string, unknown>[]>);
  };
  const handleExportModule = (key: string) => {
    const data = stateMap[key] as Record<string, unknown>[];
    if (data && data.length > 0) exportModuleCSV(data, key);
  };
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const backup = await readBackupFile(file);
      const restored = applyBackupToLocalStorage(backup);
      setImportResult({
        ok: true,
        msg: `Backup restaurado correctamente. La página se recargará para aplicar los cambios.`,
        modules: restored,
      });
      setTimeout(() => window.location.reload(), 2500);
    } catch (err: unknown) {
      setImportResult({ ok: false, msg: String((err as Error).message || 'Error desconocido') });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const navTabs = [
    { id: 'overview', label: 'Estado',   emoji: '📊' },
    { id: 'export',   label: 'Exportar', emoji: '⬇️' },
    { id: 'import',   label: 'Restaurar',emoji: '⬆️' },
    { id: 'modulos',  label: 'Módulos',  emoji: '🗂️' },
  ] as const;

  return (
    <div className="space-y-5 pb-8 civac-animate">

      {/* ── BANNER ─────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,#003d2e 0%,#004d3a 45%,#003050 100%)',
          border: '1px solid rgba(0,245,212,0.28)',
          boxShadow: '0 0 40px rgba(0,245,212,0.07)',
        }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 -right-8 w-52 h-52 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle,#00f5d4,transparent)' }}/>
          <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle,#00c8ff,transparent)' }}/>
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(0,245,212,0.025) 28px,rgba(0,245,212,0.025) 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(0,245,212,0.015) 28px,rgba(0,245,212,0.015) 29px)',
          }}/>
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl"
              style={{ background: 'rgba(0,245,212,0.12)', border: '1px solid rgba(0,245,212,0.38)', boxShadow: '0 0 24px rgba(0,245,212,0.2)' }}>
              🗄️
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Sora,sans-serif' }}>
                  Centro de Respaldo
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(0,245,212,0.15)', color: '#00f5d4', border: '1px solid rgba(0,245,212,0.35)' }}>
                  CIVAC PWA
                </span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(0,245,212,0.65)' }}>
                Backup completo · Restaurar datos · Estado de módulos · Almacenamiento offline
              </p>
              <div className="flex gap-4 mt-2 flex-wrap">
                {[
                  { icon: <WifiOff size={9}/>, label: '100% Offline · localStorage', c: '#39ff7e' },
                  { icon: <Zap size={9}/>,     label: 'Auto-guardado en tiempo real', c: '#fbbf24' },
                  { icon: <Shield size={9}/>,  label: `${totalRecords} registros protegidos`, c: '#00c8ff' },
                ].map(b => (
                  <span key={b.label} className="text-[10px] flex items-center gap-1.5 font-medium" style={{ color: b.c }}>
                    {b.icon} {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleExportAll}
              className="h-9 gap-1.5 text-sm font-bold"
              style={{ background: 'rgba(0,245,212,0.15)', border: '1px solid rgba(0,245,212,0.4)', color: '#00f5d4' }}>
              <FileJson size={14}/> Backup JSON
            </Button>
            <Button onClick={handleExportAllCSV}
              className="h-9 gap-1.5 text-sm font-bold"
              style={{ background: 'rgba(57,255,126,0.12)', border: '1px solid rgba(57,255,126,0.35)', color: '#39ff7e' }}>
              <FileText size={14}/> Exportar CSV
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon:'📦', label:'Registros Totales',  val: String(totalRecords),  sub:'en todos los módulos',  c:'#39ff7e', glow:'34,197,94',   bg: CARD_STYLES.green  },
          { icon:'💾', label:'Almacenamiento',      val: formatBytes(totalBytes),sub:'de 5 MB disponibles',   c:'#3b82f6', glow:'59,130,246',  bg: CARD_STYLES.blue   },
          { icon:'🗂️', label:'Módulos Activos',     val:`${activeModules}/${MODULE_META.length}`, sub:'con datos registrados', c:'#14b8a6', glow:'20,184,166', bg: CARD_STYLES.teal },
          { icon:'🕐', label:'Último Backup',       val: lastExport ? fmtDate(lastExport).split(',')[0] : 'Sin backup', sub: lastExport ? 'Clic para exportar de nuevo':'Exporte ahora', c:'#f59e0b', glow:'245,158,11', bg: CARD_STYLES.amber },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-4 relative overflow-hidden card-lift"
            style={{ background: k.bg.dark, border: `1px solid ${k.bg.border}` }}>
            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
              style={{ background: `rgb(${k.glow})`, opacity: 0.08, filter: 'blur(20px)', transform: 'translate(30%,-30%)' }}/>
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: `rgba(${k.glow},0.6)` }}>{k.label}</div>
            <div className="text-xl font-black" style={{ color: k.c, fontFamily: 'Sora,sans-serif' }}>{k.val}</div>
            <div className="text-[10px] mt-0.5" style={{ color: `rgba(${k.glow},0.45)` }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── NAV TABS ────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {navTabs.map(t => (
          <button key={t.id} onClick={() => setActiveSection(t.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
            style={activeSection === t.id
              ? { background: 'rgba(0,245,212,0.15)', border: '1px solid rgba(0,245,212,0.4)', color: '#00f5d4', boxShadow: '0 0 12px rgba(0,245,212,0.1)' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
            <span>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ── SECTION: OVERVIEW ───────────────────────────────────────────────── */}
      {activeSection === 'overview' && (
        <div className="space-y-4">
          {/* Storage usage bar */}
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg,#021a08,#042a10)', border: '1px solid rgba(34,197,94,0.18)' }}>
            <div className="flex items-center gap-2 mb-4">
              <HardDrive size={16} style={{ color: '#39ff7e' }}/>
              <span className="font-bold text-white">Uso de Almacenamiento Local</span>
              <button onClick={refresh} className="ml-auto p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <RefreshCw size={12}/>
              </button>
            </div>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-4xl font-black" style={{ color: '#39ff7e', fontFamily: 'Sora,sans-serif' }}>
                {formatBytes(totalBytes)}
              </span>
              <span className="text-sm text-white/40 mb-1">/ 5 MB disponibles · localStorage</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${storePct}%`,
                  background: storePct > 80
                    ? 'linear-gradient(90deg,#f59e0b,#ef4444)'
                    : storePct > 50
                    ? 'linear-gradient(90deg,#22c55e,#f59e0b)'
                    : 'linear-gradient(90deg,#00f5d4,#22c55e)',
                  boxShadow: `0 0 10px rgba(0,245,212,0.4)`,
                }}/>
            </div>
            <div className="flex justify-between text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span>{storePct}% usado</span>
              <span>{100 - storePct}% libre</span>
            </div>
          </div>

          {/* PWA Info boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: <WifiOff size={20}/>, title: 'Sin Internet, Sin Problema',
                desc: 'Todos los datos viven en tu dispositivo (localStorage). La app funciona 100% offline. Solo se necesita internet para la primera instalación.',
                c: CARD_STYLES.green, accent: '#22c55e',
              },
              {
                icon: <Smartphone size={20}/>, title: 'Instala en tu Dispositivo',
                desc: 'Como PWA, CIVAC PRO se puede instalar en Android, iOS, Windows o Mac sin App Store. Los datos permanecen en el dispositivo, seguros.',
                c: CARD_STYLES.teal, accent: '#14b8a6',
              },
              {
                icon: <CloudOff size={20}/>, title: 'Backup Manual Recomendado',
                desc: 'Exporta un JSON de respaldo periódicamente. Puedes restaurarlo en cualquier dispositivo. Se recomienda backup semanal o antes de reiniciar el navegador.',
                c: CARD_STYLES.amber, accent: '#f59e0b',
              },
            ].map(b => (
              <div key={b.title} className="rounded-2xl p-4" style={{ background: b.c.dark, border: `1px solid ${b.c.border}` }}>
                <div className="mb-3" style={{ color: b.accent }}>{b.icon}</div>
                <div className="font-bold text-sm text-white mb-1.5">{b.title}</div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Export history */}
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg,#001428,#001e3c)', border: '1px solid rgba(59,130,246,0.18)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={15} style={{ color: '#3b82f6' }}/>
              <span className="font-bold text-white text-sm">Historial de Backups</span>
              {exportHistory.length === 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.25)' }}>
                  Sin backups aún
                </span>
              )}
            </div>
            {exportHistory.length === 0 ? (
              <div className="text-center py-6">
                <Archive size={28} className="mx-auto mb-2" style={{ color: 'rgba(59,130,246,0.3)' }}/>
                <p className="text-sm font-medium text-white/40">No hay backups registrados</p>
                <p className="text-xs text-white/25 mt-1">Haga clic en "Backup JSON" para crear el primero</p>
                <button onClick={handleExportAll}
                  className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'rgba(0,245,212,0.12)', border: '1px solid rgba(0,245,212,0.3)', color: '#00f5d4' }}>
                  <Download size={13}/> Crear primer backup
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {exportHistory.slice(0, 6).map((ts, i) => (
                  <div key={ts} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: i === 0 ? 'rgba(0,245,212,0.15)' : 'rgba(255,255,255,0.05)' }}>
                      <FileJson size={13} style={{ color: i === 0 ? '#00f5d4' : 'rgba(255,255,255,0.3)' }}/>
                    </div>
                    <span className="text-xs text-white/60 flex-1">{fmtDate(ts)}</span>
                    {i === 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(0,245,212,0.12)', color: '#00f5d4' }}>
                        más reciente
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SECTION: EXPORT ─────────────────────────────────────────────────── */}
      {activeSection === 'export' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg,#003d2e,#004d3a)', border: '1px solid rgba(0,245,212,0.2)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Archive size={16} style={{ color: '#00f5d4' }}/>
              <span className="font-bold text-white">Opciones de Exportación</span>
            </div>
            <p className="text-xs text-white/40 mb-5">Descarga tus datos para respaldarlos o abrirlos en otras herramientas</p>

            <div className="grid sm:grid-cols-2 gap-3">
              {/* JSON completo */}
              <button onClick={handleExportAll}
                className="flex items-start gap-4 p-4 rounded-2xl text-left transition-all hover:scale-[1.01] group"
                style={{ background: 'rgba(0,245,212,0.07)', border: '1px solid rgba(0,245,212,0.2)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,245,212,0.15)', border: '1px solid rgba(0,245,212,0.3)' }}>
                  <FileJson size={22} style={{ color: '#00f5d4' }}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white mb-0.5">Backup Completo — JSON</div>
                  <div className="text-xs text-white/40 mb-2">
                    Todos los módulos · {totalRecords} registros · {formatBytes(totalBytes)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['✓ Restaurable', '✓ Todos los datos', '✓ Estructura completa'].map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,245,212,0.1)', color: '#00f5d4' }}>{t}</span>
                    ))}
                  </div>
                </div>
                <Download size={16} className="flex-shrink-0 mt-0.5 group-hover:translate-y-0.5 transition-transform" style={{ color: '#00f5d4' }}/>
              </button>

              {/* CSV múltiples */}
              <button onClick={handleExportAllCSV}
                className="flex items-start gap-4 p-4 rounded-2xl text-left transition-all hover:scale-[1.01] group"
                style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)' }}>
                  <FileText size={22} style={{ color: '#22c55e' }}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white mb-0.5">Exportar como CSVs</div>
                  <div className="text-xs text-white/40 mb-2">
                    Un archivo CSV por módulo · compatible con Excel / Google Sheets
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['✓ Abre en Excel', '✓ Por módulo', '✓ Imprimible'].map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>{t}</span>
                    ))}
                  </div>
                </div>
                <Download size={16} className="flex-shrink-0 mt-0.5 group-hover:translate-y-0.5 transition-transform" style={{ color: '#22c55e' }}/>
              </button>
            </div>

            {/* CSV por módulo */}
            <div className="mt-4">
              <div className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Exportar módulo individual
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {MODULE_META.map(m => {
                  const count = (stateMap[m.key] as unknown[])?.length ?? 0;
                  return (
                    <button key={m.key} onClick={() => handleExportModule(m.key)}
                      disabled={count === 0}
                      className="flex items-center gap-2 p-2.5 rounded-xl text-left transition-all disabled:opacity-30 hover:scale-[1.02]"
                      style={{ background: `rgba(${m.glow},0.06)`, border: `1px solid rgba(${m.glow},0.18)` }}>
                      <span className="text-lg flex-shrink-0">{m.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-white/80 truncate">{m.label}</div>
                        <div className="text-[9px]" style={{ color: m.color }}>{count} reg.</div>
                      </div>
                      <Download size={10} style={{ color: m.color, flexShrink: 0 }}/>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} style={{ color: '#f59e0b' }}/>
              <span className="font-bold text-sm text-white">Recomendaciones de Backup</span>
            </div>
            <ul className="space-y-1.5">
              {[
                'Haga backup JSON completo al menos una vez por semana',
                'Guarde el archivo en Google Drive, USB o correo electrónico',
                'Antes de cambiar de dispositivo o navegador, exporte siempre',
                'Los CSV son útiles para ver datos en Excel o reportes',
                'El JSON es el único formato que permite restauración completa',
              ].map(t => (
                <li key={t} className="flex items-start gap-2 text-xs text-white/50">
                  <span className="text-amber-400 flex-shrink-0 mt-0.5">•</span>{t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── SECTION: IMPORT / RESTORE ────────────────────────────────────────── */}
      {activeSection === 'import' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg,#1a0800,#2a1200)', border: '1px solid rgba(245,158,11,0.22)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Upload size={16} style={{ color: '#f59e0b' }}/>
              <span className="font-bold text-white">Restaurar Backup</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.25)' }}>
                Sobreescribe datos actuales
              </span>
            </div>
            <p className="text-xs text-white/40 mb-5">Selecciona un archivo JSON generado por CIVAC PRO para restaurar tus datos</p>

            {/* Drop zone */}
            <div className="rounded-2xl p-8 text-center border-2 border-dashed cursor-pointer transition-all hover:bg-white/[0.02] mb-4"
              style={{ borderColor: 'rgba(245,158,11,0.3)' }}
              onClick={() => fileRef.current?.click()}>
              <FolderOpen size={36} className="mx-auto mb-3" style={{ color: 'rgba(245,158,11,0.4)' }}/>
              <div className="text-base font-semibold text-white/60 mb-1">Seleccionar archivo de backup</div>
              <div className="text-xs text-white/30">Arrastra tu archivo .json aquí o haz clic para buscar</div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
                <Upload size={14}/> Examinar archivos
              </div>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport}/>
            </div>

            {importing && (
              <div className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <RefreshCw size={15} className="animate-spin flex-shrink-0" style={{ color: '#f59e0b' }}/>
                <div>
                  <div className="text-sm font-semibold text-white">Procesando backup…</div>
                  <div className="text-xs text-white/40">Verificando estructura y restaurando módulos</div>
                </div>
              </div>
            )}

            {importResult && (
              <div className="rounded-xl p-4 space-y-2"
                style={{
                  background: importResult.ok ? 'rgba(34,197,94,0.07)' : 'rgba(244,63,94,0.07)',
                  border: `1px solid ${importResult.ok ? 'rgba(34,197,94,0.3)' : 'rgba(244,63,94,0.3)'}`,
                }}>
                <div className="flex items-center gap-2">
                  {importResult.ok
                    ? <CheckCircle2 size={16} style={{ color: '#22c55e' }}/>
                    : <AlertTriangle size={16} style={{ color: '#f43f5e' }}/>}
                  <span className="font-bold text-sm" style={{ color: importResult.ok ? '#22c55e' : '#f43f5e' }}>
                    {importResult.ok ? '¡Backup restaurado exitosamente!' : 'Error al importar'}
                  </span>
                </div>
                <p className="text-xs text-white/50">{importResult.msg}</p>
                {importResult.modules && importResult.modules.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    {importResult.modules.map(m => (
                      <span key={m} className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                        ✓ {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Warnings */}
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: <RotateCcw size={18}/>, title: 'Los datos actuales se reemplazarán', desc: 'La restauración sobreescribe completamente los datos existentes en cada módulo del backup. No se puede deshacer.', c: CARD_STYLES.rose },
              { icon: <Lock size={18}/>, title: 'Solo backups CIVAC PRO', desc: 'Solo se aceptan archivos JSON generados por esta misma aplicación. El archivo debe tener la estructura correcta de CIVAC PRO.', c: CARD_STYLES.purple },
            ].map(w => (
              <div key={w.title} className="rounded-xl p-4" style={{ background: w.c.dark, border: `1px solid ${w.c.border}` }}>
                <div className="flex items-center gap-2 mb-2" style={{ color: w.c.accent }}>{w.icon}
                  <span className="font-bold text-sm text-white">{w.title}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION: MODULES ────────────────────────────────────────────────── */}
      {activeSection === 'modulos' && (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Módulos con datos', val: activeModules, c: '#22c55e', glow: '34,197,94' },
              { label: 'Módulos vacíos',    val: MODULE_META.length - activeModules, c: '#f43f5e', glow: '244,63,94' },
              { label: 'Total registros',   val: totalRecords, c: '#00f5d4', glow: '0,245,212' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4 text-center"
                style={{ background: `rgba(${s.glow},0.06)`, border: `1px solid rgba(${s.glow},0.18)` }}>
                <div className="text-2xl font-black" style={{ color: s.c, fontFamily: 'Sora,sans-serif' }}>{s.val}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Module grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {storageStats.map(m => {
              const count = (stateMap[m.key] as unknown[])?.length ?? m.count;
              const health = count > 5 ? 'full' : count > 0 ? 'partial' : 'empty';
              const hc = health === 'full' ? '#22c55e' : health === 'partial' ? '#f59e0b' : '#f43f5e';
              const hLabel = health === 'full' ? 'Con datos' : health === 'partial' ? 'Datos iniciales' : 'Vacío';
              const barW = Math.min(100, count > 0 ? Math.max(8, (count / Math.max(1, totalRecords)) * 100 * 6) : 0);
              return (
                <div key={m.key} className="rounded-2xl p-4 card-lift"
                  style={{ background: `linear-gradient(135deg,rgba(${m.glow},0.04),rgba(${m.glow},0.01))`, border: `1px solid rgba(${m.glow},0.15)` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `rgba(${m.glow},0.12)`, border: `1px solid rgba(${m.glow},0.25)` }}>
                      {m.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white/90 truncate">{m.label}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: hc, boxShadow: `0 0 5px ${hc}80` }}/>
                        <span className="text-[9px] font-semibold" style={{ color: hc }}>{hLabel}</span>
                        <span className="text-[9px] text-white/25 ml-auto">{formatBytes(m.bytes)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-black text-lg" style={{ color: m.color, fontFamily: 'Sora,sans-serif' }}>{count}</div>
                      <div className="text-[9px] text-white/25">registros</div>
                    </div>
                  </div>
                  {/* Mini bar */}
                  <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full" style={{ width: `${barW}%`, background: m.color, opacity: 0.7 }}/>
                  </div>
                  <button onClick={() => handleExportModule(m.key)} disabled={count === 0}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-25 hover:scale-[1.02]"
                    style={{ background: `rgba(${m.glow},0.08)`, border: `1px solid rgba(${m.glow},0.22)`, color: m.color }}>
                    <Download size={11}/> Exportar CSV
                    {count > 0 && <ChevronRight size={10}/>}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Storage breakdown table */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,245,212,0.12)' }}>
            <div className="px-4 py-3 flex items-center gap-2"
              style={{ background: 'rgba(0,245,212,0.06)', borderBottom: '1px solid rgba(0,245,212,0.1)' }}>
              <TrendingUp size={14} style={{ color: '#00f5d4' }}/>
              <span className="font-bold text-sm text-white">Detalle de Almacenamiento</span>
              <div className="ml-auto flex gap-2">
                <Button size="sm" onClick={handleExportAll}
                  className="gap-1.5 text-[10px] h-7"
                  style={{ background: 'rgba(0,245,212,0.1)', border: '1px solid rgba(0,245,212,0.3)', color: '#00f5d4' }}>
                  <FileJson size={10}/> JSON
                </Button>
                <Button size="sm" onClick={handleExportAllCSV}
                  className="gap-1.5 text-[10px] h-7"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                  <FileText size={10}/> CSVs
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'rgba(0,245,212,0.04)', borderBottom: '1px solid rgba(0,245,212,0.08)' }}>
                    {['Módulo', 'Registros', 'Tamaño', '% del total', 'Estado', 'CSV'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: 'rgba(0,245,212,0.55)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {storageStats.map(m => {
                    const count = (stateMap[m.key] as unknown[])?.length ?? m.count;
                    const health = count > 5 ? 'full' : count > 0 ? 'partial' : 'empty';
                    const hc = health === 'full' ? '#22c55e' : health === 'partial' ? '#f59e0b' : '#f43f5e';
                    const pct = totalBytes > 0 ? Math.round((m.bytes / totalBytes) * 100) : 0;
                    return (
                      <tr key={m.key} className="border-b hover:bg-white/[0.015] transition-colors"
                        style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span>{m.emoji}</span>
                            <span className="text-xs font-semibold text-white/75">{m.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="font-black text-sm" style={{ color: m.color }}>{count}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs text-white/45">{formatBytes(m.bytes)}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: m.color, opacity: 0.7 }}/>
                            </div>
                            <span className="text-[10px] text-white/35">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: `${hc}18`, color: hc, border: `1px solid ${hc}40` }}>
                            {health === 'full' ? '✓ Lleno' : health === 'partial' ? '◐ Parcial' : '○ Vacío'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <button onClick={() => handleExportModule(m.key)} disabled={count === 0}
                            className="text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-all disabled:opacity-20 hover:opacity-90"
                            style={{ background: `rgba(${m.glow},0.1)`, color: m.color, border: `1px solid rgba(${m.glow},0.25)` }}>
                            ↓ CSV
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 flex flex-wrap items-center gap-4 justify-between"
              style={{ background: 'rgba(0,245,212,0.03)', borderTop: '1px solid rgba(0,245,212,0.08)' }}>
              {[
                { label: 'Total registros', val: totalRecords, c: '#00f5d4' },
                { label: 'Espacio usado',   val: formatBytes(totalBytes), c: '#22c55e' },
                { label: 'Módulos activos', val: `${activeModules}/${MODULE_META.length}`, c: '#3b82f6' },
                { label: 'Último backup',   val: lastExport ? fmtDate(lastExport).split(',')[0] : '—', c: '#f59e0b' },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-[9px] uppercase tracking-wider text-white/25">{s.label}</div>
                  <div className="font-black text-sm" style={{ color: s.c, fontFamily: 'Sora,sans-serif' }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Packages summary */}
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg,#0f0020,#180030)', border: '1px solid rgba(139,92,246,0.18)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Package size={15} style={{ color: '#8b5cf6' }}/>
              <span className="font-bold text-sm text-white">¿Qué datos guarda CIVAC PRO?</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { emoji:'🐄', label:'Animales con fichas completas' },
                { emoji:'⚖️', label:'Historial de pesajes BT y manual' },
                { emoji:'🔁', label:'Eventos reproductivos' },
                { emoji:'🥛', label:'Registros de producción' },
                { emoji:'🌿', label:'Potreros y rotaciones' },
                { emoji:'💊', label:'Insumos y movimientos Kardex' },
                { emoji:'👤', label:'Personal y nómina' },
                { emoji:'🔔', label:'Alertas y notificaciones' },
                { emoji:'📍', label:'Ubicaciones GPS' },
                { emoji:'🧊', label:'Semen y embriones' },
                { emoji:'🐂', label:'Movimiento de lotes' },
                { emoji:'⚙️', label:'Configuración de finca' },
              ].map(i => (
                <div key={i.label} className="flex items-center gap-2 text-xs text-white/50 py-1">
                  <span className="text-base flex-shrink-0">{i.emoji}</span>{i.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
