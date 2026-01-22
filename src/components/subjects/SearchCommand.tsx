'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  FileText,
  Clock,
  TrendingUp,
  ArrowRight,
  Command,
  Loader2,
  Sparkles,
  Lock,
  Unlock,
} from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import {
  EXAM_TYPE_LABELS,
  EXAM_TYPE_COLORS,
  MATIERE_ICONS,
  type SubjectCard,
  type ExamType,
} from '@/lib/types/subject';

// Types
interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RecentSearch {
  query: string;
  timestamp: number;
}

// Constants
const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = 'mah-ai-recent-searches';

// Helper to get recent searches from localStorage
function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Helper to save recent searches
function saveRecentSearch(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const searches = getRecentSearches();
    const filtered = searches.filter((s) => s.query !== query);
    const updated = [
      { query, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

// Helper to clear recent searches
function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

// Search Result Item Component
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
        ${
          isSelected
            ? 'bg-amber-50 border-amber-200'
            : 'hover:bg-slate-50 border-transparent'
        }
        border
      `}
    >
      {/* Icon */}
      <div
        className={`
          h-11 w-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0
          ${colors.bg} ${colors.border} border
        `}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 truncate">
            {subject.matiere_display}
          </span>
          <span
            className={`
              px-2 py-0.5 rounded-full text-[10px] font-bold
              ${colors.bg} ${colors.text}
            `}
          >
            {EXAM_TYPE_LABELS[subject.exam_type]} {subject.year}
          </span>
        </div>
        <p className="text-sm text-slate-500 truncate">
          {subject.serie ? `Série ${subject.serie}` : subject.niveau || 'Tous niveaux'}
        </p>
      </div>

      {/* Access Badge */}
      <div className="flex-shrink-0">
        {subject.is_free || subject.has_access ? (
          <Unlock className="w-4 h-4 text-emerald-500" />
        ) : (
          <Lock className="w-4 h-4 text-slate-400" />
        )}
      </div>

      {/* Arrow */}
      <ArrowRight
        className={`
          w-4 h-4 flex-shrink-0 transition-all
          ${isSelected ? 'text-amber-500 translate-x-1' : 'text-slate-300'}
        `}
      />
    </button>
  );
}

// Recent Search Item Component
function RecentSearchItem({
  search,
  isSelected,
  onClick,
  onRemove,
}: {
  search: RecentSearch;
  isSelected: boolean;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-xl
        transition-all duration-150
        ${
          isSelected
            ? 'bg-slate-100'
            : 'hover:bg-slate-50'
        }
      `}
    >
      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <span className="flex-1 text-sm text-slate-700 truncate">{search.query}</span>
      <button
        onClick={onRemove}
        className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </button>
  );
}

// Main SearchCommand Component
export function SearchCommand({ isOpen, onClose }: SearchCommandProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SubjectCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Debounced query
  const debouncedQuery = useDebounce(query, 200);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search when debounced query changes
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
          // Fallback: use server action through form submission
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

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const totalItems = results.length || recentSearches.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (results.length > 0) {
          handleSelectResult(results[selectedIndex]);
        } else if (recentSearches.length > 0 && !query) {
          handleSelectRecent(recentSearches[selectedIndex].query);
        } else if (query.trim()) {
          handleSearch();
        }
        break;
    }
  };

  // Handle selecting a result
  const handleSelectResult = useCallback(
    (subject: SubjectCard) => {
      saveRecentSearch(subject.matiere_display);
      onClose();
      router.push(`/subjects/${subject.id}`);
    },
    [onClose, router]
  );

  // Handle selecting a recent search
  const handleSelectRecent = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
    },
    []
  );

  // Handle removing a recent search
  const handleRemoveRecent = useCallback(
    (e: React.MouseEvent, searchQuery: string) => {
      e.stopPropagation();
      const updated = recentSearches.filter((s) => s.query !== searchQuery);
      setRecentSearches(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      }
    },
    [recentSearches]
  );

  // Handle full search
  const handleSearch = useCallback(() => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
      onClose();
      router.push(`/subjects?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, onClose, router]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
        <div
          ref={containerRef}
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
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher un sujet, une matière..."
              className="flex-1 text-lg text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
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
              <span>pour fermer</span>
            </div>
          </div>

          {/* Results Container */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {/* Loading State */}
            {isLoading && query.length >= 2 && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Recherche en cours...</span>
                </div>
              </div>
            )}

            {/* Search Results */}
            {!isLoading && results.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Résultats
                </div>
                {results.map((subject, index) => (
                  <SearchResultItem
                    key={subject.id}
                    subject={subject}
                    isSelected={index === selectedIndex}
                    onClick={() => handleSelectResult(subject)}
                  />
                ))}

                {/* View All Results Link */}
                <button
                  onClick={handleSearch}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium transition-colors"
                >
                  <span>Voir tous les résultats pour "{query}"</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* No Results */}
            {!isLoading && query.length >= 2 && results.length === 0 && (
              <div className="text-center py-10">
                <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-900 font-medium mb-1">Aucun résultat</p>
                <p className="text-sm text-slate-500">
                  Essayez avec d'autres mots-clés
                </p>
                <button
                  onClick={handleSearch}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 text-amber-700 font-medium hover:bg-amber-200 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Rechercher dans le catalogue
                </button>
              </div>
            )}

            {/* Recent Searches (when no query) */}
            {!query && recentSearches.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Recherches récentes
                  </span>
                  <button
                    onClick={() => {
                      clearRecentSearches();
                      setRecentSearches([]);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Effacer
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <RecentSearchItem
                    key={search.timestamp}
                    search={search}
                    isSelected={index === selectedIndex}
                    onClick={() => handleSelectRecent(search.query)}
                    onRemove={(e) => handleRemoveRecent(e, search.query)}
                  />
                ))}
              </div>
            )}

            {/* Quick Actions (when no query and no recent searches) */}
            {!query && recentSearches.length === 0 && (
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Suggestions
                </div>
                {[
                  { label: 'Mathématiques', query: 'mathematiques' },
                  { label: 'Physique-Chimie', query: 'physique' },
                  { label: 'Français', query: 'francais' },
                  { label: 'Baccalauréat 2024', query: 'baccalaureat 2024' },
                ].map((suggestion, index) => (
                  <button
                    key={suggestion.query}
                    onClick={() => setQuery(suggestion.query)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-xl
                      transition-all duration-150
                      ${index === selectedIndex ? 'bg-slate-100' : 'hover:bg-slate-50'}
                    `}
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
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Recherche intelligente</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Search Trigger Button Component
export function SearchTrigger({ onClick }: { onClick: () => void }) {
  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClick]);

  return (
    <button
      onClick={onClick}
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
  );
}

export default SearchCommand;
