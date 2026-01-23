"use client";

import { useEffect, useState } from "react";
import { Portal } from "@/components/ui/portal";
import { X, Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { unlockSubject } from "@/app/actions/credits";
import { useRouter } from "next/navigation";

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  subjectTitle: string;
  creditCost: number;
  currentBalance: number;
}

export function UnlockModal({
  isOpen,
  onClose,
  subjectId,
  subjectTitle,
  creditCost,
  currentBalance,
}: UnlockModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleUnlock = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await unlockSubject(subjectId, creditCost);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
            onClose();
            router.refresh(); // Refresh page to show unlocked content
        }, 1500);
      } else {
        setError(result.error || "Erreur lors du déblocage.");
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const canAfford = currentBalance >= creditCost;

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Débloquer le sujet</h3>
            <button 
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {success ? (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Sujet débloqué !</h4>
                    <p className="text-slate-500">Accès immédiat autorisé.</p>
                </div>
            ) : (
                <>
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg mb-1">{subjectTitle}</h4>
                            <p className="text-sm text-slate-500">
                                Ce sujet coûte <span className="font-bold text-amber-600">{creditCost} crédits</span>.
                                Une fois débloqué, vous y aurez accès de façon illimitée.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-slate-500">Votre solde actuel</span>
                            <span className="font-mono font-bold text-slate-900">{currentBalance}</span>
                        </div>
                         <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-slate-500">Coût du déblocage</span>
                            <span className="font-mono font-bold text-red-600">-{creditCost}</span>
                        </div>
                        <div className="h-px bg-slate-200 my-2" />
                         <div className="flex justify-between items-center font-bold">
                            <span className="text-slate-700">Solde après achat</span>
                            <span className={`font-mono ${canAfford ? "text-emerald-600" : "text-red-600"}`}>
                                {currentBalance - creditCost}
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleUnlock}
                            disabled={!canAfford || loading}
                            className={`
                                w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all
                                flex items-center justify-center gap-2
                                ${canAfford 
                                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 hover:-translate-y-0.5" 
                                    : "bg-slate-300 cursor-not-allowed"}
                            `}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Traitement...
                                </>
                            ) : canAfford ? (
                                "Confirmer le déblocage"
                            ) : (
                                "Crédits insuffisants"
                            )}
                        </button>
                        
                        {!canAfford && (
                            <button className="w-full py-3 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                                Recharger mes crédits
                            </button>
                        )}
                    </div>
                </>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
