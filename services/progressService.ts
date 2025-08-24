// services/progressService.ts
// Orquestra dados do calendário mensal: intervalo visível e mapa de dias concluídos.

import { endOfMonth, getMonthMatrix, startOfMonth, toKey } from '@/utils/date';
import { getCompletedMapForRange } from '@/utils/db';

export type MonthCell = {
  date: Date;
  key: string;         // 'YYYY-MM-DD'
  inMonth: boolean;    // se pertence ao mês atualmente visível
  completed: boolean;  // se foi concluída a oração
};

/**
 * Carrega a matriz do mês (6x7) e marca dias concluídos.
 * Retorna também o intervalo de chaves [startKey, endKey] que foi consultado.
 */
export async function loadMonth(viewDate: Date): Promise<{
  matrix: MonthCell[][];
  startKey: string;
  endKey: string;
}> {
  const matrixDates = getMonthMatrix(viewDate);
  const first = matrixDates[0][0];
  const last = matrixDates[5][6];

  const startKey = toKey(first);
  const endKey = toKey(last);

  // Busca uma única vez os dias concluídos no range inteiro
  const completedSet = await getCompletedMapForRange(startKey, endKey);

  // Monta a matriz de células com flags
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);

  const matrix: MonthCell[][] = matrixDates.map(week =>
    week.map(date => {
      const key = toKey(date);
      const inMonth = date >= monthStart && date <= monthEnd;
      const completed = completedSet.has(key);
      return { date, key, inMonth, completed };
    })
  );

  return { matrix, startKey, endKey };
}
