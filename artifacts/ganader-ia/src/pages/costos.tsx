import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "../lib/data";
import { useMemo } from "react";

const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const PRECIO_LITRO = 1250;
const COSTO_LITRO_META = 800;

export default function Costos() {
  const { animals, personal } = useAppState();

  const stats = useMemo(() => {
    const litrosDia = animals.reduce((s, a) => s + (a.litrosDia || 0), 0);
    const litrosMes = Math.round(litrosDia * 30);
    const ingresosLeche = litrosMes * PRECIO_LITRO;
    const ingresosGanado = 12500000;
    const ingresosEmbriones = 3200000;
    const totalIngresos = ingresosLeche + ingresosGanado + ingresosEmbriones;

    const nominaBase = personal.reduce((s, p) => s + (p.salario || 0), 0);
    const nominaTotal = Math.round(nominaBase * 1.52);
    const alimentacion = 22400000;
    const medicamentos = 3800000;
    const mantenimiento = 2100000;
    const totalEgresos = alimentacion + nominaTotal + medicamentos + mantenimiento;

    const utilidad = totalIngresos - totalEgresos;
    const margenPct = totalIngresos > 0 ? ((utilidad / totalIngresos) * 100).toFixed(1) : '0';
    const costoLitro = litrosMes > 0 ? Math.round(totalEgresos / litrosMes) : 820;
    const margenLitro = PRECIO_LITRO - costoLitro;
    const margenLitroPct = ((margenLitro / PRECIO_LITRO) * 100).toFixed(1);

    const costoLitroItems = [
      { concepto: 'Alimentación', val: Math.round(alimentacion / litrosMes || 0), pct: Math.round(alimentacion / totalEgresos * 100), color: '#22c55e' },
      { concepto: 'Nómina', val: Math.round(nominaTotal / litrosMes || 0), pct: Math.round(nominaTotal / totalEgresos * 100), color: '#3b82f6' },
      { concepto: 'Medicamentos', val: Math.round(medicamentos / litrosMes || 0), pct: Math.round(medicamentos / totalEgresos * 100), color: '#f97316' },
      { concepto: 'Otros', val: Math.round(mantenimiento / litrosMes || 0), pct: Math.round(mantenimiento / totalEgresos * 100), color: '#eab308' },
    ];

    return {
      litrosMes, ingresosLeche, ingresosGanado, ingresosEmbriones,
      totalIngresos, nominaTotal, alimentacion, medicamentos, mantenimiento,
      totalEgresos, utilidad, margenPct, costoLitro, margenLitro, margenLitroPct,
      costoLitroItems,
    };
  }, [animals, personal]);

  const ingresos = [
    { concepto: `Venta leche ${stats.litrosMes.toLocaleString('es-CO')}L × $${PRECIO_LITRO.toLocaleString('es-CO')}`, val: stats.ingresosLeche },
    { concepto: 'Venta ganado (4 cabezas)', val: stats.ingresosGanado },
    { concepto: 'Venta embriones (3 lotes)', val: stats.ingresosEmbriones },
  ];

  const egresos = [
    { concepto: 'Alimentación / concentrados', val: stats.alimentacion },
    { concepto: `Nómina y prestaciones (${personal.length} empleados)`, val: stats.nominaTotal },
    { concepto: 'Medicamentos y sanidad', val: stats.medicamentos },
    { concepto: 'Mantenimiento y servicios', val: stats.mantenimiento },
  ];

  const costoLitroMeta = stats.costoLitro <= COSTO_LITRO_META;

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h1 className="text-2xl font-bold">💰 Costos y Estado de Resultados</h1>
        <p className="text-muted-foreground text-sm">Rentabilidad y análisis financiero mensual</p>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label:'INGRESOS', val: fmt(stats.totalIngresos), sub:'total mes', dot:'bg-green-400' },
          { label:'EGRESOS', val: fmt(stats.totalEgresos), sub:'total mes', dot:'bg-red-400' },
          { label:'UTILIDAD', val: fmt(stats.utilidad), sub:`${stats.margenPct}% margen`, dot: Number(stats.margenPct) > 30 ? 'bg-green-400' : 'bg-orange-400' },
          { label:'COSTO/LITRO', val: `$${stats.costoLitro.toLocaleString('es-CO')}`, sub: costoLitroMeta ? `Meta $${COSTO_LITRO_META} ✓` : `Meta <$${COSTO_LITRO_META}`, dot: costoLitroMeta ? 'bg-green-400' : 'bg-orange-400' },
          { label:'MARGEN/LITRO', val: `$${stats.margenLitro.toLocaleString('es-CO')}`, sub: `${stats.margenLitroPct}%`, dot: stats.margenLitro > 400 ? 'bg-green-400' : 'bg-orange-400' },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{k.label}</span>
              <span className={`w-2 h-2 rounded-full ${k.dot}`} />
            </div>
            <div className="text-lg font-bold text-foreground">{k.val}</div>
            <div className="text-[10px] text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* P&G Detallado */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="font-semibold text-sm">📊 P&G Detallado</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs"><Download size={12} /> CSV</Button>
              <Button size="sm" className="h-8 gap-1.5 text-xs"><Plus size={12} /> Registro</Button>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <div className="text-xs font-bold text-green-400 uppercase mb-2">INGRESOS</div>
              <div className="space-y-1.5">
                {ingresos.map(r => (
                  <div key={r.concepto} className="flex justify-between items-center text-sm py-1 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground text-xs">{r.concepto}</span>
                    <span className="font-medium text-foreground">{fmt(r.val)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm py-1.5 border-t border-border">
                  <span className="font-bold text-foreground">Total ingresos</span>
                  <span className="font-bold text-green-400 text-base">{fmt(stats.totalIngresos)}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-red-400 uppercase mb-2">EGRESOS</div>
              <div className="space-y-1.5">
                {egresos.map(r => (
                  <div key={r.concepto} className="flex justify-between items-center text-sm py-1 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground text-xs">{r.concepto}</span>
                    <span className="font-medium text-red-400">({fmt(r.val)})</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm py-1.5 border-t border-border">
                  <span className="font-bold text-foreground">Total egresos</span>
                  <span className="font-bold text-red-400 text-base">({fmt(stats.totalEgresos)})</span>
                </div>
              </div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex justify-between items-center">
              <span className="font-bold text-foreground">UTILIDAD NETA</span>
              <span className="font-bold text-green-400 text-xl">{fmt(stats.utilidad)}</span>
            </div>
          </div>
        </div>

        {/* Right: Costo por litro + Margen */}
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="font-semibold text-sm mb-4">Costo por litro producido</div>
            <div className="space-y-3">
              {stats.costoLitroItems.map(c => (
                <div key={c.concepto}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{c.concepto}</span>
                    <span className="font-semibold" style={{color: c.color}}>${c.val}/L ({c.pct}%)</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full">
                    <div className="h-2 rounded-full transition-all duration-500" style={{width:`${c.pct}%`, background: c.color}} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex justify-between text-sm">
              <span className="text-muted-foreground">Total costo</span>
              <span className="font-bold text-foreground">${stats.costoLitro.toLocaleString('es-CO')}/L <span className={`font-normal text-xs ${costoLitroMeta ? 'text-green-400' : 'text-orange-400'}`}>· Meta $800/L</span></span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="font-semibold text-sm mb-4">Margen neto por litro</div>
            <div className="grid grid-cols-5 gap-2 items-center text-center mb-4">
              <div className="bg-green-500/10 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Precio</div>
                <div className="text-xl font-bold text-green-400">${PRECIO_LITRO.toLocaleString('es-CO')}</div>
              </div>
              <div className="text-2xl text-muted-foreground font-light">−</div>
              <div className="bg-red-500/10 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Costo</div>
                <div className="text-xl font-bold text-red-400">${stats.costoLitro.toLocaleString('es-CO')}</div>
              </div>
              <div className="text-2xl text-muted-foreground font-light">=</div>
              <div className="bg-blue-500/10 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Margen</div>
                <div className="text-xl font-bold text-blue-400">${stats.margenLitro.toLocaleString('es-CO')}</div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-xs text-center text-muted-foreground">
              {stats.litrosMes.toLocaleString('es-CO')} L × ${stats.margenLitro.toLocaleString('es-CO')} margen = <strong className="text-foreground">{fmt(stats.litrosMes * stats.margenLitro)} utilidad leche</strong>
            </div>
            <div className="mt-2 text-center text-sm font-bold text-green-400">{stats.margenLitroPct}% de margen neto</div>
          </div>
        </div>
      </div>
    </div>
  );
}
