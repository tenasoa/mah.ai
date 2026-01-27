-- Migration: Admin User Management Features
-- Description: Adds is_blocked column and email synchronization for easier user management.

-- 1. Add is_blocked column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- 2. Add email column to profiles (if missing) and sync it
-- Note: We already saw it was missing in previous step
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Initial sync of emails from auth.users to public.profiles
UPDATE public.profiles
SET email = auth.users.email
FROM auth.users
WHERE public.profiles.id = auth.users.id;

-- 4. Trigger to keep email in sync when it changes in auth.users
CREATE OR REPLACE FUNCTION public.handle_update_user_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_user_email();

-- 5. Policy to block access if is_blocked is true (Optional but recommended)
-- This can be handled in middleware or RLS on other tables
-- For now, we just add the column for admin UI.
