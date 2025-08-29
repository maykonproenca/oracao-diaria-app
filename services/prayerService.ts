// services/prayerService.ts
// Orquestra a lógica da Oração do Dia:
// - escolhe uma oração determinística com base na data (YYYY-MM-DD)
// - garante persistência do "qual ID foi escolhido hoje" em daily_prayer_status
// - expõe funções para marcar como concluída e obter estatísticas

import { todayKey } from '@/utils/date';
import { getBasicStats, getCurrentStreak, getDayStatus, getDB, getPrayerById, getPrayerByReleaseDate, getPrayersCount, upsertDayStatus } from '@/utils/db';

export type Prayer = { id: number; title: string; content: string; release_date: string };

export type TodayPrayerResult = {
  dateKey: string;
  prayer: Prayer | null;
  completed: boolean;
};

export async function getOrCreateTodayPrayer(): Promise<TodayPrayerResult> {
  const dateKey = todayKey();
  
  // 1) Se já temos status para hoje, usamos aquele prayer_id
  const status = await getDayStatus(dateKey);
  if (status) {
    const prayer = await getPrayerById(status.prayer_id);
    return { dateKey, prayer, completed: status.completed === 1 };
  }

  // 2) Busca a oração que tem release_date igual à data de hoje
  const todayPrayer = await getPrayerByReleaseDate(dateKey);
  
  if (todayPrayer) {
    // Encontrou uma oração para hoje, salva o status
    await upsertDayStatus(dateKey, todayPrayer.id, 0);
    return { dateKey, prayer: todayPrayer, completed: false };
  }

  // 3) Se não encontrou oração para hoje, busca a oração mais recente disponível
  // (fallback para quando não há oração específica para a data atual)
  const total = await getPrayersCount();
  if (total === 0) {
    // Banco ainda não populado
    return { dateKey, prayer: null, completed: false };
  }

  // Busca a oração com release_date mais recente que não seja futura
  const db = await getDB();
  const fallbackRows = await db.getAllAsync<{ id: number; title: string; content: string; release_date: string }>(
    'SELECT id, title, content, release_date FROM prayers WHERE release_date <= ? ORDER BY release_date DESC LIMIT 1',
    [dateKey]
  );
  
  const fallbackPrayer = fallbackRows?.[0] ?? null;
  if (fallbackPrayer) {
    await upsertDayStatus(dateKey, fallbackPrayer.id, 0);
    return { dateKey, prayer: fallbackPrayer, completed: false };
  }

  // 4) Último fallback: primeira oração do banco
  const firstPrayer = await getPrayerById(1);
  await upsertDayStatus(dateKey, firstPrayer ? firstPrayer.id : 1, 0);
  return { dateKey, prayer: firstPrayer, completed: false };
}

export async function markTodayAsCompleted(): Promise<void> {
  const dateKey = todayKey();
  const status = await getDayStatus(dateKey);
  if (!status) throw new Error('Status do dia não encontrado. Abra a tela e tente novamente.');
  await upsertDayStatus(dateKey, status.prayer_id, 1);
}

export async function getStats(): Promise<{ currentStreak: number; longestStreak: number; totalCompleted: number }> {
  const dateKey = todayKey();
  const [basic, current] = await Promise.all([getBasicStats(), getCurrentStreak(dateKey)]);
  return {
    currentStreak: current,
    longestStreak: basic.longestStreak,
    totalCompleted: basic.totalCompleted,
  };
}
