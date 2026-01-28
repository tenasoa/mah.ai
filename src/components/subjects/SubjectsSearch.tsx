'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Command,
  X,
  Loader2,
  FileText,
  ArrowRight,
  Clock,
  TrendingUp,
  Lock,
  Unlock,
  Plus,
} from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import {
  EXAM_TYPE_LABELS,
  EXAM_TYPE_COLORS,
  MATIERE_ICONS,
  type SubjectCard,
} from '@/lib/types/subject';
import { SubjectRequestModal } from './SubjectRequestModal';

// Search Result Item
function SearchResultItem({
  subject,
  isSelected,
  onClick,
}: {
  subject: SubjectCard;
  isSelected: boolean;
  onClick: () => void;
}) {
  const colors = EXAM_TYPE_COLORS[subject.exam_type] || EXAM_TYPE_COLORS.other;
  const icon = MATIERE_ICONS[subject.matiere] || '📚';

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 px-4 py-3 text-left rounded-xl
        transition-all duration-150
        ${isSelected ? 'bg-amber-50 border-amber-200' : 'hover:bg-slate-50 border-transparent'}
        border
      `}
    >
      <div
        className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${colors.bg} ${colors.border} border`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 truncate">
            {subject.matiere_display}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.bg} ${colors.text}`}>
            {EXAM_TYPE_LABELS[subject.exam_type]} {subject.year}
          </span>
        </div>
        <p className="text-sm text-slate-500 truncate">
          {subject.serie ? `Série ${subject.serie}` : subject.niveau || 'Tous niveaux'}
        </p>
      </div>

      <div className="flex-shrink-0">
        {subject.is_free || subject.has_access ? (
          <Unlock className="w-4 h-4 text-emerald-500" />
        ) : (
          <Lock className="w-4 h-4 text-slate-400" />
        )}
      </div>

      <ArrowRight
        className={`w-4 h-4 flex-shrink-0 transition-all ${isSelected ? 'text-amber-500 translate-x-1' : 'text-slate-300'}`}
      />
    </button>
  );
}

// Inner Search Component (uses useSearchParams)
function SubjectsSearchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [isOpen, setIsOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SubjectCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const debouncedQuery = useDebounce(query, 200);

  // Open modal
  const openSearch = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
  }, []);

  // Close modal
  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  }, []);

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openSearch, closeSearch, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Search when query changes
  useEffect(() => {
    const searchSubjects = async () => {
      if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/subjects/search?q=${encodeURIComponent(debouncedQuery)}&limit=8`
        );

        if (response.ok) {
          const data = await response.json();
          setResults(data.subjects || []);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchSubjects();
  }, [debouncedQuery]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle selecting a result
  const handleSelectResult = useCallback(
    (subject: SubjectCard) => {
      closeSearch();
      router.push(`/subjects/${subject.id}`);
    },
    [closeSearch, router]
  );

  // Handle full search
  const handleFullSearch = useCallback(() => {
    if (query.trim()) {
      closeSearch();
      router.push(`/subjects?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, closeSearch, router]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results.length > 0 && results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        } else if (query.trim()) {
          handleFullSearch();
        }
        break;
    }
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={openSearch}
        className="group flex items-center gap-3 w-full lg:w-[320px] px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-all duration-200"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Rechercher...</span>
        <div className="hidden sm:flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500 group-hover:bg-slate-200 transition-colors">
            <Command className="w-3 h-3 inline" />
          </kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500 group-hover:bg-slate-200 transition-colors">
            K
          </kbd>
        </div>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <>
          {/* Modal Container with Backdrop */}
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4 bg-slate-900/50 backdrop-blur-sm transition-all"
            onClick={closeSearch}
          >
            {/* Search Card */}
            <div
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-amber-500 animate-spin flex-shrink-0" />
                ) : (
                  <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Rechercher un sujet, une matière..."
                  className="flex-1 text-lg text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono">esc</kbd>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {/* Loading */}
                {isLoading && query.length >= 2 && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Recherche en cours...</span>
                    </div>
                  </div>
                )}

                {/* Results List */}
                {!isLoading && results.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Résultats ({results.length})
                    </div>
                    {results.map((subject, index) => (
                      <SearchResultItem
                        key={subject.id}
                        subject={subject}
                        isSelected={index === selectedIndex}
                        onClick={() => handleSelectResult(subject)}
                      />
                    ))}
                    <button
                      onClick={handleFullSearch}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium transition-colors"
                    >
                      <span>Voir tous les résultats pour "{query}"</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* No Results */}
                {!isLoading && query.length >= 2 && results.length === 0 && (
                  <div className="text-center py-10 px-4">
                    <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4 border border-amber-100 rotate-3">
                      <FileText className="w-7 h-7 text-amber-500" />
                    </div>
                    <p className="text-slate-900 font-bold mb-1">Aucun sujet trouvé</p>
                    <p className="text-sm text-slate-500 mb-6 max-w-[280px] mx-auto">
                      Nous n'avons pas encore de sujet pour <span className="text-amber-600 font-bold">"{query}"</span>.
                    </p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/20"
                      >
                        <Plus className="w-4 h-4" />
                        Demander ce sujet
                      </button>
                      <button
                        onClick={handleFullSearch}
                        className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                      >
                        Recherche approfondie
                      </button>
                    </div>
                  </div>
                )}

                {/* Suggestions (empty query) */}
                {!query && (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Suggestions populaires
                    </div>
                    {[
                      { label: 'Mathématiques', query: 'mathematiques' },
                      { label: 'Physique-Chimie', query: 'physique' },
                      { label: 'Français', query: 'francais' },
                      { label: 'Baccalauréat 2024', query: 'baccalaureat 2024' },
                      { label: 'BEPC 2024', query: 'bepc 2024' },
                    ].map((suggestion) => (
                      <button
                        key={suggestion.query}
                        onClick={() => setQuery(suggestion.query)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <TrendingUp className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{suggestion.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono shadow-sm">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono shadow-sm">↓</kbd>
                    <span>naviguer</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono shadow-sm">↵</kbd>
                    <span>sélectionner</span>
                  </div>
                </div>
                <span className="text-xs text-slate-400">Recherche instantanée</span>
              </div>
            </div>
          </div>
        </>
      )}

      <SubjectRequestModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
        initialMatiere={query}
      />
    </>
  );
}

// Main SubjectsSearch Component (wrapped with Suspense)
export function SubjectsSearch() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-3 w-full lg:w-[320px] px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-400">
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Rechercher...</span>
        </div>
      }
    >
      <SubjectsSearchInner />
    </Suspense>
  );
}

export default SubjectsSearch;
