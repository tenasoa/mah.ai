-- Migration: Sprint 1 - Foundations Roles & Gouvernance
-- Description: Roles extension, author earnings, and corrections system.

-- 1. Extend Profiles for earnings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 0.8; -- 80% to author by default

-- 2. Extend Subjects for commission management
ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS is_admin_subject BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS commission_rate_override NUMERIC DEFAULT NULL;

-- 3. Earnings tracking table
CREATE TABLE IF NOT EXISTS public.earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- in credits
  source_type TEXT NOT NULL, -- 'subject', 'correction'
  source_id UUID NOT NULL,
  commission_site INTEGER NOT NULL, -- amount kept by site
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for earnings
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own earnings" ON public.earnings
  FOR SELECT USING (auth.uid() = user_id);

-- 4. Subject Corrections Table
CREATE TABLE IF NOT EXISTS public.subject_corrections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_markdown TEXT NOT NULL DEFAULT '',
  content_html TEXT NOT NULL DEFAULT '',
  price_credits INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'revision', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  UNIQUE(subject_id, author_id) -- One correction per author per subject
);

-- RLS for subject_corrections
ALTER TABLE public.subject_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published corrections" ON public.subject_corrections
  FOR SELECT USING (status = 'published');

CREATE POLICY "Correctors can manage own corrections" ON public.subject_corrections
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all corrections" ON public.subject_corrections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (roles @> ARRAY['admin']::text[] OR roles @> ARRAY['superadmin']::text[])
    )
  );

-- 5. Access table for corrections (separate from subject access)
CREATE TABLE IF NOT EXISTS public.user_correction_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  correction_id UUID REFERENCES public.subject_corrections(id) ON DELETE CASCADE NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, correction_id)
);

ALTER TABLE public.user_correction_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own correction access" ON public.user_correction_access
  FOR SELECT USING (auth.uid() = user_id);

-- 6. Unified Purchase RPC
CREATE OR REPLACE FUNCTION public.purchase_content(
  p_content_type TEXT, -- 'subject' or 'correction'
  p_content_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_author_id UUID;
  v_cost INTEGER;
  v_balance INTEGER;
  v_commission_rate NUMERIC;
  v_is_admin_subject BOOLEAN;
  v_author_share INTEGER;
  v_site_share INTEGER;
  v_already_unlocked BOOLEAN;
  v_content_full_access BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Non authentifié');
  END IF;

  -- 1. Get cost and author
  IF p_content_type = 'subject' THEN
    SELECT credit_cost, uploaded_by, is_admin_subject, commission_rate_override 
    INTO v_cost, v_author_id, v_is_admin_subject, v_commission_rate
    FROM public.subjects WHERE id = p_content_id;
    
    -- Default commission if not overridden
    IF v_commission_rate IS NULL THEN
      SELECT commission_rate INTO v_commission_rate FROM public.profiles WHERE id = v_author_id;
    END IF;
    IF v_commission_rate IS NULL THEN v_commission_rate := 0.8; END IF;

    -- Admin subjects = 100% commission for site
    IF v_is_admin_subject THEN v_commission_rate := 0.0; END IF;

    -- Check if already unlocked
    SELECT EXISTS(
      SELECT 1 FROM public.user_subject_access 
      WHERE user_id = v_user_id AND subject_id = p_content_id
      AND (expires_at IS NULL OR expires_at > NOW())
    ) INTO v_already_unlocked;

  ELSIF p_content_type = 'correction' THEN
    SELECT price_credits, author_id INTO v_cost, v_author_id
    FROM public.subject_corrections WHERE id = p_content_id;
    
    -- For corrections, commission is fixed at 15% for site (85% for author)
    v_commission_rate := 0.85;

    SELECT EXISTS(
      SELECT 1 FROM public.user_correction_access 
      WHERE user_id = v_user_id AND correction_id = p_content_id
    ) INTO v_already_unlocked;
  ELSE
    RETURN json_build_object('success', false, 'error', 'Type de contenu invalide');
  END IF;

  IF v_cost IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Contenu introuvable');
  END IF;

  IF v_already_unlocked THEN
    RETURN json_build_object('success', true, 'message', 'Déjà débloqué');
  END IF;

  -- 2. Check full access rights
  SELECT content_full_access, credits_balance INTO v_content_full_access, v_balance
  FROM public.profiles WHERE id = v_user_id;

  IF v_content_full_access AND p_content_type = 'subject' THEN
    v_cost := 0;
  END IF;

  -- 3. Verify balance
  IF v_balance < v_cost THEN
    RETURN json_build_object('success', false, 'error', 'INSUFFICIENT_CREDITS', 'balance', v_balance, 'cost', v_cost);
  END IF;

  -- 4. Calculate shares
  v_author_share := floor(v_cost * v_commission_rate);
  v_site_share := v_cost - v_author_share;

  -- 5. Execute Transaction
  -- Debit buyer
  UPDATE public.profiles SET credits_balance = credits_balance - v_cost WHERE id = v_user_id;

  -- Credit author (if any and not self)
  IF v_author_id IS NOT NULL AND v_author_id != v_user_id AND v_author_share > 0 THEN
    UPDATE public.profiles SET credits_balance = credits_balance + v_author_share WHERE id = v_author_id;
    
    -- Log earning
    INSERT INTO public.earnings (user_id, amount, source_type, source_id, commission_site)
    VALUES (v_author_id, v_author_share, p_content_type, p_content_id, v_site_share);
    
    -- Log transaction for author
    INSERT INTO public.transactions (user_id, amount, type, action_type, metadata)
    VALUES (v_author_id, v_author_share, 'BONUS', 'EARNING_' || upper(p_content_type), json_build_object('source_id', p_content_id, 'buyer_id', v_user_id));
  END IF;

  -- 6. Create Access
  IF p_content_type = 'subject' THEN
    INSERT INTO public.user_subject_access (user_id, subject_id, access_type)
    VALUES (v_user_id, p_content_id, 'purchase');
  ELSE
    INSERT INTO public.user_correction_access (user_id, correction_id)
    VALUES (v_user_id, p_content_id);
  END IF;

  -- 7. Log transaction for buyer
  INSERT INTO public.transactions (user_id, amount, type, action_type, metadata)
  VALUES (v_user_id, -v_cost, 'CONSUME', 'UNLOCK_' || upper(p_content_type), json_build_object('id', p_content_id));

  RETURN json_build_object('success', true, 'cost', v_cost, 'new_balance', v_balance - v_cost);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
