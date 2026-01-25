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
  roles: UserRole[];
  education_level: string | null;
  avatar_url: string | null;
  bio: string | null;
  filiere: string | null;
  etablissement: string | null;
  classe: string | null;
  credits_balance: number;
  grit_score: number;
  streak_days: number;
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
