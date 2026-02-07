"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

// Global event for message read updates
type MessageReadEvent = CustomEvent<{
  messageId: string;
  conversationId?: string;
}>;

// Global function to mark message as read
export const markMessageAsRead = async (messageId: string) => {
  const supabase = createClient();
  
  try {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", messageId);
    
    // Dispatch event to update badges
    window.dispatchEvent(new CustomEvent('message-read', {
      detail: { messageId }
    } as MessageReadEvent));
    
    return { success: true };
  } catch (error) {
    console.error("Error marking message as read:", error);
    return { success: false, error };
  }
};

// Hook to listen for message read events
export function useMessageReadListener() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const loadUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id");

      const conversationIds = (conversations || []).map((conversation) => conversation.id);
      if (conversationIds.length === 0) {
        setUnreadCount(0);
        return;
      }

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", conversationIds)
        .neq("sender_id", userId)
        .eq("is_read", false);

      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  }, [supabase, userId]);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };

    getCurrentUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserId(session?.user?.id || null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;

    // Load initial unread count
    loadUnreadCount();

    // Listen for message read events
    const handleMessageRead = () => {
      loadUnreadCount();
    };

    window.addEventListener('message-read', handleMessageRead as EventListener);

    // Listen for new messages
    const channel = supabase
      .channel(`unread_messages_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          loadUnreadCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('message-read', handleMessageRead as EventListener);
      supabase.removeChannel(channel);
    };
  }, [userId, loadUnreadCount, supabase]);

  return { unreadCount, markMessageAsRead };
}
