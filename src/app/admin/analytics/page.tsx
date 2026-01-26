import { getTrustGapAnalytics } from "@/app/actions/admin-payment";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebarWrapper } from "@/components/layout/AdminSidebarWrapper";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Users, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, pseudo, avatar_url')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/dashboard');

  const { stats, error } = await getTrustGapAnalytics();

  const adminUser = {
    name: profile?.pseudo || 'Admin',
    subtitle: 'Administrateur',
    avatarUrl: profile?.avatar_url || undefined,
  };

  return (
    <AdminSidebarWrapper user={adminUser} showUserProfile={true}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">Analytics & Trust Gap</h1>
          <p className="text-slate-500 mt-1">Analyse des performances et de l&apos;honnêteté des utilisateurs.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <BarChart3 className="w-4 h-4 text-violet-500" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Live Report</span>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <article className="mah-card bg-gradient-to-br from-white to-slate-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Requêtes Confiance</p>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.total_trust_requests}</p>
          <p className="text-[10px] text-slate-400 mt-2 italic">Total des accès immédiats demandés</p>
        </article>

        <article className="mah-card bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paiements Validés</p>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.confirmed_payments}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Conversion confirmée
          </p>
        </article>

        <article className="mah-card bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Revenu Total</p>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.total_revenue.toLocaleString()} <span className="text-sm font-normal text-slate-400">Ar</span></p>
          <p className="text-[10px] text-slate-400 mt-2 italic">Basé sur les paiements confirmés</p>
        </article>

        <article className={`mah-card bg-gradient-to-br from-white ${stats.trust_gap_index > 20 ? "to-red-50/30" : "to-violet-50/30"}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${stats.trust_gap_index > 20 ? "bg-red-50 text-red-600" : "bg-violet-50 text-violet-600"}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trust Gap Index</p>
          </div>
          <p className={`text-3xl font-black ${stats.trust_gap_index > 20 ? "text-red-600" : "text-slate-900"}`}>
            {stats.trust_gap_index.toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-400 mt-2 italic">Taux de suspens / risque de fraude</p>
        </article>
      </div>

      {/* Visual Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <article className="mah-card h-full">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Distribution de l&apos;Honnêteté
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-500">Paiements régularisés</span>
                <span className="text-emerald-600">{(stats.confirmed_payments / (stats.total_trust_requests || 1) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${(stats.confirmed_payments / (stats.total_trust_requests || 1) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-500">Accès en suspens (Attente)</span>
                <span className="text-amber-600">{stats.trust_gap_index.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-1000" 
                  style={{ width: `${stats.trust_gap_index}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-500">Tentatives rejetées (Fraude avérée)</span>
                <span className="text-red-600">{(stats.rejected_payments / (stats.total_trust_requests || 1) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-1000" 
                  style={{ width: `${(stats.rejected_payments / (stats.total_trust_requests || 1) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700">Note stratégique :</span> Si le Trust Gap Index dépasse les 30%, envisagez de réduire la durée de l&apos;accès immédiat ou d&apos;implémenter des restrictions plus strictes sur les nouveaux comptes.
            </p>
          </div>
        </article>

        <article className="mah-card flex flex-col justify-center items-center text-center p-12 bg-violet-600 text-white border-none shadow-violet-200">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse-soft">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black mb-4">Analyse de Performance</h2>
          <p className="text-violet-100 mb-8 max-w-sm">
            Vos revenus augmentent de manière organique grâce au système de confiance. Les élèves apprécient la rapidité d&apos;accès.
          </p>
          <div className="text-4xl font-black tracking-tighter">
            +12% <span className="text-sm font-bold uppercase block opacity-60">Croissance hebdo</span>
          </div>
        </article>
      </div>
    </AdminSidebarWrapper>
  );
}
