import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, ShieldCheck, TrendingUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Manual() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manual de Uso Interactivo</h1>
          <p className="text-muted-foreground">Aprenda a sacar el máximo provecho de GanaderIA</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="Buscar temas..." className="pl-9 bg-muted/50" />
        </div>
      </div>

      <Card className="bg-gradient-to-r from-primary/20 to-transparent border-primary/20">
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-2">Video Tour: Primeros Pasos</h2>
            <p className="text-muted-foreground mb-4">Aprenda a configurar su finca, ingresar su primer animal y registrar la producción diaria en menos de 5 minutos.</p>
            <button className="flex items-center gap-2 text-primary font-bold hover:underline">
              <PlayCircle />
              Ver Tutorial (5:20)
            </button>
          </div>
          <div className="w-full md:w-64 h-36 bg-muted/50 rounded-lg flex items-center justify-center border border-border">
            <PlayCircle size={48} className="text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="text-primary" />
              Módulos Básicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="p-3 bg-muted/20 border border-border rounded hover:border-primary/50 cursor-pointer transition-colors">
              <h4 className="font-bold text-foreground mb-1">Inventario y Fichas</h4>
              <p className="text-muted-foreground">Cómo agregar animales, buscar por arete y leer la ficha clínica.</p>
            </div>
            <div className="p-3 bg-muted/20 border border-border rounded hover:border-primary/50 cursor-pointer transition-colors">
              <h4 className="font-bold text-foreground mb-1">Registro de Producción</h4>
              <p className="text-muted-foreground">Ingreso manual de litros diarios o carga masiva por ordeño.</p>
            </div>
            <div className="p-3 bg-muted/20 border border-border rounded hover:border-primary/50 cursor-pointer transition-colors">
              <h4 className="font-bold text-foreground mb-1">Manejo de Potreros</h4>
              <p className="text-muted-foreground">Cambio de estado de potreros y días de ocupación/descanso.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-primary" />
              Módulos Avanzados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="p-3 bg-muted/20 border border-border rounded hover:border-primary/50 cursor-pointer transition-colors">
              <h4 className="font-bold text-foreground mb-1">Raciones y Balance Nutricional</h4>
              <p className="text-muted-foreground">Cómo leer el costo por vaca/día según los ingredientes proporcionados.</p>
            </div>
            <div className="p-3 bg-muted/20 border border-border rounded hover:border-primary/50 cursor-pointer transition-colors">
              <h4 className="font-bold text-foreground mb-1">Centro Reproductivo</h4>
              <p className="text-muted-foreground">Flujo completo: Celo {'>'} Inseminación {'>'} Tacto {'>'} Parto.</p>
            </div>
            <div className="p-3 bg-muted/20 border border-border rounded hover:border-primary/50 cursor-pointer transition-colors">
              <h4 className="font-bold text-foreground mb-1">Inteligencia y Predicciones</h4>
              <p className="text-muted-foreground">Entendiendo el simulador de rentabilidad y alertas tempranas.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
