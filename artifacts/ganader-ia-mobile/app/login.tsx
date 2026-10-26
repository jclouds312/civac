import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { Button, Field, ui } from '@/components/ui';
import colors from '@/constants/colors';
import { displayError } from '@/lib/api';
import { useSession } from '@/lib/session';

export default function LoginScreen() {
  const { signIn, token, ready } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [recovery, setRecovery] = useState(false);
  const [cardMode, setCardMode] = useState(false);
  const [cardCode, setCardCode] = useState('');
  const { activateCard } = useSession();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>;
  if (token) return <Redirect href="/(tabs)" />;
  const submit = async () => {
    if (!email.trim() || !password) { setError('Ingresa tu correo y contraseña para continuar.'); return; }
    setError(''); setBusy(true);
    try { await signIn(email.trim(), password); router.replace('/(tabs)'); }
    catch (e) { setError(displayError(e)); }
    finally { setBusy(false); }
  };
  const submitCard = async () => {
    if (!cardCode.trim()) { setError('Ingresa el código de la tarjeta CIVAC.'); return; }
    setError(''); setBusy(true);
    try { await activateCard(cardCode.trim()); router.replace('/(tabs)'); }
    catch (e) { setError(displayError(e)); }
    finally { setBusy(false); }
  };
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
    <StatusBar style="dark" />
    <View style={{ flex: 1, padding: 25, justifyContent: 'center', gap: 25 }}>
      <View style={{ gap: 21 }}>
        <View style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="activity" size={27} color="#62DCC7" />
        </View>
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.navy, fontSize: 13, fontWeight: '700', letterSpacing: 2 }}>GANADERÍA INTELIGENTE</Text>
          <Text style={{ color: colors.ink, fontSize: 34, lineHeight: 39, fontWeight: '700', letterSpacing: -1.2 }}>Tu finca,{'\n'}en movimiento.</Text>
          <Text style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>Hato, campo y decisiones en un solo lugar.</Text>
        </View>
      </View>
      <View style={[ui.card, { padding: 20, gap: 16 }]}>
        <View style={{ gap: 5 }}><Text style={{ color: colors.ink, fontSize: 21, fontWeight: '700' }}>{cardMode ? 'Tarjeta Premium' : 'Iniciar sesión'}</Text><Text style={ui.muted}>{cardMode ? 'Activa el acceso de cliente William con su código privado.' : 'Accede con tu cuenta GanaderIA.'}</Text></View>
        {cardMode
          ? <Field label="Código de activación" value={cardCode} onChangeText={value => setCardCode(value.toUpperCase())} autoCapitalize="characters" autoCorrect={false} placeholder="CIVAC-WILLIAM-…" returnKeyType="go" onSubmitEditing={submitCard} />
          : <>
              <Field label="Correo electrónico o usuario" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="nombre@finca.com" returnKeyType="next" />
              <Field label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="Tu contraseña" onSubmitEditing={submit} />
            </>}
        {error ? <View style={{ padding: 12, borderRadius: 12, backgroundColor: '#FFF0EE', flexDirection: 'row', gap: 8 }}><Feather name="alert-circle" color={colors.red} size={17} /><Text accessibilityRole="alert" style={{ color: colors.red, flex: 1, fontSize: 13, lineHeight: 19 }}>{error}</Text></View> : null}
        <Button title={cardMode ? 'Activar acceso Premium' : 'Entrar a mi finca'} onPress={cardMode ? submitCard : submit} loading={busy} icon="arrow-right" />
        <Pressable onPress={() => { setCardMode(value => !value); setCardCode(''); setError(''); setRecovery(false); }} accessibilityRole="button" style={{ alignItems: 'center', padding: 6 }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>{cardMode ? 'Volver al inicio de sesión' : 'Tengo la tarjeta Premium de William'}</Text>
        </Pressable>
        {!cardMode && <Pressable onPress={() => { setRecovery(!recovery); setError(''); }} accessibilityRole="button" style={{ alignItems: 'center', padding: 6 }}><Text style={{ color: colors.primary, fontWeight: '700' }}>{recovery ? 'Volver al inicio de sesión' : '¿Olvidaste tu contraseña?'}</Text></Pressable>}
        {recovery && !cardMode ? <Text style={[ui.muted, { textAlign: 'center' }]}>Para recuperar el acceso, comunícate con el administrador de tu finca o con el equipo CIVAC. La recuperación automática no está habilitada en esta versión.</Text> : null}
      </View>
      <Text style={{ color: colors.muted, textAlign: 'center', fontSize: 12 }}>Gestión ganadera para Colombia · GanaderIA</Text>
    </View>
  </KeyboardAvoidingView>;
}
