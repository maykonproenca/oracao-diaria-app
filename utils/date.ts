// utils/date.ts
// Utilitários de data para o app: chaves YYYY-MM-DD, matriz mensal e helpers.
// Mantemos funções puras para facilitar teste e reuso.

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function keyToDate(key: string): Date {
  // Espera 'YYYY-MM-DD'
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m - 1), d);
}

export function formatHuman(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function addDays(base: Date, delta: number): Date {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + delta);
  return copy;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function toKey(date: Date): string {
  return todayKey(date);
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth();
}

/**
 * Gera uma matriz 6x7 de datas para exibir no calendário.
 * Começa no domingo (0) e termina no sábado (6), cobrindo todo o mês visível.
 * Inclui dias do início/fim que pertencem ao mês anterior/seguinte para completar as 6 semanas.
 */
export function getMonthMatrix(viewDate: Date): Date[][] {
  const start = startOfMonth(viewDate);
  const end = endOfMonth(viewDate);

  // Domingo = 0 ... Sábado = 6
  const startWeekDay = start.getDay();
  // Primeiro dia visível: domingo anterior/igual ao dia 1 do mês
  const firstVisible = addDays(start, -startWeekDay);

  const matrix: Date[][] = [];
  let cursor = new Date(firstVisible);

  for (let week = 0; week < 6; week++) {
    const row: Date[] = [];
    for (let day = 0; day < 7; day++) {
      row.push(new Date(cursor));
      cursor = addDays(cursor, 1);
    }
    matrix.push(row);
  }

  return matrix;
}

/** Retorna o nome do mês no formato "Agosto 2025" (pt-BR). */
export function monthTitle(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

/** Avança/retrocede o mês de uma data base, mantendo o dia 1. */
export function addMonths(base: Date, delta: number): Date {
  const y = base.getFullYear();
  const m = base.getMonth();
  return new Date(y, m + delta, 1);
}
  