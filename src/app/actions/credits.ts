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
 * Unlock a subject using credits via Supabase RPC
 */
export async function unlockSubject(subjectId: string): Promise<UnlockResult> {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase.rpc('purchase_subject', {
      p_subject_id: subjectId
    });

    if (error) {
      console.error('RPC Error:', error);
      return { success: false, error: error.message };
    }

    const result = data as { success: boolean; error?: string; new_balance?: number };
    
    if (result.success) {
      revalidatePath("/subjects");
      revalidatePath(`/subjects/${subjectId}`);
      revalidatePath("/dashboard");
      return { success: true, newBalance: result.new_balance };
    } else {
      return { success: false, error: result.error || "Erreur lors du déblocage" };
    }
  } catch (err) {
    console.error('Unlock error:', err);
    return { success: false, error: 'Une erreur inattendue est survenue' };
  }
}