'use client';

import { ReactNode } from 'react';
import { Sidebar, type UserProfile } from '@/components/ui/sidebar';
import { LayoutGrid, BookOpen, User, type LucideIcon } from 'lucide-react';

// Icon mapping for serialization safety
const ICON_MAP: Record<string, LucideIcon> = {
  'layout-grid': LayoutGrid,
  'book-open': BookOpen,
  'user': User,
};

// Internal nav item type with actual icon component
interface InternalNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

// Default navigation items (defined client-side to avoid serialization issues)
const defaultNavItems: InternalNavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/subjects', label: 'Sujets', icon: BookOpen },
  { href: '/profile', label: 'Profil', icon: User },
];

// Serializable nav item type (for server components)
export interface SerializableNavItem {
  href: string;
  label: string;
  iconKey: keyof typeof ICON_MAP;
  badge?: string | number;
}

interface ClientSidebarWrapperProps {
  children: ReactNode;
  navItems?: SerializableNavItem[];
  user?: UserProfile | null;
  showUserProfile?: boolean;
  onLogout?: () => void;
  defaultExpanded?: boolean;
}

export function ClientSidebarWrapper({
  children,
  navItems,
  user,
  showUserProfile = false,
  onLogout,
  defaultExpanded = false,
}: ClientSidebarWrapperProps) {
  // Convert serializable nav items to internal format if provided
  const resolvedNavItems: InternalNavItem[] = navItems
    ? navItems.map((item) => ({
        href: item.href,
        label: item.label,
        icon: ICON_MAP[item.iconKey] || LayoutGrid,
        badge: item.badge,
      }))
    : defaultNavItems;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row overflow-hidden">
      {/* Ambient Background */}
      <div className="mah-ambient">
        <div className="mah-blob mah-blob-1" />
        <div className="mah-blob mah-blob-2" />
        <div className="mah-blob mah-blob-3" />
      </div>

      {/* Sidebar */}
      <Sidebar
        navItems={resolvedNavItems}
        user={user}
        showUserProfile={showUserProfile}
        onLogout={onLogout}
        defaultExpanded={defaultExpanded}
      />

      {/* Main Content - with left margin to account for fixed sidebar */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 py-6 lg:px-10 lg:py-8 overflow-y-auto mah-scroll lg:ml-[72px]">
        {children}
      </main>
    </div>
  );
}

export default ClientSidebarWrapper;
