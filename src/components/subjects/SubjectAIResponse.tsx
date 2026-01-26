"use client";

import { useState } from "react";
import {
  X,
  Bot,
  Loader2,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deductCreditsClient } from "@/lib/credits-client";
import React, { useEffect } from "react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import "katex/dist/katex.min.css";

interface SubjectAIResponseProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  subjectTitle: string;
  subjectContent: string;
  userCredits: number;
  userSubscription: string;
}

export function SubjectAIResponse({
  isOpen,
  onClose,
  subjectId,
  subjectTitle,
  subjectContent,
  userCredits,
  userSubscription,
}: SubjectAIResponseProps) {
  const [responseType, setResponseType] = useState<"direct" | "detailed">(
    "direct",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const supabase = createClient();

  // Fonction pour nettoyer et formater la réponse IA
  const cleanAndFormatResponse = (response: string): string => {
    return (
      response
        // Préserver les formules mathématiques KaTeX
        .replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
          return `$$${formula.trim()}$$`;
        })
        .replace(/\$([^$]+)\$/g, (match, formula) => {
          return `$${formula.trim()}$`;
        })
        // Nettoyer les sauts de ligne multiples
        .replace(/\n{3,}/g, "\n\n")
        // Nettoyer les espaces en début/fin de ligne
        .split("\n")
        .map((line) => line.trim())
        .join("\n")
        .trim()
    );
  };

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

  const generateResponse = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Vous devez être connecté pour utiliser cette fonctionnalité.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-ai-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectContent: subjectContent,
          responseType: responseType,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la génération de la réponse");
      }

      const data = await response.json();

      // Nettoyer et formater la réponse IA
      const cleanedResponse = cleanAndFormatResponse(data.response);
      setAiResponse(cleanedResponse);

      // Déduire les crédits si nécessaire
      if (userSubscription !== "premium" && user?.id) {
        const result = await deductCreditsClient(user.id, 10);
        if (!result.success) {
          throw new Error(
            result.error || "Erreur lors de la déduction des crédits",
          );
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue lors de la génération de la réponse.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!aiResponse) return;

    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectContent,
        subjectTitle,
        aiResponse,
        includeAIResponse: true,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${subjectTitle.replace(/[^a-z0-9]/gi, "_")}_reponse_IA.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const copyToClipboard = () => {
    if (aiResponse) {
      navigator.clipboard.writeText(aiResponse);
      // Vous pourriez ajouter un toast ici
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center pt-24 pb-8 px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[95vh] overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Réponse IA</h2>
            <p className="text-sm text-slate-500 mt-1">{subjectTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {!aiResponse ? (
            <>
              {/* Type de réponse */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Type de réponse souhaitée
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setResponseType("direct")}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      responseType === "direct"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Réponse directe</div>
                      <div className="text-xs opacity-75">
                        Solution concise et rapide
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setResponseType("detailed")}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      responseType === "detailed"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <Eye className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Réponse détaillée</div>
                      <div className="text-xs opacity-75">
                        Avec explications complètes
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Sujet */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Sujet à traiter
                </label>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-700 mb-2">
                    📄 Sujet d'origine :
                  </h4>
                  <div className="text-sm text-slate-600 leading-relaxed">
                    <MarkdownRenderer
                      content={formatSubjectContent(subjectContent)}
                      variant="minimal"
                    />
                  </div>
                </div>
              </div>

              {/* Bouton de génération */}
              <div className="text-center">
                <button
                  onClick={generateResponse}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Bot className="w-5 h-5" />
                      Générer la réponse IA
                    </>
                  )}
                </button>
                <div className="mt-3 text-sm text-slate-500">
                  {userSubscription === "premium" ? (
                    <span className="text-emerald-600 font-medium">
                      Inclus dans votre abonnement Premium
                    </span>
                  ) : (
                    <span>10 crédits seront déduits de votre solde</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Réponse générée */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Réponse générée par l'IA
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowExplanation(!showExplanation)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {showExplanation ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                      {showExplanation ? "Cacher" : "Montrer"} les explications
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Copier la réponse"
                    >
                      <Copy className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                  <MarkdownRenderer
                    content={aiResponse || ""}
                    variant="minimal"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">
                    Réponse générée avec succès
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setAiResponse(null);
                      setShowExplanation(false);
                    }}
                    className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    Nouvelle génération
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
