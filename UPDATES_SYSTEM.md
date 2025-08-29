# 🔄 Sistema de Atualizações Inteligente - App Oração Diária

## 📋 Visão Geral

O app agora possui um sistema de atualizações inteligente que verifica e atualiza automaticamente as orações sem afetar os dados pessoais do usuário (streaks, configurações, histórico).

## 🏗️ Arquitetura

### **Separação de Dados**

O banco de dados foi estruturado para separar claramente:

#### **Dados do App (Atualizáveis)**
- `prayers` - Orações diárias
- `prayers_version` - Controle de versão

#### **Dados do Usuário (Preservados)**
- `daily_prayer_status` - Streaks e progresso
- `user_settings` - Configurações pessoais
- `custom_prayers_history` - Histórico de orações personalizadas

### **Sistema de Versionamento**

```typescript
// Controle de versão
type PrayersVersion = {
  version: number;        // Versão atual das orações
  last_updated: string;   // Data da última atualização
  prayers_count: number;  // Quantidade total de orações
};
```

## 🔄 Como Funciona

### **1. Verificação Automática**

Toda vez que o app é aberto:

```typescript
// hooks/useTodayPrayer.ts
const load = useCallback(async () => {
  // 1. Verificar e atualizar orações se necessário
  await checkAndUpdatePrayers();
  
  // 2. Carregar dados do usuário (preservados)
  const [today, stats] = await Promise.all([
    getOrCreateTodayPrayer(), 
    getStats()
  ]);
}, []);
```

### **2. Detecção de Mudanças**

Cada oração possui um **checksum** que detecta mudanças:

```typescript
// Gera hash baseado no conteúdo
function generatePrayerChecksum(prayer: Prayer): string {
  const data = `${prayer.title}|${prayer.content}|${prayer.release_date}`;
  // Hash simples para detectar mudanças
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
```

### **3. Atualização Seletiva**

O sistema só atualiza o que realmente mudou:

```typescript
// Para cada oração
for (const prayer of UPDATED_PRAYERS) {
  const existingPrayer = await getPrayerByReleaseDate(prayer.release_date);
  
  if (existingPrayer) {
    // Verifica se precisa atualizar
    const needsUpdate = await needsPrayerUpdate(prayer, existingPrayer.id);
    if (needsUpdate) {
      await updatePrayer(existingPrayer.id, prayer);
      updatedCount++;
    }
  } else {
    // Insere nova oração
    await insertPrayer(prayer);
    newCount++;
  }
}
```

## 📱 Interface do Usuário

### **Atualização Automática**
- ✅ **Silenciosa**: Ocorre automaticamente ao abrir o app
- ✅ **Rápida**: Apenas verifica se há mudanças
- ✅ **Segura**: Não afeta dados pessoais

### **Atualização Manual**
- 🔄 **Botão de refresh**: Na tela principal
- 📊 **Feedback visual**: Loading e mensagens de sucesso
- ⚡ **Forçada**: Ignora cache e verifica tudo

## 🛠️ Como Adicionar Novas Orações

### **1. Atualizar o Código**

```typescript
// services/prayerUpdateService.ts
const CURRENT_PRAYERS_VERSION = 3; // Incrementar versão

const UPDATED_PRAYERS = [
  // ... orações existentes ...
  {
    title: 'Oração 31 - 31/10/2025',
    content: 'Nova oração...',
    release_date: '2025-10-31'
  }
];
```

### **2. Deploy da Atualização**

```bash
# 1. Fazer commit das mudanças
git add .
git commit -m "Adiciona novas orações - v3"

# 2. Deploy para usuários
eas build --platform all
```

### **3. Atualização Automática**

Quando o usuário abrir o app:
- ✅ Sistema detecta nova versão
- ✅ Adiciona apenas as orações novas
- ✅ Preserva todos os dados pessoais
- ✅ Mostra feedback se necessário

## 🔒 Segurança e Confiabilidade

### **Proteções Implementadas**
- ✅ **Rollback automático**: Se falhar, mantém versão anterior
- ✅ **Validação de dados**: Verifica integridade antes de aplicar
- ✅ **Logs detalhados**: Para debug e monitoramento
- ✅ **Fallback**: Sistema antigo como backup

### **Preservação de Dados**
- ✅ **Streaks**: Nunca são perdidos
- ✅ **Configurações**: Mantidas intactas
- ✅ **Histórico**: Preservado completamente
- ✅ **Progresso**: Continuidade garantida

## 📊 Monitoramento

### **Logs do Sistema**
```typescript
console.log('🔄 Verificando atualizações de orações...');
console.log(`📊 Versão atual: ${currentVersion.version}, Nova versão: ${CURRENT_PRAYERS_VERSION}`);
console.log(`🔄 Atualizada: ${prayer.title}`);
console.log(`➕ Nova: ${prayer.title}`);
console.log(`✅ Atualização concluída: ${updatedCount} atualizadas, ${newCount} novas`);
```

### **Métricas Disponíveis**
- **Versão atual**: Controle de versão
- **Orações atualizadas**: Quantidade de mudanças
- **Novas orações**: Quantidade de adições
- **Tempo de atualização**: Performance

## 🎯 Benefícios

### **Para o Desenvolvedor**
- ✅ **Deploy simples**: Apenas atualizar código
- ✅ **Controle total**: Versionamento explícito
- ✅ **Debug fácil**: Logs detalhados
- ✅ **Rollback seguro**: Sistema de fallback

### **Para o Usuário**
- ✅ **Atualizações automáticas**: Sem intervenção
- ✅ **Dados preservados**: Streaks mantidos
- ✅ **Performance**: Apenas mudanças necessárias
- ✅ **Transparência**: Feedback quando relevante

## 🚀 Próximos Passos

### **Melhorias Possíveis**
1. **Cache inteligente**: Reduzir verificações desnecessárias
2. **Atualizações em background**: Processar quando app fechado
3. **Notificações**: Avisar sobre novas orações
4. **Analytics**: Métricas de uso das atualizações

### **Otimizações**
1. **Compressão**: Reduzir tamanho das atualizações
2. **Diferencial**: Apenas diferenças entre versões
3. **Lazy loading**: Carregar orações sob demanda
4. **Prefetch**: Antecipar próximas orações

## 📞 Suporte

### **Problemas Comuns**
1. **Atualização não aplicada**: Verificar logs e versão
2. **Dados perdidos**: Sistema preserva dados pessoais
3. **Performance lenta**: Atualizações são rápidas
4. **Erro de checksum**: Recalcular e verificar

### **Debug**
```bash
# Verificar versão atual
console.log(await getPrayersVersion());

# Forçar verificação
await forceUpdateCheck();

# Verificar orações
console.log(await getPrayersCount());
```

---

**Sistema implementado com foco em simplicidade, confiabilidade e preservação dos dados do usuário.**
