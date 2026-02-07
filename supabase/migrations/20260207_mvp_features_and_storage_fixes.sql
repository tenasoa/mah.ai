-- MVP fixes and extensions:
-- 1) storage bucket `images` public + policies
-- 2) leaderboard by subject (matiere)
-- 3) additional contribution badges

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'images') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('images', 'images', true);
  ELSE
    UPDATE storage.buckets
    SET public = true
    WHERE id = 'images';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read access for images'
  ) THEN
    CREATE POLICY "Public read access for images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated users can upload images'
  ) THEN
    CREATE POLICY "Authenticated users can upload images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can update own images'
  ) THEN
    CREATE POLICY "Users can update own images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'images' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'images' AND owner = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can delete own images'
  ) THEN
    CREATE POLICY "Users can delete own images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'images' AND owner = auth.uid());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.get_matiere_leaderboard(
  p_matiere TEXT,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  pseudo TEXT,
  grit_score INTEGER,
  streak_days INTEGER,
  classe TEXT,
  filiere TEXT,
  matiere_points BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH target_subjects AS (
    SELECT s.id
    FROM public.subjects s
    WHERE s.status = 'published'
      AND (
        s.matiere = p_matiere
        OR s.matiere_display = p_matiere
      )
  ),
  matiere_scores AS (
    SELECT
      gl.user_id,
      COALESCE(SUM(gl.amount), 0)::BIGINT AS points
    FROM public.grit_logs gl
    INNER JOIN target_subjects ts
      ON ts.id = gl.reference_id
    GROUP BY gl.user_id
  )
  SELECT
    p.id,
    COALESCE(p.pseudo, 'Apprenant Mystère')::TEXT,
    COALESCE(p.grit_score, 0)::INTEGER,
    COALESCE(p.streak_days, 0)::INTEGER,
    COALESCE(p.classe, '')::TEXT,
    COALESCE(p.filiere, '')::TEXT,
    ms.points AS matiere_points
  FROM matiere_scores ms
  INNER JOIN public.profiles p
    ON p.id = ms.user_id
  ORDER BY ms.points DESC, p.grit_score DESC
  LIMIT GREATEST(COALESCE(p_limit, 50), 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_matiere_leaderboard(TEXT, INTEGER) TO authenticated;

INSERT INTO public.badges (id, name, description, icon, category, points_required)
VALUES
  (
    'quality_guardian',
    'Gardien de la Qualité',
    'Valider au moins un sujet en statut publié.',
    '🛡️',
    'social',
    120
  ),
  (
    'grand_professeur',
    'Grand Professeur',
    'Contribuer à 10 sujets ou plus.',
    '🎓',
    'knowledge',
    250
  )
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  points_required = EXCLUDED.points_required;
