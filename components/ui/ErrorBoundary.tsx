// components/ui/ErrorBoundary.tsx
// Captura erros de render e mostra fallback com "Tentar novamente".

import React from 'react';
import { View, Pressable } from 'react-native';
import { ThemedText, useTheme } from '@/components/ui/Themed';

type Props = {
  children: React.ReactNode;
  onReset?: () => void;
};

type State = { hasError: boolean; message: string | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: null };

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, message: error?.message ?? 'Erro desconhecido' };
  }

  componentDidCatch(error: any) {
    // Aqui poderíamos enviar a um serviço de log no futuro
    console.warn('ErrorBoundary capturou:', error);
  }

  private reset = () => {
    this.setState({ hasError: false, message: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return <Fallback message={this.state.message ?? 'Erro'} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}

function Fallback({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing(4), alignItems: 'center', justifyContent: 'center', gap: spacing(3) }}>
      <ThemedText size="title" weight="800">Algo deu errado</ThemedText>
      <View style={{ backgroundColor: colors.dangerBg, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing(3), maxWidth: 500 }}>
        <ThemedText tone="danger">⚠️ {message}</ThemedText>
      </View>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => ({
          backgroundColor: pressed ? '#1d4ed8' : colors.primary,
          paddingVertical: spacing(3), paddingHorizontal: spacing(4),
          borderRadius: radius.sm,
        })}
      >
        <ThemedText weight="800" style={{ color: colors.primaryText }}>Tentar novamente</ThemedText>
      </Pressable>
    </View>
  );
}
