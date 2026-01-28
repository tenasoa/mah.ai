-- Migration: Sprint 4 - Instant Messaging System
-- Description: Chat system for direct communication between users.

-- 1. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participants UUID[] NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for participants
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations USING GIN (participants);

-- RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = ANY(participants));

-- 2. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.messages;
CREATE POLICY "Users can view messages in own conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND auth.uid() = ANY(participants)
    )
  );

DROP POLICY IF EXISTS "Users can insert messages in own conversations" ON public.messages;
CREATE POLICY "Users can insert messages in own conversations" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND auth.uid() = ANY(participants)
    )
  );

-- 3. Trigger to update last_message_at in conversations
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_last_message();

-- 4. RPC to get or create a conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(p_other_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_conv_id UUID;
  v_me UUID;
BEGIN
  v_me := auth.uid();
  IF v_me IS NULL THEN RETURN NULL; END IF;
  
  -- Check if conversation already exists
  SELECT id INTO v_conv_id
  FROM public.conversations
  WHERE participants @> ARRAY[v_me, p_other_user_id] 
    AND participants <@ ARRAY[v_me, p_other_user_id]
  LIMIT 1;
  
  IF v_conv_id IS NULL THEN
    INSERT INTO public.conversations (participants)
    VALUES (ARRAY[v_me, p_other_user_id])
    RETURNING id INTO v_conv_id;
  END IF;
  
  RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
