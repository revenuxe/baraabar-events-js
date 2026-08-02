"use client";

import logo from "@/assets/baraabar tailor logo-webpg.webp";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/design", label: "Design" },
  { to: "/orders", label: "Orders" },
  { to: "/drafts", label: "Drafts" },
];

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 pt-[max(0.5rem,env(safe-area-inset-top))] bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-2 px-4 py-2.5 md:max-w-6xl md:px-8 md:py-3">
        <Link href="/" className="relative flex shrink-0 items-center">
          <img
            src={logo.src}
            alt="Baraabar"
            width={160}
            height={48}
            className="h-11 w-auto object-contain md:h-12"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                href={n.to}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:text-primary ${
                  active ? "text-primary" : "text-foreground/80"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Search"
            className="grid h-11 w-11 place-items-center rounded-full bg-card shadow-card ring-1 ring-border/60"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </button>
          <button
            aria-label="Notifications"
            className="relative grid h-11 w-11 place-items-center rounded-full bg-card shadow-card ring-1 ring-border/60"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={2.2} />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-card" />
          </button>
          <Link
            href="/book"
            className="hidden rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background md:inline-flex"
          >
            Book pickup
          </Link>
        </div>
      </div>
    </header>
  );
}
