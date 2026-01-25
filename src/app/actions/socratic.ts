'use server';

import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required for Socratic AI features');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
}

const SOCRATIC_SYSTEM_PROMPT = `Tu es un tuteur IA socratique pour des élèves lycéens préparant le Baccalauréat malgache.
Ton rôle : guider l'élève vers la compréhension par des questions ciblées et des indices progressifs, JAMAIS donner la réponse directement.

Style requis :
- "Warm Intelligence" : encourageant, clair, pédagogique
- Adapté au niveau lycée
- Si l'élève insiste, explique avec bienveillance pourquoi tu ne donnes pas la solution tout de suite

Structure de réponse :
1. Accueil encourageant
2. Question ouverte pour guider la réflexion
3. Indice progressif si nécessaire
4. Invitation à formuler une hypothèse

Ne réponds JAMAIS par la solution brute, même si on te demande explicitement.`;

export async function askSocraticTutor(params: SocraticRequest) {
  const supabase = await createClient();
  const { subjectId, questionId, questionText, selectionRect, zoom, userMessage, insistForAnswer } = params;

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
    const contextMessage = `Question de l'élève : "${questionText}"
${userMessage ? `Message de suivi : "${userMessage}"` : ''}

${insistForAnswer ? `L'élève insiste pour avoir la réponse directe. Explique-lui pourquoi c'est mieux pour son apprentissage de ne pas la donner tout de suite.` : ''}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SOCRATIC_SYSTEM_PROMPT },
        { role: 'user', content: contextMessage },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';

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
    console.error('Socratic AI error:', error);
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
