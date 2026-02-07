import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePerplexityResponse, PERPLEXITY_CONFIG } from '@/lib/perplexity';

type ResponseType = 'direct' | 'detailed';

function isResponseType(value: unknown): value is ResponseType {
  return value === 'direct' || value === 'detailed';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const payload = await request.json();
    const subjectContent = typeof payload.subjectContent === 'string' ? payload.subjectContent : '';
    const responseType = payload.responseType;
    const subjectId = typeof payload.subjectId === 'string' ? payload.subjectId : null;

    if (!subjectContent.trim()) {
      return NextResponse.json({ error: 'Le contenu du sujet est requis' }, { status: 400 });
    }

    if (!isResponseType(responseType)) {
      return NextResponse.json({ error: 'Type de réponse invalide' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si la configuration Perplexity est disponible
    if (!PERPLEXITY_CONFIG.apiKey) {
      console.warn('Clé API Perplexity non configurée, utilisation de la simulation');
      
      // Utiliser la simulation si la clé n'est pas configurée
      const mockResponse = responseType === "direct" 
        ? `**Réponse directe :**

Ceci est une réponse simulée de Perplexity pour le sujet fourni. Configurez votre clé API Perplexity pour obtenir des réponses réelles.

**Points clés :**
- Analyse approfondie du sujet
- Réponse structurée et logique
- Résolution méthodique

**Configuration requise :**
Ajoutez ces variables dans votre .env.local :
\`\`\`env
PERPLEXITY_API_KEY=votre_clé_api_perplexity
PERPLEXITY_BASE_URL=https://api.perplexity.ai
PERPLEXITY_MODEL=sonar
\`\`\``
        : `**Réponse détaillée avec explications :**

## 1. Analyse du sujet

Le sujet présenté nécessite une approche méthodique. Voici la décomposition étape par étape :

## 2. Méthodologie de résolution

### Étape 1 : Compréhension
- Identifier les éléments clés du sujet
- Définir les concepts fondamentaux

### Étape 2 : Planification
- Élaborer une stratégie de réponse
- Organiser les idées de manière logique

### Étape 3 : Rédaction
- Développer chaque point avec clarté
- Utiliser des exemples pertinents

## 3. Points importants à retenir

- La structure de la réponse est aussi importante que le contenu
- Les justifications doivent être claires et précises
- La conclusion doit synthétiser les points essentiels

**Note :** Configurez votre clé API Perplexity pour obtenir des réponses personnalisées basées sur votre sujet.`;

      // Sauvegarder la réponse simulée
      await supabase.from("ai_responses").insert({
        user_id: user.id,
        subject_id: subjectId,
        subject_content: subjectContent,
        response_type: responseType,
        response: mockResponse,
        credits_used: 0,
        model_used: 'perplexity-simulated',
        created_at: new Date().toISOString()
      });

      return NextResponse.json({
        response: mockResponse,
        creditsUsed: 0
      });
    }

    let creditsUsed = 0;
    let aiResponse: string;
    let isPerplexityFallback = false;

    // Appeler l'API Perplexity d'abord; le débit ne se fait qu'après succès réel.
    try {
      aiResponse = await generatePerplexityResponse(subjectContent, responseType);
    } catch (perplexityError) {
      console.error('Erreur Perplexity:', perplexityError);
      isPerplexityFallback = true;
      
      // En cas d'erreur Perplexity, fournir une réponse de secours
      aiResponse = `**Erreur lors de l'appel à Perplexity**

Une erreur s'est produite lors de la génération de la réponse. Veuillez vérifier votre configuration Perplexity.

**Détails de l'erreur :**
${perplexityError instanceof Error ? perplexityError.message : 'Erreur inconnue'}

**Actions recommandées :**
1. Vérifiez votre clé API Perplexity
2. Confirmez que le modèle est disponible
3. Vérifiez votre quota d'utilisation

**Réponse de secours :**
Pour le sujet fourni, une analyse approfondie serait nécessaire avec une méthodologie structurée et des explications détaillées.`;
    }

    // Déduire les crédits uniquement si la génération IA a réellement réussi.
    if (!isPerplexityFallback && profile.subscription_status !== 'premium') {
      const actionType = responseType === 'direct' ? 'AI_RESPONSE_COMPLETE' : 'AI_RESPONSE_DETAILED';
      const { data: consumeData, error: consumeError } = await supabase.rpc('check_and_consume_credits', {
        p_user_id: user.id,
        p_action_type: actionType,
        p_metadata: {
          subject_id: subjectId,
          response_type: responseType,
        },
      });

      if (consumeError) {
        return NextResponse.json(
          { error: 'Erreur lors de la validation des crédits' },
          { status: 500 }
        );
      }

      const consumeResult = (
        Array.isArray(consumeData) ? consumeData[0] : consumeData
      ) as { success: boolean; error?: string; cost?: number } | null;

      if (!consumeResult?.success) {
        const insufficientCredits = consumeResult?.error === 'INSUFFICIENT_CREDITS';
        return NextResponse.json(
          {
            error: insufficientCredits
              ? 'Crédits insuffisants'
              : consumeResult?.error || 'Erreur de paiement',
          },
          { status: insufficientCredits ? 402 : 400 }
        );
      }

      creditsUsed = consumeResult.cost ?? 0;
    }

    // Sauvegarder la réponse générée pour statistiques
    const { error: saveError } = await supabase.from("ai_responses").insert({
      user_id: user.id,
      subject_id: subjectId,
      subject_content: subjectContent,
      response_type: responseType,
      response: aiResponse,
      credits_used: creditsUsed,
      model_used: PERPLEXITY_CONFIG.model,
      created_at: new Date().toISOString()
    });

    if (saveError) {
      console.error('Erreur sauvegarde ai_responses:', saveError);
    }

    return NextResponse.json({
      response: aiResponse,
      creditsUsed
    });

  } catch (error) {
    console.error('Erreur lors de la génération de la réponse IA:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('insufficient_quota')) {
        return NextResponse.json(
          { error: 'Quota Perplexity dépassé' },
          { status: 429 }
        );
      }
      if (error.message.includes('invalid_api_key')) {
        return NextResponse.json(
          { error: 'Clé API Perplexity invalide' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la génération de la réponse IA' },
      { status: 500 }
    );
  }
}
