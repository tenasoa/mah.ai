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
}

const mockResponses = [
  "Quelle piste de réflexion as-tu déjà explorée sur ce concept ?",
  "Selon toi, quelles sont les implications de cette idée dans ton cours ?",
  "Peux-tu me donner un exemple concret qui t’aide à mieux comprendre ?",
  "Qu’est-ce qui te bloque exactement dans cette notion ?",
  "Comment pourrais-tu reformuler cela avec tes propres mots ?",
  "Quel lien vois-tu avec ce que tu as déjà appris en classe ?",
  "Si tu devais l’expliquer à un camarade, que dirais-tu ?",
  "Quelles hypothèses peux-tu faire pour répondre à ta propre question ?",
];

const mockInsistResponses = [
  "Je comprends que tu veuilles la réponse, mais imagine que je te la donne maintenant… Tu aurais la solution, mais pas la compétence pour la retrouver seul. C’est en cherchant par toi-même que tu construis vraiment ta compréhension. Essaye encore une fois : quelle idée te vient spontanément en lisant ta question ?",
  "Je sais que c’est tentant d’avoir la réponse tout de suite ! Mais le but du Baccalauréat, c’est que tu puisses y arriver seul(e) le jour J. Je suis là pour te guider, pas pour donner la solution. Reprends ta question : quel mot ou quelle phrase attire ton attention en premier ?",
  "Ton impatience est normale ! Mais la meilleure façon d’apprendre, c’est de se heurter doucement au problème. Si je te donne la réponse, tu ne la retiendras pas. Allez, on essaie ensemble : qu’est-ce que tu sais déjà sur ce sujet, même si tu penses que c’est peu ?",
];

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
    // Mock response
    const responses = insistForAnswer ? mockInsistResponses : mockResponses;
    const aiResponse = responses[Math.floor(Math.random() * responses.length)];

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
