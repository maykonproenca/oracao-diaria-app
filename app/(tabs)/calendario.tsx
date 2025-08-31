// app/(tabs)/calendario.tsx
// Tela de calendário mensal com navegação, usando tokens do tema.

import CalendarMonth from '@/components/CalendarMonth';
import ErrorState from '@/components/ErrorState';
import StreakProgressBar from '@/components/StreakProgressBar';
import { ThemedText, useTheme } from '@/components/ui/Themed';
import { usePrayerUpdates } from '@/hooks/usePrayerUpdates';
import { loadMonth } from '@/services/progressService';
import { addMonths, monthTitle } from '@/utils/date';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

export default function CalendarioScreen() {
  const { colors, radius, spacing } = useTheme();
  const { stats, refreshStats } = usePrayerUpdates();

  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matrix, setMatrix] = useState<any[][] | null>(null);

  const load = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const { matrix } = await loadMonth(date);
      setMatrix(matrix);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar calendário');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load(viewDate);
    } finally {
      setRefreshing(false);
    }
  }, [load, viewDate]);

  useEffect(() => {
    load(viewDate);
  }, [viewDate, load]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing(4), gap: spacing(4) }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Barra de Progresso de Streaks */}
      <StreakProgressBar
        currentStreak={stats?.currentStreak ?? 0}
        longestStreak={stats?.longestStreak ?? 0}
        totalCompleted={stats?.totalCompleted ?? 0}
      />

      {/* Cabeçalho com navegação */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <NavButton dir="left" onPress={() => setViewDate(addMonths(viewDate, -1))} />
        <ThemedText size="title" weight="800">{monthTitle(viewDate)}</ThemedText>
        <NavButton dir="right" onPress={() => setViewDate(addMonths(viewDate, 1))} />
      </View>

      {/* Conteúdo */}
      {loading && (
        <View style={{ alignItems: 'center', gap: spacing(2) }}>
          <ActivityIndicator />
          <ThemedText tone="muted">Carregando calendário...</ThemedText>
        </View>
      )}

      {!loading && error && (
        <ErrorState message={error} onRetry={() => load(viewDate)} />
      )}

      {!loading && !error && matrix && <CalendarMonth matrix={matrix as any} />}
      
      {/* Espaçamento */}
      <View style={{ height: spacing(4) }} />
      
      {/* Frase motivacional */}
      <ThemedText 
        size="body" 
        style={{ 
          fontSize: 15, 
          fontStyle: 'italic', 
          textAlign: 'center',
          marginBottom: spacing(2)
        }}
      >
        Você está a {stats?.currentStreak ?? 0} dias orando! 🙏
      </ThemedText>
    </ScrollView>
  );

  function NavButton({ dir, onPress }: { dir: 'left' | 'right'; onPress: () => void }) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          paddingVertical: spacing(2.5),
          paddingHorizontal: spacing(3),
          borderRadius: radius.sm,
          backgroundColor: pressed ? '#e5e7eb' : colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        })}
      >
        <ThemedText weight="800">{dir === 'left' ? '←' : '→'}</ThemedText>
      </Pressable>
    );
  }
}