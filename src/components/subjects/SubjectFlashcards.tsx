"use client";

import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, ChevronLeft, ChevronRight, RefreshCw, RotateCcw, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Flashcard {
  question: string;
  answer: string;
}

interface SubjectFlashcardsProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  subjectContent: string;
}

export function SubjectFlashcards({
  isOpen,
  onClose,
  subjectId,
  subjectContent,
}: SubjectFlashcardsProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const { toast } = useToast();

  const cacheKey = useMemo(
    () => `${subjectId}-${subjectContent.length}`,
    [subjectId, subjectContent.length],
  );
  const [currentCacheKey, setCurrentCacheKey] = useState(cacheKey);

  useEffect(() => {
    if (cacheKey !== currentCacheKey) {
      setCards([]);
      setCurrentIndex(0);
      setIsFlipped(false);
      setWarning(null);
      setCurrentCacheKey(cacheKey);
    }
  }, [cacheKey, currentCacheKey]);

  const generateFlashcards = async () => {
    if (!subjectContent.trim()) {
      toast("Le sujet est vide, impossible de générer des flashcards.", "warning", 5000);
      return;
    }

    setLoading(true);
    setWarning(null);

    try {
      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          subjectContent,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error || "Erreur de génération");
      }

      const generatedCards = Array.isArray(body.cards) ? (body.cards as Flashcard[]) : [];
      setCards(generatedCards);
      setCurrentIndex(0);
      setIsFlipped(false);

      if (body.warning) {
        setWarning(String(body.warning));
        toast(String(body.warning), "info", 4500);
      } else {
        toast(`${generatedCards.length} flashcards générées.`, "success", 3500);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inattendue";
      toast(message, "error", 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || loading || cards.length > 0) return;
    generateFlashcards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const activeCard = cards[currentIndex];

  return (
    <div className="fixed inset-0 z-[115] flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">Cartes Mémoire</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Génération IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-5 space-y-4">
          {warning && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700/40 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              {warning}
            </div>
          )}

          {loading && (
            <div className="h-48 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
            </div>
          )}

          {!loading && cards.length > 0 && activeCard && (
            <button
              onClick={() => setIsFlipped((value) => !value)}
              className="w-full text-left h-56 rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-5 transition-all hover:shadow-lg"
            >
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-2">
                {isFlipped ? "Réponse" : "Question"}
              </p>
              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {isFlipped ? activeCard.answer : activeCard.question}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 uppercase tracking-widest font-bold">
                Cliquer pour retourner la carte
              </p>
            </button>
          )}

          {!loading && cards.length === 0 && (
            <div className="h-48 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center px-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Aucune carte disponible pour ce sujet.
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setCurrentIndex((prev) => Math.max(prev - 1, 0));
                setIsFlipped(false);
              }}
              disabled={cards.length === 0 || currentIndex === 0 || loading}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 disabled:opacity-40 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>

            <p className="text-xs font-black text-slate-500 dark:text-slate-400">
              {cards.length > 0 ? `${currentIndex + 1} / ${cards.length}` : "0 / 0"}
            </p>

            <button
              onClick={() => {
                setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
                setIsFlipped(false);
              }}
              disabled={cards.length === 0 || currentIndex >= cards.length - 1 || loading}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 disabled:opacity-40 flex items-center gap-1.5"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={generateFlashcards}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Régénérer les flashcards
          </button>
        </div>
      </div>
    </div>
  );
}
