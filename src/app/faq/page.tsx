import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { ContactButton } from "@/components/ui/ContactButton";

const faqs = [
  {
    q: "C&apos;est quoi le Grit Score ?",
    a: "Le Grit Score mesure ton effort et ta persévérance. Tu gagnes des points en lisant des sujets et en résolvant des exercices. C&apos;est ton indice de motivation !"
  },
  {
    q: "Comment acheter des crédits ?",
    a: "Va dans la section 'Recharge & Plans'. Tu peux choisir un pack de crédits et payer via Mobile Money (Mvola, Orange Money). Un code de référence te sera demandé."
  },
  {
    q: "L&apos;IA donne-t-elle toujours la réponse ?",
    a: "Pas en mode Socratique ! L&apos;IA est conçue pour te poser des questions et te guider vers la solution par toi-même. Pour une réponse directe, utilise l&apos;option 'Réponse IA'."
  },
  {
    q: "Comment devenir contributeur ?",
    a: "Si tu es un professeur ou un étudiant brillant et que tu souhaites proposer tes corrigés, contacte l&apos;admin via la messagerie pour demander le rôle de contributeur."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <header className="mb-12 text-center">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600 w-fit mx-auto mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">Foire Aux Questions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Tout ce que tu dois savoir pour bien utiliser mah.ai</p>
        </header>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all group"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                <span className="text-amber-500">Q.</span> {faq.q}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-7 border-l-2 border-slate-100 dark:border-slate-800 group-hover:border-amber-200 transition-colors">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[40px] border border-indigo-100 dark:border-indigo-800">
          <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-2">Pas de réponse à ta question ?</h2>
          <p className="text-indigo-600 dark:text-indigo-400/70 mb-6">Contacte notre équipe directement via le formulaire.</p>
          <ContactButton 
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20"
          >
            Écrire au support
          </ContactButton>
        </div>
      </div>
    </div>
  );
}
