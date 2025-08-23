import React, { useEffect, useState } from 'react';
import { Text, View, useColorScheme } from 'react-native';
import { getBasicStats, getCurrentStreak } from '../../utils/database';
import { todayKey } from '../../utils/date';

export default function CalendarioScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [streakData, setStreakData] = useState<{
    currentStreak: number;
    longestStreak: number;
    totalCompleted: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      const today = todayKey();
      const [basic, current] = await Promise.all([getBasicStats(), getCurrentStreak(today)]);
      
      setStreakData({
        currentStreak: current,
        longestStreak: basic.longestStreak,
        totalCompleted: basic.totalCompleted,
      });
    } catch (error) {
      console.error('Erro ao carregar dados de streak:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }}>
        <Text style={{ fontSize: 16, color: isDark ? '#bdc3c7' : '#6c757d' }}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa', padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: isDark ? '#3498db' : '#2c3e50', textAlign: 'center', marginBottom: 8 }}>
        📅 Calendário de Orações
      </Text>
      <Text style={{ fontSize: 16, color: isDark ? '#bdc3c7' : '#6c757d', textAlign: 'center', marginBottom: 32 }}>
        Acompanhe sua jornada espiritual
      </Text>
      
      <View style={{ marginBottom: 32 }}>
        <View style={{ 
          backgroundColor: isDark ? '#2d2d2d' : '#ffffff', 
          borderRadius: 12, 
          padding: 20, 
          alignItems: 'center', 
          marginBottom: 24,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 16, color: isDark ? '#bdc3c7' : '#6c757d', marginBottom: 8 }}>Streak Atual</Text>
          <Text style={{ fontSize: 48, fontWeight: 'bold', color: isDark ? '#2ecc71' : '#28a745', marginBottom: 4 }}>
            {streakData?.currentStreak || 0}
          </Text>
          <Text style={{ fontSize: 14, color: isDark ? '#bdc3c7' : '#6c757d' }}>dias consecutivos</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ 
            flex: 1, 
            backgroundColor: isDark ? '#2d2d2d' : '#ffffff', 
            borderRadius: 12, 
            padding: 16, 
            alignItems: 'center', 
            marginRight: 8,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: isDark ? '#3498db' : '#2c3e50', marginBottom: 4 }}>
              {streakData?.longestStreak || 0}
            </Text>
            <Text style={{ fontSize: 12, color: isDark ? '#bdc3c7' : '#6c757d', textAlign: 'center' }}>Maior Streak</Text>
          </View>
          
          <View style={{ 
            flex: 1, 
            backgroundColor: isDark ? '#2d2d2d' : '#ffffff', 
            borderRadius: 12, 
            padding: 16, 
            alignItems: 'center', 
            marginLeft: 8,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: isDark ? '#3498db' : '#2c3e50', marginBottom: 4 }}>
              {streakData?.totalCompleted || 0}
            </Text>
            <Text style={{ fontSize: 12, color: isDark ? '#bdc3c7' : '#6c757d', textAlign: 'center' }}>Total de Dias</Text>
          </View>
        </View>
      </View>

      <View style={{ 
        backgroundColor: isDark ? '#3498db20' : '#3498db20', 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 24, 
        borderLeftWidth: 4, 
        borderLeftColor: isDark ? '#5dade2' : '#3498db' 
      }}>
        <Text style={{ fontSize: 14, color: isDark ? '#ffffff' : '#2c3e50', textAlign: 'center', fontWeight: '500' }}>
          {streakData && streakData.totalCompleted > 0 
            ? `Você já completou ${streakData.totalCompleted} orações!`
            : 'Nenhuma oração registrada ainda'
          }
        </Text>
      </View>
      
      <Text style={{ fontSize: 12, color: isDark ? '#95a5a6' : '#95a5a6', textAlign: 'center', fontStyle: 'italic', marginTop: 24 }}>
        💡 Calendário visual será implementado nos próximos passos
      </Text>
    </View>
  );
}