import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const DASHBOARD_PATH = "/subjects"; // Redirection vers la page des sujets
const AUTH_PATH = "/auth";

function getSafeRedirect(value: string | null) {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const cookiesToSet: Array<{
    name: string;
    value: string;
    options?: Parameters<typeof response.cookies.set>[2];
  }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookiesToSet.push(...cookies);
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname, search } = request.nextUrl;

  const isRoot = pathname === "/";
  const isAuthRoute = pathname.startsWith(AUTH_PATH);
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile");

  const redirectWithCookies = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    cookiesToSet.forEach(({ name, value, options }) => {
      redirectResponse.cookies.set(name, value, options);
    });
    return redirectResponse;
  };

  // Redirection de la racine si connecté
  if (user && isRoot) {
    const url = request.nextUrl.clone();
    url.pathname = DASHBOARD_PATH;
    url.search = "";
    return redirectWithCookies(url);
  }

  // /auth redirige maintenant automatiquement vers / avec modal (voir src/app/auth/page.tsx)
  // Pas besoin de redirection ici, la page gère elle-même

  if (!user && (isProtectedRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_PATH;
    url.search = `?redirect=${encodeURIComponent(`${pathname}${search}`)}`;
    return redirectWithCookies(url);
  }

  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = DASHBOARD_PATH;
      url.search = "";
      return redirectWithCookies(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|api).*)",
  ],
};
