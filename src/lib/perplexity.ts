// Configuration pour l'API Perplexity
export interface PerplexityConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

// Configuration par défaut (à adapter selon votre API Perplexity)
export const PERPLEXITY_CONFIG: PerplexityConfig = {
  apiKey: process.env.PERPLEXITY_API_KEY || '',
  baseUrl: process.env.PERPLEXITY_BASE_URL || 'https://api.perplexity.ai',
  model: process.env.PERPLEXITY_MODEL || 'sonar'
};

// Interface pour la requête Perplexity
export interface PerplexityRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

// Interface pour la réponse Perplexity
export interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Fonction pour appeler l'API Perplexity
export async function callPerplexityAPI(request: PerplexityRequest): Promise<PerplexityResponse> {
  const response = await fetch(`${PERPLEXITY_CONFIG.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PERPLEXITY_CONFIG.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens || 2000,
      temperature: request.temperature || 0.7,
      top_p: request.top_p || 0.9,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Perplexity API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
  }

  return response.json();
}

// Fonction utilitaire pour générer une réponse Perplexity
export async function generatePerplexityResponse(
  subjectContent: string,
  responseType: 'direct' | 'detailed'
): Promise<string> {
  const normalizeLines = (text: string) =>
    text.replace(/\r\n/g, "\n").split("\n").map(line => line.trim()).filter(Boolean);

  const buildMessages = (content: string, chunkIndex?: number, totalChunks?: number) => {
    const systemPrompt = responseType === "direct"
      ? `Tu es un professeur expert qui fournit des réponses directes et concises aux sujets d'examen. 
    Fournis une réponse claire, structurée et précise sans explications détaillées. 
    La réponse doit être complète mais va droit au but.
    Format : 
    1. Réponse directe
    2. Points clés si nécessaire`
      : `Tu es un professeur expert qui fournit des réponses détaillées avec explications complètes.
    Fournis une réponse structurée avec :
    1. Réponse complète
    2. Explications détaillées de chaque étape
    3. Méthodologie et raisonnement
    4. Points importants à retenir
    Sois pédagogique et clair dans tes explications.`;

    const chunkPrefix = totalChunks && chunkIndex !== undefined
      ? `Partie ${chunkIndex + 1}/${totalChunks}. `
      : "";

    const userPrompt = `${chunkPrefix}Voici un sujet d'examen. Fournis une réponse ${responseType === "direct" ? "directe et concise" : "détaillée avec explications"} :

Sujet :
${content}

Réponds en français de manière claire et structurée.`;

    return [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];
  };

  const completeWithContinuation = async (messages: PerplexityRequest["messages"], maxTokens: number) => {
    let combined = "";
    let currentMessages = [...messages];
    let attempts = 0;

    while (attempts < 3) {
      const response = await callPerplexityAPI({
        model: PERPLEXITY_CONFIG.model,
        messages: currentMessages,
        max_tokens: maxTokens,
        temperature: 0.7,
      });

      const part = response.choices[0]?.message?.content || "";
      const finishReason = response.choices[0]?.finish_reason;
      combined += (combined ? "\n" : "") + part;

      if (finishReason !== "length") {
        break;
      }

      currentMessages = [
        ...currentMessages,
        { role: "assistant", content: part },
        {
          role: "user",
          content:
            "Continue exactement la réponse, sans répéter, en gardant la même structure.",
        },
      ];

      attempts += 1;
    }

    return combined.trim() || "Pas de réponse générée";
  };

  const rawLines = normalizeLines(subjectContent);
  const questionLines = rawLines.filter(line =>
    line.endsWith("?") || /^\d+[\).]/.test(line)
  );
  const isMultiQuestion = questionLines.length >= 4;
  const isLong = subjectContent.length > 1800;

  if (isMultiQuestion || isLong) {
    const items = questionLines.length ? questionLines : rawLines;
    const chunkSize = responseType === "direct" ? 4 : 3;
    const chunks: string[] = [];

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize).join("\n");
      chunks.push(chunk);
    }

    const results: string[] = [];
    for (let i = 0; i < chunks.length; i += 1) {
      const messages = buildMessages(chunks[i], i, chunks.length);
      const maxTokens = responseType === "direct" ? 1400 : 2600;
      const part = await completeWithContinuation(messages, maxTokens);
      results.push(part);
    }

    return results.join("\n\n---\n\n");
  }

  const messages = buildMessages(subjectContent);
  const maxTokens = responseType === "direct" ? 1400 : 2600;
  return completeWithContinuation(messages, maxTokens);
}
