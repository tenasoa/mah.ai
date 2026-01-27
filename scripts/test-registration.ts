
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase keys in .env.local');
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRegistration() {
  console.log('🧪 Testing Normal User Registration Flow...');
  const timestamp = Date.now();
  const email = `test_user_${timestamp}@mah.ai`;
  const password = 'password123';
  const metadata = {
    pseudo: `Student_${timestamp}`,
    etablissement: 'Lycée Gallieni',
    classe: 'Terminale'
  };

  let userId: string | undefined;

  try {
    // 1. Simulate Signup via Anon Client (as a browser would)
    console.log(`📝 Signing up ${email}...`);
    const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (signUpError) throw signUpError;
    userId = signUpData.user?.id;
    console.log('✅ Signup successful. User ID:', userId);

    // 2. Wait a bit for the trigger to execute
    console.log('⏳ Waiting for profile trigger (2s)...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Check if profile was created correctly in public.profiles
    console.log('🔍 Checking public.profiles...');
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
        console.error('❌ Profile not found or error:', profileError.message);
        throw profileError;
    }

    console.log('📊 Profile Data Found:', {
        id: profile.id,
        pseudo: profile.pseudo,
        etablissement: profile.etablissement,
        classe: profile.classe,
        role: profile.role,
        roles: profile.roles,
        credits: profile.credits_balance
    });

    // Validations
    if (profile.pseudo !== metadata.pseudo) throw new Error('Pseudo mismatch');
    if (profile.etablissement !== metadata.etablissement) throw new Error('Etablissement mismatch');
    if (profile.classe !== metadata.classe) throw new Error('Classe mismatch');
    if (profile.credits_balance !== 0) throw new Error('Default credits should be 0');

    console.log('🎉 REGISTRATION FLOW TEST PASSED!');

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  } finally {
    if (userId) {
      try {
        console.log('🧹 Cleaning up test user...');
        await adminClient.auth.admin.deleteUser(userId);
        console.log('✅ Cleanup complete');
      } catch (e) {
        console.warn('⚠️ Cleanup failed (maybe user was not created):', e);
      }
    }
  }
}

testRegistration();
