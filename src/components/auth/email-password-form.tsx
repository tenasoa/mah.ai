'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight, UserPlus, LogIn, School, User, GraduationCap } from 'lucide-react';
// import { SocialAuthButtons } from './social-auth-buttons'; // Temporairement désactivé

export function EmailPasswordForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [etablissement, setEtablissement] = useState('');
  const [classe, setClasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const isLoading = loading || isPending;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              pseudo,
              etablissement,
              classe,
            }
          }
        });
        if (signUpError) throw signUpError;
        setMessage('🎉 Vérifiez votre email pour confirmer votre inscription.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        startTransition(() => {
          const next = searchParams.get('next') || '/dashboard';
          router.push(next);
        });
      }
    } catch (err: any) {
      // Translate common error messages
      const errorMessages: Record<string, string> = {
        'Invalid login credentials': 'Email ou mot de passe incorrect',
        'Email not confirmed': 'Veuillez confirmer votre email',
        'User already registered': 'Cet email est déjà utilisé',
        'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
      };
      setError(errorMessages[err.message] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-start gap-3 animate-slide-down">
          <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-red-500 text-xs">!</span>
          </div>
          <p>{error}</p>
        </div>
      )}

      {/* Success Message */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm flex items-start gap-3 animate-slide-down">
          <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-emerald-500 text-xs">✓</span>
          </div>
          <p>{message}</p>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {/* Additional Signup Fields */}
        {isSignUp && (
          <div className="space-y-4 animate-slide-down">
            <div className="space-y-2">
              <label htmlFor="pseudo" className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Pseudo
              </label>
              <input
                id="pseudo"
                type="text"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 hover:border-slate-300 dark:hover:border-slate-600"
                placeholder="Ton surnom"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="etablissement" className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <School className="w-3.5 h-3.5" />
                  Établissement
                </label>
                <input
                  id="etablissement"
                  type="text"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 hover:border-slate-300 dark:hover:border-slate-600"
                  placeholder="Ex: CNTEMAD..."
                  value={etablissement}
                  onChange={(e) => setEtablissement(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="classe" className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Classe
                </label>
                <select
                  id="classe"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 hover:border-slate-300 dark:hover:border-slate-600 appearance-none"
                  value={classe}
                  onChange={(e) => setClasse(e.target.value)}
                  required
                  disabled={isLoading}
                >
                  <option value="" disabled className="bg-white dark:bg-slate-900">Sélectionner</option>
                  <option value="Seconde" className="bg-white dark:bg-slate-900">Seconde</option>
                  <option value="Première" className="bg-white dark:bg-slate-900">Première</option>
                  <option value="Terminale" className="bg-white dark:bg-slate-900">Terminale</option>
                  <option value="L1" className="bg-white dark:bg-slate-900">L1</option>
                  <option value="L2" className="bg-white dark:bg-slate-900">L2</option>
                  <option value="L3" className="bg-white dark:bg-slate-900">L3</option>
                  <option value="M1" className="bg-white dark:bg-slate-900">M1</option>
                  <option value="M2" className="bg-white dark:bg-slate-900">M2</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" />
            Adresse Email
          </label>
          <div className="relative group">
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 hover:border-slate-300 dark:hover:border-slate-600"
              placeholder="ton.email@exemple.mg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              Mot de passe
            </label>
            {!isSignUp && (
              <button
                type="button"
                className="text-xs text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium transition-colors"
              >
                Mot de passe oublié ?
              </button>
            )}
          </div>
          <div className="relative group">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="w-full px-4 py-3.5 pr-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 hover:border-slate-300 dark:hover:border-slate-600"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{isSignUp ? 'Création...' : 'Connexion...'}</span>
            </>
          ) : (
            <>
              {isSignUp ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>S'inscrire</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Se connecter</span>
                </>
              )}
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </>
          )}
        </button>
      </form>

      {/* Toggle Auth Mode */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white dark:bg-slate-900 px-4 text-sm text-slate-400">ou</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setIsSignUp(!isSignUp);
          setError(null);
          setMessage(null);
        }}
        disabled={isLoading}
        className="w-full py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSignUp ? (
          <>
            <LogIn className="w-5 h-5" />
            <span>J'ai déjà un compte</span>
          </>
        ) : (
          <>
            <UserPlus className="w-5 h-5" />
            <span>Créer un compte gratuitement</span>
          </>
        )}
      </button>
    </div>
  );
}
