'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import {
  FileText,
  Search,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Play,
  Calendar,
  Award,
  Flame,
  Ticket,
} from 'lucide-react';
import { GritScoreCard } from '@/components/dashboard/GritScoreCard';
import { BadgesCollection } from '@/components/dashboard/BadgesCollection';
import { getDashboardStats, type DashboardStats } from '@/app/actions/dashboard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { OnboardingModal } from '@/components/dashboard/OnboardingModal';

type Profile = {
  pseudo: string;
  etablissement: string;
  filiere: string;
  classe: string;
  grit_score: number;
  roles: string[];
  onboarding_completed: boolean;
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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isActive = true;

    const loadDashboardData = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!isActive) return;

        if (!authUser) {
          router.push('/');
          return;
        }

        const [profileRes, statsRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('pseudo, etablissement, filiere, classe, grit_score, roles, onboarding_completed')
            .eq('id', authUser.id)
            .maybeSingle(),
          getDashboardStats(),
        ]);

        if (!isActive) return;

        const profiles = (profileRes.data ?? {}) as Partial<Profile>;
        const profileData: Profile = {
          pseudo: profiles.pseudo || authUser.email?.split('@')[0] || 'Élève',
          etablissement: profiles.etablissement || 'Lycée non renseigné',
          filiere: profiles.filiere || 'Série non renseignée',
          classe: profiles.classe || 'Niveau non renseigné',
          grit_score: profiles.grit_score || 0,
          roles: profiles.roles || ['user'],
          onboarding_completed: profiles.onboarding_completed || false,
        };

        setUser(authUser);
        setProfile(profileData);
        setShowOnboarding(!profileData.onboarding_completed);
        setStats(statsRes);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadDashboardData();

    return () => {
      isActive = false;
    };
  }, [router, supabase]);

  if (loading || !profile || !user) {
    return <LoadingScreen message="Initialisation de ton espace..." />;
  }

  const isAdmin = profile.roles.includes('admin') || profile.roles.includes('superadmin');
  const isContributor = profile.roles.includes('contributor');
  const isValidator = profile.roles.includes('validator');

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const quickStats = [
    { label: 'Crédits', value: stats?.balance?.toString() || '0', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Streak', value: `${stats?.streak_days || 0}j`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Rang', value: `#${stats?.rank || '-'}`, icon: TrendingUp, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  ];
  const pendingRequestsCount = stats?.pending_requests_count ?? 0;

  return (
    <div className="w-full">
        <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="animate-slide-up">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-outfit title-elite">
              {greeting()},{' '}
              <span className="text-gradient-grit">{profile.pseudo || 'Élève'}</span> !
            </h1>
            <div className="flex items-center gap-2 mt-1">
                {profile.roles.map(role => (
                    <span key={role} className="px-2 py-0.5 bg-slate-900 text-white rounded-[4px] text-[8px] font-black uppercase tracking-widest">
                        {role}
                    </span>
                ))}
                <span className="text-slate-400 text-xs">• {profile.classe} • {profile.filiere}</span>
            </div>
          </div>

          {/* Search & Stats */}
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up stagger-1">
            {/* Quick Stats */}
            <div className="flex items-center gap-2">
              {quickStats.map((stat) => (
                <div key={stat.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${stat.bg} border border-slate-100 dark:border-slate-800`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">{stat.label}</span>
                    <span className="text-sm font-black text-slate-700 leading-none">{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative group flex-1 lg:flex-none w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full lg:w-[240px] pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Bento Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 auto-rows-[180px] gap-4 lg:gap-5">

          {/* Admin Quick View (Conditional) */}
          {isAdmin && (
            <article className="sm:col-span-2 mah-card bg-slate-900 text-white border-none animate-scale-in">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-white/10 rounded-xl text-amber-400">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white px-2 py-0.5 rounded">Console Admin</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">En attente</p>
                        <p className="text-xl font-black text-white">{stats?.total_subjects_pending || 0} sujets</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tickets</p>
                        <p className="text-xl font-black text-white">{stats?.total_requests_pending || 0}</p>
                    </div>
                    <Link href="/admin/tickets" className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </article>
          )}

          {/* Contributor / Validator Stats (Conditional) */}
          {((isContributor || isValidator) && !isAdmin) && (
            <article className="sm:col-span-2 mah-card bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/50 animate-scale-in">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <Award className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white px-2 py-0.5 rounded">Portefeuille Créateur</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest mb-1">Gains Totaux</p>
                        <p className="text-xl font-black text-indigo-900 dark:text-indigo-100">{stats?.total_earnings || 0} Cr.</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest mb-1">Contributions</p>
                        <p className="text-xl font-black text-indigo-900 dark:text-indigo-100">{stats?.my_subjects_count || 0}</p>
                    </div>
                    <Link href={isValidator ? "/validator" : "/contributor"} className="flex items-center justify-center p-2 rounded-xl bg-indigo-100 dark:bg-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-700 transition-colors border border-indigo-200 dark:border-indigo-700">
                        <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </Link>
                </div>
            </article>
          )}

          {/* Grit Score Card */}
          <GritScoreCard initialScore={profile.grit_score} userId={user.id} rank={stats?.rank} />

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
                <div className="absolute bottom-5 right-5 max-w-[220px] bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl shadow-indigo-500/10 dark:shadow-none border border-indigo-100 dark:border-indigo-800 animate-bounce-soft">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    AI Tutor
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
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
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{subject.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subject.subtitle}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 dark:text-slate-500">Progression</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{subject.progressValue}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
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
          <article className="mah-card items-center justify-center text-center bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-orange-900/10 border-amber-200/50 dark:border-slate-800 cursor-pointer group animate-slide-up stagger-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-white dark:bg-slate-800 border-4 border-amber-200 dark:border-amber-900 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:shadow-amber-500/20 transition-shadow">
                <span className="text-xl font-bold text-amber-600 dark:text-amber-500 font-mono">24:59</span>
              </div>
              <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 hover:scale-110 transition-transform">
                <Play className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <p className="mt-3 font-bold text-slate-900 dark:text-white">Focus Session</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Mode Deep Work</p>
          </article>

          {/* Subject Request Reminder Card (Dynamic) */}
          {pendingRequestsCount > 0 && (
            <Link href="/profile" className="mah-card bg-indigo-900 text-white border-none group animate-slide-up stagger-6">
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                  <Ticket className="w-6 h-6 text-indigo-300" />
                </div>
                <span className="px-2 py-1 rounded-lg bg-indigo-500 text-[10px] font-black uppercase tracking-tighter">En cours</span>
              </div>
              <div className="mt-auto">
                <h3 className="text-base font-bold text-white leading-tight">
                  {pendingRequestsCount} demande{pendingRequestsCount > 1 ? 's' : ''} de sujet{pendingRequestsCount > 1 ? 's' : ''}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-indigo-300 text-xs font-medium">
                  <span>Voir l&apos;état de recherche</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          )}

          {/* Upcoming Exam Banner */}
          <article className="xl:col-span-4 sm:row-span-2 mah-card mah-card-lg flex-row items-center gap-4 bg-gradient-to-r from-amber-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 border-l-4 border-l-amber-500 dark:border-slate-800 animate-slide-up stagger-6">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
              <Timer className="w-7 h-7" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Examen Blanc de Philo</h3>
                <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase animate-pulse-soft">
                  Urgent
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Salle 204 • {profile.etablissement}</p>
            </div>

            <div className="text-right flex-shrink-0 hidden sm:block">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">02 Jours</div>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Restants</span>
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
