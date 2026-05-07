import { Card, CardContent } from "@/components/ui/card";

export default function Co2() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Huella de Carbono</h1>
        <p className="text-muted-foreground">Sostenibilidad y emisiones de Gases de Efecto Invernadero</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-destructive">46.1t</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Emisión Bruta CO2e</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-blue-400">0.82</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Intensidad (kg CO2e/L)</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-primary">12.4t</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Captura Forestal</span>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border border-primary/20">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-primary">33.7t</span>
            <span className="text-xs text-primary/80 mt-1 uppercase tracking-wider">Huella Neta</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-6">Benchmarking: Intensidad de Emisiones</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-primary">Su Finca (GanaderIA)</span>
                  <span className="text-primary font-bold">0.82 kg/L</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-4">
                  <div className="bg-primary h-4 rounded-full w-[44%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-muted-foreground">
                  <span>Media Nacional Colombia</span>
                  <span>1.05 kg/L</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-3">
                  <div className="bg-muted-foreground h-3 rounded-full w-[56%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-muted-foreground">
                  <span>IPCC Promedio Latam</span>
                  <span>1.10 kg/L</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-3">
                  <div className="bg-muted-foreground h-3 rounded-full w-[59%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-muted-foreground">
                  <span>Sistema Extensivo Tradicional</span>
                  <span>1.85 kg/L</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-3">
                  <div className="bg-destructive/50 h-3 rounded-full w-[100%]"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex items-center justify-center min-h-[300px]">
          <div className="text-center text-muted-foreground p-6">
            <h3 className="font-bold text-lg mb-2 text-foreground">Evolución 6 Meses</h3>
            <p>Área reservada para gráfico de línea mostrando la reducción de la intensidad de carbono (0.91 → 0.82).</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
