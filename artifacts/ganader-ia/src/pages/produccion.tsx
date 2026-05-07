import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const dataProduccion = [
  { name: 'Oct', litros: 52000 },
  { name: 'Nov', litros: 55000 },
  { name: 'Dic', litros: 58000 },
  { name: 'Ene', litros: 62000 },
  { name: 'Feb', litros: 60000 },
  { name: 'Mar', litros: 56000 },
  { name: 'Abr', litros: 61300 },
];

export default function Produccion() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Producción Leche y Carne</h1>
        <p className="text-muted-foreground">Rendimiento productivo y calidad</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-white">9.855L</span>
            <span className="text-[10px] text-muted-foreground uppercase mt-1">Prod. Mes</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-white">$1.250</span>
            <span className="text-[10px] text-muted-foreground uppercase mt-1">Precio/L</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-primary">$12.3M</span>
            <span className="text-[10px] text-muted-foreground uppercase mt-1">Ingreso Mes</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-destructive">$820</span>
            <span className="text-[10px] text-muted-foreground uppercase mt-1">Costo/L</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-blue-400">34.4%</span>
            <span className="text-[10px] text-muted-foreground uppercase mt-1">Margen</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Producción de Leche (7 meses)</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataProduccion} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLitros2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#52525b" tick={{fill: '#a1a1aa'}} />
              <YAxis stroke="#52525b" tick={{fill: '#a1a1aa'}} />
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                itemStyle={{ color: '#4ade80' }}
              />
              <Area type="monotone" dataKey="litros" stroke="#4ade80" strokeWidth={2} fillOpacity={1} fill="url(#colorLitros2)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
