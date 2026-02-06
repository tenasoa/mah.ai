"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { updateSubjectMetadata } from "@/app/actions/subjects";
import type { ExamType } from "@/lib/types/subject";

interface SubjectMetadataEditorProps {
  subjectId: string;
  initialTitle: string;
  initialExamType: ExamType;
  initialYear: number;
  initialMatiereDisplay: string;
  initialSerie?: string | null;
  initialNiveau?: string | null;
  initialIsFree?: boolean;
  initialConcoursType?: string;
  examTypeEntries: Array<{ value: ExamType; label: string }>;
}

export function SubjectMetadataEditor({
  subjectId,
  initialTitle,
  initialExamType,
  initialYear,
  initialMatiereDisplay,
  initialSerie,
  initialNiveau,
  initialIsFree,
  initialConcoursType,
  examTypeEntries,
}: SubjectMetadataEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      setMessage(null);
      setError(null);

      const title = String(formData.get("title") || "").trim();
      const examType = String(formData.get("exam_type") || "") as ExamType;
      const year = Number(formData.get("year") || new Date().getFullYear());
      const matiereDisplay = String(formData.get("matiere_display") || "").trim();
      const level = String(formData.get("level") || "").trim();
      const serieDepartement = String(formData.get("serie_departement") || "").trim();
      const concoursType = String(formData.get("concours_type") || "").trim();
      const isFree = formData.get("is_free") === "on";

      const result = await updateSubjectMetadata(subjectId, {
        title,
        exam_type: examType,
        year,
        matiere_display: matiereDisplay,
        level: level || undefined,
        serie_departement: serieDepartement || undefined,
        concours_type: concoursType || undefined,
        is_free: isFree,
      });

      if (!result.success) {
        setError(result.error || "Impossible de mettre à jour le sujet");
        return;
      }

      setMessage("Métadonnées mises à jour.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action={onSubmit} className="space-y-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Titre
          </label>
          <input
            name="title"
            required
            defaultValue={initialTitle}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Matière
          </label>
          <input
            name="matiere_display"
            required
            defaultValue={initialMatiereDisplay}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Type
          </label>
          <select
            name="exam_type"
            defaultValue={initialExamType}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
          >
            {examTypeEntries.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Année
          </label>
          <input
            name="year"
            type="number"
            required
            defaultValue={initialYear}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Niveau
          </label>
          <input
            name="level"
            defaultValue={initialNiveau || ""}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Série
          </label>
          <input
            name="serie_departement"
            defaultValue={initialSerie || ""}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Type concours
          </label>
          <input
            name="concours_type"
            defaultValue={initialConcoursType || ""}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
          />
        </div>

        <label className="inline-flex items-center gap-3 pt-6">
          <input
            name="is_free"
            type="checkbox"
            defaultChecked={Boolean(initialIsFree)}
            className="rounded border-slate-300"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">Sujet gratuit</span>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
          {message && <p className="text-xs text-emerald-600 font-semibold">{message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? "Mise à jour..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

