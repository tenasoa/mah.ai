"use client";

import { useEffect, useState, useRef } from "react";
import { 
  X, 
  Search, 
  MessageSquare, 
  ArrowLeft, 
  Send, 
  Loader2,
  Users,
  MessageSquarePlus,
  ChevronDown
} from "lucide-react";
import { getConversations, getMessages, sendMessage, getOrCreateConversation } from "@/app/actions/chat";
import { createClient } from "@/lib/supabase/client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface MiniChatProps {
  currentUserId: string;
  onClose: () => void;
}

export function MiniChat({ currentUserId, onClose }: MiniChatProps) {
  const [view, setView] = useState<"list" | "chat">("list");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { subscribeToUserStatus } = useOnlineStatus();

  // Load conversations on mount
  useEffect(() => {
    async function loadConversations() {
      const { data } = await getConversations();
      setConversations(data || []);
    }
    loadConversations();

    // Subscribe to conversation updates (new messages, etc)
    const channel = supabase
      .channel("mini-chat-convs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => loadConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Load messages when an active conversation is selected
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      setLoading(true);
      const { data } = await getMessages(activeConversationId!);
      setMessages(data || []);
      setLoading(false);
      scrollToBottom();
      
      // Get other participant
      const conv = conversations.find(c => c.id === activeConversationId);
      if (conv) {
        setOtherParticipant(conv.other_participant);
      }
    }
    loadMessages();

    // Subscribe to new messages for the active conversation
    const channel = supabase
      .channel(`mini-conv:${activeConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`
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
  }, [activeConversationId, conversations, supabase]);

  // Handle searching users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, pseudo, avatar_url")
        .ilike("pseudo", `%${searchQuery}%`)
        .neq("id", currentUserId)
        .limit(5);
      setSearchResults(data || []);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUserId, supabase]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setView("chat");
  };

  const handleStartChat = async (userId: string) => {
    const { conversationId } = await getOrCreateConversation(userId);
    if (conversationId) {
      handleSelectConversation(conversationId);
      setIsSearching(false);
      setSearchQuery("");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !activeConversationId || sending) return;

    setSending(true);
    const text = content.trim();
    setContent("");
    const { error } = await sendMessage(activeConversationId, text);
    if (error) setContent(text);
    setSending(false);
  };

  return (
    <div className="fixed bottom-24 right-8 w-80 sm:w-96 h-[500px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 z-[100]">
      {/* Header */}
      <header className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-3">
          {view === "chat" && (
            <button 
              onClick={() => setView("list")}
              className="p-2 -ml-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h3 className="font-black text-slate-900 dark:text-white font-outfit truncate">
            {view === "list" ? "Discussions" : otherParticipant?.pseudo || "Chat"}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {view === "list" && (
            <button 
              onClick={() => setIsSearching(!isSearching)}
              className={`p-2 rounded-xl transition-all ${isSearching ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-50"}`}
            >
              <MessageSquarePlus className="w-5 h-5" />
            </button>
          )}
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400">
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        {view === "list" ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Bar */}
            {isSearching && (
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 animate-in slide-in-from-top duration-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    autoFocus
                    placeholder="Chercher quelqu'un..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Conversation/Search Results List */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {isSearching && searchQuery.trim() ? (
                <div className="p-2 space-y-1">
                  <p className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Résultats</p>
                  {searchResults.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleStartChat(user.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
                        {user.pseudo.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user.pseudo}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black">Élève</p>
                      </div>
                    </button>
                  ))}
                  {searchResults.length === 0 && (
                    <p className="p-4 text-center text-xs text-slate-400 italic">Aucun utilisateur trouvé.</p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {conversations.length > 0 ? (
                    conversations.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {conv.other_participant?.pseudo?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{conv.other_participant?.pseudo}</p>
                            <span className="text-[9px] text-slate-400">
                              {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ""}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">
                            {conv.last_message?.content || "Démarrer la discussion"}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-12 text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Pas encore de messages</p>
                      <p className="text-xs text-slate-400">Commence une discussion avec tes amis.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
            {/* Active Chat Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500 opacity-20" />
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender_id === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs shadow-sm ${
                        isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-bl-none border border-slate-100 dark:border-slate-700"
                      }`}>
                        <p className="leading-relaxed">{msg.content}</p>
                        <span className="text-[8px] opacity-60 mt-1 block text-right">
                           {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <footer className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <form onSubmit={handleSend} className="relative flex items-center gap-2">
                <input 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Écris ton message..."
                  className="flex-1 pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
                />
                <button 
                  type="submit"
                  disabled={!content.trim() || sending}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg active:scale-95"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
