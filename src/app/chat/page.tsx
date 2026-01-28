"use client";

import { getConversations, getSuggestedUsers, getAdminUser, getOrCreateConversation } from "@/app/actions/chat";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Search, MessageSquarePlus, ArrowLeft, Users, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { NewChatModal } from "@/components/chat/NewChatModal";
import Link from "next/link";

export default function ChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState<string | null>(null);
  
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

      const [convs, suggested, admin] = await Promise.all([
        getConversations(),
        getSuggestedUsers(),
        getAdminUser()
      ]);

      setConversations(convs.data || []);
      setSuggestedUsers(suggested.data || []);
      setAdminUser(admin.data);
      setLoading(false);
    }
    loadData();
  }, [supabase, router]);

  const handleStartChat = async (userId: string) => {
    setStartingChat(userId);
    const { conversationId, error } = await getOrCreateConversation(userId);
    if (conversationId) {
      router.push(`/chat?id=${conversationId}`);
    }
    setStartingChat(null);
  };

  if (loading) return null;

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      {/* Sidebar: Conversations List */}
      <aside className={`w-full lg:w-[380px] flex flex-col gap-6 ${activeId ? 'hidden lg:flex' : 'flex'}`}>
        {/* Main Contacts Card */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col transition-colors">
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

          {/* Contact Admin Quick Action */}
          {adminUser && adminUser.id !== user.id && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => handleStartChat(adminUser.id)}
                disabled={startingChat === adminUser.id}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm group"
              >
                <ShieldCheck className="w-4 h-4 text-mojo-500 group-hover:scale-110 transition-transform" />
                Besoin d'aide ? Contacter l'admin
                {startingChat === adminUser.id && <Sparkles className="w-3 h-3 animate-pulse text-amber-500" />}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex gap-6 ${!activeId ? 'hidden lg:flex' : 'flex'}`}>
        {/* Active Chat Window */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col transition-colors">
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
        </div>

        {/* Suggestion & Info Panel (Hidden on small screens) */}
        {!activeId && (
          <aside className="hidden xl:flex w-[320px] flex-col gap-6">
            {/* Relationships & Recommendations */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl p-6 flex flex-col gap-6 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white font-outfit">Relations</h3>
              </div>

              {/* Suggestions List */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggestions d'amis</p>
                {suggestedUsers.length > 0 ? (
                  <div className="space-y-3">
                    {suggestedUsers.map((su) => (
                      <div key={su.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3 min-w-0">
                          {su.avatar_url ? (
                            <img src={su.avatar_url} className="w-9 h-9 rounded-xl object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs">
                              {su.pseudo?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{su.pseudo}</p>
                            <p className="text-[9px] text-slate-400 truncate">{su.filiere || 'Élève'}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleStartChat(su.id)}
                          disabled={startingChat === su.id}
                          className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                        >
                          {startingChat === su.id ? (
                            <Sparkles className="w-4 h-4 animate-pulse" />
                          ) : (
                            <UserPlus className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-4">Pas de suggestions.</p>
                )}
              </div>

              <div className="mt-2 pt-6 border-t border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-balance">Rejoins des groupes d'étude</p>
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed">
                   Connecte-toi avec d'autres élèves de ta filière pour réviser ensemble !
                 </p>
              </div>
            </div>
            
            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-bold mb-2">Besoin d'un sujet ?</h4>
                <p className="text-xs text-white/80 leading-relaxed mb-4">
                  Demande un sujet spécifique à l'admin ou à la communauté si tu ne le trouves pas.
                </p>
                <Link 
                  href="/subjects"
                  className="inline-flex items-center gap-2 py-2 px-4 bg-white/20 hover:bg-white text-white hover:text-indigo-600 rounded-xl text-[10px] font-bold uppercase transition-all"
                >
                  Découvrir
                </Link>
              </div>
              <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-all duration-700" />
            </div>
          </aside>
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
