"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Menu,
  X,
  LayoutGrid,
  BookOpen,
  LogOut,
  User,
  ChevronDown,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import { CreditBalance } from "@/components/credits/CreditBalance";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MessageBadge } from "@/components/chat/MessageBadge";
import { messageStore } from "@/lib/messageStore";
import { createClient } from "@/lib/supabase/client";
import { getUnreadMessagesCount } from "@/app/actions/chat";

// Navigation Items
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  subItems?: NavItem[];
}

export const defaultNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/subjects", label: "Sujets", icon: BookOpen },
  { href: "/chat", label: "Messages", icon: MessageCircle },
];

export interface UserProfile {
  name: string;
  subtitle: string;
  avatarUrl?: string;
}

interface NavbarProps {
  navItems?: NavItem[];
  user?: UserProfile | null;
  onLogout?: () => void;
}

function NavDropdown({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={clsx(
          "group flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 dark:bg-slate-50 dark:text-slate-900"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
        )}
      >
        <item.icon className={clsx("w-4 h-4", !isActive && "text-slate-400 group-hover:text-slate-600")} />
        <span>{item.label}</span>
        <ChevronDown className={clsx("w-3 h-3 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-48 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden py-2">
            {item.subItems?.map((sub) => {
              const isSubActive = pathname === sub.href;
              const SubIcon = sub.icon;
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={clsx(
                    "flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold transition-colors",
                    isSubActive 
                      ? "text-indigo-600 dark:text-amber-500 bg-indigo-50/50 dark:bg-amber-500/10" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <SubIcon className="w-4 h-4" />
                  {sub.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar({
  navItems = defaultNavItems,
  user,
  onLogout,
}: NavbarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fix hydration mismatch by only rendering dynamic parts after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Subscribe to message store for real-time updates
  useEffect(() => {
    const unsubscribe = messageStore.subscribe(setUnreadCount);
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Load initial unread count
    async function fetchUnread() {
      const { count } = await getUnreadMessagesCount();
      setUnreadCount(count || 0);
      messageStore.setCount(count || 0);
    }

    if (user) {
      fetchUnread();
    }
  }, [user]);

  const isAdmin = navItems.some((item: NavItem) => item.href === "/admin");

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-8xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex-none w-32 sm:w-48 flex justify-start">
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/icons/icon-512x512.png"
                alt="Mah.ai Logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200"
              />
              <span className="text-xl font-bold font-outfit tracking-tight text-slate-900 dark:text-white">
                Mah<span className="text-indigo-600 dark:text-amber-500">.ai</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center justify-center gap-1.5 flex-1 px-4">
            {mounted && navItems.map((item) => {
              const isParentActive = pathname === item.href || 
                                   pathname.startsWith(`${item.href}/`) || 
                                   (item.subItems?.some(sub => pathname === sub.href) ?? false);
              
              if (item.subItems && item.subItems.length > 0) {
                return <NavDropdown key={item.label} item={item} isActive={isParentActive} />;
              }

              const Icon = item.icon;
              const isMessageItem = item.href === "/chat";
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "group relative flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    isParentActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 dark:bg-slate-50 dark:text-slate-900"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <Icon className={clsx("w-4 h-4", !isParentActive && "text-slate-400 group-hover:text-slate-600")} />
                  <span className="hidden lg:inline">{item.label}</span>
                  {isParentActive && <span className="lg:hidden">{item.label}</span>}
                  
                  {(isMessageItem && unreadCount > 0) && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}

                  {item.badge && !isMessageItem && (
                    <span className={clsx(
                      "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                      isParentActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Profile & Mobile Toggle */}
          <div className="flex-none w-40 sm:w-56 flex items-center justify-end gap-2 sm:gap-3">
            
            {/* Theme Toggle */}
            <ThemeToggle className="hidden md:flex" />

            {/* Desktop Profile */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <CreditBalance />
                  <NotificationBell />
                  <div className="ml-1">
                    <ProfileDropdown user={user} isExpanded={true} isAdmin={isAdmin} />
                  </div>
                </>
              ) : (
                  <Link
                  href="/auth"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
                >
                  Se connecter
                </Link>
              )}
            </div>

            {/* Mobile: Notification Bell instead of Menu */}
            <div className="md:hidden flex items-center gap-3">
                <ThemeToggle />
                {user && (
                  <>
                    <CreditBalance />
                    <NotificationBell />
                  </>
                )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
