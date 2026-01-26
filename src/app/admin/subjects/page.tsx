import { getSubjects, createSubject, updateSubjectStatus, deleteSubject } from '@/app/actions/subjects';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { 
  Plus, 
  Pencil, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw,
  Trash2,
  Filter,
  Eye,
  FileText
} from 'lucide-react';
import { AdminSidebarWrapper } from '@/components/layout/AdminSidebarWrapper';
import Link from 'next/link';
import { EXAM_TYPE_LABELS, type ExamType, type SubjectStatus } from '@/lib/types/subject';
import { AdminSubjectsSearch } from '@/components/subjects/AdminSubjectsSearch';

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
  
  const { data } = await getSubjects({ 
    limit: pageLimit,
    filters: {
      status: currentStatus || undefined,
      search: searchQuery || undefined
    }
  });
  let subjects = data?.subjects || [];
  const buildLimitUrl = (newLimit: number) => {
    const params = new URLSearchParams();
    if (currentStatus) params.set('status', currentStatus);
    if (searchQuery) params.set('q', searchQuery);
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
      case 'published': return <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100"><CheckCircle2 className="w-3 h-3" /> Publié</span>;
      case 'pending': return <span className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] uppercase bg-amber-50 px-2 py-1 rounded-md border border-amber-100"><Clock className="w-3 h-3" /> En attente</span>;
      case 'revision': return <span className="flex items-center gap-1.5 text-blue-600 font-bold text-[10px] uppercase bg-blue-50 px-2 py-1 rounded-md border border-blue-100"><RotateCcw className="w-3 h-3" /> Révision</span>;
      case 'rejected': return <span className="flex items-center gap-1.5 text-red-600 font-bold text-[10px] uppercase bg-red-50 px-2 py-1 rounded-md border border-red-100"><XCircle className="w-3 h-3" /> Refusé</span>;
      default: return <span className="text-slate-400 font-bold text-[10px] uppercase">{status}</span>;
    }
  };

  return (
    <AdminSidebarWrapper user={adminUser} showUserProfile={true}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black font-outfit tracking-tight text-slate-900">Catalogue Maître</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Contrôle qualité et validation des ressources pédagogiques.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        {/* Left Panel: Form */}
        <div className="xl:col-span-1 space-y-6 sticky top-8">
          <article className="mah-card bg-white border-slate-200 shadow-2xl shadow-slate-200/40 p-8 rounded-3xl">
            <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                <Plus className="w-5 h-5" />
              </div>
              Nouveau Sujet
            </h2>
            
            <form action={async (formData: FormData) => {
              'use server';
              const title = formData.get('title') as string;
              const exam_type = formData.get('exam_type') as ExamType;
              const year = parseInt(formData.get('year') as string);
              const matiere_display = formData.get('matiere_display') as string;
              const level = formData.get('level') as string;
              const concours_type = formData.get('concours_type') as string;
              const serie_departement = formData.get('serie_departement') as string;

              if (title && exam_type && year && matiere_display) {
                // Auto-générer l'ID de la matière à partir du nom
                const matiere = matiere_display
                  .toLowerCase()
                  .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlever accents
                  .replace(/[^a-z0-9]/g, "-") // Remplacer tout sauf lettres/chiffres par -
                  .replace(/-+/g, "-") // Éviter doubles --
                  .replace(/^-|-$/g, ""); // Nettoyer début/fin

                const exam_metadata: any = {};
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
                  is_free: formData.get('is_free') === 'on',
                  exam_metadata,
                  status: 'pending' 
                });
                
                if (result.data) {
                  redirect(`/subjects/${result.data.id}?edit=true`);
                }
              }
            }} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Titre du document</label>
                <input name="title" required className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-400 outline-none transition-all text-sm shadow-inner" placeholder="ex: BACC D 2024" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Type</label>
                  <select name="exam_type" className="w-full px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 outline-none text-xs cursor-pointer hover:bg-slate-100 transition-colors shadow-inner">
                    {Object.entries(EXAM_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Année</label>
                  <input name="year" type="number" required defaultValue={new Date().getFullYear()} className="w-full px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 outline-none text-xs shadow-inner" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Niveau</label>
                  <input name="level" className="w-full px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-xs shadow-inner" placeholder="L1, M2..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Série</label>
                  <input name="serie_departement" className="w-full px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-xs shadow-inner" placeholder="ex: D, C, Droit, ENAM..." />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Matière</label>
                <input name="matiere_display" required className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-400 outline-none transition-all text-sm shadow-inner" placeholder="ex: Mathématiques" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Spécificité Concours (Optionnel)</label>
                <input name="concours_type" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-xs shadow-inner" placeholder="ENAM, Police, Gendarme..." />
              </div>

              <label className="flex items-center gap-3 cursor-pointer py-2 group">
                <div className="relative">
                  <input type="checkbox" name="is_free" className="peer sr-only" />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-amber-500 transition-colors border border-slate-200 shadow-inner" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-md" />
                </div>
                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Sujet gratuit</span>
              </label>

              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20 mt-4 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Créer & Éditer
              </button>
            </form>
          </article>
        </div>

        {/* Right Panel: Management Table */}
        <div className="xl:col-span-3">
          <article className="mah-card p-0 overflow-hidden border-slate-200 shadow-2xl shadow-slate-200/40 bg-white min-h-[600px] rounded-3xl">
            <div className="px-8 py-6 bg-white border-b border-slate-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Gestion des Flux</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data?.total || subjects.length} ressources trouvées</p>
                </div>
                <AdminSubjectsSearch />
              </div>

              {/* Status Tabs (Horizontal Filter) */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit overflow-x-auto no-scrollbar">
                <Link href="/admin/subjects" className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!currentStatus ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-white/50"}`}>
                  Tous
                </Link>
                <Link href="/admin/subjects?status=pending" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStatus === 'pending' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-slate-500 hover:bg-white/50"}`}>
                  <Clock className="w-3 h-3" />
                  En attente
                </Link>
                <Link href="/admin/subjects?status=published" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStatus === 'published' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:bg-white/50"}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  Publiés
                </Link>
                <Link href="/admin/subjects?status=revision" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStatus === 'revision' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:bg-white/50"}`}>
                  <RotateCcw className="w-3 h-3" />
                  Révision
                </Link>
                <Link href="/admin/subjects?status=rejected" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStatus === 'rejected' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-slate-500 hover:bg-white/50"}`}>
                  <XCircle className="w-3 h-3" />
                  Refusés
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <tr className="text-left">
                    <th className="px-8 py-5">Contenu & Classification</th>
                    <th className="px-6 py-5 text-center">Type</th>
                    <th className="px-6 py-5 text-center">Année</th>
                    <th className="px-6 py-5 text-center">Statut</th>
                    <th className="px-8 py-5 text-right">Actions de Maître</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-base">{s.title}</span>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded tracking-tighter">ID: {s.id.substring(0, 8)}</span>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{s.matiere_display}</span>
                            {s.is_free && <span className="text-[9px] font-black text-emerald-500 uppercase border border-emerald-200 px-1.5 rounded-full bg-emerald-50">Free</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10">
                          {s.exam_type}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center font-black font-mono text-slate-400 text-base">{s.year}</td>
                      <td className="px-6 py-6 text-center">
                        {getStatusBadge(s.status || 'published')}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 transition-all">
                          <Link 
                            href={`/subjects/${s.id}?edit=true`}
                            className="p-2.5 hover:bg-amber-100 text-amber-600 rounded-xl transition-all shadow-sm border border-amber-100 bg-white"
                            title="Éditer Markdown"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          
                          <form action={async () => { 'use server'; await deleteSubject(s.id); }}>
                            <button 
                              className="p-2.5 hover:bg-red-100 text-red-600 rounded-xl transition-all shadow-sm border border-red-100 bg-white"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>

                          <Link 
                            href={`/subjects/${s.id}`}
                            className="p-2.5 hover:bg-slate-900 text-slate-600 hover:text-white rounded-xl transition-all shadow-sm border border-slate-200 bg-white"
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
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
                  <FileText className="w-10 h-10 text-slate-200" />
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-lg">Aucune ressource trouvée</p>
                  <p className="text-slate-400 text-sm italic">Modifiez vos filtres ou créez votre premier sujet à gauche.</p>
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
