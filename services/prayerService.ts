// services/prayerService.ts
// Orquestra a lógica da Oração do Dia:
// - escolhe uma oração determinística com base na data (YYYY-MM-DD)
// - garante persistência do "qual ID foi escolhido hoje" em daily_prayer_status
// - expõe funções para marcar como concluída e obter estatísticas

import { getBasicStats, getCurrentStreak, getDayStatus, getPrayerById, getPrayersCount, upsertDayStatus } from '@/utils/database';
import { todayKey } from '@/utils/date';
import { hashStringFNV1a } from '@/utils/hash';

export type Prayer = { id: number; title: string; content: string };

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

  // 2) Caso contrário, escolhemos determinísticamente via hash da data
  const total = await getPrayersCount();
  if (total === 0) {
    // Banco ainda não populado
    return { dateKey, prayer: null, completed: false };
  }

  const idx = (hashStringFNV1a(dateKey) % total) + 1; // IDs autoincrement partem de 1
  const chosen = await getPrayerById(idx);
  if (!chosen) {
    // fallback raro: se o id calculado não existir (buraco na tabela),
    // caímos para o primeiro registro existente.
    const fallbackId = 1;
    const fb = await getPrayerById(fallbackId);
    await upsertDayStatus(dateKey, fb ? fb.id : fallbackId, 0);
    return { dateKey, prayer: fb ?? null, completed: false };
  }

  await upsertDayStatus(dateKey, chosen.id, 0);
  return { dateKey, prayer: chosen, completed: false };
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
