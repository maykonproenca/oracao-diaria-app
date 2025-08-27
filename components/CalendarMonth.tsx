// components/CalendarMonth.tsx
// Calendário mensal usando tokens do tema.

import { ThemedText, useTheme } from '@/components/ui/Themed';
import type { MonthCell } from '@/services/progressService';
import { isSameDay } from '@/utils/date';
import React from 'react';
import { View } from 'react-native';

type Props = { matrix: MonthCell[][] };

const WEEKDAY_LABELS = [
  { label: 'D', key: 'dom' },
  { label: 'S', key: 'seg' },
  { label: 'T', key: 'ter' },
  { label: 'Q', key: 'qua' },
  { label: 'Q', key: 'qui' },
  { label: 'S', key: 'sex' },
  { label: 'S', key: 'sab' }
];

export default function CalendarMonth({ matrix }: Props) {
  const { colors, spacing, radius, text } = useTheme();
  const today = new Date();

  return (
    <View style={{ gap: spacing(2) }}>
      {/* Cabeçalho dias da semana */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
        {WEEKDAY_LABELS.map((day) => (
          <ThemedText key={day.key} size="small" tone="muted" style={{ width: 40, textAlign: 'center' }}>
            {day.label}
          </ThemedText>
        ))}
      </View>

      {/* Grade 6x7 */}
      <View style={{ gap: spacing(1.5) }}>
        {matrix.map((week, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {week.map((cell) => {
              const isToday = isSameDay(cell.date, today);
              return (
                <View
                  key={cell.key}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: radius.sm,
                    borderWidth: isToday ? 2 : 1,
                    borderColor: isToday ? colors.todayBorder : colors.border,
                    backgroundColor: cell.completed ? colors.completedBg : (cell.inMonth ? colors.surface : colors.outOfMonthBg),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ThemedText weight="600" style={{ opacity: cell.inMonth ? 1 : 0.55 }}>
                    {cell.date.getDate()}
                  </ThemedText>

                  {/* Indicador de concluído (ponto) */}
                  {cell.completed && (
                    <View
                      style={{
                        width: 6, height: 6, borderRadius: 3,
                        backgroundColor: colors.completedDot,
                        position: 'absolute', bottom: 2,
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Legenda */}
      <View style={{ flexDirection: 'row', gap: spacing(3), marginTop: spacing(1.5), alignItems: 'center' }}>
        <Legend color={colors.todayBorder} label="Hoje" border />
        <Legend color={colors.completedBg} label="Concluído" />
        <Legend color={colors.outOfMonthBg} label="Fora do mês" />
      </View>
    </View>
  );
}

function Legend({ color, label, border }: { color: string; label: string; border?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View
        style={{
          width: 14, height: 14, borderRadius: 4,
          backgroundColor: color,
          borderWidth: border ? 2 : 1,
          borderColor: border ? color : '#94a3b8',
        }}
      />
      <ThemedText size="small" tone="muted">{label}</ThemedText>
    </View>
  );
}
