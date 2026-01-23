-- Migration: Create teaser analytics tables
-- Date: 2026-01-23
-- Purpose: Track teaser views and conversion metrics for Story 2.3

-- Table: teaser_views
-- Logs every teaser page visit for conversion tracking
CREATE TABLE IF NOT EXISTS teaser_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'direct', -- direct, search, social, email
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: teaser_conversions
-- Logs CTA clicks (unlock, signup, login, share)
CREATE TABLE IF NOT EXISTS teaser_conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cta_type TEXT NOT NULL, -- unlock, signup, login, share
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_teaser_views_subject ON teaser_views(subject_id);
CREATE INDEX IF NOT EXISTS idx_teaser_views_user ON teaser_views(user_id);
CREATE INDEX IF NOT EXISTS idx_teaser_views_viewed_at ON teaser_views(viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_teaser_conversions_subject ON teaser_conversions(subject_id);
CREATE INDEX IF NOT EXISTS idx_teaser_conversions_user ON teaser_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_teaser_conversions_cta_type ON teaser_conversions(cta_type);
CREATE INDEX IF NOT EXISTS idx_teaser_conversions_clicked_at ON teaser_conversions(clicked_at DESC);

-- RLS Policies
ALTER TABLE teaser_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaser_conversions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert their own views
CREATE POLICY "users_can_insert_teaser_views" ON teaser_views
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "anyone_can_read_teaser_views" ON teaser_views
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow anonymous users to record conversions
CREATE POLICY "users_can_insert_teaser_conversions" ON teaser_conversions
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "anyone_can_read_teaser_conversions" ON teaser_conversions
  FOR SELECT
  TO authenticated, anon
  USING (true);
