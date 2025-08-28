// app/(tabs)/personalizada.tsx
// Geração de oração personalizada (Claude via proxy), com toasts e tratamento de erros/timeout.
import { ThemedText, useTheme } from '@/components/ui/Themed';
import { useToast } from '@/components/ui/ToastProvider';
import { generateCustomPrayer } from '@/services/aiService';
import { buildShareMessage, copyToClipboard, shareSystem, shareWhatsApp } from '@/services/shareService';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}
export default function PersonalizadaScreen() {
  const { colors, radius, spacing } = useTheme();
  const toast = useToast();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const words = useMemo(() => countWords(input), [input]);
  const overLimit = words > 20;
  const abortRef = useRef<AbortController | null>(null);
  const onGenerate = useCallback(async () => {
    setError(null);
    setResult(null);
    const trimmed = input.trim();
    const w = countWords(trimmed);
    if (!trimmed) return setError('Descreva seu pedido em até 20 palavras.');
    if (w > 20) return setError(`Você digitou ${w} palavras. O limite é 20.`);
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const prayer = await generateCustomPrayer(trimmed, { signal: controller.signal });
      setResult(prayer);
      toast.show({ type: 'success', message: 'Oração gerada com sucesso.' });
    } catch (e: any) {
      setError(e?.message ?? 'Falha ao gerar a oração.');
      toast.show({ type: 'error', message: e?.message ?? 'Falha ao gerar a oração.' });
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [input, toast]);
  const onCancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    toast.show({ type: 'info', message: 'Geração cancelada.' });
  }, [toast]);
  const onClear = useCallback(() => {
    setInput('');
    setResult(null);
    setError(null);
  }, []);
  const onCopy = useCallback(async () => {
    try {
      await copyToClipboard(result ?? '');
      toast.show({ type: 'success', message: 'Texto copiado.' });
    } catch (e: any) {
      toast.show({ type: 'error', message: e?.message ?? 'Não foi possível copiar.' });
    }
  }, [result, toast]);
  const onShare = useCallback(async () => {
    try {
      const msg = buildShareMessage({ title: 'Oração personalizada', content: result ?? '', includeLink: true });
      await shareSystem(msg);
      toast.show({ type: 'success', message: 'Compartilhado!' });
    } catch (e: any) {
      toast.show({ type: 'error', message: e?.message ?? 'Falha ao compartilhar.' });
    }
  }, [result, toast]);
  const onShareWA = useCallback(async () => {
    try {
      const msg = buildShareMessage({ title: 'Oração personalizada', content: result ?? '', includeLink: true });
      await shareWhatsApp(msg);
    } catch (e: any) {
      toast.show({ type: 'error', message: e?.message ?? 'Falha ao abrir o WhatsApp.' });
    }
  }, [result, toast]);
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing(4), gap: spacing(4) }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Título da tela */}
      <ThemedText size="h1" weight="800">Personalizada</ThemedText>
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          padding: spacing(4),
          gap: spacing(3),
        }}
      >
        <ThemedText tone="muted">
          Descreva seu pedido em até <ThemedText weight="800">20 palavras</ThemedText>. Ex.: “agradecimento pela família e sabedoria nas decisões”.
        </ThemedText>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Escreva aqui seu pedido em até 20 palavras..."
          placeholderTextColor={colors.textMuted}
          multiline
          style={{
            minHeight: 100,
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing(3),
            color: colors.text,
            backgroundColor: colors.mode === 'dark' ? '#0b1220' : '#f9fafb',
            textAlignVertical: 'top',
          }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ThemedText size="small" tone="muted">Palavras: {words}/20</ThemedText>
          {overLimit && <ThemedText size="small" weight="800" tone="danger">Limite excedido</ThemedText>}
        </View>
        {error && (
          <View style={{
            backgroundColor: colors.dangerBg,
            borderColor: colors.border,
            borderWidth: 1, borderRadius: radius.md, padding: spacing(3)
          }}>
            <ThemedText tone="danger">⚠️ {error}</ThemedText>
          </View>
        )}
        {!loading ? (
          <View style={{ flexDirection: 'row', gap: spacing(3), flexWrap: 'wrap' }}>
            <Primary title="Gerar Oração" onPress={onGenerate} disabled={overLimit || !input.trim()} />
            <Secondary title="Limpar" onPress={onClear} />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: spacing(3), alignItems: 'center' }}>
            <ActivityIndicator />
            <ThemedText tone="muted">Gerando sua oração...</ThemedText>
            <Secondary title="Cancelar" onPress={onCancel} />
          </View>
        )}
      </View>
      {result && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radius.md,
            padding: spacing(4),
            gap: spacing(3),
          }}
        >
          <ThemedText size="h2" weight="800">Sua oração</ThemedText>
          <ThemedText style={{ lineHeight: 22 }}>{result}</ThemedText>
          <View style={{ flexDirection: 'row', gap: spacing(3), flexWrap: 'wrap' }}>
            <Secondary title="Copiar" onPress={onCopy} />
            <Secondary title="Compartilhar" onPress={onShare} />
            <Secondary title="WhatsApp" onPress={onShareWA} />
          </View>
        </View>
      )}
    </ScrollView>
  );
  function Primary({ title, onPress, disabled }: { title: string; onPress?: () => void; disabled?: boolean }) {
    return (
      <Pressable
        onPress={disabled ? undefined : onPress}
        style={({ pressed }) => ({
          backgroundColor: disabled ? '#93c5fd' : (pressed ? '#1d4ed8' : colors.primary),
          paddingVertical: spacing(3),
          paddingHorizontal: spacing(4),
          borderRadius: radius.sm,
        })}
      >
        <ThemedText weight="800" style={{ color: colors.primaryText }}>{title}</ThemedText>
      </Pressable>
    );
  }
  function Secondary({ title, onPress }: { title: string; onPress?: () => void }) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: pressed ? '#e5e7eb' : colors.surface,
          paddingVertical: spacing(3),
          paddingHorizontal: spacing(4),
          borderRadius: radius.sm,
          borderWidth: 1,
          borderColor: colors.border,
        })}
      >
        <ThemedText weight="800">{title}</ThemedText>
      </Pressable>
    );
  }
}
