"use client";

import { useEffect, useState, createContext, useContext, ReactNode, useCallback } from "react";
import { X, CheckCircle2, AlertTriangle, Info, Heart } from "lucide-react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error" | "info" | "warning" | "profile";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info", duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [{ id, message, type, duration }, ...prev]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>,
    document.body
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  const getTypeStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-emerald-600 border-emerald-500 text-white";
      case "error":
        return "bg-red-600 border-red-500 text-white";
      case "warning":
        return "bg-amber-500 border-amber-400 text-white";
      case "profile":
        return "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white";
      default:
        return "bg-slate-900 border-slate-800 text-white";
    }
  };

  const getTypeIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5" />;
      case "error":
        return <AlertTriangle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "profile":
        return <Heart className="w-5 h-5 text-amber-500 fill-amber-500" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl transition-all duration-500 animate-in slide-in-from-top-4
        ${getTypeStyles()}
        ${isExiting ? "opacity-0 scale-95 translate-y-[-20px]" : "opacity-100 scale-100"}
      `}
    >
      <div className="flex-shrink-0">{getTypeIcon()}</div>
      <div className="flex-1 text-sm font-bold tracking-tight">{toast.message}</div>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 500);
        }}
        className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 opacity-50 hover:opacity-100" />
      </button>
    </div>
  );
}
