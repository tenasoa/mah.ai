'use server';

import { createClient } from '@/lib/supabase/server';

export interface LeaderboardEntry {
  id: string;
  pseudo: string;
  grit_score: number;
  streak_days: number;
  classe: string;
  filiere: string;
  matiere_points?: number;
}

/**
 * Fetches the top users ordered by Grit score.
 */
export async function getGritLeaderboard(limit = 50, matiere?: string): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();

  try {
    if (matiere) {
      const { data, error } = await supabase.rpc('get_matiere_leaderboard', {
        p_matiere: matiere,
        p_limit: limit,
      });

      if (error) {
        console.error('Error fetching subject leaderboard:', error);
        return [];
      }

      type MatiereRow = {
        id: string;
        pseudo: string | null;
        grit_score: number | null;
        streak_days: number | null;
        classe: string | null;
        filiere: string | null;
        matiere_points: number | null;
      };

      return ((data as MatiereRow[] | null) || []).map((entry) => ({
        id: entry.id,
        pseudo: entry.pseudo || 'Apprenant Mystère',
        grit_score: entry.grit_score || 0,
        streak_days: entry.streak_days || 0,
        classe: entry.classe || '',
        filiere: entry.filiere || '',
        matiere_points: entry.matiere_points || 0,
      }));
    }

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
