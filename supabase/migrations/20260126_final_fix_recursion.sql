-- Final Fix for RLS Infinite Recursion on profiles table
-- The problem: A policy on 'profiles' queries 'profiles', which triggers the policy again.
-- The solution: Use SECURITY DEFINER functions to check roles. These functions run with 
-- the privileges of the creator (postgres) and bypass RLS.

BEGIN;

-- 1. Clean up old problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles access policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. Create optimized, non-recursive role check functions
-- By setting search_path and SECURITY DEFINER, we bypass RLS inside the function.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (
      'admin' = ANY(roles) OR 
      'superadmin' = ANY(roles) OR 
      'validator' = ANY(roles)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Re-create clean policies
-- Policy for SELECT: Users can see themselves OR an admin can see everyone
CREATE POLICY "profiles_select_policy"
ON public.profiles FOR SELECT
TO authenticated
USING (
  (auth.uid() = id) OR check_is_admin()
);

-- Policy for INSERT: Users can only insert their own profile
CREATE POLICY "profiles_insert_policy"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
);

-- Policy for UPDATE: Users can update themselves OR an admin can update everyone
CREATE POLICY "profiles_update_policy"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  (auth.uid() = id) OR check_is_admin()
)
WITH CHECK (
  (auth.uid() = id) OR check_is_admin()
);

COMMIT;
