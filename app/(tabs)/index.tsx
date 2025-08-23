// app/(tabs)/index.tsx
// Tela principal: carrega a oração do dia, exibe stats e permite marcar como orada.
// Inclui tratamento de loading e erros.

import ErrorState from '@/components/ErrorState';
import PrayerCard from '@/components/PrayerCard';
import { useTodayPrayer } from '@/hooks/useTodayPrayer';
import { formatHuman } from '@/utils/date';
import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, useColorScheme, View } from 'react-native';

export default function IndexScreen() {
  const { loading, error, data, stats, actionLoading, reload, complete } = useTodayPrayer();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator />
        <Text style={{ opacity: 0.8 }}>Carregando oração do dia...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={reload} />}
      >
        <ErrorState message={error} onRetry={reload} />
      </ScrollView>
    );
  }

  const dateText = data?.dateKey ? formatHuman(new Date(data.dateKey + 'T00:00:00')) : '';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#0b1220' : '#f8fafc' }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={reload} />}
    >
      {/* Cabeçalho com data e título */}
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 13, opacity: 0.7 }}>Hoje • {dateText}</Text>
        <Text style={{ fontSize: 20, fontWeight: '800' }}>Oração Diária</Text>
      </View>

      {/* Card com a oração */}
      <PrayerCard
        title={data?.prayer?.title ?? 'Oração do Dia'}
        content={data?.prayer?.content ?? 'Sem orações no banco ainda. Popule a tabela "prayers".'}
        completed={Boolean(data?.completed)}
        loadingAction={actionLoading}
        onComplete={complete}
      />

      {/* Estatísticas */}
      <View
        style={{
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
          borderColor: isDark ? '#1f2937' : '#e5e7eb',
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700' }}>Seu progresso</Text>
        <Text style={{ fontSize: 14 }}>Streak atual: <Text style={{ fontWeight: '700' }}>{stats?.currentStreak ?? 0}</Text> dia(s)</Text>
        <Text style={{ fontSize: 14 }}>Maior streak: <Text style={{ fontWeight: '700' }}>{stats?.longestStreak ?? 0}</Text> dia(s)</Text>
        <Text style={{ fontSize: 14 }}>Total de orações concluídas: <Text style={{ fontWeight: '700' }}>{stats?.totalCompleted ?? 0}</Text></Text>
      </View>

      {/* Dica caso não haja conteúdo */}
      {!data?.prayer?.content && (
        <View style={{ padding: 12 }}>
          <Text style={{ fontSize: 13, opacity: 0.8 }}>
            Dica: insira orações na tabela "prayers" ou importe um seed inicial.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
