"use client";

import { useState } from "react";
import { Zap, Crown, Coins, History, ShieldCheck, Sparkles, ChevronRight } from "lucide-react";
import { PricingTiers } from "./PricingTiers";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { TransactionHistory } from "./TransactionHistory";

interface CreditsViewProps {
  balance: number;
  prices: Record<string, number>;
  transactions: any[];
  totalTransactions: number;
  initialTab: string;
  txLimit: number;
}

export function CreditsView({
  balance,
  prices,
  transactions,
  totalTransactions,
  initialTab = 'packs',
  txLimit
}: CreditsViewProps) {
  const [tab, setTab] = useState(initialTab);
  const [currentTxLimit, setTxLimit] = useState(txLimit);

  return (
    <div className="space-y-12">
      {/* Header & Balance Card */}
      <header className="relative overflow-hidden rounded-[40px] bg-white dark:bg-slate-900 p-8 lg:p-12 shadow-2xl border border-slate-100 dark:border-slate-800 transition-all duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black font-outfit tracking-tight mb-4 text-slate-900 dark:text-white">
              Recharge & <span className="text-amber-500 dark:text-amber-400">Plans</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md text-lg leading-relaxed">
              Choisis la formule qui te convient pour booster tes révisions avec l'excellence de l'IA.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-8 rounded-[32px] text-center min-w-[240px] shadow-inner">
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">Solde actuel</p>
            <div className="flex items-center justify-center gap-3">
              <Coins className="w-8 h-8 text-amber-500 fill-amber-500/20" />
              <span className="text-5xl font-black font-mono tracking-tighter text-slate-900 dark:text-white">{balance}</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 font-bold uppercase tracking-widest">Crédits disponibles</p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
          <button 
            onClick={() => setTab('packs')}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
              ${tab === 'packs' ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-lg" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}
            `}
          >
            <Zap className={`w-4 h-4 ${tab === 'packs' ? "text-amber-400 dark:text-slate-900" : ""}`} />
            Packs Crédits
          </button>
          <button 
            onClick={() => setTab('subs')}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
              ${tab === 'subs' ? "bg-slate-900 text-white dark:bg-indigo-600 shadow-lg" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}
            `}
          >
            <Crown className={`w-4 h-4 ${tab === 'subs' ? "text-indigo-400" : ""}`} />
            Abonnements
          </button>
        </div>
      </div>

      {/* Conditional Content */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {tab === 'packs' ? (
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

      {/* Info & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        <div className="lg:col-span-1 space-y-6">
          <article className="mah-card bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 shadow-xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Pourquoi mah.ai ?
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
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-indigo-500 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="lg:col-span-2">
          <article className="mah-card p-8 h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" /> Mon Historique
            </h3>
            <TransactionHistory transactions={transactions} />
            {totalTransactions > currentTxLimit && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setTxLimit(prev => prev + 10)}
                  className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
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
