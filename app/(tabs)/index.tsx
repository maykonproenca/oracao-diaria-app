// app/(tabs)/index.tsx
// Tela principal com feedback via Toasts e estados consistentes.
import ErrorState from '@/components/ErrorState';
import PrayerCard from '@/components/PrayerCard';
import { ThemedText, ThemedView, useTheme } from '@/components/ui/Themed';
import { useToast } from '@/components/ui/ToastProvider';
import { usePrayerUpdates } from '@/hooks/usePrayerUpdates';
import { useTodayPrayer } from '@/hooks/useTodayPrayer';
import { buildShareMessage, shareWhatsApp } from '@/services/shareService';
import { formatHuman } from '@/utils/date';
import React, { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
export default function IndexScreen() {
  const { loading, error, data, actionLoading, reload, complete } = useTodayPrayer();
  const { refreshStats } = usePrayerUpdates();
  const { colors, spacing } = useTheme();
  // const { stats } = useTodayPrayer(); // Removido - não utilizado
  // const { radius } = useTheme(); // Removido - não utilizado
  const toast = useToast();
  const onComplete = useCallback(async () => {
    try {
      await complete();
      // Força atualização das estatísticas para sincronizar com outras telas
      await refreshStats();
      toast.show({ type: 'success', message: 'Oração marcada como concluída.' });
    } catch (e: any) {
      toast.show({ type: 'error', message: e?.message ?? 'Falha ao concluir.' });
    }
  }, [complete, refreshStats, toast]);

  const onShareWhatsApp = useCallback(async () => {
    try {
      const msg = buildShareMessage({ 
        title: 'Oração do Dia', 
        content: data?.prayer?.content ?? '', 
        includeLink: true 
      });
      await shareWhatsApp(msg);
    } catch (e: any) {
      toast.show({ type: 'error', message: e?.message ?? 'Falha ao abrir o WhatsApp.' });
    }
  }, [data?.prayer?.content, toast]);
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
        <ErrorState message={error} onRetry={reload} showResetOption={true} />
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
      {/* Título da tela */}
      <ThemedText size="h1" weight="800">Oração Diária</ThemedText>
      {/* Card da oração */}
      <PrayerCard
        content={data?.prayer?.content ?? 'Sem orações no banco ainda. Popule a tabela "prayers".'}
        completed={Boolean(data?.completed)}
        loadingAction={actionLoading}
        onComplete={onComplete}
        onShareWhatsApp={onShareWhatsApp}
      />
      
      {!data?.prayer?.content && (
        <View style={{ padding: spacing(3) }}>
          <ThemedText tone="muted" size="small">
            Dica: insira orações na tabela &quot;prayers&quot; ou importe um seed inicial.
          </ThemedText>
        </View>
      )}
      
      {/* Data na parte inferior */}
      <View style={{ 
        alignItems: 'center', 
        paddingVertical: spacing(2),
        marginTop: 'auto'
      }}>
        <ThemedText size="small" tone="muted">Hoje • {dateText}</ThemedText>
      </View>
    </ScrollView>
  );
}


