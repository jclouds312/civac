import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Map, Beef, Milk, TrendingUp, Leaf, Users, DollarSign, Plus, Eye, ArrowUpRight, ArrowDownRight, Signal } from "lucide-react";

const fincas = [
  {
    id: 1,
    nombre: "El Rancho Verde",
    ubicacion: "Cundinamarca, Colombia",
    hectareas: 120,
    animales: 87,
    vacasOrdeño: 42,
    produccionDia: 832,
    margen: 34.2,
    co2: 18.4,
    personal: 6,
    estado: "Activa",
    variacion: +5.2,
    color: "from-emerald-500 to-teal-600",
    accent: "emerald",
    vet: "Dr. Ramírez",
    encargado: "Carlos Meza",
  },
  {
    id: 2,
    nombre: "La Esperanza",
    ubicacion: "Boyacá, Colombia",
    hectareas: 85,
    animales: 61,
    vacasOrdeño: 30,
    produccionDia: 540,
    margen: 28.7,
    co2: 21.1,
    personal: 4,
    estado: "Activa",
    variacion: -1.8,
    color: "from-blue-500 to-blue-700",
    accent: "blue",
    vet: "Dra. Torres",
    encargado: "Hernán López",
  },
  {
    id: 3,
    nombre: "San Antonio",
    ubicacion: "Antioquia, Colombia",
    hectareas: 200,
    animales: 143,
    vacasOrdeño: 68,
    produccionDia: 1360,
    margen: 41.5,
    co2: 15.8,
    personal: 9,
    estado: "Activa",
    variacion: +9.1,
    color: "from-orange-500 to-amber-600",
    accent: "orange",
    vet: "Dr. Pérez",
    encargado: "Julio Ríos",
  },
];

const consolidado = {
  animales: 291,
  produccion: 2732,
  margenPromedio: 34.8,
  hectareas: 405,
  personal: 19,
};

export default function Multifinca() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1a3a5c] via-[#1a4a5c] to-[#0d2a3a] p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-full opacity-10">
          <Map className="w-full h-full" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Map size={20} className="text-blue-300" />
              <Badge className="bg-blue-500/30 text-blue-200 border-blue-400/30 text-xs">3 Fincas activas</Badge>
            </div>
            <h1 className="text-2xl font-bold mb-1">Multi-Finca</h1>
            <p className="text-blue-200/70 text-sm">Gestión unificada · Cundinamarca · Boyacá · Antioquia</p>
          </div>
          <Button className="bg-white/15 hover:bg-white/25 border border-white/20 text-white gap-2">
            <Plus size={16} />
            Agregar Finca
          </Button>
        </div>
      </div>

      {/* Consolidated KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Animales", value: consolidado.animales, icon: Beef, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Producción/día", value: `${consolidado.produccion} L`, icon: Milk, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Margen prom.", value: `${consolidado.margenPromedio}%`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Hectáreas", value: consolidado.hectareas, icon: Leaf, color: "text-teal-500", bg: "bg-teal-500/10" },
          { label: "Personal", value: consolidado.personal, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border">
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center mb-2`}>
                <kpi.icon size={16} className={kpi.color} />
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Farm cards */}
      <div className="grid lg:grid-cols-3 gap-4">
        {fincas.map((finca) => (
          <Card
            key={finca.id}
            className={`border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
              selected === finca.id ? 'border-primary shadow-lg shadow-primary/10 scale-[1.01]' : 'border-border hover:border-primary/40'
            }`}
            onClick={() => setSelected(selected === finca.id ? null : finca.id)}
          >
            {/* Card gradient header */}
            <div className={`bg-gradient-to-r ${finca.color} p-4 relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-20">
                <Map className="w-full h-full" />
              </div>
              <div className="flex items-start justify-between relative">
                <div>
                  <h3 className="font-bold text-white text-lg">{finca.nombre}</h3>
                  <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
                    <Signal size={10} />
                    {finca.ubicacion}
                  </p>
                </div>
                <Badge className="bg-white/20 text-white border-white/20 text-xs">{finca.estado}</Badge>
              </div>
              <div className="mt-3 flex gap-4 text-white/90 text-sm">
                <span className="font-semibold">{finca.hectareas} ha</span>
                <span className="text-white/50">·</span>
                <span className="font-semibold">{finca.animales} animales</span>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Production */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Milk size={13} className="text-blue-500" />
                    <span className="text-xs text-muted-foreground">Producción/día</span>
                  </div>
                  <p className="font-bold text-foreground">{finca.produccionDia} L</p>
                  <div className={`flex items-center gap-1 text-xs mt-0.5 ${finca.variacion > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {finca.variacion > 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                    {Math.abs(finca.variacion)}% vs mes ant.
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign size={13} className="text-green-500" />
                    <span className="text-xs text-muted-foreground">Margen neto</span>
                  </div>
                  <p className="font-bold text-foreground">{finca.margen}%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{finca.vacasOrdeño} vacas ordeño</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                <span className="flex items-center gap-1"><Leaf size={11} className="text-green-500" />{finca.co2} kg CO₂/L</span>
                <span className="flex items-center gap-1"><Users size={11} />{finca.personal} empleados</span>
                <span className="flex items-center gap-1">Vet: {finca.vet.split(' ')[1]}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
              >
                <Eye size={12} />
                Ver detalle completo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparative table */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Comparativo de fincas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1a4a2e] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-xs">Finca</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs">Animales</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs">Prod./día</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs">L/vaca</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs">Margen</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs">CO₂/L</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs">Encargado</th>
                </tr>
              </thead>
              <tbody>
                {fincas.map((f, i) => (
                  <tr key={f.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                    <td className="px-4 py-3 font-medium text-foreground">{f.nombre}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{f.animales}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{f.produccionDia} L</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{(f.produccionDia / f.vacasOrdeño).toFixed(1)} L</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${f.margen > 35 ? 'text-green-500' : 'text-amber-500'}`}>{f.margen}%</span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{f.co2}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-xs">{f.encargado}</td>
                  </tr>
                ))}
                <tr className="bg-primary/10 border-t-2 border-primary/20 font-semibold">
                  <td className="px-4 py-3 text-foreground">TOTAL / PROMEDIO</td>
                  <td className="px-4 py-3 text-right text-foreground">{consolidado.animales}</td>
                  <td className="px-4 py-3 text-right text-foreground">{consolidado.produccion} L</td>
                  <td className="px-4 py-3 text-right text-foreground">{(consolidado.produccion / (42+30+68)).toFixed(1)} L</td>
                  <td className="px-4 py-3 text-right text-green-500">{consolidado.margenPromedio}%</td>
                  <td className="px-4 py-3 text-right text-foreground">18.4</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
