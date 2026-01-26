-- Migration: Full Pricing System implementation
-- Description: Aligning DB schema with Pricing Spec v1

-- 1. Update Transaction Types (we use a check constraint if we want to avoid enum drop issues, or just use text)
ALTER TABLE public.transactions DROP COLUMN IF EXISTS type;
ALTER TABLE public.transactions ADD COLUMN type TEXT NOT NULL 
CHECK (type IN ('PURCHASE', 'CONSUME', 'REFUND', 'BONUS', 'SUBSCRIPTION_GRANT'));

-- Add action_type and metadata to transactions for traceability
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS action_type TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Extend Profiles for Subscriptions Entitlements
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS content_full_access BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_unlimited BOOLEAN DEFAULT false;

-- 3. Create Pricing Config Table
CREATE TABLE IF NOT EXISTS public.pricing_config (
  action_type TEXT PRIMARY KEY,
  cost_credits INTEGER NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial costs from spec ideas
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

-- 4. Update Pack Prices in site_settings (1 credit = 500 Ar)
UPDATE public.site_settings 
SET value = '{"10": 5000, "50": 22500, "100": 40000}'::jsonb -- 50 et 100 incluent un bonus (10% et 20% de réduction)
WHERE key = 'credit_prices';

-- 5. Helper function to check and consume credits (Internal logic)
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
  -- 1. Get cost
  SELECT cost_credits INTO v_cost FROM public.pricing_config WHERE action_type = p_action_type;
  IF v_cost IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Action inconnue');
  END IF;

  -- 2. Check entitlements
  SELECT ai_unlimited, content_full_access, credits_balance 
  INTO v_ai_unlimited, v_content_full_access, v_balance
  FROM public.profiles WHERE id = p_user_id;

  -- 3. Apply subscription rules
  IF (p_action_type LIKE 'AI_RESPONSE_%' AND v_ai_unlimited) THEN
    v_cost := 0;
  END IF;

  IF (p_action_type IN ('UNLOCK_SUBJECT', 'UNLOCK_ANSWER') AND v_content_full_access) THEN
    v_cost := 0;
  END IF;

  -- 4. If cost is 0, just log and return success
  IF v_cost = 0 THEN
    INSERT INTO public.transactions (user_id, amount, type, action_type, metadata)
    VALUES (p_user_id, 0, 'CONSUME', p_action_type, p_metadata);
    RETURN json_build_object('success', true, 'cost', 0);
  END IF;

  -- 5. Check balance
  IF v_balance < v_cost THEN
    RETURN json_build_object('success', false, 'error', 'INSUFFICIENT_CREDITS', 'balance', v_balance, 'cost', v_cost);
  END IF;

  -- 6. Consume and Log
  UPDATE public.profiles SET credits_balance = credits_balance - v_cost WHERE id = p_user_id;
  
  INSERT INTO public.transactions (user_id, amount, type, action_type, metadata)
  VALUES (p_user_id, -v_cost, 'CONSUME', p_action_type, p_metadata);

  RETURN json_build_object('success', true, 'cost', v_cost, 'new_balance', v_balance - v_cost);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
