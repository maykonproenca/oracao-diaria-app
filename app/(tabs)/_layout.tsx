// app/(tabs)/_layout.tsx
// Layout principal: inicializa notificações e envolve a UI com ThemeProvider, ToastProvider e ErrorBoundary.

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ThemeProvider, useTheme } from '@/components/ui/Themed';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { initNotificationsOnAppStart } from '@/services/notificationService';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Tabs, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, View } from 'react-native';

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

function HeaderLogo() {
  return (
    <Image
      source={require('../../assets/images/ora-logo.png')}
      style={{
        width: 110,
        height: 250,
        resizeMode: 'contain'
      }}
    />
  );
}

export default function TabsLayout() {
  const [key, setKey] = useState(0);
  const [fontsLoaded] = useFonts({
    'IntroRust': require('../../assets/fonts/IntroRust.otf'),
  });

  useEffect(() => {
    initNotificationsOnAppStart().catch(() => {});
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
                headerTitle: () => <HeaderLogo />,
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="heart" size={size} color={color} />
                ),
              }} 
            />
            <Tabs.Screen 
              name="personalizada" 
              options={{ 
                title: 'Pedidos',
                headerTitle: () => <HeaderLogo />,
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="book" size={size} color={color} />
                ),
              }} 
            />
            <Tabs.Screen 
              name="calendario" 
              options={{ 
                title: 'Calendário',
                headerTitle: () => <HeaderLogo />,
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
