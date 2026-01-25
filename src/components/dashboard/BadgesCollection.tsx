"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Lock } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface BadgesCollectionProps {
  userId: string;
}

export function BadgesCollection({ userId }: BadgesCollectionProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadBadgesData() {
      // 1. Charger tous les badges disponibles
      const { data: allBadges } = await supabase
        .from("badges")
        .select("*")
        .order("points_required", { ascending: true });

      // 2. Charger les badges de l'utilisateur
      const { data: userBadges } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", userId);

      if (allBadges) setBadges(allBadges);
      if (userBadges) {
        setUnlockedIds(new Set(userBadges.map((b) => b.badge_id)));
      }
      setLoading(false);
    }

    if (userId) loadBadgesData();
  }, [userId, supabase]);

  if (loading) {
    return (
      <div className="animate-pulse flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-24 rounded-2xl bg-slate-100 flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <article className="mah-card bg-white border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-tight">
          <Trophy className="w-4 h-4 text-amber-500" />
          Mes Succès ({unlockedIds.size})
        </h3>
        <span className="text-[10px] text-slate-400 font-bold uppercase">Ligue Grit</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar no-scrollbar lg:grid lg:grid-cols-5 lg:overflow-visible">
        {badges.map((badge) => {
          const isUnlocked = unlockedIds.has(badge.id);
          return (
            <div 
              key={badge.id}
              className={`
                flex flex-col items-center text-center p-3 rounded-2xl transition-all duration-300 flex-shrink-0 w-24 lg:w-auto
                ${isUnlocked ? "bg-amber-50 border border-amber-100 scale-100" : "bg-slate-50 opacity-40 grayscale"}
              `}
              title={badge.description}
            >
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-2 shadow-sm
                ${isUnlocked ? "bg-white" : "bg-slate-100"}
              `}>
                {isUnlocked ? badge.icon : <Lock className="w-4 h-4 text-slate-400" />}
              </div>
              <p className="text-[10px] font-bold text-slate-900 leading-tight truncate w-full">
                {badge.name}
              </p>
            </div>
          );
        })}
      </div>
    </article>
  );
}
