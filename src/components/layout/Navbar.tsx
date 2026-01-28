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
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import { CreditBalance } from "@/components/credits/CreditBalance";
import { NotificationBell } from "@/components/dashboard/NotificationBell";

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
            ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        <item.icon className={clsx("w-4 h-4", !isActive && "text-slate-400 group-hover:text-slate-600")} />
        <span>{item.label}</span>
        <ChevronDown className={clsx("w-3 h-3 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-48 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden py-2">
            {item.subItems?.map((sub) => {
              const isSubActive = pathname === sub.href;
              const SubIcon = sub.icon;
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={clsx(
                    "flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold transition-colors",
                    isSubActive ? "text-indigo-600 bg-indigo-50/50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch by only rendering dynamic parts after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl">
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
              <span className="text-xl font-bold font-outfit tracking-tight">
                Mah<span className="text-slate-900">.ai</span>
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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "group flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    isParentActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className={clsx("w-4 h-4", !isParentActive && "text-slate-400 group-hover:text-slate-600")} />
                  <span className="hidden lg:inline">{item.label}</span>
                  {isParentActive && <span className="lg:hidden">{item.label}</span>}
                  {item.badge && (
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
            
            {/* Desktop Profile */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <CreditBalance />
                  <NotificationBell />
                  <div className="ml-1">
                    <ProfileDropdown user={user} isExpanded={true} />
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

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Ouvrir le menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          
          {/* Menu Panel */}
          <div className="fixed inset-y-0 right-0 w-[280px] bg-white shadow-2xl p-6 flex flex-col gap-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Menu</span>
              <button 
                onClick={closeMobileMenu}
                className="p-2 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                 const isParentActive = pathname === item.href || 
                                      pathname.startsWith(`${item.href}/`) ||
                                      item.subItems?.some(sub => pathname === sub.href);
                 const Icon = item.icon;
                 
                 return (
                  <div key={item.label} className="flex flex-col gap-1">
                    {item.subItems ? (
                      <>
                        <div className="flex items-center gap-3 px-4 py-3 text-slate-400 text-xs font-black uppercase tracking-widest mt-2">
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </div>
                        {item.subItems.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          const SubIcon = sub.icon;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={closeMobileMenu}
                              className={clsx(
                                "flex items-center gap-3 px-6 py-3 rounded-xl text-base font-medium transition-colors",
                                isSubActive ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-600 hover:bg-slate-100"
                              )}
                            >
                              <SubIcon className="w-5 h-5" />
                              {sub.label}
                            </Link>
                          );
                        })}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={clsx(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors",
                          isParentActive
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                            : "text-slate-600 hover:bg-slate-100 text-slate-900"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                        {item.badge && (
                          <span className={clsx(
                            "ml-auto px-2 py-0.5 rounded-full text-xs font-bold",
                            isParentActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100">
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-sm">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.subtitle}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50"
                  >
                    <User className="w-5 h-5" />
                    Mon Profil
                  </Link>
                  <button
                    onClick={() => {
                      onLogout?.();
                      closeMobileMenu();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Se déconnecter
                  </button>
                </div>
              ) : (
                 <Link
                  href="/auth"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg"
                >
                  Se connecter
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
