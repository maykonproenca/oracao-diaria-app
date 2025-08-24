// hooks/useAIService.ts
// Hook que gerencia o estado e chamadas do serviço AI para gerar orações personalizadas.

import { useCallback, useRef, useState } from 'react';
import { generateCustomPrayer } from '@/services/aiService';

type AIState = {
  loading: boolean;
  error: string | null;
  result: string | null;
};

export function useAIService() {
  const [state, setState] = useState<AIState>({
    loading: false,
    error: null,
    result: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (prompt: string) => {
    // Cancela requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Cria novo controller para esta requisição
    abortControllerRef.current = new AbortController();

    setState({
      loading: true,
      error: null,
      result: null,
    });

    try {
      const result = await generateCustomPrayer(prompt, {
        signal: abortControllerRef.current.signal,
      });

      setState({
        loading: false,
        error: null,
        result,
      });

      return result;
    } catch (error: any) {
      // Ignora erros de cancelamento
      if (error?.name === 'AbortError') {
        return null;
      }

      setState({
        loading: false,
        error: error?.message || 'Erro ao gerar oração',
        result: null,
      });

      throw error;
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    setState({
      loading: false,
      error: null,
      result: null,
    });
  }, [cancel]);

  return {
    ...state,
    generate,
    cancel,
    reset,
  };
}
