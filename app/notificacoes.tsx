// app/notificacoes.tsx
// Configuração de notificações com feedback via Toasts e botão de voltar.

import { ThemedText, useTheme } from '@/components/ui/Themed';
import { useToast } from '@/components/ui/ToastProvider';
import { applyNotificationSettings, requestNotificationPermission, sendTestNotification } from '@/services/notificationService';
import { getUserSettings } from '@/utils/db';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Switch, View } from 'react-native';

type UIState = {
  loading: boolean;
  saving: boolean;
  error: string | null;
  enabled: boolean;
  hour: number;
  minute: number;
  permissionKnown: boolean;
  permissionGranted: boolean;
};

export default function NotificacoesScreen() {
  const { colors, radius, spacing } = useTheme();
  const toast = useToast();

  const [state, setState] = useState<UIState>({
    loading: true,
    saving: false,
    error: null,
    enabled: false,
    hour: 8,
    minute: 0,
    permissionKnown: false,
    permissionGranted: false,
  });

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const s = await getUserSettings();
      setState(prev => ({
        ...prev,
        loading: false,
        enabled: s.notification_enabled === 1,
        hour: clampHour(s.notification_hour),
        minute: clampMinute(s.notification_minute),
      }));
      try {
        const granted = await requestNotificationPermission();
        setState(prev => ({ ...prev, permissionKnown: true, permissionGranted: granted }));
      } catch {
        setState(prev => ({ ...prev, permissionKnown: true, permissionGranted: false }));
      }
    } catch (e: any) {
      setState(prev => ({ ...prev, loading: false, error: e?.message ?? 'Erro ao carregar preferências' }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async () => {
    setState(s => ({ ...s, saving: true, error: null }));
    try {
      await applyNotificationSettings({
        notification_enabled: state.enabled ? 1 : 0,
        notification_hour: state.hour,
        notification_minute: state.minute,
      });
      toast.show({ type: 'success', message: 'Preferências salvas.' });
    } catch (e: any) {
      setState(s => ({ ...s, saving: false, error: e?.message ?? 'Falha ao salvar' }));
      toast.show({ type: 'error', message: e?.message ?? 'Falha ao salvar' });
      return;
    }
    setState(s => ({ ...s, saving: false }));
  }, [state.enabled, state.hour, state.minute, toast]);

  const askPermission = useCallback(async () => {
    try {
      const granted = await requestNotificationPermission();
      setState(prev => ({ ...prev, permissionKnown: true, permissionGranted: granted }));
      toast.show({
        type: granted ? 'success' : 'error',
        message: granted ? 'Permissão concedida.' : 'Permissão negada. Ajuste nas configurações do sistema.',
      });
    } catch (e: any) {
      setState(prev => ({ ...prev, error: e?.message ?? 'Erro ao solicitar permissão' }));
      toast.show({ type: 'error', message: e?.message ?? 'Erro ao solicitar permissão' });
    }
  }, [toast]);

  const testNow = useCallback(async () => {
    try {
      await sendTestNotification();
      toast.show({ type: 'success', message: 'Notificação de teste agendada para ~5s.' });
    } catch (e: any) {
      setState(prev => ({ ...prev, error: e?.message ?? 'Erro ao disparar teste' }));
      toast.show({ type: 'error', message: e?.message ?? 'Erro ao disparar teste' });
    }
  }, [toast]);

  if (state.loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing(2) }}>
        <ActivityIndicator />
        <ThemedText tone="muted">Carregando...</ThemedText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header com botão de voltar */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing(4),
        paddingVertical: spacing(3),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
      }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            padding: spacing(2),
            borderRadius: radius.sm,
            backgroundColor: pressed ? colors.border : 'transparent',
          })}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <ThemedText size="h2" weight="800" style={{ marginLeft: spacing(3) }}>
          Notificações
        </ThemedText>
      </View>

      <View style={{ flex: 1, padding: spacing(4), gap: spacing(4) }}>
        {state.error && (
          <View style={{
            backgroundColor: colors.dangerBg, borderColor: colors.border, borderWidth: 1,
            borderRadius: radius.md, padding: spacing(3)
          }}>
            <ThemedText tone="danger">⚠️ {state.error}</ThemedText>
          </View>
        )}

        <View style={{
          backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
          borderRadius: radius.md, padding: spacing(4), gap: spacing(3)
        }}>
          <ThemedText size="h2" weight="800">Permissão do sistema</ThemedText>
          <ThemedText tone="muted">
            Status: {state.permissionKnown ? (state.permissionGranted ? 'Concedida ✅' : 'Negada ❌') : 'Desconhecido'}
          </ThemedText>
          <Row>
            <PrimaryButton title="Solicitar permissão" onPress={askPermission} />
            <SecondaryButton title="Testar agora" onPress={testNow} />
          </Row>
          <ThemedText size="small" tone="muted">
            Dica: Em Android 13+ a permissão é obrigatória. Se negou antes, vá em Ajustes → Apps → Oração Diária → Notificações.
          </ThemedText>
        </View>

        <View style={{
          backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
          borderRadius: radius.md, padding: spacing(4), gap: spacing(3)
        }}>
          <Row>
            <ThemedText size="h2" weight="800">Ativar notificações diárias</ThemedText>
            <Switch value={state.enabled} onValueChange={(v) => setState(s => ({ ...s, enabled: v }))} />
          </Row>

          <ThemedText>Horário do lembrete</ThemedText>
          <Row>
            <TimeStepper
              label="Hora"
              value={state.hour}
              onInc={() => setState(s => ({ ...s, hour: wrapHour(s.hour + 1) }))}
              onDec={() => setState(s => ({ ...s, hour: wrapHour(s.hour - 1) }))}
            />
            <TimeStepper
              label="Min"
              value={state.minute}
              onInc={() => setState(s => ({ ...s, minute: wrapMinute(s.minute + 5) }))}
              onDec={() => setState(s => ({ ...s, minute: wrapMinute(s.minute - 5) }))}
            />
          </Row>

          <PrimaryButton title={state.saving ? 'Salvando...' : 'Salvar'} onPress={state.saving ? undefined : save} />
          <ThemedText size="small" tone="muted">
            Observação: ao salvar, qualquer agendamento antigo é removido e um novo é criado no horário definido.
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>{children}</View>;
}

function PrimaryButton({ title, onPress }: { title: string; onPress?: () => void }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? '#1d4ed8' : colors.primary,
        paddingVertical: spacing(3),
        paddingHorizontal: spacing(4),
        borderRadius: radius.sm,
      })}
    >
      <ThemedText weight="800" style={{ color: colors.primaryText }}>{title}</ThemedText>
    </Pressable>
  );
}

function SecondaryButton({ title, onPress }: { title: string; onPress?: () => void }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? '#e5e7eb' : colors.surface,
        paddingVertical: spacing(3),
        paddingHorizontal: spacing(4),
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
      })}
    >
      <ThemedText weight="800">{title}</ThemedText>
    </Pressable>
  );
}

function TimeStepper({ label, value, onInc, onDec }: { label: string; value: number; onInc: () => void; onDec: () => void; }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View style={{ flex: 1, gap: spacing(2) }}>
      <ThemedText size="small" tone="muted">{label}</ThemedText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(2), justifyContent: 'space-between' }}>
        <SecondaryButton title="−" onPress={onDec} />
        <ThemedText size="h2" weight="800" style={{ minWidth: 44, textAlign: 'center' }}>
          {String(value).padStart(2, '0')}
        </ThemedText>
        <SecondaryButton title="＋" onPress={onInc} />
      </View>
    </View>
  );
}

function clampHour(h: number) { return Math.min(23, Math.max(0, Math.floor(h))); }
function clampMinute(m: number) { return Math.min(59, Math.max(0, Math.floor(m))); }
function wrapHour(h: number) { return (h + 24) % 24; }
function wrapMinute(m: number) {
  let v = m;
  if (v < 0) v = 60 + (v % 60);
  return Math.floor(v % 60);
}
