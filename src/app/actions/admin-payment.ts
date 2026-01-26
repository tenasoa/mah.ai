"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PaymentWithProfile = {
  id: string;
  user_id: string;
  amount: number;
  cost_mga: number;
  payment_method: string;
  payment_reference: string | null;
  status: "pending" | "completed" | "failed";
  created_at: string;
  profile: {
    id: string;
    pseudo: string;
    filiere: string;
    etablissement: string;
  } | null;
};

async function isAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, isAdmin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { supabase, isAdmin: profile?.role === "admin" };
}

export async function getPendingPayments(limit = 25): Promise<{
  payments: PaymentWithProfile[];
  total: number;
  error: string | null;
}> {
  const { supabase, isAdmin: isUserAdmin } = await isAdmin();

  if (!isUserAdmin) {
    return { payments: [], total: 0, error: "Accès refusé." };
  }

  // Fetch credit purchase requests
  const { data: payments, error, count } = await supabase
    .from("credit_purchases")
    .select("*", { count: "exact" })
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .range(0, Math.max(0, limit - 1));

  if (error) {
    console.error(
      "Error fetching payments details:",
      JSON.stringify(error, null, 2),
    );
    return { payments: [], total: 0, error: "Impossible de récupérer les paiements." };
  }

  // Fetch profiles manually to be safe about relationships
  if (payments && payments.length > 0) {
    const pagedPayments = payments;
    const userIds = pagedPayments.map((p) => p.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, pseudo, filiere, etablissement")
      .in("id", userIds);

    // Merge
    if (profilesError) {
      console.error(
        "Error fetching profiles details:",
        JSON.stringify(profilesError, null, 2),
      );
      return {
        payments: pagedPayments.map((p) => ({
          ...p,
          profile: null,
        })),
        total: count || payments.length,
        error: "Impossible de récupérer les profils.",
      };
    }

    return {
      payments: pagedPayments.map((p) => ({
        ...p,
        profile: profiles?.find((prof) => prof.id === p.user_id) || null,
      })),
      total: count || payments.length,
      error: null,
    };
  }

  return { payments: [], total: count || 0, error: null };
}

export async function validatePayment(paymentId: string) {
  const { supabase, isAdmin: isUserAdmin } = await isAdmin();

  if (!isUserAdmin) {
    return { success: false, error: "Accès refusé." };
  }

  const { data: updatedPurchase, error: purchaseError } = await supabase
    .from("credit_purchases")
    .update({ status: "completed" })
    .eq("id", paymentId)
    .eq("status", "pending")
    .select("id, user_id, amount")
    .maybeSingle();

  if (purchaseError) {
    return { success: false, error: purchaseError.message };
  }

  if (!updatedPurchase) {
    return { success: false, error: "Paiement introuvable ou déjà traité." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("credits_balance")
    .eq("id", updatedPurchase.user_id)
    .single();

  if (profileError) {
    await supabase
      .from("credit_purchases")
      .update({ status: "pending" })
      .eq("id", paymentId);
    return { success: false, error: profileError.message };
  }

  const newBalance =
    (profile?.credits_balance || 0) + (updatedPurchase.amount || 0);

  const { error: updateProfileError } = await supabase
    .from("profiles")
    .update({ credits_balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", updatedPurchase.user_id);

  if (updateProfileError) {
    await supabase
      .from("credit_purchases")
      .update({ status: "pending" })
      .eq("id", paymentId);
    return { success: false, error: updateProfileError.message };
  }

  revalidatePath("/admin/payments");
  revalidatePath("/credits");
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  const { error: notifError } = await supabase.rpc("create_notification", {
    p_user_id: updatedPurchase.user_id,
    p_title: "Recharge validée",
    p_content: `Votre recharge de ${updatedPurchase.amount} crédits a été validée. Vos crédits sont maintenant disponibles.`,
    p_type: "success",
    p_link: "/credits",
  });
  if (notifError) {
    await supabase.from("notifications").insert({
      user_id: updatedPurchase.user_id,
      title: "Recharge validée",
      content: `Votre recharge de ${updatedPurchase.amount} crédits a été validée. Vos crédits sont maintenant disponibles.`,
      type: "success",
      link: "/credits",
      is_read: false,
    });
  }
  return { success: true };
}

export async function rejectPayment(paymentId: string) {
  const { supabase, isAdmin: isUserAdmin } = await isAdmin();

  if (!isUserAdmin) {
    return { success: false, error: "Accès refusé." };
  }

  const { error } = await supabase
    .from("credit_purchases")
    .update({ status: "failed" })
    .eq("id", paymentId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/payments");
  if (!error) {
    const { data: purchase } = await supabase
      .from("credit_purchases")
      .select("user_id, amount")
      .eq("id", paymentId)
      .maybeSingle();
    if (purchase) {
      const { error: notifError } = await supabase.rpc("create_notification", {
        p_user_id: purchase.user_id,
        p_title: "Recharge rejetée",
        p_content:
          "Votre demande de recharge a été rejetée. Veuillez vérifier le paiement ou contacter le support.",
        p_type: "warning",
        p_link: "/credits",
      });
      if (notifError) {
        await supabase.from("notifications").insert({
          user_id: purchase.user_id,
          title: "Recharge rejetée",
          content:
            "Votre demande de recharge a été rejetée. Veuillez vérifier le paiement ou contacter le support.",
          type: "warning",
          link: "/credits",
          is_read: false,
        });
      }
    }
  }
  return { success: true };
}

export async function getTrustGapAnalytics(): Promise<{
  stats: {
    total_trust_requests: number;
    confirmed_payments: number;
    rejected_payments: number;
    pending_trust: number;
    trust_gap_index: number;
    total_revenue: number;
  };
  error: string | null;
}> {
  const { supabase, isAdmin: isUserAdmin } = await isAdmin();

  if (!isUserAdmin) {
    return { stats: {} as any, error: "Accès refusé." };
  }

  try {
    // 1. Récupérer tous les statuts
    const { data: payments, error } = await supabase
      .from("credit_purchases")
      .select("status, cost_mga");

    if (error) throw error;

    const stats = {
      total_trust_requests: payments.length,
      confirmed_payments: payments.filter(p => p.status === 'completed').length,
      rejected_payments: payments.filter(p => p.status === 'failed').length,
      pending_trust: payments.filter(p => p.status === 'pending').length,
      total_revenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.cost_mga || 0), 0),
      trust_gap_index: 0
    };

    // Calcul de l'indice Trust Gap (Honnêteté vs Fraude potentielle)
    // Formule : Pending / Total (hors rejetés)
    if (stats.total_trust_requests > 0) {
      const activeRequests = stats.total_trust_requests - stats.rejected_payments;
      stats.trust_gap_index = activeRequests > 0 ? (stats.pending_trust / activeRequests) * 100 : 0;
    }

    return { stats, error: null };
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return { stats: {} as any, error: "Erreur lors du calcul des stats." };
  }
}
