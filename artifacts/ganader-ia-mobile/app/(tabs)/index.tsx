import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getHealthCheckQueryKey, useHealthCheck } from '@workspace/api-client-react';
import { Header, LoadingCard, Notice, Page, ui } from '@/components/ui';
import colors from '@/constants/colors';
import { useSession } from '@/lib/session';
import { useRemote } from '@/hooks/useRemote';
import { Animal, Pesaje } from '@/lib/api';

function ModuleLink({ title, caption, icon, href }: { title: string; caption: string; icon: keyof typeof Feather.glyphMap; href: string }) {
  return <Link href={href as never} asChild><Pressable style={({ pressed }) => [ui.card, { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, opacity: pressed ? 0.78 : 1 }]}>
    <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}><Feather name={icon} size={19} color={colors.primary} /></View>
    <View style={{ flex: 1, gap: 3 }}><Text style={{ color: colors.ink, fontWeight: '700', fontSize: 15 }}>{title}</Text><Text style={ui.muted}>{caption}</Text></View>
    <Feather name="arrow-up-right" size={17} color={colors.faint} />
  </Pressable></Link>;
}
export default function OverviewScreen() {
  const { user } = useSession();
  const animals = useRemote<Animal>('/api/animals', ['animals']);
  const pesajes = useRemote<Pesaje>('/api/pesajes', ['pesajes']);
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 60000 } });
  const loadError = animals.error || pesajes.error;
  return <Page>
    <Header kicker="GANADERÍA INTELIGENTE" title={`Hola, ${(user?.nombre || user?.name || 'bienvenido').split(' ')[0]}`} subtitle="El estado de tu operación, al día." />
    <View style={{ backgroundColor: colors.navy, borderRadius: 22, padding: 19, gap: 14 }}>
      <View style={[ui.row, { justifyContent: 'space-between' }]}>
        <View style={{ gap: 5 }}><Text style={{ color: '#8CCFC4', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}>VISTA GENERAL</Text><Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>Operación ganadera</Text></View>
        <View accessibilityLabel={health.isError ? 'Conexión no disponible' : 'Conexión disponible'} style={{ backgroundColor: health.isError ? '#5A3438' : '#17483F', borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, gap: 6 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: health.isError ? '#F08679' : '#55D3B6' }} /><Text style={{ color: '#D6F6EE', fontSize: 11, fontWeight: '700' }}>{health.isError ? 'Sin conexión' : 'Conectado'}</Text>
        </View>
      </View>
      {loadError ? <Notice message={loadError} onRetry={() => { animals.reload(); pesajes.reload(); }} /> :
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[{ label: 'ANIMALES', count: animals.items.length, icon: 'activity' as const }, { label: 'PESAJES', count: pesajes.items.length, icon: 'trending-up' as const }].map((metric) =>
            <View key={metric.label} style={{ flex: 1, borderRadius: 16, backgroundColor: colors.navySoft, padding: 14, gap: 9 }}>
              <Feather name={metric.icon} size={17} color="#6BE0C5" />
              <Text style={{ fontSize: 26, fontWeight: '700', color: colors.white }}>{animals.loading || pesajes.loading ? '—' : metric.count}</Text>
              <Text style={{ color: '#9CB7B8', letterSpacing: 1, fontSize: 10, fontWeight: '700' }}>{metric.label}</Text>
            </View>)}
        </View>}
    </View>
    {animals.loading && pesajes.loading ? <LoadingCard /> : null}
    <View style={[ui.row, { justifyContent: 'space-between', marginTop: 2 }]}><Text style={{ color: colors.ink, fontSize: 18, fontWeight: '700' }}>Accesos rápidos</Text><Text style={ui.eyebrow}>TU FINCA</Text></View>
    <ModuleLink title="Animales" caption="Consulta y actualiza el hato" icon="activity" href="/(tabs)/animals" />
    <ModuleLink title="Registrar pesaje" caption="Agrega una nueva medición" icon="bar-chart-2" href="/(tabs)/pesajes" />
    <ModuleLink title="Asistente CIVAC" caption="Consulta información ganadera" icon="message-circle" href="/(tabs)/assistant" />
    <ModuleLink title="Otros módulos" caption="Potreros, alertas y más" icon="layers" href="/(tabs)/more" />
    <Text style={[ui.muted, { textAlign: 'center', fontSize: 11, paddingTop: 8 }]}>La información se consulta en tiempo real desde tu servicio GanaderIA.</Text>
  </Page>;
}
