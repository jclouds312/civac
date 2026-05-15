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
  Layers, TrendingUp, Zap, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
  } catch { return iso; }
}

export default function Datos() {
  const state = useAppState();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ ok: boolean; msg: string; modules?: string[] } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(k => k + 1);

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

  const storageStats = getStorageStats();
  const totalBytes   = getTotalStorageBytes();
  const totalRecords = getTotalRecords(stateMap);
  const activeModules = storageStats.filter(s => s.hasData).length;
  const lastExport   = getLastExportTime();
  const exportHistory = getExportHistory();

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
        msg: `Backup restaurado correctamente. Se recargará la página para aplicar los cambios.`,
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

  return (
    <div className="space-y-5 pb-8">

      {/* ── BANNER ─────────────────────────────────────────────────────────── */}
      <div className="rounded-xl p-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#060026 0%,#0e0040 40%,#060026 100%)",
          border: "1px solid rgba(79,70,229,0.45)",
          boxShadow: "0 0 60px rgba(79,70,229,0.1), inset 0 1px 0 rgba(79,70,229,0.1)",
        }}>
        <div className="absolute right-0 top-0 bottom-0 w-72 pointer-events-none opacity-10"
          style={{ background: "radial-gradient(ellipse at right, #818cf8, transparent 70%)" }} />
        <div className="absolute left-1/4 bottom-0 w-48 h-48 pointer-events-none opacity-5"
          style={{ background: "radial-gradient(circle, #00f5d4, transparent 70%)" }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(79,70,229,0.15)", border: "1px solid rgba(79,70,229,0.5)", boxShadow: "0 0 24px rgba(79,70,229,0.25)" }}>
              <Database size={28} style={{ color: "#818cf8" }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: "Sora,sans-serif" }}>
                  Data Warehouse
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: "rgba(79,70,229,0.2)", color: "#818cf8", border: "1px solid rgba(79,70,229,0.4)" }}>
                  CIVAC PRO
                </span>
              </div>
              <p className="text-sm" style={{ color: "rgba(129,140,248,0.7)" }}>
                Almacenamiento offline · Exportar · Importar · Backup automático
              </p>
              <div className="flex gap-3 mt-1.5 flex-wrap">
                <span className="text-[10px] text-white/30 flex items-center gap-1">
                  <Shield size={9} style={{ color: "#39ff7e" }} /> Datos protegidos offline
                </span>
                <span className="text-[10px] text-white/30 flex items-center gap-1">
                  <Zap size={9} style={{ color: "#fbbf24" }} /> Auto-guardado en tiempo real
                </span>
                <span className="text-[10px] text-white/30 flex items-center gap-1">
                  <RefreshCw size={9} style={{ color: "#00c8ff" }} /> Sync con PostgreSQL
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleExportAll}
              className="h-9 gap-1.5 text-sm font-bold"
              style={{ background: "rgba(79,70,229,0.2)", border: "1px solid rgba(79,70,229,0.5)", color: "#818cf8" }}>
              <FileJson size={14} /> Exportar JSON
            </Button>
            <Button onClick={handleExportAllCSV}
              className="h-9 gap-1.5 text-sm font-bold"
              style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.35)", color: "#00f5d4" }}>
              <FileText size={14} /> Exportar CSVs
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Layers size={18} />,    label: "REGISTROS TOTALES",  val: String(totalRecords),             sub: "en todos los módulos", c: "#39ff7e", glow: "57,255,126" },
          { icon: <HardDrive size={18} />, label: "ALMACENAMIENTO",     val: formatBytes(totalBytes),          sub: "localStorage + IndexedDB", c: "#818cf8", glow: "129,140,248" },
          { icon: <Package size={18} />,   label: "MÓDULOS ACTIVOS",    val: `${activeModules}/${MODULE_META.length}`, sub: "con datos registrados", c: "#00c8ff", glow: "0,200,255" },
          { icon: <Clock size={18} />,     label: "ÚLTIMO BACKUP",      val: lastExport ? fmtDate(lastExport).split(',')[0] : "—", sub: lastExport ? fmtDate(lastExport).split(',')[1] || "—" : "Sin backup aún", c: "#fbbf24", glow: "251,191,36" },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#060026,#0b0035)", border: `1px solid rgba(${k.glow},0.2)` }}>
            <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none rounded-full"
              style={{ background: `rgb(${k.glow})`, opacity: 0.1, filter: "blur(16px)", transform: "translate(30%,-30%)" }} />
            <div className="mb-2" style={{ color: `rgba(${k.glow},0.7)` }}>{k.icon}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: `rgba(${k.glow},0.55)` }}>{k.label}</div>
            <div className="text-xl font-black text-white truncate" style={{ fontFamily: "Sora,sans-serif", color: k.c }}>{k.val}</div>
            <div className="text-[9px] text-white/30 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── MODULE HEALTH GRID ─────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(79,70,229,0.2)" }}>
        <div className="px-4 py-3 flex items-center gap-2"
          style={{ background: "rgba(79,70,229,0.08)", borderBottom: "1px solid rgba(79,70,229,0.15)" }}>
          <TrendingUp size={14} style={{ color: "#818cf8" }} />
          <span className="font-bold text-sm text-white">Estado por Módulo</span>
          <span className="ml-auto text-[10px] text-white/30">
            {activeModules} activos · {MODULE_META.length - activeModules} vacíos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "rgba(255,255,255,0.04)" }}>
          {storageStats.map(m => {
            const count = (stateMap[m.key] as unknown[])?.length ?? m.count;
            const health = count > 5 ? "full" : count > 0 ? "partial" : "empty";
            const healthColor = health === "full" ? "#39ff7e" : health === "partial" ? "#fbbf24" : "#f87171";
            const healthLabel = health === "full" ? "Con datos" : health === "partial" ? "Datos iniciales" : "Vacío";
            return (
              <div key={m.key} className="p-4 flex items-center gap-3"
                style={{ background: "linear-gradient(135deg,#060026,#090030)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `rgba(${m.glow},0.1)`, border: `1px solid rgba(${m.glow},0.25)` }}>
                  {m.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white/80 truncate">{m.label}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: healthColor }} />
                    <span className="text-[9px]" style={{ color: healthColor }}>{healthLabel}</span>
                    <span className="text-[9px] text-white/25 ml-1">{formatBytes(m.bytes)}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-black text-lg" style={{ color: m.color, fontFamily: "Sora,sans-serif" }}>
                    {count}
                  </div>
                  <div className="text-[9px] text-white/25">registros</div>
                  <button
                    onClick={() => handleExportModule(m.key)}
                    disabled={count === 0}
                    className="mt-1 text-[9px] px-2 py-0.5 rounded font-semibold transition-all disabled:opacity-20"
                    style={{ background: `rgba(${m.glow},0.1)`, color: m.color, border: `1px solid rgba(${m.glow},0.25)` }}
                    title="Exportar CSV">
                    CSV ↓
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── EXPORT & IMPORT SECTION ────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Export panel */}
        <div className="rounded-xl p-5 space-y-4"
          style={{ background: "linear-gradient(135deg,#060026,#090030)", border: "1px solid rgba(0,245,212,0.2)" }}>
          <div className="flex items-center gap-2">
            <Archive size={16} style={{ color: "#00f5d4" }} />
            <span className="font-bold text-white">Exportar Datos</span>
          </div>

          <div className="space-y-2">
            <button onClick={handleExportAll}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:scale-[1.01]"
              style={{ background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.3)" }}>
              <FileJson size={20} style={{ color: "#818cf8", flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">Backup Completo (JSON)</div>
                <div className="text-[10px] text-white/35">
                  Todos los módulos · {totalRecords} registros · {formatBytes(totalBytes)}
                </div>
              </div>
              <Download size={14} style={{ color: "#818cf8", flexShrink: 0 }} />
            </button>

            <button onClick={handleExportAllCSV}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:scale-[1.01]"
              style={{ background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.2)" }}>
              <FileText size={20} style={{ color: "#00f5d4", flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">Exportar como CSVs</div>
                <div className="text-[10px] text-white/35">
                  Un archivo CSV por módulo · compatible con Excel
                </div>
              </div>
              <Download size={14} style={{ color: "#00f5d4", flexShrink: 0 }} />
            </button>
          </div>

          {/* Export history */}
          {exportHistory.length > 0 && (
            <div className="pt-3 border-t border-white/5">
              <div className="text-[9px] uppercase tracking-wider text-white/25 mb-2">Historial de exports</div>
              <div className="space-y-1">
                {exportHistory.slice(0, 4).map((ts, i) => (
                  <div key={ts} className="flex items-center gap-2 text-[10px] text-white/35">
                    <Clock size={9} style={{ color: "#818cf8", flexShrink: 0 }} />
                    <span>{fmtDate(ts)}</span>
                    {i === 0 && <span className="px-1 py-0.5 rounded text-[8px] font-bold"
                      style={{ background: "rgba(79,70,229,0.2)", color: "#818cf8" }}>reciente</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Import panel */}
        <div className="rounded-xl p-5 space-y-4"
          style={{ background: "linear-gradient(135deg,#060026,#090030)", border: "1px solid rgba(251,191,36,0.2)" }}>
          <div className="flex items-center gap-2">
            <Upload size={16} style={{ color: "#fbbf24" }} />
            <span className="font-bold text-white">Restaurar Backup</span>
          </div>

          <div className="rounded-xl p-4 text-center border-2 border-dashed cursor-pointer transition-all hover:bg-white/[0.02]"
            style={{ borderColor: "rgba(251,191,36,0.25)" }}
            onClick={() => fileRef.current?.click()}>
            <Upload size={24} className="mx-auto mb-2" style={{ color: "rgba(251,191,36,0.4)" }} />
            <div className="text-sm font-semibold text-white/60">Seleccionar archivo .json</div>
            <div className="text-[10px] text-white/25 mt-1">
              Backup generado por CIVAC PRO
            </div>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>

          {importing && (
            <div className="rounded-lg p-3 flex items-center gap-2"
              style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
              <RefreshCw size={13} className="animate-spin" style={{ color: "#fbbf24" }} />
              <span className="text-xs text-white/60">Procesando backup…</span>
            </div>
          )}

          {importResult && (
            <div className="rounded-lg p-3 space-y-2"
              style={{
                background: importResult.ok ? "rgba(57,255,126,0.07)" : "rgba(248,113,113,0.07)",
                border: `1px solid ${importResult.ok ? "rgba(57,255,126,0.3)" : "rgba(248,113,113,0.3)"}`,
              }}>
              <div className="flex items-center gap-2">
                {importResult.ok
                  ? <CheckCircle2 size={14} style={{ color: "#39ff7e" }} />
                  : <AlertTriangle size={14} style={{ color: "#f87171" }} />}
                <span className="text-xs font-semibold" style={{ color: importResult.ok ? "#39ff7e" : "#f87171" }}>
                  {importResult.ok ? "¡Backup restaurado!" : "Error al importar"}
                </span>
              </div>
              <p className="text-[10px] text-white/50">{importResult.msg}</p>
              {importResult.modules && (
                <div className="flex gap-1 flex-wrap">
                  {importResult.modules.map(m => (
                    <span key={m} className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                      style={{ background: "rgba(57,255,126,0.12)", color: "#39ff7e" }}>{m}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-[10px] text-white/30 space-y-1">
              <div className="flex items-center gap-1"><Shield size={9} className="text-green-400" /> Los datos actuales se sobreescribirán</div>
              <div className="flex items-center gap-1"><Shield size={9} className="text-green-400" /> Sólo se aceptan backups CIVAC PRO</div>
              <div className="flex items-center gap-1"><Shield size={9} className="text-green-400" /> La página se recargará automáticamente</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STORAGE BREAKDOWN TABLE ────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(79,70,229,0.15)" }}>
        <div className="px-4 py-3 flex items-center gap-2"
          style={{ background: "rgba(79,70,229,0.05)", borderBottom: "1px solid rgba(79,70,229,0.12)" }}>
          <HardDrive size={14} style={{ color: "#818cf8" }} />
          <span className="font-bold text-sm text-white">Detalle de Almacenamiento</span>
          <button onClick={refresh} className="ml-auto p-1 rounded hover:bg-white/5 transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }} title="Actualizar">
            <RefreshCw size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(79,70,229,0.04)", borderBottom: "1px solid rgba(79,70,229,0.1)" }}>
                {["MÓDULO", "REGISTROS", "TAMAÑO", "ESTADO", "ACCIÓN"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "rgba(129,140,248,0.6)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {storageStats.map(m => {
                const count = (stateMap[m.key] as unknown[])?.length ?? m.count;
                const health = count > 5 ? "full" : count > 0 ? "partial" : "empty";
                const healthColor = health === "full" ? "#39ff7e" : health === "partial" ? "#fbbf24" : "#f87171";
                const bar = Math.min(100, (m.bytes / Math.max(1, totalBytes)) * 100 * MODULE_META.length);
                return (
                  <tr key={m.key} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span>{m.emoji}</span>
                        <span className="text-xs font-semibold text-white/70">{m.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-black text-sm" style={{ color: m.color }}>{count}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div>
                        <div className="text-xs text-white/50">{formatBytes(m.bytes)}</div>
                        <div className="w-20 h-1 rounded-full mt-1" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full" style={{ width: `${bar}%`, background: m.color, opacity: 0.6 }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: `${healthColor}18`, color: healthColor, border: `1px solid ${healthColor}40` }}>
                        {health === "full" ? "✓ Con datos" : health === "partial" ? "◐ Inicial" : "○ Vacío"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleExportModule(m.key)}
                        disabled={count === 0}
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
        {/* Footer summary */}
        <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-2"
          style={{ background: "rgba(79,70,229,0.03)", borderTop: "1px solid rgba(79,70,229,0.1)" }}>
          <div className="flex gap-4">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/25">Total registros</div>
              <div className="font-black text-sm" style={{ color: "#818cf8" }}>{totalRecords}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/25">Espacio usado</div>
              <div className="font-black text-sm" style={{ color: "#00f5d4" }}>{formatBytes(totalBytes)}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/25">Módulos activos</div>
              <div className="font-black text-sm" style={{ color: "#39ff7e" }}>{activeModules}/{MODULE_META.length}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleExportAll}
              className="gap-1.5 text-xs h-7"
              style={{ background: "rgba(79,70,229,0.15)", border: "1px solid rgba(79,70,229,0.4)", color: "#818cf8" }}>
              <FileJson size={11} /> Backup JSON
            </Button>
            <Button size="sm" onClick={handleExportAllCSV}
              className="gap-1.5 text-xs h-7"
              style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.3)", color: "#00f5d4" }}>
              <FileText size={11} /> Todos CSV
            </Button>
          </div>
        </div>
      </div>

      {/* ── PWA OFFLINE STATUS ─────────────────────────────────────────────── */}
      <div className="rounded-xl p-4 flex items-start gap-4"
        style={{ background: "rgba(57,255,126,0.04)", border: "1px solid rgba(57,255,126,0.15)" }}>
        <CheckCircle2 size={20} style={{ color: "#39ff7e", flexShrink: 0 }} className="mt-0.5" />
        <div className="flex-1">
          <div className="font-bold text-white text-sm">Datos 100% offline — PWA instalable</div>
          <p className="text-[11px] text-white/40 mt-1">
            Todos los registros viven en <code className="text-[#00f5d4] text-[10px]">localStorage</code> bajo el prefijo{" "}
            <code className="text-[#00f5d4] text-[10px]">civac_*</code>. Los cambios se guardan automáticamente al instante.
            La sincronización con PostgreSQL ocurre en segundo plano cuando hay conexión. El service worker mantiene
            la app disponible sin internet.
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[9px] uppercase tracking-wider text-white/25">v3.0 · SW v4</div>
          <div className="font-bold text-xs" style={{ color: "#39ff7e" }}>Offline Ready</div>
        </div>
      </div>
    </div>
  );
}
