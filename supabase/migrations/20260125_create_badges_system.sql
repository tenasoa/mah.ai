-- Migration: Badges and Success System
-- Description: Adds tables for badges and user achievements.

-- 1. Table des définitions de badges
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY, -- ex: 'night_owl', 'streak_7', 'ai_curious'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- emoji ou nom d'icône lucide
  category TEXT DEFAULT 'general', -- 'effort', 'knowledge', 'social'
  points_required INTEGER DEFAULT 0, -- points grit à gagner lors du déblocage
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des badges obtenus par les utilisateurs
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);

-- RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Users can view own unlocked badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);

-- 3. Insertion des premiers badges (Seed)
INSERT INTO public.badges (id, name, description, icon, category, points_required) VALUES
  ('night_owl', 'Oiseau de Nuit', 'Réviser 3 fois après 22h.', '🦉', 'effort', 50),
  ('streak_7', 'Série de Feu', 'Maintenir une série de 7 jours consécutifs.', '🔥', 'effort', 100),
  ('ai_curious', 'Curiosité Socratique', 'Poser 10 questions pertinentes à l''IA.', '✨', 'knowledge', 75),
  ('pioneer', 'Pionnier', 'Participer à l''édition d''un sujet Markdown.', '🚀', 'social', 150),
  ('early_bird', 'Lève-tôt', 'Commencer une session avant 7h du matin.', '🌅', 'effort', 50);

-- 4. Fonction pour vérifier et attribuer un badge (utilisable par le serveur)
CREATE OR REPLACE FUNCTION check_and_award_badge(p_user_id UUID, p_badge_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier si déjà obtenu
  IF EXISTS (SELECT 1 FROM public.user_badges WHERE user_id = p_user_id AND badge_id = p_badge_id) THEN
    RETURN FALSE;
  END IF;

  -- Attribuer
  INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, p_badge_id);
  
  -- Optionnel: Ajouter les points Grit bonus liés au badge
  -- PERFORM add_grit_points(50, 'contribution', ...);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
