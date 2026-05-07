import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAppState } from "../lib/data";
import { Badge } from "@/components/ui/badge";

const dataProduccion = [
  { name: 'Oct', litros: 52000 },
  { name: 'Nov', litros: 55000 },
  { name: 'Dic', litros: 58000 },
  { name: 'Ene', litros: 62000 },
  { name: 'Feb', litros: 60000 },
  { name: 'Mar', litros: 56000 },
  { name: 'Abr', litros: 61300 },
];

const COLORS = ['#4ade80', '#2dd4bf', '#fbbf24', '#f87171', '#c084fc', '#60a5fa'];

export default function Dashboard() {
  const { animals, potreros, personal, alertas } = useAppState();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d2111] to-[#123118] p-6 rounded-xl border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">¡Buenos días, Administrador!</h1>
          <p className="text-muted-foreground mt-1">El hato está funcionando correctamente hoy.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-card/50 text-foreground border-border">{animals.length} Animales</Badge>
          <Badge variant="outline" className="bg-card/50 text-foreground border-border">5 En Producción</Badge>
          <Badge variant="outline" className="bg-card/50 text-foreground border-border">{potreros.length} Potreros</Badge>
          <Badge variant="outline" className="bg-card/50 text-foreground border-border">{personal.length} Staff</Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-[#0f1712] border-none shadow-sm">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
            <span className="text-3xl font-bold text-white">{animals.length}</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Total Animales</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none shadow-sm">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
            <span className="text-3xl font-bold text-primary">84L</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Litros Hoy</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none shadow-sm">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
            <span className="text-3xl font-bold text-blue-400">417kg</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Peso Promedio</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none shadow-sm">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
            <span className="text-3xl font-bold text-purple-400">1</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Gestante</span>
          </CardContent>
        </Card>
        <Card className="bg-destructive/20 border-destructive/30 shadow-sm relative overflow-hidden">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
            <span className="text-3xl font-bold text-destructive">1</span>
            <span className="text-xs text-destructive/80 mt-1 uppercase tracking-wider">En Tratamiento</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none shadow-sm">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
            <span className="text-3xl font-bold text-amber-400">$51.2M</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Valor del Hato</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolución Histórica de Producción</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataProduccion} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLitros" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="litros" stroke="#4ade80" strokeWidth={2} fillOpacity={1} fill="url(#colorLitros)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas Activas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {alertas.slice(0, 4).map(a => (
                <div key={a.id} className="p-4 flex flex-col gap-1 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${a.type === 'danger' ? 'text-destructive' : a.type === 'warning' ? 'text-amber-400' : 'text-blue-400'}`}>
                      {a.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
