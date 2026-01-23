"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Lock, Unlock, ChevronDown } from "lucide-react";
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

interface SubjectTeaserProps {
  subject: SubjectWithAccess;
  previewLines?: number; // Nombre de lignes visibles avant le flou
  onTeaserViewed?: () => void; // Callback pour analytics
}

type TeaserVariant = "control" | "view_full" | "access";

/**
 * Composant SubjectTeaser
 *
 * Affiche un aperçu d'un sujet avec:
 * - Les premières lignes visibles (lisibles par les crawlers SEO)
 * - Un overlay progressif flou pour le reste
 * - CTA pour débloquer le sujet complet
 *
 * Design: Option A (Overlay CSS) pour optimiser SEO
 */
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
  
  // Unlock Logic State
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

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
    
    // Fetch user balance
    getCreditBalance().then(setCreditBalance);

    onTeaserViewed?.();
  }, [subject.id, onTeaserViewed]);

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
      router.push(`/auth/login?redirect=/subjects/${subject.id}`);
    } else {
      // Open modal
      setIsUnlockModalOpen(true);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${colors.bg} ${colors.border} border`}
              >
                {icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {subject.matiere_display}
                </h1>
                <p className="text-slate-500">
                  {EXAM_TYPE_LABELS[subject.exam_type]} {subject.year}
                  {subject.serie && ` • Série ${subject.serie}`}
                </p>
              </div>
            </div>
          </div>

          {/* Access Badge */}
          <div className="flex items-center gap-2">
            {subject.has_access ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Unlock className="w-4 h-4" />
                <span className="font-semibold">Accès débloqué</span>
              </div>
            ) : subject.is_free ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100 text-blue-700">
                <Unlock className="w-4 h-4" />
                <span className="font-semibold">Gratuit</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600">
                <Lock className="w-4 h-4" />
                <span className="font-semibold">
                  {subject.credit_cost} crédit(s)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/subjects" className="hover:text-slate-700 underline">
            Sujets
          </Link>
          <span>›</span>
          <Link
            href={`/subjects?type=${subject.exam_type}`}
            className="hover:text-slate-700 underline"
          >
            {EXAM_TYPE_LABELS[subject.exam_type]}
          </Link>
          <span>›</span>
          <Link
            href={`/subjects?year=${subject.year}`}
            className="hover:text-slate-700 underline"
          >
            {subject.year}
          </Link>
          <span>›</span>
          <span className="text-slate-700 font-medium">
            {subject.matiere_display}
          </span>
        </nav>
      </div>

      {/* Preview Content */}
      <div className="relative bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
        {/* Visible Content - Fully readable (SEO friendly) */}
        <div className="p-8">
          <div className="prose prose-sm max-w-none">
            {previewContent.visibleLines.length > 0 ? (
              <div className="space-y-4">
                {previewContent.visibleLines.map((line, idx) => (
                  <div key={idx} className="text-slate-700 leading-relaxed">
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 italic">
                Aucun aperçu disponible pour ce sujet
              </div>
            )}
          </div>
        </div>

        {/* Hidden Content with Blur Overlay (SEO concern: text is still in DOM) */}
        {previewContent.hiddenLines.length > 0 && (
          <div className="relative px-8 pb-8">
            {/* Gradient Overlay (opaque au démarrage, transparent au-dessus du visible) */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50 pointer-events-none" />

            {/* Blurred Hidden Content */}
            <div className="relative blur-sm opacity-60 select-none pointer-events-none space-y-4">
              {previewContent.hiddenLines.map((line, idx) => (
                <div key={idx} className="text-slate-700 leading-relaxed">
                  {line}
                </div>
              ))}
            </div>

            {/* CTA Overlay - Centered */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center pointer-events-auto">
                <ChevronDown className="w-8 h-8 text-slate-400 mx-auto mb-3 animate-bounce" />
                <p className="text-sm font-medium text-slate-500">
                  {previewContent.hiddenLines.length} autres questions
                  verrouillées
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="mt-8 flex flex-col gap-4">
        {!subject.has_access ? (
          <>
            <Link
              href={
                subject.is_free
                  ? `/subjects/${subject.id}`
                  : `/auth/login?redirect=/subjects/${subject.id}`
              }
              onClick={handleUnlockClick}
              className="
                w-full px-6 py-4 rounded-xl
                bg-gradient-to-r from-amber-500 to-amber-600
                text-white font-bold text-lg
                hover:from-amber-600 hover:to-amber-700
                transition-all duration-200
                shadow-lg hover:shadow-xl
                flex items-center justify-center gap-2
                group
              "
            >
              <Unlock className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {subject.is_free
                ? "Accéder au sujet complet"
                : getCTALabel()}
            </Link>

            {!subject.is_free && (
              <p className="text-center text-slate-600 text-sm">
                ou{" "}
                <Link
                  href="/auth/login"
                  className="text-amber-600 hover:underline font-semibold"
                >
                  connectez-vous
                </Link>{" "}
                si vous avez déjà un accès
              </p>
            )}
          </>
        ) : (
          <Link
            href={`/subjects/${subject.id}`}
            className="
              w-full px-6 py-4 rounded-xl
              bg-gradient-to-r from-emerald-500 to-emerald-600
              text-white font-bold text-lg
              hover:from-emerald-600 hover:to-emerald-700
              transition-all duration-200
              shadow-lg hover:shadow-xl
              flex items-center justify-center gap-2
              group
            "
          >
            <Unlock className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Consulter le sujet complet
          </Link>
        )}

        {/* Secondary CTA */}
        <button
          onClick={() => {
            // Analytics event for sharing
            recordTeaserCTA(subject.id, "share", variant).catch(console.error);
            if (typeof window !== "undefined" && (window as any).gtag) {
              (window as any).gtag("event", "teaser_share", {
                subject_id: subject.id,
                exam_type: subject.exam_type,
              });
            }
            // TODO: Implement share functionality
          }}
          className="
            w-full px-6 py-3 rounded-xl
            bg-slate-100 hover:bg-slate-200
            text-slate-700 font-semibold
            transition-colors duration-200
            flex items-center justify-center gap-2
          "
        >
          Partager cet aperçu
        </button>
      </div>

      {/* Info Section */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {subject.page_count || "?"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Pages</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {subject.view_count.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Consultations</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {subject.download_count.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Téléchargements</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {subject.created_at
              ? new Date(subject.created_at).getFullYear()
              : "?"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Année</p>
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