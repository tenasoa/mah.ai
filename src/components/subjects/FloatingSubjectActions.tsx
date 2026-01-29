"use client";

import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Download,
  Lightbulb,
  Sparkles,
  Loader2,
  Star,
} from "lucide-react";

interface FloatingSubjectActionsProps {
  userCredits?: number;
  userSubscription?: string;
  onDownloadPDF: () => void;
  onOpenResolver: () => void;
  onOpenAIResponse: () => void;
  onOpenSocratic?: () => void;
  isLoading?: boolean;
  onFlashMessage?: (message: string, tone?: "success" | "error") => void;
}

export function FloatingSubjectActions({
  userCredits = 0,
  userSubscription = "free",
  onDownloadPDF,
  onOpenResolver,
  onOpenAIResponse,
  onOpenSocratic,
  isLoading = false,
  onFlashMessage,
}: FloatingSubjectActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const checkCredits = (requiredCredits: number) => {
    if (userSubscription === "premium") return true;
    return userCredits >= requiredCredits;
  };

  const handleOpenResolver = () => {
    if (checkCredits(5)) {
      onOpenResolver();
    } else {
      onFlashMessage?.(
        "Crédits insuffisants (5 requis). Rechargez votre compte.",
        "error",
      );
    }
  };

  const handleOpenAIResponse = () => {
    if (checkCredits(3)) {
      onOpenAIResponse();
    } else {
      onFlashMessage?.(
        "Crédits insuffisants. Rechargez votre compte pour accéder à cette fonctionnalité.",
        "error",
      );
    }
  };

  const handleOpenSocratic = () => {
    if (userSubscription === "premium") {
      onOpenSocratic?.();
    } else {
      onFlashMessage?.(
        "L'assistant Socratique est réservé exclusivement aux abonnés Premium.",
        "error",
      );
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-center gap-3">
      <div
        className={`flex flex-col gap-3 origin-bottom transition-all duration-400 ease-out ${
          isExpanded
            ? "opacity-100 translate-y-0 scale-100 max-h-[500px]"
            : "opacity-0 translate-y-10 scale-90 max-h-0 pointer-events-none"
        }`}
      >
        {/* Bouton Réponse IA */}
        <button
          onClick={handleOpenAIResponse}
          disabled={!checkCredits(3) || isLoading}
          className="w-40 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-4 py-3.5 rounded-2xl shadow-xl shadow-indigo-500/30 dark:shadow-indigo-900/50 hover:shadow-indigo-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group text-xs font-black uppercase tracking-wider"
          title={`${checkCredits(3) ? "3 crédits" : "Crédits insuffisants"} • Réponse IA détaillée`}
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <div className="absolute inset-0 bg-white/20 blur-lg animate-pulse" />
          </div>
          <span>Réponse IA</span>
        </button>

        {/* Bouton Résoudre */}
        <button
          onClick={handleOpenResolver}
          disabled={!checkCredits(5) || isLoading}
          className="w-40 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-4 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/30 dark:shadow-emerald-900/50 hover:shadow-emerald-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group text-xs font-black uppercase tracking-wider"
          title={`${checkCredits(5) ? "5 crédits" : "Crédits insuffisants"} • Résoudre le sujet`}
        >
          <div className="relative">
            <Lightbulb className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-white/20 blur-lg animate-pulse" />
          </div>
          <span>Résoudre</span>
        </button>

        {/* Bouton PDF */}
        <button
          onClick={onDownloadPDF}
          disabled={isLoading}
          className="w-40 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-500 dark:to-orange-500 hover:from-amber-700 hover:to-orange-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-4 py-3.5 rounded-2xl shadow-xl shadow-amber-500/30 dark:shadow-amber-900/50 hover:shadow-amber-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group text-xs font-black uppercase tracking-wider"
          title="Télécharger en PDF"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <div className="relative">
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-white/20 blur-lg animate-pulse" />
            </div>
          )}
          <span>PDF</span>
        </button>

        {/* Bouton Socratic IA - Réservé aux abonnés */}
        {onOpenSocratic && userSubscription === "premium" && (
          <button
            onClick={onOpenSocratic}
            disabled={isLoading}
            className="w-40 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-4 py-3.5 rounded-2xl shadow-xl shadow-blue-500/30 dark:shadow-blue-900/50 hover:shadow-blue-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group text-xs font-black uppercase tracking-wider"
            title="Assistant Socratique IA (Exclusif Abonnés)"
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-white/20 blur-lg animate-pulse" />
            </div>
            <span>Socratic</span>
          </button>
        )}

        {/* Message pour non-abonnés */}
        {onOpenSocratic && userSubscription !== "premium" && (
          <div className="w-40 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                <Star className="w-3 h-3" />
              </div>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Premium</span>
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 text-center leading-tight">
              L'assistant Socratique est réservé aux abonnés Premium
            </p>
            <button
              onClick={() => window.location.href = '/credits?tab=subs'}
              className="w-full mt-2 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-black uppercase rounded-xl transition-all"
            >
              S'abonner
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-2xl transition-all active:scale-95 text-xs font-black uppercase tracking-widest
          ${isExpanded 
            ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700" 
            : "bg-slate-900 dark:bg-amber-500 text-white shadow-xl shadow-slate-900/20 dark:shadow-amber-500/20"}
        `}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Masquer les actions" : "Afficher les actions"}
        title={isExpanded ? "Masquer les actions" : "Afficher les actions"}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronUp className="w-4 h-4" />
        )}
        <span>{isExpanded ? "Masquer" : "Actions"}</span>
      </button>
    </div>
  );
}
