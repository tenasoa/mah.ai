import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";
import { ContactButton } from "@/components/ui/ContactButton";

export default function CGUPage() {
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <header className="mb-12">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600 w-fit mb-6">
              <ScrollText className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">Conditions Générales d&apos;Utilisation</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 italic">Dernière mise à jour : 29 Janvier 2026</p>
          </header>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                1. Objet
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                La plateforme <strong>mah.ai</strong> a pour objet de fournir des ressources pédagogiques numériques (sujets d&apos;examens, corrigés, tutorat par IA) aux étudiants de Madagascar. En utilisant nos services, vous acceptez sans réserve les présentes conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                2. Accès aux Services
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                L&apos;accès à certains contenus nécessite la création d&apos;un compte et l&apos;acquisition de <strong>crédits</strong> ou d&apos;un <strong>abonnement Premium</strong>. Vous êtes responsable de la confidentialité de vos identifiants.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                3. Système de Crédits
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Les crédits achetés sur la plateforme permettent de débloquer des sujets et d&apos;utiliser les services d&apos;IA. Les crédits ne sont ni remboursables (sauf en cas de bug technique avéré) ni échangeables contre de l&apos;argent réel.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                4. Propriété Intellectuelle
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Le contenu généré par l&apos;IA et les corrigés fournis par nos professeurs sont la propriété de mah.ai. Toute reproduction ou redistribution commerciale sans autorisation est strictement interdite.
              </p>
            </section>

            <section className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Contact</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Pour toute question relative aux CGU ou pour obtenir de l&apos;aide, contactez-nous via notre formulaire.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <ContactButton 
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20"
                >
                  Formulaire de contact
                </ContactButton>
                <a 
                  href="mailto:o.tenasoa@gmail.com" 
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-amber-600/20"
                >
                  Email direct
                </a>
              </div>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
