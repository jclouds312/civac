import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { apiRequest, displayError } from '@/lib/api';
import { Header, Notice, Page, ui } from '@/components/ui';
import colors from '@/constants/colors';
import { useSession } from '@/lib/session';
import { answerOfflineCivac } from '@workspace/civac-ai/offline';

type Message = { role: 'user' | 'assistant'; content: string };
export default function AssistantScreen() {
  const { user } = useSession();
  const [status, setStatus] = useState<{ available?: boolean; configured?: boolean; [key: string]: unknown } | null>(null);
  const [statusError, setStatusError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [chatError, setChatError] = useState('');
  const scroll = useRef<ScrollView>(null);
  const roleName = String(user?.rol || user?.role || 'usuario').toLowerCase();
  const isCivacStaff = roleName.includes('civac')
    || ['superadmin', 'developer', 'admin', 'sales'].includes(roleName)
    || user?.civac === true
    || user?.isCivac === true;
  const tutorial = isCivacStaff
    ? 'Como usuario CIVAC, consulta criterios técnicos y orientación para el acompañamiento de fincas. Describe el contexto de tu visita y solicita pasos concretos.'
    : 'Pregunta sobre manejo del hato, registros de peso o prácticas de finca. Comparte el contexto necesario; verifica decisiones clínicas con tu profesional veterinario.';
  useEffect(() => {
    let active = true;
    apiRequest<{ available?: boolean; configured?: boolean; [key: string]: unknown }>('/api/ai/status')
      .then(value => { if (active) setStatus(value); })
      .catch(e => { if (active) setStatusError(displayError(e)); });
    return () => { active = false; };
  }, []);
  const send = async (text = input) => {
    const message = text.trim();
    if (!message || busy) return;
    const history = messages.map(m => ({ role: m.role, text: m.content }));
    const next = [...messages, { role: 'user' as const, content: message }];
    setMessages(next); setInput(''); setBusy(true); setChatError('');
    try {
      if (status?.configured === false || status?.available === false) {
        throw new Error('Servicio remoto no disponible');
      }
      const response = await apiRequest<{ ok: boolean; respuesta?: string; error?: string }>('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message, history }) });
      if (!response.ok) throw new Error(response.error || response.respuesta || 'El asistente no pudo responder.');
      setMessages([...next, { role: 'assistant', content: response.respuesta || 'La respuesta llegó vacía.' }]);
    } catch {
      const guide = answerOfflineCivac(message);
      setMessages([...next, { role: 'assistant', content: `Guía local · ${guide.topic}\n\n${guide.text}` }]);
      setChatError('');
    }
    finally { setBusy(false); setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 120); }
  };
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={75}>
    <View style={{ flex: 1 }}>
      <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={[ui.scroll, { paddingBottom: 12, flexGrow: 1 }]}>
        <Header kicker="CIVAC · ASISTENCIA" title="Asistente ganadero" subtitle="Orientación para el trabajo diario en finca." />
        {statusError ? <Notice message={`${statusError} La guía local sigue disponible.`} /> : <View style={[ui.row, { gap: 8, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 11, borderRadius: 13 }]}>
          <View style={{ width: 8, height: 8, borderRadius: 5, backgroundColor: status?.configured === false || status?.available === false ? colors.amber : colors.primary }} />
          <Text style={{ color: colors.muted, fontSize: 12, flex: 1 }}>
            {status?.configured === false || status?.available === false
              ? 'Servicio remoto sin configurar; la guía local funciona sin conexión. En web puedes descargar el modelo local compatible con WebGPU.'
              : 'Servicio remoto disponible; si falla, se usa una guía local sin conexión.'}
          </Text>
        </View>}
        {!messages.length ? <View style={[ui.card, { gap: 12, backgroundColor: colors.navy, borderColor: colors.navy, padding: 20 }]}>
          <View style={[ui.row, { gap: 10 }]}><View style={{ width: 37, height: 37, borderRadius: 13, backgroundColor: '#1F5B58', alignItems: 'center', justifyContent: 'center' }}><Feather name="message-circle" color="#70E3CB" size={18} /></View><Text style={{ color: colors.white, fontSize: 17, fontWeight: '700' }}>¿Qué necesitas resolver?</Text></View>
          <Text style={{ color: '#C3D7D5', lineHeight: 21, fontSize: 14 }}>{tutorial}</Text>
        </View> : <View style={{ gap: 12 }}>{messages.map((m, i) => <View key={`${i}-${m.role}`} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%', backgroundColor: m.role === 'user' ? colors.primary : colors.surface, borderWidth: m.role === 'assistant' ? 1 : 0, borderColor: colors.border, borderRadius: 17, borderBottomRightRadius: m.role === 'user' ? 5 : 17, borderBottomLeftRadius: m.role === 'assistant' ? 5 : 17, padding: 14 }}>
          <Text style={{ color: m.role === 'user' ? colors.white : colors.ink, fontSize: 14, lineHeight: 21 }}>{m.content}</Text>
        </View>)}
          {busy ? <View style={[ui.card, { alignSelf: 'flex-start', padding: 13 }]}><Text style={ui.muted}>CIVAC está preparando una respuesta…</Text></View> : null}
        </View>}
        {chatError ? <View style={{ backgroundColor: '#FFF0EE', padding: 12, borderRadius: 12 }}><Text accessibilityRole="alert" style={{ color: colors.red, fontSize: 13 }}>{chatError}</Text><Pressable onPress={() => send(messages[messages.length - 1]?.content)} style={{ marginTop: 8 }}><Text style={{ color: colors.primary, fontWeight: '700' }}>Reintentar envío</Text></Pressable></View> : null}
        <View style={{ flex: 1, minHeight: 8 }} />
        <Text style={{ color: colors.faint, fontSize: 11, textAlign: 'center' }}>Las respuestas son de apoyo y no sustituyen el criterio profesional.</Text>
      </ScrollView>
      <View style={[ui.row, { paddingHorizontal: 15, paddingTop: 9, paddingBottom: Platform.OS === 'ios' ? 10 : 16, backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border, gap: 8 }]}>
        <TextInput value={input} onChangeText={setInput} multiline placeholder="Escribe tu consulta…" placeholderTextColor={colors.faint} accessibilityLabel="Escribe tu consulta al asistente" style={{ flex: 1, maxHeight: 105, minHeight: 46, borderRadius: 15, backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, color: colors.ink }} />
        <Pressable accessibilityRole="button" accessibilityLabel="Enviar consulta" disabled={busy || !input.trim()} onPress={() => send()} style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', opacity: busy || !input.trim() ? .5 : 1 }}><Feather name="arrow-up" size={20} color={colors.white} /></Pressable>
      </View>
    </View>
  </KeyboardAvoidingView>;
}
