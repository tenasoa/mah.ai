// User and Profile types

export type UserRole = 
  | 'superadmin' 
  | 'admin' 
  | 'contributor' 
  | 'validator' 
  | 'student' 
  | 'parent' 
  | 'tutor' 
  | 'teacher';

export interface UserProfile {
  id: string;
  pseudo: string | null;
  full_name: string | null;
  email?: string; // Derived from auth.users or profiles
  roles: UserRole[];
  education_level: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  filiere: string | null;
  etablissement: string | null;
  classe: string | null;
  birth_date: string | null;
  address: string | null;
  country: string | null;
  learning_goals: string[];
  interests: string[];
  credits_balance: number;
  grit_score: number;
  streak_days: number;
  subscription_status: 'free' | 'premium' | 'vip';
  privacy_settings: {
    show_full_name: boolean;
    show_email: boolean;
    show_birth_date: boolean;
    show_address: boolean;
    show_learning_goals: boolean;
    show_interests: boolean;
  };
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrateur',
  contributor: 'Contributeur',
  validator: 'Validateur',
  student: 'Étudiant',
  parent: 'Parent',
  tutor: 'Tuteur IA',
  teacher: 'Professeur'
};
