import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSession } from '@/lib/session';
import colors from '@/constants/colors';

const icons: Record<string, keyof typeof Feather.glyphMap> = {
  index: 'grid', animals: 'activity', pesajes: 'bar-chart-2', assistant: 'message-circle', more: 'menu',
};
const labels: Record<string, string> = {
  index: 'Inicio', animals: 'Animales', pesajes: 'Pesajes', assistant: 'CIVAC IA', more: 'Más',
};
export default function TabLayout() {
  const { token, ready } = useSession();
  if (!ready) return null;
  if (!token) return <Redirect href="/login" />;
  return <Tabs screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.faint,
    tabBarStyle: { height: 77, paddingTop: 8, paddingBottom: 11, backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1 },
    tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
    tabBarIcon: ({ color, size }) => <Feather name={icons[route.name] ?? 'circle'} size={size} color={color} />,
  })}>
    {Object.entries(labels).map(([name, title]) => <Tabs.Screen key={name} name={name} options={{ title, tabBarAccessibilityLabel: title }} />)}
  </Tabs>;
}
