// server/cloudflare/src/worker.ts
// Proxy seguro para Anthropic Claude API (Messages).
// - NÃO expõe a API key no app.
// - Implementa rota POST /v1/prayer com CORS.
// - Formata prompt para gerar oração 300–400 palavras em pt-BR.
// - Trata erros e timeouts básicos.

export interface Env {
    ANTHROPIC_API_KEY: string;
    ANTHROPIC_MODEL?: string;
    ALLOWED_ORIGIN?: string; // opcional: defina para restringir CORS ao seu domínio/app
  }
  
  function corsHeaders(origin?: string) {
    // Em dev, '*' facilita. Em produção, configure ALLOWED_ORIGIN.
    const allowOrigin = origin || "*";
    return {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
  }
  
  function okJson(obj: unknown, origin?: string, status = 200) {
    return new Response(JSON.stringify(obj), {
      status,
      headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders(origin) },
    });
  }
  
  function handleOptions(request: Request, origin?: string) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: { ...corsHeaders(origin), "Access-Control-Max-Age": "86400" } });
    }
    return null;
  }
  
  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      const origin = env.ALLOWED_ORIGIN;
      const preflight = handleOptions(request, origin);
      if (preflight) return preflight;
  
      const url = new URL(request.url);
  
      if (request.method === "POST" && url.pathname === "/v1/prayer") {
        try {
          const { prompt } = await request.json().catch(() => ({} as any));
          if (typeof prompt !== "string" || !prompt.trim()) {
            return okJson({ error: 'Campo "prompt" é obrigatório.' }, origin, 400);
          }
  
          const system = [
            "Você é um assistente que cria orações evangélicas no estilo 'Café com Deus Pai'.",
            "ESTILO: Linguagem simples e conversacional. Trate Deus como 'Pai' ou 'Deus' naturalmente.",
            "ESTRUTURA: Abertura (15-20 palavras) + Corpo (60-70 palavras) + Fechamento (10-20 palavras) com 'Em nome de Jesus, amém'",
            "LIMITE: Máximo 100 palavras (conte todas as palavras, incluindo artigos e preposições)",
            "FORMATO: ## 🙏 **[MOTIVO EM NEGRITO]** + [ORAÇÃO] + --- + **Total: [NÚMERO]** + 💙 *Salmos 55:22*",
            "IMPORTANTE: Respeite rigorosamente o limite de 100 palavras. Não ultrapasse este limite."
          ].join(" ");
  
          const body = {
            model: env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022",
            max_tokens: 300,         // suficiente para ~100 palavras
            temperature: 0.6,        // menos criatividade = respostas mais rápidas e diretas
            system,                  // system prompt (instruções)
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                                    text:
                  `Gere uma oração estilo 'Café com Deus Pai' para: "${prompt.trim()}". LIMITE RIGOROSO: máximo 100 palavras. Conte todas as palavras e não ultrapasse este limite.`,
                  },
                ],
              },
            ],
          };
  
          const controller = new AbortController();
          const to = setTimeout(() => controller.abort(), 20000); // timeout 20s (otimizado para 100 palavras)
  
          const resp = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-api-key": env.ANTHROPIC_API_KEY,
              // Versão exigida pela API
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          }).catch((e) => {
            throw new Error(`Falha ao contatar Anthropic: ${e?.message || e}`);
          });
  
          clearTimeout(to);
  
          if (!resp.ok) {
            const errTxt = await resp.text().catch(() => "");
            return okJson(
              { error: `Erro da Anthropic (${resp.status})`, details: errTxt?.slice(0, 500) },
              origin,
              502
            );
          }
  
          const data = await resp.json().catch(() => null);
          const text = data?.content?.[0]?.text || "";
          if (!text) return okJson({ error: "Resposta inválida da Anthropic." }, origin, 502);
  
          return okJson({ text: String(text).trim() }, origin, 200);
        } catch (e: any) {
          const msg = e?.name === "AbortError" ? "Timeout ao gerar a oração." : (e?.message || "Erro interno");
          return okJson({ error: msg }, origin, 500);
        }
      }
  
      return okJson({ error: "Not found" }, origin, 404);
    },
  };
  