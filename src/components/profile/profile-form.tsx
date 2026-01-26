'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Loader2, 
  Hash, 
  School, 
  GraduationCap, 
  Layers, 
  Plus, 
  Camera, 
  User, 
  Globe, 
  MapPin, 
  Calendar, 
  Heart, 
  Target, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield 
} from 'lucide-react';

const educationLevelOptions = [
  'Collège',
  'Seconde',
  'Première',
  'Terminale',
  'BTS/DUT',
  'Licence',
  'Master',
  'Autre'
];

export function ProfileForm({ onSuccess, onCancel }: { onSuccess?: () => void, onCancel?: () => void }) {
  const [pseudo, setPseudo] = useState('');
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [education_level, setEducationLevel] = useState('');
  const [etablissement, setEtablissement] = useState('');
  const [filiere, setFiliere] = useState('');
  const [classe, setClasse] = useState('');
  const [birth_date, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [learning_goals, setLearningGoals] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [autre, setAutre] = useState('');
  const [avatar_url, setAvatarUrl] = useState('');
  const [privacy_settings, setPrivacySettings] = useState({
    show_full_name: false,
    show_email: false,
    show_birth_date: false,
    show_address: false,
    show_learning_goals: true,
    show_interests: true
  });
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
          setFullName(data.full_name || '');
          setEmail(user.email || '');
          setBio(data.bio || '');
          setEducationLevel(data.education_level || '');
          setEtablissement(data.etablissement || '');
          setFiliere(data.filiere || '');
          setClasse(data.classe || '');
          setBirthDate(data.birth_date || '');
          setAddress(data.address || '');
          setCountry(data.country || '');
          setLearningGoals(data.learning_goals || []);
          setInterests(data.interests || []);
          setAutre(data.autre || '');
          setAvatarUrl(data.avatar_url || '');
          if (data.privacy_settings) {
            setPrivacySettings(data.privacy_settings);
          }
        }
      }
      setInitialLoading(false);
    }
    getProfile();
  }, [supabase]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordMsg({ type: 'error', text: error.message });
    } else {
      setPasswordMsg({ type: 'success', text: 'Mot de passe mis à jour !' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setPasswordLoading(false);
  };

  const handleAddTag = (type: 'goals' | 'interests') => {
    if (type === 'goals' && newGoal.trim()) {
      if (!learning_goals.includes(newGoal.trim())) {
        setLearningGoals([...learning_goals, newGoal.trim()]);
      }
      setNewGoal('');
    } else if (type === 'interests' && newInterest.trim()) {
      if (!interests.includes(newInterest.trim())) {
        setInterests([...interests, newInterest.trim()]);
      }
      setNewInterest('');
    }
  };

  const handleRemoveTag = (type: 'goals' | 'interests', tag: string) => {
    if (type === 'goals') {
      setLearningGoals(learning_goals.filter(t => t !== tag));
    } else {
      setInterests(interests.filter(t => t !== tag));
    }
  };

  const togglePrivacy = (key: keyof typeof privacy_settings) => {
    setPrivacySettings({ ...privacy_settings, [key]: !privacy_settings[key] });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { data } = await response.json();
        setAvatarUrl(data);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error: updateError } = await supabase.from('profiles').upsert({
        id: user.id,
        pseudo,
        full_name,
        bio,
        education_level,
        etablissement,
        filiere,
        classe,
        birth_date,
        address,
        country,
        learning_goals,
        interests,
        autre,
        avatar_url: avatar_url,
        privacy_settings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      if (updateError) {
        setError(updateError.message);
      } else {
        router.refresh(); // Refresh server components
        if (onSuccess) onSuccess();
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
    <div className="space-y-10">
      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}
        
        {/* Section: Identité visuelle */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-500" />
            Identité visuelle
          </h4>
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="relative">
              {avatar_url ? (
                <img 
                  src={avatar_url} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-300" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors shadow-md">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
              </label>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700">Photo de profil</p>
              <p className="text-xs text-slate-400 mt-0.5">Cliquez sur l'icône pour changer.</p>
              {uploadingAvatar && <p className="text-xs text-amber-600 mt-1 font-medium">Upload en cours...</p>}
            </div>
          </div>
        </div>

        {/* Section: Informations de base */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-t pt-6">
            <User className="w-4 h-4 text-indigo-500" />
            Informations de base
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Pseudo</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-amber-400 outline-none"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nom Complet</label>
                <button type="button" onClick={() => togglePrivacy('show_full_name')} className="text-[9px] font-bold flex items-center gap-1 hover:text-amber-600">
                  {privacy_settings.show_full_name ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                  {privacy_settings.show_full_name ? 'Public' : 'Privé'}
                </button>
              </div>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-amber-400 outline-none"
                placeholder="Prénom et Nom"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email (Lecture seule)</label>
              <button type="button" onClick={() => togglePrivacy('show_email')} className="text-[9px] font-bold flex items-center gap-1 hover:text-amber-600">
                {privacy_settings.show_email ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                {privacy_settings.show_email ? 'Public' : 'Privé'}
              </button>
            </div>
            <input type="email" readOnly className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm outline-none cursor-not-allowed" value={email} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Bio / Présentation</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-amber-400 outline-none resize-none"
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>

        {/* Section: Localisation & Naissance */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-t pt-6">
            <MapPin className="w-4 h-4 text-rose-500" />
            Coordonnées
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Date de naissance</label>
                <button type="button" onClick={() => togglePrivacy('show_birth_date')} className="text-[9px] font-bold flex items-center gap-1 hover:text-amber-600">
                  {privacy_settings.show_birth_date ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="date" className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-amber-400 outline-none" value={birth_date} onChange={(e) => setBirthDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Pays</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-amber-400 outline-none" placeholder="Ex: Madagascar" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Adresse</label>
              <button type="button" onClick={() => togglePrivacy('show_address')} className="text-[9px] font-bold flex items-center gap-1 hover:text-amber-600">
                {privacy_settings.show_address ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
              </button>
            </div>
            <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-amber-400 outline-none" placeholder="Rue, Ville, Code Postal" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>

        {/* Section: Études */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-t pt-6">
            <GraduationCap className="w-4 h-4 text-blue-500" />
            Cursus Académique
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Niveau d'études</label>
              <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-amber-400 outline-none appearance-none" value={education_level} onChange={(e) => setEducationLevel(e.target.value)}>
                <option value="" disabled>Sélectionnez</option>
                {educationLevelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Établissement</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-amber-400 outline-none" value={etablissement} onChange={(e) => setEtablissement(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Filière</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-amber-400 outline-none" value={filiere} onChange={(e) => setFiliere(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Classe</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-amber-400 outline-none" value={classe} onChange={(e) => setClasse(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section: Objectifs & Intérêts */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-t pt-6">
            <Target className="w-4 h-4 text-emerald-500" />
            Personnalisation
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Objectifs d'apprentissage</label>
               <button type="button" onClick={() => togglePrivacy('show_learning_goals')} className="text-[9px] font-bold flex items-center gap-1 hover:text-amber-600">
                  {privacy_settings.show_learning_goals ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
               </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {learning_goals.map(goal => (
                <span key={goal} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  {goal}
                  <button type="button" onClick={() => handleRemoveTag('goals', goal)} className="hover:text-emerald-900">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-amber-400 outline-none" placeholder="Ajouter un objectif..." value={newGoal} onChange={(e) => setNewGoal(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('goals'))} />
              <button type="button" onClick={() => handleAddTag('goals')} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-emerald-600 transition-colors"><Plus className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Centres d'intérêt</label>
              <button type="button" onClick={() => togglePrivacy('show_interests')} className="text-[9px] font-bold flex items-center gap-1 hover:text-amber-600">
                  {privacy_settings.show_interests ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
               </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {interests.map(tag => (
                <span key={tag} className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag('interests', tag)} className="hover:text-rose-900">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-amber-400 outline-none" placeholder="Ajouter un intérêt..." value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('interests'))} />
              <button type="button" onClick={() => handleAddTag('interests')} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-rose-600 transition-colors"><Plus className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        {/* Boutons Actions Formulaire */}
        <div className="flex gap-4 pt-8 border-t">
          {onCancel && (
            <button type="button" onClick={onCancel} className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">
              Annuler
            </button>
          )}
          <button type="submit" disabled={loading} className="flex-[2] py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>

      {/* Section: Sécurité (Mot de passe) */}
      <div className="border-t pt-10">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6">
          <Lock className="w-4 h-4 text-amber-500" />
          Sécurité du compte
        </h4>
        
        <form onSubmit={handlePasswordChange} className="bg-amber-50/30 p-6 rounded-3xl border border-amber-100/50 space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nouveau mot de passe</label>
              <input type="password" required className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:border-amber-400 outline-none" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirmer le mot de passe</label>
              <input type="password" required className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:border-amber-400 outline-none" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          
          {passwordMsg.text && (
            <p className={`text-xs font-bold ${passwordMsg.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
              {passwordMsg.text}
            </p>
          )}

          <button type="submit" disabled={passwordLoading} className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-50">
            {passwordLoading ? 'Mise à jour...' : 'Modifier le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}