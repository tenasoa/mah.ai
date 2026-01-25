"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Send, Lightbulb, MessageCircle, ChevronDown, Sparkles } from "lucide-react";
import { askSocraticTutor, getSocraticHistory } from "@/app/actions/perplexity";

// Markdown and Math imports
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

type SelectionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface SocraticSidekickProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  questionId: string;
  questionText: string;
  selectionRect: SelectionRect | null;
  zoom: number;
  markdownContext?: string;
}

interface Exchange {
  user_message: string;
  ai_response: string;
  created_at: string;
  insisted_for_answer: boolean;
}

export function SocraticSidekick({
  isOpen,
  onClose,
  subjectId,
  questionId,
  questionText,
  selectionRect,
  zoom,
  markdownContext,
}: SocraticSidekickProps) {
  const [messages, setMessages] = useState<Exchange[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // États pour le redimensionnement
  const [width, setWidth] = useState(448); // Largeur par défaut (max-w-md approx)
  const isResizing = useRef(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Logique de redimensionnement
  useEffect(() => {
    const startResizing = () => { isResizing.current = true; };
    const stopResizing = () => { isResizing.current = false; };
    
    const resize = (e: MouseEvent) => {
      if (!isResizing.current) return;
      
      // Calculer la nouvelle largeur (distance depuis le bord droit de l'écran)
      const newWidth = window.innerWidth - e.clientX;
      
      // Contraintes : min 320px, max 85% de l'écran
      if (newWidth > 320 && newWidth < window.innerWidth * 0.85) {
        setWidth(newWidth);
      }
    };

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Composant pour rendre les messages de l'IA
  const AIResponse = ({ content }: { content: string }) => {
    // Petit hack pour s'assurer que les notations ( ... ) mathématiques sont converties en $ ... $
    // si l'IA oublie les consignes, ou pour corriger les formats textes courants.
    const processedContent = content
      .replace(/\\\((.*?)\\\)/g, '$$$1$$') // Convertir \( ... \) en $ ... $
      .replace(/\\\[(.*?)\\\]/g, '$$$$$1$$$$'); // Convertir \[ ... \] en $$ ... $$

    return (
      <div className="prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
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

    console.log('=== DEBUG handleSend START ===');
    console.log('messageToSend:', messageToSend);
    console.log('insistForAnswer:', insistForAnswer);
    console.log('Data being sent to AI:', {
      subjectId,
      questionId,
      questionText,
      selectionRect,
      zoom,
      userMessage: messageToSend,
      insistForAnswer,
      hasMarkdownContext: !!markdownContext
    });
    console.log('selectionRect being sent:', selectionRect);
    console.log('=== END DEBUG handleSend ===');
    
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

      console.log('🤖 AI Response result:', result);

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
    <div className="absolute inset-0 z-20">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside 
        className="absolute right-0 top-0 h-full bg-white/95 border-l border-white/40 shadow-2xl shadow-slate-900/10 backdrop-blur-xl animate-in slide-in-from-right duration-200 ease-out flex flex-col"
        style={{ width: `${width}px` }}
      >
        {/* Resize Handle */}
        <div 
          className="absolute left-0 top-0 w-1.5 h-full cursor-ew-resize hover:bg-violet-500/20 active:bg-violet-500/40 transition-colors z-30"
          onMouseDown={(e) => {
            e.preventDefault();
            isResizing.current = true;
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Tuteur IA Socratique</p>
              <p className="text-xs text-slate-500">Guidage pas à pas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Fermer"
          >
            <span className="block text-lg leading-none">×</span>
          </button>
        </div>

        {/* Context */}
        <div className="px-5 py-3 bg-violet-50/60 border-b border-violet-100 flex-shrink-0">
          <p className="text-xs text-violet-700 font-medium mb-1">Question initiale</p>
          <p className="text-sm text-slate-700">{questionText}</p>
          {selectionRect && (
            <p className="text-xs text-violet-600 mt-1">
              Contexte : zone sélectionnée (zoom {zoom}%)
            </p>
          )}
        </div>

        {/* History toggle */}
        {messages.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-5 py-2 text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1 border-b border-slate-100"
          >
            <MessageCircle className="w-3 h-3" />
            Historique ({messages.length})
            <ChevronDown className={`w-3 h-3 transition-transform ${showHistory ? "rotate-180" : ""}`} />
          </button>
        )}

        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 pr-1" 
          style={{ height: '0px' }} // Nécessaire pour forcer le scroll dans un flex-1
        >
          {showHistory && messages.length > 0 && (
            <div className="px-5 py-4 space-y-6">
              {messages.map((exchange, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm">
                      {exchange.user_message}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[90%] rounded-2xl bg-violet-50 border border-violet-100 px-4 py-2 text-slate-800 shadow-sm shadow-violet-500/5">
                      <AIResponse content={exchange.ai_response} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Latest response */}
          {messages.length > 0 && !showHistory && (
            <div className="px-5 py-6">
              <div className="rounded-2xl bg-violet-50 border border-violet-100 px-5 py-4 text-slate-800 shadow-sm shadow-violet-500/5">
                <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Réponse du tuteur
                </div>
                <AIResponse content={messages[messages.length - 1].ai_response} />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200/60 p-4 space-y-3 flex-shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pose ta question ou partage ta réflexion..."
              className="w-full min-h-[60px] resize-none bg-transparent text-sm text-slate-700 focus:outline-none"
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
              className="flex-1 rounded-xl bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              title="Insister pour avoir la réponse"
            >
              Réponse directe ?
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
