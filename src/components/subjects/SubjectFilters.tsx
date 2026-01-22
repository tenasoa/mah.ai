'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Check,
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
        className={`mt-3 overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 lg:max-h-96 lg:opacity-100'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// Filter Chip Component
function FilterChip({
  label,
  count,
  active,
  onClick,
  color,
  disabled,
}: {
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
  color?: { bg: string; text: string };
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200 whitespace-nowrap disabled:opacity-50
        ${
          active
            ? color
              ? `${color.bg} ${color.text} ring-2 ring-offset-1 ring-current`
              : 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
            : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50'
        }
      `}
    >
      {active && <Check className="w-3 h-3" />}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full ${
            active
              ? 'bg-white/20 text-current'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
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

  // Toggle a filter value
  const toggleFilter = useCallback(
    (key: string, value: string) => {
      const currentValue = searchParams.get(key);
      updateFilters(key, currentValue === value ? null : value);
    },
    [searchParams, updateFilters]
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

          {/* Exam Types */}
          <FilterSection title="Type d'examen" defaultOpen={true}>
            <div className="flex flex-wrap gap-2">
              {metadata.exam_types.map((type) => {
                const colors = EXAM_TYPE_COLORS[type.value];
                return (
                  <FilterChip
                    key={type.value}
                    label={type.label}
                    count={type.count}
                    active={currentType === type.value}
                    onClick={() => toggleFilter('type', type.value)}
                    color={currentType === type.value ? colors : undefined}
                    disabled={isPending}
                  />
                );
              })}
            </div>
          </FilterSection>

          {/* Years */}
          {metadata.years.length > 0 && (
            <FilterSection title="Année" defaultOpen={true}>
              <div className="flex flex-wrap gap-2">
                {metadata.years.slice(0, 8).map((year) => (
                  <FilterChip
                    key={year.value}
                    label={year.value.toString()}
                    count={year.count}
                    active={currentYear === year.value.toString()}
                    onClick={() => toggleFilter('year', year.value.toString())}
                    disabled={isPending}
                  />
                ))}
                {metadata.years.length > 8 && (
                  <span className="self-center text-xs text-slate-400">
                    +{metadata.years.length - 8} autres
                  </span>
                )}
              </div>
            </FilterSection>
          )}

          {/* Matieres */}
          {metadata.matieres.length > 0 && (
            <FilterSection title="Matière" defaultOpen={true}>
              <div className="flex flex-wrap gap-2">
                {metadata.matieres.slice(0, 10).map((mat) => (
                  <FilterChip
                    key={mat.value}
                    label={mat.label}
                    count={mat.count}
                    active={currentMatiere === mat.value}
                    onClick={() => toggleFilter('matiere', mat.value)}
                    disabled={isPending}
                  />
                ))}
                {metadata.matieres.length > 10 && (
                  <span className="self-center text-xs text-slate-400">
                    +{metadata.matieres.length - 10} autres
                  </span>
                )}
              </div>
            </FilterSection>
          )}

          {/* Series */}
          {metadata.series.length > 0 && (
            <FilterSection title="Série" defaultOpen={false}>
              <div className="flex flex-wrap gap-2">
                {metadata.series.map((serie) => (
                  <FilterChip
                    key={serie.value}
                    label={`Série ${serie.value}`}
                    count={serie.count}
                    active={currentSerie === serie.value}
                    onClick={() => toggleFilter('serie', serie.value)}
                    disabled={isPending}
                  />
                ))}
              </div>
            </FilterSection>
          )}

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
