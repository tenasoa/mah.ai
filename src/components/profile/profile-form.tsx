'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Hash, School, GraduationCap, Layers, Plus } from 'lucide-react';

const filiereOptions = [
  'Générale',
  'Technique',
  'Professionnelle',
];

const classeOptions = {
  Générale: ['Seconde', 'Première', 'Terminale'],
  Technique: ['Seconde', 'Première STI2D', 'Terminale STI2D'],
  Professionnelle: ['Seconde Pro', 'Première Pro', 'Terminale Pro'],
};

export function ProfileForm() {
  const [pseudo, setPseudo] = useState('');
  const [etablissement, setEtablissement] = useState('');
  const [filiere, setFiliere] = useState('');
  const [classe, setClasse] = useState('');
  const [autre, setAutre] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setPseudo(data.pseudo || '');
          setEtablissement(data.etablissement || '');
          setFiliere(data.filiere || '');
          setClasse(data.classe || '');
          setAutre(data.autre || '');
        }
      }
      setInitialLoading(false);
    }
    getProfile();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error: updateError } = await supabase.from('profiles').upsert({
        id: user.id,
        pseudo,
        etablissement,
        filiere,
        classe,
        autre,
        updated_at: new Date(),
      }, { onConflict: 'id' });

      if (updateError) {
        setError(updateError.message);
      } else {
        router.push('/dashboard');
      }
    }
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500">Pseudo</label>
        <div className="relative group">
          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-200 outline-none transition-all"
            placeholder="Ex: Major2026"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500">Établissement*</label>
        <div className="relative group">
          <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-200 outline-none transition-all"
            placeholder="Nom de votre lycée"
            value={etablissement}
            onChange={(e) => setEtablissement(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500">Filière</label>
          <div className="relative group">
            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
            <select
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-amber-400 focus:ring-4 focus:ring-amber-200 outline-none transition-all appearance-none"
              value={filiere}
              onChange={(e) => {
                setFiliere(e.target.value);
                setClasse('');
              }}
              required
            >
              <option value="" disabled>Sélectionnez</option>
              {filiereOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500">Classe</label>
          <div className="relative group">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
            <select
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-amber-400 focus:ring-4 focus:ring-amber-200 outline-none transition-all appearance-none disabled:opacity-50"
              value={classe}
              onChange={(e) => setClasse(e.target.value)}
              required
              disabled={!filiere}
            >
              <option value="" disabled>Sélectionnez</option>
              {(classeOptions[filiere as keyof typeof classeOptions] || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500">Notes / Autres</label>
        <div className="relative group">
          <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-200 outline-none transition-all"
            placeholder="Optionnel"
            value={autre}
            onChange={(e) => setAutre(e.target.value)}
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading} 
        className="w-full py-3 rounded-xl vibrant-grit text-white font-semibold shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enregistrer mon profil'}
      </button>
    </form>
  );
}
