import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "../lib/data";

export default function Potreros() {
  const { potreros } = useAppState();

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Disponible": return "bg-primary/20 text-primary border-primary/30";
      case "Ocupado": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Rotar pronto": return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case "Rotar ya": return "bg-destructive/20 text-destructive border-destructive/30";
      case "Descanso": return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Potreros y Praderas</h1>
          <p className="text-muted-foreground">Gestión de rotación y aforos</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-white">6</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Potreros</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-white">27.1</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Hectáreas (ha)</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-primary">1</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Disponible</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-gray-400">1</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">En Descanso</span>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-amber-500">1</span>
            <span className="text-xs text-amber-500/80 mt-1 uppercase tracking-wider">Rotar Urgente</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {potreros.map(p => (
          <Card key={p.id}>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{p.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{p.hectareas} ha • {p.pasto}</p>
                </div>
                <Badge variant="outline" className={getStatusColor(p.estado)}>
                  {p.estado}
                </Badge>
              </div>

              <div className="space-y-2 mt-4 text-sm">
                {p.estado === 'Ocupado' && (
                  <div className="flex justify-between border-b border-border pb-1">
                    <span className="text-muted-foreground">Días Ocupado</span>
                    <span className="font-medium text-blue-400">{p.diasOcupado} días</span>
                  </div>
                )}
                {p.estado === 'Rotar pronto' && (
                  <div className="flex justify-between border-b border-border pb-1">
                    <span className="text-muted-foreground">Días Restantes</span>
                    <span className="font-medium text-amber-500">{p.diasRestantes} días</span>
                  </div>
                )}
                {(p.estado === 'Descanso' || p.estado === 'Disponible') && (
                  <div className="flex justify-between border-b border-border pb-1">
                    <span className="text-muted-foreground">Días Descanso</span>
                    <span className="font-medium">{p.diasDescanso} días</span>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">Ciclo Rotación</span>
                  <span className="font-medium">{p.diasRotacion || '-'} días</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
