-- Allow marking messages as read via a secure RPC (avoids opening UPDATE on messages)
CREATE OR REPLACE FUNCTION public.mark_conversation_messages_read(p_conversation_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user uuid;
  v_count integer;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE public.messages
  SET is_read = true
  WHERE conversation_id = p_conversation_id
    AND sender_id <> v_user
    AND is_read = false
    AND EXISTS (
      SELECT 1
      FROM public.conversations
      WHERE id = p_conversation_id
        AND v_user = ANY(participants)
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_conversation_messages_read(uuid) TO authenticated;
