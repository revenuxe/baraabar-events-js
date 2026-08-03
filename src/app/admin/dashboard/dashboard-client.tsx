"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { jsPDF } from "jspdf";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck,
  LogOut,
  Loader2,
  Package,
  Layers,
  Shirt,
  Palette,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Users as UsersIcon,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  MapPin,
  Truck,
  Phone,
  StickyNote,
  Ruler,
  Image as ImageIcon,
  User,
  Download,
} from "lucide-react";
import { STATUS_LABEL, CATEGORY_LABELS, MEASUREMENT_MODE_LABEL } from "@/lib/orders";
import { M_META, type MField } from "@/lib/measurements";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { GarmentPicker } from "@/components/admin/GarmentPicker";

type TabKey = "bookings" | "categories" | "garment_types" | "fabric_types" | "style_presets" | "users";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "bookings", label: "Orders", icon: Package },
  { key: "categories", label: "Categories", icon: Layers },
  { key: "garment_types", label: "Garments", icon: Shirt },
  { key: "fabric_types", label: "Fabrics", icon: Palette },
  { key: "style_presets", label: "Styles", icon: Sparkles },
  { key: "users", label: "Users", icon: UsersIcon },
];

type Column = {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "fk" | "image";
  required?: boolean;
  fkTable?: string;
  /** For `fk` columns targeting garment_types: pick a category first, then a garment within it. */
  cascadeCategory?: boolean;
};

// Hoisted to stable module-level constants — CatalogPanel is wrapped in
// memo() below, which is pointless if its `columns` prop is a fresh array
// literal on every AdminDashboard render (defeats the shallow prop
// comparison memo relies on to bail out of re-rendering).
const CATEGORY_COLUMNS: Column[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "image_url", label: "Image", type: "image" },
  { key: "slug", label: "Slug", type: "text", required: true },
  { key: "tagline", label: "Tagline", type: "text" },
  { key: "sort_order", label: "Sort", type: "number" },
  { key: "is_active", label: "Active", type: "boolean" },
];

const GARMENT_TYPE_COLUMNS: Column[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "image_url", label: "Image", type: "image" },
  { key: "slug", label: "Slug", type: "text", required: true },
  { key: "category_id", label: "Category", type: "fk", fkTable: "categories" },
  { key: "base_price_min", label: "Price min", type: "number" },
  { key: "base_price_max", label: "Price max", type: "number" },
  { key: "sort_order", label: "Sort", type: "number" },
  { key: "is_active", label: "Active", type: "boolean" },
];

const FABRIC_TYPE_COLUMNS: Column[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "image_url", label: "Image", type: "image" },
  { key: "slug", label: "Slug", type: "text", required: true },
  { key: "description", label: "Description", type: "text" },
  { key: "sort_order", label: "Sort", type: "number" },
  { key: "is_active", label: "Active", type: "boolean" },
];

const STYLE_PRESET_COLUMNS: Column[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "image_url", label: "Image", type: "image" },
  { key: "slug", label: "Slug", type: "text", required: true },
  {
    key: "garment_type_id",
    label: "Garment",
    type: "fk",
    fkTable: "garment_types",
    cascadeCategory: true,
  },
  { key: "sort_order", label: "Sort", type: "number" },
  { key: "is_active", label: "Active", type: "boolean" },
];

export function AdminDashboard({ email }: { email: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>(() => {
    if (typeof window === "undefined") return "bookings";
    return (sessionStorage.getItem("admin_tab") as TabKey) || "bookings";
  });
  // Panels only mount the first time their tab is visited — otherwise all
  // 6 tabs' Supabase queries fire and their full row lists render the
  // moment the dashboard opens, before the admin has looked at 5 of them,
  // which is what made the whole page feel stuck right after load. Once
  // visited, a panel stays mounted (hidden via CSS below) so switching
  // back doesn't lose scroll position or an in-progress edit.
  const [visitedTabs, setVisitedTabs] = useState<Set<TabKey>>(() => new Set([tab]));

  function selectTab(key: TabKey) {
    setTab(key);
    sessionStorage.setItem("admin_tab", key);
    setVisitedTabs((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Baraabar
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
        {/* Tabs */}
        <nav className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 pb-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => selectTab(t.key)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-gradient-brand text-primary-foreground shadow-glow"
                    : "border border-border bg-card"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Once a tab has been visited its panel stays mounted (hidden via
            CSS instead of unmounting) so switching back never resets
            scroll position, the in-progress "New" form, or the category
            pill filter, and never re-fetches data that's already loaded.
            Tabs not yet visited aren't rendered at all — see visitedTabs. */}
        {visitedTabs.has("bookings") && (
          <div className={tab === "bookings" ? "" : "hidden"}>
            <BookingsPanel />
          </div>
        )}
        {visitedTabs.has("categories") && (
          <div className={tab === "categories" ? "" : "hidden"}>
            <CatalogPanel title="Categories" table="categories" columns={CATEGORY_COLUMNS} />
          </div>
        )}
        {visitedTabs.has("garment_types") && (
          <div className={tab === "garment_types" ? "" : "hidden"}>
            <CatalogPanel
              title="Garment types"
              table="garment_types"
              groupBy="category_id"
              columns={GARMENT_TYPE_COLUMNS}
            />
          </div>
        )}
        {visitedTabs.has("fabric_types") && (
          <div className={tab === "fabric_types" ? "" : "hidden"}>
            <CatalogPanel title="Fabrics" table="fabric_types" columns={FABRIC_TYPE_COLUMNS} />
          </div>
        )}
        {visitedTabs.has("style_presets") && (
          <div className={tab === "style_presets" ? "" : "hidden"}>
            <CatalogPanel
              title="Style presets"
              table="style_presets"
              groupBy="garment_type_id"
              columns={STYLE_PRESET_COLUMNS}
            />
          </div>
        )}
        {visitedTabs.has("users") && (
          <div className={tab === "users" ? "" : "hidden"}>
            <UsersPanel />
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------- Bookings ---------------- */

const STATUS_OPTIONS = Object.keys(STATUS_LABEL);

const BookingsPanel = memo(function BookingsPanel() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selected, setSelected] = useState<any | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let q = supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (statusFilter) q = q.eq("status", statusFilter as any);
    const { data } = await q;
    setRows(data ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: string) {
    const supabase = createClient();
    await supabase
      .from("bookings")
      .update({ status: status as any })
      .eq("id", id);
    setSelected((s: any) => (s && s.id === id ? { ...s, status } : s));
    load();
  }

  async function deleteBooking(id: string) {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.from("bookings").delete().eq("id", id);
    setSelected(null);
    load();
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Orders</h2>
          <p className="text-sm text-muted-foreground">{rows.length} bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s] ?? s}
              </option>
            ))}
          </select>
          <button
            onClick={load}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      ) : rows.length === 0 ? (
        <EmptyState label="No bookings yet." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Order</th>
                  <th className="px-3 py-2 text-left">Created</th>
                  <th className="px-3 py-2 text-left">Qty</th>
                  <th className="px-3 py-2 text-left">Pickup</th>
                  <th className="px-3 py-2 text-left">Phone</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="cursor-pointer border-t border-border hover:bg-muted/40"
                  >
                    <td className="px-3 py-2 font-semibold">{r.order_number}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">{r.quantity}</td>
                    <td className="px-3 py-2 text-xs">
                      {r.pickup_date ? new Date(r.pickup_date).toLocaleDateString() : "—"}
                      {r.pickup_window ? ` · ${r.pickup_window}` : ""}
                    </td>
                    <td className="px-3 py-2 text-xs">{r.contact_phone ?? "—"}</td>
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        className="rounded-full border border-border bg-background px-2 py-1 text-xs font-semibold"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s] ?? s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BookingDetailDialog
        booking={selected}
        onClose={() => setSelected(null)}
        onUpdateStatus={updateStatus}
        onDelete={deleteBooking}
      />
    </section>
  );
});

function MeasurementSnapshotView({ snapshot }: { snapshot: any }) {
  if (!snapshot) {
    return <p className="text-xs text-muted-foreground">No measurements provided yet</p>;
  }
  if (snapshot.mode === "sample") {
    return (
      <p className="text-xs text-muted-foreground">
        Fit sample garment provided{snapshot.sampleNote ? ` — "${snapshot.sampleNote}"` : ""}
      </p>
    );
  }
  if (snapshot.mode === "doorstep") {
    return (
      <p className="text-xs text-muted-foreground">To be measured during the home pickup visit</p>
    );
  }
  if (snapshot.values && typeof snapshot.values === "object") {
    const entries = Object.entries(snapshot.values as Record<string, number>);
    if (entries.length === 0) {
      return <p className="text-xs text-muted-foreground">No values recorded</p>;
    }
    const unit = snapshot.unit ?? "cm";
    return (
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
        {entries.map(([field, value]) => (
          <li key={field} className="flex items-baseline justify-between gap-2 text-xs">
            <span className="text-muted-foreground">{M_META[field as MField]?.label ?? field}</span>
            <span className="font-semibold">
              {String(value)} {unit}
            </span>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="text-xs text-muted-foreground">—</p>;
}

/** Builds a tailor-facing spec sheet: order + garment requirements and
 * measurements. Deliberately omits contact_phone and pickup/delivery
 * addresses — this sheet is meant to be handed to production, not to
 * carry customer contact details. */
function buildMeasurementsPdf(booking: any, items: any[], profile: any) {
  const doc = new jsPDF();
  const marginX = 14;
  const rightEdge = 196;
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 15) {
      doc.addPage();
      y = 20;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20);
  doc.text("Baraabar — Order & Measurement Sheet", marginX, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Order #${booking.order_number}  ·  Placed ${new Date(booking.created_at).toLocaleDateString()}  ·  ${STATUS_LABEL[booking.status] ?? booking.status}`,
    marginX,
    y,
  );
  y += 6;
  doc.setDrawColor(220);
  doc.line(marginX, y, rightEdge, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20);
  doc.text("Customer", marginX, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(profile?.full_name ?? "Unnamed", marginX, y);
  y += 10;

  const sources =
    items.length > 0
      ? items.map((it) => ({
          garment: it.garment_label,
          style: it.style_label,
          quantity: it.quantity,
          priceMin: it.estimated_price_min,
          priceMax: it.estimated_price_max,
          snapshot: it.measurement_snapshot as any,
        }))
      : [
          {
            garment: booking.garment_label,
            style: booking.style_label,
            quantity: booking.quantity,
            priceMin: booking.estimated_price_min,
            priceMax: booking.estimated_price_max,
            snapshot: booking.measurement_snapshot as any,
          },
        ];

  for (const src of sources) {
    ensureSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text(`${src.garment ?? "Garment"}${src.style ? ` · ${src.style}` : ""}`, marginX, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);
    const priceLine = [
      `Qty: ${src.quantity ?? 1}`,
      src.priceMin || src.priceMax ? `Est. Rs ${src.priceMin ?? "—"}–${src.priceMax ?? "—"}` : null,
    ]
      .filter(Boolean)
      .join("   ");
    doc.text(priceLine, marginX, y);
    y += 6;

    // Defensive parse — measurement_snapshot is a jsonb column so Supabase
    // normally hands back a parsed object already, but guard against a
    // stringified value slipping through so this section never just goes
    // silently blank on an unexpected shape.
    let snap = src.snapshot;
    if (typeof snap === "string") {
      try {
        snap = JSON.parse(snap);
      } catch {
        // leave as the raw string — falls through to the catch-all below
      }
    }
    doc.setTextColor(20);
    doc.setFontSize(9);
    if (!snap) {
      doc.text("Measurements: not provided yet", marginX, y);
      y += 6;
    } else if (snap.mode === "sample") {
      doc.text(
        `Measurements: fit sample garment provided${snap.sampleNote ? ` — "${snap.sampleNote}"` : ""}`,
        marginX,
        y,
      );
      y += 6;
    } else if (snap.mode === "doorstep") {
      doc.text("Measurements: to be taken during the home pickup visit", marginX, y);
      y += 6;
    } else if (snap.values && typeof snap.values === "object") {
      const unit = snap.unit ?? "cm";
      const entries = Object.entries(snap.values as Record<string, number>);
      if (entries.length === 0) {
        doc.text("Measurements: no values recorded", marginX, y);
        y += 6;
      } else {
        // Space for the bold header plus at least its first row — without
        // this, a header reached near the bottom of the page (e.g. the
        // 2nd or 3rd garment on a multi-item order) renders past the
        // page's edge and is simply invisible; jsPDF doesn't wrap or clip.
        ensureSpace(6 + Math.ceil(entries.length / 3) * 5.5);
        doc.setFont("helvetica", "bold");
        doc.text("Measurements", marginX, y);
        y += 5.5;
        doc.setFont("helvetica", "normal");
        const perRow = 3;
        for (let i = 0; i < entries.length; i += perRow) {
          ensureSpace(6);
          const line = entries
            .slice(i, i + perRow)
            .map(([field, value]) => `${M_META[field as MField]?.label ?? field}: ${value} ${unit}`)
            .join("     ");
          doc.text(line, marginX, y);
          y += 5.5;
        }
      }
    } else {
      // Unrecognized shape — still say something rather than leaving the
      // section blank with no explanation.
      doc.text("Measurements: unavailable", marginX, y);
      y += 6;
    }
    y += 5;
  }

  if (booking.fabric_label) {
    ensureSpace(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20);
    doc.text("Fabric", marginX, y);
    y += 5.5;
    doc.setFont("helvetica", "normal");
    doc.text(String(booking.fabric_label), marginX, y);
    y += 8;
  }

  if (booking.notes) {
    const wrapped = doc.splitTextToSize(String(booking.notes), rightEdge - marginX);
    ensureSpace(6 + wrapped.length * 5.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20);
    doc.text("Notes", marginX, y);
    y += 5.5;
    doc.setFont("helvetica", "normal");
    doc.text(wrapped, marginX, y);
    y += wrapped.length * 5.5 + 4;
  }

  ensureSpace(10);
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Generated ${new Date().toLocaleString()} · Customer contact number and address omitted for production handoff.`,
    marginX,
    pageHeight - 10,
  );

  return doc;
}

function downloadMeasurementsPdf(booking: any, items: any[], profile: any) {
  const doc = buildMeasurementsPdf(booking, items, profile);
  doc.save(`measurements-${booking.order_number}.pdf`);
}

function BookingDetailDialog({
  booking,
  onClose,
  onUpdateStatus,
  onDelete,
}: {
  booking: any | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const [pickupAddr, setPickupAddr] = useState<any | null>(null);
  const [deliveryAddr, setDeliveryAddr] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    if (!booking) {
      setPickupAddr(null);
      setDeliveryAddr(null);
      setProfile(null);
      setItems([]);
      return;
    }
    (async () => {
      setLoadingExtras(true);
      const supabase = createClient();
      const addrIds = [
        ...new Set([booking.pickup_address_id, booking.delivery_address_id].filter(Boolean)),
      ] as string[];
      const [{ data: addrs }, { data: prof }, { data: bookingItems }] = await Promise.all([
        addrIds.length
          ? supabase.from("addresses").select("*").in("id", addrIds)
          : Promise.resolve({ data: [] as any[] }),
        supabase.from("profiles").select("*").eq("id", booking.user_id).maybeSingle(),
        supabase
          .from("booking_items")
          .select("*")
          .eq("booking_id", booking.id)
          .order("sort_order", { ascending: true }),
      ]);
      const byId = new Map((addrs ?? []).map((a: any) => [a.id, a]));
      setPickupAddr(byId.get(booking.pickup_address_id) ?? null);
      setDeliveryAddr(byId.get(booking.delivery_address_id) ?? null);
      setProfile(prof ?? null);
      setItems(bookingItems ?? []);
      setLoadingExtras(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.id]);

  if (!booking) return null;

  const categoryLabel = booking.category_slug
    ? (CATEGORY_LABELS[booking.category_slug] ?? booking.category_slug)
    : null;
  const sameAddress =
    !!booking.pickup_address_id && booking.pickup_address_id === booking.delivery_address_id;

  return (
    <Dialog open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order #{booking.order_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Placed {new Date(booking.created_at).toLocaleString()}
            </span>
            <select
              value={booking.status}
              onChange={(e) => onUpdateStatus(booking.id, e.target.value)}
              className="ml-auto rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s] ?? s}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <Package className="h-3.5 w-3.5" /> Garment
              </div>
              {!loadingExtras && (
                <button
                  onClick={() => downloadMeasurementsPdf(booking, items, profile)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
                >
                  <Download className="h-3 w-3" /> Download PDF
                </button>
              )}
            </div>
            <p className="mt-1.5 font-semibold">
              {booking.quantity} garment{booking.quantity > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {[categoryLabel, items.length === 0 && booking.garment_label, booking.style_label]
                .filter(Boolean)
                .join(" · ") || "—"}
            </p>
            {items.length > 0 && (
              <div className="mt-2.5 space-y-3 border-t border-border pt-2.5">
                {items.map((it) => (
                  <div key={it.id}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">
                        {it.garment_label}
                        {it.style_label && (
                          <span className="ml-1.5 font-normal text-muted-foreground">
                            · {it.style_label}
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-2">
                        {(it.estimated_price_min || it.estimated_price_max) && (
                          <span className="text-muted-foreground">
                            ₹{it.estimated_price_min ?? "—"}–₹{it.estimated_price_max ?? "—"}
                          </span>
                        )}
                        <span className="font-semibold">× {it.quantity}</span>
                      </span>
                    </div>
                    {Array.isArray(it.reference_images) && it.reference_images.length > 0 && (
                      <div className="mt-1.5 flex gap-2 overflow-x-auto">
                        {it.reference_images.map((src: string, i: number) => (
                          <div key={i} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={src}
                              alt={`${it.garment_label} reference ${i + 1}`}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-1.5 flex items-start gap-1.5">
                      <Ruler className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                      <MeasurementSnapshotView snapshot={it.measurement_snapshot} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {items.length === 0 && (
              <div className="mt-2.5 flex items-start gap-1.5 border-t border-border pt-2.5">
                <Ruler className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                <MeasurementSnapshotView snapshot={booking.measurement_snapshot} />
              </div>
            )}
            {booking.measurement_mode && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Ruler className="h-3.5 w-3.5" />
                {MEASUREMENT_MODE_LABEL[booking.measurement_mode] ?? booking.measurement_mode}
              </div>
            )}
            {booking.notes && (
              <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {booking.notes}
              </div>
            )}
            {items.length === 0 &&
              Array.isArray(booking.reference_images) &&
              booking.reference_images.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" /> Reference images
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    {booking.reference_images.map((src: string, i: number) => (
                      <div key={i} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                        <Image src={src} alt={`Reference ${i + 1}`} fill sizes="56px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            {(booking.estimated_price_min || booking.estimated_price_max) && (
              <p className="mt-2 text-xs">
                <span className="font-semibold">Estimated: </span>
                <span className="text-muted-foreground">
                  ₹{booking.estimated_price_min ?? "—"} – ₹{booking.estimated_price_max ?? "—"}
                </span>
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border p-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <User className="h-3.5 w-3.5" /> Customer
            </div>
            {loadingExtras ? (
              <Loader2 className="mt-2 h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <p className="mt-1.5 font-semibold">{profile?.full_name ?? "Unnamed"}</p>
                {booking.contact_phone && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {booking.contact_phone}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="rounded-2xl border border-border p-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <Truck className="h-3.5 w-3.5" /> Pickup
            </div>
            {pickupAddr ? (
              <AdminAddressBlock addr={pickupAddr} />
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">No address on file.</p>
            )}
            {booking.pickup_date && (
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(booking.pickup_date).toLocaleDateString()}
                {booking.pickup_window ? ` · ${booking.pickup_window}` : ""}
              </p>
            )}

            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> Delivery
            </div>
            {sameAddress ? (
              <p className="mt-1.5 text-xs text-muted-foreground">Same as pickup address.</p>
            ) : deliveryAddr ? (
              <AdminAddressBlock addr={deliveryAddr} />
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">No address on file.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <button
              onClick={() => onDelete(booking.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-4 py-2 text-xs font-bold text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete order
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AdminAddressBlock({ addr }: { addr: any }) {
  return (
    <div className="mt-1.5 text-xs text-muted-foreground">
      {addr.label && <p className="font-semibold text-foreground">{addr.label}</p>}
      <p>
        {addr.line1}
        {addr.line2 ? `, ${addr.line2}` : ""}
      </p>
      <p>
        {addr.city}
        {addr.state ? `, ${addr.state}` : ""} — {addr.pincode}
      </p>
      {addr.phone && (
        <p className="mt-1 flex items-center gap-1.5">
          <Phone className="h-3 w-3" /> {addr.phone}
        </p>
      )}
    </div>
  );
}

/* ---------------- Generic catalog CRUD ---------------- */

const CatalogPanel = memo(function CatalogPanel({
  title,
  table,
  columns,
  groupBy,
}: {
  title: string;
  table: string;
  columns: Column[];
  /** Column key of an `fk` column to filter the list by, shown as pill tabs above it. */
  groupBy?: string;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fkOptions, setFkOptions] = useState<Record<string, { id: string; name: string }[]>>({});
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [activeGroup, setActiveGroup] = useState<string | "all">("all");
  const [createError, setCreateError] = useState<string | null>(null);

  const hasSortOrder = columns.some((c) => c.key === "sort_order");
  const groupCol = columns.find((c) => c.key === groupBy && c.type === "fk");
  const groupOptions = groupCol ? (fkOptions[groupCol.fkTable!] ?? []) : [];
  const visibleRows =
    groupCol && activeGroup !== "all" ? rows.filter((r) => r[groupBy!] === activeGroup) : rows;

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const sortByPosition = columns.some((c) => c.key === "sort_order");
    // created_at is always the secondary key so rows that tie on sort_order
    // (e.g. everything defaults to 0) still come back in a stable order
    // instead of Postgres breaking ties arbitrarily.
    let query = supabase.from(table as any).select("*");
    query = sortByPosition
      ? query.order("sort_order", { ascending: true }).order("created_at", { ascending: true })
      : query.order("created_at", { ascending: false });
    const { data } = await query;
    setRows(data ?? []);

    // Fetch FK options
    const fkCols = columns.filter((c) => c.type === "fk" && c.fkTable);
    const options: Record<string, { id: string; name: string }[]> = {};
    for (const c of fkCols) {
      const { data: opts } = await supabase
        .from(c.fkTable as any)
        .select("id,name")
        .order("name");
      options[c.fkTable!] = (opts as any) ?? [];
    }
    setFkOptions(options);
    setLoading(false);
  }, [table, columns]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(row: Record<string, any>, id?: string): Promise<string | null> {
    const payload: Record<string, any> = {};
    for (const c of columns) {
      if (row[c.key] === "" || row[c.key] === undefined) continue;
      payload[c.key] = row[c.key];
    }
    for (const c of columns) {
      if (c.required && !payload[c.key]) return `${c.label} is required`;
    }
    const supabase = createClient();
    const { error } = id
      ? await supabase
          .from(table as any)
          .update(payload)
          .eq("id", id)
      : await supabase.from(table as any).insert(payload as any);
    if (error) return error.message;
    if (!id) {
      setCreating(false);
      setDraft({});
    }
    // Awaited: EditableRow closes edit mode as soon as this resolves and
    // switches to a view that reads straight off the `row` prop (fresh
    // data from this reload), not the form's local `value` state. Firing
    // load() without waiting closed edit mode immediately, showing the
    // pre-save row — including its old image — until the reload happened
    // to land moments later.
    await load();
    return null;
  }

  async function createRow() {
    const err = await save(draft);
    setCreateError(err);
  }

  async function remove(id: string) {
    if (!confirm("Delete this row?")) return;
    const supabase = createClient();
    const { error } = await supabase
      .from(table as any)
      .delete()
      .eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    load();
  }

  async function swapOrder(a: any, b: any) {
    const supabase = createClient();
    await Promise.all([
      supabase
        .from(table as any)
        .update({ sort_order: b.sort_order })
        .eq("id", a.id),
      supabase
        .from(table as any)
        .update({ sort_order: a.sort_order })
        .eq("id", b.id),
    ]);
    load();
  }

  function moveUp(index: number) {
    if (index <= 0) return;
    swapOrder(visibleRows[index], visibleRows[index - 1]);
  }

  function moveDown(index: number) {
    if (index >= visibleRows.length - 1) return;
    swapOrder(visibleRows[index], visibleRows[index + 1]);
  }

  function startCreating() {
    if (creating) {
      setCreating(false);
      return;
    }
    const base = groupCol && activeGroup !== "all" ? { [groupBy!]: activeGroup } : {};
    // Put new rows at the end of the list instead of leaving sort_order at
    // its 0 default, which would tie with other rows and reorder unpredictably.
    const nextSortOrder = hasSortOrder
      ? Math.max(0, ...rows.map((r) => r.sort_order ?? 0)) + 1
      : undefined;
    setDraft(nextSortOrder != null ? { ...base, sort_order: nextSortOrder } : base);
    setCreateError(null);
    setCreating(true);
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">{title}</h2>
          <p className="text-sm text-muted-foreground">{visibleRows.length} entries</p>
        </div>
        <button
          onClick={startCreating}
          className="inline-flex items-center gap-1 rounded-full bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow"
        >
          <Plus className="h-3.5 w-3.5" /> {creating ? "Cancel" : "New"}
        </button>
      </div>

      {groupCol && (
        <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveGroup("all")}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              activeGroup === "all"
                ? "bg-gradient-brand text-primary-foreground shadow-glow"
                : "border border-border bg-card"
            }`}
          >
            All
          </button>
          {groupOptions.map((o) => (
            <button
              key={o.id}
              onClick={() => setActiveGroup(o.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                activeGroup === o.id
                  ? "bg-gradient-brand text-primary-foreground shadow-glow"
                  : "border border-border bg-card"
              }`}
            >
              {o.name}
            </button>
          ))}
        </div>
      )}

      {creating && (
        <div className="mb-4 rounded-2xl border border-border bg-card p-4">
          <RowForm
            columns={columns}
            fkOptions={fkOptions}
            value={draft}
            onChange={setDraft}
            onSubmit={createRow}
            submitLabel="Create"
          />
          {createError && <p className="mt-2 text-xs text-destructive">{createError}</p>}
        </div>
      )}

      {loading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      ) : visibleRows.length === 0 ? (
        <EmptyState
          label={
            groupCol && activeGroup !== "all"
              ? `No ${title.toLowerCase()} in this category yet — click New to add one.`
              : `No ${title.toLowerCase()} yet — click New to add one.`
          }
        />
      ) : (
        <div className="space-y-2">
          {visibleRows.map((r, i) => (
            <EditableRow
              key={r.id}
              columns={columns}
              fkOptions={fkOptions}
              row={r}
              onSave={(next) => save(next, r.id)}
              onDelete={() => remove(r.id)}
              onMoveUp={hasSortOrder ? () => moveUp(i) : undefined}
              onMoveDown={hasSortOrder ? () => moveDown(i) : undefined}
              canMoveUp={i > 0}
              canMoveDown={i < visibleRows.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  );
});

function EditableRow({
  columns,
  fkOptions,
  row,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  columns: Column[];
  fkOptions: Record<string, { id: string; name: string }[]>;
  row: any;
  onSave: (v: Record<string, any>) => Promise<string | null>;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<Record<string, any>>(row);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setValue(row), [row]);

  const imageCol = columns.find((c) => c.type === "image");

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 text-sm">
        {onMoveUp && onMoveDown && (
          <div className="flex shrink-0 flex-col gap-0.5">
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              aria-label="Move up"
              className="grid h-6 w-6 place-items-center rounded-md border border-border text-muted-foreground disabled:opacity-30"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              aria-label="Move down"
              className="grid h-6 w-6 place-items-center rounded-md border border-border text-muted-foreground disabled:opacity-30"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {imageCol && (
          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted">
            {row[imageCol.key] ? (
              <img src={row[imageCol.key]} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{row.name ?? row.slug ?? row.id}</p>
          <p className="truncate text-xs text-muted-foreground">
            {columns
              .filter((c) => c.key !== "name" && c.type !== "image")
              .map((c) => `${c.label}: ${formatValue(row[c.key], c, fkOptions)}`)
              .join(" · ")}
          </p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="grid h-8 w-8 place-items-center rounded-full border border-border text-destructive"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/40 bg-card p-4">
      <RowForm
        columns={columns}
        fkOptions={fkOptions}
        value={value}
        onChange={setValue}
        onSubmit={async () => {
          const err = await onSave(value);
          setError(err);
          if (!err) setEditing(false);
        }}
        onCancel={() => {
          setValue(row);
          setError(null);
          setEditing(false);
        }}
        submitLabel="Save"
      />
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function RowForm({
  columns,
  fkOptions,
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  columns: Column[];
  fkOptions: Record<string, { id: string; name: string }[]>;
  value: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const set = (k: string, v: any) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        {columns.map((c) => (
          <label key={c.key} className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {c.label} {c.required && <span className="text-destructive">*</span>}
            </span>
            {c.type === "text" && (
              <input
                type="text"
                value={value[c.key] ?? ""}
                onChange={(e) => set(c.key, e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            )}
            {c.type === "number" && (
              <input
                type="number"
                value={value[c.key] ?? ""}
                onChange={(e) => set(c.key, e.target.value === "" ? null : Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            )}
            {c.type === "boolean" && (
              <select
                value={String(value[c.key] ?? "true")}
                onChange={(e) => set(c.key, e.target.value === "true")}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            )}
            {c.type === "fk" && c.fkTable && c.cascadeCategory && (
              <GarmentPicker value={value[c.key] ?? null} onChange={(id) => set(c.key, id)} />
            )}
            {c.type === "fk" && c.fkTable && !c.cascadeCategory && (
              <select
                value={value[c.key] ?? ""}
                onChange={(e) => set(c.key, e.target.value || null)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">— none —</option>
                {(fkOptions[c.fkTable] ?? []).map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            )}
            {c.type === "image" && (
              <ImageUploadField
                value={value[c.key] ?? null}
                onChange={(url) => set(c.key, url)}
                pathPrefix={value.id ?? "new"}
              />
            )}
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold"
          >
            Cancel
          </button>
        )}
        <button
          onClick={onSubmit}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow"
        >
          <Save className="h-3.5 w-3.5" /> {submitLabel}
        </button>
      </div>
    </div>
  );
}

function formatValue(v: any, c: Column, fkOptions: Record<string, { id: string; name: string }[]>) {
  if (v === null || v === undefined || v === "") return "—";
  if (c.type === "boolean") return v ? "yes" : "no";
  if (c.type === "fk" && c.fkTable) {
    return fkOptions[c.fkTable]?.find((o) => o.id === v)?.name ?? v;
  }
  return String(v);
}

/* ---------------- Users ---------------- */

const UsersPanel = memo(function UsersPanel() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setRows(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-2xl">Users</h2>
        <p className="text-sm text-muted-foreground">{rows.length} customer profiles</p>
      </div>
      {loading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      ) : rows.length === 0 ? (
        <EmptyState label="No users yet." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Phone</th>
                <th className="px-3 py-2 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-3 py-2 font-semibold">{r.full_name ?? "—"}</td>
                  <td className="px-3 py-2">{r.phone ?? "—"}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
});

/* ---------------- misc ---------------- */

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
