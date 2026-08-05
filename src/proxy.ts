import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Real, server-side admin gating — this is the point of the migration for
// /admin/**. The old app only checked `has_role` client-side after mount
// (see docs/nextjs-migration-plan.md §7), so the admin bundle briefly
// shipped to anyone. Here, no session or no admin role means a redirect
// before any admin HTML/JS is ever sent.
export async function proxy(request: NextRequest) {
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
  // An explicit allowlist of routes that actually read the session
  // server-side, rather than a denylist of what to skip. Every match here
  // costs a Supabase round-trip before the page even starts rendering —
  // with Supabase hosted in the US and most users in India, that's real,
  // felt latency, so routes with no server-side auth dependency (/, the
  // marketing/legal pages, /design, /book — its catalog fetch is a cached,
  // non-cookie client, and the wizard's own auth check is entirely
  // client-side) are deliberately left out.
  matcher: ["/admin/:path*", "/profile/:path*", "/auth/:path*"],
};
