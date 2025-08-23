// components/PrayerCard.tsx
// Card da oração com título, texto e botão para "marcar como orada".
// Mantém a UI simples e acessível (bom contraste e tamanhos de fonte).

import React from 'react';
import { ActivityIndicator, Pressable, Text, useColorScheme, View } from 'react-native';

type Props = {
  title?: string;
  content?: string;
  completed: boolean;
  loadingAction?: boolean;
  onComplete?: () => void;
};

export default function PrayerCard({ title, content, completed, loadingAction, onComplete }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={{
        backgroundColor: isDark ? '#111827' : '#FFFFFF',
        borderColor: isDark ? '#1f2937' : '#e5e7eb',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '700' }}>{title ?? 'Oração do Dia'}</Text>
      <Text style={{ fontSize: 16, lineHeight: 22, opacity: 0.9 }}>
        {content ?? 'Carregando oração...'}
      </Text>

      <Pressable
        disabled={completed || loadingAction}
        onPress={onComplete}
        style={({ pressed }) => ({
          backgroundColor: completed ? (isDark ? '#065f46' : '#059669') : (pressed ? '#1d4ed8' : '#2563eb'),
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 10,
          alignItems: 'center',
          opacity: loadingAction ? 0.7 : 1,
        })}
      >
        {loadingAction ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: 'white', fontWeight: '700' }}>
            {completed ? 'Oração concluída hoje' : 'Marcar como orada'}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
