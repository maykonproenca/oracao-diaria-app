// components/ui/ToastProvider.tsx
// Provider de toasts (JS puro). Exibe até 3 toasts na pilha, com animação simples.
// Tipos: 'success' | 'error' | 'info'. Usa o Theme.

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Easing, View, Pressable } from 'react-native';
import { ThemedText, useTheme } from '@/components/ui/Themed';

type ToastType = 'success' | 'error' | 'info';

export type ToastOptions = {
  type?: ToastType;
  title?: string;
  message: string;
  durationMs?: number; // default 3500
};

type ToastItem = ToastOptions & { id: string };

type Ctx = {
  show: (opts: ToastOptions) => void;
};

const ToastCtx = createContext<Ctx>({ show: () => {} });

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors, radius, spacing } = useTheme();
  const [items, setItems] = useState<ToastItem[]>([]);
  const anim = useRef(new Animated.Value(0)).current;

  const remove = useCallback((id: string) => {
    setItems((curr) => curr.filter((i) => i.id !== id));
  }, []);

  const show = useCallback((opts: ToastOptions) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, type: opts.type ?? 'info', title: opts.title, message: opts.message, durationMs: opts.durationMs ?? 3500 };
    setItems((curr) => {
      const next = [item, ...curr].slice(0, 3); // máx 3
      return next;
    });

    // Animação simples (slide-in)
    Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();

    // Auto-remove
    setTimeout(() => remove(id), item.durationMs);
  }, [anim, remove]);

  const value = useMemo(() => ({ show }), [show]);

  const bgByType = (t: ToastType) => {
    switch (t) {
      case 'success': return colors.successBg;
      case 'error': return colors.dangerBg;
      default: return colors.surface;
    }
  };
  const textByType = (t: ToastType) => {
    switch (t) {
      case 'success': return colors.successText;
      case 'error': return colors.dangerText;
      default: return colors.text;
    }
  };

  return (
    <ToastCtx.Provider value={value}>
      {children}

      {/* Contêiner absoluto no topo */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute', top: 12, left: 0, right: 0,
          alignItems: 'center', gap: spacing(2),
        }}
      >
        {items.map((t) => (
          <Animated.View
            key={t.id}
            style={{
              transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
              opacity: anim,
              width: '90%',
            }}
          >
            <Pressable
              onPress={() => remove(t.id)}
              style={{
                backgroundColor: bgByType(t.type!),
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing(3),
              }}
            >
              {!!t.title && <ThemedText weight="800" style={{ color: textByType(t.type!) }}>{t.title}</ThemedText>}
              <ThemedText style={{ color: textByType(t.type!) }}>{t.message}</ThemedText>
              <ThemedText size="small" tone="muted">Toque para dispensar</ThemedText>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </ToastCtx.Provider>
  );
}
