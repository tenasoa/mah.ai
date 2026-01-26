-- Extend profiles with more fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS learning_goals TEXT[],
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'vip')),
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{
  "show_full_name": false,
  "show_email": false,
  "show_birth_date": false,
  "show_address": false,
  "show_learning_goals": true,
  "show_interests": true
}'::jsonb;

-- Comment for clarity
COMMENT ON COLUMN public.profiles.privacy_settings IS 'User preferences for data visibility to other users';
