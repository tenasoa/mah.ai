-- Migration: Advanced User Roles and Subject Workflow (Fixed Version)
-- Description: Supports multiple roles, complex exam types, and validation workflow.

-- 1. Mise à jour de la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{"student"}',
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Migration des rôles existants
DO $$ 
BEGIN
    UPDATE public.profiles 
    SET roles = ARRAY[role]::text[] 
    WHERE roles IS NULL OR roles = '{}';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Migration des rôles déjà effectuée ou impossible.';
END $$;

-- 2. Mise à jour de la table subjects
-- On commence par supprimer TOUT ce qui dépend de la colonne status
DROP POLICY IF EXISTS "Anyone can view published subjects" ON public.subjects;
DROP POLICY IF EXISTS "Admins can manage all subjects" ON public.subjects;
DROP POLICY IF EXISTS "Admins and Validators can manage subjects" ON public.subjects;
DROP INDEX IF EXISTS subjects_filter_idx;
ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_status_check;

-- Ajout des nouvelles colonnes
ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS revision_comment TEXT,
ADD COLUMN IF NOT EXISTS exam_metadata JSONB DEFAULT '{}'::jsonb;

-- Changement de type avec conversion explicite
-- On utilise status::text pour casser le lien avec l'ENUM
ALTER TABLE public.subjects 
ALTER COLUMN status TYPE TEXT USING status::text;

-- Ajout de la contrainte de statut
ALTER TABLE public.subjects
ADD CONSTRAINT subjects_status_check 
CHECK (status IN ('draft', 'pending', 'published', 'revision', 'rejected'));

-- 3. Recréation des politiques et index avec le type TEXT
CREATE POLICY "Anyone can view published subjects"
  ON public.subjects FOR SELECT
  USING (status = 'published');

-- Recréer l'index filtré (important pour la performance)
CREATE INDEX IF NOT EXISTS subjects_filter_idx ON public.subjects(exam_type, matiere, serie, year DESC)
  WHERE status = 'published';

-- 4. Fonctions helper et politiques de rôles
CREATE OR REPLACE FUNCTION has_role(p_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT p_role = ANY(roles)
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins and Validators can manage subjects"
  ON public.subjects FOR ALL
  USING (has_role('admin') OR has_role('superadmin') OR has_role('validator'));

-- 5. Paramètres du site
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

INSERT INTO public.site_settings (key, value) 
VALUES ('credit_prices', '{"10": 1000, "50": 4500, "100": 8000}'),
       ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

COMMENT ON COLUMN public.profiles.roles IS 'Liste des casquettes de l''utilisateur (student, teacher, admin, validator, etc.)';
COMMENT ON COLUMN public.subjects.exam_metadata IS 'Détails spécifiques (ex: {"level": "L1"}, {"concours_type": "POLICE"})';
