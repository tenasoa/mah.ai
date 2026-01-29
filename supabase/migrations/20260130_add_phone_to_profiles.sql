-- Add phone fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_country_code TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT;

COMMENT ON COLUMN public.profiles.phone_country_code IS 'Dialing code for the user phone number (e.g. +261)';
COMMENT ON COLUMN public.profiles.phone_number IS 'User phone number without country code';
