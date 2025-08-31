// services/aiService.ts
// Chama o proxy (Cloudflare Worker) para gerar a oração personalizada.
// - Usa services/http para timeout/erros consistentes.
// - Não expõe secrets (apenas EXPO_PUBLIC_CLAUDE_PROXY_URL).

import { postJson } from '@/services/http';
import Constants from 'expo-constants';

const ENV_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_CLAUDE_PROXY_URL) ||
  (Constants?.expoConfig?.extra as any)?.EXPO_PUBLIC_CLAUDE_PROXY_URL ||
  undefined;

function getBaseUrl(): string {
  if (!ENV_URL) {
    throw new Error(
      'URL do proxy não configurada. Defina EXPO_PUBLIC_CLAUDE_PROXY_URL antes de iniciar o app.'
    );
  }
  return String(ENV_URL).replace(/\/+$/, '');
}

export async function generateCustomPrayer(prompt: string, opts?: { signal?: AbortSignal }): Promise<string> {
  const base = getBaseUrl();
  
  const data = await postJson<{ text?: string }>(
    `${base}/v1/prayer`, 
    { prompt }, 
    { timeoutMs: 15000, signal: opts?.signal }
  );
  
  if (!data?.text) throw new Error('Resposta inválida do servidor.');
  return String(data.text).trim();
}
