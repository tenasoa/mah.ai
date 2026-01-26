// Temporairement désactivé - Pour réactiver l'auth sociale, décommentez ce fichier
/*
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Successfully authenticated
      return redirect(next);
    }
  }

  // Redirect to auth page with error
  return redirect(`${origin}/auth?error=auth_failed`);
}
*/

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Auth callback temporarily disabled" });
}
