// app/(tabs)/personalizada.tsx
// Geração de oração personalizada (Claude via proxy), com toasts e tratamento de erros/timeout.
import { ThemedText, useTheme } from '@/components/ui/Themed';
import { useToast } from '@/components/ui/ToastProvider';
import { generateCustomPrayer } from '@/services/aiService';
import { buildShareMessage, copyToClipboard, shareSystem, shareWhatsApp } from '@/services/shareService';
import { saveCustomPrayerToHistory } from '@/utils/db';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

// Função para extrair apenas o texto da oração da resposta formatada da API
function extractPrayerText(apiResponse: string): string {
  // Remove o título markdown e o rodapé, mantendo apenas a oração
  const lines = apiResponse.split('\n');
  const prayerLines: string[] = [];
  let inPrayerSection = false;
  
  for (const line of lines) {
    // Pula o título (## 🙏 **...**)
    if (line.startsWith('## 🙏')) continue;
    
    // Pula linhas vazias no início
    if (!inPrayerSection && line.trim() === '') continue;
    
    // Para quando encontrar o separador (---)
    if (line.trim() === '---') break;
    
    // Adiciona a linha se não for o título
    if (line.trim() !== '') {
      inPrayerSection = true;
      prayerLines.push(line);
    }
  }
  
  return prayerLines.join('\n').trim();
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
      const extractedPrayer = extractPrayerText(prayer);
      setResult(extractedPrayer);
      
      // Salva no histórico
      try {
        await saveCustomPrayerToHistory(trimmed, prayer);
      } catch (historyError) {
        console.warn('Erro ao salvar no histórico:', historyError);
        // Não falha a geração se o histórico der erro
      }
      
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
      <ThemedText 
        size="h1" 
        weight="800" 
        style={{ 
          textAlign: 'center',
          fontSize: 22 // h1 normalmente é 30px, então 30-2 = 28px
        }}
      >
        Pelo que você quer Orar hoje?
      </ThemedText>
      {/* Formulário de entrada - só aparece se não há resultado */}
      {!result && (
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
            backgroundColor: '#f9fafb',
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
      )}
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
          <ThemedText style={{ lineHeight: 22 }}>{result}</ThemedText>
          <View style={{ flexDirection: 'row', gap: spacing(3), flexWrap: 'wrap' }}>
            <Secondary title="Copiar" onPress={onCopy} />
            <Secondary title="Compartilhar" onPress={onShare} />
            <Secondary title="WhatsApp" onPress={onShareWA} />
            <Secondary title="Nova Oração" onPress={onClear} />
          </View>
        </View>
      )}
      
      {/* Espaçamento */}
      <View style={{ height: spacing(4) }} />
      
      {/* Botão Histórico */}
      <Pressable
        onPress={() => {
          router.push('/historico');
        }}
        style={({ pressed }) => ({
          backgroundColor: pressed ? '#d4a574' : '#f5e6d3',
          paddingVertical: spacing(2),
          paddingHorizontal: spacing(3),
          borderRadius: radius.sm,
          borderWidth: 1,
          borderColor: '#d4a574',
          alignSelf: 'center',
        })}
      >
        <ThemedText size="small" style={{ color: '#8b4513' }}>Histórico</ThemedText>
      </Pressable>
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
