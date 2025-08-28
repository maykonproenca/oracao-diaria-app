// components/StreakProgressBar.tsx
// Barra de progresso para streaks com níveis progressivos

import { ThemedText, useTheme } from '@/components/ui/Themed';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

type StreakLevel = {
  name: string;
  min: number;
  max: number;
  color: string;
};

const STREAK_LEVELS: StreakLevel[] = [
  { name: 'Iniciante', min: 0, max: 7, color: '#10B981' },    // Verde
  { name: 'Consistente', min: 7, max: 30, color: '#3B82F6' }, // Azul
  { name: 'Dedicado', min: 30, max: 90, color: '#F59E0B' },   // Amarelo
  { name: 'Comprometido', min: 90, max: 180, color: '#EF4444' }, // Vermelho
  { name: 'Mestre', min: 180, max: 365, color: '#8B5CF6' },   // Roxo
  { name: 'Lendário', min: 365, max: Infinity, color: '#000000' }, // Preto
];

type Props = {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
};

export default function StreakProgressBar({ currentStreak, longestStreak, totalCompleted }: Props) {
  const { colors, spacing, radius } = useTheme();

  // Encontra o nível atual baseado no streak mais longo
  const getCurrentLevel = (streak: number): StreakLevel => {
    return STREAK_LEVELS.find(level => streak >= level.min && streak < level.max) || STREAK_LEVELS[0];
  };

  // Calcula a porcentagem de progresso no nível atual
  const getProgressPercentage = (streak: number, level: StreakLevel): number => {
    if (level.max === Infinity) {
      // Para o nível "Lendário", usa uma progressão baseada em anos
      const years = Math.floor(streak / 365);
      return Math.min((years / 5) * 100, 100); // 5 anos = 100%
    }
    
    const range = level.max - level.min;
    const progress = streak - level.min;
    return Math.min((progress / range) * 100, 100);
  };

  const currentLevel = getCurrentLevel(longestStreak);
  const progressPercentage = getProgressPercentage(longestStreak, currentLevel);

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radius.md,
      padding: spacing(4),
      gap: spacing(3),
    }}>
      {/* Título com ícone de informação */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(2) }}>
          <View style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: currentLevel.color,
          }} />
          <ThemedText size="h2" weight="800">Seu Progresso</ThemedText>
        </View>
        
        <Pressable
          onPress={() => router.push('/niveis-streak')}
          style={({ pressed }) => ({
            padding: spacing(1),
            borderRadius: radius.sm,
            backgroundColor: pressed ? colors.border : 'transparent',
          })}
        >
          <Ionicons name="information-circle" size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* Barra de progresso com nível integrado */}
      <View style={{ gap: spacing(2) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <ThemedText size="small" tone="muted">
            {currentLevel.min} - {currentLevel.max === Infinity ? '∞' : currentLevel.max} dias
          </ThemedText>
          <ThemedText size="small" weight="600">
            {Math.round(progressPercentage)}%
          </ThemedText>
        </View>
        
        <View style={{
          width: '100%',
          height: 32,
          backgroundColor: colors.border,
          borderRadius: 16,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Barra de progresso */}
          <View style={{
            width: `${progressPercentage}%`,
            height: '100%',
            backgroundColor: currentLevel.color,
            borderRadius: 16,
          }} />
          
          {/* Nível sobreposto na barra */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <ThemedText 
              size="small" 
              weight="600" 
              style={{ 
                color: progressPercentage > 50 ? '#FFFFFF' : colors.text,
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {currentLevel.name}
            </ThemedText>
          </View>
        </View>
      </View>

    </View>
  );
}
