import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function Prediccion() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inteligencia y Predicciones</h1>
        <p className="text-muted-foreground">Análisis de IA sobre el futuro del hato</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 flex gap-4">
        <AlertTriangle className="text-amber-500 shrink-0 h-6 w-6" />
        <div>
          <h3 className="text-lg font-bold text-amber-500 mb-1">Diagnóstico IA: Ineficiencia Reproductiva Detectada</h3>
          <p className="text-amber-500/80 mb-3">El Intervalo Entre Partos (IEP) proyectado es de <strong>428 días</strong> (ideal {'<'} 390). Esto incrementará el costo por litro a $845 COP para el próximo trimestre si no se corrigen los anestros prolongados.</p>
          <div className="flex gap-2">
            <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-1 rounded">Probabilidad: Alta (89%)</span>
            <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">Impacto: $4.2M / mes</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Simulador Financiero 6 Meses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Precio de Leche (COP)</label>
                  <span className="font-bold text-primary">$1,250</span>
                </div>
                <Slider defaultValue={[1250]} max={1500} min={1000} step={10} className="[&>span]:bg-primary" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Vacas en Producción</label>
                  <span className="font-bold text-primary">5</span>
                </div>
                <Slider defaultValue={[5]} max={13} min={1} step={1} className="[&>span]:bg-primary" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Litros / Vaca / Día</label>
                  <span className="font-bold text-primary">16.8 L</span>
                </div>
                <Slider defaultValue={[16.8]} max={25} min={10} step={0.1} className="[&>span]:bg-primary" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Costo de Producción / L</label>
                  <span className="font-bold text-destructive">$820</span>
                </div>
                <Slider defaultValue={[820]} max={1000} min={600} step={10} className="[&>span]:bg-destructive" />
              </div>
            </div>

            <div className="pt-6 border-t border-border grid grid-cols-2 gap-4">
              <div className="bg-muted/20 p-4 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground uppercase">Proyección Ingresos</span>
                <div className="text-xl font-bold text-primary mt-1">$3.15M / mes</div>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground uppercase">Proyección Margen</span>
                <div className="text-xl font-bold text-blue-400 mt-1">34.4%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex items-center justify-center min-h-[300px]">
          <div className="text-center text-muted-foreground p-6">
            <h3 className="font-bold text-lg mb-2 text-foreground">Gráfico Predictivo</h3>
            <p>Área reservada para visualización de Recharts (Combo Bar/Line) mostrando tendencias de producción vs costos.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
