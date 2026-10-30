import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Animal, apiRequest, displayError } from '@/lib/api';
import { Button, EmptyState, Field, Header, LoadingCard, Notice, Page, ValueLine, ui } from '@/components/ui';
import { useRemote } from '@/hooks/useRemote';
import colors from '@/constants/colors';

const freshAnimal = () => ({ nombre: '', raza: '', categoria: '', peso: '', lote: '', estado: 'Activo', litrosDia: '', partos: '', fechaNacimiento: '', registro: '', numeroRegistro: '', valorKilo: '' });
export default function AnimalsScreen() {
  const remote = useRemote<Animal>('/api/animals', ['animals']);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Animal | null>(null);
  const [draft, setDraft] = useState(freshAnimal());
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<Animal | null>(null);
  const [formError, setFormError] = useState('');
  const filtered = useMemo(() => remote.items.filter(a => `${a.nombre} ${a.raza ?? ''} ${a.lote ?? ''} ${a.numeroRegistro ?? ''}`.toLowerCase().includes(query.toLowerCase())), [remote.items, query]);
  const openNew = () => { setDraft(freshAnimal()); setEditing(null); setFormError(''); setEditing({ id: '__new__', nombre: '' }); };
  const openEdit = (animal: Animal) => { setDraft({ ...freshAnimal(), ...Object.fromEntries(Object.entries(animal).map(([k,v]) => [k, v == null ? '' : String(v)])) } as typeof draft); setEditing(animal); setFormError(''); };
  const save = async () => {
    if (!draft.nombre.trim()) { setFormError('El nombre o identificador del animal es obligatorio.'); return; }
    setSaving(true); setFormError('');
    const numberFields = ['peso','litrosDia','partos','valorKilo'];
    const payload: Record<string, unknown> = { ...draft };
    for (const key of numberFields) payload[key] = draft[key as keyof typeof draft] === '' ? null : Number(draft[key as keyof typeof draft]);
    try {
      if (editing?.id === '__new__') await apiRequest('/api/animals', { method: 'POST', body: JSON.stringify(payload) });
      else await apiRequest(`/api/animals/${editing?.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      setEditing(null); remote.reload();
    } catch (e) { setFormError(displayError(e)); }
    finally { setSaving(false); }
  };
  const remove = (animal: Animal) => Alert.alert('Eliminar animal', `¿Deseas eliminar a ${animal.nombre}?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: async () => { try { await apiRequest(`/api/animals/${animal.id}`, { method: 'DELETE' }); setDetail(null); remote.reload(); } catch (e) { Alert.alert('No se pudo eliminar', displayError(e)); } } }]);
  return <Page>
    <Header title="Animales" subtitle="El registro vivo de tu hato." right={<Pressable accessibilityRole="button" accessibilityLabel="Crear animal" onPress={openNew} style={{ backgroundColor: colors.primary, width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14 }}><Feather name="plus" size={21} color={colors.white} /></Pressable>} />
    <View style={[ui.row, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 13, gap: 9 }]}>
      <Feather name="search" color={colors.muted} size={18} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar por nombre, raza o lote" placeholderTextColor={colors.faint} accessibilityLabel="Buscar animales" style={{ flex: 1, height: 48, color: colors.ink }} />
      {query ? <Pressable accessibilityRole="button" accessibilityLabel="Limpiar búsqueda" onPress={() => setQuery('')}><Feather name="x-circle" size={17} color={colors.faint} /></Pressable> : null}
    </View>
    {remote.loading ? <><LoadingCard /><LoadingCard /></> : remote.error ? <Notice message={remote.error} onRetry={remote.reload} /> : filtered.length === 0 ? <EmptyState title={query ? 'No hay coincidencias' : 'Aún no hay animales registrados'} description={query ? 'Prueba con otro nombre, raza o lote.' : 'Crea el primer registro para comenzar a organizar el hato.'} action={!query ? <Button title="Registrar animal" icon="plus" onPress={openNew} /> : undefined} /> :
      <View style={{ gap: 10 }}>{filtered.map(animal => <Pressable key={String(animal.id)} accessibilityRole="button" accessibilityLabel={`Ver ${animal.nombre}`} onPress={() => setDetail(animal)} style={({ pressed }) => [ui.card, { padding: 15, opacity: pressed ? 0.84 : 1 }]}>
        <View style={[ui.row, { gap: 12 }]}>
          <View style={{ width: 43, height: 43, borderRadius: 15, backgroundColor: '#D9F0EA', alignItems: 'center', justifyContent: 'center' }}><Feather name="tag" color={colors.primary} size={19} /></View>
          <View style={{ flex: 1, gap: 4 }}><Text style={{ color: colors.ink, fontWeight: '700', fontSize: 16 }}>{animal.nombre || `Animal ${animal.id}`}</Text><Text style={ui.muted}>{[animal.raza, animal.categoria, animal.lote ? `Lote ${animal.lote}` : null].filter(Boolean).join(' · ') || 'Sin clasificación'}</Text></View>
          <Feather name="chevron-right" color={colors.faint} size={19} />
        </View>
        <View style={[ui.row, { justifyContent: 'space-between', marginTop: 13, paddingTop: 11, borderTopColor: '#E2F0ED', borderTopWidth: 1 }]}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{animal.estado || 'Estado sin dato'}</Text>
          <Text style={{ color: colors.primaryDark, fontWeight: '700', fontSize: 13 }}>{animal.peso != null ? `${animal.peso} kg` : 'Peso sin dato'}</Text>
        </View>
      </Pressable>)}</View>}
    <Modal visible={!!editing} animationType="slide" onRequestClose={() => setEditing(null)}>
      <Page contentStyle={{ paddingTop: 50 }}>
        <View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={ui.heading}>{editing?.id === '__new__' ? 'Nuevo animal' : 'Editar animal'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Cerrar formulario" onPress={() => setEditing(null)}><Feather name="x" size={24} color={colors.ink} /></Pressable></View>
        <Text style={ui.muted}>Completa los datos disponibles del registro.</Text>
        <Field label="Nombre o identificador *" value={draft.nombre} onChangeText={nombre => setDraft({ ...draft, nombre })} />
        <Field label="Raza" value={draft.raza} onChangeText={raza => setDraft({ ...draft, raza })} />
        <Field label="Categoría" value={draft.categoria} onChangeText={categoria => setDraft({ ...draft, categoria })} />
        <Field label="Peso (kg)" value={draft.peso} onChangeText={peso => setDraft({ ...draft, peso })} keyboardType="decimal-pad" />
        <Field label="Lote" value={draft.lote} onChangeText={lote => setDraft({ ...draft, lote })} />
        <Field label="Estado" value={draft.estado} onChangeText={estado => setDraft({ ...draft, estado })} />
        <Field label="Litros por día" value={draft.litrosDia} onChangeText={litrosDia => setDraft({ ...draft, litrosDia })} keyboardType="decimal-pad" />
        <Field label="Partos" value={draft.partos} onChangeText={partos => setDraft({ ...draft, partos })} keyboardType="number-pad" />
        <Field label="Fecha de nacimiento" value={draft.fechaNacimiento} onChangeText={fechaNacimiento => setDraft({ ...draft, fechaNacimiento })} placeholder="AAAA-MM-DD" />
        <Field label="Registro" value={draft.registro} onChangeText={registro => setDraft({ ...draft, registro })} />
        <Field label="Número de registro" value={draft.numeroRegistro} onChangeText={numeroRegistro => setDraft({ ...draft, numeroRegistro })} />
        <Field label="Valor por kilo" value={draft.valorKilo} onChangeText={valorKilo => setDraft({ ...draft, valorKilo })} keyboardType="decimal-pad" />
        {formError ? <Text accessibilityRole="alert" style={{ color: colors.red }}>{formError}</Text> : null}
        <Button title="Guardar animal" onPress={save} loading={saving} icon="check" />
      </Page>
    </Modal>
    <Modal visible={!!detail} animationType="slide" onRequestClose={() => setDetail(null)}>
      {detail ? <Page contentStyle={{ paddingTop: 52 }}>
        <View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={ui.heading}>{detail.nombre}</Text><Pressable accessibilityRole="button" accessibilityLabel="Cerrar detalle" onPress={() => setDetail(null)}><Feather name="x" size={24} color={colors.ink} /></Pressable></View>
        <View style={ui.card}>
          {(['raza','categoria','peso','lote','estado','litrosDia','partos','fechaNacimiento','registro','numeroRegistro','valorKilo'] as const).map(field => <ValueLine key={field} label={({ raza:'Raza', categoria:'Categoría', peso:'Peso (kg)', lote:'Lote', estado:'Estado', litrosDia:'Litros por día', partos:'Partos', fechaNacimiento:'Fecha de nacimiento', registro:'Registro', numeroRegistro:'Número de registro', valorKilo:'Valor por kilo' })[field]} value={detail[field]} />)}
        </View>
        <Button title="Editar registro" icon="edit-2" tone="quiet" onPress={() => { setDetail(null); openEdit(detail); }} />
        <Button title="Eliminar animal" icon="trash-2" tone="danger" onPress={() => remove(detail)} />
      </Page> : null}
    </Modal>
  </Page>;
}
