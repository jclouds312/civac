import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAppState } from "../lib/data";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

export default function Alertas() {
  const { alertas, setAlertas } = useAppState();

  const resolveAlert = (id: number) => {
    setAlertas(alertas.filter(a => a.id !== id));
  };

  const getIcon = (type: string) => {
    if (type === 'danger') return <AlertCircle className="text-destructive" size={20} />;
    if (type === 'warning') return <AlertTriangle className="text-amber-400" size={20} />;
    if (type === 'info') return <Info className="text-blue-400" size={20} />;
    return <CheckCircle className="text-primary" size={20} />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertas del Sistema</h1>
        <p className="text-muted-foreground">Centro de atención requerida</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-12"></TableHead>
                <TableHead>Alerta</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Tiempo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No hay alertas activas
                  </TableCell>
                </TableRow>
              ) : (
                alertas.map(alerta => (
                  <TableRow key={alerta.id} className="border-border">
                    <TableCell className="pl-4">
                      {getIcon(alerta.type)}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {alerta.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {alerta.desc}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {alerta.time}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => resolveAlert(alerta.id)} className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                        Marcar Resuelta
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
