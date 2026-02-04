-- Migration: Offre de 100 crédits gratuits à l'inscription
-- Description: Modifie le trigger handle_new_user pour offrir 100 crédits gratuits aux nouveaux utilisateurs

-- Mettre à jour la fonction pour offrir 100 crédits au lieu de 0
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
    100, -- 🎁 100 crédits gratuits offerts à l'inscription!
    0, -- Default grit score
    COALESCE(NEW.raw_user_meta_data->>'etablissement', 'Non renseigné'),
    COALESCE(NEW.raw_user_meta_data->>'classe', 'Non renseignée'),
    'Général' -- Default filiere to avoid NOT NULL constraint
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
