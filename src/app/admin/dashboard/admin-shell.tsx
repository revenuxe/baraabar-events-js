"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck,
  LogOut,
  LayoutGrid,
  Layers,
  FolderTree,
  PartyPopper,
  Gift,
  CalendarCheck,
  Users as UsersIcon,
  Store,
} from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/admin/dashboard/bookings", label: "Bookings", icon: CalendarCheck, exact: false },
  { href: "/admin/dashboard/categories", label: "Categories", icon: Layers, exact: false },
  { href: "/admin/dashboard/subcategories", label: "Subcategories", icon: FolderTree, exact: false },
  { href: "/admin/dashboard/products", label: "Products", icon: PartyPopper, exact: false },
  { href: "/admin/dashboard/addons", label: "Add-ons", icon: Gift, exact: false },
  { href: "/admin/dashboard/decorations", label: "Decorations", icon: PartyPopper, exact: false },
  { href: "/admin/dashboard/vendors", label: "Vendors", icon: Store, exact: false },
  { href: "/admin/dashboard/users", label: "Users", icon: UsersIcon, exact: false },
];

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Decor Eventz
              </p>
              <p className="-mt-0.5 text-sm font-bold">Admin Console</p>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:block">{email}</span>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
        <nav className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-gradient-brand text-primary-foreground shadow-glow"
                    : "border border-border bg-card"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
