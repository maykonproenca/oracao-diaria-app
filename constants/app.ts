// constants/app.ts
// Constantes do app e link público (configurável via EXPO_PUBLIC_APP_LINK).

export const APP_NAME = 'Oração Diária';

// Link público do app (Play Store / site). Configure via variável de ambiente:
export const APP_LINK =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_APP_LINK) ||
  'https://exemplo.com/oracao-diaria'; // placeholder seguro para dev
