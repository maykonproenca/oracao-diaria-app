# 🤖 Integração com IA - App Oração Diária

## 📋 Visão Geral

O app agora possui integração com IA (Claude) para gerar orações personalizadas baseadas no que o usuário deseja orar.

## 🏗️ Arquitetura

### **Frontend (React Native)**
```
services/aiService.ts     # Serviço que chama o proxy
hooks/useAIService.ts     # Hook para gerenciar estado
app/(tabs)/personalizada.tsx  # Interface do usuário
```

### **Backend (Cloudflare Workers)**
```
server/cloudflare/        # Worker que faz proxy para Claude
https://oracao-diaria-claude-proxy.oracoes-diarias.workers.dev
```

## 🔧 Configuração

### **1. Variáveis de Ambiente**
```json
// app.json
{
  "extra": {
    "EXPO_PUBLIC_CLAUDE_PROXY_URL": "https://oracao-diaria-claude-proxy.oracoes-diarias.workers.dev"
  }
}
```

### **2. Secrets do Worker**
```bash
# API Key do Anthropic (Claude)
npx wrangler secret put ANTHROPIC_API_KEY
```

## 🚀 Como Funciona

### **Fluxo de Geração de Oração:**

1. **Usuário** descreve o que quer orar na tela "Personalizada"
2. **App** envia prompt para o Cloudflare Worker
3. **Worker** faz proxy para a API do Claude
4. **Claude** gera oração personalizada
5. **Worker** retorna resultado para o app
6. **App** exibe oração gerada

### **Exemplo de Uso:**
```typescript
// Usuário digita: "Estou passando por um momento difícil no trabalho"
// Claude gera uma oração personalizada sobre essa situação
```

## 📱 Interface do Usuário

### **Tela Personalizada:**
- **Campo de texto**: Usuário descreve sua situação
- **Botão "Gerar Oração"**: Inicia o processo
- **Loading**: Indicador durante geração
- **Resultado**: Oração personalizada exibida
- **Botão "Nova"**: Limpa e permite nova geração

### **Funcionalidades:**
- ✅ **Timeout**: 30 segundos máximo
- ✅ **Cancelamento**: Usuário pode cancelar
- ✅ **Tratamento de erros**: Mensagens amigáveis
- ✅ **Validação**: Campo obrigatório
- ✅ **Dicas**: Guia para melhores prompts

## 🔒 Segurança

### **Proteções Implementadas:**
- **API Key**: Armazenada apenas no Worker (não no app)
- **URL pública**: Apenas endpoint público no app
- **Timeout**: Evita requisições infinitas
- **Validação**: Input sanitizado
- **Rate limiting**: Implementado no Worker

### **Dados:**
- **Não armazenados**: Prompts e orações geradas
- **Não rastreados**: Uso individual
- **Privacidade**: Dados não saem do dispositivo

## 🛠️ Desenvolvimento

### **Teste Local:**
```bash
# 1. Iniciar app
npx expo start

# 2. Testar na tela "Personalizada"
# 3. Verificar logs no Worker
npx wrangler tail
```

### **Debug:**
```bash
# Logs do Worker
npx wrangler tail --format pretty

# Status do Worker
npx wrangler status
```

## 📊 Monitoramento

### **Métricas Disponíveis:**
- **Requisições**: Quantidade de orações geradas
- **Tempo de resposta**: Performance do Worker
- **Erros**: Falhas na geração
- **Uso**: Consumo da API Claude

### **Logs:**
- **Worker**: Cloudflare Dashboard
- **App**: Expo DevTools
- **Erros**: Tratados e exibidos ao usuário

## 🔄 Atualizações

### **Worker:**
```bash
cd server/cloudflare
npx wrangler deploy
```

### **App:**
```bash
# Rebuild necessário apenas se mudar URL
npx expo start --clear
```

## 🎯 Próximos Passos

### **Melhorias Possíveis:**
1. **Histórico**: Salvar orações geradas localmente
2. **Favoritos**: Marcar orações preferidas
3. **Compartilhamento**: Compartilhar orações
4. **Templates**: Sugestões de prompts
5. **Voz**: Gerar orações por comando de voz

### **Otimizações:**
1. **Cache**: Cachear respostas similares
2. **Streaming**: Resposta em tempo real
3. **Fallback**: Oração offline se API falhar
4. **Compressão**: Reduzir tamanho das requisições

## 📞 Suporte

### **Problemas Comuns:**
1. **Timeout**: Verificar conexão de internet
2. **Erro 429**: Rate limit atingido
3. **Erro 500**: Problema no Worker
4. **Campo vazio**: Validar input do usuário

### **Contato:**
- **Issues**: GitHub do projeto
- **Logs**: Cloudflare Dashboard
- **Debug**: Expo DevTools

---

**Nota**: Esta integração respeita a privacidade do usuário e não armazena dados pessoais.
