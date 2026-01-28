"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Trophy,
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronRight,
  TrendingUp,
  FileText,
  Heart,
  Rocket,
  Award,
  Lightbulb,
  Coffee,
  Globe,
  Layout,
  PenTool,
  UserCheck,
  Menu,
  X,
  Calculator,
  FlaskConical,
  MapPin,
  Atom,
  Sun,
  Moon,
} from "lucide-react";

// ─── DONNÉES ───

const mainFeatures = [
  {
    title: "Accède aux meilleurs sujets",
    desc: "Achète et débloque instantanément les annales officielles du BACC, BEPC et Concours. Zéro papier, 100% numérique.",
    icon: FileText,
    color: "text-amber-600",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
    iconBg: "from-amber-400 to-orange-500",
  },
  {
    title: "Doubles Corrigés : IA & Humain",
    desc: "Choisis entre une correction IA instantanée pour comprendre vite, ou une correction certifiée par un professeur pour viser la perfection.",
    icon: UserCheck,
    color: "text-orange-600",
    bg: "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
    iconBg: "from-orange-400 to-red-500",
  },
  {
    title: "Entraîne-toi en conditions réelles",
    desc: "Résous les exercices directement sur le site. Notre IA socratique te guide étape par étape sans te donner la réponse toute faite.",
    icon: PenTool,
    color: "text-red-600",
    bg: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
    iconBg: "from-red-400 to-rose-500",
  },
];

const pricingPlans = [
  {
    name: "Packs Crédits",
    price: "5 000",
    unit: "Ar",
    description: "Achète uniquement ce dont tu as besoin.",
    features: [
      "Déblocage de sujets à l'unité",
      "Corrigés IA inclus",
      "Accès à vie aux achats",
      "Sans abonnement",
    ],
    cta: "Acheter des crédits",
    highlight: false,
  },
  {
    name: "Abonnement Premium",
    price: "15 000",
    unit: "Ar / mois",
    description: "Accès total pour une réussite garantie.",
    features: [
      "Tous les sujets illimités",
      "Toutes les corrections IA",
      "Support prioritaire",
      "Badge Premium",
    ],
    cta: "Devenir Premium",
    highlight: true,
  },
];

const subjectCategories = [
  { name: "Mathématiques", icon: Calculator, count: 156, color: "from-amber-400 to-orange-500" },
  { name: "Physique-Chimie", icon: FlaskConical, count: 124, color: "from-orange-400 to-red-500" },
  { name: "SVT", icon: Atom, count: 98, color: "from-yellow-400 to-amber-500" },
  { name: "Français", icon: BookOpen, count: 142, color: "from-red-400 to-rose-500" },
  { name: "Histoire-Géo", icon: MapPin, count: 87, color: "from-orange-500 to-amber-600" },
  { name: "Philosophie", icon: Lightbulb, count: 65, color: "from-amber-500 to-yellow-500" },
  { name: "Anglais", icon: Globe, count: 110, color: "from-rose-400 to-red-500" },
  { name: "Malagasy", icon: Heart, count: 54, color: "from-red-500 to-orange-500" },
];

const examTypes = [
  { name: "CEPE", count: "+120", gradient: "from-yellow-400 to-amber-500" },
  { name: "BEPC", count: "+250", gradient: "from-amber-400 to-orange-500" },
  { name: "BACC", count: "+500", gradient: "from-orange-400 to-red-500" },
  { name: "LICENCE", count: "+150", gradient: "from-red-400 to-rose-500" },
  { name: "CONCOURS", count: "+80", gradient: "from-rose-400 to-red-500" },
];

const typewriterWords = ["MASTER", "LICENCE", "BACC", "BEPC", "CEPE", "divers CONCOURS"];

// ─── COMPOSANT PRINCIPAL ───
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState(typewriterWords[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Typewriter effect
  useEffect(() => {
    if (!mounted) return;

    const timeout = setTimeout(
      () => {
        const currentFullWord = typewriterWords[currentWordIndex];

        if (!isDeleting) {
          setCurrentText(currentFullWord.substring(0, currentText.length + 1));
          if (currentText === currentFullWord) {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          setCurrentText(currentFullWord.substring(0, currentText.length - 1));
          if (currentText === "") {
            setIsDeleting(false);
            setCurrentWordIndex((prev) => (prev + 1) % typewriterWords.length);
          }
        }
      },
      isDeleting ? 100 : 150
    );

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, mounted]);

  // Affichage du texte pour le typewriter - utiliser une valeur par défaut côté serveur
  const displayText = mounted ? currentText : typewriterWords[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-x-hidden transition-colors duration-300">
      {/* ─── AMBIENT BACKGROUND ─── */}
      <div className="mah-ambient">
        <div className="mah-blob mah-blob-1 dark:opacity-10" />
        <div className="mah-blob mah-blob-2 dark:opacity-10" />
        <div className="mah-blob mah-blob-3 dark:opacity-10" />
      </div>

      {/* ─── NAVIGATION ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/icons/icon-512x512.png"
                alt="Logo"
                className="h-9 w-9 rounded-xl shadow-lg shadow-orange-500/20"
              />
              <span className="text-xl font-extrabold tracking-tight font-outfit text-slate-900 dark:text-white">
                Mah<span className="text-gradient-grit">.ai</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#solutions"
                className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                Solutions
              </a>
              <a
                href="#catalogue"
                className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                Catalogue
              </a>
              <a
                href="#pricing"
                className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                Tarifs
              </a>
              <Link
                href="/subjects"
                className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-500 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" /> Explorer
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Desktop CTA */}
              <Link
                href="/auth"
                className="hidden sm:flex px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
              >
                Se connecter
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 animate-slide-down">
            <div className="px-4 py-6 space-y-4">
              <a
                href="#solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                Solutions
              </a>
              <a
                href="#catalogue"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                Catalogue
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                Tarifs
              </a>
              <Link
                href="/subjects"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-sm font-bold text-amber-600 dark:text-amber-500"
              >
                Explorer le catalogue
              </Link>
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center text-sm font-bold uppercase tracking-wider shadow-lg"
              >
                Se connecter
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-28 lg:pt-40 pb-16 lg:pb-24 z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-8 animate-bounce-soft border border-amber-100 dark:border-amber-500/20">
                <Rocket className="w-4 h-4" /> Prépare ton avenir dès aujourd'hui
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-outfit tracking-tight leading-[0.9] mb-8 text-slate-900 dark:text-white">
                Tes sujets d'examens.
                <br />
                <span className="text-gradient-grit">Leurs corrigés réels.</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Ne reste plus jamais bloqué devant un exercice. Accède aux annales et progresse avec
                nos <span className="text-slate-900 dark:text-white font-bold">corrigés IA et Humains</span>.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/subjects"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold uppercase tracking-wider shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                  <BookOpen className="w-5 h-5" />
                  Voir les sujets
                </Link>
                <Link
                  href="/auth"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider hover:border-amber-300 dark:hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all"
                >
                  S'inscrire gratuitement
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-8 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-gradient-grit">+1200</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Sujets
                  </div>
                </div>
                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-gradient-grit">+5000</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Étudiants
                  </div>
                </div>
                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-500">98%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Satisfaction
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Illustration */}
            <div className="flex-1 relative">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-[48px] blur-3xl scale-90" />

                {/* Main Image */}
                <div className="relative bg-white dark:bg-slate-900 rounded-[32px] p-4 shadow-2xl shadow-orange-500/10 border border-slate-100 dark:border-slate-800">
                  <img
                    src="/hero-illustration.png"
                    alt="Étudiants malgaches utilisant mah.ai"
                    className="w-full h-auto rounded-2xl"
                  />

                  {/* Floating Badge */}
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-2 animate-bounce-soft">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold">IA Intégrée</span>
                  </div>

                  {/* Floating Card Left */}
                  <div className="absolute -left-6 top-1/3 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 animate-float hidden lg:block">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-900 dark:text-white">Corrigé validé</div>
                        <div className="text-[9px] text-slate-400">Par un professeur</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── EXAM TYPES BANNER ─── */}
      <section className="py-8 z-10 relative overflow-hidden">
        <div className="flex items-center justify-center gap-4 flex-wrap px-4">
          {examTypes.map((type, i) => (
            <div
              key={i}
              className={`px-6 py-3 rounded-2xl bg-gradient-to-r ${type.gradient} text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer`}
            >
              <div className="text-lg font-extrabold">{type.name}</div>
              <div className="text-[10px] font-bold opacity-80">{type.count} sujets</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SOLUTIONS SECTION ─── */}
      <section id="solutions" className="py-24 lg:py-32 z-10 relative bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-extrabold font-outfit tracking-tight min-h-[1.2em] text-slate-900 dark:text-white">
              Tout pour réussir ton{" "}
              <span className="text-gradient-grit" suppressHydrationWarning>
                {displayText}
                <span className="animate-pulse text-orange-500">|</span>
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {mainFeatures.map((f, i) => (
              <div
                key={i}
                className={`p-8 lg:p-10 rounded-[32px] ${f.bg} border border-slate-100 dark:border-slate-800 group hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-500`}
              >
                <div
                  className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br ${f.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20`}
                >
                  <f.icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <h3 className="text-lg lg:text-xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATALOGUE BENTO GRID ─── */}
      <section id="catalogue" className="py-24 lg:py-32 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-semibold mb-6">
              <Layout className="w-4 h-4" /> Explore par matière
            </div>
            <h2 className="text-3xl lg:text-5xl font-extrabold font-outfit tracking-tight mb-4 text-slate-900 dark:text-white">
              Toutes les <span className="text-gradient-grit">matières</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              Plus de 1200 sujets organisés par matière, année et série pour une recherche
              ultra-rapide.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {subjectCategories.map((subject, i) => (
              <Link
                href={`/subjects?subject=${encodeURIComponent(subject.name)}`}
                key={i}
                className={`group relative p-6 lg:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-transparent hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 overflow-hidden ${
                  i === 0 || i === 3 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                {/* Gradient Overlay on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    <subject.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                  </div>

                  <h3 className="text-base lg:text-lg font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">
                    {subject.name}
                  </h3>
                  <p className="text-slate-400 text-xs font-bold">{subject.count} sujets</p>

                  <div className="mt-4 flex items-center text-amber-600 dark:text-amber-500 text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                    Explorer <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              href="/subjects"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold uppercase tracking-wider shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              Voir tout le catalogue
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── GAMIFICATION SECTION ─── */}
      <section className="py-24 lg:py-32 z-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[40px] lg:rounded-[48px] p-8 lg:p-16 text-white flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-full blur-[100px]" />

            <div className="lg:w-1/2 space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-amber-400 text-xs font-semibold">
                <Trophy className="w-4 h-4" /> Système de mérite
              </div>
              <h2 className="text-3xl lg:text-5xl xl:text-6xl font-extrabold font-outfit tracking-tight leading-tight">
                Reste motivé avec le{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
                  Grit Score.
                </span>
              </h2>
              <p className="text-slate-400 text-base lg:text-lg leading-relaxed">
                Gagne des points pour chaque exercice résolu. Monte dans le classement, débloque
                des badges exclusifs et transforme tes révisions en un véritable jeu.
              </p>
              <div className="flex gap-6 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-white">#1</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Classement
                  </div>
                </div>
                <div className="w-[1px] h-12 bg-white/10" />
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-gradient-grit">+500</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Grit Points
                  </div>
                </div>
                <div className="w-[1px] h-12 bg-white/10" />
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-emerald-400">12</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Badges
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 lg:p-6 rounded-[24px] lg:rounded-[32px] rotate-3 hover:rotate-0 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-bold mb-1">Streak 7 Jours</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Motivation</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 lg:p-6 rounded-[24px] lg:rounded-[32px] -rotate-3 hover:rotate-0 transition-transform translate-y-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-4 shadow-lg shadow-red-500/20">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-bold mb-1">Badge Major</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Honneur</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 lg:p-6 rounded-[24px] lg:rounded-[32px] -rotate-2 hover:rotate-0 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-bold mb-1">Top 10%</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Excellence</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 lg:p-6 rounded-[24px] lg:rounded-[32px] rotate-2 hover:rotate-0 transition-transform translate-y-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/20">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-bold mb-1">5 étoiles</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Perfectionniste</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING SECTION ─── */}
      <section id="pricing" className="py-24 lg:py-32 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl xl:text-6xl font-extrabold font-outfit mb-4 text-slate-900 dark:text-white">
            Prêt à <span className="text-gradient-grit">réussir ?</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto mb-12">
            Choisis la formule qui te convient le mieux
          </p>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((p, i) => (
              <div
                key={i}
                className={`p-8 lg:p-10 rounded-[32px] lg:rounded-[48px] border transition-all duration-500 ${
                  p.highlight
                    ? "bg-white dark:bg-slate-900 border-amber-400 dark:border-amber-500 shadow-2xl shadow-orange-500/15 scale-100 lg:scale-105 z-10"
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xl"
                }`}
              >
                {p.highlight && (
                  <div className="inline-block px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-full mb-6">
                    Le plus populaire
                  </div>
                )}
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
                  {p.name}
                </div>
                <div className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
                  {p.price}
                  <span className="text-lg lg:text-xl ml-1 text-slate-400">{p.unit}</span>
                </div>
                <p className="text-sm text-slate-500 mb-8">{p.description}</p>
                <ul className="text-left space-y-3 lg:space-y-4 mb-8 lg:mb-10">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth"
                  className={`block w-full py-3.5 lg:py-4 rounded-xl lg:rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                    p.highlight
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DONATION SECTION ─── */}
      <section className="py-24 lg:py-32 z-10 relative text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white dark:bg-slate-900 rounded-2xl lg:rounded-3xl shadow-2xl shadow-rose-500/20 flex items-center justify-center mx-auto mb-8 lg:mb-10 rotate-6 border border-slate-100 dark:border-slate-800">
            <Heart className="w-8 h-8 lg:w-10 lg:h-10 text-rose-500 fill-rose-500" />
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold font-outfit mb-6 lg:mb-8 text-slate-900 dark:text-white">
            Soutenir le projet
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 lg:mb-12 text-base lg:text-lg leading-relaxed">
            Mah.ai aide des milliers de jeunes. Votre soutien permet de financer l'IA et de
            rémunérer les professeurs malgaches qui créent les corrigés.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 lg:gap-5">
            <button className="flex items-center justify-center gap-3 px-6 lg:px-8 py-3.5 lg:py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl lg:rounded-2xl font-bold uppercase tracking-wider text-[11px] hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all shadow-lg">
              <Coffee className="w-4 h-4 text-amber-600" /> Offrir un café (1 000 Ar)
            </button>
            <button className="flex items-center justify-center gap-3 px-6 lg:px-8 py-3.5 lg:py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl lg:rounded-2xl font-bold uppercase tracking-wider text-[11px] shadow-xl shadow-orange-500/25 hover:shadow-2xl transition-all">
              <Heart className="w-4 h-4" /> Soutien majeur
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-16 lg:py-24 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 lg:gap-10">
            <div className="text-center md:text-left space-y-3 lg:space-y-4">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <img src="/icons/icon-512x512.png" alt="Logo" className="h-8 w-8 rounded-xl shadow-md" />
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Mah<span className="text-gradient-grit">.ai</span>
                </span>
              </Link>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Fait avec passion pour Madagascar 🇲🇬
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 lg:gap-8 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <a href="#" className="hover:text-amber-600 transition-colors">
                Confidentialité
              </a>
              <a href="#" className="hover:text-amber-600 transition-colors">
                Conditions
              </a>
              <a href="#" className="hover:text-amber-600 transition-colors">
                Contact
              </a>
              <a href="#" className="hover:text-amber-600 transition-colors">
                FAQ
              </a>
            </div>
          </div>
          <div className="mt-10 lg:mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-slate-400 text-xs">
              © {new Date().getFullYear()} mah.ai. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}