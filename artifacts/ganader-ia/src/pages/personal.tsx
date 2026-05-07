import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppState } from "../lib/data";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Personal() {
  const { personal, setPersonal } = useAppState();

  const formatearDinero = (monto: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(monto);
  };

  const valorHoraExtra = 12500;
  const nominaTotal = personal.reduce((acc, p) => acc + p.salario + (p.hExtras * valorHoraExtra), 0);
  const extrasTotal = personal.reduce((acc, p) => acc + p.hExtras, 0);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEmpleado = {
      nombre: formData.get('nombre') as string,
      cargo: formData.get('cargo') as string,
      cedula: formData.get('cedula') as string,
      ingreso: formData.get('ingreso') as string,
      salario: Number(formData.get('salario')),
      hExtras: 0,
      eps: formData.get('eps') as string,
      arl: formData.get('arl') as string,
    };
    setPersonal([...personal, newEmpleado]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Personal y Nómina</h1>
          <p className="text-muted-foreground">Gestión de empleados y pagos mensuales</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Agregar Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAdd}>
              <DialogHeader>
                <DialogTitle>Nuevo Empleado</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className="text-right">Nombre</Label>
                  <Input id="nombre" name="nombre" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cargo" className="text-right">Cargo</Label>
                  <Input id="cargo" name="cargo" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cedula" className="text-right">Cédula</Label>
                  <Input id="cedula" name="cedula" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="salario" className="text-right">Salario Base</Label>
                  <Input id="salario" name="salario" type="number" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ingreso" className="text-right">Ingreso</Label>
                  <Input id="ingreso" name="ingreso" className="col-span-3" placeholder="DD/MM/YYYY" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="eps" className="text-right">EPS / ARL</Label>
                  <div className="col-span-3 flex gap-2">
                    <Input id="eps" name="eps" placeholder="EPS" required />
                    <Input id="arl" name="arl" placeholder="ARL" required />
                  </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-white">{personal.length}</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Empleados Activos</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-primary">{formatearDinero(nominaTotal)}</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Nómina Mes</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-amber-400">{extrasTotal}h</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Horas Extras</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Empleado / Cargo</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Salario Base</TableHead>
                <TableHead className="text-center">H.Extras</TableHead>
                <TableHead>Seguridad Social</TableHead>
                <TableHead className="text-right text-primary font-bold">Total Pagar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personal.map((p, idx) => {
                const total = p.salario + (p.hExtras * valorHoraExtra);
                return (
                  <TableRow key={idx} className="border-border">
                    <TableCell>
                      <div className="font-bold text-foreground">{p.nombre}</div>
                      <div className="text-xs text-muted-foreground">{p.cargo}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.cedula}</TableCell>
                    <TableCell>{formatearDinero(p.salario)}</TableCell>
                    <TableCell className="text-center">
                      <span className={p.hExtras > 0 ? "text-amber-500 font-bold" : "text-muted-foreground"}>
                        {p.hExtras}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.eps} / {p.arl}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatearDinero(total)}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/20 border-t-2 border-border hover:bg-muted/20">
                <TableCell colSpan={3} className="font-bold">TOTALES</TableCell>
                <TableCell className="text-center font-bold text-amber-500">{extrasTotal}</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right font-bold text-primary text-lg">{formatearDinero(nominaTotal)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
