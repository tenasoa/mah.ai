-- Allow authenticated users (including contributors) to read subjects
-- they have unlocked via credits, without granting edit permissions.

DROP POLICY IF EXISTS "Users can view unlocked subjects" ON public.subjects;

CREATE POLICY "Users can view unlocked subjects"
ON public.subjects
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_subject_access usa
    WHERE usa.subject_id = subjects.id
      AND usa.user_id = auth.uid()
      AND (usa.expires_at IS NULL OR usa.expires_at > NOW())
  )
);
