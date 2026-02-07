"use client";

import { useMemo, useState } from "react";
import {
  X,
  Send,
  User,
  Bot,
  Loader2,
  CheckCircle2,
  Download,
  Upload,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MilkdownEditor } from "@/components/ui/MilkdownEditor";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import "katex/dist/katex.min.css";

interface SubjectResolverProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  subjectTitle: string;
  subjectContent: string;
  userSubscription: string;
}

type GradingItem = {
  label?: string;
  is_correct?: boolean;
  student_answer?: string;
  issue?: string;
  correction?: string;
  encouragement?: string;
};

type GradingResult = {
  score?: number;
  summary?: string;
  global_feedback?: string;
  items?: GradingItem[];
  conclusion?: string;
};

export function SubjectResolver({
  isOpen,
  onClose,
  subjectId,
  subjectTitle,
  subjectContent,
  userSubscription,
}: SubjectResolverProps) {
  const [answer, setAnswer] = useState("");
  const [correctionType, setCorrectionType] = useState<"human" | "ai">("ai");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const supabase = createClient();

  const canSubmit = Boolean(answer.trim() || answerFile);

  const fileLabel = useMemo(() => {
    if (!answerFile) return "Aucun fichier sélectionné";
    const kb = Math.max(1, Math.round(answerFile.size / 1024));
    return `${answerFile.name} • ${kb} Ko`;
  }, [answerFile]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (correctionType === "ai") {
        const formData = new FormData();
        formData.append("subjectId", subjectId);
        formData.append("subjectTitle", subjectTitle);
        formData.append("subjectContent", subjectContent);
        formData.append("typedAnswer", answer);
        if (answerFile) {
          formData.append("answerFile", answerFile);
        }

        const response = await fetch("/api/grade-submission", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(
            errorBody?.error || `Erreur (${response.status}) pendant la correction IA`,
          );
        }

        const payload = await response.json();
        setGradingResult(payload.result || null);
      } else {
        // Human correction
        let fileUrl = "";
        
        if (answerFile && user?.id) {
          const fileExt = answerFile.name.split(".").pop();
          const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from("submissions")
            .upload(fileName, answerFile);
            
          if (uploadError) {
             console.error("Upload error:", uploadError);
             // Verify if bucket exists or continue with just the name
             // For now we throw to alert the user
             throw new Error("Erreur lors de l'envoi du fichier. Veuillez réessayer.");
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from("submissions")
            .getPublicUrl(fileName);
            
          fileUrl = publicUrl;
        }

        const finalAnswer = answerFile 
          ? `[Fichier joint](${fileUrl || answerFile.name})\n\n${answer}` 
          : answer;

        await supabase.from("subject_submissions").insert({
          subject_id: subjectId,
          user_id: user?.id,
          answer: finalAnswer,
          correction_type: correctionType,
          status: "pending",
          created_at: new Date().toISOString(),
        });
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      alert(error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.");
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
      setIsDownloading(true);
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
        const message =
          errorBody?.error ||
          `Erreur (${response.status}) lors du téléchargement`;
        throw new Error(message);
      }

      const responseClone = response.clone();
      const blob = await response.blob();
      if (!blob.size) {
        const contentType = response.headers.get("content-type") || "inconnu";
        const text = await responseClone.text().catch(() => "");
        const details = text ? ` Détails: ${text.slice(0, 300)}` : "";
        throw new Error(
          `Le document généré est vide (Content-Type: ${contentType}).${details}`,
        );
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
        error instanceof Error
          ? error.message
          : "Erreur lors du téléchargement du document";
      alert(message);
    } finally {
      setIsDownloading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center pt-24 pb-8 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full p-6 animate-scale-in border border-slate-200 dark:border-slate-800 max-h-[82vh] overflow-y-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Réponse soumise !
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {correctionType === "ai"
                ? "Correction IA terminée. Voici votre résultat détaillé."
                : "Votre réponse a été envoyée pour correction humaine."}
            </p>
          </div>

          {gradingResult && correctionType === "ai" && (
            <div className="space-y-5 mb-6">
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-900/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Résultat global
                  </h4>
                  <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                    Score : {Number(gradingResult.score || 0)}/100
                  </span>
                </div>
                {gradingResult.summary && (
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-2">
                    {gradingResult.summary}
                  </p>
                )}
                {gradingResult.global_feedback && (
                  <div className="mt-3">
                    <MarkdownRenderer content={gradingResult.global_feedback} variant="minimal" />
                  </div>
                )}
              </div>

              {(gradingResult.items || []).map((item, index) => (
                <div
                  key={`${item.label || "item"}-${index}`}
                  className={`rounded-2xl p-4 border ${item.is_correct ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-900/20" : "border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-900/20"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h5 className="text-sm font-black text-slate-900 dark:text-white">
                      {item.label || `Question ${index + 1}`}
                    </h5>
                    {item.is_correct ? (
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                        Correct
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        À corriger
                      </span>
                    )}
                  </div>

                  {item.student_answer && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                      <span className="font-bold">Votre réponse :</span> {item.student_answer}
                    </p>
                  )}

                  {!item.is_correct && item.issue && (
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                      <span className="font-bold">Faute repérée :</span> {item.issue}
                    </p>
                  )}

                  {!item.is_correct && item.correction && (
                    <div className="mt-2 text-xs text-slate-700 dark:text-slate-200">
                      <span className="font-bold">Correction proposée :</span>
                      <div className="mt-1">
                        <MarkdownRenderer content={item.correction} variant="minimal" />
                      </div>
                    </div>
                  )}

                  {item.is_correct && item.encouragement && (
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2 font-semibold">
                      {item.encouragement}
                    </p>
                  )}
                </div>
              ))}

              {gradingResult.conclusion && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/60">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                    Conclusion
                  </h4>
                  <MarkdownRenderer content={gradingResult.conclusion} variant="minimal" />
                </div>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center pt-24 pb-8 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              Résoudre le sujet
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Soumettez votre réponse pour correction
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadWithAnswer}
              disabled={!answer.trim() || isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              PDF + Réponse
            </button>

            <div className="mr-4 text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
              {userSubscription === "premium" ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Inclus Premium
                </span>
              ) : (
                <span>5 crédits</span>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="inline-flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Soumission...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Soumettre
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
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
                  <div className="text-xs opacity-75">Détaillée et personnalisée</div>
                </div>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              📄 Sujet à résoudre
            </label>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <MilkdownEditor
                value={subjectContent}
                onChange={() => {}}
                readOnly
                className="min-h-full px-6 py-6"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Votre réponse
            </label>

            <div className="mb-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <Upload className="w-4 h-4" />
                Téléverser (image, PDF, Word, texte)
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt,.md,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(event) => setAnswerFile(event.target.files?.[0] || null)}
                />
              </label>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{fileLabel}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Ou éditez directement dans le champ ci-dessous.
              </p>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden min-h-[300px]">
              <MilkdownEditor
                value={answer}
                onChange={setAnswer}
                placeholder="Rédigez votre réponse ici... (Markdown et LaTeX supportés)"
                className="min-h-[300px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
