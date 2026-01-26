import { getAllSettings, updateSetting } from "@/app/actions/admin-settings";
import { AdminSidebarWrapper } from "@/components/layout/AdminSidebarWrapper";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { 
  Settings, 
  Save, 
  Coins, 
  Lock, 
  Globe, 
  AlertTriangle,
  Zap,
  Star
} from "lucide-react";

export default async function AdminSettingsPage() {
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

  const { data: settings } = await getAllSettings();
  
  const creditPrices = settings.find(s => s.key === 'credit_prices')?.value || { "10": 5000, "50": 22500, "100": 40000 };
  const maintenanceMode = settings.find(s => s.key === 'maintenance_mode')?.value === 'true';

  const adminUser = {
    name: profile?.pseudo || 'Admin',
    subtitle: 'Administrateur',
    avatarUrl: profile?.avatar_url || undefined,
  };

  return (
    <AdminSidebarWrapper user={adminUser}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black font-outfit tracking-tight text-slate-900">Paramètres</h1>
          <p className="text-slate-500 mt-1">Configuration globale de la plateforme mah.ai.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Credit Pricing Section */}
        <article className="mah-card p-8 bg-white border-slate-200 shadow-xl rounded-[40px]">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
              <Coins className="w-5 h-5" />
            </div>
            Tarification des Crédits
          </h2>

          <form action={async (formData: FormData) => {
            'use server';
            const p10 = parseInt(formData.get('p10') as string);
            const p50 = parseInt(formData.get('p50') as string);
            const p100 = parseInt(formData.get('p100') as string);
            await updateSetting('credit_prices', { "10": p10, "50": p50, "100": p100 });
          }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Pack 10 (Ar)</label>
                <input name="p10" type="number" defaultValue={creditPrices["10"]} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none focus:border-amber-400" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Pack 50 (Ar)</label>
                <input name="p50" type="number" defaultValue={creditPrices["50"]} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none focus:border-amber-400" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Pack 100 (Ar)</label>
                <input name="p100" type="number" defaultValue={creditPrices["100"]} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none focus:border-amber-400" />
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20">
              <Save className="w-4 h-4" /> Enregistrer les prix
            </button>
          </form>
        </article>

        {/* Maintenance & Access Section */}
        <article className="mah-card p-8 bg-white border-slate-200 shadow-xl rounded-[40px]">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
              <Globe className="w-5 h-5" />
            </div>
            Maintenance & Système
          </h2>

          <div className="space-y-8">
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-900">Mode Maintenance</p>
                <p className="text-xs text-slate-500">Désactive l'accès à l'application pour les élèves.</p>
              </div>
              <form action={async () => {
                'use server';
                await updateSetting('maintenance_mode', maintenanceMode ? 'false' : 'true');
              }}>
                <button className={`relative w-12 h-6 rounded-full transition-colors ${maintenanceMode ? 'bg-red-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${maintenanceMode ? 'left-7' : 'left-1'}`} />
                </button>
              </form>
            </div>

            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Zone de danger</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Modifier ces paramètres affecte immédiatement tous les utilisateurs. Soyez vigilant lors de la mise à jour des prix ou de l'activation de la maintenance.
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </AdminSidebarWrapper>
  );
}
