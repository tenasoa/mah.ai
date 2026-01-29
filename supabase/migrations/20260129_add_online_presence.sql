-- Add online presence tracking to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;

-- Enable realtime for profiles updates (used for presence)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END;
$$;
