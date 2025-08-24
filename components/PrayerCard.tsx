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
  onShare?: () => void;
  onShareWhatsApp?: () => void;
};

export default function PrayerCard({
  title,
  content,
  completed,
  loadingAction,
  onComplete,
  onShare,
  onShareWhatsApp,
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
      <ThemedText size="title" weight="800">{title ?? 'Oração do Dia'}</ThemedText>
      <ThemedText style={{ lineHeight: 22 }}>{content ?? 'Carregando oração...'}</ThemedText>

      {loadingAction ? (
        <View style={{ flexDirection: 'row', gap: spacing(3), alignItems: 'center' }}>
          <ActivityIndicator />
          <ThemedText tone="muted">Processando...</ThemedText>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: spacing(3), flexWrap: 'wrap' }}>
          <PrimaryButton
            label={completed ? 'Oração concluída hoje' : 'Marcar como orada'}
            onPress={completed ? undefined : onComplete}
            disabled={completed}
          />
          {onShare && <SecondaryButton label="Compartilhar" onPress={onShare} />}
          {onShareWhatsApp && <SecondaryButton label="WhatsApp" onPress={onShareWhatsApp} />}
        </View>
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
