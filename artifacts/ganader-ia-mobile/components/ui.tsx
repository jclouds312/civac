import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '@/constants/colors';

export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 116, gap: 16 },
  heading: { fontSize: 27, lineHeight: 32, color: colors.ink, fontWeight: '700', letterSpacing: -0.8 },
  eyebrow: { fontSize: 11, color: colors.primary, letterSpacing: 1.5, fontWeight: '700', textTransform: 'uppercase' },
  body: { color: colors.ink, fontSize: 15 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: 17 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.ink, backgroundColor: colors.surface, fontSize: 15 },
});

export function Page({ children, contentStyle }: { children: React.ReactNode; contentStyle?: ViewStyle }) {
  return <View style={ui.page}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[ui.scroll, contentStyle]}>{children}</ScrollView></View>;
}
export function Header({ kicker = 'GANADERÍA INTELIGENTE', title, subtitle, right }: { kicker?: string; title: string; subtitle?: string; right?: React.ReactNode }) {
  return <View style={{ gap: 7, marginBottom: 3 }}>
    <View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={ui.eyebrow}>{kicker}</Text>{right}</View>
    <Text style={ui.heading}>{title}</Text>{subtitle ? <Text style={ui.muted}>{subtitle}</Text> : null}
  </View>;
}
export function Button({ title, onPress, icon, tone = 'primary', disabled, loading }: { title: string; onPress: () => void; icon?: keyof typeof Feather.glyphMap; tone?: 'primary' | 'quiet' | 'danger'; disabled?: boolean; loading?: boolean }) {
  const backgroundColor = tone === 'primary' ? colors.primary : tone === 'danger' ? '#FBE9E7' : colors.surfaceAlt;
  const foreground = tone === 'primary' ? colors.white : tone === 'danger' ? colors.red : colors.primaryDark;
  return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [{ minHeight: 50, borderRadius: 15, backgroundColor, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, paddingHorizontal: 16, opacity: disabled ? 0.55 : pressed ? 0.85 : 1 }, tone === 'primary' ? { shadowColor: colors.primaryDark, shadowOpacity: 0.14, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 2 } : null]}>
    {loading ? <ActivityIndicator color={foreground} /> : icon ? <Feather name={icon} size={17} color={foreground} /> : null}
    <Text style={{ fontWeight: '700', color: foreground, fontSize: 15 }}>{loading ? 'Procesando…' : title}</Text>
  </Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={{ gap: 7 }}>
    <Text style={{ color: colors.ink, fontSize: 13, fontWeight: '700' }}>{label}</Text>
    <TextInput placeholderTextColor={colors.faint} style={ui.input} accessibilityLabel={label} {...props} />
  </View>;
}
export function Notice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <View style={[ui.card, { borderColor: '#E7C1BC', backgroundColor: '#FFF7F5', gap: 10 }]}>
    <View style={[ui.row, { gap: 8 }]}><Feather name="alert-circle" size={18} color={colors.red} /><Text style={{ color: colors.red, fontWeight: '700', flex: 1 }}>No se pudo cargar la información</Text></View>
    <Text style={ui.muted}>{message}</Text>{onRetry ? <Pressable onPress={onRetry} accessibilityRole="button"><Text style={{ color: colors.primary, fontWeight: '700' }}>Intentar de nuevo</Text></Pressable> : null}
  </View>;
}
export function LoadingCard() {
  return <View style={[ui.card, { gap: 12 }]}><View style={{ height: 12, width: '42%', borderRadius: 6, backgroundColor: colors.surfaceAlt }} /><View style={{ height: 18, width: '72%', borderRadius: 8, backgroundColor: colors.surfaceAlt }} /><View style={{ height: 10, width: '55%', borderRadius: 6, backgroundColor: colors.surfaceAlt }} /></View>;
}
export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <View style={[ui.card, { alignItems: 'center', paddingVertical: 25, gap: 9 }]}>
    <View style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}><Feather name="inbox" size={21} color={colors.primary} /></View>
    <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>{title}</Text>
    <Text style={[ui.muted, { textAlign: 'center' }]}>{description}</Text>{action}
  </View>;
}
export function ValueLine({ label, value }: { label: string; value?: unknown }) {
  const text = value === null || value === undefined || value === '' ? 'Sin dato' : String(value);
  return <View style={[ui.row, { justifyContent: 'space-between', gap: 12, paddingVertical: 9, borderBottomColor: '#E2F0ED', borderBottomWidth: StyleSheet.hairlineWidth }]}><Text style={ui.muted}>{label}</Text><Text style={{ color: colors.ink, fontWeight: '600', flexShrink: 1, textAlign: 'right' }}>{text}</Text></View>;
}
