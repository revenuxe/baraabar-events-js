import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft, Sparkles, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Design Studio | Coming Soon | Baraabar",
  description:
    "The Baraabar AI design studio is coming soon. Book a fabric pickup and our master tailors will craft your outfit meanwhile.",
  openGraph: {
    title: "AI Design Studio | Coming Soon",
    description: "Real-time garment previews and AI-guided styling — arriving soon.",
  },
};

export default function Design() {
  return (
    <div className="min-h-dvh bg-background pb-24">
      <TopBar />
      <main>
        <div className="mx-auto max-w-md px-5 pt-2 md:max-w-3xl md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>

        <div className="mx-auto mt-6 flex min-h-[70dvh] w-full max-w-md items-center px-5 md:max-w-3xl md:px-8">
          <div className="relative w-full overflow-hidden rounded-[2rem] border border-border bg-gradient-brand/10 p-6 md:p-10">
            <div
              aria-hidden
              className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-brand opacity-25 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/30 opacity-25 blur-3xl"
            />

            <div className="relative">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
                <Sparkles className="h-6 w-6" />
              </div>

              <span className="mt-5 inline-flex items-center gap-1 rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                Coming soon
              </span>

              <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
                We&apos;re working on the AI Design Studio
              </h1>
              <p className="mt-3 text-sm text-muted-foreground md:text-base">
                Real-time garment previews, live fabric try-on and AI-guided styling will
                live here soon. It&apos;ll go live in the next update.
              </p>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                Until then, book a free fabric pickup and our master tailors will craft
                your outfit exactly to your brief.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow"
                >
                  <Truck className="h-4 w-4" />
                  Book fabric pickup
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold"
                >
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
