"use client";

import { useState } from "react";
import {
  X,
  Smartphone,
  CheckCircle2,
  Copy,
  Loader2,
  AlertCircle,
  ArrowRight,
  Heart,
  Coffee
} from "lucide-react";
import { submitSupportPayment } from "@/app/actions/payment";

interface SupportWorkflowProps {
  type: 'coffee' | 'major';
  onClose: () => void;
}

type Step = 'method' | 'instructions' | 'success';

export function SupportWorkflow({ type, onClose }: SupportWorkflowProps) {
  const configs = {
    coffee: {
      title: "Offrir un café",
      amount: 1000,
      icon: Coffee,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    major: {
      title: "Soutien majeur",
      amount: 5000,
      icon: Heart,
      color: "text-rose-600",
      bg: "bg-rose-50"
    }
  };

  const config = configs[type];

  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<'mvola' | 'orange' | 'airtel' | null>(null);
  const [amount, setAmount] = useState(config.amount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!method) {
      setError("Veuillez choisir un mode de paiement.");
      setLoading(false);
      return;
    }

    const result = await submitSupportPayment({
      amount_mga: amount,
      payment_method: method.toUpperCase(),
      payment_reference: 'Soutien-' + Date.now(), // Generate a placeholder reference
      support_type: type
    });

    if (result.success) {
      setStep('success');
    } else {
      setError(result.error || "Une erreur est survenue");
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const paymentNumbers: Record<NonNullable<typeof method>, { display: string; raw: string }> = {
    mvola: { display: "034 77 130 85", raw: "0347713085" },
    orange: { display: "032 17 560 02", raw: "0321756002" },
    airtel: { display: "033 00 000 00", raw: "0330000000" }, // Mock data, actual might differ
  };

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 pb-6 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md max-h-[calc(100vh-7rem)] bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-white/10">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${config.bg} dark:bg-slate-800`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{config.title}</h3>
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">{amount.toLocaleString()} Ar</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-12rem)] custom-scrollbar">
          {/* Progress Dots */}
          {step !== 'success' && (
            <div className="flex gap-1.5 mb-6 justify-center">
              {['method', 'instructions'].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    step === s ? "w-8 bg-slate-900 dark:bg-amber-500" : "w-2 bg-slate-200 dark:bg-slate-800"
                  }`} 
                />
              ))}
            </div>
          )}

          {/* STEP 1: Choose Method */}
          {step === 'method' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="h-16 w-16 bg-amber-50 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">Détails du don</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Choisis ton montant et ton mode de paiement</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Montant du don (Ar)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-amber-400 focus:bg-white dark:focus:bg-slate-700 outline-none font-bold transition-all text-lg text-slate-900 dark:text-white"
                    placeholder="Entrez le montant..."
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300 dark:text-slate-600">Ar</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'mvola', name: 'Mvola', color: 'bg-[#00A1E4]', text: 'text-white', disabled: false },
                  { id: 'orange', name: 'Orange Money', color: 'bg-[#FF6600]', text: 'text-white', disabled: false },
                  { id: 'airtel', name: 'Airtel Money', color: 'bg-[#E11900]', text: 'text-white', disabled: true },
                ].map((op) => (
                  <button
                    key={op.id}
                    onClick={() => {
                      if (op.disabled) return;
                      setMethod(op.id as any);
                      setStep('instructions');
                    }}
                    disabled={op.disabled}
                    className={`
                      flex items-center justify-between p-5 rounded-2xl border-2 transition-all
                      ${op.disabled ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800" : "hover:scale-[1.02] active:scale-95"}
                      ${method === op.id ? "border-slate-900 dark:border-amber-500 bg-slate-50 dark:bg-slate-800/50" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${op.color} flex items-center justify-center font-black text-xs ${op.text}`}>
                        {op.name.charAt(0)}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-slate-900 dark:text-white">{op.name}</span>
                        {op.disabled && (
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Bientôt disponible</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Instructions */}
          {step === 'instructions' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Instructions de transfert</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  Envoie exactement <span className="font-black text-slate-900 dark:text-white underline underline-offset-4">{amount.toLocaleString()} Ar</span> au numéro suivant :
                </p>
                
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between mb-4 shadow-inner">
                  <span className="font-mono font-black text-lg text-slate-900 dark:text-white tracking-tighter">
                    {method ? paymentNumbers[method].display : "—"}
                  </span>
                  <button 
                    onClick={() => method && copyToClipboard(paymentNumbers[method].raw)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-indigo-600 dark:text-indigo-400"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Nom: MAH AI TECHNOLOGY</p>
              </div>

              <div className="flex items-start gap-3 text-left p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                  Assure-toi de transférer le montant exact indiqué ci-dessus. Ta contribution sera validée manuellement par notre équipe.
                </p>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 dark:shadow-amber-500/20 hover:bg-emerald-600 dark:hover:bg-amber-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "J'ai effectué le transfert"}
              </button>
            </div>
          )}



          {/* STEP 4: Success */}
          {step === 'success' && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500 text-center py-4">
              <div className="relative inline-flex mb-4">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
                <div className="relative h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Merci infiniment !</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                  Ton soutien a été enregistré. Nos administrateurs vont vérifier la transaction. Ton aide est précieuse pour la communauté Mah.ai !
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Type de soutien</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{config.title}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Montant</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{amount.toLocaleString()} Ar</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date</span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 dark:shadow-amber-500/20 hover:bg-indigo-600 dark:hover:bg-amber-400 transition-all"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
