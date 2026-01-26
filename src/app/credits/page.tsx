import { getCreditBalance, getCreditPrices, getTransactions } from "@/app/actions/credits";
import { PricingTiers } from "@/components/credits/PricingTiers";
import { SubscriptionPlans } from "@/components/credits/SubscriptionPlans";
import { TransactionHistory } from "@/components/credits/TransactionHistory";
import { Coins, Zap, ShieldCheck, History, Crown, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; tx_limit?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { tab = 'packs', tx_limit } = await searchParams;
  const txLimit = Math.max(1, Number(tx_limit) || 10);

  if (!user) {
    redirect("/auth");
  }

  const [balance, dbPrices, transactionsResult] = await Promise.all([
    getCreditBalance(),
    getCreditPrices(),
    getTransactions(txLimit)
  ]);
  const transactions = transactionsResult.data;
  const totalTransactions = transactionsResult.total;

  // Merge explicit defaults AFTER db prices to force update
  const prices = {
    ...dbPrices,
    "10": 5000,
    "50": 22500,
    "100": 40000,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Header & Balance Card */}
      <header className="relative overflow-hidden rounded-[40px] bg-slate-900 text-white p-8 lg:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black font-outfit tracking-tight mb-4">
              Recharge & <span className="text-amber-400">Plans</span>
            </h1>
            <p className="text-slate-400 max-w-md text-lg leading-relaxed">
              Choisis la formule qui te convient pour booster tes révisions avec l'excellence de l'IA.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[32px] text-center min-w-[240px]">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Solde actuel</p>
            <div className="flex items-center justify-center gap-3">
              <Coins className="w-8 h-8 text-amber-400 fill-amber-400" />
              <span className="text-5xl font-black font-mono tracking-tighter">{balance}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-widest">Crédits disponibles</p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 bg-slate-100 rounded-3xl border border-slate-200 shadow-inner">
          <a 
            href="/credits?tab=packs"
            className={`
              flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
              ${tab === 'packs' ? "bg-white text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700"}
            `}
          >
            <Zap className={`w-4 h-4 ${tab === 'packs' ? "text-amber-500" : ""}`} />
            Packs Crédits
          </a>
          <a 
            href="/credits?tab=subs"
            className={`
              flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
              ${tab === 'subs' ? "bg-white text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700"}
            `}
          >
            <Crown className={`w-4 h-4 ${tab === 'subs' ? "text-indigo-500" : ""}`} />
            Abonnements
          </a>
        </div>
      </div>

      {/* Conditional Content */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {tab === 'packs' ? (
          <>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Packs de recharge</h2>
            </div>
            <PricingTiers prices={prices} />
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                <Crown className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Formules Illimitées</h2>
            </div>
            <SubscriptionPlans />
          </>
        )}
      </section>

      {/* Info & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        <div className="lg:col-span-1 space-y-6">
          <article className="mah-card bg-indigo-50 border-indigo-100 p-8">
            <h3 className="text-lg font-black text-indigo-900 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Pourquoi mah.ai ?
            </h3>
            <ul className="space-y-4">
              {[
                "IA Socratique Malagasy 24/7",
                "Sujets BACC/BEPC/Concours",
                "Apprentissage par la réflexion",
                "Solution 100% locale",
                "Zéro engagement (Packs)"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-indigo-700 font-medium">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="lg:col-span-2">
          <article className="mah-card p-8 h-full">
            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" /> Mon Historique
            </h3>
            <TransactionHistory transactions={transactions} />
            {totalTransactions > txLimit && (
              <div className="mt-6 flex justify-center">
                <a
                  href={`/credits?tab=${tab}&tx_limit=${txLimit + 10}`}
                  className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                >
                  Charger plus
                </a>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
