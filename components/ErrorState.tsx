// components/ErrorState.tsx
// Componente simples para exibir erros com opção de "Tentar novamente".

import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  message: string;
  onRetry?: () => void;
};

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>Ops, algo deu errado</Text>
      <Text style={{ fontSize: 14, opacity: 0.8 }}>{message}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#1d4ed8' : '#2563eb',
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 8,
          })}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Tentar novamente</Text>
        </Pressable>
      )}
    </View>
  );
}
