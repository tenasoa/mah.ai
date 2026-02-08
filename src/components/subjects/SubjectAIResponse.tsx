"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Bot,
  Loader2,
  Download,
  FileText,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import "katex/dist/katex.min.css";
import { MilkdownEditor } from "@/components/ui/MilkdownEditor";
import { useToast } from "@/components/ui/Toast";
import { processContent } from "@/lib/content-processor";
import { exportElementToPdf } from "@/lib/export-visible-pdf";

interface SubjectAIResponseProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  subjectTitle: string;
  subjectContent: string;
}

export function SubjectAIResponse({
  isOpen,
  onClose,
  subjectId,
  subjectTitle,
  subjectContent,
}: SubjectAIResponseProps) {
  const [responseType, setResponseType] = useState<"direct" | "detailed">(
    "direct",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const pdfSourceRef = useRef<HTMLDivElement>(null);
  const downloadInFlightRef = useRef(false);
  const supabase = useMemo(() => createClient(), []);

  // Récupérer l'utilisateur actuel
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  // Wrappers utilisant l'utilitaire partagé
  const cleanAndFormatResponse = (response: string) =>
    processContent(response, true);

  useEffect(() => {
    if (!isGenerating || etaSeconds === null) return;
    const timer = setInterval(() => {
      setEtaSeconds((prev) => {
        if (prev === null) return prev;
        return Math.max(0, prev - 1);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGenerating, etaSeconds]);

  if (!isOpen) return null;

  const responseParts = aiResponse
    ? aiResponse
        .split(/\n{2,}---\n{2,}/)
        .map((part) => part.trim())
        .filter(Boolean)
    : [];

  // Fonction pour générer la réponse IA
  const generateResponse = async () => {
    try {
      setIsGenerating(true);
      setEtaSeconds(null);

      // Simuler un temps d'attente pour l'ETA (optionnel)
      const simulatedEta = Math.floor(Math.random() * 5) + 3;
      setEtaSeconds(simulatedEta);

      // Vérifier que l'utilisateur est bien connecté
      if (!user?.id) {
        throw new Error("Utilisateur non connecté. Veuillez vous reconnecter.");
      }

      const response = await fetch("/api/generate-ai-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          subjectContent,
          responseType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Erreur ${response.status} lors de la génération`,
        );
      }

      const data = await response.json();

      // Nettoyer et formater la réponse IA
      const cleanedResponse = cleanAndFormatResponse(data.response);
      setAiResponse(cleanedResponse);

      // La déduction est faite côté serveur; on affiche uniquement l'information.
      const creditsUsed = Number(data.creditsUsed || 0);
      if (creditsUsed > 0) {
        const creditText = `${creditsUsed} crédit${creditsUsed > 1 ? "s" : ""}`;
        toast(`${creditText} ont été déduits de votre solde`, "info", 4000);
      }
    } catch (error) {
      console.error("Erreur:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la génération de la réponse.";
      alert(message);
    } finally {
      setIsGenerating(false);
      setEtaSeconds(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!aiResponse) return;
    if (downloadInFlightRef.current) return;

    let source: HTMLDivElement | null = null;
    let previousOverflow = "";
    let previousMaxHeight = "";
    let previousHeight = "";

    try {
      downloadInFlightRef.current = true;
      setIsDownloading(true);

      source = pdfSourceRef.current;
      if (!source) {
        throw new Error("Impossible de capturer la réponse affichée.");
      }

      previousOverflow = source.style.overflow;
      previousMaxHeight = source.style.maxHeight;
      previousHeight = source.style.height;

      source.style.overflow = "visible";
      source.style.maxHeight = "none";
      source.style.height = "auto";

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      const suffix =
        responseType === "direct"
          ? "reponse_directe_IA"
          : "reponse_detaillee_IA";
      await exportElementToPdf(
        source,
        `${subjectTitle.replace(/[^a-z0-9]/gi, "_")}_${suffix}.pdf`,
      );
    } catch (error) {
      console.error("Erreur lors du téléchargement PDF:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors du téléchargement du document";
      alert(message);
    } finally {
      if (source) {
        source.style.overflow = previousOverflow;
        source.style.maxHeight = previousMaxHeight;
        source.style.height = previousHeight;
      }
      downloadInFlightRef.current = false;
      setIsDownloading(false);
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full h-[95vh] overflow-hidden animate-scale-in flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Réponse IA
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {subjectTitle}
            </p>
          </div>

          {/* Boutons d'action - centrés */}
          {aiResponse && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAiResponse(null);
                  setShowExplanation(false);
                }}
                className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
              >
                Nouvelle génération
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Téléchargement...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                  </>
                )}
              </button>
            </div>
          )}

          {/* Bouton de génération - centré */}
          {!aiResponse && (
            <button
              onClick={generateResponse}
              disabled={isGenerating}
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Génération en cours</span>
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  Générer la réponse IA
                </>
              )}
            </button>
          )}

          {/* Bouton de fermeture - toujours visible */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {!aiResponse ? (
            <>
              {/* Type de réponse */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Type de réponse souhaitée
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setResponseType("direct")}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      responseType === "direct"
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Réponse directe</div>
                      <div className="text-xs opacity-75">
                        Solution concise et rapide (2 crédits)
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setResponseType("detailed")}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      responseType === "detailed"
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Eye className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Réponse détaillée</div>
                      <div className="text-xs opacity-75">
                        Avec explications complètes (3 crédits)
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Sujet */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Sujet à traiter
                </label>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    📄 Sujet d&apos;origine :
                  </h4>
                  <MilkdownEditor
                    value={subjectContent}
                    onChange={() => {}}
                    readOnly
                    className="min-h-full px-6 py-6"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Réponse générée */}
              <div ref={pdfSourceRef} className="mb-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Réponse générée par l&apos;IA
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowExplanation(!showExplanation)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-700 dark:text-slate-300"
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
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Copier la réponse"
                    >
                      <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {responseParts.length > 1 ? (
                    responseParts.map((part, index) => (
                      <div
                        key={index}
                        className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <div className="mb-2 text-xs font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-300">
                          Partie {index + 1}/{responseParts.length}
                        </div>
                        <MilkdownEditor
                          value={part}
                          onChange={() => {}}
                          readOnly
                          className="min-h-full px-6 py-6"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <MilkdownEditor
                        value={aiResponse || ""}
                        onChange={() => {}}
                        readOnly
                        className="min-h-full px-6 py-6"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
