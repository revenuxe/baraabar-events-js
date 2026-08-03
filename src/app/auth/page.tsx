import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "./auth-form";

export const metadata: Metadata = {
  title: "Sign in | Baraabar",
  description: "Sign in or create your Baraabar account to book pickups and track orders.",
  openGraph: {
    title: "Sign in | Baraabar",
    description: "Your Baraabar account.",
  },
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  // Only ever redirect to a local path — the raw search param is
  // attacker-controlled (e.g. a crafted /auth?redirect= link), so an
  // absolute URL here would be an open-redirect vector.
  const redirectTo = params.redirect?.startsWith("/") ? params.redirect : "/";

  // Real SSR win over the old app: already-signed-in visitors are
  // redirected here, before any sign-in form HTML ships, instead of the
  // old client-only getSession() check that could flash the form first.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(redirectTo);

  return <AuthForm redirectTo={redirectTo} />;
}
