'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { UserProfile, UserRole } from '@/lib/types/user';

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isAdmin: false };

  // Check roles in app_metadata first (set by our trigger)
  const roles = (user.app_metadata?.roles as string[]) || [];
  
  if (roles.includes('admin') || roles.includes('superadmin')) {
    return { supabase, isAdmin: true, currentUserId: user.id };
  }

  // Fallback to DB check if metadata not synced yet
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  const dbRoles = (profile?.roles as string[]) || [];
  return { 
    supabase, 
    isAdmin: dbRoles.includes('admin') || dbRoles.includes('superadmin'),
    currentUserId: user.id 
  };
}

export async function getAllUsers(search?: string) {
  const { supabase, isAdmin } = await checkAdmin();
  if (!isAdmin || !supabase) {
    console.error('getAllUsers: Access denied');
    return { data: [], error: 'Accès refusé' };
  }

  let query = supabase
    .from('profiles')
    .select('*');

  if (search) {
    query = query.or(`pseudo.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  query = query.order('updated_at', { ascending: false });

  const { data, error, status } = await query;
  
  if (error) {
    console.error('getAllUsers Full Error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      status
    });
  }
  
  return { data: (data as UserProfile[]) || [], error: error?.message || null };
}

export async function updateUserRoles(userId: string, roles: UserRole[]) {
  const { supabase, isAdmin } = await checkAdmin();
  if (!isAdmin || !supabase) return { success: false, error: 'Accès refusé' };

  const { error } = await supabase
    .from('profiles')
    .update({ roles, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateUserCredits(userId: string, amount: number) {
  const { supabase, isAdmin } = await checkAdmin();
  if (!isAdmin || !supabase) return { success: false, error: 'Accès refusé' };

  const { error } = await supabase
    .from('profiles')
    .update({ credits_balance: amount, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}
