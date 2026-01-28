"use client";

import { History, TrendingUp, TrendingDown, Clock, CheckCircle2 } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: 'unlock' | 'purchase' | 'bonus' | 'refund';
  description: string | null;
  created_at: string;
}

export function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/20 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
        <div className="h-16 w-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-slate-800">
          <History className="w-8 h-8 text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Aucun mouvement pour le moment.</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Tes futures transactions s'afficheront ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => {
        const isPositive = tx.amount > 0;
        
        return (
          <div 
            key={tx.id}
            className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className={`
                h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110
                ${isPositive ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"}
              `}>
                {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              </div>
              
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {tx.description || (isPositive ? "Recharge de crédits" : "Déblocage de contenu")}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(tx.created_at).toLocaleDateString('fr-MG', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${
                    tx.type === 'purchase' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400' : 
                    tx.type === 'unlock' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400' :
                    'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {tx.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className={`text-xl font-black font-mono tracking-tighter ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                {isPositive ? `+${tx.amount}` : tx.amount}
              </p>
              <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                Confirmé
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
