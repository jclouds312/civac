import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppState } from "../lib/data";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Reproduccion() {
  const { reproduccion, setReproduccion } = useAppState();

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRep = {
      arete: formData.get('arete') as string,
      animal: formData.get('animal') as string,
      servicio: formData.get('servicio') as string,
      fechaParto: formData.get('fechaParto') as string,
      dias: Number(formData.get('dias')),
      partosPrev: Number(formData.get('partosPrev') || 0),
      estado: formData.get('estado') as string,
    };
    setReproduccion([newRep, ...reproduccion]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reproducción y Ciclos</h1>
          <p className="text-muted-foreground">Control de montas, I.A. y partos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Registrar Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAdd}>
              <DialogHeader>
                <DialogTitle>Registrar Gestación</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="arete" className="text-right">Arete</Label>
                  <Input id="arete" name="arete" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="animal" className="text-right">Animal</Label>
                  <Input id="animal" name="animal" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="servicio" className="text-right">Servicio</Label>
                  <Input id="servicio" name="servicio" className="col-span-3" placeholder="Ej. IA Altisimo" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fechaParto" className="text-right">Fecha Prob. Parto</Label>
                  <Input id="fechaParto" name="fechaParto" className="col-span-3" placeholder="DD/MM/YYYY" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dias" className="text-right">Días Restantes</Label>
                  <Input id="dias" name="dias" type="number" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="estado" className="text-right">Estado</Label>
                  <Input id="estado" name="estado" className="col-span-3" defaultValue="Normal" required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="submit">Guardar</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase mb-1">Tasa Concepción</div>
            <div className="text-3xl font-bold text-white">62%</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase mb-1">Próximos Partos</div>
            <div className="text-3xl font-bold text-primary">{reproduccion.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase mb-1">Anestros {'>'} 90d</div>
            <div className="text-3xl font-bold text-amber-400">8</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase mb-1">Gestantes</div>
            <div className="text-3xl font-bold text-purple-400">1</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Próximos Partos y Gestaciones</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Arete / Animal</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Fecha Prob. Parto</TableHead>
                  <TableHead>Días Restantes</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reproduccion.map(r => (
                  <TableRow key={r.arete} className="border-border">
                    <TableCell>
                      <div className="font-medium text-foreground">{r.animal}</div>
                      <div className="text-xs text-muted-foreground font-mono">{r.arete}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{r.servicio}</TableCell>
                    <TableCell className="text-foreground">{r.fechaParto}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${r.dias <= 15 ? 'text-amber-400' : 'text-primary'}`}>
                        {r.dias}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        r.estado === 'Normal' ? 'bg-primary/10 text-primary' : 
                        r.estado === 'Vigilar' ? 'bg-amber-400/10 text-amber-400' : 
                        'bg-blue-400/10 text-blue-400'
                      }>
                        {r.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-500">Atención Reproductiva</h4>
              <p className="text-sm text-amber-500/80 mt-1">Hay 8 vacas con anestro mayor a 90 días con diagnóstico de IA pendiente.</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Eficiencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-muted-foreground text-sm">Tasa de Preñez</span>
                <span className="font-bold text-foreground">52%</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-muted-foreground text-sm">Vacas Abiertas</span>
                <span className="font-bold text-foreground">2</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-muted-foreground text-sm">Prom. Días Abiertos</span>
                <span className="font-bold text-destructive">142d</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Destetes</span>
                <span className="font-bold text-primary">94%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
