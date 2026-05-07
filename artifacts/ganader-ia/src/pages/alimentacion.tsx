import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default function Alimentacion() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alimentación y Raciones</h1>
        <p className="text-muted-foreground">Formulación y balance nutricional</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Parámetros Base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Producción Esperada (L)</label>
              <Input defaultValue="16.4" type="number" className="bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Peso Promedio (kg)</label>
              <Input defaultValue="520" type="number" className="bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">% Grasa Leche</label>
              <Input defaultValue="3.8" type="number" className="bg-background" />
            </div>
            
            <div className="pt-4 mt-4 border-t border-border">
              <h4 className="text-sm font-bold mb-3 uppercase text-muted-foreground">Requerimientos Diarios</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Proteína</span><span className="font-bold">2,694 g</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Energía</span><span className="font-bold">53.7 Mcal</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Agua</span><span className="font-bold text-blue-400">89 L</span></div>
                <div className="flex justify-between mt-2 pt-2 border-t border-border"><span className="text-muted-foreground">Costo/Día/Vaca</span><span className="font-bold text-destructive">$11,566 COP</span></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Balance de Ración Actual</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Ingrediente</TableHead>
                  <TableHead className="text-right">MS (kg/día)</TableHead>
                  <TableHead className="text-right">Proteína (%)</TableHead>
                  <TableHead className="text-right">Energía (Mcal)</TableHead>
                  <TableHead className="text-right">Costo/Día</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-border">
                  <TableCell className="font-medium">Pasto Kikuyo</TableCell>
                  <TableCell className="text-right">12.5</TableCell>
                  <TableCell className="text-right">16.0</TableCell>
                  <TableCell className="text-right">28.5</TableCell>
                  <TableCell className="text-right">$2,500</TableCell>
                </TableRow>
                <TableRow className="border-border">
                  <TableCell className="font-medium">Concentrado 16%</TableCell>
                  <TableCell className="text-right">4.0</TableCell>
                  <TableCell className="text-right">16.0</TableCell>
                  <TableCell className="text-right">11.2</TableCell>
                  <TableCell className="text-right">$6,800</TableCell>
                </TableRow>
                <TableRow className="border-border">
                  <TableCell className="font-medium">Ensilaje de Maíz</TableCell>
                  <TableCell className="text-right">5.0</TableCell>
                  <TableCell className="text-right">8.5</TableCell>
                  <TableCell className="text-right">12.5</TableCell>
                  <TableCell className="text-right">$1,750</TableCell>
                </TableRow>
                <TableRow className="border-border">
                  <TableCell className="font-medium">Sal Mineralizada</TableCell>
                  <TableCell className="text-right">0.15</TableCell>
                  <TableCell className="text-right">0.0</TableCell>
                  <TableCell className="text-right">0.0</TableCell>
                  <TableCell className="text-right">$516</TableCell>
                </TableRow>
                <TableRow className="border-t-2 border-border bg-muted/20">
                  <TableCell className="font-bold">TOTAL APORTADO</TableCell>
                  <TableCell className="text-right font-bold text-primary">21.65</TableCell>
                  <TableCell className="text-right font-bold text-primary">14.1</TableCell>
                  <TableCell className="text-right font-bold text-primary">52.2</TableCell>
                  <TableCell className="text-right font-bold text-destructive">$11,566</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
