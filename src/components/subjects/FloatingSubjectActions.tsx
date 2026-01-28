"use client";

import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Download,
  Lightbulb,
  Sparkles,
  Loader2,
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
        "Crédits insuffisants. Rechargez votre compte pour accéder à cette fonctionnalité.",
        "error",
      );
    }
  };

  const handleOpenAIResponse = () => {
    if (checkCredits(10)) {
      onOpenAIResponse();
    } else {
      onFlashMessage?.(
        "Crédits insuffisants. Rechargez votre compte pour accéder à cette fonctionnalité.",
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
          disabled={!checkCredits(10) || isLoading}
          className="w-40 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-4 py-3.5 rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group text-xs font-black uppercase tracking-wider"
          title={`${checkCredits(10) ? "10 crédits" : "Crédits insuffisants"} • Réponse IA`}
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
          className="w-40 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-4 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group text-xs font-black uppercase tracking-wider"
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
          className="w-40 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-4 py-3.5 rounded-2xl shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group text-xs font-black uppercase tracking-wider"
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

        {/* Bouton Socratic IA */}
        {onOpenSocratic && (
          <button
            onClick={onOpenSocratic}
            disabled={isLoading}
            className="w-40 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-4 py-3.5 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group text-xs font-black uppercase tracking-wider"
            title="Assistant Socratique IA"
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-white/20 blur-lg animate-pulse" />
            </div>
            <span>Socratic</span>
          </button>
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
