import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function OracaoDiariaScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Cabeçalho da tela */}
        <View style={styles.header}>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
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

// Estilos do componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    color: '#6c757d',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  prayerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prayerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  prayerText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
    textAlign: 'justify',
  },
  statusArea: {
    alignItems: 'center',
    marginTop: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  versionText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});
