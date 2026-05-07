import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Semen() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Semen y Embriones</h1>
          <p className="text-muted-foreground">Inventario genético y termos criogénicos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Agregar Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form>
              <DialogHeader>
                <DialogTitle>Nuevo Material Genético</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="toro" className="text-right">Toro / Cruce</Label>
                  <Input id="toro" name="toro" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipo" className="text-right">Tipo</Label>
                  <Input id="tipo" name="tipo" className="col-span-3" placeholder="Semen o Embrión" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="raza" className="text-right">Raza</Label>
                  <Input id="raza" name="raza" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cantidad" className="text-right">Cantidad</Label>
                  <Input id="cantidad" name="cantidad" type="number" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="termo" className="text-right">Ubicación</Label>
                  <Input id="termo" name="termo" className="col-span-3" placeholder="Ej. Termo A" required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="button">Guardar</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-white">467</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Total Pajillas</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-white">4</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Toros Activos</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-primary">16</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Embriones</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-white">3</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Termos en Uso</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Catálogo de Semen</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Toro</TableHead>
                  <TableHead>Raza</TableHead>
                  <TableHead>DEP Leche</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="text-right">Pajillas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-border">
                  <TableCell className="font-bold text-foreground">Titan USA</TableCell>
                  <TableCell className="text-muted-foreground">Holstein</TableCell>
                  <TableCell className="text-primary font-medium">+1105L</TableCell>
                  <TableCell><Badge variant="outline">Termo A</Badge></TableCell>
                  <TableCell className="text-right font-bold">194</TableCell>
                </TableRow>
                <TableRow className="border-border">
                  <TableCell className="font-bold text-foreground">Altisimo</TableCell>
                  <TableCell className="text-muted-foreground">Holstein</TableCell>
                  <TableCell className="text-primary font-medium">+1240L</TableCell>
                  <TableCell><Badge variant="outline">Termo A</Badge></TableCell>
                  <TableCell className="text-right font-bold">120</TableCell>
                </TableRow>
                <TableRow className="border-border">
                  <TableCell className="font-bold text-foreground">Campeon III</TableCell>
                  <TableCell className="text-muted-foreground">Holstein</TableCell>
                  <TableCell className="text-primary font-medium">+980L</TableCell>
                  <TableCell><Badge variant="outline">Termo A</Badge></TableCell>
                  <TableCell className="text-right font-bold">98</TableCell>
                </TableRow>
                <TableRow className="border-border">
                  <TableCell className="font-bold text-foreground">Furacao</TableCell>
                  <TableCell className="text-muted-foreground">Gyr</TableCell>
                  <TableCell className="text-primary font-medium">+850L</TableCell>
                  <TableCell><Badge variant="outline">Termo B</Badge></TableCell>
                  <TableCell className="text-right font-bold text-amber-500">55</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Embriones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-border bg-muted/20 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold">Rosaura x Altisimo</div>
                <Badge className="bg-primary/20 text-primary border-primary/30">Grado A</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Disponible</span>
                <span className="font-bold">8 unidades</span>
              </div>
            </div>
            
            <div className="p-4 border border-border bg-muted/20 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold">Estrella x Titan USA</div>
                <Badge className="bg-primary/20 text-primary border-primary/30">Grado A</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Disponible</span>
                <span className="font-bold">5 unidades</span>
              </div>
            </div>

            <div className="p-4 border border-border bg-muted/20 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold">Palmera x Campeon III</div>
                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">Grado B</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Disponible</span>
                <span className="font-bold">3 unidades</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
