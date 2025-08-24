// components/ui/Themed.tsx
// Provedor de tema e hooks utilitários.
// Usa useColorScheme() para definir light/dark e expõe tokens do Design System.

import { darkTheme, lightTheme, Theme } from '@/constants/theme';
import React, { createContext, useContext, useMemo } from 'react';
import { Text, TextProps, useColorScheme, View, ViewProps } from 'react-native';

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const theme = useMemo(() => (scheme === 'dark' ? darkTheme : lightTheme), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Themed wrappers úteis para reduzir repetição:
export function ThemedView(props: ViewProps & { variant?: 'background' | 'surface' }) {
  const { colors } = useTheme();
  const { style, variant = 'background', ...rest } = props;
  return (
    <View
      style={[
        { backgroundColor: variant === 'surface' ? colors.surface : colors.background },
        style,
      ]}
      {...rest}
    />
  );
}

export function ThemedText(props: TextProps & { tone?: 'default' | 'muted' | 'danger' | 'success' | 'warning'; size?: keyof Theme['text']; weight?: '400' | '600' | '800' }) {
  const { colors, text } = useTheme();
  const { style, tone = 'default', size = 'body', weight = '400', ...rest } = props;
  const color =
    tone === 'muted' ? colors.textMuted :
    tone === 'danger' ? colors.dangerText :
    tone === 'success' ? colors.successText :
    tone === 'warning' ? colors.warningText :
    colors.text;

  return (
    <Text
      style={[{ color, fontSize: text[size], fontWeight: weight as any }, style]}
      {...rest}
    />
  );
}
