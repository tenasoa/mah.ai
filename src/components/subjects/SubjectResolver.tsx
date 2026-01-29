"use client";

import { useState } from "react";
import {
  X,
  Save,
  Send,
  User,
  Bot,
  Loader2,
  CheckCircle2,
  FileText,
  Download,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deductCreditsClient } from "@/lib/credits-client";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import "katex/dist/katex.min.css";

interface SubjectResolverProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  subjectTitle: string;
  subjectContent: string;
  userCredits: number;
  userSubscription: string;
}

export function SubjectResolver({
  isOpen,
  onClose,
  subjectId,
  subjectTitle,
  subjectContent,
  userCredits,
  userSubscription,
}: SubjectResolverProps) {
  const [answer, setAnswer] = useState("");
  const [correctionType, setCorrectionType] = useState<"human" | "ai">("ai");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  // Fonction pour formater le sujet
  const formatSubjectContent = (content: string): string => {
    return (
      content
        // Préserver les formules mathématiques KaTeX
        .replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
          return `$$${formula.trim()}$$`;
        })
        .replace(/\$([^$]+)\$/g, (match, formula) => {
          return `$${formula.trim()}$`;
        })
        // Nettoyer les sauts de ligne
        .replace(/\n{3,}/g, "\n\n")
        .split("\n")
        .map((line) => line.trim())
        .join("\n")
        .trim()
    );
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setIsSubmitting(true);
    try {
      // Sauvegarder la réponse de l'utilisateur
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from("subject_submissions").insert({
        subject_id: subjectId,
        user_id: user?.id,
        answer: answer,
        correction_type: correctionType,
        status: "pending",
        created_at: new Date().toISOString(),
      });

      // Déduire les crédits si nécessaire
      if (userSubscription !== "premium" && user?.id) {
        const result = await deductCreditsClient(user.id, 5);
        if (!result.success) {
          throw new Error(
            result.error || "Erreur lors de la déduction des crédits",
          );
        }
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadWithAnswer = async () => {
    if (!answer.trim()) {
      alert("Votre réponse est vide.");
      return;
    }

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectContent,
          subjectTitle,
          userAnswer: answer,
          includeAnswer: true,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message = errorBody?.error || `Erreur (${response.status}) lors du téléchargement`;
        throw new Error(message);
      }

      const responseClone = response.clone();
      const blob = await response.blob();
      if (!blob.size) {
        const contentType = response.headers.get("content-type") || "inconnu";
        const text = await responseClone.text().catch(() => "");
        const details = text ? ` Détails: ${text.slice(0, 300)}` : "";
        throw new Error(`Le document généré est vide (Content-Type: ${contentType}).${details}`);
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${subjectTitle.replace(/[^a-z0-9]/gi, "_")}_reponse.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur lors du téléchargement PDF:", error);
      const message =
        error instanceof Error ? error.message : "Erreur lors du téléchargement du document";
      alert(message);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center pt-24 pb-8 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 animate-scale-in border border-slate-200 dark:border-slate-800">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Réponse soumise !
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Votre réponse a été enregistrée et sera{" "}
              {correctionType === "ai"
                ? "corrigée par l'IA"
                : "examinée par un correcteur humain"}
              .
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadWithAnswer}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Télécharger avec réponse
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white font-medium transition-colors rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center pt-24 pb-8 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full h-[95vh] overflow-hidden animate-scale-in flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Résoudre le sujet
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subjectTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Type de correction */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Type de correction souhaitée
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCorrectionType("ai")}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  correctionType === "ai"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Bot className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Correction IA</div>
                  <div className="text-xs opacity-75">Rapide et immédiate</div>
                </div>
              </button>
              <button
                onClick={() => setCorrectionType("human")}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  correctionType === "human"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"
                }`}
              >
                <User className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Correction humaine</div>
                  <div className="text-xs opacity-75">
                    Detailée et personnalisée
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Sujet */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              📄 Sujet à résoudre
            </label>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <MarkdownRenderer
                  content={formatSubjectContent(subjectContent)}
                  variant="minimal"
                />
              </div>
            </div>
          </div>

          {/* Zone de réponse */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Votre réponse
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Rédigez votre réponse ici..."
              className="w-full h-64 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {userSubscription === "premium" ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Inclus dans votre abonnement Premium
                </span>
              ) : (
                <span>5 crédits seront déduits de votre solde</span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!answer.trim() || isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Soumission...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Soumettre la réponse
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
