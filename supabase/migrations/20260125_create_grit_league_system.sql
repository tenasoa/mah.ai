-- Migration: Grit Score and Gamification System
-- Description: Adds tracking for user effort, streaks, and merit points.

-- 1. Mettre à jour la table profiles avec les colonnes de gamification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS grit_score INTEGER DEFAULT 0 CHECK (grit_score >= 0),
ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Table des logs Grit pour l'historique et les calculs de progression
CREATE TYPE grit_action_type AS ENUM ('active_reading', 'ai_interaction', 'daily_login', 'quiz_completion', 'contribution');

CREATE TABLE IF NOT EXISTS public.grit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- points gagnés
  action_type grit_action_type NOT NULL,
  reference_id UUID, -- id du sujet ou de l'échange lié
  metadata JSONB, -- infos supp (ex: temps de lecture)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les perfs
CREATE INDEX IF NOT EXISTS idx_grit_logs_user ON public.grit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_grit_logs_created_at ON public.grit_logs(created_at DESC);

-- RLS
ALTER TABLE public.grit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own grit logs" ON public.grit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Fonction pour ajouter des points Grit de manière sécurisée
CREATE OR REPLACE FUNCTION add_grit_points(
  p_amount INTEGER,
  p_action grit_action_type,
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_new_score INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Non authentifié');
  END IF;

  -- 1. Insérer le log
  INSERT INTO public.grit_logs (user_id, amount, action_type, reference_id, metadata)
  VALUES (v_user_id, p_amount, p_action, p_reference_id, p_metadata);

  -- 2. Mettre à jour le profil
  UPDATE public.profiles 
  SET 
    grit_score = grit_score + p_amount,
    last_activity_at = NOW()
  WHERE id = v_user_id
  RETURNING grit_score INTO v_new_score;

  -- 3. Gestion simplifiée du streak (Série)
  -- Si la dernière activité était hier, on incrémente. Si c'était aujourd'hui, on ne fait rien. Sinon on reset à 1.
  -- (Logique plus précise à implémenter dans une action serveur pour plus de flexibilité)

  RETURN json_build_object('success', true, 'new_score', v_new_score);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON COLUMN public.profiles.grit_score IS 'Score total de persévérance et d''effort de l''élève.';
COMMENT ON COLUMN public.profiles.streak_days IS 'Nombre de jours consécutifs d''activité.';
