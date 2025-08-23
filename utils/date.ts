// Funções utilitárias para manipulação de datas

/**
 * Obtém a data atual no formato YYYY-MM-DD
 */
export const getCurrentDate = (): string => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

/**
 * Obtém a data atual no formato YYYY-MM-DD (alias para getCurrentDate)
 */
export const todayKey = (): string => {
    return getCurrentDate();
  };

/**
 * Formata uma data de forma humanizada em português
 * Exemplo: "segunda-feira, 23 de agosto de 2025"
 */
export const formatHuman = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  /**
   * Formata uma data para exibição em português
   * Exemplo: "segunda-feira, 23 de agosto de 2025"
   */
  export const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  /**
   * Formata uma data curta em português
   * Exemplo: "23/08/2025"
   */
  export const formatShortDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR');
  };
  
  /**
   * Verifica se duas datas são do mesmo dia
   */
  export const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.toDateString() === date2.toDateString();
  };
  
  /**
   * Verifica se a data é hoje
   */
  export const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date());
  };
  
  /**
   * Verifica se a data foi ontem
   */
  export const isYesterday = (date: Date): boolean => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(date, yesterday);
  };
  
  /**
   * Calcula a diferença em dias entre duas datas
   */
  export const daysDifference = (date1: Date, date2: Date): number => {
    const oneDay = 24 * 60 * 60 * 1000; // horas*minutos*segundos*milissegundos
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  };
  
  /**
   * Converte string no formato YYYY-MM-DD para Date
   */
  export const parseDate = (dateString: string): Date => {
    return new Date(dateString + 'T00:00:00');
  };
  
  /**
   * Obtém o início do mês para uma data
   */
  export const getMonthStart = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };
  
  /**
   * Obtém o fim do mês para uma data
   */
  export const getMonthEnd = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };
  
  /**
   * Obtém todos os dias de um mês
   */
  export const getDaysInMonth = (date: Date): Date[] => {
    const start = getMonthStart(date);
    const end = getMonthEnd(date);
    const days: Date[] = [];
    
    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      days.push(new Date(day));
    }
    
    return days;
  };
  
  /**
   * Gera um seed único baseado na data e ID do usuário
   * Usado para garantir que a mesma oração seja mostrada para o mesmo usuário no mesmo dia
   */
  export const generateDailySeed = (date: Date, userId: string = 'default'): number => {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const combined = `${dateString}-${userId}`;
    
    // Hash simples para gerar um número consistente
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converter para 32-bit integer
    }
    
    return Math.abs(hash);
  };
  