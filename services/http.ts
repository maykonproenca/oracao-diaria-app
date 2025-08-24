// services/http.ts
// Camada HTTP centralizada com timeout, parse seguro e mensagens de erro consistentes.

import { withTimeout } from '@/utils/async';

type Json = Record<string, any>;

async function safeJson<T = any>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function postJson<TResp = Json>(
  url: string,
  body: Json,
  opts?: { timeoutMs?: number; signal?: AbortSignal; headers?: Record<string, string> }
): Promise<TResp> {
  const { timeoutMs = 30000, signal, headers } = opts ?? {};
  const p = fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
    body: JSON.stringify(body),
    signal,
  });

  let res: Response;
  try {
    res = await withTimeout(p, timeoutMs, 'Tempo esgotado ao contatar o servidor.');
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error('Requisição cancelada.');
    throw e;
  }

  if (!res.ok) {
    // Tenta extrair mensagem do servidor
    const data = await safeJson<{ error?: string; message?: string }>(res);
    const msg = data?.error || data?.message || `Falha HTTP (${res.status})`;
    throw new Error(msg);
  }

  const data = await safeJson<TResp>(res);
  if (!data) throw new Error('Resposta inválida do servidor (JSON ausente).');
  return data;
}


