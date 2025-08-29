// hooks/usePrayerUpdates.ts
// Hook para gerenciar atualizações de orações e mostrar feedback ao usuário

import { useToast } from '@/components/ui/ToastProvider';
import { checkAndUpdatePrayers, forceUpdateCheck, type UpdateResult } from '@/services/prayerUpdateService';
import { useCallback, useState } from 'react';

export function usePrayerUpdates() {
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<UpdateResult | null>(null);
  const toast = useToast();

  const checkUpdates = useCallback(async (showFeedback = true): Promise<UpdateResult> => {
    setIsChecking(true);
    try {
      const result = await checkAndUpdatePrayers();
      setLastUpdate(result);
      
      if (showFeedback && result.needsUpdate) {
        const message = `Atualização concluída: ${result.updatedCount} orações atualizadas, ${result.newCount} novas adicionadas.`;
        toast.show({ type: 'success', message });
      }
      
      return result;
    } catch (error: any) {
      console.error('Erro ao verificar atualizações:', error);
      
      if (showFeedback) {
        toast.show({ 
          type: 'error', 
          message: 'Erro ao verificar atualizações. Tente novamente.' 
        });
      }
      
      throw error;
    } finally {
      setIsChecking(false);
    }
  }, [toast]);

  const forceCheck = useCallback(async (showFeedback = true): Promise<UpdateResult> => {
    setIsChecking(true);
    try {
      const result = await forceUpdateCheck();
      setLastUpdate(result);
      
      if (showFeedback) {
        if (result.needsUpdate) {
          const message = `Verificação forçada: ${result.updatedCount} orações atualizadas, ${result.newCount} novas adicionadas.`;
          toast.show({ type: 'success', message });
        } else {
          toast.show({ type: 'info', message: 'Todas as orações estão atualizadas!' });
        }
      }
      
      return result;
    } catch (error: any) {
      console.error('Erro ao forçar verificação:', error);
      
      if (showFeedback) {
        toast.show({ 
          type: 'error', 
          message: 'Erro ao verificar atualizações. Tente novamente.' 
        });
      }
      
      throw error;
    } finally {
      setIsChecking(false);
    }
  }, [toast]);

  return {
    isChecking,
    lastUpdate,
    checkUpdates,
    forceCheck,
  };
}
