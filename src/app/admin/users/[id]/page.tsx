import { getUserProfile } from "@/app/actions/admin-users";
import { AdminSidebarWrapper } from "@/components/layout/AdminSidebarWrapper";
import { ProfileForm } from "@/components/profile/profile-form";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, User, Ban, Calendar, Mail } from "lucide-react";
import Link from "next/link";
import { ROLE_LABELS } from "@/lib/types/user";
import Image from "next/image";

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect('/auth');

  // Check admin rights
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('roles, pseudo, avatar_url')
    .eq('id', authUser.id)
    .single();

  const adminRoles = (adminProfile?.roles as string[]) || [];
  if (!adminRoles.includes('admin') && !adminRoles.includes('superadmin')) redirect('/dashboard');

  const { data: targetUser, error } = await getUserProfile(id);

  if (error || !targetUser) {
    notFound();
  }

  const adminUserData = {
    name: adminProfile?.pseudo || 'Admin',
    subtitle: 'Administrateur',
    avatarUrl: adminProfile?.avatar_url || undefined,
  };

  return (
    <AdminSidebarWrapper user={adminUserData}>
      <div className="mb-8">
        <Link 
          href="/admin/users" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Info */}
        <div className="lg:w-1/3 space-y-6">
          <article className="mah-card p-8 bg-white border-slate-200 shadow-xl rounded-3xl text-center">
            <div className="relative inline-block mb-4">
              {targetUser.avatar_url ? (
                <Image
                  src={targetUser.avatar_url}
                  alt={targetUser.pseudo ? `Avatar de ${targetUser.pseudo}` : "Avatar utilisateur"}
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-3xl object-cover shadow-lg border-4 border-white"
                  unoptimized
                />
              ) : (
                <div className="w-32 h-32 rounded-3xl bg-slate-100 flex items-center justify-center font-black text-4xl text-slate-300 border-4 border-white">
                  {targetUser.pseudo?.charAt(0).toUpperCase()}
                </div>
              )}
              {targetUser.is_blocked && (
                <div className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-xl shadow-lg border-2 border-white">
                  <Ban className="w-4 h-4" />
                </div>
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-900">{targetUser.pseudo || 'Anonyme'}</h2>
            <p className="text-slate-500 text-sm font-medium mb-6">{targetUser.full_name || 'Pas de nom complet'}</p>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {targetUser.roles.map(r => (
                <span key={r} className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                  {ROLE_LABELS[r]}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-8">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Grit Score</p>
                <p className="text-xl font-black text-amber-600">{targetUser.grit_score}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Crédits</p>
                <p className="text-xl font-black text-indigo-600">{targetUser.credits_balance}</p>
              </div>
            </div>
          </article>

          <article className="mah-card p-6 bg-slate-900 text-white border-none rounded-3xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Informations système</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Mail className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase text-white/40 tracking-tighter">Email</p>
                  <p className="text-xs font-bold truncate">{targetUser.email || 'Non renseigné'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-white/40 tracking-tighter">Inscription</p>
                  <p className="text-xs font-bold">{new Date(targetUser.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Main Form */}
        <div className="lg:w-2/3">
          <article className="mah-card p-8 bg-white border-slate-200 shadow-xl rounded-3xl">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Modifier le profil</h3>
                <p className="text-slate-500 text-sm">Gestion des informations personnelles par l&apos;administrateur.</p>
              </div>
            </div>

            <ProfileForm userId={id} />
          </article>
        </div>
      </div>
    </AdminSidebarWrapper>
  );
}
