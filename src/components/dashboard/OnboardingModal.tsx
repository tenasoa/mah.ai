"use client";

import { useState } from "react";
import { 
  Sparkles, 
  BookOpen, 
  Trophy, 
  Zap, 
  Rocket, 
  ChevronRight, 
  X,
  Star
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const steps = [
  {
    title: "Bienvenue sur Mah.ai !",
    desc: "Ton nouveau compagnon de réussite. On va t'aider à décrocher tes examens avec brio.",
    icon: Rocket,
    color: "bg-amber-500",
  },
  {
    title: "Des centaines de sujets",
    desc: "Explore notre catalogue complet de sujets officiels et de corrigés détaillés.",
    icon: BookOpen,
    color: "bg-indigo-500",
  },
  {
    title: "Apprends avec l'IA",
    desc: "Notre IA socratique ne te donne pas juste la réponse, elle t'aide à comprendre par toi-même.",
    icon: Sparkles,
    color: "bg-violet-500",
  },
  {
    title: "Gagne des points",
    desc: "Chaque minute de révision te rapporte du Grit Score. Monte dans le classement et gagne des badges !",
    icon: Trophy,
    color: "bg-emerald-500",
  },
];

export function OnboardingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const supabase = createClient();

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as completed in DB
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden animate-scale-in border border-white/10">
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="p-10 text-center">
          <div className={`w-20 h-20 ${steps[currentStep].color} text-white rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-xl`}>
            <StepIcon className="w-10 h-10" />
          </div>

          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 font-outfit">
            {steps[currentStep].title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-10">
            {steps[currentStep].desc}
          </p>

          {/* Dots */}
          <div className="flex justify-center gap-2 mb-10">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? "w-8 bg-amber-500" : "w-2 bg-slate-200 dark:bg-slate-800"
                }`} 
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-500 dark:hover:bg-amber-400 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 group"
          >
            {currentStep < steps.length - 1 ? (
                <>
                    Continuer
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
            ) : (
                <>
                    C'est parti !
                    <Rocket className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
