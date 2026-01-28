-- Migration: Sprint 6 - Community Features
-- Description: Comments system for subjects.

-- 1. Subject Comments Table
CREATE TABLE IF NOT EXISTS public.subject_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_comments_subject ON public.subject_comments(subject_id);

-- RLS
ALTER TABLE public.subject_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.subject_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own comments" ON public.subject_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.subject_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.subject_comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments" ON public.subject_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (roles @> ARRAY['admin']::text[] OR roles @> ARRAY['superadmin']::text[])
    )
  );
