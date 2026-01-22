-- =====================================================
-- Migration: Create subjects table for exam catalog
-- Description: Stores exam subjects (sujets) with metadata
--              for filtering, search, and access control
-- =====================================================

-- Create enum for exam types
CREATE TYPE exam_type AS ENUM (
  'cepe',
  'bepc',
  'baccalaureat',
  'licence',
  'master',
  'doctorat',
  'dts',
  'bts',
  'concours',
  'other'
);

-- Create enum for subject status
CREATE TYPE subject_status AS ENUM (
  'draft',
  'published',
  'archived'
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid(),

  -- Core metadata
  title TEXT NOT NULL,
  description TEXT,
  exam_type exam_type NOT NULL DEFAULT 'baccalaureat',
  year INTEGER NOT NULL,
  session TEXT DEFAULT 'normal', -- 'normal', 'rattrapage', 'remplacement'

  -- Classification
  matiere TEXT NOT NULL, -- e.g., 'mathematiques', 'physique', 'francais'
  matiere_display TEXT NOT NULL, -- e.g., 'Mathématiques', 'Physique-Chimie'
  serie TEXT, -- e.g., 'A', 'C', 'D', 'S', 'L', 'OSE', 'G2'
  niveau TEXT, -- e.g., 'Terminale', '3ème', 'L1', 'M1'

  -- PDF Storage
  pdf_url TEXT NOT NULL,
  pdf_storage_path TEXT, -- Supabase Storage path
  pdf_size_bytes INTEGER,
  page_count INTEGER,

  -- Thumbnail/Preview
  thumbnail_url TEXT,
  preview_text TEXT, -- First questions for SEO teaser

  -- Access control
  is_free BOOLEAN NOT NULL DEFAULT false,
  credit_cost INTEGER NOT NULL DEFAULT 1, -- Credits needed to unlock

  -- Search optimization
  search_vector TSVECTOR,
  tags TEXT[] DEFAULT '{}',

  -- Statistics
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,

  -- Status and audit
  status subject_status NOT NULL DEFAULT 'draft',
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  CONSTRAINT subjects_pkey PRIMARY KEY (id),
  CONSTRAINT subjects_year_check CHECK (year >= 1960 AND year <= 2100),
  CONSTRAINT subjects_credit_cost_check CHECK (credit_cost >= 0)
);

-- Create user_subject_access table (tracks which subjects a user has access to)
CREATE TABLE public.user_subject_access (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,

  -- Access details
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL = permanent access
  access_type TEXT NOT NULL DEFAULT 'purchase', -- 'purchase', 'subscription', 'free', 'admin'

  -- Tracking
  payment_id UUID REFERENCES public.payments(id),

  CONSTRAINT user_subject_access_pkey PRIMARY KEY (id),
  CONSTRAINT user_subject_access_unique UNIQUE (user_id, subject_id)
);

-- =====================================================
-- Indexes for performance
-- =====================================================

-- Subjects indexes
CREATE INDEX subjects_exam_type_idx ON public.subjects(exam_type);
CREATE INDEX subjects_year_idx ON public.subjects(year DESC);
CREATE INDEX subjects_matiere_idx ON public.subjects(matiere);
CREATE INDEX subjects_serie_idx ON public.subjects(serie);
CREATE INDEX subjects_status_idx ON public.subjects(status);
CREATE INDEX subjects_is_free_idx ON public.subjects(is_free);
CREATE INDEX subjects_created_at_idx ON public.subjects(created_at DESC);
CREATE INDEX subjects_view_count_idx ON public.subjects(view_count DESC);

-- Full-text search index
CREATE INDEX subjects_search_idx ON public.subjects USING GIN(search_vector);

-- Tags index
CREATE INDEX subjects_tags_idx ON public.subjects USING GIN(tags);

-- Composite index for common queries
CREATE INDEX subjects_filter_idx ON public.subjects(exam_type, matiere, serie, year DESC)
  WHERE status = 'published';

-- User access indexes
CREATE INDEX user_subject_access_user_idx ON public.user_subject_access(user_id);
CREATE INDEX user_subject_access_subject_idx ON public.user_subject_access(subject_id);
CREATE INDEX user_subject_access_expires_idx ON public.user_subject_access(expires_at)
  WHERE expires_at IS NOT NULL;

-- =====================================================
-- Functions
-- =====================================================

-- Function to update search_vector
CREATE OR REPLACE FUNCTION update_subject_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.matiere_display, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(NEW.serie, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(NEW.preview_text, '')), 'C') ||
    setweight(to_tsvector('french', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check user access to a subject
CREATE OR REPLACE FUNCTION check_subject_access(p_user_id UUID, p_subject_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_free BOOLEAN;
  v_has_access BOOLEAN;
BEGIN
  -- Check if subject is free
  SELECT is_free INTO v_is_free FROM public.subjects WHERE id = p_subject_id;
  IF v_is_free THEN
    RETURN TRUE;
  END IF;

  -- Check if user has valid access
  SELECT EXISTS(
    SELECT 1 FROM public.user_subject_access
    WHERE user_id = p_user_id
      AND subject_id = p_subject_id
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_has_access;

  RETURN v_has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_subject_view(p_subject_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.subjects
  SET view_count = view_count + 1
  WHERE id = p_subject_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Triggers
-- =====================================================

-- Trigger to update search vector on insert/update
CREATE TRIGGER subjects_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, matiere_display, description, serie, preview_text, tags
  ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_subject_search_vector();

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subject_access ENABLE ROW LEVEL SECURITY;

-- Subjects policies
-- Everyone can view published subjects (for catalog browsing)
CREATE POLICY "Anyone can view published subjects"
  ON public.subjects FOR SELECT
  USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins can manage all subjects"
  ON public.subjects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User access policies
-- Users can view their own access records
CREATE POLICY "Users can view own subject access"
  ON public.user_subject_access FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage all access records
CREATE POLICY "Admins can manage all subject access"
  ON public.user_subject_access FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- Seed data for testing (optional - can be commented out)
-- =====================================================

-- Insert sample subjects
INSERT INTO public.subjects (
  title, description, exam_type, year, session, matiere, matiere_display,
  serie, niveau, pdf_url, is_free, credit_cost, status, tags
) VALUES
  (
    'Mathématiques - Baccalauréat 2024 Série D',
    'Sujet de mathématiques du baccalauréat malgache 2024, série D. Comprend analyse, géométrie et probabilités.',
    'baccalaureat', 2024, 'normal', 'mathematiques', 'Mathématiques',
    'D', 'Terminale', '/subjects/bac-2024-math-d.pdf', false, 1, 'published',
    ARRAY['analyse', 'géométrie', 'probabilités', 'suites', 'fonctions']
  ),
  (
    'Physique-Chimie - Baccalauréat 2024 Série D',
    'Sujet de physique-chimie du baccalauréat malgache 2024, série D.',
    'baccalaureat', 2024, 'normal', 'physique-chimie', 'Physique-Chimie',
    'D', 'Terminale', '/subjects/bac-2024-pc-d.pdf', false, 1, 'published',
    ARRAY['mécanique', 'électricité', 'chimie organique', 'thermodynamique']
  ),
  (
    'Mathématiques - Baccalauréat 2024 Série C',
    'Sujet de mathématiques du baccalauréat malgache 2024, série C.',
    'baccalaureat', 2024, 'normal', 'mathematiques', 'Mathématiques',
    'C', 'Terminale', '/subjects/bac-2024-math-c.pdf', false, 1, 'published',
    ARRAY['analyse', 'algèbre', 'géométrie dans l''espace']
  ),
  (
    'Français - Baccalauréat 2024 Toutes séries',
    'Sujet de français du baccalauréat malgache 2024.',
    'baccalaureat', 2024, 'normal', 'francais', 'Français',
    NULL, 'Terminale', '/subjects/bac-2024-francais.pdf', true, 0, 'published',
    ARRAY['dissertation', 'commentaire', 'résumé']
  ),
  (
    'Mathématiques - BEPC 2024',
    'Sujet de mathématiques du BEPC malgache 2024.',
    'bepc', 2024, 'normal', 'mathematiques', 'Mathématiques',
    NULL, '3ème', '/subjects/bepc-2024-math.pdf', false, 1, 'published',
    ARRAY['algèbre', 'géométrie', 'statistiques']
  ),
  (
    'Sciences Physiques - BEPC 2024',
    'Sujet de sciences physiques du BEPC malgache 2024.',
    'bepc', 2024, 'normal', 'physique-chimie', 'Sciences Physiques',
    NULL, '3ème', '/subjects/bepc-2024-sp.pdf', false, 1, 'published',
    ARRAY['mécanique', 'optique', 'électricité']
  ),
  (
    'Philosophie - Baccalauréat 2023 Série A',
    'Sujet de philosophie du baccalauréat malgache 2023, série A.',
    'baccalaureat', 2023, 'normal', 'philosophie', 'Philosophie',
    'A', 'Terminale', '/subjects/bac-2023-philo-a.pdf', false, 1, 'published',
    ARRAY['dissertation', 'explication de texte', 'conscience', 'liberté']
  ),
  (
    'Histoire-Géographie - Baccalauréat 2023',
    'Sujet d''histoire-géographie du baccalauréat malgache 2023.',
    'baccalaureat', 2023, 'normal', 'histoire-geo', 'Histoire-Géographie',
    NULL, 'Terminale', '/subjects/bac-2023-hg.pdf', true, 0, 'published',
    ARRAY['guerre froide', 'mondialisation', 'développement']
  );

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE public.subjects IS 'Catalogue des sujets d''examens (CEPE, BEPC, Bac, Licence, etc.)';
COMMENT ON TABLE public.user_subject_access IS 'Accès utilisateur aux sujets (achats, abonnements)';
COMMENT ON COLUMN public.subjects.search_vector IS 'Vecteur de recherche full-text pour PostgreSQL FTS';
COMMENT ON COLUMN public.subjects.preview_text IS 'Texte des premières questions pour SEO et teaser';
COMMENT ON COLUMN public.subjects.credit_cost IS 'Nombre de crédits nécessaires pour débloquer le sujet';
COMMENT ON FUNCTION check_subject_access IS 'Vérifie si un utilisateur a accès à un sujet';
