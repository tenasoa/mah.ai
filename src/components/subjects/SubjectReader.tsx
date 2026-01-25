"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Sparkles, 
  Edit3, 
  Save, 
  FileText, 
  BookOpen,
  Layout,
  Columns,
  Maximize2,
  Minimize2,
  Underline as UnderlineIcon
} from "lucide-react";
import { createSubjectQuestion, listSubjectQuestions } from "@/app/actions/reader";
import { askSocraticTutor } from "@/app/actions/perplexity";
import { saveSubjectMarkdown } from "@/app/actions/subjects";
import { addGritPoints } from "@/app/actions/grit";
import { SocraticSidekick } from "./SocraticSidekick";

// Markdown rendering imports
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

interface SubjectReaderProps {
  subjectId: string;
  title: string;
  subtitle?: string;
  initialContent?: string | null;
  forceEdit?: boolean;
}

type QuestionMessage = {
  id: string;
  text: string;
  createdAt: string;
};

export function SubjectReader({ subjectId, title, subtitle, initialContent, forceEdit }: SubjectReaderProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(forceEdit || !initialContent);
  const [markdownContent, setMarkdownContent] = useState(initialContent || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSidekickOpen, setIsSidekickOpen] = useState(false);
  const [messages, setMessages] = useState<QuestionMessage[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const [viewMode, setViewMode] = useState<"full" | "split">(forceEdit ? "split" : "full");

  // Heartbeat State
  const [lastHeartbeat, setLastHeartbeat] = useState(Date.now());
  const isActive = useRef(true);

  // Heartbeat Logic (Active Reading)
  useEffect(() => {
    if (isEditing) return; // Pas de points en mode édition pour l'instant

    const GRIT_INTERVAL = 5 * 60 * 1000; // 5 minutes
    
    const interval = setInterval(async () => {
      if (isActive.current) {
        console.log('💓 Heartbeat: Awarding Grit points for active reading...');
        const result = await addGritPoints({
          amount: 10,
          action: 'active_reading',
          referenceId: subjectId
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

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [subjectId, isEditing]);

  // Refs pour le scroll synchronisé
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Synchronisation du scroll
  const handleEditorScroll = () => {
    if (viewMode !== "split" || !editorRef.current || !previewRef.current) return;
    const editor = editorRef.current;
    const preview = previewRef.current;
    
    const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
  };

  // Barre d'outils Markdown
  const insertText = (before: string, after: string = "") => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    
    setMarkdownContent(newText);
    
    // Reposer le focus et la sélection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
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
    return () => { active = false; };
  }, [subjectId]);

  const handleSaveMarkdown = async () => {
    if (!markdownContent.trim()) {
      setToastTone("error");
      setToastMessage("Le contenu ne peut pas être vide");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveSubjectMarkdown(subjectId, markdownContent);
      if (result.success) {
        setToastTone("success");
        setToastMessage("Sujet mis à jour avec succès");
        setIsEditing(false);
      } else {
        setToastTone("error");
        setToastMessage(result.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      setToastTone("error");
      setToastMessage("Erreur de connexion");
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleBack = () => router.push("/subjects");

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
      {/* Top Navigation Bar */}
      <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">{title}</h1>
            {subtitle && <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={() => setViewMode(viewMode === "split" ? "full" : "split")}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-2 transition-colors"
            >
              {viewMode === "full" ? <Columns className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
              {viewMode === "full" ? "Aperçu scindé" : "Plein écran"}
            </button>
          )}
          
          <div className="h-6 w-[1px] bg-slate-200 mx-2" />

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 transition-all shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              Modifier
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveMarkdown}
                disabled={isSaving}
                className="px-4 py-1.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 flex items-center gap-2 transition-all shadow-md shadow-violet-200 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Publier
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex relative bg-slate-100">
        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden gap-4 p-4">
          {/* Editor Panel */}
          {isEditing && (
            <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} h-full flex flex-col bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden`}>
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button onClick={() => insertText("# ", "")} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-xs font-bold text-slate-600">H1</button>
                <button onClick={() => insertText("## ", "")} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-xs font-bold text-slate-600">H2</button>
                <button onClick={() => insertText("**", "**")} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-xs font-bold text-slate-600">B</button>
                <button onClick={() => insertText("*", "*")} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-xs italic text-slate-600">I</button>
                <button onClick={() => insertText("<u>", "</u>")} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-xs text-slate-600">
                  <UnderlineIcon className="w-3 h-3" />
                </button>
                <div className="w-[1px] h-4 bg-slate-300 mx-1" />
                <button onClick={() => insertText("- ", "")} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-xs text-slate-600">Liste</button>
                <button onClick={() => insertText("1. ", "")} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-xs text-slate-600">Num</button>
                <button onClick={() => insertText("> ", "")} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-xs text-slate-600">Citation</button>
                <div className="w-[1px] h-4 bg-slate-300 mx-1" />
                <button onClick={() => insertText("$$", "$$")} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-xs text-slate-600">Math</button>
                <button onClick={() => insertText("```\n", "\n```")} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-xs text-slate-600">Code</button>
              </div>
              <textarea
                ref={editorRef}
                onScroll={handleEditorScroll}
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                className="flex-1 w-full p-8 outline-none resize-none font-mono text-sm leading-relaxed text-slate-800 bg-transparent"
                placeholder="# Titre du sujet\n\n## Exercice 1\nÉcrivez ici le contenu de l'examen..."
                autoFocus
              />
            </div>
          )}

          {/* Preview/Reader Panel */}
          {(!isEditing || viewMode === "split") && (
            <div 
              ref={previewRef}
              className="flex-1 h-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-y-auto overflow-x-hidden"
            >
              <div className="min-h-full flex flex-col">
                <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-500 w-full" />
                <div className="p-10 md:p-16 flex-1">
                  {markdownContent ? (
                    <div className="prose prose-slate prose-lg max-w-none font-sans text-slate-800 leading-relaxed selection:bg-violet-100 selection:text-violet-900">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                        rehypePlugins={[rehypeKatex, rehypeRaw]}
                      >
                        {markdownContent}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <BookOpen className="w-10 h-10 text-slate-200" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun contenu disponible</h3>
                      <p className="text-slate-500 max-w-xs">Ce sujet n&apos;a pas encore été édité par la communauté mah.ai.</p>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="mt-6 text-violet-600 font-semibold hover:text-violet-700 flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Commencer l&apos;édition
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Sidekick Button (Floating) */}
        {!isEditing && (
          <button
            onClick={() => setIsSidekickOpen(true)}
            className="absolute bottom-8 right-8 z-20 flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl shadow-slate-900/40 hover:scale-105 transition-all active:scale-95 group"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <div className="absolute inset-0 bg-amber-400/20 blur-lg animate-pulse" />
            </div>
            <span className="font-bold text-sm tracking-tight">Sidekick IA</span>
          </button>
        )}
      </div>

      {/* Socratic AI Sidebar */}
      <SocraticSidekick
        isOpen={isSidekickOpen}
        onClose={() => setIsSidekickOpen(false)}
        subjectId={subjectId}
        questionId={messages[0]?.id || "new-question"}
        questionText={messages[0]?.text || "Question sur ce sujet"}
        selectionRect={null}
        zoom={100}
        markdownContext={markdownContent}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 duration-300">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 ${toastTone === "success" ? "bg-emerald-600" : "bg-red-600"} text-white`}>
            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <p className="text-sm font-bold tracking-tight">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}