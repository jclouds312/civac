import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Usuarios() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">Administración de accesos al sistema</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Acceso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border">
                <TableCell className="font-bold text-foreground">Admin Propietario</TableCell>
                <TableCell className="text-muted-foreground">admin@finca.com</TableCell>
                <TableCell><Badge variant="outline" className="border-primary text-primary">Propietario</Badge></TableCell>
                <TableCell><Badge className="bg-primary/20 text-primary border-none">Activo</Badge></TableCell>
                <TableCell className="text-muted-foreground text-sm">Hace 2 horas</TableCell>
              </TableRow>
              <TableRow className="border-border">
                <TableCell className="font-bold text-foreground">Carlos Meza</TableCell>
                <TableCell className="text-muted-foreground">carlos@finca.com</TableCell>
                <TableCell><Badge variant="outline">Editor Campo</Badge></TableCell>
                <TableCell><Badge className="bg-primary/20 text-primary border-none">Activo</Badge></TableCell>
                <TableCell className="text-muted-foreground text-sm">Ayer 18:30</TableCell>
              </TableRow>
              <TableRow className="border-border">
                <TableCell className="font-bold text-foreground">Ana Gomez</TableCell>
                <TableCell className="text-muted-foreground">ana@finca.com</TableCell>
                <TableCell><Badge variant="outline">Finanzas</Badge></TableCell>
                <TableCell><Badge className="bg-primary/20 text-primary border-none">Activo</Badge></TableCell>
                <TableCell className="text-muted-foreground text-sm">Hoy 08:15</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
