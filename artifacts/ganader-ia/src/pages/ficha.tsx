import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppState } from "../lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Activity, Baby, Calendar, Scale, Syringe } from "lucide-react";

export default function Ficha() {
  const { animals } = useAppState();
  const [selectedId, setSelectedId] = useState<string>(animals[0]?.id || "");

  const animal = animals.find(a => a.id === selectedId) || animals[0];

  if (!animal) return <div>No hay animales</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ficha Individual</h1>
          <p className="text-muted-foreground">Detalle clínico y productivo</p>
        </div>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Seleccione un animal" />
          </SelectTrigger>
          <SelectContent>
            {animals.map(a => (
              <SelectItem key={a.id} value={a.id}>
                {a.id} - {a.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Perfil */}
        <Card className="col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-muted border-4 border-border flex items-center justify-center mb-4 overflow-hidden">
              <span className="text-4xl text-muted-foreground font-bold">{animal.nombre.charAt(0)}</span>
            </div>
            <h2 className="text-2xl font-bold">{animal.nombre}</h2>
            <p className="text-muted-foreground font-mono">{animal.id}</p>
            <div className="flex gap-2 mt-4">
              <Badge variant="outline" className="bg-primary/10 text-primary">{animal.estado}</Badge>
              <Badge variant="outline" className="bg-card text-foreground">{animal.raza}</Badge>
            </div>

            <div className="w-full mt-6 space-y-3 text-sm">
              <div className="flex justify-between p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Categoría</span>
                <span className="font-medium">{animal.categoria}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Lote</span>
                <span className="font-medium">{animal.lote}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Peso Actual</span>
                <span className="font-medium">{animal.peso} kg</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Partos</span>
                <span className="font-medium">{animal.partos}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-primary/10 text-primary border border-primary/20">
                <span className="font-semibold">Prod. Actual</span>
                <span className="font-bold">{animal.litrosDia} L/día</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles */}
        <Card className="col-span-1 md:col-span-2">
          <Tabs defaultValue="historia" className="w-full">
            <CardHeader className="border-b border-border pb-0 pt-4">
              <TabsList className="bg-transparent h-12 p-0 space-x-6 w-full justify-start overflow-x-auto">
                <TabsTrigger value="historia" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">
                  <Activity className="w-4 h-4 mr-2" />
                  Historia Clínica
                </TabsTrigger>
                <TabsTrigger value="reproduccion" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">
                  <Baby className="w-4 h-4 mr-2" />
                  Reproducción
                </TabsTrigger>
                <TabsTrigger value="eventos" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  Eventos
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-6">
              <TabsContent value="historia" className="space-y-4">
                <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/20">
                  <div className="p-3 bg-primary/20 text-primary rounded-full">
                    <Syringe size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Vacunación IBR/BVD</h4>
                    <p className="text-sm text-muted-foreground">Aplicada dosis de refuerzo anual.</p>
                  </div>
                  <span className="text-sm text-muted-foreground">15/03/2025</span>
                </div>
                <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/20">
                  <div className="p-3 bg-blue-500/20 text-blue-400 rounded-full">
                    <Scale size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Control de Peso</h4>
                    <p className="text-sm text-muted-foreground">Ganancia de +12kg desde último control.</p>
                  </div>
                  <span className="text-sm text-muted-foreground">01/03/2025</span>
                </div>
              </TabsContent>
              <TabsContent value="reproduccion">
                <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg">
                  No hay datos reproductivos recientes para mostrar.
                </div>
              </TabsContent>
              <TabsContent value="eventos">
                <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg">
                  No hay eventos registrados.
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
