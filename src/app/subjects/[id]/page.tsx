import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import { getSubjectById } from '@/app/actions/subjects';
import { EXAM_TYPE_COLORS, EXAM_TYPE_LABELS } from '@/lib/types/subject';

type PageProps = {
  params: { id: string };
};

const fallbackPreviewLines = [
  '1. Définir les grandeurs et établir les hypothèses.',
  '2. Écrire l\'équation principale et isoler l\'inconnue.',
  '3. Vérifier l\'ordre de grandeur du résultat obtenu.',
  '4. Interpréter le résultat dans le contexte du sujet.',
  '5. Conclure avec une justification claire et concise.',
  '6. Proposer une extension ou une vérification alternative.',
];

function buildPreviewLines(previewText: string | null) {
  if (!previewText) return fallbackPreviewLines;
  const lines = previewText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length >= 6) return lines;
  return [...lines, ...fallbackPreviewLines.slice(lines.length)];
}

export async function generateMetadata({ params }: PageProps) {
  const { data } = await getSubjectById(params.id);
  if (!data) {
    return { title: 'Sujet introuvable' };
  }
  const examLabel = EXAM_TYPE_LABELS[data.exam_type] || 'Examen';
  return {
    title: `${data.matiere_display} - ${examLabel} ${data.year}`,
    description: data.description || `Sujet ${data.matiere_display} ${examLabel} ${data.year}`,
  };
}

export const dynamic = 'force-dynamic';

export default async function SubjectDetailPage({ params }: PageProps) {
  const { data, error } = await getSubjectById(params.id);

  if (error && error === 'Sujet non trouvé') {
    notFound();
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Impossible de charger le sujet.</p>
          {error && <p className="text-xs text-slate-400 mt-2">{error}</p>}
          <Link
            href="/subjects"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold"
          >
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  const subject = data;
  const colors = EXAM_TYPE_COLORS[subject.exam_type] || EXAM_TYPE_COLORS.other;
  const examLabel = EXAM_TYPE_LABELS[subject.exam_type] || 'Examen';
  const previewLines = buildPreviewLines(subject.preview_text);
  const visibleLines = previewLines.slice(0, 3);
  const blurredLines = previewLines.slice(3);
  const isLocked = !subject.has_access && !subject.is_free;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mah-ambient">
        <div className="mah-blob mah-blob-1" />
        <div className="mah-blob mah-blob-2" />
        <div className="mah-blob mah-blob-3" />
      </div>

      <main className="relative z-10 px-4 sm:px-6 lg:px-10 py-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <Link href="/subjects" className="hover:text-slate-900">
            Catalogue
          </Link>
          <span>/</span>
          <span>{subject.matiere_display}</span>
        </div>

        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
              {examLabel} {subject.year}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-outfit mt-3">
              {subject.matiere_display}
            </h1>
            <p className="text-slate-500 mt-2">
              {subject.title}
              {subject.serie ? ` • Série ${subject.serie}` : ''}
              {subject.niveau ? ` • ${subject.niveau}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {subject.has_access || subject.is_free ? (
              <Link
                href={subject.pdf_url || '#'}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Ouvrir le sujet
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30"
              >
                Débloquer le sujet complet
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <article className="lg:col-span-2 mah-card overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Aperçu du sujet</h2>
              {isLocked && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                  <Lock className="w-3 h-3" />
                  Aperçu public
                </span>
              )}
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              {visibleLines.map((line, index) => (
                <p key={`visible-${index}`} className="leading-relaxed">
                  {line}
                </p>
              ))}
            </div>

            <div className="relative mt-6">
              <div className={`${isLocked ? 'blur-sm select-none' : ''} space-y-4 text-sm text-slate-600`}>
                {blurredLines.map((line, index) => (
                  <p key={`blur-${index}`} className="leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>

              {isLocked && (
                <div className="absolute inset-0 flex items-end justify-center">
                  <div className="mb-2 w-full max-w-md rounded-2xl border border-amber-200 bg-white/90 backdrop-blur p-4 text-center shadow-xl">
                    <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">Le reste du sujet est protégé.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Débloque l&apos;accès pour voir l&apos;intégralité.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </article>

          <aside className="mah-card bg-gradient-to-br from-white via-white to-amber-50/40 border-amber-100/60">
            <h3 className="text-lg font-semibold">Détails rapides</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Matière</span>
                <span className="font-semibold text-slate-900">{subject.matiere_display}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Année</span>
                <span className="font-semibold text-slate-900">{subject.year}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Type</span>
                <span className="font-semibold text-slate-900">{examLabel}</span>
              </div>
              {subject.serie && (
                <div className="flex items-center justify-between">
                  <span>Série</span>
                  <span className="font-semibold text-slate-900">{subject.serie}</span>
                </div>
              )}
              {subject.niveau && (
                <div className="flex items-center justify-between">
                  <span>Niveau</span>
                  <span className="font-semibold text-slate-900">{subject.niveau}</span>
                </div>
              )}
              {!subject.is_free && (
                <div className="flex items-center justify-between">
                  <span>Crédit</span>
                  <span className="font-semibold text-slate-900">{subject.credit_cost}</span>
                </div>
              )}
            </div>

            {isLocked && (
              <Link
                href="/auth"
                className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Se connecter pour débloquer
              </Link>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}
