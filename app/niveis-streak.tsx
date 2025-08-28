// app/niveis-streak.tsx
// Tela que mostra o contexto dos níveis de streak

import { ThemedText, useTheme } from '@/components/ui/Themed';
import React from 'react';
import { ScrollView, View } from 'react-native';

type StreakLevel = {
  name: string;
  min: number;
  max: number;
  color: string;
  description: string;
  icon: string;
};

const STREAK_LEVELS: StreakLevel[] = [
  { 
    name: 'Iniciante', 
    min: 0, 
    max: 7, 
    color: '#10B981',
    description: 'Começando sua jornada de oração diária. Cada dia conta!',
    icon: '🌱'
  },
  { 
    name: 'Consistente', 
    min: 7, 
    max: 30, 
    color: '#3B82F6',
    description: 'Uma semana de consistência! Você está criando um hábito sólido.',
    icon: '🌿'
  },
  { 
    name: 'Dedicado', 
    min: 30, 
    max: 90, 
    color: '#F59E0B',
    description: 'Um mês de dedicação! Sua fé está crescendo dia após dia.',
    icon: '🌻'
  },
  { 
    name: 'Comprometido', 
    min: 90, 
    max: 180, 
    color: '#EF4444',
    description: 'Três meses de compromisso! Você é um exemplo de perseverança.',
    icon: '🔥'
  },
  { 
    name: 'Mestre', 
    min: 180, 
    max: 365, 
    color: '#8B5CF6',
    description: 'Seis meses de maestria! Sua disciplina espiritual é admirável.',
    icon: '👑'
  },
  { 
    name: 'Lendário', 
    min: 365, 
    max: Infinity, 
    color: '#000000',
    description: 'Um ano ou mais! Você é uma lenda da oração diária.',
    icon: '🏆'
  },
];

export default function NiveisStreakScreen() {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        paddingHorizontal: spacing(4),
        paddingVertical: spacing(1),
      }} />

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing(4), gap: spacing(4) }}
      >
        {/* Introdução */}
        <View style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          padding: spacing(4),
          gap: spacing(2),
        }}>
          <ThemedText size="h3" weight="700">Como funcionam os níveis?</ThemedText>
          <ThemedText tone="muted" size="small">
            Cada nível representa uma conquista na sua jornada de oração. Quanto mais dias seguidos você orar, 
            mais alto será seu nível. É como subir uma escada espiritual - cada degrau te aproxima mais de Deus!
          </ThemedText>
        </View>

        {/* Lista de níveis */}
        <View style={{ gap: spacing(3) }}>
          {STREAK_LEVELS.map((level, index) => (
            <View
              key={level.name}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: radius.md,
                padding: spacing(4),
                gap: spacing(3),
              }}
            >
              {/* Cabeçalho do nível */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3) }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: level.color,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <ThemedText style={{ fontSize: 20 }}>{level.icon}</ThemedText>
                </View>
                
                <View style={{ flex: 1 }}>
                  <ThemedText size="h3" weight="700">{level.name}</ThemedText>
                  <ThemedText size="small" tone="muted">
                    {level.min} - {level.max === Infinity ? '∞' : level.max} dias
                  </ThemedText>
                </View>
              </View>

              {/* Descrição */}
              <ThemedText tone="muted" size="small">{level.description}</ThemedText>

              {/* Barra de exemplo */}
              <View style={{ gap: spacing(1) }}>
                <View style={{
                  width: '100%',
                  height: 8,
                  backgroundColor: colors.border,
                  borderRadius: 4,
                  overflow: 'hidden',
                }}>
                  <View style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: level.color,
                    borderRadius: 4,
                  }} />
                </View>
                <ThemedText size="small" tone="muted" style={{ textAlign: 'center' }}>
                  Exemplo: 100% do nível
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
