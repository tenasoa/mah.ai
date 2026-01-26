import { getPendingPayments, validatePayment, rejectPayment } from '@/app/actions/admin-payment';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AlertTriangle } from 'lucide-react';
import { AdminSidebarWrapper } from '@/components/layout/AdminSidebarWrapper';

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Double check admin access on page load
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, pseudo, etablissement, classe, avatar_url')
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

  const { payments, error } = await getPendingPayments();
  const pendingCount = payments.length;

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
        <article className="mah-card">
          <p className="text-xs text-slate-500">Paiements en attente</p>
          <p className="text-3xl font-bold mt-2">{pendingCount}</p>
        </article>
        <article className="mah-card">
          <p className="text-xs text-slate-500">Alertes IA</p>
          <p className="text-3xl font-bold mt-2 text-red-500">12</p>
        </article>
        <article className="mah-card">
          <p className="text-xs text-slate-500">Score moyen Grit</p>
          <p className="text-3xl font-bold mt-2 text-amber-600">72/100</p>
        </article>
        <article className="mah-card">
          <p className="text-xs text-slate-500">Étudiants actifs</p>
          <p className="text-3xl font-bold mt-2">1,240</p>
        </article>
      </div>

      <article className="mah-card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Paiements en attente</h2>
          <span className="text-xs text-slate-500">{pendingCount} en attente</span>
        </div>

        {pendingCount === 0 ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
            Aucun paiement en attente.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 text-xs uppercase tracking-wider">
                <tr className="text-left border-b border-slate-200">
                  <th className="py-3 pr-4">Élève</th>
                  <th className="py-3 pr-4">Filière</th>
                  <th className="py-3 pr-4">Code</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Statut</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-200">
                    <td className="py-4 pr-4">{payment.profile?.pseudo || 'Utilisateur inconnu'}</td>
                    <td className="py-4 pr-4 text-slate-500">{payment.profile?.filiere || 'N/A'}</td>
                    <td className="py-4 pr-4 font-mono">{payment.reference_code}</td>
                    <td className="py-4 pr-4 text-slate-500">
                      {new Date(payment.created_at).toLocaleString('fr-MG')}
                    </td>
                    <td className="py-4 pr-4 text-amber-600">En attente</td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <form action={async () => { 'use server'; await rejectPayment(payment.id); }}>
                          <button className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
                            Rejeter
                          </button>
                        </form>
                        <form action={async () => { 'use server'; await validatePayment(payment.id); }}>
                          <button className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
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
    </AdminSidebarWrapper>
  );
}
