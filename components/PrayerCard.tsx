// components/PrayerCard.tsx
// Card de oração padronizado com tema (botão principal e botões secundários opcionais).

import { ThemedText, useTheme } from '@/components/ui/Themed';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

type Props = {
  title?: string;
  content?: string;
  completed: boolean;
  loadingAction?: boolean;
  onComplete?: () => void;
  onShareWhatsApp?: () => void;
};

export default function PrayerCard({
  title,
  content,
  completed,
  loadingAction,
  onComplete,
  onShareWhatsApp,
}: Props) {
  const { colors, radius, spacing, shadow } = useTheme();
  // const { text } = useTheme(); // Removido - não utilizado

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
        <View style={{ gap: spacing(3) }}>
          <PrimaryButton
            label={completed ? 'Registrada com Fé!' : 'Amém!'}
            onPress={completed ? undefined : onComplete}
            disabled={completed}
          />
          {onShareWhatsApp && (
            <WhatsAppButton onPress={onShareWhatsApp} />
          )}
        </View>
      )}
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled }: { label: string; onPress?: () => void; disabled?: boolean }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        style={({ pressed }) => ({
          backgroundColor: disabled ? '#065f46' : (pressed ? colors.primaryPressed : colors.primary),
          paddingVertical: spacing(3),
          paddingHorizontal: spacing(4),
          borderRadius: radius.sm,
          opacity: disabled ? 0.9 : 1,
          width: '75%', // Diminui a largura em 25%
          alignItems: 'center', // Centraliza o conteúdo
        })}
      >
        <ThemedText weight="800" style={{ color: colors.primaryText, textAlign: 'center' }}>{label}</ThemedText>
      </Pressable>
    </View>
  );
}

// Função não utilizada - comentada
// function SecondaryButton({ label, onPress }: { label: string; onPress?: () => void }) {
//   const { colors, radius, spacing } = useTheme();
//   return (
//     <Pressable
//       onPress={onPress}
//       style={({ pressed }) => ({
//         backgroundColor: pressed ? '#e5e7eb' : colors.surface,
//         paddingVertical: spacing(3),
//         paddingHorizontal: spacing(4),
//         borderRadius: radius.sm,
//         borderWidth: 1,
//         borderColor: colors.border,
//       })}
//     >
//       <ThemedText weight="800">{label}</ThemedText>
//     </Pressable>
//   );
// }

function WhatsAppButton({ onPress }: { onPress: () => void }) {
  const { radius, spacing } = useTheme();
  // const { colors } = useTheme(); // Removido - não utilizado
  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: pressed ? '#128C7E' : '#25D366', // Verde do WhatsApp
          paddingVertical: spacing(3),
          paddingHorizontal: spacing(4),
          borderRadius: radius.sm,
          width: '75%', // Mesma largura do botão principal
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing(2),
        })}
      >
        <Ionicons name="logo-whatsapp" size={20} color="white" />
        <ThemedText weight="800" style={{ color: 'white', textAlign: 'center' }}>
          Compartilhar no WhatsApp
        </ThemedText>
      </Pressable>
    </View>
  );
}
