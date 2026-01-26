"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/profile/profile-form";
import Link from "next/link";
import { 
  Bell, 
  User, 
  Edit, 
  MapPin, 
  Calendar, 
  Mail, 
  Globe, 
  Target, 
  Heart, 
  CreditCard, 
  History, 
  Shield, 
  CheckCircle2, 
  Star,
  GraduationCap,
  Plus
} from "lucide-react";
import { getMyProfile, getPurchaseHistory } from "@/app/actions/profile";
import { ROLE_LABELS, type UserProfile } from "@/lib/types/user";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [purchaseTotal, setPurchaseTotal] = useState(0);
  const [purchaseLimit, setPurchaseLimit] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      
      const [{ data: profile }, { data: history, total }] = await Promise.all([
        getMyProfile(),
        getPurchaseHistory(purchaseLimit)
      ]);

      if (profile) setUserProfile(profile);
      if (history) setPurchaseHistory(history);
      if (typeof total === "number") setPurchaseTotal(total);

      setLoading(false);
    }
    loadData();
  }, [router, supabase, isEditing, purchaseLimit]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-900">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  const roleLabel = userProfile?.roles?.[0] ? ROLE_LABELS[userProfile.roles[0]] : "Élève";

  return (
    <div className="w-full pb-20">
      <div className="flex justify-end mb-6">
        <button className="h-10 w-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header Card */}
        <article className="mah-card p-0 overflow-hidden border-none shadow-2xl shadow-slate-200/50">
          {/* Cover Banner */}
          <div className="h-48 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 relative">
            {userProfile?.cover_url && (
              <img src={userProfile.cover_url} alt="Cover" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="px-8 pb-8">
            <div className="relative flex flex-col sm:flex-row sm:items-end justify-between -mt-16 mb-6 gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                <div className="relative group">
                  {userProfile?.avatar_url ? (
                    <img 
                      src={userProfile.avatar_url} 
                      alt="Avatar" 
                      className="h-32 w-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-3xl border-4 border-white bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-5xl font-black shadow-xl">
                      {userProfile?.pseudo?.charAt(0).toUpperCase() || "E"}
                    </div>
                  )}
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-amber-50 transition-all border border-slate-100 group-hover:scale-110 active:scale-95"
                  >
                    <Edit className="w-5 h-5 text-amber-600" />
                  </button>
                </div>

                <div className="text-center sm:text-left mb-2">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h1 className="text-3xl font-black font-outfit text-slate-900 tracking-tight">
                      {userProfile?.pseudo || "Utilisateur"}
                    </h1>
                    {userProfile?.subscription_status === 'premium' && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
                  </div>
                  <p className="text-slate-500 font-medium flex items-center gap-2 justify-center sm:justify-start mt-1">
                    <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-wider">{roleLabel}</span>
                    <span className="text-xs">• Member since {new Date(userProfile?.created_at || "").toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center">
                <div className="text-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grit Score</p>
                  <p className="text-xl font-black text-amber-600">{userProfile?.grit_score || 0}</p>
                </div>
                <Link 
                  href="/credits"
                  className="text-center px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-2xl border border-indigo-100 transition-all group"
                >
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center justify-center gap-1">
                    Crédits <Plus className="w-2 h-2 group-hover:scale-150 transition-transform" />
                  </p>
                  <p className="text-xl font-black text-indigo-600">{userProfile?.credits_balance || 0}</p>
                </Link>
              </div>
            </div>

            {isEditing ? (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-600"><Edit className="w-5 h-5" /></div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Configuration du Profil</h3>
                </div>
                <ProfileForm 
                  onSuccess={() => setIsEditing(false)} 
                  onCancel={() => setIsEditing(false)} 
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                {/* Left Column: Bio & Identity */}
                <div className="lg:col-span-2 space-y-8">
                  <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <User className="w-3 h-3" /> À propos
                    </h4>
                    <p className="text-slate-600 leading-relaxed italic">
                      {userProfile?.bio || "Aucune biographie renseignée."}
                    </p>
                  </section>

                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400"><Mail className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                        <p className="text-sm font-bold text-slate-700">{userProfile?.email || "Non renseigné"}</p>
                      </div>
                    </div>
                    {userProfile?.full_name && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400"><Shield className="w-4 h-4" /></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom Complet</p>
                          <p className="text-sm font-bold text-slate-700">{userProfile.full_name}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400"><MapPin className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localisation</p>
                        <p className="text-sm font-bold text-slate-700">{userProfile?.country ? `${userProfile.address || ""}, ${userProfile.country}` : "Non renseignée"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400"><Calendar className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Naissance</p>
                        <p className="text-sm font-bold text-slate-700">{userProfile?.birth_date ? new Date(userProfile.birth_date).toLocaleDateString('fr-FR') : "Non renseignée"}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Target className="w-3 h-3" /> Objectifs d'apprentissage
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {userProfile?.learning_goals?.length ? userProfile.learning_goals.map(goal => (
                        <span key={goal} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-wider border border-emerald-100">{goal}</span>
                      )) : <p className="text-xs text-slate-400 italic">Aucun objectif défini.</p>}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Heart className="w-3 h-3" /> Centres d'intérêt
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {userProfile?.interests?.length ? userProfile.interests.map(tag => (
                        <span key={tag} className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-black uppercase tracking-wider border border-rose-100">{tag}</span>
                      )) : <p className="text-xs text-slate-400 italic">Aucun intérêt renseigné.</p>}
                    </div>
                  </section>
                </div>

                {/* Right Column: Academics & Subscription */}
                <div className="space-y-8">
                  <section className="bg-indigo-900 text-white p-6 rounded-3xl shadow-xl shadow-indigo-200">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Abonnement</h4>
                      <div className="px-2 py-1 bg-white/10 rounded text-[10px] font-black uppercase tracking-widest">
                        {userProfile?.subscription_status || 'Free'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-indigo-200">Plan actuel</p>
                        <p className="text-lg font-black">{userProfile?.subscription_status === 'free' ? 'Gratuit' : userProfile?.subscription_status?.toUpperCase()}</p>
                      </div>
                    </div>
                    <Link 
                      href="/credits"
                      className="block w-full py-3 bg-white text-indigo-900 rounded-2xl font-black uppercase tracking-widest text-[10px] text-center hover:bg-indigo-50 transition-colors"
                    >
                      Changer de plan
                    </Link>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <GraduationCap className="w-3 h-3" /> Académique
                    </h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Niveau & Classe</p>
                        <p className="text-xs font-bold text-slate-700">{userProfile?.education_level} {userProfile?.classe ? `• ${userProfile.classe}` : ""}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Filière</p>
                        <p className="text-xs font-bold text-slate-700">{userProfile?.filiere || "N/A"}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Établissement</p>
                        <p className="text-xs font-bold text-slate-700">{userProfile?.etablissement || "N/A"}</p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* History & Transactions Sections (Tabs potential) */}
        {!isEditing && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <article className="mah-card">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" />
                Historique d'achat
              </h3>
              <div className="space-y-4">
                {purchaseHistory.length > 0 ? purchaseHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 font-black text-sm">+{item.amount}</div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">{item.payment_method}</p>
                        <p className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleDateString('fr-MG')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">{item.cost_mga.toLocaleString()} Ar</p>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span>
                    </div>
                  </div>
                )) : <p className="text-center py-10 text-slate-400 text-xs italic">Aucune transaction trouvée.</p>}
                {purchaseTotal > purchaseLimit && (
                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => setPurchaseLimit((prev) => prev + 10)}
                      className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                    >
                      Charger plus
                    </button>
                  </div>
                )}
              </div>
            </article>

            <article className="mah-card">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                Paramètres de confidentialité
              </h3>
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed mb-4">Ces réglages contrôlent ce que les autres utilisateurs voient sur votre profil public.</p>
                <div className="space-y-3">
                  {[
                    { key: 'show_full_name', label: 'Afficher mon nom complet' },
                    { key: 'show_email', label: 'Afficher mon email' },
                    { key: 'show_birth_date', label: 'Afficher ma date de naissance' },
                    { key: 'show_address', label: 'Afficher mon adresse' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-700">{setting.label}</span>
                      {userProfile?.privacy_settings?.[setting.key as keyof typeof userProfile.privacy_settings] ? (
                        <div className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[9px] font-black uppercase">Public</div>
                      ) : (
                        <div className="px-2 py-1 bg-slate-200 text-slate-500 rounded text-[9px] font-black uppercase">Privé</div>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-4 py-3 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Modifier les accès
                </button>
              </div>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
