"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMessages, sendMessage } from "@/app/actions/chat";
import { 
    Send, 
    Loader2, 
    MoreVertical, 
    Phone, 
    Video, 
    ChevronLeft,
    Paperclip,
    Smile
} from "lucide-react";
import Link from "next/link";

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
}

export function ChatWindow({ conversationId, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data } = await getMessages(conversationId);
      setMessages(data || []);
      
      // Get other participant info
      const { data: conv } = await supabase
        .from('conversations')
        .select('participants')
        .eq('id', conversationId)
        .single();
        
      if (conv) {
        const otherId = conv.participants.find((p: string) => p !== currentUserId);
        const { data: profile } = await supabase
          .from('profiles')
          .select('pseudo, avatar_url')
          .eq('id', otherId)
          .single();
        setOtherParticipant(profile);
      }
      
      setLoading(false);
      scrollToBottom();
    }
    loadData();

    // Subscribe to new messages
    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    const text = content.trim();
    setContent(""); // Clear input early for UX
    
    const { error } = await sendMessage(conversationId, text);
    if (error) {
        console.error("Failed to send message:", error);
        setContent(text); // Restore on error
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Chat Header */}
      <header className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10 shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          <Link href="/chat" className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="relative">
            {otherParticipant?.avatar_url ? (
              <img
                src={otherParticipant.avatar_url}
                alt={otherParticipant.pseudo}
                className="w-10 h-10 rounded-xl object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold">
                {otherParticipant?.pseudo?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{otherParticipant?.pseudo || "Chargement..."}</h3>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">En ligne</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 rounded-xl transition-all">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 rounded-xl transition-all">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === currentUserId;
          const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {!isMe && (
                <div className="w-8 h-8 flex-shrink-0">
                  {showAvatar && (
                    otherParticipant?.avatar_url ? (
                      <img src={otherParticipant.avatar_url} className="w-full h-full rounded-lg object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {otherParticipant?.pseudo?.charAt(0).toUpperCase()}
                      </div>
                    )
                  )}
                </div>
              )}
              
              <div className={`max-w-[75%] space-y-1 ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700"
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
                <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 block px-1">
                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <footer className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-2">
            <button type="button" className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                <Smile className="w-6 h-6" />
            </button>
            <button type="button" className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
                <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tape ton message ici..."
                    className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-700 transition-all placeholder:text-slate-400"
                />
                <button
                    type="submit"
                    disabled={!content.trim() || sending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                    {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                    <Send className="w-5 h-5" />
                    )}
                </button>
            </div>
        </form>
      </footer>
    </div>
  );
}
