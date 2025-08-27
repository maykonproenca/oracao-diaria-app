// app/(tabs)/_layout.tsx
// Layout principal: inicializa notificações e envolve a UI com ThemeProvider, ToastProvider e ErrorBoundary.

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ThemeProvider, useTheme } from '@/components/ui/Themed';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { initNotificationsOnAppStart } from '@/services/notificationService';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';

function NotificationButton() {
  const { colors, spacing, radius } = useTheme();
  
  return (
    <Pressable
      onPress={() => router.push('/notificacoes')}
      style={({ pressed }) => ({
        padding: spacing(2),
        marginRight: spacing(2),
        borderRadius: radius.sm,
        backgroundColor: pressed ? colors.border : 'transparent',
      })}
    >
      <Ionicons name="notifications" size={24} color={colors.text} />
    </Pressable>
  );
}

export default function TabsLayout() {
  const [key, setKey] = useState(0);

  useEffect(() => {
    initNotificationsOnAppStart().catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <ErrorBoundary onReset={() => setKey((k) => k + 1)}>
          <Tabs 
            key={key} 
            screenOptions={{ 
              headerShown: true,
              headerRight: () => <NotificationButton />
            }}
          >
            <Tabs.Screen 
              name="index" 
              options={{ 
                title: 'Oração Diária',
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="hand-left" size={size} color={color} />
                ),
              }} 
            />
            <Tabs.Screen 
              name="personalizada" 
              options={{ 
                title: 'Personalizada',
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="book" size={size} color={color} />
                ),
              }} 
            />
            <Tabs.Screen 
              name="calendario" 
              options={{ 
                title: 'Calendário',
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="calendar" size={size} color={color} />
                ),
              }} 
            />
          </Tabs>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}
