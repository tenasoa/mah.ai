'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type GritAction = 'active_reading' | 'ai_interaction' | 'daily_login' | 'quiz_completion' | 'contribution';

interface AddGritParams {
  amount: number;
  action: GritAction;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Adds Grit points to the user profile and updates activity tracking.
 */
export async function addGritPoints(params: AddGritParams) {
  const supabase = await createClient();
  const { amount, action, referenceId, metadata } = params;

  try {
    // 1. Appeler la fonction SQL atomique
    const { data, error } = await supabase.rpc('add_grit_points', {
      p_amount: amount,
      p_action: action,
      p_reference_id: referenceId,
      p_metadata: metadata
    });

    if (error) {
      console.error('Error adding grit points:', error);
      return { success: false, error: error.message };
    }

    // 2. Mettre à jour les vues concernées
    revalidatePath('/dashboard');
    
    return data as { success: boolean; new_score?: number; error?: string };
  } catch (error) {
    console.error('Grit action exception:', error);
    return { success: false, error: 'Une erreur est survenue' };
  }
}

/**
 * Checks and updates the user's daily streak.
 * Logic: 
 * - If last activity was YESTERDAY: streak++
 * - If last activity was TODAY: do nothing
 * - If last activity was BEFORE YESTERDAY: streak = 1
 */
export async function updateDailyStreak() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_days, last_activity_at')
      .eq('id', user.id)
      .single();

    if (!profile) return;

    const now = new Date();
    const lastActivity = new Date(profile.last_activity_at);
    
    const isSameDay = now.toDateString() === lastActivity.toDateString();
    
    // Calculer la différence en jours
    const diffTime = now.getTime() - lastActivity.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (isSameDay) return; // Déjà actif aujourd'hui

    let newStreak = 1;
    if (diffDays === 1) {
      newStreak = (profile.streak_days || 0) + 1;
    }

    await supabase
      .from('profiles')
      .update({ 
        streak_days: newStreak, 
        last_activity_at: now.toISOString() 
      })
      .eq('id', user.id);

    // Si nouveau jour, on offre un petit bonus de connexion
    if (newStreak > profile.streak_days) {
        await addGritPoints({
            amount: 10 * newStreak, // Bonus croissant avec la série
            action: 'daily_login'
        });
    }

    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}
