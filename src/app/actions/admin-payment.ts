"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PaymentWithProfile = {
  id: string;
  user_id: string;
  reference_code: string;
  status: "pending_trust" | "confirmed" | "rejected" | "expired";
  amount: number;
  created_at: string;
  expires_at: string;
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

export async function getPendingPayments(): Promise<{
  payments: PaymentWithProfile[];
  error: string | null;
}> {
  const { supabase, isAdmin: isUserAdmin } = await isAdmin();

  if (!isUserAdmin) {
    return { payments: [], error: "Accès refusé." };
  }

  // Fetch payments
  const { data: payments, error } = await supabase
    .from("payments")
    .select("*")
    .eq("status", "pending_trust")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "Error fetching payments details:",
      JSON.stringify(error, null, 2),
    );
    return { payments: [], error: "Impossible de récupérer les paiements." };
  }

  // Fetch profiles manually to be safe about relationships
  if (payments && payments.length > 0) {
    const userIds = payments.map((p) => p.user_id);
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
        payments: payments.map((p) => ({
          ...p,
          profile: null,
        })),
        error: "Impossible de récupérer les profils.",
      };
    }

    return {
      payments: payments.map((p) => ({
        ...p,
        profile: profiles?.find((prof) => prof.id === p.user_id) || null,
      })),
      error: null,
    };
  }

  return { payments: [], error: null };
}

export async function validatePayment(paymentId: string) {
  const { supabase, isAdmin: isUserAdmin } = await isAdmin();

  if (!isUserAdmin) {
    return { success: false, error: "Accès refusé." };
  }

  const { error } = await supabase
    .from("payments")
    .update({ status: "confirmed" })
    .eq("id", paymentId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/payments");
  return { success: true };
}

export async function rejectPayment(paymentId: string) {
  const { supabase, isAdmin: isUserAdmin } = await isAdmin();

  if (!isUserAdmin) {
    return { success: false, error: "Accès refusé." };
  }

  const { error } = await supabase
    .from("payments")
    .update({ status: "rejected" })
    .eq("id", paymentId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/payments");
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
      .from("payments")
      .select("status, amount");

    if (error) throw error;

    const stats = {
      total_trust_requests: payments.length,
      confirmed_payments: payments.filter(p => p.status === 'confirmed').length,
      rejected_payments: payments.filter(p => p.status === 'rejected').length,
      pending_trust: payments.filter(p => p.status === 'pending_trust').length,
      total_revenue: payments.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + (p.amount || 0), 0),
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
