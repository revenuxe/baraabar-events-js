"use client";

import { useState } from "react";
import logo from "@/assets/baraabar event logo.webp";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, ShoppingBag } from "lucide-react";
import { SearchOverlay } from "@/components/SearchOverlay";
import { CategoriesMegaMenu } from "@/components/CategoriesMegaMenu";
import { useCart } from "@/lib/cart-store";


export function TopBar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 pt-[max(0.5rem,env(safe-area-inset-top))] bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-2 px-4 py-2.5 md:max-w-6xl md:px-8 md:py-3">
        <Link href="/" className="relative flex shrink-0 items-center">
          <Image
            src={logo}
            alt="Baraabar"
            priority
            className="h-11 w-auto object-contain md:h-12"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:text-primary ${
              pathname === "/" ? "text-primary" : "text-foreground/80"
            }`}
          >
            Home
          </Link>
          <CategoriesMegaMenu />
          <Link
            href="/profile"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:text-primary ${
              pathname.startsWith("/profile") ? "text-primary" : "text-foreground/80"
            }`}
          >
            Profile
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-full bg-card shadow-card ring-1 ring-border/60"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </button>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative grid h-11 w-11 place-items-center rounded-full bg-card shadow-card ring-1 ring-border/60"
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2.2} />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground ring-2 ring-card">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            aria-label="Notifications"
            className="relative hidden h-11 w-11 place-items-center rounded-full bg-card shadow-card ring-1 ring-border/60 md:grid"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={2.2} />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-card" />
          </button>
          <Link
            href="/categories"
            className="hidden rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background md:inline-flex"
          >
            Get Started
          </Link>
        </div>
      </div>
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
