// services/notificationService.ts
// Orquestra permissões, canal Android, agendamento/cancelamento e teste.

import { getUserSettings, saveUserSettings, UserSettings } from '@/utils/db';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Mostra notificação também quando o app está em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,      // exibe banner/alerta
    shouldPlaySound: true,      // toca som (se habilitado)
    shouldSetBadge: false,
    shouldShowBanner: true,     // exibe banner
    shouldShowList: true,       // mostra na lista de notificações
  }),
});

const ANDROID_CHANNEL_ID = 'daily-reminders';

// Configura o canal Android (obrigatório para Android 8+)
async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Lembretes Diários',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [200, 100, 200],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

// Pede permissão (Android 13+ / iOS)
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return true; // emuladores podem falhar; não bloqueia fluxo
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Agenda um lembrete diário no horário escolhido
export async function scheduleDailyReminder(hour: number, minute: number): Promise<string | null> {
  // Garante canal no Android
  await ensureAndroidChannel();

  // Segurança: evita múltiplas agendas duplicadas
  await Notifications.cancelAllScheduledNotificationsAsync();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hora de orar 🙏',
      body: 'Reserve um momento para a Oração do Dia.',
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      repeats: true, // repete todos os dias neste horário
      channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
    },
  });

  return id;
}

// Cancela qualquer agendamento (do app)
export async function cancelAllDailyReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Notificação de teste em 5s
export async function sendTestNotification() {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Teste de notificação',
      body: 'Se você está vendo isto, está tudo certo! 🎉',
      sound: 'default',
    },
    trigger: { 
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5 
    },
  });
}

// Inicializa sistema no início do app (respeitando user_settings)
export async function initNotificationsOnAppStart() {
  try {
    const settings = await getUserSettings();
    if (settings.notification_enabled === 1) {
      const granted = await requestNotificationPermission();
      if (granted) {
        const id = await scheduleDailyReminder(settings.notification_hour, settings.notification_minute);
        await saveUserSettings({ notif_schedule_id: id ?? null });
      }
      // Se não conceder, mantemos enabled=1, mas nada será disparado até o usuário aceitar.
    }
  } catch (error) {
    console.error('Erro ao inicializar notificações:', error);
    // Não re-throw para não quebrar o app
  }
}

// Salva preferências + agenda/cancela conforme necessário
export async function applyNotificationSettings(next: Partial<UserSettings>) {
  const current = await getUserSettings();
  const merged: UserSettings = { ...current, ...next };

  if (merged.notification_enabled === 1) {
    const granted = await requestNotificationPermission();
    if (!granted) {
      // Salva preferências mesmo assim, mas sem agendar
      await saveUserSettings({ ...merged, notif_schedule_id: null });
      throw new Error('Permissão de notificação não concedida.');
    }
    const id = await scheduleDailyReminder(merged.notification_hour, merged.notification_minute);
    await saveUserSettings({ ...merged, notif_schedule_id: id ?? null });
  } else {
    await cancelAllDailyReminders();
    await saveUserSettings({ ...merged, notif_schedule_id: null });
  }
}
