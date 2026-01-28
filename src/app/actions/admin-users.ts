'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
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

export async function getAllUsers(search?: string, limit = 25) {
  const { supabase, isAdmin } = await checkAdmin();
  if (!isAdmin || !supabase) {
    console.error('getAllUsers: Access denied');
    return { data: [], total: 0, error: 'Accès refusé' };
  }

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' });

  if (search) {
    query = query.or(`pseudo.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  query = query.order('updated_at', { ascending: false });

  const { data, error, status, count } = await query.range(0, Math.max(0, limit - 1));
  
  if (error) {
    console.error('getAllUsers Full Error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      status
    });
  }
  
  return { data: (data as UserProfile[]) || [], total: count || 0, error: error?.message || null };
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

export async function adminUpdateUser(userId: string, data: Partial<UserProfile>) {
  const { isAdmin } = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Accès refusé' };

  // Use a special admin client with service_role to bypass RLS
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

export async function deleteUser(userId: string) {
  const { isAdmin } = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Accès refusé' };

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Delete from auth.users (via admin API)
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (authError) return { success: false, error: authError.message };

  revalidatePath('/admin/users');
  return { success: true };
}

export async function toggleBlockUser(userId: string, shouldBlock: boolean) {
  const { isAdmin } = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Accès refusé' };

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_blocked: shouldBlock, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}

export async function getUserProfile(userId: string) {
  const { supabase, isAdmin } = await checkAdmin();
  if (!isAdmin || !supabase) return { data: null, error: 'Accès refusé' };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data: (data as UserProfile) || null, error: error?.message || null };
}
