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
    <Link
      href="/credits"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 hover:border-amber-300 hover:from-amber-50 hover:to-orange-50 transition-all duration-300 group shadow-sm hover:shadow-md cursor-pointer"
      title="Solde de crédits - Cliquer pour recharger"
    >
      <Coins className="w-4 h-4 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
      <span className="font-bold text-slate-700 text-sm font-mono group-hover:text-amber-700 transition-colors">{balance}</span>
      <Plus className="w-3 h-3 text-slate-400 group-hover:text-amber-600 group-hover:scale-110 transition-all" />
    </Link>
  );
}
