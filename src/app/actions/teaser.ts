"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Vérifie si un utilisateur a accès à un sujet
 * Retourne le sujet avec le flag has_access
 */
export async function checkSubjectAccess(subjectId: string): Promise<{
  hasAccess: boolean;
  isFree: boolean;
  expiresAt: string | null;
}> {
  const supabase = await createClient();

  // Get subject
  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id, is_free")
    .eq("id", subjectId)
    .single();

  if (subjectError || !subject) {
    return {
      hasAccess: false,
      isFree: false,
      expiresAt: null,
    };
  }

  // If subject is free, everyone has access
  if (subject.is_free) {
    return {
      hasAccess: true,
      isFree: true,
      expiresAt: null,
    };
  }

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      hasAccess: false,
      isFree: false,
      expiresAt: null,
    };
  }

  // Check if user has access to this subject
  const { data: access } = await supabase
    .from("user_subject_access")
    .select("expires_at")
    .eq("user_id", user.id)
    .eq("subject_id", subjectId)
    .or("expires_at.is.null,expires_at.gt.now()")
    .single();

  if (!access) {
    return {
      hasAccess: false,
      isFree: false,
      expiresAt: null,
    };
  }

  return {
    hasAccess: true,
    isFree: false,
    expiresAt: access.expires_at,
  };
}

/**
 * Enregistre une vue de teaser pour analytics
 */
export async function recordTeaserView(
  subjectId: string,
  source: "search" | "direct" | "social" | "email" = "direct",
  variant: string = "control",
): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const { error } = await supabase.from("teaser_views").insert({
      subject_id: subjectId,
      user_id: user?.id || null,
      source,
      variant,
      viewed_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error recording teaser view:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in recordTeaserView:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Enregistre un clic sur CTA de déblocage
 */
export async function recordTeaserCTA(
  subjectId: string,
  ctaType: "unlock" | "signup" | "login" | "share",
  variant: string = "control",
): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const { error } = await supabase.from("teaser_conversions").insert({
      subject_id: subjectId,
      user_id: user?.id || null,
      cta_type: ctaType,
      variant,
      clicked_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error recording teaser CTA:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in recordTeaserCTA:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
