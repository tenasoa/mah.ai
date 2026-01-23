-- Migration: Create credits system
-- Date: 2026-01-23
-- Purpose: Story 2.4 - Manage user credits and unlocks

-- 1. Add credits_balance to profiles if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0 NOT NULL;

-- 2. Create transactions table
CREATE TYPE transaction_type AS ENUM ('unlock', 'purchase', 'bonus', 'refund');

CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Negative for debit, Positive for credit
  type transaction_type NOT NULL,
  reference_id UUID, -- Can be subject_id or payment_id
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. RPC Function for Atomic Purchase
-- This ensures we don't have race conditions when unlocking
CREATE OR REPLACE FUNCTION purchase_subject(
  p_subject_id UUID,
  p_cost INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_current_balance INTEGER;
  v_access_exists BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  -- Check if user is logged in
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check if already has access
  SELECT EXISTS (
    SELECT 1 FROM user_subject_access 
    WHERE user_id = v_user_id 
    AND subject_id = p_subject_id
    AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_access_exists;

  IF v_access_exists THEN
     RETURN jsonb_build_object('success', true, 'message', 'Already unlocked');
  END IF;

  -- Lock profile row for update to prevent race conditions
  SELECT credits_balance INTO v_current_balance
  FROM profiles
  WHERE id = v_user_id
  FOR UPDATE;

  -- Check funds
  IF v_current_balance < p_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds');
  END IF;

  -- Deduct credits
  UPDATE profiles
  SET credits_balance = credits_balance - p_cost
  WHERE id = v_user_id;

  -- Record transaction
  INSERT INTO transactions (user_id, amount, type, reference_id, description)
  VALUES (v_user_id, -p_cost, 'unlock', p_subject_id, 'Déblocage sujet');

  -- Grant access (permanent for now, or use logic for temp pass)
  INSERT INTO user_subject_access (user_id, subject_id, expires_at)
  VALUES (v_user_id, p_subject_id, NULL) -- NULL means forever for single unlock
  ON CONFLICT (user_id, subject_id) 
  DO UPDATE SET expires_at = NULL, created_at = NOW();

  RETURN jsonb_build_object('success', true, 'new_balance', v_current_balance - p_cost);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
