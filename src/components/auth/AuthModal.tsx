"use client";

import { useEffect, useRef, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { EmailPasswordForm } from "./email-password-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultView = "login" }: AuthModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    
    // Prevent scrolling when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        ref={modalRef}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300"
      >
        {/* Header decoration */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-outfit tracking-tight">
              Rejoins la communauté mah.ai
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              L'excellence académique à portée de clic
            </p>
          </div>

          <EmailPasswordForm />
          
          <p className="text-[10px] text-center text-slate-400 mt-8 leading-relaxed">
            En continuant, vous acceptez nos <a href="#" className="underline hover:text-slate-600">Conditions d'Utilisation</a> et notre <a href="#" className="underline hover:text-slate-600">Politique de Confidentialité</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
