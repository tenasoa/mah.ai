"use client";

import { getConversations } from "@/app/actions/chat";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Search, MessageSquarePlus, ArrowLeft } from "lucide-react";
import { NewChatModal } from "@/components/chat/NewChatModal";
import Link from "next/link";

export default function ChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const activeId = searchParams.get('id');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setUser(user);

      const { data } = await getConversations();
      setConversations(data || []);
      setLoading(false);
    }
    loadData();
  }, [supabase, router]);

  if (loading) return null;

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-500 transition-colors">
      {/* Sidebar: Conversations List */}
      <aside className={`w-full lg:w-[350px] border-r border-slate-100 dark:border-slate-800 flex flex-col ${activeId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-400">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">Messages</h1>
            </div>
            <button 
              onClick={() => setIsNewChatOpen(true)}
              className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all cursor-pointer"
            >
              <MessageSquarePlus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              placeholder="Rechercher une discussion..." 
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <ChatList conversations={conversations} activeId={activeId || undefined} />
        </div>
      </aside>

      {/* Main: Active Chat */}
      <main className={`flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-950/30 ${!activeId ? 'hidden lg:flex' : 'flex'}`}>
        {activeId ? (
          <ChatWindow conversationId={activeId} currentUserId={user.id} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mb-6 rotate-3">
                <MessageSquarePlus className="w-10 h-10 text-indigo-200 dark:text-indigo-700" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 font-outfit">Tes discussions</h2>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Sélectionne une discussion pour commencer à échanger avec tes profs ou tes amis.
            </p>
          </div>
        )}
      </main>

      <NewChatModal 
        isOpen={isNewChatOpen} 
        onClose={() => setIsNewChatOpen(false)} 
        currentUserId={user.id} 
      />
    </div>
  );
}
