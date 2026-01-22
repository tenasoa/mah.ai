import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Brain,
  Trophy,
  Users,
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  Play,
  ChevronRight,
  GraduationCap,
  Target,
  Clock,
  TrendingUp,
  MessageSquare,
  FileText,
  Shield,
  Heart,
  Menu,
  X,
  Rocket,
  Award,
  Lightbulb,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "IA Socratique",
    description:
      "Notre tuteur ne te donne pas les réponses. Il te pose les bonnes questions pour que tu comprennes vraiment.",
    color: "from-indigo-500 to-purple-500",
    bg: "bg-indigo-50",
  },
  {
    icon: Trophy,
    title: "Grit Score",
    description:
      "Mesure ta persévérance, pas juste tes notes. La clé du succès, c'est l'effort constant.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
  },
  {
    icon: FileText,
    title: "Sujets & Annales",
    description:
      "Accède à des centaines de sujets corrigés pour tous types d'examens et concours, avec explications détaillées.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
  },
  {
    icon: Users,
    title: "Communauté Active",
    description:
      "Rejoins des milliers d'apprenants qui s'entraident et partagent leurs astuces de révision.",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
  },
  {
    icon: Target,
    title: "Parcours Personnalisé",
    description:
      "L'IA analyse tes forces et faiblesses pour créer un programme de révision sur mesure.",
    color: "from-cyan-500 to-blue-500",
    bg: "bg-cyan-50",
  },
  {
    icon: Clock,
    title: "Sessions Focus",
    description:
      "Technique Pomodoro intégrée pour maximiser ta concentration et éviter le burnout.",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
  },
];

const stats = [
  { value: "15,000+", label: "Apprenants actifs" },
  { value: "98%", label: "Taux de réussite" },
  { value: "500+", label: "Sujets corrigés" },
  { value: "24/7", label: "Disponibilité IA" },
];

const testimonials = [
  {
    name: "Rado R.",
    role: "Étudiant en Terminale",
    content:
      "Grâce à Mah.ai, j'ai enfin compris les maths. Le tuteur IA me pose des questions qui me font réfléchir au lieu de me donner les réponses.",
    avatar: "R",
    rating: 5,
  },
  {
    name: "Miora T.",
    role: "Préparation concours",
    content:
      "Le Grit Score m'a motivée à réviser régulièrement. Avant, je procrastinais tout le temps. Maintenant j'ai une streak de 30 jours !",
    avatar: "M",
    rating: 5,
  },
  {
    name: "Faniry A.",
    role: "Étudiant en Licence",
    content:
      "Les sujets corrigés avec les explications de l'IA sont incroyables. C'est comme avoir un prof particulier disponible à tout moment.",
    avatar: "F",
    rating: 5,
  },
];

const steps = [
  {
    step: "01",
    title: "Crée ton compte",
    description: "Inscription gratuite en 30 secondes avec ton email ou numéro.",
  },
  {
    step: "02",
    title: "Définis tes objectifs",
    description: "Dis-nous ton niveau, tes matières faibles et ta date d'examen.",
  },
  {
    step: "03",
    title: "Commence à apprendre",
    description: "L'IA crée ton parcours personnalisé et te guide jour après jour.",
  },
];

const examTypes = [
  "CEPE",
  "BEPC",
  "Baccalauréat",
  "Licence",
  "Master",
  "Concours",
  "DTS",
  "BTS",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Ambient Background */}
      <div className="mah-ambient">
        <div className="mah-blob mah-blob-1" />
        <div className="mah-blob mah-blob-2" />
        <div className="mah-blob mah-blob-3" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/icons/icon-512x512.png"
                alt="Mah.ai Logo"
                className="h-10 w-10 rounded-xl shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-all duration-300 group-hover:scale-105"
              />
              <span className="text-2xl font-extrabold tracking-tight font-outfit">
                Mah<span className="text-slate-900">.ai</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Fonctionnalités
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Comment ça marche
              </a>
              <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Témoignages
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/auth"
                className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Commencer gratuitement
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-8 animate-bounce-soft">
              <Zap className="w-4 h-4" />
              Ton tuteur IA pour réussir tous tes examens
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight font-outfit leading-[1.1] mb-6">
              Apprends mieux avec{" "}
              <span className="text-gradient-grit">l'Intelligence Artificielle</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Un tuteur IA socratique qui s'adapte à ton niveau, des centaines de sujets corrigés, et une communauté d'apprenants motivés pour t'accompagner vers la réussite.
            </p>

            {/* Exam Types Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              {examTypes.map((exam) => (
                <span
                  key={exam}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:border-amber-300 hover:text-amber-700 transition-colors cursor-default"
                >
                  {exam}
                </span>
              ))}
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-sm font-medium text-slate-500">
                et plus...
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/auth"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg font-bold shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-200"
              >
                <Rocket className="w-5 h-5" />
                Commencer gratuitement
              </Link>
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 text-lg font-semibold hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 group">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <Play className="w-4 h-4 text-slate-600 group-hover:text-amber-600 ml-0.5" />
                </div>
                Voir la démo
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["R", "M", "F", "A"].map((initial, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white"
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <span className="font-medium text-slate-700">+15,000 apprenants</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                ))}
                <span className="ml-1 font-medium text-slate-700">4.9/5</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Preview */}
          <div className="mt-16 lg:mt-24 relative">
            <div className="relative max-w-5xl mx-auto">
              {/* Browser Frame */}
              <div className="rounded-2xl lg:rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
                {/* Browser Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 border-b border-slate-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-lg bg-white text-xs text-slate-500 font-mono">
                      mah.ai/dashboard
                    </div>
                  </div>
                </div>
                {/* Screenshot */}
                <div className="aspect-[16/9] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
                  <div className="w-full max-w-3xl grid grid-cols-3 gap-4">
                    {/* Grit Score Card */}
                    <div className="col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">GRIT SCORE</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4].map((i) => (
                            <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                          ))}
                          <Star className="w-4 h-4 text-slate-200" />
                        </div>
                      </div>
                      <div className="text-6xl font-extrabold text-gradient-grit">85</div>
                      <p className="text-slate-400 text-sm mt-1">sur 100 points</p>
                    </div>
                    {/* AI Tutor Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
                      <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold mb-1">AI Tutor</p>
                      <p className="text-xs text-white/70">Prêt à t'aider</p>
                    </div>
                    {/* Subject Cards */}
                    {[
                      { name: "Maths", progress: 75, color: "bg-pink-500" },
                      { name: "Physique", progress: 60, color: "bg-cyan-500" },
                      { name: "Français", progress: 45, color: "bg-violet-500" },
                    ].map((subject) => (
                      <div key={subject.name} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                        <p className="font-semibold text-sm mb-2">{subject.name}</p>
                        <div className="h-1.5 rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${subject.color}`}
                            style={{ width: `${subject.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{subject.progress}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 hidden lg:block animate-float">
                <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Progression</p>
                      <p className="font-bold text-emerald-600">+12% cette semaine</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 hidden lg:block animate-float" style={{ animationDelay: "1s" }}>
                <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Streak actuel</p>
                      <p className="font-bold text-slate-900">12 jours 🔥</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gradient-grit mb-2">
                  {stat.value}
                </div>
                <p className="text-slate-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Fonctionnalités
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-outfit mb-6">
              Tout ce qu'il te faut pour{" "}
              <span className="text-gradient-ai">réussir</span>
            </h2>
            <p className="text-lg text-slate-600">
              Des outils puissants conçus pour accompagner ton apprentissage, quel que soit ton niveau ou ton objectif.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div
                  className={`h-14 w-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`w-7 h-7`} style={{ color: feature.color.includes("amber") ? "#f59e0b" : feature.color.includes("indigo") ? "#6366f1" : feature.color.includes("emerald") ? "#10b981" : feature.color.includes("pink") ? "#ec4899" : feature.color.includes("cyan") ? "#06b6d4" : "#8b5cf6" }} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>

                {/* Hover Arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-amber-400 text-sm font-semibold mb-6">
              <Target className="w-4 h-4" />
              Comment ça marche
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-outfit mb-6">
              Commence en{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                3 étapes simples
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              Pas besoin de configuration compliquée. Tu peux commencer à apprendre en moins d'une minute.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-amber-500/50 to-transparent -translate-x-1/2" />
                )}

                <div className="text-center">
                  {/* Step Number */}
                  <div className="inline-flex items-center justify-center h-24 w-24 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 text-white text-3xl font-extrabold mb-6 shadow-lg shadow-orange-500/30">
                    {step.step}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-900 text-lg font-bold hover:bg-slate-100 hover:-translate-y-1 active:translate-y-0 transition-all duration-200"
            >
              Créer mon compte gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold mb-6">
              <Heart className="w-4 h-4" />
              Témoignages
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-outfit mb-6">
              Ils ont réussi avec{" "}
              <span className="text-gradient-grit">Mah.ai</span>
            </h2>
            <p className="text-lg text-slate-600">
              Découvre ce que les apprenants disent de leur expérience avec notre plateforme.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-600 leading-relaxed mb-6">"{testimonial.content}"</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl lg:rounded-[40px] bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 lg:p-16 text-white text-center overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full filter blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-semibold mb-6">
                <Lightbulb className="w-4 h-4" />
                Commence ton parcours
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-outfit mb-6">
                Prêt à transformer ton apprentissage ?
              </h2>

              <p className="text-lg text-white/90 max-w-2xl mx-auto mb-10">
                Rejoins les milliers d'apprenants qui ont déjà boosté leurs résultats avec Mah.ai. C'est gratuit pour commencer !
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-orange-600 text-lg font-bold hover:bg-slate-100 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 shadow-xl"
                >
                  <Rocket className="w-5 h-5" />
                  Commencer maintenant
                </Link>
                <span className="text-white/70 font-medium">
                  100% gratuit • Pas de carte bancaire
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 lg:py-16 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <img
                  src="/icons/icon-512x512.png"
                  alt="Mah.ai Logo"
                  className="h-10 w-10 rounded-xl shadow-lg shadow-orange-500/25"
                />
                <span className="text-xl font-extrabold tracking-tight font-outfit">
                  Mah<span className="text-slate-900">.ai</span>
                </span>
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed">
                Le tuteur IA qui t'accompagne vers la réussite avec la méthode socratique.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Produit</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="#features" className="hover:text-amber-600 transition-colors">Fonctionnalités</a></li>
                <li><a href="#how-it-works" className="hover:text-amber-600 transition-colors">Comment ça marche</a></li>
                <li><a href="#testimonials" className="hover:text-amber-600 transition-colors">Témoignages</a></li>
                <li><Link href="/auth" className="hover:text-amber-600 transition-colors">Tarifs</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Ressources</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="#" className="hover:text-amber-600 transition-colors">Sujets corrigés</a></li>
                <li><a href="#" className="hover:text-amber-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-amber-600 transition-colors">Guide de révision</a></li>
                <li><a href="#" className="hover:text-amber-600 transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="#" className="hover:text-amber-600 transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-amber-600 transition-colors">contact@mah.ai</a></li>
                <li><a href="#" className="hover:text-amber-600 transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-amber-600 transition-colors">WhatsApp</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2025 Mah.ai. Tous droits réservés. Fait avec ❤️ à Madagascar.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-amber-600 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-amber-600 transition-colors">Conditions</a>
              <a href="#" className="hover:text-amber-600 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
