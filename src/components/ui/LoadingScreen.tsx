"use client";

import { Rocket } from "lucide-react";

export function LoadingScreen({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300">
      <div className="relative">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-amber-500/20 blur-3xl scale-150 animate-pulse" />
        
        {/* Animated Rings */}
        <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-amber-500/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 animate-bounce-soft">
                <Rocket className="w-6 h-6 text-white" />
            </div>
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-2">
        <h2 className="text-xl font-black font-outfit text-slate-900 dark:text-white tracking-tight animate-pulse">
            Mah<span className="text-amber-500">.ai</span>
        </h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {message}
        </p>
      </div>

      {/* Progress Line */}
      <div className="mt-10 w-48 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 animate-loading-bar" />
      </div>
    </div>
  );
}
