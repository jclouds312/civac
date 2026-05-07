import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Bell,
  List, Activity, ActivitySquare, Baby, Dna,
  Wheat, Package, TestTube,
  DollarSign, Users, LineChart, Leaf, Map,
  Settings, BookOpen, UserCircle, HelpCircle,
  Menu, X
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const NavItem = ({ href, icon: Icon, label, badge }: { href: string, icon: any, label: string, badge?: number }) => (
    <Link href={href} onClick={() => setIsMobileOpen(false)}>
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-md mx-2 my-1 transition-colors cursor-pointer ${
        isActive(href) ? "bg-primary/20 text-primary font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}>
        <Icon size={18} />
        <span className="flex-1 text-sm">{label}</span>
        {badge ? (
          <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        ) : null}
      </div>
    </Link>
  );

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-4">
      <h3 className="px-6 text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background dark text-foreground">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-primary">
            <LayoutDashboard size={24} />
            <span className="font-bold text-lg text-foreground tracking-tight">Ganader<span className="text-primary">IA</span></span>
          </div>
          <button className="lg:hidden text-muted-foreground" onClick={() => setIsMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="py-4">
          <Section title="Principal">
            <NavItem href="/" icon={LayoutDashboard} label="Tablero KPIs" />
            <NavItem href="/alertas" icon={Bell} label="Alertas" badge={4} />
          </Section>

          <Section title="Animales">
            <NavItem href="/inventario" icon={List} label="Inventario" />
            <NavItem href="/ficha" icon={ActivitySquare} label="Ficha Individual" />
            <NavItem href="/reproduccion" icon={Baby} label="Reproducción" />
            <NavItem href="/produccion" icon={Activity} label="Producción" />
            <NavItem href="/genetica" icon={Dna} label="Genética" />
          </Section>

          <Section title="Campo">
            <NavItem href="/potreros" icon={Map} label="Potreros" />
            <NavItem href="/alimentacion" icon={Wheat} label="Alimentación" />
          </Section>

          <Section title="Gestión">
            <NavItem href="/insumos" icon={Package} label="Insumos" badge={3} />
            <NavItem href="/semen" icon={TestTube} label="Semen y Embriones" />
            <NavItem href="/costos" icon={DollarSign} label="Costos y P&G" />
            <NavItem href="/personal" icon={Users} label="Personal" />
          </Section>

          <Section title="Inteligencia">
            <NavItem href="/prediccion" icon={LineChart} label="Predicciones IA" />
            <NavItem href="/co2" icon={Leaf} label="Huella de Carbono" />
            <NavItem href="/multifinca" icon={Map} label="Multi-Finca" />
          </Section>

          <Section title="Sistema">
            <NavItem href="/usuarios" icon={UserCircle} label="Usuarios" />
            <NavItem href="/configuracion" icon={Settings} label="Configuración" />
            <NavItem href="/documentacion" icon={BookOpen} label="Documentación" />
            <NavItem href="/manual" icon={HelpCircle} label="Manual de Uso" />
          </Section>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-foreground" onClick={() => setIsMobileOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Sync activo
            </div>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
