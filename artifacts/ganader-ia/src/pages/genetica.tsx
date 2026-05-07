import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Genetica() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Genética y Pedigrí</h1>
        <p className="text-muted-foreground">Evaluación y progreso genético del hato</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-white">70.8</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Score Genético</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-white">11</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Evaluados</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-primary">+820</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Mejor DEP (Rosaura)</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0f1712] border-none">
          <CardContent className="p-4 flex flex-col">
            <span className="text-3xl font-bold text-white">11/13</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Total Registrados</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Animales por DEP (Leche)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Rosaura (A-0042)</span>
                <span className="text-primary font-bold">+820</span>
              </div>
              <Progress value={90} className="h-2 bg-muted/50 [&>div]:bg-primary" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Estrella (A-0604)</span>
                <span className="text-primary font-bold">+750</span>
              </div>
              <Progress value={82} className="h-2 bg-muted/50 [&>div]:bg-primary" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Cielo (A-0087)</span>
                <span className="text-primary font-bold">+680</span>
              </div>
              <Progress value={75} className="h-2 bg-muted/50 [&>div]:bg-primary" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Niebla (A-0445)</span>
                <span className="text-primary font-bold">+610</span>
              </div>
              <Progress value={68} className="h-2 bg-muted/50 [&>div]:bg-primary" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Palmera (A-0133)</span>
                <span className="text-primary font-bold">+590</span>
              </div>
              <Progress value={65} className="h-2 bg-muted/50 [&>div]:bg-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedigrí Destacado - Rosaura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative border border-border p-6 rounded-lg bg-muted/10">
              <div className="flex justify-center mb-8 relative">
                <div className="absolute top-full left-1/2 w-px h-8 bg-border -translate-x-1/2"></div>
                <div className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-md text-center">
                  <div className="font-bold text-primary">Rosaura</div>
                  <div className="text-xs text-muted-foreground">Holstein • DEP +820</div>
                </div>
              </div>
              
              <div className="flex justify-between relative mt-8">
                <div className="absolute -top-8 left-1/2 w-3/4 h-px bg-border -translate-x-1/2"></div>
                <div className="absolute -top-8 left-[12.5%] w-px h-8 bg-border"></div>
                <div className="absolute -top-8 right-[12.5%] w-px h-8 bg-border"></div>

                <div className="w-5/12 text-center">
                  <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-md">
                    <div className="font-bold text-blue-400">Padre</div>
                    <div className="text-xs text-muted-foreground">Titan USA</div>
                  </div>
                </div>
                
                <div className="w-5/12 text-center">
                  <div className="px-3 py-2 bg-pink-500/10 border border-pink-500/20 rounded-md">
                    <div className="font-bold text-pink-400">Madre</div>
                    <div className="text-xs text-muted-foreground">Rosalía</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
