'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Page de redirection /auth
 * Cette page redirige automatiquement vers la landing page avec ouverture de la modal d'authentification
 * La modal d'authentification est maintenant intégrée à la landing page
 */
export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la landing page avec paramètre pour ouvrir la modal
    router.replace('/?auth=open');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-500/20 mb-6 shadow-lg shadow-orange-500/10">
          <Loader2 className="w-8 h-8 text-amber-600 dark:text-amber-500 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Redirection en cours...
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Vous allez être redirigé vers la page de connexion
        </p>
      </div>
    </div>
  );
}
