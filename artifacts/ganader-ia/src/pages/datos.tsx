import { useState, useRef, useEffect } from "react";
import { useAppState } from "../lib/data";
import { useAuth, PLAN_LABEL, PLAN_COLOR, PLAN_ICON, type Account } from "../lib/auth";
import { syncToCloud, buildSyncPayload, getLastSyncInfo, getSyncQueue } from "../lib/sync";
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
  FolderOpen, CloudOff, Lock, TrendingUp, ChevronRight, Users,
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
  const [activeSection, setActiveSection] = useState<'overview'|'export'|'import'|'modulos'|'sesiones'|'planes'|'sync'>('overview');

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
    { id: 'overview', label: 'Estado',    emoji: '📊' },
    { id: 'export',   label: 'Exportar',  emoji: '⬇️' },
    { id: 'import',   label: 'Restaurar', emoji: '⬆️' },
    { id: 'modulos',  label: 'Módulos',   emoji: '🗂️' },
    { id: 'sesiones', label: 'Sesiones',  emoji: '🔐' },
    { id: 'planes',   label: 'Cuentas',   emoji: '👤' },
    { id: 'sync',     label: 'Sync ☁️',  emoji: '🌐' },
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

      {/* ── SECTION: SESIONES ───────────────────────────────────────────────── */}
      {activeSection === 'sesiones' && (
        <SesionesBD user={user} />
      )}

      {/* ── SECTION: CUENTAS & PLANES ───────────────────────────────────────── */}
      {activeSection === 'planes' && (
        <CuentasBD />
      )}

      {/* ── SECTION: SYNC CLOUD ─────────────────────────────────────────────── */}
      {activeSection === 'sync' && (
        <SyncBD user={user} stateMap={stateMap} />
      )}
    </div>
  );
}

/* ─── SESIONES component ────────────────────────────────────────────────── */
function SesionesBD({ user }: { user: ReturnType<typeof useAuth>['user'] }) {
  interface SessionEntry { id: string; email: string; nombre: string; role: string; plan: string; loginAt: string; device: string; }
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  useEffect(() => {
    try { setSessions(JSON.parse(localStorage.getItem('civac_session_history') ?? '[]')); } catch {}
  }, []);

  const logCurrentSession = () => {
    if (!user) return;
    const entry: SessionEntry = {
      id: crypto.randomUUID(),
      email: user.email,
      nombre: user.nombre,
      role: user.role,
      plan: user.plan ?? 'basico',
      loginAt: new Date().toISOString(),
      device: navigator.userAgent.slice(0, 80),
    };
    const hist = JSON.parse(localStorage.getItem('civac_session_history') ?? '[]') as SessionEntry[];
    hist.unshift(entry);
    if (hist.length > 50) hist.pop();
    localStorage.setItem('civac_session_history', JSON.stringify(hist));
    setSessions(hist);
  };

  const googleUsers: { id:string; nombre:string; email:string; plan:string }[] = (() => {
    try { return JSON.parse(localStorage.getItem('civac_google_users') ?? '[]'); } catch { return []; }
  })();

  return (
    <div className="space-y-4">
      {/* Active session */}
      <div className="rounded-2xl p-5" style={{ background:'linear-gradient(135deg,#001f0a,#002a10)', border:'1px solid rgba(34,197,94,0.22)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background:'#39ff7e', boxShadow:'0 0 8px rgba(57,255,126,0.9)' }}/>
            <span className="font-bold text-sm text-white">Sesión Activa Ahora</span>
          </div>
          <button onClick={logCurrentSession}
            className="text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all hover:opacity-80"
            style={{ background:'rgba(57,255,126,0.1)', color:'#39ff7e', border:'1px solid rgba(57,255,126,0.25)' }}>
            📋 Registrar sesión
          </button>
        </div>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background:'rgba(57,255,126,0.1)', border:'1px solid rgba(57,255,126,0.25)' }}>
              {user.avatar || '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-white text-sm">{user.nombre}</p>
              <p className="text-[10px] text-white/45">{user.email} · {user.role} · Plan {PLAN_LABEL[user.plan as keyof typeof PLAN_LABEL] ?? user.plan}</p>
              <p className="text-[9px] text-white/25 mt-0.5 truncate">{navigator.userAgent.slice(0,60)}…</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[10px] font-bold" style={{ color:'#39ff7e' }}>Online</div>
              <div className="text-[9px] text-white/25">{new Date().toLocaleTimeString('es-CO')}</div>
            </div>
          </div>
        ) : <p className="text-white/30 text-sm">Sin sesión activa</p>}
      </div>

      {/* Google users registered */}
      {googleUsers.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background:'linear-gradient(135deg,#001428,#001e3c)', border:'1px solid rgba(0,200,255,0.18)' }}>
          <div className="flex items-center gap-2 mb-3">
            <svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span className="font-bold text-sm text-white">Usuarios registrados con Google</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background:'rgba(0,200,255,0.12)', color:'#00c8ff' }}>{googleUsers.length}</span>
          </div>
          <div className="space-y-2">
            {googleUsers.map(u => (
              <div key={u.id} className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background:'rgba(0,200,255,0.1)', border:'1px solid rgba(0,200,255,0.2)' }}>🙂</div>
                <span className="text-white/70 flex-1 truncate">{u.nombre}</span>
                <span className="text-white/35 truncate">{u.email}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ color: PLAN_COLOR[u.plan as keyof typeof PLAN_COLOR] ?? '#94a3b8', background:`${PLAN_COLOR[u.plan as keyof typeof PLAN_COLOR] ?? '#94a3b8'}18` }}>
                  {PLAN_ICON[u.plan as keyof typeof PLAN_ICON] ?? '🔷'} {PLAN_LABEL[u.plan as keyof typeof PLAN_LABEL] ?? u.plan}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session history */}
      <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(139,92,246,0.15)' }}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ background:'linear-gradient(90deg,rgba(139,92,246,0.08),rgba(139,92,246,0.03))', borderBottom:'1px solid rgba(139,92,246,0.1)' }}>
          <div className="flex items-center gap-2"><Lock size={14} style={{ color:'#8b5cf6' }}/><span className="font-bold text-sm text-white">Historial de Sesiones</span></div>
          <span className="text-[10px] text-white/30">{sessions.length} registros</span>
        </div>
        {sessions.length === 0 ? (
          <div className="px-5 py-8 text-center"><p className="text-white/25 text-sm">No hay historial de sesiones</p><p className="text-[10px] text-white/15 mt-1">Haz clic en "Registrar sesión" para guardar la sesión actual</p></div>
        ) : (
          <div className="divide-y" style={{ '--tw-divide-opacity':'1' } as React.CSSProperties}>
            {sessions.slice(0,20).map(s => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/2 transition-colors">
                <div className="text-lg flex-shrink-0">{s.role === 'admin' ? '👑' : s.role === 'vet' ? '🩺' : s.role === 'sales' ? '💼' : s.role === 'field' ? '🌿' : '👤'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/80 truncate">{s.nombre}</p>
                  <p className="text-[9px] text-white/30">{s.email} · {s.role}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-white/50">{new Date(s.loginAt).toLocaleDateString('es-CO')}</p>
                  <p className="text-[9px] text-white/25">{new Date(s.loginAt).toLocaleTimeString('es-CO')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── CUENTAS & PLANES component ────────────────────────────────────────── */
function CuentasBD() {
  const { accounts } = useAuth();
  const [googleUsers] = useState<Array<{id:string;nombre:string;email:string;plan:string;cargo?:string}>>(() => {
    try { return JSON.parse(localStorage.getItem('civac_google_users') ?? '[]'); } catch { return []; }
  });

  const allAccounts: Array<Account & { isGoogle?: boolean }> = [
    ...accounts,
    ...googleUsers.map(u => ({
      ...u,
      role: 'viewer' as const,
      plan: (u.plan ?? 'basico') as Account['plan'],
      password: '',
      avatar: '🙂',
      finca: 'Google',
      isGoogle: true,
      cargo: u.cargo ?? 'Usuario Google',
      gradient: 'from-[#4a148c] to-[#6a1b9a]',
      permisos: ['inventario','produccion','alertas'],
    })),
  ];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon:'👤', label:'Cuentas totales',    val: String(allAccounts.length),           c:'#00f5d4' },
          { icon:'🌐', label:'Usuarios Google',     val: String(googleUsers.length),           c:'#4285f4' },
          { icon:'💎', label:'Plan más alto',       val: accounts.some(a=>a.plan==='platino') ? 'Platino' : accounts.some(a=>a.plan==='premium') ? 'Premium' : 'PRO', c:'#fbbf24' },
          { icon:'✅', label:'Cuentas activas',     val: String(accounts.filter(a=>a.plan!=='basico').length), c:'#39ff7e' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-4" style={{ background:'linear-gradient(135deg,#0a0015,#120020)', border:'1px solid rgba(139,92,246,0.18)' }}>
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5 text-white/40">{k.label}</div>
            <div className="text-xl font-black" style={{ color:k.c, fontFamily:'Sora,sans-serif' }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Accounts table */}
      <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(139,92,246,0.15)' }}>
        <div className="px-5 py-3" style={{ background:'linear-gradient(90deg,rgba(139,92,246,0.1),rgba(139,92,246,0.03))', borderBottom:'1px solid rgba(139,92,246,0.1)' }}>
          <div className="flex items-center gap-2"><Users size={14} style={{ color:'#8b5cf6' }}/><span className="font-bold text-sm text-white">Directorio de Cuentas CIVAC</span></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background:'rgba(139,92,246,0.05)', borderBottom:'1px solid rgba(139,92,246,0.1)' }}>
                {['Avatar','Nombre','Email','Rol','Plan','Finca/Empresa'].map(h=>(
                  <th key={h} className="text-left px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allAccounts.map((a,i) => (
                <tr key={a.id ?? i} className="border-b hover:bg-white/2 transition-colors" style={{ borderColor:'rgba(139,92,246,0.06)' }}>
                  <td className="px-4 py-2.5 text-lg">{a.avatar || '🙂'}</td>
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-white/85">{a.nombre}</p>
                    <p className="text-[9px] text-white/35">{a.cargo}</p>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-white/45 text-[10px]">{a.email}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background:`${PLAN_COLOR[a.plan as keyof typeof PLAN_COLOR] ?? '#94a3b8'}15`, color: PLAN_COLOR[a.plan as keyof typeof PLAN_COLOR] ?? '#94a3b8', border:`1px solid ${PLAN_COLOR[a.plan as keyof typeof PLAN_COLOR] ?? '#94a3b8'}30` }}>
                      {a.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[9px] font-bold">
                      {PLAN_ICON[a.plan as keyof typeof PLAN_ICON] ?? '🔷'} {PLAN_LABEL[a.plan as keyof typeof PLAN_LABEL] ?? a.plan}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-white/35 text-[10px]">{a.finca}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── SYNC CLOUD component ──────────────────────────────────────────────── */
function SyncBD({ user, stateMap }: { user: ReturnType<typeof useAuth>['user']; stateMap: Record<string, unknown[]> }) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ ok:boolean; message:string } | null>(null);
  const [syncInfo, setSyncInfo] = useState(() => getLastSyncInfo());
  const [queue] = useState(() => getSyncQueue());

  const fmtDt = (iso: string | null) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('es-CO', { dateStyle:'medium', timeStyle:'short' }); } catch { return iso; }
  };

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true); setSyncResult(null);
    const payload = buildSyncPayload(user.id, user.plan ?? 'basico');
    // Inject some real data
    payload.data.animals = stateMap.animals ?? [];
    payload.data.pesajes  = stateMap.pesajes ?? [];
    payload.data.alertas  = stateMap.alertas ?? [];
    try {
      const result = await syncToCloud(payload);
      setSyncResult(result);
      setSyncInfo(getLastSyncInfo());
    } finally { setSyncing(false); }
  };

  const online = navigator.onLine;

  return (
    <div className="space-y-4">
      {/* Sync status banner */}
      <div className="rounded-2xl p-5" style={{ background:`linear-gradient(135deg,${online?'#001428':'#1a0a00'},${online?'#001e3c':'#2a1200'})`, border:`1px solid rgba(${online?'0,200,255':'245,158,11'},0.22)` }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{online ? '☁️' : '📡'}</div>
            <div>
              <p className="font-black text-white text-base">{online ? 'Online — Sync disponible' : 'Offline — Cola local activa'}</p>
              <p className="text-sm mt-0.5" style={{ color:`rgba(${online?'0,200,255':'245,158,11'},0.65)` }}>
                {online ? 'Puedes sincronizar con el servidor padre CIVAC' : 'Los cambios se enviarán al reconectarse'}
              </p>
            </div>
          </div>
          <button onClick={handleSync} disabled={syncing || !online}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm transition-all disabled:opacity-40"
            style={{ background:online?'linear-gradient(135deg,#00c8ff,#0070cc)':'rgba(255,255,255,0.05)', color:'white', boxShadow:online?'0 0 20px rgba(0,200,255,0.3)':undefined }}>
            <RefreshCw size={14} className={syncing?'animate-spin':''}/> {syncing ? 'Sincronizando…' : 'Sincronizar ahora'}
          </button>
        </div>
      </div>

      {/* Sync result */}
      {syncResult && (
        <div className="rounded-2xl px-4 py-3 flex items-center gap-2 text-sm font-medium"
          style={{ background:syncResult.ok?'rgba(34,197,94,0.08)':'rgba(245,158,11,0.08)', border:`1px solid rgba(${syncResult.ok?'34,197,94':'245,158,11'},0.25)`, color:syncResult.ok?'#39ff7e':'#fbbf24' }}>
          {syncResult.ok ? <CheckCircle2 size={14}/> : <WifiOff size={14}/>} {syncResult.message}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon:'🕐', label:'Último sync',      val: fmtDt(syncInfo.lastSync).split(',')[0] ?? '—',         c:'#00c8ff' },
          { icon:'📱', label:'Device ID',         val: syncInfo.deviceId.slice(0,12)+'…',                     c:'#00f5d4' },
          { icon:'📋', label:'En cola',           val: String(syncInfo.pendingChanges + queue.length),         c: (syncInfo.pendingChanges+queue.length)>0?'#f59e0b':'#39ff7e' },
          { icon:'🌐', label:'Estado red',        val: online ? 'Online' : 'Offline',                         c: online?'#39ff7e':'#f43f5e' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-4" style={{ background:'linear-gradient(135deg,#001428,#001e3c)', border:'1px solid rgba(0,200,255,0.12)' }}>
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5 text-white/40">{k.label}</div>
            <div className="text-lg font-black truncate" style={{ color:k.c, fontFamily:'Sora,sans-serif' }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Queue detail */}
      {queue.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background:'linear-gradient(135deg,#1a0800,#2a1200)', border:'1px solid rgba(245,158,11,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} style={{ color:'#f59e0b' }}/><span className="font-bold text-sm text-white">Cola pendiente de sync</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background:'rgba(245,158,11,0.15)', color:'#fbbf24' }}>{queue.length}</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {queue.slice(0,10).map((q,i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span className="text-white/40 font-mono">cambio</span>
                <span className="text-white/25">·</span>
                <span className="text-white/30">{q.slice(0,12)}…</span>
                <span className="ml-auto text-white/20">pendiente #{i+1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync schema info */}
      <div className="rounded-2xl p-5" style={{ background:'linear-gradient(135deg,#001428,#001e3c)', border:'1px solid rgba(0,200,255,0.12)' }}>
        <div className="flex items-center gap-2 mb-3"><Database size={14} style={{ color:'#00c8ff' }}/><span className="font-bold text-sm text-white">Esquema de Sync — CIVAC v1.0</span></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['accounts','animals','pesajes','sesiones','alertas','payments','contacts_crm','sales_crm'].map(s => (
            <div key={s} className="flex items-center gap-1.5 text-[10px]">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background:'#00c8ff' }}/>
              <span className="text-white/45 font-mono">{s}</span>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-white/20 mt-3">Servidor: {import.meta.env.VITE_SYNC_SERVER_URL ?? 'https://api.civac.co/sync/v1'} · Schema: civac-sync-v1</p>
      </div>
    </div>
  );
}
