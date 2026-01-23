-- =====================================================
-- Migration: Add RLS policy for users to view/update their own profile
-- Description: Allows users to view and update their own profile
-- =====================================================

-- Policy: Users can view their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (for initial profile creation)
CREATE POLICY IF NOT EXISTS "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
