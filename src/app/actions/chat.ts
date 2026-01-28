'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getConversations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], error: 'Non authentifié' };

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages (
        content,
        created_at,
        sender_id,
        is_read
      )
    `)
    .order('last_message_at', { ascending: false });

  if (error) return { data: [], error: error.message };

  // For each conversation, we need to fetch the profiles of other participants
  const conversationsWithProfiles = await Promise.all(data.map(async (conv) => {
    const otherParticipantId = conv.participants.find((p: string) => p !== user.id);
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('pseudo, avatar_url, id')
      .eq('id', otherParticipantId)
      .single();

    return {
      ...conv,
      other_participant: profile,
      last_message: conv.messages?.[conv.messages.length - 1]
    };
  }));

  return { data: conversationsWithProfiles };
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data };
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Non authentifié' };

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/chat/${conversationId}`);
  return { data };
}

export async function getOrCreateConversation(otherUserId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('get_or_create_conversation', {
    p_other_user_id: otherUserId
  });

  if (error) return { error: error.message };
  return { conversationId: data as string };
}
