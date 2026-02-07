"use client";

import { ContributorSubjectCreateModal } from "@/components/subjects/ContributorSubjectCreateModal";
import { createSubject } from "@/app/actions/subjects";
import { useRouter } from "next/navigation";
import { ExamType } from "@/lib/types/subject";
import { slugifyMatiere } from "@/lib/subject-utils";
import { EXAM_TYPE_LABELS } from "@/lib/types/subject";

export function ContributorDashboardHeader() {
  const router = useRouter();

  const handleCreateSubject = async (formData: FormData) => {
    const title = formData.get("title") as string;
    const exam_type = formData.get("exam_type") as ExamType;
    const year = parseInt(formData.get("year") as string);
    const nivel = formData.get("level") as string;
    const serie = formData.get("serie_departement") as string;
    const matiere_display = formData.get("matiere_display") as string;

    const matiere = slugifyMatiere(matiere_display);

    const { data, error } = await createSubject({
      title,
      exam_type,
      year,
      matiere,
      matiere_display,
      serie,
      niveau: nivel,
      status: "pending", // Contributors create pending subjects
    });

    if (data) {
      router.push(`/subjects/${data.id}?edit=true`);
    } else {
      console.error(error);
      alert("Erreur lors de la création du sujet: " + error);
    }
  };

  const examTypeEntries = Object.entries(EXAM_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
            Espace Contributeur
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
            Créateur
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
          Gérez vos contributions et aidez la communauté en ajoutant de nouveaux sujets d'examen.
        </p>
      </div>
      
      <ContributorSubjectCreateModal 
        examTypeEntries={examTypeEntries}
        onSubmit={handleCreateSubject}
      />
    </div>
  );
}
