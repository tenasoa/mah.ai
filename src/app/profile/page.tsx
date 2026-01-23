"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/profile/profile-form";
import { Bell } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ name: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      
      // Fetch just enough for the avatar initial
      const { data: profile } = await supabase
          .from("profiles")
          .select("pseudo")
          .eq("id", user.id)
          .single();

       if (profile) {
         setUserProfile({ name: profile.pseudo || "E" });
       }

      setLoading(false);
    }
    getUser();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-900">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-end mb-6">
        <button className="h-10 w-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className="mah-card items-center text-center bg-gradient-to-br from-amber-50 via-white to-slate-50 border border-amber-100">
          <div className="h-28 w-28 rounded-full p-1 bg-gradient-to-br from-amber-400 to-indigo-500 shadow-md flex items-center justify-center">
            <div className="h-full w-full rounded-full border-4 border-white bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-4xl font-bold">
              {userProfile?.name?.charAt(0).toUpperCase() || "E"}
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold font-outfit">
            Finalisez votre profil
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Complétez vos informations pour personnaliser vos révisions.
          </p>
        </article>

        <article className="mah-card">
          <h3 className="text-lg font-semibold mb-4">
            Informations personnelles
          </h3>
          <ProfileForm />
        </article>
      </div>
    </div>
  );
}
