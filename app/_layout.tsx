import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      {/* Configuração da navegação principal */}
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="notificacoes" 
          options={{ 
            title: 'Notificações',
            headerShown: true,
            headerBackTitle: 'Voltar'
          }} 
        />
        <Stack.Screen 
          name="niveis-streak" 
          options={{ 
            title: 'Níveis de Streak',
            headerShown: true,
            headerBackTitle: 'Voltar'
          }} 
        />
        <Stack.Screen 
          name="+not-found" 
          options={{ title: 'Página não encontrada' }} 
        />
      </Stack>
      
      {/* StatusBar define a cor da barra de status do celular */}
      <StatusBar style="auto" />
    </>
  );
}

// Comentários explicativos:
// - Stack: Sistema de navegação em pilha (uma tela sobre a outra)
// - (tabs): Pasta que contém as abas principais do app
// - headerShown: false: Remove o cabeçalho padrão das telas
// - StatusBar: Controla a aparência da barra superior do celular