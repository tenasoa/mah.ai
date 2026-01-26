'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  X,
  ChevronDown,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  EXAM_TYPE_LABELS,
  EXAM_TYPE_COLORS,
  type ExamType,
  type SubjectMetadata,
} from '@/lib/types/subject';

interface SubjectFiltersProps {
  metadata: SubjectMetadata | null;
  className?: string;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

interface DropdownOption {
  value: string;
  label: string;
  count?: number;
}

// Filter Section Component (collapsible on mobile)
function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 last:border-b-0 pb-4 last:pb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 text-left lg:cursor-default"
      >
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </h4>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 lg:hidden transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`mt-3 transition-all duration-300 ${
          isOpen
            ? 'max-h-96 opacity-100 overflow-visible'
            : 'max-h-0 opacity-0 overflow-hidden lg:max-h-96 lg:opacity-100 lg:overflow-visible'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function DropdownSelect({
  value,
  options,
  placeholder,
  onChange,
  disabled,
}: {
  value: string | null;
  options: DropdownOption[];
  placeholder: string;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption
    ? selectedOption.count !== undefined
      ? `${selectedOption.label} (${selectedOption.count})`
      : selectedOption.label
    : placeholder;

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
      return;
    }
    const selectedIndex = selectedOption
      ? options.findIndex((option) => option.value === selectedOption.value) + 1
      : 0;
    setActiveIndex(selectedIndex);
  }, [isOpen, options, selectedOption]);

  useEffect(() => {
    if (!isOpen) return;
    const target = optionRefs.current[activeIndex];
    if (target) {
      target.focus();
    }
  }, [activeIndex, isOpen]);

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, options.length));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(options.length);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm
          transition-all duration-200 disabled:opacity-50
          ${isOpen ? 'border-amber-400 ring-4 ring-amber-100' : 'hover:border-amber-300'}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={`${selectedOption ? 'text-slate-700' : 'text-slate-400'}`}>
          {displayLabel}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 max-h-64 overflow-auto"
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
        >
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
            ref={(element) => {
              optionRefs.current[0] = element;
            }}
            className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            {placeholder}
          </button>
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              ref={(element) => {
                optionRefs.current[index + 1] = element;
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-amber-50 ${
                option.value === value ? 'text-amber-700 font-semibold' : 'text-slate-700'
              }`}
            >
              {option.label}
              {option.count !== undefined && (
                <span className="ml-2 text-xs text-slate-400">({option.count})</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Active Filter Badge
function ActiveFilterBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="p-0.5 rounded hover:bg-amber-200 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

export function SubjectFilters({ metadata, className = '' }: SubjectFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Get current filter values from URL
  const currentType = searchParams.get('type') as ExamType | null;
  const currentYear = searchParams.get('year');
  const currentMatiere = searchParams.get('matiere');
  const currentSerie = searchParams.get('serie');
  const currentQuery = searchParams.get('q');

  // Count active filters
  const activeFilterCount = [currentType, currentYear, currentMatiere, currentSerie, currentQuery].filter(Boolean).length;

  // Update URL with new params
  const updateFilters = useCallback(
    (key: string, value: string | null) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }

        // Reset to page 1 when filters change
        params.delete('page');

        const queryString = params.toString();
        router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [pathname, router]);

  if (!metadata) {
    return (
      <div className={`bg-white rounded-2xl border border-slate-200 p-5 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-20 bg-slate-200 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all duration-200 font-semibold text-sm
            ${isOpen || activeFilterCount > 0 
              ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10" 
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm"}
          `}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {isOpen ? "Masquer les filtres" : "Filtrer les sujets"}
          {activeFilterCount > 0 && (
            <span className={`
              ml-1 px-2 py-0.5 rounded-full text-[10px] font-black
              ${isOpen || activeFilterCount > 0 ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"}
            `}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Tout effacer
          </button>
        )}
      </div>

      {/* Filter Content Card */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full z-40 mt-2 animate-in slide-in-from-top-2 duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Critères de recherche</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Exam Types */}
              <FilterSection title="Type d'examen">
                <DropdownSelect
                  value={currentType ?? null}
                  placeholder="Tous les types"
                  onChange={(value) => updateFilters('type', value)}
                  disabled={isPending}
                  options={metadata.exam_types.map((type) => ({
                    value: type.value,
                    label: type.label,
                    count: type.count,
                  }))}
                />
              </FilterSection>

              {/* Years */}
              <FilterSection title="Année">
                <DropdownSelect
                  value={currentYear ?? null}
                  placeholder="Toutes les années"
                  onChange={(value) => updateFilters('year', value)}
                  disabled={isPending}
                  options={metadata.years.map((year) => ({
                    value: year.value.toString(),
                    label: year.value.toString(),
                    count: year.count,
                  }))}
                />
              </FilterSection>

              {/* Matieres */}
              <FilterSection title="Matière">
                <DropdownSelect
                  value={currentMatiere ?? null}
                  placeholder="Toutes les matières"
                  onChange={(value) => updateFilters('matiere', value)}
                  disabled={isPending}
                  options={metadata.matieres.map((mat) => ({
                    value: mat.value,
                    label: mat.label,
                    count: mat.count,
                  }))}
                />
              </FilterSection>

              {/* Series */}
              <FilterSection title="Série">
                <DropdownSelect
                  value={currentSerie ?? null}
                  placeholder="Toutes les séries"
                  onChange={(value) => updateFilters('serie', value)}
                  disabled={isPending}
                  options={metadata.series.map((serie) => ({
                    value: serie.value,
                    label: `Série ${serie.value}`,
                    count: serie.count,
                  }))}
                />
              </FilterSection>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`
                    relative h-6 w-11 rounded-full transition-colors duration-200
                    ${searchParams.get('free') === 'true' ? "bg-emerald-500" : "bg-slate-200"}
                  `}
                  onClick={() => {
                    const isFree = searchParams.get('free') === 'true';
                    updateFilters('free', isFree ? null : 'true');
                  }}
                >
                  <div
                    className={`
                      absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm
                      transition-transform duration-200
                      ${searchParams.get('free') === 'true' ? "translate-x-5" : "translate-x-0"}
                    `}
                  />
                </div>
                <span className="text-sm font-bold text-slate-600">Sujets gratuits</span>
              </label>

              <button 
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubjectFilters;
