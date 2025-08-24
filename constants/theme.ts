// constants/theme.ts
// Design System central: cores (light/dark), tipografia, espaçamento, raio e sombras.

export type ThemeMode = 'light' | 'dark';

export type Theme = {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    border: string;
    text: string;
    textMuted: string;

    primary: string;
    primaryPressed: string;
    primaryText: string;

    successBg: string;
    successText: string;

    warningBg: string;
    warningText: string;

    dangerBg: string;
    dangerText: string;

    outOfMonthBg: string;
    completedBg: string;
    completedDot: string;

    todayBorder: string;
  };
  spacing: (n: number) => number; // base 4
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
  text: {
    h1: number;
    h2: number;
    title: number;
    body: number;
    small: number;
  };
  shadow: (elevation?: number) => { shadowColor?: string; shadowOpacity?: number; shadowRadius?: number; shadowOffset?: { width: number; height: number }; elevation?: number };
};

const spacing = (n: number) => n * 4;

const radius = { sm: 8, md: 12, lg: 16 };

const text = { h1: 24, h2: 18, title: 20, body: 16, small: 12 };

const shadow = (elevation = 2) => ({
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: elevation * 2,
  shadowOffset: { width: 0, height: elevation / 2 },
  elevation,
});

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    border: '#e5e7eb',
    text: '#111827',
    textMuted: '#64748b',

    primary: '#2563eb',
    primaryPressed: '#1d4ed8',
    primaryText: '#ffffff',

    successBg: '#d1fae5',
    successText: '#065f46',

    warningBg: '#fef3c7',
    warningText: '#92400e',

    dangerBg: '#fee2e2',
    dangerText: '#b91c1c',

    outOfMonthBg: '#f1f5f9',
    completedBg: '#d1fae5',
    completedDot: '#047857',

    todayBorder: '#2563eb',
  },
  spacing,
  radius,
  text,
  shadow,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#0b1220',
    surface: '#111827',
    border: '#1f2937',
    text: '#e5e7eb',
    textMuted: '#94a3b8',

    primary: '#2563eb',
    primaryPressed: '#1d4ed8',
    primaryText: '#ffffff',

    successBg: '#064e3b',
    successText: '#d1fae5',

    warningBg: '#3f2d0c',
    warningText: '#fcd34d',

    dangerBg: '#3f1d1d',
    dangerText: '#fecaca',

    outOfMonthBg: '#0b1220',
    completedBg: '#064e3b',
    completedDot: '#10b981',

    todayBorder: '#3b82f6',
  },
  spacing,
  radius,
  text,
  shadow,
};
