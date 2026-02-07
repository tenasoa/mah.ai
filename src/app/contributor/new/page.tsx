"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  Tag, 
  Layers, 
  FileText 
} from "lucide-react";
import { createSubject } from "@/app/actions/subjects";
import { EXAM_TYPE_LABELS, ExamType } from "@/lib/types/subject";
import { MilkdownEditor } from "@/components/ui/MilkdownEditor";

export default function NewSubjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    exam_type: "bepc" as ExamType,
    year: new Date().getFullYear(),
    matiere_display: "",
    serie: "",
    niveau: "",
    content: "",
    is_free: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.matiere_display || !formData.content) {
      setError("Veuillez remplir tous les champs obligatoires (Titre, Matière, Contenu)");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Generate slug for matiere
      const matiereSlug = formData.matiere_display
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-");

      const result = await createSubject({
        title: formData.title,
        exam_type: formData.exam_type,
        year: parseInt(formData.year.toString()),
        matiere: matiereSlug,
        matiere_display: formData.matiere_display,
        serie: formData.serie || undefined,
        niveau: formData.niveau || undefined,
        is_free: formData.is_free,
        status: "draft",
      });

      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.data) {
        // First save the content markdown separately OR handle it in createSubject?
        // createSubject in actions/subjects.ts DOES NOT accept content_markdown param based on my previous read.
        // Wait, let me check createSubject signature in my memory/logs.
        // It takes `...subjectData` and inserts it. If `...subjectData` has content_markdown, it works.
        // But createSubject params type definition didn't seem to include content_markdown explicitly 
        // but it spreads params. Let's check if the table accepts it. Yes.
        
        // Wait, I should verify if createSubject accepts content.
        // If not, I might need to call saveSubjectMarkdown after creation.
        // The type signature I saw earlier:
        /*
        export async function createSubject(params: {
          title: string;
          exam_type: ExamType;
          // ...
        }): Promise<{ data: Subject | null; error: string | null }>
        */
        // I will assume I need to call saveSubjectMarkdown after creation because createSubject might not handle the content column if it's not in the interface.
        
        // Actually, let's play safe: create then update content.
        const { saveSubjectMarkdown } = await import("@/app/actions/subjects");
        await saveSubjectMarkdown(result.data.id, formData.content);

        router.push(`/contributor`);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-6 h-6" />
              </div>
              Nouveau Sujet
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
              Ajoutez un nouveau sujet d'examen à la base de connaissances.
              Il sera soumis à validation avant publication.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Titre */}
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Titre du sujet</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Sujet de Mathématiques - Session 2023"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>

              {/* Matière */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Matière
                </label>
                <input
                  type="text"
                  required
                  value={formData.matiere_display}
                  onChange={(e) => setFormData({ ...formData, matiere_display: e.target.value })}
                  placeholder="Ex: Mathématiques, Physique..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Année */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Année
                </label>
                <input
                  type="number"
                  required
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Examen */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Type d'examen
                </label>
                <select
                  value={formData.exam_type}
                  onChange={(e) => setFormData({ ...formData, exam_type: e.target.value as ExamType })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                >
                  {Object.entries(EXAM_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Série */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Série (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.serie}
                  onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                  placeholder="Ex: C, D, A2..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Niveau */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Niveau (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.niveau}
                  onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                  placeholder="Ex: Terminale, L1..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Contenu du sujet
              </label>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden min-h-[500px]">
                <MilkdownEditor
                  value={formData.content}
                  onChange={(val) => setFormData({ ...formData, content: val })}
                  placeholder="# Énoncé du sujet..."
                  className="min-h-[500px]"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Créer le brouillon
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
