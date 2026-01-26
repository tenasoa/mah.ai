"use client";

import { useState } from "react";
import { 
  Download, 
  FileText, 
  Bot, 
  User, 
  CreditCard, 
  Lock,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SubjectActionsProps {
  subjectId: string;
  subjectContent: string;
  subjectTitle: string;
  userCredits?: number;
  userSubscription?: string;
  onDownloadPDF: () => void;
  onOpenResolver: () => void;
  onOpenAIResponse: () => void;
}

export function SubjectActions({ 
  subjectId, 
  subjectContent, 
  subjectTitle,
  userCredits = 0,
  userSubscription = "free",
  onDownloadPDF,
  onOpenResolver,
  onOpenAIResponse
}: SubjectActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  const checkCredits = (requiredCredits: number) => {
    if (userSubscription === "premium") return true;
    return userCredits >= requiredCredits;
  };

  const getCreditMessage = (requiredCredits: number) => {
    if (userSubscription === "premium") return "Inclus avec votre abonnement Premium";
    if (userCredits >= requiredCredits) return `${requiredCredits} crédits seront déduits`;
    return `Crédits insuffisants (${requiredCredits} requis)`;
  };

  const handleDownloadPDF = async () => {
    setLoading('pdf');
    try {
      await onDownloadPDF();
    } finally {
      setLoading(null);
    }
  };

  const handleOpenResolver = () => {
    if (checkCredits(5)) {
      onOpenResolver();
    } else {
      // Show credit insufficient message
      alert("Crédits insuffisants. Rechargez votre compte pour accéder à cette fonctionnalité.");
    }
  };

  const handleOpenAIResponse = () => {
    if (checkCredits(10)) {
      onOpenAIResponse();
    } else {
      alert("Crédits insuffisants. Rechargez votre compte pour accéder à cette fonctionnalité.");
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {/* Bouton Téléchargement PDF */}
      <button
        onClick={handleDownloadPDF}
        disabled={loading === 'pdf'}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        title="Télécharger le sujet en PDF"
      >
        {loading === 'pdf' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
        )}
        <span>PDF</span>
      </button>

      {/* Bouton Résolution */}
      <button
        onClick={handleOpenResolver}
        disabled={!checkCredits(5)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group relative"
        title={`${getCreditMessage(5)} • Résolvez le sujet directement`}
      >
        <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>Résoudre</span>
        {userSubscription !== "premium" && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            5
          </span>
        )}
        {!checkCredits(5) && (
          <Lock className="w-3 h-3 ml-1 text-amber-600" />
        )}
      </button>

      {/* Bouton Réponse IA */}
      <button
        onClick={handleOpenAIResponse}
        disabled={!checkCredits(10)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 text-indigo-700 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group relative"
        title={`${getCreditMessage(10)} • Obtenez la réponse complète de l'IA`}
      >
        <Bot className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>Réponse IA</span>
        {userSubscription !== "premium" && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            10
          </span>
        )}
        {!checkCredits(10) && (
          <Lock className="w-3 h-3 ml-1 text-amber-600" />
        )}
      </button>

      {/* Indicateur de crédits/abonnement */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm">
        {userSubscription === "premium" ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="font-medium text-emerald-700">Premium</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-slate-700">{userCredits} crédits</span>
          </>
        )}
      </div>
    </div>
  );
}
