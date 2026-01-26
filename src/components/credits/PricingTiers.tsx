"use client";

import { useState } from "react";
import { Coins, ChevronRight, Zap, Star, ShieldCheck } from "lucide-react";
import { RechargeWorkflow } from "./RechargeWorkflow";

interface PricingTiersProps {
  prices: Record<string, number>;
}

export function PricingTiers({ prices }: PricingTiersProps) {
  const [selectedPack, setSelectedPack] = useState<{ amount: number; price: number } | null>(null);

  // Convert prices object to sorted array
  const tiers = Object.entries(prices)
    .map(([amount, price]) => ({
      amount: parseInt(amount),
      price: price,
    }))
    .sort((a, b) => a.amount - b.amount);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {tiers.map((tier, index) => {
          const isPopular = index === 1; 
          const isVIP = index === 2;
          
          return (
            <article 
              key={tier.amount}
              className={`
                group relative p-8 rounded-[40px] flex flex-col transition-all duration-500 border-2
                ${isVIP 
                  ? "bg-[#0f0a05] text-white border-none shadow-2xl shadow-amber-900/20" 
                  : isPopular 
                    ? "bg-blue-600 text-white border-none scale-105 z-10 shadow-2xl shadow-blue-200"
                    : "bg-white text-slate-900 border-slate-100 shadow-xl"
                }
                ${isPopular && !isVIP ? "ring-4 ring-blue-50" : ""}
                ${!isPopular && !isVIP ? "hover:border-indigo-100" : ""}
              `}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Recommandé
                </div>
              )}

              <div className="mb-8">
                <div className={`
                  inline-flex p-3 rounded-2xl mb-6
                  ${isVIP ? "bg-amber-500/10 text-amber-500" : isPopular ? "bg-white/20 text-white" : "bg-amber-50 text-amber-600"}
                `}>
                  {isVIP ? <Star className="w-6 h-6" /> : <Coins className="w-6 h-6" />}
                </div>
                <h3 className={`text-2xl font-black tracking-tight ${isVIP || isPopular ? "text-white" : "text-slate-900"}`}>
                  Pack {tier.amount} crédits
                </h3>
                <p className={`text-sm mt-2 ${isVIP ? "text-slate-400" : isPopular ? "text-blue-100" : "text-slate-500"}`}>
                  {tier.amount} sujets d'examens complets
                </p>
              </div>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-black ${isVIP ? "text-amber-500" : isPopular ? "text-white" : "text-slate-900"}`}>
                    {tier.price.toLocaleString()}
                  </span>
                  <span className={`text-lg font-bold ${isVIP ? "text-amber-200/40" : isPopular ? "text-blue-200" : "text-slate-400"}`}>
                    Ar
                  </span>
                </div>
                <p className={`text-[10px] mt-1 font-bold uppercase tracking-widest ${isVIP ? "text-amber-600/80" : isPopular ? "text-blue-200/80" : "text-indigo-600"}`}>
                  Paiement unique
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {[
                  "IA Socratique incluse",
                  "Support prioritaire",
                  tier.amount >= 50 ? "Accès aux concours" : "Accès aux BACC/BEPC",
                  tier.amount === 100 ? "Bonus exclusifs" : null
                ].filter(Boolean).map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <ShieldCheck className={`w-4 h-4 ${isVIP ? "text-amber-500" : isPopular ? "text-blue-200" : "text-emerald-500"}`} />
                    <span className={`text-sm ${isVIP ? "text-slate-300" : isPopular ? "text-white" : "text-slate-600"}`}>{feat}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setSelectedPack(tier)}
                className={`
                  w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2
                  ${isVIP 
                    ? "bg-amber-500 text-black hover:bg-amber-400" 
                    : isPopular 
                      ? "bg-white text-blue-600 hover:bg-blue-50" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }
                `}
              >
                Recharger
                <ChevronRight className="w-4 h-4" />
              </button>
            </article>
          );
        })}
      </div>

      {selectedPack && (
        <RechargeWorkflow 
          amount={selectedPack.amount} 
          price={selectedPack.price} 
          onClose={() => setSelectedPack(null)} 
        />
      )}
    </>
  );
}
