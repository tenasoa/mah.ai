import { getSubjects, createSubject } from '@/app/actions/subjects';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AlertTriangle, Plus, FileText, Search, ExternalLink } from 'lucide-react';
import { AdminSidebarWrapper } from '@/components/layout/AdminSidebarWrapper';
import Link from 'next/link';
import { EXAM_TYPE_LABELS, type ExamType } from '@/lib/types/subject';

export default async function AdminSubjectsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, pseudo')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Accès Refusé</h1>
          <p className="text-slate-500">Vous n&apos;avez pas les droits d&apos;administration.</p>
        </div>
      </div>
    );
  }

  const { data } = await getSubjects({ limit: 50 });
  const subjects = data?.subjects || [];

  const adminUser = {
    name: profile?.pseudo || 'Admin',
    subtitle: 'Administrateur',
  };

  return (
    <AdminSidebarWrapper user={adminUser} showUserProfile={true}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Gestion des sujets</h1>
          <p className="text-slate-500 mt-1">Créez et modifiez les contenus pédagogiques.</p>
        </div>
        
        {/* Create Subject Action (Simplified for now) */}
        <div className="flex gap-2">
          {/* We'll use a simple form in a modal or separate page in a real app, 
              but for now let's just add a link or a quick-add form */}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Quick Create Form */}
        <div className="xl:col-span-1">
          <article className="mah-card sticky top-8">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              Nouveau sujet
            </h2>
            
            <form action={async (formData: FormData) => {
              'use server';
              const title = formData.get('title') as string;
              const exam_type = formData.get('exam_type') as ExamType;
              const year = parseInt(formData.get('year') as string);
              const matiere = formData.get('matiere') as string;
              const matiere_display = formData.get('matiere_display') as string;
              const serie = formData.get('serie') as string;

              if (title && exam_type && year && matiere && matiere_display) {
                const result = await createSubject({
                  title,
                  exam_type,
                  year,
                  matiere,
                  matiere_display,
                  serie: serie || undefined,
                  is_free: formData.get('is_free') === 'on',
                });
                
                if (result.data) {
                  redirect(`/subjects/${result.data.id}?edit=true`);
                }
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titre complet</label>
                <input name="title" required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-sm" placeholder="Ex: Mathématiques - Bac D 2024" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type d'examen</label>
                  <select name="exam_type" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm bg-white">
                    {Object.entries(EXAM_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Année</label>
                  <input name="year" type="number" required defaultValue={new Date().getFullYear()} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Matière (id)</label>
                  <input name="matiere" required className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm" placeholder="ex: mathematiques" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Matière (affichage)</label>
                  <input name="matiere_display" required className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm" placeholder="ex: Mathématiques" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Série (Optionnel)</label>
                <input name="serie" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm" placeholder="ex: D, C, A, OSE..." />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" name="is_free" id="is_free" className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
                <label htmlFor="is_free" className="text-sm font-medium text-slate-700">Sujet gratuit</label>
              </div>

              <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                Créer et éditer le contenu
              </button>
            </form>
          </article>
        </div>

        {/* Right: Subjects List */}
        <div className="xl:col-span-2">
          <article className="mah-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Liste des sujets ({subjects.length})</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-amber-400 transition-all" placeholder="Rechercher..." />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-500 text-xs uppercase tracking-wider">
                  <tr className="text-left border-b border-slate-200">
                    <th className="py-3 pr-4">Sujet</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Année</th>
                    <th className="py-3 pr-4">Statut</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-semibold text-slate-900">{s.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.id}</div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {EXAM_TYPE_LABELS[s.exam_type]}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-slate-500 font-medium">{s.year}</td>
                      <td className="py-4 pr-4">
                        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Publié
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Link 
                          href={`/subjects/${s.id}?edit=true`}
                          className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-bold"
                        >
                          Éditer
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {subjects.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                Aucun sujet trouvé. Utilisez le formulaire pour en créer un.
              </div>
            )}
          </article>
        </div>
      </div>
    </AdminSidebarWrapper>
  );
}
