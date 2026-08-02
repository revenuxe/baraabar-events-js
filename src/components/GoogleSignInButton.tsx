"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon } from "@/components/GoogleIcon";

export function GoogleSignInButton({
  redirectTo,
  label = "Continue with Google",
  className,
}: {
  redirectTo: string;
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
    // On success the browser navigates to Google — nothing else to do.
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className={
          className ??
          "flex w-full items-center justify-center gap-2.5 rounded-full border border-border bg-card px-6 py-4 text-sm font-bold text-foreground shadow-card disabled:opacity-60"
        }
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-4 w-4" />}
        {label}
      </button>
      {error && (
        <p className="mt-2 text-center text-xs font-semibold text-destructive">{error}</p>
      )}
    </div>
  );
}
