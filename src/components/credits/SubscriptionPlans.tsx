"use client";

import { useState } from "react";
import { Check, Zap, Crown, ShieldCheck, ArrowRight } from "lucide-react";

const plans = [
  {
    id: 'premium',
    name: 'Pack Premium',
    price: 15000,
    period: 'mois',
    description: 'Idéal pour réviser intensivement avant les examens.',
    features: [
      'Accès à TOUS les sujets',
      'Accès à TOUTES les réponses',
      'Support par email',
      'Badge Premium sur le profil'
    ],
    cta: 'Passer au Premium',
    highlight: false,
    color: 'indigo'
  },
  {
    id: 'vip',
    name: 'Pack Elite (IA)',
    price: 35000,
    period: 'mois',
    description: 'L\'expérience ultime avec IA illimitée.',
    features: [
      'Tout le contenu débloqué',
      'IA Socratique ILLIMITÉE',
      'Explications détaillées offertes',
      'Accès prioritaire aux concours',
      'Badge VIP Gold'
    ],
    cta: 'Devenir Elite',
    highlight: true,
    color: 'amber'
  }
];

export function SubscriptionPlans() {
  const [comingSoonPlan, setComingSoonPlan] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {plans.map((plan) => (
        <article 
          key={plan.id}
          className={`
            relative p-8 rounded-[40px] border-2 transition-all duration-500 flex flex-col
            ${plan.highlight 
              ? "border-amber-400 bg-white shadow-2xl shadow-amber-100 scale-105 z-10"
              : "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200"
            }
          `}
        >
          {plan.highlight && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
              Le plus populaire
            </div>
          )}

          <div className="mb-8">
            <div className={`
              inline-flex p-3 rounded-2xl mb-6
              ${plan.id === 'vip' ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"}
            `}>
              {plan.id === 'vip' ? <Crown className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
            <p className="text-sm text-slate-500 mt-2">{plan.description}</p>
          </div>

          <div className="mb-8">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-slate-900">{plan.price.toLocaleString()}</span>
              <span className="text-lg font-bold text-slate-400">Ar</span>
              <span className="text-sm text-slate-400 font-medium ml-1">/ {plan.period}</span>
            </div>
          </div>

          <div className="space-y-4 mb-10 flex-1">
            {plan.features.map((feat, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-1 p-0.5 rounded-full ${plan.id === 'vip' ? "bg-amber-500" : "bg-indigo-500"}`}>
                  <Check className="w-3 h-3 text-white" strokeWidth={4} />
                </div>
                <span className="text-sm font-bold text-slate-700">{feat}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setComingSoonPlan(plan.id)}
            className={`
              w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2
              ${plan.highlight 
                ? "bg-slate-900 text-white hover:bg-amber-500"
                : "bg-white text-slate-900 border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600"
              }
            `}
          >
            {plan.cta}
            <ArrowRight className="w-4 h-4" />
          </button>
          {comingSoonPlan === plan.id && (
            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-amber-600 text-center">
              Abonnement bientôt disponible
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
