"use client";

import Link from "next/link";
import { User } from "lucide-react";

interface ChatListProps {
  conversations: any[];
  activeId?: string;
}

export function ChatList({ conversations, activeId }: ChatListProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-xs text-slate-400 italic">Aucune discussion pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-50 dark:divide-slate-800 transition-colors">
      {conversations.map((conv) => (
        <Link
          key={conv.id}
          href={`/chat?id=${conv.id}`}
          className={`flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group ${
            activeId === conv.id ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
          }`}
        >
          <div className="relative">
            {conv.other_participant?.avatar_url ? (
              <img
                src={conv.other_participant.avatar_url}
                alt={conv.other_participant.pseudo}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black shadow-sm">
                {conv.other_participant?.pseudo?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            {/* Online indicator (static for now) */}
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <h3 className={`font-bold truncate text-sm ${activeId === conv.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100'}`}>
                {conv.other_participant?.pseudo || "Utilisateur"}
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">
                {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ""}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1">
              {conv.last_message?.sender_id === conv.participants.find((p: any) => p !== conv.other_participant?.id) && "Moi: "}
              {conv.last_message?.content || "Démarrer la discussion"}
            </p>
          </div>

          {conv.last_message?.is_read === false && conv.last_message?.sender_id !== conv.participants.find((p: any) => p !== conv.other_participant?.id) && (
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20 animate-pulse" />
          )}
        </Link>
      ))}
    </div>
  );
}
