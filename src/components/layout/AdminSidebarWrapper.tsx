'use client';

import { ReactNode } from 'react';
import { Sidebar, type UserProfile } from '@/components/ui/sidebar';
import {
  LayoutGrid,
  CreditCard,
  Users,
  FileText,
  Settings,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

// Internal nav item type with actual icon component
interface InternalNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

// Default admin navigation items
const defaultAdminNavItems: InternalNavItem[] = [
  { href: '/admin/payments', label: 'Paiements', icon: CreditCard },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/subjects', label: 'Sujets', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
];

// Dashboard link to go back to main app
const dashboardNavItem: InternalNavItem = {
  href: '/dashboard',
  label: 'Retour App',
  icon: LayoutGrid,
};

interface AdminSidebarWrapperProps {
  children: ReactNode;
  navItems?: InternalNavItem[];
  user?: UserProfile | null;
  showUserProfile?: boolean;
  onLogout?: () => void;
  defaultExpanded?: boolean;
  pendingPaymentsCount?: number;
}

export function AdminSidebarWrapper({
  children,
  navItems,
  user,
  showUserProfile = false,
  onLogout,
  defaultExpanded = false,
  pendingPaymentsCount,
}: AdminSidebarWrapperProps) {
  // Build nav items with optional badge for payments
  const resolvedNavItems: InternalNavItem[] = navItems
    ? navItems
    : defaultAdminNavItems.map((item) => {
        if (item.href === '/admin/payments' && pendingPaymentsCount && pendingPaymentsCount > 0) {
          return { ...item, badge: pendingPaymentsCount };
        }
        return item;
      });

  // Add dashboard link at the end
  const allNavItems = [...resolvedNavItems, dashboardNavItem];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row overflow-hidden">
      {/* Ambient Background - Admin theme */}
      <div className="mah-ambient">
        <div
          className="mah-blob"
          style={{
            width: '500px',
            height: '500px',
            background: '#c7d2fe',
            top: '-100px',
            left: '-100px',
          }}
        />
        <div
          className="mah-blob"
          style={{
            width: '400px',
            height: '400px',
            background: '#fed7aa',
            bottom: '-120px',
            right: '-80px',
            opacity: 0.18,
          }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar
        navItems={allNavItems}
        user={user}
        showUserProfile={showUserProfile}
        onLogout={onLogout}
        defaultExpanded={defaultExpanded}
      />

      {/* Main Content - with left margin to account for fixed sidebar */}
      <main className="relative z-10 flex-1 px-6 py-8 lg:px-12 lg:py-10 overflow-y-auto mah-scroll lg:ml-[72px]">
        {children}
      </main>
    </div>
  );
}

export default AdminSidebarWrapper;
