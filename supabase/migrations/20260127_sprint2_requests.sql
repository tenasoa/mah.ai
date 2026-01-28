-- Migration: Sprint 2 - Subject Requests System
-- Description: System for users to request missing subjects with auto-refund logic.

-- 1. Add ticket cost to site settings
INSERT INTO public.site_settings (key, value) 
VALUES ('ticket_request_cost', '2')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Create Subject Requests table
CREATE TABLE IF NOT EXISTS public.subject_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  matiere TEXT NOT NULL,
  year INTEGER NOT NULL,
  serie TEXT,
  level TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'expired', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL, -- Link to subject if fulfilled
  admin_comment TEXT
);

-- Index for admin management
CREATE INDEX IF NOT EXISTS idx_subject_requests_status ON public.subject_requests(status);
CREATE INDEX IF NOT EXISTS idx_subject_requests_user ON public.subject_requests(user_id);

-- RLS
ALTER TABLE public.subject_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own requests" ON public.subject_requests;
CREATE POLICY "Users can view own requests" ON public.subject_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own requests" ON public.subject_requests;
CREATE POLICY "Users can insert own requests" ON public.subject_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all requests" ON public.subject_requests;
CREATE POLICY "Admins can manage all requests" ON public.subject_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (roles @> ARRAY['admin']::text[] OR roles @> ARRAY['superadmin']::text[])
    )
  );

-- 3. RPC to create a request and deduct credits atomically
CREATE OR REPLACE FUNCTION public.create_subject_request(
  p_matiere TEXT,
  p_year INTEGER,
  p_serie TEXT DEFAULT NULL,
  p_level TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_cost INTEGER;
  v_balance INTEGER;
  v_request_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Non authentifié');
  END IF;

  -- 1. Get cost from settings
  SELECT (value::TEXT)::INTEGER INTO v_cost FROM public.site_settings WHERE key = 'ticket_request_cost';
  IF v_cost IS NULL THEN v_cost := 2; END IF;

  -- 2. Check balance
  SELECT credits_balance INTO v_balance FROM public.profiles WHERE id = v_user_id;
  IF v_balance < v_cost THEN
    RETURN json_build_object('success', false, 'error', 'INSUFFICIENT_CREDITS', 'balance', v_balance, 'cost', v_cost);
  END IF;

  -- 3. Create request
  INSERT INTO public.subject_requests (user_id, matiere, year, serie, level, status)
  VALUES (v_user_id, p_matiere, p_year, p_serie, p_level, 'pending')
  RETURNING id INTO v_request_id;

  -- 4. Deduct credits
  UPDATE public.profiles SET credits_balance = credits_balance - v_cost WHERE id = v_user_id;

  -- 5. Log transaction
  INSERT INTO public.transactions (user_id, amount, type, action_type, metadata)
  VALUES (v_user_id, -v_cost, 'CONSUME', 'SUBJECT_REQUEST', json_build_object('request_id', v_request_id, 'matiere', p_matiere, 'year', p_year));

  RETURN json_build_object('success', true, 'request_id', v_request_id, 'new_balance', v_balance - v_cost);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC to handle manual or automatic refund
CREATE OR REPLACE FUNCTION public.refund_subject_request(p_request_id UUID, p_reason TEXT DEFAULT 'Expired')
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_cost INTEGER;
  v_status TEXT;
BEGIN
  -- Check request status
  SELECT user_id, status INTO v_user_id, v_status FROM public.subject_requests WHERE id = p_request_id;
  
  IF v_status != 'pending' AND v_status != 'expired' THEN
    RETURN json_build_object('success', false, 'error', 'Request already processed');
  END IF;

  -- Get original cost (assuming 2 for now, or fetch from transaction log)
  v_cost := 2; 

  -- Refund credits
  UPDATE public.profiles SET credits_balance = credits_balance + v_cost WHERE id = v_user_id;

  -- Update request status
  UPDATE public.subject_requests 
  SET status = 'refunded', admin_comment = p_reason 
  WHERE id = p_request_id;

  -- Log transaction
  INSERT INTO public.transactions (user_id, amount, type, action_type, metadata)
  VALUES (v_user_id, v_cost, 'REFUND', 'SUBJECT_REQUEST_REFUND', json_build_object('request_id', p_request_id));

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to process all expired requests (older than 3 days)
CREATE OR REPLACE FUNCTION public.process_expired_requests()
RETURNS JSON AS $$
DECLARE
  v_count INTEGER := 0;
  v_rec RECORD;
BEGIN
  FOR v_rec IN 
    SELECT id FROM public.subject_requests 
    WHERE status = 'pending' AND created_at < NOW() - INTERVAL '3 days'
  LOOP
    PERFORM public.refund_subject_request(v_rec.id, 'Auto-refund: Not fulfilled within 3 days');
    v_count := v_count + 1;
  END LOOP;

  RETURN json_build_object('success', true, 'processed_count', v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
