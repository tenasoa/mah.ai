'use client';

import { ReactNode } from 'react';
import { Navbar, type NavItem, type UserProfile } from '@/components/layout/Navbar';
import {
  LayoutGrid,
  CreditCard,
  Users,
  FileText,
  Settings,
  BarChart3,
  Ticket,
  ShieldCheck,
  Coins,
  type LucideIcon,
} from 'lucide-react';

// Default admin navigation items grouped
const defaultAdminNavItems: NavItem[] = [
  { 
    href: '/admin/management', 
    label: 'Gestion', 
    icon: ShieldCheck,
    subItems: [
      { href: '/admin/subjects', label: 'Sujets', icon: FileText },
      { href: '/admin/tickets', label: 'Tickets', icon: Ticket },
      { href: '/admin/users', label: 'Utilisateurs', icon: Users },
    ]
  },
  { 
    href: '/admin/finance', 
    label: 'Finance', 
    icon: Coins,
    subItems: [
      { href: '/admin/payments', label: 'Paiements', icon: CreditCard },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ]
  },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
];

// Dashboard link to go back to main app
const dashboardNavItem: NavItem = {
  href: '/dashboard',
  label: 'Retour App',
  icon: LayoutGrid,
};

interface AdminSidebarWrapperProps {
  children: ReactNode;
  navItems?: NavItem[];
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
  pendingPaymentsCount,
}: AdminSidebarWrapperProps) {
  // Build nav items with optional badge for payments
  const resolvedNavItems: NavItem[] = navItems
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
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

      {/* Navbar - Admin */}
      <Navbar
        navItems={allNavItems}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 py-8 lg:px-12 lg:py-10">
        {children}
      </main>
    </div>
  );
}

export default AdminSidebarWrapper;
