'use client';

import { useState } from 'react';
import { useTrustStore } from '@/stores/use-trust-store';
import { submitTrustPayment } from '@/app/actions/payment';
import { Loader2, CheckCircle, Lock } from 'lucide-react';
import { clsx } from 'clsx';

export function TrustPaymentForm() {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { trustStatus, unlockTrust } = useTrustStore();
  const isTrusted = trustStatus === 'trusted';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code.length < 5) {
      setError('Le code doit contenir au moins 5 caractères.');
      return;
    }

    setIsSubmitting(true);

    // 1. Optimistic Update: Unlock immediately!
    unlockTrust(code);

    // 2. Background Sync
    try {
      const result = await submitTrustPayment(code);
      
      if (result.error) {
        // Note: In a strict system, we might revoke trust here.
        // But for "Trust First", we might just log it or show a warning 
        // while keeping access open for a grace period.
        console.error('Background sync failed:', result.error);
        // For this MVP, we show the error but don't re-lock immediately to avoid jarring UX
        setError(result.error); 
      }
    } catch (err) {
      console.error('Network error during sync', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isTrusted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center mb-3">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-emerald-900 mb-2">
          Accès Débloqué !
        </h3>
        <p className="text-sm text-emerald-700">
          Profitez de votre session de révision "Sérénité".<br/>
          Votre paiement est en cours de validation.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Lock className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">
            Débloquer ce sujet
          </h3>
          <p className="text-xs text-slate-500">
            Accès immédiat "Confiance"
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ref-code" className="block text-sm font-medium text-slate-700 mb-1">
            Code de référence (Mobile Money)
          </label>
          <input
            id="ref-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ex: MVOLA-12345"
            className={clsx(
              "w-full px-4 py-2 rounded-lg border bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
              error ? "border-red-500 focus:ring-red-500" : "border-slate-300"
            )}
          />
          {error && (
            <p className="mt-1 text-xs text-red-500 animate-in slide-in-from-top-1">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || code.length < 3}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Validation...
            </>
          ) : (
            "Activer l'accès immédiat"
          )}
        </button>
        
        <p className="text-xs text-center text-slate-400">
          En cliquant, vous certifiez avoir effectué le paiement.
        </p>
      </form>
    </div>
  );
}
