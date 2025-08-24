// components/ErrorState.tsx
// Estado de erro com botão de tentar novamente (usa tema).

import { ThemedText, useTheme } from '@/components/ui/Themed';
import React from 'react';
import { Pressable, View } from 'react-native';

type Props = {
  message: string;
  onRetry?: () => void;
};

export default function ErrorState({ message, onRetry }: Props) {
  const { colors, radius, spacing } = useTheme();
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
    </View>
  );
}
