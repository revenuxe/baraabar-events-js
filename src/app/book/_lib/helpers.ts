"use client";

import type { Database } from "@/lib/supabase/types";
import type { BookingDraft, BookingItem, MeasurementMode } from "@/lib/booking-store";
import { uploadFileToS3 } from "@/lib/s3-upload-client";
import women from "@/assets/cat-women.jpg";
import men from "@/assets/cat-men.jpg";
import kids from "@/assets/cat-kids.jpg";
import office from "@/assets/cat-office.jpg";
import wedding from "@/assets/outfit-sherwani.jpg";
import ethnic from "@/assets/outfit-lehenga.jpg";

export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type GarmentTypeRow = Database["public"]["Tables"]["garment_types"]["Row"];
export type FabricTypeRow = Database["public"]["Tables"]["fabric_types"]["Row"];

const FALLBACK_IMG: Record<string, string> = {
  women: women.src,
  men: men.src,
  wedding: wedding.src,
  office: office.src,
  ethnic: ethnic.src,
  kids: kids.src,
};
export const FALLBACK_ACCENT = "from-slate-800/70 to-indigo-700/70";

export function categoryImg(c: Pick<CategoryRow, "slug" | "image_url">) {
  return c.image_url ?? FALLBACK_IMG[c.slug] ?? women.src;
}

export function garmentImg(g: Pick<GarmentTypeRow, "image_url">, category?: CategoryRow) {
  return g.image_url ?? (category ? categoryImg(category) : women.src);
}

export const STYLE_MAP: Record<string, { id: string; label: string }[]> = {
  Shirt: [
    { id: "classic", label: "Classic collar" },
    { id: "mandarin", label: "Mandarin" },
    { id: "cuban", label: "Cuban camp" },
    { id: "kurta-shirt", label: "Kurta shirt" },
  ],
  Kurta: [
    { id: "straight", label: "Straight cut" },
    { id: "anarkali", label: "Anarkali" },
    { id: "pathani", label: "Pathani" },
    { id: "asymm", label: "Asymmetric" },
  ],
  Sherwani: [
    { id: "achkan", label: "Achkan" },
    { id: "bandi", label: "Bandhgala" },
    { id: "indo", label: "Indo-western" },
    { id: "jodhpuri", label: "Jodhpuri" },
  ],
  Suit: [
    { id: "2piece", label: "Two-piece" },
    { id: "3piece", label: "Three-piece" },
    { id: "double", label: "Double-breasted" },
    { id: "tux", label: "Tuxedo" },
  ],
  Blouse: [
    { id: "back", label: "Deep back" },
    { id: "highneck", label: "High neck" },
    { id: "puff", label: "Puff sleeve" },
    { id: "corset", label: "Corset" },
  ],
  Lehenga: [
    { id: "aline", label: "A-line" },
    { id: "flare", label: "Full flare" },
    { id: "mermaid", label: "Mermaid" },
    { id: "jacket", label: "Jacket lehenga" },
  ],
  Default: [
    { id: "classic", label: "Classic" },
    { id: "modern", label: "Modern" },
    { id: "slim", label: "Slim" },
    { id: "relaxed", label: "Relaxed" },
  ],
};
// Aliases for garment_types names that differ from the keys above.
STYLE_MAP.Kurti = STYLE_MAP.Kurta;
STYLE_MAP["Bridal Lehenga"] = STYLE_MAP.Lehenga;
STYLE_MAP["Formal Shirt"] = STYLE_MAP.Shirt;

export function estimatePrice(items: BookingDraft["items"], garmentTypes: GarmentTypeRow[]) {
  const priceByName = new Map(garmentTypes.map((g) => [g.name.toLowerCase(), g]));
  const itemPricing = items.map((it) => {
    const gt = priceByName.get(it.garment.toLowerCase());
    const priceMin = gt?.base_price_min ? gt.base_price_min * it.quantity : null;
    const priceMax = gt?.base_price_max ? gt.base_price_max * it.quantity : null;
    return { ...it, priceMin, priceMax };
  });
  const orderPriceMin = itemPricing.some((i) => i.priceMin != null)
    ? itemPricing.reduce((s, i) => s + (i.priceMin ?? 0), 0)
    : null;
  const orderPriceMax = itemPricing.some((i) => i.priceMax != null)
    ? itemPricing.reduce((s, i) => s + (i.priceMax ?? 0), 0)
    : null;
  return { itemPricing, orderPriceMin, orderPriceMax };
}

/** What to write into a single booking_item's measurement_snapshot, given
 * that garment's own measurement method (falling back to the order-level
 * one for single-garment orders, where the choice lives on the draft). */
export function itemMeasurementSnapshot(it: BookingItem, draft: BookingDraft): unknown {
  const mode = it.measurementMode ?? (draft.items.length === 1 ? draft.measurementMode : undefined);
  if (mode === "sample") {
    const note = it.sampleNote ?? (draft.items.length === 1 ? draft.sampleNote : undefined);
    return { mode: "sample", sampleNote: note ?? null };
  }
  if (mode === "doorstep") return { mode: "doorstep" };
  return it.measurements ?? draft.measurements ?? null;
}

/** Order-level measurement_mode column is a single enum value, so it can
 * only be set when every garment shares the same method; otherwise leave it
 * null and rely on the per-garment measurement_snapshot on each item. */
export function orderMeasurementMode(draft: BookingDraft): MeasurementMode | null {
  if (draft.items.length <= 1) return draft.measurementMode ?? null;
  const [first, ...rest] = draft.items;
  if (first?.measurementMode && rest.every((it) => it.measurementMode === first.measurementMode)) {
    return first.measurementMode;
  }
  return null;
}

export function orderMeasurementSnapshot(draft: BookingDraft): unknown {
  if (draft.items.length <= 1) {
    if (draft.measurementMode === "sample") {
      return { mode: "sample", sampleNote: draft.sampleNote ?? null };
    }
    return draft.measurements ?? null;
  }
  return {
    mode: orderMeasurementMode(draft) ?? "mixed",
    perGarment: draft.items.map((it) => ({
      garment: it.garment,
      snapshot: itemMeasurementSnapshot(it, draft),
    })),
  };
}

export async function uploadReferenceImages(
  references: string[],
  pendingFiles: Map<string, File>,
): Promise<Map<string, string>> {
  const entries = await Promise.all(
    references.map(async (ref) => {
      const file = pendingFiles.get(ref);
      if (!file) return null;
      try {
        const publicUrl = await uploadFileToS3(file, "reference");
        return [ref, publicUrl] as const;
      } catch {
        return null;
      }
    }),
  );
  return new Map(entries.filter((e): e is [string, string] => e !== null));
}
