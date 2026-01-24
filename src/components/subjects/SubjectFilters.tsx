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

// Main SubjectFilters Component
export function SubjectFilters({ metadata, className = '' }: SubjectFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
    <div className={`bg-white rounded-2xl border border-slate-200 ${className}`}>
      {/* Mobile Header */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="w-full flex items-center justify-between p-5 lg:hidden"
      >
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-5 h-5 text-slate-600" />
          <span className="font-semibold text-slate-900">Filtres</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform ${
            isMobileOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Filter Content */}
      <div
        className={`
          overflow-hidden transition-all duration-300 lg:block
          ${isMobileOpen ? 'max-h-[800px]' : 'max-h-0 lg:max-h-none'}
        `}
      >
        <div className="p-5 pt-0 lg:pt-5 space-y-4">
          {/* Active Filters & Clear */}
          {activeFilterCount > 0 && (
            <div className="flex items-center flex-wrap gap-2 pb-4 border-b border-slate-100">
              <span className="text-xs text-slate-500 mr-1">Filtres actifs:</span>
              {currentType && (
                <ActiveFilterBadge
                  label={EXAM_TYPE_LABELS[currentType]}
                  onRemove={() => updateFilters('type', null)}
                />
              )}
              {currentYear && (
                <ActiveFilterBadge
                  label={currentYear}
                  onRemove={() => updateFilters('year', null)}
                />
              )}
              {currentMatiere && (
                <ActiveFilterBadge
                  label={metadata.matieres.find((m) => m.value === currentMatiere)?.label || currentMatiere}
                  onRemove={() => updateFilters('matiere', null)}
                />
              )}
              {currentSerie && (
                <ActiveFilterBadge
                  label={`Série ${currentSerie}`}
                  onRemove={() => updateFilters('serie', null)}
                />
              )}
              {currentQuery && (
                <ActiveFilterBadge
                  label={`"${currentQuery}"`}
                  onRemove={() => updateFilters('q', null)}
                />
              )}
              <button
                onClick={clearAllFilters}
                disabled={isPending}
                className="ml-auto text-xs text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                {isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <X className="w-3 h-3" />
                )}
                Tout effacer
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isPending && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Mise à jour des résultats...</span>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Exam Types */}
            <FilterSection title="Type d'examen" defaultOpen={true}>
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
            {metadata.years.length > 0 && (
              <FilterSection title="Année" defaultOpen={true}>
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
            )}

            {/* Matieres */}
            {metadata.matieres.length > 0 && (
              <FilterSection title="Matière" defaultOpen={true}>
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
            )}

            {/* Series */}
            {metadata.series.length > 0 && (
              <FilterSection title="Série" defaultOpen={false}>
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
            )}
          </div>

          {/* Quick Filter: Free Only */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`
                  relative h-6 w-11 rounded-full transition-colors duration-200
                  ${searchParams.get('free') === 'true' ? 'bg-emerald-500' : 'bg-slate-200'}
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
                    ${searchParams.get('free') === 'true' ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </div>
              <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                Sujets gratuits uniquement
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubjectFilters;
