import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const ingresos = [
  { concepto: 'Venta leche 56,040L × $1,250', val: 70050000 },
  { concepto: 'Venta ganado (4 cabezas)', val: 12500000 },
  { concepto: 'Venta embriones (3 lotes)', val: 3200000 },
];
const egresos = [
  { concepto: 'Alimentación / concentrados', val: 22400000 },
  { concepto: 'Nómina y prestaciones', val: 17200000 },
  { concepto: 'Medicamentos y sanidad', val: 3800000 },
  { concepto: 'Mantenimiento y servicios', val: 2100000 },
];
const totalIngresos = ingresos.reduce((s, r) => s + r.val, 0);
const totalEgresos = egresos.reduce((s, r) => s + r.val, 0);
const utilidad = totalIngresos - totalEgresos;

const costoLitro = [
  { concepto: 'Alimentación', pct: 49, valor: 400, color: '#22c55e' },
  { concepto: 'Nómina', pct: 31, valor: 254, color: '#3b82f6' },
  { concepto: 'Medicamentos', pct: 8, valor: 68, color: '#f97316' },
  { concepto: 'Otros', pct: 12, valor: 98, color: '#eab308' },
];

export default function Costos() {
  return (
    <div className="space-y-5 pb-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold">💰 Costos y Estado de Resultados</h1>
        <p className="text-muted-foreground text-sm">Rentabilidad y análisis financiero mensual</p>
      </div>

      {/* 5 KPI Cards (bordered style with color dot) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label:'INGRESOS', val:'$85.750.000', sub:'total mes', dot:'bg-green-400' },
          { label:'EGRESOS', val:'$45.500.000', sub:'total mes', dot:'bg-red-400' },
          { label:'UTILIDAD', val:'$40.250.000', sub:'46.9% margen', dot:'bg-green-400' },
          { label:'COSTO/LITRO', val:'$820', sub:'Meta <$800', dot:'bg-orange-400' },
          { label:'MARGEN/LITRO', val:'$430', sub:'34.4%', dot:'bg-green-400' },
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
            {/* Ingresos */}
            <div>
              <div className="text-xs font-bold text-green-400 uppercase mb-2">INGRESOS</div>
              <div className="space-y-1.5">
                {ingresos.map(r => (
                  <div key={r.concepto} className="flex justify-between items-center text-sm py-1 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground">{r.concepto}</span>
                    <span className="font-medium text-foreground">{fmt(r.val)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm py-1.5 border-t border-border">
                  <span className="font-bold text-foreground">Total ingresos</span>
                  <span className="font-bold text-green-400 text-base">{fmt(totalIngresos)}</span>
                </div>
              </div>
            </div>
            {/* Egresos */}
            <div>
              <div className="text-xs font-bold text-red-400 uppercase mb-2">EGRESOS</div>
              <div className="space-y-1.5">
                {egresos.map(r => (
                  <div key={r.concepto} className="flex justify-between items-center text-sm py-1 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground">{r.concepto}</span>
                    <span className="font-medium text-red-400">({fmt(r.val)})</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm py-1.5 border-t border-border">
                  <span className="font-bold text-foreground">Total egresos</span>
                  <span className="font-bold text-red-400 text-base">({fmt(totalEgresos)})</span>
                </div>
              </div>
            </div>
            {/* Utilidad */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex justify-between items-center">
              <span className="font-bold text-foreground">UTILIDAD NETA</span>
              <span className="font-bold text-green-400 text-xl">{fmt(utilidad)}</span>
            </div>
          </div>
        </div>

        {/* Right: Costo por litro + Margen */}
        <div className="space-y-5">
          {/* Costo por litro */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="font-semibold text-sm mb-4">Costo por litro producido</div>
            <div className="space-y-3">
              {costoLitro.map(c => (
                <div key={c.concepto}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{c.concepto}</span>
                    <span className="font-semibold" style={{color: c.color}}>${c.valor}/L ({c.pct}%)</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full">
                    <div className="h-2 rounded-full" style={{width:`${c.pct}%`, background: c.color}} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex justify-between text-sm">
              <span className="text-muted-foreground">Total costo</span>
              <span className="font-bold text-foreground">$820/L <span className="text-muted-foreground font-normal text-xs">· Meta $800/L</span></span>
            </div>
          </div>

          {/* Margen neto por litro */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="font-semibold text-sm mb-4">Margen neto por litro</div>
            <div className="grid grid-cols-5 gap-2 items-center text-center mb-4">
              <div className="bg-green-500/10 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Precio</div>
                <div className="text-xl font-bold text-green-400">$1.250</div>
              </div>
              <div className="text-2xl text-muted-foreground font-light">−</div>
              <div className="bg-red-500/10 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Costo</div>
                <div className="text-xl font-bold text-red-400">$820</div>
              </div>
              <div className="text-2xl text-muted-foreground font-light">=</div>
              <div className="bg-blue-500/10 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Margen</div>
                <div className="text-xl font-bold text-blue-400">$430</div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-xs text-center text-muted-foreground">
              56.040 L × $430 margen = <strong className="text-foreground">$24.097.200 utilidad leche</strong>
            </div>
            <div className="mt-2 text-center text-sm font-bold text-green-400">34.4% de margen neto</div>
          </div>
        </div>
      </div>
    </div>
  );
}
