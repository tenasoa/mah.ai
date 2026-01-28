'use server';

import { createClient } from '@/lib/supabase/server';

export interface DashboardStats {
  exercises_count: number;
  rank: number;
  streak_days: number;
  grit_score: number;
  pending_requests_count: number;
  // Contributor stats
  my_subjects_count?: number;
  my_subjects_views?: number;
  my_subjects_pending?: number;
  // Admin stats
  total_users_count?: number;
  total_subjects_pending?: number;
  total_requests_pending?: number;
  // Financial stats
  balance?: number;
  total_earnings?: number;
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
    // 1. Get profile data (streak, grit_score, roles, balance)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('streak_days, grit_score, roles, credits_balance')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    const roles = (profile?.roles as string[]) || [];
    const isAdmin = roles.includes('admin') || roles.includes('superadmin');
    const isContributor = roles.includes('contributor');
    const isValidator = roles.includes('validator');

    // Default values if profile is missing
    const streakDays = profile?.streak_days || 0;
    const gritScore = profile?.grit_score || 0;
    const balance = profile?.credits_balance || 0;

    // 2. Get exercises count (unique questions interacted with)
    const { data: exercises, error: exercisesError } = await supabase
      .from('socratic_exchanges')
      .select('question_id')
      .eq('user_id', user.id);

    if (exercisesError) throw exercisesError;
    const uniqueExercisesCount = new Set(exercises?.map(ex => ex.question_id)).size;

    // 3. Get pending subject requests count
    const { count: pendingRequests, error: requestsError } = await supabase
      .from('subject_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'pending');

    // 4. Get rank
    const { count: higherScores, error: rankError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('grit_score', gritScore);

    const stats: DashboardStats = {
      exercises_count: uniqueExercisesCount,
      rank: (higherScores || 0) + 1,
      streak_days: streakDays,
      grit_score: gritScore,
      pending_requests_count: pendingRequests || 0,
      balance
    };

    // 5. Add Contributor / Validator stats if applicable
    if (isContributor || isValidator || isAdmin) {
      const [{ data: mySubjects }, { data: earnings }] = await Promise.all([
        supabase.from('subjects').select('view_count, status').eq('uploaded_by', user.id),
        supabase.from('earnings').select('amount').eq('user_id', user.id)
      ]);
      
      if (mySubjects) {
        stats.my_subjects_count = mySubjects.length;
        stats.my_subjects_views = mySubjects.reduce((acc, s) => acc + (s.view_count || 0), 0);
        stats.my_subjects_pending = mySubjects.filter(s => s.status === 'pending').length;
      }

      if (earnings) {
        stats.total_earnings = earnings.reduce((acc, e) => acc + (e.amount || 0), 0);
      }
    }

    // 6. Add Admin stats if applicable
    if (isAdmin) {
      const [{ count: totalUsers }, { count: totalPendingSubjects }, { count: totalPendingRequests }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('subject_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      stats.total_users_count = totalUsers || 0;
      stats.total_subjects_pending = totalPendingSubjects || 0;
      stats.total_requests_pending = totalPendingRequests || 0;
    }

    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { exercises_count: 0, rank: 0, streak_days: 0, grit_score: 0, pending_requests_count: 0 };
  }
}
