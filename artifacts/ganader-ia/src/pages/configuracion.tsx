import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function Configuracion() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Configuración guardada",
      description: "Los cambios han sido aplicados exitosamente al sistema.",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Ajustes generales de la cuenta y sistema</p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Finca</CardTitle>
            <CardDescription>Datos principales para reportes y geolocalización</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre de Finca</Label>
                <Input defaultValue="Hacienda La Esperanza" />
              </div>
              <div className="space-y-2">
                <Label>Propietario / Representante</Label>
                <Input defaultValue="Admin Propietario" />
              </div>
              <div className="space-y-2">
                <Label>Ubicación (Municipio)</Label>
                <Input defaultValue="Rionegro, Antioquia" />
              </div>
              <div className="space-y-2">
                <Label>Altitud (msnm)</Label>
                <Input type="number" defaultValue="2120" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regionalización y Moneda</CardTitle>
            <CardDescription>Ajustes de localización</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Moneda Principal</Label>
                <Select defaultValue="COP">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COP">Peso Colombiano (COP)</SelectItem>
                    <SelectItem value="USD">Dólar (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zona Horaria</Label>
                <Select defaultValue="America/Bogota">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Bogota">America/Bogota (GMT-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>Preferencias de alertas del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <Label className="text-base">Alertas Reproductivas</Label>
                <p className="text-sm text-muted-foreground">Notificar partos y celos próximos</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <Label className="text-base">Stock de Insumos</Label>
                <p className="text-sm text-muted-foreground">Avisar cuando se alcance el mínimo</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Reporte Semanal</Label>
                <p className="text-sm text-muted-foreground">Enviar resumen de P&G al correo</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </div>
      </div>
    </div>
  );
}
