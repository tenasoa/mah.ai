import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function getSafeNextPath(value: string | null) {
  if (!value) return '/dashboard';
  if (!value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = getSafeNextPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Successfully authenticated, redirect to next or dashboard
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to auth page with error
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
}
