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
} from "lucide-react";
import { submitCreditPurchase } from "@/app/actions/credits";

interface RechargeWorkflowProps {
  amount: number;
  price: number;
  onClose: () => void;
}

type Step = 'method' | 'instructions' | 'reference' | 'success';

export function RechargeWorkflow({ amount, price, onClose }: RechargeWorkflowProps) {
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<'mvola' | 'orange' | 'airtel' | null>(null);
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const result = await submitCreditPurchase({
      amount,
      cost_mga: price,
      payment_method: method.toUpperCase(),
      payment_reference: reference
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
    // Could add a toast here
  };

  const paymentNumbers: Record<NonNullable<typeof method>, { display: string; raw: string }> = {
    mvola: { display: "034 77 130 85", raw: "0347713085" },
    orange: { display: "032 17 560 02", raw: "0321756002" },
    airtel: { display: "034 00 000 00", raw: "0340000000" },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 pb-6 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md max-h-[calc(100vh-7rem)] bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Pack {amount} crédits</h3>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{price.toLocaleString()} Ar</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white shadow-sm transition-all text-slate-400 hover:text-slate-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {/* Progress Dots */}
          {step !== 'success' && (
            <div className="flex gap-1.5 mb-6 justify-center">
              {['method', 'instructions', 'reference'].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    step === s ? "w-8 bg-slate-900" : "w-2 bg-slate-200"
                  }`} 
                />
              ))}
            </div>
          )}

          {/* STEP 1: Choose Method */}
          {step === 'method' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="h-16 w-16 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="font-bold text-slate-900">Mode de paiement</h4>
                <p className="text-sm text-slate-500 mt-1">Sélectionne ton opérateur Mobile Money</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'mvola', name: 'Mvola', color: 'bg-[#00A1E4]', text: 'text-white' },
                  { id: 'orange', name: 'Orange Money', color: 'bg-[#FF6600]', text: 'text-white' },
                  { id: 'airtel', name: 'Airtel Money', color: 'bg-[#E11900]', text: 'text-white' },
                ].map((op) => (
                  <button
                    key={op.id}
                    onClick={() => {
                      setMethod(op.id as any);
                      setStep('instructions');
                    }}
                    className={`
                      flex items-center justify-between p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95
                      ${method === op.id ? "border-slate-900 bg-slate-50" : "border-slate-100 bg-white"}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${op.color} flex items-center justify-center font-black text-xs ${op.text}`}>
                        {op.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900">{op.name}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Instructions */}
          {step === 'instructions' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Instructions de transfert</p>
                <p className="text-sm text-slate-700 leading-relaxed mb-6">
                  Envoie exactement <span className="font-black text-slate-900 underline underline-offset-4">{price.toLocaleString()} Ar</span> au numéro suivant :
                </p>
                
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between mb-4 shadow-inner">
                  <span className="font-mono font-black text-lg text-slate-900 tracking-tighter">
                    {method ? paymentNumbers[method].display : "—"}
                  </span>
                  <button 
                    onClick={() => method && copyToClipboard(paymentNumbers[method].raw)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-indigo-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Nom: MAH AI TECHNOLOGY</p>
              </div>

              <div className="flex items-start gap-3 text-left p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  Une fois le transfert effectué, tu recevras un SMS de confirmation contenant un <strong>code de référence</strong>. Tu devras le saisir à l'étape suivante.
                </p>
              </div>

              <button 
                onClick={() => setStep('reference')}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 hover:bg-indigo-600 transition-all"
              >
                J'ai effectué le transfert
              </button>
            </div>
          )}

          {/* STEP 3: Reference */}
          {step === 'reference' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <div>
                <h4 className="font-black text-slate-900">Validation de la transaction</h4>
                <p className="text-sm text-slate-500 mt-1">Saisis le code de référence reçu par SMS</p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <input 
                    autoFocus
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-amber-400 focus:bg-white outline-none font-mono font-bold transition-all text-center tracking-widest"
                    placeholder="Ex: 12345678"
                  />
                </div>
                {error && <p className="text-xs font-bold text-red-500 bg-red-50 py-2 rounded-lg">{error}</p>}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setStep('instructions')}
                  className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold uppercase tracking-widest text-xs text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Retour
                </button>
                <button 
                  onClick={() => {
                    if (!reference || reference.length < 5) {
                      setError("Référence invalide (min. 5 caractères)");
                      return;
                    }
                    handleSubmit();
                  }}
                  disabled={loading}
                  className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Valider la recharge"}
                </button>
              </div>
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
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">Merci, demande enregistrée !</h4>
                <p className="text-slate-500 mt-3 leading-relaxed">
                  Ton transfert est en cours de vérification par nos administrateurs. Tu seras notifié dès que l'achat sera validé. Utilise tes crédits avec modération.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant</span>
                  <span className="text-sm font-bold text-slate-900">{price.toLocaleString()} Ar</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Crédits attendus</span>
                  <span className="text-sm font-black text-indigo-600">+{amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Référence</span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {reference}
                  </span>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 hover:bg-indigo-600 transition-all"
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
