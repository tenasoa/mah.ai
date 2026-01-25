"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar, type NavItem, type UserProfile } from "@/components/layout/Navbar";
import { LayoutGrid, BookOpen, ShieldAlert } from "lucide-react";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const baseNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/subjects", label: "Sujets", icon: BookOpen },
];

interface PersistentLayoutProps {
  children: ReactNode;
}

export function PersistentLayout({ children }: PersistentLayoutProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          setLoading(false);
          return;
        }

        // Fetch profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select("pseudo, etablissement, classe, roles")
          .eq("id", authUser.id)
          .single();

        if (profile) {
          setRoles((profile.roles as string[]) || []);
          setUser({
            name: profile.pseudo || "Élève",
            subtitle:
              `${profile.classe || ""} • ${profile.etablissement || ""}`
                .trim()
                .replace(/^• |• $/g, "") || "Profil incomplet",
          });
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [supabase]);

  const isAdmin = roles.includes('admin') || roles.includes('superadmin') || roles.includes('validator');
  
  const currentNavItems = isAdmin 
    ? [...baseNavItems, { href: "/admin", label: "Admin", icon: ShieldAlert }]
    : baseNavItems;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Don't render layout for auth pages
  if (pathname?.startsWith("/auth") || pathname === "/" || pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  const isReaderRoute = pathname?.startsWith("/subjects/") && pathname !== "/subjects";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Ambient Background */}
      <div className="mah-ambient">
        <div className="mah-blob mah-blob-1" />
        <div className="mah-blob mah-blob-2" />
        <div className="mah-blob mah-blob-3" />
      </div>

      <Navbar
        navItems={currentNavItems}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main
        className={
          isReaderRoute
            ? "relative z-10 flex-1 w-full"
            : "relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:px-8"
        }
      >
        {children}
      </main>
    </div>
  );
}
