import { getCreditBalance, getCreditPrices, getTransactions } from "@/app/actions/credits";
import { CreditsPageClient } from "./CreditsPageClient";
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
  const { tx_limit } = await searchParams;
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
    <CreditsPageClient 
      balance={balance}
      prices={prices}
      transactions={transactions}
      totalTransactions={totalTransactions}
      transactionLimit={txLimit}
    />
  );
}
