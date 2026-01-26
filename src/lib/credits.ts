import { createClient } from '@/lib/supabase/server';

export async function getUserCreditsAndSubscription(userId: string) {
  const supabase = await createClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('credits_balance, subscription_status')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return {
      credits: 0,
      subscription: 'free',
      error: error?.message || 'Profil non trouvé'
    };
  }

  return {
    credits: profile.credits_balance || 0,
    subscription: profile.subscription_status || 'free',
    error: null
  };
}

export async function deductCredits(userId: string, amount: number) {
  const supabase = await createClient();
  
  // Vérifier d'abord si l'utilisateur est premium
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, credits_balance')
    .eq('id', userId)
    .single();

  if (!profile) {
    return { success: false, error: 'Utilisateur non trouvé' };
  }

  // Si l'utilisateur est premium, ne pas déduire de crédits
  if (profile.subscription_status === 'premium') {
    return { success: true, creditsDeducted: 0 };
  }

  // Vérifier si l'utilisateur a assez de crédits
  if ((profile.credits_balance || 0) < amount) {
    return { success: false, error: 'Crédits insuffisants' };
  }

  // Déduire les crédits
  const { error } = await supabase.rpc('deduct_credits', {
    user_id: userId,
    amount: amount
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, creditsDeducted: amount };
}

export async function checkCredits(userId: string, requiredCredits: number) {
  const { credits, subscription, error } = await getUserCreditsAndSubscription(userId);
  
  if (error) {
    return { canAccess: false, error };
  }

  // Les utilisateurs premium ont accès à tout
  if (subscription === 'premium') {
    return { canAccess: true, credits, subscription };
  }

  // Vérifier les crédits pour les utilisateurs gratuits
  const canAccess = credits >= requiredCredits;
  
  return { 
    canAccess, 
    credits, 
    subscription,
    error: canAccess ? null : `Crédits insuffisants (${requiredCredits} requis, ${credits} disponibles)`
  };
}
