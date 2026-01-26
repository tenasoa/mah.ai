import { getGritLeaderboard } from "@/app/actions/leaderboard";
import { Trophy, Flame, Star, Medal, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LeaguePage() {
  const leaderboard = await getGritLeaderboard();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="p-2 hover:bg-white rounded-xl transition-colors text-slate-500 shadow-sm border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-outfit tracking-tight">Ligue Grit</h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Classement National</p>
          </div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center shadow-inner">
          <Trophy className="w-6 h-6 text-amber-600" />
        </div>
      </div>

      {/* Top 3 Podium (Visual) */}
      <div className="grid grid-cols-3 gap-4 items-end pt-10 pb-6 px-2">
        {/* 2nd Place */}
        {leaderboard[1] && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-300 bg-white flex items-center justify-center text-2xl font-bold text-slate-400 overflow-hidden shadow-lg">
                {leaderboard[1].pseudo.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-1 w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center shadow-sm">
                <Medal className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-900 truncate w-24">{leaderboard[1].pseudo}</p>
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">{leaderboard[1].grit_score} Grit</p>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {leaderboard[0] && (
          <div className="flex flex-col items-center gap-4 -translate-y-4">
            <div className="relative">
              <div className="w-20 h-20 sm:w-28 sm:h-20 rounded-full border-4 border-amber-400 bg-white flex items-center justify-center text-3xl font-black text-amber-500 overflow-hidden shadow-2xl shadow-amber-200 animate-bounce-soft">
                {leaderboard[0].pseudo.charAt(0)}
              </div>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <Trophy className="w-8 h-8 text-amber-500 fill-amber-500 drop-shadow-lg" />
              </div>
              <div className="absolute -bottom-2 -right-1 w-10 h-10 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center shadow-md">
                <Medal className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-slate-900">{leaderboard[0].pseudo}</p>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-tighter">
                <Star className="w-2 h-2 fill-amber-600" />
                Le Maître
              </div>
              <p className="text-xs font-mono font-black text-amber-600 uppercase mt-1">{leaderboard[0].grit_score} Grit</p>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {leaderboard[2] && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-orange-300 bg-white flex items-center justify-center text-2xl font-bold text-orange-400 overflow-hidden shadow-lg">
                {leaderboard[2].pseudo.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-1 w-8 h-8 rounded-full bg-orange-50 border-2 border-orange-300 flex items-center justify-center shadow-sm">
                <Medal className="w-4 h-4 text-orange-400" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-900 truncate w-24">{leaderboard[2].pseudo}</p>
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">{leaderboard[2].grit_score} Grit</p>
            </div>
          </div>
        )}
      </div>

      {/* Full Ranking List */}
      <article className="mah-card p-0 overflow-hidden bg-white border-slate-200 shadow-xl shadow-slate-200/40">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Top 50 Apprenants</h2>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            <span>Score Grit</span>
            <span className="w-16 text-right">Série</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {leaderboard.map((entry, index) => {
            const isCurrentUser = user?.id === entry.id;
            return (
              <div 
                key={entry.id} 
                className={`flex items-center gap-4 px-6 py-4 transition-colors ${isCurrentUser ? "bg-amber-50/50" : "hover:bg-slate-50/30"}`}
              >
                <div className="w-8 flex-shrink-0 text-sm font-bold text-slate-400">
                  #{index + 1}
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 flex-shrink-0">
                  {entry.pseudo.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold truncate ${isCurrentUser ? "text-amber-700" : "text-slate-900"}`}>
                      {entry.pseudo}
                    </p>
                    {isCurrentUser && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[8px] font-black uppercase">Toi</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate uppercase tracking-tighter font-medium">
                    {entry.classe} • {entry.filiere}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black font-mono text-slate-900 leading-none">
                    {entry.grit_score}
                  </p>
                </div>
                <div className="w-16 flex items-center justify-end gap-1.5">
                  <Flame className={`w-3.5 h-3.5 ${entry.streak_days > 0 ? "text-orange-500 fill-orange-500" : "text-slate-200"}`} />
                  <span className="text-xs font-bold font-mono text-slate-600">{entry.streak_days}</span>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
}
