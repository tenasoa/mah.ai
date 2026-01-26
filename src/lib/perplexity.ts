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

  const userPrompt = `Voici un sujet d'examen. Fournis une réponse ${responseType === "direct" ? "directe et concise" : "détaillée avec explications"} :

Sujet :
${subjectContent}

Réponds en français de manière claire et structurée.`;

  try {
    const response = await callPerplexityAPI({
      model: PERPLEXITY_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: responseType === "direct" ? 1000 : 2000,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'Pas de réponse générée';
  } catch (error) {
    console.error('Erreur Perplexity:', error);
    throw error;
  }
}
