'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isAdmin: false };

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  const roles = (profile?.roles as string[]) || [];
  return { supabase, isAdmin: roles.includes('admin') || roles.includes('superadmin') };
}

export async function getAllSettings() {
  const { supabase, isAdmin } = await checkAdmin();
  if (!isAdmin || !supabase) return { data: [], error: 'Accès refusé' };

  const { data, error } = await supabase
    .from('site_settings')
    .select('*');

  return { data: data || [], error: error?.message || null };
}

export async function updateSetting(key: string, value: unknown) {
  const { supabase, isAdmin } = await checkAdmin();
  if (!isAdmin || !supabase) return { success: false, error: 'Accès refusé' };

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('site_settings')
    .upsert({ 
      key, 
      value, 
      updated_at: new Date().toISOString(),
      updated_by: user?.id 
    });

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/settings');
  revalidatePath('/credits'); // Most settings affect pricing
  return { success: true };
}
