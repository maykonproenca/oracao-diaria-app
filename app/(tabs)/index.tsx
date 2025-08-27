// app/(tabs)/index.tsx
// Tela principal com feedback via Toasts e estados consistentes.
import React, { useCallback } from 'react';
import { ScrollView, View, ActivityIndicator, RefreshControl } from 'react-native';
import { useTodayPrayer } from '@/hooks/useTodayPrayer';
import PrayerCard from '@/components/PrayerCard';
import ErrorState from '@/components/ErrorState';
import { formatHuman } from '@/utils/date';
import { buildShareMessage, shareSystem, shareWhatsApp } from '@/services/shareService';
import { ThemedText, ThemedView, useTheme } from '@/components/ui/Themed';
import { useToast } from '@/components/ui/ToastProvider';
export default function IndexScreen() {
  const { loading, error, data, stats, actionLoading, reload, complete } = useTodayPrayer();
  const { colors, spacing, radius } = useTheme();
  const toast = useToast();
  const onShare = useCallback(async () => {
    try {
      const msg = buildShareMessage({
        title: data?.prayer?.title ?? 'Oração do dia',
        content: data?.prayer?.content ?? '',
        includeLink: true,
      });
      await shareSystem(msg);
      toast.show({ type: 'success', message: 'Compartilhado!' });
    } catch (e: any) {
      toast.show({ type: 'error', message: e?.message ?? 'Falha ao compartilhar.' });
    }
  }, [data?.prayer?.title, data?.prayer?.content, toast]);
  const onShareWA = useCallback(async () => {
    try {
      const msg = buildShareMessage({
        title: data?.prayer?.title ?? 'Oração do dia',
        content: data?.prayer?.content ?? '',
        includeLink: true,
      });
      await shareWhatsApp(msg);
    } catch (e: any) {
      toast.show({ type: 'error', message: e?.message ?? 'Falha ao abrir o WhatsApp.' });
    }
  }, [data?.prayer?.title, data?.prayer?.content, toast]);
  const onComplete = useCallback(async () => {
    try {
      await complete();
      toast.show({ type: 'success', message: 'Oração marcada como concluída.' });
    } catch (e: any) {
      toast.show({ type: 'error', message: e?.message ?? 'Falha ao concluir.' });
    }
  }, [complete, toast]);
  if (loading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing(3) }}>
        <ActivityIndicator />
        <ThemedText tone="muted">Carregando oração do dia...</ThemedText>
      </ThemedView>
    );
  }
  if (error) {
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing(4) }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={reload} />}
        style={{ backgroundColor: colors.background }}
      >
        <ErrorState message={error} onRetry={reload} />
      </ScrollView>
    );
  }
  const dateText = data?.dateKey ? formatHuman(new Date(data.dateKey + 'T00:00:00')) : '';
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing(4), gap: spacing(4) }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={reload} />}
    >
      {/* Cabeçalho */}
      <View style={{ gap: spacing(1) }}>
        <ThemedText size="small" tone="muted">Hoje • {dateText}</ThemedText>
      </View>
      {/* Card da oração + ações */}
      <PrayerCard
        title={data?.prayer?.title ?? 'Oração do Dia'}
        content={data?.prayer?.content ?? 'Sem orações no banco ainda. Popule a tabela "prayers".'}
        completed={Boolean(data?.completed)}
        loadingAction={actionLoading}
        onComplete={onComplete}
        onShare={data?.prayer?.content ? onShare : undefined}
        onShareWhatsApp={data?.prayer?.content ? onShareWA : undefined}
      />
      {/* Estatísticas */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          padding: spacing(4),
          gap: spacing(2),
        }}
      >
        <ThemedText size="h2" weight="800">Seu progresso</ThemedText>
        <ThemedText>Streak atual: <ThemedText weight="800">{stats?.currentStreak ?? 0}</ThemedText> dia(s)</ThemedText>
        <ThemedText>Maior streak: <ThemedText weight="800">{stats?.longestStreak ?? 0}</ThemedText> dia(s)</ThemedText>
        <ThemedText>Total concluídas: <ThemedText weight="800">{stats?.totalCompleted ?? 0}</ThemedText></ThemedText>
      </View>
      {!data?.prayer?.content && (
        <View style={{ padding: spacing(3) }}>
          <ThemedText tone="muted" size="small">
            Dica: insira orações na tabela "prayers" ou importe um seed inicial.
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}
