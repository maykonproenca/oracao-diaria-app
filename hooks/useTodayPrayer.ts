// hooks/useTodayPrayer.ts
// Hook que carrega a oração do dia, status de conclusão e estatísticas.
// Centraliza o fluxo de dados e expõe funções de reload e concluir.

import type { TodayPrayerResult } from '@/services/prayerService';
import { getOrCreateTodayPrayer, getStats, markTodayAsCompleted } from '@/services/prayerService';
import { checkAndUpdatePrayers } from '@/services/prayerUpdateService';
import { insertInitialPrayers } from '@/utils/db';
import { useCallback, useEffect, useMemo, useState } from 'react';

type State = {
  loading: boolean;
  error: string | null;
  data: TodayPrayerResult | null;
  stats: { currentStreak: number; longestStreak: number; totalCompleted: number } | null;
  actionLoading: boolean;
};

export function useTodayPrayer() {
  const [state, setState] = useState<State>({
    loading: true,
    error: null,
    data: null,
    stats: null,
    actionLoading: false,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // 1. Verificar e atualizar orações se necessário
      await checkAndUpdatePrayers();
      
      // 2. Inserir orações iniciais se necessário (fallback)
      await insertInitialPrayers();
      
      // 3. Carregar dados do usuário
      const [today, stats] = await Promise.all([getOrCreateTodayPrayer(), getStats()]);
      setState({ loading: false, error: null, data: today, stats, actionLoading: false });
    } catch (e: any) {
      console.error('Erro no hook useTodayPrayer:', e);
      setState((s) => ({ 
        ...s, 
        loading: false, 
        error: 'Erro ao carregar dados. Tente novamente.',
        data: null,
        stats: null,
        actionLoading: false 
      }));
    }
  }, []);

  const complete = useCallback(async () => {
    setState((s) => ({ ...s, actionLoading: true, error: null }));
    try {
      await markTodayAsCompleted();
      // Recarrega tudo (status e stats)
      const [today, stats] = await Promise.all([getOrCreateTodayPrayer(), getStats()]);
      setState({ loading: false, error: null, data: today, stats, actionLoading: false });
    } catch (e: any) {
      setState((s) => ({ ...s, actionLoading: false, error: e?.message ?? 'Erro ao marcar como orada' }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(
    () => ({
      ...state,
      reload: load,
      complete,
    }),
    [state, load, complete]
  );
}
