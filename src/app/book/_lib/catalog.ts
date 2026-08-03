import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { Database } from "@/lib/supabase/types";
import type { CategoryRow, FabricTypeRow, GarmentTypeRow, StylePresetRow } from "./helpers";

// Categories/garment types/fabric types are public (RLS: "Public read ...")
// and only change when an admin edits the catalog, so they don't need a
// per-request, cookie-bound client — a plain anon client lets this fetch be
// wrapped in unstable_cache and revalidated on a timer instead of hitting
// Supabase on every page load. Using the cookie-bound `@/lib/supabase/server`
// client here would call cookies() and force the whole /book route dynamic.
function publicSupabaseClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export type Catalog = {
  categories: CategoryRow[];
  garmentTypes: GarmentTypeRow[];
  fabricTypes: FabricTypeRow[];
  stylePresets: StylePresetRow[];
};

export const getCatalog = unstable_cache(
  async (): Promise<Catalog> => {
    const supabase = publicSupabaseClient();
    const [{ data: categories }, { data: garmentTypes }, { data: fabricTypes }, { data: stylePresets }] =
      await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("garment_types").select("*").order("sort_order"),
        supabase.from("fabric_types").select("*").order("sort_order"),
        supabase
          .from("style_presets")
          .select("*")
          .eq("is_active", true)
          .order("sort_order"),
      ]);
    return {
      categories: categories ?? [],
      garmentTypes: garmentTypes ?? [],
      fabricTypes: fabricTypes ?? [],
      stylePresets: stylePresets ?? [],
    };
  },
  ["book-catalog"],
  { tags: ["catalog"], revalidate: 300 },
);
