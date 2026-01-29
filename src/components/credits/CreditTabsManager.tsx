"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PricingTiers } from "./PricingTiers";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { Zap, Crown, Sparkles } from "lucide-react";

interface CreditTabsManagerProps {
  prices: Record<string, number>;
  balance: number;
  transactions: any[];
  totalTransactions: number;
  transactionLimit: number;
}

export function CreditTabsManager({
  prices,
  balance,
  transactions,
  totalTransactions,
  transactionLimit,
}: CreditTabsManagerProps) {
  const [activeTab, setActiveTab] = useState<"packs" | "subs">("packs");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Synchroniser avec l'URL au chargement
  useEffect(() => {
    const tab = searchParams.get("tab") as "packs" | "subs" | null;
    if (tab && (tab === "packs" || tab === "subs")) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Mettre à jour l'URL sans recharger la page
  const handleTabChange = (tab: "packs" | "subs") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/credits?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Header & Balance Card */}
      <header className="relative overflow-hidden rounded-[40px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 lg:p-12 shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black font-outfit tracking-tight mb-4">
              Recharge & <span className="text-amber-400">Plans</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md text-lg leading-relaxed">
              Choisis la formule qui te convient pour booster tes révisions avec l'excellence de l'IA.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-8 rounded-[32px] text-center min-w-[240px] shadow-inner">
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">Solde actuel</p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 text-amber-500 fill-amber-500/20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'currentColor\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1.81.45 1.61 1.67 1.61 1.16 0 1.6-.64 1.6-1.46 0-.84-.68-1.22-1.88-1.54-1.68-.42-3.38-1.06-3.38-3.26 0-1.56 1.13-2.78 2.96-3.16V5h2.67v1.71c1.52.39 2.69 1.46 2.8 3.08h-1.96c-.05-.6-.35-1.46-1.56-1.46-1.02 0-1.46.59-1.46 1.28 0 .64.45 1.02 1.71 1.37 1.77.46 3.56 1.07 3.56 3.34 0 1.78-1.29 2.97-3.15 3.45z\'/%3E%3C/svg%3E")' }} />
              <span className="text-5xl font-black font-mono tracking-tighter text-slate-900 dark:text-white">{balance}</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 font-bold uppercase tracking-widest">Crédits disponibles</p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Sans refresh */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner">
          <button
            onClick={() => handleTabChange("packs")}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
              ${activeTab === "packs" 
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }
            `}
          >
            <Zap className={`w-4 h-4 ${activeTab === "packs" ? "text-amber-500" : ""}`} />
            Packs Crédits
          </button>
          <button
            onClick={() => handleTabChange("subs")}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
              ${activeTab === "subs" 
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }
            `}
          >
            <Crown className={`w-4 h-4 ${activeTab === "subs" ? "text-indigo-500" : ""}`} />
            Abonnements
          </button>
        </div>
      </div>

      {/* Conditional Content - Animé */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeTab === "packs" ? (
          <>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Packs de recharge</h2>
            </div>
            <PricingTiers prices={prices} />
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Crown className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Formules Illimitées</h2>
            </div>
            <SubscriptionPlans />
          </>
        )}
      </section>

      {/* Info & History Grid - Gardé comme avant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        <div className="lg:col-span-1 space-y-6">
          <article className="mah-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              Pourquoi mah.ai ?
            </h3>
            <ul className="space-y-4">
              {[
                "IA Socratique Malagasy 24/7",
                "Sujets BACC/BEPC/Concours",
                "Apprentissage par la réflexion",
                "Solution 100% locale",
                "Zéro engagement (Packs)"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium tracking-tight">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500/80 dark:bg-emerald-400 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="lg:col-span-2">
          <article className="mah-card p-8 h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">⟳</span>
              </div>
              Mon Historique
            </h3>
            {/* TransactionHistory component would go here */}
            <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs italic">
              Aucune transaction récente.
            </div>
            {totalTransactions > transactionLimit && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    // Charger plus de transactions sans refresh
                    const newLimit = transactionLimit + 10;
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("tx_limit", newLimit.toString());
                    params.set("tab", activeTab);
                    router.replace(`/credits?${params.toString()}`, { scroll: false });
                  }}
                  className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                >
                  Charger plus
                </button>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
