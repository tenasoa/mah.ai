"use client";

import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { SubjectRequestModal } from "./SubjectRequestModal";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function EmptyStateWithRequest({ searchQuery, isAuthenticated }: { searchQuery?: string; isAuthenticated: boolean }) {
  const [isModalOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleRequestClick = () => {
    if (!isAuthenticated) {
      router.push(`/auth?next=/subjects${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`);
      return;
    }
    setIsOpen(true);
  };

  return (
    <div className="text-center py-12 px-6 bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto">
      <div className="h-20 w-20 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6 rotate-3 border border-amber-100">
        <FileText className="w-10 h-10 text-amber-500" />
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-2">Aucun résultat trouvé</h3>
      <p className="text-slate-500 text-sm mb-8 leading-relaxed">
        {searchQuery ? (
          <>Nous n'avons pas trouvé de sujet correspondant à <span className="text-amber-600 font-bold">"{searchQuery}"</span>. Demande-le nous !</>
        ) : (
          "Ce sujet n'est pas encore dans notre catalogue. Souhaites-tu qu'on le cherche pour toi ?"
        )}
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleRequestClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/20"
        >
          <Plus className="w-4 h-4" />
          Demander ce sujet
        </button>
        
        <Link
          href="/subjects"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
        >
          Réinitialiser les filtres
        </Link>
      </div>

      <SubjectRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsOpen(false)} 
        initialMatiere={searchQuery}
      />
    </div>
  );
}
