-- Migration: Auto-create profiles on signup
-- Description: Adds a trigger to automatically create a profile in public.profiles when a user is created in auth.users.

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, pseudo, full_name, role, roles, credits_balance, grit_score, etablissement, classe, filiere)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'pseudo', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    'student', -- Default legacy role
    '{student}', -- Default new roles array
    0, -- Default credits
    0, -- Default grit score
    COALESCE(NEW.raw_user_meta_data->>'etablissement', 'Non renseigné'),
    COALESCE(NEW.raw_user_meta_data->>'classe', 'Non renseignée'),
    'Général' -- Default filiere to avoid NOT NULL constraint
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
-- We drop it first to be safe in case it exists but is broken
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
