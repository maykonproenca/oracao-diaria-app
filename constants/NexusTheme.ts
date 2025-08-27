// constants/NexusTheme.ts
// Design System Nexus para o App de Oração Diária

export const NexusColors = {
    // Cores principais (como uma caixa de giz de cera)
    primary: {
      50: '#F0FDFA',   // Verde bem clarinho
      100: '#CCFBF1',  // Verde claro
      200: '#99F6E4',  // Verde médio claro
      300: '#5EEAD4',  // Verde médio
      400: '#2DD4BF',  // Verde legal
      500: '#00C896',  // Verde principal (a cor mais importante!)
      600: '#00A67C',  // Verde escuro
      700: '#008B6B',  // Verde mais escuro
      800: '#006B52',  // Verde bem escuro
      900: '#004D3A',  // Verde super escuro
    },
    
    // Cores cinzas (como tons de lápis)
    neutral: {
      50: '#FAFAFA',   // Quase branco
      100: '#F5F5F5',  // Branco sujo
      200: '#E5E5E5',  // Cinza clarinho
      300: '#D4D4D4',  // Cinza claro
      400: '#A3A3A3',  // Cinza médio
      500: '#737373',  // Cinza normal
      600: '#525252',  // Cinza escuro
      700: '#404040',  // Cinza bem escuro
      800: '#262626',  // Quase preto
      900: '#171717',  // Pretinho
    },
  
    // Cores especiais
    success: '#10B981', // Verde de sucesso
    warning: '#F59E0B', // Amarelo de aviso
    error: '#EF4444',   // Vermelho de erro
    info: '#3B82F6',    // Azul de informação
  };
  
  // Tamanhos de texto (como régua de medida)
  export const NexusTypography = {
    sizes: {
      display: 32,      // Para títulos GIGANTES
      h1: 28,          // Para títulos grandes
      h2: 24,          // Para títulos médios
      h3: 20,          // Para títulos pequenos
      subtitle: 16,     // Para subtítulos
      body: 14,        // Para texto normal (orações)
      caption: 12,     // Para textos pequenininhos
      overline: 10,    // Para textos micro
    },
    
    weights: {
      light: '300',     // Texto fininho
      regular: '400',   // Texto normal
      medium: '500',    // Texto médio
      semibold: '600',  // Texto meio grosso
      bold: '700',      // Texto grosso
      extrabold: '800', // Texto super grosso
    },
    
    lineHeights: {
      tight: 1.2,       // Linhas juntinhas
      normal: 1.4,      // Linhas normais
      relaxed: 1.6,     // Linhas com espaço
      loose: 1.8,       // Linhas bem espaçadas
    },
  };
  
  // Espaçamentos (como blocos de Lego)
  export const NexusSpacing = {
    xs: 4,    // Espaço micro
    sm: 8,    // Espaço pequeno
    md: 16,   // Espaço médio
    lg: 24,   // Espaço grande
    xl: 32,   // Espaço muito grande
    xxl: 48,  // Espaço gigante
    xxxl: 64, // Espaço mega gigante
    
    // Espaços especiais para o app
    cardPadding: 20,      // Espaço dentro dos cards
    screenPadding: 16,    // Espaço das telas
    buttonHeight: 48,     // Altura dos botões
    inputHeight: 44,      // Altura dos campos de texto
    tabBarHeight: 80,     // Altura da barra de baixo
  };
  
  // Como fazer tema claro/escuro (como interruptor de luz)
  export const createNexusTheme = (isDark: boolean) => ({
    colors: {
      primary: NexusColors.primary[500],         // Cor principal
      primaryLight: NexusColors.primary[400],    // Cor principal clara
      primaryDark: NexusColors.primary[600],     // Cor principal escura
      
      // Se estiver escuro, usa cores escuras. Se não, usa cores claras
      background: isDark ? NexusColors.neutral[900] : NexusColors.neutral[50],
      surface: isDark ? NexusColors.neutral[800] : NexusColors.neutral[50],
      card: isDark ? NexusColors.neutral[800] : NexusColors.neutral[50],
      
      text: isDark ? NexusColors.neutral[100] : NexusColors.neutral[900],
      textSecondary: isDark ? NexusColors.neutral[300] : NexusColors.neutral[600],
      textMuted: isDark ? NexusColors.neutral[400] : NexusColors.neutral[500],
      
      border: isDark ? NexusColors.neutral[700] : NexusColors.neutral[200],
      borderLight: isDark ? NexusColors.neutral[600] : NexusColors.neutral[100],
      
      success: NexusColors.success,
      warning: NexusColors.warning,
      error: NexusColors.error,
      info: NexusColors.info,
    },
    
    spacing: NexusSpacing,
    typography: NexusTypography,
  });
  
  // Para o TypeScript entender o que é cada coisa
  export type NexusTheme = ReturnType<typeof createNexusTheme>;