import { createClient } from '@/lib/supabase/client';

export async function getUserCreditsAndSubscriptionClient(userId: string) {
  const supabase = createClient();
  
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

export async function deductCreditsClient(userId: string, amount: number) {
  const supabase = createClient();
  
  // Appeler la fonction RPC pour déduire les crédits
  const { data, error } = await supabase.rpc('deduct_credits', {
    user_id: userId,
    amount: amount
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { 
    success: data[0]?.success || false, 
    creditsDeducted: data[0]?.success ? amount : 0,
    message: data[0]?.message
  };
}

export async function checkCreditsClient(userId: string, requiredCredits: number) {
  const { credits, subscription, error } = await getUserCreditsAndSubscriptionClient(userId);
  
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
