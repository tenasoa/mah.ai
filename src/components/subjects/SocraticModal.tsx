"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Send,
  Lightbulb,
  X,
  Sparkles,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { askSocraticTutor, getSocraticHistory } from "@/app/actions/perplexity";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

type SelectionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface SocraticModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  questionId: string;
  questionText: string;
  selectionRect?: SelectionRect | null;
  zoom?: number;
  markdownContext?: string;
}

interface Exchange {
  user_message: string;
  ai_response: string;
  created_at: string;
  insisted_for_answer: boolean;
}

export function SocraticModal({
  isOpen,
  onClose,
  subjectId,
  questionId,
  questionText,
  selectionRect = null,
  zoom = 100,
  markdownContext,
}: SocraticModalProps) {
  const [messages, setMessages] = useState<Exchange[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadHistory = async () => {
    const result = await getSocraticHistory(subjectId, questionId);
    if (result.data && !result.error) {
      setMessages(result.data.reverse());
    }
  };

  const handleSend = async (insistForAnswer = false) => {
    if (!input.trim() && !insistForAnswer) return;

    const messageToSend = insistForAnswer
      ? "Je veux vraiment la réponse directe s'il te plaît."
      : input.trim();

    setIsLoading(true);

    try {
      const result = await askSocraticTutor({
        subjectId,
        questionId,
        questionText,
        selectionRect,
        zoom,
        userMessage: messageToSend,
        insistForAnswer,
        markdownContext,
      });

      if (result.data && !result.error) {
        const newExchange: Exchange = {
          user_message: messageToSend,
          ai_response: result.data.response,
          created_at: new Date().toISOString(),
          insisted_for_answer: insistForAnswer,
        };
        setMessages((prev) => [...prev, newExchange]);
        setInput("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center pt-24 pb-8 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl flex flex-col h-[95vh] w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Tuteur IA Socratique
              </p>
              <p className="text-xs text-slate-500">Guidage pas à pas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors flex items-center justify-center flex-shrink-0"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* History toggle */}
        {messages.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-6 py-2 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50/50 flex items-center gap-2 border-b border-slate-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-semibold">
              Historique ({messages.length})
            </span>
            <ChevronDown
              className={`w-4 h-4 ml-auto transition-transform ${showHistory ? "rotate-180" : ""}`}
            />
          </button>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-gradient-to-b from-slate-50/40 to-transparent">
          {showHistory && messages.length > 0 ? (
            <div className="space-y-6">
              {messages.map((exchange, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="max-w-[75%] rounded-2xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-sm">
                      {exchange.user_message}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 px-4 py-3 text-slate-800 shadow-sm">
                      <MarkdownRenderer
                        content={exchange.ai_response}
                        variant="minimal"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length > 0 ? (
            <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 px-6 py-5 shadow-sm">
              <div className="text-[11px] font-bold text-violet-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Réponse du tuteur
              </div>
              <MarkdownRenderer
                content={messages[messages.length - 1].ai_response}
                variant="minimal"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <p className="text-sm text-slate-500">
                Pose ta première question au tuteur pour commencer
              </p>
            </div>
          )}

          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200/60 p-5 space-y-3 flex-shrink-0 bg-white">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-500/30 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pose ta question ou partage ta réflexion..."
              className="w-full min-h-[50px] resize-none bg-transparent text-sm text-slate-800 placeholder-slate-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleSend(false)}
              disabled={!input.trim() || isLoading}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-600/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Réflexion...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer
                </>
              )}
            </button>

            <button
              onClick={() => handleSend(true)}
              disabled={isLoading}
              className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
              title="Insister pour avoir la réponse directe"
            >
              Réponse directe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
