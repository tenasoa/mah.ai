"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Save,
  Copy,
  BookOpen,
  Layout,
  Columns,
  Maximize2,
  Minimize2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import {
  listSubjectQuestions,
} from "@/app/actions/reader";
import {
  saveSubjectMarkdown,
  updateSubjectStatus,
  duplicateSubject,
} from "@/app/actions/subjects";
import { addGritPoints } from "@/app/actions/grit";
import { SocraticModal } from "./SocraticModal";
import { FloatingSubjectActions } from "./FloatingSubjectActions";
import { SubjectResolver } from "./SubjectResolver";
import { SubjectAIResponse } from "./SubjectAIResponse";
import { MilkdownEditor } from "@/components/ui/MilkdownEditor";
import { getUserCreditsAndSubscriptionClient } from "@/lib/credits-client";
import { createClient } from "@/lib/supabase/client";
import { SubjectStatus } from "@/lib/types/subject";
import { SubjectComments } from "./SubjectComments";
import { processContent } from "@/lib/content-processor";
import { EXAM_TYPE_LABELS, type ExamType } from "@/lib/types/subject";
import { SubjectMetadataEditor } from "./SubjectMetadataEditor";

interface SubjectReaderProps {
  subjectId: string;
  title: string;
  subtitle?: string;
  initialContent?: string | null;
  forceEdit?: boolean;
  userRoles?: string[];
  initialStatus?: string;
  metadata?: {
    exam_type: ExamType;
    year: number;
    matiere_display: string;
    serie?: string | null;
    niveau?: string | null;
    is_free?: boolean;
    concours_type?: string;
  };
}

type QuestionMessage = {
  id: string;
  text?: string; // Ajout pour compatibilité
};

export function SubjectReader({
  subjectId,
  title,
  subtitle,
  initialContent,
  forceEdit = false,
  userRoles = [],
  initialStatus = "published",
  metadata,
}: SubjectReaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [markdownContent, setMarkdownContent] = useState(initialContent || "");
  const [isEditing, setIsEditing] = useState(forceEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSocraticModal, setShowSocraticModal] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "split" | "full">(
    "single",
  );
  const searchParams = useSearchParams();
  const isZen = searchParams.get('zen') === 'true';

  // Nouveaux états pour les fonctionnalités
  const [userCredits, setUserCredits] = useState(0);
  const [userSubscription, setUserSubscription] = useState("free");
  const [showResolver, setShowResolver] = useState(false);
  const [showAIResponse, setShowAIResponse] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [showValidationBox, setShowValidationBox] = useState(false);
  const [validationComment, setValidationComment] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);

  // États pour les notifications et messages
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const [isToastClosing, setIsToastClosing] = useState(false);
  const [messages, setMessages] = useState<QuestionMessage[]>([]);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (title) {
      document.title = `${title} | mah.ai`;
    }
  }, [title]);

  const canValidate =
    userRoles.includes("admin") ||
    userRoles.includes("superadmin") ||
    userRoles.includes("validator");

  const canEdit = 
    canValidate || 
    userRoles.includes("contributor");

  const showToast = (message: string, tone: "success" | "error" = "success") => {
    setToastTone(tone);
    setToastMessage(message);
    setIsToastClosing(false);
    
    // Animation de sortie après un délai
    setTimeout(() => {
      setIsToastClosing(true);
      setTimeout(() => {
        setToastMessage(null);
        setIsToastClosing(false);
      }, 650); // Temps de l'animation CSS flash-exit
    }, 3000);
  };

  const toggleZen = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isZen) {
      params.delete('zen');
    } else {
      params.set('zen', 'true');
    }
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const handleStatusUpdate = async (status: SubjectStatus) => {
    setIsValidating(true);
    try {
      const result = await updateSubjectStatus(
        subjectId,
        status,
        validationComment,
      );
      if (result.success) {
        setCurrentStatus(status);
        setToastTone("success");
        setToastMessage(`Statut mis à jour : ${status}`);
        setShowValidationBox(false);
        if (status === "published") {
          router.push("/admin/subjects?status=pending&mine=1");
          return;
        }
      } else {
        setToastTone("error");
        setToastMessage(result.error || "Erreur de mise à jour");
      }
    } catch (error) {
      setToastTone("error");
      setToastMessage("Erreur serveur");
    } finally {
      setIsValidating(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Heartbeat State
  const [lastHeartbeat, setLastHeartbeat] = useState(Date.now());
  const isActive = useRef(true);

  // Heartbeat Logic (Active Reading)
  useEffect(() => {
    if (isEditing) return; // Pas de points en mode édition pour l'instant

    const GRIT_INTERVAL = 5 * 60 * 1000; // 5 minutes

    const interval = setInterval(async () => {
      if (isActive.current) {
        console.log("💓 Heartbeat: Awarding Grit points for active reading...");
        const result = await addGritPoints({
          amount: 10,
          action: "active_reading",
          referenceId: subjectId,
        });

        if (result.success) {
          setToastTone("success");
          setToastMessage("+10 Grit ! Merci pour ton effort.");
          setTimeout(() => setToastMessage(null), 3000);
        }
      }
    }, GRIT_INTERVAL);

    // Détecter l'activité (basique)
    const handleActivity = () => {
      isActive.current = true;
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, [subjectId, isEditing]);

  // Fonction pour formater le sujet via l'utilitaire partagé
  const formatSubjectContent = (content: string): string => {
    return processContent(content, false);
  };

  // Charger les crédits et abonnement de l'utilisateur
  useEffect(() => {
    const loadUserCredits = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { credits, subscription } =
            await getUserCreditsAndSubscriptionClient(user.id);
          setUserCredits(credits);
          setUserSubscription(subscription);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des crédits:", error);
      }
    };

    loadUserCredits();
  }, [supabase]);

  // Refs pour le scroll synchronisé
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Synchronisation du scroll
  const handleEditorScroll = () => {
    if (viewMode !== "split" || !editorScrollRef.current || !previewRef.current)
      return;
    const editor = editorScrollRef.current;
    const preview = previewRef.current;

    const scrollRange = editor.scrollHeight - editor.clientHeight;
    if (scrollRange <= 0) return;
    const scrollPercentage = editor.scrollTop / scrollRange;
    preview.scrollTop =
      scrollPercentage * (preview.scrollHeight - preview.clientHeight);
  };

  useEffect(() => {
    let active = true;
    listSubjectQuestions(subjectId).then((result: any) => {
      if (!active) return;
      if (!result.error) {
        const mapped = result.data.map((item: any) => ({
          id: item.id,
          text: item.question_text,
          createdAt: item.created_at,
        }));
        setMessages(mapped);
      }
    });
    return () => {
      active = false;
    };
  }, [subjectId]);

  const handleSaveMarkdown = async () => {
    if (!markdownContent.trim()) {
      showToast("Le contenu ne peut pas être vide", "error");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveSubjectMarkdown(subjectId, markdownContent);
      if (result.success) {
        showToast("Sujet mis à jour avec succès");
        setIsEditing(false);
        router.push("/admin/subjects?status=pending&mine=1");
        return;
      } else {
        showToast(result.error || "Erreur lors de la sauvegarde", "error");
      }
    } catch (error) {
      showToast("Erreur de connexion", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => router.push("/subjects");

  const handleDuplicate = async () => {
    try {
      setIsDuplicating(true);
      const result = await duplicateSubject(subjectId);
      if (result.data) {
        router.push(`/subjects/${result.data.id}?edit=true`);
        return;
      }
      showToast(result.error || "Impossible de dupliquer ce sujet", "error");
    } catch {
      showToast("Erreur lors de la duplication", "error");
    } finally {
      setIsDuplicating(false);
    }
  };

  // Handlers pour les nouvelles fonctionnalités
  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectContent: formatSubjectContent(markdownContent),
          subjectTitle: title,
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
      a.download = `${title.replace(/[^a-z0-9]/gi, "_")}_mah_ai.pdf`;
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

  const handleOpenResolver = () => {
    setShowResolver(true);
  };

  const handleOpenAIResponse = () => {
    setShowAIResponse(true);
  };

  return (
    <div className={`flex flex-col ${isZen ? "h-screen" : "h-[calc(100vh-4rem)]"} bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
      {/* Admin Validation Bar - Only visible if not published */}
      {canValidate && currentStatus !== "published" && (
        <div className="bg-slate-900 dark:bg-slate-900 border-b border-white/10 text-white px-6 py-3 flex items-center justify-between z-[40] animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4 text-sm font-bold">
            <span className="flex items-center gap-2 text-amber-400 uppercase tracking-widest text-[10px]">
              <AlertTriangle className="w-4 h-4" />
              Gestion de Validation
            </span>
            <span className="h-4 w-[1px] bg-white/20" />
            <span className="text-slate-300 font-medium">
              Statut actuel :{" "}
              <span className="text-white uppercase">{currentStatus}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!showValidationBox ? (
              <>
                <button
                  onClick={() => setShowValidationBox(true)}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all border border-white/10"
                >
                  Prendre une décision
                </button>
                <button
                  onClick={() => handleStatusUpdate("published")}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-xs font-black uppercase tracking-tighter shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approuver direct
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl">
                <textarea
                  value={validationComment}
                  onChange={(e) => setValidationComment(e.target.value)}
                  placeholder="Pourquoi renvoyer en révision ou refuser ?"
                  className="bg-transparent border-none outline-none text-xs text-white p-2 w-64 h-10 resize-none placeholder:text-white/20"
                />
                <div className="flex flex-col gap-1 p-1">
                  <button
                    onClick={() => handleStatusUpdate("published")}
                    disabled={isValidating}
                    className="px-3 py-1 bg-emerald-500 text-[10px] font-black rounded-md uppercase"
                  >
                    Approver
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("revision")}
                    disabled={isValidating || !validationComment}
                    className="px-3 py-1 bg-blue-500 text-[10px] font-black rounded-md uppercase disabled:opacity-30"
                  >
                    Révision
                  </button>
                </div>
                <button
                  onClick={() => handleStatusUpdate("rejected")}
                  disabled={isValidating || !validationComment}
                  className="px-3 py-1 bg-red-500 text-[10px] font-black rounded-md uppercase disabled:opacity-30"
                >
                  Refuser
                </button>
                <button
                  onClick={() => setShowValidationBox(false)}
                  className="p-2 text-white/40 hover:text-white"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between z-30 shadow-sm transition-colors overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0 max-w-[120px] sm:max-w-none">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-none truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-4">
          <button
            onClick={toggleZen}
            className={`p-2 rounded-lg transition-all ${isZen ? 'bg-amber-100 text-amber-600 shadow-sm' : 'hover:bg-slate-100 text-slate-500'}`}
            title={isZen ? "Quitter le mode Zen" : "Mode Zen (Lecture Focus)"}
          >
            {isZen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`p-2 rounded-lg transition-all ${showComments ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-100 text-slate-500'}`}
            title={showComments ? "Masquer les commentaires" : "Afficher les commentaires"}
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5 sm:mx-1" />

          {isEditing && (
            <button
              onClick={() =>
                setViewMode(viewMode === "split" ? "full" : "split")
              }
              className="px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap"
            >
              {viewMode === "full" ? (
                <Columns className="w-4 h-4" />
              ) : (
                <Layout className="w-4 h-4" />
              )}
              <span className="hidden xs:inline">{viewMode === "full" ? "Aperçu" : "Plein écran"}</span>
            </button>
          )}

          {canEdit && (
            !isEditing ? (
              <>
                <button
                  onClick={handleDuplicate}
                  disabled={isDuplicating}
                  className="px-3 sm:px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm whitespace-nowrap disabled:opacity-50"
                >
                  <Copy className="w-3.5 h-3.5 sm:w-4 h-4" />
                  <span>{isDuplicating ? "Duplication..." : "Dupliquer"}</span>
                </button>
                <button
                  onClick={() => setShowMetadataEditor((value) => !value)}
                  className="px-3 sm:px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm whitespace-nowrap"
                >
                  <span>Métadonnées</span>
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 sm:px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm whitespace-nowrap"
                >
                  <Edit3 className="w-3.5 h-3.5 sm:w-4 h-4" />
                  <span>Modifier</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2 sm:px-4 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveMarkdown}
                  disabled={isSaving}
                  className="px-3 sm:px-4 py-1.5 bg-violet-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-violet-700 flex items-center gap-1.5 sm:gap-2 transition-all shadow-md shadow-violet-200 whitespace-nowrap disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <Save className="w-3.5 h-3.5 sm:w-4 h-4" />
                  )}
                  <span>Publier</span>
                </button>
              </div>
            )
          )}
        </div>
      </div>

      <div className={`flex-1 overflow-hidden flex relative ${isZen ? "bg-white dark:bg-slate-900" : "bg-slate-100 dark:bg-slate-950"}`}>
        {/* Main Workspace */}
        <div className={`flex-1 flex overflow-hidden ${isZen ? "gap-0 p-0" : "gap-4 p-4"}`}>
          {!isEditing && showMetadataEditor && metadata && (
            <div className="absolute top-4 left-4 right-4 z-20 max-h-[40vh] overflow-y-auto">
              <SubjectMetadataEditor
                subjectId={subjectId}
                initialTitle={title}
                initialExamType={metadata.exam_type}
                initialYear={metadata.year}
                initialMatiereDisplay={metadata.matiere_display}
                initialSerie={metadata.serie}
                initialNiveau={metadata.niveau}
                initialIsFree={metadata.is_free}
                initialConcoursType={metadata.concours_type}
                examTypeEntries={Object.entries(EXAM_TYPE_LABELS).map(([value, label]) => ({
                  value: value as ExamType,
                  label,
                }))}
              />
            </div>
          )}

          {/* Editor Panel */}
          {isEditing && (
            <div
              className={`${viewMode === "split" ? "w-1/2" : "w-full"} h-full flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden`}
            >
              <div
                ref={editorScrollRef}
                onScroll={handleEditorScroll}
                className="flex-1 overflow-y-auto custom-scrollbar"
              >
                <MilkdownEditor
                  value={markdownContent}
                  onChange={setMarkdownContent}
                  placeholder="# Titre du sujet\n\n## Exercice 1\nÉcrivez ici le contenu de l'examen..."
                  className="min-h-full px-6 py-6"
                />
              </div>
            </div>
          )}

          {/* Preview/Reader Panel */}
          {(!isEditing || viewMode === "split") && (
            <div
              ref={previewRef}
              className={`flex-1 h-full bg-white dark:bg-slate-900 overflow-y-auto overflow-x-hidden transition-colors custom-scrollbar ${isZen ? "rounded-none border-0 shadow-none" : "rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800"}`}
            >
              <div className="min-h-full flex flex-col">
                <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-500 w-full" />
                <div className={`${isZen ? "p-6 md:p-10" : "p-10 md:p-16"} flex-1`}>
                  {markdownContent ? (
                    <MilkdownEditor
                      value={markdownContent}
                      onChange={() => {}}
                      readOnly
                      className="min-h-full px-6 py-6"
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <BookOpen className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Utilisateur</p>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Aucun contenu disponible
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-xs">
                        Ce sujet n&apos;a pas encore été édité par la communauté
                        mah.ai.
                      </p>
                      {canEdit && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="mt-6 text-violet-600 dark:text-violet-400 font-semibold hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Commencer l&apos;édition
                        </button>
                      )}
                    </div>
                  )}
                  {!isEditing && showComments && <SubjectComments subjectId={subjectId} />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Socratic AI Modal */}
      <SocraticModal
        isOpen={showSocraticModal}
        onClose={() => setShowSocraticModal(false)}
        subjectId={subjectId}
        questionId={messages[0]?.id || "new-question"}
        questionText={messages[0]?.text || "Question sur ce sujet"}
        selectionRect={null}
        zoom={100}
        markdownContext={markdownContent}
      />

      {/* Subject Resolver Modal */}
      <SubjectResolver
        isOpen={showResolver}
        onClose={() => setShowResolver(false)}
        subjectId={subjectId}
        subjectTitle={title}
        subjectContent={markdownContent}
        userCredits={userCredits}
        userSubscription={userSubscription}
      />

      {/* Subject AI Response Modal */}
      <SubjectAIResponse
        isOpen={showAIResponse}
        onClose={() => setShowAIResponse(false)}
        subjectId={subjectId}
        subjectTitle={title}
        subjectContent={markdownContent}
        userCredits={userCredits}
        userSubscription={userSubscription}
      />

      {/* Floating Subject Actions */}
      {!isEditing && (
        <FloatingSubjectActions
          userCredits={userCredits}
          userSubscription={userSubscription}
          onDownloadPDF={handleDownloadPDF}
          onOpenResolver={handleOpenResolver}
          onOpenAIResponse={handleOpenAIResponse}
          onOpenSocratic={() => setShowSocraticModal(true)}
          isLoading={isDownloading}
          onFlashMessage={showToast}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] ${isToastClosing ? "animate-flash-exit" : "animate-in slide-in-from-bottom-5"} duration-300`}>
          <div
            className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 ${toastTone === "success" ? "bg-emerald-600" : "bg-red-600"} text-white`}
          >
            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <p className="text-sm font-bold tracking-tight">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
