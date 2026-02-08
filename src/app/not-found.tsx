"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Search, BookOpen, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Ambient Background */}
      <div className="mah-ambient">
        <div className="mah-blob mah-blob-1 opacity-20 dark:opacity-10" />
        <div className="mah-blob mah-blob-2 opacity-20 dark:opacity-10" />
        <div className="mah-blob mah-blob-3 opacity-15 dark:opacity-5" />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Large 404 Text */}
        <div className="relative inline-block mb-8">
          <h1 className="text-[120px] sm:text-[180px] font-black leading-none tracking-tighter text-slate-900/5 dark:text-white/5 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 sm:h-32 sm:w-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[32px] sm:rounded-[40px] shadow-2xl shadow-orange-500/30 flex items-center justify-center rotate-12 animate-float">
              <Search className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 animate-slide-up">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-outfit tracking-tight">
            Oups ! Cette page s&apos;est envolée.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            Même les meilleurs élèves se perdent parfois. Ne t&apos;inquiète pas, nous allons te ramener sur la bonne voie.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 font-bold uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 dark:shadow-white/10 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Retour à l&apos;accueil
            </Link>
            
            <Link
              href="/subjects"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold uppercase tracking-widest text-xs hover:border-amber-400 dark:hover:border-amber-500 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
            >
              <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform text-amber-500" />
              Voir les sujets
            </Link>
          </div>

          <div className="pt-12">
            <button 
              onClick={() => router.back()} 
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-amber-500 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Revenir en arrière
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative footer text */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em] select-none">
          Mah.ai • Excellence Académique
        </p>
      </div>
    </div>
  );
}
