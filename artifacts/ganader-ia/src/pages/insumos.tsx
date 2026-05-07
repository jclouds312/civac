import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppState } from "../lib/data";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Insumos() {
  const { insumos, setInsumos } = useAppState();

  const getStatus = (stock: number, min: number) => {
    if (stock <= min) return { label: "Crítico", color: "text-destructive", bg: "bg-destructive" };
    if (stock <= min * 1.5) return { label: "Bajo", color: "text-amber-400", bg: "bg-amber-400" };
    return { label: "Óptimo", color: "text-primary", bg: "bg-primary" };
  };

  const criticos = insumos.filter(i => i.stock <= i.minimo).length;

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newInsumo = {
      nombre: formData.get('nombre') as string,
      categoria: formData.get('categoria') as string,
      stock: Number(formData.get('stock')),
      maximo: Number(formData.get('maximo')),
      minimo: Number(formData.get('minimo')),
      unidad: formData.get('unidad') as string,
    };
    setInsumos([newInsumo, ...insumos]);
  };

  const updateStock = (idx: number, delta: number) => {
    const updated = [...insumos];
    updated[idx].stock = Math.max(0, updated[idx].stock + delta);
    setInsumos(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Insumos y Kardex</h1>
          <p className="text-muted-foreground">Control de inventario de medicamentos y alimentos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Agregar Insumo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAdd}>
              <DialogHeader>
                <DialogTitle>Nuevo Insumo</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className="text-right">Nombre</Label>
                  <Input id="nombre" name="nombre" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="categoria" className="text-right">Categoría</Label>
                  <Input id="categoria" name="categoria" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Stock Actual</Label>
                  <Input id="stock" name="stock" type="number" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="minimo" className="text-right">Min / Max</Label>
                  <div className="col-span-3 flex gap-2">
                    <Input id="minimo" name="minimo" type="number" placeholder="Min" required />
                    <Input id="maximo" name="maximo" type="number" placeholder="Max" required />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unidad" className="text-right">Unidad</Label>
                  <Input id="unidad" name="unidad" className="col-span-3" placeholder="Ej. kg, frascos" required />
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
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-white">{insumos.length}</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Productos</span>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/30 border">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-destructive">{criticos}</span>
            <span className="text-xs text-destructive/80 mt-1 uppercase tracking-wider">Stock Crítico</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-primary">$5.3M</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Valor Inventario</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-white">{new Set(insumos.map(i => i.categoria)).size}</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Categorías</span>
          </CardContent>
        </Card>
      </div>

      {criticos > 0 && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-destructive shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-destructive">Productos en nivel crítico</h4>
            <p className="text-sm text-destructive/80 mt-1">Hay {criticos} insumos por debajo del stock mínimo. Se recomienda generar orden de compra.</p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Insumo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Nivel de Stock</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Ajuste</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insumos.map((i, idx) => {
                const status = getStatus(i.stock, i.minimo);
                const percent = Math.min(100, Math.max(0, (i.stock / i.maximo) * 100));
                
                return (
                  <TableRow key={idx} className="border-border">
                    <TableCell className="font-medium">{i.nombre}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{i.categoria}</TableCell>
                    <TableCell className="w-[300px]">
                      <div className="flex flex-col gap-1 mt-2 mb-2">
                        <div className="flex justify-between text-xs">
                          <span className={status.color}>{status.label}</span>
                          <span className="text-muted-foreground">Min: {i.minimo}</span>
                        </div>
                        <Progress value={percent} className={`h-1.5 bg-muted/50 [&>div]:${status.bg}`} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {i.stock} <span className="text-xs text-muted-foreground font-normal">{i.unidad}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="icon" onClick={() => updateStock(idx, -1)} className="h-7 w-7 border-border hover:bg-muted/50"><Minus size={14} /></Button>
                        <Button variant="outline" size="icon" onClick={() => updateStock(idx, 1)} className="h-7 w-7 border-border bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"><Plus size={14} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
