"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { messageStore } from "@/lib/messageStore";

interface MessageBadgeProps {
  className?: string;
}

export function MessageBadge({ className = "" }: MessageBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to global store changes
    const unsubscribe = messageStore.subscribe(setUnreadCount);
    return unsubscribe;
  }, []);

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
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Load initial unread count
    loadUnreadCount();

    // Listen for new messages
    const channel = supabase
      .channel(`unread_messages_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
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
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadUnreadCount = async () => {
    if (!userId) return;

    try {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .eq("is_read", false);

      const newCount = count || 0;
      messageStore.setCount(newCount);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  if (unreadCount === 0) return null;

  return (
    <span
      className={`
        absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs
        font-black rounded-full flex items-center justify-center
        animate-pulse shadow-lg shadow-red-500/50
        ${className}
      `}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}
