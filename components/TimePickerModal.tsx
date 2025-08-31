import { useTheme } from '@/components/ui/Themed';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onTimeSelected: (time: string) => void;
  initialTime?: string;
}

export default function TimePickerModal({
  visible,
  onClose,
  onTimeSelected,
  initialTime = '08:00',
}: TimePickerModalProps) {
  const { colors, spacing, radius, text } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedHour, setSelectedHour] = useState(parseInt(initialTime.split(':')[0]));
  const [selectedMinute, setSelectedMinute] = useState(parseInt(initialTime.split(':')[1]));

  // Ajustar minutos para o incremento de 5 em 5 mais próximo
  const adjustMinuteToIncrement = (minute: number) => {
    return Math.round(minute / 5) * 5;
  };

  // Inicializar com minutos ajustados
  React.useEffect(() => {
    setSelectedMinute(adjustMinuteToIncrement(selectedMinute));
  }, [initialTime]);

  const incrementHour = () => {
    setSelectedHour((prev) => (prev + 1) % 24);
  };

  const decrementHour = () => {
    setSelectedHour((prev) => (prev - 1 + 24) % 24);
  };

  const incrementMinute = () => {
    setSelectedMinute((prev) => {
      const next = prev + 5;
      return next >= 60 ? 0 : next;
    });
  };

  const decrementMinute = () => {
    setSelectedMinute((prev) => {
      const next = prev - 5;
      return next < 0 ? 55 : next;
    });
  };

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const handleConfirm = () => {
    const time = `${formatNumber(selectedHour)}:${formatNumber(selectedMinute)}`;
    onTimeSelected(time);
    onClose();
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingBottom: insets.bottom,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(3),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: text.h2,
      color: colors.text,
      fontWeight: '600',
    },
    cancelButton: {
      padding: spacing(2),
    },
    confirmButton: {
      padding: spacing(2),
    },
    confirmText: {
      fontSize: text.body,
      color: colors.primary,
      fontWeight: '600',
    },
    pickerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing(6),
    },
    timeSection: {
      alignItems: 'center',
      marginHorizontal: spacing(4),
    },
    timeValue: {
      fontSize: 48,
      color: colors.text,
      fontWeight: '600',
      marginVertical: spacing(2),
    },
    timeLabel: {
      fontSize: text.small,
      color: colors.textMuted,
      marginBottom: spacing(1),
    },
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing(2),
    },
    incrementButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    decrementButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 20,
      color: colors.background,
      fontWeight: '600',
    },
    decrementButtonText: {
      fontSize: 20,
      color: colors.text,
      fontWeight: '600',
    },
    separator: {
      fontSize: 48,
      color: colors.text,
      fontWeight: '600',
      marginHorizontal: spacing(4),
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.confirmText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Selecionar Horário</Text>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          {/* Time Picker */}
          <View style={styles.pickerContainer}>
            {/* Hours */}
            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>Hora</Text>
              <Text style={styles.timeValue}>{formatNumber(selectedHour)}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.decrementButton} onPress={decrementHour}>
                  <Text style={styles.decrementButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.incrementButton} onPress={incrementHour}>
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.separator}>:</Text>

            {/* Minutes */}
            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>Minuto</Text>
              <Text style={styles.timeValue}>{formatNumber(selectedMinute)}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.decrementButton} onPress={decrementMinute}>
                  <Text style={styles.decrementButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.incrementButton} onPress={incrementMinute}>
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
