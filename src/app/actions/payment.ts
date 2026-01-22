"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitTrustPayment(referenceCode: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté pour activer un accès." };
  }

  // Validate code length
  if (referenceCode.length < 5) {
    return {
      error: "Le code de référence doit contenir au moins 5 caractères.",
    };
  }

  try {
    const { error } = await supabase.from("payments").insert({
      user_id: user.id,
      reference_code: referenceCode,
      status: "pending_trust",
      // expires_at is handled by default value in DB (now() + 1 hour)
    });

    if (error) {
      console.error("Supabase error:", error);
      console.error("Attempted Insert Data:", {
        user_id: user.id,
        referenceCode,
        status: "pending_trust",
      });
      return {
        error: "Erreur lors de l'enregistrement du paiement. Réessayez.",
      };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "Une erreur inattendue est survenue." };
  }
}
