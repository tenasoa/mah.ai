"use client";

import { useState } from "react";
import { Portal } from "@/components/ui/portal";
import { 
  X, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileSearch,
  Coins
} from "lucide-react";
import { createSubjectRequest } from "@/app/actions/tickets";
import { useRouter } from "next/navigation";

interface SubjectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMatiere?: string;
}

export function SubjectRequestModal({
  isOpen,
  onClose,
  initialMatiere = "",
}: SubjectRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [matiere, setMatiere] = useState(initialMatiere);
  const [year, setYear] = useState(new Date().getFullYear());
  const [serie, setSerie] = useState("");
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createSubjectRequest({
        matiere,
        year,
        serie: serie || undefined,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
            onClose();
            router.refresh();
        }, 2000);
      } else {
        setError(result.error || "Erreur lors de la création du ticket.");
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">Demander un sujet</h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Nous le chercherons pour toi !</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200 transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="p-8">
            {success ? (
                <div className="text-center py-10">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-2">Demande envoyée !</h4>
                    <p className="text-slate-500 mb-2">Ton ticket a été créé avec succès.</p>
                    <p className="text-xs text-amber-600 font-bold uppercase tracking-widest">Remboursement auto sous 3 jours si non trouvé</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-6">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Coins className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                            Cette demande coûte <span className="font-bold">2 crédits</span>. Ils te seront automatiquement remboursés si le sujet n'est pas ajouté dans les 3 jours.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Matière</label>
                        <input 
                            required
                            value={matiere}
                            onChange={(e) => setMatiere(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 transition-all shadow-inner" 
                            placeholder="ex: Mathématiques, SVT..." 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Année</label>
                            <input 
                                type="number"
                                required
                                value={isNaN(year) ? "" : year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-indigo-400 transition-all shadow-inner" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Série / Filière</label>
                            <input 
                                value={serie}
                                onChange={(e) => setSerie(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 transition-all shadow-inner" 
                                placeholder="ex: D, C, OSE, L..." 
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl flex items-center gap-3 border border-red-100">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="font-bold">{error === 'INSUFFICIENT_CREDITS' ? 'Crédits insuffisants pour cette demande.' : error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Création...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Envoyer la demande
                            </>
                        )}
                    </button>
                </form>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
