"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar, type NavItem, type UserProfile } from "@/components/layout/Navbar";
import { LayoutGrid, BookOpen, ShieldAlert, MessageCircle } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode } from "react";
import { MobileNav } from "@/components/layout/MobileNav";
import { useToast } from "@/components/ui/Toast";
import { ContactModal } from "@/components/ui/ContactModal";

const baseNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/subjects", label: "Sujets", icon: BookOpen },
  { href: "/chat", label: "Messages", icon: MessageCircle },
];

interface PersistentLayoutProps {
  children: ReactNode;
}

export function PersistentLayout({ children }: PersistentLayoutProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const isZenMode = searchParams.get('zen') === 'true';

  const { toast } = useToast();
  const [hasNotifiedProfile, setHasNotifiedProfile] = useState(false);

  useEffect(() => {
    const handleOpenContact = () => setIsContactOpen(true);
    window.addEventListener('open-contact', handleOpenContact);
    return () => window.removeEventListener('open-contact', handleOpenContact);
  }, []);

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
          .select("pseudo, etablissement, classe, roles, avatar_url, bio")
          .eq("id", authUser.id)
          .single();

        if (profile) {
          setRoles((profile.roles as string[]) || []);
          const isComplete = profile.pseudo && profile.etablissement && profile.classe && profile.bio;
          
          if (!isComplete && !hasNotifiedProfile && pathname !== "/profile") {
            toast(
              "Ton profil n'attend que toi ! Complète-le pour une meilleure expérience.",
              "profile",
              8000
            );
            setHasNotifiedProfile(true);
          }

          setUser({
            name: profile.pseudo || "Élève",
            subtitle:
              `${profile.classe || ""} • ${profile.etablissement || ""}`
                .trim()
                .replace(/^• |• $/g, "") || "Profil incomplet",
            avatarUrl: profile.avatar_url || undefined,
          });
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [pathname, hasNotifiedProfile]);

  const isAdmin = roles.includes('admin') || roles.includes('superadmin') || roles.includes('validator');
  
  // Filter nav items: Hide Dashboard if not logged in
  const visibleNavItems = user 
    ? baseNavItems 
    : baseNavItems.filter(item => item.href !== "/dashboard");

  const currentNavItems = isAdmin 
    ? [...visibleNavItems, { href: "/admin", label: "Admin", icon: ShieldAlert }]
    : visibleNavItems;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/?logout=true";
  };

  // Return early for auth pages but keep the context available
  const isExcluded = pathname?.startsWith("/auth") || pathname === "/" || pathname?.startsWith("/admin");

  const isReaderRoute = pathname?.startsWith("/subjects/") && pathname !== "/subjects";

  useEffect(() => {
    if (!pathname || isReaderRoute) return;

    const titles: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/subjects": "Catalogue des sujets",
      "/chat": "Messages",
      "/credits": "Crédits",
      "/profile": "Profil",
      "/admin": "Administration",
      "/admin/users": "Admin · Utilisateurs",
      "/admin/subjects": "Admin · Catalogue maître",
      "/admin/tickets": "Admin · Demandes",
      "/admin/settings": "Admin · Paramètres",
      "/faq": "FAQ",
    };

    const matchingPrefix = Object.keys(titles)
      .filter((route) => pathname.startsWith(route))
      .sort((a, b) => b.length - a.length)[0];

    const pageTitle = matchingPrefix ? titles[matchingPrefix] : "mah.ai";
    document.title = `${pageTitle} | mah.ai`;
  }, [pathname, isReaderRoute]);

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col transition-colors duration-300">
      {/* Ambient Background */}
      <div className="mah-ambient">
        <div className="mah-blob mah-blob-1" />
        <div className="mah-blob mah-blob-2" />
        <div className="mah-blob mah-blob-3" />
      </div>

      {!isZenMode && (
        <Navbar
            navItems={currentNavItems}
            user={user}
            onLogout={handleLogout}
        />
      )}

      {/* Main Content */}
      <main
        className={
          isReaderRoute
            ? `relative z-10 flex-1 w-full ${isZenMode ? 'h-screen' : 'pb-20 md:pb-0'}`
            : "relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:px-8 pb-24 md:pb-8"
        }
      >
        {children}
      </main>

      {!isZenMode && <MobileNav />}

      <ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />
    </div>
  );
}
