"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Minus, Plus, Sparkles } from "lucide-react";

interface SubjectReaderProps {
  pdfUrl: string;
  title: string;
  subtitle?: string;
}

const ZOOM_LEVELS = [80, 100, 120, 140, 160];

export function SubjectReader({ pdfUrl, title, subtitle }: SubjectReaderProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [zoomIndex, setZoomIndex] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidekickOpen, setIsSidekickOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    };
  }, []);

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
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white/90 border-l border-white/40 shadow-2xl shadow-slate-900/10 backdrop-blur-xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Sidekick IA</p>
                  <p className="text-xs text-slate-500">Interface en cours</p>
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
                Le mode click-to-ask arrive bientot. Cette zone accueillera le chat contextuel.
              </p>
              <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-4 text-xs text-slate-400">
                Placeholder • Conversation • Suggestions • Historique
              </div>
              <button
                type="button"
                onClick={() => setIsSidekickOpen(false)}
                className="w-full rounded-xl bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Continuer la lecture
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default SubjectReader;
