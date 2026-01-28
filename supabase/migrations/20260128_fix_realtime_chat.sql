-- Migration: Enable Realtime for Chat
-- Description: Add messages table to supabase_realtime publication to fix instant updates.

-- Enable replication for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
