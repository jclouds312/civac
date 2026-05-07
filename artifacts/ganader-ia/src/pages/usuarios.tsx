import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCircle, Shield, Stethoscope, Milk, BarChart3, Search, Plus, Edit, Trash2, CheckCircle, Clock } from "lucide-react";
import { ACCOUNTS, Account } from "@/lib/auth";
import { useAuth } from "@/lib/auth";

const roleLabel: Record<string, string> = {
  admin: "Administrador",
  vet: "Veterinario",
  field: "Personal de campo",
  viewer: "Solo lectura",
};

const roleColors: Record<string, string> = {
  admin: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  vet: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  field: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  viewer: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
};

const avatarColors: Record<string, string> = {
  admin: "bg-emerald-600",
  vet: "bg-blue-600",
  field: "bg-orange-500",
  viewer: "bg-purple-600",
};

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield size={14} />,
  vet: <Stethoscope size={14} />,
  field: <Milk size={14} />,
  viewer: <BarChart3 size={14} />,
};

const PERMS_LABELS: Record<string, string> = {
  inventario: "Inventario",
  produccion: "Producción",
  reproduccion: "Reproducción",
  genetica: "Genética",
  potreros: "Potreros",
  alimentacion: "Alimentación",
  insumos: "Insumos",
  semen: "Semen",
  costos: "Costos",
  personal: "Personal",
  prediccion: "Predicciones IA",
  co2: "CO₂",
  alertas: "Alertas",
  multifinca: "Multi-Finca",
  usuarios: "Usuarios",
  configuracion: "Config.",
  documentacion: "Docs",
};

export default function Usuarios() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Account | null>(null);
  const { user: currentUser } = useAuth();

  const filtered = ACCOUNTS.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    a.cargo.toLowerCase().includes(search.toLowerCase()) ||
    a.role.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#2d1a5c] via-[#3a1a6e] to-[#1a1040] p-6 text-white relative overflow-hidden">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
          <UserCircle className="w-32 h-32" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UserCircle size={20} className="text-purple-300" />
              <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/30 text-xs">{ACCOUNTS.length} cuentas configuradas</Badge>
            </div>
            <h1 className="text-2xl font-bold mb-1">Gestión de Usuarios</h1>
            <p className="text-purple-200/70 text-sm">Roles, permisos y acceso al sistema</p>
          </div>
          <Button disabled className="bg-white/15 border border-white/20 text-white/60 gap-2 cursor-not-allowed text-xs">
            <Plus size={14} />
            Invitar usuario (próx.)
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total usuarios", value: ACCOUNTS.length, color: "text-purple-500" },
          { label: "Administradores", value: ACCOUNTS.filter(a=>a.role==='admin').length, color: "text-emerald-500" },
          { label: "Técnicos (vet/campo)", value: ACCOUNTS.filter(a=>a.role==='vet'||a.role==='field').length, color: "text-blue-500" },
          { label: "Solo lectura", value: ACCOUNTS.filter(a=>a.role==='viewer').length, color: "text-amber-500" },
        ].map(stat => (
          <Card key={stat.label} className="border-border">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* User list */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-card border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filtered.map(account => (
              <Card
                key={account.id}
                onClick={() => setSelected(selected?.id === account.id ? null : account)}
                className={`border cursor-pointer transition-all ${
                  selected?.id === account.id ? 'border-primary shadow-sm shadow-primary/10' : 'border-border hover:border-primary/30'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${avatarColors[account.role]} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
                      {account.nombre.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground text-sm">{account.nombre}</p>
                        {currentUser?.id === account.id && (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                            <CheckCircle size={9} className="mr-1" />Tú
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{account.cargo}</p>
                      <p className="text-xs text-muted-foreground/70">{account.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge className={`text-[10px] ${roleColors[account.role]} flex items-center gap-1`}>
                        {roleIcons[account.role]}
                        {roleLabel[account.role]}
                      </Badge>
                      <div className="flex items-center gap-1 text-[10px] text-green-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Activo
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card className="border-border sticky top-20">
              <div className={`bg-gradient-to-r ${selected.role === 'admin' ? 'from-emerald-600 to-teal-700' : selected.role === 'vet' ? 'from-blue-600 to-blue-800' : selected.role === 'field' ? 'from-orange-500 to-amber-600' : 'from-purple-600 to-purple-800'} p-5 rounded-t-xl`}>
                <div className={`w-14 h-14 rounded-xl ${avatarColors[selected.role]} flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-xl`}>
                  {selected.nombre.charAt(0)}
                </div>
                <h3 className="font-bold text-white text-lg">{selected.nombre}</h3>
                <p className="text-white/70 text-sm">{selected.cargo}</p>
                <p className="text-white/50 text-xs mt-0.5">{selected.finca}</p>
              </div>
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Información de acceso</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="text-foreground font-mono text-xs">{selected.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Contraseña</span>
                      <span className="text-foreground font-mono text-xs">{"•".repeat(selected.password.length)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rol</span>
                      <Badge className={`text-[10px] ${roleColors[selected.role]}`}>{roleLabel[selected.role]}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Estado</span>
                      <span className="text-green-500 flex items-center gap-1 text-xs"><CheckCircle size={11} />Activo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Último acceso</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} />Hoy</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Módulos con acceso</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.permisos.map(p => (
                      <span key={p} className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                        {PERMS_LABELS[p] || p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs" disabled>
                    <Edit size={12} />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs text-red-500 border-red-500/30 hover:bg-red-500/10" disabled>
                    <Trash2 size={12} />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border border-dashed">
              <CardContent className="p-8 text-center">
                <UserCircle size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Selecciona un usuario para ver su detalle y permisos</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
