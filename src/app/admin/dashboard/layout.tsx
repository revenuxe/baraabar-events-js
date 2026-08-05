import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "./admin-shell";

export const metadata: Metadata = {
  title: "Admin dashboard | Baraabar",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // proxy.ts (middleware) already enforces signed-in + has_role("admin")
  // for every /admin/** route except /admin/login before this ever runs —
  // no client-side re-check needed here, unlike the old app.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <AdminShell email={user?.email ?? ""}>{children}</AdminShell>;
}
