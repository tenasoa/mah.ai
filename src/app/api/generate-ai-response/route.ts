import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePerplexityResponse, PERPLEXITY_CONFIG } from '@/lib/perplexity';

export async function POST(request: NextRequest) {
  try {
    const { subjectContent, responseType, userId } = await request.json();

    // Vérifier les crédits de l'utilisateur
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_balance, subscription_status')
      .eq('id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur a les crédits nécessaires
    if (profile.subscription_status !== 'premium' && profile.credits_balance < 10) {
      return NextResponse.json(
        { error: 'Crédits insuffisants' },
        { status: 402 }
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
        user_id: userId,
        subject_content: subjectContent,
        response_type: responseType,
        response: mockResponse,
        credits_used: profile.subscription_status === 'premium' ? 0 : 10,
        model_used: 'perplexity-simulated',
        created_at: new Date().toISOString()
      });

      return NextResponse.json({
        response: mockResponse,
        creditsUsed: profile.subscription_status === 'premium' ? 0 : 10
      });
    }

    // Appeler l'API Perplexity
    let aiResponse: string;
    try {
      aiResponse = await generatePerplexityResponse(subjectContent, responseType);
    } catch (perplexityError) {
      console.error('Erreur Perplexity:', perplexityError);
      
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

    // Sauvegarder la réponse générée pour statistiques
    await supabase.from("ai_responses").insert({
      user_id: userId,
      subject_content: subjectContent,
      response_type: responseType,
      response: aiResponse,
      credits_used: profile.subscription_status === 'premium' ? 0 : 10,
      model_used: PERPLEXITY_CONFIG.model,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      response: aiResponse,
      creditsUsed: profile.subscription_status === 'premium' ? 0 : 10
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
