-- =====================================================
-- Migration: Create subject_questions table
-- Description: Store click-to-ask questions per subject
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subject_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  selection_rect JSONB,
  zoom INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT subject_questions_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS subject_questions_user_idx ON public.subject_questions(user_id);
CREATE INDEX IF NOT EXISTS subject_questions_subject_idx ON public.subject_questions(subject_id);
CREATE INDEX IF NOT EXISTS subject_questions_created_at_idx ON public.subject_questions(created_at DESC);

ALTER TABLE public.subject_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subject questions"
  ON public.subject_questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subject questions"
  ON public.subject_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subject questions"
  ON public.subject_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

COMMENT ON TABLE public.subject_questions IS 'Questions posees par zone dans le lecteur PDF';
