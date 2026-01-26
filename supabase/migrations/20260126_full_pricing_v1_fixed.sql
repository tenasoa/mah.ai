-- Migration corrigée : Full Pricing System implementation
-- Description : Mise à jour du système de crédits, tarification et abonnements avec migration de données sécurisée.

-- 1. Mise à jour de la table transactions sans perte de données
-- On ajoute d'abord la nouvelle colonne en autorisant le NULL temporairement
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS type_new TEXT;

-- On migre les données existantes vers le nouveau format
UPDATE public.transactions 
SET type_new = CASE 
  WHEN type::text = 'unlock' THEN 'CONSUME'
  WHEN type::text = 'purchase' THEN 'PURCHASE'
  WHEN type::text = 'bonus' THEN 'BONUS'
  WHEN type::text = 'refund' THEN 'REFUND'
  ELSE 'CONSUME'
END;

-- On supprime l'ancienne colonne et on renomme la nouvelle
ALTER TABLE public.transactions DROP COLUMN type;
ALTER TABLE public.transactions RENAME COLUMN type_new TO type;

-- On applique les contraintes de sécurité
ALTER TABLE public.transactions ALTER COLUMN type SET NOT NULL;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('PURCHASE', 'CONSUME', 'REFUND', 'BONUS', 'SUBSCRIPTION_GRANT'));

-- Ajout des colonnes de traçabilité
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS action_type TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Entitlements (Abonnements)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS content_full_access BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_unlimited BOOLEAN DEFAULT false;

-- 3. Configuration des prix
CREATE TABLE IF NOT EXISTS public.pricing_config (
  action_type TEXT PRIMARY KEY,
  cost_credits INTEGER NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.pricing_config (action_type, cost_credits, description)
VALUES 
  ('AI_RESPONSE_SHORT', 1, 'Réponse IA courte'),
  ('AI_RESPONSE_COMPLETE', 2, 'Réponse IA complète'),
  ('AI_RESPONSE_DETAILED', 4, 'Réponse IA détaillée'),
  ('UNLOCK_SUBJECT', 2, 'Déblocage d''un sujet d''examen'),
  ('UNLOCK_ANSWER', 2, 'Déblocage d''une réponse'),
  ('HUMAN_CORRECTION', 20, 'Correction personnalisée par un professeur'),
  ('HUMAN_VERIFIED_ANSWER', 40, 'Réponse vérifiée et validée par un humain')
ON CONFLICT (action_type) DO UPDATE SET cost_credits = EXCLUDED.cost_credits;

-- 4. Mise à jour des packs (1 crédit = 500 Ar)
INSERT INTO public.site_settings (key, value)
VALUES ('credit_prices', '{"10": 5000, "50": 22500, "100": 40000}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 5. Fonction RPC de consommation centralisée
CREATE OR REPLACE FUNCTION public.check_and_consume_credits(
  p_user_id UUID,
  p_action_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSON AS $$
DECLARE
  v_cost INTEGER;
  v_balance INTEGER;
  v_ai_unlimited BOOLEAN;
  v_content_full_access BOOLEAN;
BEGIN
  -- 1. Récupération du coût
  SELECT cost_credits INTO v_cost FROM public.pricing_config WHERE action_type = p_action_type;
  IF v_cost IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Action inconnue');
  END IF;

  -- 2. Vérification des droits et solde
  SELECT ai_unlimited, content_full_access, credits_balance 
  INTO v_ai_unlimited, v_content_full_access, v_balance
  FROM public.profiles WHERE id = p_user_id;

  -- 3. Application des règles d'abonnement (coût 0 si illimité)
  IF (p_action_type LIKE 'AI_RESPONSE_%' AND v_ai_unlimited) THEN v_cost := 0; END IF;
  IF (p_action_type IN ('UNLOCK_SUBJECT', 'UNLOCK_ANSWER') AND v_content_full_access) THEN v_cost := 0; END IF;

  -- 4. Si gratuit, on log et on valide
  IF v_cost = 0 THEN
    INSERT INTO public.transactions (user_id, amount, type, action_type, metadata)
    VALUES (p_user_id, 0, 'CONSUME', p_action_type, p_metadata);
    RETURN json_build_object('success', true, 'cost', 0);
  END IF;

  -- 5. Vérification du solde pour les actions payantes
  IF v_balance < v_cost THEN
    RETURN json_build_object('success', false, 'error', 'INSUFFICIENT_CREDITS');
  END IF;

  -- 6. Déduction et journalisation
  UPDATE public.profiles SET credits_balance = credits_balance - v_cost WHERE id = p_user_id;
  
  INSERT INTO public.transactions (user_id, amount, type, action_type, metadata)
  VALUES (p_user_id, -v_cost, 'CONSUME', p_action_type, p_metadata);

  RETURN json_build_object('success', true, 'cost', v_cost, 'new_balance', v_balance - v_cost);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
