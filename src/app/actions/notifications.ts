'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'grit';
  link: string | null;
  is_read: boolean;
  created_at: string;
}

/**
 * Fetches the user's notifications.
 */
export async function getNotifications(): Promise<Notification[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
}

/**
 * Marks a notification as read.
 */
export async function markNotificationAsRead(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (!error) {
    revalidatePath('/dashboard');
  }
}

/**
 * Deletes a notification.
 */
export async function deleteNotification(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (!error) {
    revalidatePath('/dashboard');
  }
}
