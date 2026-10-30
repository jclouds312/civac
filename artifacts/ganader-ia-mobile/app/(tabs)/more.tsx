import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiRequest, asList, displayError, WEB_BASE } from '@/lib/api';
import { Button, EmptyState, Header, Notice, Page, ui } from '@/components/ui';
import colors from '@/constants/colors';
import { useSession } from '@/lib/session';

type ModuleDef = { key: string; title: string; description: string; endpoint: string; icon: keyof typeof Feather.glyphMap };
const modules: ModuleDef[] = [
  { key: 'potreros', title: 'Potreros', description: 'Rotación y ocupación del campo', endpoint: '/api/potreros', icon: 'map' },
  { key: 'insumos', title: 'Insumos', description: 'Inventario disponible en finca', endpoint: '/api/insumos', icon: 'package' },
  { key: 'reproduccion', title: 'Reproducción', description: 'Seguimiento reproductivo', endpoint: '/api/reproduccion', icon: 'heart' },
  { key: 'alertas', title: 'Alertas', description: 'Novedades y acciones pendientes', endpoint: '/api/alertas', icon: 'bell' },
  { key: 'personal', title: 'Personal', description: 'Equipo vinculado a la operación', endpoint: '/api/personal', icon: 'users' },
  { key: 'gps', title: 'GPS', description: 'Dispositivos y ubicación reportada', endpoint: '/api/gps', icon: 'crosshair' },
];
function stringifyValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Sin dato';
  if (typeof value === 'object') return Array.isArray(value) ? `${value.length} registros` : JSON.stringify(value);
  return String(value);
}
function RecordDetails({ item }: { item: Record<string, unknown> }) {
  return <View style={[ui.card, { gap: 0 }]}>{Object.entries(item).map(([key, value]) => <View key={key} style={[ui.row, { justifyContent: 'space-between', gap: 12, paddingVertical: 9, borderBottomColor: '#E2F0ED', borderBottomWidth: .5 }]}>
    <Text style={{ color: colors.muted, fontSize: 12, flex: 1 }}>{key.replace(/([A-Z])/g, ' $1')}</Text>
    <Text style={{ color: colors.ink, fontSize: 13, fontWeight: '600', textAlign: 'right', flex: 1.3 }}>{stringifyValue(value)}</Text>
  </View>)}</View>;
}
export default function MoreScreen() {
  const { user, signOut } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<ModuleDef | null>(null);
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountVisible, setAccountVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const loadModule = async (module: ModuleDef) => {
    setSelected(module); setRecords([]); setError(''); setLoading(true);
    try {
      const payload = await apiRequest<unknown>(module.endpoint);
      const list = asList<Record<string, unknown>>(payload, [module.key]);
      if (list.length) setRecords(list);
      else if (payload && typeof payload === 'object') {
        const object = payload as Record<string, unknown>;
        setRecords(Object.keys(object).length ? [object] : []);
      } else setRecords([]);
    } catch (e) { setError(displayError(e)); }
    finally { setLoading(false); }
  };
  const logout = () => Alert.alert('Cerrar sesión', 'Se cerrará tu sesión en este dispositivo.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Cerrar sesión', style: 'destructive', onPress: async () => { setLoggingOut(true); try { await signOut(); router.replace('/login'); } catch(e) { Alert.alert('No se pudo cerrar sesión', displayError(e)); } finally { setLoggingOut(false); } } }]);
  const displayName = String(user?.nombre || user?.name || 'Usuario');
  const openFullApp = async () => {
    if (!WEB_BASE) {
      Alert.alert('Enlace no configurado', 'Define EXPO_PUBLIC_WEB_URL o EXPO_PUBLIC_DOMAIN para abrir GanaderIA web.');
      return;
    }
    try { await Linking.openURL(WEB_BASE); }
    catch (e) { Alert.alert('No se pudo abrir GanaderIA web', displayError(e)); }
  };
  return <Page>
    <Header title="Más" subtitle="Módulos y herramientas de tu operación." />
    <View style={[ui.card, { backgroundColor: colors.navy, borderColor: colors.navy, gap: 13, flexDirection: 'row', alignItems: 'center' }]}>
      <View style={{ width: 47, height: 47, borderRadius: 17, backgroundColor: '#1C514D', alignItems: 'center', justifyContent: 'center' }}><Feather name="user" color="#73DCC7" size={22} /></View>
      <View style={{ flex: 1, gap: 3 }}><Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>{displayName}</Text><Text style={{ color: '#B5CDCA', fontSize: 12 }}>{String(user?.email ?? 'Cuenta activa')}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Ver cuenta" onPress={() => setAccountVisible(true)}><Feather name="chevron-right" color="#9DC6C0" size={20} /></Pressable>
    </View>
    <Button title="Abrir GanaderIA completa" icon="external-link" tone="quiet" onPress={openFullApp} />
    <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink, marginTop: 2 }}>Módulos de la finca</Text>
    <View style={{ gap: 9 }}>{modules.map(module => <Pressable key={module.key} accessibilityRole="button" onPress={() => loadModule(module)} style={({ pressed }) => [ui.card, ui.row, { padding: 14, gap: 12, opacity: pressed ? .8 : 1 }]}>
      <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}><Feather name={module.icon} color={colors.primary} size={19} /></View>
      <View style={{ flex: 1, gap: 3 }}><Text style={{ color: colors.ink, fontWeight: '700' }}>{module.title}</Text><Text style={ui.muted}>{module.description}</Text></View><Feather name="chevron-right" color={colors.faint} size={18} />
    </Pressable>)}</View>
    <View style={{ marginTop: 2 }}><Button title={loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'} tone="quiet" icon="log-out" onPress={logout} loading={loggingOut} /></View>
    <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
      <Page contentStyle={{ paddingTop: 50 }}>
        <View style={[ui.row, { justifyContent: 'space-between' }]}><View style={{ flex: 1 }}><Text style={ui.eyebrow}>INFORMACIÓN REAL</Text><Text style={[ui.heading, { marginTop: 5 }]}>{selected?.title}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Cerrar módulo" onPress={() => setSelected(null)}><Feather name="x" size={24} color={colors.ink} /></Pressable></View>
        <Text style={ui.muted}>Datos recibidos de {selected?.endpoint}.</Text>
        {loading ? <><View style={ui.card}><ActivityIndicator color={colors.primary} /></View></> : error ? <Notice message={error} onRetry={() => selected && loadModule(selected)} /> : records.length === 0 ? <EmptyState title="No hay registros disponibles" description="El servicio respondió sin información para este módulo." /> :
          <View style={{ gap: 12 }}>{records.map((record, index) => <RecordDetails key={String(record.id ?? index)} item={record} />)}</View>}
      </Page>
    </Modal>
    <Modal visible={accountVisible} animationType="fade" transparent onRequestClose={() => setAccountVisible(false)}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 22, backgroundColor: 'rgba(9,35,43,0.35)' }}>
        <View style={[ui.card, { gap: 15 }]}>
          <View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={{ color: colors.ink, fontWeight: '700', fontSize: 20 }}>Mi cuenta</Text><Pressable accessibilityRole="button" accessibilityLabel="Cerrar cuenta" onPress={() => setAccountVisible(false)}><Feather name="x" size={22} color={colors.ink} /></Pressable></View>
          <Text style={ui.muted}>Sesión activa en GanaderIA.</Text>
          {[
            ['Nombre', user?.nombre || user?.name || 'Sin nombre'],
            ['Correo', user?.email || 'No disponible'],
            ['Perfil', user?.rol || user?.role || 'No asignado'],
            ['Identificador', user?.id || 'No disponible'],
          ].map(([key, value]) => <View key={key} style={[ui.row, { justifyContent: 'space-between', gap: 12 }]}><Text style={ui.muted}>{key}</Text><Text style={{ color: colors.ink, fontWeight: '600', flexShrink: 1, textAlign: 'right' }}>{String(value)}</Text></View>)}
          <Button title="Listo" onPress={() => setAccountVisible(false)} />
        </View>
      </View>
    </Modal>
  </Page>;
}
