// app/historico.tsx
// Tela de histórico de orações personalizadas

import { ThemedText, useTheme } from '@/components/ui/Themed';
import { useToast } from '@/components/ui/ToastProvider';
import { buildShareMessage, copyToClipboard, shareSystem, shareWhatsApp } from '@/services/shareService';
import { formatHuman } from '@/utils/date';
import { deleteCustomPrayerFromHistory, getCustomPrayersHistory } from '@/utils/db';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

export default function HistoricoScreen() {
  const { colors, radius, spacing } = useTheme();
  const toast = useToast();
  const [history, setHistory] = useState<{ id: number; request: string; generated_prayer: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getCustomPrayersHistory();
      setHistory(data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.show({ type: 'error', message: 'Erro ao carregar histórico' });
    }
  }, [toast]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const onDelete = useCallback(async (id: number) => {
    try {
      await deleteCustomPrayerFromHistory(id);
      await loadHistory();
      toast.show({ type: 'success', message: 'Oração removida do histórico' });
    } catch {
      toast.show({ type: 'error', message: 'Erro ao remover oração' });
    }
  }, [loadHistory, toast]);

  const onCopy = useCallback(async (prayer: string) => {
    try {
      await copyToClipboard(prayer);
      toast.show({ type: 'success', message: 'Oração copiada' });
    } catch {
      toast.show({ type: 'error', message: 'Erro ao copiar oração' });
    }
  }, [toast]);

  const onShare = useCallback(async (prayer: string) => {
    try {
      const msg = buildShareMessage({ title: 'Oração personalizada', content: prayer, includeLink: true });
      await shareSystem(msg);
      toast.show({ type: 'success', message: 'Compartilhado!' });
    } catch {
      toast.show({ type: 'error', message: 'Erro ao compartilhar' });
    }
  }, [toast]);

  const onShareWA = useCallback(async (prayer: string) => {
    try {
      const msg = buildShareMessage({ title: 'Oração personalizada', content: prayer, includeLink: true });
      await shareWhatsApp(msg);
    } catch {
      toast.show({ type: 'error', message: 'Erro ao abrir WhatsApp' });
    }
  }, [toast]);

  useEffect(() => {
    loadHistory().finally(() => setLoading(false));
  }, [loadHistory]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: spacing(4), 
        borderBottomWidth: 1, 
        borderBottomColor: colors.border 
      }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            padding: spacing(2),
            borderRadius: radius.sm,
            backgroundColor: pressed ? colors.border : 'transparent',
            marginRight: spacing(3),
          })}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <ThemedText size="h1" weight="800">Histórico</ThemedText>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing(4), gap: spacing(4) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={{ alignItems: 'center', padding: spacing(8) }}>
            <ActivityIndicator size="large" />
            <ThemedText tone="muted" style={{ marginTop: spacing(2) }}>Carregando histórico...</ThemedText>
          </View>
        ) : history.length === 0 ? (
          <View style={{ alignItems: 'center', padding: spacing(8) }}>
            <Ionicons name="book-outline" size={64} color={colors.textMuted} />
            <ThemedText size="h2" weight="800" style={{ marginTop: spacing(2), textAlign: 'center' }}>
              Nenhuma oração ainda
            </ThemedText>
            <ThemedText tone="muted" style={{ textAlign: 'center', marginTop: spacing(1) }}>
              Suas orações personalizadas aparecerão aqui
            </ThemedText>
          </View>
        ) : (
          history.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: radius.md,
                padding: spacing(4),
                gap: spacing(3),
              }}
            >
              {/* Header do item */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <ThemedText size="small" tone="muted">
                    {formatHuman(new Date(item.created_at))}
                  </ThemedText>
                  <ThemedText size="body" weight="600" style={{ marginTop: spacing(1) }}>
                    &quot;{item.request}&quot;
                  </ThemedText>
                </View>
                <Pressable
                  onPress={() => onDelete(item.id)}
                  style={({ pressed }) => ({
                    padding: spacing(1),
                    borderRadius: radius.sm,
                    backgroundColor: pressed ? colors.dangerBg : 'transparent',
                  })}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.dangerBg} />
                </Pressable>
              </View>

              {/* Oração gerada */}
              <View style={{ 
                backgroundColor: colors.background, 
                padding: spacing(3), 
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <ThemedText style={{ lineHeight: 22 }}>{item.generated_prayer}</ThemedText>
              </View>

              {/* Ações */}
              <View style={{ flexDirection: 'row', gap: spacing(2), flexWrap: 'wrap' }}>
                <ActionButton
                  title="Copiar"
                  icon="copy-outline"
                  onPress={() => onCopy(item.generated_prayer)}
                />
                <ActionButton
                  title="Compartilhar"
                  icon="share-outline"
                  onPress={() => onShare(item.generated_prayer)}
                />
                <ActionButton
                  title="WhatsApp"
                  icon="logo-whatsapp"
                  onPress={() => onShareWA(item.generated_prayer)}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function ActionButton({ title, icon, onPress }: { title: string; icon: string; onPress: () => void }) {
  const { colors, radius, spacing } = useTheme();
  
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing(1),
        backgroundColor: pressed ? colors.border : colors.surface,
        paddingVertical: spacing(2),
        paddingHorizontal: spacing(3),
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
      })}
    >
      <Ionicons name={icon as any} size={16} color={colors.text} />
      <ThemedText size="small" weight="600">{title}</ThemedText>
    </Pressable>
  );
}
