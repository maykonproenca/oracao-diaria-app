// utils/async.ts
// Helpers assíncronos reutilizáveis (timeout, retry, sleep).

export function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }
  
  export async function withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    message = 'Tempo esgotado.'
  ): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    const timeout = new Promise<never>((_, rej) => {
      timeoutId = setTimeout(() => rej(new Error(message)), ms) as any;
    });
    try {
      // Corrida entre a promise e o timeout
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timeoutId!);
    }
  }
  
  export async function retry<T>(
    fn: () => Promise<T>,
    opts: { retries?: number; delayMs?: number; backoff?: number } = {}
  ): Promise<T> {
    const retries = opts.retries ?? 2;
    const delayMs = opts.delayMs ?? 500;
    const backoff = opts.backoff ?? 2;
  
    let attempt = 0;
    let wait = delayMs;
  
    while (true) {
      try {
        return await fn();
      } catch (e) {
        if (attempt >= retries) throw e;
        await sleep(wait);
        wait *= backoff;
        attempt += 1;
      }
    }
  }

  