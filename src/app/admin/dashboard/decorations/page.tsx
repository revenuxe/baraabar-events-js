"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, CircleHelp, Palette, Truck, HeartHandshake, Plus, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TABS = [
  { key: "palettes", label: "Balloon palettes", icon: Palette },
  { key: "pairs", label: "Pair groups", icon: Layers },
  { key: "included", label: "What's included", icon: Check },
  { key: "faqs", label: "FAQs", icon: CircleHelp },
  { key: "delivery", label: "Delivery", icon: Truck },
  { key: "care", label: "Care info", icon: HeartHandshake },
] as const;

export default function DecorationsPage() {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("palettes");
  const [items, setItems] = useState<{id:string;name:string}[]>([]);
  const kind = active === "palettes" ? "balloon_palette" : active === "included" ? "included_set" : active === "faqs" ? "faq_set" : active === "delivery" ? "delivery_note" : "care_note";
  useEffect(() => { if (active === "pairs") { setItems([]); return; } const db = createClient() as unknown as { from: (t:string) => { select: (s:string) => { eq: (k:string,v:string) => { order: (c:string) => Promise<{data:{id:string;name:string}[]|null}> } } } }; db.from("decoration_content_items").select("id,name").eq("kind", kind).order("name").then((r) => setItems(r.data ?? [])); }, [kind, active]);
  return <section><div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="font-display text-2xl">Decorations</h2><p className="mt-1 text-sm text-muted-foreground">Reusable content that can be assigned to products.</p></div><Link href={active === "pairs" ? "/admin/dashboard/decorations/pairs" : `/admin/dashboard/decorations/new?kind=${kind}`} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow"><Plus className="h-3.5 w-3.5" />Create</Link></div><div className="rounded-2xl border border-border bg-card"><div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-border p-3">{TABS.map((tab) => { const Icon = tab.icon; return <button key={tab.key} onClick={() => setActive(tab.key)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold ${active === tab.key ? "bg-gradient-brand text-primary-foreground shadow-glow" : "border border-border bg-background"}`}><Icon className="h-3.5 w-3.5" />{tab.label}</button>; })}</div><div className="p-5">{active === "pairs" ? <Link href="/admin/dashboard/decorations/pairs" className="block py-8 text-center text-sm font-semibold text-primary">Open Pair Groups creator</Link> : items.length ? <div className="space-y-2">{items.map((item) => <Link key={item.id} href={`/admin/dashboard/decorations/${item.id}`} className="block rounded-xl border border-border p-3 text-sm font-semibold hover:border-primary">{item.name}</Link>)}</div> : <p className="py-8 text-center text-sm text-muted-foreground">No reusable {TABS.find(t=>t.key===active)?.label.toLowerCase()} yet. Create your first one.</p>}</div></div></section>;
}
