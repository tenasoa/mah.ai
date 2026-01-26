'use server';

import { createClient } from '@/lib/supabase/server';

export interface LeaderboardEntry {
  id: string;
  pseudo: string;
  grit_score: number;
  streak_days: number;
  classe: string;
  filiere: string;
}

/**
 * Fetches the top users ordered by Grit score.
 */
export async function getGritLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, pseudo, grit_score, streak_days, classe, filiere')
      .order('grit_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return (data || []).map(entry => ({
      ...entry,
      pseudo: entry.pseudo || 'Apprenant Mystère',
      grit_score: entry.grit_score || 0,
      streak_days: entry.streak_days || 0
    }));
  } catch (err) {
    console.error('Leaderboard exception:', err);
    return [];
  }
}
