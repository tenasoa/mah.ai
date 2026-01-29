"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

interface FlashMessageProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose?: () => void;
  duration?: number;
}

export function FlashMessage({ 
  message, 
  type = "info", 
  onClose, 
  duration = 3000 
}: FlashMessageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    // Auto-close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    
    // Wait for exit animation to complete
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 650); // Match CSS animation duration
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-emerald-600 text-white shadow-emerald-600/30";
      case "error":
        return "bg-red-600 text-white shadow-red-600/30";
      case "warning":
        return "bg-amber-600 text-white shadow-amber-600/30";
      default:
        return "bg-blue-600 text-white shadow-blue-600/30";
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-[100] max-w-md
        ${isExiting ? 'animate-flash-exit' : 'animate-flash-enter'}
      `}
    >
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl
          ${getStyles()}
        `}
      >
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <p className="flex-1 text-sm font-medium leading-tight">
          {message}
        </p>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <style jsx>{`
        @keyframes flash-enter {
          0% {
            transform: translateX(100%) translateX(-20px);
            opacity: 0;
          }
          50% {
            transform: translateX(100%) translateX(10px);
            opacity: 1;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes flash-exit {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 1;
            filter: blur(0);
          }
          35% {
            transform: translate3d(0, -4px, 0) scale(1.01);
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 16px, 0) scale(0.96);
            opacity: 0;
            filter: blur(6px);
          }
        }

        .animate-flash-enter {
          animation: flash-enter 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .animate-flash-exit {
          animation: flash-exit 0.65s cubic-bezier(0.2, 0, 0, 1) forwards;
        }
      `}</style>
    </div>
  );
}
