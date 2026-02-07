"use client";

import { useState } from "react";
import { Plus, X, BookOpen, GraduationCap, Calendar, Tag, Layers } from "lucide-react";
import { EXAM_TYPE_LABELS, ExamType } from "@/lib/types/subject";

interface ContributorSubjectCreateModalProps {
  examTypeEntries: Array<{ value: string; label: string }>;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function ContributorSubjectCreateModal({
  examTypeEntries,
  onSubmit,
}: ContributorSubjectCreateModalProps) {
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
        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
      >
        <Plus className="w-5 h-5" />
        Ajouter un sujet
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 font-outfit">
                  <Plus className="w-6 h-6 text-indigo-500" />
                  Nouveau Sujet
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Remplissez les détails pour créer votre sujet. Vous pourrez l'éditer juste après.
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Titre du document
                </label>
                <input
                  name="title"
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold shadow-inner"
                  placeholder="ex: BACC D Mathématiques 2024"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <GraduationCap className="w-3 h-3" />
                    Type d'examen
                  </label>
                  <select
                    name="exam_type"
                    className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-inner appearance-none"
                  >
                    {examTypeEntries.map((entry) => (
                      <option key={entry.value} value={entry.value}>
                        {entry.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Année
                  </label>
                  <input
                    name="year"
                    type="number"
                    required
                    defaultValue={new Date().getFullYear()}
                    className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none text-xs font-bold shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <Layers className="w-3 h-3" />
                    Niveau
                  </label>
                  <input
                    name="level"
                    className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-xs font-bold shadow-inner"
                    placeholder="ex: Terminale"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <Tag className="w-3 h-3" />
                    Série
                  </label>
                  <input
                    name="serie_departement"
                    className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-xs font-bold shadow-inner"
                    placeholder="ex: D, C, A2..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <BookOpen className="w-3 h-3" />
                  Matière
                </label>
                <input
                  name="matiere_display"
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold shadow-inner"
                  placeholder="ex: Mathématiques"
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:translate-y-0.5 disabled:opacity-50 rounded-2xl"
                >
                  <Plus className="w-4 h-4" />
                  {submitting ? "Création..." : "Créer & éditer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function FileText({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  );
}
