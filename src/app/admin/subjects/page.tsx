import {
  getSubjects,
  createSubject,
  deleteSubject,
  duplicateSubject,
} from '@/app/actions/subjects';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { 
  Pencil, 
  Copy,
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw,
  Trash2,
  Eye,
  FileText
} from 'lucide-react';
import { AdminSidebarWrapper } from '@/components/layout/AdminSidebarWrapper';
import Link from 'next/link';
import { EXAM_TYPE_LABELS, type ExamType, type SubjectStatus } from '@/lib/types/subject';
import { AdminSubjectsSearch } from '@/components/subjects/AdminSubjectsSearch';
import { AdminSubjectCreateModal } from '@/components/subjects/AdminSubjectCreateModal';

export default async function AdminSubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles, pseudo, avatar_url')
    .eq('id', user.id)
    .single();

  const roles = (profile?.roles as string[]) || [];
  if (!roles.includes('admin') && !roles.includes('superadmin') && !roles.includes('validator')) {
    redirect('/dashboard');
  }

  // Filtrage par statut et recherche depuis l'URL
  const currentStatus = resolvedSearchParams.status as SubjectStatus | undefined;
  const searchQuery = resolvedSearchParams.q as string | undefined;
  const limitParam = resolvedSearchParams.limit as string | undefined;
  const pageLimit = Math.max(1, Number(limitParam) || 25);
  const mine = resolvedSearchParams.mine as string | undefined;
  const onlyMine = mine === '1';

  // Pre-fill parameters from ticket request
  const requestId = resolvedSearchParams.requestId as string | undefined;
  const preFillMatiere = resolvedSearchParams.matiere as string | undefined;
  const preFillYear = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year as string) : undefined;
  const preFillSerie = resolvedSearchParams.serie as string | undefined;
  
  const { data } = await getSubjects({ 
    limit: pageLimit,
    filters: {
      status: currentStatus || undefined,
      search: searchQuery || undefined,
      uploaded_by: onlyMine ? user.id : undefined,
    }
  });
  const subjects = data?.subjects || [];
  const buildLimitUrl = (newLimit: number) => {
    const params = new URLSearchParams();
    if (currentStatus) params.set('status', currentStatus);
    if (searchQuery) params.set('q', searchQuery);
    if (requestId) params.set('requestId', requestId);
    if (onlyMine) params.set('mine', '1');
    params.set('limit', newLimit.toString());
    const query = params.toString();
    return `/admin/subjects${query ? `?${query}` : ''}`;
  };

  const adminUser = {
    name: profile?.pseudo || 'Admin',
    subtitle: 'Administrateur',
    avatarUrl: profile?.avatar_url || undefined,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-800/50"><CheckCircle2 className="w-3 h-3" /> Publié</span>;
      case 'pending': return <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-[10px] uppercase bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md border border-amber-100 dark:border-amber-800/50"><Clock className="w-3 h-3" /> En attente</span>;
      case 'revision': return <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800/50"><RotateCcw className="w-3 h-3" /> Révision</span>;
      case 'rejected': return <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md border border-red-100 dark:border-red-800/50"><XCircle className="w-3 h-3" /> Refusé</span>;
      default: return <span className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase">{status}</span>;
    }
  };

  return (
    <AdminSidebarWrapper user={adminUser} showUserProfile={true}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black font-outfit tracking-tight text-slate-900 dark:text-white">Catalogue Maître</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Contrôle qualité et validation des ressources pédagogiques.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <AdminSubjectCreateModal
            requestId={requestId}
            preFillMatiere={preFillMatiere}
            preFillYear={preFillYear}
            preFillSerie={preFillSerie}
            examTypeEntries={Object.entries(EXAM_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
            onSubmit={async (formData: FormData) => {
              'use server';
              const title = formData.get('title') as string;
              const exam_type = formData.get('exam_type') as ExamType;
              const year = parseInt(formData.get('year') as string);
              const matiere_display = formData.get('matiere_display') as string;
              const level = formData.get('level') as string;
              const concours_type = formData.get('concours_type') as string;
              const serie_departement = formData.get('serie_departement') as string;
              const formRequestId = formData.get('requestId') as string | null;

              if (title && exam_type && year && matiere_display) {
                const matiere = matiere_display
                  .toLowerCase()
                  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                  .replace(/[^a-z0-9]/g, "-")
                  .replace(/-+/g, "-")
                  .replace(/^-|-$/g, "");

                const exam_metadata: Record<string, string> = {};
                if (level) exam_metadata.level = level;
                if (concours_type) exam_metadata.concours_type = concours_type;
                if (serie_departement) exam_metadata.serie_departement = serie_departement;

                const result = await createSubject({
                  title,
                  exam_type,
                  year,
                  matiere,
                  matiere_display,
                  serie: serie_departement || undefined,
                  niveau: level || undefined,
                  is_free: formData.get('is_free') === 'on',
                  exam_metadata,
                  status: 'pending',
                  requestId: formRequestId || undefined,
                });

                if (result.data) {
                  redirect(`/subjects/${result.data.id}?edit=true`);
                }
              }
            }}
          />

          <Link
            href={onlyMine ? '/admin/subjects' : '/admin/subjects?mine=1'}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${onlyMine ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            <Clock className="w-4 h-4" />
            {onlyMine ? 'Afficher tous les sujets' : 'Mes sujets édités'}
          </Link>
        </div>

        <div>
          <article className="mah-card p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 min-h-[600px] rounded-3xl">
            <div className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Gestion des Flux</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{data?.total || subjects.length} ressources trouvées</p>
                </div>
                <AdminSubjectsSearch />
              </div>

              {/* Status Tabs (Horizontal Filter) */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit overflow-x-auto no-scrollbar">
                <Link href={onlyMine ? "/admin/subjects?mine=1" : "/admin/subjects"} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!currentStatus ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50"}`}>
                  Tous
                </Link>
                <Link href={onlyMine ? "/admin/subjects?status=pending&mine=1" : "/admin/subjects?status=pending"} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStatus === 'pending' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50"}`}>
                  <Clock className="w-3 h-3" />
                  En attente
                </Link>
                <Link href={onlyMine ? "/admin/subjects?status=published&mine=1" : "/admin/subjects?status=published"} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStatus === 'published' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50"}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  Publiés
                </Link>
                <Link href={onlyMine ? "/admin/subjects?status=revision&mine=1" : "/admin/subjects?status=revision"} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStatus === 'revision' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50"}`}>
                  <RotateCcw className="w-3 h-3" />
                  Révision
                </Link>
                <Link href={onlyMine ? "/admin/subjects?status=rejected&mine=1" : "/admin/subjects?status=rejected"} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStatus === 'rejected' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50"}`}>
                  <XCircle className="w-3 h-3" />
                  Refusés
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <tr className="text-left">
                    <th className="px-8 py-5">Contenu & Classification</th>
                    <th className="px-6 py-5 text-center">Type</th>
                    <th className="px-6 py-5 text-center">Année</th>
                    <th className="px-6 py-5 text-center">Statut</th>
                    <th className="px-8 py-5 text-right">Actions de Maître</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-base">{s.title}</span>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded tracking-tighter">ID: {s.id.substring(0, 8)}</span>
                            <span className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest">{s.matiere_display}</span>
                            {s.is_free && <span className="text-[9px] font-black text-emerald-500 uppercase border border-emerald-200 dark:border-emerald-800 px-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30">Free</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 dark:shadow-none">
                          {s.exam_type}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center font-black font-mono text-slate-400 dark:text-slate-500 text-base">{s.year}</td>
                      <td className="px-6 py-6 text-center">
                        {getStatusBadge(s.status || 'published')}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 transition-all">
                          <Link 
                            href={`/subjects/${s.id}?edit=true`}
                            className="p-2.5 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl transition-all shadow-sm border border-amber-100 dark:border-amber-800 bg-white dark:bg-slate-800"
                            title="Éditer Markdown"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>

                          <form
                            action={async () => {
                              'use server';
                              const result = await duplicateSubject(s.id);
                              if (result.data) {
                                redirect(`/subjects/${result.data.id}?edit=true`);
                              }
                            }}
                          >
                            <button
                              className="p-2.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all shadow-sm border border-indigo-100 dark:border-indigo-800 bg-white dark:bg-slate-800"
                              title="Dupliquer"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </form>
                          
                          <form action={async () => { 'use server'; await deleteSubject(s.id); }}>
                            <button 
                              type="submit"
                              className="p-2.5 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl transition-all shadow-sm border border-red-100 dark:border-red-800 bg-white dark:bg-slate-800"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>

                          <Link 
                            href={`/subjects/${s.id}`}
                            className="p-2.5 hover:bg-slate-900 dark:hover:bg-indigo-600 text-slate-600 dark:text-slate-400 hover:text-white rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            title="Voir & Valider"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {subjects.length === 0 && (
              <div className="py-32 text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <FileText className="w-10 h-10 text-slate-200 dark:text-slate-600" />
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white font-bold text-lg">Aucune ressource trouvée</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm italic">Modifiez vos filtres ou créez votre premier sujet avec “Ajouter un sujet”.</p>
                </div>
              </div>
            )}
          </article>
          {(data?.total || 0) > pageLimit && (
            <div className="mt-6 flex justify-center">
              <Link
                href={buildLimitUrl(pageLimit + 25)}
                className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
              >
                Charger plus
              </Link>
            </div>
          )}
        </div>
      </div>
    </AdminSidebarWrapper>
  );
}
