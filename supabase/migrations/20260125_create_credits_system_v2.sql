-- Migration: Credits and Transactions System
-- Description: Adds credits tracking and atomic purchase function.

-- 1. S'assurer que profiles a la colonne credits_balance
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0 CHECK (credits_balance >= 0);

-- 2. Table des transactions
CREATE TYPE transaction_type AS ENUM ('unlock', 'purchase', 'bonus', 'refund');

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- négatif pour débit, positif pour crédit
  type transaction_type NOT NULL,
  reference_id UUID, -- ex: subject_id
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les perfs
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);

-- RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Fonction atomique d'achat de sujet
CREATE OR REPLACE FUNCTION purchase_subject(p_subject_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_cost INTEGER;
  v_balance INTEGER;
  v_already_unlocked BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Non authentifié');
  END IF;

  -- 1. Récupérer le coût
  SELECT credit_cost INTO v_cost FROM public.subjects WHERE id = p_subject_id;
  IF v_cost IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Sujet introuvable');
  END IF;

  -- 2. Vérifier si déjà débloqué
  SELECT EXISTS(
    SELECT 1 FROM public.user_subject_access 
    WHERE user_id = v_user_id AND subject_id = p_subject_id
    AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_already_unlocked;

  IF v_already_unlocked THEN
    RETURN json_build_object('success', true, 'message', 'Déjà débloqué');
  END IF;

  -- 3. Vérifier le solde
  SELECT credits_balance INTO v_balance FROM public.profiles WHERE id = v_user_id;
  IF v_balance < v_cost THEN
    RETURN json_build_object('success', false, 'error', 'Solde insuffisant', 'balance', v_balance, 'cost', v_cost);
  END IF;

  -- 4. Déduire les crédits
  UPDATE public.profiles 
  SET credits_balance = credits_balance - v_cost 
  WHERE id = v_user_id;

  -- 5. Créer l'accès
  INSERT INTO public.user_subject_access (user_id, subject_id, access_type)
  VALUES (v_user_id, p_subject_id, 'purchase');

  -- 6. Enregistrer la transaction
  INSERT INTO public.transactions (user_id, amount, type, reference_id, description)
  VALUES (v_user_id, -v_cost, 'unlock', p_subject_id, 'Déblocage de sujet');

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
