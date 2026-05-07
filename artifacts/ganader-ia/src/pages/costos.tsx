import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Costos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Costos y P&G</h1>
        <p className="text-muted-foreground">Rentabilidad y análisis financiero mensual</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#0f1712] border-none shadow-sm md:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase mb-2">Ingresos Totales</h3>
            <p className="text-4xl font-bold text-primary">$85.75M</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none shadow-sm md:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase mb-2">Egresos Totales</h3>
            <p className="text-4xl font-bold text-destructive">$45.50M</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none shadow-sm md:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase mb-2">Utilidad Neta</h3>
            <p className="text-4xl font-bold text-white">$40.25M</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Desglose de Ingresos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-foreground">Venta de Leche</span>
                <span className="font-medium">$70.05M</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full w-[81%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-foreground">Venta de Ganado</span>
                <span className="font-medium">$12.50M</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2.5">
                <div className="bg-blue-400 h-2.5 rounded-full w-[14%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-foreground">Genética (Embriones)</span>
                <span className="font-medium">$3.20M</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2.5">
                <div className="bg-purple-400 h-2.5 rounded-full w-[5%]"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desglose de Egresos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-foreground">Alimentación</span>
                <span className="font-medium text-destructive">$22.40M</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2.5">
                <div className="bg-destructive h-2.5 rounded-full w-[49%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-foreground">Nómina y Personal</span>
                <span className="font-medium text-amber-500">$17.20M</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2.5">
                <div className="bg-amber-500 h-2.5 rounded-full w-[38%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-foreground">Medicamentos e Insumos</span>
                <span className="font-medium text-pink-500">$3.80M</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2.5">
                <div className="bg-pink-500 h-2.5 rounded-full w-[8%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-foreground">Mantenimiento Finca</span>
                <span className="font-medium text-orange-400">$2.10M</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2.5">
                <div className="bg-orange-400 h-2.5 rounded-full w-[5%]"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <span className="text-xs text-primary uppercase font-bold tracking-wider">Margen por Litro</span>
            <div className="text-2xl font-bold mt-1 text-primary">$430 COP</div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4 text-center">
            <span className="text-xs text-destructive uppercase font-bold tracking-wider">Costo por Litro</span>
            <div className="text-2xl font-bold mt-1 text-destructive">$820 COP</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
