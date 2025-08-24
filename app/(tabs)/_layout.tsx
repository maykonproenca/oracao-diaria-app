// app/(tabs)/_layout.tsx
// Layout principal: inicializa notificações e envolve a UI com ThemeProvider, ToastProvider e ErrorBoundary.

import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { initNotificationsOnAppStart } from '@/services/notificationService';
import { ThemeProvider } from '@/components/ui/Themed';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function TabsLayout() {
  const [key, setKey] = useState(0);

  useEffect(() => {
    initNotificationsOnAppStart().catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <ErrorBoundary onReset={() => setKey((k) => k + 1)}>
          <Tabs key={key} screenOptions={{ headerShown: true }}>
            <Tabs.Screen name="index" options={{ title: 'Oração Diária' }} />
            <Tabs.Screen name="calendario" options={{ title: 'Calendário' }} />
            <Tabs.Screen name="personalizada" options={{ title: 'Personalizada' }} />
            <Tabs.Screen name="notificacoes" options={{ title: 'Notificações' }} />
          </Tabs>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}
