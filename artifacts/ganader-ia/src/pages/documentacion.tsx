import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Book, FileText, Code, Database } from "lucide-react";

export default function Documentacion() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Documentación Técnica</h1>
        <p className="text-muted-foreground">Arquitectura y especificaciones del sistema GanaderIA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors">
          <CardContent className="p-6 text-center">
            <Book className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-bold">Guía de Inicio</h3>
          </CardContent>
        </Card>
        <Card className="bg-muted/10 border-border cursor-pointer hover:bg-muted/20 transition-colors">
          <CardContent className="p-6 text-center">
            <Database className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold">Esquema de Datos</h3>
          </CardContent>
        </Card>
        <Card className="bg-muted/10 border-border cursor-pointer hover:bg-muted/20 transition-colors">
          <CardContent className="p-6 text-center">
            <Code className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold">API & Integración</h3>
          </CardContent>
        </Card>
        <Card className="bg-muted/10 border-border cursor-pointer hover:bg-muted/20 transition-colors">
          <CardContent className="p-6 text-center">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold">Formatos CSV</h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preguntas Técnicas Frecuentes</CardTitle>
          <CardDescription>Detalles sobre la implementación y mantenimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>¿Cómo funciona la sincronización offline?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                GanaderIA implementa un Service Worker que cachea los assets estáticos y utiliza IndexedDB para almacenar los datos operacionales de la finca. Cuando el dispositivo recupera conexión, la aplicación envía el delta de cambios al servidor principal asegurando integridad transaccional.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Algoritmo de predicción de partos</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                El sistema utiliza una base de 283 días para raza Holstein y 292 días para Brahman, ajustado por una desviación estándar según el histórico del animal (hasta 3 partos anteriores). La IA recalcula este valor ajustándolo al score genético (DEP) y variables climáticas si están disponibles.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Cálculo de Huella de Carbono (Metodología)</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                La emisión de Metano (CH4) entérico se calcula según las directrices del Nivel 2 del IPCC 2019, tomando como base el peso metabólico del animal, la digestibilidad de la dieta (kikuyo vs concentrado) y los litros de leche producidos. Las capturas se asumen fijas por hectárea de sistema silvopastoril registrado en potreros.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Exportación y Backups</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Los datos pueden ser exportados a Excel (CSV) desde cada módulo respectivo. El sistema además realiza backups en la nube a las 00:00 GMT-5 todos los días para cuentas premium.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
