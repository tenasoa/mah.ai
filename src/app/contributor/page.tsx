import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  BookOpen
} from "lucide-react";
import Image from "next/image";
import { ContributorDashboardHeader } from "./ContributorDashboardHeader";


export const dynamic = "force-dynamic";

export default async function ContributorDashboard() {
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
  if (!roles.includes("contributor") && !roles.includes("admin")) {
    redirect("/dashboard");
  }

  // Fetch my subjects
  const { data: mySubjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("uploaded_by", user.id)
    .order("created_at", { ascending: false });

  // Fetch stats
  const pendingCount = mySubjects?.filter(s => s.status === 'pending').length || 0;
  const publishedCount = mySubjects?.filter(s => s.status === 'published').length || 0;
  const rejectedCount = mySubjects?.filter(s => s.status === 'rejected').length || 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <ContributorDashboardHeader />


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">En attente</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingCount}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">En cours de validation</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Publiés</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{publishedCount}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">Visibles par les élèves</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Rejetés</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{rejectedCount}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">Nécessitent des corrections</p>
          </div>
        </div>

        {/* My Subjects List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              Mes contributions
            </h2>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mySubjects && mySubjects.length > 0 ? (
              mySubjects.map((subject) => (
                <div key={subject.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row gap-4 justify-between group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 relative overflow-hidden">
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
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {subject.title || subject.matiere_display}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="capitalize">{subject.exam_type}</span>
                        <span>•</span>
                        <span>{subject.year}</span>
                        <span>•</span>
                        <span>{subject.matiere_display}</span>
                      </div>
                      {subject.revision_comment && (
                         <p className="text-xs text-red-500 mt-2 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-100 dark:border-red-900/20 inline-block">
                           Note: {subject.revision_comment}
                         </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-start md:self-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      subject.status === 'published' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : subject.status === 'pending'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {subject.status === 'published' ? 'Publié' : subject.status === 'pending' ? 'En validation' : subject.status}
                    </span>
                    
                    <Link
                      href={`/subjects/${subject.id}?edit=true`}
                      className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 font-semibold text-sm transition-colors"
                    >
                      Modifier
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Aucune contribution</h3>
                <p className="text-slate-500 mb-6">Vous n&apos;avez pas encore ajouté de sujet.</p>
                <ContributorDashboardHeader />
              </div>
            )}
          </div>
        </div>

        {/* Global Catalog Link */}
        <div className="text-center pt-8">
           <Link href="/subjects" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center justify-center gap-2">
             <Search className="w-4 h-4" />
             Parcourir le catalogue complet pour corriger d&apos;autres sujets
           </Link>
        </div>
      </div>
    </div>
  );
}
