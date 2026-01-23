"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type UnlockResult = {
  success: boolean;
  error?: string;
  newBalance?: number;
};

/**
 * Unlock a subject using credits via Supabase RPC
 */
export async function unlockSubject(subjectId: string, cost: number): Promise<UnlockResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("purchase_subject", {
      p_subject_id: subjectId,
      p_cost: cost,
    });

    if (error) {
      console.error("RPC Error:", error);
      return { success: false, error: "Erreur lors de la transaction." };
    }

    // RPC returns JSONB, typed as any by default sdk
    const result = data as { success: boolean; error?: string; new_balance?: number };

    if (result.success) {
      revalidatePath("/subjects");
      revalidatePath(`/subjects/${subjectId}`);
      revalidatePath("/dashboard"); // Balance might be shown there
      return { success: true, newBalance: result.new_balance };
    } else {
      return { success: false, error: result.error || "Solde insuffisant ou erreur inconnue." };
    }

  } catch (err) {
    console.error("Unlock Exception:", err);
    return { success: false, error: "Une erreur inattendue est survenue." };
  }
}

/**
 * Get current user credit balance
 */
export async function getCreditBalance(): Promise<number | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("credits_balance")
    .eq("id", user.id)
    .single();

  return data?.credits_balance ?? 0;
}
