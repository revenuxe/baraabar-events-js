import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { BookmarkPlus, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { SavedDraft } from "@/lib/account";
import { DraftsView } from "./drafts-view";

export const metadata: Metadata = {
  title: "Saved designs — Baraabar",
  description:
    "Pick up where you left off. Every unfinished Baraabar booking is saved to your account.",
  openGraph: {
    title: "Saved designs — Baraabar",
    description: "Resume your unfinished tailoring bookings.",
  },
};

function EmptyCard({
  icon,
  title,
  body,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: React.ReactNode;
}) {
  return (
    <div className="mt-8 rounded-3xl border border-dashed border-border p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
        {icon}
      </div>
      <p className="mt-4 text-sm font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">{body}</p>
      {cta}
    </div>
  );
}

export default async function DraftsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rows: SavedDraft[] = [];
  if (user) {
    const { data } = await supabase
      .from("booking_drafts")
      .select("id, title, category_slug, garment_label, step, data, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    rows = (data ?? []) as unknown as SavedDraft[];
  }

  return (
    <div className="min-h-dvh bg-background">
      <TopBar />
      <main className="mx-auto max-w-md px-5 pb-28 pt-2 md:max-w-4xl md:px-8">
        <h1 className="font-display text-4xl">Saved designs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Unfinished bookings, safely stored in your account.
        </p>

        {!user ? (
          <EmptyCard
            icon={<LogIn className="h-5 w-5" />}
            title="Sign in to save your designs"
            body="Your measurements, addresses and unfinished bookings stay with your account."
            cta={
              <Link
                href="/auth?redirect=%2Fdrafts"
                className="mt-4 inline-flex rounded-full bg-gradient-brand px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-glow"
              >
                Sign in
              </Link>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyCard
            icon={<BookmarkPlus className="h-5 w-5" />}
            title="No saved designs yet"
            body='Start a booking and tap "Save for later" at any step — you can finish it whenever.'
            cta={
              <Link
                href="/book"
                className="mt-4 inline-flex rounded-full bg-gradient-brand px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-glow"
              >
                Start a booking
              </Link>
            }
          />
        ) : (
          <DraftsView initialRows={rows} />
        )}
      </main>
      <BottomNav />
    </div>
  );
}
