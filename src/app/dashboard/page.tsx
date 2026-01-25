'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Target,
  ChevronRight,
  Play,
  Bell,
  Calendar,
  Award,
  Flame,
} from 'lucide-react';
import { GritScoreCard } from '@/components/dashboard/GritScoreCard';
import { BadgesCollection } from '@/components/dashboard/BadgesCollection';
import { NotificationBell } from '@/components/dashboard/NotificationBell';

type Profile = {
  pseudo: string;
  etablissement: string;
  filiere: string;
  classe: string;
  grit_score: number;
};

const subjects = [
  {
    title: 'Physique',
    subtitle: 'Mécanique Newtonienne',
    color: 'text-sky-500',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    progress: 'bg-gradient-to-r from-sky-400 to-cyan-500',
    progressValue: 75,
  },
  {
    title: 'Mathématiques',
    subtitle: 'Fonctions Logarithmes',
    color: 'text-pink-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    progress: 'bg-gradient-to-r from-pink-400 to-rose-500',
    progressValue: 40,
  },
  {
    title: 'Histoire-Géo',
    subtitle: 'La Guerre Froide',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    progress: 'bg-gradient-to-r from-amber-400 to-orange-500',
    progressValue: 90,
  },
];

const quickStats = [
  { label: 'Exercices', value: '24', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'Streak', value: '12j', icon: Flame, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Rang', value: '#42', icon: TrendingUp, color: 'text-pink-500', bg: 'bg-pink-50' },
];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    getUserAndProfile();
  }, []);

  async function getUserAndProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/');
      return;
    }

    setUser(user);

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('pseudo, etablissement, filiere, classe, grit_score')
      .eq('id', user.id)
      .single();

    if (!error && profiles) {
      const profileData: Profile = {
        pseudo: profiles.pseudo || '',
        etablissement: profiles.etablissement || '',
        filiere: profiles.filiere || '',
        classe: profiles.classe || '',
        grit_score: profiles.grit_score || 0,
      };
      setProfile(profileData);
    }

    setLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div className="w-full">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="animate-slide-up">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-outfit">
              {greeting()},{' '}
              <span className="text-gradient-grit">{profile.pseudo || 'Élève'}</span> !
            </h1>
            <p className="text-slate-500 mt-1">
              {profile.classe} • {profile.filiere} • {profile.etablissement}
            </p>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3 animate-slide-up stagger-1">
            <div className="relative group flex-1 lg:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full lg:w-[280px] pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all duration-200"
              />
            </div>
          </div>
        </header>

        {/* Bento Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 auto-rows-[180px] gap-4 lg:gap-5">

          {/* Grit Score Card */}
          <GritScoreCard initialScore={profile.grit_score} userId={user.id} />

          {/* Document Preview Card */}
          <article className="sm:col-span-2 sm:row-span-2 mah-card p-0 overflow-hidden animate-scale-in stagger-1">
            <div className="flex h-full">
              {/* Progress Dots */}
              <div className="w-16 border-r border-slate-100 bg-slate-50/50 flex flex-col items-center py-6 gap-4">
                <span className="mah-dot mah-dot-active" />
                <span className="mah-dot" />
                <span className="mah-dot" />
                <span className="mah-dot" />
              </div>

              {/* Content */}
              <div className="flex-1 p-5 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold">
                      MATHS
                    </span>
                    <span className="font-semibold text-slate-900">Bac 2023</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Contenu Structuré</span>
                </div>

                {/* Document Preview Lines */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-slate-700">Chapitre 1: Étude de fonctions</div>
                  <div className="space-y-2">
                    <div className="h-2 rounded-full bg-slate-100 w-full" />
                    <div className="h-2 rounded-full bg-slate-100 w-4/5" />
                    <div className="h-2 rounded-full bg-slate-100 w-3/5" />
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 w-full mt-4" />
                  <div className="h-2 rounded-full bg-slate-100 w-2/3" />
                </div>

                {/* AI Assistant Popup */}
                <div className="absolute bottom-5 right-5 max-w-[220px] bg-white rounded-2xl p-4 shadow-xl shadow-indigo-500/10 border border-indigo-100 animate-bounce-soft">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-2">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    AI Tutor
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    &quot;J&apos;ai repéré une formule clé au §2. Tu veux un exercice ?&quot;
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Subject Cards */}
          {subjects.map((subject, index) => (
            <article
              key={subject.title}
              className={`mah-card group cursor-pointer hover:border-slate-300 animate-slide-up stagger-${index + 2}`}
            >
              <div className="flex items-start justify-between">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${subject.bg} ${subject.border} border`}>
                  <FileText className={`w-5 h-5 ${subject.color}`} />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-auto">
                <h3 className="text-base font-bold text-slate-900">{subject.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{subject.subtitle}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Progression</span>
                    <span className="font-bold text-slate-700">{subject.progressValue}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${subject.progress} transition-all duration-500`}
                      style={{ width: `${subject.progressValue}%` }}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}

          {/* Focus Timer Card */}
          <article className="mah-card items-center justify-center text-center bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-200/50 cursor-pointer group animate-slide-up stagger-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-white border-4 border-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:shadow-amber-500/20 transition-shadow">
                <span className="text-xl font-bold text-amber-600 font-mono">24:59</span>
              </div>
              <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 hover:scale-110 transition-transform">
                <Play className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <p className="mt-3 font-bold text-slate-900">Focus Session</p>
            <p className="text-xs text-slate-500">Mode Deep Work</p>
          </article>

          {/* Upcoming Exam Banner */}
          <article className="xl:col-span-4 sm:row-span-2 mah-card mah-card-lg flex-row items-center gap-4 bg-gradient-to-r from-amber-50 via-white to-indigo-50 border-l-4 border-l-amber-500 animate-slide-up stagger-6">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
              <Timer className="w-7 h-7" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900">Examen Blanc de Philo</h3>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase animate-pulse-soft">
                  Urgent
                </span>
              </div>
              <p className="text-sm text-slate-500">Salle 204 • {profile.etablissement}</p>
            </div>

            <div className="text-right flex-shrink-0 hidden sm:block">
              <div className="text-2xl font-extrabold text-slate-900">02 Jours</div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Restants</span>
            </div>

            <button className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-slate-900/20 flex-shrink-0">
              Voir le programme
            </button>
          </article>
        </section>

        {/* Badges Section */}
        <section className="mt-8">
          <BadgesCollection userId={user.id} />
        </section>
    </div>
  );
}
