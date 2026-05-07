import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "../lib/data";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Inventario() {
  const { animals, setAnimals } = useAppState();
  const [search, setSearch] = useState("");

  const filtered = animals.filter(a => 
    a.nombre.toLowerCase().includes(search.toLowerCase()) || 
    a.id.toLowerCase().includes(search.toLowerCase())
  );

  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case "Producción": return "bg-primary/20 text-primary border-primary/30";
      case "Seca": return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case "Tratamiento": return "bg-destructive/20 text-destructive border-destructive/30";
      case "Gestante": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Destete": return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "Abierta": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAnimal = {
      id: formData.get('arete') as string,
      nombre: formData.get('nombre') as string,
      raza: formData.get('raza') as string,
      categoria: formData.get('categoria') as string,
      peso: Number(formData.get('peso')),
      lote: formData.get('lote') as string,
      estado: formData.get('estado') as string,
      litrosDia: Number(formData.get('litrosDia') || 0),
      partos: Number(formData.get('partos') || 0),
    };
    setAnimals([newAnimal, ...animals]);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventario Animal</h1>
          <p className="text-muted-foreground">Gestión y control de rebaño</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Agregar Animal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAdd}>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Animal</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="arete" className="text-right">Arete</Label>
                  <Input id="arete" name="arete" className="col-span-3" required placeholder="Ej. A-1234" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className="text-right">Nombre</Label>
                  <Input id="nombre" name="nombre" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="raza" className="text-right">Raza</Label>
                  <Input id="raza" name="raza" className="col-span-3" required defaultValue="Holstein" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="categoria" className="text-right">Categoría</Label>
                  <div className="col-span-3">
                    <Select name="categoria" defaultValue="Vaca adulta">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vaca adulta">Vaca adulta</SelectItem>
                        <SelectItem value="Novilla">Novilla</SelectItem>
                        <SelectItem value="Ternero">Ternero</SelectItem>
                        <SelectItem value="Toro">Toro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="peso" className="text-right">Peso (kg)</Label>
                  <Input id="peso" name="peso" type="number" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="estado" className="text-right">Estado</Label>
                  <div className="col-span-3">
                    <Select name="estado" defaultValue="Producción">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Producción">Producción</SelectItem>
                        <SelectItem value="Seca">Seca</SelectItem>
                        <SelectItem value="Gestante">Gestante</SelectItem>
                        <SelectItem value="Abierta">Abierta</SelectItem>
                        <SelectItem value="Tratamiento">Tratamiento</SelectItem>
                        <SelectItem value="Destete">Destete</SelectItem>
                        <SelectItem value="Activo">Activo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lote" className="text-right">Lote</Label>
                  <Input id="lote" name="lote" className="col-span-3" defaultValue="Lote A" />
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-2xl font-bold text-white">{animals.length}</span>
            <span className="text-xs text-muted-foreground uppercase">Total</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-2xl font-bold text-primary">5</span>
            <span className="text-xs text-muted-foreground uppercase">En Producción</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-2xl font-bold text-purple-400">1</span>
            <span className="text-xs text-muted-foreground uppercase">Gestante</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-2xl font-bold text-destructive">1</span>
            <span className="text-xs text-muted-foreground uppercase">Tratamiento</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-2xl font-bold text-blue-400">96L</span>
            <span className="text-xs text-muted-foreground uppercase">Leche/Día</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Buscar por arete o nombre..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-border"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Arete</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Raza</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">L/Día</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(a => (
              <TableRow key={a.id} className="border-border">
                <TableCell className="font-mono text-xs">{a.id}</TableCell>
                <TableCell className="font-medium text-foreground">{a.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{a.raza}</TableCell>
                <TableCell className="text-muted-foreground">{a.categoria}</TableCell>
                <TableCell className="text-muted-foreground">{a.peso} kg</TableCell>
                <TableCell className="text-muted-foreground">{a.lote}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getBadgeColor(a.estado)}>
                    {a.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">{a.litrosDia || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
