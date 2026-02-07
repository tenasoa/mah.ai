import { getPendingPayments, validatePayment, rejectPayment } from '@/app/actions/admin-payment';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AlertTriangle } from 'lucide-react';
import { AdminSidebarWrapper } from '@/components/layout/AdminSidebarWrapper';

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Double check admin access on page load
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles, pseudo, etablissement, classe, avatar_url')
    .eq('id', user.id)
    .single();

  const roles = (profile?.roles as string[]) || [];
  if (!roles.includes('admin') && !roles.includes('superadmin')) {
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

  const { limit } = await searchParams;
  const pendingLimit = Math.max(1, Number(limit) || 25);
  const { payments, total, error } = await getPendingPayments(pendingLimit);
  const pendingCount = total;

  const adminUser = {
    name: profile?.pseudo || 'Admin',
    subtitle: 'Administrateur',
    avatarUrl: profile?.avatar_url || undefined,
  };

  return (
    <AdminSidebarWrapper
      user={adminUser}
      showUserProfile={true}
      defaultExpanded={false}
      pendingPaymentsCount={pendingCount}
    >
      <h1 className="text-3xl font-bold mb-6 font-outfit">Validation des paiements</h1>

      {error && (
        <div className="mb-6 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700">
          <p className="text-sm font-semibold">Erreur de chargement</p>
          <p className="text-xs text-red-600/80">{error}</p>
          {payments.length > 0 && (
            <p className="text-xs text-red-600/80">
              Les paiements sont affichés sans informations de profil.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <article className="mah-card bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Paiements en attente</p>
          <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{pendingCount}</p>
        </article>
        <article className="mah-card bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Alertes IA</p>
          <p className="text-3xl font-black mt-2 text-red-500">12</p>
        </article>
        <article className="mah-card bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Score moyen Grit</p>
          <p className="text-3xl font-black mt-2 text-amber-600">72/100</p>
        </article>
        <article className="mah-card bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Étudiants actifs</p>
          <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">1,240</p>
        </article>
      </div>

      <article className="mah-card bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Paiements en attente</h2>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{pendingCount} en attente</span>
        </div>

        {pendingCount === 0 ? (
          <div className="m-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-12 text-center text-slate-500 dark:text-slate-400 italic">
            Aucun paiement en attente.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Élève</th>
                  <th className="px-6 py-4">Filière</th>
                  <th className="px-6 py-4">Opérateur</th>
                  <th className="px-6 py-4">Crédits</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{payment.profile?.pseudo || 'Utilisateur inconnu'}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{payment.profile?.filiere || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-indigo-600 dark:text-indigo-400">+{payment.amount}</td>
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{payment.cost_mga.toLocaleString('fr-MG')} Ar</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-slate-100">{payment.payment_reference || 'Non fournie'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <form action={async () => { 'use server'; await rejectPayment(payment.id); }}>
                          <button className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-[10px] font-black uppercase tracking-widest transition-all border border-red-100 dark:border-red-800/50">
                            Rejeter
                          </button>
                        </form>
                        <form action={async () => { 'use server'; await validatePayment(payment.id); }}>
                          <button className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-100 dark:border-emerald-800/50">
                            Valider
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
      {pendingCount > pendingLimit && (
        <div className="mt-6 flex justify-center">
          <a
            href={`/admin/payments?limit=${pendingLimit + 25}`}
            className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
          >
            Charger plus
          </a>
        </div>
      )}
    </AdminSidebarWrapper>
  );
}
