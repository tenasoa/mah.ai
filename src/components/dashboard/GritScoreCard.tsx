"use client";

import { useEffect, useState } from "react";
import { Award, Star, TrendingUp, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface GritScoreCardProps {
  initialScore: number;
  userId: string;
  rank?: number;
}

export function GritScoreCard({ initialScore, userId, rank }: GritScoreCardProps) {
  const [score, setScore] = useState(initialScore);
  const [displayScore, setDisplayScore] = useState(0);
  const supabase = createClient();

  // Animation du compteur
  useEffect(() => {
    let start = displayScore;
    const end = score;
    if (start === end) return;

    const duration = 1500; // ms
    const increment = (end - start) / (duration / 16); // 60fps approx

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setDisplayScore(end);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  // Real-time update
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`grit_score_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && 'grit_score' in payload.new) {
            console.log('✨ Realtime update received:', payload.new.grit_score);
            setScore(payload.new.grit_score);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  return (
    <article className="sm:col-span-2 sm:row-span-2 mah-card bg-gradient-to-br from-white via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-amber-900/10 border-amber-100/50 dark:border-slate-800 animate-scale-in relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-amber-200/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between relative z-10">
        <span className="px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" />
          Grit Score
        </span>
        <Link 
          href="/dashboard/league"
          className="text-[10px] font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 uppercase tracking-tighter flex items-center gap-1 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/50 transition-colors"
        >
          Voir le classement
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="text-7xl sm:text-8xl font-extrabold text-gradient-grit leading-none">
              {displayScore.toLocaleString()}
            </div>
            {/* Grit Ring (Simplified CSS version) */}
            <div className="absolute inset-[-20px] rounded-full border-4 border-amber-500/10 border-t-amber-500 animate-spin-slow pointer-events-none" />
          </div>
          <div className="text-slate-400 dark:text-slate-500 font-medium mt-6">points de persévérance</div>
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            Niveau {Math.floor(displayScore / 100) + 1}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900 dark:text-white">{Math.floor(displayScore / 50)}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sessions</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900 dark:text-white">+{displayScore % 100}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ce mois</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900 dark:text-white">#{rank || '-'}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rang</p>
        </div>
      </div>
    </article>
  );
}
