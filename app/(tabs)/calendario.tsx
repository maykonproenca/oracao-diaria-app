import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CalendarioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Calendário de Orações</Text>
      <Text style={styles.subtitle}>Em desenvolvimento</Text>
      <Text style={styles.description}>
        Aqui você poderá ver seu histórico de orações 
        e acompanhar sua sequência (streak) diária.
      </Text>
      
      <View style={styles.streakCard}>
        <Text style={styles.streakTitle}>Streak Atual</Text>
        <Text style={styles.streakNumber}>0</Text>
        <Text style={styles.streakText}>dias consecutivos</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  streakCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakTitle: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 10,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
  },
  streakText: {
    fontSize: 14,
    color: '#6c757d',
  },
});
