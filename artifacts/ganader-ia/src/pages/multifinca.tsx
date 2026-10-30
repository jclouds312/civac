import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Map, Beef, Milk, TrendingUp, Leaf, Users, DollarSign, Plus, Eye, ArrowUpRight, ArrowDownRight, Signal, Printer } from "lucide-react";
import { printModule } from "@/lib/print";

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
      {/* CIVAC Banner */}
      <div className="rounded-xl p-5 relative overflow-hidden civac-animate"
        style={{background:'linear-gradient(135deg,#000d1a 0%,#001a2e 100%)', border:'1px solid rgba(0,200,255,0.35)', boxShadow:'0 0 40px rgba(0,200,255,0.1), inset 0 1px 0 rgba(0,200,255,0.08)'}}>
        <div className="absolute right-0 top-0 w-72 h-full opacity-5 pointer-events-none">
          <Map className="w-full h-full text-white" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Map size={20} style={{color:'#00c8ff'}} />
              <Badge className="text-xs" style={{background:'rgba(0,200,255,0.15)', border:'1px solid rgba(0,200,255,0.35)', color:'#00c8ff'}}>3 Fincas activas</Badge>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1" style={{fontFamily:'Sora,sans-serif'}}>Multi-Finca</h1>
            <p className="text-sm" style={{color:'rgba(0,200,255,0.75)'}}>Gestión unificada · Cundinamarca · Boyacá · Antioquia</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => printModule('Multi-Finca', 'Gestión unificada de fincas')}
              className="h-9 gap-2 text-sm" style={{background:'rgba(0,200,255,0.08)', border:'1px solid rgba(0,200,255,0.25)', color:'#00c8ff'}}>
              <Printer size={16} /> PDF
            </Button>
            <Button className="h-9 gap-2 text-sm" style={{background:'rgba(0,200,255,0.15)', border:'1px solid rgba(0,200,255,0.4)', color:'#fff'}}>
              <Plus size={16} /> Agregar Finca
            </Button>
          </div>
        </div>
      </div>

      {/* Consolidated KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Animales", value: consolidado.animales, icon: Beef, c: '#00f5d4' },
          { label: "Producción/día", value: `${consolidado.produccion} L`, icon: Milk, c: '#00c8ff' },
          { label: "Margen prom.", value: `${consolidado.margenPromedio}%`, icon: TrendingUp, c: '#39ff7e' },
          { label: "Hectáreas", value: consolidado.hectareas, icon: Leaf, c: '#39ff7e' },
          { label: "Personal", value: consolidado.personal, icon: Users, c: '#bf00ff' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl p-4 text-white relative overflow-hidden"
            style={{background:'linear-gradient(135deg,#020d09,#041208)', border:'1px solid rgba(0,245,212,0.15)'}}>
            <div className="absolute top-0 right-0 w-14 h-14 rounded-full pointer-events-none" style={{background:kpi.c, opacity:0.15, filter:'blur(18px)', transform:'translate(30%,-30%)'}} />
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{background:`${kpi.c}18`, border:`1px solid ${kpi.c}40`}}>
              <kpi.icon size={16} style={{color:kpi.c}} />
            </div>
            <p className="text-xl font-bold" style={{color:kpi.c, fontFamily:'Sora,sans-serif'}}>{kpi.value}</p>
            <p className="text-xs" style={{color:'rgba(255,255,255,0.4)'}}>{kpi.label}</p>
          </div>
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
                <tr style={{background:'rgba(0,200,255,0.06)'}}>
                  {['Finca','Animales','Prod./día','L/vaca','Margen','CO₂/L','Encargado'].map(h=>(
                    <th key={h} className="px-4 py-3 font-semibold text-xs text-left" style={{color:'rgba(0,200,255,0.75)'}}>{h}</th>
                  ))}
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
