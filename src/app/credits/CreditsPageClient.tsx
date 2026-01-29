"use client";

import { CreditTabsManager } from "@/components/credits/CreditTabsManager";

interface CreditsPageClientProps {
  balance: number;
  prices: Record<string, number>;
  transactions: any[];
  totalTransactions: number;
  transactionLimit: number;
}

export function CreditsPageClient({
  balance,
  prices,
  transactions,
  totalTransactions,
  transactionLimit,
}: CreditsPageClientProps) {
  return (
    <CreditTabsManager 
      balance={balance}
      prices={prices}
      transactions={transactions}
      totalTransactions={totalTransactions}
      transactionLimit={transactionLimit}
    />
  );
}
