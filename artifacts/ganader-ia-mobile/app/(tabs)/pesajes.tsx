import React, { useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { apiRequest, Animal, displayError, Pesaje } from '@/lib/api';
import { Button, EmptyState, Field, Header, LoadingCard, Notice, Page, ui, ValueLine } from '@/components/ui';
import { useRemote } from '@/hooks/useRemote';
import colors from '@/constants/colors';

export default function PesajesScreen() {
  const records = useRemote<Pesaje>('/api/pesajes', ['pesajes']);
  const animals = useRemote<Animal>('/api/animals', ['animals']);
  const [modal, setModal] = useState(false);
  const [draft, setDraft] = useState({ animalId: '', peso: '', fecha: new Date().toISOString().slice(0,10), hora: '', metodo: '', dispositivo: '', operador: '', observacion: '', lote: '', categoria: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const sorted = useMemo(() => [...records.items].sort((a,b) => `${b.fecha ?? ''} ${b.hora ?? ''}`.localeCompare(`${a.fecha ?? ''} ${a.hora ?? ''}`)), [records.items]);
  const openForm = () => { setError(''); setModal(true); };
  const submit = async () => {
    if (!draft.animalId || !draft.peso || Number.isNaN(Number(draft.peso))) { setError('Selecciona un animal e ingresa un peso válido.'); return; }
    setBusy(true); setError('');
    const animal = animals.items.find(a => String(a.id) === draft.animalId);
    try {
      await apiRequest('/api/pesajes', { method: 'POST', body: JSON.stringify({ ...draft, animalId: draft.animalId, peso: Number(draft.peso), animalNombre: animal?.nombre }) });
      setModal(false); records.reload();
    } catch(e) { setError(displayError(e)); }
    finally { setBusy(false); }
  };
  return <Page>
    <Header title="Pesajes" subtitle="Evolución de peso del hato." right={<Pressable accessibilityRole="button" accessibilityLabel="Registrar pesaje" onPress={openForm} style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}><Feather name="plus" color={colors.white} size={20} /></Pressable>} />
    <View style={[ui.card, { backgroundColor: colors.navy, borderColor: colors.navy, gap: 7 }]}>
      <Text style={{ color: '#9CCBC5', fontWeight: '700', letterSpacing: 1.4, fontSize: 10 }}>REGISTROS</Text>
      <View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={{ color: colors.white, fontSize: 25, fontWeight: '700' }}>{records.loading ? '—' : records.items.length}</Text><Feather name="trending-up" color="#67DCC4" size={23} /></View>
      <Text style={{ color: '#B2C7C7', fontSize: 12 }}>Pesajes consultados desde tu finca</Text>
    </View>
    {records.loading ? <><LoadingCard /><LoadingCard /></> : records.error ? <Notice message={records.error} onRetry={records.reload} /> : sorted.length === 0 ? <EmptyState title="Sin pesajes registrados" description="Cuando registres una medición, aparecerá aquí." action={<Button title="Registrar primer pesaje" icon="plus" onPress={openForm} />} /> :
      <View style={{ gap: 10 }}>{sorted.map((record, index) => <View key={String(record.id ?? index)} style={[ui.card, { padding: 15 }]}>
        <View style={[ui.row, { gap: 12 }]}>
          <View style={{ width: 43, height: 43, borderRadius: 15, backgroundColor: '#D9F0EA', alignItems: 'center', justifyContent: 'center' }}><Feather name="bar-chart-2" color={colors.primary} size={19} /></View>
          <View style={{ flex: 1, gap: 3 }}><Text style={{ fontWeight: '700', color: colors.ink, fontSize: 15 }}>{record.animalNombre || `Animal ${record.animalId ?? ''}`}</Text><Text style={ui.muted}>{[record.fecha, record.hora].filter(Boolean).join(' · ') || 'Fecha sin dato'}</Text></View>
          <Text style={{ color: colors.primaryDark, fontWeight: '700', fontSize: 17 }}>{record.peso != null ? `${record.peso} kg` : '—'}</Text>
        </View>
        <View style={[ui.row, { justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopColor: '#E2F0ED', borderTopWidth: 1 }]}>
          <Text style={ui.muted}>{record.metodo || record.dispositivo || 'Método sin dato'}</Text>
          {record.pesoAnterior != null ? <Text style={{ color: colors.muted, fontSize: 12 }}>Anterior: {record.pesoAnterior} kg</Text> : null}
        </View>
        {record.observacion ? <Text style={[ui.muted, { marginTop: 8 }]}>{record.observacion}</Text> : null}
      </View>)}</View>}
    <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
      <Page contentStyle={{ paddingTop: 52 }}>
        <View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={ui.heading}>Nuevo pesaje</Text><Pressable accessibilityRole="button" accessibilityLabel="Cerrar formulario" onPress={() => setModal(false)}><Feather name="x" size={24} color={colors.ink} /></Pressable></View>
        <Text style={ui.muted}>Selecciona un animal y registra una medición.</Text>
        <Text style={{ color: colors.ink, fontWeight: '700' }}>Animal</Text>
        {animals.loading ? <LoadingCard /> : animals.error ? <Notice message={animals.error} onRetry={animals.reload} /> : animals.items.length ? <View style={{ gap: 8 }}>{animals.items.map(a => <Pressable key={String(a.id)} accessibilityRole="radio" accessibilityState={{ selected: draft.animalId === String(a.id) }} onPress={() => { setDraft({ ...draft, animalId: String(a.id), lote: a.lote ?? '', categoria: a.categoria ?? '' }); }} style={[ui.row, ui.card, { padding: 13, borderColor: draft.animalId === String(a.id) ? colors.primary : colors.border, gap: 10 }]}><Feather name={draft.animalId === String(a.id) ? 'check-circle' : 'circle'} color={colors.primary} size={18} /><Text style={{ color: colors.ink, fontWeight: '600' }}>{a.nombre}</Text></Pressable>)}</View> : <EmptyState title="No hay animales" description="Registra un animal antes de crear un pesaje." />}
        <Field label="Peso (kg) *" value={draft.peso} onChangeText={peso => setDraft({ ...draft, peso })} keyboardType="decimal-pad" placeholder="Ej. 384.5" />
        <Field label="Fecha" value={draft.fecha} onChangeText={fecha => setDraft({ ...draft, fecha })} placeholder="AAAA-MM-DD" />
        <Field label="Hora" value={draft.hora} onChangeText={hora => setDraft({ ...draft, hora })} placeholder="HH:MM" />
        <Field label="Método" value={draft.metodo} onChangeText={metodo => setDraft({ ...draft, metodo })} />
        <Field label="Dispositivo" value={draft.dispositivo} onChangeText={dispositivo => setDraft({ ...draft, dispositivo })} />
        <Field label="Operador" value={draft.operador} onChangeText={operador => setDraft({ ...draft, operador })} />
        <Field label="Observación" value={draft.observacion} onChangeText={observacion => setDraft({ ...draft, observacion })} multiline />
        {error ? <Text accessibilityRole="alert" style={{ color: colors.red }}>{error}</Text> : null}
        <Button title="Guardar pesaje" icon="check" onPress={submit} loading={busy} disabled={animals.loading || !animals.items.length} />
      </Page>
    </Modal>
  </Page>;
}
