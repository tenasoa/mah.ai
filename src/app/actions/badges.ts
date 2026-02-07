'use server';

import { createClient } from '@/lib/supabase/server';

interface BadgeMeta {
  name: string;
  description: string;
}

async function createBadgeNotification(userId: string, badge: BadgeMeta | null) {
  if (!badge) return;

  const supabase = await createClient();
  const message = `Nouveau badge débloqué: ${badge.name}. ${badge.description}`;

  await supabase.from('notifications').insert({
    user_id: userId,
    title: 'Badge débloqué',
    content: message,
    type: 'success',
    metadata: {
      badge_name: badge.name,
    },
  });
}

export async function tryAwardBadge(userId: string, badgeId: string): Promise<boolean> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc('check_and_award_badge', {
      p_user_id: userId,
      p_badge_id: badgeId,
    });

    if (error) {
      console.warn(`Badge award failed (${badgeId}):`, error.message);
      return false;
    }

    const awarded = Boolean(data);
    if (!awarded) return false;

    const { data: badge } = await supabase
      .from('badges')
      .select('name, description')
      .eq('id', badgeId)
      .maybeSingle();

    await createBadgeNotification(userId, badge);
    return true;
  } catch (error) {
    console.warn(`Badge award exception (${badgeId}):`, error);
    return false;
  }
}

export async function awardContributionMilestones(userId: string) {
  const supabase = await createClient();

  try {
    await tryAwardBadge(userId, 'pioneer');

    const { count } = await supabase
      .from('subjects')
      .select('id', { head: true, count: 'exact' })
      .eq('uploaded_by', userId);

    if ((count || 0) >= 10) {
      await tryAwardBadge(userId, 'grand_professeur');
    }
  } catch (error) {
    console.warn('Contribution badge check failed:', error);
  }
}
