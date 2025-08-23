// Cores padronizadas do app Oração Diária
export const Colors = {
  // Tema claro
  light: {
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
    
    // Ícones
    icon: '#2c3e50',
  },
  
  // Tema escuro
  dark: {
    // Cores principais
    primary: '#3498db',       // Azul mais claro para destaque no escuro
    secondary: '#5dade2',     // Azul claro para destaques
    success: '#2ecc71',       // Verde para sucessos/streaks
    warning: '#f39c12',       // Amarelo para avisos
    danger: '#e74c3c',        // Vermelho para erros
    
    // Cores de fundo
    background: '#1a1a1a',    // Fundo principal (escuro)
    cardBackground: '#2d2d2d', // Fundo dos cards (cinza escuro)
    
    // Cores de texto
    textPrimary: '#ffffff',   // Texto principal (branco)
    textSecondary: '#bdc3c7', // Texto secundário (cinza claro)
    textLight: '#95a5a6',     // Texto claro (cinza médio)
    textOnPrimary: '#ffffff', // Texto sobre cor primária
    
    // Cores de borda
    border: '#404040',        // Bordas suaves
    borderLight: '#2d2d2d',   // Bordas muito suaves
    
    // Cores de aba
    tabActive: '#3498db',     // Cor da aba ativa
    tabInactive: '#7f8c8d',   // Cor da aba inativa
    tabBackground: '#1a1a1a', // Fundo da barra de abas
    
    // Sombras (para iOS/Android)
    shadow: '#000000',
    
    // Ícones
    icon: '#ffffff',
  }
} as const;

// Tipo para garantir que só usemos cores válidas
export type ColorKey = keyof typeof Colors.light;