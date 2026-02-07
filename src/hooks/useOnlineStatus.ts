"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

interface OnlineStatusOptions {
  userId?: string;
  heartbeatInterval?: number;
}

export function useOnlineStatus({ 
  userId, 
  heartbeatInterval = 30000 // 30 seconds
}: OnlineStatusOptions = {}) {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setOnlineStatus = useCallback(async (online: boolean) => {
    if (!userId) return;

    try {
      const now = new Date().toISOString();
      
      if (online) {
        // Update last_seen when coming online
        await supabase
          .from("profiles")
          .update({ 
            last_seen: now,
            is_online: true 
          })
          .eq("id", userId);
        
        setIsOnline(true);
        setLastSeen(new Date(now));
      } else {
        // Set offline when leaving
        await supabase
          .from("profiles")
          .update({ 
            is_online: false 
          })
          .eq("id", userId);
        
        setIsOnline(false);
      }
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  }, [supabase, userId]);

  useEffect(() => {
    if (!userId) return;

    // Set initial online status
    setOnlineStatus(true);

    // Start heartbeat
    intervalRef.current = setInterval(() => {
      setOnlineStatus(true);
    }, heartbeatInterval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setOnlineStatus(false);
    };
  }, [heartbeatInterval, setOnlineStatus, userId]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && userId) {
        // User switched tabs/minimized window
        setOnlineStatus(false);
      } else if (!document.hidden && userId) {
        // User returned to tab
        setOnlineStatus(true);
      }
    };

    const handleBeforeUnload = () => {
      // User is closing the tab/window
      if (userId) {
        setOnlineStatus(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [setOnlineStatus, userId]);

  // Subscribe to real-time online status changes for other users
  const subscribeToUserStatus = useCallback((targetUserId: string, callback: (status: boolean, lastSeen?: Date) => void) => {
    if (!targetUserId) return () => {};

    const channel = supabase
      .channel(`user_status_${targetUserId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${targetUserId}`,
        },
        (payload) => {
          const newStatus = payload.new?.is_online;
          const newLastSeen = payload.new?.last_seen;
          
          callback(newStatus, newLastSeen ? new Date(newLastSeen) : undefined);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return {
    isOnline,
    lastSeen,
    setOnlineStatus,
    subscribeToUserStatus,
  };
}
