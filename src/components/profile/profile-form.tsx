'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
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
  Shield,
  Phone
} from 'lucide-react';
import { adminUpdateUser } from "@/app/actions/admin-users";
import { updateProfile } from "@/app/actions/profile";

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

const phoneCountries = [
  { name: 'Madagascar', code: 'MG', dial: '+261', flag: '🇲🇬' },
  { name: 'France', code: 'FR', dial: '+33', flag: '🇫🇷' },
  { name: 'Belgique', code: 'BE', dial: '+32', flag: '🇧🇪' },
  { name: 'Suisse', code: 'CH', dial: '+41', flag: '🇨🇭' },
  { name: 'Maroc', code: 'MA', dial: '+212', flag: '🇲🇦' },
  { name: 'Tunisie', code: 'TN', dial: '+216', flag: '🇹🇳' },
  { name: 'Algérie', code: 'DZ', dial: '+213', flag: '🇩🇿' },
  { name: 'Côte d\'Ivoire', code: 'CI', dial: '+225', flag: '🇨🇮' },
  { name: 'Sénégal', code: 'SN', dial: '+221', flag: '🇸🇳' },
  { name: 'Cameroun', code: 'CM', dial: '+237', flag: '🇨🇲' },
  { name: 'Bénin', code: 'BJ', dial: '+229', flag: '🇧🇯' },
  { name: 'Togo', code: 'TG', dial: '+228', flag: '🇹🇬' },
  { name: 'Burkina Faso', code: 'BF', dial: '+226', flag: '🇧🇫' },
  { name: 'Mali', code: 'ML', dial: '+223', flag: '🇲🇱' },
  { name: 'Niger', code: 'NE', dial: '+227', flag: '🇳🇪' },
  { name: 'Nigeria', code: 'NG', dial: '+234', flag: '🇳🇬' },
  { name: 'Gabon', code: 'GA', dial: '+241', flag: '🇬🇦' },
  { name: 'Congo', code: 'CG', dial: '+242', flag: '🇨🇬' },
  { name: 'RDC', code: 'CD', dial: '+243', flag: '🇨🇩' },
  { name: 'Afrique du Sud', code: 'ZA', dial: '+27', flag: '🇿🇦' },
  { name: 'Canada', code: 'CA', dial: '+1', flag: '🇨🇦' },
  { name: 'États-Unis', code: 'US', dial: '+1', flag: '🇺🇸' },
  { name: 'Royaume-Uni', code: 'GB', dial: '+44', flag: '🇬🇧' },
  { name: 'Espagne', code: 'ES', dial: '+34', flag: '🇪🇸' },
  { name: 'Portugal', code: 'PT', dial: '+351', flag: '🇵🇹' },
  { name: 'Italie', code: 'IT', dial: '+39', flag: '🇮🇹' },
  { name: 'Allemagne', code: 'DE', dial: '+49', flag: '🇩🇪' },
  { name: 'Pays-Bas', code: 'NL', dial: '+31', flag: '🇳🇱' },
  { name: 'Luxembourg', code: 'LU', dial: '+352', flag: '🇱🇺' },
  { name: 'Brésil', code: 'BR', dial: '+55', flag: '🇧🇷' },
  { name: 'Mexique', code: 'MX', dial: '+52', flag: '🇲🇽' },
  { name: 'Inde', code: 'IN', dial: '+91', flag: '🇮🇳' },
  { name: 'Chine', code: 'CN', dial: '+86', flag: '🇨🇳' },
  { name: 'Japon', code: 'JP', dial: '+81', flag: '🇯🇵' },
  { name: 'Corée du Sud', code: 'KR', dial: '+82', flag: '🇰🇷' },
  { name: 'Émirats Arabes Unis', code: 'AE', dial: '+971', flag: '🇦🇪' },
  { name: 'Arabie Saoudite', code: 'SA', dial: '+966', flag: '🇸🇦' }
];

export function ProfileForm({ userId, onSuccess, onCancel }: { userId?: string, onSuccess?: () => void, onCancel?: () => void }) {
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
  const [phone_country_code, setPhoneCountryCode] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
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
      // If userId is provided, we fetch that user, otherwise fetch current auth user
      let targetId = userId;
      
      if (!targetId) {
        const { data: { user } } = await supabase.auth.getUser();
        targetId = user?.id;
        setEmail(user?.email || '');
      }

      if (targetId) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .single();

        if (data) {
          setPseudo(data.pseudo || '');
          setFullName(data.full_name || '');
          if (data.email) setEmail(data.email); 
          setBio(data.bio || '');
          setEducationLevel(data.education_level || '');
          setEtablissement(data.etablissement || '');
          setFiliere(data.filiere || '');
          setClasse(data.classe || '');
          setBirthDate(data.birth_date || '');
          setAddress(data.address || '');
          setCountry(data.country || '');
          setPhoneCountryCode(data.phone_country_code || '');
          setPhoneNumber(data.phone_number || '');
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
  }, [supabase, userId]);

  const normalizePhone = (value: string) => value.replace(/[^\d]/g, '').slice(0, 15);
  const formatPhonePreview = (value: string) => {
    const digits = normalizePhone(value);
    if (!digits) return '';
    if (phone_country_code === '+261') {
      const match = digits.match(/^(\d{2})(\d{2})(\d{3})(\d{2})/);
      if (match) return [match[1], match[2], match[3], match[4]].join(' ');
    }
    return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  };

  useEffect(() => {
    if (!phone_country_code && country) {
      const match = phoneCountries.find(
        (entry) => entry.name.toLowerCase() === country.trim().toLowerCase()
      );
      if (match) setPhoneCountryCode(match.dial);
    }
  }, [country, phone_country_code]);

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
    if (phone_number && !phone_country_code) {
      setError("Veuillez sélectionner l'indicatif du pays.");
      return;
    }
    if (phone_number && phone_number.length < 6) {
      setError("Le numéro de téléphone semble trop court.");
      return;
    }
    setLoading(true);
    setError(null);

    const updateData = {
      pseudo: pseudo || undefined,
      full_name: full_name || undefined,
      bio: bio || undefined,
      education_level: education_level || undefined,
      etablissement: etablissement || undefined,
      filiere: filiere || undefined,
      classe: classe || undefined,
      birth_date: birth_date || undefined,
      address: address || undefined,
      country: country || undefined,
      phone_country_code: phone_country_code || undefined,
      phone_number: phone_number || undefined,
      learning_goals,
      interests,
      autre: autre || undefined,
      avatar_url: avatar_url || undefined,
      privacy_settings,
    };

    try {
      let result;
      
      if (userId) {
        // Mode Admin : on utilise l'action serveur avec service_role
        result = await adminUpdateUser(userId, updateData as any);
      } else {
        // Mode Utilisateur : on utilise l'action standard (limitée à soi-même)
        result = await updateProfile(updateData);
      }

      if (!result.success) {
        setError(result.error || "Une erreur est survenue");
      } else {
        router.refresh();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
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
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        
        {/* Section: Identité visuelle */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-500" />
            Identité visuelle
          </h4>
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="relative">
              {avatar_url ? (
                <img 
                  src={avatar_url} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors shadow-md">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
              </label>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Photo de profil</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Cliquez sur l'icône pour changer.</p>
              {uploadingAvatar && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">Upload en cours...</p>}
            </div>
          </div>
        </div>

        {/* Section: Informations de base */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-t dark:border-slate-800 pt-6">
            <User className="w-4 h-4 text-indigo-500" />
            Informations de base
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Pseudo</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-400 outline-none"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Nom Complet</label>
                <button type="button" onClick={() => togglePrivacy('show_full_name')} className="text-[9px] font-bold flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  {privacy_settings.show_full_name ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                  {privacy_settings.show_full_name ? 'Public' : 'Privé'}
                </button>
              </div>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-400 outline-none"
                placeholder="Prénom et Nom"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Email (Lecture seule)</label>
              <button type="button" onClick={() => togglePrivacy('show_email')} className="text-[9px] font-bold flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400">
                {privacy_settings.show_email ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                {privacy_settings.show_email ? 'Public' : 'Privé'}
              </button>
            </div>
            <input type="email" readOnly className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-500 text-sm outline-none cursor-not-allowed" value={email} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Bio / Présentation</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-400 outline-none resize-none"
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>

        {/* Section: Localisation & Naissance */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-t dark:border-slate-800 pt-6">
            <MapPin className="w-4 h-4 text-rose-500" />
            Coordonnées
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Date de naissance</label>
                <button type="button" onClick={() => togglePrivacy('show_birth_date')} className="text-[9px] font-bold flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400">
                  {privacy_settings.show_birth_date ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input type="date" className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-400 outline-none" value={birth_date} onChange={(e) => setBirthDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Pays</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input type="text" className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-400 outline-none" placeholder="Ex: Madagascar" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Indicatif</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <select
                  className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-400 outline-none appearance-none"
                  value={phone_country_code}
                  onChange={(e) => setPhoneCountryCode(e.target.value)}
                >
                  <option value="" disabled className="dark:bg-slate-900">Sélectionner</option>
                  {phoneCountries.map((entry) => (
                    <option key={entry.code} value={entry.dial} className="dark:bg-slate-900">
                      {entry.flag} {entry.dial}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Téléphone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-400 outline-none"
                  placeholder="Numéro de téléphone"
                value={formatPhonePreview(phone_number)}
                onChange={(e) => setPhoneNumber(normalizePhone(e.target.value))}
                />
              {phone_number && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                  Format: {phone_country_code || "+XXX"} {formatPhonePreview(phone_number)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Adresse</label>
              <button type="button" onClick={() => togglePrivacy('show_address')} className="text-[9px] font-bold flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400">
                {privacy_settings.show_address ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
              </button>
            </div>
            <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-400 outline-none" placeholder="Rue, Ville, Code Postal" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>

        {/* Section: Études */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-t dark:border-slate-800 pt-6">
            <GraduationCap className="w-4 h-4 text-blue-500" />
            Cursus Académique
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Niveau d'études</label>
              <select className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-400 outline-none appearance-none" value={education_level} onChange={(e) => setEducationLevel(e.target.value)}>
                <option value="" disabled className="dark:bg-slate-900">Sélectionnez</option>
                {educationLevelOptions.map(opt => <option key={opt} value={opt} className="dark:bg-slate-900">{opt}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Établissement</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-400 outline-none" value={etablissement} onChange={(e) => setEtablissement(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Filière</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-400 outline-none" value={filiere} onChange={(e) => setFiliere(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Classe</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-400 outline-none" value={classe} onChange={(e) => setClasse(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section: Objectifs & Intérêts */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-t dark:border-slate-800 pt-6">
            <Target className="w-4 h-4 text-emerald-500" />
            Personnalisation
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Objectifs d'apprentissage</label>
               <button type="button" onClick={() => togglePrivacy('show_learning_goals')} className="text-[9px] font-bold flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  {privacy_settings.show_learning_goals ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
               </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {learning_goals.map(goal => (
                <span key={goal} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  {goal}
                  <button type="button" onClick={() => handleRemoveTag('goals', goal)} className="hover:text-emerald-900 dark:hover:text-emerald-200">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:border-amber-400 outline-none text-slate-900 dark:text-white" placeholder="Ajouter un objectif..." value={newGoal} onChange={(e) => setNewGoal(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('goals'))} />
              <button type="button" onClick={() => handleAddTag('goals')} className="p-2 bg-slate-900 dark:bg-amber-600 text-white rounded-xl hover:bg-emerald-600 transition-colors"><Plus className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Centres d'intérêt</label>
              <button type="button" onClick={() => togglePrivacy('show_interests')} className="text-[9px] font-bold flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400">
                  {privacy_settings.show_interests ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
               </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {interests.map(tag => (
                <span key={tag} className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag('interests', tag)} className="hover:text-rose-900 dark:hover:text-rose-200">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:border-amber-400 outline-none text-slate-900 dark:text-white" placeholder="Ajouter un intérêt..." value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('interests'))} />
              <button type="button" onClick={() => handleAddTag('interests')} className="p-2 bg-slate-900 dark:bg-rose-600 text-white rounded-xl hover:bg-rose-600 transition-colors"><Plus className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        {/* Boutons Actions Formulaire */}
        <div className="flex gap-4 pt-8 border-t dark:border-slate-800">
          {onCancel && (
            <button type="button" onClick={onCancel} className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Annuler
            </button>
          )}
          <button type="submit" disabled={loading} className="flex-[2] py-4 rounded-2xl bg-slate-900 dark:bg-amber-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 dark:shadow-none hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>

      {/* Section: Sécurité (Mot de passe) - Hidden if userId is provided (admin editing another user) */}
      {!userId && (
        <div className="border-t dark:border-slate-800 pt-10">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-amber-500" />
            Sécurité du compte
          </h4>
          
          <form onSubmit={handlePasswordChange} className="bg-amber-50/30 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100/50 dark:border-amber-900/20 space-y-4 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Nouveau mot de passe</label>
                <input type="password" required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:border-amber-400 outline-none text-slate-900 dark:text-white" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Confirmer le mot de passe</label>
                <input type="password" required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:border-amber-400 outline-none text-slate-900 dark:text-white" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            
            {passwordMsg.text && (
              <p className={`text-xs font-bold ${passwordMsg.type === 'error' ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {passwordMsg.text}
              </p>
            )}

            <button type="submit" disabled={passwordLoading} className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-50">
              {passwordLoading ? 'Mise à jour...' : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>
      )}
    </div>

  );
}
