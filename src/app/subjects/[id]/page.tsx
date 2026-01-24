import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getSubjectById } from "@/app/actions/subjects";
import { EXAM_TYPE_LABELS } from "@/lib/types/subject";
import { SubjectTeaser } from "@/components/subjects/SubjectTeaser";
import { SubjectReader } from "@/components/subjects/SubjectReader";

type PageProps = {
  params: Promise<{ id: string }>;
};

const fallbackPreviewLines = [
  "1. Définir les grandeurs et établir les hypothèses.",
  "2. Écrire l'équation principale et isoler l'inconnue.",
  "3. Vérifier l'ordre de grandeur du résultat obtenu.",
  "4. Interpréter le résultat dans le contexte du sujet.",
  "5. Conclure avec une justification claire et concise.",
  "6. Proposer une extension ou une vérification alternative.",
];

function buildPreviewLines(previewText: string | null) {
  if (!previewText) return fallbackPreviewLines;
  const lines = previewText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length >= 6) return lines;
  return [...lines, ...fallbackPreviewLines.slice(lines.length)];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { data } = await getSubjectById(resolvedParams.id);

  if (!data) {
    return {
      title: "Sujet introuvable",
      robots: "noindex, nofollow",
    };
  }

  const examLabel = EXAM_TYPE_LABELS[data.exam_type] || "Examen";
  const fullTitle = `${data.matiere_display} - ${examLabel} ${data.year} | Mah.ai`;
  const description =
    data.description ||
    `Révise le sujet ${data.matiere_display} ${examLabel} ${data.year} sur Mah.ai. ${data.is_free ? "Gratuit. " : ""}Questions et corrections avec IA Socratique.`;

  // Generate JSON-LD schema for educational material
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "EducationalMaterial",
    "@id": `https://mah.ai/subjects/${data.id}`,
    name: `${data.matiere_display} - ${examLabel} ${data.year}`,
    description: description,
    datePublished: data.published_at || data.created_at,
    dateModified: data.updated_at,
    inLanguage: "fr",
    isAccessibleForFree: data.is_free,
    publisher: {
      "@type": "Organization",
      name: "Mah.ai",
      url: "https://mah.ai",
      logo: "https://mah.ai/logo.png",
    },
    author: {
      "@type": "Organization",
      name: "Ministère de l'Éducation Madagascar",
    },
    educationalLevel: ["Lycée", "Baccalauréat"],
    learningResourceType: "ExamPaper",
    teaches: [data.matiere_display],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      ratingCount: data.view_count,
    },
  };

  return {
    title: fullTitle,
    description: description,
    keywords: [
      data.matiere_display,
      examLabel,
      data.year.toString(),
      "BACC",
      "révision",
      "Madagascar",
      data.serie ? `Série ${data.serie}` : "",
    ].filter(Boolean),
    openGraph: {
      title: fullTitle,
      description: description,
      type: "website",
      url: `https://mah.ai/subjects/${data.id}`,
      siteName: "Mah.ai",
      images: data.thumbnail_url
        ? [
            {
              url: data.thumbnail_url,
              width: 1200,
              height: 630,
              alt: `${data.matiere_display} - ${examLabel} ${data.year}`,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: description,
      images: data.thumbnail_url ? [data.thumbnail_url] : [],
    },
    robots: "index, follow",
    other: {
      "application/ld+json": JSON.stringify(jsonLd),
    },
  };
}

export const dynamic = "force-dynamic";

export default async function SubjectDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { data, error } = await getSubjectById(resolvedParams.id);

  if (error && error === "Sujet non trouvé") {
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

  if (data.has_access) {
    const resolvedPdfUrl =
      data.pdf_url && (data.pdf_url.startsWith("http://") || data.pdf_url.startsWith("https://"))
        ? data.pdf_url
        : null;
    if (!resolvedPdfUrl) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 text-slate-900">
          <div className="max-w-md text-center mah-card">
            <h1 className="text-2xl font-bold mb-2">PDF indisponible</h1>
            <p className="text-slate-500 mb-6">
              Le fichier n&apos;est pas encore disponible pour ce sujet. Reviens un peu plus tard.
            </p>
            <Link
              href="/subjects"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
            >
              Retour aux sujets
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full">
        <SubjectReader
          subjectId={data.id}
          pdfUrl={resolvedPdfUrl}
          title={data.matiere_display}
          subtitle={`${EXAM_TYPE_LABELS[data.exam_type]} ${data.year}${data.serie ? ` • Série ${data.serie}` : ""}`}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative z-10 px-4 sm:px-6 lg:px-10 py-12 max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          <Link
            href="/subjects"
            className="hover:text-slate-900 transition-colors"
          >
            Sujets
          </Link>
          <span className="text-slate-300">›</span>
          <Link
            href={`/subjects?type=${data.exam_type}`}
            className="hover:text-slate-900 transition-colors"
          >
            {EXAM_TYPE_LABELS[data.exam_type] || "Examen"}
          </Link>
          <span className="text-slate-300">›</span>
          <Link
            href={`/subjects?year=${data.year}`}
            className="hover:text-slate-900 transition-colors"
          >
            {data.year}
          </Link>
          <span className="text-slate-300">›</span>
          <span className="text-slate-700 font-medium">
            {data.matiere_display}
          </span>
        </nav>

        {/* Main Content */}
        <SubjectTeaser subject={data} previewLines={3} />

        {/* Hidden Content for SEO (non-visible to users but indexed) */}
        <div className="hidden" aria-hidden="true">
          <h2>Contenu indexable pour SEO</h2>
          <p>{data.matiere_display}</p>
          <p>
            {EXAM_TYPE_LABELS[data.exam_type]} {data.year}
          </p>
          {data.serie && <p>Série {data.serie}</p>}
          {data.niveau && <p>{data.niveau}</p>}
          {data.description && <p>{data.description}</p>}
          {data.preview_text && <p>{data.preview_text}</p>}
        </div>
      </div>
    </div>
  );
}
