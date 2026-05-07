import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList } from "recharts";

const benchmark = [
  { label: 'Su finca (SoftGan)', val: '0.82 kg/L', numVal: 0.82, color: 'text-green-400', barColor: '#22c55e', bold: true },
  { label: 'Media Colombia lechería', val: '1.05 kg/L', numVal: 1.05, color: 'text-orange-400', barColor: '#f97316', bold: false },
  { label: 'Referencia IPCC Latam', val: '1.10 kg/L', numVal: 1.10, color: 'text-orange-400', barColor: '#f97316', bold: false },
  { label: 'Promedio extensivo Latam', val: '1.85 kg/L', numVal: 1.85, color: 'text-red-400', barColor: '#ef4444', bold: false },
];

const evolucion = [
  { name: 'Nov', val: 0.91 },
  { name: 'Dic', val: 0.88 },
  { name: 'Ene', val: 0.85 },
  { name: 'Feb', val: 0.86 },
  { name: 'Mar', val: 0.83 },
  { name: 'Abr', val: 0.82 },
];

export default function Co2() {
  return (
    <div className="space-y-5 pb-8">
      <div>
        <h1 className="text-2xl font-bold">🌱 Huella de Carbono — IPCC 2019</h1>
        <p className="text-muted-foreground text-sm">Emisiones GEI · Captura praderas · Benchmarking regional</p>
      </div>

      {/* 5 KPI cards (bordered) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label:'EMISIÓN BRUTA', val:'46.1 t', sub:'CO₂eq/mes', dot:'bg-green-400' },
          { label:'INTENSIDAD LECHE', val:'0.82 kg/L', sub:'CO₂eq/L ✓', dot:'bg-green-400' },
          { label:'CAPTURA PRADERAS', val:'12.4 t', sub:'CO₂eq/mes', dot:'bg-green-400' },
          { label:'HUELLA NETA', val:'33.7 t', sub:'CO₂eq/mes', dot:'bg-green-400' },
          { label:'VS LATAM PROM.', val:'-55%', sub:'mejor que región', dot:'bg-green-400' },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">{k.label}</span>
              <span className={`w-2 h-2 rounded-full ${k.dot}`} />
            </div>
            <div className="text-xl font-bold text-foreground">{k.val}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 2-col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Benchmarking */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="font-semibold mb-1">📊 Benchmarking IPCC Colombia</div>
          <div className="text-xs text-muted-foreground mb-4">Intensidad de carbono por litro de leche producido</div>
          <div className="space-y-4">
            {benchmark.map(b => (
              <div key={b.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-sm ${b.bold ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{b.label}</span>
                  <span className={`text-sm font-bold ${b.color}`}>{b.val}</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full">
                  <div className="h-2 rounded-full" style={{width:`${(b.numVal/2)*100}%`, background: b.barColor}} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border text-[10px] text-muted-foreground leading-relaxed">
            Calculado Tier 2 IPCC 2019 · CH₄ entérico + N₂O suelos/estiércol + fijación carbono praderas
          </div>
        </div>

        {/* Balance + Evolución */}
        <div className="space-y-5">
          {/* Balance */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="font-semibold mb-4">⚖️ Balance de carbono</div>
            <div className="space-y-2">
              {[
                { label:'CH₄ entérico', val:'34.5 t CO₂eq', color:'text-red-400' },
                { label:'N₂O estiércol', val:'11.6 t CO₂eq', color:'text-orange-400' },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className={`font-medium ${r.color}`}>{r.val}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm py-1.5 border-b border-border">
                <span className="font-bold text-foreground">TOTAL EMISIÓN</span>
                <span className="font-bold text-red-400">46.1 t CO₂eq</span>
              </div>
              <div className="flex justify-between text-sm py-1 border-b border-border/40">
                <span className="text-muted-foreground">Captura praderas</span>
                <span className="font-medium text-green-400">−12.4 t CO₂eq</span>
              </div>
              <div className="flex justify-between text-sm py-1.5">
                <span className="font-bold text-foreground">HUELLA NETA</span>
                <span className="font-bold text-green-400">33.7 t CO₂eq</span>
              </div>
            </div>
          </div>

          {/* Evolución */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="font-semibold mb-1">📈 Evolución mensual</div>
            <div className="text-xs text-muted-foreground mb-3">kg CO₂eq/L — tendencia a la baja ↓</div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={evolucion} margin={{top:16,right:8,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#444" tick={{fill:'#888',fontSize:10}} />
                  <YAxis stroke="#444" tick={{fill:'#888',fontSize:9}} width={32} domain={[0.7, 1.0]} />
                  <RechartsTooltip contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff'}} />
                  <Bar dataKey="val" fill="#22c55e" radius={[3,3,0,0]}>
                    <LabelList dataKey="val" position="top" style={{fill:'#888',fontSize:9}} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
