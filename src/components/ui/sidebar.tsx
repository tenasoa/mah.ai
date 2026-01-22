'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  BookOpen,
  Clock,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { forwardRef, useState, createContext, useContext, type HTMLAttributes, type ReactNode } from 'react';

// Sidebar Context for expanded state
interface SidebarContextType {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isExpanded: false,
  setIsExpanded: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

// Navigation Items Configuration
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

export const defaultNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/subjects', label: 'Sujets', icon: BookOpen },
  { href: '/profile', label: 'Profil', icon: User },
];

// User Profile Type
export interface UserProfile {
  name: string;
  subtitle: string;
  avatarUrl?: string;
}

// Sidebar Props
interface SidebarProps extends HTMLAttributes<HTMLElement> {
  navItems?: NavItem[];
  user?: UserProfile | null;
  showUserProfile?: boolean;
  onLogout?: () => void;
  logo?: ReactNode;
  defaultExpanded?: boolean;
}

// Nav Link Component
interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  onClick?: () => void;
}

const NavLink = ({ item, isActive, isExpanded, onClick }: NavLinkProps) => {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={clsx(
        'group relative flex items-center rounded-xl font-medium text-sm',
        'transition-all duration-300 ease-out',
        isExpanded ? 'gap-3 px-4 py-3' : 'justify-center p-3',
        isActive
          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      )}
      title={!isExpanded ? item.label : undefined}
    >
      {/* Active Indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-r-full" />
      )}

      <Icon
        className={clsx(
          'w-[18px] h-[18px] transition-transform duration-200 flex-shrink-0',
          !isActive && 'group-hover:scale-110'
        )}
      />

      {/* Label with animation */}
      <span
        className={clsx(
          'whitespace-nowrap transition-all duration-300 ease-out overflow-hidden',
          isExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0'
        )}
      >
        {item.label}
      </span>

      {/* Badge */}
      {item.badge !== undefined && isExpanded && (
        <span
          className={clsx(
            'ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full transition-opacity duration-300',
            isExpanded ? 'opacity-100' : 'opacity-0',
            isActive
              ? 'bg-white/20 text-white'
              : 'bg-amber-100 text-amber-700'
          )}
        >
          {item.badge}
        </span>
      )}

      {/* Badge dot when collapsed */}
      {item.badge !== undefined && !isExpanded && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full" />
      )}

      {/* Hover Glow Effect */}
      {isActive && (
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}
    </Link>
  );
};

// User Profile Component
interface UserProfileSectionProps {
  user: UserProfile;
  isExpanded: boolean;
  onLogout?: () => void;
}

const UserProfileSection = ({ user, isExpanded, onLogout }: UserProfileSectionProps) => {
  return (
    <div className={clsx(
      'mt-auto pt-5 border-t border-slate-200 transition-all duration-300',
      isExpanded ? 'px-0' : 'px-0'
    )}>
      <div className={clsx(
        'flex items-center transition-all duration-300',
        isExpanded ? 'gap-3' : 'flex-col gap-2'
      )}>
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className={clsx(
                'rounded-full border-2 border-slate-200 object-cover transition-all duration-300',
                isExpanded ? 'h-10 w-10' : 'h-9 w-9'
              )}
            />
          ) : (
            <div className={clsx(
              'rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold transition-all duration-300',
              isExpanded ? 'h-10 w-10 text-sm' : 'h-9 w-9 text-xs'
            )}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Online Indicator */}
          <span className={clsx(
            'absolute bottom-0 right-0 bg-emerald-500 border-2 border-white rounded-full transition-all duration-300',
            isExpanded ? 'w-3 h-3' : 'w-2.5 h-2.5'
          )} />
        </div>

        {/* User Info - only when expanded */}
        <div className={clsx(
          'flex-1 min-w-0 overflow-hidden transition-all duration-300',
          isExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 hidden'
        )}>
          <p className="font-semibold text-slate-900 text-sm truncate">
            {user.name}
          </p>
          <p className="text-xs text-slate-500 truncate">{user.subtitle}</p>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className={clsx(
              'rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300',
              isExpanded ? 'p-2' : 'p-2 mt-1'
            )}
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Logo Component
interface LogoProps {
  isExpanded: boolean;
}

const Logo = ({ isExpanded }: LogoProps) => (
  <Link href="/" className="flex items-center gap-3 group">
    <img
      src="/icons/icon-512x512.png"
      alt="Mah.ai Logo"
      className={clsx(
        'rounded-xl shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-all duration-300 group-hover:scale-105',
        isExpanded ? 'h-10 w-10' : 'h-9 w-9'
      )}
    />
    <span className={clsx(
      'text-2xl font-extrabold tracking-tight font-outfit whitespace-nowrap overflow-hidden transition-all duration-300',
      isExpanded ? 'opacity-100 max-w-[100px]' : 'opacity-0 max-w-0'
    )}>
      Mah<span className="text-slate-900">.ai</span>
    </span>
  </Link>
);

// Toggle Button Component
interface ToggleButtonProps {
  isExpanded: boolean;
  onClick: () => void;
}

const ToggleButton = ({ isExpanded, onClick }: ToggleButtonProps) => (
  <button
    onClick={onClick}
    className={clsx(
      'flex items-center justify-center rounded-xl transition-all duration-300',
      'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900',
      isExpanded ? 'p-2.5 w-full' : 'p-2.5'
    )}
    aria-label={isExpanded ? 'Réduire le menu' : 'Étendre le menu'}
  >
    {isExpanded ? (
      <div className="flex items-center gap-2 w-full">
        <Menu className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium overflow-hidden whitespace-nowrap">Menu</span>
        <ChevronLeft className="w-4 h-4 ml-auto flex-shrink-0" />
      </div>
    ) : (
      <Menu className="w-5 h-5" />
    )}
  </button>
);

// Mobile Menu Button
interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const MobileMenuButton = ({ isOpen, onClick }: MobileMenuButtonProps) => (
  <button
    onClick={onClick}
    className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
    aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
  >
    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
  </button>
);

// Main Sidebar Component
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  (
    {
      navItems = defaultNavItems,
      user,
      showUserProfile = true,
      onLogout,
      logo,
      defaultExpanded = false,
      className,
      ...props
    },
    ref
  ) => {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const closeMobileMenu = () => setMobileMenuOpen(false);
    const toggleExpanded = () => setIsExpanded(!isExpanded);

    return (
      <SidebarContext.Provider value={{ isExpanded, setIsExpanded }}>
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <Logo isExpanded={true} />
          <MobileMenuButton
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </div>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeMobileMenu}
          />
        )}

        {/* Sidebar */}
        <aside
          ref={ref}
          className={twMerge(
            clsx(
              // Base styles - fixed on both mobile and desktop for consistent sticky behavior
              'fixed top-0 left-0 z-50',
              'h-screen',
              'bg-white/95 lg:bg-white/80 backdrop-blur-xl',
              'border-r border-slate-200',
              'flex flex-col',
              'py-6 lg:py-8',
              'overflow-y-auto overflow-x-hidden',
              // Width transition
              'transition-all duration-300 ease-out',
              isExpanded ? 'w-[260px] px-5' : 'w-[72px] px-3',
              // Mobile: always expanded when open
              'max-lg:w-[280px] max-lg:px-5',
              // Mobile animation
              'lg:transform-none',
              mobileMenuOpen
                ? 'translate-x-0'
                : '-translate-x-full lg:translate-x-0',
              // Custom className
              className
            )
          )}
          {...props}
        >
          {/* Logo - Desktop (above hamburger) */}
          <div className={clsx(
            'hidden lg:flex mb-4 transition-all duration-300',
            isExpanded ? 'justify-start' : 'justify-center'
          )}>
            <Logo isExpanded={isExpanded} />
          </div>

          {/* Toggle Button - Desktop (below logo) */}
          <div className="hidden lg:block mb-6">
            <ToggleButton isExpanded={isExpanded} onClick={toggleExpanded} />
          </div>

          {/* Logo - Mobile */}
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <Logo isExpanded={true} />
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                isExpanded={isExpanded}
                onClick={closeMobileMenu}
              />
            ))}
          </nav>

          {/* User Profile */}
          {showUserProfile && user && (
            <UserProfileSection user={user} isExpanded={isExpanded} onLogout={onLogout} />
          )}
        </aside>
      </SidebarContext.Provider>
    );
  }
);

Sidebar.displayName = 'Sidebar';

// Layout wrapper that includes sidebar
interface SidebarLayoutProps extends HTMLAttributes<HTMLDivElement> {
  sidebarProps?: SidebarProps;
  children: ReactNode;
}

export const SidebarLayout = forwardRef<HTMLDivElement, SidebarLayoutProps>(
  ({ sidebarProps, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'min-h-screen bg-slate-50 text-slate-900',
            'flex flex-col lg:flex-row',
            'overflow-hidden',
            className
          )
        )}
        {...props}
      >
        {/* Ambient Background */}
        <div className="mah-ambient">
          <div className="mah-blob mah-blob-1" />
          <div className="mah-blob mah-blob-2" />
          <div className="mah-blob mah-blob-3" />
        </div>

        {/* Sidebar */}
        <Sidebar {...sidebarProps} />

        {/* Main Content - with left margin to account for fixed sidebar */}
        <main className="relative z-10 flex-1 px-4 sm:px-6 py-6 lg:px-10 lg:py-8 overflow-y-auto mah-scroll lg:ml-[72px] transition-[margin] duration-300 ease-out">
          {children}
        </main>
      </div>
    );
  }
);

SidebarLayout.displayName = 'SidebarLayout';

export default Sidebar;
