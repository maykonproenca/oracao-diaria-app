// Cores padronizadas do app Oração Diária
export const Colors = {
  // Cores principais
  primary: '#2c3e50',      // Azul escuro para cabeçalhos
  secondary: '#3498db',     // Azul claro para destaques
  success: '#28a745',       // Verde para sucessos/streaks
  warning: '#ffc107',       // Amarelo para avisos
  danger: '#dc3545',        // Vermelho para erros
  
  // Cores de fundo
  background: '#f8f9fa',    // Fundo principal (cinza muito claro)
  cardBackground: '#ffffff', // Fundo dos cards
  
  // Cores de texto
  textPrimary: '#2c3e50',   // Texto principal (escuro)
  textSecondary: '#6c757d', // Texto secundário (cinza médio)
  textLight: '#95a5a6',     // Texto claro (cinza claro)
  textOnPrimary: '#ffffff', // Texto sobre cor primária
  
  // Cores de borda
  border: '#e1e8ed',        // Bordas suaves
  borderLight: '#f1f3f4',   // Bordas muito suaves
  
  // Cores de aba
  tabActive: '#2c3e50',     // Cor da aba ativa
  tabInactive: '#95a5a6',   // Cor da aba inativa
  tabBackground: '#ffffff', // Fundo da barra de abas
  
  // Sombras (para iOS/Android)
  shadow: '#000000',
} as const;

// Tipo para garantir que só usemos cores válidas
export type ColorKey = keyof typeof Colors;