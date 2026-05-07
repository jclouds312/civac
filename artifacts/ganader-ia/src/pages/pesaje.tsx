import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Legend, ReferenceLine
} from "recharts";
import { Scale, Plus, Trash2, Edit2, Check, X, Search, TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState, type Pesaje } from "../lib/data";

const BASCULA_OPTIONS = ["Tru-Test S3", "Gallagher W210", "Báscula portátil", "Báscula de corrales", "Otra"];
const OPERADORES = ["Carlos Meza", "Luis Patiño", "Sandra Roa", "Pedro Villa", "Ana Gomez", "Jorge Cruz"];
const CC_LABELS: Record<number, string> = { 1: "Muy flaca", 2: "Flaca", 3: "Normal", 4: "Buena", 5: "Obesa" };
const LINE_COLORS = ["#4ade80","#60a5fa","#fb923c","#a78bfa","#f472b6","#34d399","#fbbf24","#e879f9"];

const EMPTY_FORM = {
  animalId: "", animalNombre: "", categoria: "", fecha: "",
  peso: "", bascula: "", operador: "", observaciones: "", condicionCorporal: 3, variacion: null as number | null,
};

export default function Pesaje() {
  const { pesaje, setPesaje, animals } = useAppState();
  const [search, setSearch] = useState("");
  const [filterAnimal, setFilterAnimal] = useState("Todos");
  const [filterCat, setFilterCat] = useState("Todas");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [chartAnimal, setChartAnimal] = useState("Todos");

  // ── Computed KPIs ─────────────────────────────────────────────────────────
  const pesoPromedio = useMemo(() => {
    if (pesaje.length === 0) return 0;
    const byAnimal: Record<string, number[]> = {};
    pesaje.forEach(p => {
      if (!byAnimal[p.animalId]) byAnimal[p.animalId] = [];
      byAnimal[p.animalId].push(p.peso);
    });
    const latestWeights = Object.values(byAnimal).map(pesos => pesos[pesos.length - 1]);
    return Math.round(latestWeights.reduce((s, p) => s + p, 0) / latestWeights.length);
  }, [pesaje]);

  const gananciaMensual = useMemo(() => {
    const variaciones = pesaje.filter(p => p.variacion != null).map(p => p.variacion as number);
    if (variaciones.length === 0) return 0;
    return Math.round(variaciones.reduce((s, v) => s + v, 0) / variaciones.length);
  }, [pesaje]);

  const ultimoPesaje = useMemo(() => {
    if (pesaje.length === 0) return "—";
    const sorted = [...pesaje].sort((a, b) => b.fecha.localeCompare(a.fecha));
    return sorted[0].fecha;
  }, [pesaje]);

  const totalPesajes = pesaje.length;

  // ── Chart data ────────────────────────────────────────────────────────────
  const allFechas = useMemo(() => [...new Set(pesaje.map(p => p.fecha))].sort(), [pesaje]);

  const chartData = useMemo(() => {
    if (chartAnimal === "Todos") {
      return allFechas.map(fecha => {
        const row: Record<string, string | number> = { fecha };
        const byAnimal: Record<string, number[]> = {};
        pesaje.filter(p => p.fecha === fecha).forEach(p => {
          if (!byAnimal[p.animalNombre]) byAnimal[p.animalNombre] = [];
          byAnimal[p.animalNombre].push(p.peso);
        });
        Object.entries(byAnimal).forEach(([nombre, pesos]) => {
          row[nombre] = Math.round(pesos.reduce((s, p) => s + p, 0) / pesos.length);
        });
        return row;
      });
    } else {
      return pesaje
        .filter(p => p.animalNombre === chartAnimal)
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .map(p => ({ fecha: p.fecha, [chartAnimal]: p.peso, variacion: p.variacion }));
    }
  }, [pesaje, chartAnimal, allFechas]);

  const chartAnimales = useMemo(() => [...new Set(pesaje.map(p => p.animalNombre))].slice(0, 8), [pesaje]);

  // ── Category bar chart ────────────────────────────────────────────────────
  const catData = useMemo(() => {
    const byAnimal: Record<string, { pesosById: Record<string, number[]>; categoria: string }> = {};
    pesaje.forEach(p => {
      if (!byAnimal[p.animalId]) byAnimal[p.animalId] = { pesosById: {}, categoria: p.categoria };
      if (!byAnimal[p.animalId].pesosById[p.animalId]) byAnimal[p.animalId].pesosById[p.animalId] = [];
      byAnimal[p.animalId].pesosById[p.animalId].push(p.peso);
    });
    const byCat: Record<string, number[]> = {};
    Object.values(byAnimal).forEach(({ pesosById, categoria }) => {
      if (!byCat[categoria]) byCat[categoria] = [];
      const pesos = Object.values(pesosById).flat();
      byCat[categoria].push(pesos[pesos.length - 1]);
    });
    return Object.entries(byCat).map(([cat, pesos]) => ({
      categoria: cat,
      promedio: Math.round(pesos.reduce((s, p) => s + p, 0) / pesos.length),
      n: pesos.length,
    }));
  }, [pesaje]);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const categorias = useMemo(() => ["Todas", ...new Set(pesaje.map(p => p.categoria))], [pesaje]);
  const animalesUnicos = useMemo(() => ["Todos", ...new Set(pesaje.map(p => p.animalNombre))], [pesaje]);

  const filtered = useMemo(() => {
    return pesaje
      .filter(p => {
        const matchSearch = !search || p.animalNombre.toLowerCase().includes(search.toLowerCase()) || p.animalId.toLowerCase().includes(search.toLowerCase());
        const matchAnimal = filterAnimal === "Todos" || p.animalNombre === filterAnimal;
        const matchCat = filterCat === "Todas" || p.categoria === filterCat;
        return matchSearch && matchAnimal && matchCat;
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [pesaje, search, filterAnimal, filterCat]);

  // ── Auto-compute variación ────────────────────────────────────────────────
  const computeVariacion = (animalId: string, peso: number): number | null => {
    const prevPesajes = pesaje.filter(p => p.animalId === animalId).sort((a, b) => b.fecha.localeCompare(a.fecha));
    if (prevPesajes.length === 0) return null;
    return Math.round((peso - prevPesajes[0].peso) * 10) / 10;
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleAnimalSelect = (animalId: string) => {
    const animal = animals.find(a => a.id === animalId);
    if (animal) {
      setForm(f => ({ ...f, animalId: animal.id, animalNombre: animal.nombre, categoria: animal.categoria }));
    }
  };

  const handleSubmit = () => {
    if (!form.animalId || !form.fecha || !form.peso) return;
    const pesoNum = Number(form.peso);
    if (isNaN(pesoNum) || pesoNum <= 0) return;

    const variacion = editId != null
      ? form.variacion
      : computeVariacion(form.animalId, pesoNum);

    if (editId != null) {
      setPesaje(prev => prev.map(p => p.id === editId
        ? { ...p, ...form, peso: pesoNum, condicionCorporal: Number(form.condicionCorporal), variacion }
        : p
      ));
      setEditId(null);
    } else {
      const newId = Math.max(0, ...pesaje.map(p => p.id)) + 1;
      setPesaje(prev => [...prev, {
        id: newId,
        animalId: form.animalId,
        animalNombre: form.animalNombre,
        categoria: form.categoria,
        fecha: form.fecha,
        peso: pesoNum,
        bascula: form.bascula,
        operador: form.operador,
        observaciones: form.observaciones,
        condicionCorporal: Number(form.condicionCorporal),
        variacion,
      }]);
    }
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
  };

  const handleEdit = (p: Pesaje) => {
    setForm({ ...p, peso: String(p.peso) });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setPesaje(prev => prev.filter(p => p.id !== id));
    setDeleteId(null);
  };

  const cancelForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c2340] via-[#0e3058] to-[#0a1f38] p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 w-64 h-full opacity-5 flex items-center justify-end pr-8">
          <Scale className="w-48 h-48" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Scale size={20} className="text-cyan-400" />
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30 text-xs">{totalPesajes} registros de pesaje</Badge>
          </div>
          <h1 className="text-2xl font-bold mb-1">Básculas y Pesaje</h1>
          <p className="text-white/60 text-sm">Control de peso y condición corporal del hato · Evolución histórica por animal</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 text-white shadow-lg relative overflow-hidden" style={{background:'linear-gradient(135deg,#0e7490,#06b6d4)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">⚖️ Total Registros</div>
          <div className="text-3xl font-bold">{totalPesajes}</div>
          <div className="text-[10px] text-white/60 mt-1">{animals.length} animales</div>
        </div>
        <div className="rounded-xl p-4 text-white shadow-lg relative overflow-hidden" style={{background:'linear-gradient(135deg,#b45309,#d97706)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">📊 Peso Promedio</div>
          <div className="text-3xl font-bold">{pesoPromedio} kg</div>
          <div className="text-[10px] text-white/60 mt-1">promedio actual del hato</div>
        </div>
        <div className={`rounded-xl p-4 text-white shadow-lg relative overflow-hidden`} style={{background: gananciaMensual >= 0 ? 'linear-gradient(135deg,#166534,#22c55e)' : 'linear-gradient(135deg,#991b1b,#ef4444)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">📈 Ganancia Prom</div>
          <div className="text-3xl font-bold flex items-center gap-1">
            {gananciaMensual >= 0 ? '+' : ''}{gananciaMensual} kg
            {gananciaMensual > 0 ? <TrendingUp size={18} /> : gananciaMensual < 0 ? <TrendingDown size={18} /> : <Minus size={18} />}
          </div>
          <div className="text-[10px] text-white/60 mt-1">promedio por pesaje</div>
        </div>
        <div className="rounded-xl p-4 text-white shadow-lg relative overflow-hidden" style={{background:'linear-gradient(135deg,#4c1d95,#7c3aed)'}}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">📅 Último Pesaje</div>
          <div className="text-xl font-bold">{ultimoPesaje}</div>
          <div className="text-[10px] text-white/60 mt-1">fecha más reciente</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weight evolution line chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                <TrendingUp size={14} className="text-cyan-400" />
              </div>
              <div>
                <div className="font-semibold text-sm">Evolución de Peso</div>
                <div className="text-xs text-muted-foreground">Histórico por animal</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={chartAnimal}
                  onChange={e => setChartAnimal(e.target.value)}
                  className="text-xs px-2 py-1.5 pr-6 rounded-lg bg-muted/40 border border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Todos">Todos los animales</option>
                  {chartAnimales.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{top:5,right:10,left:-10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="fecha" tick={{fill:'#888',fontSize:10}} tickFormatter={v => v.slice(3)} />
                <YAxis tick={{fill:'#888',fontSize:10}} domain={['auto','auto']} unit=" kg" width={55} />
                <RechartsTooltip
                  contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff',fontSize:11}}
                  formatter={(v: number) => [`${v} kg`]}
                />
                {chartAnimal === "Todos"
                  ? chartAnimales.map((nombre, i) => (
                    <Line
                      key={nombre}
                      type="monotone"
                      dataKey={nombre}
                      stroke={LINE_COLORS[i % LINE_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3, fill: LINE_COLORS[i % LINE_COLORS.length] }}
                      connectNulls
                    />
                  ))
                  : <>
                    <ReferenceLine y={pesoPromedio} stroke="#888" strokeDasharray="4 3" label={{ value: `Prom: ${pesoPromedio} kg`, fill: '#888', fontSize: 10 }} />
                    <Line type="monotone" dataKey={chartAnimal} stroke="#4ade80" strokeWidth={2.5} dot={{ r: 5, fill: '#4ade80' }} connectNulls name="Peso" />
                  </>
                }
                {chartAnimal === "Todos" && <Legend wrapperStyle={{fontSize:10,color:'#888'}} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart by category */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Scale size={14} className="text-amber-400" />
            </div>
            <div>
              <div className="font-semibold text-sm">Peso por Categoría</div>
              <div className="text-xs text-muted-foreground">Promedio más reciente</div>
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} margin={{top:4,right:4,left:-22,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="categoria" tick={{fill:'#888',fontSize:9}} tickFormatter={v => v.split(' ')[0]} />
                <YAxis tick={{fill:'#888',fontSize:10}} domain={[0,'auto']} />
                <RechartsTooltip
                  contentStyle={{backgroundColor:'#111',borderColor:'#333',color:'#fff',fontSize:11}}
                  formatter={(v: number) => [`${v} kg`]}
                />
                <Bar dataKey="promedio" name="Peso prom" radius={[4,4,0,0]}>
                  {catData.map((_, i) => <Cell key={i} fill={['#fb923c','#4ade80','#60a5fa','#a78bfa'][i % 4]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-1.5">
            {catData.map((c, i) => (
              <div key={c.categoria} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:['#fb923c','#4ade80','#60a5fa','#a78bfa'][i % 4]}} />
                  <span className="text-muted-foreground truncate max-w-[90px]">{c.categoria}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{c.promedio} kg</span>
                  <span className="text-muted-foreground/60">({c.n})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls + Table */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-sm">Registros de Pesaje</div>
            <Badge className="bg-muted text-muted-foreground border-border text-xs">{filtered.length}</Badge>
          </div>
          <Button
            size="sm"
            className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
            onClick={() => { setEditId(null); setForm({ ...EMPTY_FORM }); setShowForm(true); }}
          >
            <Plus size={14} /> Nuevo pesaje
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por animal o ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-8 text-xs"
            />
          </div>
          <div className="relative">
            <select
              value={filterAnimal}
              onChange={e => setFilterAnimal(e.target.value)}
              className="h-8 text-xs px-2 pr-7 rounded-md bg-muted/40 border border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {animalesUnicos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="h-8 text-xs px-2 pr-7 rounded-md bg-muted/40 border border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <div className="bg-muted/20 border border-border rounded-xl p-4 mb-4">
            <div className="font-semibold text-sm mb-3 flex items-center gap-2">
              {editId != null ? <><Edit2 size={14} className="text-primary" /> Editar pesaje</> : <><Plus size={14} className="text-cyan-400" /> Nuevo registro de pesaje</>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Animal select */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Animal *</label>
                <div className="relative">
                  <select
                    value={form.animalId}
                    onChange={e => handleAnimalSelect(e.target.value)}
                    className="w-full h-9 text-xs px-2 pr-7 rounded-md bg-background border border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Seleccionar animal</option>
                    {animals.map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.id})</option>)}
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              {/* Fecha */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Fecha *</label>
                <Input
                  placeholder="DD/MM/AAAA"
                  value={form.fecha}
                  onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                  className="h-9 text-xs"
                />
              </div>
              {/* Peso */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Peso (kg) *</label>
                <Input
                  type="number"
                  placeholder="Ej: 520"
                  value={form.peso}
                  onChange={e => setForm(f => ({ ...f, peso: e.target.value }))}
                  className="h-9 text-xs"
                />
              </div>
              {/* Báscula */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Báscula</label>
                <div className="relative">
                  <select
                    value={form.bascula}
                    onChange={e => setForm(f => ({ ...f, bascula: e.target.value }))}
                    className="w-full h-9 text-xs px-2 pr-7 rounded-md bg-background border border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Seleccionar báscula</option>
                    {BASCULA_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              {/* Operador */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Operador</label>
                <div className="relative">
                  <select
                    value={form.operador}
                    onChange={e => setForm(f => ({ ...f, operador: e.target.value }))}
                    className="w-full h-9 text-xs px-2 pr-7 rounded-md bg-background border border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Seleccionar operador</option>
                    {OPERADORES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              {/* Condición corporal */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Condición corporal: <span className="text-foreground font-semibold">{form.condicionCorporal} — {CC_LABELS[form.condicionCorporal]}</span>
                </label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      onClick={() => setForm(f => ({ ...f, condicionCorporal: n }))}
                      className={`flex-1 h-9 rounded-md text-xs font-bold transition-colors ${
                        form.condicionCorporal === n
                          ? 'bg-cyan-500 text-white'
                          : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
                      }`}
                    >{n}</button>
                  ))}
                </div>
              </div>
              {/* Observaciones */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-xs text-muted-foreground mb-1 block">Observaciones</label>
                <Input
                  placeholder="Notas adicionales del pesaje..."
                  value={form.observaciones}
                  onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                  className="h-9 text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-700 text-white" onClick={handleSubmit}>
                <Check size={13} /> {editId != null ? 'Actualizar' : 'Guardar pesaje'}
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={cancelForm}>
                <X size={13} /> Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">Animal</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider hidden sm:table-cell">Categoría</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">Fecha</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">Peso</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider hidden md:table-cell">Variación</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider hidden lg:table-cell">CC</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider hidden lg:table-cell">Báscula</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider hidden xl:table-cell">Operador</th>
                <th className="py-2 px-2 w-16" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const isDeleting = deleteId === p.id;
                return (
                  <tr key={p.id} className={`border-b border-border/40 hover:bg-muted/20 transition-colors ${isDeleting ? 'bg-red-500/5' : ''}`}>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-foreground">{p.animalNombre}</div>
                      <div className="text-muted-foreground/70">{p.animalId}</div>
                    </td>
                    <td className="py-2 px-3 hidden sm:table-cell">
                      <Badge className="text-[10px] bg-muted/40 text-muted-foreground border-border">{p.categoria}</Badge>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{p.fecha}</td>
                    <td className="py-2 px-3 text-right font-bold text-foreground">{p.peso} kg</td>
                    <td className="py-2 px-3 text-right hidden md:table-cell">
                      {p.variacion != null ? (
                        <span className={`font-semibold flex items-center justify-end gap-1 ${p.variacion > 0 ? 'text-green-400' : p.variacion < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                          {p.variacion > 0 ? <TrendingUp size={11} /> : p.variacion < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
                          {p.variacion > 0 ? '+' : ''}{p.variacion} kg
                        </span>
                      ) : <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="py-2 px-3 text-center hidden lg:table-cell">
                      <div className="inline-flex items-center gap-1">
                        {[1,2,3,4,5].map(n => (
                          <div
                            key={n}
                            className={`w-2 h-2 rounded-full ${n <= p.condicionCorporal ? 'bg-cyan-400' : 'bg-muted/40'}`}
                          />
                        ))}
                        <span className="ml-1 text-muted-foreground">{p.condicionCorporal}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground hidden lg:table-cell truncate max-w-[100px]">{p.bascula || '—'}</td>
                    <td className="py-2 px-3 text-muted-foreground hidden xl:table-cell truncate max-w-[90px]">{p.operador || '—'}</td>
                    <td className="py-2 px-2">
                      {isDeleting ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDelete(p.id)} className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors" title="Confirmar">
                            <Check size={13} />
                          </button>
                          <button onClick={() => setDeleteId(null)} className="p-1 rounded text-muted-foreground hover:bg-muted/50 transition-colors" title="Cancelar">
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(p)} className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Editar">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => setDeleteId(p.id)} className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Eliminar">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Scale size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No se encontraron registros de pesaje</p>
              {search && <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>}
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Mostrando {filtered.length} de {pesaje.length} registros</span>
            <span>Peso prom. filtrado: <strong className="text-foreground">{filtered.length > 0 ? Math.round(filtered.reduce((s, p) => s + p.peso, 0) / filtered.length) : 0} kg</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
