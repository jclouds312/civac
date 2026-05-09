import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "./components/layout";
import { AppStateProvider } from "./lib/data";
import { AuthProvider, useAuth } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import NotFound from "@/pages/not-found";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Alertas from "./pages/alertas";
import Inventario from "./pages/inventario";
import Ficha from "./pages/ficha";
import Reproduccion from "./pages/reproduccion";
import Produccion from "./pages/produccion";
import Genetica from "./pages/genetica";
import Potreros from "./pages/potreros";
import Alimentacion from "./pages/alimentacion";
import Insumos from "./pages/insumos";
import Semen from "./pages/semen";
import Costos from "./pages/costos";
import Personal from "./pages/personal";
import Prediccion from "./pages/prediccion";
import Co2 from "./pages/co2";
import Multifinca from "./pages/multifinca";
import Usuarios from "./pages/usuarios";
import Configuracion from "./pages/configuracion";
import Documentacion from "./pages/documentacion";
import Manual from "./pages/manual";
import Pesaje from "./pages/pesaje";
import Gps from "./pages/gps";

const queryClient = new QueryClient();

function AuthGate() {
  const { user } = useAuth();

  if (!user) return <Login />;

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/alertas" component={Alertas} />
        <Route path="/inventario" component={Inventario} />
        <Route path="/ficha" component={Ficha} />
        <Route path="/reproduccion" component={Reproduccion} />
        <Route path="/produccion" component={Produccion} />
        <Route path="/genetica" component={Genetica} />
        <Route path="/potreros" component={Potreros} />
        <Route path="/alimentacion" component={Alimentacion} />
        <Route path="/insumos" component={Insumos} />
        <Route path="/semen" component={Semen} />
        <Route path="/costos" component={Costos} />
        <Route path="/personal" component={Personal} />
        <Route path="/prediccion" component={Prediccion} />
        <Route path="/co2" component={Co2} />
        <Route path="/multifinca" component={Multifinca} />
        <Route path="/usuarios" component={Usuarios} />
        <Route path="/configuracion" component={Configuracion} />
        <Route path="/documentacion" component={Documentacion} />
        <Route path="/manual" component={Manual} />
        <Route path="/pesaje" component={Pesaje} />
        <Route path="/gps" component={Gps} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppStateProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <AuthGate />
              </WouterRouter>
              <Toaster />
            </AppStateProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
