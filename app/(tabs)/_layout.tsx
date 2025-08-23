import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Cor da aba ativa
        tabBarActiveTintColor: '#2c3e50',
        // Cor da aba inativa  
        tabBarInactiveTintColor: '#95a5a6',
        // Estilo da barra de abas
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e1e8ed',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        // Estilo do cabeçalho
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Aba 1: Oração Diária */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Oração Diária',
          headerTitle: '🙏 Oração Diária',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      
      {/* Aba 2: Oração Personalizada */}
      <Tabs.Screen
        name="personalizada"
        options={{
          title: 'Personalizada',
          headerTitle: '✨ Oração Personalizada',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create" size={size} color={color} />
          ),
        }}
      />
      
      {/* Aba 3: Calendário */}
      <Tabs.Screen
        name="calendario"
        options={{
          title: 'Calendário',
          headerTitle: '📅 Meu Calendário',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// Comentários explicativos:
// - Tabs: Componente de navegação por abas
// - screenOptions: Configurações globais para todas as abas
// - tabBarActiveTintColor: Cor do ícone/texto quando a aba está selecionada
// - Ionicons: Biblioteca de ícones do Expo
// - name="index": A aba principal (primeira tela)