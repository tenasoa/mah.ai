import { getAllUsers, updateUserRoles, updateUserCredits } from "@/app/actions/admin-users";
import { AdminSidebarWrapper } from "@/components/layout/AdminSidebarWrapper";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { 
  Users, 
  Search, 
  Shield, 
  Coins, 
  MoreVertical, 
  Mail, 
  Calendar,
  UserCheck
} from "lucide-react";
import { UserRole, ROLE_LABELS } from "@/lib/types/user";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect('/auth');

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles, pseudo, avatar_url')
    .eq('id', authUser.id)
    .single();

  const roles = (profile?.roles as string[]) || [];
  if (!roles.includes('admin') && !roles.includes('superadmin')) redirect('/dashboard');

  const { data: users, error } = await getAllUsers(q);

  const adminUser = {
    name: profile?.pseudo || 'Admin',
    subtitle: 'Administrateur',
    avatarUrl: profile?.avatar_url || undefined,
  };

  return (
    <AdminSidebarWrapper user={adminUser}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black font-outfit tracking-tight text-slate-900">Utilisateurs</h1>
          <p className="text-slate-500 mt-1">Gestion des membres, des rôles et des soldes.</p>
        </div>

        <form action="/admin/users" className="relative group w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            name="q"
            defaultValue={q}
            placeholder="Rechercher..." 
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <article className="mah-card p-0 overflow-hidden border-slate-200 bg-white shadow-xl rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <tr className="text-left">
                  <th className="px-8 py-5">Utilisateur</th>
                  <th className="px-6 py-5">Rôles</th>
                  <th className="px-6 py-5 text-center">Score / Crédits</th>
                  <th className="px-6 py-5">Dernière activité</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} className="w-10 h-10 rounded-xl object-cover" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                            {u.pseudo?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{u.pseudo || 'Anonyme'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{u.full_name || 'Pas de nom'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map(r => (
                          <span key={r} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-wider border border-indigo-100">
                            {ROLE_LABELS[r]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-amber-600 font-black text-sm">{u.grit_score} <span className="text-[10px] text-slate-400 font-bold uppercase">Grit</span></span>
                        <span className="text-indigo-600 font-black text-sm">{u.credits_balance} <span className="text-[10px] text-slate-400 font-bold uppercase">Crédits</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Calendar className="w-3 h-3" />
                        {u.last_activity_at ? new Date(u.last_activity_at).toLocaleDateString('fr-FR') : 'Jamais'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="py-20 text-center text-slate-400 italic">
              Aucun utilisateur trouvé.
            </div>
          )}
        </article>
      </div>
    </AdminSidebarWrapper>
  );
}
