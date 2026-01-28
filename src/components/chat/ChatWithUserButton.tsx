"use client";

import { useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { getOrCreateConversation } from "@/app/actions/chat";
import { useRouter } from "next/navigation";

export function ChatWithUserButton({ userId, pseudo }: { userId: string; pseudo: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChat = async () => {
    setLoading(true);
    const { conversationId, error } = await getOrCreateConversation(userId);
    
    if (conversationId) {
      router.push(`/chat?id=${conversationId}`);
    } else {
      console.error("Failed to start conversation:", error);
      alert("Erreur lors de l'ouverture de la discussion.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleChat}
      disabled={loading}
      className="p-2.5 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all shadow-sm border border-indigo-100 bg-white"
      title={`Discuter avec ${pseudo}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4" />
      )}
    </button>
  );
}
