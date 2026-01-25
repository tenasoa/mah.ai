-- Migration: Refactor subjects to Pure Markdown architecture
-- Description: Removes all PDF-related infrastructure and starts fresh with structured content.

-- 1. Vider les tables liées (cascade pour nettoyer les questions/échanges liés aux anciens PDFs)
TRUNCATE public.subjects CASCADE;

-- 2. Supprimer les colonnes PDF devenues inutiles
ALTER TABLE public.subjects
DROP COLUMN IF EXISTS pdf_url,
DROP COLUMN IF EXISTS pdf_storage_path,
DROP COLUMN IF EXISTS pdf_size_bytes,
DROP COLUMN IF EXISTS page_count;

-- 3. S'assurer que content_markdown est prêt et central
-- On ne le met pas encore en NOT NULL pour permettre la transition des brouillons
ALTER TABLE public.subjects
ALTER COLUMN content_markdown SET DEFAULT '';

-- 4. Ajouter une colonne pour le contenu HTML pré-généré (performance)
ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS content_html TEXT;

-- 5. Nettoyer les fonctions de recherche pour qu'elles ne ciblent que le texte
CREATE OR REPLACE FUNCTION update_subject_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.matiere_display, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.content_markdown, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(NEW.serie, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE public.subjects IS 'Catalogue des sujets d''examens en format Markdown/HTML structuré.';
