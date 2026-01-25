"use client";

import { useEffect, useState } from "react";
import { Award, Star, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface GritScoreCardProps {
  initialScore: number;
  userId: string;
}

export function GritScoreCard({ initialScore, userId }: GritScoreCardProps) {
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
    <article className="sm:col-span-2 sm:row-span-2 mah-card bg-gradient-to-br from-white via-white to-amber-50/50 border-amber-100/50 animate-scale-in relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-amber-200/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between relative z-10">
        <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" />
          Grit Score
        </span>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => {
            const isFilled = displayScore > (i * 100); // Simple logic: 1 star every 100 points
            return (
              <Star 
                key={i} 
                className={`w-4 h-4 ${isFilled ? "text-amber-500 fill-amber-500" : "text-slate-200"}`} 
              />
            );
          })}
        </div>
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
          <div className="text-slate-400 font-medium mt-6">points de persévérance</div>
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            Niveau {Math.floor(displayScore / 100) + 1}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 relative z-10">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">{Math.floor(displayScore / 50)}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Sessions</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">+{displayScore % 100}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Ce mois</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">#{Math.max(1, 100 - Math.floor(displayScore / 10))}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Rang</p>
        </div>
      </div>
    </article>
  );
}
