// app/notificacoes.tsx
// Configuração de notificações com feedback via Toasts e botão de voltar.

import { ThemedText, useTheme } from '@/components/ui/Themed';
import { useToast } from '@/components/ui/ToastProvider';
import { applyNotificationSettings, requestNotificationPermission } from '@/services/notificationService';
import { getUserSettings } from '@/utils/db';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Switch, TouchableOpacity, View } from 'react-native';

type UIState = {
  loading: boolean;
  saving: boolean;
  error: string | null;
  enabled: boolean;
  permissionKnown: boolean;
  permissionGranted: boolean;
};

type TimeSchedule = {
  id: string;
  hour: number;
  minute: number;
};

export default function NotificacoesScreen() {
  const { colors, radius, spacing } = useTheme();
  const toast = useToast();

  const [state, setState] = useState<UIState>({
    loading: true,
    saving: false,
    error: null,
    enabled: false,
    permissionKnown: false,
    permissionGranted: false,
  });

  const [timeSchedules, setTimeSchedules] = useState<TimeSchedule[]>([
    { id: '1', hour: 22, minute: 0 }
  ]);

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const s = await getUserSettings();
      setState(prev => ({
        ...prev,
        loading: false,
        enabled: s.notification_enabled === 1,
      }));
      
      // Carregar horários salvos ou usar padrão
      if (s.notification_schedules && Array.isArray(s.notification_schedules) && s.notification_schedules.length > 0) {
        // Validar e corrigir os dados carregados
        const validSchedules = s.notification_schedules.map(schedule => ({
          id: schedule.id || Date.now().toString(),
          hour: typeof schedule.hour === 'number' && !isNaN(schedule.hour) ? schedule.hour : 22,
          minute: typeof schedule.minute === 'number' && !isNaN(schedule.minute) ? schedule.minute : 0,
        }));
        setTimeSchedules(validSchedules);
      } else {
        setTimeSchedules([{ id: '1', hour: 22, minute: 0 }]);
      }
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
      // Salvar apenas o primeiro horário por enquanto (compatibilidade)
      const firstSchedule = timeSchedules[0] || { hour: 22, minute: 0 };
      await applyNotificationSettings({
        notification_enabled: state.enabled ? 1 : 0,
        notification_hour: firstSchedule.hour,
        notification_minute: firstSchedule.minute,
        notification_schedules: timeSchedules,
      });
      toast.show({ type: 'success', message: 'Preferências salvas.' });
    } catch (e: any) {
      setState(s => ({ ...s, saving: false, error: e?.message ?? 'Falha ao salvar' }));
      toast.show({ type: 'error', message: e?.message ?? 'Falha ao salvar' });
      return;
    }
    setState(s => ({ ...s, saving: false }));
  }, [state.enabled, timeSchedules, toast]);

  const handleToggleNotifications = useCallback(async (value: boolean) => {
    // Se está tentando ativar e não tem permissão, solicitar primeiro
    if (value && !state.permissionGranted) {
      try {
        const granted = await requestNotificationPermission();
        setState(prev => ({ 
          ...prev, 
          permissionKnown: true, 
          permissionGranted: granted,
          enabled: granted // Só ativa se a permissão foi concedida
        }));
        
        if (granted) {
          toast.show({ type: 'success', message: 'Permissão concedida! Notificações ativadas.' });
        } else {
          toast.show({ type: 'error', message: 'Permissão negada. As notificações permanecerão desativadas.' });
          return; // Não ativa o switch se a permissão foi negada
        }
      } catch (e: any) {
        toast.show({ type: 'error', message: 'Erro ao solicitar permissão. Tente novamente.' });
        return; // Não ativa o switch se houve erro
      }
    } else {
      // Se está desativando ou já tem permissão, apenas atualiza o estado
      setState(s => ({ ...s, enabled: value }));
    }
  }, [state.permissionGranted, toast]);



  if (state.loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing(2), backgroundColor: colors.background }}>
        <ActivityIndicator />
        <ThemedText tone="muted">Carregando...</ThemedText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing(4), gap: spacing(4) }}>
        {state.error && (
          <View style={{
            backgroundColor: colors.dangerBg, borderColor: colors.border, borderWidth: 1,
            borderRadius: radius.md, padding: spacing(3)
          }}>
            <ThemedText tone="danger">⚠️ {state.error}</ThemedText>
          </View>
        )}

        <ThemedText size="body" style={{ textAlign: 'center', marginBottom: spacing(2), fontStyle: 'italic' }}>
          Nós te ajudamos a não esquecer sua oração diária!
        </ThemedText>

        {/* Box 1: Ativar Notificações */}
        <View style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          padding: spacing(4),
          gap: spacing(3),
        }}>
          <Row>
            <ThemedText size="h2" weight="800">Ativar notificações!</ThemedText>
            <Switch value={state.enabled} onValueChange={handleToggleNotifications} />
          </Row>

          {!state.permissionGranted && state.permissionKnown && (
            <ThemedText size="small" tone="danger">
              ⚠️ Permissão negada. Toque no switch para solicitar novamente.
            </ThemedText>
          )}
        </View>

        {/* Box 2: Configurar Horário */}
        <View style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          padding: spacing(4),
          gap: spacing(3),
        }}>
          <ThemedText size="h2" weight="800">Horário do lembrete</ThemedText>
          {timeSchedules.map((schedule, index) => (
            <View key={schedule.id} style={{ position: 'relative' }}>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: -spacing(2),
                  right: -spacing(2),
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: colors.dangerBg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1,
                }}
                onPress={() => {
                  if (timeSchedules.length > 1) {
                    setTimeSchedules(prev => prev.filter(s => s.id !== schedule.id));
                  }
                }}
              >
                <ThemedText size="small" tone="danger" style={{ fontSize: 12 }}>×</ThemedText>
              </TouchableOpacity>
              
              <Row>
                <TimeStepper
                  label="Hora"
                  value={schedule.hour}
                  onInc={() => setTimeSchedules(prev => 
                    prev.map(s => s.id === schedule.id ? { ...s, hour: wrapHour(s.hour + 1) } : s)
                  )}
                  onDec={() => setTimeSchedules(prev => 
                    prev.map(s => s.id === schedule.id ? { ...s, hour: wrapHour(s.hour - 1) } : s)
                  )}
                />
                <TimeStepper
                  label="Min"
                  value={schedule.minute}
                  onInc={() => setTimeSchedules(prev => 
                    prev.map(s => s.id === schedule.id ? { ...s, minute: wrapMinute(s.minute + 5) } : s)
                  )}
                  onDec={() => setTimeSchedules(prev => 
                    prev.map(s => s.id === schedule.id ? { ...s, minute: wrapMinute(s.minute - 5) } : s)
                  )}
                />
              </Row>
            </View>
          ))}

          <PrimaryButton title={state.saving ? 'Salvando...' : 'Salvar'} onPress={state.saving ? undefined : save} />
        </View>

        {/* Botão de adicionar horário */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: spacing(6),
            alignSelf: 'center',
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
          onPress={() => {
            const newId = Date.now().toString();
            setTimeSchedules(prev => [...prev, { id: newId, hour: 8, minute: 0 }]);
          }}
        >
          <ThemedText size="h2" weight="800" style={{ color: colors.primaryText }}>+</ThemedText>
        </TouchableOpacity>
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
      <ThemedText weight="800" style={{ color: colors.primaryText, textAlign: 'center' }}>{title}</ThemedText>
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
      <ThemedText weight="800" style={{ textAlign: 'center' }}>{title}</ThemedText>
    </Pressable>
  );
}

function TimeStepper({ label, value, onInc, onDec }: { label: string; value: number; onInc: () => void; onDec: () => void; }) {
  const { radius, spacing } = useTheme();
  
  // Garantir que o valor seja sempre um número válido
  const validValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  
  return (
    <View style={{ flex: 1, gap: spacing(2) }}>
      <ThemedText size="small" tone="muted">{label}</ThemedText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(2), justifyContent: 'space-between' }}>
        <SecondaryButton title="−" onPress={onDec} />
        <ThemedText size="h2" weight="800" style={{ minWidth: 44, textAlign: 'center' }}>
          {String(validValue).padStart(2, '0')}
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