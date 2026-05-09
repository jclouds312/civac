import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { UserCircle, Shield, Stethoscope, Milk, BarChart3, Search, Plus, Edit, Trash2, CheckCircle, Clock, Eye, EyeOff, AlertTriangle, Key } from "lucide-react";
import { useAuth, Account } from "@/lib/auth";

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

const avatarGrads: Record<string, string> = {
  admin: "from-emerald-600 to-teal-700",
  vet: "from-blue-600 to-blue-800",
  field: "from-orange-500 to-amber-600",
  viewer: "from-purple-600 to-purple-800",
};

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield size={14} />,
  vet: <Stethoscope size={14} />,
  field: <Milk size={14} />,
  viewer: <BarChart3 size={14} />,
};

const ALL_PERMS = [
  { key: 'inventario', label: 'Inventario' },
  { key: 'produccion', label: 'Producción' },
  { key: 'reproduccion', label: 'Reproducción' },
  { key: 'genetica', label: 'Genética' },
  { key: 'potreros', label: 'Potreros' },
  { key: 'alimentacion', label: 'Alimentación' },
  { key: 'insumos', label: 'Insumos' },
  { key: 'semen', label: 'Semen' },
  { key: 'costos', label: 'Costos' },
  { key: 'personal', label: 'Personal' },
  { key: 'prediccion', label: 'Predicciones IA' },
  { key: 'co2', label: 'CO₂' },
  { key: 'alertas', label: 'Alertas' },
  { key: 'multifinca', label: 'Multi-Finca' },
  { key: 'usuarios', label: 'Usuarios' },
  { key: 'configuracion', label: 'Configuración' },
  { key: 'documentacion', label: 'Docs' },
  { key: 'pesaje', label: 'Pesaje' },
  { key: 'gps', label: 'GPS' },
];

const PERMS_BY_ROLE: Record<string, string[]> = {
  admin: ALL_PERMS.map(p => p.key),
  vet: ['inventario','produccion','reproduccion','genetica','potreros','alimentacion','insumos','semen','prediccion','alertas','documentacion','pesaje','gps'],
  field: ['inventario','produccion','potreros','alimentacion','insumos','alertas','pesaje'],
  viewer: ['inventario','produccion','costos','prediccion','co2','alertas','gps'],
};

function UserForm({
  initial,
  onSave,
  onClose,
  isEdit = false,
}: {
  initial?: Partial<Account>;
  onSave: (data: Omit<Account, 'id'>) => void;
  onClose: () => void;
  isEdit?: boolean;
}) {
  const [role, setRole] = useState<Account['role']>((initial?.role as Account['role']) || 'viewer');
  const [permisos, setPermisos] = useState<string[]>(initial?.permisos || PERMS_BY_ROLE['viewer']);
  const [showPass, setShowPass] = useState(false);

  const togglePerm = (key: string) => {
    setPermisos(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  const handleRoleChange = (r: Account['role']) => {
    setRole(r);
    setPermisos(PERMS_BY_ROLE[r] || []);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      nombre: fd.get('nombre') as string,
      cargo: fd.get('cargo') as string,
      finca: fd.get('finca') as string || 'Finca El Rancho Verde',
      email: fd.get('email') as string,
      password: fd.get('password') as string,
      avatar: '👤',
      gradient: 'from-slate-600 to-slate-800',
      role,
      permisos,
      activo: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Nombre completo *</Label>
          <Input name="nombre" defaultValue={initial?.nombre} required placeholder="Ej. María García" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Cargo</Label>
          <Input name="cargo" defaultValue={initial?.cargo} placeholder="Veterinario, Ordeñador..." className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Finca</Label>
          <Input name="finca" defaultValue={initial?.finca || 'Finca El Rancho Verde'} className="mt-1" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Correo electrónico *</Label>
          <Input name="email" type="email" defaultValue={initial?.email} required placeholder="usuario@ganader.ia" className="mt-1" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Contraseña {isEdit && '(dejar vacío para mantener)'}</Label>
          <div className="relative mt-1">
            <Input
              name="password"
              type={showPass ? 'text' : 'password'}
              defaultValue={isEdit ? '' : ''}
              required={!isEdit}
              placeholder={isEdit ? '••••••• (sin cambios)' : 'Contraseña de acceso'}
              className="pr-9"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Rol del sistema</Label>
          <div className="mt-1">
            <Select value={role} onValueChange={v => handleRoleChange(v as Account['role'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(roleLabel).map(([k,v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Permisos de módulo</Label>
        <div className="mt-2 flex flex-wrap gap-1.5 border border-border rounded-lg p-3 bg-muted/20">
          {ALL_PERMS.map(p => (
            <button
              key={p.key}
              type="button"
              onClick={() => togglePerm(p.key)}
              className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                permisos.includes(p.key)
                  ? 'bg-primary/20 text-primary border-primary/40'
                  : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/30'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{permisos.length} permisos activos</p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" className="gap-1.5">
          {isEdit ? <><Edit size={13} /> Guardar cambios</> : <><Plus size={13} /> Crear usuario</>}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function Usuarios() {
  const { accounts, user: currentUser, registerUser, updateUser, deleteUser } = useAuth();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Account | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Account | null>(null);

  const filtered = accounts.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    a.cargo.toLowerCase().includes(search.toLowerCase()) ||
    a.role.includes(search.toLowerCase())
  );

  const handleAdd = (data: Omit<Account, 'id'>) => {
    registerUser(data);
    setAddOpen(false);
  };

  const handleEdit = (data: Omit<Account, 'id'>) => {
    if (!selected) return;
    const updates: Partial<Account> = { ...data };
    if (!data.password) delete updates.password;
    updateUser(selected.id, updates);
    setEditOpen(false);
    setSelected(null);
  };

  const confirmDelete = (account: Account) => {
    if (account.id === 'admin') return;
    setDeleteConfirm(account);
  };

  const doDelete = () => {
    if (!deleteConfirm) return;
    deleteUser(deleteConfirm.id);
    if (selected?.id === deleteConfirm.id) setSelected(null);
    setDeleteConfirm(null);
  };

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
              <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/30 text-xs">{accounts.length} cuentas</Badge>
            </div>
            <h1 className="text-2xl font-bold mb-1">Gestión de Usuarios</h1>
            <p className="text-purple-200/70 text-sm">Crear, editar y administrar roles y permisos</p>
          </div>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 border border-white/30 text-white gap-2">
                <Plus size={14} /> Registrar Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Registrar Nuevo Usuario</DialogTitle></DialogHeader>
              <UserForm onSave={handleAdd} onClose={() => setAddOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total usuarios", value: accounts.length, color: "text-purple-500", g: "from-purple-900/20 to-purple-800/10", border: "border-purple-500/20" },
          { label: "Admins", value: accounts.filter(a=>a.role==='admin').length, color: "text-emerald-500", g: "from-emerald-900/20 to-emerald-800/10", border: "border-emerald-500/20" },
          { label: "Técnicos", value: accounts.filter(a=>a.role==='vet'||a.role==='field').length, color: "text-blue-500", g: "from-blue-900/20 to-blue-800/10", border: "border-blue-500/20" },
          { label: "Solo lectura", value: accounts.filter(a=>a.role==='viewer').length, color: "text-amber-500", g: "from-amber-900/20 to-amber-800/10", border: "border-amber-500/20" },
        ].map(stat => (
          <div key={stat.label} className={`border ${stat.border} bg-gradient-to-br ${stat.g} rounded-xl p-4 text-center`}>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
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
                        {account.id === 'admin' && (
                          <Badge className="bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 text-[10px]">
                            <Shield size={9} className="mr-1" />Sistema
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
                      <div className={`flex items-center gap-1 text-[10px] ${account.activo !== false ? 'text-green-500' : 'text-red-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${account.activo !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                        {account.activo !== false ? 'Activo' : 'Inactivo'}
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
              <div className={`bg-gradient-to-r ${avatarGrads[selected.role]} p-5 rounded-t-xl`}>
                <div className={`w-14 h-14 rounded-xl ${avatarColors[selected.role]} flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-xl`}>
                  {selected.nombre.charAt(0)}
                </div>
                <h3 className="font-bold text-white text-lg">{selected.nombre}</h3>
                <p className="text-white/70 text-sm">{selected.cargo}</p>
                <p className="text-white/50 text-xs mt-0.5">{selected.finca}</p>
              </div>
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Acceso</p>
                  <div className="space-y-1.5 text-sm">
                    {[
                      { label: 'Email', val: selected.email },
                      { label: 'Contraseña', val: '•'.repeat(Math.min(selected.password?.length || 6, 8)) },
                      { label: 'Rol', valNode: <Badge className={`text-[10px] ${roleColors[selected.role]}`}>{roleLabel[selected.role]}</Badge> },
                      { label: 'Estado', valNode: <span className={`flex items-center gap-1 text-xs ${selected.activo !== false ? 'text-green-500' : 'text-red-500'}`}><CheckCircle size={11} />{selected.activo !== false ? 'Activo' : 'Inactivo'}</span> },
                      { label: 'Último acceso', valNode: <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} />Hoy</span> },
                    ].map(r => (
                      <div key={r.label} className="flex items-center justify-between border-b border-border/40 pb-1.5 last:border-0">
                        <span className="text-muted-foreground text-xs">{r.label}</span>
                        {r.valNode || <span className="text-xs font-mono text-foreground">{r.val}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Módulos ({selected.permisos.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.permisos.map(p => (
                      <span key={p} className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                        {ALL_PERMS.find(x => x.key === p)?.label || p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs">
                        <Edit size={12} /> Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>Editar Usuario</DialogTitle></DialogHeader>
                      <UserForm initial={selected} onSave={handleEdit} onClose={() => setEditOpen(false)} isEdit />
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={selected.id === 'admin'}
                    onClick={() => confirmDelete(selected)}
                    className="flex-1 gap-1.5 text-xs text-red-500 border-red-500/30 hover:bg-red-500/10 disabled:opacity-40"
                  >
                    <Trash2 size={12} /> Eliminar
                  </Button>
                </div>

                {selected.id === 'admin' && (
                  <p className="text-[10px] text-muted-foreground text-center">El administrador principal no puede eliminarse</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border border-dashed">
              <CardContent className="p-8 text-center">
                <UserCircle size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Selecciona un usuario para ver su detalle, editar o eliminar</p>
                <Button onClick={() => setAddOpen(true)} variant="outline" size="sm" className="mt-4 gap-1.5 text-xs">
                  <Plus size={12} /> Registrar nuevo usuario
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={open => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={18} /> Confirmar eliminación
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-muted-foreground">¿Estás seguro de eliminar a <strong className="text-foreground">{deleteConfirm?.nombre}</strong>? Esta acción no se puede deshacer.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button onClick={doDelete} className="bg-red-600 hover:bg-red-700 gap-1.5">
              <Trash2 size={13} /> Eliminar usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
