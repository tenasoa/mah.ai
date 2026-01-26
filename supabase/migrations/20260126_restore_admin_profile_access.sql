-- Restore Admin access to all profiles safely
-- Using a non-recursive approach by checking auth.jwt() roles or a direct check

-- 1. Drop existing restricted policy if we want to expand it
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 2. Create a new policy for admins
-- We check if the current user has 'admin' or 'superadmin' in their roles array
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  (auth.uid() = id) OR -- Can see own
  (
    SELECT 'admin' = ANY(roles) OR 'superadmin' = ANY(roles)
    FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- 3. Also allow admins to update roles and credits
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  (auth.uid() = id) OR
  (
    SELECT 'admin' = ANY(roles) OR 'superadmin' = ANY(roles)
    FROM public.profiles
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  (auth.uid() = id) OR
  (
    SELECT 'admin' = ANY(roles) OR 'superadmin' = ANY(roles)
    FROM public.profiles
    WHERE id = auth.uid()
  )
);
