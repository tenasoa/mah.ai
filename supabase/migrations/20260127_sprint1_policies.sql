-- Migration: Sprint 1 - Subject Policies for Contributors
-- Description: Allow contributors to manage their own subjects.

-- 1. Policy for contributors to insert their own subjects
CREATE POLICY "Contributors can insert own subjects"
  ON public.subjects FOR INSERT
  WITH CHECK (
    has_role('contributor') AND 
    auth.uid() = uploaded_by AND
    status = 'draft'
  );

-- 2. Policy for contributors to update their own subjects (if not published or rejected)
CREATE POLICY "Contributors can update own subjects"
  ON public.subjects FOR UPDATE
  USING (
    has_role('contributor') AND 
    auth.uid() = uploaded_by AND
    status IN ('draft', 'revision')
  )
  WITH CHECK (
    status IN ('draft', 'pending') -- Can move to pending for validation
  );

-- 3. Policy for contributors to view their own subjects (even if not published)
CREATE POLICY "Contributors can view own subjects"
  ON public.subjects FOR SELECT
  USING (
    has_role('contributor') AND 
    auth.uid() = uploaded_by
  );
