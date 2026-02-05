"use client";

import { useEffect, useState } from "react";
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
import "katex/dist/katex.min.css";
import { MilkdownEditor } from "@/components/ui/MilkdownEditor";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

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
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const supabase = createClient();

  // Fonction pour nettoyer et formater la réponse IA
  const cleanAndFormatResponse = (response: string): string => {
    let cleaned = response;

    // 1. Retirer l'indentation de 4 espaces qui crée des blocs de code implicites
    cleaned = cleaned.replace(/^(?: {4,}|\t+)/gm, "");

    // 2. Préserver les blocs de code existants (```...```) sans modification
    cleaned = cleaned.replace(/```(\w+)?\s*([\s\S]*?)\s*```/gi, (match, lang, content) => {
      return `\n\`\`\`${lang || ''}\n${content.trim()}\n\`\`\`\n`;
    });

    // 3. Convertir les blocs mathématiques Markdown ($$ ... $$) en formules display
    cleaned = cleaned.replace(/\$\$([\s\S]+?)\$\$/g, (match, content) => {
      // Nettoyer les caractères problématiques pour KaTeX
      const cleanContent = content.trim()
        .replace(/#/g, '\\#') // Échapper les #
        .replace(/&/g, '\\&') // Échapper les &
        .replace(/%/g, '\\%'); // Échapper les %
      return `\n\n$$${cleanContent}$$\n\n`;
    });

    // 4. Convertir les blocs LaTeX legacy (\[ ... \]) en formules display
    cleaned = cleaned.replace(/\\\[([\s\S]+?)\\\]/g, (match, content) => {
      const cleanContent = content.trim()
        .replace(/#/g, '\\#')
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%');
      return `\n\n$$${cleanContent}$$\n\n`;
    });

    // 5. Convertir les formules inline style \( ... \) en formules inline $...$
    cleaned = cleaned.replace(/\\\(([\s\S]+?)\\\)/g, (match, content) => {
      const cleanContent = content.trim()
        .replace(/#/g, '\\#')
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%');
      return `$${cleanContent}$`;
    });

    // 6. Nettoyer les sauts de ligne
    return cleaned
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  // Fonction pour formater le sujet
  const formatSubjectContent = (content: string): string => {
    return (
      content
        // Nettoyer simplement les dollars multiples
        .replace(/\$\$(\s*\$\$+)/g, '$$')
        .replace(/\$(\s*\$+)/g, '$')
        // Corriger seulement les erreurs OCR évidentes
        .replace(/\$\$\$(\w+\s*=\s*[^$\n]*?)\$/g, '$$$$1$$')
        .replace(/\$(\w+\s*=\s*[^$\n]*?\$[^$\n]*?)\$/g, '$$$$1$$')
        // Nettoyer les sauts de ligne
        .replace(/\n{3,}/g, "\n\n")
        .split("\n")
        .map((line) => line.trim())
        .join("\n")
        .trim()
    );
  };

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

  const generateResponse = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Vous devez être connecté pour utiliser cette fonctionnalité.");
      return;
    }

    const cost = responseType === "direct" ? 2 : 3;

    const initialEta = responseType === "direct" ? 12 : 20;
    setEtaSeconds(initialEta);
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
        const result = await deductCreditsClient(user.id, cost);
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
      setEtaSeconds(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!aiResponse) return;

    try {
      setIsDownloading(true);
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
      const suffix = responseType === "direct" ? "reponse_directe_IA" : "reponse_detaillee_IA";
      a.download = `${subjectTitle.replace(/[^a-z0-9]/gi, "_")}_${suffix}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur lors du téléchargement PDF:", error);
      const message =
        error instanceof Error ? error.message : "Erreur lors du téléchargement du document";
      alert(message);
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = () => {
    if (aiResponse) {
      navigator.clipboard.writeText(aiResponse);
      // Vous pourriez ajouter un toast ici
    }
  };

  const responseParts = aiResponse
    ? aiResponse.split(/\n{2,}---\n{2,}/).map(part => part.trim()).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center pt-24 pb-8 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full h-[95vh] overflow-hidden animate-scale-in flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Réponse IA</h2>
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
                    📄 Sujet d'origine :
                  </h4>
                  <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <MarkdownRenderer
                      content={formatSubjectContent(subjectContent)}
                      variant="light"
                      className="min-h-full px-2 py-2"
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
                      <span>Génération en cours</span>
                      {etaSeconds !== null && (
                        <span className="ml-1 text-white/90 font-medium">
                          — ~{etaSeconds}s
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <Bot className="w-5 h-5" />
                      Générer la réponse IA
                    </>
                  )}
                </button>
                <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  {userSubscription === "premium" ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Inclus dans votre abonnement Premium
                    </span>
                  ) : (
                    <span>{responseType === "direct" ? 2 : 3} crédits seront déduits de votre solde</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Réponse générée */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Réponse générée par l'IA
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
                          className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 ai-response"
                        >
                          <div className="mb-2 text-xs font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-300">
                            Partie {index + 1}/{responseParts.length}
                          </div>
                          <MilkdownEditor
                            value={part}
                            onChange={() => {}}
                            readOnly
                            className="min-h-full px-2 py-2"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 ai-response">
                        <MilkdownEditor
                          value={aiResponse || ""}
                          onChange={() => {}}
                          readOnly
                          className="min-h-full px-2 py-2"
                        />
                      </div>
                    )}
                  </div>
                </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>

  );
}
