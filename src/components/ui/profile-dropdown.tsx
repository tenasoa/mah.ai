"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Portal } from "./portal";

interface ProfileDropdownProps {
  user: {
    name: string;
    subtitle: string;
    avatarUrl?: string;
  };
  isExpanded?: boolean; // Kept for compatibility but unused
}

export function ProfileDropdown({ user, isExpanded = false }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 192; // w-48 = 12rem = 192px

      setDropdownPos({
        top: rect.bottom + 8, // 8px below the button
        left: rect.right - dropdownWidth, // Align right edge with button right edge
      });
    }
  }, [isOpen, isExpanded]);

  // Recalculate on resize
  useEffect(() => {
    if (!isOpen) return;

    function handleResize() {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownWidth = 192;

        setDropdownPos({
          top: rect.bottom + 8,
          left: rect.right - dropdownWidth,
        });
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, isExpanded]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/?logout=true";
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 group cursor-pointer"
        title="Menu profil"
      >
        {/* Avatar */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-9 w-9 rounded-full border-2 border-slate-200 object-cover transition-all duration-300 group-hover:border-amber-400"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-500/40">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {/* Dropdown Menu - Fixed positioning via Portal */}
      {isOpen && (
        <Portal>
          <div
            ref={dropdownRef}
            className="fixed bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 w-48"
            style={{
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
              zIndex: 9999,
            }}
          >
            <div className="lg:hidden px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
               <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
               <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.subtitle}</p>
            </div>

            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Mon profil
              </span>
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">
                Se déconnecter
              </span>
            </button>
          </div>
        </Portal>
      )}
    </>
  );
}
