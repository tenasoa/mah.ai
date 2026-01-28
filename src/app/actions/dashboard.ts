'use server';

import { createClient } from '@/lib/supabase/server';

export interface DashboardStats {
  exercises_count: number;
  rank: number;
  streak_days: number;
  grit_score: number;
  pending_requests_count: number;
}

/**
 * Fetches dynamic statistics for the user dashboard.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { exercises_count: 0, rank: 0, streak_days: 0, grit_score: 0, pending_requests_count: 0 };
  }

  try {
    // 1. Get profile data (streak and grit_score)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('streak_days, grit_score')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    // Default values if profile is missing
    const streakDays = profile?.streak_days || 0;
    const gritScore = profile?.grit_score || 0;

    // 2. Get exercises count (unique questions interacted with)
    const { data: exercises, error: exercisesError } = await supabase
      .from('socratic_exchanges')
      .select('question_id')
      .eq('user_id', user.id);

    if (exercisesError) throw exercisesError;

    // Use a Set to get unique question IDs
    const uniqueExercisesCount = new Set(exercises?.map(ex => ex.question_id)).size;

    // 3. Get pending subject requests count
    const { count: pendingRequests, error: requestsError } = await supabase
      .from('subject_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (requestsError) {
        console.error('Error fetching requests count:', requestsError);
    }

    // 4. Get rank
    // Rank = (number of people with higher grit_score) + 1
    const { count: higherScores, error: rankError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('grit_score', gritScore);

    if (rankError) throw rankError;

    return {
      exercises_count: uniqueExercisesCount,
      rank: (higherScores || 0) + 1,
      streak_days: streakDays,
      grit_score: gritScore,
      pending_requests_count: pendingRequests || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { exercises_count: 0, rank: 0, streak_days: 0, grit_score: 0, pending_requests_count: 0 };
  }
}
