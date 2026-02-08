import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ContactButton } from "@/components/ui/ContactButton";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <article className="bg-white dark:bg-slate-900 rounded-[40px] shadow-xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <header className="mb-12">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 w-fit mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">Politique de Confidentialité</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 italic">Dernière mise à jour : 29 Janvier 2026</p>
          </header>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                1. Collecte des Données
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Nous collectons uniquement les informations nécessaires à votre expérience d&apos;apprentissage : votre email, votre pseudo, et vos préférences académiques.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                2. Utilisation des Données
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Vos données sont utilisées pour personnaliser votre tutorat IA, suivre votre progression (Grit Score) et vous permettre de communiquer avec la communauté.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                3. Sécurité
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Toutes les transactions et données personnelles sont sécurisées via Supabase. Nous ne vendons jamais vos données à des tiers.
              </p>
            </section>

            <section className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Contactez-nous</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Vous pouvez à tout moment nous contacter pour des questions sur vos données ou demander la suppression de votre compte.
              </p>
              <ContactButton 
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20"
              >
                Contacter le support
              </ContactButton>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
