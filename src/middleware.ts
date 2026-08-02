import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Real, server-side admin gating — this is the point of the migration for
// /admin/**. The old app only checked `has_role` client-side after mount
// (see docs/nextjs-migration-plan.md §7), so the admin bundle briefly
// shipped to anyone. Here, no session or no admin role means a redirect
// before any admin HTML/JS is ever sent.
export async function middleware(request: NextRequest) {
  const { supabaseResponse, supabase, user } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isAdminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Run on everything except static assets and image optimization files,
    // so the session cookie stays fresh across the whole app.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)",
  ],
};
