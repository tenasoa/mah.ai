"use client";

import { useEffect, useState } from "react";
import { Coins, Plus } from "lucide-react";
import { getCreditBalance } from "@/app/actions/credits";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function CreditBalance() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchBalance();

    // Subscribe to profile changes to update balance in real-time
    const channel = supabase
      .channel("credits_update")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
           if (payload.new && 'credits_balance' in payload.new) {
             setBalance(payload.new.credits_balance);
           }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchBalance() {
    const bal = await getCreditBalance();
    setBalance(bal);
    setLoading(false);
  }

  if (loading || balance === null) return null;

  return (
    <div className="flex items-center gap-2 mr-4">
      <div 
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200"
        title="Votre solde de crédits"
      >
        <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
        <span className="font-bold text-slate-700 font-mono">{balance}</span>
      </div>
      <Link
        href="/credits" // We'll need a page to buy credits later
        className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
        title="Recharger"
      >
        <Plus className="w-4 h-4" />
      </Link>
    </div>
  );
}
