import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';
import { Typography } from '../../constants/Typography';
import { formatDateForDisplay } from '../../utils/dateUtils';

export default function OracaoDiariaScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Cabeçalho da tela */}
        <View style={styles.header}>
          <Text style={styles.date}>
            {formatDateForDisplay(new Date())}
          </Text>
        </View>

        {/* Área da oração */}
        <View style={styles.prayerCard}>
          <Text style={styles.prayerTitle}>Oração do Dia</Text>
          <Text style={styles.prayerText}>
            "Senhor, neste novo dia que se inicia, venho à Tua presença com um coração 
            grato e cheio de esperança. Reconheço que és o autor da minha vida e que 
            todos os meus caminhos estão em Tuas mãos.{'\n\n'}
            
            Peço que me concedas sabedoria para tomar as decisões certas, força para 
            enfrentar os desafios que surgirem e paz para descansar em Tua vontade. 
            Que eu possa ser uma bênção na vida daqueles que cruzarem meu caminho 
            hoje.{'\n\n'}
            
            Obrigado por Tua fidelidade que se renova a cada manhã. Em nome de Jesus, 
            amém."
          </Text>
        </View>

        {/* Área de status */}
        <View style={styles.statusArea}>
          <Text style={styles.statusText}>✅ Configuração atualizada 2024</Text>
          <Text style={styles.versionText}>Versão MVP 1.0 - Expo Router + TypeScript</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// Estilos do componente usando constantes padronizadas
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.screenPadding,
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  date: {
    ...Typography.styles.dateText,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  prayerCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.xl,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prayerTitle: {
    ...Typography.styles.cardTitle,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  prayerText: {
    ...Typography.styles.prayerText,
    color: Colors.textPrimary,
    textAlign: 'justify',
  },
  statusArea: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.success,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  versionText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
});
