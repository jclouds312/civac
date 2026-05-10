import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList, LineChart, Line, ComposedChart } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, TrendingDown, DollarSign, Globe } from "lucide-react";
import { useState } from "react";

const benchmark = [
  { label: 'Su finca (SoftGan)', val: '0.82 kg/L', numVal: 0.82, color: '#22c55e', bold: true },
  { label: 'Media Colombia lechería', val: '1.05 kg/L', numVal: 1.05, color: '#f97316', bold: false },
  { label: 'Referencia IPCC Latam', val: '1.10 kg/L', numVal: 1.10, color: '#f97316', bold: false },
  { label: 'Promedio extensivo Latam', val: '1.85 kg/L', numVal: 1.85, color: '#ef4444', bold: false },
  { label: 'Intensivo UE (referencia)', val: '0.75 kg/L', numVal: 0.75, color: '#3b82f6', bold: false },
];

const evolucion = [
  { name: 'Nov', val: 0.91, captura: 10.8, neta: 36.2 },
  { name: 'Dic', val: 0.88, captura: 11.2, neta: 35.0 },
  { name: 'Ene', val: 0.85, captura: 11.6, neta: 33.8 },
  { name: 'Feb', val: 0.86, captura: 11.4, neta: 34.2 },
  { name: 'Mar', val: 0.83, captura: 11.9, neta: 33.0 },
  { name: 'Abr', val: 0.82, captura: 12.4, neta: 33.7 },
];

const mercadoCreditos = [
  { proyecto: 'REDD+ Bosques Andes', precio: 12.5, disponible: 5000, tipo: 'Forestal', certif: 'VCS', color: '#22c55e' },
  { proyecto: 'Ganadería Regenerativa Colombia', precio: 9.8, disponible: 2000, tipo: 'Agricultura', certif: 'Gold Standard', color: '#3b82f6' },
  { proyecto: 'Biogás Residuos Bovinos', precio: 14.2, disponible: 1500, tipo: 'Energía', certif: 'CAR', color: '#f59e0b' },
  { proyecto: 'Silvopastura Biodiversidad', precio: 18.5, disponible: 800, tipo: 'Biodiversidad', certif: 'VCS+CCB', color: '#a855f7' },
];

const emisionesDesglose = [
  { concepto: 'CH₄ entérico (fermentación ruminal)', val: 34.5, pct: 74.8, color: '#ef4444' },
  { concepto: 'N₂O gestión estiércol', val: 8.4, pct: 18.2, color: '#f97316' },
  { concepto: 'N₂O suelos (fertilización)', val: 3.2, pct: 6.9, color: '#f59e0b' },
];

export default function Co2() {
  const [activeTab, setActiveTab] = useState("balance");
  const [toneladas, setToneladas] = useState(10);
  const precioMercado = 12.5;

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#064e3b] to-[#065f46] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Leaf size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Huella de Carbono — IPCC 2019</h1>
            <p className="text-white/70 text-sm">Emisiones GEI · Captura praderas · Mercado créditos CO₂ · Benchmarking</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-sm font-semibold">−55% vs Latam promedio</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:'EMISIÓN BRUTA', val:'46.1 t', sub:'CO₂eq/mes', dot:'bg-orange-400', icon:'🌡️' },
          { label:'INTENSIDAD LECHE', val:'0.82 kg/L', sub:'CO₂eq/L · ✓ Eficiente', dot:'bg-green-400', icon:'🥛' },
          { label:'CAPTURA PRADERAS', val:'12.4 t', sub:'CO₂eq/mes fijación', dot:'bg-green-400', icon:'🌿' },
          { label:'HUELLA NETA', val:'33.7 t', sub:'CO₂eq/mes balance', dot:'bg-green-400', icon:'⚖️' },
          { label:'CRÉDITOS POTENC.', val:'~2.8 t', sub:'CO₂ adicionales/mes', dot:'bg-blue-400', icon:'💰' },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">{k.label}</span>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${k.dot}`} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">{k.icon}</span>
              <div className="text-xl font-bold text-foreground">{k.val}</div>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="balance" className="gap-1.5 text-xs"><Globe size={13} /> Balance Carbono</TabsTrigger>
          <TabsTrigger value="benchmarking" className="gap-1.5 text-xs"><TrendingDown size={13} /> Benchmarking</TabsTrigger>
          <TabsTrigger value="mercado" className="gap-1.5 text-xs"><DollarSign size={13} /> Mercado Créditos</TabsTrigger>
        </TabsList>

        {/* Balance */}
        <TabsContent value="balance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-3">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-semibold mb-4">⚖️ Balance Detallado de Carbono</div>
              <div className="space-y-3 mb-4">
                <div className="text-xs font-bold text-red-400 uppercase">EMISIONES (fuentes)</div>
                {emisionesDesglose.map(e => (
                  <div key={e.concepto}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground text-xs">{e.concepto}</span>
                      <div className="text-right">
                        <span className="font-semibold text-sm" style={{color:e.color}}>{e.val} t</span>
                        <span className="text-[10px] text-muted-foreground ml-1">({e.pct}%)</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full">
                      <div className="h-1.5 rounded-full" style={{width:`${e.pct}%`, background:e.color}} />
                    </div>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t border-border text-sm">
                  <span className="font-bold text-foreground">TOTAL EMISIONES</span>
                  <span className="font-bold text-red-400 text-base">46.1 t CO₂eq</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-bold text-green-400 uppercase">CAPTURAS (sumideros)</div>
                <div className="flex justify-between py-2 border-b border-border/40 text-sm">
                  <span className="text-muted-foreground">Fijación C praderas kikuyo (27.1 ha)</span>
                  <span className="font-semibold text-green-400">−9.8 t CO₂eq</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/40 text-sm">
                  <span className="text-muted-foreground">Silvopastura / árboles dispersos</span>
                  <span className="font-semibold text-green-400">−2.6 t CO₂eq</span>
                </div>
                <div className="flex justify-between py-2 border-t border-border text-sm">
                  <span className="font-bold text-foreground">TOTAL CAPTURAS</span>
                  <span className="font-bold text-green-400">−12.4 t CO₂eq</span>
                </div>
              </div>
              <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">HUELLA NETA</div>
                  <div className="text-2xl font-bold text-green-400">33.7 t CO₂eq/mes</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Intensidad</div>
                  <div className="text-xl font-bold text-green-400">0.82 kg/L</div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="font-semibold mb-1">📈 Evolución intensidad carbono</div>
                <div className="text-xs text-muted-foreground mb-3">kg CO₂eq/L — tendencia a la baja ↓</div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={evolucion} margin={{top:16,right:10,left:0,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="name" stroke="#444" tick={{fill:'#888',fontSize:10}} />
                      <YAxis stroke="#444" tick={{fill:'#888',fontSize:9}} width={32} domain={[0.75, 0.95]} />
                      <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} formatter={(v:number) => [`${v} kg/L`]} />
                      <Bar dataKey="val" fill="#22c55e" radius={[3,3,0,0]} name="Intensidad">
                        <LabelList dataKey="val" position="top" style={{fill:'#888',fontSize:9}} />
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-muted-foreground">Nov: 0.91 kg/L</span>
                  <span className="text-green-400 font-semibold">↓ −9.9% en 6 meses</span>
                  <span className="text-green-400">Abr: 0.82 kg/L ✓</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="font-semibold mb-3">🚀 Acciones para reducir huella</div>
                <div className="space-y-2.5">
                  {[
                    { accion:'Mejora eficiencia alimentaria', reduccion:'−2.1 t/mes', dificultad:'Media', color:'bg-amber-500' },
                    { accion:'Aumentar cobertura silvopastura', reduccion:'−1.8 t/mes', dificultad:'Baja', color:'bg-green-500' },
                    { accion:'Reducir IEP (menos vacas improductivas)', reduccion:'−3.4 t/mes', dificultad:'Alta', color:'bg-red-500' },
                    { accion:'Biogás con estiércol bovino', reduccion:'−4.2 t/mes', dificultad:'Alta', color:'bg-blue-500' },
                  ].map(a => (
                    <div key={a.accion} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border">
                      <div className={`w-2 h-8 rounded-full ${a.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{a.accion}</div>
                        <div className="text-[10px] text-muted-foreground">Dificultad: {a.dificultad}</div>
                      </div>
                      <span className="text-xs font-bold text-green-400 flex-shrink-0">{a.reduccion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Benchmarking */}
        <TabsContent value="benchmarking">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-3">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-semibold mb-1">📊 Benchmarking IPCC — Colombia y Latam</div>
              <div className="text-xs text-muted-foreground mb-4">Intensidad carbono (kg CO₂eq/L) por tipo de sistema</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchmark} layout="vertical" margin={{top:0,right:60,left:10,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                    <XAxis type="number" stroke="#444" tick={{fill:'#888',fontSize:10}} domain={[0, 2.0]} />
                    <YAxis type="category" dataKey="label" stroke="#444" tick={{fill:'#888',fontSize:9}} width={160} />
                    <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} formatter={(v:number) => [`${v} kg CO₂eq/L`]} />
                    <Bar dataKey="numVal" radius={[0,4,4,0]} name="Intensidad">
                      {benchmark.map((entry, i) => (
                        <rect key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-3 border-t border-border text-[10px] text-muted-foreground">
                Calculado Tier 2 IPCC 2019 · CH₄ entérico + N₂O estiércol/suelos + fijación C praderas
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-semibold mb-4">Su posición competitiva</div>
              <div className="space-y-4">
                {benchmark.map(b => (
                  <div key={b.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`text-sm ${b.bold ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{b.label}</span>
                      <span className="text-sm font-bold" style={{color: b.color}}>{b.val}</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full">
                      <div className="h-2 rounded-full" style={{width:`${(b.numVal/2.5)*100}%`, background: b.color}} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-2">
                <div className="text-xs font-semibold text-green-400">✅ Certificaciones disponibles para su nivel:</div>
                <div className="space-y-1.5">
                  {['CONPES 3934 — Ganadería Sostenible Colombia','Rainforest Alliance — cadena valor leche','Carbon Neutral Certification (Gold Standard)'].map(c => (
                    <div key={c} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Mercado Créditos */}
        <TabsContent value="mercado">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-3">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-semibold mb-1">💰 Mercado de Créditos de Carbono</div>
              <div className="text-xs text-muted-foreground mb-4">Proyectos disponibles para compensación o venta — Colombia 2025</div>
              <div className="space-y-3">
                {mercadoCreditos.map(p => (
                  <div key={p.proyecto} className="flex items-center gap-3 p-3.5 bg-muted/20 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                    <div className="w-3 h-10 rounded-full flex-shrink-0" style={{background: p.color}} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">{p.proyecto}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        <span className="bg-muted/40 px-1.5 py-0.5 rounded mr-1">{p.tipo}</span>
                        <span className="font-mono">{p.certif}</span>
                        <span className="ml-2">{p.disponible.toLocaleString('es-CO')} tCO₂ disponible</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-base" style={{color: p.color}}>${p.precio} USD</div>
                      <div className="text-[10px] text-muted-foreground">por tCO₂</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-semibold mb-4">🧮 Calculadora de créditos de carbono</div>
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="text-xs text-muted-foreground mb-1">Potencial de reducción adicional (vs. Colombia promedio)</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {((1.05 - 0.82) * 61300 / 1000).toFixed(1)} tCO₂eq/mes
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    (1.05 - 0.82) kg/L × 61,300 L/mes
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Toneladas a vender/compensar</span>
                    <span className="font-bold text-foreground">{toneladas} tCO₂</span>
                  </div>
                  <input type="range" min="1" max="50" value={toneladas} onChange={e => setToneladas(Number(e.target.value))}
                    className="w-full h-2 bg-muted/30 rounded-full appearance-none cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>1t</span><span>50t</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {mercadoCreditos.slice(0,2).map(p => (
                    <div key={p.proyecto} className="bg-muted/20 border border-border rounded-xl p-3 text-center">
                      <div className="text-[10px] text-muted-foreground mb-1 truncate">{p.certif}</div>
                      <div className="font-bold" style={{color: p.color}}>
                        ${(toneladas * p.precio * 4200).toLocaleString('es-CO')}
                      </div>
                      <div className="text-[10px] text-muted-foreground">COP estimado</div>
                    </div>
                  ))}
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="text-xs font-semibold text-green-400 mb-2">Valor estimado en mercado</div>
                  <div className="text-2xl font-bold text-green-400">${(toneladas * precioMercado).toFixed(0)} USD</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ≈ {new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(toneladas * precioMercado * 4200)} COP
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-2">
                    Precio referencia VCS: ${precioMercado} USD/tCO₂ · Tipo cambio: $4,200 COP/USD
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
