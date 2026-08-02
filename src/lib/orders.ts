// Ported verbatim from the old app's src/lib/orders.ts — pure lookup
// tables/helpers, no framework or Supabase deps.

export const STAGE_PCT: Record<string, number> = {
  draft: 0,
  pending: 8,
  confirmed: 20,
  picked_up: 40,
  measuring: 55,
  stitching: 75,
  ready: 90,
  out_for_delivery: 95,
  delivered: 100,
  cancelled: 0,
};

export const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  pending: "Pending pickup",
  confirmed: "Confirmed",
  picked_up: "Picked up",
  measuring: "Measuring",
  stitching: "Stitching",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const CATEGORY_LABELS: Record<string, string> = {
  women: "Women",
  men: "Men",
  wedding: "Wedding",
  office: "Office",
  ethnic: "Ethnic",
  kids: "Kids",
};

export const MEASUREMENT_MODE_LABEL: Record<string, string> = {
  doorstep: "Doorstep measurement",
  self: "Self measurement",
  saved: "Saved profile",
  sample: "Fit sample garment",
};

const NON_CANCELLABLE = new Set(["out_for_delivery", "delivered", "cancelled"]);

export function isCancellable(status: string) {
  return !NON_CANCELLABLE.has(status);
}
