"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface AdminSubjectCreateModalProps {
  requestId?: string;
  preFillMatiere?: string;
  preFillYear?: number;
  preFillSerie?: string;
  examTypeEntries: Array<{ value: string; label: string }>;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function AdminSubjectCreateModal({
  requestId,
  preFillMatiere,
  preFillYear,
  preFillSerie,
  examTypeEntries,
  onSubmit,
}: AdminSubjectCreateModalProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setSubmitting(true);
      await onSubmit(formData);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all shadow-lg"
      >
        <Plus className="w-4 h-4" />
        Ajouter un sujet
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-500" />
                  {requestId ? "Répondre à une demande" : "Nouveau sujet"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Créez une fiche puis éditez son contenu immédiatement.
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form action={handleSubmit} className="p-6 space-y-5">
              <input type="hidden" name="requestId" value={requestId || ""} />

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                  Titre du document
                </label>
                <input
                  name="title"
                  required
                  defaultValue={
                    preFillMatiere
                      ? `${preFillMatiere} ${preFillYear || ""}`.trim()
                      : ""
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-400 outline-none transition-all text-sm shadow-inner"
                  placeholder="ex: BACC D 2024"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                    Type
                  </label>
                  <select
                    name="exam_type"
                    className="w-full px-3 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-inner"
                  >
                    {examTypeEntries.map((entry) => (
                      <option key={entry.value} value={entry.value}>
                        {entry.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                    Année
                  </label>
                  <input
                    name="year"
                    type="number"
                    required
                    defaultValue={preFillYear || new Date().getFullYear()}
                    className="w-full px-3 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none text-xs shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                    Niveau
                  </label>
                  <input
                    name="level"
                    className="w-full px-3 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-xs shadow-inner"
                    placeholder="L1, M2..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                    Série
                  </label>
                  <input
                    name="serie_departement"
                    defaultValue={preFillSerie || ""}
                    className="w-full px-3 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-xs shadow-inner"
                    placeholder="ex: D, C, Droit, ENAM..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                  Matière
                </label>
                <input
                  name="matiere_display"
                  required
                  defaultValue={preFillMatiere || ""}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-400 outline-none transition-all text-sm shadow-inner"
                  placeholder="ex: Mathématiques"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                  Spécificité Concours (Optionnel)
                </label>
                <input
                  name="concours_type"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-xs shadow-inner"
                  placeholder="ENAM, Police, Gendarme..."
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer py-2 group">
                <div className="relative">
                  <input type="checkbox" name="is_free" className="peer sr-only" />
                  <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-amber-500 transition-colors border border-slate-200 dark:border-slate-600 shadow-inner" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-md" />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Sujet gratuit
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all shadow-lg disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" />
                  {submitting ? "Création..." : "+ créer & éditer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

