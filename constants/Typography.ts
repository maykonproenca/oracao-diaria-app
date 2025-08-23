// Tipografia padronizada do app Oração Diária
export const Typography = {
    // Tamanhos de fonte
    fontSize: {
      xs: 12,   // Extra pequeno (legendas, versões)
      sm: 14,   // Pequeno (textos secundários)
      md: 16,   // Médio (texto padrão)
      lg: 18,   // Grande (subtítulos)
      xl: 20,   // Extra grande (títulos pequenos)
      xxl: 24,  // Extra extra grande (títulos médios)
      xxxl: 28, // Título principal
      display: 32, // Títulos de destaque
      hero: 48,    // Números grandes (streaks)
    },
    
    // Pesos de fonte
    fontWeight: {
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    
    // Altura de linha (line-height)
    lineHeight: {
      tight: 18,   // Texto compacto
      normal: 20,  // Texto padrão
      relaxed: 24, // Texto mais espaçado
      loose: 28,   // Texto bem espaçado
    },
    
    // Estilos de texto específicos
    styles: {
      // Título principal das telas
      screenTitle: {
        fontSize: 28,
        fontWeight: '700' as const,
        lineHeight: 32,
      },
      
      // Título de cards
      cardTitle: {
        fontSize: 24,
        fontWeight: '700' as const,
        lineHeight: 28,
      },
      
      // Texto de oração
      prayerText: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
      },
      
      // Texto de data
      dateText: {
        fontSize: 16,
        fontWeight: '500' as const,
        lineHeight: 20,
      },
      
      // Números de streak
      streakNumber: {
        fontSize: 48,
        fontWeight: '700' as const,
        lineHeight: 52,
      },
    },
  } as const;
  
  // Tipos para garantir consistência
  export type FontSizeKey = keyof typeof Typography.fontSize;
  export type FontWeightKey = keyof typeof Typography.fontWeight;