"use client";

import { Download, Bot, Lightbulb, Sparkles, Loader2 } from "lucide-react";

interface FloatingSubjectActionsProps {
  userCredits?: number;
  userSubscription?: string;
  onDownloadPDF: () => void;
  onOpenResolver: () => void;
  onOpenAIResponse: () => void;
  onOpenSocratic?: () => void;
  isLoading?: boolean;
}

export function FloatingSubjectActions({
  userCredits = 0,
  userSubscription = "free",
  onDownloadPDF,
  onOpenResolver,
  onOpenAIResponse,
  onOpenSocratic,
  isLoading = false,
}: FloatingSubjectActionsProps) {
  const checkCredits = (requiredCredits: number) => {
    if (userSubscription === "premium") return true;
    return userCredits >= requiredCredits;
  };

  const handleOpenResolver = () => {
    if (checkCredits(5)) {
      onOpenResolver();
    } else {
      alert(
        "Crédits insuffisants. Rechargez votre compte pour accéder à cette fonctionnalité.",
      );
    }
  };

  const handleOpenAIResponse = () => {
    if (checkCredits(10)) {
      onOpenAIResponse();
    } else {
      alert(
        "Crédits insuffisants. Rechargez votre compte pour accéder à cette fonctionnalité.",
      );
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-20 flex flex-col gap-2">
      {/* Bouton Réponse IA */}
      <button
        onClick={handleOpenAIResponse}
        disabled={!checkCredits(10) || isLoading}
        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-4 py-3 rounded-2xl shadow-lg shadow-indigo-500/40 hover:shadow-indigo-600/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group text-xs font-bold"
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
        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-4 py-3 rounded-2xl shadow-lg shadow-emerald-500/40 hover:shadow-emerald-600/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group text-xs font-bold"
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
        className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-4 py-3 rounded-2xl shadow-lg shadow-amber-500/40 hover:shadow-amber-600/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group text-xs font-bold"
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
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-4 py-3 rounded-2xl shadow-lg shadow-blue-500/40 hover:shadow-blue-600/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group text-xs font-bold"
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
  );
}
