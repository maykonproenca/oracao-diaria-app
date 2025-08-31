import { scheduleDailyReminder } from '@/services/notificationService';
import { getUserSettings, saveUserSettings } from '@/utils/db';
import { ResizeMode, Video } from 'expo-av';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import { SplashScreenFallback } from './SplashScreenFallback';

const { width, height } = Dimensions.get('window');

// Configurar handler de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function SplashScreen() {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Verificar se é a primeira vez que o app está sendo aberto
        const settings = await getUserSettings();
        
        // Se não há configurações salvas, é a primeira vez
        if (!settings.notification_enabled && !settings.notification_hour && !settings.notification_minute) {
          // Solicitar permissão de notificações na primeira abertura
          if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            
            if (existingStatus !== 'granted') {
              const { status } = await Notifications.requestPermissionsAsync();
              
              // Se a permissão foi concedida, configurar notificação padrão
              if (status === 'granted') {
                // Salvar configurações padrão
                await saveUserSettings({
                  notification_enabled: 1,
                  notification_hour: 22,
                  notification_minute: 0,
                });
                
                // Agendar notificação padrão (22:00)
                try {
                  const notificationId = await scheduleDailyReminder(22, 0);
                  await saveUserSettings({ notif_schedule_id: notificationId });
                } catch (error) {
                  console.log('Erro ao agendar notificação padrão:', error);
                }
              }
            }
          }
        }
      } catch (error) {
        console.log('Erro ao inicializar permissões:', error);
      }
      
      // Simula um tempo mínimo de carregamento
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsPlaying(true);
      }, 1000); // Aumentei para 1 segundo para dar tempo da solicitação

      return () => clearTimeout(timer);
    };

    initializeApp();
  }, []);

  const handleVideoEnd = () => {
    router.replace('/(tabs)');
  };

  const handleVideoError = () => {
    setHasError(true);
  };

  // Se houver erro, usa o fallback
  if (hasError) {
    return <SplashScreenFallback />;
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : (
        <Video
          ref={videoRef}
          source={require('../assets/videos/ora-mais-splash-screen.mp4')}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isPlaying}
          isLooping={false}
          isMuted={true}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded && status.didJustFinish) {
              handleVideoEnd();
            }
          }}
          onError={handleVideoError}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height,
  },
});
