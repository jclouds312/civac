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
import AdminDashboard from "./pages/admin-dashboard";
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
import PesajeManual from "./pages/pesaje-manual";
import Gps from "./pages/gps";
import Planes from "./pages/planes";
import Lotes from "./pages/lotes";
import Datos from "./pages/datos";

const queryClient = new QueryClient();

function HomeRoute() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminDashboard /> : <Dashboard />;
}

function AdminGate() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen" style={{ background:"linear-gradient(145deg,#040d1a,#071325 50%,#040d1a)", fontFamily:"'Space Grotesk','Sora',sans-serif" }}>
      <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 border-b" style={{ background:"rgba(4,13,26,0.95)", borderColor:"rgba(255,149,0,0.15)", backdropFilter:"blur(16px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(255,149,0,0.15)", border:"1px solid rgba(255,149,0,0.4)" }}>
            <span className="text-sm">👑</span>
          </div>
          <div>
            <span className="font-black text-white text-sm">GanaderIA PRO</span>
            <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full font-bold" style={{ background:"rgba(255,149,0,0.15)", color:"#ff9500", border:"1px solid rgba(255,149,0,0.3)" }}>Panel Administrador</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40">{user?.email}</span>
          <button onClick={logout} className="text-xs px-3 py-1.5 rounded-xl transition-colors" style={{ background:"rgba(255,80,80,0.1)", color:"#ff7070", border:"1px solid rgba(255,80,80,0.25)" }}>
            Cerrar sesión
          </button>
        </div>
      </div>
      <div className="p-6">
        <AdminDashboard />
      </div>
    </div>
  );
}

function AuthGate() {
  const { user } = useAuth();

  if (!user) return <Login />;

  if (user.role === "admin") return <AdminGate />;

  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomeRoute} />
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
        <Route path="/pesaje-manual" component={PesajeManual} />
        <Route path="/gps" component={Gps} />
        <Route path="/planes" component={Planes} />
        <Route path="/lotes" component={Lotes} />
        <Route path="/datos" component={Datos} />
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
