import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "../lib/data";
import { Search, Plus } from "lucide-react";
import { useState } from "react";

export default function Inventario() {
  const { animals } = useAppState();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventario Animal</h1>
          <p className="text-muted-foreground">Gestión y control de rebaño</p>
        </div>
        <Button className="gap-2">
          <Plus size={16} />
          Agregar Animal
        </Button>
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
