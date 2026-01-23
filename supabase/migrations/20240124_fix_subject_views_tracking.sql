-- =====================================================
-- Migration: Fix subject views tracking
-- Description: Track views per user to avoid duplicate counting
--              and ensure each user only counts once per subject
-- =====================================================

-- Create table to track subject views per user
CREATE TABLE IF NOT EXISTS public.subject_views (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT subject_views_pkey PRIMARY KEY (id),
  -- Ensure one view per user per subject (unique constraint)
  CONSTRAINT subject_views_unique UNIQUE (user_id, subject_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS subject_views_user_idx ON public.subject_views(user_id);
CREATE INDEX IF NOT EXISTS subject_views_subject_idx ON public.subject_views(subject_id);
CREATE INDEX IF NOT EXISTS subject_views_viewed_at_idx ON public.subject_views(viewed_at DESC);

-- Enable RLS
ALTER TABLE public.subject_views ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own view records
CREATE POLICY "Users can view own subject views"
  ON public.subject_views FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert view records (for authenticated users)
-- Note: This policy allows the SECURITY DEFINER function to insert records
CREATE POLICY "System can insert subject views"
  ON public.subject_views FOR INSERT
  WITH CHECK (true); -- Allow all inserts (function handles security)

-- Policy: Admins can view all view records
CREATE POLICY "Admins can view all subject views"
  ON public.subject_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Replace the increment function to track per-user views
CREATE OR REPLACE FUNCTION increment_subject_view(
  p_subject_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_view_exists BOOLEAN;
  v_rows_inserted INTEGER;
BEGIN
  -- If user_id is provided, check if they've already viewed this subject
  IF p_user_id IS NOT NULL THEN
    -- Check if view already exists
    SELECT EXISTS(
      SELECT 1 FROM public.subject_views
      WHERE user_id = p_user_id AND subject_id = p_subject_id
    ) INTO v_view_exists;
    
    -- If user has already viewed, don't increment
    IF v_view_exists THEN
      RETURN;
    END IF;
    
    -- Try to insert the view record
    -- ON CONFLICT handles race conditions (if two requests happen simultaneously)
    -- Note: RLS is bypassed for SECURITY DEFINER functions, but we still need the policy
    INSERT INTO public.subject_views (user_id, subject_id)
    VALUES (p_user_id, p_subject_id)
    ON CONFLICT (user_id, subject_id) DO NOTHING;
    
    -- Check if insert actually happened (GET DIAGNOSTICS)
    GET DIAGNOSTICS v_rows_inserted = ROW_COUNT;
    
    -- If no row was inserted (conflict occurred), don't increment
    IF v_rows_inserted = 0 THEN
      RETURN;
    END IF;
  END IF;
  
  -- Increment the view count only if we successfully inserted a new view
  -- (or if user_id is NULL, for anonymous users - we still count but don't track)
  UPDATE public.subjects
  SET view_count = view_count + 1
  WHERE id = p_subject_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Add comment
COMMENT ON TABLE public.subject_views IS 'Tracks individual views of subjects by users to prevent duplicate counting';
COMMENT ON FUNCTION increment_subject_view IS 'Increments view count only if user has not already viewed the subject';
