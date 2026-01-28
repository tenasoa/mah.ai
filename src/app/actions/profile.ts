'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { UserRole } from '@/lib/types/user';

interface UpdateProfileParams {
  pseudo?: string;
  full_name?: string;
  bio?: string;
  education_level?: string;
  filiere?: string;
  etablissement?: string;
  classe?: string;
  birth_date?: string;
  address?: string;
  country?: string;
  learning_goals?: string[];
  interests?: string[];
  avatar_url?: string;
  cover_url?: string;
  privacy_settings?: any;
}

export async function getMyProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'auth_required' };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (data) {
    // Inject email from auth user
    data.email = user.email;
  }

  return { data, error };
}

export async function updateProfile(params: UpdateProfileParams) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'auth_required' };

  const { error } = await supabase
    .from('profiles')
    .update({
      ...params,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/profile');
  return { success: true };
}

export async function getMyEarnings(limit = 10) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], total: 0, error: 'auth_required' };

  const { data, error, count } = await supabase
    .from('earnings')
    .select('*, subjects(title), subject_corrections(subject_id)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(0, Math.max(0, limit - 1));

  return { data: data || [], total: count || 0, error };
}

export async function getPurchaseHistory(limit = 10) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], total: 0, error: 'auth_required' };

  const { data, error, count } = await supabase
    .from('credit_purchases')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(0, Math.max(0, limit - 1));

  return { data: data || [], total: count || 0, error };
}

/**
 * Uploads an avatar image to Supabase Storage
 */
export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'auth_required' };

  const file = formData.get('file') as File;
  if (!file) return { data: null, error: 'no_file' };

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('profiles')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return { data: null, error: uploadError.message };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('profiles')
    .getPublicUrl(filePath);

  // Update profile with new avatar URL
  await updateProfile({ avatar_url: publicUrl });

  return { data: publicUrl, error: null };
}
