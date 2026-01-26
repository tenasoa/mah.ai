"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type UnlockResult = {
  success: boolean;
  error?: string;
  newBalance?: number;
};

export async function getCreditBalance(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('id', user.id)
    .single();

  return data?.credits_balance || 0;
}

/**
 * Unlock a subject using credits via the centralized consumeCredits logic
 */
export async function unlockSubject(subjectId: string): Promise<UnlockResult> {
  const result = await consumeCredits('UNLOCK_SUBJECT', { subject_id: subjectId });
  
  if (result.success) {
    revalidatePath("/subjects");
    revalidatePath(`/subjects/${subjectId}`);
    return { success: true, newBalance: result.new_balance };
  }
  
  return { success: false, error: result.error };
}

/**
 * Get credit pricing from site settings
 */
export async function getCreditPrices(): Promise<Record<string, number>> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'credit_prices')
    .single();

  return (data?.value as Record<string, number>) || { "10": 5000, "50": 22500, "100": 40000 };
}

/**
 * Consume credits for a specific action
 */
export async function consumeCredits(actionType: string, metadata: any = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  try {
    const { data, error } = await supabase.rpc('check_and_consume_credits', {
      p_user_id: user.id,
      p_action_type: actionType,
      p_metadata: metadata
    });

    if (error) throw error;
    
    const result = data as { success: boolean; error?: string; cost?: number; new_balance?: number };
    
    if (result.success) {
      revalidatePath("/dashboard");
      revalidatePath("/profile");
      revalidatePath("/credits");
    }
    
    return result;
  } catch (err) {
    console.error('Consume credits error:', err);
    return { success: false, error: "Erreur lors de la consommation de crédits" };
  }
}

/**
 * Get user transaction history
 */
export async function getTransactions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return data || [];
}

/**
 * Submit a request for credit purchase (to be validated by admin)
 */
export async function submitCreditPurchase(params: {
  amount: number;
  cost_mga: number;
  payment_method: string;
  payment_reference: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const { error } = await supabase
    .from('credit_purchases')
    .insert({
      user_id: user.id,
      amount: params.amount,
      cost_mga: params.cost_mga,
      payment_method: params.payment_method,
      payment_reference: params.payment_reference,
      status: 'pending'
    });

  if (error) {
    console.error('Submit purchase error:', error);
    return { error: error.message };
  }

  revalidatePath('/credits');
  return { success: true };
}