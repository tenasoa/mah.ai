-- =====================================================
-- Migration: Fix RLS infinite recursion on profiles table
-- Date: 2026-01-23
-- Description: Fixes the infinite recursion issue when querying subjects
--              by disabling RLS, removing all policies, and recreating
--              them with simpler rules that don't cause recursion
-- =====================================================

BEGIN;

-- Step 1: Disable RLS temporarily to clear problematic policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies that may cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Step 3: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Recreate policies with simple, non-recursive rules
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE 
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Note: Removed the admin policy that caused infinite recursion
-- Admin access should be handled via service_role or JWT tokens instead

COMMIT;
