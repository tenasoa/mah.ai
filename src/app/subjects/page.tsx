import Link from 'next/link';
import { Suspense } from 'react';
import {
  FileText,
  Eye,
  Lock,
  Unlock,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { getSubjects, getSubjectMetadata } from '@/app/actions/subjects';
import {
  EXAM_TYPE_LABELS,
  EXAM_TYPE_COLORS,
  MATIERE_ICONS,
  type ExamType,
  type SubjectCard as SubjectCardType,
} from '@/lib/types/subject';
import { SubjectFilters } from '@/components/subjects/SubjectFilters';
import { SubjectsSearch } from '@/components/subjects/SubjectsSearch';

// Subject Card Component
function SubjectCard({
  subject,
}: {
  subject: SubjectCardType;
}) {
  const colors = EXAM_TYPE_COLORS[subject.exam_type] || EXAM_TYPE_COLORS.other;
  const icon = MATIERE_ICONS[subject.matiere] || '📚';
  const isAvailable = Boolean(subject.pdf_url || subject.pdf_storage_path);

  const cardContent = (
    <>
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${colors.bg} ${colors.border} border`}
          >
            {icon}
          </div>

          <div className="flex items-center gap-2">
            {!isAvailable && (
              <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold">
                PDF indisponible
              </span>
            )}
            {subject.is_free ? (
              <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                <Unlock className="w-3 h-3" />
                Gratuit
              </span>
            ) : subject.has_access ? (
              <span className="px-2 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1">
                <Unlock className="w-3 h-3" />
                Débloqué
              </span>
            ) : (
              <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {subject.credit_cost} crédit{subject.credit_cost > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Exam Type Badge */}
        <div className="mt-4">
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}
          >
            {EXAM_TYPE_LABELS[subject.exam_type]} {subject.year}
          </span>
        </div>

        {/* Title & Description */}
        <div className="mt-3 flex-1">
          <h3
            className={`font-bold text-slate-900 group-hover:text-amber-600 transition-colors ${
              'text-base'
            }`}
          >
            {subject.matiere_display}
          </h3>
          {subject.serie && (
            <p className="text-sm text-slate-500 mt-1">Série {subject.serie}</p>
          )}
          {subject.niveau && (
            <p className="text-xs text-slate-400 mt-0.5">{subject.niveau}</p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Eye className="w-3.5 h-3.5" />
            <span>{subject.view_count.toLocaleString()} vues</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
      {!isAvailable && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-2xl" />
      )}
    </>
  );

  if (!isAvailable) {
    return (
      <div
        className={`
          group relative mah-card overflow-hidden border-dashed border-slate-200 cursor-not-allowed
        `}
        aria-disabled="true"
        title="PDF indisponible pour ce sujet"
      >
        <div className="absolute right-4 top-3 z-10 rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 translate-y-1 transition group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none">
          PDF indisponible
        </div>
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/subjects/${subject.id}`}
      className={`
        group relative mah-card overflow-hidden
        hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/10
      `}
    >
      {cardContent}
    </Link>
  );
}

// Skeleton Loader
function SubjectCardSkeleton() {
  return (
    <div className="mah-card animate-pulse">
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-xl bg-slate-200" />
        <div className="h-6 w-16 rounded-lg bg-slate-200" />
      </div>
      <div className="mt-4 h-6 w-24 rounded-full bg-slate-200" />
      <div className="mt-3">
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-200 mt-2" />
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="h-4 w-16 rounded bg-slate-200" />
        <div className="h-5 w-5 rounded bg-slate-200" />
      </div>
    </div>
  );
}

// Subjects Grid Component
async function SubjectsGrid({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Parse filters from URL
  const examType = searchParams.type as ExamType | undefined;
  const year = searchParams.year ? parseInt(searchParams.year as string) : undefined;
  const matiere = searchParams.matiere as string | undefined;
  const serie = searchParams.serie as string | undefined;
  const search = searchParams.q as string | undefined;
  const isFree = searchParams.free === 'true';
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;

  // Fetch subjects
  const { data, error } = await getSubjects({
    filters: {
      exam_type: examType,
      year,
      matiere,
      serie,
      search,
      is_free: isFree || undefined,
    },
    sort: { field: 'year', direction: 'desc' },
    page,
    limit: 12,
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erreur: {error}</p>
      </div>
    );
  }

  if (!data || data.subjects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun sujet trouvé</h3>
        <p className="text-slate-500 max-w-md mx-auto mb-6">
          Essayez de modifier vos filtres ou d'effectuer une nouvelle recherche.
        </p>
        <Link
          href="/subjects"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
        >
          Voir tous les sujets
        </Link>
      </div>
    );
  }

  // Build pagination URL
  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (examType) params.set('type', examType);
    if (year) params.set('year', year.toString());
    if (matiere) params.set('matiere', matiere);
    if (serie) params.set('serie', serie);
    if (search) params.set('q', search);
    if (isFree) params.set('free', 'true');
    if (newPage > 1) params.set('page', newPage.toString());
    const queryString = params.toString();
    return `/subjects${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <>
      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{data.total}</span> sujet
          {data.total > 1 ? 's' : ''} trouvé{data.total > 1 ? 's' : ''}
          {search && (
            <span className="ml-1">
              pour &quot;<span className="text-amber-600 font-medium">{search}</span>&quot;
            </span>
          )}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
        {data.subjects.map((subject, index) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
          />
        ))}
      </div>

      {/* Pagination */}
      {(data.has_more || page > 1) && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={buildPageUrl(page - 1)}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              Précédent
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-slate-500">
            Page {page}
          </span>
          {data.has_more && (
            <Link
              href={buildPageUrl(page + 1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
            >
              Suivant
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </>
  );
}

// Filter Bar Wrapper (fetches metadata server-side)
async function FilterBarWrapper({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { data: metadata } = await getSubjectMetadata();
  return <SubjectFilters metadata={metadata} />;
}

// Main Page Component
export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <>
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-outfit">
              Catalogue des sujets
            </h1>
            <p className="text-slate-500 mt-1">
              Explore des centaines de sujets d&apos;examens et concours
            </p>
          </div>

          {/* Search (Client Component) */}
          <SubjectsSearch />
        </div>

        {/* Filters (Client Component with Server Data) */}
        <Suspense
          fallback={
            <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="space-y-4">
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 w-20 bg-slate-200 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <FilterBarWrapper searchParams={searchParams} />
        </Suspense>
      </header>

      {/* Subjects Grid */}
      <Suspense
        fallback={
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SubjectCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <SubjectsGrid searchParams={searchParams} />
      </Suspense>
    </>
  );
}
