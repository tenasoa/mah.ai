-- Migration: Notifications System
-- Description: Adds a table for user notifications and retention messages.

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'grit'
  link TEXT, -- Lien optionnel vers une page
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Fonction pour créer une notification (utilisable par le serveur)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_type TEXT DEFAULT 'info',
  p_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notif_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, content, type, link)
  VALUES (p_user_id, p_title, p_content, p_type, p_link)
  RETURNING id INTO v_notif_id;
  
  RETURN v_notif_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
