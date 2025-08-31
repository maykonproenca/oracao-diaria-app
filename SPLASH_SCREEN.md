# 🎬 Splash Screen com Vídeo

## 📱 Como Funciona

A splash screen do app agora exibe um vídeo de 3 segundos antes de navegar para o app principal.

### ⚠️ Correções Aplicadas

- **Erro de navegação**: Corrigida estrutura do Stack no `_layout.tsx`
- **expo-av deprecated**: Mantido por enquanto (será migrado no futuro)
- **Fallback implementado**: Se o vídeo falhar, mostra tela simples
- **Estrutura simplificada**: Removido hook desnecessário

### 🔄 Fluxo de Execução

1. **App inicia** → Redireciona para `/splash`
2. **Splash Screen** → Reproduz vídeo de 3 segundos
3. **Vídeo termina** → Navega automaticamente para `/(tabs)`
4. **App principal** → Funciona normalmente

### 🛠️ Arquivos Criados/Modificados

#### Novos Arquivos:
- `components/SplashScreen.tsx` - Componente principal da splash screen
- `components/SplashScreenFallback.tsx` - Fallback em caso de erro
- `app/splash.tsx` - Tela de splash
- `app/_index.tsx` - Redirecionamento inicial

#### Arquivos Modificados:
- `app/_layout.tsx` - Adicionada configuração da tela splash
- `app.json` - Configurações do expo-av e splash

### 🎯 Características

#### ✅ Funcionalidades:
- **Vídeo automático**: Reproduz automaticamente ao abrir
- **Navegação automática**: Vai para o app principal quando termina
- **Tratamento de erro**: Se o vídeo falhar, navega após 3 segundos
- **Loading state**: Mostra indicador de carregamento
- **Tela cheia**: Vídeo ocupa toda a tela
- **Sem som**: Vídeo reproduz sem áudio

#### ⚙️ Configurações:
- **Duração**: 3 segundos (conforme o vídeo)
- **Modo**: COVER (cobre toda a tela)
- **Loop**: Desabilitado
- **Som**: Mudo
- **Fundo**: Preto

### 🎨 Personalização

Para modificar a splash screen:

1. **Trocar vídeo**: Substitua `ora-mais-splash-screen.mp4` em `assets/videos/`
2. **Mudar duração**: O tempo é baseado na duração do vídeo
3. **Adicionar som**: Remova `isMuted={true}` no componente
4. **Mudar fundo**: Altere `backgroundColor` no estilo

### 🐛 Solução de Problemas

#### Se o vídeo não reproduzir:
- Verifique se o arquivo existe em `assets/videos/`
- Confirme se o `expo-av` está instalado
- Teste em um device físico (emuladores podem ter problemas)

#### Se a navegação não funcionar:
- Verifique se a rota `/(tabs)` existe
- Confirme se não há erros no console

### 📱 Teste

Para testar a splash screen:

```bash
# Reinicie o app completamente
npx expo start --clear

# Ou force um reload
# Shake o device → Reload
```

A splash screen deve aparecer por 3 segundos e depois navegar automaticamente para o app principal.
