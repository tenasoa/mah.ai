"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, 
  BookOpen, 
  MessageCircle, 
  User,
  Search,
  PlusCircle
} from "lucide-react";
import { clsx } from "clsx";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Home", icon: LayoutGrid },
    { href: "/subjects", label: "Sujets", icon: BookOpen },
    { href: "/chat", label: "Chat", icon: MessageCircle },
    { href: "/profile", label: "Profil", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center gap-1 px-4 py-2 transition-all duration-300",
                isActive ? "text-indigo-600 dark:text-amber-500" : "text-slate-400 dark:text-slate-500"
              )}
            >
              <div className={clsx(
                "p-1 rounded-xl transition-all",
                isActive && "bg-indigo-50 dark:bg-amber-500/10 scale-110"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
