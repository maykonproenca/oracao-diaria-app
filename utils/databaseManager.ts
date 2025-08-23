import { Prayer, StreakData } from '../types';
import {
    getAllPrayers,
    getStreakData,
    initializeDatabase,
    insertInitialPrayers,
    isPrayerCompleted,
    markPrayerAsCompleted
} from './database';
import { generateDailySeed } from './date';
  
  /**
   * Classe principal para gerenciar todas as operações do banco de dados
   */
  class DatabaseManager {
    private isInitialized = false;
  
    /**
     * Inicializa o banco de dados e insere dados iniciais se necessário
     */
    async initialize(): Promise<void> {
      try {
        console.log('🔄 Inicializando banco de dados...');
        
        await initializeDatabase();
        await insertInitialPrayers();
        
        this.isInitialized = true;
        console.log('✅ DatabaseManager inicializado com sucesso');
        
      } catch (error) {
        console.error('❌ Erro ao inicializar DatabaseManager:', error);
        throw error;
      }
    }
  
    /**
     * Verifica se o banco foi inicializado
     */
    private ensureInitialized(): void {
      if (!this.isInitialized) {
        throw new Error('DatabaseManager não foi inicializado. Chame initialize() primeiro.');
      }
    }
  
    /**
     * Obtém a oração do dia baseada na data atual
     */
    async getTodaysPrayer(): Promise<Prayer | null> {
      this.ensureInitialized();
      
      try {
        const today = new Date();
        const seed = generateDailySeed(today);
        const prayers = await getAllPrayers();
        
        if (prayers.length === 0) {
          console.log('❌ Nenhuma oração encontrada no banco');
          return null;
        }
        
        // Usar o seed para selecionar uma oração consistente
        const prayerIndex = seed % prayers.length;
        const prayer = prayers[prayerIndex];
        
        console.log(`📖 Oração do dia obtida (seed: ${seed}, index: ${prayerIndex})`);
        return prayer;
        
      } catch (error) {
        console.error('❌ Erro ao obter oração do dia:', error);
        return null;
      }
    }
  
    /**
     * Marca o dia atual como completo (usuário orou)
     */
    async completeTodaysPrayer(prayerId: number): Promise<boolean> {
      this.ensureInitialized();
      
      try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Primeiro verifica se já completou hoje
        const alreadyCompleted = await isPrayerCompleted(today);
        
        if (alreadyCompleted) {
          console.log('ℹ️ Usuário já orou hoje');
          return true;
        }
  
        await markPrayerAsCompleted(today, prayerId);
        console.log('✅ Oração de hoje marcada como completa');
        return true;
        
      } catch (error) {
        console.error('❌ Erro ao marcar oração como completa:', error);
        return false;
      }
    }
  
    /**
     * Verifica se o usuário já orou hoje
     */
    async hasUserPrayedToday(): Promise<boolean> {
      this.ensureInitialized();
      
      try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const completed = await isPrayerCompleted(today);
        console.log(`📊 Usuário ${completed ? 'já orou' : 'ainda não orou'} hoje`);
        return completed;
        
      } catch (error) {
        console.error('❌ Erro ao verificar se usuário orou hoje:', error);
        return false;
      }
    }
  
    /**
     * Obtém dados do streak do usuário
     */
    async getUserStreakData(): Promise<StreakData | null> {
      this.ensureInitialized();
      
      try {
        const streakData = await getStreakData();
        console.log(`📈 Streak atual: ${streakData.currentStreak} dias`);
        return streakData;
        
      } catch (error) {
        console.error('❌ Erro ao obter dados de streak:', error);
        return null;
      }
    }
  
    /**
     * Obtém estatísticas resumidas do usuário
     */
    async getUserSummary(): Promise<{
      todaysPrayer: Prayer | null;
      hasCompletedToday: boolean;
      streakData: StreakData | null;
    }> {
      this.ensureInitialized();
      
      try {
        const [todaysPrayer, hasCompletedToday, streakData] = await Promise.all([
          this.getTodaysPrayer(),
          this.hasUserPrayedToday(),
          this.getUserStreakData(),
        ]);
  
        return {
          todaysPrayer,
          hasCompletedToday,
          streakData,
        };
        
      } catch (error) {
        console.error('❌ Erro ao obter resumo do usuário:', error);
        return {
          todaysPrayer: null,
          hasCompletedToday: false,
          streakData: null,
        };
      }
    }
  }
  
  // Exportar uma instância única (singleton)
  export const databaseManager = new DatabaseManager();
  
  // Exportar a classe para testes se necessário
  export default DatabaseManager;
  