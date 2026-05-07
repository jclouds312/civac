import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList } from "recharts";
import { Slider } from "@/components/ui/slider";

const dataProy = [
  { name: 'Abr', litros: 61300 },
  { name: 'May', litros: 59000 },
  { name: 'Jun', litros: 62000 },
  { name: 'Jul', litros: 65000 },
  { name: 'Ago', litros: 64000 },
  { name: 'Sep', litros: 68000 },
];

export default function Prediccion() {
  const [precio, setPrecio] = useState(1250);
  const [vacas, setVacas] = useState(5);
  const [litrosVaca, setLitrosVaca] = useState(16.4);
  const [costo, setCosto] = useState(820);

  const litrosDia = vacas * litrosVaca;
  const litrosMes = litrosDia * 30;
  const ingresoMes = litrosMes * precio;
  const costoMes = litrosMes * costo;
  const utilidad = ingresoMes - costoMes;
  const margen = ingresoMes > 0 ? ((utilidad / ingresoMes) * 100).toFixed(1) : '0.0';

  const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h1 className="text-2xl font-bold">🤖 Predicciones IA — Simulador 12M</h1>
        <p className="text-muted-foreground text-sm">Proyecciones basadas en datos históricos · SoftGan IA engine</p>
      </div>

      {/* Diagnóstico IA */}
      <div className="border border-amber-500/30 rounded-xl p-5" style={{background:'rgba(245,158,11,0.05)'}}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl flex-shrink-0">🤖</div>
          <div>
            <div className="font-semibold text-foreground mb-2">Diagnóstico SoftGan IA — 29 Abr 2025:</div>
            <div className="space-y-1.5">
              <div className="text-sm text-muted-foreground">⚠️ IEP 428d → pérdida estimada <strong className="text-foreground">$8.2M COP/mes</strong>. Costo/L $820 → ineficiencia <strong className="text-foreground">$1.1M/mes</strong>.</div>
              <div className="text-sm text-green-400">✅ Intensidad CO₂ 0.82 kg/L — 25% mejor que promedio colombiano.</div>
              <div className="text-sm text-amber-400">💡 Si reduce IEP a 390d → +14 vacas en producción → <strong>+$8.4M/mes</strong>.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-col: Chart + Simulador */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Proyección 6M */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold">📈 Proyección producción 6 meses</div>
              <div className="text-xs text-muted-foreground">Abr 2025 (real) + May–Sep (IA proyectado)</div>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1"><span className="w-3 h-2 bg-primary rounded-sm inline-block" /><span className="text-muted-foreground">Real</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-2 bg-primary/40 rounded-sm inline-block" /><span className="text-muted-foreground">Proyectado IA</span></div>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataProy} margin={{top:20,right:10,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#444" tick={{fill:'#888',fontSize:11}} />
                <YAxis stroke="#444" tick={{fill:'#888',fontSize:10}} width={42} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} />
                <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} formatter={(v:number)=>[`${v.toLocaleString('es-CO')} L`,'Litros']} />
                <Bar dataKey="litros" fill="#2e7d32" radius={[4,4,0,0]}>
                  <LabelList dataKey="litros" position="top" style={{fill:'#888',fontSize:9}} formatter={(v:number)=>`${(v/1000).toFixed(0)}K`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="text-center bg-muted/20 rounded-lg p-2">
              <div className="text-[10px] text-muted-foreground">Abr (Real)</div>
              <div className="text-sm font-bold text-foreground">61.3K L</div>
            </div>
            <div className="text-center bg-muted/20 rounded-lg p-2">
              <div className="text-[10px] text-muted-foreground">Sep (Proy.)</div>
              <div className="text-sm font-bold text-green-400">68K L</div>
            </div>
            <div className="text-center bg-green-500/10 rounded-lg p-2">
              <div className="text-[10px] text-muted-foreground">Crecimiento</div>
              <div className="text-sm font-bold text-green-400">↑ +11.9%</div>
            </div>
          </div>
        </div>

        {/* Simulador financiero */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="font-semibold mb-1">🎛️ Simulador financiero en tiempo real</div>
          <div className="text-xs text-muted-foreground mb-5">Ajuste los parámetros y vea el impacto inmediato</div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Precio litro ($/L COP)</span>
                <span className="font-bold text-foreground">${precio.toLocaleString('es-CO')}</span>
              </div>
              <Slider min={800} max={2000} step={50} value={[precio]} onValueChange={([v]) => setPrecio(v)} />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>$800</span><span>$2.000</span></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Vacas en producción</span>
                <span className="font-bold text-foreground">{vacas}</span>
              </div>
              <Slider min={1} max={50} step={1} value={[vacas]} onValueChange={([v]) => setVacas(v)} />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>1</span><span>50</span></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Litros/vaca/día</span>
                <span className="font-bold text-foreground">{litrosVaca.toFixed(1)} L</span>
              </div>
              <Slider min={5} max={30} step={0.5} value={[litrosVaca]} onValueChange={([v]) => setLitrosVaca(v)} />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>5L</span><span>30L</span></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Costo producción/L</span>
                <span className="font-bold text-foreground">${costo.toLocaleString('es-CO')}</span>
              </div>
              <Slider min={400} max={1500} step={10} value={[costo]} onValueChange={([v]) => setCosto(v)} />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>$400</span><span>$1.500</span></div>
            </div>
          </div>

          {/* Results */}
          <div className="mt-5 bg-muted/20 border border-border rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">Proyección mensual</div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Producción</span>
              <span className="font-medium">{litrosMes.toLocaleString('es-CO')} L/mes</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ingreso bruto</span>
              <span className="font-medium text-green-400">{fmt(ingresoMes)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Costo total</span>
              <span className="font-medium text-red-400">({fmt(costoMes)})</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-2">
              <span className="font-bold text-foreground">Utilidad neta</span>
              <span className={`font-bold text-base ${utilidad >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(utilidad)}</span>
            </div>
            <div className="text-right text-sm font-bold text-green-400">Margen: {margen}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
