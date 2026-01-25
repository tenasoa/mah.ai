'use server';

import { createClient } from '@/lib/supabase/server';

type SelectionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface SocraticRequest {
  subjectId: string;
  questionId: string;
  questionText: string;
  selectionRect?: SelectionRect | null;
  zoom?: number;
  userMessage?: string;
  insistForAnswer?: boolean;
  markdownContext?: string;
}

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

const SOCRATIC_SYSTEM_PROMPT = `Tu es un tuteur IA socratique pour des élèves et étudiants malgaches préparant divers examens et concours (du collège à l'université).
Ton rôle : guider l'apprenant vers la compréhension par des questions ciblées et des indices progressifs, JAMAIS donner la réponse directement.

Style requis :
- "Warm Intelligence" : encourageant, clair, pédagogique et sobre.
- Adapté au niveau de l'apprenant (sois attentif au contenu du sujet pour deviner le niveau).
- Évite les présentations trop longues ou répétitives sur le "Baccalauréat". Salue brièvement et entre dans le vif du sujet.
- Si l'élève insiste, explique avec bienveillance pourquoi tu ne donnes pas la solution tout de suite.

Formatage Mathématique (CRUCIAL) :
- Utilise TOUJOURS LaTeX pour TOUTES les formules mathématiques, même les plus simples.
- Utilise des doubles dollars $$ ... $$ pour les formules importantes sur une nouvelle ligne.
- Utilise des simples dollars $ ... $ pour les formules intégrées au texte.

Structure de réponse :
1. Accueil très bref et encourageant
2. Question ouverte ou indice pour guider la réflexion en fonction du sujet
3. Invitation à formuler une hypothèse

Ne réponds JAMAIS par la solution brute, même si on te demande explicitement.`;

async function callPerplexityAPI(messages: Array<{ role: string; content: string }>) {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY environment variable is required');
  }

  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages,
      temperature: 0.7,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Perplexity API error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';
}

export async function askSocraticTutor(params: SocraticRequest) {
  const supabase = await createClient();
  const { subjectId, questionId, questionText, selectionRect, zoom, userMessage, insistForAnswer, markdownContext } = params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'auth_required' };
  }

  // TODO: Réintégrer la vérification d'accès une fois les mocks corrigés
  // const { data: access } = await supabase
  //   .from('user_access')
  //   .select('id')
  //   .or(`subject_id.eq.${subjectId},is_permanent.eq.true`)
  //   .eq('user_id', user.id)
  //   .single();

  // if (!access) {
  //   return { data: null, error: 'access_denied' };
  // }

  try {
    // Construire le contexte pour l'IA
    const contextMessage = `Voici le contenu du sujet de l'examen :
---
${markdownContext || "Contenu non disponible en texte."}
---

Question de l'élève : "${questionText}"
${userMessage ? `Message de suivi : "${userMessage}"` : ''}

${insistForAnswer ? `L'élève insiste pour avoir la réponse directe. Explique-lui pourquoi c'est mieux pour son apprentissage de ne pas la donner tout de suite.` : ''}`;

    const messages = [
      { role: 'system', content: SOCRATIC_SYSTEM_PROMPT },
      { role: 'user', content: contextMessage },
    ];

    const aiResponse = await callPerplexityAPI(messages);

    // Sauvegarder l'échange pour l'historique
    const { error: insertError } = await supabase
      .from('socratic_exchanges')
      .insert({
        user_id: user.id,
        subject_id: subjectId,
        question_id: questionId,
        user_message: userMessage || questionText,
        ai_response: aiResponse,
        selection_rect: selectionRect,
        zoom,
        insisted_for_answer: insistForAnswer || false,
      });

    if (insertError) {
      console.error('Error saving socratic exchange:', insertError);
    }

    return { data: { response: aiResponse }, error: null };
  } catch (error) {
    console.error('Perplexity AI error:', error);
    return { data: null, error: 'ai_service_error' };
  }
}

export async function getSocraticHistory(subjectId: string, questionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: 'auth_required' };
  }

  const { data, error } = await supabase
    .from('socratic_exchanges')
    .select('user_message, ai_response, created_at, insisted_for_answer')
    .eq('user_id', user.id)
    .eq('subject_id', subjectId)
    .eq('question_id', questionId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}
