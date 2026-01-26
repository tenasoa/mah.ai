"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useEffect } from "react";

export function AdminSubjectsSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    if (debouncedQuery === currentQ) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    
    startTransition(() => {
      router.push(`/admin/subjects?${params.toString()}`);
    });
  }, [debouncedQuery, router, searchParams]);

  return (
    <div className="relative group">
      <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isPending ? "text-amber-500 animate-pulse" : "text-slate-300 group-focus-within:text-amber-500"}`} />
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-11 pr-10 py-3 border border-slate-200 rounded-2xl text-xs outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 bg-slate-50/50 shadow-inner w-full sm:w-64 transition-all" 
        placeholder="Titre, ID ou matière..." 
      />
      {query && (
        <button 
          onClick={() => setQuery("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
