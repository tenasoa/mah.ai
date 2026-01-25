-- Migration: Add markdown content to subjects
-- Description: Allows subjects to be edited and displayed as Markdown/HTML 
--              instead of relying solely on PDFs.

ALTER TABLE public.subjects
ADD COLUMN content_markdown TEXT;

-- Update search vector function to include markdown content
CREATE OR REPLACE FUNCTION update_subject_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.matiere_display, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.content_markdown, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(NEW.serie, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(NEW.preview_text, '')), 'C') ||
    setweight(to_tsvector('french', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN public.subjects.content_markdown IS 'Contenu complet du sujet au format Markdown pour affichage HTML direct.';
