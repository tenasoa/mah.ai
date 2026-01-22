'use client';

import { EmailPasswordForm } from '@/components/auth/email-password-form';
import { OtpForm } from '@/components/auth/otp-form';
import { Sparkles, GraduationCap, Trophy, Users, Zap, BookOpen, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Sparkles,
    title: 'IA Socratique',
    description: 'Un tuteur qui te guide par des questions',
  },
  {
    icon: Trophy,
    title: 'Grit Score',
    description: 'Mesure ta persévérance et progresse',
  },
  {
    icon: Users,
    title: 'Communauté',
    description: 'Apprends avec des milliers d\'apprenants',
  },
];

const stats = [
  { value: '15K+', label: 'Apprenants actifs' },
  { value: '98%', label: 'Taux de réussite' },
  { value: '500+', label: 'Sujets corrigés' },
];

export default function AuthPage() {
  const [authMethod, setAuthMethod] = useState<'email' | 'otp'>('email');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex relative overflow-hidden">
      {/* Ambient Background */}
      <div className="mah-ambient">
        <div className="mah-blob mah-blob-1" />
        <div className="mah-blob mah-blob-2" />
        <div className="mah-blob mah-blob-3" />
      </div>

      {/* Left Panel - Branding & Features (Hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 relative z-10 flex-col justify-between p-10 xl:p-16">
        {/* Logo */}
        <div className="flex items-center gap-3 group">
          <img
            src="/icons/icon-512x512.png"
            alt="Mah.ai Logo"
            className="h-12 w-12 rounded-xl shadow-lg shadow-orange-500/25"
          />
          <span className="text-3xl font-extrabold tracking-tight font-outfit">
            Mah<span className="text-slate-900">.ai</span>
          </span>
        </div>

        {/* Main Content */}
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-6 animate-bounce-soft">
            <Zap className="w-4 h-4" />
            Ton tuteur IA personnel
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight font-outfit leading-tight">
            Apprends et réussis avec{' '}
            <span className="text-gradient-grit">l'Intelligence Artificielle</span>
          </h1>

          <p className="text-lg text-slate-600 mt-6 leading-relaxed">
            Rejoins des milliers d'apprenants qui préparent leurs examens et concours
            avec un tuteur IA qui s'adapte à ton rythme et à tes besoins.
          </p>

          {/* Features */}
          <div className="grid gap-4 mt-10">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`flex items-start gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50 hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-slide-up stagger-${index + 1}`}
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20 flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8">
          {stats.map((stat, index) => (
            <div key={stat.label} className={`animate-slide-up stagger-${index + 4}`}>
              <div className="text-3xl font-extrabold text-gradient-grit">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 lg:flex-none lg:w-[520px] xl:w-[560px] relative z-10 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <img
              src="/icons/icon-512x512.png"
              alt="Mah.ai Logo"
              className="h-11 w-11 rounded-xl shadow-lg shadow-orange-500/25"
            />
            <span className="text-2xl font-extrabold tracking-tight font-outfit">
              Mah<span className="text-slate-900">.ai</span>
            </span>
          </div>

          {/* Auth Card */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white/90 backdrop-blur-xl p-8 shadow-2xl shadow-slate-200/50 animate-scale-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 mb-4">
                <GraduationCap className="w-7 h-7 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight font-outfit text-slate-900">
                Bienvenue !
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Connecte-toi pour accéder à ton espace de révision
              </p>
            </div>

            {/* Auth Method Toggle */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1.5 mb-6">
              <button
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  authMethod === 'email'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setAuthMethod('otp')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  authMethod === 'otp'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                SMS
                <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-bold uppercase">
                  Beta
                </span>
              </button>
            </div>

            {/* Forms */}
            <div className="animate-slide-up">
              {authMethod === 'email' ? <EmailPasswordForm /> : <OtpForm />}
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-medium">
                  Pourquoi Mah.ai ?
                </span>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {[
                'Sujets corrigés pour tous les examens',
                'Tuteur IA disponible 24h/24',
                'Suivi de progression personnalisé',
              ].map((benefit, index) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 text-sm text-slate-600"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Terms */}
            <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
              En continuant, tu acceptes nos{' '}
              <button className="text-slate-600 hover:text-amber-600 underline underline-offset-2 transition-colors">
                Conditions d'Utilisation
              </button>{' '}
              et notre{' '}
              <button className="text-slate-600 hover:text-amber-600 underline underline-offset-2 transition-colors">
                Politique de Confidentialité
              </button>
            </div>
          </div>

          {/* Help Link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Besoin d'aide ?{' '}
            <button className="text-amber-600 font-semibold hover:text-amber-700 transition-colors">
              Contacte-nous
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
