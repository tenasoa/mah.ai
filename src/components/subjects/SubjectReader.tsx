"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crosshair, Search, Minus, Plus, Sparkles } from "lucide-react";
import { createSubjectQuestion, listSubjectQuestions } from "@/app/actions/reader";

interface SubjectReaderProps {
  subjectId: string;
  pdfUrl: string;
  title: string;
  subtitle?: string;
}

const ZOOM_LEVELS = [80, 100, 120, 140, 160];

type SelectionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type QuestionMessage = {
  id: string;
  text: string;
  rect: SelectionRect;
  zoom: number;
  createdAt: string;
};

export function SubjectReader({ subjectId, pdfUrl, title, subtitle }: SubjectReaderProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressPointRef = useRef<{ x: number; y: number } | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [zoomIndex, setZoomIndex] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidekickOpen, setIsSidekickOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [selectionContext, setSelectionContext] = useState<SelectionRect | null>(null);
  const [selectionBubble, setSelectionBubble] = useState<{ left: number; top: number } | null>(null);
  const [isLongPressSelecting, setIsLongPressSelecting] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [messages, setMessages] = useState<QuestionMessage[]>([]);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  const zoom = ZOOM_LEVELS[zoomIndex];

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 900);
  }, []);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => showControls();
    const handlePointer = () => showControls();

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("mousemove", handlePointer);
    container.addEventListener("touchstart", handlePointer, { passive: true });

    scheduleHide();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("mousemove", handlePointer);
      container.removeEventListener("touchstart", handlePointer);
    };
  }, [scheduleHide, showControls]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const update = () => setIsCoarsePointer(mediaQuery.matches);
    update();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }
    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  useEffect(() => {
    let active = true;
    listSubjectQuestions(subjectId).then((result) => {
      if (!active) return;
      if (result.error) {
        setQuestionError(result.error);
        return;
      }
      const mapped = result.data.map((item) => ({
        id: item.id,
        text: item.question_text,
        rect: item.selection_rect as SelectionRect,
        zoom: item.zoom,
        createdAt: item.created_at,
      }));
      setMessages(mapped);
    });
    return () => {
      active = false;
    };
  }, [subjectId]);

  useEffect(() => {
    if (!toastMessage) return;
    setToastVisible(true);
    const timer = setTimeout(() => setToastVisible(false), 1800);
    const cleanup = setTimeout(() => setToastMessage(null), 2200);
    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, [toastMessage]);

  const src = useMemo(() => {
    const baseUrl = pdfUrl.split("#")[0];
    const hashParams = new URLSearchParams();
    hashParams.set("toolbar", "0");
    hashParams.set("navpanes", "0");
    hashParams.set("scrollbar", "1");
    hashParams.set("zoom", `${zoom}`);
    if (searchQuery) {
      hashParams.set("search", searchQuery);
    }
    return `${baseUrl}#${hashParams.toString()}`;
  }, [pdfUrl, zoom, searchQuery]);

  const handleZoomOut = () => setZoomIndex((idx) => Math.max(0, idx - 1));
  const handleZoomIn = () => setZoomIndex((idx) => Math.min(ZOOM_LEVELS.length - 1, idx + 1));

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
    setShowSearch(false);
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/subjects");
    }
  };

  const beginSelection = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((!selectionMode && !isLongPressSelecting) || !containerRef.current) return;
    if ((event.target as HTMLElement).closest("[data-selection-bubble]")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, event.clientX - rect.left);
    const y = Math.max(0, event.clientY - rect.top);
    selectionStartRef.current = { x, y };
    setSelectionRect({ x, y, width: 0, height: 0 });
    setSelectionBubble(null);
  };

  const beginSelectionAtPoint = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    selectionStartRef.current = { x, y };
    setSelectionRect({ x, y, width: 0, height: 0 });
    setSelectionBubble(null);
  };

  const updateSelection = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((!selectionMode && !isLongPressSelecting) || !selectionStartRef.current || !containerRef.current) return;
    if ((event.target as HTMLElement).closest("[data-selection-bubble]")) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
    const start = selectionStartRef.current;
    const left = Math.min(start.x, x);
    const top = Math.min(start.y, y);
    const width = Math.abs(x - start.x);
    const height = Math.abs(y - start.y);
    setSelectionRect({ x: left, y: top, width, height });
  };

  const finalizeSelection = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((!selectionMode && !isLongPressSelecting) || !selectionRect || !containerRef.current) return;
    if ((event.target as HTMLElement).closest("[data-selection-bubble]")) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    selectionStartRef.current = null;
    const rect = containerRef.current.getBoundingClientRect();
    let { x, y, width, height } = selectionRect;
    if (width < 8 && height < 8) {
      width = 64;
      height = 64;
      x = Math.max(0, Math.min(rect.width - width, x - width / 2));
      y = Math.max(0, Math.min(rect.height - height, y - height / 2));
      setSelectionRect({ x, y, width, height });
    }
    const bubbleLeft = Math.max(12, Math.min(rect.width - 180, x + width + 12));
    const bubbleTop = Math.max(12, Math.min(rect.height - 80, y));
    setSelectionBubble({ left: bubbleLeft, top: bubbleTop });
    setIsLongPressSelecting(false);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressPointRef.current = null;
    setIsLongPressSelecting(false);
  };

  const handleOverlayPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (selectionMode) {
      beginSelection(event);
      return;
    }
    if (!isCoarsePointer || event.pointerType !== "touch") return;
    if ((event.target as HTMLElement).closest("[data-selection-bubble]")) return;
    longPressPointRef.current = { x: event.clientX, y: event.clientY };
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressSelecting(true);
      beginSelectionAtPoint(event.clientX, event.clientY);
    }, 350);
  };

  const handleOverlayPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (selectionStartRef.current) {
      updateSelection(event);
      return;
    }
    if (!longPressPointRef.current) return;
    const dx = Math.abs(event.clientX - longPressPointRef.current.x);
    const dy = Math.abs(event.clientY - longPressPointRef.current.y);
    if (dx > 8 || dy > 8) {
      cancelLongPress();
    }
  };

  const handleOverlayPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (selectionStartRef.current) {
      finalizeSelection(event);
      return;
    }
    cancelLongPress();
  };

  const clearSelection = () => {
    setSelectionRect(null);
    setSelectionContext(null);
    setSelectionBubble(null);
  };

  const confirmSelection = () => {
    setIsSidekickOpen(true);
    setSelectionMode(false);
    if (selectionRect) {
      setSelectionContext(selectionRect);
    }
    setSelectionRect(null);
    setSelectionBubble(null);
    requestAnimationFrame(() => {
      questionInputRef.current?.focus();
    });
  };

  const handleSendQuestion = async () => {
    if (!selectionContext || !questionInput.trim()) return;
    setIsSending(true);
    setQuestionError(null);
    const result = await createSubjectQuestion({
      subjectId,
      questionText: questionInput.trim(),
      selectionRect: selectionContext,
      zoom,
    });
    setIsSending(false);
    if (result.error) {
      setQuestionError(result.error);
      setToastTone("error");
      setToastMessage("Erreur d'envoi. Réessaie.");
      return;
    }
    if (result.data) {
      const newMessage: QuestionMessage = {
        id: result.data.id,
        text: result.data.question_text,
        rect: result.data.selection_rect as SelectionRect,
        zoom: result.data.zoom,
        createdAt: result.data.created_at,
      };
      setMessages((prev) => [newMessage, ...prev]);
      setQuestionInput("");
      setToastTone("success");
      setToastMessage("Question envoyée");
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)]">
      <div ref={containerRef} className="absolute inset-0 overflow-y-auto">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <div className="h-10 w-10 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
              <p className="text-sm font-medium">Chargement du PDF…</p>
            </div>
          </div>
        )}
        <iframe
          key={src}
          src={src}
          title={title}
          className={`w-full h-full bg-white ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity`}
          onLoad={() => setIsLoading(false)}
        />
      </div>

      <div
        className={`absolute inset-0 z-10 ${
          selectionMode || isLongPressSelecting || isCoarsePointer ? "pointer-events-auto" : "pointer-events-none"
        }`}
        onPointerDown={handleOverlayPointerDown}
        onPointerMove={handleOverlayPointerMove}
        onPointerUp={handleOverlayPointerUp}
      >
        {selectionRect && (
          <div
            className="absolute border-2 border-amber-400 bg-amber-200/20 rounded-lg"
            style={{
              left: selectionRect.x,
              top: selectionRect.y,
              width: selectionRect.width,
              height: selectionRect.height,
            }}
          />
        )}
        {selectionBubble && (
          <div
            className="absolute rounded-xl border border-white/50 bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-lg shadow-slate-900/10 backdrop-blur-xl"
            style={{ left: selectionBubble.left, top: selectionBubble.top }}
            onPointerDown={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
            data-selection-bubble
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                  ?
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Zone sélectionnée</p>
                  <p className="text-[10px] text-slate-500">Associer cette zone à une question</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  clearSelection();
                }}
                className="h-5 w-5 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
                aria-label="Fermer"
              >
                <span className="block text-sm leading-none">×</span>
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Tu peux cliquer pour confirmer, ou annuler pour choisir une autre zone.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  confirmSelection();
                }}
                className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white"
              >
                Poser une question
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  clearSelection();
                }}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className={`absolute left-4 right-4 top-4 z-10 transition-all duration-200 ${
          controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/40 bg-white/80 px-4 py-2.5 shadow-lg shadow-slate-900/10 backdrop-blur-xl">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
            aria-label="Retour"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          <Link href="/subjects" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            Catalogue
          </Link>
          <div className="flex-1 min-w-[180px]">
            <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
            {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => {
                setSelectionMode((prev) => !prev);
                clearSelection();
              }}
              className={`h-8 w-8 rounded-full border text-slate-600 hover:bg-slate-50 ${
                selectionMode ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white"
              }`}
              aria-label="Mode selection"
            >
              <Crosshair className="h-4 w-4 mx-auto" />
            </button>
            {selectionMode && (
              <span className="hidden sm:inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                Sélection active
              </span>
            )}
            <button
              type="button"
              onClick={handleZoomOut}
              className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              aria-label="Zoom out"
            >
              <Minus className="h-4 w-4 mx-auto" />
            </button>
            <span className="text-xs font-semibold text-slate-600 w-10 text-center">{zoom}%</span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              aria-label="Zoom in"
            >
              <Plus className="h-4 w-4 mx-auto" />
            </button>
            <button
              type="button"
              onClick={() => setShowSearch((prev) => !prev)}
              className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              aria-label="Recherche"
            >
              <Search className="h-4 w-4 mx-auto" />
            </button>
          </div>

          {showSearch && (
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Rechercher dans le PDF"
                className="flex-1 md:w-60 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
              >
                OK
              </button>
            </form>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsSidekickOpen(true)}
        className="absolute bottom-6 right-6 z-10 flex items-center gap-2 rounded-full border border-white/40 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-xl shadow-slate-900/10 backdrop-blur-xl hover:bg-white"
        aria-label="Sidekick IA"
      >
        <Sparkles className="h-4 w-4 text-amber-500" />
        Sidekick IA
      </button>

      {isSidekickOpen && (
        <div className="absolute inset-0 z-20">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setIsSidekickOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white/90 border-l border-white/40 shadow-2xl shadow-slate-900/10 backdrop-blur-xl animate-in slide-in-from-right duration-200 ease-out">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Sidekick IA</p>
                  <p className="text-xs text-slate-500">Click-to-Ask</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSidekickOpen(false)}
                className="h-8 w-8 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
                aria-label="Fermer"
              >
                <span className="block text-lg leading-none">×</span>
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-slate-600">
                Selectionne une zone du PDF, pose ta question, et nous associons le contexte automatiquement.
              </p>
              {selectionRect && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-700">
                  Contexte capturé : x={Math.round(selectionRect.x)}, y={Math.round(selectionRect.y)}, w=
                  {Math.round(selectionRect.width)}, h={Math.round(selectionRect.height)}, zoom={zoom}%
                </div>
              )}
              {selectionContext && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-700">
                  Contexte en attente : x={Math.round(selectionContext.x)}, y={Math.round(selectionContext.y)}, w=
                  {Math.round(selectionContext.width)}, h={Math.round(selectionContext.height)}, zoom={zoom}%
                </div>
              )}
              <div className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2">
                <textarea
                  ref={questionInputRef}
                  value={questionInput}
                  onChange={(event) => setQuestionInput(event.target.value)}
                  placeholder="Pose ta question sur cette zone..."
                  className="w-full min-h-[80px] resize-none bg-transparent text-sm text-slate-700 focus:outline-none"
                />
              </div>
              {questionError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  Impossible d&apos;enregistrer la question ({questionError}).
                </div>
              )}
              {messages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-5 text-center text-xs text-slate-500">
                  <p className="font-semibold text-slate-700 mb-1">Aucune question pour l’instant</p>
                  <p>Selectionne un passage du PDF pour commencer une discussion.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-52 overflow-auto pr-1">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className="rounded-2xl border border-slate-200 bg-white/90 px-3 py-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wide text-slate-400">
                          Question {messages.length - index}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          Zone · {message.zoom}%
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mt-2">{message.text}</p>
                      <p className="text-[11px] text-slate-400 mt-2">
                        x={Math.round(message.rect.x)}, y={Math.round(message.rect.y)}, w=
                        {Math.round(message.rect.width)}, h={Math.round(message.rect.height)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={handleSendQuestion}
                disabled={!questionInput.trim() || !selectionContext || isSending}
                className="w-full rounded-xl bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSending ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </aside>
        </div>
      )}

      {toastMessage && (
        <div className="absolute bottom-24 right-6 z-30">
          <div
            className={`rounded-full px-4 py-2 text-xs font-semibold shadow-lg transition-all duration-200 ${
              toastTone === "success"
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : "bg-red-500 text-white shadow-red-500/30"
            } ${toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
          >
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}

export default SubjectReader;
