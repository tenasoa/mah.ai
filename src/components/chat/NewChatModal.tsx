"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, Loader2, UserPlus, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getOrCreateConversation } from "@/app/actions/chat";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export function NewChatModal({ isOpen, onClose, currentUserId }: NewChatModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, pseudo, avatar_url")
        .ilike("pseudo", `%${searchQuery}%`)
        .neq("id", currentUserId)
        .limit(10);

      if (!error) setUsers(data || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUserId, supabase]);

  const handleStartChat = async (userId: string) => {
    setCreating(userId);
    const { conversationId, error } = await getOrCreateConversation(userId);
    
    if (conversationId) {
      onClose();
      router.push(`/chat?id=${conversationId}`);
    } else {
      console.error(error);
    }
    setCreating(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        ref={modalRef}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-outfit">Nouvelle Discussion</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              autoFocus
              placeholder="Rechercher un pseudo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-4 no-scrollbar">
          {loading ? (
            <div className="py-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 opacity-20" />
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleStartChat(user.id)}
                  disabled={creating === user.id}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                      {user.pseudo.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{user.pseudo}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Élève</p>
                  </div>
                  <div className="p-2 opacity-0 group-hover:opacity-100 transition-all">
                    {creating === user.id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    ) : (
                      <MessageSquare className="w-5 h-5 text-indigo-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-400 italic">Aucun utilisateur trouvé.</p>
            </div>
          ) : (
            <div className="py-10 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Commence à taper pour chercher des amis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
