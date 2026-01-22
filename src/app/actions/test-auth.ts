'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function loginForTest() {
  const supabase = await createClient();

  // Sign in anonymously (requires anonymous sign-ins enabled in Supabase)
  // OR for now, sign up a fake random user if anon is disabled
  const email = `test-${Date.now()}@mah.ai`;
  const password = 'test-password-123';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Test Login Error:', error);
    return { error: error.message };
  }

  revalidatePath('/trust-test');
  return { success: true, user: data.user };
}
