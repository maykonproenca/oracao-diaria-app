// Tipos TypeScript para o app Oração Diária

// Tipo para uma oração
export interface Prayer {
    id: number;
    title: string;
    content: string;
    category?: string;
    dateCreated: string;
  }
  
  // Tipo para dados de streak do usuário
  export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    totalDays: number;
    lastPrayerDate: string | null;
    prayerDates: string[]; // Array de datas no formato 'YYYY-MM-DD'
  }
  
  // Tipo para uma oração personalizada
  export interface CustomPrayer {
    id: string;
    request: string;
    generatedPrayer: string;
    dateCreated: string;
  }
  
  // Tipo para configurações do usuário
  export interface UserSettings {
    notificationTime: string; // Formato 'HH:MM'
    notificationsEnabled: boolean;
    firstTimeUser: boolean;
  }
  
  // Tipo para o status de uma oração diária
  export interface DailyPrayerStatus {
    date: string; // Formato 'YYYY-MM-DD'
    completed: boolean;
    prayerId: number;
  }
  
  // Tipo para dados de compartilhamento
  export interface ShareData {
    title: string;
    message: string;
    url?: string;
  }
  
  // Tipo para resposta da API do Claude
  export interface ClaudeApiResponse {
    success: boolean;
    prayer?: string;
    error?: string;
  }
  
  // Tipo para estatísticas do usuário
  export interface UserStats {
    totalPrayers: number;
    currentStreak: number;
    longestStreak: number;
    averagePrayersPerWeek: number;
    joinDate: string;
  }
  
  // Enums para categorias de oração
  export enum PrayerCategory {
    MORNING = 'morning',
    EVENING = 'evening',
    GRATITUDE = 'gratitude',
    GUIDANCE = 'guidance',
    HEALING = 'healing',
    FAMILY = 'family',
    WORK = 'work',
    GENERAL = 'general',
  }
  
  // Enum para plataformas de compartilhamento
  export enum SharePlatform {
    WHATSAPP = 'whatsapp',
    INSTAGRAM = 'instagram',
    FACEBOOK = 'facebook',
    OTHER = 'other',
  }