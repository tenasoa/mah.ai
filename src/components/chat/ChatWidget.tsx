"use client";

import { usePathname } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MiniChat } from "./MiniChat";
import { createClient } from "@/lib/supabase/client";
import { getUnreadMessagesCount } from "@/app/actions/chat";

export function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { count } = await getUnreadMessagesCount();
        setUnreadCount(count || 0);
      }
    }

    init();
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to new messages for unread count
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          if (payload.new.sender_id !== userId) {
            const { count } = await getUnreadMessagesCount();
            setUnreadCount(count || 0);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        async () => {
          const { count } = await getUnreadMessagesCount();
          setUnreadCount(count || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  // Hide only on dedicated chat pages.
  if (
    pathname === "/chat" || 
    pathname.startsWith("/chat/") ||
    !userId
  ) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <MiniChat 
          currentUserId={userId} 
          onClose={() => setIsOpen(false)} 
        />
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group z-[110]"
        aria-label="Messagerie"
      >
        {isOpen ? (
           <X className="w-6 h-6 animate-in spin-in-90 duration-300" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        )}
      </button>
    </>
  );
}
