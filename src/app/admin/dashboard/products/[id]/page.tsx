"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProductForm } from "../product-form";
import type { Database } from "@/lib/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CategoryOption = { id: string; name: string };
type SubcategoryOption = { id: string; name: string; category_id: string };
type AddonOption = { id: string; name: string; price: number };

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductRow | null | undefined>(undefined);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allAddons, setAllAddons] = useState<AddonOption[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: prod }, { data: cats }, { data: subs }, { data: products }, { data: addons }, { data: links }] =
        await Promise.all([
          supabase.from("products").select("*").eq("id", id).single(),
          supabase.from("categories").select("id,name").order("name"),
          supabase.from("subcategories").select("id,name,category_id").order("name"),
          supabase.from("products").select("tags"),
          supabase.from("addons").select("id,name,price").order("sort_order"),
          supabase.from("product_addon_links").select("addon_id").eq("product_id", id),
        ]);
      setProduct(prod ?? null);
      setCategories(cats ?? []);
      setSubcategories(subs ?? []);
      const tagSet = new Set<string>();
      for (const p of products ?? []) for (const t of p.tags) tagSet.add(t);
      setAllTags(Array.from(tagSet).sort());
      setAllAddons(addons ?? []);
      setSelectedAddonIds((links ?? []).map((l) => l.addon_id));
    })();
  }, [id]);

  if (product === undefined) return <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />;
  if (product === null) return <p className="text-center text-sm text-muted-foreground">Product not found.</p>;

  return (
    <ProductForm
      product={product}
      categories={categories}
      subcategories={subcategories}
      allTags={allTags}
      allAddons={allAddons}
      selectedAddonIds={selectedAddonIds}
    />
  );
}
