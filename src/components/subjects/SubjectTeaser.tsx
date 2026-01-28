"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Lock, Unlock, ChevronDown, Heart, Bookmark, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SubjectWithAccess } from "@/lib/types/subject";
import {
  EXAM_TYPE_LABELS,
  EXAM_TYPE_COLORS,
  MATIERE_ICONS,
} from "@/lib/types/subject";
import { recordTeaserView, recordTeaserCTA } from "@/app/actions/teaser";
import { getCreditBalance } from "@/app/actions/credits";
import { UnlockModal } from "@/components/subjects/UnlockModal";
import { createClient } from "@/lib/supabase/client";

interface SubjectTeaserProps {
  subject: SubjectWithAccess;
  previewLines?: number; // Nombre de lignes visibles avant le flou
  onTeaserViewed?: () => void; // Callback pour analytics
}

type TeaserVariant = "control" | "view_full" | "access";

export function SubjectTeaser({
  subject,
  previewLines = 3,
  onTeaserViewed,
}: SubjectTeaserProps) {
  const router = useRouter();
  const colors = EXAM_TYPE_COLORS[subject.exam_type] || EXAM_TYPE_COLORS.other;
  const icon = MATIERE_ICONS[subject.matiere] || "📚";
  const [variant, setVariant] = useState<TeaserVariant>("control");
  const [isMounted, setIsMounted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Unlock Logic State
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const supabase = createClient();

  // Parse preview text into lines
  const previewContent = useMemo(() => {
    if (!subject.preview_text) {
      return {
        visibleLines: [],
        hiddenLines: [],
      };
    }

    const lines = subject.preview_text
      .split("\n")
      .filter((line) => line.trim().length > 0);

    return {
      visibleLines: lines.slice(0, previewLines),
      hiddenLines: lines.slice(previewLines),
    };
  }, [subject.preview_text, previewLines]);

  useEffect(() => {
    setIsMounted(true);
    // Simple A/B Testing Logic
    const variants: TeaserVariant[] = ["control", "view_full", "access"];
    const selectedVariant =
      variants[Math.floor(Math.random() * variants.length)];
    setVariant(selectedVariant);

    // Record View with Variant
    recordTeaserView(subject.id, "direct", selectedVariant).catch(console.error);
    
    // Check if bookmarked
    const checkBookmark = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('bookmarks')
                .select('id')
                .eq('user_id', user.id)
                .eq('subject_id', subject.id)
                .maybeSingle();
            setIsBookmarked(!!data);
        }
    };
    checkBookmark();

    // Fetch user balance
    getCreditBalance().then(setCreditBalance);

    onTeaserViewed?.();
  }, [subject.id, onTeaserViewed, supabase]);

  const toggleBookmark = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        router.push(`/auth?next=/subjects/${subject.id}`);
        return;
    }

    if (isBookmarked) {
        await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('subject_id', subject.id);
        setIsBookmarked(false);
    } else {
        await supabase.from('bookmarks').insert({ user_id: user.id, subject_id: subject.id });
        setIsBookmarked(true);
    }
  };

  const getCTALabel = () => {
    if (!isMounted) return "Débloquer le sujet complet";
    switch (variant) {
      case "view_full":
        return "Voir le sujet complet";
      case "access":
        return "Accéder au contenu";
      default:
        return "Débloquer le sujet complet";
    }
  };

  const handleUnlockClick = (e: React.MouseEvent) => {
    if (subject.is_free) return; // Let the link work normally
    
    e.preventDefault();
    recordTeaserCTA(subject.id, "unlock", variant).catch(console.error);

    if (creditBalance === null) {
      // User not logged in
      router.push(`/auth?next=/subjects/${subject.id}`);
    } else {
      setIsUnlockModalOpen(true);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <header className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`h-16 w-16 rounded-[24px] flex items-center justify-center text-3xl ${colors.bg} ${colors.border} border shadow-sm dark:shadow-none transition-colors duration-300`}
            >
              {icon}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-outfit">
                {subject.matiere_display}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{EXAM_TYPE_LABELS[subject.exam_type]}</span>
                <span>•</span>
                <span>Année {subject.year}</span>
                {subject.serie && (
                    <>
                        <span>•</span>
                        <span>Série {subject.serie}</span>
                    </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
                onClick={toggleBookmark}
                className={`p-3 rounded-2xl border transition-all ${
                    isBookmarked 
                    ? "bg-rose-50 border-rose-100 text-rose-500 shadow-lg shadow-rose-500/10" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500"
                }`}
            >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
            
            {subject.has_access ? (
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 shadow-sm">
                <Unlock className="w-4 h-4" />
                <span className="font-black uppercase tracking-widest text-[10px]">Accès débloqué</span>
              </div>
            ) : subject.is_free ? (
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shadow-sm">
                <Unlock className="w-4 h-4" />
                <span className="font-black uppercase tracking-widest text-[10px]">Gratuit</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 shadow-sm">
                <Lock className="w-4 h-4" />
                <span className="font-black uppercase tracking-widest text-[10px]">
                  {subject.credit_cost} crédit{subject.credit_cost > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Preview Card */}
      <article className="relative bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none transition-colors duration-300">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
        
        <div className="p-8 md:p-12">
          <div className="prose dark:prose-invert prose-slate max-w-none">
            {previewContent.visibleLines.length > 0 ? (
              <div className="space-y-6">
                {previewContent.visibleLines.map((line, idx) => (
                  <p key={idx} className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg italic border-l-4 border-amber-100 dark:border-amber-900/50 pl-6 py-1">
                    {line}
                  </p>
                ))}
              </div>
            ) : !subject.has_access ? (
              <div className="space-y-6 opacity-20 blur-sm select-none pointer-events-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg italic border-l-4 border-slate-100 dark:border-slate-800 pl-6 py-1">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg italic border-l-4 border-slate-100 dark:border-slate-800 pl-6 py-1">
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
            ) : (
              <div className="text-slate-400 italic text-center py-10">
                Aperçu non disponible pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* Hidden Content with Blur or Placeholder */}
        {(!subject.has_access) && (
          <div className="relative px-8 md:px-12 pb-12">
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-transparent via-white dark:via-slate-900 to-white dark:to-slate-950 pointer-events-none" />

            <div className="relative blur-md opacity-30 select-none pointer-events-none space-y-6">
              {previewContent.hiddenLines.length > 0 ? previewContent.hiddenLines.map((line, idx) => (
                <p key={idx} className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed border-l-4 border-transparent pl-6 py-1">
                  {line}
                </p>
              )) : (
                <>
                  <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed border-l-4 border-transparent pl-6 py-1">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed border-l-4 border-transparent pl-6 py-1">
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                </>
              )}
            </div>

            {/* CTA Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
              <div className="text-center animate-in fade-in zoom-in duration-700">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 animate-bounce-soft">
                    <Lock className="w-8 h-8 text-amber-500" />
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  Contenu Verrouillé
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-tighter">Débloquez ce sujet pour accéder à toutes les questions</p>
                
                <button
                  onClick={handleUnlockClick}
                  className="mt-6 px-10 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-500/20 active:scale-95 pointer-events-auto"
                >
                  {subject.is_free ? "Accéder Gratuitement" : getCTALabel()}
                </button>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Main CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!subject.has_access ? (
          <button
            onClick={handleUnlockClick}
            className="w-full px-8 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest hover:bg-amber-500 dark:hover:bg-amber-400 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 group"
          >
            <Unlock className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {subject.is_free ? "Accéder Gratuitement" : getCTALabel()}
          </button>
        ) : (
          <Link
            href={`/subjects/${subject.id}`}
            className="w-full px-8 py-5 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3"
          >
            <Unlock className="w-5 h-5" />
            Consulter le sujet
          </Link>
        )}

        <button
          onClick={() => {
            if (navigator.share) {
                navigator.share({
                    title: `Sujet ${subject.matiere_display} ${subject.year}`,
                    text: `Réviser sur mah.ai`,
                    url: window.location.href
                });
            }
          }}
          className="w-full px-8 py-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
        >
          <Share2 className="w-5 h-5" />
          Partager
        </button>
      </div>

      {/* Stats & Info */}
      <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{subject.view_count.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vues</p>
        </div>
        <div className="text-center">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{subject.is_free ? '0' : subject.credit_cost}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coût (Crédits)</p>
        </div>
        <div className="text-center">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{new Date(subject.created_at || '').getFullYear()}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mise en ligne</p>
        </div>
      </div>

      {/* Unlock Modal */}
      <UnlockModal 
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        subjectId={subject.id}
        subjectTitle={subject.matiere_display}
        creditCost={subject.credit_cost}
        currentBalance={creditBalance || 0}
      />
    </div>
  );
}