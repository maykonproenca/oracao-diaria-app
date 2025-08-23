// utils/hash.ts
// Hash determinístico simples (FNV-1a) para transformar uma string (ex.: "2025-08-23")
// em um inteiro não negativo. Serve para escolher um índice de oração por dia.

export function hashStringFNV1a(str: string): number {
    let hash = 0x811c9dc5; // offset basis 32-bit
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
    }
    return hash >>> 0; // força não-negativo
  }

  