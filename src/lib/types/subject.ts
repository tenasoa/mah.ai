// Types for the subjects catalog feature

// =====================================================
// Enums (matching database enums)
// =====================================================

export type ExamType =
  | 'cepe'
  | 'bepc'
  | 'baccalaureat'
  | 'licence'
  | 'master'
  | 'doctorat'
  | 'dts'
  | 'bts'
  | 'concours'
  | 'other';

export type SubjectStatus = 'draft' | 'published' | 'archived';

export type AccessType = 'purchase' | 'subscription' | 'free' | 'admin';

// =====================================================
// Main Subject Type
// =====================================================

export interface Subject {
  id: string;

  // Core metadata
  title: string;
  description: string | null;
  exam_type: ExamType;
  year: number;
  session: string;

  // Classification
  matiere: string;
  matiere_display: string;
  serie: string | null;
  niveau: string | null;

  // PDF Storage
  pdf_url: string;
  pdf_storage_path: string | null;
  pdf_size_bytes: number | null;
  page_count: number | null;

  // Thumbnail/Preview
  thumbnail_url: string | null;
  preview_text: string | null;

  // Access control
  is_free: boolean;
  credit_cost: number;

  // Search optimization
  tags: string[];

  // Statistics
  view_count: number;
  download_count: number;

  // Status and audit
  status: SubjectStatus;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// =====================================================
// User Subject Access
// =====================================================

export interface UserSubjectAccess {
  id: string;
  user_id: string;
  subject_id: string;
  granted_at: string;
  expires_at: string | null;
  access_type: AccessType;
  payment_id: string | null;
}

// =====================================================
// API/Display Types
// =====================================================

// Subject with computed access status for current user
export interface SubjectWithAccess extends Subject {
  has_access: boolean;
  access_expires_at: string | null;
}

// Simplified subject for catalog cards
export interface SubjectCard {
  id: string;
  title: string;
  exam_type: ExamType;
  year: number;
  matiere: string;
  matiere_display: string;
  serie: string | null;
  niveau: string | null;
  thumbnail_url: string | null;
  is_free: boolean;
  credit_cost: number;
  view_count: number;
  has_access?: boolean;
  pdf_url?: string;
  pdf_storage_path?: string | null;
}

// =====================================================
// Filter Types
// =====================================================

export interface SubjectFilters {
  exam_type?: ExamType | ExamType[];
  year?: number | number[];
  matiere?: string | string[];
  serie?: string | string[];
  niveau?: string | string[];
  is_free?: boolean;
  search?: string;
}

export interface SubjectSortOptions {
  field: 'year' | 'created_at' | 'view_count' | 'title';
  direction: 'asc' | 'desc';
}

export interface SubjectQueryParams {
  filters?: SubjectFilters;
  sort?: SubjectSortOptions;
  page?: number;
  limit?: number;
}

// =====================================================
// Response Types
// =====================================================

export interface SubjectsResponse {
  subjects: SubjectCard[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface SubjectDetailResponse {
  subject: SubjectWithAccess;
  related_subjects: SubjectCard[];
}

// =====================================================
// Metadata Types (for filters UI)
// =====================================================

export interface SubjectMetadata {
  exam_types: { value: ExamType; label: string; count: number }[];
  years: { value: number; count: number }[];
  matieres: { value: string; label: string; count: number }[];
  series: { value: string; count: number }[];
  niveaux: { value: string; count: number }[];
}

// =====================================================
// Display Helpers
// =====================================================

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  cepe: 'CEPE',
  bepc: 'BEPC',
  baccalaureat: 'Baccalauréat',
  licence: 'Licence',
  master: 'Master',
  doctorat: 'Doctorat',
  dts: 'DTS',
  bts: 'BTS',
  concours: 'Concours',
  other: 'Autre',
};

export const EXAM_TYPE_COLORS: Record<ExamType, { bg: string; text: string; border: string }> = {
  cepe: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  bepc: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  baccalaureat: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  licence: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  master: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  doctorat: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
  dts: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  bts: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  concours: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  other: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

export const MATIERE_ICONS: Record<string, string> = {
  mathematiques: '📐',
  'physique-chimie': '⚗️',
  francais: '📖',
  anglais: '🇬🇧',
  philosophie: '🤔',
  'histoire-geo': '🌍',
  svt: '🧬',
  economie: '📊',
  informatique: '💻',
  malagasy: '🇲🇬',
};

// Helper function to get matiere display with icon
export function getMatiereWithIcon(matiere: string, matiereDisplay: string): string {
  const icon = MATIERE_ICONS[matiere] || '📚';
  return `${icon} ${matiereDisplay}`;
}

// Helper function to format year display
export function formatYearDisplay(year: number, examType: ExamType): string {
  const label = EXAM_TYPE_LABELS[examType];
  return `${label} ${year}`;
}

// Helper function to check if access is expired
export function isAccessExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}
