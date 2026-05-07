import { Map } from "lucide-react";

export default function Multifinca() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-md mx-auto">
      <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 border border-primary/20">
        <Map size={48} />
      </div>
      <h1 className="text-3xl font-bold mb-4">Módulo Multi-Finca</h1>
      <p className="text-muted-foreground mb-8 text-lg">
        Gestione múltiples propiedades, compare rendimientos y consolide la contabilidad desde un solo panel de control corporativo.
      </p>
      <div className="bg-muted/30 border border-border px-6 py-3 rounded-full text-sm font-medium text-foreground">
        Próximamente disponible en GanaderIA Enterprise
      </div>
    </div>
  );
}
