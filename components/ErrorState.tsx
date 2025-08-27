// components/ErrorState.tsx
// Estado de erro com botão de tentar novamente (usa tema).

import { ThemedText, useTheme } from '@/components/ui/Themed';
import { resetDatabase } from '@/utils/db';
import React from 'react';
import { Pressable, View } from 'react-native';

type Props = {
  message: string;
  onRetry?: () => void;
  showResetOption?: boolean;
};

export default function ErrorState({ message, onRetry, showResetOption = false }: Props) {
  const { colors, radius, spacing } = useTheme();
  
  const handleReset = async () => {
    try {
      await resetDatabase();
      if (onRetry) {
        onRetry();
      }
    } catch (error) {
      console.error('Erro ao resetar banco:', error);
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.dangerBg,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.md,
        padding: spacing(4),
        gap: spacing(3),
      }}
    >
      <ThemedText size="h2" weight="800" tone="danger">Ops, algo deu errado</ThemedText>
      <ThemedText>{message}</ThemedText>
      
      <View style={{ gap: spacing(2) }}>
        {onRetry && (
          <Pressable
            onPress={onRetry}
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.primaryPressed : colors.primary,
              paddingVertical: spacing(3),
              paddingHorizontal: spacing(4),
              borderRadius: radius.sm,
            })}
          >
            <ThemedText weight="800" style={{ color: colors.primaryText, textAlign: 'center' }}>
              Tentar novamente
            </ThemedText>
          </Pressable>
        )}
        
        {showResetOption && (
          <Pressable
            onPress={handleReset}
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.border : colors.surface,
              paddingVertical: spacing(3),
              paddingHorizontal: spacing(4),
              borderRadius: radius.sm,
              borderWidth: 1,
              borderColor: colors.border,
            })}
          >
            <ThemedText weight="800" style={{ textAlign: 'center' }}>
              Resetar App
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}
