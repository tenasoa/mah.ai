-- Enforce strict usage for `images` bucket:
-- only subject-editor uploads live under subjects/<user_id>/...

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

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] = 'subjects'
);

DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images'
  AND owner = auth.uid()
  AND (storage.foldername(name))[1] = 'subjects'
)
WITH CHECK (
  bucket_id = 'images'
  AND owner = auth.uid()
  AND (storage.foldername(name))[1] = 'subjects'
);

DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'images'
  AND owner = auth.uid()
  AND (storage.foldername(name))[1] = 'subjects'
);
