// Espaçamentos padronizados do app Oração Diária
export const Spacing = {
    // Espaçamentos básicos (múltiplos de 4)
    xs: 4,    // Extra pequeno
    sm: 8,    // Pequeno
    md: 12,   // Médio pequeno
    lg: 16,   // Médio
    xl: 20,   // Grande
    xxl: 24,  // Extra grande
    xxxl: 32, // Extra extra grande
    
    // Espaçamentos específicos
    screenPadding: 20,     // Padding padrão das telas
    cardPadding: 20,       // Padding interno dos cards
    cardMargin: 12,        // Margem entre cards
    sectionSpacing: 24,    // Espaço entre seções
    
    // Bordas
    borderRadius: 12,      // Raio de borda padrão
    borderRadiusSm: 8,     // Raio pequeno
    borderRadiusLg: 16,    // Raio grande
    
    // Tamanhos específicos
    tabBarHeight: 60,      // Altura da barra de abas
    headerHeight: 44,      // Altura do cabeçalho
    buttonHeight: 48,      // Altura padrão de botões
  } as const;
  
  // Tipo para garantir que só usemos espaçamentos válidos
  export type SpacingKey = keyof typeof Spacing;