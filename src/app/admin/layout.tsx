import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Vérification stricte du rôle
  const { data: profile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  const roles = (profile?.roles as string[]) || [];
  const isAdmin = roles.includes("admin") || roles.includes("superadmin") || roles.includes("validator");

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
