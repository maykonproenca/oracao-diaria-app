// components/PrayerCard.tsx
// Card de oração padronizado com tema (botão principal e botões secundários opcionais).

import { ThemedText, useTheme } from '@/components/ui/Themed';
import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

type Props = {
  title?: string;
  content?: string;
  completed: boolean;
  loadingAction?: boolean;
  onComplete?: () => void;
};

export default function PrayerCard({
  title,
  content,
  completed,
  loadingAction,
  onComplete,
}: Props) {
  const { colors, radius, spacing, shadow, text } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.md,
        padding: spacing(4),
        gap: spacing(3),
        ...shadow(1),
      }}
    >
      {title && <ThemedText size="title" weight="800">{title}</ThemedText>}
      <ThemedText style={{ lineHeight: 22, fontSize: 17, textAlign: 'justify' }}>{content ?? 'Carregando oração...'}</ThemedText>

      {loadingAction ? (
        <View style={{ flexDirection: 'row', gap: spacing(3), alignItems: 'center' }}>
          <ActivityIndicator />
          <ThemedText tone="muted">Processando...</ThemedText>
        </View>
      ) : (
        <PrimaryButton
          label={completed ? 'Oração concluída hoje' : 'Marcar como orada'}
          onPress={completed ? undefined : onComplete}
          disabled={completed}
        />
      )}
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled }: { label: string; onPress?: () => void; disabled?: boolean }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => ({
        backgroundColor: disabled ? '#065f46' : (pressed ? colors.primaryPressed : colors.primary),
        paddingVertical: spacing(3),
        paddingHorizontal: spacing(4),
        borderRadius: radius.sm,
        opacity: disabled ? 0.9 : 1,
      })}
    >
      <ThemedText weight="800" style={{ color: colors.primaryText }}>{label}</ThemedText>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress?: () => void }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? '#e5e7eb' : colors.surface,
        paddingVertical: spacing(3),
        paddingHorizontal: spacing(4),
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
      })}
    >
      <ThemedText weight="800">{label}</ThemedText>
    </Pressable>
  );
}
