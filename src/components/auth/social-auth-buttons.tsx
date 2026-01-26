'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface SocialAuthButtonProps {
  provider: 'google';
  isLoading: boolean;
  onClick: () => void;
}

function SocialAuthButton({ provider, isLoading, onClick }: SocialAuthButtonProps) {
  const config = {
    google: {
      name: 'Google',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
      bgColor: 'bg-white',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-300',
      hoverBg: 'hover:bg-slate-50',
    },
  };

  const { name, icon, bgColor, textColor, borderColor, hoverBg } = config[provider];

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`w-full py-3.5 rounded-xl ${bgColor} ${textColor} font-semibold border ${borderColor} transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed ${hoverBg} hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Connexion en cours...</span>
        </>
      ) : (
        <>
          {icon}
          <span>Continuer avec {name}</span>
        </>
      )}
    </button>
  );
}

interface SocialAuthButtonsProps {
  isLoading: boolean;
  onError: (error: string | null) => void;
}

export function SocialAuthButtons({ isLoading, onError }: SocialAuthButtonsProps) {
  const [providerLoading, setProviderLoading] = useState<'google' | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSocialAuth = async (provider: 'google') => {
    setProviderLoading(provider);
    onError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      const errorMessages: Record<string, string> = {
        'OAuth login failed': 'La connexion avec Google a échoué',
        'Provider not enabled': 'Le fournisseur Google n\'est pas configuré',
      };
      const errorMessage = errorMessages[err.message as string] || 'Une erreur est survenue lors de la connexion avec Google';
      onError(errorMessage);
      setProviderLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <SocialAuthButton
        provider="google"
        isLoading={providerLoading === 'google' || isLoading}
        onClick={() => handleSocialAuth('google')}
      />
    </div>
  );
}
