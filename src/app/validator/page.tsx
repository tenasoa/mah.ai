import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  BookOpen,
  User
} from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function ValidatorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles, pseudo")
    .eq("id", user.id)
    .single();

  const roles = (profile?.roles as string[]) || [];
  if (!roles.includes("validator") && !roles.includes("admin")) {
    redirect("/dashboard");
  }

  // Fetch pending subjects
  const { data: pendingSubjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  // Manually fetch profiles
  let subjectsWithProfiles = [];
  if (pendingSubjects && pendingSubjects.length > 0) {
    const userIds = Array.from(new Set(pendingSubjects.map(s => s.uploaded_by).filter(Boolean)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, pseudo")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    
    subjectsWithProfiles = pendingSubjects.map(s => ({
      ...s,
      profiles: s.uploaded_by ? profileMap.get(s.uploaded_by) : null
    }));
  } else {
    subjectsWithProfiles = [];
  }

  const pendingCount = subjectsWithProfiles.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-transparent bg-clip-text">
                Espace Validation
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                Validateur
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
              Examinez et validez les sujets soumis par la communauté pour garantir la qualité du contenu.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-4 mb-2 relative">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">À traiter</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingCount}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 relative">Sujets en attente de validation</p>
          </div>
        </div>

        {/* Pending Subjects List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              File d'attente
            </h2>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold">
              {pendingCount}
            </span>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {subjectsWithProfiles.length > 0 ? (
              subjectsWithProfiles.map((subject: any) => (
                <div key={subject.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row gap-6 justify-between group">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 relative overflow-hidden mt-1">
                      {subject.thumbnail_url ? (
                        <Image 
                          src={subject.thumbnail_url} 
                          alt="" 
                          fill 
                          className="object-cover" 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-300">
                           <BookOpen className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {subject.title || subject.matiere_display}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="capitalize font-semibold">{subject.exam_type}</span>
                        <span>•</span>
                        <span>{subject.year}</span>
                        <span>•</span>
                        <span>{subject.matiere_display}</span>
                        {subject.serie && (
                          <>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">Série {subject.serie}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full">
                          <User className="w-3 h-3" />
                          <span className="font-medium text-slate-600 dark:text-slate-300">{subject.profiles?.pseudo || "Anonyme"}</span>
                        </div>
                        <span>•</span>
                        <span>Soumis le {new Date(subject.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                    <Link
                      href={`/subjects/${subject.id}?edit=true`}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 active:translate-y-0.5"
                    >
                      Examiner
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-200">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Tout est à jour !</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Aucun sujet en attente de validation pour le moment. Bon travail !
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
