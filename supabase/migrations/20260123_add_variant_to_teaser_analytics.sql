-- Migration: Add variant column to teaser analytics tables
-- Date: 2026-01-23
-- Purpose: Support A/B testing for Story 2.3 (AC7)

-- Add variant column to teaser_views
ALTER TABLE teaser_views 
ADD COLUMN IF NOT EXISTS variant TEXT DEFAULT 'control';

-- Add variant column to teaser_conversions
ALTER TABLE teaser_conversions 
ADD COLUMN IF NOT EXISTS variant TEXT DEFAULT 'control';

-- Add index for variant analysis
CREATE INDEX IF NOT EXISTS idx_teaser_views_variant ON teaser_views(variant);
CREATE INDEX IF NOT EXISTS idx_teaser_conversions_variant ON teaser_conversions(variant);
